/**
 * @vey/core - Address data loader
 * 
 * This loader implements in-memory caching for loaded country data.
 * For HTTP-level caching, configure your fetch implementation or CDN accordingly.
 */

import type { CountryAddressFormat, RegionHierarchy } from './types';

// In-memory cache for loaded data
const cache = new Map<string, CountryAddressFormat>();

// Track in-flight requests to prevent duplicate fetches
const pendingRequests = new Map<string, Promise<CountryAddressFormat | null>>();

/**
 * Data loader configuration
 */
export interface DataLoaderConfig {
  /** Base path for data files */
  basePath?: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
  /** Cache TTL in milliseconds (default: no expiration) */
  cacheTTL?: number;
}

/**
 * Creates a data loader with custom configuration
 */
export function createDataLoader(config: DataLoaderConfig = {}) {
  const basePath = config.basePath ?? '';

  return {
    /**
     * Load country address format by ISO alpha-2 code
     * Uses request deduplication to prevent multiple simultaneous fetches for the same country.
     */
    async loadCountry(countryCode: string): Promise<CountryAddressFormat | null> {
      const code = countryCode.toUpperCase();

      // Check cache first
      if (cache.has(code)) {
        return cache.get(code)!;
      }

      // Check if there's already a pending request for this country
      if (pendingRequests.has(code)) {
        return pendingRequests.get(code)!;
      }

      // Map country codes to their file paths
      const countryPaths: Record<string, string> = {
        // East Asia
        JP: 'data/asia/east_asia/JP/JP.json',
        CN: 'data/asia/east_asia/CN/CN.json',
        KR: 'data/asia/east_asia/KR/KR.json',
        KP: 'data/asia/east_asia/KP/KP.json',
        TW: 'data/asia/east_asia/TW/TW.json',
        HK: 'data/asia/east_asia/HK/HK.json',
        MO: 'data/asia/east_asia/MO/MO.json',
        MN: 'data/asia/east_asia/MN/MN.json',
        // North America
        US: 'data/americas/north_america/US/US.json',
        CA: 'data/americas/north_america/CA/CA.json',
        MX: 'data/americas/north_america/MX/MX.json',
        // Europe
        DE: 'data/europe/western_europe/DE/DE.json',
        FR: 'data/europe/western_europe/FR/FR.json',
        GB: 'data/europe/northern_europe/GB/GB.json',
        // Add more mappings as needed
      };

      const path = countryPaths[code];
      if (!path) {
        return null;
      }

      // Create the fetch promise and track it
      const fetchPromise = (async (): Promise<CountryAddressFormat | null> => {
        try {
          const fullPath = basePath ? `${basePath}/${path}` : path;
          const response = await (config.fetch ?? fetch)(fullPath);
          if (!response.ok) {
            return null;
          }
          const data = await response.json() as CountryAddressFormat;
          cache.set(code, data);
          return data;
        } catch {
          return null;
        } finally {
          // Remove from pending requests once complete
          pendingRequests.delete(code);
        }
      })();

      pendingRequests.set(code, fetchPromise);
      return fetchPromise;
    },

    /**
     * Load all countries for a region
     */
    async loadRegion(region: string): Promise<CountryAddressFormat[]> {
      // This would be implemented to load all countries in a region
      // For now, return empty array
      return [];
    },

    /**
     * Get hierarchical region data for picker UI
     */
    async getRegionHierarchy(): Promise<RegionHierarchy[]> {
      // Return basic hierarchy structure
      return [
        {
          continent: 'Asia',
          countries: [
            { code: 'JP', name: 'Japan' },
            { code: 'CN', name: 'China' },
            { code: 'KR', name: 'South Korea' },
          ],
        },
        {
          continent: 'Europe',
          countries: [
            { code: 'DE', name: 'Germany' },
            { code: 'FR', name: 'France' },
            { code: 'GB', name: 'United Kingdom' },
          ],
        },
        {
          continent: 'Americas',
          countries: [
            { code: 'US', name: 'United States' },
            { code: 'CA', name: 'Canada' },
            { code: 'MX', name: 'Mexico' },
          ],
        },
      ];
    },

    /**
     * Clear the cache
     */
    clearCache() {
      cache.clear();
    },
  };
}

// Default loader instance
export const dataLoader = createDataLoader();
