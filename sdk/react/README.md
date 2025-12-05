# @vey/react - Premium Address Forms

[![npm version](https://img.shields.io/npm/v/@vey/react.svg)](https://www.npmjs.com/package/@vey/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**World-class address form components for React** - Built with Stripe-like quality and developer experience.

## ✨ Features

- 🎨 **Beautiful UI** - Premium design with smooth animations
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🌍 **Multi-country** - Dynamic fields for 257+ countries
- ✅ **Smart Validation** - Real-time validation with helpful error messages
- 🎯 **TypeScript** - Full type safety out of the box
- 🎭 **Themeable** - Customizable colors, fonts, and spacing
- 📱 **Responsive** - Works beautifully on all devices
- ⚡ **Fast** - Optimized bundle size and performance
- 🔧 **Flexible** - Use complete forms or individual components

## 🚀 Quick Start

### Installation

```bash
npm install @vey/react @vey/core
```

### Basic Example

```tsx
import { AddressFormPremium } from '@vey/react';

function CheckoutPage() {
  const handleSubmit = (address, validation) => {
    if (validation.valid) {
      // Process the address
      console.log('Shipping to:', address);
    }
  };

  return (
    <AddressFormPremium
      initialCountry="US"
      onSubmit={handleSubmit}
      submitLabel="Continue to Payment"
      liveValidation
    />
  );
}
```

That's it! You now have a production-ready address form with:
- ✅ Country-specific field layouts
- ✅ Real-time validation
- ✅ Auto-formatting (postal codes, etc.)
- ✅ Beautiful error messages
- ✅ Keyboard navigation
- ✅ Screen reader support

## 📚 Components

### AddressFormPremium (Recommended)

Complete address form with everything you need.

```tsx
<AddressFormPremium
  initialCountry="US"
  onSubmit={(address, validation) => {
    // Handle submission
  }}
  onChange={(address, isValid) => {
    // Track changes
  }}
  liveValidation
  showCountrySelector
  allowedCountries={['US', 'CA', 'GB', 'AU']}
  theme={customTheme}
/>
```

### Individual Components

Build custom layouts with individual components:

```tsx
import {
  AddressElement,
  PostalCodeElement,
  CountrySelectElement,
} from '@vey/react';

function CustomForm() {
  return (
    <form>
      <CountrySelectElement
        value={country}
        onChange={setCountry}
        showFlags
        searchable
      />
      
      <AddressElement
        value={street}
        onChange={setStreet}
        label="Street Address"
        required
      />
      
      <PostalCodeElement
        value={postal}
        onChange={setPostal}
        countryCode={country}
        autoFormat
      />
    </form>
  );
}
```

## 🎨 Theming

Customize colors, fonts, and spacing:

```tsx
import type { AddressElementTheme } from '@vey/react';

const customTheme: AddressElementTheme = {
  colorPrimary: '#0070F3',
  colorSuccess: '#10B981',
  colorError: '#EF4444',
  borderRadius: '8px',
  fontFamily: 'Inter, system-ui, sans-serif',
};

<AddressFormPremium theme={customTheme} />
```

### Dark Mode

```tsx
const darkTheme: AddressElementTheme = {
  colorPrimary: '#7C3AED',
  colorText: '#F9FAFB',
  colorBackground: '#1F2937',
  colorBorder: '#374151',
  // ... more options
};

<AddressFormPremium theme={darkTheme} />
```

## 🌍 Country Support

Automatically adjusts fields based on selected country:

- **United States** - Name, Street, City, State, ZIP Code
- **Japan** - Name, Postal Code, Prefecture, City, Street
- **United Kingdom** - Name, Street, City, Postcode
- **Canada** - Name, Street, City, Province, Postal Code
- **Australia** - Name, Street, Suburb, State, Postcode
- And 252+ more countries!

## ✅ Validation

Built-in validation with helpful error messages:

```tsx
<AddressFormPremium
  liveValidation        // Validate as user types
  validateOnBlur        // Validate when field loses focus
  showValidation        // Show error messages
  onValidate={(validation) => {
    console.log('Errors:', validation.errors);
    console.log('Is valid:', validation.valid);
  }}
/>
```

## 📱 Real-world Examples

### E-commerce Checkout

```tsx
function Checkout() {
  const [shippingAddress, setShippingAddress] = useState(null);

  return (
    <AddressFormPremium
      initialCountry="US"
      onSubmit={(address) => {
        setShippingAddress(address);
        // Proceed to payment
      }}
      submitLabel="Continue to Payment"
      successMessage="Address saved!"
      liveValidation
    />
  );
}
```

### Multi-step Form

```tsx
function ShippingForm() {
  return (
    <AddressFormPremium
      onSubmit={(address) => {
        saveToBackend(address);
        goToNextStep();
      }}
      submitLabel="Next: Review Order"
    />
  );
}
```

### Custom Success Handling

```tsx
<AddressFormPremium
  onSubmit={async (address, validation) => {
    try {
      await api.saveAddress(address);
      showNotification('Address saved!');
    } catch (error) {
      showError(error.message);
    }
  }}
  loading={isSaving}
  successMessage="Saved successfully!"
  successDuration={3000}
/>
```

## ♿ Accessibility

All components are WCAG 2.1 AA compliant:

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Error announcements
- ✅ Semantic HTML

## 📖 API Reference

### AddressFormPremium

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialCountry` | `string` | `'US'` | Initial country (ISO alpha-2) |
| `onSubmit` | `(address, validation) => void` | - | Submit handler |
| `onChange` | `(address, isValid) => void` | - | Change handler |
| `liveValidation` | `boolean` | `true` | Real-time validation |
| `showCountrySelector` | `boolean` | `true` | Show country dropdown |
| `allowedCountries` | `string[]` | - | Restrict countries |
| `theme` | `AddressElementTheme` | - | Custom theme |
| `submitLabel` | `string` | `'Continue'` | Submit button text |
| More... | | | See full docs |

### AddressElement

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Current value |
| `onChange` | `(value) => void` | Change handler |
| `label` | `string` | Field label |
| `required` | `boolean` | Required field |
| `error` | `string` | Error message |
| `theme` | `AddressElementTheme` | Custom theme |
| More... | | See full docs |

See [docs/PREMIUM_COMPONENTS.md](./docs/PREMIUM_COMPONENTS.md) for complete API reference.

## 🎯 Why Choose @vey/react?

### vs. Manual Forms
- ✅ No need to research address formats for 257 countries
- ✅ Built-in validation rules
- ✅ Professional UI out of the box

### vs. Other Solutions
- ✅ **Better UX** - Stripe-like quality
- ✅ **More Complete** - 257+ countries with accurate formats
- ✅ **More Flexible** - Use complete forms or individual components
- ✅ **Better DX** - TypeScript, great docs, helpful errors
- ✅ **Open Source** - MIT licensed, community-driven

### Compared to Stripe Elements
- ✅ Same quality and developer experience
- ✅ Focused on addresses, not payments
- ✅ More countries and address formats
- ✅ Free and open source

## 🔧 Advanced Usage

### Custom Validation

```tsx
<AddressFormPremium
  onValidate={(validation) => {
    // Add custom validation
    if (!validation.valid) {
      customErrorHandler(validation.errors);
    }
  }}
/>
```

### Loading States

```tsx
const [isSaving, setIsSaving] = useState(false);

<AddressFormPremium
  loading={isSaving}
  onSubmit={async (address) => {
    setIsSaving(true);
    await saveAddress(address);
    setIsSaving(false);
  }}
/>
```

### Conditional Fields

```tsx
<AddressFormPremium
  initialValue={{
    recipient: user.name,
    // Pre-fill known fields
  }}
  allowedCountries={
    isPremiumUser ? allCountries : ['US', 'CA']
  }
/>
```

## 📦 Bundle Size

- **AddressFormPremium**: ~15KB gzipped
- **Individual components**: ~8KB gzipped
- **Tree-shakeable** - Only pay for what you use

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details.

## 🔗 Links

- [Documentation](https://github.com/rei-k/world-address-yaml)
- [Examples](./examples/)
- [API Reference](./docs/PREMIUM_COMPONENTS.md)
- [Changelog](./CHANGELOG.md)
- [Issues](https://github.com/rei-k/world-address-yaml/issues)

---

Built with ❤️ by the Vey Team
