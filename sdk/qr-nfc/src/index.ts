/**
 * @vey/qr-nfc - QR code and NFC utilities for address handling
 *
 * Features:
 * - Address Proof QR API
 * - NFC quick-tap address register
 * - Zero-knowledge existence proof with cryptographic security
 * - Pedersen commitment scheme for ZKP
 * - Merkle tree proofs for address database membership
 * - Selective disclosure of address fields
 */

import type { AddressInput } from '@vey/core';

// Re-export ZKP module
export * from './zkp';

import {
  sha256,
  hmacSha256,
  verifyHmacSha256,
  randomBytes,
} from './zkp';

/**
 * QR code data types
 */
export type QRDataType = 'address' | 'proof' | 'locker' | 'delivery';

/**
 * QR code payload
 */
export interface QRPayload {
  type: QRDataType;
  version: number;
  data: Record<string, unknown>;
  signature?: string;
  expiresAt?: string;
}

/**
 * Address proof payload (Legacy v1 - maintained for backward compatibility)
 */
export interface AddressProofPayload {
  type: 'proof';
  version: 1;
  data: {
    proof_id: string;
    address_hash: string;
    exists: boolean;
    verified_at: string;
    expires_at: string;
  };
  signature: string;
}

/**
 * Enhanced address proof payload (v2 with cryptographic security)
 */
export interface AddressProofPayloadV2 {
  type: 'proof';
  version: 2;
  data: {
    proof_id: string;
    address_hash: string;
    commitment: string;
    nonce: string;
    exists: boolean;
    verified_at: string;
    expires_at: string;
  };
  signature: string;
}

/**
 * Address QR payload
 */
export interface AddressQRPayload {
  type: 'address';
  version: 1;
  data: {
    address_id?: string;
    address: AddressInput;
  };
}

/**
 * Locker QR payload
 */
export interface LockerQRPayload {
  type: 'locker';
  version: 1;
  data: {
    locker_id: string;
    locker_name: string;
    address: AddressInput;
    compartment?: string;
  };
}

/**
 * NFC record type
 */
export type NFCRecordType = 'address' | 'locker' | 'delivery';

/**
 * NFC record data
 */
export interface NFCRecord {
  type: NFCRecordType;
  data: Record<string, unknown>;
}

/**
 * Generate QR code data URL
 */
export function generateQRData(payload: QRPayload): string {
  const json = JSON.stringify(payload);
  // Encode as base64 for QR code
  return `vey://${btoa(json)}`;
}

/**
 * Parse QR code data
 */
