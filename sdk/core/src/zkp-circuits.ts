/**
 * @vey/core - ZKP Circuit Integration
 * 
 * This module provides integration with compiled circom circuits for production ZKP.
 * It bridges the TypeScript SDK with actual zk-SNARK proof generation and verification.
 */

import { groth16 } from 'snarkjs';
import { hashSHA256, buildMerkleTree, getMerkleRoot, generateMerkleProof } from './zkp-crypto';
import type { ZKCircuit, ZKProof } from './types';

// Circuit paths (relative to build directory)
const CIRCUIT_PATHS = {
  membership: {
    wasm: 'build/membership_js/membership.wasm',
    zkey: 'keys/membership_final.zkey',
    vkey: 'keys/membership_vkey.json',
  },
  structure: {
    wasm: 'build/structure_js/structure.wasm',
    zkey: 'keys/structure_final.zkey',
    vkey: 'keys/structure_vkey.json',
  },
  selectiveReveal: {
    wasm: 'build/selective-reveal_js/selective-reveal.wasm',
    zkey: 'keys/selective-reveal_final.zkey',
    vkey: 'keys/selective-reveal_vkey.json',
  },
  version: {
    wasm: 'build/version_js/version.wasm',
    zkey: 'keys/version_final.zkey',
    vkey: 'keys/version_vkey.json',
  },
  locker: {
    wasm: 'build/locker_js/locker.wasm',
    zkey: 'keys/locker_final.zkey',
    vkey: 'keys/locker_vkey.json',
  },
};

/**
 * Loads a circuit's verification key
 * @param circuitType - Type of circuit
 * @returns Verification key object
 */
async function loadVerificationKey(circuitType: keyof typeof CIRCUIT_PATHS): Promise<unknown> {
  const vkeyPath = CIRCUIT_PATHS[circuitType].vkey;
  
  // In Node.js environment
  if (typeof require !== 'undefined') {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.join(__dirname, '..', vkeyPath);
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  }
  
  // In browser environment, verification keys should be bundled or fetched
  throw new Error('Browser verification key loading not implemented. Bundle vkey files.');
}

/**
 * Generates a membership proof using actual circom circuit
 * @param pid - PID to prove membership
 * @param validPids - Set of valid PIDs
 * @returns Proof object with groth16 proof
 */
export async function generateCircomMembershipProof(
  pid: string,
  validPids: string[]
): Promise<{ proof: unknown; publicSignals: string[] }> {
  // Build Merkle tree
  const tree = buildMerkleTree(validPids);
  const root = getMerkleRoot(tree);
  const { path, index } = generateMerkleProof(validPids, pid);
  
  // Convert to circuit inputs
  const pidHash = BigInt('0x' + hashSHA256(pid));
  const pathElements = path.map(h => BigInt('0x' + h));
  const pathIndices = [];
  
  // Calculate path indices from index
  let currentIndex = index;
  for (let i = 0; i < 20; i++) {
    pathIndices.push(currentIndex % 2);
    currentIndex = Math.floor(currentIndex / 2);
  }
  
  const input = {
    leaf: pidHash.toString(),
    pathElements: pathElements.map(p => p.toString()),
    pathIndices: pathIndices,
    root: BigInt('0x' + root).toString(),
  };
  
  // Generate proof using snarkjs
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    CIRCUIT_PATHS.membership.wasm,
    CIRCUIT_PATHS.membership.zkey
  );
  
  return { proof, publicSignals };
}

/**
 * Verifies a membership proof using actual circom circuit
 * @param proof - Groth16 proof
 * @param publicSignals - Public inputs
 * @returns Whether proof is valid
 */
export async function verifyCircomMembershipProof(
  proof: unknown,
  publicSignals: string[]
): Promise<boolean> {
  const vkey = await loadVerificationKey('membership');
  return await groth16.verify(vkey, publicSignals, proof);
}

