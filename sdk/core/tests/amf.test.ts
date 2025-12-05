/**
 * @vey/core - AMF (Address Mapping Framework) tests
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeAddress,
  denormalizeAddress,
  validateNormalizedAddress,
  normalizedAddressToPIDComponents,
} from '../src/amf';
import type { AddressInput, NormalizedAddress } from '../src/types';

describe('AMF (Address Mapping Framework)', () => {
  describe('normalizeAddress', () => {
    it('should normalize basic address', async () => {
      const rawAddress: AddressInput = {
        country: 'JP',
        province: '東京都',
        city: '渋谷区',
      };

      const normalized = await normalizeAddress(rawAddress, 'JP');
      
      expect(normalized).toBeDefined();
      expect(normalized.countryCode).toBe('JP');
      expect(normalized.admin1).toBeDefined();
    });

    it('should normalize country code to uppercase', async () => {
      const rawAddress: AddressInput = {
        country: 'jp',
      };

      const normalized = await normalizeAddress(rawAddress, 'jp');
      expect(normalized.countryCode).toBe('JP');
    });

    it('should map Japanese prefecture to admin1 code', async () => {
      const prefectures = [
        { name: '東京都', code: '13' },
        { name: '北海道', code: '01' },
        { name: '大阪府', code: '27' },
        { name: '京都府', code: '26' },
        { name: '神奈川県', code: '14' },
      ];

      for (const pref of prefectures) {
        const normalized = await normalizeAddress(
          { country: 'JP', province: pref.name },
          'JP'
        );
        expect(normalized.admin1).toBe(pref.code);
      }
    });

    it('should handle unknown prefecture', async () => {
      const normalized = await normalizeAddress(
        { country: 'JP', province: '未知県' },
        'JP'
      );
      expect(normalized.admin1).toBe('00');
    });

    it('should normalize city to admin2', async () => {
      const normalized = await normalizeAddress(
        {
          country: 'JP',
          province: '東京都',
          city: '渋谷区',
        },
        'JP'
      );
      expect(normalized.admin2).toBeDefined();
    });

    it('should normalize district to locality', async () => {
      const normalized = await normalizeAddress(
        {
          country: 'JP',
          district: '道玄坂',
        },
        'JP'
      );
      expect(normalized.locality).toBe('道玄坂');
    });

    it('should normalize ward to sublocality', async () => {
      const normalized = await normalizeAddress(
        {
          country: 'JP',
          ward: '1丁目',
        },
        'JP'
      );
      expect(normalized.sublocality).toBe('1丁目');
    });

    it('should normalize building information', async () => {
      const normalized = await normalizeAddress(
        {
          country: 'JP',
          building: '渋谷ヒカリエ',
        },
        'JP'
      );
      expect(normalized.building).toBe('渋谷ヒカリエ');
    });

    it('should normalize unit from unit field', async () => {
      const normalized = await normalizeAddress(
        {
          country: 'JP',
          unit: '101',
        },
        'JP'
      );
      expect(normalized.unit).toBe('101');
    });

    it('should normalize unit from room field', async () => {
      const normalized = await normalizeAddress(
        {
          country: 'JP',
          room: '201',
        },
        'JP'
      );
      expect(normalized.unit).toBe('201');
    });

    it('should prefer unit over room when both present', async () => {
      const normalized = await normalizeAddress(
        {
          country: 'JP',
          unit: '101',
          room: '201',
        },
        'JP'
      );
      expect(normalized.unit).toBe('101');
    });

    it('should normalize complete Japanese address', async () => {
      const rawAddress: AddressInput = {
        country: 'JP',
        province: '東京都',
        city: '渋谷区',
        district: '道玄坂',
        ward: '1丁目',
        building: '渋谷ヒカリエ',
        unit: '10F',
      };

      const normalized = await normalizeAddress(rawAddress, 'JP');
      
      expect(normalized.countryCode).toBe('JP');
      expect(normalized.admin1).toBe('13');
      expect(normalized.admin2).toBeDefined();
      expect(normalized.locality).toBe('道玄坂');
      expect(normalized.sublocality).toBe('1丁目');
      expect(normalized.building).toBe('渋谷ヒカリエ');
      expect(normalized.unit).toBe('10F');
    });

    it('should handle empty address', async () => {
      const normalized = await normalizeAddress({}, 'JP');
      expect(normalized.countryCode).toBe('JP');
    });

    it('should work without format parameter', async () => {
      const normalized = await normalizeAddress(
        { country: 'US', province: 'California' },
        'US'
      );
      expect(normalized.countryCode).toBe('US');
    });
  });

  describe('denormalizeAddress', () => {
    it('should denormalize basic normalized address', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        admin1: '13',
      };

      const denormalized = denormalizeAddress(normalized, 'JP');
      expect(denormalized.country).toBe('JP');
    });

    it('should denormalize locality to district', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        locality: '道玄坂',
      };

      const denormalized = denormalizeAddress(normalized, 'JP');
      expect(denormalized.district).toBe('道玄坂');
    });

    it('should denormalize sublocality to ward', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        sublocality: '1丁目',
      };

      const denormalized = denormalizeAddress(normalized, 'JP');
      expect(denormalized.ward).toBe('1丁目');
    });

    it('should denormalize building', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        building: '渋谷ヒカリエ',
      };

      const denormalized = denormalizeAddress(normalized, 'JP');
      expect(denormalized.building).toBe('渋谷ヒカリエ');
    });

    it('should denormalize unit', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        unit: '101',
      };

      const denormalized = denormalizeAddress(normalized, 'JP');
      expect(denormalized.unit).toBe('101');
    });

    it('should denormalize complete address', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        admin1: '13',
        admin2: '113',
        locality: '道玄坂',
        sublocality: '1丁目',
        building: '渋谷ヒカリエ',
        unit: '10F',
      };

      const denormalized = denormalizeAddress(normalized, 'JP');
      
      expect(denormalized.country).toBe('JP');
      expect(denormalized.district).toBe('道玄坂');
      expect(denormalized.ward).toBe('1丁目');
      expect(denormalized.building).toBe('渋谷ヒカリエ');
      expect(denormalized.unit).toBe('10F');
    });

    it('should accept language parameter', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
      };

      const denormalizedEn = denormalizeAddress(normalized, 'JP', 'en');
      expect(denormalizedEn.country).toBe('JP');

      const denormalizedJa = denormalizeAddress(normalized, 'JP', 'ja');
      expect(denormalizedJa.country).toBe('JP');
    });

    it('should use default language (en) when not specified', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'US',
      };

      const denormalized = denormalizeAddress(normalized, 'US');
      expect(denormalized.country).toBe('US');
    });

    it('should handle minimal normalized address', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'FR',
      };

      const denormalized = denormalizeAddress(normalized, 'FR');
      expect(denormalized.country).toBe('FR');
      expect(denormalized.district).toBeUndefined();
      expect(denormalized.ward).toBeUndefined();
    });
  });

  describe('validateNormalizedAddress', () => {
    it('should validate correct normalized address', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        admin1: '13',
      };

      const result = validateNormalizedAddress(normalized);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject address without country code', () => {
      const normalized = {} as NormalizedAddress;

      const result = validateNormalizedAddress(normalized);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Country code is required');
    });

    it('should reject invalid country code format', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'Japan',
      };

      const result = validateNormalizedAddress(normalized);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Country code must be 2 uppercase letters');
    });

    it('should reject lowercase country code', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'jp',
      };

      const result = validateNormalizedAddress(normalized);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Country code must be 2 uppercase letters');
    });

    it('should reject numeric country code', () => {
      const normalized: NormalizedAddress = {
        countryCode: '12',
      };

      const result = validateNormalizedAddress(normalized);
      expect(result.valid).toBe(false);
    });

    it('should validate various valid country codes', () => {
      const countryCodes = ['JP', 'US', 'GB', 'FR', 'DE', 'CN', 'KR'];

      for (const code of countryCodes) {
        const normalized: NormalizedAddress = {
          countryCode: code,
        };
        const result = validateNormalizedAddress(normalized);
        expect(result.valid).toBe(true);
      }
    });

    it('should accept normalized address with all fields', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        admin1: '13',
        admin2: '113',
        locality: '道玄坂',
        sublocality: '1丁目',
        building: '渋谷ヒカリエ',
        unit: '10F',
      };

      const result = validateNormalizedAddress(normalized);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('normalizedAddressToPIDComponents', () => {
    it('should convert normalized address to PID components', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        admin1: '13',
        admin2: '113',
      };

      const components = normalizedAddressToPIDComponents(normalized);
      
      expect(components.country).toBe('JP');
      expect(components.admin1).toBe('13');
      expect(components.admin2).toBe('113');
    });

    it('should handle minimal normalized address', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'US',
      };

      const components = normalizedAddressToPIDComponents(normalized);
      expect(components.country).toBe('US');
      expect(components.admin1).toBeUndefined();
    });

    it('should convert locality to locality code', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        locality: '道玄坂',
      };

      const components = normalizedAddressToPIDComponents(normalized);
      expect(components.locality).toBe('01');
    });

    it('should handle complete normalized address', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'JP',
        admin1: '13',
        admin2: '113',
        locality: '道玄坂',
        sublocality: '1丁目',
      };

      const components = normalizedAddressToPIDComponents(normalized);
      
      expect(components.country).toBe('JP');
      expect(components.admin1).toBe('13');
      expect(components.admin2).toBe('113');
      expect(components.locality).toBe('01');
    });

    it('should not include undefined fields', () => {
      const normalized: NormalizedAddress = {
        countryCode: 'FR',
      };

      const components = normalizedAddressToPIDComponents(normalized);
      expect(components.country).toBe('FR');
      expect(Object.keys(components)).toEqual(['country']);
    });
  });

  describe('integration: normalize and denormalize', () => {
    it('should round-trip address through normalize and denormalize', async () => {
      const original: AddressInput = {
        country: 'JP',
        district: '道玄坂',
        ward: '1丁目',
        building: '渋谷ヒカリエ',
        unit: '10F',
      };

      const normalized = await normalizeAddress(original, 'JP');
      const denormalized = denormalizeAddress(normalized, 'JP');

      expect(denormalized.country).toBe(original.country);
      expect(denormalized.district).toBe(original.district);
      expect(denormalized.ward).toBe(original.ward);
      expect(denormalized.building).toBe(original.building);
      expect(denormalized.unit).toBe(original.unit);
    });

    it('should validate then convert to PID', async () => {
      const rawAddress: AddressInput = {
        country: 'JP',
        province: '東京都',
        city: '渋谷区',
      };

      const normalized = await normalizeAddress(rawAddress, 'JP');
      const validation = validateNormalizedAddress(normalized);
      expect(validation.valid).toBe(true);

      const pidComponents = normalizedAddressToPIDComponents(normalized);
      expect(pidComponents.country).toBe('JP');
      expect(pidComponents.admin1).toBe('13');
    });
  });

  describe('edge cases', () => {
    it('should handle empty normalized address', () => {
      const normalized = {} as NormalizedAddress;
      const validation = validateNormalizedAddress(normalized);
      expect(validation.valid).toBe(false);
    });

    it('should handle normalization of different countries', async () => {
      const countries = ['JP', 'US', 'GB', 'FR', 'DE'];

      for (const country of countries) {
        const normalized = await normalizeAddress(
          { country },
          country
        );
        expect(normalized.countryCode).toBe(country);
      }
    });

    it('should handle special characters in address fields', async () => {
      const normalized = await normalizeAddress(
        {
          country: 'JP',
          district: '道玄坂1-2-3',
          building: 'ABC-ビル',
          unit: '10F-A',
        },
        'JP'
      );

      expect(normalized.locality).toBe('道玄坂1-2-3');
      expect(normalized.building).toBe('ABC-ビル');
      expect(normalized.unit).toBe('10F-A');
    });
  });
});
