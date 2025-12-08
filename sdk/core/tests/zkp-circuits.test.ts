/**
 * Tests for ZKP Circuit Integration
 * 
 * NOTE: These tests require compiled circuits and generated keys.
 * Run `npm run setup:circuits` before running these tests.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateCircomMembershipProof,
  verifyCircomMembershipProof,
  generateCircomStructureProof,
  verifyCircomStructureProof,
  generateCircomSelectiveRevealProof,
  verifyCircomSelectiveRevealProof,
  generateCircomVersionProof,
  verifyCircomVersionProof,
  generateCircomLockerProof,
  verifyCircomLockerProof,
  serializeProof,
  deserializeProof,
} from '../src/zkp-circuits';

// Skip these tests if circuits are not compiled
const CIRCUITS_AVAILABLE = process.env.SKIP_CIRCUIT_TESTS !== 'true';

describe('ZKP Circuit Integration', () => {
  beforeAll(() => {
    if (!CIRCUITS_AVAILABLE) {
      console.warn('⚠️  Skipping circuit tests - circuits not compiled');
      console.warn('   Run: npm run setup:circuits');
    }
  });

  describe('Membership Proof Circuit', () => {
    it.skipIf(!CIRCUITS_AVAILABLE)('should generate and verify membership proof', async () => {
      const validPids = [
        'JP-13-113-01-T07-B12',
        'JP-14-201-05-T03-B08',
        'US-CA-90210-W01-S05',
        'GB-ENG-W1A-1AA-B12',
      ];
      const targetPid = 'JP-13-113-01-T07-B12';

      const { proof, publicSignals } = await generateCircomMembershipProof(
        targetPid,
        validPids
      );

      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();
      expect(publicSignals.length).toBeGreaterThan(0);

      const isValid = await verifyCircomMembershipProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);

    it.skipIf(!CIRCUITS_AVAILABLE)('should reject invalid membership proof', async () => {
      const validPids = ['PID-1', 'PID-2', 'PID-3'];
      const targetPid = 'PID-1';

      const { proof, publicSignals } = await generateCircomMembershipProof(
        targetPid,
        validPids
      );

      // Tamper with proof
      const tamperedProof = JSON.parse(JSON.stringify(proof));
      if (typeof tamperedProof === 'object' && tamperedProof.pi_a) {
        tamperedProof.pi_a[0] = '12345';
      }

      const isValid = await verifyCircomMembershipProof(tamperedProof, publicSignals);
      expect(isValid).toBe(false);
    }, 30000);
  });

  describe('Structure Proof Circuit', () => {
    it.skipIf(!CIRCUITS_AVAILABLE)('should generate and verify structure proof', async () => {
      const pid = 'JP-13-113-01-T07-B12';
      const countryCode = 'JP';
      const hierarchyDepth = 6;

      const { proof, publicSignals } = await generateCircomStructureProof(
        pid,
        countryCode,
        hierarchyDepth
      );

      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();

      const isValid = await verifyCircomStructureProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);

    it.skipIf(!CIRCUITS_AVAILABLE)('should validate PID with different depths', async () => {
      const pid = 'JP-13-113-01';
      const countryCode = 'JP';
      const hierarchyDepth = 4;

      const { proof, publicSignals } = await generateCircomStructureProof(
        pid,
        countryCode,
        hierarchyDepth
      );

      const isValid = await verifyCircomStructureProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);
  });

  describe('Selective Reveal Proof Circuit', () => {
    it.skipIf(!CIRCUITS_AVAILABLE)('should generate proof revealing selected fields', async () => {
      const fieldValues = [
        'JP',                    // country
        'Tokyo',                 // province
        'Shibuya',              // city
        '150-0001',             // postal_code
        'Dogenzaka 1-2-3',      // street
        'Building A',           // building
        'Room 101',             // room
        'John Doe',             // recipient
      ];
      const fieldsToReveal = [0, 3]; // Reveal country and postal_code only
      const nonce = 'random-nonce-12345';

      const { proof, publicSignals } = await generateCircomSelectiveRevealProof(
        fieldValues,
        fieldsToReveal,
        nonce
      );

      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();

      const isValid = await verifyCircomSelectiveRevealProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);

    it.skipIf(!CIRCUITS_AVAILABLE)('should reveal no fields when mask is empty', async () => {
      const fieldValues = ['JP', 'Tokyo', 'Shibuya', '150-0001'];
      const fieldsToReveal: number[] = []; // Reveal nothing
      const nonce = 'nonce-98765';

      const { proof, publicSignals } = await generateCircomSelectiveRevealProof(
        fieldValues,
        fieldsToReveal,
        nonce
      );

      const isValid = await verifyCircomSelectiveRevealProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);
  });

  describe('Version Proof Circuit', () => {
    it.skipIf(!CIRCUITS_AVAILABLE)('should prove address migration consistency', async () => {
      const oldPid = 'JP-13-113-01-T07-B12';
      const newPid = 'JP-14-201-05-T03-B08';
      const userSecret = 'user-secret-key-abc123';
      const nonce = 'migration-nonce-xyz789';

      const { proof, publicSignals } = await generateCircomVersionProof(
        oldPid,
        newPid,
        userSecret,
        nonce
      );

      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();

      const isValid = await verifyCircomVersionProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);

    it.skipIf(!CIRCUITS_AVAILABLE)('should link multiple address versions', async () => {
      const userSecret = 'consistent-user-secret';
      
      // First migration
      const { proof: proof1, publicSignals: signals1 } = await generateCircomVersionProof(
        'PID-V1',
        'PID-V2',
        userSecret,
        'nonce-1'
      );
      
      expect(await verifyCircomVersionProof(proof1, signals1)).toBe(true);
      
      // Second migration (same user)
      const { proof: proof2, publicSignals: signals2 } = await generateCircomVersionProof(
        'PID-V2',
        'PID-V3',
        userSecret,
        'nonce-2'
      );
      
      expect(await verifyCircomVersionProof(proof2, signals2)).toBe(true);
    }, 30000);
  });

  describe('Locker Proof Circuit', () => {
    it.skipIf(!CIRCUITS_AVAILABLE)('should prove locker access without revealing locker ID', async () => {
      const facilityId = 'FACILITY-SHIBUYA-STATION';
      const availableLockers = [
        'LOCKER-A-001',
        'LOCKER-A-042',
        'LOCKER-A-099',
        'LOCKER-B-015',
      ];
      const lockerId = 'LOCKER-A-042';
      const nonce = 'access-nonce-123';

      const { proof, publicSignals } = await generateCircomLockerProof(
        lockerId,
        facilityId,
        availableLockers,
        nonce
      );

      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();

      const isValid = await verifyCircomLockerProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);

    it.skipIf(!CIRCUITS_AVAILABLE)('should handle large locker sets', async () => {
      const facilityId = 'LARGE-FACILITY';
      
      // Generate 100 locker IDs
      const availableLockers = Array.from({ length: 100 }, (_, i) => 
        `LOCKER-${String(i).padStart(3, '0')}`
      );
      
      const lockerId = availableLockers[50]; // Middle locker
      const nonce = 'access-nonce-456';

      const { proof, publicSignals } = await generateCircomLockerProof(
        lockerId,
        facilityId,
        availableLockers,
        nonce
      );

      const isValid = await verifyCircomLockerProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);
  });

  describe('Proof Serialization', () => {
    it('should serialize and deserialize proofs', () => {
      const mockProof = {
        pi_a: ['123', '456', '789'],
        pi_b: [['111', '222'], ['333', '444'], ['555', '666']],
        pi_c: ['777', '888', '999'],
        protocol: 'groth16',
      };

      const serialized = serializeProof(mockProof);
      expect(typeof serialized).toBe('string');

      const deserialized = deserializeProof(serialized);
      expect(deserialized).toEqual(mockProof);
    });
  });

  describe('Performance Benchmarks', () => {
    it.skipIf(!CIRCUITS_AVAILABLE)('should generate membership proof in reasonable time', async () => {
      const validPids = Array.from({ length: 100 }, (_, i) => `PID-${i}`);
      const targetPid = 'PID-50';

      const startTime = Date.now();
      const { proof, publicSignals } = await generateCircomMembershipProof(
        targetPid,
        validPids
      );
      const endTime = Date.now();

      const duration = endTime - startTime;
      console.log(`Membership proof generation: ${duration}ms`);
      
      // Should complete within 5 seconds (target: <1s for production)
      expect(duration).toBeLessThan(5000);
      
      const isValid = await verifyCircomMembershipProof(proof, publicSignals);
      expect(isValid).toBe(true);
    }, 30000);

    it.skipIf(!CIRCUITS_AVAILABLE)('should verify proof quickly', async () => {
      const validPids = ['PID-1', 'PID-2', 'PID-3'];
      const { proof, publicSignals } = await generateCircomMembershipProof(
        'PID-1',
        validPids
      );

      const startTime = Date.now();
      const isValid = await verifyCircomMembershipProof(proof, publicSignals);
      const endTime = Date.now();

      const duration = endTime - startTime;
      console.log(`Proof verification: ${duration}ms`);
      
      // Verification should be very fast (<50ms target)
      expect(duration).toBeLessThan(100);
      expect(isValid).toBe(true);
    }, 30000);
  });
});
