import { IConsumerProfile } from './../../consumer/consumerModel';
import { IConsumerPlan } from './../../consumer/consumerPlanModel';
import { ServerResolovers } from './../../utils/apolloUtils';
import { getConsumerService } from './consumerService';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async (_, _args, { signedInUser }) => {
    return signedInUser && await getConsumerService().getIConsumer(signedInUser)  
  },

  consumerFromReferral: async (_, { promoCode }: { promoCode: string }) => {
    try {
      return await getConsumerService().getNameFromReferral(promoCode)  
    } catch (e) {
      console.error(`[ConsumerResolver] Failed to get consumer from referral '${promoCode}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }
}

export const ConsumerMutationResolvers: ServerResolovers = {
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