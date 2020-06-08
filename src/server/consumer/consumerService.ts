import { IWeeklyDiscount } from './../../order/discountModel';
import { IAddress } from './../../place/addressModel';
import { IGeoService, getGeoService } from './../place/geoService';
import { getNotSignedInErr } from './../utils/error';
import { getAuth0Header } from './../auth/auth0Management';
import fetch, { Response } from 'node-fetch';
import { IOrderService, getOrderService } from './../orders/orderService';
import { manualAuthSignUp} from './../auth/authenticate';
import { IPlanService, getPlanService } from './../plans/planService';
import { EConsumer, IConsumer, Consumer, IConsumerProfile, Permission } from './../../consumer/consumerModel';
import { IConsumerPlan, EConsumerPlan, ConsumerPlan, IConsumerPlanInput } from './../../consumer/consumerPlanModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import express from 'express';
import { SignedInUser, MutationBoolRes, MutationConsumerRes } from '../../utils/apolloUtils';
import { activeConfig } from '../../config';
import Stripe from 'stripe';
import { OutgoingMessage, IncomingMessage } from 'http';
import crypto  from 'crypto';
import { refetchAccessToken } from '../../utils/auth';
import { Delivery } from '../../order/deliveryModel';

const CONSUMER_INDEX = 'consumers';

const getReferredDiscountConsumers = (signedInUserId: string) => ({
  bool: {
    filter: {
      bool: {
        must: {
          term: {
            'plan.weeklyDiscounts.discounts.referredUserId': signedInUserId
          }
        }
      }
    }
  }
})

export interface IConsumerService {
  attachDiscountsToPlan: (
    _id: string,
    discounts: IWeeklyDiscount[],
    replace:  boolean,
    consumer?: EConsumer
  ) => Promise<void>
  cancelSubscription: (signedInUser: SignedInUser, req?: IncomingMessage, res?: OutgoingMessage) => Promise<MutationBoolRes>
  getIConsumer: (signedInUser: SignedInUser) => Promise<IConsumer | null>
  removeReferredWeeklyDiscount(referredUserId: string): Promise<ApiResponse<any, any>>
  signUp: (email: string, name: string, pass: string, res: express.Response) => Promise<MutationConsumerRes>
  updateAuth0MetaData: (userId: string, stripeSubscriptionId: string, stripeCustomerId: string) =>  Promise<Response>
  upsertConsumer(_id: string, permissions: Permission[], consumer: EConsumer): Promise<IConsumer>
  upsertMarketingEmail(email: string, name?: string, addr?: IAddress): Promise<MutationBoolRes>
  updateMyPlan: (signedInUser: SignedInUser, newPlan: IConsumerPlan) => Promise<MutationConsumerRes>
  updateMyProfile: (signedInUser: SignedInUser, profile: IConsumerProfile, paymentMethodId?: string) => Promise<MutationConsumerRes>
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

