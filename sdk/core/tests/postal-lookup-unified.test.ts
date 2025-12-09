/**
 * @vey/core - Tests for Unified Postal Code Lookup Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  lookupPostalCodeUnified,
  isUnifiedLookupAvailable,
  getAllSupportedCountries,
  getAvailableSources,
  getRecommendedConfig,
  type UnifiedPostalLookupConfig,
} from '../src/postal-lookup-unified';
import type { PostalCodeLookupRequest } from '../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Unified Postal Code Lookup Service', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('lookupPostalCodeUnified - Strategy: auto', () => {
    it('should use Zippopotam for supported countries', async () => {
      const mockResponse = {
        'post code': '90210',
        'country': 'United States',
        'country abbreviation': 'US',
        'places': [
          {
            'place name': 'Beverly Hills',
            'longitude': '-118.4065',
            'state': 'California',
            'state abbreviation': 'CA',
            'latitude': '34.0901',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '90210',
      };

      const result = await lookupPostalCodeUnified(req);

      expect(result).toMatchObject({
        postalCode: '90210',
        countryCode: 'US',
        city: 'Beverly Hills',
        province: 'California',
        source: 'zippopotam',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('zippopotam.us'),
        expect.any(Object)
      );
    });

    it('should fallback to extended sources when Zippopotam fails', async () => {
      // Zippopotam fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // Postcode.io succeeds
      const postcodeResponse = {
        status: 200,
        result: {
          postcode: 'SW1A 1AA',
          latitude: 51.501009,
          longitude: -0.127695,
          region: 'London',
          admin_ward: "St James's",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => postcodeResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      };

      const result = await lookupPostalCodeUnified(req);

      expect(result.source).toBe('postcodeio');
      expect(result.city).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2); // Zippopotam + Postcode.io
    });

    it('should use extended sources for non-Zippopotam countries', async () => {
      const dawaResponse = {
        nr: '1050',
        navn: 'København K',
        visueltcenter: [12.58, 55.68],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => dawaResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'DK',
        postalCode: '1050',
      };

      const result = await lookupPostalCodeUnified(req);

      expect(result.source).toBe('dawa');
      expect(result.city).toBe('København K');
    });
  });

  describe('lookupPostalCodeUnified - Strategy: extended-first', () => {
    it('should try extended sources before Zippopotam', async () => {
      const postcodeResponse = {
        status: 200,
        result: {
          postcode: 'SW1A 1AA',
          latitude: 51.501009,
          longitude: -0.127695,
          region: 'London',
          admin_ward: "St James's",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => postcodeResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      };

      const config: UnifiedPostalLookupConfig = {
        strategy: 'extended-first',
      };

      const result = await lookupPostalCodeUnified(req, config);

      expect(result.source).toBe('postcodeio');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('postcodes.io'),
        expect.any(Object)
      );
    });

    it('should fallback to Zippopotam if extended fails', async () => {
      // Postcode.io fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Zippopotam succeeds
      const zippoResponse = {
        'post code': 'SW1A 1AA',
        'country': 'United Kingdom',
        'country abbreviation': 'GB',
        'places': [
          {
            'place name': 'London',
            'longitude': '-0.127695',
            'state': 'England',
            'state abbreviation': 'ENG',
            'latitude': '51.501009',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => zippoResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      };

      const config: UnifiedPostalLookupConfig = {
        strategy: 'extended-first',
      };

      const result = await lookupPostalCodeUnified(req, config);

      expect(result.source).toBe('zippopotam');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('lookupPostalCodeUnified - Strategy: extended-only', () => {
    it('should only use extended sources', async () => {
      const postcodeResponse = {
        status: 200,
        result: {
          postcode: 'SW1A 1AA',
          latitude: 51.501009,
          longitude: -0.127695,
          region: 'London',
          admin_ward: "St James's",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => postcodeResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      };

      const config: UnifiedPostalLookupConfig = {
        strategy: 'extended-only',
      };

      const result = await lookupPostalCodeUnified(req, config);

      expect(result.source).toBe('postcodeio');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw if extended sources fail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'INVALID',
      };

      const config: UnifiedPostalLookupConfig = {
        strategy: 'extended-only',
      };

      await expect(lookupPostalCodeUnified(req, config)).rejects.toThrow(
        'Extended lookup failed'
      );
    });
  });

  describe('lookupPostalCodeUnified - Strategy: zippopotam-only', () => {
    it('should only use Zippopotam/GeoNames', async () => {
      const zippoResponse = {
        'post code': '90210',
        'country': 'United States',
        'country abbreviation': 'US',
        'places': [
          {
            'place name': 'Beverly Hills',
            'longitude': '-118.4065',
            'state': 'California',
            'state abbreviation': 'CA',
            'latitude': '34.0901',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => zippoResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '90210',
      };

      const config: UnifiedPostalLookupConfig = {
        strategy: 'zippopotam-only',
      };

      const result = await lookupPostalCodeUnified(req, config);

      expect(result.source).toBe('zippopotam');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('isUnifiedLookupAvailable', () => {
    it('should return true for Zippopotam countries', () => {
      expect(isUnifiedLookupAvailable('US')).toBe(true);
      expect(isUnifiedLookupAvailable('JP')).toBe(true);
    });

    it('should return true for extended source countries', () => {
      expect(isUnifiedLookupAvailable('GB')).toBe(true); // Postcode.io
      expect(isUnifiedLookupAvailable('DK')).toBe(true); // Dawa
    });

    it('should return true with API keys configured', () => {
      const config: UnifiedPostalLookupConfig = {
        geonamesUsername: 'test',
      };

      expect(isUnifiedLookupAvailable('XY', config)).toBe(true);
    });

    it('should return false for unsupported countries', () => {
      expect(isUnifiedLookupAvailable('XY')).toBe(false);
    });
  });

  describe('getAllSupportedCountries', () => {
    it('should return combined list of all supported countries', () => {
      const countries = getAllSupportedCountries();

      // Zippopotam countries
      expect(countries).toContain('US');
      expect(countries).toContain('JP');
      expect(countries).toContain('GB');

      // Extended source countries
      expect(countries).toContain('DK');
      expect(countries).toContain('FR');

      expect(countries.length).toBeGreaterThan(70);
    });

    it('should return sorted list without duplicates', () => {
      const countries = getAllSupportedCountries();
      const unique = [...new Set(countries)];
      const sorted = [...countries].sort();

      expect(countries).toEqual(unique); // No duplicates
      expect(countries).toEqual(sorted); // Sorted
    });
  });

  describe('getAvailableSources', () => {
    it('should return Zippopotam for US', () => {
      const sources = getAvailableSources('US');
      expect(sources).toContain('zippopotam');
    });

    it('should return Postcode.io for UK', () => {
      const sources = getAvailableSources('GB');
      expect(sources).toContain('zippopotam');
      expect(sources).toContain('postcodeio');
    });

    it('should return Dawa for Denmark', () => {
      const sources = getAvailableSources('DK');
      expect(sources).toContain('dawa');
    });

    it('should include GeoNames when configured', () => {
      const config: UnifiedPostalLookupConfig = {
        geonamesUsername: 'test',
      };

      const sources = getAvailableSources('US', config);
      expect(sources).toContain('geonames');
    });

    it('should include Zipcodebase when configured', () => {
      const config: UnifiedPostalLookupConfig = {
        zipcodebaseApiKey: 'test-key',
      };

      const sources = getAvailableSources('CN', config);
      expect(sources).toContain('zipcodebase');
    });

    it('should return empty array for unsupported country', () => {
      const sources = getAvailableSources('XY');
      expect(sources).toEqual([]);
    });
  });

  describe('getRecommendedConfig', () => {
    it('should return configuration recommendations', () => {
      const config = getRecommendedConfig();

      expect(config).toHaveProperty('freeNoKey');
      expect(config).toHaveProperty('freeWithRegistration');
      expect(config).toHaveProperty('freeLimited');
      expect(config).toHaveProperty('paid');

      expect(config.freeNoKey).toContain(
        expect.stringContaining('Zippopotam')
      );
      expect(config.freeWithRegistration).toContain(
        expect.stringContaining('GeoNames')
      );
      expect(config.freeLimited).toContain(
        expect.stringContaining('Zipcodebase')
      );
    });
  });

  describe('Fallback behavior', () => {
    it('should not fallback when disabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      };

      const config: UnifiedPostalLookupConfig = {
        enableFallback: false,
      };

      await expect(lookupPostalCodeUnified(req, config)).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error messages', () => {
    it('should provide helpful error for no available sources', async () => {
      const req: PostalCodeLookupRequest = {
        countryCode: 'XY',
        postalCode: '12345',
      };

      await expect(lookupPostalCodeUnified(req)).rejects.toThrow(
        'No postal code lookup sources available'
      );
    });
  });
});
