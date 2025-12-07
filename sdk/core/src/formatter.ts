/**
 * @vey/core - Address formatter
 * 
 * Provides utilities for formatting addresses according to country-specific conventions,
 * including address formatting, shipping label generation, and postal code utilities.
 */

import type {
  CountryAddressFormat,
  AddressInput,
} from './types';
import { getFieldOrder } from './validator';

/**
 * Options for customizing address formatting.
 */
export interface FormatOptions {
  /**
   * Context for field ordering: 'domestic', 'international', or 'postal'
   */
  context?: 'domestic' | 'international' | 'postal';
  
  /**
   * Separator to use between address fields (default: ', ')
   */
  separator?: string;
  
  /**
   * Whether to include the country name in the formatted address
   */
  includeCountry?: boolean;
  
  /**
   * Whether to convert the formatted address to uppercase
   */
  uppercase?: boolean;
}

/**
 * Formats an address according to country-specific conventions.
 * 
 * Takes an address input and country format definition and produces a properly
 * formatted address string following the country's standard ordering and conventions.
 * 
 * @param address - The address to format
 * @param format - The country's address format definition
 * @param options - Optional formatting options
 * 
 * @returns Formatted address string with fields in proper order
 * 
 * @example
 * ```typescript
 * const address = {
 *   recipient: '山田太郎',
 *   postal_code: '100-0001',
 *   province: '東京都',
 *   city: '千代田区',
 *   street_address: '千代田1-1'
 * };
 * 
 * const format = await loadCountryFormat('JP');
 * 
 * // Default formatting
 * const formatted = formatAddress(address, format);
 * 
 * // Custom formatting
 * const customFormatted = formatAddress(address, format, {
 *   separator: '\n',
 *   includeCountry: true,
 *   context: 'international',
 *   uppercase: false
 * });
 * ```
 */
export function formatAddress(
  address: AddressInput,
  format: CountryAddressFormat,
  options: FormatOptions = {}
): string {
  const {
    context = 'international',
    separator = ', ',
    includeCountry = true,
    uppercase = false,
  } = options;

  const order = getFieldOrder(format, context);
  const parts: string[] = [];

  for (const field of order) {
    if (field === 'country' && !includeCountry) {
      continue;
    }

    const value = address[field as keyof AddressInput];
    if (value) {
      parts.push(value);
    }
  }

  let formatted = parts.join(separator);

  if (uppercase) {
    formatted = formatted.toUpperCase();
  }

  return formatted;
}

/**
 * Formats an address for shipping label
 */
/**
 * Formats an address for use on a shipping label.
 * 
 * Creates a shipping label formatted address with proper line breaks,
 * capitalization, and ordering suitable for printing on shipping labels
 * or waybills.
 * 
 * @param address - The address to format for shipping
 * @param format - The country's address format definition
 * 
 * @returns Shipping label formatted address with uppercase text and proper line breaks
 * 
 * @example
 * ```typescript
 * const address = {
 *   recipient: 'John Smith',
 *   street_address: '123 Main St',
 *   city: 'San Francisco',
 *   province: 'CA',
 *   postal_code: '94102',
 *   country: 'US'
 * };
 * 
 * const format = await loadCountryFormat('US');
 * const label = formatShippingLabel(address, format);
 * console.log(label);
 * // Output:
 * // JOHN SMITH
 * // 123 MAIN ST
 * // SAN FRANCISCO, CA 94102
 * // UNITED STATES
 * ```
 */
export function formatShippingLabel(
  address: AddressInput,
  format: CountryAddressFormat
): string {
  const lines: string[] = [];

  // Recipient always first
  if (address.recipient) {
    lines.push(address.recipient);
  }

  // Building/floor/room if present
  const buildingParts: string[] = [];
  if (address.building) buildingParts.push(address.building);
  if (address.floor) buildingParts.push(address.floor);
  if (address.room) buildingParts.push(`Room ${address.room}`);
  if (buildingParts.length > 0) {
    lines.push(buildingParts.join(', '));
  }

  // Street address
  if (address.street_address) {
    lines.push(address.street_address);
  }

  // District/ward
  if (address.district) {
    lines.push(address.district);
  }
  if (address.ward) {
    lines.push(address.ward);
  }

  // City, Province, Postal code
  const cityLine: string[] = [];
  if (address.city) cityLine.push(address.city);
  if (address.province) cityLine.push(address.province);
  if (address.postal_code) cityLine.push(address.postal_code);
  if (cityLine.length > 0) {
    lines.push(cityLine.join(', '));
  }

  // Country
  if (address.country) {
    lines.push(address.country.toUpperCase());
  }

  return lines.join('\n');
}

/**
 * Gets an example postal code for a country.
 * 
 * Returns an example postal code that matches the country's format,
 * useful for placeholder text in forms or documentation.
 * 
 * @param format - The country's address format definition
 * 
 * @returns Example postal code string, or undefined if not available
 * 
 * @example
 * ```typescript
 * const jpFormat = await loadCountryFormat('JP');
 * console.log(getPostalCodeExample(jpFormat)); // "100-0001"
 * 
 * const usFormat = await loadCountryFormat('US');
 * console.log(getPostalCodeExample(usFormat)); // "94102-1234"
 * 
 * // Use in form placeholder
 * <input 
 *   placeholder={getPostalCodeExample(format) || 'Enter postal code'}
 *   pattern={getPostalCodeRegex(format)}
 * />
 * ```
 */
export function getPostalCodeExample(format: CountryAddressFormat): string | undefined {
  return format.address_format.postal_code?.example;
}

/**
 * Gets the regex pattern for validating postal codes in a country.
 * 
 * Returns the regular expression pattern used to validate postal codes
 * for the specified country. This can be used for client-side validation.
 * 
 * @param format - The country's address format definition
 * 
 * @returns Regex pattern string for postal code validation, or undefined if not available
 * 
 * @example
 * ```typescript
 * const jpFormat = await loadCountryFormat('JP');
 * const regex = getPostalCodeRegex(jpFormat);
 * console.log(regex); // "^[0-9]{3}-[0-9]{4}$"
 * 
 * // Use for validation
 * const postalCode = '100-0001';
 * if (regex) {
 *   const isValid = new RegExp(regex).test(postalCode);
 *   console.log(isValid); // true
 * }
 * 
 * // Use in HTML5 form validation
 * <input 
 *   type="text"
 *   name="postal_code"
 *   pattern={getPostalCodeRegex(format)}
 *   title="Please enter a valid postal code"
 * />
 * ```
 */
export function getPostalCodeRegex(format: CountryAddressFormat): string | undefined {
  return format.address_format.postal_code?.regex;
}
