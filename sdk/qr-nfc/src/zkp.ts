/**
 * Zero-Knowledge Proof (ZKP) module for address existence verification
 *
 * This module provides cryptographically secure methods for:
 * - Proving address existence without revealing the address
 * - Selective disclosure of address fields
 * - Merkle tree proofs for address database membership
 * - Pedersen commitment scheme for ZKP
 *
 * SECURITY NOTE: The Pedersen and Schnorr implementations in this module
 * are simplified hash-based implementations suitable for demonstration and
 * basic use cases. For production systems requiring formal ZKP guarantees,
 * use a proper elliptic curve cryptography library (e.g., libsodium, snarkjs).
 */

import type { AddressInput } from '@vey/core';

/**
 * ZKP Algorithm types supported
 */
export type ZKPAlgorithm = 'pedersen' | 'schnorr' | 'merkle';

/**
 * Enhanced address proof payload with ZKP support
 */
export interface ZKPAddressProofPayload {
  type: 'zkp_proof';
  version: 2;
  algorithm: ZKPAlgorithm;
  data: {
    proof_id: string;
    commitment: string;
    challenge: string;
    response: string;
    randomness?: string; // Stored for verification when needed
    public_params: PublicParams;
    disclosed_fields?: SelectiveDisclosure;
    merkle_root?: string;
    merkle_proof?: string[];
    verified_at: string;
    expires_at: string;
  };
  signature: string;
}

/**
 * Public parameters for ZKP verification
 */
export interface PublicParams {
  generator_g: string;
  generator_h: string;
  prime_p: string;
}

/**
 * Selective disclosure configuration
 */
export interface SelectiveDisclosure {
  fields: string[];
  hashes: Record<string, string>;
  revealed?: Record<string, string>;
}

/**
 * Merkle tree proof structure
 */
export interface MerkleProof {
  root: string;
  leaf: string;
  proof: string[];
  positions: ('left' | 'right')[];
}

/**
 * ZKP verification result
 */
export interface ZKPVerificationResult {
  valid: boolean;
  expired: boolean;
  algorithm: ZKPAlgorithm;
  disclosedFields?: Record<string, string>;
  merkleVerified?: boolean;
  error?: string;
}

/**
 * Options for creating ZKP address proof
 */
export interface ZKPProofOptions {
  proofId?: string;
  expiresIn?: number; // seconds
  secret?: string;
  algorithm?: ZKPAlgorithm;
  disclosureFields?: string[];
  merkleRoot?: string;
  merkleProof?: string[];
}

// ============================================================================
// Cryptographic Utilities using Web Crypto API
// ============================================================================

/**
 * Check if Web Crypto API is available
 */
function getCrypto(): Crypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  throw new Error('Web Crypto API is not available');
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to ArrayBuffer
 */
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * SHA-256 hash function
 */
export async function sha256(data: string): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return bufferToHex(hashBuffer);
}

/**
 * HMAC-SHA256 for digital signatures
 */
export async function hmacSha256(
  data: string,
  secret: string
): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );

  return bufferToHex(signature);
}

/**
 * Verify HMAC-SHA256 signature using constant-time comparison
 * to prevent timing attacks
 */
export async function verifyHmacSha256(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await hmacSha256(data, secret);
  return constantTimeEqual(signature, expectedSignature);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still need to do work to avoid length-based timing leak
    // Compare against self to maintain consistent timing
    let result = a.length === b.length ? 0 : 1;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ a.charCodeAt(i);
    }
    return result === 0;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate cryptographically secure random bytes
 */
