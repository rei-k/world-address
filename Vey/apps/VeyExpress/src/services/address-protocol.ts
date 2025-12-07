/**
 * Address Protocol Service
 * Handles 254 countries, multi-language support, PID generation, and AMF-based normalization
 */

import { Address, PID, LocalizedAddress } from '../types';

/**
 * Address Normalization Service
 * Implements AMF (Address Management Framework) Tree/DAG-based mapping
 */
export class AddressProtocolService {
  private countryFormats: Map<string, CountryAddressFormat>;

  constructor() {
    this.countryFormats = new Map();
    this.initializeCountryFormats();
  }

  /**
   * Normalize address according to local standards
   */
  async normalizeAddress(address: Address): Promise<Address> {
    const format = this.countryFormats.get(address.country);
    if (!format) {
      throw new Error(`Unsupported country: ${address.country}`);
    }

    // Apply country-specific normalization rules
    const normalized = { ...address };

    // Standardize postal code format
    if (normalized.postalCode && format.postalCodeFormat) {
      normalized.postalCode = this.normalizePostalCode(
        normalized.postalCode,
        format.postalCodeFormat
      );
    }

    // Standardize administrative area names
    if (normalized.administrativeArea) {
      normalized.administrativeArea = this.normalizeAdministrativeArea(
        normalized.administrativeArea,
        address.country
      );
    }

    return normalized;
  }

  /**
   * Generate PID (Hierarchical Address ID)
   */
  generatePID(address: Address): PID {
    const hierarchy: string[] = [];

    // Build hierarchical structure
    if (address.country) hierarchy.push(address.country);
    if (address.administrativeArea) hierarchy.push(address.administrativeArea);
    if (address.locality) hierarchy.push(address.locality);
    if (address.dependentLocality) hierarchy.push(address.dependentLocality);
    if (address.postalCode) hierarchy.push(address.postalCode);
    if (address.addressLine1) hierarchy.push(address.addressLine1);

    // Generate unique ID based on hierarchy
    const id = this.hashHierarchy(hierarchy);

    return {
      id,
      hierarchy,
      version: '1.0',
      createdAt: new Date(),
    };
  }

