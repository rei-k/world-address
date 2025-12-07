/**
 * @vey/core - Tests for Forward & Reverse Geocoding API
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  forwardGeocode,
  reverseGeocode,
  geocode,
  clearGeocodingCache,
  getGeocodingCacheStats,
} from '../src/geocode';
import type { GeocodingRequest } from '../src/types';

// Note: These tests will make real API calls to OpenStreetMap Nominatim
// They will be skipped if network is unavailable (e.g., in CI/sandboxed environments)

/**
 * API timeout for geocoding tests (10 seconds)
 */
const API_TIMEOUT_MS = 10000;

/**
 * Check if geocoding API is available
 */
async function isGeocodingAvailable(): Promise<boolean> {
  try {
    const testUrl = 'https://nominatim.openstreetmap.org/search?q=test&format=json&limit=1';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(testUrl, {
      headers: { 'User-Agent': '@vey/core geocoding test' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

let geocodingAvailable = false;

beforeAll(async () => {
  geocodingAvailable = await isGeocodingAvailable();
  if (!geocodingAvailable) {
    console.warn('\n⚠️  Geocoding API tests will be skipped (network unavailable)\n');
  }
}, 10000);

describe('Forward Geocoding', () => {
  beforeAll(() => {
    clearGeocodingCache();
  });

  it('should geocode Tokyo address to coordinates', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    const request: GeocodingRequest = {
      address: {
        city: 'Tokyo',
        province: 'Tokyo',
        country: 'JP',
      },
    };

    const result = await forwardGeocode(request);

    expect(result.success).toBe(true);
    expect(result.coordinates).toBeDefined();
    if (result.coordinates) {
      expect(result.coordinates.latitude).toBeGreaterThan(35);
      expect(result.coordinates.latitude).toBeLessThan(36);
      expect(result.coordinates.longitude).toBeGreaterThan(139);
      expect(result.coordinates.longitude).toBeLessThan(140);
      expect(result.coordinates.source).toBe('nominatim');
    }
    expect(result.confidence).toBeGreaterThan(0);
  }, API_TIMEOUT_MS); // 10s timeout for API call

  it('should geocode complete address', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    const request: GeocodingRequest = {
      address: {
        street_address: '1-1-1 Chiyoda',
        city: 'Chiyoda-ku',
        province: 'Tokyo',
        postal_code: '100-0001',
        country: 'JP',
      },
    };

    const result = await forwardGeocode(request);

    expect(result.success).toBe(true);
    expect(result.coordinates).toBeDefined();
  }, API_TIMEOUT_MS);

  it('should return error for empty address', async () => {
    const request: GeocodingRequest = {
      address: {},
    };

    const result = await forwardGeocode(request);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  }, API_TIMEOUT_MS);

  it('should use cache for repeated requests', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    const request: GeocodingRequest = {
      address: {
        city: 'Osaka',
        country: 'JP',
      },
    };

    // First call - should hit API
    const result1 = await forwardGeocode(request);
    expect(result1.success).toBe(true);

    const stats1 = getGeocodingCacheStats();
    const cacheSize1 = stats1.size;

    // Second call - should use cache
    const result2 = await forwardGeocode(request);
    expect(result2.success).toBe(true);

    const stats2 = getGeocodingCacheStats();
    expect(stats2.size).toBe(cacheSize1);
    
    // Results should be identical
    expect(result1.coordinates?.latitude).toBe(result2.coordinates?.latitude);
    expect(result1.coordinates?.longitude).toBe(result2.coordinates?.longitude);
  }, API_TIMEOUT_MS);
});

describe('Reverse Geocoding', () => {
  beforeAll(() => {
    clearGeocodingCache();
  });

  it('should reverse geocode Tokyo coordinates to address', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    const request: GeocodingRequest = {
      coordinates: {
        latitude: 35.6812,
        longitude: 139.7671,
      },
    };

    const result = await reverseGeocode(request);

    expect(result.success).toBe(true);
    expect(result.address).toBeDefined();
    if (result.address) {
      expect(result.address.country).toBe('JP');
      expect(result.address.city).toBeDefined();
    }
    expect(result.confidence).toBeGreaterThan(0);
  }, API_TIMEOUT_MS);

  it('should reverse geocode New York coordinates', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    const request: GeocodingRequest = {
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    };

    const result = await reverseGeocode(request);

    expect(result.success).toBe(true);
    expect(result.address).toBeDefined();
    if (result.address) {
      expect(result.address.country).toBe('US');
    }
  }, API_TIMEOUT_MS);

  it('should return error for invalid coordinates', async () => {
    const request: GeocodingRequest = {
      coordinates: {
        latitude: 91, // Invalid
        longitude: 0,
      },
    };

    const result = await reverseGeocode(request);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid coordinates');
  });

  it('should return error for missing coordinates', async () => {
    const request: GeocodingRequest = {};

    const result = await reverseGeocode(request);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('Auto-detect Geocoding', () => {
  beforeAll(() => {
    clearGeocodingCache();
  });

  it('should auto-detect forward geocoding', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    const request: GeocodingRequest = {
      address: {
        city: 'London',
        country: 'GB',
      },
    };

    const result = await geocode(request);

    expect(result.success).toBe(true);
    expect(result.coordinates).toBeDefined();
  }, API_TIMEOUT_MS);

  it('should auto-detect reverse geocoding', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    const request: GeocodingRequest = {
      coordinates: {
        latitude: 51.5074,
        longitude: -0.1278,
      },
    };

    const result = await geocode(request);

    expect(result.success).toBe(true);
    expect(result.address).toBeDefined();
  }, API_TIMEOUT_MS);

  it('should return error when both missing', async () => {
    const request: GeocodingRequest = {};

    const result = await geocode(request);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('Geocoding Cache', () => {
  it('should clear cache', () => {
    clearGeocodingCache();
    const stats = getGeocodingCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.keys).toEqual([]);
  });

  it('should track cache entries', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    clearGeocodingCache();

    await forwardGeocode({
      address: { city: 'Paris', country: 'FR' },
    });

    const stats = getGeocodingCacheStats();
    expect(stats.size).toBeGreaterThan(0);
    expect(stats.keys.length).toBeGreaterThan(0);
  }, API_TIMEOUT_MS);
});

describe('Integration: Forward + Reverse Geocoding', () => {
  it('should geocode address and reverse back', async () => {
    if (!geocodingAvailable) {
      console.log('Skipping test: Geocoding API not available');
      return;
    }

    // Forward geocode an address
    const forwardRequest: GeocodingRequest = {
      address: {
        city: 'Sydney',
        country: 'AU',
      },
    };

    const forwardResult = await forwardGeocode(forwardRequest);
    expect(forwardResult.success).toBe(true);
    expect(forwardResult.coordinates).toBeDefined();

    // Reverse geocode the result
    if (forwardResult.coordinates) {
      const reverseRequest: GeocodingRequest = {
        coordinates: forwardResult.coordinates,
      };

      const reverseResult = await reverseGeocode(reverseRequest);
      expect(reverseResult.success).toBe(true);
      expect(reverseResult.address).toBeDefined();
      
      // Should be in Australia
      if (reverseResult.address) {
        expect(reverseResult.address.country).toBe('AU');
      }
    }
  }, API_TIMEOUT_MS + 5000);
});
