/**
 * ZKP Address Protocol - Integration Test Suite
 * 
 * Comprehensive end-to-end tests covering all 4 main flows and 5 ZKP patterns.
 * 
 * This test suite validates:
 * - Flow 1: Address Registration & Authentication
 * - Flow 2: Shipping Request & Waybill Generation
 * - Flow 3: Delivery Execution & Tracking
 * - Flow 4: Address Update & Revocation
 * 
 * And all 5 ZKP patterns:
 * - ZK-Membership Proof
 * - ZK-Structure Proof
 * - ZK-Selective Reveal Proof
 * - ZK-Version Proof
 * - ZK-Locker Proof
 */

import {
  // Flow 1: Registration
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  // Flow 2: Shipping
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  createZKPWaybill,
  // Flow 3: Delivery
  validateAccessPolicy,
  resolvePID,
  createAuditLogEntry,
  createTrackingEvent,
  // Flow 4: Revocation
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  getNewPID,
  signRevocationList,
  // All 5 ZKP Patterns
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
} from '@vey/core';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  errors: [] as string[],
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    results.failed++;
    results.errors.push(`❌ FAILED: ${message}`);
    console.error(`❌ ${message}`);
  } else {
    results.passed++;
    console.log(`✅ ${message}`);
  }
}

async function testFlow1Registration() {
  console.log('\n🧪 Testing Flow 1: Address Registration & Authentication');
  console.log('='.repeat(60));

  try {
    // Test 1.1: Create DID Document
    const userDid = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
    const userPublicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

    const didDoc = createDIDDocument(userDid, userPublicKey);
    assert(didDoc.id === userDid, 'DID Document created with correct ID');
    assert(
      didDoc.verificationMethod?.length === 1,
      'DID Document has verification method'
    );

    // Test 1.2: Create Address PID Credential
    const providerDid = 'did:web:vey.example';
    const pid = 'JP-13-113-01';

    const credential = createAddressPIDCredential(
      userDid,
      providerDid,
      pid,
      'JP',
      '13'
    );
    assert(credential.issuer === providerDid, 'Credential has correct issuer');
    assert(
      credential.credentialSubject.addressPID === pid,
      'Credential contains correct PID'
    );

    // Test 1.3: Sign Credential
    const providerPrivateKey = 'mock-private-key-provider';
    const signedCredential = signCredential(
      credential,
      providerPrivateKey,
      `${providerDid}#key-1`
    );
    assert(signedCredential.proof !== undefined, 'Credential is signed');

    // Test 1.4: Verify Credential
    const providerPublicKey = 'mock-public-key-provider';
    const isValid = verifyCredential(signedCredential, providerPublicKey);
    assert(isValid === true, 'Credential verification succeeds');
  } catch (error) {
    results.failed++;
    results.errors.push(`Flow 1 error: ${error}`);
    console.error('❌ Flow 1 error:', error);
  }
}

