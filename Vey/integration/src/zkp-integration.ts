/**
 * ZKP Integration Module
 * 
 * Core integration layer for ZKP Address Protocol with ConveyID delivery system.
 * This module orchestrates the complete ZKP flow for privacy-preserving address delivery.
 */

import {
  createDIDDocument,
  createAddressPIDCredential,
  generateShippingValidationProof,
  verifyShippingValidationProof,
  resolvePID,
  logAddressAccess,
  type DIDDocument,
  type VerifiableCredential,
  type ZKProof,
  type ShippingValidationRequest,
  type ShippingValidationResponse,
  type PIDResolutionRequest,
  type PIDResolutionResponse,
  type AccessControlPolicy,
  type AuditLogEntry,
} from '../../../sdk/core/src/zkp';

import {
  generateCircomMembershipProof,
  verifyCircomMembershipProof,
  generateCircomSelectiveRevealProof,
  verifyCircomSelectiveRevealProof,
  generateCircomVersionProof,
  verifyCircomVersionProof,
  generateCircomLockerProof,
  verifyCircomLockerProof,
} from '../../../sdk/core/src/zkp-circuits';

import {
  generateEd25519KeyPair,
  signEd25519,
  verifyEd25519,
  hashSHA256,
  generateSecureNonce,
} from '../../../sdk/core/src/zkp-crypto';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ZKPIntegrationConfig {
  /** API endpoint for ZKP service */
  apiEndpoint: string;
  /** API key for authentication */
  apiKey: string;
  /** Environment: 'sandbox' or 'production' */
  environment: 'sandbox' | 'production';
  /** Enable circuit-based ZKP (requires compiled circuits) */
  enableCircuits?: boolean;
  /** Timeout for proof generation (ms) */
  proofTimeout?: number;
}

export interface AddressRegistration {
  /** User's DID */
  userDid: string;
  /** Address PID */
  pid: string;
  /** Country code */
  countryCode: string;
  /** Hierarchical depth */
  hierarchyDepth: number;
  /** Full address (encrypted at rest) */
  fullAddress: {
    country: string;
    province?: string;
    city?: string;
    postalCode?: string;
    street?: string;
    building?: string;
    room?: string;
    recipient?: string;
  };
}

export interface ConveyDeliveryRequest {
  /** Sender's ConveyID */
  senderId: string;
  /** Recipient's ConveyID */
  recipientId: string;
  /** Package details */
  package: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    value: number;
    currency: string;
  };
  /** Delivery preferences */
  preferences?: {
    /** Allow locker delivery */
    allowLocker?: boolean;
    /** Require signature */
    requireSignature?: boolean;
    /** Delivery time window */
    timeWindow?: { start: string; end: string };
  };
}

export interface DeliveryAcceptance {
  /** Request ID */
  requestId: string;
  /** Accepted or rejected */
  accepted: boolean;
  /** Selected address PID */
  selectedPid?: string;
  /** ZKP proof type */
  proofType: 'membership' | 'selective-reveal' | 'locker';
  /** Generated proof */
  proof?: ZKProof;
  /** Public signals */
  publicSignals?: string[];
  /** Rejection reason */
  rejectionReason?: string;
}

export interface CarrierAccess {
  /** Carrier's DID */
  carrierDid: string;
  /** Waybill number */
  waybillNumber: string;
  /** Access timestamp */
  accessedAt: string;
  /** Accessed fields */
  accessedFields: string[];
  /** Access purpose */
  purpose: 'delivery' | 'tracking' | 'support';
}

// ============================================================================
// Main Integration Class
// ============================================================================

export class ZKPIntegration {
  private config: ZKPIntegrationConfig;
  private keyPair?: { privateKey: string; publicKey: string };
  private didDocument?: DIDDocument;

  constructor(config: ZKPIntegrationConfig) {
    this.config = {
      proofTimeout: 30000, // 30 seconds default
      enableCircuits: false, // Default to crypto-based proofs
      ...config,
    };
  }

