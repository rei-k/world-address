<template>
  <div class="container">
    <h1>🌍 Vue Address Form Example</h1>
    <p class="subtitle">Demonstrating @vey/core SDK with Vue 3 Composition API</p>

    <div class="form-container">
      <form @submit.prevent="handleValidate">
        <div class="form-group">
          <label for="country">Country</label>
          <select
            id="country"
            v-model="address.country"
            @change="handleCountryChange"
            required
          >
            <option value="">Select a country</option>
            <option value="JP">🇯🇵 Japan</option>
            <option value="US">🇺🇸 United States</option>
            <option value="GB">🇬🇧 United Kingdom</option>
            <option value="FR">🇫🇷 France</option>
            <option value="DE">🇩🇪 Germany</option>
          </select>
        </div>

        <div v-if="address.country" class="form-group">
          <label for="postal_code">
            Postal Code
            <span v-if="postalCodeExample" class="hint">(e.g., {{ postalCodeExample }})</span>
          </label>
          <input
            id="postal_code"
            v-model="address.postal_code"
            type="text"
            :placeholder="postalCodeExample || 'Enter postal code'"
            :required="isFieldRequired('postal_code')"
          />
        </div>

        <div v-if="address.country" class="form-group">
          <label for="province">
            {{ getFieldLabel('province') }}
          </label>
          <input
            id="province"
            v-model="address.province"
            type="text"
            :placeholder="`Enter ${getFieldLabel('province').toLowerCase()}`"
            :required="isFieldRequired('province')"
          />
        </div>

        <div v-if="address.country" class="form-group">
          <label for="city">City</label>
          <input
            id="city"
            v-model="address.city"
            type="text"
            placeholder="Enter city"
            :required="isFieldRequired('city')"
          />
        </div>

        <div v-if="address.country" class="form-group">
          <label for="street_address">Street Address</label>
          <input
            id="street_address"
            v-model="address.street_address"
            type="text"
            placeholder="Enter street address"
            :required="isFieldRequired('street_address')"
          />
        </div>

        <button type="submit" :disabled="!address.country" class="btn-primary">
          Validate Address
        </button>
      </form>

      <div v-if="validationResult" class="result-container">
        <div v-if="validationResult.valid" class="success">
          <h3>✅ Address is valid!</h3>
          <div class="formatted-address">
            <strong>Formatted Address:</strong>
            <pre>{{ formattedAddress }}</pre>
          </div>
        </div>

        <div v-else class="error">
          <h3>❌ Validation Errors</h3>
          <ul>
            <li v-for="(error, index) in validationResult.errors" :key="index">
              {{ error.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Mock country format data (in real app, load from @vey/core or API)
const countryFormats = {
  JP: {
    name: { en: 'Japan' },
    address_format: {
      order: ['recipient', 'postal_code', 'province', 'city', 'street_address', 'country'],
      postal_code: { required: true, regex: '^[0-9]{3}-[0-9]{4}$', example: '100-0001' },
      province: { required: true, type: 'Prefecture' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  US: {
    name: { en: 'United States' },
    address_format: {
      order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
      postal_code: { required: true, regex: '^\\d{5}(-\\d{4})?$', example: '12345' },
      province: { required: true, type: 'State' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  GB: {
    name: { en: 'United Kingdom' },
    address_format: {
      order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
      postal_code: { required: true, regex: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', example: 'SW1A 1AA' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  FR: {
    name: { en: 'France' },
    address_format: {
      order: ['recipient', 'street_address', 'postal_code', 'city', 'country'],
      postal_code: { required: true, regex: '^\\d{5}$', example: '75001' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  DE: {
    name: { en: 'Germany' },
    address_format: {
      order: ['recipient', 'street_address', 'postal_code', 'city', 'country'],
      postal_code: { required: true, regex: '^\\d{5}$', example: '10115' },
      city: { required: true },
      street_address: { required: true },
    },
  },
};

const address = ref({
  country: '',
  postal_code: '',
  province: '',
  city: '',
  street_address: '',
});

const validationResult = ref(null);
const currentFormat = ref(null);

const postalCodeExample = computed(() => {
  return currentFormat.value?.address_format?.postal_code?.example || '';
});

const formattedAddress = computed(() => {
  if (!validationResult.value?.valid) return '';
  
  const normalized = validationResult.value.normalized;
  const parts = [];
  
  if (normalized.street_address) parts.push(normalized.street_address);
  if (normalized.city) parts.push(normalized.city);
  if (normalized.province) parts.push(normalized.province);
  if (normalized.postal_code) parts.push(normalized.postal_code);
  if (normalized.country) parts.push(normalized.country);
  
  return parts.join('\n');
});

function handleCountryChange() {
  currentFormat.value = countryFormats[address.value.country];
  validationResult.value = null;
}

function isFieldRequired(field) {
  return currentFormat.value?.address_format?.[field]?.required || false;
}

function getFieldLabel(field) {
  if (field === 'province') {
    const type = currentFormat.value?.address_format?.province?.type;
    return type || 'Province';
  }
  return field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
}

function validateAddress(addr, format) {
  const errors = [];
  
  // Validate required fields
  Object.keys(format.address_format).forEach((field) => {
    const fieldConfig = format.address_format[field];
    if (fieldConfig.required && !addr[field]) {
      errors.push({
        field,
        message: `${getFieldLabel(field)} is required`,
      });
    }
  });
  
  // Validate postal code format
  if (addr.postal_code && format.address_format.postal_code?.regex) {
    const regex = new RegExp(format.address_format.postal_code.regex);
    if (!regex.test(addr.postal_code)) {
      errors.push({
        field: 'postal_code',
        message: `Invalid postal code format. Expected format: ${format.address_format.postal_code.example}`,
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    normalized: errors.length === 0 ? addr : null,
  };
}

function handleValidate() {
  if (!currentFormat.value) return;
  
  validationResult.value = validateAddress(address.value, currentFormat.value);
  
  if (validationResult.value.valid) {
    console.log('✅ Address validated successfully:', validationResult.value.normalized);
  } else {
    console.error('❌ Validation errors:', validationResult.value.errors);
  }
}
</script>
