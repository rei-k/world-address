/**
 * @vey/core - Payment & Credit Card Types
 *
 * Types and utilities for payment processing and credit card validation:
 * - Credit card brand detection
 * - Card validation
 * - Payment method configuration
 */

// ============================================================================
// Credit Card Brands
// ============================================================================

/**
 * Major credit card brands
 */
export type CreditCardBrand =
  | 'Visa'
  | 'Mastercard'
  | 'JCB'
  | 'American Express'
  | 'Diners Club'
  | 'Discover'
  | 'UnionPay';

/**
 * Credit card brand configuration
 */
export interface CreditCardBrandInfo {
  /** Brand name */
  brand: CreditCardBrand;
  /** Whether this brand is accepted */
  accepted: boolean;
  /** Prevalence in the region */
  prevalence: 'high' | 'medium' | 'low';
  /** Supported features */
  features: {
    /** Contactless payment support */
    contactless: boolean;
    /** Chip and PIN support */
    chip_and_pin: boolean;
    /** Online payment support */
    online_payment: boolean;
    /** Recurring payment support */
    recurring: boolean;
  };
  /** BIN (Bank Identification Number) ranges */
  binRanges?: string[];
  /** Card number validation regex */
  validationRegex?: string;
  /** Card number length */
  cardLength?: number[];
  /** CVV length */
  cvvLength?: number;
}

/**
 * Payment method type
 */
export type PaymentMethodType =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'mobile'
  | 'qr_code'
  | 'ic_card'
  | 'bank_transfer';

/**
 * Payment method configuration
 */
export interface PaymentMethod {
  /** Payment method type */
  type: PaymentMethodType;
  /** Display name */
  name: string;
  /** Prevalence in the region */
  prevalence: 'high' | 'medium' | 'low';
  /** Credit card brands (only for credit_card type) */
  brands?: CreditCardBrandInfo[];
}

// ============================================================================
// Credit Card Validation
// ============================================================================

/**
 * Credit card brand detection patterns
 */
export const CREDIT_CARD_PATTERNS: Record<CreditCardBrand, {
  regex: RegExp;
  length: number[];
  cvvLength: number;
}> = {
  'Visa': {
    regex: /^4[0-9]{12}(?:[0-9]{3})?$/,
    length: [13, 16, 19],
    cvvLength: 3,
  },
  'Mastercard': {
    regex: /^(?:5[1-5][0-9]{14}|2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9]{2}|7(?:[01][0-9]|20))[0-9]{12})$/,
    length: [16],
    cvvLength: 3,
  },
  'JCB': {
    regex: /^(?:35(?:2[89]|[3-8][0-9]))[0-9]{12}$/,
    length: [16],
    cvvLength: 3,
  },
  'American Express': {
    regex: /^3[47][0-9]{13}$/,
    length: [15],
    cvvLength: 4,
  },
  'Diners Club': {
    regex: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    length: [14],
    cvvLength: 3,
  },
  'Discover': {
    regex: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    length: [16],
    cvvLength: 3,
  },
  'UnionPay': {
    regex: /^62[0-9]{14,17}$/,
    length: [16, 17, 18, 19],
    cvvLength: 3,
  },
};

/**
 * Card validation result
 */
export interface CardValidationResult {
  /** Whether the card number is valid */
  valid: boolean;
  /** Detected card brand */
  brand?: CreditCardBrand;
  /** Validation errors */
  errors: string[];
}

/**
 * Detect credit card brand from card number
 * @param cardNumber - Card number (with or without spaces/dashes)
 * @returns Detected brand or undefined
 */
export function detectCardBrand(cardNumber: string): CreditCardBrand | undefined {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Check each brand pattern
  for (const [brand, pattern] of Object.entries(CREDIT_CARD_PATTERNS)) {
    if (pattern.regex.test(cleanNumber)) {
      return brand as CreditCardBrand;
    }
  }
  
  return undefined;
}

/**
 * Validate credit card number using Luhn algorithm
 * @param cardNumber - Card number to validate
 * @returns True if valid
 */
