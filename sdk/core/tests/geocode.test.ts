/**
 * @vey/core - Tests for Geocoding module (緯度経度関連機能)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateCoordinates,
  isWithinBounds,
  calculateDistance,
  getBoundsCenter,
  verifyAddressWithGeo,
  findBestMatchingAddress,
  formatCoordinates,
  parseCoordinates,
  convertCoordinateFormat,
  createGeoAddress,
  createBoundsFromRadius,
  defaultGeoInsuranceConfig,
} from '../src/geocode';
import type { GeoCoordinates, GeoBounds, GeoAddress } from '../src/types';

describe('validateCoordinates', () => {
  it('should validate correct coordinates', () => {
    const tokyo: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    expect(validateCoordinates(tokyo)).toBe(true);
  });

  it('should validate coordinates at boundaries', () => {
    expect(validateCoordinates({ latitude: 90, longitude: 180 })).toBe(true);
    expect(validateCoordinates({ latitude: -90, longitude: -180 })).toBe(true);
    expect(validateCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
  });

  it('should reject latitude out of range', () => {
    expect(validateCoordinates({ latitude: 91, longitude: 0 })).toBe(false);
    expect(validateCoordinates({ latitude: -91, longitude: 0 })).toBe(false);
  });

  it('should reject longitude out of range', () => {
    expect(validateCoordinates({ latitude: 0, longitude: 181 })).toBe(false);
    expect(validateCoordinates({ latitude: 0, longitude: -181 })).toBe(false);
  });

  it('should reject NaN values', () => {
    expect(validateCoordinates({ latitude: NaN, longitude: 0 })).toBe(false);
    expect(validateCoordinates({ latitude: 0, longitude: NaN })).toBe(false);
  });

  it('should reject Infinity values', () => {
    expect(validateCoordinates({ latitude: Infinity, longitude: 0 })).toBe(false);
    expect(validateCoordinates({ latitude: 0, longitude: -Infinity })).toBe(false);
  });

  it('should validate with accuracy', () => {
    const coords: GeoCoordinates = {
      latitude: 35.6812,
      longitude: 139.7671,
      accuracy: 10,
    };
    expect(validateCoordinates(coords)).toBe(true);
  });

  it('should reject negative accuracy', () => {
    const coords: GeoCoordinates = {
      latitude: 35.6812,
      longitude: 139.7671,
      accuracy: -10,
    };
    expect(validateCoordinates(coords)).toBe(false);
  });

  it('should reject non-number accuracy', () => {
    const coords: any = {
      latitude: 35.6812,
      longitude: 139.7671,
      accuracy: 'ten',
    };
    expect(validateCoordinates(coords)).toBe(false);
  });

  it('should reject non-number coordinates', () => {
    const coords: any = {
      latitude: '35.6812',
      longitude: 139.7671,
    };
    expect(validateCoordinates(coords)).toBe(false);

    const coords2: any = {
      latitude: 35.6812,
      longitude: '139.7671',
    };
    expect(validateCoordinates(coords2)).toBe(false);
  });
});

describe('isWithinBounds', () => {
  const tokyoBounds: GeoBounds = {
    northeast: { latitude: 35.70, longitude: 139.80 },
    southwest: { latitude: 35.65, longitude: 139.70 },
  };

  it('should return true for coordinates within bounds', () => {
    const point: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    expect(isWithinBounds(point, tokyoBounds)).toBe(true);
  });

  it('should return false for coordinates outside bounds', () => {
    const point: GeoCoordinates = { latitude: 35.50, longitude: 139.7671 };
    expect(isWithinBounds(point, tokyoBounds)).toBe(false);
  });

  it('should handle international date line crossing', () => {
    const fijiBounds: GeoBounds = {
      northeast: { latitude: -16.0, longitude: -179.0 },
      southwest: { latitude: -18.0, longitude: 179.0 },
    };
    
    // Point at 180 longitude should be within bounds
    const point: GeoCoordinates = { latitude: -17.0, longitude: 180 };
    expect(isWithinBounds(point, fijiBounds)).toBe(true);
  });

  it('should return true for point on boundary', () => {
    const point: GeoCoordinates = { latitude: 35.70, longitude: 139.80 };
    expect(isWithinBounds(point, tokyoBounds)).toBe(true);
  });
});

describe('calculateDistance', () => {
  it('should calculate distance between two points', () => {
    const tokyo: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    const osaka: GeoCoordinates = { latitude: 34.6937, longitude: 135.5023 };
    
    const distance = calculateDistance(tokyo, osaka);
    
    // Tokyo to Osaka is approximately 400-405 km
    expect(distance).toBeGreaterThan(390000);
    expect(distance).toBeLessThan(410000);
  });

  it('should return 0 for same point', () => {
    const point: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    
    const distance = calculateDistance(point, point);
    expect(distance).toBe(0);
  });

  it('should calculate short distances accurately', () => {
    // Points approximately 100 meters apart
    const point1: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    const point2: GeoCoordinates = { latitude: 35.6821, longitude: 139.7671 };
    
    const distance = calculateDistance(point1, point2);
    
    // Approximately 100 meters (1 degree latitude ≈ 111km)
    expect(distance).toBeGreaterThan(90);
    expect(distance).toBeLessThan(110);
  });
});

describe('getBoundsCenter', () => {
  it('should calculate center of bounds', () => {
    const bounds: GeoBounds = {
      northeast: { latitude: 36.0, longitude: 140.0 },
      southwest: { latitude: 35.0, longitude: 139.0 },
    };
    
    const center = getBoundsCenter(bounds);
    
    expect(center.latitude).toBeCloseTo(35.5, 5);
    expect(center.longitude).toBeCloseTo(139.5, 5);
  });

  it('should handle equator crossing', () => {
    const bounds: GeoBounds = {
      northeast: { latitude: 10.0, longitude: 0.0 },
      southwest: { latitude: -10.0, longitude: -10.0 },
    };
    
    const center = getBoundsCenter(bounds);
    
    expect(center.latitude).toBeCloseTo(0, 5);
    expect(center.longitude).toBeCloseTo(-5, 5);
  });

  it('should handle date line crossing with centerLng > 180', () => {
    // Create bounds that will produce centerLng > 180 after the (+360)/2 calculation
    // We need: (sw + ne + 360) / 2 > 180
    // So: sw + ne > 0
    // With date line crossing: sw > ne
    const bounds: GeoBounds = {
      northeast: { latitude: 10.0, longitude: 100.0 },  // 100E
      southwest: { latitude: -10.0, longitude: 170.0 }, // 170E (crosses date line)
    };
    
    const center = getBoundsCenter(bounds);
    
    // (170 + 100 + 360) / 2 = 630 / 2 = 315
    // 315 > 180, so centerLng = 315 - 360 = -45
    expect(center.longitude).toBeGreaterThan(-180);
    expect(center.longitude).toBeLessThanOrEqual(180);
    expect(center.longitude).toBeCloseTo(-45, 0);
  });
});

describe('verifyAddressWithGeo', () => {
  const tokyoStation: GeoAddress = {
    pid: 'JP-13-101-01',
    center: { latitude: 35.6812, longitude: 139.7671 },
    bounds: {
      northeast: { latitude: 35.6830, longitude: 139.7690 },
      southwest: { latitude: 35.6794, longitude: 139.7652 },
    },
  };

  it('should verify coordinates within bounds', () => {
    const userCoords: GeoCoordinates = {
      latitude: 35.6815,
      longitude: 139.7669,
    };
    
    const result = verifyAddressWithGeo(tokyoStation, userCoords);
    
    expect(result.valid).toBe(true);
    expect(result.withinTolerance).toBe(true);
    expect(result.method).toBe('bounds');
  });

  it('should verify coordinates near center', () => {
    const nearbyCoords: GeoCoordinates = {
      latitude: 35.6815,
      longitude: 139.7675,
    };
    
    const result = verifyAddressWithGeo(tokyoStation, nearbyCoords, {
      toleranceMeters: 50,
    });
    
    expect(result.valid).toBe(true);
    expect(result.distance).toBeLessThan(50);
  });

  it('should reject coordinates far from address', () => {
    const farCoords: GeoCoordinates = {
      latitude: 35.70,
      longitude: 139.80,
    };
    
    const result = verifyAddressWithGeo(tokyoStation, farCoords, {
      toleranceMeters: 100,
    });
    
    expect(result.valid).toBe(false);
    expect(result.withinTolerance).toBe(false);
  });

  it('should reject invalid coordinates', () => {
    const invalidCoords: GeoCoordinates = {
      latitude: 91,
      longitude: 0,
    };
    
    const result = verifyAddressWithGeo(tokyoStation, invalidCoords);
    
    expect(result.valid).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('should account for GPS accuracy', () => {
    const coordsWithAccuracy: GeoCoordinates = {
      latitude: 35.6825,
      longitude: 139.7685,
      accuracy: 50,
    };
    
    const result = verifyAddressWithGeo(tokyoStation, coordsWithAccuracy, {
      toleranceMeters: 100,
    });
    
    // Even if distance > tolerance, accuracy is added to effective tolerance
    expect(result.withinTolerance).toBe(true);
  });
});

describe('findBestMatchingAddress', () => {
  const candidates: GeoAddress[] = [
    {
      pid: 'JP-13-101-01',
      center: { latitude: 35.6812, longitude: 139.7671 },
    },
    {
      pid: 'JP-13-102-01',
      center: { latitude: 35.6900, longitude: 139.7700 },
    },
    {
      pid: 'JP-13-103-01',
      center: { latitude: 35.6700, longitude: 139.7500 },
    },
  ];

  it('should find closest matching address', () => {
    const userCoords: GeoCoordinates = { latitude: 35.6815, longitude: 139.7675 };
    
    const result = findBestMatchingAddress(userCoords, candidates, {
      toleranceMeters: 1000,
    });
    
    expect(result).not.toBeNull();
    expect(result?.pid).toBe('JP-13-101-01');
  });

  it('should return null if no match within tolerance', () => {
    const farCoords: GeoCoordinates = { latitude: 35.0, longitude: 139.0 };
    
    const result = findBestMatchingAddress(farCoords, candidates, {
      toleranceMeters: 100,
    });
    
    expect(result).toBeNull();
  });

  it('should return null for empty candidates', () => {
    const coords: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    
    const result = findBestMatchingAddress(coords, []);
    expect(result).toBeNull();
  });

  it('should return null for invalid coordinates', () => {
    const invalidCoords: GeoCoordinates = { latitude: 91, longitude: 0 };
    
    const result = findBestMatchingAddress(invalidCoords, candidates);
    expect(result).toBeNull();
  });
});

describe('formatCoordinates', () => {
  it('should format coordinates with default precision', () => {
    const coords: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    
    const result = formatCoordinates(coords);
    expect(result).toBe('35.681200, 139.767100');
  });

  it('should format coordinates with custom precision', () => {
    const coords: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    
    const result = formatCoordinates(coords, 2);
    expect(result).toBe('35.68, 139.77');
  });
});

describe('parseCoordinates', () => {
  it('should parse valid coordinate string', () => {
    const result = parseCoordinates('35.6812, 139.7671');
    
    expect(result).not.toBeNull();
    expect(result?.latitude).toBeCloseTo(35.6812, 4);
    expect(result?.longitude).toBeCloseTo(139.7671, 4);
  });

  it('should return null for invalid format', () => {
    expect(parseCoordinates('35.6812')).toBeNull();
    expect(parseCoordinates('35.6812, 139.7671, 100')).toBeNull();
  });

  it('should return null for out of range values', () => {
    expect(parseCoordinates('91.0, 0.0')).toBeNull();
    expect(parseCoordinates('0.0, 181.0')).toBeNull();
  });

  it('should handle extra whitespace', () => {
    const result = parseCoordinates('  35.6812  ,  139.7671  ');
    
    expect(result).not.toBeNull();
    expect(result?.latitude).toBeCloseTo(35.6812, 4);
  });
});

describe('convertCoordinateFormat', () => {
  const coords: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };

  it('should convert to decimal format', () => {
    const result = convertCoordinateFormat(coords, 'decimal');
    expect(result).toBe('35.681200, 139.767100');
  });

  it('should convert to DMS format', () => {
    const result = convertCoordinateFormat(coords, 'dms');
    
    // Should contain degree, minute, second symbols and direction
    expect(result).toContain('°');
    expect(result).toContain("'");
    expect(result).toContain('"');
    expect(result).toContain('N');
    expect(result).toContain('E');
  });

  it('should convert to DMM format', () => {
    const result = convertCoordinateFormat(coords, 'dmm');
    
    expect(result).toContain('°');
    expect(result).toContain("'");
    expect(result).toContain('N');
    expect(result).toContain('E');
  });

  it('should handle negative coordinates', () => {
    const southWest: GeoCoordinates = { latitude: -33.8688, longitude: -151.2093 };
    const result = convertCoordinateFormat(southWest, 'dms');
    
    expect(result).toContain('S');
    expect(result).toContain('W');
  });

  it('should fallback to decimal for unknown format', () => {
    const result = convertCoordinateFormat(coords, 'unknown' as any);
    
    // Should default to decimal format
    expect(result).toBe('35.681200, 139.767100');
  });
});

describe('createGeoAddress', () => {
  it('should create GeoAddress from PID and coordinates', () => {
    const result = createGeoAddress(
      'JP-13-101-01',
      { latitude: 35.6812, longitude: 139.7671 }
    );
    
    expect(result.pid).toBe('JP-13-101-01');
    expect(result.center.latitude).toBe(35.6812);
    expect(result.center.longitude).toBe(139.7671);
    expect(result.verified).toBe(false);
  });

  it('should create GeoAddress with bounds', () => {
    const bounds: GeoBounds = {
      northeast: { latitude: 35.69, longitude: 139.78 },
      southwest: { latitude: 35.67, longitude: 139.76 },
    };
    
    const result = createGeoAddress(
      'JP-13-101-01',
      { latitude: 35.68, longitude: 139.77 },
      bounds
    );
    
    expect(result.bounds).toBeDefined();
    expect(result.bounds?.northeast.latitude).toBe(35.69);
  });

  it('should throw for invalid center coordinates', () => {
    expect(() => createGeoAddress(
      'JP-13-101-01',
      { latitude: 91, longitude: 0 }
    )).toThrow('Invalid center coordinates');
  });

  it('should throw for invalid bounds coordinates', () => {
    const invalidBounds: GeoBounds = {
      northeast: { latitude: 91, longitude: 0 },
      southwest: { latitude: 0, longitude: 0 },
    };
    
    expect(() => createGeoAddress(
      'JP-13-101-01',
      { latitude: 35.68, longitude: 139.77 },
      invalidBounds
    )).toThrow('Invalid bounds coordinates');
  });
});

describe('createBoundsFromRadius', () => {
  it('should create bounds from center and radius', () => {
    const center: GeoCoordinates = { latitude: 35.6812, longitude: 139.7671 };
    const result = createBoundsFromRadius(center, 1000); // 1km radius
    
    // Should have NE and SW corners
    expect(result.northeast.latitude).toBeGreaterThan(center.latitude);
    expect(result.southwest.latitude).toBeLessThan(center.latitude);
    expect(result.northeast.longitude).toBeGreaterThan(center.longitude);
    expect(result.southwest.longitude).toBeLessThan(center.longitude);
  });

  it('should create approximately correct sized bounds', () => {
    const center: GeoCoordinates = { latitude: 0, longitude: 0 }; // Equator for simplicity
    const result = createBoundsFromRadius(center, 111320); // ~1 degree at equator
    
    // Latitude offset should be approximately 1 degree
    const latDiff = result.northeast.latitude - result.southwest.latitude;
    expect(latDiff).toBeCloseTo(2.0, 0); // 2 degrees total span
  });
});

describe('defaultGeoInsuranceConfig', () => {
  it('should have expected default values', () => {
    expect(defaultGeoInsuranceConfig.enabled).toBe(true);
    expect(defaultGeoInsuranceConfig.toleranceMeters).toBe(100);
    expect(defaultGeoInsuranceConfig.minConfidence).toBe(0.8);
    expect(defaultGeoInsuranceConfig.autoCorrect).toBe(false);
    expect(defaultGeoInsuranceConfig.fallbackBehavior).toBe('warn');
  });
});

describe('Geo-Insurance Use Cases (緯度経度を保険とする技術)', () => {
  describe('Delivery address verification', () => {
    const deliveryAddress: GeoAddress = {
      pid: 'JP-13-101-01',
      center: { latitude: 35.6812, longitude: 139.7671 },
      bounds: {
        northeast: { latitude: 35.6830, longitude: 139.7690 },
        southwest: { latitude: 35.6794, longitude: 139.7652 },
      },
      verified: true,
    };

    it('should verify delivery driver at correct location', () => {
      const driverLocation: GeoCoordinates = {
        latitude: 35.6810,
        longitude: 139.7668,
        accuracy: 5,
        source: 'gps',
      };

      const result = verifyAddressWithGeo(deliveryAddress, driverLocation);
      
      expect(result.valid).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should flag driver at wrong location', () => {
      const wrongLocation: GeoCoordinates = {
        latitude: 35.70,
        longitude: 139.80,
        accuracy: 10,
        source: 'gps',
      };

      const result = verifyAddressWithGeo(deliveryAddress, wrongLocation, {
        toleranceMeters: 100,
      });
      
      expect(result.valid).toBe(false);
      expect(result.withinTolerance).toBe(false);
    });
  });

  describe('Address autocomplete validation', () => {
    const candidates: GeoAddress[] = [
      { pid: 'JP-13-101-01', center: { latitude: 35.6812, longitude: 139.7671 } },
      { pid: 'JP-13-101-02', center: { latitude: 35.6850, longitude: 139.7700 } },
      { pid: 'JP-13-102-01', center: { latitude: 35.6700, longitude: 139.7500 } },
    ];

    it('should suggest correct address based on user location', () => {
      const userLocation: GeoCoordinates = {
        latitude: 35.6815,
        longitude: 139.7675,
        accuracy: 20,
      };

      const match = findBestMatchingAddress(userLocation, candidates, {
        toleranceMeters: 500,
      });

      expect(match).not.toBeNull();
      expect(match?.pid).toBe('JP-13-101-01');
    });
  });
});

describe('Edge Cases and Internal Functions', () => {
  describe('getBoundsCenter with date line crossing', () => {
    it('should handle international date line crossing correctly', () => {
      const bounds: GeoBounds = {
        northeast: { latitude: -16.0, longitude: -179.0 },
        southwest: { latitude: -18.0, longitude: 179.0 },
      };

      const center = getBoundsCenter(bounds);

      // Center longitude should be around 180 or -180
      expect(Math.abs(center.longitude)).toBeCloseTo(180, 0);
      expect(center.latitude).toBeCloseTo(-17.0, 1);
    });

    it('should handle bounds that wrap around date line with longitude > 180', () => {
      const bounds: GeoBounds = {
        northeast: { latitude: 10.0, longitude: -170.0 },
        southwest: { latitude: -10.0, longitude: 170.0 },
      };

      const center = getBoundsCenter(bounds);

      // Should wrap correctly
      expect(center.longitude).toBeGreaterThan(-180);
      expect(center.longitude).toBeLessThanOrEqual(180);
    });
  });

  describe('findBestMatchingAddress edge cases', () => {
    it('should skip candidates with invalid center coordinates', () => {
      const candidates: GeoAddress[] = [
        { pid: 'INVALID-1', center: { latitude: 91, longitude: 0 } }, // Invalid latitude
        { pid: 'VALID-1', center: { latitude: 35.6812, longitude: 139.7671 } },
        { pid: 'INVALID-2', center: { latitude: 0, longitude: 181 } }, // Invalid longitude
      ];

      const coords: GeoCoordinates = { latitude: 35.6815, longitude: 139.7675 };

      const result = findBestMatchingAddress(coords, candidates, {
        toleranceMeters: 1000,
      });

      expect(result).not.toBeNull();
      expect(result?.pid).toBe('VALID-1');
    });
  });

  describe('convertCoordinateFormat with negative coordinates', () => {
    it('should handle negative latitude (South) in DMS format', () => {
      const coords: GeoCoordinates = { latitude: -33.8688, longitude: 151.2093 };
      const result = convertCoordinateFormat(coords, 'dms');

      expect(result).toContain('S');
      expect(result).toContain('E');
      expect(result).toContain('°');
      expect(result).toContain("'");
      expect(result).toContain('"');
    });

    it('should handle negative longitude (West) in DMS format', () => {
      const coords: GeoCoordinates = { latitude: 40.7128, longitude: -74.0060 };
      const result = convertCoordinateFormat(coords, 'dms');

      expect(result).toContain('N');
      expect(result).toContain('W');
    });

    it('should handle negative coordinates in DMM format', () => {
      const coords: GeoCoordinates = { latitude: -33.8688, longitude: -151.2093 };
      const result = convertCoordinateFormat(coords, 'dmm');

      expect(result).toContain('S');
      expect(result).toContain('W');
      expect(result).toContain('°');
      expect(result).toContain("'");
    });
  });

  describe('verifyAddressWithGeo edge cases', () => {
    it('should return low confidence for coordinates beyond 3x tolerance', () => {
      const address: GeoAddress = {
        pid: 'TEST-01',
        center: { latitude: 35.6812, longitude: 139.7671 },
      };

      // Coordinates very far away (more than 3x tolerance)
      const farCoords: GeoCoordinates = {
        latitude: 36.0,
        longitude: 140.0,
      };

      const result = verifyAddressWithGeo(address, farCoords, {
        toleranceMeters: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('should handle coordinates exactly at center (distance = 0)', () => {
      const address: GeoAddress = {
        pid: 'TEST-01',
        center: { latitude: 35.6812, longitude: 139.7671 },
      };

      const exactCoords: GeoCoordinates = {
        latitude: 35.6812,
        longitude: 139.7671,
      };

      const result = verifyAddressWithGeo(address, exactCoords);

      expect(result.valid).toBe(true);
      expect(result.confidence).toBe(1.0);
      expect(result.distance).toBe(0);
    });

    it('should calculate confidence using exponential decay', () => {
      const address: GeoAddress = {
        pid: 'TEST-01',
        center: { latitude: 35.6812, longitude: 139.7671 },
      };

      // Coordinates at exactly tolerance distance
      // At tolerance meters away, confidence should be around 0.37 (e^-1)
      const toleranceMeters = 200;
      const nearbyCoords: GeoCoordinates = {
        latitude: 35.6830, // Approximately 200m north
        longitude: 139.7671,
      };

      const result = verifyAddressWithGeo(address, nearbyCoords, {
        toleranceMeters,
      });

      // Confidence should be between 0.3 and 0.4 (exponential decay)
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('calculateDistance edge case', () => {
    it('should calculate distance using toRadians correctly', () => {
      // Test points at different latitudes
      const north: GeoCoordinates = { latitude: 45.0, longitude: 0.0 };
      const south: GeoCoordinates = { latitude: -45.0, longitude: 0.0 };

      const distance = calculateDistance(north, south);

      // Distance should be approximately 10,000 km
      expect(distance).toBeGreaterThan(9900000);
      expect(distance).toBeLessThan(10100000);
    });
  });
});

describe('Geocoding API Input Validation', () => {
  describe('forwardGeocode', () => {
    it('should reject request without address or PID', async () => {
      const result = await import('../src/geocode').then(m => m.forwardGeocode({}));

      expect(result.success).toBe(false);
      expect(result.error).toContain('Either address or PID is required');
    });
  });

  describe('reverseGeocode', () => {
    it('should reject request without coordinates', async () => {
      const result = await import('../src/geocode').then(m => m.reverseGeocode({}));

      expect(result.success).toBe(false);
      expect(result.error).toContain('Coordinates are required');
    });

    it('should reject invalid coordinates', async () => {
      const result = await import('../src/geocode').then(m => 
        m.reverseGeocode({ coordinates: { latitude: 91, longitude: 0 } })
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid coordinates');
    });
  });

  describe('geocode auto-detect', () => {
    it('should reject request with neither coordinates nor address/PID', async () => {
      const result = await import('../src/geocode').then(m => m.geocode({}));

      expect(result.success).toBe(false);
      expect(result.error).toContain('Either address/PID or coordinates must be provided');
    });

    it('should route to reverseGeocode when coordinates provided', async () => {
      const result = await import('../src/geocode').then(m => 
        m.geocode({ coordinates: { latitude: 91, longitude: 0 } })
      );

      // Should call reverseGeocode which validates coordinates
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid coordinates');
    });

    it('should route to forwardGeocode when address provided', async () => {
      const result = await import('../src/geocode').then(m => 
        m.geocode({})
      );

      // Should reject due to missing address/coordinates
      expect(result.success).toBe(false);
    });
  });
});

describe('Geocoding Cache Management', () => {
  it('should clear geocoding cache', async () => {
    const { clearGeocodingCache, getGeocodingCacheStats } = await import('../src/geocode');
    
    // Clear cache
    clearGeocodingCache();
    
    const stats = getGeocodingCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.keys).toHaveLength(0);
  });

  it('should report cache statistics', async () => {
    const { getGeocodingCacheStats, clearGeocodingCache } = await import('../src/geocode');
    
    // Start fresh
    clearGeocodingCache();
    
    const stats = getGeocodingCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('keys');
    expect(Array.isArray(stats.keys)).toBe(true);
  });
});

describe('Geocoding API with Mocked Fetch', () => {
  let fetchMock: any;

  beforeEach(() => {
    // Mock global fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('forwardGeocode with mocked responses', () => {
    it('should handle successful geocoding with address', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = [{
        lat: '35.6812',
        lon: '139.7671',
        importance: 0.9,
      }];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await forwardGeocode({
        address: {
          city: 'Tokyo',
          country: 'JP',
        },
      });

      expect(result.success).toBe(true);
      expect(result.coordinates).toBeDefined();
      expect(result.coordinates?.latitude).toBeCloseTo(35.6812, 4);
      expect(result.coordinates?.longitude).toBeCloseTo(139.7671, 4);
    });

    it('should handle successful geocoding with PID', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = [{
        lat: '35.6812',
        lon: '139.7671',
        importance: 0.85,
      }, {
        lat: '35.7000',
        lon: '139.8000',
        importance: 0.75,
      }];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await forwardGeocode({
        pid: 'JP-13-101',
      });

      expect(result.success).toBe(true);
      expect(result.coordinates).toBeDefined();
      expect(result.alternatives).toBeDefined();
      expect(result.alternatives?.length).toBeGreaterThan(0);
    });

    it('should handle no results found', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await forwardGeocode({
        address: { city: 'NonexistentCity' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No results found');
    });

    it('should handle API error', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await forwardGeocode({
        address: { city: 'Tokyo' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Geocoding API error');
    });

    it('should handle network timeout', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      fetchMock.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await forwardGeocode({
        address: { city: 'Tokyo' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Geocoding failed');
    });

    it('should use cache for repeated requests', async () => {
      const { forwardGeocode, clearGeocodingCache, getGeocodingCacheStats } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = [{
        lat: '35.6812',
        lon: '139.7671',
        importance: 0.9,
      }];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = { address: { city: 'Tokyo', country: 'JP' } };

      // First call - should hit API
      const result1 = await forwardGeocode(request);
      expect(result1.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await forwardGeocode(request);
      expect(result2.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1); // Still 1, not 2

      const stats = getGeocodingCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('reverseGeocode with mocked responses', () => {
    it('should handle successful reverse geocoding', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = {
        address: {
          city: 'Chiyoda',
          state: 'Tokyo',
          country_code: 'jp',
          postcode: '100-0001',
          road: 'Chiyoda Street',
          house_number: '1-1',
        },
        importance: 0.9,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reverseGeocode({
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
      });

      expect(result.success).toBe(true);
      expect(result.address).toBeDefined();
      expect(result.address?.country).toBe('JP');
      expect(result.address?.city).toBe('Chiyoda');
    });

    it('should handle no address found', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // No address field
      });

      const result = await reverseGeocode({
        coordinates: { latitude: 0, longitude: 0 },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No address found');
    });

    it('should handle API error', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await reverseGeocode({
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Reverse geocoding API error');
    });

    it('should handle network error', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const result = await reverseGeocode({
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Reverse geocoding failed');
    });

    it('should use cache for repeated reverse geocoding requests', async () => {
      const { reverseGeocode, clearGeocodingCache, getGeocodingCacheStats } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = {
        address: {
          city: 'Tokyo',
          country_code: 'jp',
        },
        importance: 0.9,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request = { coordinates: { latitude: 35.6812, longitude: 139.7671 } };

      // First call
      const result1 = await reverseGeocode(request);
      expect(result1.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await reverseGeocode(request);
      expect(result2.success).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1); // Still 1

      const stats = getGeocodingCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('geocode auto-routing with mocked fetch', () => {
    it('should route to forwardGeocode when address provided', async () => {
      const { geocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = [{
        lat: '35.6812',
        lon: '139.7671',
        importance: 0.9,
      }];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocode({
        address: { city: 'Tokyo', country: 'JP' },
      });

      expect(result.success).toBe(true);
      expect(result.coordinates).toBeDefined();
    });

    it('should route to reverseGeocode when coordinates provided', async () => {
      const { geocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = {
        address: {
          city: 'Tokyo',
          country_code: 'jp',
        },
        importance: 0.9,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geocode({
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
      });

      expect(result.success).toBe(true);
      expect(result.address).toBeDefined();
    });
  });

  describe('forwardGeocode - edge cases for address parsing', () => {
    it('should handle response with no alternatives (single result)', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = [{
        lat: '35.6812',
        lon: '139.7671',
        importance: 0.9,
      }]; // Only one result, no alternatives

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await forwardGeocode({
        address: { city: 'Tokyo', country: 'JP' },
      });

      expect(result.success).toBe(true);
      expect(result.alternatives).toBeUndefined(); // No alternatives since only 1 result
    });

    it('should handle response with exactly 5 results', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = [
        { lat: '35.6812', lon: '139.7671', importance: 0.9 },
        { lat: '35.6900', lon: '139.7700', importance: 0.8 },
        { lat: '35.6850', lon: '139.7650', importance: 0.7 },
        { lat: '35.6750', lon: '139.7550', importance: 0.6 },
        { lat: '35.6800', lon: '139.7600', importance: 0.5 },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await forwardGeocode({
        address: { city: 'Tokyo', country: 'JP' },
      });

      expect(result.success).toBe(true);
      expect(result.alternatives).toBeDefined();
      expect(result.alternatives?.length).toBe(4); // 5 results - 1 primary = 4 alternatives
    });

    it('should handle response with more than 5 results (should limit to 5)', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = Array(10).fill(null).map((_, i) => ({
        lat: `${35.68 + i * 0.01}`,
        lon: `${139.76 + i * 0.01}`,
        importance: 0.9 - i * 0.05,
      }));

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await forwardGeocode({
        address: { city: 'Tokyo', country: 'JP' },
      });

      expect(result.success).toBe(true);
      expect(result.alternatives).toBeDefined();
      expect(result.alternatives?.length).toBeLessThanOrEqual(4); // Max 4 alternatives (positions 1-4)
    });

    it('should handle response with missing importance field', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = [{
        lat: '35.6812',
        lon: '139.7671',
        // No importance field
      }];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await forwardGeocode({
        address: { city: 'Tokyo', country: 'JP' },
      });

      expect(result.success).toBe(true);
      expect(result.confidence).toBe(0.5); // Default confidence when importance is missing
    });
  });

  describe('reverseGeocode - edge cases for address field parsing', () => {
    it('should handle missing optional address fields', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = {
        address: {
          country_code: 'jp',
          // All other fields missing
        },
        importance: 0.8,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reverseGeocode({
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
      });

      expect(result.success).toBe(true);
      expect(result.address?.country).toBe('JP');
      expect(result.address?.province).toBe(''); // Empty when missing
      expect(result.address?.city).toBe(''); // Empty when missing
    });

    it('should use alternative address field names', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = {
        address: {
          country_code: 'us',
          state: 'California', // Instead of province
          town: 'San Francisco', // Instead of city
          suburb: 'Mission District', // Instead of district
          neighbourhood: 'Valencia', // Alternative for district
          road: 'Market Street',
          house_number: '123',
          postcode: '94103',
        },
        importance: 0.9,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reverseGeocode({
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
      });

      expect(result.success).toBe(true);
      expect(result.address?.province).toBe('California');
      expect(result.address?.city).toBe('San Francisco');
      expect(result.address?.district).toBe('Mission District');
      expect(result.address?.street_address).toContain('Market Street');
      expect(result.address?.street_address).toContain('123');
    });

    it('should fallback through multiple city name variants', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = {
        address: {
          country_code: 'jp',
          village: 'Small Village', // city fallback: city, town, village, municipality
          municipality: 'Municipality Name',
        },
        importance: 0.7,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reverseGeocode({
        coordinates: { latitude: 35.0, longitude: 135.0 },
      });

      expect(result.success).toBe(true);
      expect(result.address?.city).toBe('Small Village'); // First available variant
    });

    it('should handle missing importance field in reverse geocoding', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = {
        address: {
          country_code: 'jp',
          city: 'Tokyo',
        },
        // No importance field
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await reverseGeocode({
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
      });

      expect(result.success).toBe(true);
      expect(result.confidence).toBe(0.5); // Default confidence
    });

    it('should handle non-Error exceptions in reverse geocoding', async () => {
      const { reverseGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      // Mock a non-Error exception (e.g., string thrown)
      fetchMock.mockRejectedValueOnce('String error message');

      const result = await reverseGeocode({
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown error');
    });
  });

  describe('forwardGeocode - non-Error exception handling', () => {
    it('should handle non-Error exceptions in forward geocoding', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      // Mock a non-Error exception
      fetchMock.mockRejectedValueOnce('String error');

      const result = await forwardGeocode({
        address: { city: 'Tokyo' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown error');
    });

    it('should handle response that is not an array', async () => {
      const { forwardGeocode, clearGeocodingCache } = await import('../src/geocode');
      clearGeocodingCache();

      const mockResponse = { error: 'Not an array' }; // Object instead of array

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await forwardGeocode({
        address: { city: 'Tokyo' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No results found');
    });
  });
});

