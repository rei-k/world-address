/**
 * @vey/qr-nfc - Wallet Integration Module
 * 
 * Google Wallet and Apple Wallet integration for address management
 * with PID-based credentials, encryption, and zero-knowledge proofs
 */

/**
 * Address ID Card - Concealed card with PID handle
 * 
 * Front: Shows only country and language
 * Back: Full address visible only to owner
 * Signed for authenticity (tamper-proof)
 * Revocable/renewable (invalidate old addresses after moving)
 */
export interface AddressIDCard {
  /** PID (Place ID) handle - does not reveal actual address */
  pid: string;
  
  /** Country code (ISO 3166-1 alpha-2) */
  country: string;
  
  /** Display language */
  locale: string;
  
  /** Encrypted full address (AES-GCM) - only owner can decrypt */
  encrypted_address: string;
  
  /** WebAuthn/wallet-bound signature for authenticity */
  signature: string;
  
  /** Card issue timestamp */
  issued_at: string;
  
  /** Card expiry timestamp (optional) */
  expires_at?: string;
  
  /** Card status */
  status: 'active' | 'revoked' | 'expired';
  
  /** Revocation timestamp (if revoked) */
  revoked_at?: string;
  
  /** Card version for updates */
  version: number;
}

/**
 * Friend Address QR - QR code for friend sharing
 * 
 * Contains encrypted address blob + signature + expiry
 * Reader can only verify "existence proof" (ZKP expandable)
 * Only friend_pid is stored in cloud address book
 * Revocable and scan history recorded in coarse region only
 */
export interface FriendAddressQR {
  /** Generated friend-specific PID */
  pid: string;
  
  /** Country code */
  country: string;
  
  /** Locale (ja / en) */
  locale: string;
  
  /** Encrypted address blob (AES-GCM) */
  encrypted: string;
  
  /** Wallet-bound signature */
  signature: string;
  
  /** QR expiry (e.g., "7days") */
  expiry: string;
  
  /** Expiry timestamp */
  expires_at: string;
  
  /** Created timestamp */
  created_at: string;
  
  /** Revocation status */
  revoked: boolean;
  
  /** Revocation timestamp (if revoked) */
  revoked_at?: string;
}

/**
 * Shipping Label / Waybill Token
 * 
 * FROM/TO are PID selection or QR selection
 * Actual address decryptable only by final delivery hub
 * Tracking number is random token (not linked to address/user)
 */
export interface WaybillToken {
  /** Waybill ID */
  waybill_id: string;
  
  /** Sender PID */
  from_pid: string;
  
  /** Recipient PID */
  to_pid: string;
  
  /** Encrypted sender address (for return) */
  encrypted_from: string;
  
  /** Encrypted recipient address (last-mile only) */
  encrypted_to: string;
  
  /** Random tracking number (not linked to address) */
  tracking_number: string;
  
  /** Selected carrier */
  carrier: string;
  
  /** Pickup options */
  pickup_options?: {
    scheduled_time?: string;
    location_type?: 'home' | 'office' | 'locker';
    special_instructions?: string;
  };
  
  /** Package size preset */
  size_preset?: 'small' | 'medium' | 'large' | 'custom';
  
  /** ZK proof for deliverable region (optional) */
  region_proof?: {
    proof_type: 'zk_region' | 'zk_country';
    proof_data: string;
    verified_at: string;
  };
  
  /** Waybill creation timestamp */
  created_at: string;
  
  /** Signature for authenticity */
  signature: string;
}

/**
 * Hotel Check-in NFC/QR Token
 * 
 * Contains:
 * - Proof of matching country/stay dates/reservation ID required by facility
 * - Encrypted address blob (decryptable only if permission granted to facility app)
 * - Signature and auth tag
 * 
 * Facility does not store actual address (discarded after check-in)
 */
export interface HotelCheckinToken {
  /** Token ID */
  token_id: string;
  
  /** Guest PID */
  guest_pid: string;
  
  /** Reservation ID */
  reservation_id: string;
  
  /** Facility ID */
  facility_id: string;
  
  /** Check-in date */
  checkin_date: string;
  
  /** Check-out date */
  checkout_date: string;
  
  /** Guest country (for verification) */
  country: string;
  
  /** Encrypted address blob */
  encrypted_address: string;
  
  /** Permission flag - facility can decrypt only if true */
  facility_permission_granted: boolean;
  
  /** Signature for authenticity */
  signature: string;
  
  /** Authentication tag */
  auth_tag: string;
  
  /** Token creation timestamp */
  created_at: string;
  
  /** Token expiry (typically after checkout) */
  expires_at: string;
  
  /** Token status */
  status: 'active' | 'used' | 'expired' | 'revoked';
}

/**
 * Address Move / Forwarding
 * 
 * When moving:
 * - Issue new Address Card at new location
 * - Revoke old card
 * - Add forwarding_flag to new card
 * - Share new PID only with financial institutions/hotels/logistics
 */
