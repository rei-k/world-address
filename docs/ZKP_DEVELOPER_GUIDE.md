# ZKP Developer Guide - Zero-Knowledge Proof Address Protocol

## Table of Contents

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [5 ZKP Patterns](#5-zkp-patterns)
- [Implementation Guide](#implementation-guide)
- [API Reference](#api-reference)
- [Common Use Cases](#common-use-cases)
- [Testing & Debugging](#testing--debugging)
- [Security Considerations](#security-considerations)
- [FAQ](#faq)

---

## Introduction

The **ZKP Address Protocol** is a privacy-preserving address management and delivery system that leverages Zero-Knowledge Proofs (ZKP) to enable secure delivery without exposing raw addresses.

### Why ZKP for Addresses?

Traditional e-commerce requires users to share their complete address with every merchant. With ZKP:

- **Privacy**: Merchants never see your actual address
- **Security**: Addresses stored as hierarchical PIDs (Place Identifiers)
- **Control**: Users decide what information to reveal
- **Verification**: Prove delivery capability without exposing details

### Key Benefits

✅ **Privacy-First** - Addresses encrypted and stored as PIDs  
✅ **Selective Disclosure** - Reveal only necessary information  
✅ **Audit Trail** - Complete transparency with zero-knowledge  
✅ **Future-Proof** - Supports address updates without breaking links

---

## Quick Start

### Installation

```bash
npm install @vey/core
```

### Basic Example

```typescript
import { 
  createDIDDocument, 
  createAddressPIDCredential,
  generateZKProof,
  verifyZKProof 
} from '@vey/core';

// 1. Create a DID for the user
const userDID = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const didDoc = createDIDDocument(userDID, publicKey);

// 2. Issue an Address PID Credential
const addressVC = createAddressPIDCredential(
  userDID,
  'did:web:vey.example',  // Issuer (Address Provider)
  'JP-13-113-01',         // PID (hierarchical place identifier)
  'JP',                   // Country code
  '13'                    // Admin level 1 (Tokyo)
);

// 3. Generate a Zero-Knowledge Proof
const zkCircuit = createZKCircuit({
  type: 'membership',
  statement: 'Address is in valid address set',
  publicInputs: ['countryCode', 'admin1'],
  privateInputs: ['fullPID', 'addressDetails'],
});

const proof = generateZKProof(zkCircuit, addressVC, privateKey);

// 4. Verify the proof (by merchant/carrier)
const isValid = verifyZKProof(proof, zkCircuit.publicInputs);

if (isValid) {
  console.log('✅ Delivery capability verified without seeing address!');
}
```

---

## Core Concepts

### 1. DID (Decentralized Identifier)

A globally unique identifier that doesn't require a central authority.

```typescript
// Example DID
const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
```

### 2. PID (Place Identifier)

A hierarchical address identifier following the pattern:
```
{CountryCode}-{Admin1}-{Admin2}-{Admin3}-...
```

Examples:
- `JP-13-113-01` - Tokyo, Chiyoda-ku, specific area
- `US-NY-061-36061` - New York, Manhattan, specific ZIP area

### 3. Verifiable Credential (VC)

A tamper-proof, cryptographically signed credential proving address ownership.

```typescript
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiableCredential", "AddressPIDCredential"],
  "issuer": "did:web:vey.example",
  "credentialSubject": {
    "id": "did:key:user123",
    "addressPID": "JP-13-113-01",
    "countryCode": "JP"
  },
  "proof": { /* cryptographic proof */ }
}
```

### 4. ZK Circuit

Defines what to prove without revealing private information.

```typescript
{
  type: 'membership',
  statement: 'Address exists in valid set',
  publicInputs: ['countryCode'],      // Revealed
  privateInputs: ['fullPID', 'city'], // Hidden
}
```

---

## 5 ZKP Patterns

The Vey ZKP Address Protocol implements 5 distinct ZKP patterns for different use cases:

### 1. ZK-Membership Proof (Address Existence)

**Purpose**: Prove address is in a valid set without revealing the address

**Technology**: Merkle Tree + zk-SNARK / Bulletproofs

**Use Case**: E-commerce checkout - prove you can receive deliveries without sharing your address

```typescript
import { generateZKMembershipProof, verifyZKMembershipProof } from '@vey/core';

// Generate proof that address is in valid set
const proof = generateZKMembershipProof({
  pid: 'JP-13-113-01',
  merkleTree: validAddressTree,
  userPrivateKey: privateKey,
});

// Verify (merchant only sees that address is valid)
const result = verifyZKMembershipProof(proof, merkleRoot);
// result: { valid: true, revealed: { countryCode: 'JP' } }
```

### 2. ZK-Structure Proof (PID Hierarchy)

**Purpose**: Prove PID has correct hierarchical structure

**Technology**: Halo2 / PLONK / zk-SNARK

**Use Case**: Validate address follows country-specific structure rules

```typescript
import { generateZKStructureProof, verifyZKStructureProof } from '@vey/core';

// Generate proof that PID structure is valid
const proof = generateZKStructureProof({
  pid: 'JP-13-113-01',
  countryFormat: japanFormat,
  rules: {
    levels: 4,
    format: '{country}-{admin1}-{admin2}-{admin3}',
  },
});

// Verify structure without seeing full address
const result = verifyZKStructureProof(proof);
// result: { valid: true, levels: 4, countryCode: 'JP' }
```

### 3. ZK-Selective Reveal Proof (Partial Disclosure)

**Purpose**: Reveal only selected fields, hide the rest

**Technology**: SD-JWT (Selective Disclosure JWT) + zk-SNARK

**Use Case**: Show city to merchant, full address to carrier

```typescript
import { generateZKSelectiveRevealProof } from '@vey/core';

// For merchant: reveal only country and postal code range
const merchantProof = generateZKSelectiveRevealProof({
  address: fullAddress,
  revealFields: ['country', 'postalCodeRange'],
  hideFields: ['street', 'building', 'room'],
});

// For carrier: reveal complete address
const carrierProof = generateZKSelectiveRevealProof({
  address: fullAddress,
  revealFields: '*', // All fields
});
```

### 4. ZK-Version Proof (Address Update)

**Purpose**: Prove old and new addresses belong to same owner after moving

**Technology**: zk-SNARK

**Use Case**: Update address while maintaining delivery continuity

```typescript
import { generateZKVersionProof, verifyZKVersionProof } from '@vey/core';

// Generate proof linking old and new addresses
const proof = generateZKVersionProof({
  oldPID: 'JP-13-113-01',
  newPID: 'JP-27-100-05', // Moved from Tokyo to Osaka
  ownerDID: userDID,
  privateKey: userPrivateKey,
});

// Verify both addresses belong to same person
const result = verifyZKVersionProof(proof, ownerDID);
// result: { valid: true, sameOwner: true, timestamp: '2024-12-07' }
```

### 5. ZK-Locker Proof (Locker Access)

**Purpose**: Prove access rights to a locker without revealing which one

**Technology**: ZK-Membership (Merkle Tree + zk-SNARK)

**Use Case**: Anonymous package pickup at PUDO (Pick Up Drop Off) points

```typescript
import { generateZKLockerProof, verifyZKLockerProof } from '@vey/core';

// Generate proof of locker access
const proof = generateZKLockerProof({
  lockerID: 'LOCKER-7894',
  facilityID: 'FACILITY-TOKYO-01',
  accessToken: userAccessToken,
  merkleTree: facilityLockerTree,
});

// Verify access without knowing specific locker
const result = verifyZKLockerProof(proof, facilityID);
// result: { valid: true, facilityID: 'FACILITY-TOKYO-01', lockerRevealed: false }
```

---

## Implementation Guide

### Flow 1: Address Registration & Authentication

**Objective**: User registers address and receives verified credential

```typescript
import { 
  createDIDDocument, 
  createAddressPIDCredential,
  signCredential,
  verifyCredential 
} from '@vey/core';

// Step 1: User creates DID
const userDID = 'did:key:z6MkUser123';
const didDoc = createDIDDocument(userDID, userPublicKey);

// Step 2: User submits address to Address Provider
const rawAddress = {
  country: 'JP',
  postalCode: '100-0001',
  prefecture: '東京都',
  city: '千代田区',
  street: '千代田1-1',
};

// Step 3: Address Provider normalizes and creates PID
const pid = await addressProvider.normalizeToPID(rawAddress);
// pid: 'JP-13-113-01'

// Step 4: Issue Verifiable Credential
const vc = createAddressPIDCredential(
  userDID,
  'did:web:vey.example',
  pid,
  'JP',
  '13'
);

// Step 5: Sign credential
const signedVC = signCredential(vc, issuerPrivateKey, issuerDID + '#key-1');

// Step 6: User stores credential in wallet
await userWallet.storeCredential(signedVC);

console.log('✅ Address registered and credential issued');
```

### Flow 2: Shipping Request & Waybill Generation

**Objective**: E-commerce site requests delivery without seeing address

```typescript
import { 
  createZKCircuit,
  generateZKProof,
  validateShippingRequest,
  createZKPWaybill 
} from '@vey/core';

// Step 1: User selects address for shipping
const selectedVC = userWallet.getCredential('JP-13-113-01');

// Step 2: Create ZK circuit for membership proof
const circuit = createZKCircuit({
  type: 'membership',
  statement: 'Address is valid for delivery',
  publicInputs: ['countryCode', 'admin1'],
  privateInputs: ['fullPID', 'streetAddress'],
});

// Step 3: Generate ZK proof
const proof = generateZKProof(circuit, selectedVC, userPrivateKey);

// Step 4: Submit to merchant
const shippingRequest = {
  zkProof: proof,
  pidToken: 'encrypted_pid_token',
  publicData: { countryCode: 'JP', admin1: '13' },
};

// Step 5: Merchant validates without seeing address
const validation = validateShippingRequest(shippingRequest);

if (validation.valid) {
  // Step 6: Create ZKP-enabled waybill
  const waybill = createZKPWaybill({
    orderId: 'ORDER-12345',
    pidToken: shippingRequest.pidToken,
    zkProof: proof,
    carrierAccessPolicy: {
      canRevealPID: true,
      accessLevel: 'full',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });
  
  console.log('✅ Waybill created without merchant seeing address');
}
```

### Flow 3: Delivery Execution & Tracking

**Objective**: Carrier accesses address only when needed for delivery

```typescript
import { 
  validateAccessPolicy,
  resolvePID,
  createAuditLogEntry,
  createTrackingEvent 
} from '@vey/core';

// Step 1: Carrier receives waybill
const waybill = getWaybillFromMerchant('ORDER-12345');

// Step 2: Validate access policy
const hasAccess = validateAccessPolicy(
  waybill.carrierAccessPolicy,
  'carrier:fedex',
  Date.now()
);

if (hasAccess.allowed) {
  // Step 3: Resolve PID to actual address (logged for audit)
  const pidResolution = await resolvePID({
    pidToken: waybill.pidToken,
    requestor: 'carrier:fedex',
    purpose: 'delivery_execution',
    auditLog: true,
  });
  
  // pidResolution: { 
  //   address: { street: '千代田1-1', city: '千代田区', ... },
  //   accessGrantedAt: '2024-12-07T10:30:00Z'
  // }
  
  // Step 4: Create audit log
  const auditEntry = createAuditLogEntry({
    action: 'PID_RESOLVED',
    requestor: 'carrier:fedex',
    pidToken: waybill.pidToken,
    timestamp: new Date().toISOString(),
    ipAddress: '192.168.1.1',
  });
  
  // Step 5: Update tracking
  const tracking = createTrackingEvent({
    waybillId: waybill.id,
    status: 'OUT_FOR_DELIVERY',
    location: { lat: 35.6812, lon: 139.7671 },
    timestamp: new Date().toISOString(),
  });
  
  console.log('✅ Address accessed by carrier (logged for audit)');
}
```

### Flow 4: Address Update & Revocation

**Objective**: Update address when user moves, revoke old PID

```typescript
import { 
  createRevocationEntry,
  getNewPID,
  signRevocationList,
  isPIDRevoked 
} from '@vey/core';

// Step 1: User moves to new address
const newRawAddress = {
  country: 'JP',
  postalCode: '530-0001',
  prefecture: '大阪府',
  city: '大阪市北区',
  street: '梅田1-1',
};

// Step 2: Get new PID
const newPID = await addressProvider.normalizeToPID(newRawAddress);
// newPID: 'JP-27-100-05'

// Step 3: Create revocation entry for old PID
const revocation = createRevocationEntry({
  pidToRevoke: 'JP-13-113-01',
  reason: 'address_changed',
  newPID: 'JP-27-100-05',
  revokedBy: userDID,
  timestamp: new Date().toISOString(),
});

// Step 4: Issue new credential
const newVC = createAddressPIDCredential(
  userDID,
  'did:web:vey.example',
  newPID,
  'JP',
  '27'
);

// Step 5: Generate version proof (links old and new)
const versionProof = generateZKVersionProof({
  oldPID: 'JP-13-113-01',
  newPID: 'JP-27-100-05',
  ownerDID: userDID,
  privateKey: userPrivateKey,
});

// Step 6: Check if old PID is revoked
const isRevoked = isPIDRevoked('JP-13-113-01', revocationList);
// isRevoked: true

console.log('✅ Address updated, old PID revoked, continuity maintained');
```

---

## API Reference

### Core Functions

#### `createDIDDocument(did, publicKey, keyType?)`

Creates a DID Document for a user or entity.

**Parameters:**
- `did` (string) - DID identifier
- `publicKey` (string) - Public key (multibase encoded)
- `keyType` (string, optional) - Key type (default: 'Ed25519VerificationKey2020')

**Returns:** DIDDocument

---

#### `createAddressPIDCredential(userDid, issuerDid, pid, countryCode, admin1Code?, expirationDate?)`

Issues a Verifiable Credential containing user's address PID.

**Parameters:**
- `userDid` (string) - User's DID
- `issuerDid` (string) - Address provider's DID
- `pid` (string) - Address PID
- `countryCode` (string) - Country code (ISO 3166-1 alpha-2)
- `admin1Code` (string, optional) - Admin level 1 code
- `expirationDate` (string, optional) - Expiration date (ISO 8601)

**Returns:** VerifiableCredential

---

#### `generateZKProof(circuit, credential, privateKey)`

Generates a Zero-Knowledge Proof.

**Parameters:**
- `circuit` (ZKCircuit) - ZK circuit definition
- `credential` (VerifiableCredential) - Address credential
- `privateKey` (string) - User's private key

**Returns:** ZKProof

---

#### `verifyZKProof(proof, publicInputs, issuerPublicKey?)`

Verifies a Zero-Knowledge Proof.

**Parameters:**
- `proof` (ZKProof) - ZK proof to verify
- `publicInputs` (object) - Public inputs for verification
- `issuerPublicKey` (string, optional) - Issuer's public key

**Returns:** ZKProofVerificationResult

---

### ZKP Pattern Functions

See individual pattern sections above for:
- `generateZKMembershipProof()` / `verifyZKMembershipProof()`
- `generateZKStructureProof()` / `verifyZKStructureProof()`
- `generateZKSelectiveRevealProof()` / `verifyZKSelectiveRevealProof()`
- `generateZKVersionProof()` / `verifyZKVersionProof()`
- `generateZKLockerProof()` / `verifyZKLockerProof()`

---

## Common Use Cases

### Use Case 1: E-commerce Checkout

**Scenario**: User checks out without sharing address with merchant

```typescript
// User side
const proof = generateZKMembershipProof({
  pid: userAddress.pid,
  merkleTree: validAddresses,
  privateKey: userKey,
});

await merchantAPI.checkout({
  items: cart.items,
  zkProof: proof,
  pidToken: encryptedPIDToken,
});

// Merchant side
const isValid = verifyZKMembershipProof(proof, merkleRoot);
if (isValid) {
  // Create order without seeing address
  await createOrder({ zkProof: proof });
}
```

### Use Case 2: Friend-to-Friend Delivery

**Scenario**: Send gift to friend without knowing their exact address

```typescript
// Friend shares partial address
const partialProof = generateZKSelectiveRevealProof({
  address: friendAddress,
  revealFields: ['city', 'lockerID'],
  hideFields: ['street', 'building'],
});

// You can ship to locker
const shipment = await createShipment({
  recipient: {
    zkProof: partialProof,
    deliveryOption: 'LOCKER',
  },
});
```

### Use Case 3: Moving House

**Scenario**: Update address while keeping QR code valid

```typescript
// Generate version proof
const proof = generateZKVersionProof({
  oldPID: 'JP-13-113-01',
  newPID: 'JP-27-100-05',
  ownerDID: userDID,
  privateKey: userKey,
});

// Old QR code still works, redirects to new address
await updateQRCode({
  qrId: 'QR-USER-123',
  versionProof: proof,
  newPID: 'JP-27-100-05',
});
```

---

## Testing & Debugging

### Running Tests

```bash
# Run ZKP tests
cd sdk/core
npm run test tests/zkp.test.ts

# Run with coverage
npm run test:coverage tests/zkp.test.ts
```

### Debug Mode

Enable debug logging for ZKP operations:

```typescript
import { setZKPDebugMode } from '@vey/core';

setZKPDebugMode(true);

// Now all ZKP operations will log details
const proof = generateZKProof(circuit, vc, key);
// Console: "🔐 Generating ZK proof for circuit type: membership"
// Console: "✅ Proof generated successfully, size: 1234 bytes"
```

### Common Issues

**Issue**: Proof verification fails

```typescript
const result = verifyZKProof(proof, publicInputs);
if (!result.valid) {
  console.error('Verification failed:', result.reason);
  // Possible reasons:
  // - "INVALID_SIGNATURE"
  // - "PUBLIC_INPUT_MISMATCH"
  // - "CIRCUIT_MISMATCH"
  // - "EXPIRED_CREDENTIAL"
}
```

**Issue**: PID resolution returns null

```typescript
const address = await resolvePID({ pidToken, requestor });
if (!address) {
  // Check access policy
  const policy = await getAccessPolicy(pidToken);
  console.log('Access denied:', policy.denialReason);
}
```

---

## Security Considerations

### 1. Private Key Management

**❌ Never do this:**
```typescript
const privateKey = 'hardcoded_key'; // BAD!
```

**✅ Best practice:**
```typescript
// Use secure wallet or key management service
const privateKey = await secureWallet.getPrivateKey(userDID);
```

### 2. Proof Replay Prevention

All proofs include timestamps and nonces:

```typescript
const proof = generateZKProof(circuit, vc, key, {
  nonce: crypto.randomBytes(32).toString('hex'),
  timestamp: Date.now(),
  expiresIn: 60 * 5, // 5 minutes
});
```

### 3. Access Control

Always validate access policies:

```typescript
const hasAccess = validateAccessPolicy(policy, requestor, Date.now());
if (!hasAccess.allowed) {
  throw new Error(`Access denied: ${hasAccess.reason}`);
}
```

### 4. Audit Logging

All PID resolutions are logged:

```typescript
// Automatically logged
const address = await resolvePID({
  pidToken,
  requestor: 'carrier:fedex',
  auditLog: true, // Required for production
});

// View audit logs
const logs = await getAuditLogs(pidToken);
```

---

## FAQ

**Q: Do I need to understand cryptography to use ZKP?**

A: No! The SDK abstracts the cryptography. Just use the high-level functions.

**Q: What's the performance impact of ZKP?**

A: Proof generation: ~100-500ms, Verification: ~10-50ms. Acceptable for most use cases.

**Q: Can I use this in production?**

A: Yes, but ensure proper key management and audit logging.

**Q: How do I migrate existing addresses to ZKP?**

A: See the [Migration Guide](./migration-guide.md)

**Q: What if user loses their private key?**

A: Implement key recovery with social recovery or backup schemes. See [Key Recovery Guide](./key-recovery.md)

---

## Resources

- [ZKP Protocol Specification](./zkp-protocol.md)
- [ZKP API Reference](./zkp-api.md)
- [Security Guide](./zkp/security-guide.md)
- [Implementation Examples](../examples/zkp/)
- [Test Suite](../../sdk/core/tests/zkp.test.ts)

---

**Need Help?**

- 📧 Email: support@vey.com
- 💬 Discord: https://discord.gg/vey
- 📖 Docs: https://docs.vey.com/zkp
- 🐛 Issues: https://github.com/rei-k/world-address/issues

---

**Last Updated**: December 7, 2024  
**Version**: 1.0.0
