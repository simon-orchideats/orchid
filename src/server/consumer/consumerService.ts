import { Plan } from './../../plan/planModel';
import { IGeoService, getGeoService } from './../place/geoService';
import { getNotSignedInErr } from './../utils/error';
import { getAuth0Header } from './../auth/auth0Management';
import fetch, { Response } from 'node-fetch';
import { IOrderService, getOrderService } from './../orders/orderService';
import { manualAuthSignUp} from './../auth/authenticate';
import { IPlanService, getPlanService } from './../plans/planService';
import { EConsumer, IConsumer, Consumer, IConsumerProfile, Permission } from './../../consumer/consumerModel';
import { PlanRoles, EConsumerPlan } from './../../consumer/consumerPlanModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import express from 'express';
import { SignedInUser, MutationBoolRes, MutationConsumerRes } from '../../utils/apolloUtils';
import { activeConfig } from '../../config';
import Stripe from 'stripe';
import { OutgoingMessage, IncomingMessage } from 'http';
import { refetchAccessToken } from '../../utils/auth';

const CONSUMER_INDEX = 'consumers';

export interface IConsumerService {
  addAccountToPlan: (signedInUser: SignedInUser, addedEmail: string) => Promise<MutationBoolRes>
  cancelSubscription: (signedInUser: SignedInUser, req?: IncomingMessage, res?: OutgoingMessage) => Promise<MutationBoolRes>
  getEConsumer: (signedInUser: SignedInUser) => Promise<{
    _id: string
    consumer: EConsumer
  } | null>
  getIConsumer: (signedInUser: SignedInUser) => Promise<IConsumer | null>
  getSharedAccountsEmails: (signedInUser: SignedInUser) => Promise<string[]>
  removeAccountFromPlan: (signedInUser: SignedInUser, removedEmail: string) => Promise<MutationBoolRes>
  signUp: (email: string, name: string, pass: string, res: express.Response) => Promise<MutationConsumerRes>
  updateAuth0MetaData: (userId: string, stripeSubscriptionId: string, stripeCustomerId: string) =>  Promise<Response>
  updateMyPlan: (
    signedInUser: SignedInUser,
    newPlanId: string,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ) => Promise<MutationConsumerRes>
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

  private async findConsumerByEmail(email: string): Promise<{
    _id: string,
    consumer: EConsumer,
  } | null> {
    try {
      const res: ApiResponse<SearchResponse<EConsumer>>  = await this.elastic.search({
        index: CONSUMER_INDEX,
        body: {
          query: {
            bool: {
              filter: {
                term: {
                  'profile.email': email
                }
              }
            }
          }
        }
      });
      if (res.body.hits.total.value > 1) {
        throw new Error(`Found multiple users with email ${email}`)
      }
      if (res.body.hits.total.value === 0) return null;
      return {
        _id: res.body.hits.hits[0]._id,
        consumer: res.body.hits.hits[0]._source,
      }
    } catch (e) {
      console.error(`[ConsumerService] Failed to find EConsumer by email ${email}`, e.stack)
      return null;
    }
  }

  private async getSharedAccounts(signedInUser: SignedInUser): Promise<
    {
      _id: string,
      consumer: EConsumer,
    }[]
  > {
    try {
      if (!signedInUser) throw getNotSignedInErr();
      const res: ApiResponse<SearchResponse<EConsumer>> = await this.elastic.search({
        index: CONSUMER_INDEX,
        body: {
          query: {
            bool: {
              filter: {
                term: {
                  'plan.stripeSubscriptionId': signedInUser.stripeSubscriptionId
                }
              }
            }
          }
        }
      });
      if (res.body.hits.total.value === 0) return [];
      return res.body.hits.hits.map(h => ({
        _id: h._id,
        consumer: h._source,
      }))
    } catch (e) {
      console.error(`[ConsumerService] Failed getSharedAccounts for '${signedInUser?._id}': ${e.stack}`)
      throw e;
    }
  }

  public async getEConsumer(signedInUser: SignedInUser): Promise<{
    _id: string,
    consumer: EConsumer,
  } | null> {
    try {
      if (!signedInUser) throw getNotSignedInErr(); 
      const consumer: ApiResponse<EConsumer> = await this.elastic.getSource(
        {
          index: CONSUMER_INDEX,
          id: signedInUser._id,
        },
        { ignore: [404] }
      );
      if (consumer.statusCode === 404) return null;
      return {
        _id: signedInUser._id,
        consumer: consumer.body
      }
    } catch (e) {
      console.error(`[ConsumerService] Failed to get EConsumer ${signedInUser?._id}: ${e.stack}`)
      return null;
    }
  }

