import { IAddress } from './../../place/addressModel';
import { IGeoService, getGeoService } from './../place/geoService';
import { getNotSignedInErr } from './../utils/error';
import { MutationConsumerRes } from './../../utils/apolloUtils';
import { getAuth0Header } from './../auth/auth0Management';
import fetch, { Response } from 'node-fetch';
import { IOrderService, getOrderService } from './../orders/orderService';
import { manualAuthSignUp} from './../auth/authenticate';
import { IPlanService, getPlanService } from './../plans/planService';
import { EConsumer, IConsumer, IConsumerPlan, Consumer, IConsumerProfile } from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import express from 'express';
import { SignedInUser, MutationBoolRes } from '../../utils/apolloUtils';
import { activeConfig } from '../../config';
import Stripe from 'stripe';
import { OutgoingMessage, IncomingMessage } from 'http';
import crypto  from 'crypto';
import { refetchAccessToken } from '../../utils/auth';
import { Delivery } from '../../order/deliveryModel';

const CONSUMER_INDEX = 'consumers';
export interface IConsumerService {
  cancelSubscription: (signedInUser: SignedInUser, req?: IncomingMessage, res?: OutgoingMessage) => Promise<MutationBoolRes>
  getConsumer: (_id: string) => Promise<IConsumer | null>
  signUp: (email: string, name: string, pass: string, res: express.Response) => Promise<MutationConsumerRes>
  updateAuth0MetaData: (userId: string, stripeSubscriptionId: string, stripeCustomerId: string) =>  Promise<Response>
  upsertConsumer: (userId: string, consumer: EConsumer) => Promise<IConsumer>
  upsertMarketingEmail(email: string, name?: string, addr?: IAddress): Promise<MutationBoolRes>
  updateMyPlan: (signedInUser: SignedInUser, newPlan: IConsumerPlan) => Promise<MutationConsumerRes>
  updateMyProfile: (signedInUser: SignedInUser, profile: IConsumerProfile) => Promise<MutationConsumerRes>
}

class ConsumerService implements IConsumerService {
  private readonly elastic: Client
  private readonly stripe: Stripe
  private planService?: IPlanService
  private orderService?: IOrderService
  private geoService?: IGeoService

  public constructor(elastic: Client, stripe: Stripe) {
    this.elastic = elastic;
    this.stripe = stripe;
  }

  public setPlanService(planService: IPlanService) {
    this.planService = planService;
  }

  public setOrderService(orderService: IOrderService) {
    this.orderService = orderService;
  }

  public setGeoService(geoService: IGeoService) {
    this.geoService = geoService;
  }

