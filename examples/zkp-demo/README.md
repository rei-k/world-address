# ZKP Demo - Zero-Knowledge Proof Address Protocol

This demo showcases the complete ZKP Address Protocol with 4 main flows and 5 ZKP patterns.

## 🎯 Overview

The ZKP Address Protocol enables privacy-preserving address management and delivery. Key features:

- **Privacy**: Merchants never see your actual address
- **Security**: Addresses stored as hierarchical PIDs  
- **Selective Disclosure**: Users control what information to reveal
- **Audit Trail**: Complete transparency with zero-knowledge proofs
- **Continuity**: Address updates don't break existing deliveries

## 📂 Demo Structure

```
zkp-demo/
├── package.json
├── README.md
└── src/
    ├── 01-registration-flow.js      # Address registration & credential issuance
    ├── 02-shipping-flow.js          # E-commerce checkout with ZKP
    ├── 03-delivery-flow.js          # Carrier access & tracking
    └── 04-address-update-flow.js    # Moving house with continuity
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
cd examples/zkp-demo
npm install
```

### Running Individual Demos

```bash
# Flow 1: Address Registration
npm run demo:registration

# Flow 2: Shipping Request
npm run demo:shipping

# Flow 3: Delivery Execution
npm run demo:delivery

# Flow 4: Address Update
npm run demo:update
```

### Running All Demos

```bash
npm run demo:all
```

## 📖 Demo Flows

### Flow 1: Address Registration & Authentication

**What it demonstrates:**
- User creates a DID (Decentralized Identifier)
- Address is normalized to a PID (Place Identifier)
- Verifiable Credential is issued
- Credential is signed and verified

**Key Concept:** Raw address never leaves user's wallet, only PID is stored.

```bash
npm run demo:registration
```

**Expected Output:**
```
🔐 ZKP Demo - Flow 1: Address Registration & Authentication

📝 Step 1: Creating DID for user...
✅ DID created: did:key:z6Mkh...

📍 Step 2: User submits address to Address Provider...
   Address: { country: 'JP', postalCode: '100-0001', ... }

🔄 Step 3: Address Provider normalizes to PID...
✅ PID generated: JP-13-113-01
   Structure: Country-Admin1-Admin2-Admin3

📜 Step 4: Issuing Address PID Credential...
✅ Credential created

🔏 Step 5: Signing credential...
✅ Credential signed

✔️  Step 6: Verifying credential...
✅ Credential is VALID!

💡 Key Point: Raw address never leaves user's wallet!
```

### Flow 2: Shipping Request & Waybill Generation

**What it demonstrates:**
- ZK Circuit creation for membership proof
- Zero-Knowledge Proof generation
- Merchant validates delivery capability WITHOUT seeing address
- ZKP-enabled waybill creation

**Key Concept:** Merchant only sees country + prefecture, full address remains hidden.

```bash
npm run demo:shipping
```

**Expected Output:**
```
🚚 ZKP Demo - Flow 2: Shipping Request & Waybill Generation

🛒 Step 1: User proceeds to checkout...
   Cart: 3 items, Total: ¥15,000

🔐 Step 2: Creating ZK Circuit for membership proof...
✅ ZK Circuit created

🔏 Step 3: Generating Zero-Knowledge Proof...
✅ ZK Proof generated

👀 What the merchant can see:
   ✅ Country: JP (Japan)
   ✅ Admin1: 13 (Tokyo)

🔒 What remains hidden:
   🔐 Full PID: JP-13-113-01
   🔐 City: Chiyoda-ku
   🔐 Street: Chiyoda 1-1

✔️  Step 5: Merchant validates shipping request...
✅ Shipping request is VALID!

📋 Step 6: Creating ZKP-enabled waybill...
✅ ZKP Waybill created

💡 Key Points:
   • Merchant verified delivery capability
   • Merchant NEVER saw full address
```

### Flow 3: Delivery Execution & Tracking

**What it demonstrates:**
- Carrier validates access policy
- PID resolution to full address (when needed)
- Audit log creation for compliance
- Real-time delivery tracking

**Key Concept:** Address accessed ONLY when needed for delivery, all access logged.

```bash
npm run demo:delivery
```

