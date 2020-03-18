import { accessTokenCookie } from './auth';
import { IConsumer } from './../consumer/consumerModel';
import express from 'express';
import { IncomingMessage, OutgoingMessage } from "http"
import cookie from 'cookie'

export type Context = {
  signedInUser: IConsumer,
  res: express.Response,
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

//todo alvin should be getSignedInUser = (req?: IncomingMessage): SignedInUser => { ... }
const getSignedInUser = (req?: IncomingMessage) => {
  if (!req) return null;
  const access = cookie.parse(req.headers.cookie ?? '')[accessTokenCookie];
  if (!access) return null;
  return {
    _id: '123',
    plan: {
      stripePlanId: 'plan123',
      deliveryDay: 0,
      rewnewal: 'Skip',
      cuisines: []
    },
    card: {
      last4: '1234',
      expMonth: 12,
      expYear: 2004
    },
    phone: '6095138166',
    destination: {
      name: 'name',
      instructions: 'to door',
      address: {
        address1: '1',
        city: 'boston',
        state: 'MA',
        zip: '02127'
      }
    }
  }
}

// todo alvin should be getContext = (req?: IncomingMessage, res?: OutgoingMessage): Context => ...
export const getContext = (req?: IncomingMessage, res?: OutgoingMessage | express.Response) => ({
  signedInUser: getSignedInUser(req),
  res,
})
