/**
 * Translation Service
 * 
 * Provides free translation API integration for multi-language support
 * in Veyvault and Veyform applications.
 * 
 * Features:
 * - Free translation API (MyMemory, LibreTranslate)
 * - Batch translation support
 * - Language detection
 * - Translation caching
 */

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  confidence?: number;
}

export interface BatchTranslationRequest {
  texts: string[];
  sourceLang: string;
  targetLang: string;
}

export interface LanguageDetectionResult {
  detectedLang: string;
  confidence: number;
}

/**
 * Translation cache for reducing API calls
 */
class TranslationCache {
  private cache: Map<string, string> = new Map();
  private maxSize: number = 1000;

  private getCacheKey(text: string, sourceLang: string, targetLang: string): string {
    return `${sourceLang}:${targetLang}:${text}`;
  }

  get(text: string, sourceLang: string, targetLang: string): string | null {
    return this.cache.get(this.getCacheKey(text, sourceLang, targetLang)) || null;
  }

  set(text: string, sourceLang: string, targetLang: string, translation: string): void {
    // Simple LRU: if cache is full, delete oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(this.getCacheKey(text, sourceLang, targetLang), translation);
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Translation Service Class
 */
export class TranslationService {
  private cache: TranslationCache;
  private apiEndpoint: string;
  private apiKey?: string;

  constructor(config?: { apiEndpoint?: string; apiKey?: string }) {
    this.cache = new TranslationCache();
    // Default to MyMemory API (free, no API key required)
    this.apiEndpoint = config?.apiEndpoint || 'https://api.mymemory.translated.net/get';
    this.apiKey = config?.apiKey;
  }

  /**
   * Translate text from source language to target language
   */
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const { text, sourceLang, targetLang } = request;

    // Return original text if source and target are the same
    if (sourceLang === targetLang) {
      return {
        translatedText: text,
        sourceLang,
        targetLang,
        confidence: 1.0,
      };
    }

    // Check cache first
    const cached = this.cache.get(text, sourceLang, targetLang);
    if (cached) {
      return {
        translatedText: cached,
        sourceLang,
        targetLang,
        confidence: 1.0,
      };
    }

    try {
      // Use MyMemory Translation API
      const langPair = `${sourceLang}|${targetLang}`;
      const url = `${this.apiEndpoint}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.responseStatus === 200 || data.responseData) {
        const translatedText = data.responseData.translatedText;
        
        // Cache the result
        this.cache.set(text, sourceLang, targetLang, translatedText);

        return {
          translatedText,
          sourceLang,
          targetLang,
          confidence: data.responseData.match || 1.0,
        };
      } else {
        throw new Error(`Translation failed: ${data.responseDetails || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text on error
      return {
        translatedText: text,
        sourceLang,
        targetLang,
        confidence: 0,
      };
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(request: BatchTranslationRequest): Promise<TranslationResponse[]> {
    const { texts, sourceLang, targetLang } = request;

    const promises = texts.map(text =>
      this.translate({ text, sourceLang, targetLang })
    );

    return Promise.all(promises);
  }

  /**
   * Detect language of given text
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    // Simple language detection based on character sets
    // For production, use a proper language detection API
    
    // Japanese detection
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
      return { detectedLang: 'ja', confidence: 0.9 };
    }
    
    // Korean detection
    if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) {
      return { detectedLang: 'ko', confidence: 0.9 };
    }
    
    // Chinese detection
    if (/[\u4E00-\u9FFF]/.test(text)) {
      return { detectedLang: 'zh', confidence: 0.8 };
    }
    
    // Arabic detection
    if (/[\u0600-\u06FF]/.test(text)) {
      return { detectedLang: 'ar', confidence: 0.9 };
    }
    
    // Thai detection
    if (/[\u0E00-\u0E7F]/.test(text)) {
      return { detectedLang: 'th', confidence: 0.9 };
    }
    
    // Default to English
    return { detectedLang: 'en', confidence: 0.5 };
  }

  /**
   * Translate address fields
   */
  async translateAddressFields(
    fields: Record<string, string>,
    sourceLang: string,
    targetLang: string
  ): Promise<Record<string, string>> {
    const translatedFields: Record<string, string> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value && value.trim()) {
        const result = await this.translate({
          text: value,
          sourceLang,
          targetLang,
        });
        translatedFields[key] = result.translatedText;
      } else {
        translatedFields[key] = value;
      }
    }

    return translatedFields;
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'th', name: 'Thai', nativeName: 'ไทย' },
      { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    ];
  }
}

/**
 * Singleton instance for global use
 */
let translationServiceInstance: TranslationService | null = null;

/**
 * Get or create translation service instance
 */
export function getTranslationService(): TranslationService {
  if (!translationServiceInstance) {
    translationServiceInstance = new TranslationService();
  }
  return translationServiceInstance;
}

/**
 * Initialize translation service with custom config
 */
export function initTranslationService(config?: {
  apiEndpoint?: string;
  apiKey?: string;
}): TranslationService {
  translationServiceInstance = new TranslationService(config);
  return translationServiceInstance;
}
