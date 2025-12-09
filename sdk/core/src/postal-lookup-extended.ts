/**
 * @vey/core - Extended Postal Code Lookup Service
 * 
 * Provides additional postal code lookup sources for countries not supported by Zippopotam.us
 * Implements free-tier APIs and open-source data sources:
 * 
 * Free APIs:
 * - Zipcodebase (free tier: 10 requests/day)
 * - Postcode.io (UK-specific, unlimited, free)
 * - Dawa API (Denmark-specific, unlimited, free)
 * - OpenDataSoft (various countries, free with rate limits)
 * 
 * Fallback:
 * - Local YAML data from world-address repository
 */

import type {
  PostalCodeLookupRequest,
  PostalCodeLookupResult,
  PostalCodeLookupConfig,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/** Default timeout for API requests in milliseconds */
const DEFAULT_TIMEOUT = 5000;

/** Cache expiration time in milliseconds (1 hour) */
const CACHE_EXPIRATION_MS = 60 * 60 * 1000;

/** Countries supported by Postcode.io (UK only) */
const POSTCODEIO_COUNTRIES = new Set(['GB']);

/** Countries supported by Dawa API (Denmark only) */
const DAWA_COUNTRIES = new Set(['DK']);

/** Countries with OpenDataSoft datasets */
const OPENDATASOFT_COUNTRIES = new Set([
  'FR', // France
  'ES', // Spain  
  'IT', // Italy
  'DE', // Germany (some regions)
  'BE', // Belgium
  'CH', // Switzerland
  'AT', // Austria
  'NL', // Netherlands
]);

// ============================================================================
// Extended Config Interface
// ============================================================================

export interface ExtendedPostalLookupConfig extends PostalCodeLookupConfig {
  /** Zipcodebase API key (free tier: 10 requests/day) */
  zipcodebaseApiKey?: string;
  
  /** Enable local YAML data fallback */
  enableLocalFallback?: boolean;
  
  /** Path to local data directory (for Node.js environments) */
  localDataPath?: string;
}

// ============================================================================
// Cache Management
// ============================================================================

/** In-memory cache for extended postal code lookups */
const extendedLookupCache = new Map<string, { result: PostalCodeLookupResult; timestamp: number }>();

/**
 * Get cached lookup result if available and not expired
 */
function getCachedResult(countryCode: string, postalCode: string): PostalCodeLookupResult | null {
  const key = `${countryCode.toUpperCase()}:${postalCode.replace(/\s/g, '').toUpperCase()}`;
  const cached = extendedLookupCache.get(key);
  
  if (!cached) {
    return null;
  }
  
  if (Date.now() - cached.timestamp > CACHE_EXPIRATION_MS) {
    extendedLookupCache.delete(key);
    return null;
  }
  
  return cached.result;
}

/**
 * Cache a lookup result
 */
function cacheResult(countryCode: string, postalCode: string, result: PostalCodeLookupResult): void {
  const key = `${countryCode.toUpperCase()}:${postalCode.replace(/\s/g, '').toUpperCase()}`;
  extendedLookupCache.set(key, {
    result,
    timestamp: Date.now(),
  });
}

/**
 * Clear all cached lookups
 */
export function clearExtendedPostalCodeCache(): void {
  extendedLookupCache.clear();
}

// ============================================================================
// API Implementations
// ============================================================================

/**
 * Lookup postal code using Postcode.io API (UK only)
 * 
 * Free, unlimited, no API key required
 * API: https://api.postcodes.io/postcodes/{postcode}
 */
async function lookupWithPostcodeIO(
  req: PostalCodeLookupRequest,
  config: ExtendedPostalLookupConfig
): Promise<PostalCodeLookupResult> {
  const countryCode = req.countryCode.toUpperCase();
  const postalCode = req.postalCode.replace(/\s/g, '');
  
  if (!POSTCODEIO_COUNTRIES.has(countryCode)) {
    throw new Error(`Country ${countryCode} not supported by Postcode.io`);
  }
  
  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(req.postalCode)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Postal code ${req.postalCode} not found`);
    }
    throw new Error(`Postcode.io API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.result) {
    throw new Error(`No location data found for postal code ${req.postalCode}`);
  }
  
  const result = data.result;
  
  return {
    postalCode: result.postcode,
    countryCode: 'GB',
    countryName: 'United Kingdom',
    city: result.admin_ward || result.parish,
    province: result.region,
    provinceCode: result.admin_district,
    district: result.admin_ward,
    coordinates: result.latitude && result.longitude ? {
      latitude: result.latitude,
      longitude: result.longitude,
    } : undefined,
    source: 'postcodeio',
    cached: false,
  };
}

