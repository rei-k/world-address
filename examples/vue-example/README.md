# Vue 3 Address Form Example

This example demonstrates how to use the `@vey/core` SDK with Vue 3 and the Composition API.

## Features

- ✅ **Country-specific validation** - Different validation rules for different countries
- ✅ **Real-time validation** - Immediate feedback as users type
- ✅ **Postal code formatting** - Country-specific postal code patterns
- ✅ **Reactive forms** - Uses Vue 3 Composition API (ref, computed, watch)
- ✅ **Required field detection** - Dynamic required fields based on country
- ✅ **Error messaging** - Clear, actionable error messages

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:5173` to see the example in action.

## Project Structure

```
vue-example/
├── src/
│   ├── App.vue              # Main application component
│   ├── components/
│   │   └── AddressForm.vue  # Address form component
│   ├── composables/
│   │   └── useAddress.ts    # Address validation composable
│   └── main.ts              # Application entry point
├── public/
│   └── index.html           # HTML template
├── package.json
├── vite.config.ts
└── README.md
```

## Usage

### Basic Address Form

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAddress } from './composables/useAddress';

const { address, errors, validate, isValid } = useAddress();

const handleSubmit = () => {
  if (validate()) {
    console.log('Valid address:', address.value);
    // Submit to your API
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="country">Country</label>
      <select id="country" v-model="address.country">
        <option value="JP">Japan</option>
        <option value="US">United States</option>
        <option value="GB">United Kingdom</option>
      </select>
    </div>

    <div class="form-group">
      <label for="postal_code">Postal Code</label>
      <input 
        id="postal_code" 
        v-model="address.postal_code"
        @blur="validate"
      />
      <span v-if="errors.postal_code" class="error">
        {{ errors.postal_code }}
      </span>
    </div>

    <!-- More fields... -->

    <button type="submit" :disabled="!isValid">
      Submit Address
    </button>
  </form>
</template>
```

### Using the Address Composable

The `useAddress` composable provides reactive state and validation:

```typescript
import { useAddress } from './composables/useAddress';

const { 
  address,      // Reactive address object
  errors,       // Validation errors
  validate,     // Validate function
  isValid,      // Computed validity
  reset         // Reset form
} = useAddress();

// Watch for changes
watch(() => address.value.country, (newCountry) => {
  console.log('Country changed to:', newCountry);
  // Load country-specific format
});
```

## Key Concepts

### 1. Composition API

This example uses Vue 3's Composition API for better code organization and reusability:

- `ref()` - Reactive references
- `computed()` - Computed properties
- `watch()` - Watchers
- `onMounted()` - Lifecycle hooks

### 2. Country-Specific Validation

The address validation adapts based on the selected country:

```typescript
// Japan: requires postal code in format XXX-XXXX
// United States: requires ZIP code in format XXXXX or XXXXX-XXXX
// United Kingdom: requires postcode in format AA9A 9AA
```

### 3. Reactive Form State

All form state is reactive, so the UI updates automatically when data changes.

## Extending This Example

### Add Autocomplete

```vue
<script setup>
import { ref, watch } from 'vue';

const suggestions = ref([]);

watch(() => address.value.postal_code, async (newCode) => {
  if (newCode && newCode.length >= 3) {
    suggestions.value = await fetchAddressSuggestions(newCode);
  }
});
</script>
```

### Add Multi-step Form

```vue
<script setup>
import { ref, computed } from 'vue';

const currentStep = ref(1);
const totalSteps = 3;

const canProceed = computed(() => {
  if (currentStep.value === 1) return !!address.value.country;
  if (currentStep.value === 2) return !!address.value.postal_code;
  return isValid.value;
});

const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps) {
    currentStep.value++;
  }
};
</script>
```

## TypeScript Support

This example includes full TypeScript support. Types are automatically inferred from the SDK.

```typescript
import type { AddressInput, ValidationResult } from '@vey/core';

const address: Ref<AddressInput> = ref({
  country: 'JP',
  postal_code: '',
  province: '',
  city: '',
  street_address: '',
});
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [Composition API Guide](https://vuejs.org/guide/extras/composition-api-faq.html)
- [@vey/core SDK Documentation](../../sdk/core/README.md)
- [Vite Documentation](https://vitejs.dev/)

## License

MIT
