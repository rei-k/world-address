/**
 * @vey/core - Tests for hardware integration types
 */

import { describe, it, expect } from 'vitest';
import type {
  WeightUnit,
  WeightMeasurement,
  WeightScaleService,
  PackageDimensions,
  ARMeasurementResult,
  PaymentRequest,
  PaymentResult,
  PaymentTerminalService,
  MRZData,
  PassportScanResult,
  ShippingLabelData,
  PrintJobRequest,
  PrintJobResult,
} from '../src/hardware';

describe('Hardware Types', () => {
  describe('Weight Scale Types', () => {
    it('should define weight measurement structure', () => {
      const measurement: WeightMeasurement = {
        value: 2.5,
        unit: 'kg',
        stable: true,
        timestamp: new Date(),
        deviceId: 'scale-001',
        tare: 0.1,
      };

      expect(measurement.value).toBe(2.5);
      expect(measurement.unit).toBe('kg');
      expect(measurement.stable).toBe(true);
    });

    it('should support different weight units', () => {
      const units: WeightUnit[] = ['kg', 'lb', 'g', 'oz'];
      expect(units).toHaveLength(4);
    });
  });

  describe('AR Measurement Types', () => {
    it('should define package dimensions structure', () => {
      const dimensions: PackageDimensions = {
        length: 30,
        width: 20,
        height: 15,
        unit: 'cm',
      };

      expect(dimensions.length).toBe(30);
      expect(dimensions.unit).toBe('cm');
    });

    it('should define AR measurement result structure', () => {
      const result: ARMeasurementResult = {
        dimensions: {
          length: 30,
          width: 20,
          height: 15,
          unit: 'cm',
        },
        actualVolume: 9000,
        volumetricWeight: {
          value: 1.8,
          unit: 'kg',
          divisor: 5000,
        },
        confidence: 0.92,
        timestamp: new Date(),
      };

      expect(result.volumetricWeight.divisor).toBe(5000);
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });

  describe('Payment Terminal Types', () => {
    it('should define payment request structure', () => {
      const request: PaymentRequest = {
        amount: 1500,
        currency: 'JPY',
        allowedMethods: ['card_present', 'apple_pay', 'ic_card'],
        referenceId: 'ORDER-001',
        description: 'Shipping fee',
        autoCapture: true,
      };

      expect(request.amount).toBe(1500);
      expect(request.allowedMethods).toContain('ic_card');
    });

    it('should define payment result structure', () => {
      const result: PaymentResult = {
        id: 'pay_123456',
        status: 'completed',
        amount: 1500,
        currency: 'JPY',
        method: 'ic_card',
        cardDetails: {
          brand: 'Suica',
          last4: '1234',
        },
        timestamp: new Date(),
      };

      expect(result.status).toBe('completed');
      expect(result.method).toBe('ic_card');
    });
  });

  describe('Passport Scanner Types', () => {
    it('should define MRZ data structure', () => {
      const mrzData: MRZData = {
        documentType: 'passport',
        documentTypeCode: 'P',
        issuingCountry: 'JPN',
        surname: 'YAMADA',
        givenNames: 'TARO',
        documentNumber: 'AB1234567',
        nationality: 'JPN',
        dateOfBirth: '900101',
        gender: 'M',
        expiryDate: '301231',
        rawMRZ: [
          'P<JPNYAMADA<<TARO<<<<<<<<<<<<<<<<<<<<<<<<<<',
          'AB12345674JPN9001010M3012310<<<<<<<<<<<<<<00',
        ],
        checkDigitsValid: true,
      };

      expect(mrzData.documentType).toBe('passport');
      expect(mrzData.nationality).toBe('JPN');
      expect(mrzData.checkDigitsValid).toBe(true);
    });

    it('should define passport scan result structure', () => {
      const result: PassportScanResult = {
        success: true,
        mrzData: {
          documentType: 'passport',
          documentTypeCode: 'P',
          issuingCountry: 'USA',
          surname: 'SMITH',
          givenNames: 'JOHN',
          documentNumber: '123456789',
          nationality: 'USA',
          dateOfBirth: '850601',
          gender: 'M',
          expiryDate: '260601',
          rawMRZ: ['line1', 'line2'],
          checkDigitsValid: true,
        },
        confidence: 0.98,
        eKYCStatus: 'verified',
      };

      expect(result.success).toBe(true);
      expect(result.eKYCStatus).toBe('verified');
    });
  });

  describe('Label Printer Types', () => {
    it('should define shipping label data structure', () => {
      const labelData: ShippingLabelData = {
        shipper: {
          name: 'Tokyo Store',
          company: 'Vey Corp',
          address: {
            street_address: '1-1 Shibuya',
            city: 'Shibuya-ku',
            province: 'Tokyo',
            postal_code: '150-0001',
            country: 'Japan',
          },
          phone: '03-1234-5678',
        },
        recipient: {
          name: 'John Doe',
          address: {
            street_address: '123 Main St',
            city: 'New York',
            province: 'NY',
            postal_code: '10001',
            country: 'USA',
          },
        },
        trackingNumber: '1Z999AA10123456784',
        service: 'Express',
        weight: {
          value: 2.5,
          unit: 'kg',
        },
        references: ['PO-12345'],
      };

      expect(labelData.trackingNumber).toBe('1Z999AA10123456784');
      expect(labelData.weight?.value).toBe(2.5);
    });

    it('should define print job request structure', () => {
      const request: PrintJobRequest = {
        copies: 2,
        labelSize: '4x6',
        quality: 'high',
      };

      expect(request.copies).toBe(2);
      expect(request.labelSize).toBe('4x6');
    });

    it('should define print job result structure', () => {
      const result: PrintJobResult = {
        jobId: 'job_123',
        status: 'completed',
        copiesPrinted: 2,
        timestamp: new Date(),
      };

      expect(result.status).toBe('completed');
      expect(result.copiesPrinted).toBe(2);
    });
  });
});
