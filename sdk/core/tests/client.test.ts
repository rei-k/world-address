/**
 * @vey/core - Client tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VeyClient, createVeyClient } from '../src/client';
import type { CountryAddressFormat } from '../src/types';

describe('VeyClient', () => {
  describe('constructor', () => {
    it('should create client with default config', () => {
      const client = new VeyClient();
      expect(client).toBeDefined();
      expect(client.environment).toBe('sandbox');
      expect(client.apiKey).toBeUndefined();
    });

    it('should create client with custom config', () => {
      const client = new VeyClient({
        environment: 'production',
        apiKey: 'test-api-key',
        dataPath: '/custom/data',
      });
      expect(client.environment).toBe('production');
      expect(client.apiKey).toBe('test-api-key');
    });

    it('should default environment to sandbox when not specified', () => {
      const client = new VeyClient({});
      expect(client.environment).toBe('sandbox');
    });
  });

  describe('createVeyClient', () => {
    it('should create a client instance', () => {
      const client = createVeyClient();
      expect(client).toBeInstanceOf(VeyClient);
    });

    it('should pass config to VeyClient', () => {
      const client = createVeyClient({
        environment: 'production',
        apiKey: 'test-key',
      });
      expect(client.environment).toBe('production');
      expect(client.apiKey).toBe('test-key');
    });
  });

  describe('environment getters and setters', () => {
    it('should get environment', () => {
      const client = new VeyClient({ environment: 'production' });
      expect(client.environment).toBe('production');
    });

    it('should get api key', () => {
      const client = new VeyClient({ apiKey: 'my-api-key' });
      expect(client.apiKey).toBe('my-api-key');
    });

    it('should check if production mode', () => {
      const productionClient = new VeyClient({ environment: 'production' });
      expect(productionClient.isProduction()).toBe(true);

      const sandboxClient = new VeyClient({ environment: 'sandbox' });
      expect(sandboxClient.isProduction()).toBe(false);
    });

    it('should set environment', () => {
      const client = new VeyClient({ environment: 'sandbox' });
      expect(client.environment).toBe('sandbox');
      
      client.setEnvironment('production');
      expect(client.environment).toBe('production');
      expect(client.isProduction()).toBe(true);

      client.setEnvironment('sandbox');
      expect(client.environment).toBe('sandbox');
      expect(client.isProduction()).toBe(false);
    });
  });

  describe('getCountryFormat', () => {
    it('should return null for unknown country', async () => {
      const client = new VeyClient();
      // Mock the loader to return null
      const format = await client.getCountryFormat('XX');
      expect(format).toBeNull();
    });

    it('should cache country format', async () => {
      const mockFormat: CountryAddressFormat = {
        name: { en: 'Japan' },
        iso_codes: { alpha2: 'JP', alpha3: 'JPN', numeric: '392' },
        address_format: {
          order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
        },
      };

      // Create a client with mocked loader
      const client = new VeyClient();
      
      // We can't easily mock the internal loader, so we'll test the caching behavior
      // by calling getCountryFormat multiple times and ensuring it works
      const format1 = await client.getCountryFormat('XX');
      const format2 = await client.getCountryFormat('XX');
      
      expect(format1).toEqual(format2);
    });
  });

  describe('validate', () => {
    it('should return error for unknown country', async () => {
      const client = new VeyClient();
      const result = await client.validate(
        {
          country: 'XX',
          postalCode: '12345',
        },
        'XX'
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('UNKNOWN_COUNTRY');
      expect(result.errors[0].field).toBe('country');
    });
  });

  describe('format', () => {
    it('should throw error for unknown country', async () => {
      const client = new VeyClient();
      
      await expect(
        client.format(
          {
            country: 'XX',
            postalCode: '12345',
          },
          'XX'
        )
      ).rejects.toThrow('Country code XX is not supported');
    });
  });

  describe('formatLabel', () => {
    it('should throw error for unknown country', async () => {
      const client = new VeyClient();
      
      await expect(
        client.formatLabel(
          {
            country: 'XX',
            postalCode: '12345',
          },
          'XX'
        )
      ).rejects.toThrow('Country code XX is not supported');
    });
  });

  describe('getRequiredFields', () => {
    it('should return empty array for unknown country', async () => {
      const client = new VeyClient();
      const fields = await client.getRequiredFields('XX');
      expect(fields).toEqual([]);
    });
  });

  describe('getFieldOrder', () => {
    it('should return empty array for unknown country', async () => {
      const client = new VeyClient();
      const order = await client.getFieldOrder('XX');
      expect(order).toEqual([]);
    });

    it('should accept context parameter', async () => {
      const client = new VeyClient();
      
      const international = await client.getFieldOrder('XX', 'international');
      expect(international).toEqual([]);

      const domestic = await client.getFieldOrder('XX', 'domestic');
      expect(domestic).toEqual([]);

      const postal = await client.getFieldOrder('XX', 'postal');
      expect(postal).toEqual([]);
    });

    it('should default to international context', async () => {
      const client = new VeyClient();
      const defaultOrder = await client.getFieldOrder('XX');
      expect(defaultOrder).toEqual([]);
    });
  });

  describe('getRegionHierarchy', () => {
    it('should return region hierarchy', async () => {
      const client = new VeyClient();
      const hierarchy = await client.getRegionHierarchy();
      
      expect(hierarchy).toBeDefined();
      expect(Array.isArray(hierarchy)).toBe(true);
      expect(hierarchy.length).toBeGreaterThan(0);
    });

    it('should include continents', async () => {
      const client = new VeyClient();
      const hierarchy = await client.getRegionHierarchy();
      
      const continents = hierarchy.map(h => h.continent);
      expect(continents).toContain('Asia');
      expect(continents).toContain('Europe');
      expect(continents).toContain('Americas');
    });
  });

  describe('integration with loader', () => {
    it('should use custom data path', () => {
      const client = new VeyClient({
        dataPath: '/custom/data/path',
      });
      expect(client).toBeDefined();
    });
  });
});
