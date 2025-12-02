/**
 * Handshake Token Generator and Validator
 * For QR/NFC-based pickup and delivery confirmation
 */

import crypto from 'crypto';
import { HandshakeToken, TokenVerification } from '../types';

export class HandshakeTokenGenerator {
  private usedNonces: Set<string> = new Set();
  private privateKey: string;
  private publicKey: string;

  constructor(privateKey: string, publicKey: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  /**
   * Generate a new handshake token
   */
  generateToken(
    waybillNumber: string,
    orderId: string,
    carrierCode: string,
    type: 'PICKUP' | 'DELIVERY',
    expiresIn: number = 3600000, // 1 hour default
    metadata?: Record<string, any>
  ): HandshakeToken {
    const timestamp = Date.now();
    const nonce = this.generateNonce();

    const token: HandshakeToken = {
      version: '1.0',
      type,
      waybillNumber,
      orderId,
      carrierCode,
      timestamp,
      expiresAt: timestamp + expiresIn,
      nonce,
      signature: '',
      metadata
    };

    // Sign the token
    token.signature = this.signToken(token);

    return token;
  }

  /**
   * Verify a handshake token
   */
  verifyToken(tokenString: string): TokenVerification {
    try {
      const token: HandshakeToken = JSON.parse(
        Buffer.from(tokenString, 'base64').toString('utf8')
      );

      // 1. Check expiration
      if (Date.now() > token.expiresAt) {
        return { valid: false, reason: 'TOKEN_EXPIRED' };
      }

      // 2. Verify signature
      const expectedSignature = this.signToken(token);
      if (token.signature !== expectedSignature) {
        return { valid: false, reason: 'INVALID_SIGNATURE' };
      }

      // 3. Check nonce (prevent replay attacks)
      if (this.usedNonces.has(token.nonce)) {
        return { valid: false, reason: 'NONCE_REUSED' };
      }

      // Mark nonce as used
      this.usedNonces.add(token.nonce);
      
      // Clean up old nonces periodically
      this.cleanupExpiredNonces();

      return { valid: true, token };
    } catch (error) {
      return { valid: false, reason: 'INVALID_TOKEN' };
    }
  }

  /**
   * Encode token to base64 string (for QR code)
   */
  encodeToken(token: HandshakeToken): string {
    return Buffer.from(JSON.stringify(token)).toString('base64');
  }

  /**
   * Decode token from base64 string
   */
  decodeToken(tokenString: string): HandshakeToken | null {
    try {
      return JSON.parse(
        Buffer.from(tokenString, 'base64').toString('utf8')
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Sign a token using HMAC-SHA256
   */
  private signToken(token: HandshakeToken): string {
    const dataToSign = {
      version: token.version,
      type: token.type,
      waybillNumber: token.waybillNumber,
      orderId: token.orderId,
      carrierCode: token.carrierCode,
      timestamp: token.timestamp,
      expiresAt: token.expiresAt,
      nonce: token.nonce,
      metadata: token.metadata
    };

    const hmac = crypto.createHmac('sha256', this.privateKey);
    hmac.update(JSON.stringify(dataToSign));
    return hmac.digest('hex');
  }

  /**
   * Generate a cryptographically secure nonce
   */
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Clean up expired nonces to prevent memory leak
   */
  private cleanupExpiredNonces(): void {
    // In production, this should use a time-based cleanup mechanism
    // For now, just limit the size
    if (this.usedNonces.size > 10000) {
      // Clear half of the nonces (simple LRU-like strategy)
      const noncesArray = Array.from(this.usedNonces);
      this.usedNonces = new Set(noncesArray.slice(5000));
    }
  }

  /**
   * Generate QR code data URL from token
   */
  static async generateQRCodeDataURL(token: HandshakeToken): Promise<string> {
    const tokenString = Buffer.from(JSON.stringify(token)).toString('base64');
    
    // In real implementation, use a QR code library like 'qrcode'
    // This is a placeholder
    return `data:image/png;base64,${tokenString}`;
  }

  /**
   * Generate NFC NDEF message from token
   */
  static generateNDEFMessage(token: HandshakeToken): any {
    return {
      records: [
        {
          recordType: 'text',
          data: Buffer.from(JSON.stringify(token)).toString('base64')
        }
      ]
    };
  }
}

/**
 * Convenience function to create a pickup token
 */
export function createPickupToken(
  waybillNumber: string,
  orderId: string,
  carrierCode: string,
  privateKey: string,
  publicKey: string
): string {
  const generator = new HandshakeTokenGenerator(privateKey, publicKey);
  const token = generator.generateToken(
    waybillNumber,
    orderId,
    carrierCode,
    'PICKUP'
  );
  return generator.encodeToken(token);
}

/**
 * Convenience function to create a delivery token
 */
export function createDeliveryToken(
  waybillNumber: string,
  orderId: string,
  carrierCode: string,
  privateKey: string,
  publicKey: string
): string {
  const generator = new HandshakeTokenGenerator(privateKey, publicKey);
  const token = generator.generateToken(
    waybillNumber,
    orderId,
    carrierCode,
    'DELIVERY'
  );
  return generator.encodeToken(token);
}

/**
 * Convenience function to verify a token
 */
export function verifyHandshakeToken(
  tokenString: string,
  privateKey: string,
  publicKey: string
): TokenVerification {
  const generator = new HandshakeTokenGenerator(privateKey, publicKey);
  return generator.verifyToken(tokenString);
}
