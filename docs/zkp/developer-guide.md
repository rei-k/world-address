# ZKP Address Protocol - Developer Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Getting Started](#getting-started)
4. [Four Main Flows](#four-main-flows)
5. [Five ZKP Patterns](#five-zkp-patterns)
6. [Common Use Cases](#common-use-cases)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Examples](#examples)

---

## Introduction

The ZKP (Zero-Knowledge Proof) Address Protocol enables privacy-preserving address management and delivery. Users can prove properties about their address (e.g., "valid delivery destination") without revealing the actual address data.

### Why ZKP for Addresses?

**Traditional Address Handling:**
- ❌ Full address exposed to every merchant
- ❌ Privacy concerns with data breaches
- ❌ No control over who sees what
- ❌ Address data scattered across services

**ZKP Address Protocol:**
- ✅ Prove address validity without revealing it
- ✅ Selective disclosure (show only what's needed)
- ✅ User controls data access
- ✅ Centralized address management with distributed privacy

### Key Benefits

1. **Privacy**: Addresses stay private until delivery time
2. **Security**: Cryptographic proofs prevent fraud
3. **User Control**: Users decide what to reveal
4. **Compliance**: Audit logs without exposing data
5. **Simplicity**: QR/NFC for easy address sharing

---

## Core Concepts

### DID (Decentralized Identifier)

Every user, merchant, and carrier has a unique DID:

```typescript
// User DID
const userDid = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';

// Address Provider DID
const providerDid = 'did:web:vey.example';

// Merchant DID
const merchantDid = 'did:web:ec-site.example';

// Carrier DID
const carrierDid = 'did:web:shipping-company.example';
```

### PID (Persistent Identifier for Addresses)

Each address gets a hierarchical PID:

```
Format: {Country}-{Admin1}-{Admin2}-{Admin3}-{Block}-{Building}-{Floor}-{Room}

Examples:
- JP-13-113-01                    // Basic: Tokyo, Bunkyo-ku
- JP-13-113-01-T07-B12            // With block and building
- US-CA-90210                     // Beverly Hills, California
- GB-ENG-W1A-1AA                  // London postcode
```

### Verifiable Credential (VC)

A cryptographically signed claim about your address:

```typescript
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "AddressPIDCredential"],
  "issuer": "did:web:vey.example",
  "issuanceDate": "2024-01-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:key:user123",
    "addressPID": "JP-13-113-01",
    "countryCode": "JP"
  },
  "proof": { ... }
}
```

### Zero-Knowledge Proof

Prove properties about your address without revealing it:

```typescript
// Prove: "I have a valid address in Japan"
// WITHOUT revealing: The actual address

const proof = generateZKProof(
  pid,
  { allowedCountries: ['JP'] },
  circuit,
  addressData
);
```

---

## Getting Started

### Installation

```bash
npm install @vey/core
```

### Basic Setup

```typescript
import {
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
} from '@vey/core';

// 1. Create user's DID document
const userDid = 'did:key:user123';
const userPublicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const didDoc = createDIDDocument(userDid, userPublicKey);

// 2. Get address verified and receive PID credential
const pid = 'JP-13-113-01';
const vc = createAddressPIDCredential(
  userDid,
  'did:web:vey.example',
  pid,
  'JP',
  '13'
);

// 3. Sign the credential
const signedVC = signCredential(vc, privateKey, 'did:web:vey.example#key-1');

// 4. Verify the credential
const isValid = verifyCredential(signedVC, publicKey);
```

### Quick Example: E-commerce Checkout

```typescript
// User proves they have valid shipping address without revealing it
const circuit = createZKCircuit('address-validation-v1', 'Address Validation');

// Generate proof
const proof = generateZKProof(
  'JP-13-113-01', // User's PID
  { allowedCountries: ['JP'] }, // Merchant's requirements
  circuit,
  { country: 'JP', province: '13' } // Partial address data
);

// Merchant verifies proof
const result = verifyZKProof(proof, circuit);
if (result.valid) {
  console.log('Valid shipping destination confirmed!');
  // Create order without knowing actual address
}
```

---

## Four Main Flows

### Flow 1: Address Registration & Authentication

**Purpose**: Register address and get verifiable credential

```typescript
// Step 1: Create DID Document
const didDoc = createDIDDocument(userDid, publicKey);

// Step 2: Submit address for verification
const addressData = {
  country: 'JP',
  province: '13',
  city: 'Shibuya',
  postal_code: '150-0001',
  street_address: 'Dogenzaka 1-2-3'
};

// Step 3: Receive PID and credential from provider
const credential = createAddressPIDCredential(
  userDid,
  providerDid,
  'JP-13-113-01',
  'JP',
  '13',
  new Date('2025-12-31').toISOString() // Expiration
);

// Step 4: Provider signs the credential
const signedCredential = signCredential(
  credential,
  providerPrivateKey,
  'did:web:vey.example#key-1'
);

// Step 5: User stores credential in wallet
```

**Use Case**: First-time user registration with Veyvault

---

### Flow 2: Shipping Request & Waybill Generation

**Purpose**: Create shipment without revealing full address

```typescript
// Step 1: Merchant creates shipping conditions
const conditions = {
  allowedCountries: ['JP'],
  allowedRegions: ['13'], // Tokyo only
};

// Step 2: User generates ZK proof
const circuit = createZKCircuit('shipping-v1', 'Shipping Validation');
const proof = generateZKProof(
  userPid,
  conditions,
  circuit,
  { country: 'JP', province: '13' }
);

// Step 3: User signs shipping request
const request = {
  pid: userPid,
  userSignature: 'signature',
  conditions,
  requesterId: 'did:web:ec-site.example',
  timestamp: new Date().toISOString(),
};

// Step 4: Validate request and generate PID token
const response = validateShippingRequest(
  request,
  circuit,
  addressData
);

if (response.valid) {
  // Step 5: Create ZKP waybill
  const waybill = createZKPWaybill(
    'WB-001',
    userPid,
    response.zkProof,
    'TN-001',
    {
      parcelWeight: 2.5,
      parcelSize: '60',
      carrierInfo: { id: 'carrier-1', name: 'Fast Delivery' }
    }
  );
  
  console.log('Waybill created:', waybill.waybill_id);
}
```

**Use Case**: E-commerce checkout with privacy

---

### Flow 3: Delivery Execution & Tracking

**Purpose**: Carrier accesses address only when needed

```typescript
// Step 1: Define access policy
const policy = {
  id: 'policy-001',
  principal: 'did:web:carrier.example',
  resource: 'JP-13-*', // Can access Tokyo addresses
  action: 'resolve',
};

// Step 2: Validate carrier has permission
const hasAccess = validateAccessPolicy(
  policy,
  'did:web:carrier.example',
  'resolve'
);

if (hasAccess) {
  // Step 3: Carrier resolves PID to actual address
  const resolutionRequest = {
    pid: 'JP-13-113-01',
    requesterId: 'did:web:carrier.example',
    accessToken: 'token',
    reason: 'delivery',
    timestamp: new Date().toISOString(),
  };
  
  const resolution = resolvePID(
    resolutionRequest,
    policy,
    fullAddressData
  );
  
  if (resolution.success) {
    console.log('Delivery address:', resolution.address);
    
    // Step 4: Create audit log
    const auditLog = createAuditLogEntry(
      'JP-13-113-01',
      'did:web:carrier.example',
      'resolve',
      'success',
      { reason: 'delivery' }
    );
  }
}

// Step 5: Update tracking
const trackingEvent = createTrackingEvent(
  'TN-001',
  'delivered',
  'Package delivered successfully',
  { country: 'JP', city: 'Shibuya' }
);
```

**Use Case**: Last-mile delivery with audit trail

---

### Flow 4: Address Update & Revocation

**Purpose**: Handle address changes (moving)

```typescript
// Step 1: User moves to new address
const oldPid = 'JP-13-113-01';
const newPid = 'JP-14-201-05';

// Step 2: Create revocation entry
const revocationEntry = createRevocationEntry(
  oldPid,
  'address_change',
  newPid
);

// Step 3: Provider creates/updates revocation list
const revocationList = createRevocationList(
  'did:web:vey.example',
  [revocationEntry]
);

// Step 4: Sign revocation list
const signedList = signRevocationList(
  revocationList,
  providerPrivateKey,
  'did:web:vey.example#key-1'
);

// Step 5: Check if PID is revoked
const isRevoked = isPIDRevoked(oldPid, signedList);
console.log('Old address revoked:', isRevoked);

// Step 6: Get new PID
const newAddress = getNewPID(oldPid, signedList);
console.log('New address PID:', newAddress);

// Step 7: Generate version proof (proves same owner)
const circuit = createZKCircuit('version-v1', 'Version Proof');
const versionProof = generateZKVersionProof(
  oldPid,
  newPid,
  userDid,
  circuit
);

// Step 8: Verify version proof
const verification = verifyZKVersionProof(
  versionProof,
  circuit,
  signedList
);
console.log('Version proof valid:', verification.valid);
```

**Use Case**: User moves to new address

---

## Five ZKP Patterns

### Pattern 1: ZK-Membership Proof

**Purpose**: Prove address exists in valid set without revealing which one

```typescript
const circuit = createZKCircuit('membership-v1', 'Membership Circuit');

const validPids = [
  'JP-13-113-01',
  'JP-14-201-05',
  'US-CA-90210',
  'GB-ENG-W1A-1AA',
];

// Prove user's PID is in the valid set
const proof = generateZKMembershipProof(
  'JP-13-113-01',
  validPids,
  circuit
);

// Verify proof
const result = verifyZKMembershipProof(
  proof,
  circuit,
  proof.merkleRoot
);
```

**Use Cases**:
- Merchant: "Is this a valid delivery address?" (yes/no)
- Region restriction: "Is address in allowed regions?"
- Bulk delivery: "Is address in today's route?"

**Technology**: Merkle Tree + zk-SNARK

---

### Pattern 2: ZK-Structure Proof

**Purpose**: Prove PID structure is valid

```typescript
const circuit = createZKCircuit('structure-v1', 'Structure Circuit');

const pid = 'JP-13-113-01-T07-B12-BN02-R342';

// Prove PID follows Japan's hierarchy rules
const proof = generateZKStructureProof(
  pid,
  'JP',
  8, // Hierarchy depth
  circuit
);

// Verify structure
const result = verifyZKStructureProof(proof, circuit, 'JP');
```

**Use Cases**:
- Validate PID format without revealing address
- Ensure proper hierarchy (Country → State → City → ...)
- Verify compliance with national address standards

**Technology**: Halo2 / PLONK / zk-SNARK

---

### Pattern 3: ZK-Selective Reveal Proof

**Purpose**: Reveal only selected address fields

```typescript
const circuit = createZKCircuit('selective-reveal-v1', 'Selective Reveal');

const fullAddress = {
  country: 'JP',
  province: '13',
  city: 'Shibuya',
  postal_code: '150-0001',
  street_address: 'Dogenzaka 1-2-3',
  building: 'Tower Mansion',
  room: '1001',
};

// Reveal only country and postal code to merchant
const proof = generateZKSelectiveRevealProof(
  'JP-13-113-01',
  fullAddress,
  ['country', 'postal_code'], // Fields to reveal
  circuit
);

// Verify and extract revealed data
const result = verifyZKSelectiveRevealProof(proof, circuit);
console.log('Revealed:', result.revealedData);
// Output: { country: 'JP', postal_code: '150-0001' }
```

**Use Cases**:
- E-commerce: Show only country and postal code for shipping estimation
- Friend sharing: Share city/district but not exact address
- Analytics: Aggregate by region without PII

**Technology**: SD-JWT (Selective Disclosure JWT) + zk-SNARK

---

### Pattern 4: ZK-Version Proof

**Purpose**: Prove ownership across address updates

```typescript
const circuit = createZKCircuit('version-v1', 'Version Circuit');

const oldPid = 'JP-13-113-01';
const newPid = 'JP-14-201-05';
const userDid = 'did:key:user123';

// Generate proof that old and new PIDs belong to same user
const proof = generateZKVersionProof(
  oldPid,
  newPid,
  userDid,
  circuit
);

// Create revocation list
const revocationEntry = createRevocationEntry(oldPid, 'address_change', newPid);
const revocationList = createRevocationList('did:web:vey.example', [revocationEntry]);

// Verify proof
const result = verifyZKVersionProof(proof, circuit, revocationList);
```

**Use Cases**:
- Moving: Prove continuity after address change
- QR/NFC migration: Update credentials without new registration
- Subscription continuity: Maintain service across moves

**Technology**: zk-SNARK

---

### Pattern 5: ZK-Locker Proof

**Purpose**: Prove locker access without revealing which locker

```typescript
const circuit = createZKCircuit('locker-v1', 'Locker Circuit');

const facilityId = 'FACILITY-SHIBUYA-STATION';
const availableLockers = [
  'LOCKER-A-001',
  'LOCKER-A-042',
  'LOCKER-B-015',
];

// Prove user has access to a locker in this facility
const proof = generateZKLockerProof(
  'LOCKER-A-042', // User's locker
  facilityId,
  availableLockers,
  circuit,
  'KANTO-TOKYO-SHIBUYA' // Optional zone
);

// Verify proof
const result = verifyZKLockerProof(proof, circuit, facilityId);
```

**Use Cases**:
- Anonymous pickup: Prove locker access without revealing which one
- PUDO (Pick Up Drop Off) points: Privacy-preserving package collection
- Shared locker facilities: Access control with anonymity

**Technology**: ZK-Membership (Merkle Tree + zk-SNARK)

---

## Common Use Cases

### 1. E-commerce Checkout (Privacy Mode)

```typescript
// User clicks "Pay with ZK Address"
const circuit = createZKCircuit('ecommerce-v1', 'E-commerce Validation');

// Merchant defines shipping requirements
const conditions = {
  allowedCountries: ['JP', 'US', 'GB'],
  allowedRegions: ['13', 'CA', 'ENG'], // Optional: specific regions
};

// User generates proof
const proof = generateZKProof(
  userPid,
  conditions,
  circuit,
  { country: 'JP', province: '13' }
);

// Merchant verifies
const result = verifyZKProof(proof, circuit);
if (result.valid) {
  // Create order with PID token (not actual address)
  createOrder({
    pidToken: result.publicInputs.pid,
    zkProof: proof,
  });
}
```

### 2. Friend Address Sharing (Partial Reveal)

```typescript
// Share only city and locker ID with friend
const fullAddress = {
  country: 'JP',
  province: '13',
  city: 'Shibuya',
  postal_code: '150-0001',
  street_address: 'Dogenzaka 1-2-3',
  locker_id: 'LOCKER-A-042',
};

const proof = generateZKSelectiveRevealProof(
  userPid,
  fullAddress,
  ['city', 'locker_id'], // Only these fields revealed
  circuit
);

// Friend can see: { city: 'Shibuya', locker_id: 'LOCKER-A-042' }
// But not: postal code, street address, etc.
```

### 3. Delivery Route Optimization

```typescript
// Carrier verifies addresses are in today's route
const circuit = createZKCircuit('route-v1', 'Route Optimization');

const routePids = [
  'JP-13-113-01',
  'JP-13-113-02',
  'JP-13-114-01',
  // ... more PIDs in route
];

// For each package, verify it's in route without revealing exact address
packages.forEach(pkg => {
  const proof = generateZKMembershipProof(pkg.pid, routePids, circuit);
  const result = verifyZKMembershipProof(proof, circuit, proof.merkleRoot);
  
  if (result.valid) {
    console.log('Package is in route');
  }
});
```

### 4. Age-Restricted Delivery

```typescript
// Prove recipient is eligible for restricted items
const circuit = createZKCircuit('age-restricted-v1', 'Age Restriction');

// Selective reveal: show only country and age verification
const proof = generateZKSelectiveRevealProof(
  userPid,
  {
    country: 'JP',
    age_verified: true,
    verification_date: '2024-01-01',
  },
  ['country', 'age_verified'],
  circuit
);
```

---

## API Reference

See [zkp-api.md](../zkp-api.md) for complete API documentation.

### Quick Reference

**Flow 1: Registration**
- `createDIDDocument(did, publicKey)`
- `createAddressPIDCredential(userDid, issuerDid, pid, country)`
- `signCredential(vc, privateKey, verificationMethod)`
- `verifyCredential(signedVC, publicKey)`

**Flow 2: Shipping**
- `createZKCircuit(id, name, description?)`
- `generateZKProof(pid, conditions, circuit, addressData)`
- `verifyZKProof(proof, circuit)`
- `validateShippingRequest(request, circuit, addressData)`
- `createZKPWaybill(id, pid, proof, trackingNumber, metadata)`

**Flow 3: Delivery**
- `validateAccessPolicy(policy, requesterId, action)`
- `resolvePID(request, policy, addressData)`
- `createAuditLogEntry(pid, accessor, action, result, metadata?)`
- `createTrackingEvent(trackingNumber, type, description, location?)`

**Flow 4: Revocation**
- `createRevocationEntry(pid, reason, newPid?)`
- `createRevocationList(issuer, entries, previousList?)`
- `isPIDRevoked(pid, revocationList)`
- `getNewPID(oldPid, revocationList)`
- `signRevocationList(list, privateKey, verificationMethod)`

**ZKP Patterns**
- `generateZKMembershipProof(pid, validPids, circuit)`
- `verifyZKMembershipProof(proof, circuit, merkleRoot)`
- `generateZKStructureProof(pid, country, depth, circuit)`
- `verifyZKStructureProof(proof, circuit, country)`
- `generateZKSelectiveRevealProof(pid, fullAddress, fields, circuit)`
- `verifyZKSelectiveRevealProof(proof, circuit)`
- `generateZKVersionProof(oldPid, newPid, userDid, circuit)`
- `verifyZKVersionProof(proof, circuit, revocationList)`
- `generateZKLockerProof(lockerId, facilityId, lockers, circuit, zone?)`
- `verifyZKLockerProof(proof, circuit, facilityId)`

---

## Best Practices

### 1. Circuit Management

```typescript
// ❌ Bad: Creating circuits repeatedly
function checkout() {
  const circuit = createZKCircuit('checkout', 'Checkout');
  // ...
}

// ✅ Good: Reuse circuits
const CIRCUITS = {
  CHECKOUT: createZKCircuit('checkout-v1', 'Checkout Validation'),
  DELIVERY: createZKCircuit('delivery-v1', 'Delivery Validation'),
  LOCKER: createZKCircuit('locker-v1', 'Locker Access'),
};

function checkout() {
  const proof = generateZKProof(pid, conditions, CIRCUITS.CHECKOUT, data);
  // ...
}
```

### 2. Error Handling

```typescript
// Always handle verification failures
const result = verifyZKProof(proof, circuit);

if (!result.valid) {
  if (result.error?.includes('expired')) {
    // Handle expired proof
    console.error('Proof expired, please regenerate');
  } else if (result.error?.includes('country mismatch')) {
    // Handle invalid conditions
    console.error('Address does not meet shipping requirements');
  } else {
    // Generic error
    console.error('Invalid proof:', result.error);
  }
  return;
}
```

### 3. Credential Expiration

```typescript
// Set reasonable expiration dates
const oneYear = new Date();
oneYear.setFullYear(oneYear.getFullYear() + 1);

const credential = createAddressPIDCredential(
  userDid,
  issuerDid,
  pid,
  'JP',
  '13',
  oneYear.toISOString() // Expires in 1 year
);
```

### 4. Access Control

```typescript
// Define granular policies
const policies = [
  {
    id: 'carrier-tokyo',
    principal: 'did:web:carrier.example',
    resource: 'JP-13-*', // Only Tokyo
    action: 'resolve',
  },
  {
    id: 'carrier-osaka',
    principal: 'did:web:carrier.example',
    resource: 'JP-27-*', // Only Osaka
    action: 'resolve',
  },
];

// Validate before resolution
policies.forEach(policy => {
  const hasAccess = validateAccessPolicy(policy, requesterId, 'resolve');
  if (hasAccess) {
    // Grant access
  }
});
```

### 5. Audit Logging

```typescript
// Always log access to addresses
const log = createAuditLogEntry(
  pid,
  requesterId,
  'resolve',
  'success',
  {
    reason: 'delivery',
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.1', // Optional
  }
);

// Store logs securely
await saveAuditLog(log);
```

### 6. Revocation Handling

```typescript
// Check revocation before using PID
if (isPIDRevoked(pid, revocationList)) {
  const newPid = getNewPID(pid, revocationList);
  
  if (newPid) {
    console.log(`Address updated. New PID: ${newPid}`);
    // Use new PID
  } else {
    console.error('Address revoked with no replacement');
    // Handle revocation
  }
}
```

---

## Troubleshooting

### Issue: "Invalid proof" error

**Problem**: Proof verification fails

**Solutions**:
1. Check circuit matches between generation and verification
2. Ensure conditions are met by the address data
3. Verify proof hasn't expired
4. Check public inputs match expected values

```typescript
// Debug proof
console.log('Circuit ID:', proof.circuitId);
console.log('Public Inputs:', proof.publicInputs);
console.log('Timestamp:', proof.timestamp);

// Verify circuit matches
const result = verifyZKProof(proof, circuit);
if (!result.valid) {
  console.error('Verification failed:', result.error);
}
```

### Issue: "Country code mismatch"

**Problem**: Structure proof validation fails

**Solution**: Ensure country code matches between proof generation and verification

```typescript
// ❌ Bad
const proof = generateZKStructureProof(pid, 'JP', 4, circuit);
const result = verifyZKStructureProof(proof, circuit, 'US'); // Wrong country

// ✅ Good
const country = 'JP';
const proof = generateZKStructureProof(pid, country, 4, circuit);
const result = verifyZKStructureProof(proof, circuit, country);
```

### Issue: "Merkle root mismatch"

**Problem**: Membership proof verification fails

**Solution**: Use the same Merkle root from proof generation

```typescript
// ❌ Bad
const proof = generateZKMembershipProof(pid, validPids, circuit);
const result = verifyZKMembershipProof(proof, circuit, 'wrong-root');

// ✅ Good
const proof = generateZKMembershipProof(pid, validPids, circuit);
const result = verifyZKMembershipProof(proof, circuit, proof.merkleRoot);
```

### Issue: "PID not found in revocation list"

**Problem**: Version proof fails when old PID isn't revoked

**Solution**: Ensure revocation entry exists before generating version proof

```typescript
// First create revocation
const entry = createRevocationEntry(oldPid, 'address_change', newPid);
const list = createRevocationList(issuer, [entry]);

// Then generate version proof
const proof = generateZKVersionProof(oldPid, newPid, userDid, circuit);
const result = verifyZKVersionProof(proof, circuit, list);
```

### Issue: "Selective reveal returns empty"

**Problem**: Revealed fields don't exist in address

**Solution**: Check field names match exactly

```typescript
// ❌ Bad - typo in field name
const proof = generateZKSelectiveRevealProof(
  pid,
  { country: 'JP', postal_code: '100-0001' },
  ['country', 'postalCode'], // Wrong: should be 'postal_code'
  circuit
);

// ✅ Good
const proof = generateZKSelectiveRevealProof(
  pid,
  { country: 'JP', postal_code: '100-0001' },
  ['country', 'postal_code'], // Correct
  circuit
);
```

---

## Examples

### Complete E-commerce Flow

See [examples/zkp-demo/ecommerce-flow.ts](../../examples/zkp-demo/ecommerce-flow.ts)

### Locker Pickup

See [examples/zkp-demo/locker-pickup.ts](../../examples/zkp-demo/locker-pickup.ts)

### Address Migration

See [examples/zkp-demo/address-migration.ts](../../examples/zkp-demo/address-migration.ts)

### Friend Sharing

See [examples/zkp-demo/friend-sharing.ts](../../examples/zkp-demo/friend-sharing.ts)

---

## Further Reading

- [ZKP Protocol Overview](../zkp-protocol.md) - High-level architecture
- [ZKP API Reference](../zkp-api.md) - Complete API documentation
- [Vey Ecosystem](../../Vey/README.md) - Full ecosystem overview
- [AMF (Address Mapping Framework)](../amf.md) - Address hierarchy system

---

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/rei-k/world-address-yaml/issues)
- Documentation: [Full documentation](../../docs/)
- Examples: [Working examples](../../examples/)

---

**Last Updated**: 2024-12-07  
**Version**: 1.0.0  
**License**: MIT
