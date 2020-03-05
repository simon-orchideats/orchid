import { MutationBoolRes } from './../../utils/mutationResModel';
import { EConsumer, IConsumer} from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';

const CONSUMER_INDEX = 'consumers';

class ConsumerService {
  private readonly elastic: Client

  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  async upsertConsumer(userId: string, consumer: EConsumer): Promise<IConsumer> {
    // todo: when inserting, make sure check for existing consumer with email only and remove it to prevent
    // dupe entries.
    try {
      await this.elastic.update({
        index: CONSUMER_INDEX,
        id: userId,
        body: {
          doc: consumer,
          doc_as_upsert: true
        },
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

  async insertConsumerProfile(userId: string,name: string, email: string): Promise<MutationBoolRes> {
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
                values: userId
              }
            }
          }
        });
      } catch (e) {
        throw new Error(`Coudln't search for userId ${userId}. ${e.stack}`);
      }
      if (res.body.hits.total.value > 0) throw new Error('userId already exists');
      await this.elastic.index({
        index: CONSUMER_INDEX,
        id: userId,
        refresh: 'true', 
        body: {
          createdDate: Date.now(),
          profile: {
             name,
             email,
             card: {
              last4: '',
              expMonth: 0,
              expYear: 0
            },
            phone: '',
            destination: {
              name: '',
              instructions: '',
              address: {
                address1: '',
                city: '',
                state: null,
                zip: ''
              }
            }
          },
          plan: {
            stripePlanId: '',
            deliveryDay: 0,
            rewnewal: '',
            cuisines: []
          }, 
        }
      });
      return {
        res: true,
        error: null,
      }
    } catch (e) {
      console.error(`[ConsumerService] failed to insert email '${userId}'`, e.stack);
      throw e;
    }
  }

  async getConsumerProfile(userId: string): Promise<any> {
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
                  match: { _id: userId }
                }
              ]
            }
          }
        }
      });
      return res.body;
    } catch (e) {
      throw new Error("Couldn't get consumer Profile");
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
        throw new Error(`Coudln't seach for consumer email ${email}. ${e.stack}`);
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

export const initConsumerService = (elastic: Client) => {
  if (consumerService) throw new Error('[ConsumerService] already initialized.');
  consumerService = new ConsumerService(elastic);
};

export const getConsumerService = () => {
  if (consumerService) return consumerService;
  initConsumerService(initElastic());
  return consumerService;
}
