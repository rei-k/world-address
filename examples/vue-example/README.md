# Vue 3 Address Form Example

This example demonstrates how to use the `@vey/core` SDK to create an address validation form using Vue 3 with the Composition API.

## 🎯 Features

- Vue 3 Composition API with `<script setup>` syntax
- Country-specific address field validation
- Real-time postal code format checking
- Required field highlighting
- Dynamic field labels (e.g., "State" for US, "Prefecture" for Japan)
- Reactive form validation
- Modern UI with gradient styling

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3001` to see the example in action.

## 📂 Project Structure

```
vue-example/
├── index.html           # Entry HTML file
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
└── src/
    ├── main.js          # Application entry point
    ├── App.vue          # Main address form component
    └── style.css        # Global styles
```

## 💡 Usage

### Basic Implementation

```vue
<script setup>
import { ref, computed } from 'vue';

const address = ref({
  country: 'JP',
  postal_code: '',
  province: '',
  city: '',
  street_address: ''
});

function handleValidate() {
  // Validation logic
  const result = validateAddress(address.value, countryFormat);
  
  if (result.valid) {
    console.log('✅ Valid address:', result.normalized);
  }
}
</script>

<template>
  <form @submit.prevent="handleValidate">
    <input v-model="address.postal_code" />
    <button type="submit">Validate</button>
  </form>
</template>
```

### With Real @vey/core SDK

In a production application, you would load country formats from the SDK:

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { loadCountryFormat, validateAddress } from '@vey/core';

const countryFormat = ref(null);

onMounted(async () => {
  countryFormat.value = await loadCountryFormat('JP');
});

function handleValidate() {
  const result = validateAddress(address.value, countryFormat.value);
  // Handle result
}
</script>
```

## 🎨 Customization

### Styling

The example uses modern CSS with gradients. Customize colors in `src/style.css`:

```css
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Validation Rules

Add custom validation rules in the `validateAddress` function:

```javascript
function validateAddress(addr, format) {
  const errors = [];
  
  // Custom validation logic
  if (addr.city && addr.city.length < 2) {
    errors.push({
      field: 'city',
      message: 'City name must be at least 2 characters'
    });
  }
  
  return { valid: errors.length === 0, errors };
}
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

### Reactive State

- `address` - Reactive address object
- `validationResult` - Validation result (null, success, or error)
- `currentFormat` - Current country format configuration

### Computed Properties

- `postalCodeExample` - Example postal code for selected country
- `formattedAddress` - Formatted address string for display

### Methods

- `handleCountryChange()` - Updates format when country changes
- `isFieldRequired(field)` - Checks if field is required
- `getFieldLabel(field)` - Gets localized field label
- `validateAddress(addr, format)` - Validates address against format
- `handleValidate()` - Form submission handler

## 🔗 Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Composition API Guide](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vite Documentation](https://vitejs.dev/)
- [@vey/core SDK Documentation](../../sdk/core/README.md)

## 📜 License

MIT - see [LICENSE](../../LICENSE)
