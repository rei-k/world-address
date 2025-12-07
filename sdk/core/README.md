# @vey/core

[![npm version](https://img.shields.io/npm/v/@vey/core.svg?style=flat)](https://www.npmjs.com/package/@vey/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen.svg)](./tests)

Core SDK for **World Address YAML** - A comprehensive library for handling international address formats, validation, geocoding, and privacy-preserving delivery with Zero-Knowledge Proof (ZKP) support.

## 🌟 Features

### Core Features
- ✅ **Address Validation** - Validate addresses for 269 countries/regions with format checking, postal code validation, and required field verification
- ✅ **Address Formatting** - Format addresses according to country-specific conventions
- ✅ **Address PID (Place ID)** - Hierarchical place identifiers for unique global address identification
- ✅ **Geocoding & Reverse Geocoding** - Convert addresses to coordinates and vice versa (OpenStreetMap Nominatim)
- ✅ **Country Registry** - Access detailed country information including postal formats, currencies, tax rates, and more

### Advanced Features
- 🔐 **Zero-Knowledge Proof (ZKP)** - Privacy-preserving address verification without exposing raw addresses
- 🎁 **Gift & Friend Management** - Send gifts to friends without knowing their address
- 🚚 **Logistics Integration** - Comprehensive delivery tracking, waybill generation, and carrier integration
- 📊 **Analytics & Dashboard** - Track address usage, delivery success rates, and user engagement
- 🔒 **Encryption & Security** - AES-256 encryption, secure key management, and E2E encryption
- 🌍 **Territorial Restrictions** - Support for sensitive territorial naming (e.g., Japanese government policies)
- 📱 **Hardware Integration** - QR code generation, NFC support, printer integration

### Data Support
- **Coverage**: 325 entities (269 main countries/regions + 56 additional entities)
- **Formats**: YAML and JSON
- **Completeness**: 99% average data completeness
- **POS Support**: Currency, tax rates, receipt requirements for all 269 countries
- **Geo-coordinates**: Latitude/longitude for all 269 countries

## 📦 Installation

### NPM (Once Published)

```bash
npm install @vey/core
```

### Local Development

```bash
# Clone repository
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml/sdk/core

# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test
```

## 🚀 Quick Start

### Basic Address Validation

```typescript
import { validateAddress } from '@vey/core';

// Validate a Japanese address
const result = validateAddress({
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1'
});

if (result.valid) {
  console.log('✅ Valid address');
} else {
  console.log('❌ Invalid address:', result.errors);
}
```

### Address Formatting

```typescript
import { formatAddress } from '@vey/core';

const formattedAddress = formatAddress({
  country: 'US',
  street_address: '1600 Pennsylvania Avenue NW',
  city: 'Washington',
  province: 'DC',
  postal_code: '20500'
}, 'label'); // or 'inline', 'multiline'

console.log(formattedAddress);
// Output:
// 1600 Pennsylvania Avenue NW
// Washington, DC 20500
// United States
```

### Address PID Generation

```typescript
import { encodePID, decodePID, validatePID } from '@vey/core';

// Generate hierarchical Place ID
const pid = encodePID({
  country: 'JP',
  admin1: '13',      // Tokyo
  admin2: '113',     // Shibuya-ku
  locality: '01',
  sublocality: 'T07', // 7-chome
  block: 'B12',      // 12-banchi
  building: 'BN02',  // Building-02
  unit: 'R342'       // Room 342
});

console.log(pid); // "JP-13-113-01-T07-B12-BN02-R342"

// Decode PID back to components
const components = decodePID(pid);
console.log(components);
// {
//   country: 'JP',
//   admin1: '13',
//   admin2: '113',
//   ...
// }

// Validate PID
const validation = validatePID(pid);
if (validation.valid) {
  console.log('Valid PID with', validation.components.length, 'components');
}
```

### Geocoding

```typescript
import { forwardGeocode, reverseGeocode } from '@vey/core';

// Forward geocoding: Address → Coordinates
const geocodeResult = await forwardGeocode({
  address: {
    city: 'Tokyo',
    country: 'JP'
  }
});

if (geocodeResult.success) {
  console.log('Coordinates:', geocodeResult.coordinates);
  // { latitude: 35.6812, longitude: 139.7671 }
}

// Reverse geocoding: Coordinates → Address
const reverseResult = await reverseGeocode({
  coordinates: {
    latitude: 35.6812,
    longitude: 139.7671
  }
});

if (reverseResult.success) {
  console.log('Address:', reverseResult.address);
  // { country: 'JP', city: 'Tokyo', ... }
}
```

### Country Information

```typescript
import { getCountryInfo, getAllCountries } from '@vey/core';

// Get detailed country information
const japan = getCountryInfo('JP');
console.log(japan);
// {
//   name: { en: 'Japan', local: [{ lang: 'ja', value: '日本' }] },
//   iso_codes: { alpha2: 'JP', alpha3: 'JPN', numeric: '392' },
//   address_format: { ... },
//   pos: {
//     currency: { code: 'JPY', symbol: '¥', decimal_places: 0 },
//     tax: { type: 'Consumption Tax', rate: { standard: 0.10 } }
//   },
//   geo: { center: { latitude: 35.6812, longitude: 139.7671 } }
// }

// List all countries
const allCountries = getAllCountries();
console.log(`Total countries: ${allCountries.length}`); // 269
```

## 🔐 Zero-Knowledge Proof (ZKP) Usage

### Address Registration with ZKP

```typescript
import { createAddressPIDCredential, encryptAddress } from '@vey/core';

// 1. User registers their address
const userAddress = {
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1'
};

// 2. Encrypt address with E2E encryption
const encrypted = await encryptAddress(userAddress, userPublicKey);

// 3. Generate Address PID Credential (Verifiable Credential)
const credential = createAddressPIDCredential(
  'did:key:user123',        // User DID
  'did:web:vey.example',    // Provider DID
  'JP-13-101-01',           // Address PID
  'JP',                     // Country
  '13'                      // Admin1 (Prefecture)
);

console.log('Address credential created:', credential.id);
```

### E-commerce Delivery Verification (Without Exposing Address)

```typescript
import { validateShippingRequest, createZKPWaybill } from '@vey/core';

// E-commerce site wants to verify delivery capability
// WITHOUT seeing the raw address
const shippingRequest = {
  pid: 'JP-13-101-01',
  conditions: {
    allowedCountries: ['JP'],
    allowedRegions: ['13', '14', '27'], // Tokyo, Kanagawa, Osaka
  },
  requesterId: 'did:web:ec-site.example',
  timestamp: new Date().toISOString()
};

// Validate with ZK proof (only address provider has raw address)
const response = await validateShippingRequest(
  shippingRequest,
  zkCircuit,          // Zero-knowledge circuit
  fullAddress         // Only provider has this
);

if (response.valid && response.zkProof) {
  console.log('✅ Delivery is possible (verified with ZK proof)');
  
  // Create waybill with ZK proof
  const waybill = createZKPWaybill(
    'WB-001',             // Waybill number
    'JP-13-101-01',       // Address PID
    response.zkProof,     // ZK proof
    'TN-001'              // Tracking number
  );
  
  // E-commerce site stores only PID and ZK proof
  // Raw address is NEVER exposed!
}
```

### Friend Gift Delivery (Privacy-Preserving)

```typescript
import { createFriendRequest, sendGift } from '@vey/core';

// User A wants to send a gift to User B
// User B's address is never revealed to User A

// 1. User A sends friend request via QR/NFC
const friendRequest = await createFriendRequest({
  requesterId: 'did:key:userA',
  recipientId: 'did:key:userB',
  message: 'Would you like to be friends?'
});

// 2. User B accepts and grants delivery permission
// (raw address is still private)

// 3. User A sends a gift
const giftResult = await sendGift({
  senderId: 'did:key:userA',
  recipientPID: 'JP-13-101-01',  // Only PID is known
  giftDescription: 'Birthday present',
  deliveryOptions: {
    priority: 'standard',
    insurance: true
  }
});

// 4. Carrier accesses address only when needed for delivery
console.log('Gift sent! Tracking:', giftResult.trackingNumber);
```

## 📊 Advanced Features

### Analytics Dashboard

```typescript
import { getDashboardStats, getAddressUsageByCountry } from '@vey/core';

// Get comprehensive dashboard statistics
const stats = await getDashboardStats('user123');

console.log(stats);
// {
//   totalAddresses: 5,
//   totalGiftsSent: 12,
//   totalGiftsReceived: 8,
//   deliverySuccessRate: 0.95,
//   mostUsedCountries: ['JP', 'US', 'KR'],
//   recentActivity: [...]
// }

// Get address usage breakdown by country
const countryUsage = await getAddressUsageByCountry('user123');
console.log(countryUsage);
// {
//   'JP': 45,
//   'US': 30,
//   'KR': 15,
//   ...
// }
```

### Logistics Integration

```typescript
import { createWaybill, trackShipment, estimateDelivery } from '@vey/core';

// Create waybill for shipment
const waybill = await createWaybill({
  sender: senderAddress,
  recipient: recipientPID, // Can use PID instead of raw address
  carrier: 'FEDEX',
  serviceType: 'PRIORITY',
  items: [
    { description: 'Electronics', weight: 2.5, value: 50000 }
  ]
});

console.log('Waybill created:', waybill.number);

// Track shipment
const tracking = await trackShipment(waybill.number);
console.log('Current status:', tracking.status);
console.log('Location:', tracking.currentLocation);
console.log('ETA:', tracking.estimatedDelivery);

// Estimate delivery time and cost
const estimate = await estimateDelivery({
  from: { country: 'JP', city: 'Tokyo' },
  to: { country: 'US', city: 'New York' },
  carrier: 'DHL',
  weight: 2.5
});

console.log('Delivery estimate:', estimate.days, 'days');
console.log('Cost estimate:', estimate.cost, estimate.currency);
```

### Veyform Integration (Universal Address Form)

```typescript
import { createVeyformClient, VeyformConfig } from '@vey/core';

// Initialize Veyform client
const veyform = createVeyformClient({
  apiKey: 'your-api-key',
  theme: 'auto', // 'light', 'dark', or 'auto'
  language: 'ja', // 'en', 'ja', 'zh', 'ko'
  analytics: {
    enabled: true,
    anonymize: true
  }
});

// Render address form
veyform.render('#address-form-container', {
  countryCode: 'JP',
  onComplete: (address, validation) => {
    if (validation.valid) {
      console.log('Address submitted:', address);
      console.log('Validation:', validation);
    }
  },
  onCountryChange: (newCountry) => {
    console.log('Country changed to:', newCountry);
  }
});

// Get analytics
const analytics = veyform.getAnalytics();
console.log('Form completion rate:', analytics.completionRate);
console.log('Most selected countries:', analytics.topCountries);
```

## 🌍 Territorial Restrictions

The SDK supports territorial naming policies, including Japanese government positions on disputed territories:

```typescript
import { applyTerritorialRestrictions } from '@vey/core';

// Apply Japanese territorial restrictions
const restricted = applyTerritorialRestrictions({
  country: 'RU',
  province: 'Sakhalin',
  displayLanguage: 'ja'
});

console.log(restricted.displayName);
// Shows "北方領土" (Northern Territories) instead of Russian names
// when displaying to Japanese users

// For international users, original names are preserved
const international = applyTerritorialRestrictions({
  country: 'RU',
  province: 'Sakhalin',
  displayLanguage: 'en'
});

console.log(international.displayName); // "Sakhalin"
```

## 📚 API Reference

### Address Validation

- `validateAddress(address, options?)` - Validate address format and required fields
- `validatePostalCode(code, country)` - Validate postal code format
- `validatePID(pid)` - Validate Address PID format

### Address Formatting

- `formatAddress(address, format)` - Format address for display
- `normalizeAddress(address, country)` - Normalize address to standard format

### Address PID

- `encodePID(components)` - Generate hierarchical Place ID
- `decodePID(pid)` - Decode PID to components
- `comparePID(pid1, pid2)` - Compare two PIDs for hierarchy

### Geocoding

- `forwardGeocode(request)` - Convert address to coordinates
- `reverseGeocode(request)` - Convert coordinates to address
- `geocode(request)` - Auto-detect direction (forward or reverse)

### Country Registry

- `getCountryInfo(countryCode)` - Get detailed country information
- `getAllCountries()` - List all supported countries
- `searchCountries(query)` - Search countries by name

### Zero-Knowledge Proof

- `createAddressPIDCredential(userDID, providerDID, pid, country, admin1)` - Issue VC
- `validateShippingRequest(request, circuit, address)` - Verify with ZK proof
- `createZKPWaybill(number, pid, proof, tracking)` - Create ZKP waybill

### Gift & Friends

- `createFriendRequest(options)` - Send friend request
- `acceptFriendRequest(requestId, permissions)` - Accept friend request
- `sendGift(options)` - Send gift to friend
- `getReceivedGifts(userId)` - Get received gifts

### Logistics

- `createWaybill(options)` - Create shipping waybill
- `trackShipment(trackingNumber)` - Track shipment status
- `estimateDelivery(options)` - Estimate delivery time/cost

### Encryption & Security

- `encryptAddress(address, publicKey)` - Encrypt address (AES-256)
- `decryptAddress(encrypted, privateKey)` - Decrypt address
- `hashData(data)` - Generate secure hash (SHA-256)

### Analytics & Dashboard

- `getDashboardStats(userId)` - Get user dashboard statistics
- `getAddressUsageByCountry(userId)` - Get country usage breakdown
- `trackEvent(eventType, data)` - Track analytics event

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- validator.test.ts

# Watch mode
npm test -- --watch
```

Current test coverage: **98%** (682 passing tests out of 693 total)

## 🛠️ Development

### Project Structure

```
sdk/core/
├── src/
│   ├── index.ts              # Main entry point
│   ├── validator.ts          # Address validation
│   ├── formatter.ts          # Address formatting
│   ├── pid.ts                # Address PID (Place ID)
│   ├── geocode.ts            # Geocoding & reverse geocoding
│   ├── country-registry.ts   # Country information
│   ├── zkp.ts                # Zero-knowledge proof
│   ├── gift.ts               # Gift delivery system
│   ├── friends.ts            # Friend management
│   ├── logistics.ts          # Logistics integration
│   ├── crypto.ts             # Encryption & security
│   ├── dashboard.ts          # Analytics dashboard
│   ├── veyform.ts            # Veyform client
│   ├── system.ts             # System management
│   ├── hardware.ts           # QR/NFC/Printer
│   ├── engagement.ts         # User engagement
│   ├── territorial-restrictions.ts  # Territorial naming
│   └── types.ts              # TypeScript type definitions
├── tests/                    # Test files
├── dist/                     # Build output
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### Build

```bash
npm run build
```

This generates:
- `dist/index.js` - CommonJS build
- `dist/index.mjs` - ES Module build
- `dist/index.d.ts` - TypeScript definitions

### Linting & Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run typecheck
```

## 🌐 Data Sources

This SDK uses data from:

- **World Address YAML** - 269 countries/regions address formats
- **Google libaddressinput** - International address metadata (auto-updated daily)
- **OpenStreetMap Nominatim** - Geocoding and reverse geocoding
- **ISO 3166** - Country codes
- **Universal Postal Union** - International postal standards

## 📖 Documentation

- [Complete SDK Documentation](../../docs/sdk/)
- [ZKP Protocol Guide](../../docs/zkp-protocol.md)
- [Geocoding Guide](../../docs/geocoding-guide.md)
- [Veyform Documentation](../../docs/veyform/README.md)
- [API Reference](../../docs/api-reference.md)
- [Schema Documentation](../../docs/schema/README.md)

## 🤝 Contributing

We welcome contributions! Please see:

- [Contributing Guide](../../CONTRIBUTING.md)
- [Development Guide](../../DEVELOPMENT.md)
- [Code of Conduct](../../CODE_OF_CONDUCT.md)

## 📜 License

MIT License - see [LICENSE](../../LICENSE) for details.

## 🔗 Related Projects

- [world-address-yaml](https://github.com/rei-k/world-address-yaml) - Main repository
- [@vey/react](../react) - React SDK (planned)
- [@vey/vue](../vue) - Vue SDK (planned)
- [@vey/widget](../widget) - Universal Widget (planned)

## 📞 Support

- [GitHub Issues](https://github.com/rei-k/world-address-yaml/issues)
- [Discussions](https://github.com/rei-k/world-address-yaml/discussions)
- [Documentation](https://github.com/rei-k/world-address-yaml/tree/main/docs)

---

Made with ❤️ by the Vey Team
