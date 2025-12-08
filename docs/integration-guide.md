# Comprehensive Integration Guide

Complete guide for integrating the Vey World Address SDK into your application.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Core SDK Integration](#core-sdk-integration)
4. [Frontend Framework Integration](#frontend-framework-integration)
5. [Backend Framework Integration](#backend-framework-integration)
6. [Authentication Integration](#authentication-integration)
7. [Webhook Integration](#webhook-integration)
8. [Mobile Integration](#mobile-integration)
9. [Advanced Features](#advanced-features)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Vey World Address SDK provides comprehensive tools for address validation, management, and delivery integration across 269 countries and regions worldwide.

### Available SDKs

| SDK | Use Case | Platforms |
|-----|----------|-----------|
| [@vey/core](../sdk/core) | Address validation, PID management | Node.js, Browser |
| [@vey/react](../sdk/react) | React components & hooks | React 16.8+ |
| [@vey/vue](../sdk/vue) | Vue components & composables | Vue 3 |
| [@vey/angular](../sdk/angular) | Angular components & services | Angular 12+ |
| [@vey/next](../sdk/next) | Next.js optimized integration | Next.js 13+ |
| [@vey/nuxt](../sdk/nuxt) | Nuxt module | Nuxt 3 |
| [@vey/webauthn](../sdk/webauthn) | Biometric authentication | Modern browsers |
| [@vey/webhooks](../sdk/webhooks) | Event handling | Node.js, Edge runtime |
| [@vey/react-native](../sdk/react-native) | Mobile components | React Native |
| [@vey/flutter](../sdk/flutter) | Mobile widgets | Flutter |
| [@vey/python](../sdk/python) | Server-side validation | Python 3.8+ |
| [@vey/php](../sdk/php) | Server-side validation | PHP 8.0+ |

### Key Features

- ✅ **269 Countries** - Complete coverage worldwide
- ✅ **Address Validation** - Real-time validation with detailed errors
- ✅ **PID System** - Privacy-preserving address identifiers
- ✅ **Multi-language** - Full i18n support
- ✅ **Type Safe** - Full TypeScript support
- ✅ **Zero-Knowledge Proofs** - Privacy-preserving delivery
- ✅ **Carrier Integration** - Major shipping carriers supported
- ✅ **Geocoding** - Address to coordinates conversion
- ✅ **Form Components** - Pre-built UI components

---

## Quick Start

### Installation

```bash
# Choose your SDK
npm install @vey/core              # Core validation
npm install @vey/react             # React components
npm install @vey/vue               # Vue components
npm install @vey/next              # Next.js
npm install @vey/webauthn          # Authentication
npm install @vey/webhooks          # Webhooks
```

### Basic Usage

```typescript
import { validateAddress, getCountryData } from '@vey/core';

// Validate an address
const result = await validateAddress({
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1',
});

if (result.valid) {
  console.log('✅ Address is valid');
} else {
  console.log('❌ Errors:', result.errors);
}

// Get country format requirements
const countryData = await getCountryData('JP');
console.log('Required fields:', countryData.address_format.order);
```

---

## Core SDK Integration

### Address Validation

```typescript
import { validateAddress, AddressInput } from '@vey/core';

async function validateUserAddress(address: AddressInput) {
  const result = await validateAddress(address);
  
  if (!result.valid) {
    // Display errors to user
    result.errors.forEach(error => {
      console.error(`${error.field}: ${error.message}`);
    });
    return false;
  }
  
  // Address is valid
  console.log('Normalized:', result.normalized);
  return true;
}
```

### Country Data

```typescript
import { getCountryData, listCountries } from '@vey/core';

// Get all countries
const countries = await listCountries();
console.log(`${countries.length} countries available`);

// Get specific country data
const japanData = await getCountryData('JP');
console.log('Name (EN):', japanData.name.en);
console.log('Name (Local):', japanData.name.local[0].value);
console.log('Address Format:', japanData.address_format.order);
console.log('Postal Code Required:', japanData.address_format.postal_code.required);
```

### PID Generation

```typescript
import { generatePID, parsePID } from '@vey/core';

// Generate Privacy ID
const pid = await generatePID({
  country: 'JP',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1',
});

console.log('PID:', pid);
// Example: JP-13-113-01-T07-B12-BN02-R342

// Parse PID to get structure
const parsed = parsePID(pid);
console.log('Country:', parsed.country);
console.log('Province Code:', parsed.provinceCode);
console.log('City Code:', parsed.cityCode);
```

### Geocoding

```typescript
import { geocodeAddress, reverseGeocode } from '@vey/core';

// Address to coordinates
const coords = await geocodeAddress({
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1',
});

console.log('Lat:', coords.latitude);
console.log('Lng:', coords.longitude);

// Coordinates to address
const address = await reverseGeocode(35.6812, 139.7671);
console.log('Address:', address);
```

---

## Frontend Framework Integration

### React

```typescript
// App.tsx
import { VeyProvider } from '@vey/react';
import AddressForm from './components/AddressForm';

export default function App() {
  return (
    <VeyProvider
      apiKey={process.env.REACT_APP_VEY_API_KEY}
      locale="ja-JP"
    >
      <AddressForm />
    </VeyProvider>
  );
}

// components/AddressForm.tsx
import { useAddressValidation, AddressInput } from '@vey/react';

export default function AddressForm() {
  const { validate, loading, errors } = useAddressValidation();
  const [address, setAddress] = useState<AddressInput>({
    country: 'JP',
    postal_code: '',
    province: '',
    city: '',
    street_address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await validate(address);
    if (result.valid) {
      console.log('Normalized address:', result.normalized);
      // Submit to backend
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={address.postal_code}
        onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
        placeholder="Postal Code"
      />
      {errors.postal_code && <span>{errors.postal_code}</span>}
      
      {/* More fields... */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Validating...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Vue 3

```vue
<!-- App.vue -->
<template>
  <VeyProvider :api-key="apiKey" locale="ja-JP">
    <AddressForm />
  </VeyProvider>
</template>

<script setup lang="ts">
import { VeyProvider } from '@vey/vue';

const apiKey = import.meta.env.VITE_VEY_API_KEY;
</script>

<!-- components/AddressForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="address.postal_code"
      placeholder="Postal Code"
    />
    <span v-if="errors.postal_code">{{ errors.postal_code }}</span>
    
    <!-- More fields... -->
    
    <button type="submit" :disabled="loading">
      {{ loading ? 'Validating...' : 'Submit' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAddressValidation } from '@vey/vue';

const { validate, loading, errors } = useAddressValidation();

const address = ref({
  country: 'JP',
  postal_code: '',
  province: '',
  city: '',
  street_address: '',
});

const handleSubmit = async () => {
  const result = await validate(address.value);
  if (result.valid) {
    console.log('Valid:', result.normalized);
  }
};
</script>
```

### Next.js

```typescript
// app/layout.tsx
import { VeyProvider } from '@vey/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <VeyProvider apiKey={process.env.NEXT_PUBLIC_VEY_API_KEY!}>
          {children}
        </VeyProvider>
      </body>
    </html>
  );
}

// app/checkout/page.tsx
'use client';

import { useAddressForm } from '@vey/next';

export default function CheckoutPage() {
  const { AddressForm, value, isValid } = useAddressForm({
    country: 'JP',
    onSubmit: async (address) => {
      // Submit order
      await createOrder({ shippingAddress: address });
    },
  });

  return (
    <div>
      <h1>Checkout</h1>
      <AddressForm />
      <button disabled={!isValid}>Place Order</button>
    </div>
  );
}

// Server component example
// app/api/validate/route.ts
import { validateAddress } from '@vey/core';

export async function POST(req: Request) {
  const address = await req.json();
  const result = await validateAddress(address);
  
  return Response.json(result);
}
```

### Angular

```typescript
// app.module.ts
import { VeyModule } from '@vey/angular';

@NgModule({
  imports: [
    VeyModule.forRoot({
      apiKey: environment.veyApiKey,
      locale: 'ja-JP',
    }),
  ],
})
export class AppModule {}

// address-form.component.ts
import { Component } from '@angular/core';
import { VeyService, AddressInput } from '@vey/angular';

@Component({
  selector: 'app-address-form',
  template: `
    <form (ngSubmit)="onSubmit()">
      <input
        [(ngModel)]="address.postal_code"
        name="postal_code"
        placeholder="Postal Code"
      />
      <span *ngIf="errors.postal_code">{{ errors.postal_code }}</span>
      
      <button type="submit" [disabled]="loading">
        {{ loading ? 'Validating...' : 'Submit' }}
      </button>
    </form>
  `,
})
export class AddressFormComponent {
  address: AddressInput = {
    country: 'JP',
    postal_code: '',
    province: '',
    city: '',
    street_address: '',
  };
  
  loading = false;
  errors: any = {};

  constructor(private vey: VeyService) {}

  async onSubmit() {
    this.loading = true;
    
    const result = await this.vey.validateAddress(this.address);
    
    if (result.valid) {
      console.log('Valid:', result.normalized);
    } else {
      this.errors = result.errors;
    }
    
    this.loading = false;
  }
}
```

---

## Backend Framework Integration

### Express.js

```typescript
import express from 'express';
import { validateAddress } from '@vey/core';
import { createWebhookHandler, expressMiddleware } from '@vey/webhooks';

const app = express();
app.use(express.json());

// Address validation endpoint
app.post('/api/addresses/validate', async (req, res) => {
  try {
    const result = await validateAddress(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
});

webhookHandler.onAddressCreated(async (event, data) => {
  console.log('Address created:', data.address_id);
});

app.post('/webhooks/addresses', expressMiddleware(webhookHandler));

app.listen(3000);
```

### NestJS

```typescript
// address.module.ts
import { Module } from '@nestjs/common';
import { VeyModule } from '@vey/nestjs';

@Module({
  imports: [
    VeyModule.forRoot({
      apiKey: process.env.VEY_API_KEY,
    }),
  ],
})
export class AddressModule {}

// address.service.ts
import { Injectable } from '@nestjs/common';
import { VeyService } from '@vey/nestjs';

@Injectable()
export class AddressService {
  constructor(private vey: VeyService) {}

  async validate(address: AddressInput) {
    return await this.vey.validateAddress(address);
  }
}

// address.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post('validate')
  async validate(@Body() address: AddressInput) {
    return await this.addressService.validate(address);
  }
}
```

### Python (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from vey import validate_address, AddressInput

app = FastAPI()

@app.post("/api/addresses/validate")
async def validate(address: AddressInput):
    try:
        result = validate_address(address.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# With webhooks
from vey.webhooks import WebhookHandler

webhook_handler = WebhookHandler(secret=os.getenv("WEBHOOK_SECRET"))

@webhook_handler.on("address.created")
async def on_address_created(event, data):
    print(f"Address created: {data['address_id']}")

@app.post("/webhooks/addresses")
async def handle_webhook(request: Request):
    signature = request.headers.get("X-Vey-Signature")
    body = await request.body()
    
    result = webhook_handler.handle(body.decode(), signature)
    
    if result["success"]:
        return {"received": True}
    else:
        raise HTTPException(status_code=400, detail=result["error"])
```

### PHP (Laravel)

```php
// config/vey.php
return [
    'api_key' => env('VEY_API_KEY'),
    'webhook_secret' => env('VEY_WEBHOOK_SECRET'),
];

// app/Http/Controllers/AddressController.php
use Vey\Vey;

class AddressController extends Controller
{
    public function validate(Request $request)
    {
        $address = $request->validate([
            'country' => 'required|string',
            'postal_code' => 'required|string',
            'province' => 'required|string',
            'city' => 'required|string',
            'street_address' => 'required|string',
        ]);

        $result = Vey::validateAddress($address);

        return response()->json($result);
    }
}

// app/Http/Controllers/WebhookController.php
use Vey\Webhooks\WebhookHandler;

class WebhookController extends Controller
{
    public function handle(Request $request)
    {
        $handler = new WebhookHandler(config('vey.webhook_secret'));
        
        $handler->onAddressCreated(function($event, $data) {
            Log::info('Address created: ' . $data['address_id']);
        });

        $signature = $request->header('X-Vey-Signature');
        $result = $handler->handle($request->getContent(), $signature);

        return response()->json(['received' => true]);
    }
}
```

---

## Authentication Integration

### WebAuthn Setup

See the [WebAuthn Integration Guide](./webauthn-integration.md) for detailed instructions.

Quick example:

```typescript
import { WebAuthnClient } from '@vey/webauthn';

const client = new WebAuthnClient({
  rpId: 'yourdomain.com',
  rpName: 'Your App',
  apiEndpoint: '/api/webauthn',
});

// Register passkey
const result = await client.register({
  userId: user.id,
  userName: user.email,
  userDisplayName: user.name,
  challenge: serverChallenge,
});

// Authenticate
const authResult = await client.authenticate({
  challenge: serverChallenge,
});
```

---

## Webhook Integration

See the [Webhook Integration Guide](./webhook-integration.md) for detailed instructions.

Quick example:

```typescript
import { createWebhookHandler } from '@vey/webhooks';

const handler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
});

handler.onAddressUpdated(async (event, data) => {
  // Update your database
  await db.addresses.update(data.address_id, data.current);
  
  // Notify user
  await notifyUser(data.address_id, 'Address updated');
});
```

---

## Mobile Integration

### React Native

```typescript
import { VeyProvider, AddressForm } from '@vey/react-native';

export default function App() {
  return (
    <VeyProvider apiKey={API_KEY}>
      <AddressForm
        country="JP"
        onSubmit={(address) => {
          console.log('Valid address:', address);
        }}
      />
    </VeyProvider>
  );
}
```

### Flutter

```dart
import 'package:vey_flutter/vey_flutter.dart';

class AddressPage extends StatefulWidget {
  @override
  _AddressPageState createState() => _AddressPageState();
}

class _AddressPageState extends State<AddressPage> {
  final _vey = VeyClient(apiKey: 'YOUR_API_KEY');

  Future<void> _validateAddress() async {
    final result = await _vey.validateAddress(AddressInput(
      country: 'JP',
      postalCode: '100-0001',
      province: '東京都',
      city: '千代田区',
      streetAddress: '千代田1-1',
    ));

    if (result.valid) {
      print('Valid address');
    } else {
      print('Errors: ${result.errors}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return VeyAddressForm(
      country: 'JP',
      onSubmit: (address) {
        print('Submitted: $address');
      },
    );
  }
}
```

---

## Advanced Features

### Zero-Knowledge Proofs

```typescript
import { createZKProof, verifyZKProof } from '@vey/core';

// Create proof without revealing address
const proof = await createZKProof({
  addressPID: 'JP-13-113-01-T07-B12',
  claimType: 'delivery_possible',
  carrier: 'yamato',
});

// Verify proof
const verified = await verifyZKProof(proof);
console.log('Proof valid:', verified);
```

### Carrier Integration

```typescript
import { getCarrierValidation, estimateDelivery } from '@vey/core';

// Validate with specific carrier
const validation = await getCarrierValidation(address, 'fedex');
console.log('Carrier accepts:', validation.accepted);

// Estimate delivery time
const estimate = await estimateDelivery(address, 'ups', {
  serviceLevel: 'express',
});
console.log('Estimated delivery:', estimate.date);
```

### Address Search

```typescript
import { searchAddresses } from '@vey/core';

// Search for addresses
const results = await searchAddresses({
  query: '千代田区千代田',
  country: 'JP',
  limit: 10,
});

results.forEach(result => {
  console.log(result.displayName);
  console.log(result.address);
});
```

---

## Best Practices

### 1. Always Validate on Server

```typescript
// ❌ Client-side only
const result = await validateAddress(address); // Can be bypassed

// ✅ Validate on server
// Client
await fetch('/api/validate', { method: 'POST', body: JSON.stringify(address) });

// Server
app.post('/api/validate', async (req, res) => {
  const result = await validateAddress(req.body);
  res.json(result);
});
```

### 2. Use Environment Variables

```typescript
// ❌ Hardcoded
const apiKey = 'vey_abc123';

// ✅ Environment variable
const apiKey = process.env.VEY_API_KEY;
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await validateAddress(address);
  if (!result.valid) {
    // Show user-friendly errors
    displayErrors(result.errors);
  }
} catch (error) {
  // Network or API error
  showErrorMessage('Failed to validate address. Please try again.');
  logError(error);
}
```

### 4. Cache Country Data

```typescript
// Cache country data to reduce API calls
const countryDataCache = new Map();

async function getCachedCountryData(countryCode: string) {
  if (!countryDataCache.has(countryCode)) {
    const data = await getCountryData(countryCode);
    countryDataCache.set(countryCode, data);
  }
  return countryDataCache.get(countryCode);
}
```

### 5. Normalize Before Storage

```typescript
// Always store normalized addresses
const result = await validateAddress(userInput);
if (result.valid) {
  await db.addresses.create(result.normalized);
}
```

---

## Troubleshooting

### Common Issues

#### "API Key Invalid"

- Check environment variable is set correctly
- Verify API key hasn't expired
- Ensure using correct environment (dev/prod)

#### Validation Always Fails

- Check address format matches country requirements
- Verify all required fields are provided
- Use `getCountryData()` to see requirements

#### TypeScript Errors

- Ensure `@types/node` is installed for Node.js
- Check TypeScript version compatibility (4.5+)
- Import types: `import type { AddressInput } from '@vey/core'`

### Getting Help

- [Documentation](../docs)
- [Examples](../examples)
- [GitHub Issues](https://github.com/rei-k/world-address/issues)
- [Discord Community](https://discord.gg/vey)

---

## Next Steps

- [WebAuthn Integration](./webauthn-integration.md)
- [Webhook Integration](./webhook-integration.md)
- [ZKP Implementation](./ZKP_IMPLEMENTATION_GUIDE.md)
- [E-commerce Integration](./ec-integration-flow.md)
- [Examples](../examples)

---

## License

MIT
