/**
 * Tests for ZKP Address Protocol
 */

import { describe, it, expect } from 'vitest';
import {
  // Flow 1
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  // Flow 2
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  createZKPWaybill,
  // Flow 3
  validateAccessPolicy,
  resolvePID,
  createAuditLogEntry,
  createTrackingEvent,
  // Flow 4
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  getNewPID,
  signRevocationList,
  // Address Provider
  createAddressProvider,
  validateProviderSignature,
  // Multiple ZKP Patterns
  generateZKMembershipProof,
  verifyZKMembershipProof,
  generateZKStructureProof,
  verifyZKStructureProof,
  generateZKSelectiveRevealProof,
  verifyZKSelectiveRevealProof,
  generateZKVersionProof,
  verifyZKVersionProof,
  generateZKLockerProof,
  verifyZKLockerProof,
} from '../src/zkp';

// Import cryptographic utilities
import { generateEd25519KeyPair } from '../src/zkp-crypto';

describe('ZKP Address Protocol - Flow 1: Registration', () => {
  it('should create a DID document', () => {
    const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
    const publicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

    const didDoc = createDIDDocument(did, publicKey);

    expect(didDoc.id).toBe(did);
    expect(didDoc.verificationMethod).toHaveLength(1);
    expect(didDoc.verificationMethod![0].publicKeyMultibase).toBe(publicKey);
    expect(didDoc.authentication).toContain(`${did}#key-1`);
  });

  it('should create an Address PID credential', () => {
    const userDid = 'did:key:user123';
    const issuerDid = 'did:web:vey.example';
    const pid = 'JP-13-113-01';

    const vc = createAddressPIDCredential(
      userDid,
      issuerDid,
      pid,
      'JP',
      '13'
    );

    expect(vc.issuer).toBe(issuerDid);
    expect(vc.credentialSubject.id).toBe(userDid);
    expect(vc.credentialSubject.addressPID).toBe(pid);
    expect(vc.credentialSubject.countryCode).toBe('JP');
    expect(vc.type).toContain('AddressPIDCredential');
  });

  it('should sign and verify a credential', () => {
    const { privateKey, publicKey } = generateEd25519KeyPair();
    
    const vc = createAddressPIDCredential(
      'did:key:user123',
      'did:web:vey.example',
      'JP-13-113-01',
      'JP'
    );

    const signedVC = signCredential(
      vc,
      privateKey, // Use real private key
      'did:web:vey.example#key-1'
    );

    expect(signedVC.proof).toBeDefined();
    expect(signedVC.proof!.type).toBe('Ed25519Signature2020');
    expect(signedVC.proof!.verificationMethod).toBe('did:web:vey.example#key-1');

    const isValid = verifyCredential(signedVC, publicKey); // Use real public key
    expect(isValid).toBe(true);
  });

  it('should set expiration date if provided', () => {
    const expirationDate = new Date('2025-12-31').toISOString();
    const vc = createAddressPIDCredential(
      'did:key:user123',
      'did:web:vey.example',
      'JP-13-113-01',
      'JP',
      '13',
      expirationDate
    );

    expect(vc.expirationDate).toBe(expirationDate);
  });
});

