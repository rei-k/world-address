# @vey/integration

**Vey Integration SDK** - Complete integration layer for ZKP Address Protocol with ConveyID delivery system.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](./package.json)

## 🌟 Features

- **🔐 Zero-Knowledge Proofs**: Privacy-preserving address validation
- **📧 ConveyID Protocol**: Email-like delivery IDs (e.g., `alice@convey`)
- **🚚 Complete Delivery Flow**: From request to completion
- **🛡️ Privacy Protection**: No address exposure to merchants
- **📱 Easy Integration**: Simple SDK for TypeScript/JavaScript
- **🌍 International Support**: Works globally with any address format

## 📦 Installation

```bash
npm install @vey/integration @vey/core
```

```bash
yarn add @vey/integration @vey/core
```

```bash
pnpm add @vey/integration @vey/core
```

## 🚀 Quick Start

### 1. Initialize Integration

```typescript
import { createSandboxIntegration } from '@vey/integration';

// Sandbox environment for testing
const integration = await createSandboxIntegration('your_api_key');

// Production environment
import { createProductionIntegration } from '@vey/integration';
const prodIntegration = await createProductionIntegration(
  'your_api_key',
  existingKeyPair
);
```

### 2. Register User with ConveyID

```typescript
import { createConveyProtocol } from '@vey/integration';

const convey = createConveyProtocol(integration);

await convey.registerUser('alice', 'convey', 'Alice Tanaka', {
  autoAcceptFriends: false,
  autoAcceptVerified: true,
  requireManualApproval: false,
  blockedSenders: [],
});

// Now user has ConveyID: alice@convey
```

### 3. Add Address (Encrypted)

```typescript
await convey.addAddress({
  userDid: integration.getUserDid(),
  pid: 'JP-13-113-01',
  countryCode: 'JP',
  hierarchyDepth: 3,
  fullAddress: {
    country: 'Japan',
    province: 'Tokyo',
    city: 'Shibuya',
    postalCode: '150-0001',
    street: 'Jingumae 1-2-3',
  },
});
```

### 4. E-Commerce Checkout Flow

```typescript
// Store sends delivery request
const request = await storeConvey.sendDeliveryRequest(
  'alice@convey', // Just ConveyID, no address needed!
  {
    weight: 1.5,
    dimensions: { length: 30, width: 20, height: 15 },
    value: 5000,
    currency: 'JPY',
  }
);

// Customer receives and accepts
const response = await customerConvey.acceptDeliveryRequest(request.id);

// ZKP proof generated - address remains private!
console.log(response.zkpProof?.type); // 'selective-reveal'
```

### 5. Delivery Management

```typescript
import { createDeliveryFlow } from '@vey/integration';

const deliveryFlow = createDeliveryFlow(integration, convey);

// Get shipping quotes
const quotes = await deliveryFlow.getShippingQuotes(
  fromPid,
  toPid,
  packageDetails
);

// Create waybill
const waybill = await deliveryFlow.createWaybill(
  request,
  response,
  quotes[0]
);

// Track delivery
const tracking = deliveryFlow.getTracking(waybill.number);
```

## 📚 Documentation

- [API Reference](./API_REFERENCE.md) - Complete API documentation
- [Integration Guide](./README.md) - Step-by-step integration guide
- [Examples](./examples/) - Working code examples

## 🎯 Use Cases

### E-Commerce

```typescript
// Customer enters ConveyID instead of address
// Store never sees customer's physical address
// Privacy-preserving delivery validation
```

### Gift Delivery

```typescript
// Sender: 'Send gift to bob@convey'
// Recipient: Chooses delivery address
// Sender: Doesn't know recipient's address
```

### Anonymous Pickup

```typescript
// Use locker delivery with ZKP
// Prove locker access without revealing which locker
// Complete anonymity
```

### Address Migration

```typescript
// User moves to new address
// Generate version proof linking old and new
// Seamless transition without re-verification
```

## 🔒 Privacy Features

### Selective Reveal

Reveal only specific fields to different parties:

```typescript
// To merchant: Only country and postal code
const { revealedData } = await integration.generateSelectiveRevealProof(
  fullAddress,
  ['country', 'postalCode']
);
// Result: { country: 'Japan', postalCode: '150-0001' }

// To carrier: Full address for delivery
const carrierAccess = await integration.grantCarrierAccess(...);
```

### Membership Proof

Prove address validity without revealing it:

