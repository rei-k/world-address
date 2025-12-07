# Veyvault Demo - Cloud Address Book

A minimal viable demonstration of the Veyvault cloud address book application using the `@vey/core` SDK.

## 🎯 Overview

Veyvault is a privacy-first cloud address book that enables:
- Secure address storage with end-to-end encryption
- Address sharing via QR/NFC without exposing raw addresses
- Zero-Knowledge Proof delivery verification
- Friend management with privacy preservation

## ✨ Features Demonstrated

- ✅ **Address Management**: Store and manage multiple addresses
- ✅ **Address PID Generation**: Hierarchical place identifiers for privacy
- ✅ **Country Support**: All 269 countries/regions supported
- ✅ **Privacy-First**: Addresses stored as PIDs, not raw data

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the demo
npm run address-book
```

## 📂 Project Structure

```
veyvault-demo/
├── src/
│   ├── address-book.js    # Address book management demo
│   └── zkp-demo.js        # ZKP demonstration (coming soon)
├── package.json
└── README.md
```

## 💡 Use Cases

### 1. Personal Address Management
Store your home, work, and other addresses securely.

### 2. Friend Address Sharing
Share your address with friends via QR code without exposing the raw address.

### 3. E-commerce Integration
Enable one-click checkout on e-commerce sites without re-entering your address.

### 4. Privacy-Preserving Delivery
Receive packages without the seller ever seeing your raw address.

## 🔐 Privacy Features

- **End-to-End Encryption**: Addresses encrypted with AES-256
- **Zero-Knowledge Proof**: Verify delivery capability without revealing address
- **PID-based Sharing**: Share hierarchical place IDs instead of raw addresses
- **Friend Permissions**: Granular control over who can send to which addresses

## 📖 Documentation

For complete Veyvault documentation, see:
- [Veyvault Full Specification](../../Vey/apps/Veyvault/README.md)
- [SDK Documentation](../../sdk/core/README.md)
- [ZKP Protocol Guide](../../docs/zkp-protocol.md)

## 🛠️ Technology Stack

- **Backend**: Node.js with @vey/core SDK
- **Encryption**: AES-256 (via SDK)
- **Privacy**: Zero-Knowledge Proof protocol
- **Data**: 269 countries/regions from world-address-yaml

## 📜 License

MIT License - see [LICENSE](../../LICENSE)
