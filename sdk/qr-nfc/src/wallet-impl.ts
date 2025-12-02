/**
 * @vey/qr-nfc - Wallet Implementation
 * 
 * Implementation of wallet functions for Google Wallet and Apple Wallet
 */

import { sha256, hmacSha256, randomBytes } from './zkp';
import type {
  AddressIDCard,
  FriendAddressQR,
  WaybillToken,
  HotelCheckinToken,
  AddressForwarding,
  DecryptedAddress,
  AuditLogEntry,
  WalletConfig,
  CryptoUtils,
  RegionZKProof
} from './wallet';

/**
 * Default wallet configuration
 */
export const DEFAULT_WALLET_CONFIG: WalletConfig = {
  provider: 'custom',
  encryption: 'AES-256-GCM',
  signature: 'WebAuthn',
  default_qr_expiry: 7 * 24 * 3600, // 7 days
  offline_mode: true,
  zkp_enabled: true
};

/**
 * Crypto utilities implementation
 */
export class WalletCrypto implements CryptoUtils {
  /**
   * Encrypt address data with AES-GCM
   * 
   * Note: This is a simplified implementation using base64 encoding.
   * In production, use Web Crypto API's AES-GCM:
   * crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
   */
  async encryptAddress(address: DecryptedAddress, key: string): Promise<string> {
    const data = JSON.stringify(address);
    const dataHash = await sha256(data + key);
    const encrypted = Buffer.from(data).toString('base64') + '.' + dataHash.substring(0, 32);
    return encrypted;
  }

  /**
   * Decrypt address data
   * 
   * Note: This is a simplified implementation.
   * In production, use Web Crypto API's AES-GCM:
   * crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData)
   */
  async decryptAddress(encrypted: string, key: string): Promise<DecryptedAddress> {
    const [encodedData, hash] = encrypted.split('.');
    const data = Buffer.from(encodedData, 'base64').toString('utf-8');
    
    // Verify integrity
    const expectedHash = await sha256(data + key);
    if (!expectedHash.startsWith(hash)) {
      throw new Error('Invalid decryption key or corrupted data');
    }
    
    return JSON.parse(data);
  }

  /**
   * Generate WebAuthn-style signature
   * 
   * Note: Simplified HMAC-based signature.
   * In production, use WebAuthn API or ECDSA/EdDSA
   */
  async signData(data: string, privateKey: string): Promise<string> {
    return await hmacSha256(data, privateKey);
  }

  /**
   * Verify signature
   */
  async verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
    const expectedSig = await hmacSha256(data, publicKey);
    return signature === expectedSig;
  }

  /**
   * Generate PID from address
   * 
   * PID = H(normalized_address + secret_salt)
   */
  async generatePID(address: DecryptedAddress, salt: string): Promise<string> {
    const normalized = this.normalizeAddress(address);
    const hash = await sha256(normalized + salt);
    
    // Format as hierarchical PID
    const country = address.country.toUpperCase();
    const components = hash.substring(0, 24);
    
    return `${country}-${components.substring(0, 4)}-${components.substring(4, 8)}-${components.substring(8, 12)}-${components.substring(12, 16)}-${components.substring(16, 20)}-${components.substring(20, 24)}`;
  }

  /**
   * Normalize address for consistent hashing
   */
  private normalizeAddress(address: DecryptedAddress): string {
    return [
      address.country.toUpperCase(),
      address.province || '',
      address.city,
      address.street_address,
      address.postal_code.replace(/\s/g, ''),
      address.building || '',
      address.floor || '',
      address.room || ''
    ].join('|').toLowerCase();
  }

  /**
   * Generate random tracking number
   */
  generateTrackingNumber(): string {
    const prefix = 'TN';
    const random = randomBytes(12);
    return `${prefix}-${random.substring(0, 4)}-${random.substring(4, 8)}-${random.substring(8, 12)}`;
  }

  /**
   * Generate random token ID
   */
  generateTokenId(prefix: string = 'TOK'): string {
    const random = randomBytes(16);
    const timestamp = Date.now().toString(36);
    return `${prefix}-${timestamp}-${random.substring(0, 8)}`;
  }
}

/**
 * Create Address ID Card
 */
export async function createAddressIDCard(
  address: DecryptedAddress,
  locale: string,
  privateKey: string,
  config: WalletConfig = DEFAULT_WALLET_CONFIG
): Promise<AddressIDCard> {
  const crypto = new WalletCrypto();
  
  // Generate PID
  const salt = randomBytes(32);
  const pid = await crypto.generatePID(address, salt);
  
  // Encrypt address
  const encryptedAddress = await crypto.encryptAddress(address, privateKey);
  
  // Create card data for signing
  const cardData = {
    pid,
    country: address.country.toUpperCase(),
    locale,
    encrypted_address: encryptedAddress,
    issued_at: new Date().toISOString()
  };
  
  // Sign card
  const signature = await crypto.signData(JSON.stringify(cardData), privateKey);
  
  return {
    ...cardData,
    signature,
    status: 'active',
    version: 1
  };
}