export function parseQRData(data: string): QRPayload | null {
  try {
    // Remove protocol prefix
    const encoded = data.replace(/^vey:\/\//, '');
    const json = atob(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Create address proof QR payload (Legacy synchronous version - v1)
 * @deprecated Use createAddressProofV2 for enhanced cryptographic security
 */
export function createAddressProof(
  address: AddressInput,
  options: {
    proofId?: string;
    expiresIn?: number; // seconds
    secret?: string;
  } = {}
): AddressProofPayload {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (options.expiresIn ?? 3600) * 1000);

  // Create address hash using deterministic serialization
  const addressString = JSON.stringify(address);
  const addressHash = btoa(addressString).slice(0, 32);

  // Create signature with secret if provided
  const signatureData = `${addressHash}:${expiresAt.toISOString()}`;
  const signature = options.secret 
    ? btoa(`${signatureData}:${options.secret}`)
    : btoa(signatureData);

  return {
    type: 'proof',
    version: 1,
    data: {
      proof_id: options.proofId ?? `proof_${Date.now()}`,
      address_hash: addressHash,
      exists: true,
      verified_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    signature,
  };
}

/**
 * Verify address proof
 */
export function verifyAddressProof(proof: AddressProofPayload, secret?: string): {
  valid: boolean;
  expired: boolean;
  error?: string;
} {
  try {
    const expiresAt = new Date(proof.data.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return { valid: false, expired: true, error: 'Proof has expired' };
    }

    // Verify signature
    const signatureData = `${proof.data.address_hash}:${proof.data.expires_at}`;
    const expectedSignature = secret 
      ? btoa(`${signatureData}:${secret}`)
      : btoa(signatureData);

    if (proof.signature !== expectedSignature) {
      return { valid: false, expired: false, error: 'Invalid signature' };
    }

    return { valid: true, expired: false };
  } catch {
    return { valid: false, expired: false, error: 'Invalid proof format' };
  }
}

/**
 * Create address proof with enhanced cryptographic security (V2)
 * Uses SHA-256 for hashing and HMAC-SHA256 for signatures
 */
export async function createAddressProofV2(
  address: AddressInput,
  options: {
    proofId?: string;
    expiresIn?: number; // seconds
    secret?: string;
  } = {}
): Promise<AddressProofPayloadV2> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (options.expiresIn ?? 3600) * 1000);
  const secret = options.secret ?? randomBytes(32);

  // Create address hash using SHA-256
  const addressString = JSON.stringify(address);
  const addressHash = await sha256(addressString);

  // Generate random nonce for commitment
  const nonce = randomBytes(16);

  // Create commitment: H(address_hash || nonce)
  const commitment = await sha256(`${addressHash}:${nonce}`);

  // Create HMAC signature
  const signatureData = `${addressHash}:${commitment}:${expiresAt.toISOString()}`;
  const signature = await hmacSha256(signatureData, secret);

  return {
    type: 'proof',
    version: 2,
    data: {
      proof_id: options.proofId ?? `proof_${Date.now()}`,
      address_hash: addressHash,
      commitment,
      nonce,
      exists: true,
      verified_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    signature,
  };
}

/**
 * Verify address proof V2 with cryptographic verification
 */
export async function verifyAddressProofV2(
  proof: AddressProofPayloadV2,
  options: {
    secret?: string;
    address?: AddressInput;
  } = {}
): Promise<{
  valid: boolean;
  expired: boolean;
  addressVerified?: boolean;
  error?: string;
}> {
  try {
    const expiresAt = new Date(proof.data.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return { valid: false, expired: true, error: 'Proof has expired' };
    }

    // Verify commitment
    const expectedCommitment = await sha256(`${proof.data.address_hash}:${proof.data.nonce}`);
    if (proof.data.commitment !== expectedCommitment) {
      return { valid: false, expired: false, error: 'Invalid commitment' };
    }

    // Verify signature if secret is provided
    if (options.secret) {
      const signatureData = `${proof.data.address_hash}:${proof.data.commitment}:${proof.data.expires_at}`;
      const isValidSignature = await verifyHmacSha256(signatureData, proof.signature, options.secret);

      if (!isValidSignature) {
        return { valid: false, expired: false, error: 'Invalid signature' };
      }
    }

    // Verify address hash if address is provided
    let addressVerified: boolean | undefined;
    if (options.address) {
      const addressString = JSON.stringify(options.address);
      const expectedHash = await sha256(addressString);
      addressVerified = proof.data.address_hash === expectedHash;

      if (!addressVerified) {
        return { valid: false, expired: false, addressVerified: false, error: 'Address hash mismatch' };
      }
    }

    return { valid: true, expired: false, addressVerified };
  } catch {
    return { valid: false, expired: false, error: 'Invalid proof format' };
  }
}

/**
 * Create address QR payload
 */
export function createAddressQR(
  address: AddressInput,
  addressId?: string
): AddressQRPayload {
  return {
    type: 'address',
    version: 1,
    data: {
      address_id: addressId,
      address,
    },
  };
}

/**
 * Create locker QR payload
 */
export function createLockerQR(
  lockerId: string,
  lockerName: string,
  address: AddressInput,
  compartment?: string
): LockerQRPayload {
  return {
    type: 'locker',
    version: 1,
    data: {
      locker_id: lockerId,
      locker_name: lockerName,
      address,
      compartment,
    },
  };
}

/**
 * NFC handler for address registration
 */
export class VeyNFCHandler {
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
  }

  /**
   * Check if NFC is supported
   */
  get supported(): boolean {
    return this.isSupported;
  }

  /**
   * Get NDEFReader constructor if available
   */
  private getNDEFReader(): (new () => NDEFReaderLike) | null {
    if (!this.isSupported) {
      return null;
    }
    // Safe access with proper runtime check
    const win = window as { NDEFReader?: new () => NDEFReaderLike };
    return win.NDEFReader ?? null;
  }

  /**
   * Read NFC tag
   */
  async read(): Promise<NFCRecord | null> {
    const NDEFReaderClass = this.getNDEFReader();
    if (!NDEFReaderClass) {
      throw new Error('NFC is not supported on this device');
    }

    const reader = new NDEFReaderClass();

    return new Promise((resolve, reject) => {
      reader.scan().then(() => {
        reader.onreading = (event: NDEFReadingEventLike) => {
          const record = event.message.records[0];
          if (record) {
            try {
              const decoder = new TextDecoder();
              const text = decoder.decode(record.data);
              const payload = parseQRData(text);
              if (payload) {
                resolve({
                  type: payload.type as NFCRecordType,
                  data: payload.data,
                });
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          }
        };

        reader.onreadingerror = () => {
          reject(new Error('Failed to read NFC tag'));
        };
      }).catch(reject);
    });
  }

  /**
   * Write to NFC tag
   */
  async write(record: NFCRecord): Promise<void> {
    const NDEFReaderClass = this.getNDEFReader();
    if (!NDEFReaderClass) {
      throw new Error('NFC is not supported on this device');
    }

    const writer = new NDEFReaderClass();

    const payload: QRPayload = {
      type: record.type,
      version: 1,
      data: record.data,
    };

    const data = generateQRData(payload);

    await writer.write({
      records: [{ recordType: 'text', data }],
    });
  }
}

// Type definitions for Web NFC API
interface NDEFReaderLike {
  scan(): Promise<void>;
  write(message: { records: Array<{ recordType: string; data: string }> }): Promise<void>;
  onreading: ((event: NDEFReadingEventLike) => void) | null;
  onreadingerror: (() => void) | null;
}

interface NDEFReadingEventLike {
  message: {
    records: Array<{
      data: ArrayBuffer;
    }>;
  };
}

/**
 * Create NFC handler instance
 */
export function createNFCHandler(): VeyNFCHandler {
  return new VeyNFCHandler();
}

/**
 * Generate QR code URL for use with QR code libraries
 */
export function generateQRCodeURL(payload: QRPayload): string {
  const data = generateQRData(payload);
  // This returns data that can be passed to QR code libraries
  return data;
}
