# @vey/react-native

React Native SDK for World Address YAML - Address validation and formatting for React Native applications.

## Installation

```bash
npm install @vey/react-native @vey/core
# or
yarn add @vey/react-native @vey/core
```

## Usage

### Setup Provider

```tsx
import { VeyProvider } from '@vey/react-native';

function App() {
  return (
    <VeyProvider config={{ apiKey: 'your-api-key' }}>
      <YourApp />
    </VeyProvider>
  );
}
```

### Use Address Form Component

```tsx
import { AddressForm } from '@vey/react-native';

function CheckoutScreen() {
  return (
    <AddressForm
      countryCode="JP"
      onSubmit={(address, validation) => {
        console.log('Address:', address);
        console.log('Valid:', validation.valid);
      }}
    />
  );
}
```

### Use Hooks

```tsx
import { useAddressValidation } from '@vey/react-native';

function CustomForm() {
  const { validate, isValidating, errors } = useAddressValidation();

  async function handleValidate() {
    const result = await validate(
      {
        street: '1-1 Chiyoda',
        city: 'Tokyo',
        postalCode: '100-0001',
      },
      'JP'
    );

    if (result.valid) {
      console.log('Valid address!');
    }
  }

  return (
    <Button title="Validate" onPress={handleValidate} disabled={isValidating} />
  );
}
```

## Features

- ✅ Pre-built address form component
- ✅ React hooks for validation
- ✅ TypeScript support
- ✅ iOS and Android support
- ✅ Customizable styling

## License

MIT
