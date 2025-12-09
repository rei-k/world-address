/**
 * @vey/core - Unified Postal Code Lookup Service
 * 
 * Combines standard Zippopotam.us/GeoNames lookup with extended sources
 * to provide comprehensive worldwide postal code lookup coverage.
 * 
 * Lookup order:
 * 1. Zippopotam.us (70+ countries, free, no API key)
 * 2. Extended sources (country-specific free APIs)
 * 3. GeoNames (worldwide, requires registration)
 * 4. Zipcodebase (worldwide, free tier: 10 requests/day)
 * 5. Local YAML data (fallback)
 */

import type {
  PostalCodeLookupRequest,
  PostalCodeLookupResult,
  PostalCodeLookupConfig,
} from './types';

import {
  lookupPostalCode,
  isPostalCodeLookupAvailable,
  getSupportedCountries,
} from './postal-lookup';

import {
  lookupPostalCodeExtended,
  isExtendedLookupAvailable,
  getExtendedSupportedCountries,
  type ExtendedPostalLookupConfig,
} from './postal-lookup-extended';

// ============================================================================
// Unified Config Interface
// ============================================================================

export interface UnifiedPostalLookupConfig extends ExtendedPostalLookupConfig {
  /**
   * Preferred lookup strategy
   * - 'auto': Try Zippopotam first, then extended sources (default)
   * - 'zippopotam-only': Only use Zippopotam/GeoNames
   * - 'extended-only': Only use extended sources
   * - 'extended-first': Try extended sources first
   */
  strategy?: 'auto' | 'zippopotam-only' | 'extended-only' | 'extended-first';
  
  /**
   * Enable automatic fallback to other sources
   * Default: true
   */
  enableFallback?: boolean;
}

// ============================================================================
// Main Unified Lookup Function
// ============================================================================

/**
 * Unified postal code lookup with automatic source selection
 * 
 * Provides comprehensive worldwide coverage by combining:
 * - Zippopotam.us (70+ countries, free)
 * - Country-specific free APIs (UK, Denmark, etc.)
 * - GeoNames (worldwide, requires username)
 * - Zipcodebase (worldwide, requires API key)
 * - OpenDataSoft (select countries)
 * - Local YAML data (fallback)
 * 
 * @param req - Postal code lookup request
 * @param config - Unified lookup configuration
 * @returns Postal code lookup result
 * 
 * @example
 * ```typescript
 * // Simple lookup (uses Zippopotam if available)
 * const result = await lookupPostalCodeUnified({
 *   countryCode: 'US',
 *   postalCode: '90210'
 * });
 * 
 * // UK lookup (automatically uses Postcode.io)
 * const ukResult = await lookupPostalCodeUnified({
 *   countryCode: 'GB',
 *   postalCode: 'SW1A 1AA'
 * });
 * 
 * // Country not in Zippopotam (uses extended sources)
 * const cnResult = await lookupPostalCodeUnified(
 *   { countryCode: 'CN', postalCode: '100000' },
 *   { zipcodebaseApiKey: 'your-key' }
 * );
 * 
 * // Use GeoNames for worldwide coverage
 * const result = await lookupPostalCodeUnified(
 *   { countryCode: 'ANY', postalCode: 'xxxxx' },
 *   { geonamesUsername: 'your-username' }
 * );
 * ```
 */
