# Examples

This directory contains example implementations of the Vey World Address SDK for various frameworks and platforms.

## Available Examples

### 🚀 Quick Start

Each example is self-contained and demonstrates best practices for using the Vey SDK in production applications.

| Example | Description | Status |
|---------|-------------|--------|
| [react-example](./react-example/) | React + TypeScript address form with validation | ✅ Ready |
| [vue-example](./vue-example/) | Vue 3 Composition API with Vite | ✅ Ready |
| [nextjs-example](./nextjs-example/) | Next.js App Router with Server Components | ✅ Ready |
| [vanilla-js-example](./vanilla-js-example/) | Pure JavaScript (no build step required) | ✅ Ready |
| [nodejs-basic](./nodejs-basic/) | Node.js basic usage examples | ✅ Ready |
| [simple-validation](./simple-validation/) | Simple validation examples | ✅ Ready |
| [veyvault-demo](./veyvault-demo/) | Veyvault cloud address book demo | ✅ Ready |

## Running an Example

### React Example

```bash
cd examples/react-example
npm install
npm start
```

Visit `http://localhost:3000` to see the example in action.

### Vue Example

```bash
cd examples/vue-example
npm install
npm run dev
```

Visit `http://localhost:3001` to see the example in action.

### Next.js Example

```bash
cd examples/nextjs-example
npm install
npm run dev
```

Visit `http://localhost:3002` to see the example in action.

### Vanilla JavaScript Example

No build step required! Simply open `index.html` in your browser:

```bash
cd examples/vanilla-js-example
# Open index.html in your browser, or use a local server:
python -m http.server 8000
```

## Features Demonstrated

All examples demonstrate:

- ✅ **Country-specific validation** - Different rules for different countries
- ✅ **Real-time validation** - Immediate feedback as users type
- ✅ **Postal code formatting** - Country-specific postal code patterns
- ✅ **Required field detection** - Dynamic required fields based on country
- ✅ **Error messaging** - Clear, actionable error messages
- ✅ **Territorial restrictions** - Compliance with territorial naming policies
- ✅ **Multi-language support** - Address validation in multiple languages

## Common Use Cases

### 1. E-commerce Checkout

```typescript
import { validateAddress, formatShippingLabel } from '@vey/core';

// Validate shipping address before checkout
const result = validateAddress(checkoutAddress, countryFormat);

if (result.valid) {
  // Generate shipping label
  const label = formatShippingLabel(result.normalized, countryFormat);
  await createShipment(label);
}
```

### 2. User Profile Management

```typescript
import { validateAddress, getRequiredFields } from '@vey/core';

// Show dynamic required fields based on country
const required = getRequiredFields(countryFormat);

// Validate on form submission
const result = validateAddress(profileAddress, countryFormat);
```

### 3. International Shipping Calculator

```typescript
import { validateAddress, normalizeAddress } from '@vey/core';

// Validate and normalize address for shipping calculation
const result = validateAddress(address, countryFormat);

if (result.valid) {
  const normalized = normalizeAddress(result.normalized, countryFormat.iso_codes.alpha2);
  const shippingCost = await calculateShipping(normalized);
}
```

## Testing Your Integration

### Unit Tests

```typescript
import { validateAddress } from '@vey/core';

describe('Address Validation', () => {
  it('should validate Japanese address with postal code', async () => {
    const address = {
      country: 'JP',
      postal_code: '100-0001',
      province: '東京都',
      city: '千代田区',
      street_address: '千代田1-1'
    };
    
    const format = await loadCountryFormat('JP');
    const result = validateAddress(address, format);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### Integration Tests

```typescript
import { validateAddress, formatAddress } from '@vey/core';

describe('Address Flow', () => {
  it('should validate and format address', async () => {
    const format = await loadCountryFormat('US');
    
    // Validate
    const result = validateAddress(testAddress, format);
    expect(result.valid).toBe(true);
    
    // Format
    const formatted = formatAddress(result.normalized, format);
    expect(formatted).toContain(testAddress.city);
  });
});
```

## Performance Tips

### 1. Cache Country Formats

```typescript
const formatCache = new Map();

async function getCachedFormat(countryCode: string) {
  if (!formatCache.has(countryCode)) {
    const format = await loadCountryFormat(countryCode);
    formatCache.set(countryCode, format);
  }
  return formatCache.get(countryCode);
}
```

### 2. Debounce Real-time Validation

```typescript
import { debounce } from 'lodash';

const validateDebounced = debounce(async (address) => {
  const format = await getCachedFormat(address.country);
  const result = validateAddress(address, format);
  setValidationResult(result);
}, 300);
```

### 3. Lazy Load Country Data

```typescript
// Only load country format when needed
const format = useMemo(async () => {
  if (selectedCountry) {
    return await loadCountryFormat(selectedCountry);
  }
}, [selectedCountry]);
```

## Troubleshooting

### Common Issues

#### 1. "Required field missing" errors

**Problem**: Getting errors for fields that seem optional
**Solution**: Check `getRequiredFields()` for the specific country

```typescript
const required = getRequiredFields(format);
console.log('Required fields:', required);
```

#### 2. Postal code validation failing

**Problem**: Valid postal codes are being rejected
**Solution**: Check the expected format for the country

```typescript
const regex = getPostalCodeRegex(format);
const example = getPostalCodeExample(format);
console.log(`Format: ${regex}, Example: ${example}`);
```

#### 3. Territorial restriction errors

**Problem**: Certain place names are rejected (Japan)
**Solution**: Use the approved names from territorial restrictions

```typescript
import { validateJapaneseTerritorialInput } from '@vey/core';

const result = validateJapaneseTerritorialInput(placeName, 'ja');
if (!result.valid) {
  console.log('Suggestion:', result.suggestion);
}
```

## Contributing

Found an issue or have a suggestion for these examples? 

1. Open an issue on GitHub
2. Submit a pull request with improvements
3. Share your own example implementation

## License

MIT License - see [LICENSE](../LICENSE) for details
