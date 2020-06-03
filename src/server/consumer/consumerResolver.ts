import { IConsumerProfile } from './../../consumer/consumerModel';
import { IConsumerPlan } from './../../consumer/consumerPlanModel';
import { ServerResolovers } from './../../utils/apolloUtils';
import { getConsumerService } from './consumerService';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async (_, _args, { signedInUser }) => {
    return signedInUser && await getConsumerService().getIConsumer(signedInUser)  
  }
}

export const ConsumerMutationResolvers: ServerResolovers = {
  addMarketingEmail: async (_root, { email }: { email: string }) => {
    return await getConsumerService().upsertMarketingEmail(email);
  },

  cancelSubscription: async (_root, _vars, { signedInUser, req, res }) => {
    return await getConsumerService().cancelSubscription(signedInUser, req, res);
  },

  signUp: async (
    _root,
    { email, name, pass }: { email: string, name: string, pass: string, },
    { res }
  ) => {
    return await getConsumerService().signUp(email, name, pass, res);
  },

  updateMyPlan: async(_root, { plan }: { plan: IConsumerPlan }, { signedInUser }) => {
    try {
      return await getConsumerService().updateMyPlan(signedInUser, plan);
    } catch (e) {
      throw new Error('Internal Server Error');
    }
  },

  updateMyProfile: async(
    _root,
    {
      profile,
      paymentMethodId
    }: {
      profile: IConsumerProfile,
      paymentMethodId?: string
    },
    {
      signedInUser
    }) => {
    return await getConsumerService().updateMyProfile(signedInUser, profile, paymentMethodId);
  }
}