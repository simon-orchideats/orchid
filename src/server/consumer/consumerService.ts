import moment from 'moment';
import { getNotSignedInErr } from './../utils/error';
import { MutationConsumerRes } from './../../utils/apolloUtils';
import { getAuth0Header } from './../auth/auth0Management';
import fetch, { Response } from 'node-fetch';
import { IOrderService, getOrderService, adjustmentDateFormat } from './../orders/orderService';
import { manualAuthSignUp, refetchAccessToken } from './../auth/authenticate';
import { IPlanService, getPlanService } from './../plans/planService';
import { EConsumer, IConsumer, IConsumerPlan, Consumer, IConsumerProfile } from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import express from 'express';
import { SignedInUser, MutationBoolRes } from '../../utils/apolloUtils';
import { activeConfig } from '../../config';
import Stripe from 'stripe';
import { OutgoingMessage, IncomingMessage } from 'http';

const CONSUMER_INDEX = 'consumers';
export interface IConsumerService {
  cancelSubscription: (signedInUser: SignedInUser, req?: IncomingMessage, res?: OutgoingMessage) => Promise<MutationBoolRes>
  insertEmail: (email: string) => Promise<MutationBoolRes>
  signUp: (email: string, name: string, pass: string, res: express.Response) => Promise<MutationConsumerRes>
  updateAuth0MetaData: (userId: string, stripeSubscriptionId: string, stripeCustomerId: string) =>  Promise<Response>
  upsertConsumer: (userId: string, consumer: EConsumer) => Promise<IConsumer>
  updateMyPlan: (signedInUser: SignedInUser, newPlan: IConsumerPlan) => Promise<MutationBoolRes>
  updateMyProfile: (signedInUser: SignedInUser, profile: IConsumerProfile) => Promise<MutationConsumerRes>
}

class ConsumerService implements IConsumerService {
  private readonly elastic: Client
  private readonly stripe: Stripe
  private planService?: IPlanService
  private orderService?: IOrderService

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

