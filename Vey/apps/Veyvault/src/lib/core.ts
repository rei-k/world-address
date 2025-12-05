/**
 * Core SDK Types - Simplified for Veyvault app
 * These are basic type definitions that match the @vey/core SDK
 */

export interface AddressInput {
  country: string;
  postalCode?: string;
  province?: string;
  city?: string;
  locality?: string;
  street_address?: string;
  building?: string;
  floor?: string;
  room?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface NormalizedAddress {
  country: string;
  components: PIDComponents;
  original: AddressInput;
}

export interface PIDComponents {
  country: string;
  admin1?: string;
  admin2?: string;
  locality?: string;
  sublocality?: string;
  block?: string;
  building?: string;
  unit?: string;
}

export interface EncryptionResult {
  ciphertext: string;
  nonce: string;
  tag: string;
}

/**
 * Validate address input
 */
export function validateAddress(address: AddressInput, countryCode: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!address.country) {
    errors.push({ field: 'country', message: 'Country is required' });
  }
  
  if (!address.street_address) {
    errors.push({ field: 'street_address', message: 'Street address is required' });
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Normalize address to standard format
 */
export async function normalizeAddress(address: AddressInput, countryCode: string): Promise<NormalizedAddress> {
  return {
    country: countryCode,
    components: {
      country: countryCode,
      admin1: address.province,
      admin2: address.city,
      locality: address.locality,
    },
    original: address,
  };
}

/**
 * Convert normalized address to PID components
 */
export function normalizedAddressToPIDComponents(normalized: NormalizedAddress): PIDComponents {
  return normalized.components;
}

/**
 * Encrypt address data
 */
export async function encryptAddress(address: AddressInput, publicKey: string): Promise<EncryptionResult> {
  // Mock encryption - in production this would use actual encryption
  const encrypted = Buffer.from(JSON.stringify(address)).toString('base64');
  return {
    ciphertext: encrypted,
    nonce: 'mock-nonce',
    tag: 'mock-tag',
  };
}

/**
 * Create geo-enhanced address
 */
export function createGeoAddress(pid: string, coordinates: { latitude: number; longitude: number }) {
  return {
    pid,
    geo: {
      center: coordinates,
      verified: true,
    },
  };
}
