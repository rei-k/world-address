# Veyform - Universal Address Form System

Veyform is a comprehensive address form SDK that provides a beautiful, multilingual address input experience with 257 countries support.

## Features

### ✨ Core Features

- **3-Layer Country Selection**: Continent → Country → Address Hierarchy
- **Country Flag UI**: Visual country selection with flag emojis
- **Multi-Language Support**: Synchronized labels, placeholders, and validation messages
- **Domain Auto-Detection**: Automatic site recognition for multi-tenant support
- **Delivery-Level Validation**: Strict validation ensuring addresses are deliverable
- **Analytics Tracking**: Anonymized usage statistics and insights

### 🌍 Country Selection

#### Continent Tabs
- Filter countries by continent (Africa, Americas, Asia, Europe, Oceania, Antarctica)
- Visually organized for better UX
- Supports custom country sets per site

#### Country Flag Dropdown
- Flag emoji for each country
- Search functionality
- Local language names support
- Recommended country sets (East Asia, North America, Europe, etc.)

### 🌐 Multi-Language Support

All field labels and placeholders automatically switch when language changes:

```typescript
// Japanese
都道府県: "東京都"
市区町村: "渋谷区"

// English  
Prefecture: "Tokyo"
City: "Shibuya"

// Chinese
省份: "东京都"
城市: "涩谷区"
```

**Hierarchy remains consistent** - only labels change, not structure.

### 📊 Analytics

Track the following metrics (all anonymized):

- Country selection rates
- Language usage statistics
- Form completion rates
- Validation failure points
- Device type distribution
- Continent filter usage

## Installation

```bash
npm install @vey/core @vey/react
# or
yarn add @vey/core @vey/react
```

## Quick Start

### React

```tsx
import { VeyformAddressForm } from '@vey/react';

function MyCheckout() {
  return (
    <VeyformAddressForm
      config={{
        apiKey: 'your-api-key',
        domainAutoDetect: true,
        defaultCountry: 'JP',
        allowedCountries: ['JP', 'US', 'KR', 'CN'],
        defaultLanguage: 'ja',
        useContinentFilter: true,
        enableAnalytics: true,
      }}
      onSubmit={(data) => {
        console.log('Address submitted:', data);
      }}
      showContinentFilter={true}
      theme="light"
    />
  );
}
```

### Vue

```vue
<template>
  <VeyformAddressForm
    :config="veyformConfig"
    @submit="handleSubmit"
    show-continent-filter
    theme="light"
  />
</template>

<script setup>
import { VeyformAddressForm } from '@vey/vue';

const veyformConfig = {
  apiKey: 'your-api-key',
  domainAutoDetect: true,
  defaultCountry: 'JP',
  allowedCountries: ['JP', 'US', 'KR', 'CN', 'TW'],
  defaultLanguage: 'ja',
  useContinentFilter: true,
  enableAnalytics: true,
};

function handleSubmit(data) {
  console.log('Address:', data);
}
</script>
```

## Configuration

See the [full documentation](./CONFIGURATION.md) for all options.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS 14+, Android 5+)

## License

MIT
