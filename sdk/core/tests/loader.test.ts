/**
 * @vey/core - Loader tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDataLoader, dataLoader } from '../src/loader';
import type { CountryAddressFormat } from '../src/types';

describe('DataLoader', () => {
  describe('createDataLoader', () => {
    it('should create a data loader with default config', () => {
      const loader = createDataLoader();
      expect(loader).toBeDefined();
      expect(loader.loadCountry).toBeDefined();
      expect(loader.loadRegion).toBeDefined();
      expect(loader.getRegionHierarchy).toBeDefined();
      expect(loader.clearCache).toBeDefined();
    });

    it('should create a data loader with custom config', () => {
      const customFetch = vi.fn();
      const loader = createDataLoader({
        basePath: '/custom/path',
        fetch: customFetch as any,
        cacheTTL: 3600000,
      });
      expect(loader).toBeDefined();
    });
  });

  describe('loadCountry', () => {
    beforeEach(() => {
      const loader = createDataLoader();
      loader.clearCache();
    });

    it('should load country data successfully', async () => {
      const mockData: CountryAddressFormat = {
        name: { en: 'Japan' },
        iso_codes: { alpha2: 'JP', alpha3: 'JPN', numeric: '392' },
        address_format: {
          order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const loader = createDataLoader({ fetch: mockFetch as any });
      const result = await loader.loadCountry('JP');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith('data/asia/east_asia/JP.json');
    });

    it('should return cached data on second call', async () => {
      const mockData: CountryAddressFormat = {
        name: { en: 'Japan' },
        iso_codes: { alpha2: 'JP', alpha3: 'JPN', numeric: '392' },
        address_format: {
          order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const loader = createDataLoader({ fetch: mockFetch as any });
      
      // First call
      const result1 = await loader.loadCountry('JP');
      expect(result1).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await loader.loadCountry('JP');
      expect(result2).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should handle uppercase and lowercase country codes', async () => {
      const mockData: CountryAddressFormat = {
        name: { en: 'Japan' },
        iso_codes: { alpha2: 'JP', alpha3: 'JPN', numeric: '392' },
        address_format: {
          order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const loader = createDataLoader({ fetch: mockFetch as any });
      
      const result1 = await loader.loadCountry('jp');
      expect(result1).toEqual(mockData);

      const result2 = await loader.loadCountry('JP');
      expect(result2).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only once, second is cached
    });

    it('should deduplicate simultaneous requests for same country', async () => {
      const mockData: CountryAddressFormat = {
        name: { en: 'Japan' },
        iso_codes: { alpha2: 'JP', alpha3: 'JPN', numeric: '392' },
        address_format: {
          order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
        },
      };

      let resolvePromise: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      const mockFetch = vi.fn().mockImplementation(() => fetchPromise);

      const loader = createDataLoader({ fetch: mockFetch as any });
      
      // Make two simultaneous requests
      const promise1 = loader.loadCountry('JP');
      const promise2 = loader.loadCountry('JP');

      // Resolve the fetch
      resolvePromise!({
        ok: true,
        json: async () => mockData,
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only one fetch for both requests
    });

    it('should return null for unknown country code', async () => {
      const loader = createDataLoader({ fetch: vi.fn() as any });
      const result = await loader.loadCountry('XX');
      expect(result).toBeNull();
    });

    it('should return null on fetch error', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const loader = createDataLoader({ fetch: mockFetch as any });
      const result = await loader.loadCountry('JP');
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const loader = createDataLoader({ fetch: mockFetch as any });
      const result = await loader.loadCountry('JP');
      expect(result).toBeNull();
    });

    it('should use custom base path', async () => {
      const mockData: CountryAddressFormat = {
        name: { en: 'Japan' },
        iso_codes: { alpha2: 'JP', alpha3: 'JPN', numeric: '392' },
        address_format: {
          order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const loader = createDataLoader({ 
        basePath: '/api/v1',
        fetch: mockFetch as any,
      });
      
      await loader.loadCountry('JP');
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/data/asia/east_asia/JP.json');
    });

    it('should support multiple country codes', async () => {
      const countryCodes = ['JP', 'CN', 'KR', 'KP', 'TW', 'HK', 'MO', 'MN'];
      
      const mockFetch = vi.fn().mockImplementation((path: string) => {
        const countryCode = path.split('/').pop()?.replace('.json', '');
        return Promise.resolve({
          ok: true,
          json: async () => ({
            name: { en: `Country ${countryCode}` },
            iso_codes: { alpha2: countryCode, alpha3: `${countryCode}X`, numeric: '000' },
            address_format: { order: [] },
          }),
        });
      });

      const loader = createDataLoader({ fetch: mockFetch as any });
      
      for (const code of countryCodes) {
        const result = await loader.loadCountry(code);
        expect(result).toBeDefined();
        expect(result?.name.en).toBe(`Country ${code}`);
      }
    });
  });

  describe('loadRegion', () => {
    it('should return empty array (not implemented yet)', async () => {
      const loader = createDataLoader();
      const result = await loader.loadRegion('east_asia');
      expect(result).toEqual([]);
    });
  });

  describe('getRegionHierarchy', () => {
    it('should return region hierarchy', async () => {
      const loader = createDataLoader();
      const hierarchy = await loader.getRegionHierarchy();
      
      expect(hierarchy).toBeDefined();
      expect(Array.isArray(hierarchy)).toBe(true);
      expect(hierarchy.length).toBeGreaterThan(0);
    });

    it('should include Asia region', async () => {
      const loader = createDataLoader();
      const hierarchy = await loader.getRegionHierarchy();
      
      const asia = hierarchy.find(r => r.continent === 'Asia');
      expect(asia).toBeDefined();
      expect(asia?.countries).toBeDefined();
      expect(asia?.countries.length).toBeGreaterThan(0);
    });

    it('should include Europe region', async () => {
      const loader = createDataLoader();
      const hierarchy = await loader.getRegionHierarchy();
      
      const europe = hierarchy.find(r => r.continent === 'Europe');
      expect(europe).toBeDefined();
      expect(europe?.countries).toBeDefined();
    });

    it('should include Americas region', async () => {
      const loader = createDataLoader();
      const hierarchy = await loader.getRegionHierarchy();
      
      const americas = hierarchy.find(r => r.continent === 'Americas');
      expect(americas).toBeDefined();
      expect(americas?.countries).toBeDefined();
    });

    it('should have properly formatted country data', async () => {
      const loader = createDataLoader();
      const hierarchy = await loader.getRegionHierarchy();
      
      const asia = hierarchy.find(r => r.continent === 'Asia');
      const japan = asia?.countries.find(c => c.code === 'JP');
      
      expect(japan).toBeDefined();
      expect(japan?.code).toBe('JP');
      expect(japan?.name).toBe('Japan');
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      const mockData: CountryAddressFormat = {
        name: { en: 'Japan' },
        iso_codes: { alpha2: 'JP', alpha3: 'JPN', numeric: '392' },
        address_format: {
          order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
        },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const loader = createDataLoader({ fetch: mockFetch as any });
      
      // Clear cache first to ensure clean state
      loader.clearCache();
      
      // Load data
      await loader.loadCountry('JP');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Load again - should use cache
      await loader.loadCountry('JP');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Clear cache
      loader.clearCache();

      // Load again - should fetch again
      await loader.loadCountry('JP');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('default dataLoader instance', () => {
    it('should export a default loader instance', () => {
      expect(dataLoader).toBeDefined();
      expect(dataLoader.loadCountry).toBeDefined();
      expect(dataLoader.loadRegion).toBeDefined();
      expect(dataLoader.getRegionHierarchy).toBeDefined();
      expect(dataLoader.clearCache).toBeDefined();
    });
  });
});