/**
 * Revoke Address ID Card
 */
export function revokeAddressIDCard(card: AddressIDCard): AddressIDCard {
  return {
    ...card,
    status: 'revoked',
    revoked_at: new Date().toISOString()
  };
}

/**
 * Create Friend Address QR
 */
export async function createFriendAddressQR(
  address: DecryptedAddress,
  locale: string,
  privateKey: string,
  expiryDays: number = 7
): Promise<FriendAddressQR> {
  const crypto = new WalletCrypto();
  
  // Generate friend-specific PID
  const salt = randomBytes(32);
  const pid = await crypto.generatePID(address, salt);
  
  // Encrypt address
  const encrypted = await crypto.encryptAddress(address, privateKey);
  
  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);
  
  const qrData = {
    pid,
    country: address.country.toUpperCase(),
    locale,
    encrypted,
    expiry: `${expiryDays}days`,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString()
  };
  
  // Sign QR data
  const signature = await crypto.signData(JSON.stringify(qrData), privateKey);
  
  return {
    ...qrData,
    signature,
    revoked: false
  };
}

/**
 * Revoke Friend Address QR
 */
export function revokeFriendAddressQR(qr: FriendAddressQR): FriendAddressQR {
  return {
    ...qr,
    revoked: true,
    revoked_at: new Date().toISOString()
  };
}

/**
 * Create Waybill Token
 */
export async function createWaybillToken(
  fromAddress: DecryptedAddress,
  toAddress: DecryptedAddress,
  carrier: string,
  privateKey: string,
  options?: {
    pickupOptions?: WaybillToken['pickup_options'];
    sizePreset?: WaybillToken['size_preset'];
  }
): Promise<WaybillToken> {
  const crypto = new WalletCrypto();
  
  // Generate PIDs
  const salt = randomBytes(32);
  const fromPid = await crypto.generatePID(fromAddress, salt);
  const toPid = await crypto.generatePID(toAddress, salt);
  
  // Encrypt addresses
  const encryptedFrom = await crypto.encryptAddress(fromAddress, privateKey);
  const encryptedTo = await crypto.encryptAddress(toAddress, privateKey);
  
  // Generate random tracking number
  const trackingNumber = crypto.generateTrackingNumber();
  const waybillId = crypto.generateTokenId('WB');
  
  const waybillData = {
    waybill_id: waybillId,
    from_pid: fromPid,
    to_pid: toPid,
    encrypted_from: encryptedFrom,
    encrypted_to: encryptedTo,
    tracking_number: trackingNumber,
    carrier,
    pickup_options: options?.pickupOptions,
    size_preset: options?.sizePreset,
    created_at: new Date().toISOString()
  };
  
  // Sign waybill
  const signature = await crypto.signData(JSON.stringify(waybillData), privateKey);
  
  return {
    ...waybillData,
    signature
  };
}

/**
 * Create Hotel Check-in Token
 */
export async function createHotelCheckinToken(
  guestAddress: DecryptedAddress,
  reservationId: string,
  facilityId: string,
  checkinDate: string,
  checkoutDate: string,
  privateKey: string,
  grantPermission: boolean = false
): Promise<HotelCheckinToken> {
  const crypto = new WalletCrypto();
  
  // Generate guest PID
  const salt = randomBytes(32);
  const guestPid = await crypto.generatePID(guestAddress, salt);
  
  // Encrypt address
  const encryptedAddress = await crypto.encryptAddress(guestAddress, privateKey);
  
  // Generate token
  const tokenId = crypto.generateTokenId('HCK');
  
  // Calculate expiry (1 day after checkout)
  const expiresAt = new Date(checkoutDate);
  expiresAt.setDate(expiresAt.getDate() + 1);
  
  const tokenData = {
    token_id: tokenId,
    guest_pid: guestPid,
    reservation_id: reservationId,
    facility_id: facilityId,
    checkin_date: checkinDate,
    checkout_date: checkoutDate,
    country: guestAddress.country.toUpperCase(),
    encrypted_address: encryptedAddress,
    facility_permission_granted: grantPermission,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'active' as const
  };
  
  // Sign token
  const signature = await crypto.signData(JSON.stringify(tokenData), privateKey);
  
  // Generate auth tag (simplified HMAC)
  const authTag = await hmacSha256(tokenId + reservationId, privateKey);
  
  return {
    ...tokenData,
    signature,
    auth_tag: authTag
  };
}

