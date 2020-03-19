import { activeConfig } from "../../config";
import jwtUtil from 'jsonwebtoken';
import fetch from 'node-fetch';

let auth0ManagementToken: string | null = null;
let tokenType: string | null = null;

const autoSetAuth0ManagementToken = async () => {
  try {
    const authRes = await fetch(`https://${activeConfig.server.auth.domain}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: activeConfig.server.auth.clientId,
        client_secret: activeConfig.server.auth.secret,
        audience: `https://${activeConfig.server.auth.domain}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });
    const json = await authRes.json();
    if (!authRes.ok) {
      const err = `Failed to get auth0 management token. '${JSON.stringify(json)}'`;
      console.error(err);
      throw new Error(err);
    }
    const {
      access_token,
      expires_in: expirationInSeconds,
      token_type
    } = json;

    auth0ManagementToken = access_token as string;
    tokenType = token_type as string;
    setTimeout(autoSetAuth0ManagementToken, expirationInSeconds * 1000);
  } catch (e) {
    console.error('Could not get management token from auth0', e);
  }
}

autoSetAuth0ManagementToken();

const waitForNewAuth0ManagementToken = () => {
  const currToken = auth0ManagementToken;
  const timeoutCount = 5;
  let count = 0;
  return new Promise((resolve, reject) => {
    const poll = setInterval(() => {
      if (currToken !== auth0ManagementToken) {
        clearInterval(poll);
        resolve();
      }

      if (++count === timeoutCount) {
        clearInterval(poll);
        reject('timeout');
      }
    }, 1000)
  });
}

//*1000 because exp is in seconds and Date.now() is in miliseconds
const isTokenValid = () => {
  if (!auth0ManagementToken) return false;
  const decoded = jwtUtil.decode(auth0ManagementToken) as { [key: string]: any; };
  return decoded.exp * 1000 > Date.now();
}

const getAuth0ManagementToken = () => new Promise (async (resolve, reject) => {
  if (isTokenValid()) {
    resolve(auth0ManagementToken)
    return;
  }

  try {
    await waitForNewAuth0ManagementToken();
    resolve(auth0ManagementToken);
  } catch (e) {
    reject(e);
  }
});

export const getAuth0Header = async () => {
  const token = await getAuth0ManagementToken();
  return {
    authorization: tokenType + ' ' + token,
    'Content-Type': 'application/json',
  }
}


