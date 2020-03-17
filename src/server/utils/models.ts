// import { IConsumer } from './../../consumer/consumerModel';

type decodedToken = {
  sub:string
  name: string
  email: string
}
export type Context = {
  signedInUser: decodedToken
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