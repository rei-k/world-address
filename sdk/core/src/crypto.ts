/**
 * @vey/core - Crypto module
 * 
 * End-to-end encryption, signing, and key management utilities.
 */

/**
 * Result of encryption operation
 */
export interface EncryptionResult {
  ciphertext: string;  // Base64 encoded ciphertext
  iv: string;          // Base64 encoded initialization vector
  authTag?: string;    // Base64 encoded authentication tag (for GCM)
  algorithm: string;   // Algorithm used
}

/**
 * Encrypts address data using AES-256-GCM
 * 
 * @param plaintext - Plain text to encrypt
 * @param key - Encryption key (base64 or raw string)
 * @returns Encryption result with ciphertext and metadata
 * 
 * @example
 * ```ts
 * const encrypted = await encryptAddress(
 *   JSON.stringify(addressData),
 *   userPrivateKey
 * );
 * console.log(encrypted.ciphertext);
 * ```
 */
export async function encryptAddress(
  plaintext: string,
  key: string
): Promise<EncryptionResult> {
  // For browser environment
  if (typeof window !== 'undefined' && window.crypto) {
    return encryptAddressBrowser(plaintext, key);
  }
  
  // For Node.js environment
  return encryptAddressNode(plaintext, key);
}

/**
 * Decrypts address data
 * 
 * @param ciphertext - Encrypted data (base64)
 * @param iv - Initialization vector (base64)
 * @param key - Decryption key
 * @param authTag - Authentication tag (optional, for GCM)
 * @returns Decrypted plaintext
 * 
 * @example
 * ```ts
 * const decrypted = await decryptAddress(
 *   encrypted.ciphertext,
 *   encrypted.iv,
 *   userPrivateKey,
 *   encrypted.authTag
 * );
 * const address = JSON.parse(decrypted);
 * ```
 */
export async function decryptAddress(
  ciphertext: string,
  iv: string,
  key: string,
  authTag?: string
): Promise<string> {
  // For browser environment
  if (typeof window !== 'undefined' && window.crypto) {
    return decryptAddressBrowser(ciphertext, iv, key, authTag);
  }
  
  // For Node.js environment
  return decryptAddressNode(ciphertext, iv, key, authTag);
}

/**
 * Signs data using private key
 * 
 * @param data - Data to sign
 * @param privateKey - Private key (base64 or raw)
 * @returns Base64 encoded signature
 */
export async function signData(
  data: string,
  privateKey: string
): Promise<string> {
  // Simplified implementation - in production would use proper crypto library
  // like @noble/ed25519 or tweetnacl
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = encoder.encode(privateKey);
  
  // Create a simple hash-based signature (NOT SECURE for production!)
  // In production, use Ed25519 or ECDSA
  const combined = new Uint8Array(dataBuffer.length + keyBuffer.length);
  combined.set(dataBuffer);
  combined.set(keyBuffer, dataBuffer.length);
  
  let hashBuffer: ArrayBuffer;
  if (typeof window !== 'undefined' && window.crypto) {
    hashBuffer = await window.crypto.subtle.digest('SHA-256', combined);
  } else {
    // Node.js
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.from(combined));
    hashBuffer = hash.digest();
  }
  
  return bufferToBase64(new Uint8Array(hashBuffer));
}

/**
 * Verifies a signature
 * 
 * @param data - Original data
 * @param signature - Signature to verify (base64)
 * @param publicKey - Public key (base64 or raw)
 * @returns true if signature is valid
 */
export async function verifySignature(
  data: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  // Simplified implementation
  // In production, use proper signature verification
  
  try {
    const recomputed = await signData(data, publicKey);
    return recomputed === signature;
  } catch {
    return false;
  }
}

/**
 * Generates a random encryption key
 * 
 * @param length - Key length in bytes (default: 32 for AES-256)
 * @returns Base64 encoded key
 */
export function generateKey(length: number = 32): string {
  const key = new Uint8Array(length);
  
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(key);
  } else {
    // Node.js
    const crypto = require('crypto');
    crypto.randomFillSync(key);
  }
  
  return bufferToBase64(key);
}

/**
 * Hashes data using SHA-256
 * 
 * @param data - Data to hash
 * @returns Base64 encoded hash
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  let hashBuffer: ArrayBuffer;
  if (typeof window !== 'undefined' && window.crypto) {
    hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
  } else {
    // Node.js
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.from(dataBuffer));
    hashBuffer = hash.digest();
  }
  
  return bufferToBase64(new Uint8Array(hashBuffer));
}

// ============================================================================
// Browser-specific implementations
// ============================================================================

async function encryptAddressBrowser(
  plaintext: string,
  key: string
): Promise<EncryptionResult> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Import key - ensure proper type for ArrayBuffer
  const keyData = base64ToBuffer(key);
  const keyBuffer = keyData.buffer.slice(0);  // Create proper ArrayBuffer
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Encrypt
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    cryptoKey,
    data
  );
  
  return {
    ciphertext: bufferToBase64(new Uint8Array(encrypted)),
    iv: bufferToBase64(iv),
    algorithm: 'AES-256-GCM',
  };
}

async function decryptAddressBrowser(
  ciphertext: string,
  iv: string,
  key: string,
  authTag?: string
): Promise<string> {
  const cipherBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(iv);
  const keyData = base64ToBuffer(key);
  
  // Import key - ensure proper type for ArrayBuffer
  const keyBuffer = keyData.buffer.slice(0);  // Create proper ArrayBuffer
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // Decrypt - ensure proper types
  const ivArr = ivBuffer.buffer.slice(0);
  const cipherArr = cipherBuffer.buffer.slice(0);
  
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivArr as ArrayBuffer,
    },
    cryptoKey,
    cipherArr as ArrayBuffer
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// ============================================================================
// Node.js-specific implementations
// ============================================================================

function encryptAddressNode(
  plaintext: string,
  key: string
): EncryptionResult {
  const crypto = require('crypto');
  
  // Generate IV
  const iv = crypto.randomBytes(12);
  
  // Derive key from input
  const keyBuffer = Buffer.from(key.slice(0, 32).padEnd(32, '0'));
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return {
    ciphertext: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    algorithm: 'AES-256-GCM',
  };
}

function decryptAddressNode(
  ciphertext: string,
  iv: string,
  key: string,
  authTag?: string
): string {
  const crypto = require('crypto');
  
  // Derive key from input
  const keyBuffer = Buffer.from(key.slice(0, 32).padEnd(32, '0'));
  const ivBuffer = Buffer.from(iv, 'base64');
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
  
  // Set auth tag if provided
  if (authTag) {
    const authTagBuffer = Buffer.from(authTag, 'base64');
    decipher.setAuthTag(authTagBuffer);
  }
  
  // Decrypt
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// ============================================================================
// Utility functions
// ============================================================================

function bufferToBase64(buffer: Uint8Array): string {
  if (typeof window !== 'undefined') {
    // Browser
    const binary = String.fromCharCode(...buffer);
    return btoa(binary);
  } else {
    // Node.js
    return Buffer.from(buffer).toString('base64');
  }
}

function base64ToBuffer(base64: string): Uint8Array {
  if (typeof window !== 'undefined') {
    // Browser
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
  } else {
    // Node.js
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
}
