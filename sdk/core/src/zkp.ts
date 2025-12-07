/**
 * @vey/core - ZKP (Zero-Knowledge Proof) Address Protocol module
 * 
 * Core functionality for ZKP-based address validation and privacy-preserving delivery.
 * 
 * This module implements the ZKP Address Protocol with four main flows:
 * 1. Address Registration & Authentication Flow
 * 2. Shipping Request & Waybill Generation Flow
 * 3. Delivery Execution & Tracking Flow
 * 4. Address Update & Revocation Flow
 */

import type {
  DIDDocument,
  VerificationMethod,
  VerifiableCredential,
  CredentialSubject,
  Proof,
  ZKCircuit,
  ZKProof,
  ZKProofVerificationResult,
  ShippingCondition,
  ShippingValidationRequest,
  ShippingValidationResponse,
  AddressProvider,
  RevocationList,
  RevocationEntry,
  AccessControlPolicy,
  PIDResolutionRequest,
  PIDResolutionResponse,
  AuditLogEntry,
  TrackingEvent,
  ZKPWaybill,
  AddressInput,
  PIDComponents,
} from './types';

// ============================================================================
// Flow 1: Address Registration & Authentication
// ============================================================================

/**
 * Creates a DID Document for a user or entity
 * 
 * @param did - DID identifier
 * @param publicKey - Public key (multibase encoded)
 * @param keyType - Key type (default: 'Ed25519VerificationKey2020')
 * @returns DID Document
 * 
 * @example
 * ```ts
 * const didDoc = createDIDDocument(
 *   'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
 *   'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
 * );
 * ```
 */
export function createDIDDocument(
  did: string,
  publicKey: string,
  keyType: string = 'Ed25519VerificationKey2020'
): DIDDocument {
  const verificationMethod: VerificationMethod = {
    id: `${did}#key-1`,
    type: keyType,
    controller: did,
    publicKeyMultibase: publicKey,
  };

  return {
    id: did,
    verificationMethod: [verificationMethod],
    authentication: [`${did}#key-1`],
    created: new Date().toISOString(),
  };
}

/**
 * Creates an Address PID Verifiable Credential
 * 
 * Issues a VC containing user's address PID and metadata.
 * This VC proves that the address has been verified and normalized.
 * 
 * @param userDid - User's DID
 * @param issuerDid - Address provider's DID
 * @param pid - Address PID
 * @param countryCode - Country code
 * @param admin1Code - Admin level 1 code (optional)
 * @param expirationDate - Optional expiration date
 * @returns Verifiable Credential
 * 
 * @example
 * ```ts
 * const vc = createAddressPIDCredential(
 *   'did:key:user123',
 *   'did:web:vey.example',
 *   'JP-13-113-01',
 *   'JP',
 *   '13',
 *   new Date('2025-12-31').toISOString()
 * );
 * ```
 */
export function createAddressPIDCredential(
  userDid: string,
  issuerDid: string,
  pid: string,
  countryCode: string,
  admin1Code?: string,
  expirationDate?: string
): VerifiableCredential {
  const credentialSubject: CredentialSubject = {
    id: userDid,
    addressPID: pid,
    countryCode,
    admin1Code,
  };

  const vc: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://vey.example/credentials/v1',
    ],
    id: `urn:uuid:${generateUUID()}`,
    type: ['VerifiableCredential', 'AddressPIDCredential'],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject,
  };

  if (expirationDate) {
    vc.expirationDate = expirationDate;
  }

  return vc;
}

/**
 * Generates a UUID v4
 * Simple UUID generator for credential IDs
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Signs a Verifiable Credential (placeholder)
 * 
 * In production, this would use a proper cryptographic library
 * to create a digital signature.
 * 
 * @param vc - Verifiable Credential to sign
 * @param signingKey - Private key for signing
 * @param verificationMethod - Verification method reference
 * @returns VC with proof
 */
