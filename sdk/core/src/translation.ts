/**
 * @vey/core - Translation service integration
 * Supports LibreTranslate, Apertium, and Argos Translate
 */

import type {
  TranslationService,
  TranslationServiceConfig,
  TranslationRequest,
  TranslationResult,
} from './types';

// In-memory translation cache
const translationCache = new Map<string, TranslationResult>();

/**
 * Generate cache key for translation
 */
function getCacheKey(req: TranslationRequest): string {
  return `${req.sourceLang}:${req.targetLang}:${req.text}`;
}

/**
 * LibreTranslate service implementation
 */
async function translateWithLibreTranslate(
  req: TranslationRequest,
  config: TranslationServiceConfig
): Promise<TranslationResult> {
  const endpoint = config.endpoint || 'https://libretranslate.com';
  const url = `${endpoint}/translate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: req.text,
      source: req.sourceLang,
      target: req.targetLang,
      format: 'text',
      api_key: config.apiKey,
    }),
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    translatedText: data.translatedText,
    sourceLang: req.sourceLang,
    targetLang: req.targetLang,
    service: 'libretranslate',
    cached: false,
  };
}

/**
 * Apertium service implementation
 */
async function translateWithApertium(
  req: TranslationRequest,
  config: TranslationServiceConfig
): Promise<TranslationResult> {
  const endpoint = config.endpoint || 'https://www.apertium.org/apy';
  const langPair = `${req.sourceLang}|${req.targetLang}`;
  const url = `${endpoint}/translate?langpair=${langPair}&q=${encodeURIComponent(req.text)}`;

  const response = await fetch(url, {
    method: 'GET',
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Apertium API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(`Apertium translation failed: ${data.responseDetails}`);
  }

  return {
    translatedText: data.responseData.translatedText,
    sourceLang: req.sourceLang,
    targetLang: req.targetLang,
    service: 'apertium',
    cached: false,
  };
}

/**
 * Argos Translate service implementation
 * Note: Argos Translate is typically run locally, so this assumes a local server
 */
async function translateWithArgosTranslate(
  req: TranslationRequest,
  config: TranslationServiceConfig
): Promise<TranslationResult> {
  const endpoint = config.endpoint || 'http://localhost:5000';
  const url = `${endpoint}/translate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: req.text,
      source: req.sourceLang,
      target: req.targetLang,
    }),
    signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Argos Translate API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    translatedText: data.translatedText,
    sourceLang: req.sourceLang,
    targetLang: req.targetLang,
    service: 'argostranslate',
    cached: false,
  };
}

/**
 * Main translation function with service selection and caching
 */
export async function translate(
  req: TranslationRequest,
  config: TranslationServiceConfig
): Promise<TranslationResult> {
  // Check cache first
  const cacheKey = getCacheKey(req);
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  // If source and target are the same, return as-is
  if (req.sourceLang === req.targetLang) {
    return {
      translatedText: req.text,
      sourceLang: req.sourceLang,
      targetLang: req.targetLang,
      service: config.service,
      cached: false,
    };
  }

  let result: TranslationResult;

  try {
    switch (config.service) {
      case 'libretranslate':
        result = await translateWithLibreTranslate(req, config);
        break;
      case 'apertium':
        result = await translateWithApertium(req, config);
        break;
      case 'argostranslate':
        result = await translateWithArgosTranslate(req, config);
        break;
      default:
        throw new Error(`Unsupported translation service: ${config.service}`);
    }

    // Cache the result
    translationCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error(`Translation failed with ${config.service}:`, error);
    throw error;
  }
}

/**
 * Batch translate multiple texts
 */
export async function batchTranslate(
  requests: TranslationRequest[],
  config: TranslationServiceConfig
): Promise<TranslationResult[]> {
  return Promise.all(requests.map((req) => translate(req, config)));
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache statistics
 */
export function getTranslationCacheStats() {
  return {
    size: translationCache.size,
    entries: Array.from(translationCache.keys()),
  };
}

/**
 * Translate address fields from one language to another
 * 
 * Translates all non-empty address fields while preserving field structure.
 * Useful when switching language tabs in address forms.
 * 
 * @param address - Address with fields in source language
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @param config - Translation service configuration
 * @returns Address with translated field values
 * 
 * @example
 * ```typescript
 * const address = {
 *   country: 'JP',
 *   city: '千代田区',
 *   province: '東京都',
 *   street_address: '千代田1-1',
 * };
 * 
 * const translated = await translateAddressFields(
 *   address,
 *   'ja',
 *   'en',
 *   { service: 'libretranslate', endpoint: 'https://libretranslate.com' }
 * );
 * 
 * console.log(translated.city); // "Chiyoda"
 * console.log(translated.province); // "Tokyo"
 * ```
 */
export async function translateAddressFields(
  address: Record<string, string | undefined>,
  sourceLang: string,
  targetLang: string,
  config: TranslationServiceConfig
): Promise<Record<string, string | undefined>> {
  // If source and target are the same, return as-is
  if (sourceLang === targetLang) {
    return { ...address };
  }

  const translatedAddress: Record<string, string | undefined> = {};
  
  // Fields that should be translated
  const translatableFields = [
    'recipient',
    'building',
    'street_address',
    'district',
    'ward',
    'city',
    'province',
  ];

  // Fields that should NOT be translated
  const nonTranslatableFields = [
    'postal_code',
    'country', // ISO code
    'floor',
    'room',
    'unit',
  ];

  // Prepare batch translation requests
  const requests: Array<{ field: string; request: TranslationRequest }> = [];
  
  for (const field of translatableFields) {
    const value = address[field];
    if (value && typeof value === 'string' && value.trim()) {
      requests.push({
        field,
        request: {
          text: value,
          sourceLang,
          targetLang,
          field,
          countryCode: address.country,
        },
      });
    } else if (value !== undefined) {
      // Preserve empty strings and other values as-is
      translatedAddress[field] = value;
    }
  }

  // Translate all fields in batch
  if (requests.length > 0) {
    try {
      const results = await batchTranslate(
        requests.map(r => r.request),
        config
      );

      // Map results back to fields
      requests.forEach((req, index) => {
        translatedAddress[req.field] = results[index].translatedText;
      });
    } catch (error) {
      console.error('Address field translation failed:', error);
      // On error, return original address
      return { ...address };
    }
  }

  // Copy non-translatable fields as-is
  for (const field of nonTranslatableFields) {
    if (address[field] !== undefined) {
      translatedAddress[field] = address[field];
    }
  }

  // Copy any other fields that weren't processed
  for (const field in address) {
    if (translatedAddress[field] === undefined && address[field] !== undefined) {
      translatedAddress[field] = address[field];
    }
  }

  return translatedAddress;
}
