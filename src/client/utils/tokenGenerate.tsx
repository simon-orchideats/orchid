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