  public async cancelSubscription(
    signedInUser: SignedInUser,
    req?: IncomingMessage,
    res?: OutgoingMessage
  ) {
    try {
      if (!signedInUser) throw getNotSignedInErr()
      if (!this.orderService) throw new Error('OrderService not set');
      const stripeCustomerId = signedInUser.stripeCustomerId;
      const subscriptionId = signedInUser.stripeSubscriptionId;
      if (!stripeCustomerId) {
        const msg = 'Missing stripe customer id';
        console.warn('[ConsumerService]', msg)
        return {
          res: false,
          error: msg
        }
      }
      if (!subscriptionId) {
        const msg = 'Missing stripe subscription id';
        console.warn('[ConsumerService]', msg)
        return {
          res: false,
          error: msg
        }
      }

      let pendingLineItems: Stripe.ApiList<Stripe.InvoiceItem>;
      try {
        pendingLineItems = await this.stripe.invoiceItems.list({
          limit: 50,
          pending: true,
          customer: stripeCustomerId,
        });
      } catch (e) {
        throw new Error(`Couldn't get future line items'. ${e.stack}`)
      }
      const today = moment().valueOf();
      const p1 = this.orderService.getMyUpcomingEOrders(signedInUser)
        .then(orders => Promise.all(orders.map(async ({ _id, order }) => {
          if (!this.orderService) throw new Error('OrderService not set');
          if (order.invoiceDate > today) {
            return Promise.all(pendingLineItems.data.map(line => {
              console.log(moment(order.invoiceDate).format(adjustmentDateFormat));
              if (line.description && line.description.includes(moment(order.invoiceDate).format(adjustmentDateFormat))) {
                try {
                  return this.stripe.invoiceItems.del(line.id);
                } catch (e) {
                  const msg = `Couldn't remove future adjustment id '${line.id}'. ${e.stack}`
                  console.error(msg);
                  throw e;
                }
              }
            }));
          } else {
            return this.orderService.updateOrder(signedInUser, _id, {
              restId: null,
              meals: [],
              // todo 0: remove these !
              phone: order.consumer.profile.phone!,
              destination: order.consumer.profile.destination!,
              deliveryDate: order.deliveryDate,
            }).catch(e => {
              const msg = `Failed to skip order '${_id}' for user '${signedInUser._id}'. ${e.stack}`;
              console.error(msg)
              throw e;
            })
          }
        })))
        .then(() => {
          return this.stripe.subscriptions.del(subscriptionId, { invoice_now: true })
            .catch(e => {
              const msg = `Failed to delete subscription '${subscriptionId}' from stripe for user '${signedInUser._id}'. ${e.stack}`;
              console.error(msg)
              throw e;
            });
        })
        .catch(e => {
          const msg = `Failed to get upcomingOrders for user '${signedInUser._id}'`;
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
      const updatedConsumer: Partial<EConsumer> = {
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

  async insertEmail(email: string): Promise<MutationBoolRes> {
    try {
      let res: ApiResponse<SearchResponse<any>>
      try {
        res = await this.elastic.search({
          index: CONSUMER_INDEX,
          size: 1000,
          _source: 'false',
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
      } catch (e) {
        throw new Error(`Couldn't seach for consumer email ${email}. ${e.stack}`);
      }
      if (res.body.hits.total.value > 0) throw new Error('Email already exists');
      await this.elastic.index({
        index: CONSUMER_INDEX,
        body: {
          createdDate: Date.now(),
          profile: {
            email,
          }
        }
      });
      return {
        res: true,
        error: null,
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to insert email '${email}'`, e.stack);
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
      const consumer = await this.insertConsumer(signedUp.res._id, signedUp.res.profile.name,  signedUp.res.profile.email)
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
    if (!signedInUser) throw getNotSignedInErr()
    try {
      await this.elastic.update({
        index: CONSUMER_INDEX,
        id: signedInUser._id,
        body: {
          doc: {
            profile: profile,
        }}
      });
      if(this.orderService) await this.orderService.updateUpComingOrders(signedInUser, profile)
      return {
        res: await this.getConsumer(signedInUser._id),
        error: null
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to update consumer profile for '${signedInUser && signedInUser._id}', e.stack`);
      throw new Error('Internal Server Error');
    }
  }

  async updateMyPlan(signedInUser: SignedInUser, newPlan: IConsumerPlan): Promise<MutationBoolRes> {
    // todo simon: finish this
    try {
      if (!signedInUser) throw getNotSignedInErr()
      if (!this.orderService) throw new Error('OrderService not set');
      /**
       * update....
       * - consumer plan in elastic
       * - consumer's upcoming orders, adjust the meals and price
       *    - update cartUpdatedDate, costs, rest.meals
       * 
       * stripe subscription, change the plan
       *  - get the upcoming invoice.
       *  - find 
       */
      //@ts-ignore
      const profileUpdater = this.elastic.update({
        index: CONSUMER_INDEX,
        id: signedInUser._id,
        body: {
          doc: {
            plan: newPlan,
          }
        }
      }).catch(e => {
        const msg = 'Failed to update elastic consumer plan for consumer'
                    + ` '${signedInUser._id}' to plan ${JSON.stringify(newPlan)}: ${e.stack}`;
        console.error(msg)
        throw e;
      });
      return {
        res: true,
        error: null,
      }
      //
      // const upcomingOrdersUpdater = this.elastic.updateByQuery({
      //   index: CONSUMER_INDEX,
      //   body: {
      //     script: {
      //       lang: 'painless',
      //       source: 'ctx._source["house"] = "stark"'
      //     },
      //     query: {
      //       match: {
      //         character: 'stark'
      //       }
      //     }
      //   }
      // })
    } catch (e) {
      console.error(`
        [ConsumerService] Failed to update plan for user '${signedInUser && signedInUser._id}' with plan '${JSON.stringify(newPlan)}'`,
        e.stack
      );
      throw new Error('Internal Server Error');
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
  return consumerService;
}
