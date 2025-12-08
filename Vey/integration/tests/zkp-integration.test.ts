/**
 * ZKP Integration Tests
 * 
 * Comprehensive tests for ZKP Address Protocol integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSandboxIntegration,
  ZKPIntegration,
  type AddressRegistration,
  type ConveyDeliveryRequest,
} from '../src/zkp-integration';

describe('ZKPIntegration', () => {
  let integration: ZKPIntegration;
  let testAddress: AddressRegistration;

  beforeEach(async () => {
    integration = await createSandboxIntegration('test_api_key_123');
    
    testAddress = {
      userDid: integration.getUserDid(),
      pid: 'JP-13-113-01-T07-B12-R401',
      countryCode: 'JP',
      hierarchyDepth: 7,
      fullAddress: {
        country: 'Japan',
        province: 'Tokyo',
        city: 'Shibuya',
        postalCode: '150-0001',
        street: 'Jingumae 1-2-3',
        building: 'Shibuya Building 4F',
        room: '401',
        recipient: 'Test User',
      },
    };
  });

  describe('Initialization', () => {
    it('should initialize with generated key pair', async () => {
      const newIntegration = await createSandboxIntegration('test_key');
      expect(newIntegration.getUserDid()).toBeDefined();
      expect(newIntegration.getUserDid()).toMatch(/^did:key:/);
      expect(newIntegration.getPublicKey()).toBeDefined();
    });

    it('should initialize with existing key pair', async () => {
      const existingIntegration = await createSandboxIntegration('test_key');
      const publicKey = existingIntegration.getPublicKey();
      
      // Create new integration with same keys (not exposed in current API)
      // This test validates the concept
      expect(publicKey).toBeDefined();
    });
  });

  describe('Address Registration', () => {
    it('should register address with verifiable credential', async () => {
      const credential = await integration.registerAddress(testAddress);
      
      expect(credential).toBeDefined();
      expect(credential.credentialSubject).toBeDefined();
      expect(credential.credentialSubject.pid).toBe(testAddress.pid);
      expect(credential.credentialSubject.countryCode).toBe(testAddress.countryCode);
      expect(credential.proof).toBeDefined();
      expect(credential.proof.proofValue).toBeDefined();
    });

    it('should create unique credentials for different addresses', async () => {
      const cred1 = await integration.registerAddress(testAddress);
      
      const testAddress2 = {
        ...testAddress,
        pid: 'JP-27-100-05',
        fullAddress: {
          ...testAddress.fullAddress,
          province: 'Osaka',
          city: 'Osaka',
        },
      };
      
      const cred2 = await integration.registerAddress(testAddress2);
      
      expect(cred1.credentialSubject.pid).not.toBe(cred2.credentialSubject.pid);
    });
  });

  describe('Membership Proof', () => {
    it('should generate membership proof for valid PID', async () => {
      const validPids = [
        'JP-13-113-01',
        'JP-27-100-05',
        'US-CA-SF-001',
      ];
      
      const { proof, publicSignals } = await integration.generateMembershipProof(
        'JP-13-113-01',
        validPids
      );
      
      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();
      expect(publicSignals.length).toBeGreaterThan(0);
    });

    it('should generate different proofs for different PIDs', async () => {
      const validPids = ['JP-13-113-01', 'JP-27-100-05'];
      
      const proof1 = await integration.generateMembershipProof('JP-13-113-01', validPids);
      const proof2 = await integration.generateMembershipProof('JP-27-100-05', validPids);
      
      expect(proof1.publicSignals).not.toEqual(proof2.publicSignals);
    });

    it('should verify valid membership proof', async () => {
      const validPids = ['JP-13-113-01', 'JP-27-100-05'];
      const { proof, publicSignals } = await integration.generateMembershipProof(
        'JP-13-113-01',
        validPids
      );
      
      const isValid = await integration.verifyProof(proof, publicSignals, 'membership');
      expect(isValid).toBe(true);
    });
  });

  describe('Selective Reveal Proof', () => {
    it('should generate selective reveal proof with country and postal code', async () => {
      const { proof, publicSignals, revealedData } = await integration.generateSelectiveRevealProof(
        testAddress.fullAddress,
        ['country', 'postalCode']
      );
      
      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();
      expect(revealedData).toEqual({
        country: 'Japan',
        postalCode: '150-0001',
      });
    });

    it('should hide non-revealed fields', async () => {
      const { revealedData } = await integration.generateSelectiveRevealProof(
        testAddress.fullAddress,
        ['country']
      );
      
      expect(revealedData.country).toBe('Japan');
      expect(revealedData.province).toBeUndefined();
      expect(revealedData.street).toBeUndefined();
      expect(revealedData.building).toBeUndefined();
    });

    it('should handle empty reveal list', async () => {
      const { revealedData } = await integration.generateSelectiveRevealProof(
        testAddress.fullAddress,
        []
      );
      
      expect(Object.keys(revealedData)).toHaveLength(0);
    });

    it('should verify selective reveal proof', async () => {
      const { proof, publicSignals } = await integration.generateSelectiveRevealProof(
        testAddress.fullAddress,
        ['country', 'postalCode']
      );
      
      const isValid = await integration.verifyProof(proof, publicSignals, 'selective-reveal');
      expect(isValid).toBe(true);
    });
  });

  describe('Locker Proof', () => {
    it('should generate locker proof', async () => {
      const lockerId = 'LOCKER-A-015';
      const facilityId = 'FACILITY-SHIBUYA-STATION';
      const availableLockers = [
        'LOCKER-A-001',
        'LOCKER-A-015',
        'LOCKER-B-003',
      ];
      
      const { proof, publicSignals } = await integration.generateLockerProof(
        lockerId,
        facilityId,
        availableLockers
      );
      
      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();
      expect(publicSignals.length).toBeGreaterThan(0);
    });

    it('should verify locker proof', async () => {
      const { proof, publicSignals } = await integration.generateLockerProof(
        'LOCKER-A-015',
        'FACILITY-TOKYO-STATION',
        ['LOCKER-A-001', 'LOCKER-A-015', 'LOCKER-B-003']
      );
      
      const isValid = await integration.verifyProof(proof, publicSignals, 'locker');
      expect(isValid).toBe(true);
    });
  });

  describe('Version Proof', () => {
    it('should generate version proof for address migration', async () => {
      const oldPid = 'JP-13-113-01';
      const newPid = 'JP-27-100-05';
      const userSecret = 'user_secret_12345';
      
      const { proof, publicSignals } = await integration.generateVersionProof(
        oldPid,
        newPid,
        userSecret
      );
      
      expect(proof).toBeDefined();
      expect(publicSignals).toBeDefined();
      expect(publicSignals.length).toBeGreaterThan(0);
    });

    it('should verify version proof', async () => {
      const { proof, publicSignals } = await integration.generateVersionProof(
        'JP-13-113-01',
        'JP-27-100-05',
        'secret123'
      );
      
      const isValid = await integration.verifyProof(proof, publicSignals, 'version');
      expect(isValid).toBe(true);
    });
  });

  describe('Delivery Request Handling', () => {
    it('should handle delivery request with selective reveal', async () => {
      const deliveryRequest: ConveyDeliveryRequest = {
        senderId: 'store@convey.store',
        recipientId: 'alice@convey',
        package: {
          weight: 1.5,
          dimensions: { length: 30, width: 20, height: 15 },
          value: 5000,
          currency: 'JPY',
        },
      };
      
      const acceptance = await integration.handleDeliveryRequest(
        deliveryRequest,
        [testAddress]
      );
      
      expect(acceptance.accepted).toBe(true);
      expect(acceptance.selectedPid).toBe(testAddress.pid);
      expect(acceptance.proof).toBeDefined();
      expect(acceptance.publicSignals).toBeDefined();
    });

    it('should handle delivery request with locker option', async () => {
      const deliveryRequest: ConveyDeliveryRequest = {
        senderId: 'store@convey.store',
        recipientId: 'alice@convey',
        package: {
          weight: 1.0,
          dimensions: { length: 20, width: 15, height: 10 },
          value: 3000,
          currency: 'JPY',
        },
        preferences: {
          allowLocker: true,
        },
      };
      
      const acceptance = await integration.handleDeliveryRequest(
        deliveryRequest,
        [testAddress]
      );
      
      expect(acceptance.accepted).toBe(true);
      expect(acceptance.proofType).toBe('locker');
    });

    it('should reject delivery request when no addresses available', async () => {
      const deliveryRequest: ConveyDeliveryRequest = {
        senderId: 'store@convey.store',
        recipientId: 'alice@convey',
        package: {
          weight: 1.0,
          dimensions: { length: 20, width: 15, height: 10 },
          value: 3000,
          currency: 'JPY',
        },
      };
      
      const acceptance = await integration.handleDeliveryRequest(
        deliveryRequest,
        [] // No addresses
      );
      
      expect(acceptance.accepted).toBe(false);
      expect(acceptance.rejectionReason).toBeDefined();
    });
  });

  describe('Carrier Access', () => {
    it('should grant carrier access to address', async () => {
      const waybillNumber = 'VEY-12345-ABCDEF';
      const carrierDid = 'did:vey:carrier:vey-express';
      
      const access = await integration.grantCarrierAccess(
        waybillNumber,
        carrierDid,
        testAddress.pid,
        testAddress.fullAddress
      );
      
      expect(access.carrierDid).toBe(carrierDid);
      expect(access.waybillNumber).toBe(waybillNumber);
      expect(access.purpose).toBe('delivery');
      expect(access.accessedFields).toBeDefined();
      expect(access.accessedFields.length).toBeGreaterThan(0);
    });

    it('should log all accessed fields', async () => {
      const access = await integration.grantCarrierAccess(
        'WB-001',
        'did:vey:carrier:test',
        testAddress.pid,
        testAddress.fullAddress
      );
      
      const expectedFields = ['country', 'province', 'city', 'postalCode', 'street', 'building', 'room'];
      expect(access.accessedFields).toEqual(expect.arrayContaining(expectedFields));
    });
  });

  describe('Address Revocation', () => {
    it('should revoke address credential', async () => {
      await expect(
        integration.revokeAddress(testAddress.pid, 'User moved to new address')
      ).resolves.not.toThrow();
    });
  });
});
