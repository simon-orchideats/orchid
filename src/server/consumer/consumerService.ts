import { MutationBoolRes } from './../../utils/mutationResModel';
import { EConsumer, IConsumer} from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';

const CONSUMER_INDEX = 'consumers';

export interface IConsumerService {
  upsertConsumer: (userId: string, consumer: EConsumer) => Promise<IConsumer>
  insertEmail: (email: string) => Promise<MutationBoolRes>
}

class ConsumerService implements IConsumerService {
  private readonly elastic: Client

  public constructor(elastic: Client) {
    this.elastic = elastic;
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

  async insertConsumerInfo(_id: string,name: string, email: string): Promise<MutationBoolRes> {
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
        console.error(`[ConsumerService] failed to find consumer ${_id}. ${e.stack}`);
        throw e;
      }
      if (res.body.hits.total.value > 0) throw new Error('_id already exists');
      await this.elastic.index({
        index: CONSUMER_INDEX,
        id: _id,
        refresh: 'true', 
        body: {
          createdDate: Date.now(),
          profile: {
             name,
             email,
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
      console.error(`[ConsumerService] couldn't insert consumer '${_id}'`, e.stack);
      throw e;
    }
  }

  async getConsumerInfo(_id: string): Promise<SearchResponse<any>> {
    // have the logic here from authenticate but splitted in private functions probably
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