  private async updatePlan(consumerId: string, plan: EConsumerPlan | null) {
    try {
      await this.elastic.update({
        index: CONSUMER_INDEX,
        id: consumerId,
        body: {
          doc : {
            plan,
          }
        }
      });
      return;
    } catch (e) {
      console.error(`[ConsumerService] failed to update plan for '${consumerId}' with plan '${JSON.stringify(plan)}'`, e.stack)
    }
  }

  public async addAccountToPlan (signedInUser: SignedInUser, addedEmail: string) {
    try {
      if (!signedInUser) throw getNotSignedInErr();
      if (!signedInUser.stripeSubscriptionId) throw new Error('Missing subscriptionId');
      if (!this.planService) throw new Error('PlanService not set');
      if (!addedEmail) throw new Error(`Email '${addedEmail}' is missing`);
      const currUser = await this.getEConsumer(signedInUser);
      if (!currUser) throw new Error(`Signed in user '${signedInUser._id}' not found in db`);
      const currPlan = currUser.consumer.plan;
      if (!currPlan) throw new Error(`User is missing plan`);
      if (currPlan.role !== PlanRoles.Owner) throw new Error('User is not plan owner');
      const plans = await this.planService.getAvailablePlans();
      const dbPlan = Plan.getPlan(currPlan.stripeProductPriceId, plans);
      const sharedAccounts = await this.getSharedAccountsEmails(signedInUser);
      if (sharedAccounts.length + 1 > dbPlan.numAccounts) {
        return {
          res: false,
          error: `${dbPlan.name} only allows ${dbPlan.numAccounts} accounts.`,
        };
      }
      if (sharedAccounts.includes(addedEmail)) {
        return {
          res: false,
          error: `'${addedEmail}' is already in the plan`,
        };
      }
      const newAcct = await this.findConsumerByEmail(addedEmail);
      if (!newAcct) {
        return {
          res: false,
          error: `Account with email ${addedEmail} doesn't exist. Make sure ${addedEmail} is signed up first through the login page.`,
        }
      }
      if (newAcct.consumer.plan) {
        return {
          res: false,
          error: `${addedEmail} is already part of a plan`
        }
      }
      // since there can exist multiple consumers per subscription, but only 1 paying stripe customer per
      // subscription, we don't need to create multiple stripe subscriptions. there only exists 1 stripe subscription
      // per paying consumer and all "associated" accounts simply share the same subId in elastic for tracking purposes
      await this.updatePlan(newAcct._id, {
        role: PlanRoles.Member,
        stripeProductPriceId: dbPlan.stripeProductPriceId,
        stripeSubscriptionId: signedInUser.stripeSubscriptionId
      });
      return {
        res: true,
        error: null,
      };
    } catch (e) {
      console.error(`[ConsumerService] failed to addAccountToPlan for '${signedInUser?._id}' for email '${addedEmail}'`, e.stack)
      throw e;
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

  public async getSharedAccountsEmails(signedInUser: SignedInUser) {
    try {
      const consumer = await this.getEConsumer(signedInUser);
      if (!consumer || !consumer.consumer.plan || consumer.consumer.plan.role === PlanRoles.Member) {
        return [];
      }
      const accounts = await this.getSharedAccounts(signedInUser);
      return accounts.map(a => a.consumer.profile.email);
    } catch (e) {
      console.error(`[ConsumerService] Failed getSharedAccounts for '${signedInUser?._id}': ${e.stack}`)
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
      const res = await this.getEConsumer(signedInUser);
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

  public async removeAccountFromPlan (signedInUser: SignedInUser, removedEmail: string) {
    try {
      if (!signedInUser) throw getNotSignedInErr();
      if (!signedInUser.stripeSubscriptionId) throw new Error('Missing subscriptionId');
      if (!this.planService) throw new Error('PlanService not set');
      if (!removedEmail) throw new Error(`Email '${removedEmail}' is missing`);
      const currUser = await this.getEConsumer(signedInUser);
      if (!currUser) throw new Error(`Signed in user '${signedInUser._id}' not found in db`);
      if (currUser.consumer.profile.email === removedEmail) throw new Error("Can't remove self");
      const currPlan = currUser.consumer.plan;
      if (!currPlan) throw new Error(`User is missing plan`);
      if (currPlan.role !== PlanRoles.Owner) throw new Error('User is not plan owner');
      const newAcct = await this.findConsumerByEmail(removedEmail);
      if (!newAcct) throw new Error(`Account with email ${removedEmail} doesn't exist.`);
      await this.updatePlan(newAcct._id, null);
      return {
        res: true,
        error: null,
      };
    } catch (e) {
      console.error(`[ConsumerService] failed to removeAccountFromPlan for '${signedInUser?._id}' for email '${removedEmail}'`, e.stack)
      throw e;
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

  async updateMyPlan(
    signedInUser: SignedInUser,
    newPlanId: string,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes> {
    try {
      if (!signedInUser) throw getNotSignedInErr()
      if (!this.orderService) throw new Error('OrderService not set');
      if (!this.planService) throw new Error('PlanService not set');
      const currUser = await this.getEConsumer(signedInUser);
      if (!currUser) throw new Error(`Signed in user '${signedInUser._id}' not found in db`);
      const currPlan = currUser.consumer.plan;
      if (!currPlan) throw new Error(`Consumer is missing plan`);
      if (currPlan.stripeProductPriceId === newPlanId) throw new Error("Can't update to the same plan. Choose a new plan");
      if (currPlan.role === PlanRoles.Owner) {
        // new plan members who have never checkedout may not have subscriptionId in their token so we only check for
        // plan owners
        if (!signedInUser.stripeSubscriptionId) throw new Error('No stripeSubscriptionId');
        const plans = await this.planService.getAvailablePlans();
        const targetDbPlan = Plan.getPlan(newPlanId, plans);
        const sharedAccounts = await this.getSharedAccounts(signedInUser);
        if (sharedAccounts.length > targetDbPlan.numAccounts) {
          return {
            res: null,
            error: `Only ${targetDbPlan.numAccounts} accounts allowed in ${targetDbPlan.name} plan. Must remove ${sharedAccounts.length - targetDbPlan.numAccounts} accounts first.`,
          }
        }
        const subscription = await this.stripe.subscriptions.retrieve(signedInUser.stripeSubscriptionId);
        const p1 = this.stripe.subscriptions.update(
          signedInUser.stripeSubscriptionId,
          {
            items: [{
              id: subscription.items.data[0].id,
              price: newPlanId
            }]
          },
        ).catch(e => {
          console.error(`Failed to update subscription '${signedInUser.stripeSubscriptionId}' to plan '${newPlanId}'`, e.stack);
          throw e;
        });
        const body: ({ update: { _id: string } } | { doc: Pick<EConsumer, 'plan'> })[] = [];
        sharedAccounts.forEach(a => {
          body.push({
            update: {
              _id: a._id
            }
          });
          if (!a.consumer.plan) throw new Error(`Consumer ${a._id} missing plan`);
          const doc: Pick<EConsumer, 'plan'> = {
            plan: {
              ...a.consumer.plan,
              stripeProductPriceId: newPlanId
            }
          }
          body.push({
            doc,
          });
        })
        const p2 = this.elastic.bulk({
          index: CONSUMER_INDEX,
          body
        }).catch(e => {
          console.error(`Failed to update plan.stripeProductPriceId to '${newPlanId}' for accounts '${sharedAccounts.map(a => a._id).join(', ')}'`, e.stack);
          throw e;
        });
        await Promise.all([p1, p2])
        return {
          res: Consumer.getIConsumerFromEConsumer(
            signedInUser._id,
            signedInUser.permissions,
            {
              ...currUser.consumer,
              plan: {
                role: PlanRoles.Owner,
                stripeProductPriceId: newPlanId,
                stripeSubscriptionId: signedInUser.stripeSubscriptionId,
              }
            }
          ),
          error: null,
        }
      } else if (currPlan.role === PlanRoles.Member) {
        // left off here. test this!
        if (!signedInUser.stripeCustomerId) {
          return {
            res: null,
            error: `You can only switch plans after you've placed your first order. If you still want to switch plans, cancel your plan and choose a new plan at checkout`
          }
        }
        const subscription = await this.stripe.subscriptions.create({
          customer: signedInUser.stripeCustomerId,
          trial_period_days: 30,
          items: [{
            price: newPlanId
          }]
        });
        await this.updateAuth0MetaData(
          signedInUser._id,
          subscription.id,
          signedInUser.stripeCustomerId
        );
        let p1;
        if (req && res) {
          // refresh access token so client can pick up new fields in token
          p1 = refetchAccessToken(req, res);
        }
        const newPlan = {
          role: PlanRoles.Owner,
          stripeProductPriceId: newPlanId,
          stripeSubscriptionId: subscription.id,
        };
        const p2 = this.updatePlan(signedInUser._id, newPlan);
        await Promise.all([p1, p2]);
        return {
          res: Consumer.getIConsumerFromEConsumer(
            signedInUser._id,
            signedInUser.permissions, 
            {
              ...currUser.consumer,
              plan: newPlan
            }
          ),
          error: null,
        }
      }

      //should never get here. throw error
      throw new Error(`Consumer's plan role is invalid with '${currPlan.role}'`);
    } catch (e) {
      console.error(
        `[ConsumerService] Failed to update plan for user '${signedInUser?._id}' with plan '${newPlanId}'`,
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