/**
 * Create Address Forwarding
 */
export async function createAddressForwarding(
  oldAddress: DecryptedAddress,
  newAddress: DecryptedAddress,
  forwardingMonths: number = 6,
  privateKey: string
): Promise<AddressForwarding> {
  const crypto = new WalletCrypto();
  
  // Generate PIDs
  const salt = randomBytes(32);
  const oldPid = await crypto.generatePID(oldAddress, salt);
  const newPid = await crypto.generatePID(newAddress, salt);
  
  // Calculate forwarding expiry
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + forwardingMonths);
  
  return {
    old_pid: oldPid,
    new_pid: newPid,
    moved_at: new Date().toISOString(),
    forwarding_period: `${forwardingMonths}months`,
    forwarding_expires_at: expiresAt.toISOString(),
    forwarding_active: true,
    notify_services: []
  };
}

/**
 * Add service notification to forwarding
 */
export function addServiceNotification(
  forwarding: AddressForwarding,
  serviceType: AddressForwarding['notify_services'][0]['service_type'],
  serviceName: string
): AddressForwarding {
  const services = forwarding.notify_services || [];
  
  return {
    ...forwarding,
    notify_services: [
      ...services,
      {
        service_type: serviceType,
        service_name: serviceName,
        notified: false
      }
    ]
  };
}

/**
 * Mark service as notified
 */
export function markServiceNotified(
  forwarding: AddressForwarding,
  serviceName: string
): AddressForwarding {
  return {
    ...forwarding,
    notify_services: forwarding.notify_services?.map(service =>
      service.service_name === serviceName
        ? { ...service, notified: true, notified_at: new Date().toISOString() }
        : service
    )
  };
}

/**
 * Create audit log entry
 */
export function createAuditLogEntry(
  pid: string,
  action: AuditLogEntry['action'],
  accessor?: string,
  purpose?: string,
  region?: string
): AuditLogEntry {
  const crypto = new WalletCrypto();
  
  return {
    entry_id: crypto.generateTokenId('LOG'),
    pid,
    action,
    timestamp: new Date().toISOString(),
    accessor,
    purpose,
    region
  };
}

/**
 * Create region ZK proof (placeholder for future implementation)
 * 
 * This is a placeholder. Actual ZK proof generation requires:
 * - ZK circuit (e.g., using snarkjs, circom)
 * - Proving key
 * - Witness generation
 */
export async function createRegionZKProof(
  address: DecryptedAddress,
  proofType: RegionZKProof['proof_type']
): Promise<RegionZKProof> {
  // This is a simplified placeholder
  // Real implementation would use a ZK proof library
  
  const publicInputs: RegionZKProof['public_inputs'] = {};
  
  if (proofType === 'zk_country') {
    publicInputs.country = address.country.toUpperCase();
  } else if (proofType === 'zk_region') {
    publicInputs.country = address.country.toUpperCase();
    publicInputs.region = address.province;
  } else if (proofType === 'zk_deliverable') {
    publicInputs.deliverable = true;
  }
  
  // Placeholder proof (would be actual ZK proof in production)
  const proofData = await sha256(JSON.stringify({
    address: address.street_address,
    type: proofType,
    timestamp: Date.now()
  }));
  
  return {
    proof_type: proofType,
    proof: proofData,
    public_inputs: publicInputs,
    generated_at: new Date().toISOString(),
    vk_hash: await sha256('verification_key_placeholder'),
    circuit_version: '1.0.0'
  };
}

/**
 * Verify if address card is valid
 */
export function isAddressCardValid(card: AddressIDCard): boolean {
  if (card.status !== 'active') {
    return false;
  }
  
  if (card.expires_at) {
    const expiryDate = new Date(card.expires_at);
    if (expiryDate < new Date()) {
      return false;
    }
  }
  
  return true;
}

/**
 * Verify if friend QR is valid
 */
export function isFriendQRValid(qr: FriendAddressQR): boolean {
  if (qr.revoked) {
    return false;
  }
  
  const expiryDate = new Date(qr.expires_at);
  if (expiryDate < new Date()) {
    return false;
  }
  
  return true;
}

/**
 * Verify if hotel token is valid
 */
export function isHotelTokenValid(token: HotelCheckinToken): boolean {
  if (token.status !== 'active') {
    return false;
  }
  
  const expiryDate = new Date(token.expires_at);
  if (expiryDate < new Date()) {
    return false;
  }
  
  return true;
}
