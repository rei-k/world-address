/**
 * @vey/core - Geocoding module (緯度経度関連機能)
 * 
 * This module provides:
 * 1. Address-coordinates relationship mapping (住所と緯度経度の関係性)
 * 2. Geo-insurance: Using coordinates as address verification fallback (緯度経度を保険とする技術)
 * 3. Distance calculation and coordinate validation utilities
 */

import type {
  GeoCoordinates,
  GeoBounds,
  GeoAddress,
  GeoVerificationResult,
  GeocodingRequest,
  GeocodingResult,
  GeoInsuranceConfig,
  AddressInput,
  GeoSource,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/** Earth's radius in meters */
const EARTH_RADIUS_METERS = 6371000;

/** Default tolerance in meters for geo-verification */
const DEFAULT_TOLERANCE_METERS = 100;

/** Default minimum confidence threshold */
const DEFAULT_MIN_CONFIDENCE = 0.8;

// ============================================================================
// Coordinate Validation
// ============================================================================

/**
 * Validates geographic coordinates
 * 緯度経度の妥当性を検証
 * 
 * @param coordinates - Coordinates to validate
 * @returns Whether coordinates are valid
 * 
 * @example
 * ```ts
 * const valid = validateCoordinates({ latitude: 35.6812, longitude: 139.7671 });
 * // Returns: true (valid Tokyo coordinates)
 * 
 * const invalid = validateCoordinates({ latitude: 91, longitude: 0 });
 * // Returns: false (latitude out of range)
 * ```
 */
export function validateCoordinates(coordinates: GeoCoordinates): boolean {
  const { latitude, longitude } = coordinates;
  
  // Check for valid number types
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }
  
  // Check for NaN or Infinity
  if (!isFinite(latitude) || !isFinite(longitude)) {
    return false;
  }
  
  // Validate latitude range (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    return false;
  }
  
  // Validate longitude range (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    return false;
  }
  
  // Validate accuracy if provided
  if (coordinates.accuracy !== undefined) {
    if (typeof coordinates.accuracy !== 'number' || coordinates.accuracy < 0) {
      return false;
    }
  }
  
  return true;
}

/**
 * Checks if coordinates are within specified bounds
 * 座標が指定範囲内かを確認
 * 
 * @param coordinates - Coordinates to check
 * @param bounds - Bounds to check against
 * @returns Whether coordinates are within bounds
 */
export function isWithinBounds(
  coordinates: GeoCoordinates,
  bounds: GeoBounds
): boolean {
  const { latitude, longitude } = coordinates;
  const { northeast, southwest } = bounds;
  
  // Check latitude
  if (latitude < southwest.latitude || latitude > northeast.latitude) {
    return false;
  }
  
  // Handle longitude wrapping at international date line
  if (southwest.longitude <= northeast.longitude) {
    // Normal case
    return longitude >= southwest.longitude && longitude <= northeast.longitude;
  } else {
    // Bounds cross the international date line
    return longitude >= southwest.longitude || longitude <= northeast.longitude;
  }
}

// ============================================================================
// Distance Calculation
// ============================================================================

/**
 * Calculates the Haversine distance between two coordinates in meters
 * ハバーサイン公式による2点間の距離計算（メートル）
 * 
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in meters
 * 
 * @example
 * ```ts
 * const tokyo = { latitude: 35.6812, longitude: 139.7671 };
 * const osaka = { latitude: 34.6937, longitude: 135.5023 };
 * const distance = calculateDistance(tokyo, osaka);
 * // Returns: approximately 402,000 meters (402 km)
 * ```
 */