async function testFlow2ShippingRequest() {
  console.log('\n🧪 Testing Flow 2: Shipping Request & Waybill Generation');
  console.log('='.repeat(60));

  try {
    const pid = 'JP-13-113-01';
    const addressData = {
      country: 'JP',
      province: '13',
      city: 'Shibuya',
      postal_code: '150-0001',
      street_address: 'Dogenzaka 1-2-3',
    };

    // Test 2.1: Create ZK Circuit
    const circuit = createZKCircuit(
      'test-circuit-v1',
      'Test Circuit',
      'Test shipping validation circuit'
    );
    assert(circuit.circuitId === 'test-circuit-v1', 'ZK Circuit created');

    // Test 2.2: Generate ZK Proof
    const shippingConditions = {
      allowedCountries: ['JP'],
      allowedRegions: ['13'],
    };

    const zkProof = generateZKProof(
      pid,
      shippingConditions,
      circuit,
      addressData
    );
    assert(zkProof.circuitId === circuit.circuitId, 'ZK Proof generated');

    // Test 2.3: Verify ZK Proof
    const proofResult = verifyZKProof(zkProof, circuit);
    assert(proofResult.valid === true, 'ZK Proof verification succeeds');

    // Test 2.4: Validate Shipping Request
    const shippingRequest = {
      pid,
      userSignature: 'mock-signature',
      conditions: shippingConditions,
      requesterId: 'did:web:merchant.example',
      timestamp: new Date().toISOString(),
    };

    const validationResponse = validateShippingRequest(
      shippingRequest,
      circuit,
      addressData
    );
    assert(validationResponse.valid === true, 'Shipping request validated');

    // Test 2.5: Create ZKP Waybill
    const waybillId = 'WB-TEST-001';
    const trackingNumber = 'TN-TEST-001';

    const waybill = createZKPWaybill(
      waybillId,
      pid,
      validationResponse.zkProof!,
      trackingNumber,
      {
        parcelWeight: 2.5,
        parcelSize: '60',
        carrierInfo: { id: 'carrier-001', name: 'Test Carrier' },
      }
    );
    assert(waybill.waybill_id === waybillId, 'ZKP Waybill created');
    assert(waybill.trackingNumber === trackingNumber, 'Waybill has tracking number');
  } catch (error) {
    results.failed++;
    results.errors.push(`Flow 2 error: ${error}`);
    console.error('❌ Flow 2 error:', error);
  }
}

async function testFlow3DeliveryExecution() {
  console.log('\n🧪 Testing Flow 3: Delivery Execution & Tracking');
  console.log('='.repeat(60));

  try {
    const pid = 'JP-13-113-01';
    const carrierDid = 'did:web:carrier.example';
    const addressData = {
      country: 'JP',
      province: '13',
      city: 'Shibuya',
      postal_code: '150-0001',
      street_address: 'Dogenzaka 1-2-3',
    };

    // Test 3.1: Validate Access Policy
    const accessPolicy = {
      id: 'policy-delivery-001',
      principal: carrierDid,
      resource: 'JP-13-*',
      action: 'resolve',
    };

    const hasAccess = validateAccessPolicy(
      accessPolicy,
      carrierDid,
      'resolve'
    );
    assert(hasAccess === true, 'Access policy validation succeeds');

    // Test 3.2: Resolve PID
    const resolutionRequest = {
      pid,
      requesterId: carrierDid,
      accessToken: 'mock-token',
      reason: 'delivery',
      timestamp: new Date().toISOString(),
    };

    const resolution = resolvePID(
      resolutionRequest,
      accessPolicy,
      addressData
    );
    assert(resolution.success === true, 'PID resolution succeeds');
    assert(
      resolution.address?.country === 'JP',
      'Resolved address has correct country'
    );

    // Test 3.3: Create Audit Log
    const auditLog = createAuditLogEntry(
      pid,
      carrierDid,
      'resolve',
      'success',
      { reason: 'delivery' }
    );
    assert(auditLog.pid === pid, 'Audit log created');
    assert(auditLog.result === 'success', 'Audit log records success');

    // Test 3.4: Create Tracking Events
    const trackingNumber = 'TN-TEST-002';
    const trackingEvent = createTrackingEvent(
      trackingNumber,
      'delivered',
      'Package delivered successfully',
      { country: 'JP', city: 'Shibuya' }
    );
    assert(
      trackingEvent.trackingNumber === trackingNumber,
      'Tracking event created'
    );
    assert(trackingEvent.type === 'delivered', 'Tracking event has correct type');
  } catch (error) {
    results.failed++;
    results.errors.push(`Flow 3 error: ${error}`);
    console.error('❌ Flow 3 error:', error);
  }
}

