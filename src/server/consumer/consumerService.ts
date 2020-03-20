import { signUp } from './../auth/authenticate';
import { IPlanService, getPlanService } from './../plans/planService';
import { MutationBoolRes } from './../../utils/mutationResModel';
import { EConsumer, IConsumer, RenewalTypes, CuisineTypes } from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { OutgoingMessage } from 'http';

const CONSUMER_INDEX = 'consumers';
export interface IConsumerService {
  upsertConsumer: (userId: string, consumer: EConsumer) => Promise<IConsumer>
  insertEmail: (email: string) => Promise<MutationBoolRes>
}

class ConsumerService implements IConsumerService {
  private readonly elastic: Client
  private readonly planService: IPlanService

  public constructor(elastic: Client, planService: IPlanService) {
    this.elastic = elastic;
    this.planService = planService;
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

  public async insertConsumer(_id: string,name: string, email: string): Promise<MutationBoolRes> {
    try {
      let defaultPlan
      try {
        defaultPlan = await this.planService.getDefaultPlan();
      } catch (e) {
        throw new Error (`Failed to get default plan. ${e.stack}`)
      }
      if (!defaultPlan) throw new Error('Could\'t get default plan');
      await this.elastic.index({
        index: CONSUMER_INDEX,
        id: _id,
        refresh: 'true', 
        body: {
          createdDate: Date.now(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          profile: {
            name,
            email,
          },
          plan: {
            stripePlanId: defaultPlan.stripeId,
            deliveryDay: 0,
            renewal: RenewalTypes.Auto,
            cuisines: Object.values(CuisineTypes)
          },
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

  async getConsumer(_id: string): Promise<IConsumer | null> {
    let res: ApiResponse<SearchResponse<any>>
    try {
      res = await this.elastic.search({
        index: CONSUMER_INDEX,
        size: 1000,
        body: {
          query: {
            bool: {
              must: [
                {
                  match: { _id: _id }
                }
              ]
            }
          }
        }
      });
      if (res.body.hits.total.value > 0 ) {
        const options: any = {
          index: CONSUMER_INDEX,
          id:_id
        }
        const consumer = await this.elastic.getSource(options);
        return {
          _id,
          stripeCustomerId: consumer.body.stripeCustomerId,
          stripeSubscriptionId: consumer.body.stripeSubscriptionId,
          profile: consumer.body.profile,
          plan: consumer.body.plan
        }
      }
        return null
    } catch (e) {
      console.error(`[ConsumerService]: ${e.stack}`)
      throw e
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
}

let consumerService: ConsumerService;

export const initConsumerService = (elastic: Client, planService: IPlanService) => {
  if (consumerService) throw new Error('[ConsumerService] already initialized.');
  consumerService = new ConsumerService(elastic, planService);
};

export const getConsumerService = () => {
  if (consumerService) return consumerService;
  initConsumerService(
    initElastic(),
    getPlanService()
  );
  return consumerService;
}
