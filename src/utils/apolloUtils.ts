import { MutationPromoRes } from './../order/promoModel';
import { useNotify } from './../client/global/state/notificationState';
import { NotificationType } from './../client/notification/notificationModel';
import { useEffect } from 'react';
import { ApolloError } from 'apollo-client';
import { IConsumer } from './../consumer/consumerModel';
import { accessTokenCookie, refetchAccessToken } from './auth';
import { IncomingMessage, OutgoingMessage } from "http"
import jwt from 'jsonwebtoken';
import { activeConfig } from '../config'
import cookie from 'cookie'
import { Permission } from '../consumer/consumerModel';

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
  // stripeSubscriptionId?: string
  profile: {
    name: string
    email: string
  },
  permissions: Permission[]
} | null

export const decodeToSignedInUser = (access: string): SignedInUser => {
  try {
    const decoded = jwt.verify(access, activeConfig.server.auth.publicKey, { algorithms: ['RS256'] }) as any;
    return {
      _id: decoded.sub,
      stripeCustomerId: decoded[`${activeConfig.server.auth.audience}/stripeCustomerId`],
      // stripeSubscriptionId: decoded[`${activeConfig.server.auth.audience}/stripeSubscriptionId`],
      profile: {
        name: decoded[`${activeConfig.server.auth.audience}/name`],
        email: decoded[`${activeConfig.server.auth.audience}/email`]
      },
      permissions: (decoded.permissions ? decoded.permissions : []) as Permission[]
    };
  } catch (e) {
    if (e.name === 'TokenExpiredError') return null;
    console.error(`[getSignedInUser] Error in verifying accessToken: ${e.stack}`)
    throw e 
  }
}

const getSignedInUser = async (req?: IncomingMessage, res?: OutgoingMessage): Promise<SignedInUser> => {
  if (!req || !res) return null;
  const access = cookie.parse(req.headers.cookie ?? '')[accessTokenCookie];
  if (!access) return null;
  try {
    const user = decodeToSignedInUser(access);
    if (user) return user;
  } catch (e) {
    console.error(`Failed to get signed in user with ${access}`, e.stack);
  }
  try {
    const newAccessToken = await refetchAccessToken(req, res);
    return decodeToSignedInUser(newAccessToken);
  } catch (e) {
    console.error(`Failed refetch access token`, e.stack);
  }
  return null;
}

type handlerRes = {
  error?: ApolloError 
  data?: MutationBoolRes | MutationConsumerRes | MutationPromoRes
};
export const useMutationResponseHandler:(
  res: handlerRes,
  cb: (variable: handlerRes) => void
) => void = (res, cb) => {
  const notify = useNotify();
  useEffect(() => {
    if (res.error) {
      notify('Sorry, something went wrong', NotificationType.error, false);
    }
    if (res.data !== undefined) {
      if (res.data.error) {
        notify(res.data.error, NotificationType.error, false);
      } else {
       cb(res);
      }
    }
  }, [res]);
}

export const getContext = async (req?: IncomingMessage, res?: OutgoingMessage): Promise<Context> => ({
  signedInUser: await getSignedInUser(req, res),
  req,
  res,
})

export const getContextNoParam = () => ({
  signedInUser: null,
})