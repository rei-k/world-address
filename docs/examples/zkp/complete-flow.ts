/**
 * Example: Complete ZKP Address Protocol Flow
 * 
 * This example demonstrates all four flows of the ZKP Address Protocol:
 * 1. Address Registration & Authentication
 * 2. Shipping Request & Waybill Generation
 * 3. Delivery Execution & Tracking
 * 4. Address Update & Revocation
 */

import {
  // Flow 1: Registration
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  // Flow 2: Shipping
  createZKCircuit,
  validateShippingRequest,
  createZKPWaybill,
  verifyZKProof,
  // Flow 3: Delivery
  validateAccessPolicy,
  resolvePID,
  createAuditLogEntry,
  createTrackingEvent,
  // Flow 4: Revocation
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  signRevocationList,
  // Types
  type ShippingCondition,
  type AddressInput,
  type AccessControlPolicy,
} from '@vey/core';

// ============================================================================
// Flow 1: Address Registration & Authentication
// ============================================================================

console.log('=== Flow 1: Address Registration & Authentication ===\n');

// Step 1: Create user's DID
const userDid = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const userPublicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const userPrivateKey = 'user-private-key-here'; // In production, store securely

const userDIDDocument = createDIDDocument(userDid, userPublicKey);
console.log('User DID Document created:', userDIDDocument.id);

// Step 2: User submits their address to the Address Provider
const userAddress: AddressInput = {
  country: 'JP',
  province: '東京都',
  city: '渋谷区',
  ward: '道玄坂',
  street_address: '1-2-3',
  building: 'ビルA',
  room: '342',
  postal_code: '150-0043',
  recipient: '山田太郎',
};

// Step 3: Address Provider normalizes the address and generates PID
// (This would be done by the provider's normalization engine)
const normalizedPID = 'JP-13-113-01-T07-B12-BN02-R342';
console.log('Generated PID:', normalizedPID);

// Step 4: Address Provider issues a Verifiable Credential
const providerDid = 'did:web:vey.example';
const providerPrivateKey = 'provider-private-key-here';

const addressVC = createAddressPIDCredential(
  userDid,
  providerDid,
  normalizedPID,
  'JP',
  '13',
  new Date('2025-12-31').toISOString()
);

// Step 5: Provider signs the VC
const signedAddressVC = signCredential(
  addressVC,
  providerPrivateKey,
  `${providerDid}#key-1`
);

console.log('Address VC issued and signed');
console.log('VC ID:', signedAddressVC.id);
console.log('Expiration:', signedAddressVC.expirationDate);

// Step 6: User verifies the VC
const providerPublicKey = 'provider-public-key-here';
const isValid = verifyCredential(signedAddressVC, providerPublicKey);
console.log('VC verification:', isValid ? 'Valid' : 'Invalid');

console.log('\n');

// ============================================================================
// Flow 2: Shipping Request & Waybill Generation
// ============================================================================

console.log('=== Flow 2: Shipping Request & Waybill Generation ===\n');

// Step 1: EC site defines shipping conditions
const shippingConditions: ShippingCondition = {
  allowedCountries: ['JP'],
  allowedRegions: ['13', '14', '27'], // Tokyo, Kanagawa, Osaka
  maxWeight: 30, // kg
  maxDimensions: {
    length: 100,
    width: 60,
    height: 60,
    unit: 'cm',
  },
};

console.log('Shipping conditions:', shippingConditions);

// Step 2: User selects an address to use and signs consent
const userSignature = 'user-signature-consenting-to-use-this-address';

// Step 3: EC site requests validation from Address Provider
const validationRequest = {
  pid: normalizedPID,
  userSignature,
  conditions: shippingConditions,
  requesterId: 'did:web:ec-site.example',
  timestamp: new Date().toISOString(),
};

// Step 4: Address Provider creates ZK circuit (if not already exists)
const circuit = createZKCircuit(
  'address-validation-v1',
  'Address Validation Circuit v1.0',
  'Validates address against shipping conditions using ZK proof'
);

console.log('ZK Circuit:', circuit.name);

// Step 5: Address Provider validates and generates ZK proof
const validationResponse = validateShippingRequest(
  validationRequest,
  circuit,
  userAddress
);

if (validationResponse.valid && validationResponse.zkProof) {
  console.log('Shipping validation: PASSED');
  console.log('ZK Proof generated');
  console.log('PID Token:', validationResponse.pidToken);

  // Step 6: EC site verifies the ZK proof
  const verificationResult = verifyZKProof(validationResponse.zkProof, circuit);
  console.log('ZK Proof verification:', verificationResult.valid ? 'Valid' : 'Invalid');

  // Step 7: EC site creates a waybill with ZK proof
  const waybill = createZKPWaybill(
    'WB-20241202-001',
    normalizedPID,
    validationResponse.zkProof,
    'TN-20241202-001',
    {
      parcelWeight: 2.5,
      parcelSize: '60',
      carrierZone: 'KANTO-01',
      senderName: 'Online Store Inc.',
      recipientName: '山田太郎',
      carrierInfo: {
        id: 'carrier-yamato',
        name: 'Yamato Transport',
      },
    }
  );

  console.log('Waybill created:', waybill.waybill_id);
  console.log('Tracking number:', waybill.trackingNumber);
} else {
  console.log('Shipping validation: FAILED');
  console.log('Error:', validationResponse.error);
}