**Expected Output:**
```
📦 ZKP Demo - Flow 3: Delivery Execution & Tracking

📨 Step 1: Carrier receives waybill from merchant...
   Carrier: Yamato Transport
   Full Address: 🔒 Encrypted

🔐 Step 2: Validating carrier access policy...
✅ Access GRANTED

🗺️  Step 3: Resolving PID to actual address...
   ⚠️  This action will be logged for audit purposes
✅ PID resolved to full address

📝 Step 4: Creating audit log entry...
✅ Audit log created

🚛 Step 5: Updating delivery tracking...
✅ Tracking updated: OUT_FOR_DELIVERY
✅ Tracking updated: DELIVERED

💡 Key Points:
   • Address accessed ONLY when needed
   • All access logged for audit
   • User can view audit trail
```

### Flow 4: Address Update & Revocation

**What it demonstrates:**
- User moves to new address
- New credential issued
- ZK Version Proof links old and new addresses
- Old PID revoked
- Delivery continuity maintained

**Key Concept:** Moving house doesn't break QR codes or pending deliveries.

```bash
npm run demo:update
```

**Expected Output:**
```
🏠 ZKP Demo - Flow 4: Address Update & Revocation

📦 Step 1: User is moving to a new address...
   Old Address (Tokyo): JP-13-113-01
   New Address (Osaka): JP-27-100-05

📜 Step 2: Issuing new Address PID Credential...
✅ New credential issued

🔗 Step 3: Generating ZK Version Proof...
   This proves the same user owns both addresses
✅ ZK Version Proof generated

✔️  Step 4: Verifying version proof...
✅ Version proof is VALID!

🚫 Step 5: Creating revocation entry for old PID...
✅ Revocation entry created

📝 Step 6: Adding to revocation list...
✅ Revocation list updated

🔍 Step 7: Checking revocation status...
   Old PID: 🚫 REVOKED
   New PID: ✅ Active

🔄 Step 8: Demonstrating delivery continuity...
   • QR code generated with old PID
   • System finds new PID via version proof
   • Automatically redirects to new address
   • Delivery continues seamlessly! ✅
```

## 🔐 5 ZKP Patterns Demonstrated

### 1. ZK-Membership Proof
**Used in:** Flow 2 (Shipping Request)  
**Purpose:** Prove address is in valid set without revealing it

### 2. ZK-Structure Proof
**Used in:** Flow 1 (Registration)  
**Purpose:** Prove PID has correct hierarchical structure

### 3. ZK-Selective Reveal Proof
**Used in:** Flow 2 (Shipping Request)  
**Purpose:** Reveal only selected fields (country, prefecture)

### 4. ZK-Version Proof
**Used in:** Flow 4 (Address Update)  
**Purpose:** Prove old and new addresses belong to same owner

### 5. ZK-Locker Proof
**Not demonstrated** - See [Locker Example](../examples/zkp/locker-proof.ts)  
**Purpose:** Prove locker access without revealing which locker

## 💡 Key Takeaways

1. **Privacy by Design**
   - Raw addresses never exposed to merchants
   - Only necessary information revealed
   - User controls data sharing

2. **Security & Compliance**
   - All address access logged
   - Cryptographic proofs prevent fraud
   - Audit trail for compliance

3. **User Experience**
   - No disruption when moving
   - QR codes work across address changes
   - Seamless delivery continuity

4. **Technical Innovation**
   - Zero-Knowledge Proofs for privacy
   - Hierarchical PIDs for structure
   - DID/VC for decentralization

## 📚 Learn More

- [ZKP Developer Guide](../../docs/ZKP_DEVELOPER_GUIDE.md)
- [ZKP Protocol Specification](../../docs/zkp-protocol.md)
- [ZKP API Reference](../../docs/zkp-api.md)
- [SDK Documentation](../../sdk/core/README.md)

## 🧪 Testing

The SDK includes comprehensive tests for ZKP functionality:

```bash
cd ../../sdk/core
npm run test tests/zkp.test.ts
```

## 🛠️ Integration

To integrate ZKP into your application:

```typescript
import { 
  createDIDDocument,
  createAddressPIDCredential,
  generateZKProof,
  verifyZKProof 
} from '@vey/core';

// Your implementation here
```

See the [Integration Guide](../../docs/zkp/implementation-guide.md) for details.

## 🤝 Contributing

Found an issue or have suggestions? Open an issue or PR!

## 📜 License

MIT - see [LICENSE](../../LICENSE)