  private async getEConsumer(userId: string): Promise<{
    _id: string,
    consumer: EConsumer,
  } | null> {
    try {
      const consumer: ApiResponse<EConsumer> = await this.elastic.getSource(
        {
          index: CONSUMER_INDEX,
          id: userId,
        },
        { ignore: [404] }
      );
      if (consumer.statusCode === 404) return null;
      return {
        _id: userId,
        consumer: consumer.body
      }
    } catch (e) {
      console.error(`[ConsumerService] Failed to get EConsumer ${userId}: ${e.stack}`)
      return null;
    }
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

      const p1 = fetch(`https://${activeConfig.server.auth.domain}/api/v2/users/${signedInUser._id}`, {
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

      const p2 = this.orderService.deleteUnpaidOrdersWithUnconfirmedDeliveries(signedInUser._id).catch(e => {
        console.error(`Failed to delete upcoming orders with unconfirmed deliveries for ${signedInUser._id}`, e.stack);
        throw e;
      });

      const eConsumer = await this.getEConsumer(signedInUser._id);
      const plan = eConsumer?.consumer.plan;
      if (!plan) throw new Error(`Missing consumer plan for '${signedInUser._id}'`);
      this.stripe.coupons.del(plan.referralCode)
        .catch(e => {
          console.error(`[ConsumerService] Failed to remove referral coupon code '${plan.referralCode}'`, e.stack);
          throw e;
        })

      const updatedConsumer: Omit<EConsumer, 'createdDate' | 'profile' | 'stripeCustomerId'> = {
        stripeSubscriptionId: null,
        plan: null,
      }
      const p3 = this.elastic.update({
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
      this.stripe.subscriptions.del(subscriptionId, { invoice_now: true }).catch(e => {
        const msg = `[ConsumerService] Failed to delete subscription '${subscriptionId}' from stripe for user '${signedInUser._id}'. ${e.stack}`;
        console.error(msg)
        throw e;
      });
      this.orderService.removeReferredDiscounts(signedInUser).catch(e => {
        console.error(`[ConsumerService] Failed to removeReferredDiscounts with userId '${signedInUser._id}'`, e.stack)
        throw e;
      })
      this.removeReferredWeeklyDiscount(signedInUser._id).catch(e => {
        console.error(`[ConsumerService] Failed to remove weeklyDiscounts with referredUserId '${signedInUser._id}'`, e.stack)
      });

      await Promise.all([p1, p2, p3]);
      return {
        res: true,
        error: null,
      };
    } catch (e) {
      console.error(`[ConsumerService] couldn't cancel subscription for user '${JSON.stringify(signedInUser)}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  public async attachDiscountsToPlan(_id: string, weeklyDiscounts: IWeeklyDiscount[], replace: boolean, eConsumer?: EConsumer) {
    try {
      let consumer = eConsumer;
      if (!consumer) {
        const res = await this.getEConsumer(_id);
        if (!res) throw new Error(`Missing eConsumer for '${_id}'`);
        consumer = res.consumer;
      }
      const currPlan = consumer.plan;
      if (!currPlan) throw new Error(`EConsumer '${_id}' missing plan`);
      
      const newWeeklyDiscounts = replace ? weeklyDiscounts : [
        ...currPlan.weeklyDiscounts,
        ...weeklyDiscounts
      ];
      const plan: EConsumerPlan = {
        ...currPlan,
        weeklyDiscounts: newWeeklyDiscounts
      };
      const doc: Pick<EConsumer, 'plan'> = {
        plan,
      }
      try {
        await this.elastic.update({
          index: CONSUMER_INDEX,
          id: _id,
          body: {
            doc
          }
        })
      } catch (e) {
        console.error(`Failed to update plan for consumer ${_id}`, e.stack);
        throw e;
      }
    } catch (e) {
      console.error(`[ConsumerService] Failed to attachDiscountsToPlan for consumer ${_id}`, e.stack);
      throw e;
    }
  }

  public async insertConsumer(
    _id: string,
    name: string,
    email: string,
    permissions: Permission[],
  ): Promise<IConsumer> {
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
      return Consumer.getIConsumerFromEConsumer(_id, permissions, body);
    } catch (e) {
      console.error(`[ConsumerService] couldn't insert consumer '${_id}'`, e.stack);
      throw e;
    }
  }

  async getIConsumer(signedInUser: SignedInUser): Promise<IConsumer | null> {
    try {
      if (!signedInUser) throw 'No signed in user';
      const res = await this.getEConsumer(signedInUser._id);
      if (!res) return null;
      return {
        _id: signedInUser._id,
        stripeCustomerId: res.consumer.stripeCustomerId,
        stripeSubscriptionId: res.consumer.stripeSubscriptionId,
        profile: res.consumer.profile,
        plan: res.consumer.plan,
        permissions: signedInUser.permissions,
      }
    } catch (e) {
      console.error(`[ConsumerService] Failed to get consumer ${signedInUser?._id}: ${e.stack}`)
      return null;
    }
  }

  async getConsumerByStripeId(stripeCustomerId: string): Promise<{
    _id: string,
    consumer: EConsumer,
  }> {
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
      return {
        _id: consumer._id,
        consumer: consumer._source
      };
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
      const consumer = await this.insertConsumer(
        signedUp.res._id,
        signedUp.res.profile.name,
        signedUp.res.profile.email,
        signedUp.res.permissions,
      )
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

  public async removeReferredWeeklyDiscount(referredUserId: string): Promise<ApiResponse<any, any>> {
    return this.elastic.updateByQuery({
      index: CONSUMER_INDEX,
      body: {
        query: getReferredDiscountConsumers(referredUserId),
        script: {
          source: `
            def weeklyDiscounts = ctx._source.plan.weeklyDiscounts;
            for (int i = 0; i < weeklyDiscounts.length; i++) {
              def discounts = weeklyDiscounts[i].discounts;
              discounts.removeIf(d -> d.referredUserId.equals(params.referredUserId));
            }
            weeklyDiscounts.removeIf(wd -> wd.discounts.length == 0);
          `,
          lang: 'painless',
          params: {
            referredUserId: referredUserId,
          }
        },
      }
    }).catch(e => {
      console.error(`[ConsumerService] Failed to remove weeklyDiscounts with referredUserId '${referredUserId}'`, e.stack)
      throw e;
    });
  }

  async upsertConsumer(_id: string, permissions: Permission[], consumer: EConsumer): Promise<IConsumer> {
    // todo: when inserting, make sure check for existing consumer with email only and remove it to prevent
    // dupe entries.
    try {
      await this.elastic.index({
        index: CONSUMER_INDEX,
        id: _id,
        body: consumer
      });
      return {
        ...consumer,
        _id,
        permissions,
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to upsert consumer '${_id}', '${JSON.stringify(consumer)}'`, e.stack);
      throw e;
    }
  }

  async updateMyProfile (signedInUser: SignedInUser, profile: IConsumerProfile, paymentMethodId?: string): Promise<MutationConsumerRes> {
    try {
      if (!this.geoService) return Promise.reject('GeoService not set');
      if (!signedInUser) throw getNotSignedInErr();
      if (!profile.destination) throw new Error('Missing destination');
      if (!this.orderService) throw new Error('Order service not set');
      if (!signedInUser.stripeCustomerId) throw new Error(`Missing stripe customer id for '${signedInUser._id}'`)
      const {
        address1,
        city,
        state,
        zip
      } = profile.destination.address;
      let geo;
      try {
        geo = await this.geoService.getGeocode(address1, city, state, zip);
      } catch (e) {
        return {
          res: null,
          error: `Couldn't verify address '${address1} ${city} ${state}, ${zip}'`
        }
      }
      const doc: Pick<EConsumer, 'profile'> = {
        profile: {
          ...profile,
          destination: {
            ...profile.destination,
            geo: {
              lat: geo.lat,
              lon: geo.lon
            },
            timezone: geo.timezone
          },
        },
      }
      const res = await this.elastic.update({
          index: CONSUMER_INDEX,
          id: signedInUser._id,
          _source: 'true',
          body: {
            doc
          }
        });
      const newConsumer = {
        _id: signedInUser._id,
        ...res.body.get._source
      };
      if (paymentMethodId) {
        await this.stripe.setupIntents.create({
          confirm: true,
          customer: signedInUser.stripeCustomerId,
          payment_method: paymentMethodId,
          payment_method_types: ['card']
        });
        await this.stripe.customers.update(signedInUser.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }
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

  async updateMyPlan(signedInUser: SignedInUser, newPlan: IConsumerPlanInput): Promise<MutationConsumerRes> {
    try {
      if (!signedInUser) throw getNotSignedInErr()
      if (!this.orderService) throw new Error('OrderService not set');
      if (!signedInUser.stripeSubscriptionId) throw new Error('No stripeSubscriptionId');
      let plan: EConsumerPlan;
      try {
        const res = await this.getEConsumer(signedInUser._id);
        if (!res) throw new Error(`Failed to get EConsumer '${signedInUser._id}'`);
        const currPlan = res.consumer.plan;
        if (!currPlan) throw new Error(`EConsumer '${signedInUser._id}' missing plan`);
        plan = ConsumerPlan.getEConsumerPlanFromIConsumerPlanInput(
          newPlan,
          currPlan.referralCode,
          currPlan.weeklyDiscounts,
          currPlan.mealPlans.reduce<{ [key: string]: string }>((sum, mp) => {
            sum[mp.stripePlanId] = mp.stripeSubscriptionItemId;
            return sum;
          }, {}),
        );
      } catch (e) {
        console.error(`Failed to get stripe subscription ${signedInUser.stripeSubscriptionId}`, e.stack);
        throw e;
      }
      const doc: Pick<EConsumer, 'plan'> = {
        plan,
      }
      const updatedConsumer = await this.elastic.update({
        index: CONSUMER_INDEX,
        id: signedInUser._id,
        _source: 'true',
        body: {
          doc
        }
      });

      const newConsumer: IConsumer = {
        ...updatedConsumer.body.get._source,
        _id: signedInUser._id,
        permissions: signedInUser.permissions,
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
  consumerService!.setOrderService(getOrderService());
  consumerService!.setPlanService(getPlanService());
  consumerService!.setGeoService(getGeoService());
  return consumerService;
}
