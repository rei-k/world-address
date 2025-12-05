# 🚀 Quick Start Guide - @vey/react Premium Components

Get started with world-class address forms in 5 minutes.

## Installation

```bash
npm install @vey/react @vey/core
```

Or with yarn:

```bash
yarn add @vey/react @vey/core
```

## Basic Example (Copy & Paste Ready)

```tsx
import React from 'react';
import { AddressFormPremium } from '@vey/react';

function App() {
  const handleSubmit = (address, validation) => {
    if (validation.valid) {
      console.log('Submitted address:', address);
      // Send to your backend here
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>Checkout</h1>
      <AddressFormPremium
        initialCountry="US"
        onSubmit={handleSubmit}
        submitLabel="Continue to Payment"
      />
    </div>
  );
}

export default App;
```

## What You Get

✅ **257+ Countries** - Automatically adjusts fields for any country  
✅ **Real-time Validation** - Helpful error messages as users type  
✅ **Auto-formatting** - Postal codes formatted correctly  
✅ **Beautiful UI** - Stripe-like design that looks professional  
✅ **Fully Accessible** - WCAG 2.1 AA compliant  
✅ **Type Safe** - Full TypeScript support  
✅ **Customizable** - Easy theming and styling  

## Features Demo

### 1. Multi-Country Support

The form automatically changes fields based on the selected country:

**United States:**
- Full Name
- Street Address
- City
- State
- ZIP Code

**Japan:**
- Full Name
- Postal Code (XXX-XXXX format)
- Prefecture
- City/Municipality
- Street Address

**United Kingdom:**
- Full Name
- Street Address
- City
- Postcode

And 254+ more countries!

### 2. Real-time Validation

```tsx
<AddressFormPremium
  initialCountry="US"
  liveValidation={true}      // Validate as user types
  validateOnBlur={true}       // Validate when field loses focus
  onValidate={(validation) => {
    console.log('Validation:', validation);
  }}
/>
```

### 3. Custom Styling

```tsx
import type { AddressElementTheme } from '@vey/react';

const theme: AddressElementTheme = {
  colorPrimary: '#0070F3',        // Your brand color
  colorSuccess: '#10B981',
  colorError: '#EF4444',
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif',
};

<AddressFormPremium theme={theme} />
```

### 4. Track Changes

```tsx
<AddressFormPremium
  onChange={(address, isValid) => {
    console.log('Current address:', address);
    console.log('Is valid:', isValid);
    // Update your state, enable/disable buttons, etc.
  }}
/>
```

### 5. Success Messages

```tsx
<AddressFormPremium
  successMessage="Address saved successfully!"
  successDuration={3000}  // Show for 3 seconds
  onSubmit={async (address) => {
    await saveToBackend(address);
  }}
/>
```

## Common Use Cases

### E-commerce Checkout

```tsx
function CheckoutPage() {
  const [shippingAddress, setShippingAddress] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (address, validation) => {
    setIsSaving(true);
    try {
      await api.saveShippingAddress(address);
      setShippingAddress(address);
      router.push('/checkout/payment');
    } catch (error) {
      alert('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AddressFormPremium
      initialCountry="US"
      onSubmit={handleSubmit}
      loading={isSaving}
      submitLabel="Continue to Payment"
      liveValidation
    />
  );
}
```

### Profile Settings

```tsx
function ProfileSettings({ user }) {
  return (
    <AddressFormPremium
      initialCountry={user.country}
      initialValue={{
        recipient: user.name,
        street_address: user.address.street,
        city: user.address.city,
        province: user.address.state,
        postal_code: user.address.zip,
      }}
      onSubmit={(address) => {
        updateUserProfile(address);
      }}
      submitLabel="Save Address"
      successMessage="Profile updated!"
    />
  );
}
```

### Multi-step Form

```tsx
function ShippingForm({ onNext }) {
  return (
    <AddressFormPremium
      onSubmit={(address, validation) => {
        // Save to state/context
        saveShippingAddress(address);
        // Go to next step
        onNext();
      }}
      submitLabel="Next: Review Order"
    />
  );
}
```

### Restrict to Specific Countries

```tsx
<AddressFormPremium
  allowedCountries={['US', 'CA', 'GB', 'AU']}  // Only these countries
  initialCountry="US"
/>
```

