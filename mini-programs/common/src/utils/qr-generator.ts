/**
 * QR Code Generator
 * Common QR code generation utilities
 */

import { HandshakeToken } from '../types';
import { generateSignature } from './encryption';

/**
 * Generate QR code data for handshake
 */
export function generateHandshakeQRData(
  waybillNumber: string,
  pickupId: string,
  secret: string
): HandshakeToken {
  const timestamp = Date.now();
  const data = {
    waybillNumber,
    pickupId,
    timestamp,
  };
  
  const signature = generateSignature(data, secret);
  const qrData = encodeHandshakeData({ ...data, signature });
  
  return {
    waybillNumber,
    pickupId,
    timestamp,
    signature,
    qrData,
  };
}

/**
 * Encode handshake data to QR string
 * Note: Uses btoa for cross-platform compatibility
 */
export function encodeHandshakeData(data: any): string {
  const jsonString = JSON.stringify(data);
  // Use btoa for browser/mini-program compatibility instead of Buffer
  if (typeof btoa !== 'undefined') {
    return btoa(jsonString);
  }
  // Fallback for Node.js environments (testing)
  return typeof Buffer !== 'undefined' 
    ? Buffer.from(jsonString).toString('base64')
    : jsonString;
}

/**
 * Decode handshake data from QR string
 * Note: Uses atob for cross-platform compatibility
 */
export function decodeHandshakeData(qrData: string): any {
  try {
    // Use atob for browser/mini-program compatibility instead of Buffer
    let json: string;
    if (typeof atob !== 'undefined') {
      json = atob(qrData);
    } else if (typeof Buffer !== 'undefined') {
      // Fallback for Node.js environments (testing)
      json = Buffer.from(qrData, 'base64').toString('utf8');
    } else {
      json = qrData;
    }
    return JSON.parse(json);
  } catch (error) {
    throw new Error('INVALID_QR_DATA');
  }
}

/**
 * Generate NFC data payload
 */
export function generateNFCPayload(token: HandshakeToken): string {
  return `VEY:${token.qrData}`;
}

/**
 * Parse NFC data payload
 */
export function parseNFCPayload(payload: string): HandshakeToken | null {
  if (!payload.startsWith('VEY:')) return null;
  
  const qrData = payload.substring(4);
  try {
    const decoded = decodeHandshakeData(qrData);
    return decoded as HandshakeToken;
  } catch {
    return null;
  }
}

/**
 * Generate tracking QR code data
 */
export function generateTrackingQRData(waybillNumber: string): string {
  return JSON.stringify({
    type: 'TRACKING',
    waybillNumber,
    timestamp: Date.now(),
  });
}

/**
 * Validate QR code format
 */
export function isValidQRData(qrData: string): boolean {
  try {
    decodeHandshakeData(qrData);
    return true;
  } catch {
    return false;
  }
}
