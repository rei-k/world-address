/**
 * Address Utilities
 * Common address handling functions
 */

import { Address } from '../types';

/**
 * Normalize address format
 */
export function normalizeAddress(address: Address): Address {
  return {
    ...address,
    countryCode: address.countryCode.toUpperCase(),
    recipientName: address.recipientName.trim(),
    phoneNumber: normalizePhoneNumber(address.phoneNumber),
    postalCode: address.postalCode?.replace(/\s+/g, '').toUpperCase(),
  };
}

/**
 * Normalize phone number
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Format address for display
 */
export function formatAddressDisplay(address: Address): string {
  const parts: string[] = [];
  
  if (address.postalCode) parts.push(`〒${address.postalCode}`);
  if (address.province) parts.push(address.province);
  if (address.city) parts.push(address.city);
  if (address.district) parts.push(address.district);
  if (address.street) parts.push(address.street);
  if (address.building) parts.push(address.building);
  if (address.room) parts.push(address.room);
  
  return parts.join(' ');
}

/**
 * Validate PID format
 */
export function isValidPID(pid: string): boolean {
  // Format: CC-L1-L2-L3-...-BN-R
  const pidRegex = /^[A-Z]{2}(-[A-Z0-9]+)+$/;
  return pidRegex.test(pid);
}

/**
 * Extract country code from PID
 */
export function getCountryFromPID(pid: string): string | null {
  if (!isValidPID(pid)) return null;
  return pid.split('-')[0];
}

/**
 * Mask sensitive address information for display
 */
export function maskAddress(address: Address): Address {
  return {
    ...address,
    street: address.street ? `${address.street.substring(0, 3)}***` : undefined,
    building: address.building ? `***` : undefined,
    room: address.room ? `***` : undefined,
    phoneNumber: maskPhoneNumber(address.phoneNumber),
  };
}

/**
 * Mask phone number
 */
export function maskPhoneNumber(phone: string): string {
  if (phone.length < 7) return '***';
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
}
