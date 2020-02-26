import { getConsumerService } from './consumerService';
import { ServerResolovers } from '../utils/models';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async(_, _args, context) => {
    return context.signedInUser ? context.signedInUser : null;
  }
}

export const ConsumerMutationResolvers: ServerResolovers = {
  insertEmail: async (
    _root,
    { email }: { email: string },
  ) => {
    return await getConsumerService().insertEmail(email);
  },
}