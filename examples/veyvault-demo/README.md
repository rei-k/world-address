# Veyvault Demo - Cloud Address Book

A comprehensive demonstration of the Veyvault cloud address book application using the `@vey/core` SDK.

## 🎯 Overview

Veyvault is a privacy-first cloud address book that enables:
- Secure address storage with end-to-end encryption
- Address sharing via QR/NFC without exposing raw addresses
- Zero-Knowledge Proof delivery verification
- Friend management with privacy preservation
- One-click e-commerce checkout integration

## ✨ Features Demonstrated

### Core Features
- ✅ **Address Management**: Store and manage multiple addresses
- ✅ **Address PID Generation**: Hierarchical place identifiers for privacy
- ✅ **Country Support**: All 269 countries/regions supported
- ✅ **Privacy-First**: Addresses stored as PIDs, not raw data

### New Enhanced Features
- ✅ **Friend Sharing**: Share addresses with selective disclosure
- ✅ **QR Code Generation**: Easy address sharing via QR codes
- ✅ **Permission Management**: Granular control over shared information
- ✅ **E-commerce Integration**: One-click checkout without re-entering address
- ✅ **ZKP Validation**: Privacy-preserving payment and delivery flows

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run address book demo
npm run address-book

# Run friend sharing demo
npm run friend-sharing

# Run e-commerce integration demo
npm run ecommerce

# Run QR code sharing demo (NEW)
npm run qr-code

# Run all demos
npm run all
```

## 📂 Project Structure

```
veyvault-demo/
├── src/
│   ├── address-book.js           # Address book management demo
│   ├── friend-sharing.js         # Friend sharing & QR code demo
│   ├── ecommerce-integration.js  # E-commerce checkout demo
│   └── qr-code-sharing.js        # QR/NFC code generation demo (NEW)
├── package.json
└── README.md
```

## 💡 Use Cases

### 1. Personal Address Management

Store your home, work, and other addresses securely with privacy-preserving PIDs.

**Run:** `npm run address-book`

**Features:**
- Add multiple addresses with labels
- Generate PIDs for each address
- Filter addresses by country
- Update labels and delete addresses
- Display formatted address book

### 2. Friend Address Sharing

Share your address with friends via QR code without exposing the raw address.

**Run:** `npm run friend-sharing`

**Features:**
- Add friends with DID authentication
- Share addresses with selective disclosure
- Generate QR codes for easy sharing
- Manage friend-specific permissions
- Revoke sharing when needed

**Example Output:**
```
✅ Shared with Bob
   Fields revealed: city, postal_code
   Can send packages: true

🔒 Bob CANNOT see:
   ❌ street_address: [Hidden for privacy]
   ❌ building: [Hidden for privacy]
   ❌ room: [Hidden for privacy]
```

### 3. E-commerce Integration

Enable one-click checkout on e-commerce sites without re-entering your address.

**Run:** `npm run ecommerce`

**Features:**
- Select from saved addresses
- One-click checkout flow
- Privacy-preserving ZKP validation
- Merchant never sees full address
- Automatic waybill generation

**Example Flow:**
1. User adds items to cart
2. Selects saved address from Veyvault
3. ZK proof generated and verified
4. Order created with PID token (not actual address)
5. Carrier gets full address only at delivery time

### 4. Privacy-Preserving Delivery

Receive packages without the seller ever seeing your raw address.

**Run:** `npm run ecommerce`

**Privacy Breakdown:**
- **User knows**: Full address, order details
- **Merchant knows**: Valid shipping destination (via proof), PID token
- **Merchant does NOT know**: Street address, building, room
- **Carrier knows**: Full address (only at delivery time, access logged)

### 5. QR Code & NFC Sharing (NEW)

Share your address via QR code or NFC with privacy controls and time limits.

**Run:** `npm run qr-code`

**Features:**
- Generate QR codes with selective disclosure
- NFC-compatible payload format
- Time-limited access (auto-expiration)
- Multiple use cases (friends, delivery, locker access)

**Example Scenarios:**
```
1. Friend Sharing - QR code reveals only city and postal code
2. E-commerce - QR code for one-scan checkout
3. Locker Access - NFC tag reveals only locker ID
4. Temporary Delivery - Time-limited QR expires in 1 hour
```

**Example Output:**
```
┌─────────────────────────┐
│ ▄▄▄▄▄ ▄  ▄ ▄▄▄▄▄       │
│ █   █ ██▄  █   █       │
│ █▄▄▄█ █ █▄ █▄▄▄█       │
│ ▄▄▄▄▄▄▄█▄█▄█ ▄ ▄       │
│ ▄  ▄█▄  ▄▄ █▄▄▄█       │
│ ▄▄▄▄▄ █▄ █ ▄ ▄ ▄       │
│ █   █  █ ██▄▄▄██       │
│ █▄▄▄█ ▄█▄ ▄█ ▄▄▄       │
└─────────────────────────┘
   QR Code: eyJ2ZXJzaW9uIjoi...

