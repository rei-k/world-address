/**
 * @vey/core - Friend and QR management module
 * 
 * Functions for friend management, QR code generation, and scanning.
 */

import { hashData, signData } from './crypto';

/**
 * Friend QR payload
 */
export interface FriendQRPayload {
  version: string;
  did: string;
  pid: string;
  timestamp: string;
  expires_at?: string;
  signature?: string;
}

/**
 * Address QR payload
 */
export interface AddressQRPayload {
  version: string;
  pid: string;
  encrypted_address: string;
  signature: string;
  auth_tag?: string;
  timestamp: string;
  expires_at?: string;
}

/**
 * Friend entry
 */
export interface FriendEntry {
  id?: string;
  owner_did: string;
  friend_did: string;
  friend_pid: string;
  friend_label_qr_hash: string;
  verified: boolean;
  label: string;
  avatar_url?: string;
  is_revoked: boolean;
  can_use_for_shipping: boolean;
  added_at: string;
  last_used_at?: string;
  notes?: string;
}

/**
 * Generates a QR code for friend sharing
 * 
 * @param userDid - User's DID
 * @param userPid - User's address PID
 * @param userPrivateKey - User's private key for signing
 * @param expiresInDays - Expiration in days (default: 365)
 * @returns Base64 encoded QR code data
 * 
 * @example
 * ```ts
 * const qrData = await generateFriendQR(
 *   'did:key:z6Mk...',
 *   'JP-13-113-01',
 *   privateKey,
 *   30
 * );
 * ```
 */
export async function generateFriendQR(
  userDid: string,
  userPid: string,
  userPrivateKey: string,
  expiresInDays: number = 365
): Promise<string> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

  const payload: FriendQRPayload = {
    version: '1.0',
    did: userDid,
    pid: userPid,
    timestamp: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  // Sign the payload
  const dataToSign = JSON.stringify({
    version: payload.version,
    did: payload.did,
    pid: payload.pid,
    timestamp: payload.timestamp,
  });

  payload.signature = await signData(dataToSign, userPrivateKey);

  // Return as JSON string (to be encoded as QR)
  return JSON.stringify(payload);
}

/**
 * Generates a QR code for address sharing (encrypted)
 * 
 * @param pid - Address PID
 * @param encryptedAddress - Encrypted address data
 * @param signature - Signature of the encrypted data
 * @param authTag - Authentication tag (optional)
 * @param expiresInDays - Expiration in days (default: 30)
 * @returns Base64 encoded QR code data
 * 
 * @example
 * ```ts
 * const qrData = await generateAddressQR(
 *   'JP-13-113-01',
 *   encryptedData,
 *   signature,
 *   authTag,
 *   30
 * );
 * ```
 */
export async function generateAddressQR(
  pid: string,
  encryptedAddress: string,
  signature: string,
  authTag?: string,
  expiresInDays: number = 30
): Promise<string> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

  const payload: AddressQRPayload = {
    version: '1.0',
    pid,
    encrypted_address: encryptedAddress,
    signature,
    auth_tag: authTag,
    timestamp: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  // Return as JSON string (to be encoded as QR)
  return JSON.stringify(payload);
}

/**
 * Scans and parses a friend QR code
 * 
 * @param qrData - QR code data (JSON string)
 * @returns Parsed friend data
 * 
 * @example
 * ```ts
 * const friendData = await scanFriendQR(qrCodeString);
 * console.log(friendData.did, friendData.pid);
 * ```
 */
export async function scanFriendQR(
  qrData: string
): Promise<FriendQRPayload> {
  try {
    const payload: FriendQRPayload = JSON.parse(qrData);

    // Validate version
    if (payload.version !== '1.0') {
      throw new Error('Unsupported QR code version');
    }

    // Check expiration
    if (payload.expires_at) {
      const expiresAt = new Date(payload.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('QR code has expired');
      }
    }

    // Validate required fields
    if (!payload.did || !payload.pid) {
      throw new Error('Invalid QR code: missing required fields');
    }

    return payload;
  } catch (error) {
    throw new Error(`Failed to parse friend QR: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Scans and parses an address QR code
 * 
 * @param qrData - QR code data (JSON string)
 * @returns Parsed address data
 */
export async function scanAddressQR(
  qrData: string
): Promise<AddressQRPayload> {
  try {
    const payload: AddressQRPayload = JSON.parse(qrData);

    // Validate version
    if (payload.version !== '1.0') {
      throw new Error('Unsupported QR code version');
    }

    // Check expiration
    if (payload.expires_at) {
      const expiresAt = new Date(payload.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('QR code has expired');
      }
    }

    // Validate required fields
    if (!payload.pid || !payload.encrypted_address || !payload.signature) {
      throw new Error('Invalid QR code: missing required fields');
    }

    return payload;
  } catch (error) {
    throw new Error(`Failed to parse address QR: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verifies friend PID is valid and not revoked
 * 
 * @param pid - Friend's PID
 * @returns true if PID is valid
 * 
 * @example
 * ```ts
 * const isValid = await verifyFriendPID('JP-13-113-01');
 * ```
 */
export async function verifyFriendPID(pid: string): Promise<boolean> {
  // In production, this would:
  // 1. Check PID format
  // 2. Query revocation list
  // 3. Verify with Address Provider

  // Basic PID format check
  const pidPattern = /^[A-Z]{2}(-[A-Z0-9]+)*$/;
  if (!pidPattern.test(pid)) {
    return false;
  }

  return true;
}

/**
 * Creates a friend entry from QR scan
 * 
 * @param qrData - Scanned QR data
 * @param ownerDid - Owner's DID
 * @param label - Friendly label for this friend
 * @returns Friend entry object
 */
export async function createFriendFromQR(
  qrData: string,
  ownerDid: string,
  label: string
): Promise<FriendEntry> {
  const friendData = await scanFriendQR(qrData);
  
  // Verify PID
  const isValid = await verifyFriendPID(friendData.pid);
  if (!isValid) {
    throw new Error('Invalid friend PID');
  }

  // Hash the QR data for verification
  const qrHash = await hashData(qrData);

  const friendEntry: FriendEntry = {
    owner_did: ownerDid,
    friend_did: friendData.did,
    friend_pid: friendData.pid,
    friend_label_qr_hash: qrHash,
    verified: true,
    label,
    is_revoked: false,
    can_use_for_shipping: true,
    added_at: new Date().toISOString(),
  };

  return friendEntry;
}

/**
 * Generates a unique ID for entries
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
