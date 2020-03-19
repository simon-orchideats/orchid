import { accessTokenCookie } from './auth';
import express from 'express';
import { IncomingMessage, OutgoingMessage } from "http"
import jwt from 'jsonwebtoken';
import { activeConfig } from '../config'
import cookie from 'cookie'

export type Context = {
  signedInUser: SignedInUser | null,
  res?: express.Response | OutgoingMessage ,
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

//todo alvin should be getSignedInUser = (req?: IncomingMessage): SignedInUser => { ... }
const getSignedInUser = async (req?: IncomingMessage): Promise<SignedInUser | null> => {
  if (!req) return null;
  const access = cookie.parse(req.headers.cookie ?? '')[accessTokenCookie];
  if (!access) return null;
  try {
    const decoded = await jwt.verify(access, activeConfig.server.auth.public, { algorithms: ['RS256'] }) as any;
    console.log(`decooded from getSignedInUser`)
    return {
      _id: decoded.sub,
      stripeCustomerId: decoded['https://orchideats.com/stripeCustomerId'],
      stripeSubscriptionId: decoded['https://orchideats.com/stripeSubId'],
      profile: {
        name: decoded['https://orchideats.com/name'],
        email: decoded['https://orchideats.com/email']
      }   
    };
  } catch(e) {
    console.error(`[getSignedInUser] Error in verifying accessToken: ${e}`)
    throw (e)
  }
}

// todo alvin should be getContext = (req?: IncomingMessage, res?: OutgoingMessage): Context => ...
export const getContext = async (req?: IncomingMessage, res?: OutgoingMessage | express.Response): Promise<Context> => ({
  signedInUser: await getSignedInUser(req),
  res,
})