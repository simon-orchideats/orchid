import { getConsumerService } from './consumerService';
import { ServerResolovers } from '../../utils/apolloUtils';

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

  insertConsumer: async (
    _root,
    { userId, email, name }: { userId: string,  email: string, name: string },
  ) => {
    return await getConsumerService().insertConsumer(userId, name, email);
  },
}