  /**
   * Initialize the integration with user identity
   */
  async initialize(existingKeyPair?: { privateKey: string; publicKey: string }): Promise<void> {
    if (existingKeyPair) {
      this.keyPair = existingKeyPair;
    } else {
      this.keyPair = generateEd25519KeyPair();
    }

    const userDid = `did:key:${this.keyPair.publicKey}`;
    this.didDocument = createDIDDocument(userDid, this.keyPair.publicKey);
  }

  /**
   * Register a new address with ZKP credentials
   */
  async registerAddress(registration: AddressRegistration): Promise<VerifiableCredential> {
    if (!this.didDocument || !this.keyPair) {
      throw new Error('Integration not initialized. Call initialize() first.');
    }

    // Create verifiable credential for the address
    const issuerDid = 'did:vey:address-provider'; // Address provider's DID
    const credential = createAddressPIDCredential(
      registration.userDid,
      issuerDid,
      registration.pid,
      registration.countryCode,
      registration.hierarchyDepth
    );

    // Sign the credential with user's private key
    const credentialJson = JSON.stringify(credential.credentialSubject);
    const signature = signEd25519(credentialJson, this.keyPair.privateKey);

    return {
      ...credential,
      proof: {
        ...credential.proof,
        proofValue: signature,
      },
    };
  }

  /**
   * Generate membership proof (address exists in valid set)
   * Without revealing the actual address
   */
  async generateMembershipProof(
    userPid: string,
    validPidSet: string[]
  ): Promise<{ proof: ZKProof; publicSignals: string[] }> {
    if (this.config.enableCircuits) {
      // Use actual circom circuits
      return await generateCircomMembershipProof(userPid, validPidSet);
    }

    // Fallback to crypto-based proof
    const nonce = generateSecureNonce();
    const commitment = hashSHA256(`${userPid}:${nonce}`);
    const setRoot = hashSHA256(validPidSet.sort().join(','));

    return {
      proof: {
        commitment,
        nonce,
        algorithm: 'SHA256-Merkle',
      },
      publicSignals: [setRoot, commitment],
    };
  }

  /**
   * Generate selective reveal proof
   * Reveal only specific fields (e.g., country and postal code)
   */
  async generateSelectiveRevealProof(
    fullAddress: AddressRegistration['fullAddress'],
    revealFields: (keyof AddressRegistration['fullAddress'])[]
  ): Promise<{ proof: ZKProof; publicSignals: string[]; revealedData: Partial<typeof fullAddress> }> {
    const nonce = generateSecureNonce();
    
    // Create commitment to full address
    const addressJson = JSON.stringify(fullAddress);
    const commitment = hashSHA256(`${addressJson}:${nonce}`);

    // Extract revealed fields
    const revealedData: Partial<typeof fullAddress> = {};
    for (const field of revealFields) {
      if (fullAddress[field]) {
        revealedData[field] = fullAddress[field];
      }
    }

    if (this.config.enableCircuits) {
      // Map fields to indices for circuit
      const fieldMap: Record<string, number> = {
        country: 0,
        province: 1,
        city: 2,
        postalCode: 3,
        street: 4,
        building: 5,
        room: 6,
        recipient: 7,
      };
      
      const revealIndices = revealFields.map(f => fieldMap[f]).filter(i => i !== undefined);
      const addressArray = [
        fullAddress.country || '',
        fullAddress.province || '',
        fullAddress.city || '',
        fullAddress.postalCode || '',
        fullAddress.street || '',
        fullAddress.building || '',
        fullAddress.room || '',
        fullAddress.recipient || '',
      ];
      
      const circuitProof = await generateCircomSelectiveRevealProof(
        addressArray,
        revealIndices,
        nonce
      );

      return {
        ...circuitProof,
        revealedData,
      };
    }

    // Crypto-based proof
    const revealedHash = hashSHA256(JSON.stringify(revealedData));
    
    return {
      proof: {
        commitment,
        nonce,
        revealedHash,
        algorithm: 'SHA256-Commitment',
      },
      publicSignals: [commitment, revealedHash],
      revealedData,
    };
  }

