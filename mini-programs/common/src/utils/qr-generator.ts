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
 */
export function encodeHandshakeData(data: any): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Decode handshake data from QR string
 */
export function decodeHandshakeData(qrData: string): any {
  try {
    const json = Buffer.from(qrData, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (error) {
    throw new Error('Invalid QR code data');
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