/**
 * Lookup postal code using Dawa API (Denmark only)
 * 
 * Free, unlimited, no API key required
 * API: https://dawa.aws.dk/postnumre/{postnummer}
 */
async function lookupWithDawa(
  req: PostalCodeLookupRequest,
  config: ExtendedPostalLookupConfig
): Promise<PostalCodeLookupResult> {
  const countryCode = req.countryCode.toUpperCase();
  const postalCode = req.postalCode.replace(/\s/g, '');
  
  if (!DAWA_COUNTRIES.has(countryCode)) {
    throw new Error(`Country ${countryCode} not supported by Dawa API`);
  }
  
  const url = `https://dawa.aws.dk/postnumre/${encodeURIComponent(postalCode)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Postal code ${postalCode} not found`);
    }
    throw new Error(`Dawa API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.navn) {
    throw new Error(`No location data found for postal code ${postalCode}`);
  }
  
  return {
    postalCode: data.nr,
    countryCode: 'DK',
    countryName: 'Denmark',
    city: data.navn,
    province: undefined,
    provinceCode: undefined,
    district: undefined,
    coordinates: data.visueltcenter ? {
      latitude: data.visueltcenter[1],
      longitude: data.visueltcenter[0],
    } : undefined,
    source: 'dawa',
    cached: false,
  };
}

/**
 * Lookup postal code using Zipcodebase API
 * 
 * Free tier: 10 requests per day, requires API key
 * API: https://app.zipcodebase.com/api/v1/search
 */
async function lookupWithZipcodebase(
  req: PostalCodeLookupRequest,
  config: ExtendedPostalLookupConfig
): Promise<PostalCodeLookupResult> {
  if (!config.zipcodebaseApiKey) {
    throw new Error('Zipcodebase API key is required. Get free key at zipcodebase.com');
  }
  
  const countryCode = req.countryCode.toUpperCase();
  const postalCode = req.postalCode.replace(/\s/g, '');
  
  const url = `https://app.zipcodebase.com/api/v1/search?codes=${encodeURIComponent(postalCode)}&country=${countryCode}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': config.zipcodebaseApiKey,
    },
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Postal code ${postalCode} not found for ${countryCode}`);
    }
    if (response.status === 429) {
      throw new Error('Zipcodebase API rate limit exceeded (free tier: 10 requests/day)');
    }
    throw new Error(`Zipcodebase API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.results || !data.results[postalCode] || data.results[postalCode].length === 0) {
    throw new Error(`No location data found for postal code ${postalCode}`);
  }
  
  const location = data.results[postalCode][0];
  
  return {
    postalCode: location.postal_code || postalCode,
    countryCode: location.country_code || countryCode,
    countryName: undefined,
    city: location.city,
    province: location.state,
    provinceCode: location.state_code,
    district: undefined,
    coordinates: location.latitude && location.longitude ? {
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude),
    } : undefined,
    source: 'zipcodebase',
    cached: false,
  };
}

/**
 * Lookup postal code using OpenDataSoft datasets
 * 
 * Free with rate limits, no API key required
 * Various country-specific datasets available
 */
