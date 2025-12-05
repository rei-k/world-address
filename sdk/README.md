# Vey World Address SDK

A comprehensive SDK for handling international address formats, validation, and delivery integration.

## 📦 Packages

> **注意 / Note**: これらのパッケージは現在**ローカル開発中**です。npm への公開準備を進めています。
> 
> **Note**: These packages are currently **in local development**. They are not yet published to npm.

| Package | Status | Description |
|---------|--------|-------------|
| `@vey/core` | 🔨 **開発中 / In Development** | Core SDK with validation, formatting, PID, ZKP, and geocoding |
| `@vey/react` | 📋 **計画中 / Planned** | React hooks and components |
| `@vey/vue` | 📋 **計画中 / Planned** | Vue composables and components |
| `@vey/angular` | 📋 **計画中 / Planned** | Angular modules |
| `@vey/widget` | 📋 **計画中 / Planned** | Universal Shadow Widget (framework-agnostic) |
| `@vey/webhooks` | 📋 **計画中 / Planned** | Webhook utilities and handlers |
| `@vey/qr-nfc` | 📋 **計画中 / Planned** | QR code and NFC integration |
| `@vey/graphql` | 📋 **計画中 / Planned** | GraphQL schema and resolvers |
| `@vey/grpc` | 📋 **計画中 / Planned** | gRPC protocol definitions |
| `veyform-sdk` | 📋 **計画中 / Planned** | CLI tool |

### 🚀 ローカル開発環境セットアップ / Local Development Setup

```bash
# Clone the repository
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

> **重要 / Important**: 現在、パッケージは npm に公開されていません。以下の手順でローカル開発環境を使用してください。
>
> **Important**: Packages are not yet published to npm. Please use the local development setup below.

### 1. Clone and Setup

```bash
git clone https://github.com/rei-k/world-address-yaml.git
cd world-address-yaml/sdk/core
npm install
npm run build
```

### 2. Import in your project (local development)

```typescript
// Import from local build
import { validateAddress, formatAddress, encodePID } from './path/to/sdk/core/dist';
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

## 🌍 Multi-Language Support

Veyform provides comprehensive multi-language support with automatic persistence and synchronization across form fields.

### Basic Language Configuration

```typescript
import { createVeyform } from '@vey/core';

const veyform = createVeyform({
  apiKey: 'your-api-key',
  defaultLanguage: 'en',
  allowedLanguages: ['en', 'ja', 'zh', 'ko'],
});
```

### Language Preference Persistence

Configure automatic language preference saving to localStorage or sessionStorage:

```typescript
const veyform = createVeyform({
  apiKey: 'your-api-key',
  defaultLanguage: 'en',
  allowedLanguages: ['en', 'ja', 'zh', 'ko'],
  languageStorage: {
    enabled: true,                        // Enable persistence
    storageType: 'localStorage',          // 'localStorage' or 'sessionStorage'
    storageKey: 'veyform_language_preference' // Custom key (optional)
  }
});
```

### Language Change Callbacks

React to language changes in real-time:

```typescript
const veyform = createVeyform({
  apiKey: 'your-api-key',
  defaultLanguage: 'en',
  onLanguageChange: (newLanguage, previousLanguage) => {
    console.log(`Language changed from ${previousLanguage} to ${newLanguage}`);
    // Update UI, fetch translations, etc.
  }
});
```

### Programmatic Language Control

```typescript
// Get current language
const currentLang = veyform.getLanguage();
console.log('Current language:', currentLang); // 'en'

// Change language
veyform.setLanguage('ja'); // Changes to Japanese

// Get available languages
const languages = veyform.getAvailableLanguages();
console.log('Available languages:', languages); // ['en', 'ja', 'zh', 'ko']

// Clear saved language preference
veyform.clearLanguagePreference();
```

### Complete Example with Language Switcher