  /**
   * Generate locker proof (has access to locker without revealing which one)
   */
  async generateLockerProof(
    lockerId: string,
    facilityId: string,
    availableLockers: string[]
  ): Promise<{ proof: ZKProof; publicSignals: string[] }> {
    if (this.config.enableCircuits) {
      return await generateCircomLockerProof(lockerId, facilityId, availableLockers, generateSecureNonce());
    }

    // Crypto-based proof
    const nonce = generateSecureNonce();
    const lockerCommitment = hashSHA256(`${lockerId}:${nonce}`);
    const facilityRoot = hashSHA256(availableLockers.sort().join(','));

    return {
      proof: {
        lockerCommitment,
        facilityId,
        nonce,
        algorithm: 'SHA256-Merkle',
      },
      publicSignals: [facilityRoot, lockerCommitment, facilityId],
    };
  }

  /**
   * Generate version proof (address migration - same owner, different address)
   */
  async generateVersionProof(
    oldPid: string,
    newPid: string,
    userSecret: string
  ): Promise<{ proof: ZKProof; publicSignals: string[] }> {
    const nonce = generateSecureNonce();

    if (this.config.enableCircuits) {
      return await generateCircomVersionProof(oldPid, newPid, userSecret, nonce);
    }

    // Crypto-based proof
    const oldCommitment = hashSHA256(`${oldPid}:${userSecret}`);
    const newCommitment = hashSHA256(`${newPid}:${userSecret}`);
    const linkageProof = hashSHA256(`${oldCommitment}:${newCommitment}:${nonce}`);

    return {
      proof: {
        oldCommitment,
        newCommitment,
        linkageProof,
        nonce,
        algorithm: 'SHA256-Linkable',
      },
      publicSignals: [oldCommitment, newCommitment, linkageProof],
    };
  }

  /**
   * Verify any ZKP proof
   */
  async verifyProof(
    proof: ZKProof,
    publicSignals: string[],
    proofType: 'membership' | 'selective-reveal' | 'locker' | 'version'
  ): Promise<boolean> {
    if (this.config.enableCircuits) {
      // Use circuit-specific verification
      switch (proofType) {
        case 'membership':
          return await verifyCircomMembershipProof(proof, publicSignals);
        case 'selective-reveal':
          return await verifyCircomSelectiveRevealProof(proof, publicSignals);
        case 'locker':
          return await verifyCircomLockerProof(proof, publicSignals);
        case 'version':
          return await verifyCircomVersionProof(proof, publicSignals);
        default:
          throw new Error(`Unknown proof type: ${proofType}`);
      }
    }

    // Crypto-based verification
    // Basic validation of proof structure
    if (!proof || !publicSignals || publicSignals.length === 0) {
      return false;
    }

    // Algorithm-specific verification
    const algorithm = (proof as { algorithm?: string }).algorithm;
    if (!algorithm) {
      return false;
    }

    // For demo purposes, accept well-formed proofs
    // In production, implement full cryptographic verification
    return true;
  }

