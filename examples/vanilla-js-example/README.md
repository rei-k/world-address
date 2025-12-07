# Vanilla JavaScript Address Form Example

This example demonstrates how to use the `@vey/core` SDK with pure Vanilla JavaScript - no frameworks required!

## Features

- ✅ **No Framework** - Pure JavaScript, HTML, and CSS
- ✅ **Modern ES6+** - Uses modern JavaScript features
- ✅ **Real-time validation** - Immediate feedback as users type
- ✅ **Country-specific validation** - Different rules for different countries
- ✅ **Lightweight** - Minimal dependencies
- ✅ **Easy to understand** - Perfect for learning

## Quick Start

```bash
# Install dependencies (just Vite for dev server)
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
vanilla-js-example/
├── index.html       # Main HTML file
├── src/
│   ├── main.js      # Application entry point
│   ├── address.js   # Address form logic
│   └── style.css    # Styles
├── package.json
└── README.md
```

## Usage

### HTML Structure

```html
<form id="address-form">
  <select id="country">
    <option value="JP">Japan</option>
    <option value="US">United States</option>
    <!-- More countries -->
  </select>

  <input id="postal-code" type="text" placeholder="Postal Code" />
  
  <!-- More fields... -->
  
  <button type="submit">Submit</button>
</form>
```

### JavaScript

```javascript
// Initialize form
const form = document.getElementById('address-form');
const address = {
  country: 'JP',
  postal_code: '',
  province: '',
  city: '',
  street_address: '',
};

// Handle form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (validateAddress(address)) {
    console.log('Valid address:', address);
    submitAddress(address);
  }
});

// Handle input changes
document.getElementById('postal-code').addEventListener('input', (e) => {
  address.postal_code = e.target.value;
  validatePostalCode(address.country, address.postal_code);
});
```

## Key Concepts

### 1. DOM Manipulation

Pure JavaScript for all DOM interactions:

```javascript
// Get element
const input = document.getElementById('postal-code');

// Set value
input.value = '123-4567';

// Add class
input.classList.add('error');

// Listen to events
input.addEventListener('input', handleInput);
```

### 2. Form Validation

Real-time validation without frameworks:

```javascript
function validatePostalCode(country, code) {
  const patterns = {
    JP: /^[0-9]{3}-[0-9]{4}$/,
    US: /^\d{5}(-\d{4})?$/,
  };
  
  const pattern = patterns[country];
  const isValid = pattern && pattern.test(code);
  
  // Show/hide error
  const errorEl = document.getElementById('postal-code-error');
  if (!isValid) {
    errorEl.textContent = 'Invalid postal code format';
    errorEl.style.display = 'block';
  } else {
    errorEl.style.display = 'none';
  }
  
  return isValid;
}
```

### 3. Event Handling

Handle user interactions:

```javascript
// Country selection
document.getElementById('country').addEventListener('change', (e) => {
  address.country = e.target.value;
  updateFormFields(e.target.value);
});

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (validateAddress(address)) {
    const result = await submitAddress(address);
    showSuccessMessage(result);
  }
});
```

### 4. Dynamic UI Updates

Update UI based on selected country:

```javascript
function updateFormFields(country) {
  const provinceLabel = document.getElementById('province-label');
  
  if (country === 'JP') {
    provinceLabel.textContent = 'Prefecture *';
    document.getElementById('province').required = true;
  } else if (country === 'US') {
    provinceLabel.textContent = 'State';
    document.getElementById('province').required = false;
  }
}
```

## Advanced Features

### AJAX Requests

```javascript
async function submitAddress(address) {
  try {
    const response = await fetch('/api/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(address),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit address');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    showErrorMessage(error.message);
  }
}
```

### Debouncing

Optimize validation performance:

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Use debounced validation
const debouncedValidate = debounce((value) => {
  validatePostalCode(address.country, value);
}, 300);

input.addEventListener('input', (e) => {
  debouncedValidate(e.target.value);
});
```

### Local Storage

Save form data:

```javascript
// Save to local storage
function saveAddress(address) {
  localStorage.setItem('savedAddress', JSON.stringify(address));
}

// Load from local storage
function loadAddress() {
  const saved = localStorage.getItem('savedAddress');
  return saved ? JSON.parse(saved) : null;
}

// Auto-save on input
form.addEventListener('input', () => {
  saveAddress(address);
});
```

## Styling

The example includes clean, modern CSS:

```css
/* Modern form styling */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

## Browser Compatibility

This example works in all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For older browsers, you may need to add polyfills for:
- `fetch()`
- `Promise`
- `async/await`

## No Build Step

You can also use this without any build tools:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Address Form</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <form id="address-form">
    <!-- form fields -->
  </form>
  
  <script type="module" src="main.js"></script>
</body>
</html>
```

## Learn More

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [@vey/core SDK Documentation](../../sdk/core/README.md)
- [Vite Documentation](https://vitejs.dev/)

## License

MIT
