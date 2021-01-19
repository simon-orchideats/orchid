import { IConsumerProfile } from './../../consumer/consumerModel';
import { ServerResolovers } from './../../utils/apolloUtils';
import { getConsumerService } from './consumerService';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async (_, _args, { signedInUser }) => {
    return signedInUser && await getConsumerService().getIConsumer(signedInUser)  
  },
  
  sharedAccounts: async (_, _args, _context) => {
    try {
      // return await getConsumerService().getSharedAccountsEmails(signedInUser)  
    } catch (e) {
      throw new Error('Internal Server Error');
    }
  },
}

export const ConsumerMutationResolvers: ServerResolovers = {
  addAccountToPlan: async (_, _args, _context) => {
    try {
      // return await getConsumerService().addAccountToPlan(signedInUser, addedEmail);
    } catch (e) {
      throw new Error('Internal Server Error');
    }
  },

  cancelSubscription: async (_, _args, _context) => {
    try {
      // return await getConsumerService().cancelSubscription(signedInUser, req, res);
    } catch (e) {
      throw new Error('Internal Server Error');
    }
  },

  removeAccountFromPlan: async (_, _args, _context) => {
    try {
      // return await getConsumerService().removeAccountFromPlan(signedInUser, removedEmail);
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

  updateMyPlan: async (_, _args, _context) => {
    try {
      // return await getConsumerService().updateMyPlan(signedInUser, planId, req, res);
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