/**
 * Generates a structure proof using actual circom circuit
 * @param pid - PID to validate structure
 * @param countryCode - Expected country code
 * @param hierarchyDepth - Number of hierarchy levels
 * @returns Proof object
 */
export async function generateCircomStructureProof(
  pid: string,
  countryCode: string,
  hierarchyDepth: number
): Promise<{ proof: unknown; publicSignals: string[] }> {
  // Parse PID into components
  const components = pid.split('-');
  const paddedComponents = [...components, ...Array(8 - components.length).fill('')];
  
  // Hash each component
  const componentHashes = paddedComponents.map(c => 
    c ? BigInt('0x' + hashSHA256(c)) : BigInt(0)
  );
  
  const componentLengths = paddedComponents.map(c => BigInt(c.length));
  
  const input = {
    components: componentHashes.map(h => h.toString()),
    componentLengths: componentLengths.map(l => l.toString()),
    countryCode: BigInt('0x' + hashSHA256(countryCode)).toString(),
    hierarchyDepth: hierarchyDepth.toString(),
  };
  
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    CIRCUIT_PATHS.structure.wasm,
    CIRCUIT_PATHS.structure.zkey
  );
  
  return { proof, publicSignals };
}

/**
 * Verifies a structure proof
 * @param proof - Groth16 proof
 * @param publicSignals - Public inputs
 * @returns Whether proof is valid
 */
export async function verifyCircomStructureProof(
  proof: unknown,
  publicSignals: string[]
): Promise<boolean> {
  const vkey = await loadVerificationKey('structure');
  return await groth16.verify(vkey, publicSignals, proof);
}

/**
 * Generates a selective reveal proof using actual circom circuit
 * @param fieldValues - All field values
 * @param fieldsToReveal - Array of field indices to reveal
 * @param nonce - Random nonce
 * @returns Proof object
 */
export async function generateCircomSelectiveRevealProof(
  fieldValues: string[],
  fieldsToReveal: number[],
  nonce: string
): Promise<{ proof: unknown; publicSignals: string[] }> {
  // Create reveal mask (1 for reveal, 0 for hide)
  const revealMask = Array(8).fill(0);
  fieldsToReveal.forEach(idx => {
    if (idx >= 0 && idx < 8) revealMask[idx] = 1;
  });
  
  // Pad field values to 8 fields
  const paddedFields = [...fieldValues, ...Array(8 - fieldValues.length).fill('')];
  
  // Hash field values
  const fieldHashes = paddedFields.map(f => BigInt('0x' + hashSHA256(f)));
  
  // Create revealed values array
  const revealedValues = paddedFields.map((f, i) => 
    revealMask[i] === 1 ? BigInt('0x' + hashSHA256(f)) : BigInt(0)
  );
  
  const input = {
    fieldValues: fieldHashes.map(h => h.toString()),
    revealMask: revealMask.map(m => m.toString()),
    nonce: BigInt('0x' + hashSHA256(nonce)).toString(),
    revealedValues: revealedValues.map(v => v.toString()),
  };
  
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    CIRCUIT_PATHS.selectiveReveal.wasm,
    CIRCUIT_PATHS.selectiveReveal.zkey
  );
  
  return { proof, publicSignals };
}

/**
 * Verifies a selective reveal proof
 * @param proof - Groth16 proof
 * @param publicSignals - Public inputs
 * @returns Whether proof is valid
 */
export async function verifyCircomSelectiveRevealProof(
  proof: unknown,
  publicSignals: string[]
): Promise<boolean> {
  const vkey = await loadVerificationKey('selectiveReveal');
  return await groth16.verify(vkey, publicSignals, proof);
}

/**
 * Generates a version proof using actual circom circuit
 * @param oldPid - Old PID
 * @param newPid - New PID
 * @param userSecret - User's secret key
 * @param nonce - Migration nonce
 * @returns Proof object
 */
