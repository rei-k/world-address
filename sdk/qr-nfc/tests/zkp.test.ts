/**
 * @vey/qr-nfc - Tests for Zero-Knowledge Proof module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { AddressInput } from '@vey/core';
import {
  // Cryptographic utilities
  sha256,
  hmacSha256,
  verifyHmacSha256,
  randomBytes,
  // Pedersen commitment
  createPedersenCommitment,
  verifyPedersenCommitment,
  // Schnorr proof
  createSchnorrProof,
  verifySchnorrProof,
  // Merkle tree
  calculateMerkleRoot,
  generateMerkleProof,
  verifyMerkleProof,
  // Selective disclosure
  createSelectiveDisclosure,
  verifySelectiveDisclosure,
  // Main ZKP functions
  createZKPAddressProof,
  verifyZKPAddressProof,
  createAddressHash,
  createRegionProof,
  createPostalCodeProof,
  // Schnorr verification with secret
  verifySchnorrProofWithSecret,
  // Legacy functions
  createAddressProof,
  verifyAddressProof,
  createAddressProofV2,
  verifyAddressProofV2,
} from '../src';

// Sample address for testing
const sampleAddress: AddressInput = {
  recipient: 'John Doe',
  street_address: '1-1 Chiyoda',
  city: 'Chiyoda-ku',
  province: 'Tokyo',
  postal_code: '100-0001',
  country: 'Japan',
};

const sampleAddressJapanese: AddressInput = {
  recipient: '山田太郎',
  street_address: '千代田区千代田1-1',
  city: '千代田区',
  province: '東京都',
  postal_code: '100-0001',
  country: '日本',
};

describe('Cryptographic Utilities', () => {
  describe('sha256', () => {
    it('should generate consistent hashes for the same input', async () => {
      const hash1 = await sha256('test data');
      const hash2 = await sha256('test data');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', async () => {
      const hash1 = await sha256('test data 1');
      const hash2 = await sha256('test data 2');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate 64-character hex hash', async () => {
      const hash = await sha256('test');
      expect(hash).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });
  });

  describe('hmacSha256', () => {
    it('should generate consistent signatures with same key', async () => {
      const signature1 = await hmacSha256('message', 'secret');
      const signature2 = await hmacSha256('message', 'secret');
      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures with different keys', async () => {
      const signature1 = await hmacSha256('message', 'secret1');
      const signature2 = await hmacSha256('message', 'secret2');
      expect(signature1).not.toBe(signature2);
    });
  });

  describe('verifyHmacSha256', () => {
    it('should verify valid signature', async () => {
      const signature = await hmacSha256('message', 'secret');
      const isValid = await verifyHmacSha256('message', signature, 'secret');
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const signature = await hmacSha256('message', 'secret');
      const isValid = await verifyHmacSha256('message', signature, 'wrong-secret');
      expect(isValid).toBe(false);
    });
  });

  describe('randomBytes', () => {
    it('should generate random hex string of specified length', () => {
      const bytes16 = randomBytes(16);
      expect(bytes16).toHaveLength(32); // 16 bytes = 32 hex chars

      const bytes32 = randomBytes(32);
      expect(bytes32).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('should generate different values on each call', () => {
      const bytes1 = randomBytes(16);
      const bytes2 = randomBytes(16);
      expect(bytes1).not.toBe(bytes2);
    });
  });
});

describe('Pedersen Commitment', () => {
  describe('createPedersenCommitment', () => {
    it('should create commitment with random randomness', async () => {
      const result = await createPedersenCommitment('secret message');
      expect(result.commitment).toBeDefined();
      expect(result.randomness).toBeDefined();
      expect(result.commitment).toHaveLength(64);
    });

    it('should create different commitments for same message with different randomness', async () => {
      const result1 = await createPedersenCommitment('secret');
      const result2 = await createPedersenCommitment('secret');
      // Randomness is different, so commitments should differ
      expect(result1.commitment).not.toBe(result2.commitment);
    });

    it('should create same commitment with same randomness', async () => {
      const fixedRandomness = 'a'.repeat(64);
      const result1 = await createPedersenCommitment('secret', fixedRandomness);
      const result2 = await createPedersenCommitment('secret', fixedRandomness);
      expect(result1.commitment).toBe(result2.commitment);
    });
  });

  describe('verifyPedersenCommitment', () => {
    it('should verify valid commitment', async () => {
      const { commitment, randomness } = await createPedersenCommitment('secret message');
      const isValid = await verifyPedersenCommitment(commitment, 'secret message', randomness);
      expect(isValid).toBe(true);
    });

    it('should reject commitment with wrong message', async () => {
      const { commitment, randomness } = await createPedersenCommitment('secret message');
      const isValid = await verifyPedersenCommitment(commitment, 'wrong message', randomness);
      expect(isValid).toBe(false);
    });

    it('should reject commitment with wrong randomness', async () => {
      const { commitment } = await createPedersenCommitment('secret message');
      const isValid = await verifyPedersenCommitment(commitment, 'secret message', 'wrong-randomness');
      expect(isValid).toBe(false);
    });
  });
});

describe('Schnorr Proof', () => {
  describe('createSchnorrProof', () => {
    it('should create proof with commitment, challenge, response, and nonce_hash', async () => {
      const publicValue = await sha256('public');
      const proof = await createSchnorrProof('secret', publicValue);

      expect(proof.commitment).toBeDefined();
      expect(proof.challenge).toBeDefined();
      expect(proof.response).toBeDefined();
      expect(proof.nonce_hash).toBeDefined();
    });
  });

  describe('verifySchnorrProof', () => {
    it('should verify valid proof', async () => {
      const publicValue = await sha256('public');
      const proof = await createSchnorrProof('secret', publicValue);
      const isValid = await verifySchnorrProof(proof, publicValue);
      expect(isValid).toBe(true);
    });

    it('should reject proof with wrong public value', async () => {
      const publicValue = await sha256('public');
      const proof = await createSchnorrProof('secret', publicValue);
      const wrongPublicValue = await sha256('wrong');
      const isValid = await verifySchnorrProof(proof, wrongPublicValue);
      expect(isValid).toBe(false);
    });
  });

  describe('verifySchnorrProofWithSecret', () => {
    it('should verify proof with correct secret', async () => {
      const secret = 'my-secret';
      const publicValue = await sha256(secret);
      const proof = await createSchnorrProof(secret, publicValue);
      const isValid = await verifySchnorrProofWithSecret(proof, publicValue, secret);
      expect(isValid).toBe(true);
    });

    it('should reject proof with wrong secret', async () => {
      const secret = 'my-secret';
      const publicValue = await sha256(secret);
      const proof = await createSchnorrProof(secret, publicValue);
      const isValid = await verifySchnorrProofWithSecret(proof, publicValue, 'wrong-secret');
      expect(isValid).toBe(false);
    });
  });
});

describe('Merkle Tree', () => {
  describe('calculateMerkleRoot', () => {
    it('should calculate root from leaves', async () => {
      const leaves = ['a', 'b', 'c', 'd'].map((l) => l);
      const root = await calculateMerkleRoot(leaves);
      expect(root).toBeDefined();
      expect(root).toHaveLength(64);
    });

    it('should handle odd number of leaves', async () => {
      const leaves = ['a', 'b', 'c'];
      const root = await calculateMerkleRoot(leaves);
      expect(root).toBeDefined();
    });

    it('should handle single leaf', async () => {
      const leaves = ['single'];
      const root = await calculateMerkleRoot(leaves);
      expect(root).toBe('single'); // Single leaf is the root
    });

    it('should handle empty leaves', async () => {
      const root = await calculateMerkleRoot([]);
      expect(root).toBeDefined();
    });
  });

  describe('generateMerkleProof', () => {
    it('should generate valid proof for existing leaf', async () => {
      const leaves = await Promise.all(
        ['a', 'b', 'c', 'd'].map((l) => sha256(l))
      );
      const targetLeaf = leaves[1];
      const proof = await generateMerkleProof(targetLeaf, leaves);

      expect(proof).not.toBeNull();
      expect(proof?.leaf).toBe(targetLeaf);
      expect(proof?.proof.length).toBeGreaterThan(0);
    });

    it('should return null for non-existing leaf', async () => {
      const leaves = ['a', 'b', 'c', 'd'];
      const proof = await generateMerkleProof('not-in-tree', leaves);
      expect(proof).toBeNull();
    });
  });

  describe('verifyMerkleProof', () => {
    it('should verify valid proof', async () => {
      const leaves = await Promise.all(
        ['a', 'b', 'c', 'd'].map((l) => sha256(l))
      );
      const targetLeaf = leaves[1];
      const proof = await generateMerkleProof(targetLeaf, leaves);

      expect(proof).not.toBeNull();
      if (proof) {
        const isValid = await verifyMerkleProof(
          proof.leaf,
          proof.root,
          proof.proof,
          proof.positions
        );
        expect(isValid).toBe(true);
      }
    });
  });
});

describe('Selective Disclosure', () => {
  describe('createSelectiveDisclosure', () => {
    it('should create disclosure with all field hashes', async () => {
      const disclosure = await createSelectiveDisclosure(sampleAddress, ['country']);

      expect(disclosure.fields).toContain('recipient');
      expect(disclosure.fields).toContain('street_address');
      expect(disclosure.fields).toContain('country');
      expect(disclosure.hashes).toBeDefined();
      expect(Object.keys(disclosure.hashes).length).toBe(disclosure.fields.length);
    });

    it('should only reveal requested fields', async () => {
      const disclosure = await createSelectiveDisclosure(sampleAddress, ['country', 'postal_code']);

      expect(disclosure.revealed).toBeDefined();
      expect(disclosure.revealed?.country).toBe('Japan');
      expect(disclosure.revealed?.postal_code).toBe('100-0001');
      expect(disclosure.revealed?.recipient).toBeUndefined();
    });
  });

  describe('verifySelectiveDisclosure', () => {
    it('should verify valid disclosure', async () => {
      const disclosure = await createSelectiveDisclosure(sampleAddress, ['country']);
      const result = await verifySelectiveDisclosure(disclosure);

      expect(result.valid).toBe(true);
      expect(result.verified).toContain('country');
    });

    it('should detect tampered revealed values', async () => {
      const disclosure = await createSelectiveDisclosure(sampleAddress, ['country']);
      // Tamper with revealed value
      if (disclosure.revealed) {
        disclosure.revealed.country = 'Tampered';
      }

      const result = await verifySelectiveDisclosure(disclosure);
      expect(result.valid).toBe(false);
    });
  });
});

describe('ZKP Address Proof', () => {
  describe('createZKPAddressProof', () => {
    it('should create valid proof with Pedersen algorithm', async () => {
      const proof = await createZKPAddressProof(sampleAddress, {
        algorithm: 'pedersen',
      });

      expect(proof.type).toBe('zkp_proof');
      expect(proof.version).toBe(2);
      expect(proof.algorithm).toBe('pedersen');
      expect(proof.data.commitment).toBeDefined();
      expect(proof.data.challenge).toBeDefined();
      expect(proof.data.response).toBeDefined();
      expect(proof.signature).toBeDefined();
    });

    it('should create valid proof with Schnorr algorithm', async () => {
      const proof = await createZKPAddressProof(sampleAddress, {
        algorithm: 'schnorr',
      });

      expect(proof.algorithm).toBe('schnorr');
      expect(proof.data.commitment).toBeDefined();
    });

    it('should include selective disclosure when requested', async () => {
      const proof = await createZKPAddressProof(sampleAddress, {
        disclosureFields: ['country', 'postal_code'],
      });

      expect(proof.data.disclosed_fields).toBeDefined();
      expect(proof.data.disclosed_fields?.revealed?.country).toBe('Japan');
      expect(proof.data.disclosed_fields?.revealed?.postal_code).toBe('100-0001');
    });

    it('should set expiration time correctly', async () => {
      const expiresIn = 7200; // 2 hours
      const proof = await createZKPAddressProof(sampleAddress, { expiresIn });

      const expiresAt = new Date(proof.data.expires_at);
      const verifiedAt = new Date(proof.data.verified_at);
      const diff = (expiresAt.getTime() - verifiedAt.getTime()) / 1000;

      expect(diff).toBeCloseTo(expiresIn, -1);
    });
  });

  describe('verifyZKPAddressProof', () => {
    it('should verify valid proof', async () => {
      const secret = randomBytes(32);
      const proof = await createZKPAddressProof(sampleAddress, { secret });

      const result = await verifyZKPAddressProof(proof, { secret });
      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
    });

    it('should detect expired proof', async () => {
      const proof = await createZKPAddressProof(sampleAddress, {
        expiresIn: -1, // Already expired
      });

      const result = await verifyZKPAddressProof(proof);
      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
    });

    it('should verify proof with wrong secret', async () => {
      const proof = await createZKPAddressProof(sampleAddress, {
        secret: 'correct-secret',
      });

      const result = await verifyZKPAddressProof(proof, { secret: 'wrong-secret' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('should verify disclosed fields', async () => {
      const secret = randomBytes(32);
      const proof = await createZKPAddressProof(sampleAddress, {
        secret,
        disclosureFields: ['country'],
      });

      const result = await verifyZKPAddressProof(proof, { secret });
      expect(result.valid).toBe(true);
      expect(result.disclosedFields?.country).toBe('Japan');
    });
  });
});

describe('createAddressHash', () => {
  it('should create consistent hash for same address', async () => {
    const hash1 = await createAddressHash(sampleAddress);
    const hash2 = await createAddressHash(sampleAddress);
    expect(hash1).toBe(hash2);
  });

  it('should create different hash for different addresses', async () => {
    const hash1 = await createAddressHash(sampleAddress);
    const hash2 = await createAddressHash(sampleAddressJapanese);
    expect(hash1).not.toBe(hash2);
  });
});

describe('Convenience Functions', () => {
  describe('createRegionProof', () => {
    it('should create proof revealing only country', async () => {
      const proof = await createRegionProof(sampleAddress);

      expect(proof.data.disclosed_fields?.revealed?.country).toBe('Japan');
      expect(proof.data.disclosed_fields?.revealed?.recipient).toBeUndefined();
    });

    it('should reveal specified fields', async () => {
      const proof = await createRegionProof(sampleAddress, ['country', 'province']);

      expect(proof.data.disclosed_fields?.revealed?.country).toBe('Japan');
      expect(proof.data.disclosed_fields?.revealed?.province).toBe('Tokyo');
    });
  });

  describe('createPostalCodeProof', () => {
    it('should reveal only postal code and country', async () => {
      const proof = await createPostalCodeProof(sampleAddress);

      expect(proof.data.disclosed_fields?.revealed?.postal_code).toBe('100-0001');
      expect(proof.data.disclosed_fields?.revealed?.country).toBe('Japan');
      expect(proof.data.disclosed_fields?.revealed?.recipient).toBeUndefined();
    });
  });
});

describe('Legacy Address Proof (V1)', () => {
  describe('createAddressProof', () => {
    it('should create valid proof', () => {
      const proof = createAddressProof(sampleAddress);

      expect(proof.type).toBe('proof');
      expect(proof.version).toBe(1);
      expect(proof.data.address_hash).toBeDefined();
      expect(proof.signature).toBeDefined();
    });

    it('should include custom proof ID', () => {
      const proof = createAddressProof(sampleAddress, { proofId: 'custom_123' });
      expect(proof.data.proof_id).toBe('custom_123');
    });
  });

  describe('verifyAddressProof', () => {
    it('should verify valid proof', () => {
      const proof = createAddressProof(sampleAddress);
      const result = verifyAddressProof(proof);

      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
    });

    it('should detect expired proof', () => {
      const proof = createAddressProof(sampleAddress, { expiresIn: -1 });
      const result = verifyAddressProof(proof);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
    });

    it('should verify with secret', () => {
      const secret = 'my-secret';
      const proof = createAddressProof(sampleAddress, { secret });
      const result = verifyAddressProof(proof, secret);

      expect(result.valid).toBe(true);
    });
  });
});

describe('Enhanced Address Proof (V2)', () => {
  describe('createAddressProofV2', () => {
    it('should create proof with cryptographic commitment', async () => {
      const proof = await createAddressProofV2(sampleAddress);

      expect(proof.type).toBe('proof');
      expect(proof.version).toBe(2);
      expect(proof.data.address_hash).toHaveLength(64);
      expect(proof.data.commitment).toHaveLength(64);
      expect(proof.data.nonce).toBeDefined();
      expect(proof.signature).toHaveLength(64);
    });
  });

  describe('verifyAddressProofV2', () => {
    it('should verify valid proof', async () => {
      const secret = randomBytes(32);
      const proof = await createAddressProofV2(sampleAddress, { secret });

      const result = await verifyAddressProofV2(proof, { secret });
      expect(result.valid).toBe(true);
      expect(result.expired).toBe(false);
    });

    it('should verify address hash when address is provided', async () => {
      const secret = randomBytes(32);
      const proof = await createAddressProofV2(sampleAddress, { secret });

      const result = await verifyAddressProofV2(proof, {
        secret,
        address: sampleAddress,
      });
      expect(result.valid).toBe(true);
      expect(result.addressVerified).toBe(true);
    });

    it('should detect wrong address', async () => {
      const secret = randomBytes(32);
      const proof = await createAddressProofV2(sampleAddress, { secret });

      const result = await verifyAddressProofV2(proof, {
        secret,
        address: sampleAddressJapanese,
      });
      expect(result.valid).toBe(false);
      expect(result.addressVerified).toBe(false);
    });

    it('should detect expired proof', async () => {
      const proof = await createAddressProofV2(sampleAddress, { expiresIn: -1 });

      const result = await verifyAddressProofV2(proof);
      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
    });

    it('should detect invalid signature', async () => {
      const proof = await createAddressProofV2(sampleAddress, {
        secret: 'correct-secret',
      });

      const result = await verifyAddressProofV2(proof, { secret: 'wrong-secret' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });
  });
});
