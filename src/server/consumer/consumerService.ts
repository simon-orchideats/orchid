import { EConsumer, IConsumer } from './../../consumer/consumerModel';
import { initElastic } from './../elasticConnector';
import { Client } from '@elastic/elasticsearch';

const CONSUMER_INDEX = 'consumers';

class ConsumerService {
  private readonly elastic: Client

  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  async upsertConsumer(userId: string, consumer: EConsumer): Promise<IConsumer> {
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
