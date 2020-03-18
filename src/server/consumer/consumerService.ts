import { fetch } from 'node-fetch';
import { adjustmentDescHeader } from './../orders/orderService';
import { signUp } from './../auth/authenticate';
import { IPlanService, getPlanService } from './../plans/planService';
import { MutationBoolRes } from './../../utils/mutationResModel';
import { EConsumer, IConsumer, RenewalTypes } from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import express from 'express';
import { SignedInUser } from '../../utils/apolloUtils';
import { activeConfig } from '../../config';
import Stripe from 'stripe';
import moment from 'moment';

const CONSUMER_INDEX = 'consumers';

export interface IConsumerService {
  upsertConsumer: (userId: string, consumer: EConsumer) => Promise<IConsumer>
  insertEmail: (email: string) => Promise<MutationBoolRes>
}

class ConsumerService implements IConsumerService {
  private readonly elastic: Client
  private readonly stripe: Stripe
  private readonly planService: IPlanService

  public constructor(elastic: Client, stripe: Stripe, planService: IPlanService) {
    this.elastic = elastic;
    this.stripe = stripe;
    this.planService = planService;
  }

  public async cancelSubscription(signedInUser: SignedInUser) {
    try {
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
      
      let pendingLineItems;
      try {
        pendingLineItems = await this.stripe.invoiceItems.list({
          limit: 50,
          pending: true,
          customer: stripeCustomerId,
        });
      } catch (e) {
        throw new Error(`Couldn't get future line items'. ${e.stack}`)
      }
      const today = moment();
      const deletions = await Promise.all(pendingLineItems.data.map(async line => {
        if (line.description && line.description.includes(adjustmentDescHeader)) {
          const adjustmentForDate = moment(line.description.substring(adjustmentDescHeader.length), 'MM/DD/YYYY');
          if (adjustmentForDate.isAfter(today)) {
            try {
              await this.stripe.invoiceItems.del(line.id);
            } catch (e) {
              const msg = `Couldn't remove adjustment id '${line.id}'. ${e.stack}`
              console.error(msg);
              throw new Error (msg)
            }
          }
        }
      }));

      const p1 = this.stripe.subscriptions.del(subscriptionId);
      const p2 = fetch(MANAGEMENT_URL + 'users/' + signedInUser._id, {
        headers: await getAuth0Header(),
        method: 'PATCH',
        body: JSON.stringify({
          app_metadata: {
            card: hiddenCard,
          },
        })
      }).catch(e => console.error(e));

      

    } catch (e) {
      console.error(`[ConsumerService] couldn't cancel subscription for user '${JSON.stringify(signedInUser)}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  public async insertConsumer(_id: string,name: string, email: string): Promise<MutationBoolRes> {
    try {
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
      let defaultPlan
      try{
        defaultPlan = await this.planService.getDefaultPlan();
      } catch(e) {
        throw new Error(`Failed to get default plan. ${e}`)
      }
      if (!defaultPlan) throw new Error('Could\'t get default plan');
      await this.elastic.index({
        index: CONSUMER_INDEX,
        id: _id,
        refresh: 'true', 
        body: {
          createdDate: Date.now(),
          profile: {
            name,
            email,
            phone: null,
          },
          plan: {
            stripePlanId: defaultPlan.stripeId,
            deliveryDay: 0,
            rewnewal: RenewalTypes.Auto,
            cuisines: []
          }, // todo alvin add this, "as EConsumer"
        }
      });
      return {
        res: true,
        error: null,
      }
    } catch (e) {
      console.error(`[ConsumerService] couldn't insert consumer '${_id}'`, e.stack);
      throw e;
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

  async signUp(email: string, name: string, pass: string, res: express.Response) {
    try {
      const signedUp = await signUp(email, name, pass, res);
      // todo alvin: insert consumer here using results from signUp
      return {
        res: signedUp.res ? true : false,
        error: signedUp.error ? signedUp.error : null,
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to signup '${email}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async upsertConsumer(userId: string, consumer: EConsumer): Promise<IConsumer> {
    // todo: when inserting, make sure check for existing consumer with email only and remove it to prevent
    // dupe entries.
    try {
      await this.elastic.index({
        index: CONSUMER_INDEX,
        id: userId,
        body: consumer
      });
      return {
        userId,
        ...consumer
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to upsert consumer '${userId}', '${JSON.stringify(consumer)}'`, e.stack);
      throw e;
    }
  }
}

let consumerService: ConsumerService;

export const initConsumerService = (elastic: Client,  stripe: Stripe, planService: IPlanService) => {
  if (consumerService) throw new Error('[ConsumerService] already initialized.');
  consumerService = new ConsumerService(elastic, stripe, planService);
};

export const getConsumerService = () => {
  if (consumerService) return consumerService;
  initConsumerService(
    initElastic(),
    new Stripe(activeConfig.server.stripe.key, {
      apiVersion: '2019-12-03',
    }),
    getPlanService()
  );
  return consumerService;
}
