/**
 * @vey/core - Tests for AI module types
 */

import { describe, it, expect } from 'vitest';
import type {
  OCRRequest,
  OCRResponse,
  HSCodeRequest,
  HSCodeResponse,
  DangerousGoodsRequest,
  DangerousGoodsResponse,
  TranslationRequest,
  TranslationResponse,
  AddressVerificationRequest,
  AddressVerificationResponse,
  InvoiceRequest,
  InvoiceResponse,
  AIService,
} from '../src/ai';

describe('AI Types', () => {
  describe('OCR Types', () => {
    it('should define OCR request structure', () => {
      const request: OCRRequest = {
        image: 'base64ImageData',
        format: 'base64',
        mimeType: 'image/jpeg',
        languageHints: ['ja', 'en'],
        documentType: 'shipping_label',
      };

      expect(request.image).toBe('base64ImageData');
      expect(request.format).toBe('base64');
      expect(request.documentType).toBe('shipping_label');
    });

    it('should define OCR response structure', () => {
      const response: OCRResponse = {
        success: true,
        textBlocks: [
          {
            text: '東京都千代田区',
            confidence: 0.95,
            detectedLanguage: 'ja',
          },
        ],
        fullText: '東京都千代田区',
        detectedDocumentType: 'shipping_label',
      };

      expect(response.success).toBe(true);
      expect(response.textBlocks).toHaveLength(1);
      expect(response.textBlocks[0].confidence).toBe(0.95);
    });
  });

  describe('HS Code Types', () => {
    it('should define HS code request structure', () => {
      const request: HSCodeRequest = {
        productDescription: 'cotton shirt',
        material: 'cotton',
        originCountry: 'CN',
        destinationCountry: 'JP',
        maxSuggestions: 5,
      };

      expect(request.productDescription).toBe('cotton shirt');
      expect(request.maxSuggestions).toBe(5);
    });

    it('should define HS code response structure', () => {
      const response: HSCodeResponse = {
        success: true,
        suggestions: [
          {
            code: '6105.10.00',
            description: 'Mens cotton shirts',
            confidence: 0.92,
            chapter: {
              number: '61',
              title: 'Articles of apparel and clothing accessories, knitted or crocheted',
            },
          },
        ],
      };

      expect(response.success).toBe(true);
      expect(response.suggestions[0].code).toBe('6105.10.00');
    });
  });

  describe('Dangerous Goods Types', () => {
    it('should define dangerous goods request structure', () => {
      const request: DangerousGoodsRequest = {
        images: ['base64Image1', 'base64Image2'],
        description: 'Electronics package',
        shippingMethod: 'air',
        originCountry: 'JP',
        destinationCountry: 'US',
      };

      expect(request.images).toHaveLength(2);
      expect(request.shippingMethod).toBe('air');
    });

    it('should define dangerous goods response structure', () => {
      const response: DangerousGoodsResponse = {
        success: true,
        result: 'warning',
        detectedHazards: [
          {
            item: 'Lithium battery',
            hazardClass: 'miscellaneous',
            confidence: 0.88,
            restrictions: {
              airProhibited: false,
              requiresSpecialHandling: true,
              requiresDeclaration: true,
            },
          },
        ],
        warnings: ['Lithium battery detected - special handling required'],
      };

      expect(response.result).toBe('warning');
      expect(response.detectedHazards[0].hazardClass).toBe('miscellaneous');
    });
  });

  describe('Translation Types', () => {
    it('should define translation request structure', () => {
      const request: TranslationRequest = {
        text: 'Hello, world',
        sourceLanguage: 'en',
        targetLanguage: 'ja',
        context: 'shipping',
        includeRomanization: true,
      };

      expect(request.text).toBe('Hello, world');
      expect(request.targetLanguage).toBe('ja');
    });

    it('should define translation response structure', () => {
      const response: TranslationResponse = {
        success: true,
        translatedText: 'こんにちは、世界',
        romanization: 'Konnichiwa, sekai',
        confidence: 0.98,
      };

      expect(response.translatedText).toBe('こんにちは、世界');
      expect(response.romanization).toBe('Konnichiwa, sekai');
    });
  });

  describe('Address Verification Types', () => {
    it('should define address verification request structure', () => {
      const request: AddressVerificationRequest = {
        address: {
          recipient: 'John Doe',
          street_address: '1-1 Chiyoda',
          city: 'Chiyoda-ku',
          province: 'Tokyo',
          postal_code: '100-0001',
          country: 'Japan',
        },
        countryCode: 'JP',
        level: 'full',
        suggestCorrections: true,
      };

      expect(request.countryCode).toBe('JP');
      expect(request.level).toBe('full');
    });

    it('should define address verification response structure', () => {
      const response: AddressVerificationResponse = {
        success: true,
        exists: true,
        confidence: 0.95,
        issues: [],
        geocode: {
          latitude: 35.6851,
          longitude: 139.7528,
          accuracy: 'rooftop',
        },
      };

      expect(response.exists).toBe(true);
      expect(response.geocode?.accuracy).toBe('rooftop');
    });
  });

  describe('Invoice Types', () => {
    it('should define invoice request structure', () => {
      const request: InvoiceRequest = {
        shipper: {
          name: 'Sender Corp',
          address: {
            street_address: '1-1 Shibuya',
            city: 'Shibuya-ku',
            province: 'Tokyo',
            postal_code: '150-0001',
            country: 'Japan',
          },
        },
        consignee: {
          name: 'Receiver Inc',
          address: {
            street_address: '123 Main St',
            city: 'New York',
            province: 'NY',
            postal_code: '10001',
            country: 'USA',
          },
        },
        items: [
          {
            description: 'Electronic components',
            hsCode: '8541.10.00',
            quantity: 100,
            unit: 'pcs',
            unitPrice: 5.00,
            totalValue: 500.00,
            currency: 'USD',
          },
        ],
        incoterms: 'DDP',
        reasonForExport: 'sale',
        format: 'pdf',
      };

      expect(request.items).toHaveLength(1);
      expect(request.incoterms).toBe('DDP');
    });

    it('should define invoice response structure', () => {
      const response: InvoiceResponse = {
        success: true,
        invoice: {
          invoiceNumber: 'INV-2024-001',
          invoiceDate: '2024-01-15',
          subtotal: 500.00,
          total: 500.00,
          currency: 'USD',
          totalPackages: 1,
          pdfData: 'base64PdfData',
        },
      };

      expect(response.success).toBe(true);
      expect(response.invoice?.invoiceNumber).toBe('INV-2024-001');
    });
  });

  describe('AI Service Interface', () => {
    it('should define AI service interface methods', () => {
      // Just verify the interface type compiles correctly
      const mockService: AIService = {
        ocr: async () => ({ success: true, textBlocks: [], fullText: '' }),
        suggestHSCode: async () => ({ success: true, suggestions: [] }),
        checkDangerousGoods: async () => ({ success: true, result: 'clear', detectedHazards: [], warnings: [] }),
        translate: async () => ({ success: true, translatedText: '', confidence: 1 }),
        speechToText: async () => ({ success: true, text: '', confidence: 1 }),
        textToSpeech: async () => ({ success: true, audio: '', format: 'mp3', durationSeconds: 0 }),
        verifyAddress: async () => ({ success: true, exists: true, confidence: 1, issues: [] }),
        generateInvoice: async () => ({ success: true }),
      };

      expect(mockService).toBeDefined();
      expect(typeof mockService.ocr).toBe('function');
      expect(typeof mockService.suggestHSCode).toBe('function');
    });
  });
});
