import { OutgoingMessage } from 'http';
import { decodeToSignedInUser } from './../../utils/apolloUtils';
import { universalAuthCB, popupSocialAuthCB, stateRedirectCookie, accessTokenCookie, refreshTokenCookie, setCookie } from './../../utils/auth';
import { getConsumerService } from './../consumer/consumerService';
import { randomString } from './utils';
import express from 'express';
import { activeConfig } from '../../config';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

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

const redirectedSignIn = async (
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
      console.error(`Error in verifying accessToken: ${e.stack}`)
      throw e
    }
    let consumer;
    try {
      consumer = await getConsumerService().getConsumer(decodedToken.sub)
    } catch (e) {
      console.error(`Error in getting Consumer: ${e.stack}`);
      throw e;
    }

    if (!consumer) {
      const email = decodedToken[`${activeConfig.server.auth.audience}/email`];
      const name = decodedToken[`${activeConfig.server.auth.audience}/name`];
      getConsumerService().insertConsumer(
        decodedToken.sub,
        name,
        email
      ).catch(e => {
        console.error(`[Authenticate] Error in inserting Consumer: ${e.stack}`);
      });
      getConsumerService().upsertMarketingEmail(email, name);
    };
    
    setCookie(res, [
      {
        name: accessTokenCookie,
        value: data.access_token,
      },
      {
        name: refreshTokenCookie,
        value: data.refresh_token,
      }
    ])
    return data
  } catch (e) {
    console.error(`[Authenticate] Couldn't get auth tokens`, e.stack);
    throw e;
  }
}

export const handleAuthCallback = async (req: express.Request, res: express.Response) => {
  try {
    const state = req.cookies[stateRedirectCookie];
    await redirectedSignIn(req, res, state, `${activeConfig.server.app.url}${universalAuthCB}`);
    res.redirect(`${activeConfig.server.app.url}${state.split('_')[1]}`);
  } catch (e) {
    console.error(`[Authenticate] Couldn't handle auth callback`, e.stack);
    res.status(500).send('Could not log you in');
  }
}

export const handlePopupSocialAuth = async (req: express.Request, res: express.Response) => {
  try {
    const state = JSON.parse(req.cookies[`com.auth0.auth.${req.query.state}`]).state;
    const {
      access_token,
      id_token,
      scope,
      expires_in,
      token_type,
    } = await redirectedSignIn(req, res, state, `${activeConfig.server.app.url}${popupSocialAuthCB}`);

    // redirect so popup window has data in url to pass back to parent window
    res.redirect(`${activeConfig.server.app.url}/popup-auth`
      + `#access_token=${access_token}`
      + `&scope=${scope}`
      + `&expires_in=${expires_in}`
      + `&token_type=${token_type}`
      + `&state=${state}`
      + `&id_token=${id_token}`
    );
  } catch (e) {
    console.error(`[Authenticate] Couldn't handle popup auth callback`, e.stack);
    res.status(500).send('Could not log you in');
  }
}

export const manualAuthSignUp = async (
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
  setCookie(res, [
    {
      name: accessTokenCookie,
      value: authJson.access_token,
    },
    {
      name: refreshTokenCookie,
      value: authJson.refresh_token,
    }
  ])
  return {
    res: decodeToSignedInUser(authJson.access_token),
    error: null,
  };
}