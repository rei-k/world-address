# Vey World Address SDK

A comprehensive SDK for handling international address formats, validation, and delivery integration.

## 📦 Packages

| Package | Description | Install |
|---------|-------------|---------|
| `@vey/core` | Core SDK with validation and formatting | `npm install @vey/core` |
| `@vey/react` | React hooks and components | `npm install @vey/react` |
| `@vey/vue` | Vue composables and components | `npm install @vey/vue` |
| `@vey/widget` | Universal Shadow Widget (framework-agnostic) | `npm install @vey/widget` |
| `@vey/webhooks` | Webhook utilities and handlers | `npm install @vey/webhooks` |
| `@vey/qr-nfc` | QR code and NFC integration | `npm install @vey/qr-nfc` |
| `@vey/graphql` | GraphQL schema and resolvers | `npm install @vey/graphql` |
| `@vey/grpc` | gRPC protocol definitions | `npm install @vey/grpc` |
| `veyform-sdk` | CLI tool | `npx veyform-sdk init` |

## 🚀 Quick Start

### 1. Initialize your project

```bash
npx veyform-sdk init
```

### 2. Install dependencies

```bash
# For React projects
npm install @vey/core @vey/react

# For Vue projects
npm install @vey/core @vey/vue

# For any framework (universal widget)
npm install @vey/core @vey/widget
```

### 3. Use in your application

#### React

```tsx
import { VeyProvider, AddressForm, useAddressValidation } from '@vey/react';

function App() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <AddressForm
        countryCode="JP"
        onSubmit={(address, validation) => {
          if (validation.valid) {
            console.log('Valid address:', address);
          }
        }}
      />
    </VeyProvider>
  );
}
```

#### Vue

```vue
<script setup>
import { provideVeyClient, useAddressValidation, useAddressForm } from '@vey/vue';

provideVeyClient({ apiKey: 'your-api-key' });

const { address, updateField } = useAddressForm();
const { validate, result } = useAddressValidation('JP');

async function handleSubmit() {
  await validate(address.value);
  if (result.value?.valid) {
    console.log('Valid address:', address.value);
  }
}
</script>
```

#### Universal Widget

```html
<script src="https://unpkg.com/@vey/widget"></script>
<vey-address-widget country-code="JP" theme="light"></vey-address-widget>

<script>
  const widget = document.querySelector('vey-address-widget');
  widget.configure({
    onSubmit: (address, validation) => {
      console.log('Submitted:', address);
    }
  });
</script>
```

## 🎯 Features

### 🤖 AI/Automation (Gemini Integration)

- **OCR (Handwritten Character Recognition)** - Scan shipping labels, invoices, and handwritten notes
- **HS Code Auto-Suggestion** - AI-powered tariff code lookup from product descriptions
- **Dangerous Goods Detection** - Identify prohibited items from images
- **Multilingual Translation** - Real-time text/speech translation for international customers
- **Address Verification** - Validate and correct addresses with geocoding
- **Invoice Auto-Generation** - Create customs invoices from shipment data

### 🔌 POS Hardware & IoT

- **Bluetooth Weight Scale** - Auto-input weight via Web Bluetooth
- **AR Size Measurement** - Camera-based package dimension measurement
- **Payment Terminal Integration** - Square, Stripe Terminal, Suica/PASMO support
- **Passport Scanner (MRZ)** - eKYC identity verification
- **Label Printer Control** - Direct WebUSB/Bluetooth printing to Zebra, Brother

### 🚚 Logistics & Shipping

- **Multi-Carrier Rate Comparison** - FedEx, DHL, UPS, EMS, and regional carriers
- **ETD/ETA Prediction** - Machine learning-based delivery time estimation
- **Multi-Piece Shipments** - Single tracking for multiple packages
- **Pickup Scheduling** - Carrier pickup API integration
- **Carbon Offset Calculation** - CO2 emissions and offset options
- **Alternative Delivery Locations** - PUDO, lockers, convenience store pickup

### 👥 Customer Engagement

- **LINE/WhatsApp Notifications** - Shipping updates via SNS
- **Digital Receipts** - QR code and email receipts
- **Member Features** - Address book, shipping history, points
- **"Same as Before"** - One-click duplicate shipments from QR codes
- **Digital Signage** - Idle screen promotions and queue management

### 📊 Dashboard & Analytics

- **Heatmap Analysis** - Geographic shipping visualization
- **Inventory Management** - Packaging material tracking and alerts
- **Staff Performance** - Productivity and accuracy metrics
- **Profit Margin Analysis** - Real-time cost vs. revenue tracking
- **Fraud Detection** - Anomaly detection and alert system

### 🔒 System & Reliability

- **Complete Offline Mode** - IndexedDB storage with background sync
- **Kiosk Mode** - Browser lockdown for public terminals
- **Audit Logging** - Full action history for compliance

### UI/UX

- **Universal Shadow Widget** - Framework-agnostic embeddable forms
- **Auto-layout Field Resolver** - Automatic field ordering based on country
- **Adaptive Input Sanitizer** - Language/region-specific input handling
- **Hierarchical Region Picker** - Dynamic continent → country → province → city selection

### Address Engine

- **ISO Address Normalizer** - Convert to canonical JSON format
- **Validation Engine** - Country-specific validation rules
- **Postal Code Validation** - Regex-based format checking
- **Transliteration Support** - Latin character handling for international shipping
- **Address PID (Place ID)** - Hierarchical address identifiers for ZK proofs and shipping routing

### Developer Experience

- **CLI Tool** - Quick project initialization
- **GraphQL Schema** - Ready-to-use type definitions
- **gRPC Proto** - Protocol buffer definitions
- **Webhook SDK** - Event handling utilities

