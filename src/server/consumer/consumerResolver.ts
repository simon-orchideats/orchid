import { getConsumerService } from './consumerService';
import { ServerResolovers } from '../../utils/apolloUtils';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async (_, _args, context) => {
    const decodedToken = context.signedInUser;
    if (decodedToken) {
      const consumer = await getConsumerService().searchConsumer(decodedToken._id);
        if (consumer.hits.total.value > 0) {
          return {
            _id: consumer.hits.hits[0]._id,
            stripeCustomerId: consumer.hits.hits[0]._source.stripeCustomerId,
            stripeSubscriptionId: consumer.hits.hits[0]._source.stripeSubscriptionId,
            profile: consumer.hits.hits[0]._source.profile,
            plan: consumer.hits.hits[0]._source.plan
          }
        } else {
          // if there isnt an existing user return null
          return null
        }
    } else {
      // if no access token or req
      return null;
    }  
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