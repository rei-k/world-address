/**
 * Address Service
 * Implements address management logic using @vey/core SDK
 * Based on Address Registration Flow from diagrams/data-flows.md
 */

import {
  validateAddress,
  normalizeAddress,
  encodePID,
  encryptAddress,
  createGeoAddress,
  type AddressInput,
  type ValidationResult,
  type NormalizedAddress,
} from '@vey/core';

import type { CreateAddressRequest } from '../types';

/**
 * Address service for client-side operations
 */
export class AddressService {
  /**
   * Validate address before submission
   * Step 2 from Address Registration Flow: Frontend Validation
   */
  static validateAddressInput(input: CreateAddressRequest): ValidationResult {
    const addressInput: AddressInput = {
      country: input.country,
      postalCode: input.postalCode,
      province: input.admin1,
      city: input.admin2,
      street_address: input.addressLine1,
      building: input.buildingName,
      floor: input.floor,
      room: input.room,
    };

    return validateAddress(addressInput, input.country);
  }

  /**
   * Normalize address data
   * Converts raw address into AMF (Address Mapping Framework) format
   */
  static async normalizeAddressData(input: CreateAddressRequest): Promise<NormalizedAddress> {
    const addressInput: AddressInput = {
      country: input.country,
      postalCode: input.postalCode,
      province: input.admin1,
      city: input.admin2,
      locality: input.locality,
      street_address: input.addressLine1,
      building: input.buildingName,
      floor: input.floor,
      room: input.room,
    };

    return normalizeAddress(addressInput, input.country);
  }

  /**
   * Generate PID (Place ID) from normalized address
   * Step 6 from Address Registration Flow: PID Generation
   */
  static generatePID(normalized: NormalizedAddress): string {
    return encodePID(normalized.components);
  }

  /**
   * Encrypt address data for storage
   * Step 8 from Address Registration Flow: Encrypted Address Data
   * 
   * @param address - Address data to encrypt
   * @param publicKey - User's public key for end-to-end encryption
   */
  static async encryptAddressData(
    address: CreateAddressRequest,
    publicKey: string
  ): Promise<string> {
    const addressData = {
      type: address.type,
      country: address.country,
      postalCode: address.postalCode,
      admin1: address.admin1,
      admin2: address.admin2,
      locality: address.locality,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      buildingName: address.buildingName,
      floor: address.floor,
      room: address.room,
      label: address.label,
    };

    const encrypted = await encryptAddress(addressData, publicKey);
    return encrypted.ciphertext;
  }

  /**
   * Create geo-enhanced address with coordinates
   * Implements "緯度経度を保険とする技術" (Geo-coordinates as insurance)
   */
  static createGeoEnhancedAddress(
    pid: string,
    coordinates: { latitude: number; longitude: number }
  ): ReturnType<typeof createGeoAddress> {
    return createGeoAddress(pid, coordinates);
  }

  /**
   * Format address for display
   * Uses @vey/core formatAddress function for proper country-specific formatting
   * 
   * @param address - Address data
   * @param countryCode - Country code for formatting rules
   */
  static formatAddressDisplay(address: CreateAddressRequest, countryCode: string): string {
    // TODO: Use formatAddress from @vey/core when AddressInput type is fully compatible
    // For now, providing basic formatting that works for most countries
    const parts: string[] = [];

    // Japanese format (country-specific example)
    if (countryCode === 'JP') {
      if (address.postalCode) {
        parts.push(`〒${address.postalCode}`);
      }
      if (address.admin1) parts.push(address.admin1);
      if (address.admin2) parts.push(address.admin2);
      if (address.locality) parts.push(address.locality);
      if (address.addressLine1) parts.push(address.addressLine1);
      if (address.addressLine2) parts.push(address.addressLine2);
      if (address.buildingName) parts.push(address.buildingName);
      if (address.floor || address.room) {
        const roomInfo: string[] = [];
        if (address.floor) roomInfo.push(`${address.floor}F`);
        if (address.room) roomInfo.push(address.room);
        parts.push(roomInfo.join(' '));
      }
    } else {
      // International format (generic)
      if (address.buildingName) parts.push(address.buildingName);
      if (address.floor || address.room) {
        const roomInfo: string[] = [];
        if (address.room) roomInfo.push(address.room);
        if (address.floor) roomInfo.push(`Floor ${address.floor}`);
        parts.push(roomInfo.join(', '));
      }
      if (address.addressLine1) parts.push(address.addressLine1);
      if (address.addressLine2) parts.push(address.addressLine2);
      if (address.locality) parts.push(address.locality);
      if (address.admin2) parts.push(address.admin2);
      if (address.admin1) parts.push(address.admin1);
      if (address.postalCode) parts.push(address.postalCode);
    }

    return parts.join(' ');
  }
}
