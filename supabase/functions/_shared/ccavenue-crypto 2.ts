/**
 * CCAvenue Encryption/Decryption Utilities
 * CCAvenue uses AES-256-CBC encryption with PKCS7 padding
 */

import { createHash, createCipheriv, createDecipheriv } from 'node:crypto';

/**
 * Encrypt data for CCAvenue
 * @param plainText - Data to encrypt
 * @param workingKey - CCAvenue working key
 * @returns Encrypted hex string
 */
export function encrypt(plainText: string, workingKey: string): string {
  try {
    const m = createHash('md5');
    m.update(workingKey);
    const key = m.digest();

    const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
    const cipher = createCipheriv('aes-128-cbc', key, iv);

    let encoded = cipher.update(plainText, 'utf8', 'hex');
    encoded += cipher.final('hex');

    return encoded;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt CCAvenue response
 * @param encText - Encrypted hex string from CCAvenue
 * @param workingKey - CCAvenue working key
 * @returns Decrypted plain text
 */
export function decrypt(encText: string, workingKey: string): string {
  try {
    const m = createHash('md5');
    m.update(workingKey);
    const key = m.digest();

    const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
    const decipher = createDecipheriv('aes-128-cbc', key, iv);

    let decoded = decipher.update(encText, 'hex', 'utf8');
    decoded += decipher.final('utf8');

    return decoded;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Parse CCAvenue response string into object
 * Response format: key1=value1&key2=value2&key3=value3
 */
export function parseResponse(responseString: string): Record<string, string> {
  const params: Record<string, string> = {};

  const pairs = responseString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  }

  return params;
}

/**
 * Convert object to CCAvenue request string
 * Format: key1=value1&key2=value2&key3=value3
 */
export function stringifyRequest(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}
