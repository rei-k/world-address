# Vanilla JavaScript Address Form Example

This example demonstrates how to use address validation concepts from the `@vey/core` SDK using pure JavaScript without any frameworks.

## 🎯 Features

- **Zero Dependencies** - Pure vanilla JavaScript (ES6+)
- **No Build Step** - Just open `index.html` in your browser
- **Modular Architecture** - Separated concerns (validator, formats, app logic)
- **Country-specific validation** - Different rules for different countries
- **Real-time validation** - Immediate feedback on form submission
- **Dynamic field requirements** - Fields become required based on country
- **Error highlighting** - Visual feedback for invalid fields
- **Modern UI** - Clean, responsive design with gradients

## 🚀 Quick Start

### Option 1: Open Directly in Browser

Simply open `index.html` in your web browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### Option 2: Use a Local Server

For a better development experience, use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 📂 Project Structure

```
vanilla-js-example/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Styling
└── js/
    ├── country-formats.js # Country format data
    ├── validator.js       # Validation logic
    └── app.js            # Main application logic
```

## 💡 Usage

### Basic Implementation

The example demonstrates a clean separation of concerns:

**1. Country Formats (`country-formats.js`)**
```javascript
const COUNTRY_FORMATS = {
  JP: {
    name: { en: 'Japan' },
    address_format: {
      postal_code: { required: true, regex: '^[0-9]{3}-[0-9]{4}$', example: '100-0001' },
      // ...
    },
  },
};
```

**2. Validator Module (`validator.js`)**
```javascript
const AddressValidator = {
  validate(address, format) {
    // Validation logic
    return { valid, errors, normalized };
  },
  
  formatAddress(address) {
    // Format for display
  },
};
```

**3. Application Logic (`app.js`)**
```javascript
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const result = AddressValidator.validate(address, format);
  displayResult(result);
});
```

### Integration with @vey/core

To integrate with the actual `@vey/core` SDK:

**Option 1: Using ES Modules**

```html
<script type="module">
  import { loadCountryFormat, validateAddress } from './path/to/@vey/core/dist/index.mjs';
  
  async function handleSubmit(address) {
    const format = await loadCountryFormat(address.country);
    const result = validateAddress(address, format);
    return result;
  }
</script>
```

**Option 2: Using UMD Build**

```html
<script src="./path/to/@vey/core/dist/index.umd.js"></script>
<script>
  const { loadCountryFormat, validateAddress } = VeyCore;
  
  async function handleSubmit(address) {
    const format = await loadCountryFormat(address.country);
    const result = validateAddress(address, format);
    return result;
  }
</script>
```

## 🎨 Customization

### Adding More Countries

Add to `js/country-formats.js`:

```javascript
const COUNTRY_FORMATS = {
  // ... existing countries
  CA: {
    name: { en: 'Canada' },
    address_format: {
      postal_code: { 
        required: true, 
        regex: '^[A-Z]\\d[A-Z] ?\\d[A-Z]\\d$', 
        example: 'K1A 0B1' 
      },
      province: { required: true, type: 'Province' },
      // ...
    },
  },
};
```

### Custom Validation Rules

Extend the validator in `js/validator.js`:

```javascript
const AddressValidator = {
  // ... existing methods
  
  validateCustom(address, format) {
    // Add your custom validation logic
    if (address.city && address.city.length < 2) {
      return { 
        valid: false, 
        error: 'City must be at least 2 characters' 
      };
    }
    return { valid: true };
  },
};
```

### Styling

Customize the appearance in `css/styles.css`:

```css
.btn-primary {
  background: linear-gradient(135deg, #your-color 0%, #your-color-2 100%);
}

.container {
  max-width: 800px; /* Wider container */
  border-radius: 20px; /* More rounded corners */
}
```

## 🧪 Testing

Test with these sample addresses:

### Japan (JP)
- Postal Code: `100-0001`
- Prefecture: `東京都`
- City: `千代田区`
- Street: `千代田1-1`

### United States (US)
- Postal Code: `12345` or `12345-6789`
- State: `NY`
- City: `New York`
- Street: `123 Main St`

### United Kingdom (GB)
- Postal Code: `SW1A 1AA`
- City: `London`
- Street: `10 Downing Street`

### France (FR)
- Postal Code: `75001`
- City: `Paris`
- Street: `1 Rue de Rivoli`

### Germany (DE)
- Postal Code: `10115`
- City: `Berlin`
- Street: `Unter den Linden 1`

## 📚 API Reference

### AddressValidator Module

#### `validate(address, format)`
Validates an address against a country format.

**Parameters:**
- `address` (Object) - Address object with country, postal_code, province, city, street_address
- `format` (Object) - Country format configuration

**Returns:**
- Object with `valid` (boolean), `errors` (array), `normalized` (object or null)

#### `getFieldLabel(field, format)`
Gets a human-readable label for a field.

#### `isFieldRequired(field, format)`
Checks if a field is required for the country.

#### `getPostalCodeExample(format)`
Gets the postal code example for display.

#### `formatAddress(address)`
Formats an address for display as a multi-line string.

## 🔗 Resources

- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [ES6+ Features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)
- [@vey/core SDK Documentation](../../sdk/core/README.md)

## 🚀 Browser Support

This example uses modern JavaScript features and works in:

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

For older browsers, you may need to transpile the JavaScript code using Babel.

## 📜 License

MIT - see [LICENSE](../../LICENSE)
