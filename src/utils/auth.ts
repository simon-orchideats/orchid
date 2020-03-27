import { activeConfig } from "../config";
import { OutgoingMessage, IncomingMessage } from "http";
import fetch from 'node-fetch';
export const popupSocialAuthCB = '/popup-social-auth-callback'
export const universalAuthCB = '/auth-callback'
export const stateRedirectCookie = 'orchid_state';
export const accessTokenCookie = 'orchid_access';
export const refreshTokenCookie = 'orchid_refresh';

export const setCookie = (res: OutgoingMessage, values: { name: string, value: string }[]) => {
  res.setHeader('Set-Cookie', values.map(({ name, value }) => (
    `${name}=${value}; HttpOnly; path=/`
  )))
}

const getCookie = (req: IncomingMessage) => {
  const cookies: { [key: string]: string } = {};
  req.headers && req.headers.cookie && req.headers.cookie.split(';').forEach(cookie => {
    const parts = cookie.match(/(.*?)=(.*)$/)
    if (!parts) return;
    cookies[parts[1].trim()] = (parts[2] || '').trim();
  });
  return cookies;
};

export const refetchAccessToken = async (req: IncomingMessage, res: OutgoingMessage): Promise<string> => {
  const refresh = getCookie(req)[refreshTokenCookie];
  
  const authRes = await fetch(`https://${activeConfig.server.auth.domain}/oauth/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh,
      client_id: activeConfig.server.auth.clientId,
    }),
  });

  const authJson = await authRes.json();
  if (!authRes.ok) {
    const msg = `Failed to get access with refresh '${refresh}: ${JSON.stringify(authJson)}'`;
    console.error(msg);
    throw new Error(msg);
  }
  setCookie(res, [{
    name: accessTokenCookie,
    value: authJson.access_token,
  }]);
  return authJson.access_token;
}