export function signCredential(
  vc: VerifiableCredential,
  signingKey: string,
  verificationMethod: string
): VerifiableCredential {
  // Placeholder: In production, use proper cryptographic signing
  const proof: Proof = {
    type: 'Ed25519Signature2020',
    created: new Date().toISOString(),
    verificationMethod,
    proofPurpose: 'assertionMethod',
    proofValue: `z${Buffer.from(JSON.stringify(vc) + signingKey).toString('base64')}`,
  };

  return {
    ...vc,
    proof,
  };
}

/**
 * Verifies a Verifiable Credential signature (placeholder)
 * 
 * @param vc - Verifiable Credential to verify
 * @param publicKey - Public key for verification
 * @returns Whether the credential is valid
 */
export function verifyCredential(
  vc: VerifiableCredential,
  publicKey: string
): boolean {
  // Placeholder: In production, use proper cryptographic verification
  if (!vc.proof) {
    return false;
  }
  
  // Basic structure validation
  return !!(
    vc.issuer &&
    vc.issuanceDate &&
    vc.credentialSubject &&
    vc.proof.proofValue
  );
}

// ============================================================================
// Flow 2: Shipping Request & Waybill Generation
// ============================================================================

/**
 * Creates a ZK circuit definition
 * 
 * @param id - Circuit identifier
 * @param name - Circuit name
 * @param description - Circuit description
 * @returns ZK Circuit
 */
export function createZKCircuit(
  id: string,
  name: string,
  description?: string
): ZKCircuit {
  return {
    id,
    name,
    proofType: 'groth16', // Default to Groth16
    version: '1.0.0',
    paramsHash: '', // Would be computed from actual circuit parameters
    verificationKey: '', // Would be loaded from compiled circuit
    description,
  };
}

/**
 * Generates a ZK proof for address validation (placeholder)
 * 
 * This is a placeholder. In production, this would:
 * 1. Load the ZK circuit
 * 2. Prepare witness (private inputs: full address, public inputs: conditions)
 * 3. Generate the proof using the circuit
 * 4. Return the proof + public inputs
 * 
 * @param pid - Address PID
 * @param conditions - Shipping conditions to prove
 * @param circuit - ZK circuit to use
 * @param addressData - Full address data (private input)
 * @returns ZK Proof
 */