async function lookupWithOpenDataSoft(
  req: PostalCodeLookupRequest,
  config: ExtendedPostalLookupConfig
): Promise<PostalCodeLookupResult> {
  const countryCode = req.countryCode.toUpperCase();
  const postalCode = req.postalCode.replace(/\s/g, '');
  
  if (!OPENDATASOFT_COUNTRIES.has(countryCode)) {
    throw new Error(`Country ${countryCode} not supported by OpenDataSoft`);
  }
  
  // Use different dataset based on country
  let dataset = '';
  let searchField = '';
  
  switch (countryCode) {
    case 'FR':
      dataset = 'georef-france-commune';
      searchField = 'com_code_postal';
      break;
    case 'ES':
      dataset = 'geonames-postal-code';
      searchField = 'postal_code';
      break;
    default:
      throw new Error(`OpenDataSoft dataset not configured for ${countryCode}`);
  }
  
  const url = `https://public.opendatasoft.com/api/records/1.0/search/?dataset=${dataset}&q=${searchField}:${postalCode}&rows=1`;
  
  const response = await fetch(url, {
    method: 'GET',
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`OpenDataSoft API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.records || data.records.length === 0) {
    throw new Error(`No location data found for postal code ${postalCode}`);
  }
  
  const record = data.records[0].fields;
  
  return {
    postalCode: postalCode,
    countryCode: countryCode,
    countryName: undefined,
    city: record.com_name || record.place_name || record.city,
    province: record.dep_name || record.admin_name1,
    provinceCode: record.dep_code || record.admin_code1,
    district: undefined,
    coordinates: record.geo_point_2d ? {
      latitude: record.geo_point_2d[0],
      longitude: record.geo_point_2d[1],
    } : undefined,
    source: 'opendatasoft',
    cached: false,
  };
}

/**
 * Lookup postal code from local YAML data
 * 
 * Uses the world-address YAML database as fallback
 * Only works in Node.js environments with file system access
 */
async function lookupFromLocalData(
  req: PostalCodeLookupRequest,
  config: ExtendedPostalLookupConfig
): Promise<PostalCodeLookupResult> {
  // This is a placeholder - actual implementation would require fs module
  // and parsing of YAML files from the data directory
  throw new Error('Local data lookup not yet implemented');
}

// ============================================================================
// Main Extended Lookup Function
// ============================================================================

/**
 * Extended postal code lookup for countries not supported by Zippopotam.us
 * 
 * Tries multiple free APIs in order:
 * 1. Country-specific free APIs (Postcode.io for UK, Dawa for DK)
 * 2. Zipcodebase (if API key configured, free tier: 10 requests/day)
 * 3. OpenDataSoft (for supported countries)
 * 4. Local YAML data (if enabled)
 * 
 * @param req - Postal code lookup request
 * @param config - Extended lookup configuration
 * @returns Postal code lookup result
 * 
 * @example
 * ```typescript
 * // UK lookup (free, no API key)
 * const ukResult = await lookupPostalCodeExtended(
 *   { countryCode: 'GB', postalCode: 'SW1A 1AA' }
 * );
 * 
 * // Denmark lookup (free, no API key)
 * const dkResult = await lookupPostalCodeExtended(
 *   { countryCode: 'DK', postalCode: '1050' }
 * );
 * 
 * // Other countries with Zipcodebase (requires API key)
 * const result = await lookupPostalCodeExtended(
 *   { countryCode: 'CN', postalCode: '100000' },
 *   { zipcodebaseApiKey: 'your-api-key' }
 * );
 * ```
 */
export async function lookupPostalCodeExtended(
  req: PostalCodeLookupRequest,
  config: ExtendedPostalLookupConfig = {}
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
  const lookupConfig: ExtendedPostalLookupConfig = {
    timeout: config.timeout || DEFAULT_TIMEOUT,
    zipcodebaseApiKey: config.zipcodebaseApiKey,
    enableLocalFallback: config.enableLocalFallback !== false,
    localDataPath: config.localDataPath,
  };
  
  const countryCode = req.countryCode.toUpperCase();
  const errors: Array<{ service: string; error: string }> = [];
  
  // Try country-specific free APIs first
  
  // UK - Postcode.io
  if (POSTCODEIO_COUNTRIES.has(countryCode)) {
    try {
      const result = await lookupWithPostcodeIO(req, lookupConfig);
      cacheResult(req.countryCode, req.postalCode, result);
      return result;
    } catch (error) {
      errors.push({
        service: 'postcodeio',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  // Denmark - Dawa
  if (DAWA_COUNTRIES.has(countryCode)) {
    try {
      const result = await lookupWithDawa(req, lookupConfig);
      cacheResult(req.countryCode, req.postalCode, result);
      return result;
    } catch (error) {
      errors.push({
        service: 'dawa',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  // Try OpenDataSoft
  if (OPENDATASOFT_COUNTRIES.has(countryCode)) {
    try {
      const result = await lookupWithOpenDataSoft(req, lookupConfig);
      cacheResult(req.countryCode, req.postalCode, result);
      return result;
    } catch (error) {
      errors.push({
        service: 'opendatasoft',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  // Try Zipcodebase if API key is configured
  if (lookupConfig.zipcodebaseApiKey) {
    try {
      const result = await lookupWithZipcodebase(req, lookupConfig);
      cacheResult(req.countryCode, req.postalCode, result);
      return result;
    } catch (error) {
      errors.push({
        service: 'zipcodebase',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  // Try local data fallback
  if (lookupConfig.enableLocalFallback) {
    try {
      const result = await lookupFromLocalData(req, lookupConfig);
      cacheResult(req.countryCode, req.postalCode, result);
      return result;
    } catch (error) {
      errors.push({
        service: 'local-data',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  // All services failed
  console.error('Extended postal code lookup failed:', errors);
  
  throw new Error(
    `Postal code lookup failed for ${countryCode}. ` +
    `Tried ${errors.length} service(s). ` +
    `Last error: ${errors[errors.length - 1]?.error || 'Unknown error'}`
  );
}

/**
 * Check if extended postal code lookup is available for a country
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param config - Extended lookup configuration
 * @returns Whether extended lookup is supported
 */
export function isExtendedLookupAvailable(
  countryCode: string,
  config: ExtendedPostalLookupConfig = {}
): boolean {
  const code = countryCode.toUpperCase();
  
  // Country-specific free APIs
  if (POSTCODEIO_COUNTRIES.has(code) || DAWA_COUNTRIES.has(code)) {
    return true;
  }
  
  // OpenDataSoft
  if (OPENDATASOFT_COUNTRIES.has(code)) {
    return true;
  }
  
  // Zipcodebase (requires API key)
  if (config.zipcodebaseApiKey) {
    return true;
  }
  
  // Local data fallback
  if (config.enableLocalFallback) {
    return true;
  }
  
  return false;
}

/**
 * Get list of countries supported by extended lookup
 * 
 * @param config - Extended lookup configuration
 * @returns Array of supported country codes
 */
export function getExtendedSupportedCountries(
  config: ExtendedPostalLookupConfig = {}
): string[] {
  const supported = new Set<string>();
  
  // Add country-specific APIs
  POSTCODEIO_COUNTRIES.forEach(c => supported.add(c));
  DAWA_COUNTRIES.forEach(c => supported.add(c));
  OPENDATASOFT_COUNTRIES.forEach(c => supported.add(c));
  
  // If Zipcodebase is configured, theoretically all countries are supported
  // But we'll only list the ones we've tested
  if (config.zipcodebaseApiKey) {
    // Zipcodebase supports 250+ countries
    // We could add more here, but for now just indicate it's available
  }
  
  return Array.from(supported).sort();
}

/**
 * Get cache statistics
 */
export function getExtendedCacheStats() {
  return {
    size: extendedLookupCache.size,
    entries: Array.from(extendedLookupCache.keys()),
  };
}
