import { IConsumer } from './../consumer/consumerModel';
import { accessTokenCookie } from './auth';
import { IncomingMessage, OutgoingMessage } from "http"
import jwt from 'jsonwebtoken';
import { activeConfig } from '../config'
import cookie from 'cookie'

export type Context = {
  signedInUser: SignedInUser,
  req?: IncomingMessage,
  res?: OutgoingMessage,
};

export type MutationBoolRes = {
  res: boolean;
  error: string | null;
};

export type MutationConsumerRes = {
  res: IConsumer | null;
  error: string | null;
};

export type ServerResolovers = {
  [k: string]: (
    parent: any, 
    args: any, 
    context : Context
  ) => Promise<any> | any
}

export type SignedInUser = {
  _id: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  profile: {
    name: string
    email: string
  }
} | null

export const decodeToSignedInUser = (access: string): SignedInUser => {
  try {
    const decoded = jwt.verify(access, activeConfig.server.auth.publicKey, { algorithms: ['RS256'] }) as any;
    return {
      _id: decoded.sub,
      stripeCustomerId: decoded[`${activeConfig.server.auth.audience}/stripeCustomerId`],
      stripeSubscriptionId: decoded[`${activeConfig.server.auth.audience}/stripeSubscriptionId`],
      profile: {
        name: decoded[`${activeConfig.server.auth.audience}/name`],
        email: decoded[`${activeConfig.server.auth.audience}/email`]
      }   
    };
  } catch (e) {
    console.error(`[getSignedInUser] Error in verifying accessToken: ${e.stack}`)
    throw (e)
  }
}

const getSignedInUser = (req?: IncomingMessage): SignedInUser => {
  if (!req) return null;
  const access = cookie.parse(req.headers.cookie ?? '')[accessTokenCookie];
  if (!access) return null;
  return decodeToSignedInUser(access);
}

export const getContext = (req?: IncomingMessage, res?: OutgoingMessage): Context => ({
  signedInUser: getSignedInUser(req),
  req,
  res,
})