# Postal Code Auto-Fill and Translation Demo

This example demonstrates the postal code auto-fill and automatic translation features of the World Address SDK.

## Features

1. **Postal Code Auto-Fill**: Automatically fill city, province, and other address fields from postal code
2. **Automatic Translation**: Translate address fields when switching between languages
3. **Multi-Country Support**: Works with 60+ countries via free APIs

## Setup

```bash
npm install
```

## Running the Demo

```bash
npm start
```

Then open http://localhost:3000 in your browser.

## Usage

### Postal Code Auto-Fill

1. Select a country (e.g., United States, Japan, Germany)
2. Enter a postal code
3. Click "Auto-Fill" button
4. Watch as city, province, and other fields are automatically filled

### Language Translation

1. Fill in address fields in one language (e.g., Japanese)
2. Switch to another language using the language selector
3. Click "Translate" to automatically translate all fields
4. Switch back to see the original values

## Supported Countries (Free APIs)

**Via Zippopotam.us (No API key required):**
- 🇺🇸 United States
- 🇯🇵 Japan
- 🇬🇧 United Kingdom
- 🇩🇪 Germany
- 🇫🇷 France
- 🇨🇦 Canada
- 🇦🇺 Australia
- ...and 50+ more countries

**Via GeoNames (Free tier with registration):**
- Worldwide coverage for all countries

## Code Examples

### Auto-Fill from Postal Code

```typescript
import { createVeyform } from '@vey/core';

const veyform = createVeyform({
  apiKey: 'your-api-key',
  defaultLanguage: 'en'
});

// Select country
veyform.selectCountry('US');

// Auto-fill from postal code
const result = await veyform.autoFillFromPostalCode('90210');
console.log(result.city);     // "Beverly Hills"
console.log(result.province);  // "California"

// Form is automatically updated
const state = veyform.getFormState();
console.log(state.values.city);     // "Beverly Hills"
console.log(state.values.province); // "California"
```

### Translate Address Fields

```typescript
import { createVeyform } from '@vey/core';

const veyform = createVeyform({
  apiKey: 'your-api-key',
  defaultLanguage: 'ja'
});

// Enter address in Japanese
veyform.setFieldValue('city', '千代田区');
veyform.setFieldValue('province', '東京都');
veyform.setFieldValue('street_address', '千代田1-1');

// Translate to English
await veyform.translateFields('en', {
  service: 'libretranslate',
  endpoint: 'https://libretranslate.com'
});

console.log(veyform.getFormState().values.city);     // Translated to English
console.log(veyform.getFormState().values.province); // Translated to English
```

### Language Switch with Auto-Translation

```typescript
// Change language and translate existing values in one call
await veyform.setLanguageWithTranslation('en', {
  translateFields: true,
  translationService: 'libretranslate'
});
```

## API Configuration

### Translation Services

**LibreTranslate (Recommended):**
```typescript
{
  service: 'libretranslate',
  endpoint: 'https://libretranslate.com' // or self-hosted
}
```

**Apertium:**
```typescript
{
  service: 'apertium',
  endpoint: 'https://www.apertium.org/apy'
}
```

**Argos Translate:**
```typescript
{
  service: 'argostranslate',
  endpoint: 'http://localhost:5000' // Local server
}
```

### Postal Code Lookup

**Zippopotam.us (No configuration needed):**
```typescript
// Automatically used for supported countries
await veyform.autoFillFromPostalCode('90210');
```

**GeoNames (Worldwide coverage):**
```typescript
// Register at geonames.org to get a username
await veyform.autoFillFromPostalCode('12345', {
  geonamesUsername: 'your_username'
});
```

## Error Handling

```typescript
try {
  const result = await veyform.autoFillFromPostalCode('00000');
  console.log('Success:', result);
} catch (error) {
  console.error('Postal code not found:', error.message);
  // Handle error (e.g., show message to user)
}
```

## License

MIT
