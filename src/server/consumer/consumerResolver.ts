import { getConsumerService } from './consumerService';
import { ServerResolovers } from '../utils/models';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async(_, _args, context) => {
    console.log("myCoonsumer stuff");
    let test = await context.signedInUser;
    console.log(`MYCOOONSUMER RESULTS: ${test}`);
    console.log("BETT");
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