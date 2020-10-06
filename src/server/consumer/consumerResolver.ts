import { IConsumerProfile } from './../../consumer/consumerModel';
import { ServerResolovers } from './../../utils/apolloUtils';
import { getConsumerService } from './consumerService';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async (_, _args, { signedInUser }) => {
    return signedInUser && await getConsumerService().getIConsumer(signedInUser)  
  },
  
  sharedAccounts: async (_, _args, { signedInUser }) => {
    try {
      return await getConsumerService().getSharedAccountsEmails(signedInUser)  
    } catch (e) {
      throw new Error('Internal Server Error');
    }
  },
}

export const ConsumerMutationResolvers: ServerResolovers = {
  addAccountToPlan: async (_root, { addedEmail }, { signedInUser }) => {
    try {
      return await getConsumerService().addAccountToPlan(signedInUser, addedEmail);
    } catch (e) {
      throw new Error('Internal Server Error');
    }
  },

  cancelSubscription: async (_root, _vars, { signedInUser, req, res }) => {
    return await getConsumerService().cancelSubscription(signedInUser, req, res);
  },

  removeAccountFromPlan: async (_root, { removedEmail }, { signedInUser }) => {
    try {
      return await getConsumerService().removeAccountFromPlan(signedInUser, removedEmail);
    } catch (e) {
      throw new Error('Internal Server Error');
    }
  },

  signUp: async (
    _root,
    { email, name, pass }: { email: string, name: string, pass: string, },
    { res }
  ) => {
    return await getConsumerService().signUp(email, name, pass, res);
  },

  updateMyPlan: async(
    _root,
    { planId }: { planId: string },
    { signedInUser, req, res },
  ) => {
    try {
      return await getConsumerService().updateMyPlan(signedInUser, planId, req, res);
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