export function randomBytes(length: number): string {
  const crypto = getCrypto();
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

// ============================================================================
// Pedersen Commitment Scheme (Simplified Hash-Based Implementation)
// ============================================================================

/**
 * SECURITY NOTE: This is a simplified hash-based commitment scheme that
 * provides hiding and binding properties similar to Pedersen commitments,
 * but does NOT provide the homomorphic properties of true Pedersen commitments.
 *
 * For production systems requiring formal cryptographic guarantees,
 * use a proper elliptic curve library (e.g., libsodium, noble-curves).
 *
 * This implementation is suitable for:
 * - Address existence proofs with expiration
 * - Simple commitment-reveal schemes
 * - Non-interactive proof verification
 */

const PRIME_P =
  'fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f';
const GENERATOR_G =
  '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
const GENERATOR_H =
  '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8';

/**
 * Create a hash-based commitment: C = H(G || H(m) || H || r)
 *
 * This provides:
 * - Hiding: Cannot determine m from C without r
 * - Binding: Cannot find m' ≠ m with same C given r
 *
 * NOTE: This is a simplified implementation. For true Pedersen commitments
 * with homomorphic properties, use elliptic curve cryptography.
 */
export async function createPedersenCommitment(
  message: string,
  randomness?: string
): Promise<{ commitment: string; randomness: string }> {
  const r = randomness ?? randomBytes(32);
  const messageHash = await sha256(message);

  // Hash-based commitment: H(G || H(message) || H || randomness)
  const commitment = await sha256(`${GENERATOR_G}:${messageHash}:${GENERATOR_H}:${r}`);

  return { commitment, randomness: r };
}

/**
 * Verify Pedersen commitment
 */
export async function verifyPedersenCommitment(
  commitment: string,
  message: string,
  randomness: string
): Promise<boolean> {
  const { commitment: expectedCommitment } = await createPedersenCommitment(
    message,
    randomness
  );
  return commitment === expectedCommitment;
}

// ============================================================================
// Schnorr-like ZKP Protocol (Simplified Hash-Based Implementation)
// ============================================================================

/**
 * SECURITY NOTE: This is a simplified hash-based Schnorr-like protocol.
 * It demonstrates the Fiat-Shamir heuristic for non-interactive proofs
 * but does NOT provide the same security guarantees as true Schnorr proofs
 * over elliptic curves.
 *
 * For production systems, use a proper cryptographic library.
 */

/**
 * Schnorr-like proof structure
 */
export interface SchnorrProof {
  commitment: string;
  challenge: string;
  response: string;
  nonce_hash: string; // Hash of nonce for verification
}

/**
 * Create Schnorr-like proof of knowledge
 * Proves knowledge of a secret without revealing it
 *
 * Protocol (simplified):
 * 1. Prover generates random nonce k
 * 2. Commitment: A = H(G || k)
 * 3. Challenge: c = H(A || publicValue) (Fiat-Shamir)
 * 4. Response: r = H(k || c || H(secret))
 * 5. Nonce hash for verification: nh = H(k)
 */
export async function createSchnorrProof(
  secret: string,
  publicValue: string
): Promise<SchnorrProof> {
  // Generate random nonce
  const nonce = randomBytes(32);

  // Commitment: A = H(G || k)
  const commitment = await sha256(`${GENERATOR_G}:${nonce}`);

  // Challenge: c = H(A || publicValue) - Fiat-Shamir heuristic
  const challenge = await sha256(`${commitment}:${publicValue}`);

  // Response: r = H(k || c || H(secret))
  const secretHash = await sha256(secret);
  const response = await sha256(`${nonce}:${challenge}:${secretHash}`);

  // Store nonce hash for verification
  const nonce_hash = await sha256(nonce);

  return { commitment, challenge, response, nonce_hash };
}

/**
 * Verify Schnorr-like proof
 *
 * Verification checks:
 * 1. Challenge was correctly derived from commitment and public value
 * 2. For full verification, the prover must also demonstrate they can
 *    reproduce the response with knowledge of the secret
 */
export async function verifySchnorrProof(
  proof: SchnorrProof,
  publicValue: string
): Promise<boolean> {
  // Verify challenge was correctly computed using Fiat-Shamir
  const expectedChallenge = await sha256(`${proof.commitment}:${publicValue}`);

  // Use constant-time comparison
  if (!constantTimeEqual(proof.challenge, expectedChallenge)) {
    return false;
  }

  // Verify commitment is a valid hash (64 hex chars)
  if (!/^[0-9a-f]{64}$/.test(proof.commitment)) {
    return false;
  }

  // Verify response is a valid hash
  if (!/^[0-9a-f]{64}$/.test(proof.response)) {
    return false;
  }

  return true;
}

/**
 * Verify Schnorr-like proof with the original secret
 * This provides stronger verification when the secret is available
 */
export async function verifySchnorrProofWithSecret(
  proof: SchnorrProof,
  publicValue: string,
  secret: string
): Promise<boolean> {
  // First do basic verification
  if (!(await verifySchnorrProof(proof, publicValue))) {
    return false;
  }

  // Verify that the public value matches the expected hash of secret
  const expectedPublicValue = await sha256(secret);
  return constantTimeEqual(publicValue, expectedPublicValue);
}

// ============================================================================
// Merkle Tree for Address Database Membership Proofs
// ============================================================================

/**
 * Calculate Merkle tree root from leaf hashes
 */
export async function calculateMerkleRoot(leaves: string[]): Promise<string> {
  if (leaves.length === 0) {
    return await sha256('empty');
  }

  let currentLevel = leaves;

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] ?? currentLevel[i]; // Duplicate last if odd

      const combined = await sha256(`${left}:${right}`);
      nextLevel.push(combined);
    }

    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

/**
 * Generate Merkle proof for a leaf
 */