```typescript
import { createVeyform } from '@vey/core';

// Initialize with language support
const veyform = createVeyform({
  apiKey: 'your-api-key',
  defaultCountry: 'JP',
  defaultLanguage: 'en',
  allowedLanguages: ['en', 'ja', 'zh', 'ko'],
  languageStorage: {
    enabled: true,
    storageType: 'localStorage'
  },
  onLanguageChange: (newLang, prevLang) => {
    console.log(`Language switched from ${prevLang} to ${newLang}`);
    
    // Update form fields with new language labels
    const fields = veyform.getFormFields(veyform.getFormState().country!, newLang);
    updateFormUI(fields);
  }
});

// Language switcher implementation
function createLanguageSwitcher() {
  const languages = veyform.getAvailableLanguages();
  const currentLang = veyform.getLanguage();
  
  languages.forEach(lang => {
    const button = document.createElement('button');
    button.textContent = lang.toUpperCase();
    button.className = lang === currentLang ? 'active' : '';
    button.onclick = () => veyform.setLanguage(lang);
    document.getElementById('lang-switcher').appendChild(button);
  });
}

// Get localized form fields
veyform.selectCountry('JP');
const fields = veyform.getFormFields('JP', veyform.getLanguage());

// Fields will have localized labels and placeholders
fields.forEach(field => {
  console.log(`${field.name}:`, field.labels[veyform.getLanguage()]);
  // Example: "postal_code: 郵便番号" (in Japanese)
});
```

### React Integration Example

```tsx
import { createVeyform } from '@vey/core';
import { useState, useEffect } from 'react';

function AddressForm() {
  const [veyform] = useState(() => createVeyform({
    apiKey: 'your-api-key',
    defaultLanguage: 'en',
    allowedLanguages: ['en', 'ja', 'zh', 'ko'],
    languageStorage: { enabled: true },
    onLanguageChange: (newLang) => {
      setCurrentLanguage(newLang);
    }
  }));
  
  const [currentLanguage, setCurrentLanguage] = useState(veyform.getLanguage());
  const [fields, setFields] = useState([]);
  
  useEffect(() => {
    if (veyform.getFormState().country) {
      const formFields = veyform.getFormFields(
        veyform.getFormState().country,
        currentLanguage
      );
      setFields(formFields);
    }
  }, [currentLanguage]);
  
  return (
    <div>
      {/* Language switcher */}
      <div className="language-switcher">
        {veyform.getAvailableLanguages().map(lang => (
          <button
            key={lang}
            onClick={() => veyform.setLanguage(lang)}
            className={lang === currentLanguage ? 'active' : ''}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
      
      {/* Form fields with localized labels */}
      <form>
        {fields.map(field => (
          <div key={field.name}>
            <label>{field.labels[currentLanguage]}</label>
            <input
              type="text"
              placeholder={field.placeholders[currentLanguage]}
              onChange={(e) => veyform.setFieldValue(field.name, e.target.value)}
            />
          </div>
        ))}
      </form>
    </div>
  );
}
```

### Vue Integration Example

```vue
<script setup lang="ts">
import { createVeyform } from '@vey/core';
import { ref, computed, watch } from 'vue';

const veyform = createVeyform({
  apiKey: 'your-api-key',
  defaultLanguage: 'en',
  allowedLanguages: ['en', 'ja', 'zh', 'ko'],
  languageStorage: { enabled: true },
  onLanguageChange: (newLang) => {
    currentLanguage.value = newLang;
  }
});

const currentLanguage = ref(veyform.getLanguage());
const availableLanguages = veyform.getAvailableLanguages();

const fields = computed(() => {
  const country = veyform.getFormState().country;
  if (!country) return [];
  return veyform.getFormFields(country, currentLanguage.value);
});

function switchLanguage(lang: string) {
  veyform.setLanguage(lang);
}
</script>

<template>
  <div>
    <!-- Language switcher -->
    <div class="language-switcher">
      <button
        v-for="lang in availableLanguages"
        :key="lang"
        @click="switchLanguage(lang)"
        :class="{ active: lang === currentLanguage }"
      >
        {{ lang.toUpperCase() }}
      </button>
    </div>
    
    <!-- Form fields with localized labels -->
    <form>
      <div v-for="field in fields" :key="field.name">
        <label>{{ field.labels[currentLanguage] }}</label>
        <input
          type="text"
          :placeholder="field.placeholders[currentLanguage]"
          @input="veyform.setFieldValue(field.name, $event.target.value)"
        />
      </div>
    </form>
  </div>
</template>
```

### Language Storage Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable language persistence |
| `storageType` | `'localStorage' \| 'sessionStorage'` | `'localStorage'` | Where to store preference |
| `storageKey` | `string` | `'veyform_language_preference'` | Custom storage key name |

### Best Practices

1. **Always provide a default language** - Ensures a fallback when no preference is saved
2. **Limit allowed languages** - Only enable languages you have translations for
3. **Use language callbacks** - Update UI immediately when language changes
4. **Enable persistence** - Save user's language preference for better UX
5. **Validate saved preferences** - The SDK automatically validates saved languages against `allowedLanguages`

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
