/**
 * @vey/core - Tests for Geocoding module (緯度経度関連機能)
 */

import { describe, it, expect } from 'vitest';
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

    it('should handle empty candidates array', () => {
      const userLocation: GeoCoordinates = {
        latitude: 35.6815,
        longitude: 139.7675,
        accuracy: 20,
      };

      const match = findBestMatchingAddress(userLocation, [], {
        toleranceMeters: 500,
      });

      expect(match).toBeNull();
    });

    it('should handle very tight tolerance', () => {
      const userLocation: GeoCoordinates = {
        latitude: 35.6815,
        longitude: 139.7675,
        accuracy: 20,
      };

      const match = findBestMatchingAddress(userLocation, candidates, {
        toleranceMeters: 1, // Very tight tolerance
      });

      // Should not match with such tight tolerance
      expect(match).toBeNull();
    });

    it('should handle very loose tolerance', () => {
      const userLocation: GeoCoordinates = {
        latitude: 35.6815,
        longitude: 139.7675,
        accuracy: 20,
      };

      const match = findBestMatchingAddress(userLocation, candidates, {
        toleranceMeters: 100000, // Very loose tolerance
      });

      // Should match with loose tolerance
      expect(match).not.toBeNull();
    });
  });

  describe('calculateDistance edge cases', () => {
    it('should calculate distance between same point', () => {
      const point: GeoCoordinates = {
        latitude: 35.6812,
        longitude: 139.7671,
      };

      const distance = calculateDistance(point, point);
      expect(distance).toBe(0);
    });

    it('should calculate distance between antipodal points', () => {
      const point1: GeoCoordinates = {
        latitude: 90,
        longitude: 0,
      };
      const point2: GeoCoordinates = {
        latitude: -90,
        longitude: 0,
      };

      const distance = calculateDistance(point1, point2);
      // Approximate distance to Earth's poles
      expect(distance).toBeGreaterThan(19000000); // ~20,000 km
    });

    it('should calculate distance at equator', () => {
      const point1: GeoCoordinates = {
        latitude: 0,
        longitude: 0,
      };
      const point2: GeoCoordinates = {
        latitude: 0,
        longitude: 1,
      };

      const distance = calculateDistance(point1, point2);
      // At equator, 1 degree longitude is ~111 km
      expect(distance).toBeGreaterThan(100000);
      expect(distance).toBeLessThan(120000);
    });
  });
});