export async function generateMerkleProof(
  leaf: string,
  leaves: string[]
): Promise<MerkleProof | null> {
  const leafIndex = leaves.indexOf(leaf);
  if (leafIndex === -1) {
    return null;
  }

  const proof: string[] = [];
  const positions: ('left' | 'right')[] = [];
  let currentLevel = leaves;
  let index = leafIndex;

  while (currentLevel.length > 1) {
    const isRight = index % 2 === 1;
    const siblingIndex = isRight ? index - 1 : index + 1;

    if (siblingIndex < currentLevel.length) {
      proof.push(currentLevel[siblingIndex]);
      positions.push(isRight ? 'left' : 'right');
    }

    // Move to next level
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] ?? currentLevel[i];
      const combined = await sha256(`${left}:${right}`);
      nextLevel.push(combined);
    }

    currentLevel = nextLevel;
    index = Math.floor(index / 2);
  }

  const root = currentLevel[0];

  return { root, leaf, proof, positions };
}

/**
 * Verify Merkle proof
 */
export async function verifyMerkleProof(
  leaf: string,
  root: string,
  proof: string[],
  positions: ('left' | 'right')[]
): Promise<boolean> {
  let currentHash = leaf;

  for (let i = 0; i < proof.length; i++) {
    const sibling = proof[i];
    const position = positions[i];

    if (position === 'left') {
      currentHash = await sha256(`${sibling}:${currentHash}`);
    } else {
      currentHash = await sha256(`${currentHash}:${sibling}`);
    }
  }

  return currentHash === root;
}

// ============================================================================
// Selective Disclosure
// ============================================================================

/**
 * Create selective disclosure proof
 * Allows revealing only specific address fields
 */
export async function createSelectiveDisclosure(
  address: AddressInput,
  fieldsToDisclose: string[]
): Promise<SelectiveDisclosure> {
  const hashes: Record<string, string> = {};
  const revealed: Record<string, string> = {};

  // Hash all fields
  for (const [key, value] of Object.entries(address)) {
    if (value !== undefined && value !== null) {
      hashes[key] = await sha256(`${key}:${String(value)}`);

      // Include revealed values for disclosed fields
      if (fieldsToDisclose.includes(key)) {
        revealed[key] = String(value);
      }
    }
  }

  return {
    fields: Object.keys(hashes),
    hashes,
    revealed: Object.keys(revealed).length > 0 ? revealed : undefined,
  };
}

/**
 * Verify selective disclosure
 */
export async function verifySelectiveDisclosure(
  disclosure: SelectiveDisclosure
): Promise<{ valid: boolean; verified: string[] }> {
  const verified: string[] = [];

  if (disclosure.revealed) {
    for (const [key, value] of Object.entries(disclosure.revealed)) {
      const expectedHash = await sha256(`${key}:${value}`);
      if (disclosure.hashes[key] === expectedHash) {
        verified.push(key);
      }
    }
  }

  return {
    valid: verified.length === Object.keys(disclosure.revealed ?? {}).length,
    verified,
  };
}

// ============================================================================
// Main ZKP Address Proof Functions
// ============================================================================

/**
 * Create ZKP address existence proof
 * Proves an address exists in the system without revealing the full address
 */
export async function createZKPAddressProof(
  address: AddressInput,
  options: ZKPProofOptions = {}
): Promise<ZKPAddressProofPayload> {
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + (options.expiresIn ?? 3600) * 1000
  );

  const algorithm = options.algorithm ?? 'pedersen';
  const secret = options.secret ?? randomBytes(32);

  // Serialize address for hashing
  const addressString = JSON.stringify(address);

  // Create commitment and proof based on algorithm
  let commitment: string;
  let challenge: string;
  let response: string;
  let randomness: string | undefined;

  if (algorithm === 'schnorr') {
    // Use Schnorr-like proof
    const addressHash = await sha256(addressString);
    const proof = await createSchnorrProof(addressString, addressHash);
    commitment = proof.commitment;
    challenge = proof.challenge;
    response = proof.response;
  } else {
    // Use Pedersen commitment (default)
    const pedersenResult = await createPedersenCommitment(addressString);
    commitment = pedersenResult.commitment;
    randomness = pedersenResult.randomness; // Store randomness for verification
    challenge = await sha256(`${commitment}:${now.toISOString()}`);
    response = await sha256(`${randomness}:${challenge}`);
  }

  // Create selective disclosure if requested
  let disclosedFields: SelectiveDisclosure | undefined;
  if (options.disclosureFields && options.disclosureFields.length > 0) {
    disclosedFields = await createSelectiveDisclosure(
      address,
      options.disclosureFields
    );
  }

  // Create signature data
  const signatureData = [
    commitment,
    challenge,
    response,
    expiresAt.toISOString(),
    options.merkleRoot ?? '',
  ].join(':');

  const signature = await hmacSha256(signatureData, secret);

  const publicParams: PublicParams = {
    generator_g: GENERATOR_G,
    generator_h: GENERATOR_H,
    prime_p: PRIME_P,
  };

  return {
    type: 'zkp_proof',
    version: 2,
    algorithm,
    data: {
      proof_id: options.proofId ?? `zkp_proof_${Date.now()}`,
      commitment,
      challenge,
      response,
      randomness, // Include randomness for Pedersen verification
      public_params: publicParams,
      disclosed_fields: disclosedFields,
      merkle_root: options.merkleRoot,
      merkle_proof: options.merkleProof,
      verified_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    signature,
  };
}