async function testFlow4AddressRevocation() {
  console.log('\n🧪 Testing Flow 4: Address Update & Revocation');
  console.log('='.repeat(60));

  try {
    const oldPid = 'JP-13-113-01';
    const newPid = 'JP-27-101-03';
    const userDid = 'did:key:user123';

    // Test 4.1: Create Revocation Entry
    const revocationEntry = createRevocationEntry(
      oldPid,
      'address_change',
      'User moved to new location'
    );
    assert(revocationEntry.pid === oldPid, 'Revocation entry created');
    assert(revocationEntry.reason === 'address_change', 'Revocation has reason');

    // Test 4.2: Create Revocation List
    const revocationList = createRevocationList(
      'did:web:vey.example',
      [revocationEntry]
    );
    assert(
      revocationList.entries.length === 1,
      'Revocation list created with entries'
    );

    // Test 4.3: Sign Revocation List
    const signedRevocationList = signRevocationList(
      revocationList,
      'mock-private-key'
    );
    assert(
      signedRevocationList.signature !== undefined,
      'Revocation list is signed'
    );

    // Test 4.4: Check if PID is Revoked
    const isRevoked = isPIDRevoked(oldPid, signedRevocationList);
    assert(isRevoked === true, 'Old PID is marked as revoked');

    // Test 4.5: Get New PID
    const retrievedNewPid = getNewPID(oldPid, signedRevocationList);
    assert(
      retrievedNewPid === newPid || retrievedNewPid === null,
      'New PID retrieval works'
    );
  } catch (error) {
    results.failed++;
    results.errors.push(`Flow 4 error: ${error}`);
    console.error('❌ Flow 4 error:', error);
  }
}

async function testZKPPattern1Membership() {
  console.log('\n🧪 Testing ZKP Pattern 1: ZK-Membership Proof');
  console.log('='.repeat(60));

  try {
    const pid = 'JP-13-113-01';
    const circuit = createZKCircuit(
      'membership-v1',
      'Membership Circuit',
      'Proves PID is in valid set'
    );

    // Test: Generate and verify membership proof
    const membershipProof = generateZKMembershipProof(
      pid,
      'merkle-root-example',
      circuit
    );
    assert(membershipProof.proofType === 'membership', 'Membership proof generated');

    const verifyResult = verifyZKMembershipProof(membershipProof, circuit);
    assert(verifyResult.valid === true, 'Membership proof verification succeeds');
  } catch (error) {
    results.failed++;
    results.errors.push(`ZKP Pattern 1 error: ${error}`);
    console.error('❌ ZKP Pattern 1 error:', error);
  }
}

async function testZKPPattern2Structure() {
  console.log('\n🧪 Testing ZKP Pattern 2: ZK-Structure Proof');
  console.log('='.repeat(60));

  try {
    const pidComponents = {
      country: 'JP',
      admin1: '13',
      admin2: '113',
      admin3: '01',
    };
    const circuit = createZKCircuit(
      'structure-v1',
      'Structure Circuit',
      'Validates PID hierarchy'
    );

    // Test: Generate and verify structure proof
    const structureProof = generateZKStructureProof(pidComponents, circuit);
    assert(structureProof.proofType === 'structure', 'Structure proof generated');

    const verifyResult = verifyZKStructureProof(structureProof, circuit);
    assert(verifyResult.valid === true, 'Structure proof verification succeeds');
  } catch (error) {
    results.failed++;
    results.errors.push(`ZKP Pattern 2 error: ${error}`);
    console.error('❌ ZKP Pattern 2 error:', error);
  }
}