export async function lookupPostalCodeUnified(
  req: PostalCodeLookupRequest,
  config: UnifiedPostalLookupConfig = {}
): Promise<PostalCodeLookupResult> {
  // Validate input
  if (!req.countryCode || !req.postalCode) {
    throw new Error('Country code and postal code are required');
  }
  
  const strategy = config.strategy || 'auto';
  const enableFallback = config.enableFallback !== false;
  
  const errors: Array<{ source: string; error: string }> = [];
  
  // Strategy: extended-only
  if (strategy === 'extended-only') {
    try {
      return await lookupPostalCodeExtended(req, config);
    } catch (error) {
      throw new Error(
        `Extended lookup failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  // Strategy: zippopotam-only
  if (strategy === 'zippopotam-only') {
    try {
      return await lookupPostalCode(req, config);
    } catch (error) {
      throw new Error(
        `Zippopotam/GeoNames lookup failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  
  // Strategy: extended-first
  if (strategy === 'extended-first') {
    // Try extended sources first
    if (isExtendedLookupAvailable(req.countryCode, config)) {
      try {
        return await lookupPostalCodeExtended(req, config);
      } catch (error) {
        errors.push({
          source: 'extended',
          error: error instanceof Error ? error.message : String(error),
        });
        
        if (!enableFallback) {
          throw new Error(errors[0].error);
        }
      }
    }
    
    // Fallback to Zippopotam/GeoNames
    if (isPostalCodeLookupAvailable(req.countryCode, config)) {
      try {
        return await lookupPostalCode(req, config);
      } catch (error) {
        errors.push({
          source: 'zippopotam',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  
  // Strategy: auto (default)
  // Try Zippopotam first (fastest, most reliable for supported countries)
  if (isPostalCodeLookupAvailable(req.countryCode, config)) {
    try {
      return await lookupPostalCode(req, config);
    } catch (error) {
      errors.push({
        source: 'zippopotam',
        error: error instanceof Error ? error.message : String(error),
      });
      
      if (!enableFallback) {
        throw new Error(errors[0].error);
      }
    }
  }
  
  // Try extended sources
  if (isExtendedLookupAvailable(req.countryCode, config)) {
    try {
      return await lookupPostalCodeExtended(req, config);
    } catch (error) {
      errors.push({
        source: 'extended',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  // All sources failed
  if (errors.length > 0) {
    console.error('Unified postal code lookup failed:', errors);
    throw new Error(
      `Postal code lookup failed for ${req.countryCode}:${req.postalCode}. ` +
      `Tried ${errors.length} source(s). ` +
      `Errors: ${errors.map(e => `${e.source}: ${e.error}`).join('; ')}`
    );
  }
  
  // No sources available
  throw new Error(
    `No postal code lookup sources available for ${req.countryCode}. ` +
    `Configure GeoNames username or Zipcodebase API key for worldwide coverage.`
  );
}

/**
 * Check if any postal code lookup source is available for a country
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param config - Unified lookup configuration
 * @returns Whether any lookup source is available
 */
export function isUnifiedLookupAvailable(
  countryCode: string,
  config: UnifiedPostalLookupConfig = {}
): boolean {
  return (
    isPostalCodeLookupAvailable(countryCode, config) ||
    isExtendedLookupAvailable(countryCode, config)
  );
}

/**
 * Get comprehensive list of all supported countries
 * 
 * Combines countries from all sources:
 * - Zippopotam.us
 * - Extended sources (Postcode.io, Dawa, OpenDataSoft, etc.)
 * - GeoNames (if configured)
 * - Zipcodebase (if configured)
 * 
 * @param config - Unified lookup configuration
 * @returns Array of supported country codes
 */
export function getAllSupportedCountries(
  config: UnifiedPostalLookupConfig = {}
): string[] {
  const allCountries = new Set<string>();
  
  // Add Zippopotam countries
  getSupportedCountries(config).forEach(c => allCountries.add(c));
  
  // Add extended source countries
  getExtendedSupportedCountries(config).forEach(c => allCountries.add(c));
  
  return Array.from(allCountries).sort();
}

/**
 * Get available lookup sources for a specific country
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param config - Unified lookup configuration
 * @returns Array of available source names
 */
export function getAvailableSources(
  countryCode: string,
  config: UnifiedPostalLookupConfig = {}
): string[] {
  const sources: string[] = [];
  
  if (isPostalCodeLookupAvailable(countryCode, config)) {
    sources.push('zippopotam');
  }
  
  if (config.geonamesUsername) {
    sources.push('geonames');
  }
  
  if (isExtendedLookupAvailable(countryCode, config)) {
    const code = countryCode.toUpperCase();
    
    if (code === 'GB') {
      sources.push('postcodeio');
    } else if (code === 'DK') {
      sources.push('dawa');
    }
    
    if (config.zipcodebaseApiKey) {
      sources.push('zipcodebase');
    }
    
    // Check OpenDataSoft support
    const openDataCountries = ['FR', 'ES', 'IT', 'DE', 'BE', 'CH', 'AT', 'NL'];
    if (openDataCountries.includes(code)) {
      sources.push('opendatasoft');
    }
  }
  
  return sources;
}

/**
 * Get recommended configuration for worldwide coverage
 * 
 * @returns Recommended configuration tips
 */
export function getRecommendedConfig(): {
  freeNoKey: string[];
  freeWithRegistration: string[];
  freeLimited: string[];
  paid: string[];
} {
  return {
    freeNoKey: [
      'Zippopotam.us - 70+ countries, no registration',
      'Postcode.io - UK only, unlimited',
      'Dawa API - Denmark only, unlimited',
      'OpenDataSoft - Select countries (FR, ES, etc.)',
    ],
    freeWithRegistration: [
      'GeoNames - Worldwide coverage, free registration required',
      'Get username at: https://www.geonames.org/login',
    ],
    freeLimited: [
      'Zipcodebase - 250+ countries, 10 requests/day free',
      'Get API key at: https://zipcodebase.com',
    ],
    paid: [
      'Zipcodebase Plus - Unlimited requests',
      'Google Geocoding API - Pay per request',
    ],
  };
}
