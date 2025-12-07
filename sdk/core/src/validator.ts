/**
 * @vey/core - Address validator
 * 
 * Provides comprehensive address validation against country-specific format rules,
 * including postal code validation, required field checking, and territorial restrictions.
 */

import type {
  CountryAddressFormat,
  AddressInput,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  AddressField,
} from './types';
import {
  isBlockedTerritorialName,
  validateJapaneseTerritorialInput,
} from './territorial-restrictions';

/**
 * Validates an address against a country's format rules.
 * 
 * This function performs comprehensive validation including:
 * - Required field validation
 * - Postal code format validation (regex pattern matching)
 * - Territorial restrictions (for Japan and other countries)
 * - Non-Latin character detection and warnings
 * - Address normalization (whitespace trimming)
 * 
 * @param address - The address input to validate
 * @param format - The country's address format definition containing validation rules
 * @param options - Optional validation options
 * @param options.languageCode - Language code for territorial validation (e.g., 'en', 'ja')
 * 
 * @returns ValidationResult containing:
 *   - valid: true if no errors found
 *   - errors: Array of validation errors (required fields, format issues, etc.)
 *   - warnings: Array of validation warnings (suggestions, transliteration hints)
 *   - normalized: Address with normalized values (trimmed whitespace)
 * 
 * @example
 * ```typescript
 * const address = {
 *   country: 'JP',
 *   postal_code: '100-0001',
 *   province: '東京都',
 *   city: '千代田区',
 *   street_address: '千代田1-1'
 * };
 * 
 * const format = await loadCountryFormat('JP');
 * const result = validateAddress(address, format, { languageCode: 'ja' });
 * 
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 * 
 * @throws Does not throw errors; returns validation result with errors array
 */
export function validateAddress(
  address: AddressInput,
  format: CountryAddressFormat,
  options?: { languageCode?: string }
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const normalized: AddressInput = { ...address };

  const addressFormat = format.address_format;
  const fields = [
    'recipient',
    'building',
    'floor',
    'room',
    'unit',
    'street_address',
    'district',
    'ward',
    'city',
    'province',
    'postal_code',
    'country',
  ] as const;

  // Check territorial restrictions for Japan
  if (address.country === 'JP' || format.iso_codes?.alpha2 === 'JP') {
    const locationFields: (keyof AddressInput)[] = ['city', 'province', 'district', 'ward', 'street_address'];
    for (const field of locationFields) {
      const value = address[field];
      if (value && typeof value === 'string') {
        const territorialResult = validateJapaneseTerritorialInput(
          value,
          options?.languageCode
        );
        if (!territorialResult.valid) {
          errors.push({
            field: field as string,
            code: 'TERRITORIAL_RESTRICTION',
            message: territorialResult.reason || 'Location name violates territorial restrictions',
          });
          if (territorialResult.suggestion) {
            warnings.push({
              field: field as string,
              code: 'TERRITORIAL_SUGGESTION',
              message: `Suggestion: Use "${territorialResult.suggestion}" instead`,
            });
          }
        }
      }
    }
  }

  for (const field of fields) {
    const fieldDef = addressFormat[field] as AddressField | undefined;
    const value = address[field];

    if (fieldDef?.required && !value) {
      errors.push({
        field,
        code: 'REQUIRED_FIELD_MISSING',
        message: `${field} is required`,
      });
    }

    if (field === 'postal_code' && value && fieldDef?.regex) {
      const regex = new RegExp(fieldDef.regex);
      if (!regex.test(value)) {
        errors.push({
          field: 'postal_code',
          code: 'INVALID_POSTAL_CODE',
          message: `Postal code does not match expected format: ${fieldDef.regex}`,
        });
      }
    }

    // Normalize value by trimming whitespace
    if (value && typeof value === 'string') {
      normalized[field] = value.trim();
    }
  }

  // Check transliteration
  if (format.validation?.allow_latin_transliteration) {
    // Add warning if non-Latin characters detected but transliteration allowed
    for (const field of fields) {
      const value = address[field];
      if (value && /[^\x00-\x7F]/.test(value)) {
        warnings.push({
          field,
          code: 'NON_LATIN_CHARACTERS',
          message: `${field} contains non-Latin characters. Transliteration is recommended for international shipping.`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalized,
  };
}

/**
 * Gets the list of required fields for a country's address format.
 * 
 * Analyzes the country's address format definition and returns all fields
 * that are marked as required for valid address submission.
 * 
 * @param format - The country's address format definition
 * 
 * @returns Array of field names that are required (e.g., ['postal_code', 'province', 'city'])
 * 
 * @example
 * ```typescript
 * const format = await loadCountryFormat('JP');
 * const required = getRequiredFields(format);
 * console.log(required); // ['postal_code', 'province', 'city', 'street_address']
 * 
 * // Use to validate form before submission
 * const missingFields = required.filter(field => !address[field]);
 * if (missingFields.length > 0) {
 *   console.error('Missing required fields:', missingFields);
 * }
 * ```
 */
export function getRequiredFields(format: CountryAddressFormat): string[] {
  const required: string[] = [];
  const addressFormat = format.address_format;
  const fields = [
    'recipient',
    'building',
    'floor',
    'room',
    'unit',
    'street_address',
    'district',
    'ward',
    'city',
    'province',
    'postal_code',
    'country',
  ] as const;

  for (const field of fields) {
    const fieldDef = addressFormat[field] as AddressField | undefined;
    if (fieldDef?.required) {
      required.push(field);
    }
  }

  return required;
}

/**
 * Gets the field order for displaying or formatting an address based on context.
 * 
 * Different contexts (domestic, international, postal) may require different
 * field ordering. This function returns the appropriate order based on the
 * country's format definition and the specified context.
 * 
 * @param format - The country's address format definition
 * @param context - The context for field ordering:
 *   - 'domestic': For addresses within the same country
 *   - 'international': For cross-border addresses (default)
 *   - 'postal': For postal service/label printing
 * 
 * @returns Array of field names in the appropriate order for the context
 * 
 * @example
 * ```typescript
 * const format = await loadCountryFormat('JP');
 * 
 * // International shipping label order
 * const intlOrder = getFieldOrder(format, 'international');
 * console.log(intlOrder);
 * // ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country']
 * 
 * // Domestic mail order (might be different)
 * const domesticOrder = getFieldOrder(format, 'domestic');
 * 
 * // Format address for display
 * const formattedAddress = intlOrder
 *   .map(field => address[field])
 *   .filter(Boolean)
 *   .join('\n');
 * ```
 */
export function getFieldOrder(
  format: CountryAddressFormat,
  context: 'domestic' | 'international' | 'postal' = 'international'
): string[] {
  const addressFormat = format.address_format;

  if (addressFormat.order) {
    return addressFormat.order;
  }

  if (addressFormat.order_variants) {
    const variant = addressFormat.order_variants.find(
      (v) => v.context === context
    );
    if (variant) {
      return variant.order;
    }
    // Fallback to first variant
    return addressFormat.order_variants[0]?.order ?? [];
  }

  return [
    'recipient',
    'street_address',
    'city',
    'province',
    'postal_code',
    'country',
  ];
}