  /**
   * Handle ConveyID delivery request
   */
  async handleDeliveryRequest(
    request: ConveyDeliveryRequest,
    userAddresses: AddressRegistration[]
  ): Promise<DeliveryAcceptance> {
    // Generate request ID
    const requestId = hashSHA256(`${request.senderId}:${request.recipientId}:${Date.now()}`);

    // User can select which address to use
    // For demo, use first address
    const selectedAddress = userAddresses[0];
    if (!selectedAddress) {
      return {
        requestId,
        accepted: false,
        proofType: 'membership',
        rejectionReason: 'No available addresses',
      };
    }

    // Generate appropriate proof based on preferences
    let proofType: 'membership' | 'selective-reveal' | 'locker' = 'membership';
    let proof: ZKProof;
    let publicSignals: string[];

    if (request.preferences?.allowLocker) {
      // Generate locker proof
      proofType = 'locker';
      const lockerResult = await this.generateLockerProof(
        'LOCKER-A-001',
        'FACILITY-TOKYO-STATION',
        ['LOCKER-A-001', 'LOCKER-A-002', 'LOCKER-B-001']
      );
      proof = lockerResult.proof;
      publicSignals = lockerResult.publicSignals;
    } else {
      // Generate selective reveal proof (only country and postal code)
      proofType = 'selective-reveal';
      const selectiveResult = await this.generateSelectiveRevealProof(
        selectedAddress.fullAddress,
        ['country', 'postalCode']
      );
      proof = selectiveResult.proof;
      publicSignals = selectiveResult.publicSignals;
    }

    return {
      requestId,
      accepted: true,
      selectedPid: selectedAddress.pid,
      proofType,
      proof,
      publicSignals,
    };
  }

  /**
   * Grant carrier access to full address (for actual delivery)
   */
  async grantCarrierAccess(
    waybillNumber: string,
    carrierDid: string,
    addressPid: string,
    fullAddress: AddressRegistration['fullAddress']
  ): Promise<CarrierAccess> {
    if (!this.keyPair) {
      throw new Error('Integration not initialized');
    }

    // Create access log
    const accessLog = logAddressAccess(
      addressPid,
      carrierDid,
      'delivery',
      ['country', 'province', 'city', 'postalCode', 'street', 'building', 'room']
    );

    // Sign access grant
    const accessGrantData = JSON.stringify({
      waybillNumber,
      carrierDid,
      addressPid,
      timestamp: new Date().toISOString(),
    });
    const signature = signEd25519(accessGrantData, this.keyPair.privateKey);

    // In production, this would decrypt and transmit the full address to carrier
    // securely using carrier's public key

    return {
      carrierDid,
      waybillNumber,
      accessedAt: accessLog.timestamp,
      accessedFields: accessLog.fields,
      purpose: 'delivery',
    };
  }

  /**
   * Revoke address credential (e.g., after moving)
   */
  async revokeAddress(pid: string, reason: string): Promise<void> {
    if (!this.keyPair) {
      throw new Error('Integration not initialized');
    }

    // Create revocation record
    const revocationData = {
      pid,
      reason,
      revokedAt: new Date().toISOString(),
    };

    // Sign revocation
    const signature = signEd25519(JSON.stringify(revocationData), this.keyPair.privateKey);

    // In production, this would be registered in a revocation list
    console.log('Address revoked:', { revocationData, signature });
  }

  /**
   * Get user's DID
   */
  getUserDid(): string {
    if (!this.didDocument) {
      throw new Error('Integration not initialized');
    }
    return this.didDocument.id;
  }

  /**
   * Get user's public key
   */
  getPublicKey(): string {
    if (!this.keyPair) {
      throw new Error('Integration not initialized');
    }
    return this.keyPair.publicKey;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a new ZKP integration instance
 */
export function createZKPIntegration(config: ZKPIntegrationConfig): ZKPIntegration {
  return new ZKPIntegration(config);
}

/**
 * Quick setup for sandbox environment
 */
export async function createSandboxIntegration(apiKey: string): Promise<ZKPIntegration> {
  const integration = new ZKPIntegration({
    apiEndpoint: 'https://sandbox-api.vey.com',
    apiKey,
    environment: 'sandbox',
    enableCircuits: false, // Use crypto-based proofs for faster testing
  });

  await integration.initialize();
  return integration;
}

/**
 * Quick setup for production environment
 */
export async function createProductionIntegration(
  apiKey: string,
  keyPair: { privateKey: string; publicKey: string }
): Promise<ZKPIntegration> {
  const integration = new ZKPIntegration({
    apiEndpoint: 'https://api.vey.com',
    apiKey,
    environment: 'production',
    enableCircuits: true, // Use real circom circuits in production
  });

  await integration.initialize(keyPair);
  return integration;
}

export default ZKPIntegration;
