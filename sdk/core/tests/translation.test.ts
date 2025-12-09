/**
 * @vey/core - Translation tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  translate,
  batchTranslate,
  clearTranslationCache,
  getTranslationCacheStats,
  translateAddressFields,
} from '../src/translation';
import type { TranslationRequest, TranslationServiceConfig } from '../src/types';

describe('Translation', () => {
  beforeEach(() => {
    clearTranslationCache();
    vi.restoreAllMocks();
  });

  describe('translate', () => {
    it('should return same text when source and target languages are identical', async () => {
      const request: TranslationRequest = {
        text: 'Hello World',
        sourceLang: 'en',
        targetLang: 'en',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      const result = await translate(request, config);
      
      expect(result.translatedText).toBe('Hello World');
      expect(result.sourceLang).toBe('en');
      expect(result.targetLang).toBe('en');
      expect(result.cached).toBe(false);
    });

    it('should throw error for unsupported service', async () => {
      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'unsupported' as any,
      };

      await expect(translate(request, config)).rejects.toThrow(
        'Unsupported translation service'
      );
    });

    it('should use LibreTranslate service successfully', async () => {
      const mockResponse = {
        translatedText: 'こんにちは世界',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: TranslationRequest = {
        text: 'Hello World',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
        endpoint: 'https://libretranslate.com',
      };

      const result = await translate(request, config);
      
      expect(result.translatedText).toBe('こんにちは世界');
      expect(result.service).toBe('libretranslate');
      expect(result.cached).toBe(false);
    });

    it('should use Apertium service successfully', async () => {
      const mockResponse = {
        responseStatus: 200,
        responseData: {
          translatedText: 'Hola Mundo',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: TranslationRequest = {
        text: 'Hello World',
        sourceLang: 'en',
        targetLang: 'es',
      };

      const config: TranslationServiceConfig = {
        service: 'apertium',
      };

      const result = await translate(request, config);
      
      expect(result.translatedText).toBe('Hola Mundo');
      expect(result.service).toBe('apertium');
      expect(result.cached).toBe(false);
    });

    it('should use Argos Translate service successfully', async () => {
      const mockResponse = {
        translatedText: 'Bonjour le monde',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: TranslationRequest = {
        text: 'Hello World',
        sourceLang: 'en',
        targetLang: 'fr',
      };

      const config: TranslationServiceConfig = {
        service: 'argostranslate',
        endpoint: 'http://localhost:5000',
      };

      const result = await translate(request, config);
      
      expect(result.translatedText).toBe('Bonjour le monde');
      expect(result.service).toBe('argostranslate');
      expect(result.cached).toBe(false);
    });

    it('should cache translation results', async () => {
      const mockResponse = {
        translatedText: 'こんにちは',
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = fetchMock;

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      // First call - should hit API
      const result1 = await translate(request, config);
      expect(result1.cached).toBe(false);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await translate(request, config);
      expect(result2.cached).toBe(true);
      expect(result2.translatedText).toBe('こんにちは');
      expect(fetchMock).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should handle LibreTranslate API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      await expect(translate(request, config)).rejects.toThrow(
        'LibreTranslate API error'
      );
    });

    it('should handle Apertium API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      });

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'es',
      };

      const config: TranslationServiceConfig = {
        service: 'apertium',
      };

      await expect(translate(request, config)).rejects.toThrow(
        'Apertium API error'
      );
    });

    it('should handle Apertium translation failure', async () => {
      const mockResponse = {
        responseStatus: 400,
        responseDetails: 'Language pair not supported',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'xx',
      };

      const config: TranslationServiceConfig = {
        service: 'apertium',
      };

      await expect(translate(request, config)).rejects.toThrow(
        'Apertium translation failed'
      );
    });

    it('should handle Argos Translate API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Service Unavailable',
      });

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'fr',
      };

      const config: TranslationServiceConfig = {
        service: 'argostranslate',
      };

      await expect(translate(request, config)).rejects.toThrow(
        'Argos Translate API error'
      );
    });

    it('should use custom endpoint for LibreTranslate', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ translatedText: 'Translated' }),
      });
      global.fetch = fetchMock;

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
        endpoint: 'https://custom.libretranslate.com',
      };

      await translate(request, config);
      
      expect(fetchMock).toHaveBeenCalledWith(
        'https://custom.libretranslate.com/translate',
        expect.any(Object)
      );
    });

    it('should include API key for LibreTranslate', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ translatedText: 'Translated' }),
      });
      global.fetch = fetchMock;

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
        apiKey: 'my-api-key',
      };

      await translate(request, config);
      
      const callArgs = fetchMock.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.api_key).toBe('my-api-key');
    });
  });

  describe('batchTranslate', () => {
    it('should translate multiple texts', async () => {
      const mockResponses = [
        { translatedText: 'こんにちは' },
        { translatedText: 'さようなら' },
        { translatedText: 'ありがとう' },
      ];

      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: async () => mockResponses[callCount++],
        });
      });

      const requests: TranslationRequest[] = [
        { text: 'Hello', sourceLang: 'en', targetLang: 'ja' },
        { text: 'Goodbye', sourceLang: 'en', targetLang: 'ja' },
        { text: 'Thank you', sourceLang: 'en', targetLang: 'ja' },
      ];

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      const results = await batchTranslate(requests, config);
      
      expect(results).toHaveLength(3);
      expect(results[0].translatedText).toBe('こんにちは');
      expect(results[1].translatedText).toBe('さようなら');
      expect(results[2].translatedText).toBe('ありがとう');
    });

    it('should handle empty batch', async () => {
      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      const results = await batchTranslate([], config);
      expect(results).toHaveLength(0);
    });

    it('should handle batch with same language pairs', async () => {
      const requests: TranslationRequest[] = [
        { text: 'Hello', sourceLang: 'en', targetLang: 'en' },
        { text: 'World', sourceLang: 'en', targetLang: 'en' },
      ];

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      const results = await batchTranslate(requests, config);
      
      expect(results).toHaveLength(2);
      expect(results[0].translatedText).toBe('Hello');
      expect(results[1].translatedText).toBe('World');
    });

    it('should translate same text multiple times in batch', async () => {
      const mockResponse = { translatedText: 'こんにちは' };
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = fetchMock;

      const requests: TranslationRequest[] = [
        { text: 'Hello', sourceLang: 'en', targetLang: 'ja' },
        { text: 'Hello', sourceLang: 'en', targetLang: 'ja' },
        { text: 'Hello', sourceLang: 'en', targetLang: 'ja' },
      ];

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      const results = await batchTranslate(requests, config);
      
      expect(results).toHaveLength(3);
      // All results should have the same translation
      expect(results[0].translatedText).toBe('こんにちは');
      expect(results[1].translatedText).toBe('こんにちは');
      expect(results[2].translatedText).toBe('こんにちは');
    });
  });

  describe('clearTranslationCache', () => {
    it('should clear the cache', async () => {
      const mockResponse = { translatedText: 'こんにちは' };
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = fetchMock;

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      // First call - cache the result
      await translate(request, config);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call - use cache
      await translate(request, config);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Clear cache
      clearTranslationCache();

      // Third call - should hit API again
      await translate(request, config);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('getTranslationCacheStats', () => {
    it('should return empty stats initially', () => {
      const stats = getTranslationCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.entries).toHaveLength(0);
    });

    it('should track cache entries', async () => {
      const mockResponse = { translatedText: 'こんにちは' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      await translate(request, config);

      const stats = getTranslationCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.entries).toHaveLength(1);
      expect(stats.entries[0]).toContain('en:ja:Hello');
    });

    it('should track multiple cache entries', async () => {
      const mockResponse = { translatedText: 'Translated' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const requests: TranslationRequest[] = [
        { text: 'Hello', sourceLang: 'en', targetLang: 'ja' },
        { text: 'Goodbye', sourceLang: 'en', targetLang: 'ja' },
        { text: 'Thank you', sourceLang: 'en', targetLang: 'fr' },
      ];

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      await batchTranslate(requests, config);

      const stats = getTranslationCacheStats();
      expect(stats.size).toBe(3);
      expect(stats.entries).toHaveLength(3);
    });

    it('should show empty stats after clearing cache', async () => {
      const mockResponse = { translatedText: 'Translated' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request: TranslationRequest = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'ja',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      await translate(request, config);
      expect(getTranslationCacheStats().size).toBe(1);

      clearTranslationCache();
      
      const stats = getTranslationCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.entries).toHaveLength(0);
    });
  });

  describe('translateAddressFields', () => {
    it('should translate address fields from Japanese to English', async () => {
      const mockResponse = { translatedText: 'Translated' };
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = fetchMock;

      const address = {
        country: 'JP',
        postal_code: '100-0001',
        city: '千代田区',
        province: '東京都',
        street_address: '千代田1-1',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
        endpoint: 'https://libretranslate.com',
      };

      const translated = await translateAddressFields(address, 'ja', 'en', config);

      // Translatable fields should be translated
      expect(translated.city).toBe('Translated');
      expect(translated.province).toBe('Translated');
      expect(translated.street_address).toBe('Translated');

      // Non-translatable fields should be preserved
      expect(translated.country).toBe('JP');
      expect(translated.postal_code).toBe('100-0001');
    });

    it('should return same address when source and target language are the same', async () => {
      const address = {
        country: 'JP',
        city: 'Tokyo',
        province: 'Tokyo',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      const translated = await translateAddressFields(address, 'en', 'en', config);

      expect(translated).toEqual(address);
      expect(translated).not.toBe(address); // Should be a new object
    });

    it('should preserve non-translatable fields', async () => {
      const mockResponse = { translatedText: 'Translated' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const address = {
        country: 'US',
        postal_code: '90210',
        city: 'Beverly Hills',
        province: 'California',
        floor: '12',
        room: '1205',
        unit: 'A',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      const translated = await translateAddressFields(address, 'en', 'ja', config);

      // Non-translatable fields should remain unchanged
      expect(translated.postal_code).toBe('90210');
      expect(translated.country).toBe('US');
      expect(translated.floor).toBe('12');
      expect(translated.room).toBe('1205');
      expect(translated.unit).toBe('A');

      // Translatable fields should be translated
      expect(translated.city).toBe('Translated');
      expect(translated.province).toBe('Translated');
    });

    it('should handle empty or undefined fields', async () => {
      const mockResponse = { translatedText: 'Translated' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const address = {
        country: 'US',
        postal_code: '90210',
        city: 'Beverly Hills',
        province: '', // Empty
        street_address: undefined, // Undefined
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      const translated = await translateAddressFields(address, 'en', 'ja', config);

      // Only non-empty fields should be translated
      expect(translated.city).toBe('Translated');
      expect(translated.province).toBe(''); // Preserved as empty
      expect(translated.street_address).toBeUndefined(); // Preserved as undefined
    });

    it('should handle translation errors gracefully', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error('API Error'));
      global.fetch = fetchMock;

      const address = {
        country: 'JP',
        city: '東京',
        province: '東京都',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      // Should not throw, but return original address
      const translated = await translateAddressFields(address, 'ja', 'en', config);

      expect(translated).toEqual(address);
    });

    it('should batch translate multiple fields efficiently', async () => {
      const mockResponse = { translatedText: 'Translated' };
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      global.fetch = fetchMock;

      const address = {
        recipient: '山田太郎',
        building: '新宿ビル',
        city: '新宿区',
        province: '東京都',
        street_address: '西新宿1-1-1',
      };

      const config: TranslationServiceConfig = {
        service: 'libretranslate',
      };

      await translateAddressFields(address, 'ja', 'en', config);

      // Should call API for each translatable field
      expect(fetchMock).toHaveBeenCalledTimes(5);
    });
  });
});
