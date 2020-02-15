export type Context = {
  signedInUser: string
};

export type ServerResolovers = {
  [k: string]: (
    parent: any, 
    args: any, 
    context : Context
  ) => Promise<any> | any
}

export interface SignedInUser {
  userId: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  profile: {
    name: string
    email: string
  }
}