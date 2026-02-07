/**
 * CCAvenue Encryption/Decryption Utilities - Deno Compatible
 * CCAvenue uses AES-128-CBC encryption with PKCS7 padding
 */

import { createHash } from 'node:crypto';

/**
 * MD5 hash function for Deno using Node.js crypto
 */
function md5(data: string): Uint8Array {
  const hash = createHash('md5');
  hash.update(data);
  return new Uint8Array(hash.digest());
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * PKCS7 padding
 */
function pkcs7Pad(data: Uint8Array, blockSize: number): Uint8Array {
  const padding = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + padding);
  padded.set(data);
  for (let i = data.length; i < padded.length; i++) {
    padded[i] = padding;
  }
  return padded;
}

/**
 * PKCS7 unpadding
 */
function pkcs7Unpad(data: Uint8Array): Uint8Array {
  const padding = data[data.length - 1];
  return data.slice(0, data.length - padding);
}

/**
 * Encrypt data for CCAvenue
 * @param plainText - Data to encrypt
 * @param workingKey - CCAvenue working key
 * @returns Encrypted hex string
 */
export async function encrypt(plainText: string, workingKey: string): Promise<string> {
  try {
    console.log('🔐 Starting encryption...');
    console.log('📝 Plaintext length:', plainText.length);
    console.log('🔑 Working key length:', workingKey.length);
    console.log('📄 Plaintext preview:', plainText.substring(0, 100) + '...');
    
    // Generate MD5 hash of working key
    const key = md5(workingKey);
    console.log('🔑 MD5 key generated, length:', key.length);

    // Fixed IV as per CCAvenue specification
    const iv = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);

    // Convert plaintext to bytes (Web Crypto API handles PKCS7 padding automatically)
    const encoder = new TextEncoder();
    const plainBytes = encoder.encode(plainText);
    console.log('📦 Plain bytes length:', plainBytes.length);

    // Import key for AES-128-CBC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC', length: 128 },
      false,
      ['encrypt']
    );

    // Encrypt (AES-CBC automatically applies PKCS7 padding)
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      plainBytes
    );

    // Convert to hex string
    const hexResult = bytesToHex(new Uint8Array(encrypted));
    console.log('✅ Encryption successful, hex length:', hexResult.length);
    return hexResult;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt CCAvenue response
 * @param encText - Encrypted hex string from CCAvenue
 * @param workingKey - CCAvenue working key
 * @returns Decrypted plain text
 */
export async function decrypt(encText: string, workingKey: string): Promise<string> {
  try {
    console.log('🔓 Starting decryption...');
    console.log('📝 Encrypted text length:', encText.length);
    
    // Generate MD5 hash of working key
    const key = md5(workingKey);

    // Fixed IV as per CCAvenue specification
    const iv = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);

    // Convert hex string to bytes
    const encBytes = hexToBytes(encText);
    console.log('📦 Encrypted bytes length:', encBytes.length);

    // Import key for AES-128-CBC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC', length: 128 },
      false,
      ['decrypt']
    );

    // Decrypt (AES-CBC automatically removes PKCS7 padding)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      encBytes
    );

    // Convert to string
    const decoder = new TextDecoder();
    const result = decoder.decode(decrypted);
    console.log('✅ Decryption successful, result length:', result.length);
    return result;
  } catch (error) {
    console.error('❌ Decryption error:', error);
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
 * Note: CCAvenue expects plain text values, NOT URL-encoded
 */
export function stringifyRequest(params: Record<string, string | number>): string {
  const result = Object.entries(params)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');
  console.log('🔗 Request string created, length:', result.length);
  return result;
}
