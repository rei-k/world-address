/**
 * Validation Utilities
 * Common validation functions
 */

import { ShippingFormData, ShippingItem, ValidationResult } from '../types';

/**
 * Validate shipping form data
 */
export function validateShippingForm(data: ShippingFormData): ValidationResult {
  const errors: string[] = [];
  
  // Validate recipient PID
  if (!data.recipientPID || data.recipientPID.trim() === '') {
    errors.push('受取人のPIDが必要です');
  }
  
  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.push('配送アイテムが必要です');
  } else {
    data.items.forEach((item, index) => {
      const itemErrors = validateShippingItem(item);
      if (itemErrors.length > 0) {
        errors.push(`アイテム${index + 1}: ${itemErrors.join(', ')}`);
      }
    });
  }
  
  // Validate carrier
  if (!data.carrier) {
    errors.push('配送業者を選択してください');
  }
  
  return {
    valid: errors.length === 0,
    reason: errors.length > 0 ? errors.join('; ') : undefined,
    warnings: [],
  };
}

/**
 * Validate individual shipping item
 */
export function validateShippingItem(item: ShippingItem): string[] {
  const errors: string[] = [];
  
  if (!item.name || item.name.trim() === '') {
    errors.push('商品名が必要です');
  }
  
  if (!item.quantity || item.quantity <= 0) {
    errors.push('数量は1以上である必要があります');
  }
  
  if (!item.weight || item.weight <= 0) {
    errors.push('重量は0より大きい必要があります');
  }
  
  if (item.value !== undefined && item.value < 0) {
    errors.push('価格は0以上である必要があります');
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
