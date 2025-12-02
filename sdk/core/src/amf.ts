/**
 * @vey/core - AMF (Address Mapping Framework) module
 * 
 * Address normalization and mapping according to each country's address format.
 * AMF converts raw address input into a standardized, normalized format.
 */

import type {
  AddressInput,
  CountryAddressFormat,
  NormalizedAddress,
  PIDComponents,
} from './types';

/**
 * Normalizes a raw address according to the country format
 * 
 * @param rawAddress - Raw address input
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param format - Country address format (optional, will be loaded if not provided)
 * @returns Normalized address
 * 
 * @example
 * ```ts
 * const normalized = await normalizeAddress(
 *   {
 *     country: 'JP',
 *     postalCode: '150-0043',
 *     province: '東京都',
 *     city: '渋谷区',
 *     streetAddress: '道玄坂1-2-3',
 *   },
 *   'JP'
 * );
 * // Result: { countryCode: 'JP', admin1: '13', admin2: '113', ... }
 * ```
 */
export async function normalizeAddress(
  rawAddress: AddressInput,
  countryCode: string,
  format?: CountryAddressFormat
): Promise<NormalizedAddress> {
  // Basic normalization
  const normalized: NormalizedAddress = {
    countryCode: countryCode.toUpperCase(),
  };

  // Map administrative divisions
  if (rawAddress.province) {
    normalized.admin1 = mapAdminCode(rawAddress.province, countryCode, 1);
  }

  if (rawAddress.city) {
    normalized.admin2 = mapAdminCode(rawAddress.city, countryCode, 2);
  }

  // Normalize locality
  if (rawAddress.district) {
    normalized.locality = rawAddress.district;
  }

  if (rawAddress.ward) {
    normalized.sublocality = rawAddress.ward;
  }

  // Normalize building/unit information
  if (rawAddress.building) {
    normalized.building = rawAddress.building;
  }

  if (rawAddress.unit || rawAddress.room) {
    normalized.unit = rawAddress.unit || rawAddress.room;
  }

  return normalized;
}

/**
 * Denormalizes a normalized address back to display format
 * 
 * @param normalized - Normalized address
 * @param countryCode - Country code
 * @param language - Target language (default: 'en')
 * @returns Display-ready address object
 */
export function denormalizeAddress(
  normalized: NormalizedAddress,
  countryCode: string,
  language: string = 'en'
): AddressInput {
  const address: AddressInput = {
    country: countryCode,
  };

  if (normalized.locality) {
    address.district = normalized.locality;
  }

  if (normalized.sublocality) {
    address.ward = normalized.sublocality;
  }

  if (normalized.building) {
    address.building = normalized.building;
  }

  if (normalized.unit) {
    address.unit = normalized.unit;
  }

  return address;
}

/**
 * Normalizes postal code format
 */
function normalizePostalCode(postalCode: string, countryCode: string): string {
  // Remove all spaces and dashes
  let normalized = postalCode.replace(/[\s-]/g, '');

  // Country-specific normalization
  switch (countryCode.toUpperCase()) {
    case 'JP':
      // Japan: Add dash between 3 and 4 digits (e.g., 1500043 -> 150-0043)
      if (normalized.length === 7 && /^\d{7}$/.test(normalized)) {
        normalized = `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
      }
      break;

    case 'US':
      // USA: Can be 5 or 9 digits (ZIP or ZIP+4)
      if (normalized.length === 9 && /^\d{9}$/.test(normalized)) {
        normalized = `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
      }
      break;

    case 'CA':
      // Canada: Format as A1A 1A1
      normalized = normalized.toUpperCase();
      if (normalized.length === 6 && /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalized)) {
        normalized = `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
      }
      break;

    case 'GB':
      // UK: Various formats, uppercase only
      normalized = normalized.toUpperCase();
      break;

    default:
      // Keep as-is for other countries
      break;
  }

  return normalized;
}

/**
 * Maps administrative division name to code
 * 
 * This is a simplified version. In production, this would use
 * a comprehensive mapping database.
 */
function mapAdminCode(
  name: string,
  countryCode: string,
  level: number
): string {
  // Simplified mapping - in production this would query a database
  // For Japan prefectures
  const jpPrefectures: Record<string, string> = {
    '東京都': '13',
    '北海道': '01',
    '大阪府': '27',
    '京都府': '26',
    '神奈川県': '14',
    '埼玉県': '11',
    '千葉県': '12',
    '愛知県': '23',
    '福岡県': '40',
    '兵庫県': '28',
  };

  if (countryCode === 'JP' && level === 1) {
    return jpPrefectures[name] || '00';
  }

  // For other countries and levels, return a placeholder
  // In production, this would use proper mapping
  return '00';
}

/**
 * Normalizes street address
 */
function normalizeStreetAddress(
  streetAddress: string,
  countryCode: string
): string {
  // Basic normalization: trim and normalize whitespace
  let normalized = streetAddress.trim().replace(/\s+/g, ' ');

  // Country-specific normalization can be added here
  switch (countryCode.toUpperCase()) {
    case 'JP':
      // For Japanese addresses, keep as-is
      break;

    case 'US':
    case 'GB':
      // For English addresses, capitalize properly
      // This is a simple version; production would be more sophisticated
      break;

    default:
      break;
  }

  return normalized;
}

/**
 * Validates field values for a normalized address
 */
export function validateNormalizedAddress(
  normalized: NormalizedAddress
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!normalized.countryCode) {
    errors.push('Country code is required');
  }

  if (normalized.countryCode && !/^[A-Z]{2}$/.test(normalized.countryCode)) {
    errors.push('Country code must be 2 uppercase letters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Converts normalized address to PID components
 */
export function normalizedAddressToPIDComponents(
  normalized: NormalizedAddress
): Partial<PIDComponents> {
  const components: Partial<PIDComponents> = {
    country: normalized.countryCode,
  };

  if (normalized.admin1) {
    components.admin1 = normalized.admin1;
  }

  if (normalized.admin2) {
    components.admin2 = normalized.admin2;
  }

  if (normalized.locality) {
    // Extract locality code if available
    // This is simplified; production would have proper parsing
    components.locality = '01';
  }

  return components;
}
