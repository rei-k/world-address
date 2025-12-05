# Premium Address Components - API Reference

World-class address form components built with Stripe-like quality.

## Quick Start

### Installation

```bash
npm install @vey/react @vey/core
```

### Basic Usage

```tsx
import React from 'react';
import { AddressFormPremium } from '@vey/react';

function App() {
  const handleSubmit = (address, validation) => {
    console.log('Address:', address);
  };

  return (
    <AddressFormPremium
      initialCountry="US"
      onSubmit={handleSubmit}
      submitLabel="Continue"
    />
  );
}
```

For complete documentation, examples, and API reference, see the full documentation in the repository.
