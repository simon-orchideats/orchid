import { IConsumerPlan } from './../../consumer/consumerModel';
import { ServerResolovers } from './../../utils/apolloUtils';
import { getConsumerService } from './consumerService';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async (_, _args, { signedInUser }) => {
    return signedInUser && await getConsumerService().getConsumer(signedInUser._id)  
  }
}

export const ConsumerMutationResolvers: ServerResolovers = {
  cancelSubscription: async (_root, _vars, { signedInUser, req, res }) => {
    return await getConsumerService().cancelSubscription(signedInUser, req, res);
  },

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

  updateMyPlan: async(_root, { plan }: { plan: IConsumerPlan }, { signedInUser }) => {
    return await getConsumerService().updateMyPlan(signedInUser, plan);
  }
}