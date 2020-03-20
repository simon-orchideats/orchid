import { universalAuthCB, checkoutSocialAuthCB, stateRedirectCookie, accessTokenCookie, refreshTokenCookie } from './../../utils/auth';
import { getConsumerService } from './../consumer/consumerService';
import { randomString } from './utils';
import express, { NextFunction } from 'express';
import { activeConfig } from '../../config';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { OutgoingMessage } from 'http';

export const handleLoginRoute = (req: express.Request, res: express.Response) => {
  try {
    const re = req.query.redirect;
    const state = randomString(32) + '_' + re
    const oneMinMilis = 60000;
    res.cookie(stateRedirectCookie, state, {
      httpOnly: true,
      // secure: true, // turned off because we use ssl in prod and don't use in local
      maxAge: oneMinMilis,
    });
    const authorizationEndpointUrl = new URL(`https://${activeConfig.server.auth.domain}/authorize`);
    authorizationEndpointUrl.search = new URLSearchParams({
      audience: activeConfig.server.auth.audience,
      response_type: 'code',
      redirect_uri: `${activeConfig.server.app.url}${universalAuthCB}`,
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

const storeTokensInCookies = async (
  req: express.Request,
  res: OutgoingMessage,
  stateRedirectCookie: string,
  redirect_uri: string
) => {
  try {
    const code = req.query.code;
    const state = req.query.state;
    if (state !== stateRedirectCookie) throw new Error(`Bad nonce '${state}'`);
    const authRes = await fetch(`https://${activeConfig.server.auth.domain}/oauth/token`, {
      method: 'POST',
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
        redirect_uri,
      }),
    });
    // todo alvin, decode access and insert consumer here
    const data =  await authRes.json();
    if (!authRes.ok) {
      const msg = `Token retrieval failed. '${JSON.stringify(data)}'`;
      console.error(msg);
      throw new Error(msg)
    }
    
    let decodedToken: any;
    try {
      decodedToken = await jwt.verify(data.access_token, activeConfig.server.auth.publicKey, { algorithms: ['RS256'] });
    } catch (e) {
      console.error(`[Authenticate] Error in verifying accessToken: ${e.stack}`)
      throw e
    }
    try {
      let consumerExists = await getConsumerService().getConsumer(decodedToken.sub)
      if (!consumerExists) {
        try {
          getConsumerService().insertConsumer(
            decodedToken.sub,
            decodedToken[`${activeConfig.server.auth.audience}/name`],
            decodedToken[`${activeConfig.server.auth.audience}/email`]
          );
        } catch(e) {
          console.error(`[Authenticate] Error in inserting Consumer: ${e.stack}`);
          throw e;
        }
      };
    } catch (e) {
      console.error(`[Authenticate] Error in getting Consumer: ${e.stack}`);
      throw e;
    }
    
    res.setHeader('Set-Cookie', [
      `${accessTokenCookie}=${data.access_token}; HttpOnly`,
      `${refreshTokenCookie}=${data.refresh_token}; HttpOnly`
    ])
  } catch (e) {
    console.error(`[Authenticate] Couldn't get auth tokens`, e.stack);
    throw e;
  }
}

export const handleAuthCallback = async (req: express.Request, res: express.Response) => {
  try {
    const state = req.cookies[stateRedirectCookie];
    await storeTokensInCookies(req, res, state, `${activeConfig.server.app.url}${universalAuthCB}`);
    res.redirect(`${activeConfig.server.app.url}${state.split('_')[1]}`);
  } catch (e) {
    console.error(`[Authenticate] Couldn't handle auth callback`, e.stack);
    res.status(500).send('Could not log you in');
  }
}

export const handleCheckoutSocialAuth = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const state = JSON.parse(req.cookies[`com.auth0.auth.${req.query.state}`]).state;
    await storeTokensInCookies(req, res, state, `${activeConfig.server.app.url}${checkoutSocialAuthCB}`);
    next();
  } catch (e) {
    console.error(`[Authenticate] Couldn't handle checkout auth callback`, e.stack);
    res.status(500).send('Could not log you in');
  }
}

export const signUp = async (
  email: string,
  name: string,
  password: string,
  res: OutgoingMessage
) => {
  const signUpRes = await fetch(`https://${activeConfig.server.auth.domain}/dbconnections/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      name,
      audience: activeConfig.server.auth.audience,
      connection: 'Username-Password-Authentication',
      client_id: activeConfig.server.auth.clientId,
    }),
  });
  const json = await signUpRes.json();
  if (!signUpRes.ok) {
    if (json.name === 'PasswordStrengthError') {
      const warn: string = json.message + '\n' + json.policy;
      console.warn(warn);
      return {
        res: null,
        error: warn,
      }
    }
    if (json.code === 'user_exists') {
      const warn: string = json.description;
      console.warn(warn);
      return {
        res: null,
        error: warn,
      }
    }
    const err = `Sign up failed. '${JSON.stringify(json)}'`;
    console.error(err);
    throw new Error(err);
  }

  const signInRes = await fetch(`https://${activeConfig.server.auth.domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'password',
      username: email,
      password,
      audience: activeConfig.server.auth.audience,
      connection: 'Username-Password-Authentication',
      scope: 'openid email profile offline_access',
      client_id: activeConfig.server.auth.clientId,
    }),
  })

  const authJson = await signInRes.json();
  if (!signInRes.ok) {
    const msg = `Sign in failed. '${JSON.stringify(authJson)}'`;
    console.error(msg);
    throw new Error(msg);
  }
  res.setHeader('Set-Cookie', [
    `${accessTokenCookie}=${authJson.access_token}; HttpOnly`,
    `${refreshTokenCookie}=${authJson.refresh_token}; HttpOnly`
  ]);
  return {
    res: {},
    error: null,
  };
}