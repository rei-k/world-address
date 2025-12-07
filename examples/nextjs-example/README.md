# Next.js Address Form Example

This example demonstrates how to use the `@vey/core` SDK to create an address validation form using Next.js with the App Router.

## 🎯 Features

- Next.js 14 App Router with React Server Components
- Client-side address validation
- Country-specific address field validation
- Real-time postal code format checking
- Required field highlighting
- Dynamic field labels (e.g., "State" for US, "Prefecture" for Japan)
- Modern UI with gradient styling

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3002` to see the example in action.

## 📂 Project Structure

```
nextjs-example/
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies
├── public/              # Static assets
└── src/
    └── app/
        ├── layout.js           # Root layout
        ├── page.js             # Home page
        ├── globals.css         # Global styles
        └── components/
            └── AddressForm.js  # Client component for address form
```

## 💡 Usage

### Basic Implementation

```jsx
'use client';

import { useState } from 'react';

export default function AddressForm() {
  const [address, setAddress] = useState({
    country: '',
    postal_code: '',
    city: '',
    street_address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={address.postal_code}
        onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
      />
      <button type="submit">Validate</button>
    </form>
  );
}
```

### With Real @vey/core SDK

In a production application, you would load country formats from the SDK:

```jsx
'use client';

import { useState, useEffect } from 'react';
import { loadCountryFormat, validateAddress } from '@vey/core';

export default function AddressForm() {
  const [countryFormat, setCountryFormat] = useState(null);

  useEffect(() => {
    loadCountryFormat('JP').then(setCountryFormat);
  }, []);

  const handleValidate = (e) => {
    e.preventDefault();
    const result = validateAddress(address, countryFormat);
    // Handle result
  };

  return <form onSubmit={handleValidate}>{/* Form fields */}</form>;
}
```

### Server Actions (Next.js 14+)

You can also use Server Actions for validation:

```jsx
// app/actions.js
'use server';

import { loadCountryFormat, validateAddress } from '@vey/core';

export async function validateAddressAction(address) {
  const format = await loadCountryFormat(address.country);
  return validateAddress(address, format);
}

// In your component
'use client';

import { validateAddressAction } from './actions';

export default function AddressForm() {
  const handleSubmit = async (formData) => {
    const result = await validateAddressAction({
      country: formData.get('country'),
      postal_code: formData.get('postal_code'),
      // ...
    });
    
    console.log(result);
  };

  return (
    <form action={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## 🎨 Customization

### Styling

The example uses CSS Modules-compatible global styles. Customize in `src/app/globals.css`:

```css
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Adding More Countries

Extend the `countryFormats` object in `AddressForm.js`:

```javascript
const countryFormats = {
  // ... existing countries
  CA: {
    name: { en: 'Canada' },
    address_format: {
      postal_code: { required: true, regex: '^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$', example: 'K1A 0B1' },
      province: { required: true, type: 'Province' },
      // ...
    },
  },
};
```

## 🧪 Testing

You can test with these sample addresses:

### Japan (JP)
- Postal Code: `100-0001`
- Province: `東京都`
- City: `千代田区`
- Street: `千代田1-1`

### United States (US)
- Postal Code: `12345`
- Province: `NY`
- City: `New York`
- Street: `123 Main St`

### United Kingdom (GB)
- Postal Code: `SW1A 1AA`
- City: `London`
- Street: `10 Downing Street`

## 📚 API Reference

### Component Structure

- **Server Component**: `page.js` - Renders the static content
- **Client Component**: `AddressForm.js` - Handles interactive form

### State Management

- `address` - Form state object
- `validationResult` - Validation result state
- `currentFormat` - Current country format configuration

### Methods

- `handleCountryChange(e)` - Updates format when country changes
- `isFieldRequired(field)` - Checks if field is required
- `getFieldLabel(field)` - Gets localized field label
- `validateAddress(addr, format)` - Validates address against format
- `handleValidate(e)` - Form submission handler
- `formatAddressForDisplay()` - Formats address for display

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [@vey/core SDK Documentation](../../sdk/core/README.md)

## 📜 License

MIT - see [LICENSE](../../LICENSE)
