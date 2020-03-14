import { randomString } from './utils';
import { IncomingMessage } from "http";
import cookie from 'cookie'
import express from 'express';
import { activeConfig } from '../../config';
import fetch from 'node-fetch';
import { getConsumerService } from '../consumer/consumerService'
import { SearchResponse } from '../elasticConnector';
import { MutationBoolRes } from '../../utils/mutationResModel';
import { IConsumer } from '../../consumer/consumerModel';
const STATE_COOKIE_NAME = 'orchid_state';
const ACCESS_TOKEN_NAME = 'orchid_access';
const REFRESH_TOKEN_NAME = 'orchid_refresh';

export const getSignedInUser = async (req?: IncomingMessage) => {
  if (!req) return null;
  const access = cookie.parse(req.headers.cookie ?? '')[ACCESS_TOKEN_NAME];
  if (!access) return null;

  
  // Grab userInfo with accessToken
  let authData;
  try {
    const authRes = await fetch(`${activeConfig.server.auth.domain}/userinfo`, {
    method: 'GET',
    // mode:'cors',
    headers: {'Authorization':`Bearer ${access}`},
  })
    authData = await authRes.json()
  } catch (e) {
    console.error(`[Authenticate] Failed to get userInfo from accessToken, could be expired: ${e}`)
  }

  // If user doesn't exist insert consumer and return new consumer
  try {
    let getConsumer: SearchResponse<IConsumer> = await getConsumerService().getConsumerInfo(authData.sub);
    if (getConsumer.hits.total.value === 0) {
      const insertConsumer: MutationBoolRes  = await getConsumerService().insertConsumerInfo(
        authData.sub,
        authData.name,
        authData.email
        );
      if (insertConsumer.res) {
        try {
          getConsumer = await getConsumerService().getConsumerInfo(authData.sub);
        } catch (e) {
          console.error(`[Authenticate] After insertion, getConsumerInfo failed: ${e}`);
          throw e;
        }
        return {
          _id: getConsumer.hits.hits[0]._id,
          profile: getConsumer.hits.hits[0]._source.profile,
          plan: getConsumer.hits.hits[0]._source.plan
        }
      } else {
        throw new Error("[Authenticate] Failed inserting new Consumer")
      }
    } else {
        return {
          _id: getConsumer.hits.hits[0]._id,
          profile: getConsumer.hits.hits[0]._source.profile,
          plan: getConsumer.hits.hits[0]._source.plan
        }
      }
  } catch (e) {
    console.error(`[Authenticate] getConsumerInfo failed: ${e}`);
  }
}

export const handleLoginRoute = (req: express.Request, res: express.Response) => {
  try {
    const re = req.query.redirect;
    const state = randomString(32) + '_' + re
    const oneMinMilis = 60000;
    res.cookie(STATE_COOKIE_NAME, state, {
      httpOnly: true,
      // secure: true, // turned off because we use ssl in prod and don't use in local
      maxAge: oneMinMilis,
    });
    const authorizationEndpointUrl = new URL(`${activeConfig.server.auth.domain}/authorize`);
    authorizationEndpointUrl.search = new URLSearchParams({
      audience: activeConfig.server.auth.audience,
      response_type: 'code',
      redirect_uri: activeConfig.server.auth.redirect,
      client_id: activeConfig.server.auth.clientId,
      scope: 'offline_access openid profile email',
      state,
    }).toString();
    res.redirect(authorizationEndpointUrl.toString());
  } catch (e) {
    console.error(`[Authenticate] Couldn't  redirect to auth0`, e.stack);
    res.status(500).send('Could not log you in');
  }
}

export const handleAuthCallback = async (req: express.Request, res: express.Response) => {
  try {
    const code = req.query.code;
    const state = req.query.state;
    if (state !== req.cookies[STATE_COOKIE_NAME]) throw new Error(`Bad nonce '${state}'`);
    const authRes = await fetch(`${activeConfig.server.auth.domain}/oauth/token`, {
      method: 'POST',
      // mode:'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        audience: activeConfig.server.auth.audience,
        client_id: activeConfig.server.auth.clientId,
        client_secret: activeConfig.server.auth.secret,
        code,
        redirect_uri: activeConfig.server.auth.redirect
      }),
    })
    const data =  await authRes.json();
    res.cookie(ACCESS_TOKEN_NAME, data.access_token, {
      httpOnly: true,
      // secure: true,
    });
    res.cookie(REFRESH_TOKEN_NAME, data.refresh_token, {
      httpOnly: true,
      // secure: true,
    });
    res.redirect(`${activeConfig.server.app.url}${state.split('_')[1]}`);
  } catch (e) {
    console.error(`[Authenticate] Couldn't get auth tokens`, e.stack);
    res.status(500).send('Could not log you in');
  }
}