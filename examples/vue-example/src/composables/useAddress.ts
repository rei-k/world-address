import { ref, computed, watch } from 'vue';

export interface AddressInput {
  country: string;
  postal_code: string;
  province: string;
  city: string;
  street_address: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Composable for address form state and validation
 */
export function useAddress() {
  const address = ref<AddressInput>({
    country: 'JP',
    postal_code: '',
    province: '',
    city: '',
    street_address: '',
  });

  const errors = ref<ValidationErrors>({});

  // Postal code patterns for different countries
  const postalCodePatterns: Record<string, RegExp> = {
    JP: /^[0-9]{3}-[0-9]{4}$/,
    US: /^\d{5}(-\d{4})?$/,
    GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
  };

  // Postal code examples for different countries
  const postalCodeExamples: Record<string, string> = {
    JP: '123-4567',
    US: '12345 or 12345-6789',
    GB: 'SW1A 1AA',
    CA: 'K1A 0B1',
    DE: '10115',
    FR: '75001',
  };

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0 && 
           address.value.country && 
           address.value.postal_code;
  });

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate country
    if (!address.value.country) {
      newErrors.country = 'Country is required';
    }

    // Validate postal code
    if (!address.value.postal_code) {
      newErrors.postal_code = 'Postal code is required';
    } else {
      const pattern = postalCodePatterns[address.value.country];
      if (pattern && !pattern.test(address.value.postal_code)) {
        const example = postalCodeExamples[address.value.country];
        newErrors.postal_code = `Invalid postal code format. Example: ${example}`;
      }
    }

    // Validate province
    if (!address.value.province && address.value.country === 'JP') {
      newErrors.province = 'Province/Prefecture is required for Japan';
    }

    // Validate city
    if (!address.value.city) {
      newErrors.city = 'City is required';
    }

    // Validate street address
    if (!address.value.street_address) {
      newErrors.street_address = 'Street address is required';
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    address.value = {
      country: 'JP',
      postal_code: '',
      province: '',
      city: '',
      street_address: '',
    };
    errors.value = {};
  };

  // Watch country changes to clear postal code errors
  watch(() => address.value.country, () => {
    if (errors.value.postal_code) {
      delete errors.value.postal_code;
    }
  });

  return {
    address,
    errors,
    isValid,
    validate,
    reset,
    postalCodeExamples,
  };
}