export function validateLuhn(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  // Process digits from right to left
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate credit card number
 * @param cardNumber - Card number to validate
 * @param expectedBrand - Optional expected brand
 * @returns Validation result
 */
export function validateCardNumber(
  cardNumber: string,
  expectedBrand?: CreditCardBrand
): CardValidationResult {
  const errors: string[] = [];
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Check if number contains only digits
  if (!/^\d+$/.test(cleanNumber)) {
    errors.push('Card number must contain only digits');
    return { valid: false, errors };
  }
  
  // Detect brand
  const detectedBrand = detectCardBrand(cardNumber);
  
  if (!detectedBrand) {
    errors.push('Unknown card brand');
    return { valid: false, errors };
  }
  
  // Check if brand matches expected
  if (expectedBrand && detectedBrand !== expectedBrand) {
    errors.push(`Expected ${expectedBrand} but detected ${detectedBrand}`);
    return { valid: false, brand: detectedBrand, errors };
  }
  
  // Validate card number length
  const pattern = CREDIT_CARD_PATTERNS[detectedBrand];
  if (!pattern.length.includes(cleanNumber.length)) {
    errors.push(`Invalid card length for ${detectedBrand}`);
    return { valid: false, brand: detectedBrand, errors };
  }
  
  // Validate using Luhn algorithm
  if (!validateLuhn(cleanNumber)) {
    errors.push('Invalid card number (failed Luhn check)');
    return { valid: false, brand: detectedBrand, errors };
  }
  
  return { valid: true, brand: detectedBrand, errors: [] };
}

/**
 * Format card number with spaces
 * @param cardNumber - Card number to format
 * @param brand - Optional brand (auto-detected if not provided)
 * @returns Formatted card number
 */
export function formatCardNumber(cardNumber: string, brand?: CreditCardBrand): string {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  const detectedBrand = brand || detectCardBrand(cardNumber);
  
  // American Express: XXXX XXXXXX XXXXX
  if (detectedBrand === 'American Express') {
    return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }
  
  // Diners Club: XXXX XXXXXX XXXX
  if (detectedBrand === 'Diners Club') {
    return cleanNumber.replace(/(\d{4})(\d{6})(\d{4})/, '$1 $2 $3');
  }
  
  // Default: XXXX XXXX XXXX XXXX
  return cleanNumber.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Mask card number (show only last 4 digits)
 * @param cardNumber - Card number to mask
 * @param showFirst - Number of first digits to show (default: 0)
 * @param showLast - Number of last digits to show (default: 4)
 * @returns Masked card number
 */
export function maskCardNumber(
  cardNumber: string,
  showFirst: number = 0,
  showLast: number = 4
): string {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  const first = cleanNumber.substring(0, showFirst);
  const last = cleanNumber.substring(cleanNumber.length - showLast);
  const masked = '*'.repeat(cleanNumber.length - showFirst - showLast);
  
  return formatCardNumber(first + masked + last);
}

/**
 * Get default credit card brand configurations
 * @returns Array of default brand configurations
 */
export function getDefaultCreditCardBrands(): CreditCardBrandInfo[] {
  return [
    {
      brand: 'Visa',
      accepted: true,
      prevalence: 'high',
      features: {
        contactless: true,
        chip_and_pin: true,
        online_payment: true,
        recurring: true,
      },
      binRanges: ['4'],
      validationRegex: '^4[0-9]{12}(?:[0-9]{3})?$',
      cardLength: [13, 16, 19],
      cvvLength: 3,
    },
    {
      brand: 'Mastercard',
      accepted: true,
      prevalence: 'high',
      features: {
        contactless: true,
        chip_and_pin: true,
        online_payment: true,
        recurring: true,
      },
      binRanges: ['51-55', '2221-2720'],
      validationRegex: '^(?:5[1-5][0-9]{14}|2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9]{2}|7(?:[01][0-9]|20))[0-9]{12})$',
      cardLength: [16],
      cvvLength: 3,
    },
    {
      brand: 'JCB',
      accepted: true,
      prevalence: 'high',
      features: {
        contactless: true,
        chip_and_pin: true,
        online_payment: true,
        recurring: true,
      },
      binRanges: ['3528-3589'],
      validationRegex: '^(?:35(?:2[89]|[3-8][0-9]))[0-9]{12}$',
      cardLength: [16],
      cvvLength: 3,
    },
    {
      brand: 'American Express',
      accepted: true,
      prevalence: 'medium',
      features: {
        contactless: true,
        chip_and_pin: true,
        online_payment: true,
        recurring: true,
      },
      binRanges: ['34', '37'],
      validationRegex: '^3[47][0-9]{13}$',
      cardLength: [15],
      cvvLength: 4,
    },
    {
      brand: 'Diners Club',
      accepted: true,
      prevalence: 'medium',
      features: {
        contactless: true,
        chip_and_pin: true,
        online_payment: true,
        recurring: true,
      },
      binRanges: ['300-305', '36', '38'],
      validationRegex: '^3(?:0[0-5]|[68][0-9])[0-9]{11}$',
      cardLength: [14],
      cvvLength: 3,
    },
    {
      brand: 'Discover',
      accepted: true,
      prevalence: 'low',
      features: {
        contactless: true,
        chip_and_pin: true,
        online_payment: true,
        recurring: true,
      },
      binRanges: ['6011', '622126-622925', '644-649', '65'],
      validationRegex: '^6(?:011|5[0-9]{2})[0-9]{12}$',
      cardLength: [16],
      cvvLength: 3,
    },
    {
      brand: 'UnionPay',
      accepted: true,
      prevalence: 'medium',
      features: {
        contactless: true,
        chip_and_pin: true,
        online_payment: true,
        recurring: false,
      },
      binRanges: ['62'],
      validationRegex: '^62[0-9]{14,17}$',
      cardLength: [16, 17, 18, 19],
      cvvLength: 3,
    },
  ];
}