export function calculateDistance(
  coord1: GeoCoordinates,
  coord2: GeoCoordinates
): number {
  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS_METERS * c;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the center point of bounds
 * 境界の中心座標を計算
 * 
 * @param bounds - Geographic bounds
 * @returns Center coordinates
 */
export function getBoundsCenter(bounds: GeoBounds): GeoCoordinates {
  const { northeast, southwest } = bounds;
  
  let centerLng: number;
  if (southwest.longitude <= northeast.longitude) {
    centerLng = (southwest.longitude + northeast.longitude) / 2;
  } else {
    // Handle international date line crossing
    centerLng = (southwest.longitude + northeast.longitude + 360) / 2;
    if (centerLng > 180) {
      centerLng -= 360;
    }
  }
  
  return {
    latitude: (southwest.latitude + northeast.latitude) / 2,
    longitude: centerLng,
  };
}

// ============================================================================
// Geo-Insurance: Address Verification (緯度経度を保険とする技術)
// ============================================================================

/**
 * Default geo-insurance configuration
 */
export const defaultGeoInsuranceConfig: GeoInsuranceConfig = {
  enabled: true,
  toleranceMeters: DEFAULT_TOLERANCE_METERS,
  minConfidence: DEFAULT_MIN_CONFIDENCE,
  autoCorrect: false,
  fallbackBehavior: 'warn',
};

/**
 * Verifies an address using geo-coordinates as insurance/fallback
 * 緯度経度を使用した住所検証（保険機能）
 * 
 * This function uses coordinates to verify that an address is valid,
 * providing a fallback verification mechanism when traditional address
 * validation is uncertain.
 * 
 * @param geoAddress - Address with associated coordinates
 * @param providedCoords - Coordinates provided for verification
 * @param config - Geo-insurance configuration
 * @returns Verification result
 * 
 * @example
 * ```ts
 * const address: GeoAddress = {
 *   pid: 'JP-13-113-01',
 *   center: { latitude: 35.6812, longitude: 139.7671 }
 * };
 * 
 * const userCoords: GeoCoordinates = {
 *   latitude: 35.6815,
 *   longitude: 139.7669,
 *   accuracy: 10
 * };
 * 
 * const result = verifyAddressWithGeo(address, userCoords);
 * // Returns: { valid: true, confidence: 0.95, distance: 35, withinTolerance: true }
 * ```
 */
export function verifyAddressWithGeo(
  geoAddress: GeoAddress,
  providedCoords: GeoCoordinates,
  config: Partial<GeoInsuranceConfig> = {}
): GeoVerificationResult {
  const mergedConfig = { ...defaultGeoInsuranceConfig, ...config };
  
  // Validate input coordinates
  if (!validateCoordinates(providedCoords)) {
    return {
      valid: false,
      confidence: 0,
      distance: -1,
      withinTolerance: false,
      method: 'center',
    };
  }
  
  // Method 1: Check against bounds if available
  if (geoAddress.bounds) {
    const withinBounds = isWithinBounds(providedCoords, geoAddress.bounds);
    if (withinBounds) {
      const distance = calculateDistance(providedCoords, geoAddress.center);
      return {
        valid: true,
        confidence: 1.0,
        distance,
        withinTolerance: true,
        method: 'bounds',
      };
    }
  }
  
  // Method 2: Calculate distance from center
  const distance = calculateDistance(providedCoords, geoAddress.center);
  
  // Account for provided accuracy
  const effectiveTolerance = mergedConfig.toleranceMeters + 
    (providedCoords.accuracy || 0);
  
  const withinTolerance = distance <= effectiveTolerance;
  
  // Calculate confidence based on distance
  // Confidence decreases exponentially with distance
  const confidence = calculateConfidence(distance, effectiveTolerance);
  
  const valid = withinTolerance && confidence >= mergedConfig.minConfidence;
  
  return {
    valid,
    confidence,
    distance,
    withinTolerance,
    method: 'center',
  };
}

/**
 * Calculates confidence score based on distance
 * 距離に基づく信頼度スコアを計算
 * 
 * @param distance - Actual distance in meters
 * @param tolerance - Tolerance in meters
 * @returns Confidence score (0-1)
 */
function calculateConfidence(distance: number, tolerance: number): number {
  if (distance <= 0) {
    return 1.0;
  }
  
  if (distance > tolerance * 3) {
    return 0;
  }
  
  // Exponential decay: confidence = e^(-distance/tolerance)
  // At distance = tolerance, confidence ≈ 0.37
  // At distance = 0, confidence = 1.0
  const rawConfidence = Math.exp(-distance / tolerance);
  
  // Normalize to ensure values stay in 0-1 range
  return Math.max(0, Math.min(1, rawConfidence));
}

/**
 * Finds the best matching address for given coordinates (reverse geo-insurance)
 * 座標から最適な住所を特定（逆ジオインシュアランス）
 * 
 * @param coordinates - Coordinates to match
 * @param candidates - Candidate addresses with geo data
 * @param config - Configuration
 * @returns Best matching address or null
 */
export function findBestMatchingAddress(
  coordinates: GeoCoordinates,
  candidates: GeoAddress[],
  config: Partial<GeoInsuranceConfig> = {}
): GeoAddress | null {
  if (!validateCoordinates(coordinates) || candidates.length === 0) {
    return null;
  }
  
  const mergedConfig = { ...defaultGeoInsuranceConfig, ...config };
  
  let bestMatch: GeoAddress | null = null;
  let bestDistance = Infinity;
  
  for (const candidate of candidates) {
    // Skip if candidate coordinates are invalid
    if (!validateCoordinates(candidate.center)) {
      continue;
    }
    
    const distance = calculateDistance(coordinates, candidate.center);
    
    if (distance < bestDistance && distance <= mergedConfig.toleranceMeters) {
      bestDistance = distance;
      bestMatch = candidate;
    }
  }
  
  return bestMatch;
}

// ============================================================================
// Coordinate Formatting
// ============================================================================

/**
 * Formats coordinates as a string
 * 座標を文字列にフォーマット
 * 
 * @param coordinates - Coordinates to format
 * @param precision - Decimal precision (default: 6)
 * @returns Formatted string
 * 
 * @example
 * ```ts
 * const coords = { latitude: 35.6812, longitude: 139.7671 };
 * formatCoordinates(coords);
 * // Returns: "35.681200, 139.767100"
 * ```
 */
export function formatCoordinates(
  coordinates: GeoCoordinates,
  precision: number = 6
): string {
  const lat = coordinates.latitude.toFixed(precision);
  const lng = coordinates.longitude.toFixed(precision);
  return `${lat}, ${lng}`;
}

/**
 * Parses coordinate string to GeoCoordinates
 * 文字列から座標をパース
 * 
 * @param coordString - Coordinate string (e.g., "35.6812, 139.7671")
 * @returns Parsed coordinates or null if invalid
 */
export function parseCoordinates(coordString: string): GeoCoordinates | null {
  const parts = coordString.split(',').map(s => s.trim());
  
  if (parts.length !== 2) {
    return null;
  }
  
  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);
  
  const coordinates: GeoCoordinates = { latitude, longitude };
  
  if (!validateCoordinates(coordinates)) {
    return null;
  }
  
  return coordinates;
}