### Integrations

- **QR Code API** - Address proof generation
- **NFC Support** - Quick-tap address registration
- **Locker Integration** - VeyLocker adapter for pickup locations

## 📋 CLI Commands

```bash
# Initialize project
npx veyform-sdk init --framework react

# Generate cURL for webhooks
npx veyform-sdk curl --event address-update

# Generate GraphQL schema
npx veyform-sdk graphql --output schema.graphql

# Generate gRPC proto
npx veyform-sdk proto --output vey.proto

# Validate address
npx veyform-sdk validate --country JP --postal-code 100-0001

# List supported countries
npx veyform-sdk countries --region asia
```

## 🔧 Configuration

### Environment Variables

```env
VEY_API_KEY=your-api-key
VEY_ENVIRONMENT=sandbox  # or 'production'
```

### SDK Configuration

```typescript
import { createVeyClient } from '@vey/core';

const client = createVeyClient({
  apiKey: process.env.VEY_API_KEY,
  environment: 'sandbox', // 'sandbox' | 'production'
  dataPath: '/path/to/address/data',
});
```

## 📡 Webhooks

```typescript
import { createWebhookHandler } from '@vey/webhooks';

const handler = createWebhookHandler({
  secret: 'your-webhook-secret',
});

handler.onAddressUpdate((event, data, payload) => {
  console.log('Address updated:', data.address_id);
});

handler.onDeliveryStatus((event, data, payload) => {
  console.log('Delivery status:', data.status);
});

// Express middleware
app.post('/webhook', handler.expressMiddleware());
```

## 📱 QR/NFC

```typescript
import { createAddressProof, createNFCHandler } from '@vey/qr-nfc';

// Generate address proof QR
const proof = createAddressProof(address, {
  expiresIn: 3600, // 1 hour
});

// NFC support
const nfc = createNFCHandler();
if (nfc.supported) {
  const record = await nfc.read();
  console.log('NFC address:', record.data);
}
```

## 🔑 Address PID (Place ID)

Address PID is a hierarchical identifier for addresses that enables:
- **Unique identification** of any address worldwide
- **ZK proof verification** without exposing full address
- **Shipping routing** compatible with WMS/TMS/Carrier systems
- **Hierarchy embedding** for area-based operations

### PID Format

```
<Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
```

Example: `JP-13-113-01-T07-B12-BN02-R342`

### Usage

```typescript
import {
  encodePID,
  decodePID,
  validatePID,
  generatePIDFromAddress,
  createWaybillPayload
} from '@vey/core';

// Encode components to PID
const pid = encodePID({
  country: 'JP',
  admin1: '13',
  admin2: '113',
  locality: '01',
  sublocality: 'T07',
  block: 'B12',
  building: 'BN02',
  unit: 'R342'
});
// Result: 'JP-13-113-01-T07-B12-BN02-R342'

// Decode PID to components
const components = decodePID('JP-13-113-01');
// Result: { country: 'JP', admin1: '13', admin2: '113', locality: '01' }

// Validate PID
const validation = validatePID('JP-13-113');
if (validation.valid) {
  console.log('Valid PID:', validation.components);
}

// Generate PID from normalized address
const pid = generatePIDFromAddress({
  countryCode: 'JP',
  admin1: '13',
  admin2: '113'
});

// Create shipping waybill with PID
const waybill = createWaybillPayload('WB890123456', 'JP-13-113-01-T07-B12-BN02-R342', {
  parcel_weight: 2.4,
  parcel_size: '60',
  carrier_zone: 'ZONE_KANTO'
});
```

### Collision Handling

When duplicate PIDs are detected in your database:

```typescript
import { addCollisionCounter, removeCollisionCounter } from '@vey/core';

// Add collision counter
const pidWithCollision = addCollisionCounter('JP-13-113', 1);
// Result: 'JP-13-113-C01'

// Remove collision counter
const basePid = removeCollisionCounter('JP-13-113-C01');
// Result: 'JP-13-113'
```

### Hierarchy Operations

```typescript
import {
  extractPIDPath,
  comparePIDHierarchy,
  isPIDParent,
  getPIDDepth
} from '@vey/core';

// Extract path to specific depth (for routing)
extractPIDPath('JP-13-113-01-T07-B12-BN02-R342', 3);
// Result: 'JP-13-113'

// Compare hierarchy match depth
comparePIDHierarchy('JP-13-113-01', 'JP-13-114-02');
// Result: 2 (country and admin1 match)

// Check parent-child relationship
isPIDParent('JP-13', 'JP-13-113-01');
// Result: true

// Get hierarchy depth
getPIDDepth('JP-13-113');
// Result: 3
```

### Country-Specific PID Formats

| Region | Format | Example |
|--------|--------|---------|
| Japan | `JP-<pref>-<ward>-<town>-<block>-RNNN` | `JP-13-113-01-T07-B12-BN02-R342` |
| US | `US-<state>-<zip>-<block>-<bldg>-Apt` | `US-CA-90210-MAIN-B001-APT5` |
| EU | `<CC>-<postal>-<city>-<bldg>-Unit` | `DE-10115-MITTE-B42-U301` |
| Middle East | `<CC>-<city>-<block>-<bldg>-<unit>` | `AE-DXB-BLK5-TWR2-1205` |

## 🌍 Supported Countries

The SDK supports 200+ countries with detailed address format information. See the full list in the [data directory](/data) or use:

```bash
npx veyform-sdk countries
```

## 📄 License

MIT

## 🔗 Links

- [World Address YAML Data](https://github.com/rei-k/world-address-yaml)
- [Documentation](#)
- [Examples](#)
