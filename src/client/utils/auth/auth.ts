import { activeConfig } from '../../../config';
import { getCurrentURL } from '../getCurrentURL';

const REFRESH_TOKEN_IDENTIFIER = 'REFRESH_TOKEN';
const CODE_VERIFIER_IDENTIFIER = 'CODE_VERIFIER';

/**
 * Takes a base64 encoded string and returns a url encoded string
 * by replacing the characters + and / with -, _ respectively,
 * and removing the = (fill) character.
 *
 * @param {String} input base64 encoded string.
 * @returns {String}
 */
const urlEncodeB64 = (input:string) => {
  const b64Chars:any = {'+': '-', '/': '_', '=': ''};
  return input.replace(/[\+\/=]/g, m => b64Chars[m]);;
}

/**
 * Takes an ArrayBuffer and convert it to Base64 url encoded string.
 * @param {ArrayBuffer} input
 * @returns {String}
 */
 export const bufferToBase64UrlEncoded = (input:ArrayBuffer) => {
  const bytes = new Uint8Array(input);
  return urlEncodeB64(window.btoa(String.fromCharCode(...bytes)));
}

/**
 * Returns the sha256 digst of a given message.
 * This function is async.
 *
 * @param {String} message
 * @returns {Promise<ArrayBuffer>}
 */
 export const sha256 = (message:string | undefined) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return window.crypto.subtle.digest('SHA-256', data);
}

 export const urlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams;
};

/**
 * Generates a cryptographically secure random string
 * of variable length.
 *
 * The returned string is also url-safe.
 *
 * @param {Number} length the length of the random string.
 * @returns {String}
 */
 export const randomString = (length:number) => {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  array = array.map(x => validChars.charCodeAt(x % validChars.length));
  return String.fromCharCode(...array);
}

export const getTokens = async () => {
  try {
    let res = await fetch(`${activeConfig.authorization.domain}/oauth/token`, {
      method: 'POST',
      mode:'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        audience: activeConfig.authorization.audience,
        client_id: activeConfig.authorization.clientId,
        code_verifier: sessionStorage.getItem(CODE_VERIFIER_IDENTIFIER),
        code: urlParams().get('code'),
        redirect_uri: getCurrentURL()
      }),
    })
    const data =  await res.json();
    return data;
  } catch(err) {
    console.error(err);
  }
}

export const getAccessToken = async () => {
  try { 
    let res = await fetch(`${activeConfig.authorization.domain}/oauth/token`, {
      method: 'POST',
      mode:'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: activeConfig.authorization.clientId,
        refresh_token: window.localStorage[REFRESH_TOKEN_IDENTIFIER]
      }),
    });
    let data = await res.json();
    return data;
   } catch (err) {
     console.error(err);
   }
 };

export const needsRedirect = () => {
  const hasSignedInUser = window.localStorage[REFRESH_TOKEN_IDENTIFIER];
  return !hasSignedInUser && !sessionStorage.getItem(CODE_VERIFIER_IDENTIFIER)
}

export const authRedirect = async () => {
  const codeVerifier= randomString(32);
  const authorizationEndpointUrl = new URL(`${activeConfig.authorization.domain}/authorize`);
  sessionStorage.setItem(CODE_VERIFIER_IDENTIFIER, codeVerifier);
  const res = await sha256(codeVerifier);
  const codeChallenge= bufferToBase64UrlEncoded(res);
  authorizationEndpointUrl.search = new URLSearchParams({
    response_type: 'code',
    redirect_uri: getCurrentURL(),
    client_id: activeConfig.authorization.clientId,
    scope: activeConfig.authorization.scope,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: randomString(32)
  }).toString();
  window.location.assign(authorizationEndpointUrl.toString());
}

export const attemptLogin = async () => {
  if (urlParams().get('code')) {
    let data = await getTokens();
    if (data.refresh_token){
      window.localStorage.setItem(REFRESH_TOKEN_IDENTIFIER, data.refresh_token);
      window.sessionStorage.removeItem(CODE_VERIFIER_IDENTIFIER);
    }
    console.log(data);
  } else if (window.localStorage.getItem(REFRESH_TOKEN_IDENTIFIER)) {
    let data = await getAccessToken();
    console.log(data);
  }
}
 