console.log('\n');

// ============================================================================
// Flow 3: Delivery Execution & Tracking
// ============================================================================

console.log('=== Flow 3: Delivery Execution & Tracking ===\n');

// Step 1: Define access control policy for carrier
const carrierAccessPolicy: AccessControlPolicy = {
  id: 'policy-carrier-yamato-001',
  principal: 'did:web:carrier-yamato.example',
  resource: 'JP-13-113-01-*', // Can access PIDs in this region
  action: 'resolve',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
};

console.log('Carrier access policy created');
console.log('Allowed resource pattern:', carrierAccessPolicy.resource);

// Step 2: Carrier's delivery driver requests address resolution
const pidResolutionRequest = {
  pid: normalizedPID,
  requesterId: 'did:web:carrier-yamato.example',
  accessToken: 'carrier-access-token-here',
  reason: 'last-mile-delivery',
  timestamp: new Date().toISOString(),
};

// Step 3: Address Provider checks access policy and resolves PID
const resolutionResponse = resolvePID(
  pidResolutionRequest,
  carrierAccessPolicy,
  userAddress
);

if (resolutionResponse.success && resolutionResponse.address) {
  console.log('PID resolution: SUCCESS');
  console.log('Resolved address:', resolutionResponse.address.street_address);
  console.log('Access log ID:', resolutionResponse.accessLogId);

  // Step 4: Create audit log entry
  const auditLog = createAuditLogEntry(
    normalizedPID,
    pidResolutionRequest.requesterId,
    'resolve',
    'success',
    {
      reason: pidResolutionRequest.reason,
      accessLogId: resolutionResponse.accessLogId,
    }
  );

  console.log('Audit log created:', auditLog.id);
} else {
  console.log('PID resolution: FAILED');
  console.log('Error:', resolutionResponse.error);
}

// Step 5: Track delivery progress
const trackingEvents = [
  createTrackingEvent(
    'TN-20241202-001',
    'accepted',
    '荷物を受け付けました',
    { country: 'JP', admin1: '13' }
  ),
  createTrackingEvent(
    'TN-20241202-001',
    'in_transit',
    '配送センターへ輸送中',
    { country: 'JP', admin1: '13', city: '渋谷区' }
  ),
  createTrackingEvent(
    'TN-20241202-001',
    'out_for_delivery',
    '配達員が配達に向かっています',
    { country: 'JP', admin1: '13', city: '渋谷区' }
  ),
];

console.log('\nTracking events:');
trackingEvents.forEach((event) => {
  console.log(`  [${event.timestamp}] ${event.type}: ${event.description}`);
});

// Step 6: Final delivery event
const deliveryEvent = createTrackingEvent(
  'TN-20241202-001',
  'delivered',
  '配達完了',
  { country: 'JP', admin1: '13', city: '渋谷区' }
);

console.log(`  [${deliveryEvent.timestamp}] ${deliveryEvent.type}: ${deliveryEvent.description}`);

console.log('\n');

// ============================================================================
// Flow 4: Address Update & Revocation
// ============================================================================

console.log('=== Flow 4: Address Update & Revocation ===\n');

// Scenario: User moves to a new address

// Step 1: User submits new address
const newAddress: AddressInput = {
  country: 'JP',
  province: '神奈川県',
  city: '横浜市',
  ward: '中区',
  street_address: '5-6-7',
  building: 'マンションB',
  room: '201',
  postal_code: '231-0001',
  recipient: '山田太郎',
};

// Step 2: Address Provider generates new PID
const newPID = 'JP-14-201-05-T03-B08-BN01-R201';
console.log('New PID generated:', newPID);

// Step 3: Create revocation entry for old PID
const revocationEntry = createRevocationEntry(
  normalizedPID,
  'address_change',
  newPID
);

console.log('Revocation entry created');
console.log('Old PID:', revocationEntry.pid);
console.log('New PID:', revocationEntry.newPid);
console.log('Reason:', revocationEntry.reason);

// Step 4: Update revocation list
const revocationList = createRevocationList(
  providerDid,
  [revocationEntry]
);

// Step 5: Sign the revocation list
const signedRevocationList = signRevocationList(
  revocationList,
  providerPrivateKey,
  `${providerDid}#key-1`
);

console.log('Revocation list signed');
console.log('List version:', signedRevocationList.version);

// Step 6: Check if old PID is revoked
const isOldPIDRevoked = isPIDRevoked(normalizedPID, signedRevocationList);
console.log('Old PID revoked:', isOldPIDRevoked);

// Step 7: When validating future shipping requests, check revocation list
console.log('\nAttempting to use old PID for new order...');
if (isPIDRevoked(normalizedPID, signedRevocationList)) {
  console.log('Error: This PID has been revoked');
  console.log('Please use the new PID:', newPID);
} else {
  console.log('PID is valid and can be used');
}

console.log('\n=== All flows completed successfully ===');