describe('ZKP Address Protocol - Flow 2: Shipping', () => {
  it('should create a ZK circuit', () => {
    const circuit = createZKCircuit(
      'address-validation-v1',
      'Address Validation Circuit',
      'Test circuit'
    );

    expect(circuit.id).toBe('address-validation-v1');
    expect(circuit.name).toBe('Address Validation Circuit');
    expect(circuit.proofType).toBe('groth16');
    expect(circuit.description).toBe('Test circuit');
  });

  it('should generate a ZK proof', () => {
    const circuit = createZKCircuit('test-circuit', 'Test Circuit');
    const pid = 'JP-13-113-01';
    const conditions = {
      allowedCountries: ['JP'],
      allowedRegions: ['13'],
    };
    const addressData = {
      country: 'JP',
      province: '13',
      city: 'Shibuya',
    };

    const proof = generateZKProof(pid, conditions, circuit, addressData);

    expect(proof.circuitId).toBe(circuit.id);
    expect(proof.proofType).toBe('groth16');
    expect(proof.publicInputs.pid).toBe(pid);
    expect(proof.timestamp).toBeDefined();
  });

  it('should verify a ZK proof', () => {
    const circuit = createZKCircuit('test-circuit', 'Test Circuit');
    const proof = generateZKProof(
      'JP-13-113-01',
      { allowedCountries: ['JP'] },
      circuit,
      { country: 'JP' }
    );

    const result = verifyZKProof(proof, circuit);

    expect(result.valid).toBe(true);
    expect(result.circuitId).toBe(circuit.id);
    expect(result.publicInputs).toBeDefined();
  });

  it('should validate shipping request and generate proof', () => {
    const circuit = createZKCircuit('test-circuit', 'Test Circuit');
    const request = {
      pid: 'JP-13-113-01',
      userSignature: 'signature',
      conditions: {
        allowedCountries: ['JP'],
        allowedRegions: ['13'],
      },
      requesterId: 'did:web:ec-site.example',
      timestamp: new Date().toISOString(),
    };
    const addressData = {
      country: 'JP',
      province: '13',
      city: 'Shibuya',
    };

    const response = validateShippingRequest(request, circuit, addressData);

    expect(response.valid).toBe(true);
    expect(response.zkProof).toBeDefined();
    expect(response.pidToken).toBeDefined();
  });

  it('should reject invalid shipping conditions', () => {
    const circuit = createZKCircuit('test-circuit', 'Test Circuit');
    const request = {
      pid: 'JP-13-113-01',
      userSignature: 'signature',
      conditions: {
        allowedCountries: ['US'], // Wrong country
      },
      requesterId: 'did:web:ec-site.example',
      timestamp: new Date().toISOString(),
    };
    const addressData = {
      country: 'JP',
      province: '13',
    };

    const response = validateShippingRequest(request, circuit, addressData);

    expect(response.valid).toBe(false);
    expect(response.error).toBeDefined();
  });

  it('should create a ZKP waybill', () => {
    const circuit = createZKCircuit('test-circuit', 'Test Circuit');
    const zkProof = generateZKProof(
      'JP-13-113-01',
      { allowedCountries: ['JP'] },
      circuit,
      { country: 'JP' }
    );

    const waybill = createZKPWaybill(
      'WB-001',
      'JP-13-113-01',
      zkProof,
      'TN-001',
      {
        parcelWeight: 2.5,
        parcelSize: '60',
        carrierInfo: { id: 'carrier-1', name: 'Test Carrier' },
      }
    );

    expect(waybill.waybill_id).toBe('WB-001');
    expect(waybill.addr_pid).toBe('JP-13-113-01');
    expect(waybill.trackingNumber).toBe('TN-001');
    expect(waybill.zkProof).toEqual(zkProof);
    expect(waybill.parcel_weight).toBe(2.5);
  });
});

describe('ZKP Address Protocol - Flow 3: Delivery', () => {
  it('should validate access policy', () => {
    const policy = {
      id: 'policy-001',
      principal: 'did:web:carrier.example',
      resource: 'JP-13-*',
      action: 'resolve',
    };

    const isValid = validateAccessPolicy(
      policy,
      'did:web:carrier.example',
      'resolve'
    );
    expect(isValid).toBe(true);

    const isInvalid = validateAccessPolicy(
      policy,
      'did:web:unauthorized.example',
      'resolve'
    );
    expect(isInvalid).toBe(false);
  });

  it('should resolve PID with valid access', () => {
    const request = {
      pid: 'JP-13-113-01',
      requesterId: 'did:web:carrier.example',
      accessToken: 'token',
      reason: 'delivery',
      timestamp: new Date().toISOString(),
    };
    const policy = {
      id: 'policy-001',
      principal: 'did:web:carrier.example',
      resource: 'JP-13-*',
      action: 'resolve',
    };
    const addressData = {
      country: 'JP',
      province: '13',
      city: 'Shibuya',
    };

    const response = resolvePID(request, policy, addressData);

    expect(response.success).toBe(true);
    expect(response.address).toEqual(addressData);
    expect(response.accessLogId).toBeDefined();
  });

  it('should deny PID resolution with invalid access', () => {
    const request = {
      pid: 'JP-13-113-01',
      requesterId: 'did:web:unauthorized.example',
      accessToken: 'token',
      reason: 'delivery',
      timestamp: new Date().toISOString(),
    };
    const policy = {
      id: 'policy-001',
      principal: 'did:web:carrier.example',
      resource: 'JP-13-*',
      action: 'resolve',
    };
    const addressData = {
      country: 'JP',
    };

    const response = resolvePID(request, policy, addressData);

    expect(response.success).toBe(false);
    expect(response.error).toBe('Access denied');
  });

  it('should create audit log entry', () => {
    const log = createAuditLogEntry(
      'JP-13-113-01',
      'did:web:carrier.example',
      'resolve',
      'success',
      { reason: 'delivery' }
    );

    expect(log.pid).toBe('JP-13-113-01');
    expect(log.accessor).toBe('did:web:carrier.example');
    expect(log.action).toBe('resolve');
    expect(log.result).toBe('success');
    expect(log.metadata).toEqual({ reason: 'delivery' });
  });

  it('should create tracking event', () => {
    const event = createTrackingEvent(
      'TN-001',
      'delivered',
      'Package delivered',
      { country: 'JP', city: 'Shibuya' }
    );

    expect(event.trackingNumber).toBe('TN-001');
    expect(event.type).toBe('delivered');
    expect(event.description).toBe('Package delivered');
    expect(event.location).toEqual({ country: 'JP', city: 'Shibuya' });
  });
});

