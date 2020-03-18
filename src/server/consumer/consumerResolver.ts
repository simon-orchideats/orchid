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

  signUp: async (
    _root,
    { email, name, pass }: { email: string, name: string, pass: string, },
    { res }
  ) => {
    return await getConsumerService().signUp(email, name, pass, res);
  },
}