  public async upsertMarketingEmail(email: string, name?: string, addr?: IAddress): Promise<MutationBoolRes> {
    try {
      let emailId = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
      const merge_fields: any = {}
      if (name) {
        const split = name.split(' ', 2);
        merge_fields.FNAME = split[0] ;
        merge_fields.LNAME = split[1];
      }

      if (addr) {
        merge_fields.ADDRESS = {
          addr1: addr.address1,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          country: 'US',
        }
      }
      const res = await fetch(`https://${activeConfig.server.mailChimp.dataCenter}.api.mailchimp.com/3.0/lists/${activeConfig.server.mailChimp.audienceId}/members/${emailId}`, {
        headers: {
          authorization: `Basic ${Buffer.from(`anystring:${activeConfig.server.mailChimp.key}`, 'utf8').toString('base64')}`
        },
        method: 'PUT',
        body: JSON.stringify({
          email_address: email,
          status_if_new: 'subscribed',
          merge_fields,
        })
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = `Error adding marketing email '${json.detail}'`;
        console.error(msg);
        throw new Error(msg)
      }
      return {
        res: true,
        error: null
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to add marketing email ${email}`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  public async cancelSubscription(
    signedInUser: SignedInUser,
    req?: IncomingMessage,
    res?: OutgoingMessage
  ) {
    try {
      if (!this.orderService) throw 'Missing order service';
      if (!signedInUser) throw getNotSignedInErr()
      const subscriptionId = signedInUser.stripeSubscriptionId;
      const orderService = this.orderService;
      if (!subscriptionId) throw new Error('Missing stripe subscription id');

      const todaysOrder = await this.orderService.deleteCurrentOrderUnconfirmedDeliveries(signedInUser._id);
      if (todaysOrder) {
        const numConfirmedMeals = Delivery.getConfirmedMealCount(todaysOrder.deliveries);
        const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        await Promise.all(stripeSubscription.items.data.map(si => {
          const count = numConfirmedMeals[si.plan.id] || 0;
          return orderService.setOrderUsage(si.id, count, Math.round(Date.now() / 1000)).catch(e => {
            console.error(`Could not set order usage count of '${count}' with sub item '${si.id}' for sub plan
            '${si.plan.id}'`, e.stack);
            throw e;
          });
        }));
      }

      const p1 = this.stripe.subscriptions.del(subscriptionId, { invoice_now: true }).catch(e => {
        const msg = `Failed to delete subscription '${subscriptionId}' from stripe for user '${signedInUser._id}'. ${e.stack}`;
        console.error(msg)
        throw e;
      });

      const p2 = fetch(`https://${activeConfig.server.auth.domain}/api/v2/users/${signedInUser._id}`, {
        headers: await getAuth0Header(),
        method: 'PATCH',
        body: JSON.stringify({
          app_metadata: {
            stripeSubscriptionId: null,
          },
        })
      }).then(async () => {
        if (req && res) await refetchAccessToken(req, res);
      }).catch(e => {
        const msg = `Failed to remove stripeSubscriptionId from auth0 for user '${signedInUser._id}'. ${e.stack}`;
        console.error(msg)
        throw e;
      });

      const p3 = this.orderService.deleteUnpaidOrdersWithUnconfirmedDeliveries(signedInUser._id).catch(e => {
        console.error(`Failed to delete upcoming orders with unconfirmed deliveries for ${signedInUser._id}`, e.stack);
        throw e;
      });
      
      const updatedConsumer: Omit<EConsumer, 'createdDate' | 'profile' | 'stripeCustomerId'> = {
        stripeSubscriptionId: null,
        plan: null,
      }

      const p4 = this.elastic.update({
        index: CONSUMER_INDEX,
        id: signedInUser._id,
        body: {
          doc: updatedConsumer
        }
      }).catch(e => {
        const msg = `Failed to remove stripeSubscriptionId from elastic for user '${signedInUser._id}'. ${e.stack}`;
        console.error(msg)
        throw e;
      });

      await Promise.all([p1, p2, p3, p4]);
      return {
        res: true,
        error: null,
      };
    } catch (e) {
      console.error(`[ConsumerService] couldn't cancel subscription for user '${JSON.stringify(signedInUser)}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  public async insertConsumer(_id: string, name: string, email: string): Promise<IConsumer> {
    try {
      if (!this.planService) throw new Error('PlanService not set');
      let res: ApiResponse<SearchResponse<any>>
      try {
        res = await this.elastic.search({
          index: CONSUMER_INDEX,
          size: 1000,
          _source: 'false',
          body: {
            query: {
              ids: {
                values: _id
              }
            }
          }
        });
      } catch (e) {
        console.error(`[ConsumerService] Couldn't search for consumer ${_id}. ${e.stack}`);
        throw e;
      }
      if (res.body.hits.total.value > 0) throw new Error(`Consumer with id '_id' ${_id} already exists`);
      const body: EConsumer = {
        createdDate: Date.now(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        profile: {
          name,
          email,
          phone: null,
          card: null,
          destination: null,
        },
        plan: null,
      }
      await this.elastic.index({
        index: CONSUMER_INDEX,
        id: _id,
        refresh: 'true', 
        body
      });
      return Consumer.getIConsumerFromEConsumer(_id, body);
    } catch (e) {
      console.error(`[ConsumerService] couldn't insert consumer '${_id}'`, e.stack);
      throw e;
    }
  }

  async getConsumer(_id: string): Promise<IConsumer | null> {
    try {
      const consumer: ApiResponse<EConsumer> = await this.elastic.getSource(
        {
          index: CONSUMER_INDEX,
          id: _id,
        },
        { ignore: [404] }
      );
      if (consumer.statusCode === 404) return null;
      return {
        _id,
        stripeCustomerId: consumer.body.stripeCustomerId,
        stripeSubscriptionId: consumer.body.stripeSubscriptionId,
        profile: consumer.body.profile,
        plan: consumer.body.plan
      }
    } catch (e) {
      console.error(`[ConsumerService] Failed to get consumer ${_id}: ${e.stack}`)
      return null;
    }
  }

  async getConsumerByStripeId(stripeCustomerId: string): Promise<IConsumer> {
    try {
      const res: ApiResponse<SearchResponse<EConsumer>> = await this.elastic.search({
        index: CONSUMER_INDEX,
        size: 1000,
        body: {
          query: {
            bool: {
              filter: {
                term: {
                  stripeCustomerId
                }
              }
            }
          }
        }
      });
      if (res.body.hits.total.value === 0) throw new Error(`Consumer with stripeId '${stripeCustomerId}' not found`);
      const consumer = res.body.hits.hits[0];
      return Consumer.getIConsumerFromEConsumer(consumer._id, consumer._source);
    } catch (e) {
      console.error(`Failed to search for consumer stripeCustomerId ${stripeCustomerId}: ${e.stack}`);
      throw new Error('Internal Server Error');
    }
  }

  async signUp(email: string, name: string, pass: string, res?: OutgoingMessage) {
    try {
      if (!res) throw new Error('Res is undefined');
      const signedUp = await manualAuthSignUp(email, name, pass, res);
      if (signedUp.res === null || signedUp.error) {
        return {
          res: null,
          error: signedUp.error,
        }
      }
      const consumer = await this.insertConsumer(signedUp.res._id, signedUp.res.profile.name,  signedUp.res.profile.email)
      this.upsertMarketingEmail(email, name).catch(e => {
        console.error(`[ConsumerService] failed to upsert marketing email '${email}' with name '${name}'`, e.stack);
      });
      return {
        res: consumer,
        error: null,
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to signup '${email}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  public async updateAuth0MetaData(userId: string, stripeSubscriptionId: string, stripeCustomerId: string): Promise<Response> {
    return fetch(`https://${activeConfig.server.auth.domain}/api/v2/users/${userId}`, {
      headers: await getAuth0Header(),
      method: 'PATCH',
      body: JSON.stringify({
        app_metadata: {
          stripeSubscriptionId,
          stripeCustomerId,
        },
      })
    }).catch(e => {
      const msg = `[ConsumerService] couldn't add stripeSubscriptionId for user '${userId}'`
      console.error(msg, e.stack);
      throw e;
    });
  }

  async upsertConsumer(_id: string, consumer: EConsumer): Promise<IConsumer> {
    // todo: when inserting, make sure check for existing consumer with email only and remove it to prevent
    // dupe entries.
    try {
      await this.elastic.index({
        index: CONSUMER_INDEX,
        id: _id,
        body: consumer
      });
      return {
        _id,
        ...consumer
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to upsert consumer '${_id}', '${JSON.stringify(consumer)}'`, e.stack);
      throw e;
    }
  }

  async updateMyProfile (signedInUser: SignedInUser, profile: IConsumerProfile): Promise<MutationConsumerRes> {
    try {
      if (!this.geoService) return Promise.reject('GeoService not set');
      if (!signedInUser) throw getNotSignedInErr();
      if (!profile.destination) throw new Error('Missing destination');
      if (!this.orderService) throw new Error('Order service not set');
      const {
        address1,
        city,
        state,
        zip
      } = profile.destination.address;
      try {
        await this.geoService.getGeocode(address1, city, state, zip);
      } catch (e) {
        return {
          res: null,
          error: `Couldn't verify address '${address1} ${city} ${state}, ${zip}'`
        }
      }
      const res = await this.elastic.update({
          index: CONSUMER_INDEX,
          id: signedInUser._id,
          _source: 'true',
          body: {
            doc: {
              profile,
            }
          }
        });
      const newConsumer = {
        _id: signedInUser._id,
        ...res.body.get._source
      };
      await this.orderService.updateUpcomingOrdersProfile(signedInUser, profile);
      this.upsertMarketingEmail(signedInUser.profile.email, profile.name, profile.destination.address).catch(e => {
        console.error(`[ConsumerService] failed to upsert marketing email for email '${signedInUser.profile.email}'`, e.stack)
      });
      return {
        res: newConsumer,
        error: null
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to update consumer profile for '${signedInUser?._id}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async updateMyPlan(signedInUser: SignedInUser, newPlan: IConsumerPlan): Promise<MutationConsumerRes> {
    try {
      if (!signedInUser) throw getNotSignedInErr()
      if (!this.orderService) throw new Error('OrderService not set');
      if (!signedInUser.stripeSubscriptionId) throw new Error('No stripeSubscriptionId');

      const updatedConsumer = await this.elastic.update({
        index: CONSUMER_INDEX,
        id: signedInUser._id,
        _source: 'true',
        body: {
          doc: {
            plan: newPlan,
          }
        }
      })

      const newConsumer: IConsumer = {
        _id: signedInUser._id,
        ...updatedConsumer.body.get._source
      };
      return {
        res: newConsumer,
        error: null,
      }
    } catch (e) {
      console.error(
        `[ConsumerService] Failed to update plan for user '${signedInUser && signedInUser._id}' with plan '${JSON.stringify(newPlan)}'`,
        e.stack
      );
      throw e;
    }
  }
}

let consumerService: ConsumerService;

export const initConsumerService = (
  elastic: Client,
  stripe: Stripe,
) => {
  if (consumerService) throw new Error('[ConsumerService] already initialized.');
  consumerService = new ConsumerService(elastic, stripe);
  return consumerService;
};

export const getConsumerService = () => {
  if (consumerService) return consumerService;
  initConsumerService(
    initElastic(),
    new Stripe(activeConfig.server.stripe.key, {
      apiVersion: '2020-03-02',
    }),
  );
  //@ts-ignore
  consumerService!.setOrderService(getOrderService());
  consumerService!.setPlanService(getPlanService());
  consumerService!.setGeoService(getGeoService());
  return consumerService;
}
