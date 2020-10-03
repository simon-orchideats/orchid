import { IGeoService, getGeoService } from './../place/geoService';
import { getNotSignedInErr } from './../utils/error';
import { getAuth0Header } from './../auth/auth0Management';
import fetch, { Response } from 'node-fetch';
import { IOrderService, getOrderService } from './../orders/orderService';
import { manualAuthSignUp} from './../auth/authenticate';
import { IPlanService, getPlanService } from './../plans/planService';
import { EConsumer, IConsumer, Consumer, IConsumerProfile, Permission } from './../../consumer/consumerModel';
import { IConsumerPlan } from './../../consumer/consumerPlanModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import express from 'express';
import { SignedInUser, MutationBoolRes, MutationConsumerRes } from '../../utils/apolloUtils';
import { activeConfig } from '../../config';
import Stripe from 'stripe';
import { OutgoingMessage, IncomingMessage } from 'http';

const CONSUMER_INDEX = 'consumers';

export interface IConsumerService {
  cancelSubscription: (signedInUser: SignedInUser, req?: IncomingMessage, res?: OutgoingMessage) => Promise<MutationBoolRes>
  getIConsumer: (signedInUser: SignedInUser) => Promise<IConsumer | null>
  signUp: (email: string, name: string, pass: string, res: express.Response) => Promise<MutationConsumerRes>
  updateAuth0MetaData: (userId: string, stripeSubscriptionId: string, stripeCustomerId: string) =>  Promise<Response>
  updateMyPlan: (signedInUser: SignedInUser, newPlan: IConsumerPlan) => Promise<MutationConsumerRes>
  updateConsumer(_id: string, permissions: Permission[], consumer: Partial<EConsumer>): Promise<IConsumer>
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

