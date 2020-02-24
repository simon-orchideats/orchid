import crypto from 'crypto';

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
  crypto.randomFillSync(array);
  array = array.map(x => validChars.charCodeAt(x % validChars.length));
  return String.fromCharCode(...array);
}