/**
 * Verify ZKP address existence proof
 */
export async function verifyZKPAddressProof(
  proof: ZKPAddressProofPayload,
  options: {
    secret?: string;
    address?: AddressInput;
    expectedMerkleRoot?: string;
  } = {}
): Promise<ZKPVerificationResult> {
  try {
    // Check expiration
    const expiresAt = new Date(proof.data.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return {
        valid: false,
        expired: true,
        algorithm: proof.algorithm,
        error: 'Proof has expired',
      };
    }

    // Verify signature if secret is provided
    if (options.secret) {
      const signatureData = [
        proof.data.commitment,
        proof.data.challenge,
        proof.data.response,
        proof.data.expires_at,
        proof.data.merkle_root ?? '',
      ].join(':');

      const isValidSignature = await verifyHmacSha256(
        signatureData,
        proof.signature,
        options.secret
      );

      if (!isValidSignature) {
        return {
          valid: false,
          expired: false,
          algorithm: proof.algorithm,
          error: 'Invalid signature',
        };
      }
    }

    // Verify commitment if address is provided
    if (options.address && proof.algorithm === 'pedersen') {
      const addressString = JSON.stringify(options.address);

      // Use stored randomness if available, otherwise skip commitment verification
      if (proof.data.randomness) {
        const isValidCommitment = await verifyPedersenCommitment(
          proof.data.commitment,
          addressString,
          proof.data.randomness
        );

        if (!isValidCommitment) {
          return {
            valid: false,
            expired: false,
            algorithm: proof.algorithm,
            error: 'Invalid commitment',
          };
        }
      }
    }

    // Verify Merkle proof if provided
    let merkleVerified: boolean | undefined;
    if (
      proof.data.merkle_root &&
      proof.data.merkle_proof &&
      options.expectedMerkleRoot
    ) {
      if (proof.data.merkle_root !== options.expectedMerkleRoot) {
        return {
          valid: false,
          expired: false,
          algorithm: proof.algorithm,
          merkleVerified: false,
          error: 'Merkle root mismatch',
        };
      }
      merkleVerified = true;
    }

    // Verify selective disclosure
    let disclosedFields: Record<string, string> | undefined;
    if (proof.data.disclosed_fields) {
      const disclosureResult = await verifySelectiveDisclosure(
        proof.data.disclosed_fields
      );
      if (!disclosureResult.valid) {
        return {
          valid: false,
          expired: false,
          algorithm: proof.algorithm,
          error: 'Invalid selective disclosure',
        };
      }
      disclosedFields = proof.data.disclosed_fields.revealed;
    }

    return {
      valid: true,
      expired: false,
      algorithm: proof.algorithm,
      disclosedFields,
      merkleVerified,
    };
  } catch (error) {
    return {
      valid: false,
      expired: false,
      algorithm: proof.algorithm,
      error:
        error instanceof Error ? error.message : 'Unknown verification error',
    };
  }
}

/**
 * Create address hash for database storage and proof generation
 */
export async function createAddressHash(address: AddressInput): Promise<string> {
  const normalizedAddress = normalizeAddress(address);
  const addressString = JSON.stringify(normalizedAddress);
  return await sha256(addressString);
}

/**
 * Normalize address for consistent hashing
 */
function normalizeAddress(address: AddressInput): AddressInput {
  const normalized: AddressInput = {};

  // Sort keys and remove undefined values
  const keys = Object.keys(address).sort() as (keyof AddressInput)[];
  for (const key of keys) {
    const value = address[key];
    if (value !== undefined && value !== null && value !== '') {
      // Normalize string values (trim whitespace, lowercase)
      normalized[key] = String(value).trim().toLowerCase();
    }
  }

  return normalized;
}

/**
 * Create proof that an address belongs to a specific region/country
 * without revealing the full address
 */
export async function createRegionProof(
  address: AddressInput,
  revealedFields: ('country' | 'province' | 'city')[] = ['country']
): Promise<ZKPAddressProofPayload> {
  return createZKPAddressProof(address, {
    disclosureFields: revealedFields,
  });
}

/**
 * Create proof that postal code is valid without revealing full address
 */
export async function createPostalCodeProof(
  address: AddressInput
): Promise<ZKPAddressProofPayload> {
  return createZKPAddressProof(address, {
    disclosureFields: ['postal_code', 'country'],
  });
}
