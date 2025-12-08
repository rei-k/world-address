/**
 * Browser-compatible crypto utilities for WebAuthn
 */

/**
 * Convert ArrayBuffer to base64url string
 */
export function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  // Convert base64 to base64url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convert base64url string to ArrayBuffer
 */
export function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  // Convert base64url to base64
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert UTF-8 string to ArrayBuffer
 */
export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * Convert ArrayBuffer to UTF-8 string
 */
export function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

/**
 * Generate cryptographically secure random bytes
 */
export function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generate random challenge for WebAuthn operations
 */
export function generateChallenge(length: number = 32): ArrayBuffer {
  return generateRandomBytes(length).buffer;
}

/**
 * SHA-256 hash function
 */
export async function sha256(data: ArrayBuffer | string): Promise<ArrayBuffer> {
  const buffer = typeof data === 'string' ? stringToArrayBuffer(data) : data;
  return await crypto.subtle.digest('SHA-256', buffer);
}

/**
 * WebAuthn Crypto utilities class
 */
export class WebAuthnCrypto {
  /**
   * Convert credential ID to base64url
   */
  static credentialIdToBase64url(credentialId: ArrayBuffer): string {
    return arrayBufferToBase64url(credentialId);
  }

  /**
   * Convert base64url to credential ID
   */
  static base64urlToCredentialId(base64url: string): ArrayBuffer {
    return base64urlToArrayBuffer(base64url);
  }

  /**
   * Generate WebAuthn challenge
   */
  static generateChallenge(length: number = 32): ArrayBuffer {
    return generateChallenge(length);
  }

  /**
   * Generate challenge as base64url string
   */
  static generateChallengeBase64url(length: number = 32): string {
    return arrayBufferToBase64url(generateChallenge(length));
  }

  /**
   * Parse client data JSON from base64url
   */
  static parseClientDataJSON(clientDataJSON: string): {
    type: string;
    challenge: string;
    origin: string;
    crossOrigin?: boolean;
  } {
    const buffer = base64urlToArrayBuffer(clientDataJSON);
    const json = arrayBufferToString(buffer);
    return JSON.parse(json);
  }

  /**
   * Verify challenge in client data
   */
  static verifyChallengeInClientData(
    clientDataJSON: string,
    expectedChallenge: string
  ): boolean {
    try {
      const clientData = this.parseClientDataJSON(clientDataJSON);
      return clientData.challenge === expectedChallenge;
    } catch {
      return false;
    }
  }

  /**
   * Verify origin in client data
   */
  static verifyOriginInClientData(
    clientDataJSON: string,
    expectedOrigin: string
  ): boolean {
    try {
      const clientData = this.parseClientDataJSON(clientDataJSON);
      return clientData.origin === expectedOrigin;
    } catch {
      return false;
    }
  }

  /**
   * Parse attestation object (basic parser)
   */
  static parseAttestationObject(attestationObject: string): {
    fmt: string;
    authData: ArrayBuffer;
    attStmt: unknown;
  } {
    const buffer = base64urlToArrayBuffer(attestationObject);
    // Note: Full CBOR parsing would require a CBOR library
    // This is a simplified version for demonstration
    // In production, use a proper CBOR parser like 'cbor' or '@levischuck/cbor'
    return {
      fmt: 'packed',
      authData: buffer,
      attStmt: {},
    };
  }

  /**
   * Hash data with SHA-256 and return base64url
   */
  static async hashBase64url(data: ArrayBuffer | string): Promise<string> {
    const hash = await sha256(data);
    return arrayBufferToBase64url(hash);
  }
}