📱 Scan with Veyvault app
```

## 🔐 Privacy Features

- **End-to-End Encryption**: Addresses encrypted with AES-256
- **Zero-Knowledge Proof**: Verify delivery capability without revealing address
- **PID-based Sharing**: Share hierarchical place IDs instead of raw addresses
- **Friend Permissions**: Granular control over who can send to which addresses
- **Selective Disclosure**: Choose exactly which fields to reveal
- **QR Code Sharing**: Easy sharing with built-in privacy
- **Access Logging**: All address access is logged for audit

## 📖 Documentation

For complete Veyvault documentation, see:
- [Veyvault Full Specification](../../Vey/apps/Veyvault/README.md)
- [SDK Documentation](../../sdk/core/README.md)
- [ZKP Protocol Guide](../../docs/zkp-protocol.md)
- [ZKP Developer Guide](../../docs/zkp/developer-guide.md)
- [ZKP Examples](../zkp-demo/)

## 🛠️ Technology Stack

- **Backend**: Node.js with @vey/core SDK
- **Encryption**: AES-256 (via SDK)
- **Privacy**: Zero-Knowledge Proof protocol
- **Data**: 269 countries/regions from world-address-yaml
- **Authentication**: DID (Decentralized Identifiers)

## 🔄 Integration Examples

### Quick Integration

```javascript
import { encodePID, createZKCircuit, generateZKProof } from '@vey/core';

// Generate PID for address
const pid = encodePID({
  country: 'JP',
  admin1: '13',
  admin2: '113',
});

// Generate privacy proof
const circuit = createZKCircuit('checkout-v1', 'Checkout');
const proof = generateZKProof(pid, conditions, circuit, addressData);
```

### Advanced Integration

```javascript
import {
  generateZKSelectiveRevealProof,
  verifyZKSelectiveRevealProof,
} from '@vey/core';

// Share with selective disclosure
const proof = generateZKSelectiveRevealProof(
  pid,
  fullAddress,
  ['city', 'postal_code'], // Only reveal these fields
  circuit
);

// Verify and extract revealed data
const result = verifyZKSelectiveRevealProof(proof, circuit);
console.log('Revealed:', result.revealedData);
```

## 🎨 Demo Scenarios

### Scenario 1: Alice adds addresses
```bash
npm run address-book
```
Alice adds her home, office, and parent's house addresses. Each gets a unique PID.

### Scenario 2: Alice shares with Bob
```bash
npm run friend-sharing
```
Alice adds Bob as friend and shares her address with selective disclosure (only city and postal code).

### Scenario 3: Alice shops online
```bash
npm run ecommerce
```
Alice uses one-click checkout on an e-commerce site. Merchant verifies her address is valid without seeing the actual street address.

## 📊 Comparison

| Feature | Traditional | Veyvault |
|---------|------------|----------|
| Address entry | Manual each time | One-click selection |
| Privacy | Full address exposed | PID + ZKP |
| Friend sharing | Text/email full address | QR code + selective disclosure |
| E-commerce | Enter address every time | Saved addresses |
| Merchant access | Full address stored | Only PID token |
| Carrier access | Full address from start | Only at delivery time |
| Audit trail | Limited | Complete access logs |

## 📜 License

MIT License - see [LICENSE](../../LICENSE)
