
import { activeConfig } from '../../config';
import { getCurrentURL } from './getCurrentURL'
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
  let bytes = new Uint8Array(input);
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
  let encoder = new TextEncoder();
  let data = encoder.encode(message);
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
            code_verifier: sessionStorage.getItem('codeVerifier'),
            code: urlParams().get('code'),
            redirect_uri: getCurrentURL()
          }),
        })
        const data =  await res.json();
        return data;
    } catch(err) {
      console.log(err);
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
         refresh_token: window.localStorage.REFRESH_TOKEN
       }),
     });

    let data = await res.json();
    return data;

   } catch (err) {
     console.log(err);
   }
 };

 export const needsLogin = () => {
   if (urlParams().get('code')) {
     return true
   }
   return false;
 }

 export const canLogin = () => {
   if (window.localStorage.getItem('REFRESH_TOKEN')) {
     return true;
   }
   return false
 }