describe('ZKP Address Protocol - Flow 4: Revocation', () => {
  it('should create revocation entry', () => {
    const entry = createRevocationEntry(
      'JP-13-113-01',
      'address_change',
      'JP-14-201-05'
    );

    expect(entry.pid).toBe('JP-13-113-01');
    expect(entry.reason).toBe('address_change');
    expect(entry.newPid).toBe('JP-14-201-05');
    expect(entry.revokedAt).toBeDefined();
  });

  it('should create revocation list', () => {
    const entry = createRevocationEntry('JP-13-113-01', 'address_change');
    const list = createRevocationList('did:web:vey.example', [entry]);

    expect(list.issuer).toBe('did:web:vey.example');
    expect(list.version).toBe(1);
    expect(list.entries).toHaveLength(1);
    expect(list.entries[0]).toEqual(entry);
  });

  it('should increment version for updated list', () => {
    const entry1 = createRevocationEntry('JP-13-113-01', 'address_change');
    const list1 = createRevocationList('did:web:vey.example', [entry1]);

    const entry2 = createRevocationEntry('JP-14-201-05', 'user_request');
    const list2 = createRevocationList('did:web:vey.example', [entry2], list1);

    expect(list2.version).toBe(2);
  });

  it('should check if PID is revoked', () => {
    const entry = createRevocationEntry('JP-13-113-01', 'address_change');
    const list = createRevocationList('did:web:vey.example', [entry]);

    expect(isPIDRevoked('JP-13-113-01', list)).toBe(true);
    expect(isPIDRevoked('JP-14-201-05', list)).toBe(false);
  });

  it('should get new PID for revoked address', () => {
    const entry = createRevocationEntry(
      'JP-13-113-01',
      'address_change',
      'JP-14-201-05'
    );
    const list = createRevocationList('did:web:vey.example', [entry]);

    const newPid = getNewPID('JP-13-113-01', list);
    expect(newPid).toBe('JP-14-201-05');

    const noNewPid = getNewPID('JP-99-999-99', list);
    expect(noNewPid).toBeUndefined();
  });

  it('should sign revocation list', () => {
    const { privateKey } = generateEd25519KeyPair();
    
    const entry = createRevocationEntry('JP-13-113-01', 'address_change');
    const list = createRevocationList('did:web:vey.example', [entry]);

    const signedList = signRevocationList(
      list,
      privateKey, // Use real private key
      'did:web:vey.example#key-1'
    );

    expect(signedList.proof).toBeDefined();
    expect(signedList.proof!.type).toBe('Ed25519Signature2020');
  });
});

describe('ZKP Address Protocol - Address Provider', () => {
  it('should create address provider', () => {
    const circuit = createZKCircuit('test-circuit', 'Test Circuit');
    const provider = createAddressProvider(
      'vey-provider',
      'Vey Address Provider',
      'did:web:vey.example',
      'verification-key',
      'https://api.vey.example',
      [circuit]
    );

    expect(provider.id).toBe('vey-provider');
    expect(provider.name).toBe('Vey Address Provider');
    expect(provider.did).toBe('did:web:vey.example');
    expect(provider.circuits).toHaveLength(1);
    expect(provider.endpoint).toBe('https://api.vey.example');
  });

  it('should validate provider signature', () => {
    const circuit = createZKCircuit('test-circuit', 'Test Circuit');
    const provider = createAddressProvider(
      'vey-provider',
      'Vey',
      'did:web:vey.example',
      'verification-key',
      'https://api.vey.example',
      [circuit]
    );

    const isValid = validateProviderSignature(
      { data: 'test' },
      'signature',
      provider
    );

    expect(isValid).toBe(true);
  });
});