  public async cancelSubscription(
    signedInUser: SignedInUser,
    req?: IncomingMessage,
    res?: OutgoingMessage
  ) {
    console.log(req, res);
    try {
      if (!this.orderService) throw 'Missing order service';
      if (!signedInUser) throw getNotSignedInErr()
      const subscriptionId = signedInUser.stripeSubscriptionId;
      if (!subscriptionId) throw new Error('Missing stripe subscription id');

      // const p1 = fetch(`https://${activeConfig.server.auth.domain}/api/v2/users/${signedInUser._id}`, {
      //   headers: await getAuth0Header(),
      //   method: 'PATCH',
      //   body: JSON.stringify({
      //     app_metadata: {
      //       stripeSubscriptionId: null,
      //     },
      //   })
      // }).then(async () => {
      //   if (req && res) await refetchAccessToken(req, res);
      // }).catch(e => {
      //   const msg = `Failed to remove stripeSubscriptionId from auth0 for user '${signedInUser._id}'. ${e.stack}`;
      //   console.error(msg)
      //   throw e;
      // });

      // const eConsumer = await this.getEConsumer(signedInUser._id);
      // const plan = eConsumer?.consumer.plan;
      // if (!plan) throw new Error(`Missing consumer plan for '${signedInUser._id}'`);

      // const updatedConsumer: Omit<EConsumer, 'createdDate' | 'profile' | 'stripeCustomerId'> = {
      //   stripeSubscriptionId: null,
      //   plan: null,
      // }
      // const p3 = this.elastic.update({
      //   index: CONSUMER_INDEX,
      //   id: signedInUser._id,
      //   body: {
      //     doc: updatedConsumer
      //   }
      // }).catch(e => {
      //   const msg = `Failed to remove stripeSubscriptionId from elastic for user '${signedInUser._id}'. ${e.stack}`;
      //   console.error(msg)
      //   throw e;
      // });
      // this.stripe.subscriptions.del(subscriptionId, { invoice_now: true }).catch(e => {
      //   const msg = `[ConsumerService] Failed to delete subscription '${subscriptionId}' from stripe for user '${signedInUser._id}'. ${e.stack}`;
      //   console.error(msg)
      //   throw e;
      // });
      // this.orderService.removeReferredDiscounts(signedInUser).catch(e => {
      //   console.error(`[ConsumerService] Failed to removeReferredDiscounts with userId '${signedInUser._id}'`, e.stack)
      //   throw e;
      // })
      // this.removeReferredWeeklyDiscount(signedInUser._id).catch(e => {
      //   console.error(`[ConsumerService] Failed to remove weeklyDiscounts with referredUserId '${signedInUser._id}'`, e.stack)
      // });

      // await Promise.all([p1, p2, p3]);
      return {
        res: true,
        error: null,
      };
    } catch (e) {
      console.error(`[ConsumerService] couldn't cancel subscription for user '${JSON.stringify(signedInUser)}'`, e.stack);
      throw new Error('Internal Server Error');
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
        profile: {
          name,
          email,
          phone: null,
          card: null,
          searchArea: null,
          serviceInstructions: null,
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
        profile: res.consumer.profile,
        plan: res.consumer.plan,
        permissions: signedInUser.permissions,
      }
    } catch (e) {
      console.error(`[ConsumerService] Failed to get consumer ${signedInUser?._id}: ${e.stack}`)
      return null;
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
      const msg = `[ConsumerService] couldn't add updateAuth0MetaData for user '${userId}'`
      console.error(msg, e.stack);
      throw e;
    });
  }

  async updateMyProfile (signedInUser: SignedInUser, profile: IConsumerProfile, paymentMethodId?: string): Promise<MutationConsumerRes> {
    try {
      if (!this.geoService) return Promise.reject('GeoService not set');
      if (!signedInUser) throw getNotSignedInErr();
      if (!profile.searchArea) throw new Error('Missing search area');
      if (!this.orderService) throw new Error('Order service not set');
      if (!signedInUser.stripeCustomerId) throw new Error(`Missing stripe customer id for '${signedInUser._id}'`)
      let geo;
      try {
        geo = await this.geoService.getGeocodeByQuery(profile.searchArea.primaryAddr);
        if (!geo) {
          return {
            res: null,
            error: `Couldn't verify address '${profile.searchArea.primaryAddr}'`
          }
        }
      } catch (e) {
        return {
          res: null,
          error: `Couldn't verify address '${profile.searchArea.primaryAddr}'`
        }
      }
      const doc: Pick<EConsumer, 'profile'> = {
        profile: {
          ...profile,
          searchArea: {
            primaryAddr: profile.searchArea.primaryAddr,
            address2: profile.searchArea.address2,
            geoPoint: {
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
        ...res.body.get._source,
        _id: signedInUser._id,
        permissions: signedInUser.permissions,
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
      // await this.orderService.updateUpcomingOrdersProfile(signedInUser, profile);
      return {
        res: newConsumer,
        error: null
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to update consumer profile for '${signedInUser?._id}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  // todo pivot: change this from any
  async updateMyPlan(signedInUser: SignedInUser, newPlan: IConsumerPlan): Promise<MutationConsumerRes> {
    try {
      if (!signedInUser) throw getNotSignedInErr()
      if (!this.orderService) throw new Error('OrderService not set');
      if (!signedInUser.stripeSubscriptionId) throw new Error('No stripeSubscriptionId');
      console.log(newPlan);
      // const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      /**
       * two scenarios.
       * 
       * ???? what do we do about trials...? no trials for updates. only trial hapens when you already have a trial
       * 
       * 1) youre the owner and you changed the plan
       *  - upgrade
       *    - update my sub id
       *    - find all customers wiht same sub-id and update those too
       *    - 
       *  - downgrade
       *    - update my sub id
       *    - find all customers wiht same sub-id and update those too
       * 
       * 
       * 
       * 2) youre the member and you leave/change plan
       *  - upgrade
       *    - remove myself from this sub
       *    - update sub
       *  - downgrade
       *    - remove myself from this sub
       *    - update sub
       * 
       * for 1 & 2, i always have to check that the num accounts is allowed
       * 
       * 
       * 
       * 3) add people to your plan (different api)
       * 
       */







      // let plan: EConsumerPlan;
      // try {
      //   const res = await this.getEConsumer(signedInUser._id);
      //   if (!res) throw new Error(`Failed to get EConsumer '${signedInUser._id}'`);
      //   const currPlan = res.consumer.plan;
      //   if (!currPlan) throw new Error(`EConsumer '${signedInUser._id}' missing plan`);
      //   plan = ConsumerPlan.getEConsumerPlanFromIConsumerPlanInput(
      //     newPlan,
      //     currPlan.referralCode,
      //     currPlan.weeklyDiscounts,
      //     currPlan.mealPlans.reduce<{ [key: string]: string }>((sum, mp) => {
      //       sum[mp.stripePlanId] = mp.stripeSubscriptionItemId;
      //       return sum;
      //     }, {}),
      //   );
      // } catch (e) {
      //   console.error(`Failed to get stripe subscription ${signedInUser.stripeSubscriptionId}`, e.stack);
      //   throw e;
      // }
      // const doc: Pick<EConsumer, 'plan'> = {
      //   plan,
      // }
      // const updatedConsumer = await this.elastic.update({
      //   index: CONSUMER_INDEX,
      //   id: signedInUser._id,
      //   _source: 'true',
      //   body: {
      //     doc
      //   }
      // });

      // const newConsumer: IConsumer = {
      //   ...updatedConsumer.body.get._source,
      //   _id: signedInUser._id,
      //   permissions: signedInUser.permissions,
      // };
      
      // return {
      //   res: newConsumer,
      //   error: null,
      // }
      return {
        res: null,
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

  
  async updateConsumer(
    _id: string,
    permissions: Permission[],
    consumer: Partial<EConsumer>
  ): Promise<IConsumer>{
    try {
      const updatedConsumer = await this.elastic.update({
        index: CONSUMER_INDEX,
        id: _id,
        _source: 'true',
        body: {
          doc: consumer
        }
      });
      return Consumer.getIConsumerFromEConsumer(_id, permissions, updatedConsumer.body.get._source)
    } catch (e) {
      console.error(`[ConsumerService] failed to update consumer '${_id}', '${JSON.stringify(consumer)}'`, e.stack);
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
      apiVersion: '2020-08-27',
    }),
  );
  consumerService!.setOrderService(getOrderService());
  consumerService!.setPlanService(getPlanService());
  consumerService!.setGeoService(getGeoService());
  return consumerService;
}
