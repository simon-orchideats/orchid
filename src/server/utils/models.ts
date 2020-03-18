// import { IConsumer } from './../../consumer/consumerModel';

export type Context = {
  signedInUser: string | object
};

export type ServerResolovers = {
  [k: string]: (
    parent: any, 
    args: any, 
    context : Context
  ) => Promise<any> | any
}

export interface SignedInUser {
  _id: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  profile: {
    name: string
    email: string
  }
}