  /**
   * Validate address completeness and correctness
   */
  validateAddress(address: Address): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!address.country) errors.push('Country is required');
    if (!address.addressLine1) errors.push('Address line 1 is required');
    if (!address.recipient) errors.push('Recipient name is required');

    const format = this.countryFormats.get(address.country);
    if (format) {
      // Validate postal code format
      if (format.requiresPostalCode && !address.postalCode) {
        errors.push('Postal code is required for this country');
      }

      if (address.postalCode && format.postalCodeFormat) {
        if (!this.validatePostalCode(address.postalCode, format.postalCodeFormat)) {
          errors.push(`Invalid postal code format for ${address.country}`);
        }
      }

      // Validate phone number if provided
      if (address.phone && format.phoneFormat) {
        if (!this.validatePhone(address.phone, format.phoneFormat)) {
          warnings.push('Phone number format may be invalid');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Convert address to local language format
   */
  localizeAddress(address: Address, targetLanguage: string): LocalizedAddress {
    // This would integrate with translation services and local address databases
    // For now, return basic structure
    return {
      language: targetLanguage,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      locality: address.locality,
      administrativeArea: address.administrativeArea,
    };
  }

  /**
   * Parse free-form address text into structured format
   */
  async parseAddress(text: string, country: string): Promise<Address> {
    // This would use NLP and country-specific parsing rules
    // For now, return basic structure
    const lines = text.split('\n').filter(l => l.trim());
    
    return {
      country,
      addressLine1: lines[0] || '',
      addressLine2: lines[1],
      locality: lines[2],
      recipient: lines[lines.length - 1] || '',
    };
  }

  /**
   * Get address format requirements for a country
   */
  getCountryFormat(countryCode: string): CountryAddressFormat | undefined {
    return this.countryFormats.get(countryCode);
  }

  /**
   * List all supported countries
   */
  getSupportedCountries(): string[] {
    return Array.from(this.countryFormats.keys());
  }

  // ========== Private Helper Methods ==========

  private initializeCountryFormats(): void {
    // Initialize with sample formats - in production, this would load from database
    // Format for major countries as examples
    
    this.countryFormats.set('US', {
      name: 'United States',
      fields: ['addressLine1', 'addressLine2', 'locality', 'administrativeArea', 'postalCode'],
      requiresPostalCode: true,
      postalCodeFormat: /^\d{5}(-\d{4})?$/,
      phoneFormat: /^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
      administrativeAreaType: 'state',
      localityType: 'city',
    });

    this.countryFormats.set('JP', {
      name: 'Japan',
      fields: ['postalCode', 'administrativeArea', 'locality', 'addressLine1', 'addressLine2'],
      requiresPostalCode: true,
      postalCodeFormat: /^\d{3}-\d{4}$/,
      phoneFormat: /^0\d{1,4}-\d{1,4}-\d{4}$/,
      administrativeAreaType: 'prefecture',
      localityType: 'city',
      rightToLeft: false,
    });

    this.countryFormats.set('GB', {
      name: 'United Kingdom',
      fields: ['addressLine1', 'addressLine2', 'locality', 'administrativeArea', 'postalCode'],
      requiresPostalCode: true,
      postalCodeFormat: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
      phoneFormat: /^(\+44|0)\d{10}$/,
      administrativeAreaType: 'county',
      localityType: 'town',
    });

    // Add more major countries
    const additionalCountries = [
      'CN', 'DE', 'FR', 'IT', 'ES', 'CA', 'AU', 'BR', 'MX', 'KR',
      'IN', 'RU', 'SG', 'HK', 'TW', 'NL', 'SE', 'NO', 'DK', 'FI',
      'PL', 'CZ', 'AT', 'CH', 'BE', 'PT', 'GR', 'IE', 'NZ', 'ZA',
      'IL', 'AE', 'SA', 'TH', 'VN', 'MY', 'PH', 'ID', 'TR', 'EG',
      'AR', 'CL', 'CO', 'PE', 'UA', 'RO', 'HU', 'CL', 'VE', 'EC',
    ];

    additionalCountries.forEach(code => {
      if (!this.countryFormats.has(code)) {
        this.countryFormats.set(code, {
          name: code,
          fields: ['addressLine1', 'locality', 'administrativeArea', 'postalCode'],
          requiresPostalCode: false,
          administrativeAreaType: 'region',
          localityType: 'city',
        });
      }
    });

    // In production, this would load all 254 countries from the world-address data
  }

  private normalizePostalCode(postalCode: string, format: RegExp): string {
    // Remove extra spaces and standardize format
    let normalized = postalCode.trim().toUpperCase();
    
    // Country-specific normalization
    if (format.source.includes('\\d{5}')) {
      // US ZIP format
      normalized = normalized.replace(/\s/g, '');
    } else if (format.source.includes('\\d{3}-\\d{4}')) {
      // Japanese postal code format
      normalized = normalized.replace(/[^\d-]/g, '');
      if (!normalized.includes('-') && normalized.length === 7) {
        normalized = `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
      }
    }

    return normalized;
  }

  private normalizeAdministrativeArea(area: string, country: string): string {
    // Standardize state/province names
    const normalized = area.trim();
    
    // Country-specific abbreviation expansion
    if (country === 'US') {
      const stateAbbreviations: Record<string, string> = {
        'CA': 'California',
        'NY': 'New York',
        'TX': 'Texas',
        // ... add more as needed
      };
      return stateAbbreviations[normalized.toUpperCase()] || normalized;
    }

    return normalized;
  }

  private validatePostalCode(postalCode: string, format: RegExp): boolean {
    return format.test(postalCode);
  }

  private validatePhone(phone: string, format: RegExp): boolean {
    return format.test(phone);
  }

  private hashHierarchy(hierarchy: string[]): string {
    // Simple hash implementation - in production use crypto.subtle
    const str = hierarchy.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * Country address format definition
 */
export interface CountryAddressFormat {
  name: string;
  fields: string[];
  requiresPostalCode: boolean;
  postalCodeFormat?: RegExp;
  phoneFormat?: RegExp;
  administrativeAreaType: string;
  localityType: string;
  rightToLeft?: boolean;
  localLanguages?: string[];
}
