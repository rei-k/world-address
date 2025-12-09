/**
 * @vey/core - Tests for Postal Code Lookup Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  lookupPostalCode,
  autoFillAddress,
  isPostalCodeLookupAvailable,
  getSupportedCountries,
  clearPostalCodeCache,
  getPostalCodeCacheStats,
} from '../src/postal-lookup';
import type {
  PostalCodeLookupRequest,
  PostalCodeLookupConfig,
  AddressInput,
} from '../src/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Postal Code Lookup Service', () => {
  beforeEach(() => {
    clearPostalCodeCache();
    mockFetch.mockReset();
  });

  describe('lookupPostalCode - Zippopotam.us', () => {
    it('should lookup US postal code successfully', async () => {
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

      const config: PostalCodeLookupConfig = {
        preferredService: 'zippopotam',
      };

      const result = await lookupPostalCode(req, config);

      expect(result).toMatchObject({
        postalCode: '90210',
        countryCode: 'US',
        countryName: 'United States',
        city: 'Beverly Hills',
        province: 'California',
        provinceCode: 'CA',
        source: 'zippopotam',
        cached: false,
      });

      expect(result.coordinates).toMatchObject({
        latitude: 34.0901,
        longitude: -118.4065,
      });
    });

    it('should lookup Japanese postal code successfully', async () => {
      const mockResponse = {
        'post code': '100-0001',
        'country': 'Japan',
        'country abbreviation': 'JP',
        'places': [
          {
            'place name': 'Chiyoda',
            'longitude': '139.7671',
            'state': 'Tokyo',
            'state abbreviation': 'Tokyo',
            'latitude': '35.6812',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'JP',
        postalCode: '100-0001',
      };

      const result = await lookupPostalCode(req);

      expect(result.postalCode).toBe('100-0001');
      expect(result.countryCode).toBe('JP');
      expect(result.city).toBe('Chiyoda');
      expect(result.province).toBe('Tokyo');
    });

    it('should handle postal code not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '00000',
      };

      await expect(lookupPostalCode(req)).rejects.toThrow('not found');
    });

    it('should normalize postal code (remove spaces)', async () => {
      const mockResponse = {
        'post code': '100-0001',
        'country': 'Japan',
        'country abbreviation': 'JP',
        'places': [
          {
            'place name': 'Chiyoda',
            'longitude': '139.7671',
            'state': 'Tokyo',
            'state abbreviation': 'Tokyo',
            'latitude': '35.6812',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'JP',
        postalCode: '100 0001', // With space
      };

      const result = await lookupPostalCode(req);
      
      // Should remove spaces and call API
      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.zippopotam.us/JP/1000001',
        expect.any(Object)
      );
    });
  });

  describe('lookupPostalCode - GeoNames', () => {
    it('should lookup postal code with GeoNames', async () => {
      const mockResponse = {
        postalCodes: [
          {
            postalCode: '10001',
            countryCode: 'US',
            placeName: 'New York',
            adminName1: 'New York',
            adminCode1: 'NY',
            adminName2: 'New York County',
            lat: '40.7506',
            lng: '-73.9971',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '10001',
      };

      const config: PostalCodeLookupConfig = {
        preferredService: 'geonames',
        geonamesUsername: 'test_user',
      };

      const result = await lookupPostalCode(req, config);

      expect(result).toMatchObject({
        postalCode: '10001',
        countryCode: 'US',
        city: 'New York',
        province: 'New York',
        provinceCode: 'NY',
        district: 'New York County',
        source: 'geonames',
      });
    });

    it('should throw error if GeoNames username not provided', async () => {
      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '10001',
      };

      const config: PostalCodeLookupConfig = {
        preferredService: 'geonames',
        // Missing geonamesUsername
      };

      await expect(lookupPostalCode(req, config)).rejects.toThrow('username is required');
    });
  });

  describe('Caching', () => {
    it('should cache successful lookups', async () => {
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '90210',
      };

      // First call - should hit API
      const result1 = await lookupPostalCode(req);
      expect(result1.cached).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await lookupPostalCode(req);
      expect(result2.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // No additional call

      expect(result1.city).toBe(result2.city);
    });

    it('should normalize cache key (case and spaces)', async () => {
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // First call with normal format
      await lookupPostalCode({
        countryCode: 'US',
        postalCode: '90210',
      });

      // Second call with different formatting - should use cache
      const result = await lookupPostalCode({
        countryCode: 'us', // lowercase
        postalCode: '902 10', // with space
      });

      expect(result.cached).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should provide cache statistics', async () => {
      clearPostalCodeCache();
      
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

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await lookupPostalCode({ countryCode: 'US', postalCode: '90210' });
      await lookupPostalCode({ countryCode: 'US', postalCode: '10001' });

      const stats = getPostalCodeCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.entries).toContain('US:90210');
      expect(stats.entries).toContain('US:10001');
    });
  });

  describe('Fallback mechanism', () => {
    it('should fallback to GeoNames when Zippopotam fails', async () => {
      // Zippopotam fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // GeoNames succeeds
      const geonamesResponse = {
        postalCodes: [
          {
            postalCode: '10001',
            countryCode: 'US',
            placeName: 'New York',
            adminName1: 'New York',
            adminCode1: 'NY',
            lat: '40.7506',
            lng: '-73.9971',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => geonamesResponse,
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '10001',
      };

      const config: PostalCodeLookupConfig = {
        preferredService: 'zippopotam',
        geonamesUsername: 'test_user',
        enableFallback: true,
      };

      const result = await lookupPostalCode(req, config);

      expect(result.source).toBe('geonames');
      expect(result.city).toBe('New York');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not fallback when disabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '10001',
      };

      const config: PostalCodeLookupConfig = {
        preferredService: 'zippopotam',
        enableFallback: false,
      };

      await expect(lookupPostalCode(req, config)).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only one call
    });
  });

  describe('autoFillAddress', () => {
    it('should auto-fill address fields from lookup result', () => {
      const address: AddressInput = {
        country: 'US',
        postal_code: '90210',
        street_address: '123 Main St',
      };

      const lookupResult = {
        postalCode: '90210',
        countryCode: 'US',
        countryName: 'United States',
        city: 'Beverly Hills',
        province: 'California',
        provinceCode: 'CA',
        source: 'zippopotam' as const,
      };

      const filled = autoFillAddress(address, lookupResult);

      expect(filled).toMatchObject({
        country: 'US',
        postal_code: '90210',
        city: 'Beverly Hills',
        province: 'California',
        street_address: '123 Main St', // Preserved
      });
    });

    it('should not overwrite existing fields by default', () => {
      const address: AddressInput = {
        country: 'US',
        postal_code: '90210',
        city: 'Los Angeles', // User-entered
        province: 'CA',
      };

      const lookupResult = {
        postalCode: '90210',
        countryCode: 'US',
        city: 'Beverly Hills', // API result
        province: 'California',
        source: 'zippopotam' as const,
      };

      const filled = autoFillAddress(address, lookupResult);

      // Should preserve user input
      expect(filled.city).toBe('Los Angeles');
      expect(filled.province).toBe('CA');
    });

    it('should overwrite existing fields when option is set', () => {
      const address: AddressInput = {
        country: 'US',
        postal_code: '90210',
        city: 'Los Angeles',
      };

      const lookupResult = {
        postalCode: '90210',
        countryCode: 'US',
        city: 'Beverly Hills',
        province: 'California',
        source: 'zippopotam' as const,
      };

      const filled = autoFillAddress(address, lookupResult, {
        overwriteExisting: true,
      });

      // Should overwrite
      expect(filled.city).toBe('Beverly Hills');
      expect(filled.province).toBe('California');
    });
  });

  describe('isPostalCodeLookupAvailable', () => {
    it('should return true for Zippopotam supported countries', () => {
      expect(isPostalCodeLookupAvailable('US')).toBe(true);
      expect(isPostalCodeLookupAvailable('JP')).toBe(true);
      expect(isPostalCodeLookupAvailable('DE')).toBe(true);
      expect(isPostalCodeLookupAvailable('FR')).toBe(true);
    });

    it('should return false for unsupported countries without GeoNames', () => {
      // Country not in Zippopotam list and no GeoNames config
      expect(isPostalCodeLookupAvailable('XY')).toBe(false);
    });

    it('should return true when GeoNames is configured', () => {
      const config: PostalCodeLookupConfig = {
        geonamesUsername: 'test_user',
      };

      // Any country is supported with GeoNames
      expect(isPostalCodeLookupAvailable('XY', config)).toBe(true);
    });
  });

  describe('getSupportedCountries', () => {
    it('should return Zippopotam supported countries', () => {
      const countries = getSupportedCountries();
      
      expect(countries).toContain('US');
      expect(countries).toContain('JP');
      expect(countries).toContain('GB');
      expect(countries).toContain('DE');
      expect(countries.length).toBeGreaterThan(60);
    });
  });

  describe('Input validation', () => {
    it('should throw error for missing country code', async () => {
      const req: PostalCodeLookupRequest = {
        countryCode: '',
        postalCode: '90210',
      };

      await expect(lookupPostalCode(req)).rejects.toThrow('required');
    });

    it('should throw error for missing postal code', async () => {
      const req: PostalCodeLookupRequest = {
        countryCode: 'US',
        postalCode: '',
      };

      await expect(lookupPostalCode(req)).rejects.toThrow('required');
    });
  });
});
