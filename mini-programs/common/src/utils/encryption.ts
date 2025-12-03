/**
 * Encryption Utilities
 * Common encryption and security functions
 */

/**
 * Simple hash function for PID generation
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

/**
 * Generate secure token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Simple XOR encryption (for demo purposes only)
 * In production, use proper encryption libraries
 */
export function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return Buffer.from(result, 'binary').toString('base64');
}

/**
 * Simple XOR decryption
 */
export function xorDecrypt(encrypted: string, key: string): string {
  const text = Buffer.from(encrypted, 'base64').toString('binary');
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Generate signature for handshake token
 */
export function generateSignature(data: Record<string, any>, secret: string): string {
  const sortedKeys = Object.keys(data).sort();
  const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  return hashString(signString + secret);
}

/**
 * Verify signature
 */
export function verifySignature(
  data: Record<string, any>,
  signature: string,
  secret: string
): boolean {
  const expected = generateSignature(data, secret);
  return expected === signature;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'phoneNumber', 'phone'];
  const masked = Array.isArray(data) ? [...data] : { ...data };
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      masked[key] = '***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
}
