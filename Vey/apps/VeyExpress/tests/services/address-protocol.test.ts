/**
 * Address Protocol Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AddressProtocolService } from '../../src/services/address-protocol';
import { Address } from '../../src/types';

describe('AddressProtocolService', () => {
  let service: AddressProtocolService;

  beforeEach(() => {
    service = new AddressProtocolService();
  });

  describe('Address Validation', () => {
    it('should validate complete US address', () => {
      const address: Address = {
        country: 'US',
        addressLine1: '1600 Pennsylvania Ave',
        locality: 'Washington',
        administrativeArea: 'DC',
        postalCode: '20500',
        recipient: 'John Doe',
      };

      const result = service.validateAddress(address);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate complete JP address', () => {
      const address: Address = {
        country: 'JP',
        addressLine1: '東京都渋谷区神南1-2-3',
        recipient: '山田太郎',
        postalCode: '150-0041',
      };

      const result = service.validateAddress(address);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for missing country', () => {
      const address: Address = {
        country: '',
        addressLine1: '123 Main St',
        recipient: 'John Doe',
      };

      const result = service.validateAddress(address);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Country is required');
    });

    it('should fail validation for missing address line', () => {
      const address: Address = {
        country: 'US',
        addressLine1: '',
        recipient: 'John Doe',
      };

      const result = service.validateAddress(address);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Address line 1 is required');
    });

    it('should fail validation for missing recipient', () => {
      const address: Address = {
        country: 'US',
        addressLine1: '123 Main St',
        recipient: '',
      };

      const result = service.validateAddress(address);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Recipient name is required');
    });
  });

  describe('PID Generation', () => {
    it('should generate PID for address', () => {
      const address: Address = {
        country: 'US',
        administrativeArea: 'CA',
        locality: 'San Francisco',
        postalCode: '94102',
        addressLine1: '123 Main St',
        recipient: 'John Doe',
      };

      const pid = service.generatePID(address);
      expect(pid).toBeDefined();
      expect(pid.id).toBeDefined();
      expect(pid.hierarchy).toContain('US');
      expect(pid.hierarchy).toContain('CA');
      expect(pid.hierarchy).toContain('San Francisco');
      expect(pid.version).toBe('1.0');
    });

    it('should generate consistent PID for same address', () => {
      const address: Address = {
        country: 'JP',
        administrativeArea: '東京都',
        locality: '渋谷区',
        addressLine1: '神南1-2-3',
        recipient: '山田太郎',
      };

      const pid1 = service.generatePID(address);
      const pid2 = service.generatePID(address);
      expect(pid1.id).toBe(pid2.id);
    });
  });

  describe('Address Normalization', () => {
    it('should normalize US address', async () => {
      const address: Address = {
        country: 'US',
        addressLine1: '1600 pennsylvania ave',
        locality: 'washington',
        administrativeArea: 'dc',
        postalCode: '20500',
        recipient: 'John Doe',
      };

      const normalized = await service.normalizeAddress(address);
      expect(normalized).toBeDefined();
      expect(normalized.country).toBe('US');
    });

    it('should normalize JP address with postal code', async () => {
      const address: Address = {
        country: 'JP',
        addressLine1: '東京都渋谷区神南1-2-3',
        postalCode: '1500041',
        recipient: '山田太郎',
      };

      const normalized = await service.normalizeAddress(address);
      expect(normalized).toBeDefined();
      expect(normalized.postalCode).toMatch(/^\d{3}-\d{4}$/);
    });

    it('should throw error for unsupported country', async () => {
      const address: Address = {
        country: 'XX',
        addressLine1: '123 Main St',
        recipient: 'John Doe',
      };

      await expect(service.normalizeAddress(address)).rejects.toThrow('Unsupported country');
    });
  });

  describe('Address Localization', () => {
    it('should localize address to target language', () => {
      const address: Address = {
        country: 'JP',
        addressLine1: '東京都渋谷区神南1-2-3',
        locality: '渋谷区',
        administrativeArea: '東京都',
        recipient: '山田太郎',
      };

      const localized = service.localizeAddress(address, 'en');
      expect(localized).toBeDefined();
      expect(localized.language).toBe('en');
    });
  });

  describe('Address Parsing', () => {
    it('should parse free-form US address', async () => {
      const text = `1600 Pennsylvania Ave
Washington, DC 20500
John Doe`;

      const parsed = await service.parseAddress(text, 'US');
      expect(parsed).toBeDefined();
      expect(parsed.country).toBe('US');
      expect(parsed.addressLine1).toBeTruthy();
    });

    it('should parse free-form JP address', async () => {
      const text = `東京都渋谷区神南1-2-3
山田太郎`;

      const parsed = await service.parseAddress(text, 'JP');
      expect(parsed).toBeDefined();
      expect(parsed.country).toBe('JP');
    });
  });
});