```typescript
const { proof } = await integration.generateMembershipProof(
  userPid,
  validPidSet
);
// Proves: "My address is in the valid set"
// Hidden: Which specific address
```

### Locker Proof

Prove locker access without revealing which locker:

```typescript
const { proof } = await integration.generateLockerProof(
  lockerId,
  facilityId,
  availableLockers
);
// Proves: "I have a locker at this facility"
// Hidden: Which specific locker
```

## 🌍 ConveyID Namespaces

Different namespaces for different use cases:

| ConveyID | Purpose | Use Case |
|----------|---------|----------|
| `alice@convey` | Personal | General deliveries |
| `shop@convey.store` | E-commerce | Online store |
| `company@convey.work` | Business | B2B deliveries |
| `anon@anonymous.convey` | Anonymous | Gift receiving |
| `alice@jp.convey` | Country-specific | Japan domestic |

## 📊 Example: Complete E-Commerce Flow

See [examples/ecommerce-checkout.ts](./examples/ecommerce-checkout.ts) for a complete example:

```bash
npm run example:ecommerce
```

**Output:**
```
📝 STEP 1: Customer Setup
✓ Customer ZKP integration initialized
✓ Customer registered with ConveyID: alice@convey
✓ Customer address registered (encrypted)

🏪 STEP 2: Store Setup
✓ Store registered with ConveyID: coolgadgets@convey.store

🛒 STEP 3: Checkout Process
✓ Customer enters ConveyID: alice@convey
  (No physical address needed!)

📤 STEP 4: Store Sends Delivery Request
✓ Delivery request sent

📥 STEP 5: Customer Receives & Accepts Request
✓ Customer accepted delivery request
  ⚡ Address remains private! Only ZKP proof shared.

🚚 STEP 6: Shipping & Waybill Creation
✓ Shipping quotes received
✓ Waybill created

🔐 STEP 7: Carrier Access (Privacy-Preserving)
✓ Carrier granted access to delivery address
  ⚡ Address only revealed to carrier for delivery!
  ⚡ Store never sees customer's physical address!

📍 STEP 8: Delivery Tracking
✓ Tracking Events: [...]

✅ STEP 9: Delivery Completion
✓ Delivery completed successfully!
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test zkp-integration.test.ts
```

## 🛠️ Development

```bash
# Build
npm run build

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check

# Type check
npm run typecheck
```

## 📖 Learn More

### Core Concepts

1. **DID (Decentralized Identifier)**: User identity without central authority
2. **Verifiable Credentials**: Cryptographically signed address credentials
3. **ZKP (Zero-Knowledge Proof)**: Prove statements without revealing data
4. **ConveyID**: Email-like delivery identifier
5. **PID (Persistent ID)**: Hierarchical address identifier

### ZKP Patterns

This SDK implements 5 ZKP patterns:

1. **Membership Proof**: Address is in valid set
2. **Structure Proof**: PID has correct hierarchy
3. **Selective Reveal**: Reveal chosen fields only
4. **Version Proof**: Link old and new addresses
5. **Locker Proof**: Locker access without revealing which

### Architecture

```
┌─────────────┐
│   User      │
│ (ConveyID)  │
└──────┬──────┘
       │
       │ ZKP Proof
       ▼
┌─────────────┐     Waybill     ┌─────────────┐
│  Merchant   │ ──────────────► │   Carrier   │
│             │                 │             │
└─────────────┘                 └─────────────┘
                                       │
                                       │ Full Address
                                       │ (for delivery)
                                       ▼
                                ┌─────────────┐
                                │  Recipient  │
                                └─────────────┘
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../../CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](../../../LICENSE) for details.

## 🆘 Support

- **Documentation**: https://docs.vey.com
- **API Reference**: https://api.vey.com/docs  
- **GitHub Issues**: https://github.com/rei-k/world-address-yaml/issues
- **GitHub Discussions**: https://github.com/rei-k/world-address-yaml/discussions

## 🎉 Acknowledgments

Built with:
- [circom](https://github.com/iden3/circom) - ZK circuit compiler
- [snarkjs](https://github.com/iden3/snarkjs) - ZK proof library
- [@noble/curves](https://github.com/paulmillr/noble-curves) - Ed25519 signatures
- [@noble/hashes](https://github.com/paulmillr/noble-hashes) - Cryptographic hashing

---

**Made with ❤️ by the Vey Team**

**Star us on GitHub!** ⭐
