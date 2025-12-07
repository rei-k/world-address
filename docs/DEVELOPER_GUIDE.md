# Developer Guide

Welcome to the Vey World Address SDK developer guide! This document provides comprehensive information for developers integrating the SDK into their applications.

## Table of Contents

- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Migration Guide](#migration-guide)

## Getting Started

### Installation

```bash
npm install @vey/core
```

### Basic Usage

```typescript
import { validateAddress, formatAddress } from '@vey/core';

// 1. Load country format (cache this in production)
const format = await loadCountryFormat('JP');

// 2. Validate address
const address = {
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1'
};

const result = validateAddress(address, format);

// 3. Handle validation result
if (!result.valid) {
  console.error('Validation errors:', result.errors);
} else {
  console.log('✅ Valid address');
  const formatted = formatAddress(result.normalized, format);
  console.log('Formatted:', formatted);
}
```

## Core Concepts

### Country Format

Each country has a specific address format definition that includes:

- **Required fields**: Fields that must be provided
- **Postal code pattern**: Regex for postal code validation
- **Field ordering**: Order for displaying/formatting addresses
- **Validation rules**: Country-specific validation logic

### Validation Result

The validation result contains:

```typescript
interface ValidationResult {
  valid: boolean;           // true if no errors
  errors: ValidationError[]; // Array of validation errors
  warnings: ValidationWarning[]; // Array of warnings
  normalized: AddressInput;  // Address with normalized values
}
```

### Error Types

| Error Code | Description | Action |
|------------|-------------|--------|
| `REQUIRED_FIELD_MISSING` | A required field is empty | Fill in the required field |
| `INVALID_POSTAL_CODE` | Postal code doesn't match format | Use correct postal code format |
| `TERRITORIAL_RESTRICTION` | Place name violates restrictions | Use approved place name |

## API Reference

### Core Functions

#### `validateAddress(address, format, options?)`

Validates an address against country-specific rules.

**Parameters:**
- `address: AddressInput` - The address to validate
- `format: CountryAddressFormat` - Country's address format definition
- `options?: { languageCode?: string }` - Optional validation options

**Returns:** `ValidationResult`

**Example:**
```typescript
const result = validateAddress(address, format, { languageCode: 'ja' });
```

#### `formatAddress(address, format, options?)`

Formats an address according to country conventions.

**Parameters:**
- `address: AddressInput` - The address to format
- `format: CountryAddressFormat` - Country's address format definition
- `options?: FormatOptions` - Optional formatting options

**Returns:** `string` - Formatted address

**Example:**
```typescript
const formatted = formatAddress(address, format, {
  separator: '\n',
  includeCountry: true,
  context: 'international'
});
```

#### `getRequiredFields(format)`

Gets the list of required fields for a country.

**Parameters:**
- `format: CountryAddressFormat` - Country's address format definition

**Returns:** `string[]` - Array of required field names

**Example:**
```typescript
const required = getRequiredFields(format);
// ['postal_code', 'province', 'city', 'street_address']
```

## Best Practices

### 1. Cache Country Formats

Loading country formats can be expensive. Cache them to improve performance:

```typescript
class FormatCache {
  private cache = new Map<string, CountryAddressFormat>();
  
  async get(countryCode: string): Promise<CountryAddressFormat> {
    if (!this.cache.has(countryCode)) {
      const format = await loadCountryFormat(countryCode);
      this.cache.set(countryCode, format);
    }
    return this.cache.get(countryCode)!;
  }
  
  clear() {
    this.cache.clear();
  }
}

const formatCache = new FormatCache();
```

### 2. Validate Early and Often

Validate addresses as early as possible in your workflow:

```typescript
// ✅ Good: Validate on form submission
const handleSubmit = async () => {
  const result = validateAddress(address, format);
  if (!result.valid) {
    showErrors(result.errors);
    return;
  }
  await submitAddress(result.normalized);
};

// ❌ Bad: Don't wait until payment to validate
```

### 3. Use Normalized Addresses

Always use the normalized address from validation results:

```typescript
const result = validateAddress(address, format);

if (result.valid) {
  // Use result.normalized, not the original address
  await saveAddress(result.normalized);
}
```

### 4. Handle Warnings

Warnings are informational and don't prevent submission, but should be shown to users:

```typescript
if (result.warnings.length > 0) {
  result.warnings.forEach(warning => {
    console.warn(`${warning.field}: ${warning.message}`);
  });
}
```

## Error Handling

### Graceful Degradation

Always handle errors gracefully:

```typescript
async function validateWithFallback(address: AddressInput) {
  try {
    const format = await loadCountryFormat(address.country);
    return validateAddress(address, format);
  } catch (error) {
    console.error('Validation failed:', error);
    
    // Fallback: Basic validation
    return {
      valid: !!address.postal_code && !!address.city,
      errors: [],
      warnings: [],
      normalized: address
    };
  }
}
```

### User-Friendly Error Messages

Convert technical errors to user-friendly messages:

```typescript
function getErrorMessage(error: ValidationError): string {
  const messages = {
    REQUIRED_FIELD_MISSING: `${error.field} is required`,
    INVALID_POSTAL_CODE: 'Please enter a valid postal code',
    TERRITORIAL_RESTRICTION: `Please use the approved name for ${error.field}`
  };
  
  return messages[error.code] || error.message;
}
```

## Debugging

### Enable Debug Logging

```typescript
// Set environment variable
process.env.VEY_DEBUG = 'true';

// Or use debug utility
import { setDebugMode } from '@vey/core';
setDebugMode(true);
```

### Inspect Validation Results

```typescript
const result = validateAddress(address, format);

// Log detailed validation info
console.log('Validation Summary:', {
  valid: result.valid,
  errorCount: result.errors.length,
  warningCount: result.warnings.length,
  errors: result.errors,
  warnings: result.warnings
});
```

### Test with Example Data

```typescript
import { getPostalCodeExample } from '@vey/core';

// Get example postal code for testing
const example = getPostalCodeExample(format);
console.log('Example postal code:', example);

// Use in test address
const testAddress = {
  country: 'JP',
  postal_code: example,
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1'
};
```

## Performance Optimization

### 1. Lazy Load Country Data

Only load country data when needed:

```typescript
const [format, setFormat] = useState(null);

useEffect(() => {
  if (selectedCountry) {
    loadCountryFormat(selectedCountry).then(setFormat);
  }
}, [selectedCountry]);
```

### 2. Debounce Real-time Validation

Avoid excessive validation calls:

```typescript
import { debounce } from 'lodash';

const validateDebounced = useCallback(
  debounce(async (address) => {
    const result = validateAddress(address, format);
    setValidationResult(result);
  }, 300),
  [format]
);
```

### 3. Batch Validations

Validate multiple addresses in batch:

```typescript
async function validateBatch(addresses: AddressInput[]) {
  const formats = new Map();
  
  // Group by country
  const byCountry = addresses.reduce((acc, addr) => {
    if (!acc[addr.country]) acc[addr.country] = [];
    acc[addr.country].push(addr);
    return acc;
  }, {} as Record<string, AddressInput[]>);
  
  // Validate each country's addresses
  const results = [];
  for (const [country, addrs] of Object.entries(byCountry)) {
    const format = await getCachedFormat(country);
    results.push(...addrs.map(addr => validateAddress(addr, format)));
  }
  
  return results;
}
```

## Migration Guide

### From Version 0.x to 1.0

#### Breaking Changes

1. **Import paths changed**

```typescript
// ❌ Old
import { validate } from 'world-address';

// ✅ New
import { validateAddress } from '@vey/core';
```

2. **Function signatures updated**

```typescript
// ❌ Old
validate(address, 'JP');

// ✅ New
const format = await loadCountryFormat('JP');
validateAddress(address, format);
```

3. **Validation result structure**

```typescript
// ❌ Old
const { isValid, errors } = validate(address);

// ✅ New
const { valid, errors, warnings, normalized } = validateAddress(address, format);
```

#### Migration Steps

1. Update imports
2. Update function calls
3. Handle new validation result structure
4. Test thoroughly

#### Migration Script

```typescript
// migration-helper.ts
export function migrateValidateCall(address: AddressInput, countryCode: string) {
  console.warn('DEPRECATED: Use validateAddress with format instead');
  
  return loadCountryFormat(countryCode).then(format =>
    validateAddress(address, format)
  );
}
```

## Support

- 📖 [Full API Documentation](../sdk/core/README.md)
- 🐛 [Report Issues](https://github.com/rei-k/world-address-yaml/issues)
- 💬 [Discussions](https://github.com/rei-k/world-address-yaml/discussions)
- 📧 Email: support@vey.example

## Contributing

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details