export function generateZKProof(
  pid: string,
  conditions: ShippingCondition,
  circuit: ZKCircuit,
  addressData: AddressInput
): ZKProof {
  // Placeholder: In production, use actual ZK proof generation
  const publicInputs = {
    pid,
    allowedCountries: conditions.allowedCountries,
    timestamp: new Date().toISOString(),
  };

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    proof: Buffer.from(JSON.stringify({ pid, conditions, addressData })).toString('base64'),
    publicInputs,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Verifies a ZK proof (placeholder)
 * 
 * This is a placeholder. In production, this would:
 * 1. Load the verification key for the circuit
 * 2. Parse the proof
 * 3. Verify the proof against public inputs
 * 4. Return verification result
 * 
 * @param proof - ZK proof to verify
 * @param circuit - ZK circuit used
 * @returns Verification result
 */
export function verifyZKProof(
  proof: ZKProof,
  circuit: ZKCircuit
): ZKProofVerificationResult {
  // Placeholder: In production, use actual ZK proof verification
  const valid = !!(
    proof.circuitId === circuit.id &&
    proof.proof &&
    proof.publicInputs
  );

  return {
    valid,
    circuitId: proof.circuitId,
    publicInputs: valid ? proof.publicInputs : undefined,
    verifiedAt: new Date().toISOString(),
    error: valid ? undefined : 'Invalid proof structure',
  };
}

/**
 * Validates shipping request and generates ZK proof
 * 
 * @param request - Shipping validation request
 * @param circuit - ZK circuit to use
 * @param addressData - Full address data (only known to address provider)
 * @returns Shipping validation response with ZK proof
 */
export function validateShippingRequest(
  request: ShippingValidationRequest,
  circuit: ZKCircuit,
  addressData: AddressInput
): ShippingValidationResponse {
  // Check if address satisfies conditions
  const satisfiesConditions = checkShippingConditions(addressData, request.conditions);

  if (!satisfiesConditions) {
    return {
      valid: false,
      error: 'Address does not satisfy shipping conditions',
      timestamp: new Date().toISOString(),
    };
  }

  // Generate ZK proof
  const zkProof = generateZKProof(
    request.pid,
    request.conditions,
    circuit,
    addressData
  );

  // Generate anonymized PID token
  const pidToken = generatePIDToken(request.pid);

  return {
    valid: true,
    zkProof,
    pidToken,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Checks if address satisfies shipping conditions
 * 
 * @param address - Address to check
 * @param conditions - Shipping conditions
 * @returns Whether conditions are satisfied
 */
function checkShippingConditions(
  address: AddressInput,
  conditions: ShippingCondition
): boolean {
  // Check country
  if (conditions.allowedCountries && conditions.allowedCountries.length > 0) {
    if (!address.country || !conditions.allowedCountries.includes(address.country)) {
      return false;
    }
  }

  // Check region/province
  if (conditions.allowedRegions && conditions.allowedRegions.length > 0) {
    if (!address.province || !conditions.allowedRegions.includes(address.province)) {
      return false;
    }
  }

  // Additional checks would go here (prohibited areas, etc.)
  
  return true;
}

/**
 * Generates an anonymized PID token
 * 
 * @param pid - Original PID
 * @returns Anonymized token
 */
function generatePIDToken(pid: string): string {
  // Simple token generation (in production, use proper tokenization)
  return `tok_${Buffer.from(pid).toString('base64').substring(0, 16)}`;
}

/**
 * Creates a ZKP-enhanced waybill
 * 
 * @param waybillId - Waybill identifier
 * @param pid - Address PID
 * @param zkProof - ZK proof of valid delivery address
 * @param trackingNumber - Tracking number
 * @param options - Additional options
 * @returns ZKP Waybill
 */
export function createZKPWaybill(
  waybillId: string,
  pid: string,
  zkProof: ZKProof,
  trackingNumber: string,
  options: {
    parcelWeight?: number;
    parcelSize?: string;
    carrierZone?: string;
    senderName?: string;
    recipientName?: string;
    carrierInfo?: { id: string; name: string };
  } = {}
): ZKPWaybill {
  return {
    waybill_id: waybillId,
    addr_pid: pid,
    zkProof,
    trackingNumber,
    parcel_weight: options.parcelWeight,
    parcel_size: options.parcelSize,
    carrier_zone: options.carrierZone,
    zkp: zkProof.proof, // Proof data
    sender: options.senderName ? { name: options.senderName } : undefined,
    recipient: options.recipientName
      ? { name: options.recipientName, pidToken: generatePIDToken(pid) }
      : undefined,
    carrier: options.carrierInfo,
  };
}

// ============================================================================
// Flow 3: Delivery Execution & Tracking
// ============================================================================

/**
 * Validates access policy for PID resolution
 * 
 * @param policy - Access control policy
 * @param requesterId - Requester DID
 * @param action - Action being requested
 * @returns Whether access is granted
 */
export function validateAccessPolicy(
  policy: AccessControlPolicy,
  requesterId: string,
  action: string
): boolean {
  // Check principal (who can access)
  if (policy.principal !== requesterId && policy.principal !== '*') {
    return false;
  }

  // Check action
  if (policy.action !== action && policy.action !== '*') {
    return false;
  }

  // Check expiration
  if (policy.expiresAt && new Date(policy.expiresAt) < new Date()) {
    return false;
  }

  return true;
}

/**
 * Resolves PID to address (with access control)
 * 
 * @param request - PID resolution request
 * @param policy - Access control policy
 * @param addressData - Full address data
 * @returns Resolution response
 */
export function resolvePID(
  request: PIDResolutionRequest,
  policy: AccessControlPolicy,
  addressData: AddressInput
): PIDResolutionResponse {
  // Check access
  if (!validateAccessPolicy(policy, request.requesterId, 'resolve')) {
    return {
      success: false,
      error: 'Access denied',
      timestamp: new Date().toISOString(),
    };
  }

  // Log access
  const accessLogId = generateUUID();

  return {
    success: true,
    address: addressData,
    accessLogId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates an audit log entry
 * 
 * @param pid - PID accessed
 * @param accessor - Accessor DID
 * @param action - Action performed
 * @param result - Result of action
 * @returns Audit log entry
 */
export function createAuditLogEntry(
  pid: string,
  accessor: string,
  action: string,
  result: 'success' | 'denied' | 'error',
  metadata?: Record<string, unknown>
): AuditLogEntry {
  return {
    id: generateUUID(),
    pid,
    accessor,
    action,
    timestamp: new Date().toISOString(),
    result,
    metadata,
  };
}

/**
 * Creates a tracking event
 * 
 * @param trackingNumber - Tracking number
 * @param type - Event type
 * @param description - Event description
 * @param location - Location information (coarse)
 * @returns Tracking event
 */
export function createTrackingEvent(
  trackingNumber: string,
  type: string,
  description?: string,
  location?: { country?: string; admin1?: string; city?: string }
): TrackingEvent {
  return {
    id: generateUUID(),
    trackingNumber,
    type,
    timestamp: new Date().toISOString(),
    description,
    location,
  };
}

// ============================================================================
// Flow 4: Address Update & Revocation
// ============================================================================

/**
 * Creates a revocation entry
 * 
 * @param pid - PID to revoke
 * @param reason - Revocation reason
 * @param newPid - New PID if address was updated
 * @returns Revocation entry
 */
export function createRevocationEntry(
  pid: string,
  reason: string,
  newPid?: string
): RevocationEntry {
  return {
    pid,
    reason,
    revokedAt: new Date().toISOString(),
    newPid,
  };
}

/**
 * Creates or updates a revocation list
 * 
 * @param issuerDid - Issuer DID (address provider)
 * @param entries - Revocation entries
 * @param previousList - Previous revocation list (for versioning)
 * @returns Revocation list
 */
export function createRevocationList(
  issuerDid: string,
  entries: RevocationEntry[],
  previousList?: RevocationList
): RevocationList {
  const version = previousList ? previousList.version + 1 : 1;

  return {
    id: `urn:uuid:${generateUUID()}`,
    issuer: issuerDid,
    version,
    updatedAt: new Date().toISOString(),
    entries,
  };
}

/**
 * Checks if a PID is revoked
 * 
 * @param pid - PID to check
 * @param revocationList - Revocation list
 * @returns Whether PID is revoked
 */
export function isPIDRevoked(pid: string, revocationList: RevocationList): boolean {
  return revocationList.entries.some(entry => entry.pid === pid);
}

/**
 * Gets the new PID for a revoked address
 * 
 * @param oldPid - Old/revoked PID
 * @param revocationList - Revocation list
 * @returns New PID if available
 */
export function getNewPID(oldPid: string, revocationList: RevocationList): string | undefined {
  const entry = revocationList.entries.find(e => e.pid === oldPid);
  return entry?.newPid;
}

/**
 * Signs a revocation list (placeholder)
 * 
 * @param revocationList - Revocation list to sign
 * @param signingKey - Private key for signing
 * @param verificationMethod - Verification method reference
 * @returns Signed revocation list
 */
export function signRevocationList(
  revocationList: RevocationList,
  signingKey: string,
  verificationMethod: string
): RevocationList {
  // Placeholder: In production, use proper cryptographic signing
  const proof: Proof = {
    type: 'Ed25519Signature2020',
    created: new Date().toISOString(),
    verificationMethod,
    proofPurpose: 'assertionMethod',
    proofValue: `z${Buffer.from(JSON.stringify(revocationList) + signingKey).toString('base64')}`,
  };

  return {
    ...revocationList,
    proof,
  };
}

// ============================================================================
// Address Provider Management
// ============================================================================

/**
 * Creates an address provider configuration
 * 
 * @param id - Provider identifier
 * @param name - Provider name
 * @param did - Provider DID
 * @param verificationKey - Verification key
 * @param endpoint - API endpoint
 * @param circuits - Supported ZK circuits
 * @returns Address provider
 */
export function createAddressProvider(
  id: string,
  name: string,
  did: string,
  verificationKey: string,
  endpoint: string,
  circuits: ZKCircuit[]
): AddressProvider {
  return {
    id,
    name,
    did,
    verificationKey,
    circuits,
    endpoint,
  };
}

/**
 * Validates an address provider's signature
 * 
 * @param data - Data to validate
 * @param signature - Signature
 * @param provider - Address provider
 * @returns Whether signature is valid
 */
export function validateProviderSignature(
  data: unknown,
  signature: string,
  provider: AddressProvider
): boolean {
  // Placeholder: In production, use proper cryptographic verification
  return !!(signature && provider.verificationKey);
}

// ============================================================================
// Multiple ZKP Patterns (5 Types)
// ============================================================================

/**
 * Creates a Merkle root from a list of address PIDs
 * 
 * @param pids - Array of PIDs to include in the tree
 * @returns Merkle root hash
 */
function createMerkleRoot(pids: string[]): string {
  // Placeholder: In production, use actual Merkle tree implementation
  // This would hash all PIDs and build a binary tree
  const concatenated = pids.sort().join('|');
  return `merkle_${Buffer.from(concatenated).toString('base64').substring(0, 32)}`;
}

/**
 * Generates a Merkle path for a specific PID
 * 
 * @param pid - Target PID
 * @param pids - All PIDs in the tree
 * @returns Merkle path (array of hashes)
 */
function generateMerklePath(pid: string, pids: string[]): { path: string[]; index: number } {
  // Placeholder: In production, compute actual Merkle path
  const index = pids.indexOf(pid);
  const path = pids
    .filter((_, i) => i !== index)
    .slice(0, Math.ceil(Math.log2(pids.length)))
    .map(p => `hash_${Buffer.from(p).toString('base64').substring(0, 16)}`);
  
  return { path, index };
}

// ============================================================================
// Pattern 1: ZK-Membership Proof (Address Existence)
// ============================================================================

/**
 * Generates a ZK-Membership Proof
 * Proves that an address PID exists in a valid set without revealing which one
 * 
 * @param pid - Address PID to prove membership of
 * @param validPids - Set of all valid PIDs (Merkle tree leaves)
 * @param circuit - ZK circuit for membership proof
 * @returns ZK-Membership Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKMembershipProof(
 *   'JP-13-113-01-T07-B12',
 *   ['JP-13-113-01-T07-B12', 'JP-14-201-05-T03-B08', ...],
 *   circuit
 * );
 * ```
 */
export function generateZKMembershipProof(
  pid: string,
  validPids: string[],
  circuit: ZKCircuit
): import('./types').ZKMembershipProof {
  // Generate Merkle root and path
  const merkleRoot = createMerkleRoot(validPids);
  const { path, index } = generateMerklePath(pid, validPids);

  // Placeholder: In production, generate actual zk-SNARK proof
  const proof = Buffer.from(
    JSON.stringify({ pid, merkleRoot, merklePath: path })
  ).toString('base64');

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'membership',
    proof,
    publicInputs: {
      merkleRoot,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    merkleRoot,
    merklePath: path,
    leafIndex: index,
  };
}

/**
 * Verifies a ZK-Membership Proof
 * 
 * @param proof - Membership proof to verify
 * @param circuit - ZK circuit used
 * @param merkleRoot - Expected Merkle root of valid PIDs
 * @returns Verification result
 */
export function verifyZKMembershipProof(
  proof: import('./types').ZKMembershipProof,
  circuit: ZKCircuit,
  merkleRoot: string
): ZKProofVerificationResult {
  // Verify circuit ID matches
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Verify Merkle root matches
  if (proof.merkleRoot !== merkleRoot) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Merkle root mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Placeholder: In production, verify actual zk-SNARK proof
  const valid = !!(proof.proof && proof.merklePath);

  return {
    valid,
    circuitId: proof.circuitId,
    publicInputs: proof.publicInputs,
    verifiedAt: new Date().toISOString(),
    error: valid ? undefined : 'Invalid membership proof',
  };
}

// ============================================================================
// Pattern 2: ZK-Structure Proof (PID Hierarchy)
// ============================================================================

/**
 * Generates a ZK-Structure Proof
 * Proves that a PID has correct hierarchical structure (Country > Admin1 > Admin2 > ...)
 * 
 * @param pid - Address PID to validate structure
 * @param countryCode - Country code (public)
 * @param hierarchyDepth - Number of hierarchy levels to validate
 * @param circuit - ZK circuit for structure proof
 * @returns ZK-Structure Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKStructureProof(
 *   'JP-13-113-01-T07-B12-BN02-R342',
 *   'JP',
 *   8,
 *   circuit
 * );
 * ```
 */
export function generateZKStructureProof(
  pid: string,
  countryCode: string,
  hierarchyDepth: number,
  circuit: ZKCircuit
): import('./types').ZKStructureProof {
  // Validate PID structure
  const pidParts = pid.split('-');
  
  // Placeholder: In production, generate actual Halo2/PLONK proof
  // that validates hierarchical consistency
  const rulesHash = `rules_${Buffer.from(countryCode).toString('base64')}`;
  const proof = Buffer.from(
    JSON.stringify({ pid, countryCode, hierarchyDepth, rulesHash })
  ).toString('base64');

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'structure',
    proof,
    publicInputs: {
      countryCode,
      hierarchyDepth,
      pidLength: pidParts.length,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    countryCode,
    hierarchyDepth,
    rulesHash,
  };
}

/**
 * Verifies a ZK-Structure Proof
 * 
 * @param proof - Structure proof to verify
 * @param circuit - ZK circuit used
 * @param expectedCountry - Expected country code
 * @returns Verification result
 */
export function verifyZKStructureProof(
  proof: import('./types').ZKStructureProof,
  circuit: ZKCircuit,
  expectedCountry?: string
): ZKProofVerificationResult {
  // Verify circuit ID
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Verify country if specified
  if (expectedCountry && proof.countryCode !== expectedCountry) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Country code mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Placeholder: In production, verify actual proof
  const valid = !!(proof.proof && proof.hierarchyDepth > 0);

  return {
    valid,
    circuitId: proof.circuitId,
    publicInputs: proof.publicInputs,
    verifiedAt: new Date().toISOString(),
    error: valid ? undefined : 'Invalid structure proof',
  };
}

// ============================================================================
// Pattern 3: ZK-Selective Reveal Proof (Partial Disclosure)
// ============================================================================

/**
 * Generates a ZK-Selective Reveal Proof
 * Allows partial disclosure of address fields with user control
 * 
 * @param pid - Address PID
 * @param fullAddress - Complete address data (private)
 * @param fieldsToReveal - Fields to reveal (e.g., ['country', 'postal_code'])
 * @param circuit - ZK circuit for selective disclosure
 * @returns ZK-Selective Reveal Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKSelectiveRevealProof(
 *   'JP-13-113-01',
 *   { country: 'JP', province: '13', city: 'Shibuya', postal_code: '150-0001' },
 *   ['country', 'postal_code'],
 *   circuit
 * );
 * // EC site sees only: { country: 'JP', postal_code: '150-0001' }
 * // Carrier sees: full address
 * ```
 */
export function generateZKSelectiveRevealProof(
  pid: string,
  fullAddress: AddressInput,
  fieldsToReveal: string[],
  circuit: ZKCircuit
): import('./types').ZKSelectiveRevealProof {
  // Extract revealed values
  const revealedValues: Record<string, string> = {};
  for (const field of fieldsToReveal) {
    if (field in fullAddress) {
      const value = (fullAddress as Record<string, unknown>)[field];
      // Only include if value is a string and not null/undefined
      if (typeof value === 'string') {
        revealedValues[field] = value;
      }
    }
  }

  // Generate disclosure nonce for SD-JWT compatibility
  const disclosureNonce = `nonce_${generateUUID().substring(0, 16)}`;

  // Placeholder: In production, generate actual SD-JWT + zk-SNARK proof
  const proof = Buffer.from(
    JSON.stringify({ pid, revealedFields: fieldsToReveal, disclosureNonce })
  ).toString('base64');

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'selective-reveal',
    proof,
    publicInputs: {
      pid,
      revealedFields: fieldsToReveal,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    revealedFields: fieldsToReveal,
    revealedValues,
    disclosureNonce,
  };
}

/**
 * Verifies a ZK-Selective Reveal Proof
 * 
 * @param proof - Selective reveal proof to verify
 * @param circuit - ZK circuit used
 * @returns Verification result with revealed data
 */
export function verifyZKSelectiveRevealProof(
  proof: import('./types').ZKSelectiveRevealProof,
  circuit: ZKCircuit
): ZKProofVerificationResult & { revealedData?: Record<string, string> } {
  // Verify circuit ID
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Placeholder: In production, verify actual proof and selective disclosure
  // Note: A proof with no revealed fields can still be valid (e.g., proving address exists without revealing any data)
  const valid = !!(proof.proof && proof.revealedFields !== undefined);

  return {
    valid,
    circuitId: proof.circuitId,
    publicInputs: proof.publicInputs,
    revealedData: valid ? proof.revealedValues : undefined,
    verifiedAt: new Date().toISOString(),
    error: valid ? undefined : 'Invalid selective reveal proof',
  };
}

// ============================================================================
// Pattern 4: ZK-Version Proof (Address Update/Migration)
// ============================================================================

/**
 * Generates a ZK-Version Proof
 * Proves consistency between old and new PID after address change
 * 
 * @param oldPid - Previous PID (revoked)
 * @param newPid - New PID (current)
 * @param userDid - User's DID (proof of ownership)
 * @param circuit - ZK circuit for version proof
 * @returns ZK-Version Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKVersionProof(
 *   'JP-13-113-01-T07-B12',
 *   'JP-14-201-05-T03-B08',
 *   'did:key:user123',
 *   circuit
 * );
 * ```
 */
export function generateZKVersionProof(
  oldPid: string,
  newPid: string,
  userDid: string,
  circuit: ZKCircuit
): import('./types').ZKVersionProof {
  const migrationTimestamp = new Date().toISOString();

  // Generate ownership proof (placeholder)
  const ownershipProof = `ownership_${Buffer.from(userDid).toString('base64').substring(0, 16)}`;

  // Placeholder: In production, generate actual zk-SNARK proof
  // proving that same user owns both old and new PIDs
  const proof = Buffer.from(
    JSON.stringify({ oldPid, newPid, userDid, migrationTimestamp })
  ).toString('base64');

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'version',
    proof,
    publicInputs: {
      oldPid,
      newPid,
      migrationTimestamp,
      timestamp: migrationTimestamp,
    },
    timestamp: migrationTimestamp,
    oldPid,
    newPid,
    migrationTimestamp,
    ownershipProof,
  };
}

/**
 * Verifies a ZK-Version Proof
 * 
 * @param proof - Version proof to verify
 * @param circuit - ZK circuit used
 * @param revocationList - Revocation list to check old PID status
 * @returns Verification result
 */
export function verifyZKVersionProof(
  proof: import('./types').ZKVersionProof,
  circuit: ZKCircuit,
  revocationList?: RevocationList
): ZKProofVerificationResult {
  // Verify circuit ID
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Check if old PID is in revocation list
  if (revocationList && !isPIDRevoked(proof.oldPid, revocationList)) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Old PID not revoked',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Placeholder: In production, verify actual proof
  const valid = !!(proof.proof && proof.oldPid && proof.newPid);

  return {
    valid,
    circuitId: proof.circuitId,
    publicInputs: proof.publicInputs,
    verifiedAt: new Date().toISOString(),
    error: valid ? undefined : 'Invalid version proof',
  };
}

// ============================================================================
// Pattern 5: ZK-Locker Proof (Locker Membership)
// ============================================================================

/**
 * Generates a ZK-Locker Proof
 * Proves that user has access to a locker in a facility without revealing which one
 * 
 * @param lockerId - Specific locker ID (private)
 * @param facilityId - Locker facility identifier (public)
 * @param availableLockers - All locker IDs in facility
 * @param circuit - ZK circuit for locker membership
 * @param zone - Optional zone/region
 * @returns ZK-Locker Proof
 * 
 * @example
 * ```ts
 * const proof = generateZKLockerProof(
 *   'LOCKER-A-042',
 *   'FACILITY-SHIBUYA-STATION',
 *   ['LOCKER-A-001', 'LOCKER-A-002', ..., 'LOCKER-A-100'],
 *   circuit,
 *   'KANTO-TOKYO-SHIBUYA'
 * );
 * ```
 */
export function generateZKLockerProof(
  lockerId: string,
  facilityId: string,
  availableLockers: string[],
  circuit: ZKCircuit,
  zone?: string
): import('./types').ZKLockerProof {
  // Generate Merkle root for locker set
  const lockerSetRoot = createMerkleRoot(availableLockers);
  const { path } = generateMerklePath(lockerId, availableLockers);

  // Placeholder: In production, generate actual ZK-Membership proof
  const proof = Buffer.from(
    JSON.stringify({ lockerId, facilityId, lockerSetRoot, merklePath: path })
  ).toString('base64');

  return {
    circuitId: circuit.id,
    proofType: circuit.proofType,
    patternType: 'locker',
    proof,
    publicInputs: {
      facilityId,
      lockerSetRoot,
      zone,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
    facilityId,
    zone,
    lockerSetRoot,
  };
}

/**
 * Verifies a ZK-Locker Proof
 * 
 * @param proof - Locker proof to verify
 * @param circuit - ZK circuit used
 * @param expectedFacilityId - Expected facility ID
 * @returns Verification result
 */
export function verifyZKLockerProof(
  proof: import('./types').ZKLockerProof,
  circuit: ZKCircuit,
  expectedFacilityId?: string
): ZKProofVerificationResult {
  // Verify circuit ID
  if (proof.circuitId !== circuit.id) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Circuit ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Verify facility ID if specified
  if (expectedFacilityId && proof.facilityId !== expectedFacilityId) {
    return {
      valid: false,
      circuitId: proof.circuitId,
      error: 'Facility ID mismatch',
      verifiedAt: new Date().toISOString(),
    };
  }

  // Placeholder: In production, verify actual proof
  const valid = !!(proof.proof && proof.lockerSetRoot);

  return {
    valid,
    circuitId: proof.circuitId,
    publicInputs: proof.publicInputs,
    verifiedAt: new Date().toISOString(),
    error: valid ? undefined : 'Invalid locker proof',
  };
}
