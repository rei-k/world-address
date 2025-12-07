# ZKP Address Protocol - Quick Reference Guide

Quick reference for the 5 ZKP patterns and 4 main flows in the ZKP Address Protocol.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [4 Main Flows](#4-main-flows)
- [5 ZKP Patterns](#5-zkp-patterns)
- [Common Use Cases](#common-use-cases)
- [Code Snippets](#code-snippets)
- [Error Handling](#error-handling)

---

## 🚀 Quick Start

### Installation

```bash
npm install @vey/core
```

### Basic Example

```typescript
import { 
  createDIDDocument, 
  createAddressPIDCredential,
  generateZKProof 
} from '@vey/core';

// 1. Create user DID
const didDoc = createDIDDocument(
  'did:key:user123',
  'public-key-123'
);

// 2. Get address credential
const credential = createAddressPIDCredential(
  'did:key:user123',
  'did:web:provider',
  'JP-13-113-01',
  'JP'
);

// 3. Generate privacy proof
const proof = generateZKProof(
  'JP-13-113-01',
  { allowedCountries: ['JP'] },
  circuit,
  addressData
);
```

---

## 🔄 4 Main Flows

### Flow 1: Address Registration & Authentication

**Purpose:** User registers address and receives verifiable credential

```typescript
// Step 1: Create DID
const didDoc = createDIDDocument(did, publicKey);

// Step 2: Get credential
const credential = createAddressPIDCredential(
  userDid,
  providerDid,
  pid,
  countryCode
);

// Step 3: Sign credential
const signed = signCredential(credential, privateKey, verificationMethod);

// Step 4: Verify credential
const isValid = verifyCredential(signed, publicKey);
```

**Key Functions:**
- `createDIDDocument(did, publicKey)` - Create DID document
- `createAddressPIDCredential(...)` - Issue address credential
- `signCredential(credential, privateKey, method)` - Sign credential
- `verifyCredential(credential, publicKey)` - Verify credential

---

### Flow 2: Shipping Request & Waybill Generation

**Purpose:** Merchant validates shipping destination without seeing address

```typescript
// Step 1: Create circuit
const circuit = createZKCircuit(
  'shipping-v1',
  'Shipping Validation',
  'Validate destination'
);

// Step 2: Generate proof
const proof = generateZKProof(
  pid,
  shippingConditions,
  circuit,
  addressData
);

// Step 3: Verify proof
const result = verifyZKProof(proof, circuit);

// Step 4: Validate request
const validation = validateShippingRequest(
  request,
  circuit,
  addressData
);

// Step 5: Create waybill
const waybill = createZKPWaybill(
  waybillId,
  pid,
  proof,
  trackingNumber,
  metadata
);
```

**Key Functions:**
- `createZKCircuit(id, name, description)` - Create ZK circuit
- `generateZKProof(pid, conditions, circuit, address)` - Generate proof
- `verifyZKProof(proof, circuit)` - Verify proof
- `validateShippingRequest(request, circuit, address)` - Validate request
- `createZKPWaybill(id, pid, proof, tracking, metadata)` - Create waybill

---

### Flow 3: Delivery Execution & Tracking

**Purpose:** Carrier accesses address only when needed, with audit logging

```typescript
// Step 1: Validate access
const hasAccess = validateAccessPolicy(
  policy,
  carrierDid,
  'resolve'
);

// Step 2: Resolve PID to address
const resolution = resolvePID(
  request,
  policy,
  addressData
);

// Step 3: Log access
const auditLog = createAuditLogEntry(
  pid,
  carrierDid,
  'resolve',
  'success',
  metadata
);

// Step 4: Track delivery
const event = createTrackingEvent(
  trackingNumber,
  'delivered',
  'Package delivered',
  location
);
```

**Key Functions:**
- `validateAccessPolicy(policy, principal, action)` - Validate access
- `resolvePID(request, policy, address)` - Resolve PID to address
- `createAuditLogEntry(pid, actor, action, result, metadata)` - Log access
- `createTrackingEvent(tracking, type, description, location)` - Track event

---

### Flow 4: Address Update & Revocation

**Purpose:** Handle address changes while maintaining continuity

```typescript
// Step 1: Create revocation entry
const revocation = createRevocationEntry(
  oldPid,
  'address_change',
  'User moved'
);

// Step 2: Create revocation list
const list = createRevocationList(
  issuerDid,
  [revocation]
);

// Step 3: Sign revocation list
const signed = signRevocationList(list, privateKey);

// Step 4: Check revocation
const isRevoked = isPIDRevoked(oldPid, signed);

// Step 5: Get new PID
const newPid = getNewPID(oldPid, signed);
```

**Key Functions:**
- `createRevocationEntry(pid, reason, description)` - Create revocation
- `createRevocationList(issuer, entries)` - Create list
- `signRevocationList(list, privateKey)` - Sign list
- `isPIDRevoked(pid, list)` - Check if revoked
- `getNewPID(oldPid, list)` - Get new PID

---

## 🔐 5 ZKP Patterns

### Pattern 1: ZK-Membership Proof

**Use Case:** Prove address is in valid set without revealing it

**When to use:**
- ✅ E-commerce checkout (prove valid shipping destination)
- ✅ Access control (prove authorized address)
- ✅ Compliance (prove address in allowed region)

```typescript
// Generate membership proof
const proof = generateZKMembershipProof(
  pid,
  merkleRoot,
  circuit
);

// Verify membership proof
const result = verifyZKMembershipProof(proof, circuit);

if (result.valid) {
  console.log('✅ Address is in valid set');
} else {
  console.log('❌ Address not in valid set');
}
```

**What's revealed:** Nothing about the address
**What's proven:** Address exists in valid set

---

### Pattern 2: ZK-Structure Proof

**Use Case:** Prove address hierarchy is valid

**When to use:**
- ✅ Validate PID structure (Country → Province → City → ...)
- ✅ Ensure address follows country-specific rules
- ✅ Verify hierarchical integrity

```typescript
// Generate structure proof
const proof = generateZKStructureProof(
  pidComponents,
  circuit
);

// Verify structure proof
const result = verifyZKStructureProof(proof, circuit);

if (result.valid) {
  console.log('✅ PID structure is valid');
}
```

**What's revealed:** Country code, hierarchy depth
**What's proven:** PID follows correct structure

---

### Pattern 3: ZK-Selective Reveal Proof

**Use Case:** Reveal only selected address fields

**When to use:**
- ✅ Friend sharing (reveal city + locker, hide street)
- ✅ Partial disclosure to merchants
- ✅ Privacy-preserving integrations

```typescript
// Choose fields to reveal
const fieldsToReveal = ['city', 'postal_code'];

// Generate selective reveal proof
const proof = generateZKSelectiveRevealProof(
  pid,
  fullAddress,
  fieldsToReveal,
  circuit
);

// Verify and get revealed data
const result = verifyZKSelectiveRevealProof(proof, circuit);

console.log('Revealed:', result.revealedData);
// Output: { city: 'Tokyo', postal_code: '100-0001' }
```

**What's revealed:** Only selected fields
**What's hidden:** All other fields

---

### Pattern 4: ZK-Version Proof

**Use Case:** Prove continuity across address changes

**When to use:**
- ✅ Handle user moving to new address
- ✅ Maintain QR/NFC credentials after move
- ✅ Link old and new PIDs

```typescript
// Generate version proof
const proof = generateZKVersionProof(
  oldPid,
  newPid,
  circuit
);

// Verify version proof
const result = verifyZKVersionProof(proof, circuit);

if (result.valid) {
  console.log('✅ Ownership continuity proven');
}
```

**What's revealed:** Old and new PIDs are linked
**What's proven:** Same user owns both PIDs

---

### Pattern 5: ZK-Locker Proof

**Use Case:** Prove locker access without revealing which locker

**When to use:**
- ✅ Anonymous locker pickup
- ✅ PUDO (Pick Up Drop Off) points
- ✅ Privacy-preserving package collection

```typescript
// Generate locker proof
const proof = generateZKLockerProof(
  lockerId,
  facilityId,
  merkleRoot,
  circuit
);

// Verify locker proof
const result = verifyZKLockerProof(proof, circuit);

console.log('Facility:', result.facilityId);
// Locker ID remains private
```

**What's revealed:** Facility ID
**What's hidden:** Specific locker number

---

## 💡 Common Use Cases

### E-commerce Checkout

```typescript
// Merchant wants to validate shipping destination
const proof = generateZKMembershipProof(pid, merkleRoot, circuit);
const valid = verifyZKMembershipProof(proof, circuit).valid;

if (valid) {
  // ✅ Create order with PID (not actual address)
  const waybill = createZKPWaybill(...);
}
```

### Friend Sharing Address

```typescript
// Share city and locker, hide street address
const proof = generateZKSelectiveRevealProof(
  pid,
  fullAddress,
  ['city', 'locker_id'],
  circuit
);

// Friend can send packages to locker
```

### Moving to New Address

```typescript
// User moves from Tokyo to Osaka
const revocation = createRevocationEntry(oldPid, 'address_change');
const versionProof = generateZKVersionProof(oldPid, newPid, circuit);

// QR/NFC credentials still work with version proof
```

### Anonymous Locker Pickup

```typescript
// Prove locker access without revealing which locker
const proof = generateZKLockerProof(lockerId, facilityId, merkleRoot, circuit);

// Facility grants access, doesn't know specific locker
```

---

## 📝 Code Snippets

### Complete Flow Example

```typescript
import {
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  createZKPWaybill,
} from '@vey/core';

async function completeFlow() {
  // 1. User registration
  const didDoc = createDIDDocument(userDid, publicKey);
  const credential = createAddressPIDCredential(userDid, providerDid, pid, 'JP');
  const signed = signCredential(credential, privateKey, verificationMethod);
  const isValid = verifyCredential(signed, publicKey);

  // 2. Shipping request
  const circuit = createZKCircuit('shipping-v1', 'Shipping', 'Validate destination');
  const proof = generateZKProof(pid, conditions, circuit, addressData);
  const proofValid = verifyZKProof(proof, circuit).valid;

  // 3. Create waybill
  if (proofValid) {
    const waybill = createZKPWaybill(waybillId, pid, proof, trackingNumber, metadata);
    return waybill;
  }
}
```

### Pattern Selection Guide

```typescript
// Choose the right pattern for your use case

// Need to prove address is valid without revealing it?
→ Use ZK-Membership Proof

// Need to validate PID hierarchy?
→ Use ZK-Structure Proof

// Need to reveal some fields but hide others?
→ Use ZK-Selective Reveal Proof

// User moved and needs to prove continuity?
→ Use ZK-Version Proof

// Need anonymous locker access?
→ Use ZK-Locker Proof
```

---

## ⚠️ Error Handling

### Common Errors

```typescript
// Error: Invalid proof
try {
  const result = verifyZKProof(proof, circuit);
  if (!result.valid) {
    console.error('Proof verification failed:', result.error);
  }
} catch (error) {
  console.error('Verification error:', error);
}

// Error: Revoked PID
const isRevoked = isPIDRevoked(pid, revocationList);
if (isRevoked) {
  const newPid = getNewPID(pid, revocationList);
  console.log('Use new PID:', newPid);
}

// Error: Access denied
const hasAccess = validateAccessPolicy(policy, actorDid, action);
if (!hasAccess) {
  throw new Error('Access denied');
}
```

### Best Practices

```typescript
// ✅ Always verify proofs before using
const result = verifyZKProof(proof, circuit);
if (!result.valid) {
  throw new Error('Invalid proof');
}

// ✅ Check revocation before using PID
if (isPIDRevoked(pid, revocationList)) {
  throw new Error('PID is revoked');
}

// ✅ Validate access before resolving
if (!validateAccessPolicy(policy, actor, 'resolve')) {
  throw new Error('Access denied');
}

// ✅ Log all access for audit
createAuditLogEntry(pid, actor, action, result, metadata);
```

---

## 📚 Additional Resources

- **[Developer Guide](./developer-guide.md)** - Comprehensive developer documentation
- **[API Reference](../zkp-api.md)** - Complete API documentation
- **[Protocol Overview](../zkp-protocol.md)** - Protocol specification
- **[Examples](../../examples/zkp-demo/)** - Working code examples
- **[Integration Tests](../../examples/zkp-demo/integration-test.ts)** - Test suite

---

## 🆘 Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/rei-k/world-address/discussions)
- **Bug?** File a [Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml)
- **Feature Request?** Submit a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml)

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**License:** MIT