async function testZKPPattern3SelectiveReveal() {
  console.log('\n🧪 Testing ZKP Pattern 3: ZK-Selective Reveal Proof');
  console.log('='.repeat(60));

  try {
    const pid = 'JP-13-113-01';
    const fullAddress = {
      country: 'JP',
      province: '13',
      city: 'Shibuya',
      postal_code: '150-0001',
      street_address: 'Dogenzaka 1-2-3',
      building: 'Example Building',
      room: '301',
    };
    const revealFields = ['city', 'postal_code'];
    const circuit = createZKCircuit(
      'selective-v1',
      'Selective Reveal Circuit',
      'Reveals selected fields only'
    );

    // Test: Generate and verify selective reveal proof
    const selectiveProof = generateZKSelectiveRevealProof(
      pid,
      fullAddress,
      revealFields,
      circuit
    );
    assert(
      selectiveProof.proofType === 'selective_reveal',
      'Selective reveal proof generated'
    );

    const verifyResult = verifyZKSelectiveRevealProof(selectiveProof, circuit);
    assert(
      verifyResult.valid === true,
      'Selective reveal proof verification succeeds'
    );
    assert(
      verifyResult.revealedData?.city === 'Shibuya',
      'Revealed city is correct'
    );
    assert(
      verifyResult.revealedData?.postal_code === '150-0001',
      'Revealed postal code is correct'
    );
  } catch (error) {
    results.failed++;
    results.errors.push(`ZKP Pattern 3 error: ${error}`);
    console.error('❌ ZKP Pattern 3 error:', error);
  }
}

async function testZKPPattern4Version() {
  console.log('\n🧪 Testing ZKP Pattern 4: ZK-Version Proof');
  console.log('='.repeat(60));

  try {
    const oldPid = 'JP-13-113-01';
    const newPid = 'JP-27-101-03';
    const circuit = createZKCircuit(
      'version-v1',
      'Version Circuit',
      'Proves PID ownership continuity'
    );

    // Test: Generate and verify version proof
    const versionProof = generateZKVersionProof(oldPid, newPid, circuit);
    assert(versionProof.proofType === 'version', 'Version proof generated');

    const verifyResult = verifyZKVersionProof(versionProof, circuit);
    assert(verifyResult.valid === true, 'Version proof verification succeeds');
  } catch (error) {
    results.failed++;
    results.errors.push(`ZKP Pattern 4 error: ${error}`);
    console.error('❌ ZKP Pattern 4 error:', error);
  }
}

async function testZKPPattern5Locker() {
  console.log('\n🧪 Testing ZKP Pattern 5: ZK-Locker Proof');
  console.log('='.repeat(60));

  try {
    const lockerId = 'LOCKER-SHIBUYA-A-042';
    const facilityId = 'FACILITY-SHIBUYA-STATION';
    const circuit = createZKCircuit(
      'locker-v1',
      'Locker Circuit',
      'Proves locker access rights'
    );

    // Test: Generate and verify locker proof
    const lockerProof = generateZKLockerProof(
      lockerId,
      facilityId,
      'merkle-root-lockers',
      circuit
    );
    assert(lockerProof.proofType === 'locker', 'Locker proof generated');

    const verifyResult = verifyZKLockerProof(lockerProof, circuit);
    assert(verifyResult.valid === true, 'Locker proof verification succeeds');
    assert(
      verifyResult.facilityId === facilityId,
      'Facility ID is revealed correctly'
    );
  } catch (error) {
    results.failed++;
    results.errors.push(`ZKP Pattern 5 error: ${error}`);
    console.error('❌ ZKP Pattern 5 error:', error);
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 ZKP Address Protocol - Integration Test Suite');
  console.log('='.repeat(60));

  // Run all test suites
  await testFlow1Registration();
  await testFlow2ShippingRequest();
  await testFlow3DeliveryExecution();
  await testFlow4AddressRevocation();
  await testZKPPattern1Membership();
  await testZKPPattern2Structure();
  await testZKPPattern3SelectiveReveal();
  await testZKPPattern4Version();
  await testZKPPattern5Locker();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.passed + results.failed}`);
  console.log(
    `🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`
  );

  if (results.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.errors.forEach((error) => console.log(`  ${error}`));
  }

  console.log('\n' + '='.repeat(60));

  // Exit with appropriate code
  if (results.failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('💥 Test suite failed with error:', error);
    process.exit(1);
  });
}

export default runAllTests;
