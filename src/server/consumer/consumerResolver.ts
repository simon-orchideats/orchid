import { ServerResolovers } from '../utils/models';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async(_, _args, context) => {
    return context.signedInUser ? context.signedInUser : null;
  }
}
