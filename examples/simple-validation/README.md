# Simple Address Validation Example

This example demonstrates how to use the `@vey/core` SDK to validate addresses for different countries with minimal code.

## Overview

The example shows:
- ✅ Basic address validation
- ✅ Postal code format validation
- ✅ Required field detection
- ✅ Address normalization (whitespace trimming)
- ✅ Multi-country support (Japan, US, UK, Germany)

## Prerequisites

1. Build the SDK:
```bash
cd ../../sdk/core
npm install
npm run build
```

## Running the Example

```bash
cd examples/simple-validation
node index.js
```

## Expected Output

The script will run 6 examples demonstrating different validation scenarios:

### Example 1: Valid Japanese Address
```
Address: {
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1'
}
✅ Address is valid!
```

### Example 2: Invalid Postal Code
```
Postal code: '1234567' (Wrong format, should be XXX-XXXX)
❌ Validation failed as expected
Error: Postal code does not match expected format: ^[0-9]{3}-[0-9]{4}$
```

### Example 3: Required Fields
```
Required fields for Japan: [ 'postal_code', 'province', 'city' ]
❌ Address is incomplete (missing city)
```

### Example 4-6: US, UK, and Normalization
Additional examples for other countries and address normalization.

## Code Walkthrough

### Loading Country Data

```javascript
const { validateAddress, getRequiredFields } = require('@vey/core');

function loadCountryData(countryCode) {
  // Load country format from JSON file
  const japanFormat = loadCountryData('JP');
  return japanFormat;
}
```

### Validating an Address

```javascript
const address = {
  country: 'JP',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1',
};

const result = validateAddress(address, japanFormat, { languageCode: 'ja' });

if (result.valid) {
  console.log('✅ Address is valid!');
} else {
  console.log('❌ Errors:', result.errors);
}
```

### Checking Required Fields

```javascript
const requiredFields = getRequiredFields(japanFormat);
console.log('Required fields:', requiredFields);
// Output: ['postal_code', 'province', 'city']
```

## Validation Features

### 1. Required Field Validation
The validator checks if all required fields are present:
- Postal code (required for most countries)
- Province/State (required for Japan, US, etc.)
- City (required for most countries)

### 2. Postal Code Format Validation
Each country has specific postal code patterns:
- Japan: `XXX-XXXX` (e.g., `100-0001`)
- US: `XXXXX` or `XXXXX-XXXX` (e.g., `10001`)
- UK: Various formats (e.g., `SW1A 1AA`)

### 3. Address Normalization
Automatically trims whitespace from all fields:
```javascript
Input:  { postal_code: '  10001  ' }
Output: { postal_code: '10001' }
```

### 4. Territorial Restrictions (Japan)
For Japanese addresses, validates that location names comply with territorial restrictions.

## Supported Countries

This example includes validation for:
- 🇯🇵 Japan (JP)
- 🇺🇸 United States (US)
- 🇬🇧 United Kingdom (GB)
- 🇩🇪 Germany (DE)

The SDK supports all 269 countries in the world-address database!

## Error Codes

Common error codes returned by the validator:

| Code | Description |
|------|-------------|
| `REQUIRED_FIELD_MISSING` | A required field is not provided |
| `INVALID_POSTAL_CODE` | Postal code doesn't match expected format |
| `TERRITORIAL_RESTRICTION` | Location name violates territorial restrictions (Japan) |

## Validation Result Structure

```typescript
interface ValidationResult {
  valid: boolean;              // true if no errors
  errors: ValidationError[];   // Array of errors
  warnings: ValidationWarning[];  // Array of warnings
  normalized: AddressInput;    // Address with trimmed values
}

interface ValidationError {
  field: string;   // Field name that has the error
  code: string;    // Error code (e.g., 'REQUIRED_FIELD_MISSING')
  message: string; // Human-readable error message
}
```

## Next Steps

- Try the [React Example](../react-example/) for a complete UI implementation
- Read the [Developer Guide](../../docs/DEVELOPER_GUIDE.md) for advanced usage
- Explore the [SDK README](../../sdk/README.md) for full API documentation

## Related Examples

- [React Example](../react-example/) - Full React application with address validation
- [ZKP Examples](../../docs/examples/zkp/) - Zero-knowledge proof address protocols
- [E-commerce Integration](../../docs/examples/zkp/ec-integration.ts) - Checkout flow example

## License

MIT - See [LICENSE](../../LICENSE) for details