describe('ZKP Address Protocol - Multiple Patterns', () => {
  describe('Pattern 1: ZK-Membership Proof (Address Existence)', () => {
    it('should generate a membership proof', () => {
      const circuit = createZKCircuit(
        'membership-circuit-v1',
        'Membership Circuit'
      );
      const pid = 'JP-13-113-01-T07-B12';
      const validPids = [
        'JP-13-113-01-T07-B12',
        'JP-14-201-05-T03-B08',
        'US-CA-90210-W01-S05',
        'GB-ENG-W1A-1AA-B12',
      ];

      const proof = generateZKMembershipProof(pid, validPids, circuit);

      expect(proof.patternType).toBe('membership');
      expect(proof.circuitId).toBe(circuit.id);
      expect(proof.merkleRoot).toBeDefined();
      expect(proof.merklePath).toBeDefined();
      expect(proof.leafIndex).toBeGreaterThanOrEqual(0);
    });

    it('should verify a membership proof', () => {
      const circuit = createZKCircuit('membership-circuit-v1', 'Membership Circuit');
      const pid = 'JP-13-113-01';
      const validPids = ['JP-13-113-01', 'JP-14-201-05', 'US-CA-90210'];

      const proof = generateZKMembershipProof(pid, validPids, circuit);
      const result = verifyZKMembershipProof(proof, circuit, proof.merkleRoot);

      expect(result.valid).toBe(true);
      expect(result.circuitId).toBe(circuit.id);
    });

    it('should reject membership proof with wrong Merkle root', () => {
      const circuit = createZKCircuit('membership-circuit-v1', 'Membership Circuit');
      const proof = generateZKMembershipProof(
        'JP-13-113-01',
        ['JP-13-113-01', 'JP-14-201-05'],
        circuit
      );

      const result = verifyZKMembershipProof(proof, circuit, 'wrong-merkle-root');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Merkle root mismatch');
    });
  });

  describe('Pattern 2: ZK-Structure Proof (PID Hierarchy)', () => {
    it('should generate a structure proof', () => {
      const circuit = createZKCircuit('structure-circuit-v1', 'Structure Circuit');
      const pid = 'JP-13-113-01-T07-B12-BN02-R342';

      const proof = generateZKStructureProof(pid, 'JP', 8, circuit);

      expect(proof.patternType).toBe('structure');
      expect(proof.countryCode).toBe('JP');
      expect(proof.hierarchyDepth).toBe(8);
      expect(proof.rulesHash).toBeDefined();
    });

    it('should verify a structure proof', () => {
      const circuit = createZKCircuit('structure-circuit-v1', 'Structure Circuit');
      const proof = generateZKStructureProof('JP-13-113-01', 'JP', 4, circuit);

      const result = verifyZKStructureProof(proof, circuit, 'JP');

      expect(result.valid).toBe(true);
      expect(result.publicInputs).toBeDefined();
    });

    it('should reject structure proof with wrong country', () => {
      const circuit = createZKCircuit('structure-circuit-v1', 'Structure Circuit');
      const proof = generateZKStructureProof('JP-13-113-01', 'JP', 4, circuit);

      const result = verifyZKStructureProof(proof, circuit, 'US');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Country code mismatch');
    });
  });

  describe('Pattern 3: ZK-Selective Reveal Proof (Partial Disclosure)', () => {
    it('should generate a selective reveal proof', () => {
      const circuit = createZKCircuit('selective-reveal-v1', 'Selective Reveal');
      const fullAddress = {
        country: 'JP',
        province: '13',
        city: 'Shibuya',
        postal_code: '150-0001',
        street_address: 'Dogenzaka 1-2-3',
      };

      const proof = generateZKSelectiveRevealProof(
        'JP-13-113-01',
        fullAddress,
        ['country', 'postal_code'],
        circuit
      );

      expect(proof.patternType).toBe('selective-reveal');
      expect(proof.revealedFields).toEqual(['country', 'postal_code']);
      expect(proof.revealedValues).toEqual({
        country: 'JP',
        postal_code: '150-0001',
      });
      expect(proof.disclosureNonce).toBeDefined();
    });

    it('should verify a selective reveal proof', () => {
      const circuit = createZKCircuit('selective-reveal-v1', 'Selective Reveal');
      const fullAddress = {
        country: 'JP',
        province: '13',
        city: 'Shibuya',
      };

      const proof = generateZKSelectiveRevealProof(
        'JP-13-113-01',
        fullAddress,
        ['country'],
        circuit
      );

      const result = verifyZKSelectiveRevealProof(proof, circuit);

      expect(result.valid).toBe(true);
      expect(result.revealedData).toEqual({ country: 'JP' });
    });

    it('should handle empty revealed fields gracefully', () => {
      const circuit = createZKCircuit('selective-reveal-v1', 'Selective Reveal');
      const fullAddress = { country: 'JP' };

      const proof = generateZKSelectiveRevealProof(
        'JP-13-113-01',
        fullAddress,
        ['nonexistent_field'],
        circuit
      );

      expect(proof.revealedValues).toEqual({});
    });
  });

  describe('Pattern 4: ZK-Version Proof (Address Update)', () => {
    it('should generate a version proof', () => {
      const circuit = createZKCircuit('version-circuit-v1', 'Version Circuit');
      const oldPid = 'JP-13-113-01-T07-B12';
      const newPid = 'JP-14-201-05-T03-B08';
      const userDid = 'did:key:user123';

      const proof = generateZKVersionProof(oldPid, newPid, userDid, circuit);

      expect(proof.patternType).toBe('version');
      expect(proof.oldPid).toBe(oldPid);
      expect(proof.newPid).toBe(newPid);
      expect(proof.migrationTimestamp).toBeDefined();
      expect(proof.ownershipProof).toBeDefined();
    });

    it('should verify a version proof', () => {
      const circuit = createZKCircuit('version-circuit-v1', 'Version Circuit');
      const oldPid = 'JP-13-113-01';
      const newPid = 'JP-14-201-05';

      const proof = generateZKVersionProof(oldPid, newPid, 'did:key:user123', circuit);

      // Create revocation list with old PID
      const revocationEntry = createRevocationEntry(oldPid, 'address_change', newPid);
      const revocationList = createRevocationList('did:web:vey.example', [revocationEntry]);

      const result = verifyZKVersionProof(proof, circuit, revocationList);

      expect(result.valid).toBe(true);
    });

    it('should reject version proof if old PID not revoked', () => {
      const circuit = createZKCircuit('version-circuit-v1', 'Version Circuit');
      const proof = generateZKVersionProof(
        'JP-13-113-01',
        'JP-14-201-05',
        'did:key:user123',
        circuit
      );

      // Create empty revocation list (old PID not revoked)
      const revocationList = createRevocationList('did:web:vey.example', []);

      const result = verifyZKVersionProof(proof, circuit, revocationList);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Old PID not revoked');
    });
  });

  describe('Pattern 5: ZK-Locker Proof (Locker Membership)', () => {
    it('should generate a locker proof', () => {
      const circuit = createZKCircuit('locker-circuit-v1', 'Locker Circuit');
      const lockerId = 'LOCKER-A-042';
      const facilityId = 'FACILITY-SHIBUYA-STATION';
      const availableLockers = [
        'LOCKER-A-001',
        'LOCKER-A-042',
        'LOCKER-A-099',
        'LOCKER-B-015',
      ];

      const proof = generateZKLockerProof(
        lockerId,
        facilityId,
        availableLockers,
        circuit,
        'KANTO-TOKYO-SHIBUYA'
      );

      expect(proof.patternType).toBe('locker');
      expect(proof.facilityId).toBe(facilityId);
      expect(proof.zone).toBe('KANTO-TOKYO-SHIBUYA');
      expect(proof.lockerSetRoot).toBeDefined();
    });

    it('should verify a locker proof', () => {
      const circuit = createZKCircuit('locker-circuit-v1', 'Locker Circuit');
      const availableLockers = ['LOCKER-A-001', 'LOCKER-A-042'];

      const proof = generateZKLockerProof(
        'LOCKER-A-042',
        'FACILITY-001',
        availableLockers,
        circuit
      );

      const result = verifyZKLockerProof(proof, circuit, 'FACILITY-001');

      expect(result.valid).toBe(true);
    });

    it('should reject locker proof with wrong facility ID', () => {
      const circuit = createZKCircuit('locker-circuit-v1', 'Locker Circuit');
      const proof = generateZKLockerProof(
        'LOCKER-A-042',
        'FACILITY-001',
        ['LOCKER-A-042'],
        circuit
      );

      const result = verifyZKLockerProof(proof, circuit, 'FACILITY-999');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Facility ID mismatch');
    });

    it('should work without zone specification', () => {
      const circuit = createZKCircuit('locker-circuit-v1', 'Locker Circuit');
      const proof = generateZKLockerProof(
        'LOCKER-A-001',
        'FACILITY-001',
        ['LOCKER-A-001'],
        circuit
      );

      expect(proof.zone).toBeUndefined();
      expect(proof.facilityId).toBe('FACILITY-001');
    });
  });
});
