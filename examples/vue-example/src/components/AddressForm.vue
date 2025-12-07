<script setup lang="ts">
import { watch } from 'vue';
import { useAddress } from '../composables/useAddress';

const emit = defineEmits<{
  (e: 'submit', address: any): void;
}>();

const { address, errors, isValid, validate, reset, postalCodeExamples } = useAddress();

const countries = [
  { code: 'JP', name: '🇯🇵 Japan', flag: '🇯🇵' },
  { code: 'US', name: '🇺🇸 United States', flag: '🇺🇸' },
  { code: 'GB', name: '🇬🇧 United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: '🇨🇦 Canada', flag: '🇨🇦' },
  { code: 'DE', name: '🇩🇪 Germany', flag: '🇩🇪' },
  { code: 'FR', name: '🇫🇷 France', flag: '🇫🇷' },
];

const handleSubmit = () => {
  if (validate()) {
    emit('submit', { ...address.value });
    reset();
  }
};

// Watch for country changes to show/hide province field
watch(() => address.value.country, (newCountry) => {
  console.log('Country changed to:', newCountry);
});
</script>

<template>
  <div class="address-form">
    <h2>📬 Address Form</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="country">
          Country <span class="required">*</span>
        </label>
        <select 
          id="country" 
          v-model="address.country"
          :class="{ 'error': errors.country }"
        >
          <option value="">Select a country</option>
          <option 
            v-for="country in countries" 
            :key="country.code"
            :value="country.code"
          >
            {{ country.name }}
          </option>
        </select>
        <span v-if="errors.country" class="error-message">
          {{ errors.country }}
        </span>
      </div>

      <div class="form-group">
        <label for="postal_code">
          Postal Code <span class="required">*</span>
        </label>
        <input 
          id="postal_code"
          type="text"
          v-model="address.postal_code"
          :placeholder="postalCodeExamples[address.country] || 'Enter postal code'"
          :class="{ 'error': errors.postal_code }"
          @blur="validate"
        />
        <span v-if="errors.postal_code" class="error-message">
          {{ errors.postal_code }}
        </span>
      </div>

      <div v-if="address.country === 'JP'" class="form-group">
        <label for="province">
          Prefecture <span class="required">*</span>
        </label>
        <input 
          id="province"
          type="text"
          v-model="address.province"
          placeholder="東京都"
          :class="{ 'error': errors.province }"
          @blur="validate"
        />
        <span v-if="errors.province" class="error-message">
          {{ errors.province }}
        </span>
      </div>

      <div v-else class="form-group">
        <label for="province">State/Province</label>
        <input 
          id="province"
          type="text"
          v-model="address.province"
          placeholder="Enter state or province"
        />
      </div>

      <div class="form-group">
        <label for="city">
          City <span class="required">*</span>
        </label>
        <input 
          id="city"
          type="text"
          v-model="address.city"
          placeholder="Enter city"
          :class="{ 'error': errors.city }"
          @blur="validate"
        />
        <span v-if="errors.city" class="error-message">
          {{ errors.city }}
        </span>
      </div>

      <div class="form-group">
        <label for="street_address">
          Street Address <span class="required">*</span>
        </label>
        <textarea 
          id="street_address"
          v-model="address.street_address"
          placeholder="Enter street address"
          rows="3"
          :class="{ 'error': errors.street_address }"
          @blur="validate"
        ></textarea>
        <span v-if="errors.street_address" class="error-message">
          {{ errors.street_address }}
        </span>
      </div>

      <div class="form-actions">
        <button type="button" @click="reset" class="btn btn-secondary">
          Reset
        </button>
        <button type="submit" class="btn btn-primary" :disabled="!isValid">
          Submit Address
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.address-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.address-form h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #dc3545;
}

.error-message {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}
</style>
