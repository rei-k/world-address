import { describe, it, expect } from 'vitest';
import {
  CreditCardBrand,
  detectCardBrand,
  validateLuhn,
  validateCardNumber,
  formatCardNumber,
  maskCardNumber,
  getDefaultCreditCardBrands,
  CREDIT_CARD_PATTERNS,
} from '../src/payment';

describe('Credit Card Validation', () => {
  describe('detectCardBrand', () => {
    it('should detect Visa cards', () => {
      expect(detectCardBrand('4111111111111111')).toBe('Visa');
      expect(detectCardBrand('4012888888881881')).toBe('Visa');
      expect(detectCardBrand('4111 1111 1111 1111')).toBe('Visa');
    });

    it('should detect Mastercard cards', () => {
      expect(detectCardBrand('5555555555554444')).toBe('Mastercard');
      expect(detectCardBrand('5105105105105100')).toBe('Mastercard');
      expect(detectCardBrand('2221000000000009')).toBe('Mastercard');
    });

    it('should detect JCB cards', () => {
      expect(detectCardBrand('3530111333300000')).toBe('JCB');
      expect(detectCardBrand('3566002020360505')).toBe('JCB');
    });

    it('should detect American Express cards', () => {
      expect(detectCardBrand('378282246310005')).toBe('American Express');
      expect(detectCardBrand('371449635398431')).toBe('American Express');
    });

    it('should detect Diners Club cards', () => {
      expect(detectCardBrand('30569309025904')).toBe('Diners Club');
      expect(detectCardBrand('38520000023237')).toBe('Diners Club');
    });

    it('should detect Discover cards', () => {
      expect(detectCardBrand('6011111111111117')).toBe('Discover');
      expect(detectCardBrand('6011000990139424')).toBe('Discover');
    });

    it('should detect UnionPay cards', () => {
      expect(detectCardBrand('6200000000000005')).toBe('UnionPay');
      expect(detectCardBrand('6221558812340000')).toBe('UnionPay');
    });

    it('should return undefined for invalid cards', () => {
      expect(detectCardBrand('1234567890123456')).toBeUndefined();
      expect(detectCardBrand('0000000000000000')).toBeUndefined();
    });
  });

  describe('validateLuhn', () => {
    it('should validate correct card numbers', () => {
      expect(validateLuhn('4111111111111111')).toBe(true);
      expect(validateLuhn('5555555555554444')).toBe(true);
      expect(validateLuhn('378282246310005')).toBe(true);
    });

    it('should reject invalid card numbers', () => {
      expect(validateLuhn('4111111111111112')).toBe(false);
      expect(validateLuhn('5555555555554445')).toBe(false);
      expect(validateLuhn('1234567890123456')).toBe(false);
    });

    it('should handle card numbers with spaces', () => {
      expect(validateLuhn('4111 1111 1111 1111')).toBe(true);
      expect(validateLuhn('5555 5555 5555 4444')).toBe(true);
    });
  });

  describe('validateCardNumber', () => {
    it('should validate correct Visa cards', () => {
      const result = validateCardNumber('4111111111111111');
      expect(result.valid).toBe(true);
      expect(result.brand).toBe('Visa');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct Mastercard cards', () => {
      const result = validateCardNumber('5555555555554444');
      expect(result.valid).toBe(true);
      expect(result.brand).toBe('Mastercard');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct JCB cards', () => {
      const result = validateCardNumber('3530111333300000');
      expect(result.valid).toBe(true);
      expect(result.brand).toBe('JCB');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct American Express cards', () => {
      const result = validateCardNumber('378282246310005');
      expect(result.valid).toBe(true);
      expect(result.brand).toBe('American Express');
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid card numbers', () => {
      const result = validateCardNumber('4111111111111112');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject non-numeric card numbers', () => {
      const result = validateCardNumber('411a111111111111');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Card number must contain only digits');
    });

    it('should reject unknown card brands', () => {
      const result = validateCardNumber('1234567890123456');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown card brand');
    });

    it('should detect brand mismatch', () => {
      const result = validateCardNumber('4111111111111111', 'Mastercard');
      expect(result.valid).toBe(false);
      expect(result.brand).toBe('Visa');
      expect(result.errors[0]).toContain('Expected Mastercard but detected Visa');
    });
  });

  describe('formatCardNumber', () => {
    it('should format Visa cards with spaces', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    });

    it('should format American Express cards correctly', () => {
      expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
    });

    it('should format Diners Club cards correctly', () => {
      expect(formatCardNumber('30569309025904')).toBe('3056 930902 5904');
    });

    it('should handle already formatted cards', () => {
      expect(formatCardNumber('4111 1111 1111 1111')).toBe('4111 1111 1111 1111');
    });
  });

  describe('maskCardNumber', () => {
    it('should mask card number showing last 4 digits', () => {
      const masked = maskCardNumber('4111111111111111');
      expect(masked).toContain('1111');
      expect(masked).toContain('*');
    });

    it('should mask card number with custom show parameters', () => {
      const masked = maskCardNumber('4111111111111111', 4, 4);
      expect(masked).toContain('4111');
      expect(masked).toContain('1111');
      expect(masked).toContain('*');
    });

    it('should handle American Express masking', () => {
      const masked = maskCardNumber('378282246310005', 0, 4);
      expect(masked).toContain('0005');
      expect(masked).toContain('*');
    });
  });

  describe('getDefaultCreditCardBrands', () => {
    it('should return at least 6 major brands', () => {
      const brands = getDefaultCreditCardBrands();
      expect(brands.length).toBeGreaterThanOrEqual(6);
    });

    it('should include Visa, Mastercard, JCB, American Express, Diners Club, Discover, and UnionPay', () => {
      const brands = getDefaultCreditCardBrands();
      const brandNames = brands.map((b) => b.brand);
      
      expect(brandNames).toContain('Visa');
      expect(brandNames).toContain('Mastercard');
      expect(brandNames).toContain('JCB');
      expect(brandNames).toContain('American Express');
      expect(brandNames).toContain('Diners Club');
      expect(brandNames).toContain('Discover');
      expect(brandNames).toContain('UnionPay');
    });

    it('should have valid brand configuration', () => {
      const brands = getDefaultCreditCardBrands();
      
      brands.forEach((brand) => {
        expect(brand.brand).toBeDefined();
        expect(typeof brand.accepted).toBe('boolean');
        expect(['high', 'medium', 'low']).toContain(brand.prevalence);
        expect(brand.features).toBeDefined();
        expect(typeof brand.features.contactless).toBe('boolean');
        expect(typeof brand.features.chip_and_pin).toBe('boolean');
        expect(typeof brand.features.online_payment).toBe('boolean');
        expect(typeof brand.features.recurring).toBe('boolean');
      });
    });

    it('should have correct card lengths', () => {
      const brands = getDefaultCreditCardBrands();
      
      const visa = brands.find((b) => b.brand === 'Visa');
      expect(visa?.cardLength).toEqual([13, 16, 19]);
      
      const amex = brands.find((b) => b.brand === 'American Express');
      expect(amex?.cardLength).toEqual([15]);
      
      const mastercard = brands.find((b) => b.brand === 'Mastercard');
      expect(mastercard?.cardLength).toEqual([16]);
    });

    it('should have correct CVV lengths', () => {
      const brands = getDefaultCreditCardBrands();
      
      const amex = brands.find((b) => b.brand === 'American Express');
      expect(amex?.cvvLength).toBe(4);
      
      const visa = brands.find((b) => b.brand === 'Visa');
      expect(visa?.cvvLength).toBe(3);
    });
  });

  describe('CREDIT_CARD_PATTERNS', () => {
    it('should have patterns for all major brands', () => {
      const expectedBrands: CreditCardBrand[] = [
        'Visa',
        'Mastercard',
        'JCB',
        'American Express',
        'Diners Club',
        'Discover',
        'UnionPay',
      ];

      expectedBrands.forEach((brand) => {
        expect(CREDIT_CARD_PATTERNS[brand]).toBeDefined();
        expect(CREDIT_CARD_PATTERNS[brand].regex).toBeInstanceOf(RegExp);
        expect(CREDIT_CARD_PATTERNS[brand].length).toBeInstanceOf(Array);
        expect(CREDIT_CARD_PATTERNS[brand].cvvLength).toBeGreaterThan(0);
      });
    });
  });
});
