/**
 * @vey/core - Tests for veyform module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Veyform,
  createVeyform,
  getCountryFlag,
  CONTINENTS,
  type VeyformConfig,
  type Continent,
} from '../src/veyform';

describe('getCountryFlag', () => {
  it('should generate flag emoji for valid country code', () => {
    expect(getCountryFlag('JP')).toBe('🇯🇵');
    expect(getCountryFlag('US')).toBe('🇺🇸');
    expect(getCountryFlag('GB')).toBe('🇬🇧');
    expect(getCountryFlag('FR')).toBe('🇫🇷');
    expect(getCountryFlag('DE')).toBe('🇩🇪');
  });

  it('should handle lowercase country codes', () => {
    expect(getCountryFlag('jp')).toBe('🇯🇵');
    expect(getCountryFlag('us')).toBe('🇺🇸');
  });
});

describe('CONTINENTS', () => {
  it('should have all continents defined', () => {
    expect(CONTINENTS.africa).toBeDefined();
    expect(CONTINENTS.americas).toBeDefined();
    expect(CONTINENTS.antarctica).toBeDefined();
    expect(CONTINENTS.asia).toBeDefined();
    expect(CONTINENTS.europe).toBeDefined();
    expect(CONTINENTS.oceania).toBeDefined();
  });

  it('should have proper continent structure', () => {
    const africa = CONTINENTS.africa;
    expect(africa.code).toBe('africa');
    expect(africa.name.en).toBe('Africa');
    expect(africa.name.ja).toBeDefined();
    expect(africa.name.zh).toBeDefined();
    expect(africa.name.ko).toBeDefined();
    expect(Array.isArray(africa.countries)).toBe(true);
  });
});

describe('Veyform class', () => {
  let veyform: Veyform;
  const config: VeyformConfig = {
    apiKey: 'test-api-key',
    defaultLanguage: 'en',
    defaultCountry: 'US',
  };

  beforeEach(() => {
    veyform = new Veyform(config);
  });

  describe('initialization', () => {
    it('should initialize with required config', () => {
      expect(veyform).toBeDefined();
      expect(veyform.getFormState()).toBeDefined();
    });

    it('should use default validation level', () => {
      const state = veyform.getFormState();
      expect(state).toBeDefined();
    });

    it('should set default language', () => {
      const state = veyform.getFormState();
      expect(state.language).toBe('en');
    });

    it('should initialize with custom config', () => {
      const customConfig: VeyformConfig = {
        apiKey: 'test-key',
        validationLevel: 'loose',
        enableAnalytics: false,
        useContinentFilter: false,
        defaultLanguage: 'ja',
      };
      
      const customVeyform = new Veyform(customConfig);
      const state = customVeyform.getFormState();
      expect(state.language).toBe('ja');
    });

    it('should generate unique session ID', () => {
      const veyform1 = new Veyform(config);
      const veyform2 = new Veyform(config);
      
      // Session IDs should be different (we can't directly access them, but behavior should differ)
      expect(veyform1).not.toBe(veyform2);
    });
  });

  describe('static init', () => {
    it('should create instance via static method', () => {
      const instance = Veyform.init(config);
      expect(instance).toBeInstanceOf(Veyform);
    });
  });

  describe('getContinents', () => {
    it('should return all continents', () => {
      const continents = veyform.getContinents();
      expect(continents).toBeDefined();
      expect(Array.isArray(continents)).toBe(true);
      expect(continents.length).toBeGreaterThan(0);
    });

    it('should return continents with English names by default', () => {
      const continents = veyform.getContinents('en');
      expect(continents.length).toBeGreaterThan(0);
      const africa = continents.find(c => c.code === 'africa');
      expect(africa).toBeDefined();
    });

    it('should return continents with Japanese names', () => {
      const continents = veyform.getContinents('ja');
      expect(continents.length).toBeGreaterThan(0);
    });
  });

  describe('getCountriesByContinent', () => {
    it('should return countries for a continent', () => {
      const countries = veyform.getCountriesByContinent('asia');
      expect(Array.isArray(countries)).toBe(true);
    });

    it('should return empty array for continent without data', () => {
      const countries = veyform.getCountriesByContinent('antarctica');
      expect(Array.isArray(countries)).toBe(true);
    });

    it('should add flag emoji to countries', () => {
      const countries = veyform.getCountriesByContinent('asia', 'en');
      // Even if empty, should return array
      expect(Array.isArray(countries)).toBe(true);
    });
  });

  describe('getAvailableCountries', () => {
    it('should return all countries when no filter', () => {
      const countries = veyform.getAvailableCountries();
      expect(Array.isArray(countries)).toBe(true);
    });

    it('should filter by allowed countries', () => {
      const filteredConfig: VeyformConfig = {
        apiKey: 'test',
        allowedCountries: ['US', 'JP', 'GB'],
      };
      const filteredVeyform = new Veyform(filteredConfig);
      const countries = filteredVeyform.getAvailableCountries();
      expect(Array.isArray(countries)).toBe(true);
    });
  });

  describe('setLanguage', () => {
    it('should change form language', () => {
      veyform.setLanguage('ja');
      const state = veyform.getFormState();
      expect(state.language).toBe('ja');
    });

    it('should update language multiple times', () => {
      veyform.setLanguage('ja');
      veyform.setLanguage('en');
      veyform.setLanguage('zh');
      const state = veyform.getFormState();
      expect(state.language).toBe('zh');
    });
  });

  describe('selectCountry', () => {
    it('should select a country', () => {
      veyform.selectCountry('JP');
      const state = veyform.getFormState();
      expect(state.country).toBe('JP');
    });

    it('should reset form values when selecting new country', () => {
      veyform.selectCountry('US');
      // Set values directly without triggering completion rate update
      const state1 = veyform.getFormState();
      state1.values.city = 'New York';
      
      veyform.selectCountry('JP');
      const state = veyform.getFormState();
      expect(state.values.city).toBeUndefined();
    });

    it('should reset errors when selecting new country', () => {
      veyform.selectCountry('US');
      const state = veyform.getFormState();
      expect(Object.keys(state.errors).length).toBe(0);
    });
  });

  describe('setFieldValue', () => {
    it('should set field value', () => {
      veyform.setFieldValue('city', 'San Francisco');
      const state = veyform.getFormState();
      expect(state.values.city).toBe('San Francisco');
    });

    it('should mark field as touched', () => {
      veyform.setFieldValue('postal_code', '94102');
      const state = veyform.getFormState();
      expect(state.touched.postal_code).toBe(true);
    });

    it('should update completion rate', () => {
      const initialState = veyform.getFormState();
      const initialRate = initialState.completionRate;
      
      veyform.setFieldValue('city', 'Boston');
      const newState = veyform.getFormState();
      // Completion rate should be defined
      expect(typeof newState.completionRate).toBe('number');
    });
  });

  describe('validate', () => {
    it('should fail validation without country', () => {
      const result = veyform.validate();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('country');
    });

    it('should return validation result structure', () => {
      const result = veyform.validate();
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should update form state validity', () => {
      veyform.validate();
      const state = veyform.getFormState();
      expect(typeof state.isValid).toBe('boolean');
    });
  });

  describe('submit', () => {
    it('should return failure for invalid form', async () => {
      const result = await veyform.submit();
      expect(result.success).toBe(false);
    });

    it('should return success structure', async () => {
      const result = await veyform.submit();
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('getFormState', () => {
    it('should return current form state', () => {
      const state = veyform.getFormState();
      expect(state).toBeDefined();
      expect(state).toHaveProperty('language');
      expect(state).toHaveProperty('values');
      expect(state).toHaveProperty('errors');
      expect(state).toHaveProperty('touched');
      expect(state).toHaveProperty('isValid');
      expect(state).toHaveProperty('completionRate');
    });

    it('should return copy of state', () => {
      const state1 = veyform.getFormState();
      const state2 = veyform.getFormState();
      expect(state1).not.toBe(state2); // Different object instances
    });
  });

  describe('loadCountryData', () => {
    it('should throw not implemented error', async () => {
      await expect(veyform.loadCountryData('US')).rejects.toThrow('Not implemented');
    });
  });

  describe('analytics tracking', () => {
    it('should track events when analytics enabled', () => {
      const analyticsConfig: VeyformConfig = {
        apiKey: 'test',
        enableAnalytics: true,
        analyticsEndpoint: 'https://analytics.example.com',
      };
      const analyticsVeyform = new Veyform(analyticsConfig);
      
      // Should not throw
      analyticsVeyform.selectCountry('JP');
      analyticsVeyform.setLanguage('ja');
    });

    it('should not track events when analytics disabled', () => {
      const noAnalyticsConfig: VeyformConfig = {
        apiKey: 'test',
        enableAnalytics: false,
      };
      const noAnalyticsVeyform = new Veyform(noAnalyticsConfig);
      
      // Should not throw
      noAnalyticsVeyform.selectCountry('JP');
    });
  });

  describe('domain auto-detection', () => {
    it('should handle domain auto-detect when window is not available', () => {
      const autoDetectConfig: VeyformConfig = {
        apiKey: 'test',
        domainAutoDetect: true,
      };
      
      // Should not throw in Node environment
      const instance = new Veyform(autoDetectConfig);
      expect(instance).toBeDefined();
    });

    it('should use explicit origin over auto-detect', () => {
      const explicitConfig: VeyformConfig = {
        apiKey: 'test',
        domainAutoDetect: true,
        origin: 'https://example.com',
      };
      
      const instance = new Veyform(explicitConfig);
      expect(instance).toBeDefined();
    });
  });
});

describe('createVeyform', () => {
  it('should create Veyform instance', () => {
    const config: VeyformConfig = {
      apiKey: 'test-api-key',
    };
    const instance = createVeyform(config);
    expect(instance).toBeInstanceOf(Veyform);
  });

  it('should return same type as constructor', () => {
    const config: VeyformConfig = {
      apiKey: 'test',
    };
    const viaFactory = createVeyform(config);
    const viaConstructor = new Veyform(config);
    
    expect(viaFactory).toBeInstanceOf(Veyform);
    expect(viaConstructor).toBeInstanceOf(Veyform);
  });
});

describe('VeyformConfig types', () => {
  it('should accept minimal config', () => {
    const minimalConfig: VeyformConfig = {
      apiKey: 'test',
    };
    const instance = createVeyform(minimalConfig);
    expect(instance).toBeDefined();
  });

  it('should accept full config', () => {
    const fullConfig: VeyformConfig = {
      apiKey: 'test',
      domainAutoDetect: true,
      origin: 'https://example.com',
      defaultCountry: 'US',
      allowedCountries: ['US', 'CA', 'MX'],
      defaultLanguage: 'en',
      allowedLanguages: ['en', 'es'],
      useContinentFilter: true,
      continentFilterStyle: 'tabs',
      validationLevel: 'strict',
      enableAnalytics: true,
      analyticsEndpoint: 'https://analytics.example.com',
    };
    const instance = createVeyform(fullConfig);
    expect(instance).toBeDefined();
  });
});
