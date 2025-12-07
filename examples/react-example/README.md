# React Address Form Example

This example demonstrates how to use the `@vey/core` SDK to create an address validation form in React.

## Features

- Country-specific address field validation
- Real-time postal code format checking
- Required field highlighting
- Territorial restrictions (e.g., Japan)
- Multi-language support

## Setup

```bash
npm install
npm start
```

## Usage

```tsx
import React, { useState } from 'react';
import { validateAddress, getRequiredFields, formatAddress } from '@vey/core';

function AddressForm() {
  const [address, setAddress] = useState({
    country: 'JP',
    postal_code: '',
    province: '',
    city: '',
    street_address: ''
  });
  
  const [errors, setErrors] = useState([]);

  const handleValidate = async () => {
    // Load country format (in real app, cache this)
    const format = await loadCountryFormat(address.country);
    
    // Validate the address
    const result = validateAddress(address, format, {
      languageCode: 'ja'
    });
    
    if (!result.valid) {
      setErrors(result.errors);
      console.error('Validation errors:', result.errors);
    } else {
      console.log('✅ Address is valid');
      console.log('Formatted:', formatAddress(result.normalized, format));
    }
  };

  return (
    <form>
      {/* Form fields */}
      <button type="button" onClick={handleValidate}>
        Validate Address
      </button>
      
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((err, i) => (
            <p key={i}>{err.message}</p>
          ))}
        </div>
      )}
    </form>
  );
}

export default AddressForm;
```

## Advanced Features

### 1. Dynamic Field Ordering

```tsx
import { getFieldOrder } from '@vey/core';

const fieldOrder = getFieldOrder(format, 'international');
// Render fields in the correct order for the country
```

### 2. Postal Code Validation

```tsx
import { getPostalCodeRegex, getPostalCodeExample } from '@vey/core';

const regex = getPostalCodeRegex(format);
const example = getPostalCodeExample(format);

<input 
  type="text"
  name="postal_code"
  pattern={regex}
  placeholder={example}
  title="Please enter a valid postal code"
/>
```

### 3. Real-time Validation

```tsx
const handleChange = (field, value) => {
  setAddress(prev => ({ ...prev, [field]: value }));
  
  // Real-time validation
  const result = validateAddress({ ...address, [field]: value }, format);
  setErrors(result.errors);
};
```

## API Reference

See the [main SDK documentation](../../sdk/core/README.md) for complete API details.

## License

MIT
