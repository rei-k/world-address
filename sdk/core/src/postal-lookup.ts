/**
 * @vey/core - Postal Code Lookup Service
 * 
 * Provides postal code lookup and address auto-fill functionality using free-tier APIs.
 * Supports multiple countries with automatic API selection and fallback mechanisms.
 * 
 * Supported APIs:
 * - Zippopotam.us (free, no API key required, 60+ countries)
 * - GeoNames.org (free tier with registration, worldwide coverage)
 */

import type {
  PostalCodeLookupRequest,
  PostalCodeLookupResult,
  PostalCodeLookupConfig,
  AddressInput,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/** Default timeout for API requests in milliseconds */
const DEFAULT_TIMEOUT = 5000;

/** Cache expiration time in milliseconds (1 hour) */
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

/** Countries supported by Zippopotam.us API */
const ZIPPOPOTAM_COUNTRIES = new Set([
  'AD', 'AR', 'AS', 'AT', 'AU', 'AX', 'BD', 'BE', 'BG', 'BR', 'BY', 'CA', 'CH', 'CZ', 'DE', 'DK',
  'DO', 'ES', 'FI', 'FO', 'FR', 'GB', 'GF', 'GG', 'GL', 'GP', 'GT', 'GU', 'GY', 'HR', 'HU', 'IM',
  'IN', 'IS', 'IT', 'JE', 'JP', 'LI', 'LK', 'LT', 'LU', 'MC', 'MD', 'MH', 'MK', 'MP', 'MQ', 'MX',
  'MY', 'NC', 'NL', 'NO', 'NZ', 'PH', 'PK', 'PL', 'PM', 'PR', 'PT', 'RE', 'RO', 'RU', 'SE', 'SI',
  'SJ', 'SK', 'SM', 'TH', 'TR', 'UA', 'US', 'VA', 'VI', 'WF', 'YT', 'ZA',
]);

// ============================================================================
// Types
// ============================================================================

interface CachedLookup {
  result: PostalCodeLookupResult;
  timestamp: number;
}

// ============================================================================
// Cache Management
// ============================================================================

/** In-memory cache for postal code lookups */
const lookupCache = new Map<string, CachedLookup>();

/**
 * Generate cache key for postal code lookup
 */
function getCacheKey(countryCode: string, postalCode: string): string {
  return `${countryCode.toUpperCase()}:${postalCode.replace(/\s/g, '').toUpperCase()}`;
}

/**
 * Get cached lookup result if available and not expired
 */
function getCachedResult(countryCode: string, postalCode: string): PostalCodeLookupResult | null {
  const key = getCacheKey(countryCode, postalCode);
  const cached = lookupCache.get(key);
  
  if (!cached) {
    return null;
  }
  
  // Check if cache has expired
  if (Date.now() - cached.timestamp > CACHE_EXPIRATION_MS) {
    lookupCache.delete(key);
    return null;
  }
  
  return cached.result;
}

/**
 * Cache a lookup result
 */
function cacheResult(countryCode: string, postalCode: string, result: PostalCodeLookupResult): void {
  const key = getCacheKey(countryCode, postalCode);
  lookupCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Clear all cached lookups
 */
export function clearPostalCodeCache(): void {
  lookupCache.clear();
}

/**
 * Get cache statistics
 */
export function getPostalCodeCacheStats() {
  return {
    size: lookupCache.size,
    entries: Array.from(lookupCache.keys()),
  };
}

// ============================================================================
// API Implementations
// ============================================================================

/**
 * Lookup postal code using Zippopotam.us API
 * 
 * Free, no API key required, supports 60+ countries
 * API: http://api.zippopotam.us/{country-code}/{postal-code}
 */
async function lookupWithZippopotam(
  req: PostalCodeLookupRequest,
  config: PostalCodeLookupConfig
): Promise<PostalCodeLookupResult> {
  const countryCode = req.countryCode.toUpperCase();
  const postalCode = req.postalCode.replace(/\s/g, '');
  
  // Check if country is supported
  if (!ZIPPOPOTAM_COUNTRIES.has(countryCode)) {
    throw new Error(`Country ${countryCode} not supported by Zippopotam.us`);
  }
  
  const url = `http://api.zippopotam.us/${countryCode}/${postalCode}`;
  
  const response = await fetch(url, {
    method: 'GET',
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Postal code ${postalCode} not found for ${countryCode}`);
    }
    throw new Error(`Zippopotam.us API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Zippopotam.us returns data in this format:
  // {
  //   "post code": "90210",
  //   "country": "United States",
  //   "country abbreviation": "US",
  //   "places": [
  //     {
  //       "place name": "Beverly Hills",
  //       "longitude": "-118.4065",
  //       "state": "California",
  //       "state abbreviation": "CA",
  //       "latitude": "34.0901"
  //     }
  //   ]
  // }
  
  const place = data.places?.[0];
  if (!place) {
    throw new Error(`No location data found for postal code ${postalCode}`);
  }
  
  return {
    postalCode: data['post code'],
    countryCode: data['country abbreviation'],
    countryName: data.country,
    city: place['place name'],
    province: place.state,
    provinceCode: place['state abbreviation'],
    district: undefined,
    coordinates: place.latitude && place.longitude ? {
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
    } : undefined,
    source: 'zippopotam',
    cached: false,
  };
}

/**
 * Lookup postal code using GeoNames.org API
 * 
 * Free tier available with registration (username required)
 * API: http://api.geonames.org/postalCodeSearchJSON?postalcode={code}&country={country}&username={username}
 */
async function lookupWithGeoNames(
  req: PostalCodeLookupRequest,
  config: PostalCodeLookupConfig
): Promise<PostalCodeLookupResult> {
  if (!config.geonamesUsername) {
    throw new Error('GeoNames username is required. Register at geonames.org');
  }
  
  const countryCode = req.countryCode.toUpperCase();
  const postalCode = req.postalCode.replace(/\s/g, '');
  
  const params = new URLSearchParams({
    postalcode: postalCode,
    country: countryCode,
    username: config.geonamesUsername,
    maxRows: '1',
  });
  
  const url = `http://api.geonames.org/postalCodeSearchJSON?${params}`;
  
  const response = await fetch(url, {
    method: 'GET',
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`GeoNames API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data.status) {
    throw new Error(`GeoNames API error: ${data.status.message}`);
  }
  
  const codes = data.postalCodes || data.postalcodes;
  if (!codes || codes.length === 0) {
    throw new Error(`Postal code ${postalCode} not found for ${countryCode}`);
  }
  
  const result = codes[0];
  
  return {
    postalCode: result.postalCode || result.postalcode,
    countryCode: result.countryCode,
    countryName: undefined,
    city: result.placeName,
    province: result.adminName1,
    provinceCode: result.adminCode1,
    district: result.adminName2,
    coordinates: result.lat && result.lng ? {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lng),
    } : undefined,
    source: 'geonames',
    cached: false,
  };
}

// ============================================================================
// Main Lookup Function
// ============================================================================

/**
 * Lookup address information by postal code
 * 
 * Automatically selects the best available API based on:
 * - Country support
 * - Configuration
 * - Fallback preferences
 * 
 * Results are cached to minimize API calls and improve performance.
 * 
 * @param req - Postal code lookup request
 * @param config - Lookup configuration (API preferences, credentials, timeout)
 * @returns Postal code lookup result with address information
 * 
 * @example
 * ```typescript
 * // Using Zippopotam.us (no API key required)
 * const result = await lookupPostalCode(
 *   { countryCode: 'US', postalCode: '90210' },
 *   { preferredService: 'zippopotam', timeout: 5000 }
 * );
 * 
 * console.log(result.city); // "Beverly Hills"
 * console.log(result.province); // "California"
 * ```
 * 
 * @example
 * ```typescript
 * // Using GeoNames (requires free registration)
 * const result = await lookupPostalCode(
 *   { countryCode: 'JP', postalCode: '100-0001' },
 *   {
 *     preferredService: 'geonames',
 *     geonamesUsername: 'your_username',
 *     enableFallback: true,
 *   }
 * );
 * 
 * console.log(result.city); // City name
 * console.log(result.province); // Prefecture name
 * ```
 * 
 * @throws Error if lookup fails and no fallback is available
 */
export async function lookupPostalCode(
  req: PostalCodeLookupRequest,
  config: PostalCodeLookupConfig = {}
): Promise<PostalCodeLookupResult> {
  // Validate input
  if (!req.countryCode || !req.postalCode) {
    throw new Error('Country code and postal code are required');
  }
  
  // Check cache first
  const cached = getCachedResult(req.countryCode, req.postalCode);
  if (cached) {
    return { ...cached, cached: true };
  }
  
  // Set default configuration
  const lookupConfig: PostalCodeLookupConfig = {
    preferredService: config.preferredService || 'zippopotam',
    enableFallback: config.enableFallback !== false, // Default to true
    timeout: config.timeout || DEFAULT_TIMEOUT,
    geonamesUsername: config.geonamesUsername,
  };
  
  let lastError: Error | null = null;
  
  // Try preferred service first
  try {
    let result: PostalCodeLookupResult;
    
    if (lookupConfig.preferredService === 'zippopotam') {
      result = await lookupWithZippopotam(req, lookupConfig);
    } else if (lookupConfig.preferredService === 'geonames') {
      result = await lookupWithGeoNames(req, lookupConfig);
    } else {
      throw new Error(`Unsupported service: ${lookupConfig.preferredService}`);
    }
    
    // Cache successful result
    cacheResult(req.countryCode, req.postalCode, result);
    return result;
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error));
    
    // If fallback is disabled, throw immediately
    if (!lookupConfig.enableFallback) {
      throw lastError;
    }
  }
  
  // Try fallback service
  try {
    let result: PostalCodeLookupResult;
    
    if (lookupConfig.preferredService === 'zippopotam') {
      // Fallback to GeoNames if Zippopotam failed
      if (lookupConfig.geonamesUsername) {
        result = await lookupWithGeoNames(req, lookupConfig);
      } else {
        throw new Error('No fallback available: GeoNames username not configured');
      }
    } else {
      // Fallback to Zippopotam if GeoNames failed
      result = await lookupWithZippopotam(req, lookupConfig);
    }
    
    // Cache successful result
    cacheResult(req.countryCode, req.postalCode, result);
    return result;
  } catch (fallbackError) {
    // Both services failed, throw the original error
    console.error('Postal code lookup failed:', {
      primary: lastError?.message,
      fallback: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
    });
    
    throw lastError || new Error('Postal code lookup failed');
  }
}

/**
 * Auto-fill address fields from postal code lookup result
 * 
 * Merges postal code lookup data into an address while preserving
 * existing field values (doesn't overwrite user input).
 * 
 * @param address - Current address input
 * @param lookupResult - Postal code lookup result
 * @param options - Auto-fill options
 * @param options.overwriteExisting - Whether to overwrite existing field values (default: false)
 * @param options.fillCoordinates - Whether to fill coordinates if available (default: false)
 * @returns Updated address with auto-filled fields
 * 
 * @example
 * ```typescript
 * const address: AddressInput = {
 *   country: 'US',
 *   postal_code: '90210',
 * };
 * 
 * const lookupResult = await lookupPostalCode(
 *   { countryCode: 'US', postalCode: '90210' },
 *   { preferredService: 'zippopotam' }
 * );
 * 
 * const filledAddress = autoFillAddress(address, lookupResult);
 * console.log(filledAddress.city); // "Beverly Hills"
 * console.log(filledAddress.province); // "California"
 * ```
 */
export function autoFillAddress(
  address: AddressInput,
  lookupResult: PostalCodeLookupResult,
  options: {
    overwriteExisting?: boolean;
    fillCoordinates?: boolean;
  } = {}
): AddressInput {
  const { overwriteExisting = false } = options;
  const filled: AddressInput = { ...address };
  
  // Helper function to conditionally set field
  const setField = (field: keyof AddressInput, value: string | undefined) => {
    if (value && (overwriteExisting || !filled[field])) {
      filled[field] = value;
    }
  };
  
  // Fill address fields
  setField('postal_code', lookupResult.postalCode);
  setField('city', lookupResult.city);
  setField('province', lookupResult.province);
  setField('district', lookupResult.district);
  setField('country', lookupResult.countryCode);
  
  return filled;
}

/**
 * Check if postal code lookup is available for a country
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param config - Lookup configuration
 * @returns Whether postal code lookup is supported for this country
 * 
 * @example
 * ```typescript
 * if (isPostalCodeLookupAvailable('US')) {
 *   // Show auto-fill UI
 * }
 * ```
 */
export function isPostalCodeLookupAvailable(
  countryCode: string,
  config: PostalCodeLookupConfig = {}
): boolean {
  const code = countryCode.toUpperCase();
  
  // Zippopotam is available for supported countries
  if (ZIPPOPOTAM_COUNTRIES.has(code)) {
    return true;
  }
  
  // GeoNames is available if username is configured (supports all countries)
  if (config.geonamesUsername) {
    return true;
  }
  
  return false;
}

/**
 * Get list of countries supported by postal code lookup
 * 
 * @param config - Lookup configuration
 * @returns Array of supported country codes
 */
export function getSupportedCountries(config: PostalCodeLookupConfig = {}): string[] {
  const supported = new Set<string>(ZIPPOPOTAM_COUNTRIES);
  
  // If GeoNames is configured, all countries are supported
  // (GeoNames has worldwide coverage)
  if (config.geonamesUsername) {
    // Return Zippopotam countries as these are free without API key
    // GeoNames is used as fallback or for other countries
    return Array.from(supported);
  }
  
  return Array.from(supported);
}