export interface AddressForwarding {
  /** Old PID (revoked) */
  old_pid: string;
  
  /** New PID (active) */
  new_pid: string;
  
  /** Move date */
  moved_at: string;
  
  /** Forwarding period (e.g., "6months") */
  forwarding_period: string;
  
  /** Forwarding expiry timestamp */
  forwarding_expires_at: string;
  
  /** Forwarding active flag */
  forwarding_active: boolean;
  
  /** Services to notify with new PID */
  notify_services?: Array<{
    service_type: 'financial' | 'hotel' | 'logistics' | 'government' | 'other';
    service_name: string;
    notified: boolean;
    notified_at?: string;
  }>;
}

/**
 * Wallet Side Functions - Internal wallet features
 */
export interface WalletFeatures {
  /** Address Card Collection - List/update/revoke address cards */
  address_cards: AddressIDCard[];
  
  /** Friend QR Scanner - Register/revoke friend address QRs */
  friend_qrs: FriendAddressQR[];
  
  /** Waybill Generator - Generate shipping labels with PID selection */
  waybills: WaybillToken[];
  
  /** Hotel Check-in - Facility authentication QR/NFC */
  hotel_checkins: HotelCheckinToken[];
  
  /** Address Forwarding - Move management */
  forwardings: AddressForwarding[];
  
  /** Audit Log (local only) - Track when PIDs were decrypted */
  audit_log: AuditLogEntry[];
  
  /** Default Country Preset */
  default_country?: string;
  
  /** Language preference */
  default_language?: string;
}

/**
 * Audit Log Entry (local only)
 * 
 * Records when PIDs were decrypted
 * NOT published externally - coarse granularity
 */
export interface AuditLogEntry {
  /** Log entry ID */
  entry_id: string;
  
  /** PID that was accessed */
  pid: string;
  
  /** Action type */
  action: 'decrypted' | 'shared' | 'revoked' | 'created';
  
  /** Timestamp */
  timestamp: string;
  
  /** Who accessed (service/app identifier) */
  accessor?: string;
  
  /** Purpose of access */
  purpose?: string;
  
  /** Coarse region (not detailed location) */
  region?: string;
}

/**
 * Region ZK Proof (optional future extension)
 * 
 * Proves conditions without revealing full address:
 * pickup ∈ ValidRegion ∧ delivery ∈ AllowedCountries ∧ ¬(pid ∈ RevokedSet)
 */
export interface RegionZKProof {
  /** Proof type */
  proof_type: 'zk_region' | 'zk_country' | 'zk_deliverable';
  
  /** ZK proof data (circuit-specific) */
  proof: string;
  
  /** Public inputs (disclosed fields) */
  public_inputs: {
    country?: string;
    region?: string;
    deliverable?: boolean;
  };
  
  /** Proof generation timestamp */
  generated_at: string;
  
  /** Proof verification key hash */
  vk_hash: string;
  
  /** Circuit version */
  circuit_version: string;
}

/**
 * Wallet Configuration
 */
export interface WalletConfig {
  /** Wallet provider (google/apple) */
  provider: 'google' | 'apple' | 'custom';
  
  /** Encryption algorithm */
  encryption: 'AES-256-GCM';
  
  /** Signature algorithm */
  signature: 'WebAuthn' | 'ECDSA' | 'EdDSA';
  
  /** Default QR expiry (seconds) */
  default_qr_expiry: number;
  
  /** Enable offline mode */
  offline_mode: boolean;
  
  /** Enable ZKP features */
  zkp_enabled: boolean;
}

/**
 * Decrypted Address Data
 * 
 * Full address after decryption (kept only in memory)
 */
export interface DecryptedAddress {
  /** Full address fields */
  recipient?: string;
  street_address: string;
  city: string;
  province?: string;
  postal_code: string;
  country: string;
  
  /** Building/room details */
  building?: string;
  floor?: string;
  room?: string;
  
  /** Additional info */
  phone?: string;
  email?: string;
  notes?: string;
}

/**
 * Encryption/Decryption utilities
 */
export interface CryptoUtils {
  /** Encrypt address data with AES-GCM */
  encryptAddress(address: DecryptedAddress, key: string): Promise<string>;
  
  /** Decrypt address data */
  decryptAddress(encrypted: string, key: string): Promise<DecryptedAddress>;
  
  /** Generate WebAuthn signature */
  signData(data: string, privateKey: string): Promise<string>;
  
  /** Verify signature */
  verifySignature(data: string, signature: string, publicKey: string): Promise<boolean>;
  
  /** Generate PID from address */
  generatePID(address: DecryptedAddress, salt: string): Promise<string>;
  
  /** Generate random tracking number */
  generateTrackingNumber(): string;
  
  /** Generate random token ID */
  generateTokenId(prefix?: string): string;
}
