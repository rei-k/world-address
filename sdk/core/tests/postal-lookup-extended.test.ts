/**
 * @vey/core - Tests for Extended Postal Code Lookup Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  lookupPostalCodeExtended,
  isExtendedLookupAvailable,
  getExtendedSupportedCountries,
  clearExtendedPostalCodeCache,
  getExtendedCacheStats,
  type ExtendedPostalLookupConfig,
} from '../src/postal-lookup-extended';
import type { PostalCodeLookupRequest } from '../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Extended Postal Code Lookup Service', () => {
  beforeEach(() => {
    clearExtendedPostalCodeCache();
    mockFetch.mockReset();
  });

  describe('lookupPostalCodeExtended - Postcode.io (UK)', () => {
    it('should lookup UK postal code successfully', async () => {
      const mockResponse = {
        status: 200,
        result: {
          postcode: 'SW1A 1AA',
          quality: 1,
          eastings: 529090,
          northings: 179645,
          country: 'England',
          nhs_ha: 'London',
          longitude: -0.127695,
          latitude: 51.501009,
          european_electoral_region: 'London',
          primary_care_trust: 'Westminster',
          region: 'London',
          lsoa: 'Westminster 018C',
          msoa: 'Westminster 018',
          incode: '1AA',
          outcode: 'SW1A',
          parliamentary_constituency: 'Cities of London and Westminster',
          admin_district: 'Westminster',
          parish: 'Westminster, unparished area',
          admin_county: null,
          admin_ward: "St James's",
          ced: null,
          ccg: 'NHS North West London',
          nuts: 'Westminster',
          codes: {
            admin_district: 'E09000033',
            admin_county: 'E99999999',
            admin_ward: 'E05013806',
            parish: 'E43000236',
            parliamentary_constituency: 'E14000639',
            ccg: 'E38000256',
            ccg_id: 'W2U3Z',
            ced: 'E99999999',
            nuts: 'TLI32',
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      };

      const result = await lookupPostalCodeExtended(req);

      expect(result).toMatchObject({
        postalCode: 'SW1A 1AA',
        countryCode: 'GB',
        countryName: 'United Kingdom',
        province: 'London',
        source: 'postcodeio',
        cached: false,
      });

      expect(result.coordinates).toMatchObject({
        latitude: 51.501009,
        longitude: -0.127695,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('api.postcodes.io'),
        expect.any(Object)
      );
    });

    it('should handle UK postal code not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'INVALID',
      };

      await expect(lookupPostalCodeExtended(req)).rejects.toThrow('not found');
    });
  });

  describe('lookupPostalCodeExtended - Dawa API (Denmark)', () => {
    it('should lookup Danish postal code successfully', async () => {
      const mockResponse = {
        href: 'https://dawa.aws.dk/postnumre/1050',
        nr: '1050',
        navn: 'København K',
        stormodtageradresser: null,
        bbox: [12.56635524, 55.67594158, 12.59364476, 55.68405842],
        visueltcenter: [12.58, 55.68],
        kommuner: [
          {
            href: 'https://dawa.aws.dk/kommuner/0101',
            kode: '0101',
            navn: 'København',
          },
        ],
        ændret: '2023-01-01T00:00:00.000Z',
        geo_version: 3,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'DK',
        postalCode: '1050',
      };

      const result = await lookupPostalCodeExtended(req);

      expect(result).toMatchObject({
        postalCode: '1050',
        countryCode: 'DK',
        countryName: 'Denmark',
        city: 'København K',
        source: 'dawa',
        cached: false,
      });

      expect(result.coordinates).toMatchObject({
        latitude: 55.68,
        longitude: 12.58,
      });
    });
  });

  describe('lookupPostalCodeExtended - Zipcodebase', () => {
    it('should lookup postal code with Zipcodebase API', async () => {
      const mockResponse = {
        query: {
          codes: ['100000'],
          country: 'CN',
        },
        results: {
          '100000': [
            {
              postal_code: '100000',
              country_code: 'CN',
              latitude: '39.9042',
              longitude: '116.4074',
              city: 'Beijing',
              state: 'Beijing',
              state_code: 'BJ',
              province: 'Beijing',
              province_code: 'BJ',
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'CN',
        postalCode: '100000',
      };

      const config: ExtendedPostalLookupConfig = {
        zipcodebaseApiKey: 'test-api-key',
      };

      const result = await lookupPostalCodeExtended(req, config);

      expect(result).toMatchObject({
        postalCode: '100000',
        countryCode: 'CN',
        city: 'Beijing',
        province: 'Beijing',
        provinceCode: 'BJ',
        source: 'zipcodebase',
        cached: false,
      });

      expect(result.coordinates).toMatchObject({
        latitude: 39.9042,
        longitude: 116.4074,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('zipcodebase.com'),
        expect.objectContaining({
          headers: expect.objectContaining({
            apikey: 'test-api-key',
          }),
        })
      );
    });

    it('should throw error if Zipcodebase API key not provided', async () => {
      const req: PostalCodeLookupRequest = {
        countryCode: 'CN',
        postalCode: '100000',
      };

      // No API key in config - should fail for non-free countries
      await expect(
        lookupPostalCodeExtended(req, {})
      ).rejects.toThrow();
    });

    it('should handle Zipcodebase rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'CN',
        postalCode: '100000',
      };

      const config: ExtendedPostalLookupConfig = {
        zipcodebaseApiKey: 'test-api-key',
      };

      await expect(lookupPostalCodeExtended(req, config)).rejects.toThrow(
        'rate limit'
      );
    });
  });

  describe('Caching', () => {
    it('should cache successful lookups', async () => {
      const mockResponse = {
        status: 200,
        result: {
          postcode: 'SW1A 1AA',
          latitude: 51.501009,
          longitude: -0.127695,
          region: 'London',
          admin_ward: "St James's",
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      };

      // First call
      const result1 = await lookupPostalCodeExtended(req);
      expect(result1.cached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await lookupPostalCodeExtended(req);
      expect(result2.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional call

      expect(result1.city).toBe(result2.city);
    });

    it('should normalize cache key (case and spaces)', async () => {
      const mockResponse = {
        status: 200,
        result: {
          postcode: 'SW1A1AA',
          latitude: 51.501009,
          longitude: -0.127695,
          region: 'London',
          admin_ward: "St James's",
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // First call
      await lookupPostalCodeExtended({
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      });

      // Second call with different formatting
      const result = await lookupPostalCodeExtended({
        countryCode: 'gb', // lowercase
        postalCode: 'SW1A1AA', // no space
      });

      expect(result.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should provide cache statistics', async () => {
      clearExtendedPostalCodeCache();

      const mockResponse = {
        status: 200,
        result: {
          postcode: 'SW1A 1AA',
          latitude: 51.501009,
          longitude: -0.127695,
          region: 'London',
          admin_ward: "St James's",
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await lookupPostalCodeExtended({ countryCode: 'GB', postalCode: 'SW1A 1AA' });
      await lookupPostalCodeExtended({ countryCode: 'GB', postalCode: 'EC1A 1BB' });

      const stats = getExtendedCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.entries).toContain('GB:SW1A1AA');
      expect(stats.entries).toContain('GB:EC1A1BB');
    });
  });

  describe('isExtendedLookupAvailable', () => {
    it('should return true for UK (Postcode.io)', () => {
      expect(isExtendedLookupAvailable('GB')).toBe(true);
    });

    it('should return true for Denmark (Dawa)', () => {
      expect(isExtendedLookupAvailable('DK')).toBe(true);
    });

    it('should return true for France (OpenDataSoft)', () => {
      expect(isExtendedLookupAvailable('FR')).toBe(true);
    });

    it('should return true for any country with Zipcodebase API key', () => {
      const config: ExtendedPostalLookupConfig = {
        zipcodebaseApiKey: 'test-key',
      };

      expect(isExtendedLookupAvailable('CN', config)).toBe(true);
      expect(isExtendedLookupAvailable('BR', config)).toBe(true);
    });

    it('should return false for unsupported country without config', () => {
      expect(isExtendedLookupAvailable('XY')).toBe(false);
    });

    it('should return true with local fallback enabled', () => {
      const config: ExtendedPostalLookupConfig = {
        enableLocalFallback: true,
      };

      expect(isExtendedLookupAvailable('XY', config)).toBe(true);
    });
  });

  describe('getExtendedSupportedCountries', () => {
    it('should return list of supported countries', () => {
      const countries = getExtendedSupportedCountries();

      expect(countries).toContain('GB'); // Postcode.io
      expect(countries).toContain('DK'); // Dawa
      expect(countries).toContain('FR'); // OpenDataSoft
      expect(countries).toContain('ES'); // OpenDataSoft
      expect(countries.length).toBeGreaterThan(5);
    });

    it('should return sorted list', () => {
      const countries = getExtendedSupportedCountries();
      const sorted = [...countries].sort();
      expect(countries).toEqual(sorted);
    });
  });

  describe('Input validation', () => {
    it('should throw error for missing country code', async () => {
      const req: PostalCodeLookupRequest = {
        countryCode: '',
        postalCode: 'SW1A 1AA',
      };

      await expect(lookupPostalCodeExtended(req)).rejects.toThrow('required');
    });

    it('should throw error for missing postal code', async () => {
      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: '',
      };

      await expect(lookupPostalCodeExtended(req)).rejects.toThrow('required');
    });
  });

  describe('Error handling', () => {
    it('should collect errors from all attempted services', async () => {
      // Mock all services to fail
      mockFetch.mockRejectedValue(new Error('Network error'));

      const req: PostalCodeLookupRequest = {
        countryCode: 'GB',
        postalCode: 'SW1A 1AA',
      };

      await expect(lookupPostalCodeExtended(req)).rejects.toThrow();
    });
  });
});
