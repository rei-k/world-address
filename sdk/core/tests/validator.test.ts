/**
 * @vey/core - Tests for validator module
 */

import { describe, it, expect } from 'vitest';
import {
  validateAddress,
  getRequiredFields,
  getFieldOrder,
} from '../src/validator';
import type { CountryAddressFormat, AddressInput } from '../src/types';

// Mock Japan format
const japanFormat: CountryAddressFormat = {
  name: {
    en: 'Japan',
  },
  iso_codes: {
    alpha2: 'JP',
    alpha3: 'JPN',
    numeric: '392',
  },
  languages: [
    {
      name: 'Japanese',
      script: 'Kanji',
      direction: 'ltr',
      role: 'official',
    },
  ],
  address_format: {
    order_variants: [
      {
        context: 'domestic',
        order: ['recipient', 'prefecture', 'city', 'street_address', 'postal_code'],
      },
      {
        context: 'international',
        order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
      },
    ],
    recipient: { required: true },
    street_address: { required: true },
    city: { required: true },
    province: { required: true, label_en: 'Prefecture' },
    postal_code: { required: true, regex: '^[0-9]{3}-[0-9]{4}$' },
    country: { required: true },
  },
  validation: {
    allow_latin_transliteration: true,
  },
};

describe('validateAddress', () => {
  it('should validate a complete address', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = validateAddress(address, japanFormat);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return errors for missing required fields', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
    };

    const result = validateAddress(address, japanFormat);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.field === 'street_address')).toBe(true);
    expect(result.errors.some((e) => e.field === 'city')).toBe(true);
    expect(result.errors.some((e) => e.field === 'postal_code')).toBe(true);
  });

  it('should validate postal code format', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '1234567', // Invalid format
      country: 'Japan',
    };

    const result = validateAddress(address, japanFormat);

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'postal_code')).toBe(true);
    expect(result.errors.some((e) => e.code === 'INVALID_POSTAL_CODE')).toBe(true);
  });

  it('should accept valid postal code format', () => {
    const address: AddressInput = {
      recipient: 'John Doe',
      street_address: '1-1 Chiyoda',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001', // Valid format
      country: 'Japan',
    };

    const result = validateAddress(address, japanFormat);

    expect(result.valid).toBe(true);
    expect(result.errors.filter((e) => e.field === 'postal_code')).toHaveLength(0);
  });

  it('should warn about non-Latin characters', () => {
    const address: AddressInput = {
      recipient: '山田太郎',
      street_address: '千代田1-1',
      city: '千代田区',
      province: '東京都',
      postal_code: '100-0001',
      country: '日本',
    };

    const result = validateAddress(address, japanFormat);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.code === 'NON_LATIN_CHARACTERS')).toBe(true);
  });

  it('should normalize whitespace in address fields', () => {
    const address: AddressInput = {
      recipient: '  John Doe  ',
      street_address: '  1-1 Chiyoda  ',
      city: 'Chiyoda-ku',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = validateAddress(address, japanFormat);

    expect(result.normalized?.recipient).toBe('John Doe');
    expect(result.normalized?.street_address).toBe('1-1 Chiyoda');
  });
});

describe('getRequiredFields', () => {
  it('should return all required fields', () => {
    const required = getRequiredFields(japanFormat);

    expect(required).toContain('recipient');
    expect(required).toContain('street_address');
    expect(required).toContain('city');
    expect(required).toContain('province');
    expect(required).toContain('postal_code');
    expect(required).toContain('country');
  });

  it('should not include optional fields', () => {
    const formatWithOptional: CountryAddressFormat = {
      ...japanFormat,
      address_format: {
        ...japanFormat.address_format,
        building: { required: false },
        floor: { required: false },
      },
    };

    const required = getRequiredFields(formatWithOptional);

    expect(required).not.toContain('building');
    expect(required).not.toContain('floor');
  });
});

describe('getFieldOrder', () => {
  it('should return international order by default', () => {
    const order = getFieldOrder(japanFormat);

    expect(order).toEqual([
      'recipient',
      'street_address',
      'city',
      'province',
      'postal_code',
      'country',
    ]);
  });

  it('should return domestic order when specified', () => {
    const order = getFieldOrder(japanFormat, 'domestic');

    expect(order).toEqual([
      'recipient',
      'prefecture',
      'city',
      'street_address',
      'postal_code',
    ]);
  });

  it('should fallback to first variant if context not found', () => {
    const order = getFieldOrder(japanFormat, 'postal');

    // Should return first variant (domestic) as fallback
    expect(order).toEqual([
      'recipient',
      'prefecture',
      'city',
      'street_address',
      'postal_code',
    ]);
  });

  it('should return simple order if order_variants not present', () => {
    const simpleFormat: CountryAddressFormat = {
      ...japanFormat,
      address_format: {
        order: ['recipient', 'street_address', 'city', 'postal_code'],
        recipient: { required: true },
        street_address: { required: true },
        city: { required: true },
        postal_code: { required: true },
      },
    };

    const order = getFieldOrder(simpleFormat);

    expect(order).toEqual(['recipient', 'street_address', 'city', 'postal_code']);
  });
});

describe('validateAddress edge cases', () => {
  it('should handle address with all optional fields', () => {
    const address: AddressInput = {
      recipient: 'Test User',
      street_address: '123 Main',
      city: 'Tokyo',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
      district: 'District 1',
      ward: 'Ward 1',
      building: 'Building A',
      floor: '5F',
      room: '501',
    };

    const result = validateAddress(address, japanFormat);
    expect(result.valid).toBe(true);
  });

  it('should validate minimal valid address', () => {
    const address: AddressInput = {
      recipient: 'User',
      street_address: 'Street',
      city: 'City',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = validateAddress(address, japanFormat);
    expect(result.valid).toBe(true);
  });

  it('should handle multiple validation errors', () => {
    const address: AddressInput = {
      // Missing all required fields
    };

    const result = validateAddress(address, japanFormat);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it('should validate postal code with complex regex', () => {
    const complexFormat: CountryAddressFormat = {
      ...japanFormat,
      address_format: {
        ...japanFormat.address_format,
        postal_code: {
          required: true,
          regex: '^[0-9]{3}-[0-9]{4}$', // Keep Japan format for consistency
          example: '100-0001',
        },
      },
    };

    const validAddress: AddressInput = {
      recipient: 'User',
      street_address: 'Street',
      city: 'City',
      province: 'Tokyo',
      postal_code: '100-0001',
      country: 'Japan',
    };

    const result = validateAddress(validAddress, complexFormat);
    expect(result.valid).toBe(true);
  });
});

