/**
 * VeyExpress SDK Core Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VeyExpressSDK, createVeyExpress } from '../../src/sdk';

describe('VeyExpressSDK', () => {
  describe('Initialization', () => {
    it('should initialize with API key', () => {
      const sdk = new VeyExpressSDK('test-api-key');
      expect(sdk).toBeDefined();
    });

    it('should default to sandbox environment', () => {
      const sdk = new VeyExpressSDK('test-api-key');
      expect(sdk['config'].environment).toBe('sandbox');
    });

    it('should allow production environment', () => {
      const sdk = new VeyExpressSDK('test-api-key', { environment: 'production' });
      expect(sdk['config'].environment).toBe('production');
    });
  });

  describe('createVeyExpress helper', () => {
    it('should create SDK instance', () => {
      const sdk = createVeyExpress('test-api-key');
      expect(sdk).toBeInstanceOf(VeyExpressSDK);
    });

    it('should pass environment option', () => {
      const sdk = createVeyExpress('test-api-key', 'production');
      expect(sdk['config'].environment).toBe('production');
    });
  });

  describe('Address Validation', () => {
    let sdk: VeyExpressSDK;

    beforeEach(() => {
      sdk = new VeyExpressSDK('test-api-key');
    });

    it('should validate complete address', async () => {
      const result = await sdk.validateAddress({
        country: 'US',
        addressLine1: '1600 Pennsylvania Ave',
        locality: 'Washington',
        administrativeArea: 'DC',
        postalCode: '20500',
        recipient: 'John Doe',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required fields', async () => {
      const result = await sdk.validateAddress({
        country: 'US',
        addressLine1: '',
        recipient: '',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should normalize address', async () => {
      const result = await sdk.validateAddress({
        country: 'JP',
        addressLine1: '東京都渋谷区神南1-2-3',
        recipient: '山田太郎',
      });

      expect(result.valid).toBe(true);
      if (result.normalized) {
        expect(result.normalized.country).toBe('JP');
      }
    });
  });

  describe('Supported Countries', () => {
    let sdk: VeyExpressSDK;

    beforeEach(() => {
      sdk = new VeyExpressSDK('test-api-key');
    });

    it('should return list of supported countries', () => {
      const countries = sdk.getSupportedCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should include major countries', () => {
      const countries = sdk.getSupportedCountries();
      expect(countries).toContain('US');
      expect(countries).toContain('JP');
      expect(countries).toContain('CN');
      expect(countries).toContain('GB');
      expect(countries).toContain('DE');
    });
  });

  describe('Connection Test', () => {
    let sdk: VeyExpressSDK;

    beforeEach(() => {
      sdk = new VeyExpressSDK('test-api-key');
    });

    it('should test connection successfully', async () => {
      const result = await sdk.testConnection();
      expect(typeof result).toBe('boolean');
    });
  });
});