export async function generateCircomVersionProof(
  oldPid: string,
  newPid: string,
  userSecret: string,
  nonce: string
): Promise<{ proof: unknown; publicSignals: string[] }> {
  const oldPidHash = BigInt('0x' + hashSHA256(oldPid));
  const newPidHash = BigInt('0x' + hashSHA256(newPid));
  const secretHash = BigInt('0x' + hashSHA256(userSecret));
  const nonceHash = BigInt('0x' + hashSHA256(nonce));
  
  const input = {
    oldPID: oldPidHash.toString(),
    newPID: newPidHash.toString(),
    userSecret: secretHash.toString(),
    migrationNonce: nonceHash.toString(),
    oldPIDCommitment: oldPidHash.toString(),
    newPIDCommitment: newPidHash.toString(),
  };
  
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    CIRCUIT_PATHS.version.wasm,
    CIRCUIT_PATHS.version.zkey
  );
  
  return { proof, publicSignals };
}

/**
 * Verifies a version proof
 * @param proof - Groth16 proof
 * @param publicSignals - Public inputs
 * @returns Whether proof is valid
 */
export async function verifyCircomVersionProof(
  proof: unknown,
  publicSignals: string[]
): Promise<boolean> {
  const vkey = await loadVerificationKey('version');
  return await groth16.verify(vkey, publicSignals, proof);
}

/**
 * Generates a locker proof using actual circom circuit
 * @param lockerId - Locker ID
 * @param facilityId - Facility ID
 * @param availableLockers - All locker IDs in facility
 * @param nonce - Access nonce
 * @returns Proof object
 */
export async function generateCircomLockerProof(
  lockerId: string,
  facilityId: string,
  availableLockers: string[],
  nonce: string
): Promise<{ proof: unknown; publicSignals: string[] }> {
  // Build Merkle tree for lockers
  const tree = buildMerkleTree(availableLockers);
  const root = getMerkleRoot(tree);
  const { path, index } = generateMerkleProof(availableLockers, lockerId);
  
  const lockerHash = BigInt('0x' + hashSHA256(lockerId));
  const facilityHash = BigInt('0x' + hashSHA256(facilityId));
  const pathElements = path.map(h => BigInt('0x' + h));
  const nonceHash = BigInt('0x' + hashSHA256(nonce));
  
  // Calculate path indices (depth 10 for lockers)
  const pathIndices = [];
  let currentIndex = index;
  for (let i = 0; i < 10; i++) {
    pathIndices.push(currentIndex % 2);
    currentIndex = Math.floor(currentIndex / 2);
  }
  
  const input = {
    lockerID: lockerHash.toString(),
    pathElements: pathElements.map(p => p.toString()),
    pathIndices: pathIndices,
    accessNonce: nonceHash.toString(),
    facilityID: facilityHash.toString(),
    lockerSetRoot: BigInt('0x' + root).toString(),
  };
  
  const { proof, publicSignals } = await groth16.fullProve(
    input,
    CIRCUIT_PATHS.locker.wasm,
    CIRCUIT_PATHS.locker.zkey
  );
  
  return { proof, publicSignals };
}

/**
 * Verifies a locker proof
 * @param proof - Groth16 proof
 * @param publicSignals - Public inputs
 * @returns Whether proof is valid
 */
export async function verifyCircomLockerProof(
  proof: unknown,
  publicSignals: string[]
): Promise<boolean> {
  const vkey = await loadVerificationKey('locker');
  return await groth16.verify(vkey, publicSignals, proof);
}

/**
 * Utility: Converts a groth16 proof to a compact string format for storage/transmission
 * @param proof - Groth16 proof object
 * @returns Compact proof string
 */
export function serializeProof(proof: unknown): string {
  return JSON.stringify(proof);
}

/**
 * Utility: Parses a compact proof string back to object
 * @param proofString - Serialized proof
 * @returns Proof object
 */
export function deserializeProof(proofString: string): unknown {
  return JSON.parse(proofString);
}
