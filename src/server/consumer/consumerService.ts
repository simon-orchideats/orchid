import { IPlanService, getPlanService } from './../plans/planService';
import { MutationBoolRes } from './../../utils/mutationResModel';
import { EConsumer, IConsumer, RenewalTypes } from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
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

  async insertConsumer(_id: string,name: string, email: string): Promise<MutationBoolRes> {
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

  async getConsumer(decodedToken:any): Promise<IConsumer | undefined> {
    // have the logic here from authenticate but splitted in private functions probably
    // let authData;
  // If user doesn't exist insert consumer and return new consumer
  try {
    let getConsumer: SearchResponse<IConsumer> = await this.searchConsumer(decodedToken.sub);
    if (getConsumer.hits.total.value === 0) {
      const insertConsumer: MutationBoolRes  = await this.insertConsumer(
        decodedToken.sub,
        decodedToken['https://orchideats.com/name'],
        decodedToken['https://orchideats.com/email']
        );
      if (insertConsumer.res) {
        try {
          getConsumer = await this.searchConsumer(decodedToken.sub);
        } catch (e) {
          console.error(`[Authenticate] After insertion, getConsumerInfo failed: ${e}`);
          throw e;
        }
        return {
          _id: getConsumer.hits.hits[0]._id,
          profile: getConsumer.hits.hits[0]._source.profile,
          plan: getConsumer.hits.hits[0]._source.plan,
          stripeCustomerId: getConsumer.hits.hits[0]._source.stripeCustomerId,
          stripeSubscriptionId: getConsumer.hits.hits[0]._source.stripeSubscriptionId
        }
      } else {
        throw new Error("[Authenticate] Failed inserting new Consumer")
      }
    } else {
        return {
          _id: getConsumer.hits.hits[0]._id,
          profile: getConsumer.hits.hits[0]._source.profile,
          plan: getConsumer.hits.hits[0]._source.plan,
          stripeCustomerId: getConsumer.hits.hits[0]._source.stripeCustomerId,
          stripeSubscriptionId: getConsumer.hits.hits[0]._source.stripeSubscriptionId
        }
      }
  } catch (e) {
    console.error(`[Authenticate] getConsumerInfo failed: ${e}`);
  }
  }

  private async searchConsumer(_id: string) {
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
      return res.body;
    } catch (e) {
      console.error(`[ConsumerService] couldn't search for consumer '${_id}'`, e.stack)
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
