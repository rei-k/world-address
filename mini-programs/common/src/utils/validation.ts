/**
 * Validation Utilities
 * Common validation functions
 */

import { ShippingFormData, ShippingItem, ValidationResult } from '../types';

/**
 * Validation error codes for internationalization
 */
export const ValidationErrorCodes = {
  RECIPIENT_PID_REQUIRED: 'ERR_RECIPIENT_PID_REQUIRED',
  ITEMS_REQUIRED: 'ERR_ITEMS_REQUIRED',
  CARRIER_REQUIRED: 'ERR_CARRIER_REQUIRED',
  ITEM_NAME_REQUIRED: 'ERR_ITEM_NAME_REQUIRED',
  ITEM_QUANTITY_INVALID: 'ERR_ITEM_QUANTITY_INVALID',
  ITEM_WEIGHT_INVALID: 'ERR_ITEM_WEIGHT_INVALID',
  ITEM_VALUE_INVALID: 'ERR_ITEM_VALUE_INVALID',
} as const;

/**
 * Validate shipping form data
 */
export function validateShippingForm(data: ShippingFormData): ValidationResult {
  const errors: string[] = [];
  
  // Validate recipient PID
  if (!data.recipientPID || data.recipientPID.trim() === '') {
    errors.push(ValidationErrorCodes.RECIPIENT_PID_REQUIRED);
  }
  
  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.push(ValidationErrorCodes.ITEMS_REQUIRED);
  } else {
    data.items.forEach((item, index) => {
      const itemErrors = validateShippingItem(item);
      if (itemErrors.length > 0) {
        errors.push(...itemErrors.map(err => `${err}:${index + 1}`));
      }
    });
  }
  
  // Validate carrier
  if (!data.carrier) {
    errors.push(ValidationErrorCodes.CARRIER_REQUIRED);
  }
  
  return {
    valid: errors.length === 0,
    reason: errors.length > 0 ? errors.join(';') : undefined,
    warnings: [],
  };
}

/**
 * Validate individual shipping item
 */
export function validateShippingItem(item: ShippingItem): string[] {
  const errors: string[] = [];
  
  if (!item.name || item.name.trim() === '') {
    errors.push(ValidationErrorCodes.ITEM_NAME_REQUIRED);
  }
  
  if (!item.quantity || item.quantity <= 0) {
    errors.push(ValidationErrorCodes.ITEM_QUANTITY_INVALID);
  }
  
  if (!item.weight || item.weight <= 0) {
    errors.push(ValidationErrorCodes.ITEM_WEIGHT_INVALID);
  }
  
  if (item.value !== undefined && item.value < 0) {
    errors.push(ValidationErrorCodes.ITEM_VALUE_INVALID);
  }
  
  return errors;
}

/**
 * Check for prohibited items
 */
export function checkProhibitedItems(items: ShippingItem[]): string[] {
  const prohibited: string[] = [];
  const prohibitedKeywords = [
    '危険物', '爆発物', '火薬', '銃器', '刀剣',
    'explosive', 'weapon', 'gun', 'knife',
  ];
  
  items.forEach((item) => {
    const itemName = item.name.toLowerCase();
    for (const keyword of prohibitedKeywords) {
      if (itemName.includes(keyword.toLowerCase())) {
        prohibited.push(item.name);
        break;
      }
    }
  });
  
  return prohibited;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Support various phone formats
  const phoneRegex = /^[\d\s\-+()]{8,20}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate postal code format by country
 */
export function isValidPostalCode(postalCode: string, countryCode: string): boolean {
  const patterns: Record<string, RegExp> = {
    'JP': /^\d{3}-?\d{4}$/,
    'CN': /^\d{6}$/,
    'US': /^\d{5}(-\d{4})?$/,
    'UK': /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  };
  
  const pattern = patterns[countryCode];
  if (!pattern) return true; // Skip validation for unknown countries
  
  return pattern.test(postalCode);
}