/**
 * Converts coordinates to various formats
 * 座標を各種フォーマットに変換
 */
export function convertCoordinateFormat(
  coordinates: GeoCoordinates,
  format: 'decimal' | 'dms' | 'dmm'
): string {
  const { latitude, longitude } = coordinates;
  
  switch (format) {
    case 'decimal':
      return formatCoordinates(coordinates);
    
    case 'dms': {
      // Degrees Minutes Seconds
      const latDMS = toDMS(latitude);
      const lngDMS = toDMS(longitude);
      const latDir = latitude >= 0 ? 'N' : 'S';
      const lngDir = longitude >= 0 ? 'E' : 'W';
      return `${latDMS}${latDir}, ${lngDMS}${lngDir}`;
    }
    
    case 'dmm': {
      // Degrees Decimal Minutes
      const latDMM = toDMM(latitude);
      const lngDMM = toDMM(longitude);
      const latDir = latitude >= 0 ? 'N' : 'S';
      const lngDir = longitude >= 0 ? 'E' : 'W';
      return `${latDMM}${latDir}, ${lngDMM}${lngDir}`;
    }
    
    default:
      return formatCoordinates(coordinates);
  }
}

/**
 * Converts decimal degrees to DMS format
 */
function toDMS(decimal: number): string {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutesDecimal = (abs - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = (minutesDecimal - minutes) * 60;
  
  return `${degrees}°${minutes}'${seconds.toFixed(2)}"`;
}

/**
 * Converts decimal degrees to DMM format
 */
function toDMM(decimal: number): string {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutes = (abs - degrees) * 60;
  
  return `${degrees}°${minutes.toFixed(4)}'`;
}

// ============================================================================
// Geo-Address Creation
// ============================================================================

/**
 * Creates a GeoAddress from PID and coordinates
 * PIDと座標からGeoAddressを作成
 * 
 * @param pid - Address PID
 * @param center - Center coordinates
 * @param bounds - Optional bounds
 * @returns GeoAddress
 * 
 * @example
 * ```ts
 * const geoAddr = createGeoAddress(
 *   'JP-13-113-01',
 *   { latitude: 35.6812, longitude: 139.7671 }
 * );
 * ```
 */
export function createGeoAddress(
  pid: string,
  center: GeoCoordinates,
  bounds?: GeoBounds
): GeoAddress {
  if (!validateCoordinates(center)) {
    throw new Error('Invalid center coordinates');
  }
  
  if (bounds) {
    if (!validateCoordinates({ latitude: bounds.northeast.latitude, longitude: bounds.northeast.longitude }) ||
        !validateCoordinates({ latitude: bounds.southwest.latitude, longitude: bounds.southwest.longitude })) {
      throw new Error('Invalid bounds coordinates');
    }
  }
  
  return {
    pid,
    center,
    bounds,
    verified: false,
  };
}

/**
 * Creates bounds from center and radius
 * 中心座標と半径から境界を作成
 * 
 * @param center - Center coordinates
 * @param radiusMeters - Radius in meters
 * @returns GeoBounds
 */
export function createBoundsFromRadius(
  center: GeoCoordinates,
  radiusMeters: number
): GeoBounds {
  // Calculate approximate degree offset
  // 1 degree latitude ≈ 111,320 meters
  // 1 degree longitude varies with latitude
  const latOffset = radiusMeters / 111320;
  const lngOffset = radiusMeters / (111320 * Math.cos(toRadians(center.latitude)));
  
  return {
    northeast: {
      latitude: center.latitude + latOffset,
      longitude: center.longitude + lngOffset,
    },
    southwest: {
      latitude: center.latitude - latOffset,
      longitude: center.longitude - lngOffset,
    },
  };
}

// ============================================================================
// Geocoding API (Forward & Reverse Geocoding)
// ============================================================================

/**
 * Default Nominatim API endpoint (OpenStreetMap)
 */
const DEFAULT_GEOCODING_API = 'https://nominatim.openstreetmap.org';

/**
 * Default number of results to fetch from geocoding API
 */
const DEFAULT_GEOCODING_LIMIT = 5;

/**
 * Default zoom level for reverse geocoding (18 = high detail)
 */
const DEFAULT_REVERSE_GEOCODING_ZOOM = 18;

/**
 * Request timeout in milliseconds
 */
const GEOCODING_TIMEOUT_MS = 10000;

/**
 * Cache for geocoding results to reduce API calls
 */
const geocodingCache = new Map<string, GeocodingResult>();

/**
 * Forward geocoding: Convert address to coordinates
 * フォワードジオコーディング: 住所から座標への変換
 * 
 * @param request - Geocoding request with address
 * @returns Promise<GeocodingResult>
 * 
 * @example
 * ```ts
 * const result = await forwardGeocode({
 *   address: {
 *     street: '1-1-1 Chiyoda',
 *     city: 'Chiyoda-ku',
 *     province: 'Tokyo',
 *     country: 'JP',
 *     postalCode: '100-0001'
 *   }
 * });
 * // Returns: { success: true, coordinates: { latitude: 35.6812, longitude: 139.7671 }, ... }
 * ```
 */
export async function forwardGeocode(
  request: GeocodingRequest
): Promise<GeocodingResult> {
  if (!request.address && !request.pid) {
    return {
      success: false,
      confidence: 0,
      error: 'Either address or PID is required for forward geocoding',
    };
  }

  // Check cache
  const cacheKey = JSON.stringify(request);
  const cached = geocodingCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let query = '';
  
  // Build query from address
  if (request.address) {
    const parts: string[] = [];
    const addr = request.address;
    
    if (addr.street_address) parts.push(addr.street_address);
    if (addr.city) parts.push(addr.city);
    if (addr.province) parts.push(addr.province);
    if (addr.postal_code) parts.push(addr.postal_code);
    if (addr.country) parts.push(addr.country);
    
    query = parts.join(', ');
  } else if (request.pid) {
    // For PID, extract country and region codes
    query = request.pid;
  }

  // Call Nominatim API
  const url = new URL(`${DEFAULT_GEOCODING_API}/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', DEFAULT_GEOCODING_LIMIT.toString());
  url.searchParams.set('addressdetails', '1');
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEOCODING_TIMEOUT_MS);
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': '@vey/core geocoding client',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      const result: GeocodingResult = {
        success: false,
        confidence: 0,
        error: 'No results found for the given address',
      };
      geocodingCache.set(cacheKey, result);
      return result;
    }

    // Process results
    const primary = data[0];
    const coordinates: GeoCoordinates = {
      latitude: parseFloat(primary.lat),
      longitude: parseFloat(primary.lon),
      source: 'nominatim',
    };

    // Calculate confidence based on importance score
    const confidence = Math.min(1.0, parseFloat(primary.importance) || 0.5);

    // Process alternatives
    const alternatives = data.slice(1, 5).map(item => ({
      coordinates: {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        source: 'nominatim' as GeoSource,
      },
      confidence: Math.min(1.0, parseFloat(item.importance) || 0.3),
    }));

    const result: GeocodingResult = {
      success: true,
      coordinates,
      confidence,
      alternatives: alternatives.length > 0 ? alternatives : undefined,
    };

    // Cache result
    geocodingCache.set(cacheKey, result);

    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      confidence: 0,
      error: `Geocoding failed: ${errorMessage}`,
    };
  }
}

/**
 * Reverse geocoding: Convert coordinates to address
 * リバースジオコーディング: 座標から住所への変換
 * 
 * @param request - Geocoding request with coordinates
 * @returns Promise<GeocodingResult>
 * 
 * @example
 * ```ts
 * const result = await reverseGeocode({
 *   coordinates: { latitude: 35.6812, longitude: 139.7671 }
 * });
 * // Returns: { success: true, address: { country: 'JP', city: 'Tokyo', ... }, ... }
 * ```
 */
export async function reverseGeocode(
  request: GeocodingRequest
): Promise<GeocodingResult> {
  if (!request.coordinates) {
    return {
      success: false,
      confidence: 0,
      error: 'Coordinates are required for reverse geocoding',
    };
  }

  if (!validateCoordinates(request.coordinates)) {
    return {
      success: false,
      confidence: 0,
      error: 'Invalid coordinates provided',
    };
  }

  // Check cache
  const cacheKey = JSON.stringify(request);
  const cached = geocodingCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { latitude, longitude } = request.coordinates;

    // Call Nominatim reverse API
    const url = new URL(`${DEFAULT_GEOCODING_API}/reverse`);
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('zoom', DEFAULT_REVERSE_GEOCODING_ZOOM.toString());
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEOCODING_TIMEOUT_MS);
    
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': '@vey/core geocoding client',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.address) {
      const result: GeocodingResult = {
        success: false,
        confidence: 0,
        error: 'No address found for the given coordinates',
      };
      geocodingCache.set(cacheKey, result);
      return result;
    }

    // Parse address components
    const addr = data.address;
    const address: AddressInput = {
      country: addr.country_code?.toUpperCase() || '',
      province: addr.state || addr.province || addr.region || '',
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      district: addr.suburb || addr.district || addr.neighbourhood || '',
      street_address: [
        addr.road,
        addr.house_number,
      ].filter(Boolean).join(' '),
      postal_code: addr.postcode || '',
    };

    const confidence = Math.min(1.0, parseFloat(data.importance) || 0.5);

    const result: GeocodingResult = {
      success: true,
      address,
      coordinates: request.coordinates,
      confidence,
    };

    // Cache result
    geocodingCache.set(cacheKey, result);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      confidence: 0,
      error: `Reverse geocoding failed: ${errorMessage}`,
    };
  }
}

/**
 * Geocode function: Auto-detect forward or reverse geocoding
 * ジオコーディング関数: フォワード/リバースを自動検出
 * 
 * @param request - Geocoding request
 * @returns Promise<GeocodingResult>
 * 
 * @example
 * ```ts
 * // Forward geocoding
 * const forward = await geocode({ address: { city: 'Tokyo', country: 'JP' } });
 * 
 * // Reverse geocoding
 * const reverse = await geocode({ coordinates: { latitude: 35.6812, longitude: 139.7671 } });
 * ```
 */
export async function geocode(
  request: GeocodingRequest
): Promise<GeocodingResult> {
  if (request.coordinates) {
    return reverseGeocode(request);
  } else if (request.address || request.pid) {
    return forwardGeocode(request);
  } else {
    return {
      success: false,
      confidence: 0,
      error: 'Either address/PID or coordinates must be provided',
    };
  }
}

/**
 * Clear geocoding cache
 * ジオコーディングキャッシュをクリア
 */
export function clearGeocodingCache(): void {
  geocodingCache.clear();
}

/**
 * Get geocoding cache statistics
 * ジオコーディングキャッシュの統計を取得
 */
export function getGeocodingCacheStats(): { size: number; keys: string[] } {
  return {
    size: geocodingCache.size,
    keys: Array.from(geocodingCache.keys()),
  };
}