## Individual Components

For custom layouts, use individual components:

```tsx
import {
  AddressElement,
  PostalCodeElement,
  CountrySelectElement,
} from '@vey/react';

function CustomAddressForm() {
  const [country, setCountry] = useState('US');
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [postal, setPostal] = useState('');

  return (
    <form>
      {/* Country Selector */}
      <CountrySelectElement
        value={country}
        onChange={setCountry}
        label="Country"
        required
        showFlags      // Show country flags
        searchable     // Enable search
      />

      {/* Name Input */}
      <AddressElement
        value={name}
        onChange={setName}
        label="Full Name"
        required
        placeholder="John Doe"
      />

      {/* Street Address */}
      <AddressElement
        value={street}
        onChange={setStreet}
        label="Street Address"
        required
        placeholder="123 Main Street"
      />

      {/* Postal Code with Auto-formatting */}
      <PostalCodeElement
        value={postal}
        onChange={setPostal}
        countryCode={country}
        autoFormat      // Automatically format based on country
        required
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Dark Mode

```tsx
const darkTheme: AddressElementTheme = {
  colorPrimary: '#7C3AED',
  colorSuccess: '#10B981',
  colorError: '#EF4444',
  colorText: '#F9FAFB',
  colorTextSecondary: '#D1D5DB',
  colorBackground: '#1F2937',
  colorBorder: '#374151',
  colorBorderFocus: '#7C3AED',
  borderRadius: '8px',
};

<AddressFormPremium theme={darkTheme} />
```

## TypeScript

Full TypeScript support out of the box:

```tsx
import type {
  AddressInput,
  ValidationResult,
  AddressElementTheme,
} from '@vey/react';

const handleSubmit = (
  address: AddressInput,
  validation: ValidationResult
): void => {
  // TypeScript knows the exact shape of address and validation
};
```

## Props Reference (Quick)

### AddressFormPremium

| Prop | Type | Description |
|------|------|-------------|
| `initialCountry` | `string` | Starting country (e.g., 'US', 'JP') |
| `onSubmit` | `(address, validation) => void` | Called when form is submitted |
| `onChange` | `(address, isValid) => void` | Called on every change |
| `liveValidation` | `boolean` | Validate as user types (default: true) |
| `theme` | `AddressElementTheme` | Custom colors/fonts |
| `submitLabel` | `string` | Submit button text |
| `loading` | `boolean` | Show loading state |
| `disabled` | `boolean` | Disable entire form |
| `allowedCountries` | `string[]` | Restrict to specific countries |

See [full API reference](./sdk/react/docs/PREMIUM_COMPONENTS.md) for all props.

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Next Steps

1. **[View Examples](./sdk/react/examples/PremiumExample.tsx)** - See more complex examples
2. **[API Reference](./sdk/react/docs/PREMIUM_COMPONENTS.md)** - Complete API documentation
3. **[Theming Guide](./sdk/react/README.md#-theming)** - Customize the look and feel
4. **[GitHub Issues](https://github.com/rei-k/world-address-yaml/issues)** - Report bugs or request features

## FAQs

**Q: How do I validate addresses on the backend?**  
A: Use the `@vey/core` package in Node.js:

```javascript
const { validateAddress } = require('@vey/core');

app.post('/api/address', (req, res) => {
  const validation = validateAddress(req.body.address, req.body.country);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }
  // Save address...
});
```

**Q: Can I use this with Next.js/Remix/etc?**  
A: Yes! It works with any React framework. For Next.js, use it in client components.

**Q: How big is the bundle?**  
A: ~15KB gzipped for the complete form, ~8KB for individual components.

**Q: Can I customize the validation rules?**  
A: Yes, use the `onValidate` callback to add your own validation logic.

**Q: Is it free?**  
A: Yes, MIT licensed and completely free to use.

## Get Help

- 💬 [GitHub Discussions](https://github.com/rei-k/world-address-yaml/discussions)
- 🐛 [Report an Issue](https://github.com/rei-k/world-address-yaml/issues)
- 📖 [Full Documentation](https://github.com/rei-k/world-address-yaml)

---

Built with ❤️ by the Vey Team
