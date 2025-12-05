/**
 * @vey/core - Tests for Veyform module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Veyform, createVeyform, getCountryFlag, CONTINENTS } from '../src/veyform';
import type { VeyformConfig } from '../src/veyform';

// Mock localStorage and sessionStorage for Node.js environment
const createMockStorage = () => {
  const storage: Record<string, string> = {};
  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: (index: number) => Object.keys(storage)[index] || null,
  };
};

// Setup global window mock
const setupWindowMock = () => {
  const mockLocalStorage = createMockStorage();
  const mockSessionStorage = createMockStorage();

  global.window = {
    localStorage: mockLocalStorage,
    sessionStorage: mockSessionStorage,
    location: {
      origin: 'https://example.com',
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  } as any;
};

// Cleanup global window mock
const cleanupWindowMock = () => {
  delete (global as any).window;
};

describe('Veyform - Language Features', () => {
  const baseConfig: VeyformConfig = {
    apiKey: 'test-api-key',
    defaultLanguage: 'en',
    allowedLanguages: ['en', 'ja', 'zh', 'ko'],
  };

  beforeEach(() => {
    setupWindowMock();
  });

  afterEach(() => {
    cleanupWindowMock();
  });

  describe('Initialization', () => {
    it('should initialize with default language', () => {
      const veyform = new Veyform(baseConfig);
      const state = veyform.getFormState();

      expect(state.language).toBe('en');
    });

    it('should initialize with custom default language', () => {
      const veyform = new Veyform({
        ...baseConfig,
        defaultLanguage: 'ja',
      });
      const state = veyform.getFormState();

      expect(state.language).toBe('ja');
    });

    it('should load saved language preference from localStorage', () => {
      window.localStorage.setItem('veyform_language_preference', 'ja');

      const veyform = new Veyform(baseConfig);
      const state = veyform.getFormState();

      expect(state.language).toBe('ja');
    });

    it('should use default language when no saved preference exists', () => {
      const veyform = new Veyform(baseConfig);
      const state = veyform.getFormState();

      expect(state.language).toBe('en');
    });

    it('should ignore saved language if not in allowedLanguages', () => {
      window.localStorage.setItem('veyform_language_preference', 'fr');

      const veyform = new Veyform(baseConfig);
      const state = veyform.getFormState();

      expect(state.language).toBe('en'); // Falls back to default
    });

    it('should work without allowedLanguages constraint', () => {
      window.localStorage.setItem('veyform_language_preference', 'fr');

      const veyform = new Veyform({
        ...baseConfig,
        allowedLanguages: undefined,
      });
      const state = veyform.getFormState();

      expect(state.language).toBe('fr');
    });
  });

  describe('Language Switching', () => {
    it('should change language with setLanguage', () => {
      const veyform = new Veyform(baseConfig);

      veyform.setLanguage('ja');

      expect(veyform.getLanguage()).toBe('ja');
      expect(veyform.getFormState().language).toBe('ja');
    });

    it('should persist language preference to localStorage', () => {
      const veyform = new Veyform(baseConfig);

      veyform.setLanguage('ja');

      expect(window.localStorage.getItem('veyform_language_preference')).toBe('ja');
    });

    it('should persist language preference to sessionStorage when configured', () => {
      const veyform = new Veyform({
        ...baseConfig,
        languageStorage: {
          enabled: true,
          storageType: 'sessionStorage',
        },
      });

      veyform.setLanguage('zh');

      expect(window.sessionStorage.getItem('veyform_language_preference')).toBe('zh');
      expect(window.localStorage.getItem('veyform_language_preference')).toBeNull();
    });

    it('should use custom storage key when configured', () => {
      const veyform = new Veyform({
        ...baseConfig,
        languageStorage: {
          enabled: true,
          storageKey: 'custom_lang_key',
        },
      });

      veyform.setLanguage('ko');

      expect(window.localStorage.getItem('custom_lang_key')).toBe('ko');
      expect(window.localStorage.getItem('veyform_language_preference')).toBeNull();
    });

    it('should not persist when storage is disabled', () => {
      const veyform = new Veyform({
        ...baseConfig,
        languageStorage: {
          enabled: false,
        },
      });

      veyform.setLanguage('ja');

      expect(window.localStorage.getItem('veyform_language_preference')).toBeNull();
    });

    it('should warn and not change to disallowed language', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const veyform = new Veyform(baseConfig);

      veyform.setLanguage('fr');

      expect(veyform.getLanguage()).toBe('en'); // Should not change
      expect(consoleSpy).toHaveBeenCalledWith(
        'Language "fr" is not in the allowed languages list'
      );

      consoleSpy.mockRestore();
    });

    it('should trigger onLanguageChange callback', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        ...baseConfig,
        onLanguageChange: callback,
      });

      veyform.setLanguage('ja');

      expect(callback).toHaveBeenCalledWith('ja', 'en');
    });

    it('should pass previous language to callback', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        ...baseConfig,
        defaultLanguage: 'ja',
        onLanguageChange: callback,
      });

      veyform.setLanguage('zh');

      expect(callback).toHaveBeenCalledWith('zh', 'ja');
    });
  });

  describe('Language Preference Management', () => {
    it('should clear language preference', () => {
      const veyform = new Veyform(baseConfig);

      veyform.setLanguage('ja');
      expect(window.localStorage.getItem('veyform_language_preference')).toBe('ja');

      veyform.clearLanguagePreference();
      expect(window.localStorage.getItem('veyform_language_preference')).toBeNull();
    });

    it('should get available languages', () => {
      const veyform = new Veyform(baseConfig);

      const languages = veyform.getAvailableLanguages();

      expect(languages).toEqual(['en', 'ja', 'zh', 'ko']);
    });

    it('should return default languages when allowedLanguages not set', () => {
      const veyform = new Veyform({
        ...baseConfig,
        allowedLanguages: undefined,
      });

      const languages = veyform.getAvailableLanguages();

      expect(languages).toEqual(['en', 'ja', 'zh', 'ko']);
    });
  });

  describe('Factory Function', () => {
    it('should create Veyform instance with createVeyform', () => {
      const veyform = createVeyform(baseConfig);

      expect(veyform).toBeInstanceOf(Veyform);
      expect(veyform.getLanguage()).toBe('en');
    });
  });

  describe('Country Flag Utility', () => {
    it('should return correct flag emoji for JP', () => {
      const flag = getCountryFlag('JP');
      expect(flag).toBe('🇯🇵');
    });

    it('should return correct flag emoji for US', () => {
      const flag = getCountryFlag('US');
      expect(flag).toBe('🇺🇸');
    });

    it('should return correct flag emoji for GB', () => {
      const flag = getCountryFlag('GB');
      expect(flag).toBe('🇬🇧');
    });

    it('should handle lowercase country codes', () => {
      const flag = getCountryFlag('jp');
      expect(flag).toBe('🇯🇵');
    });
  });

  describe('Continents', () => {
    it('should have all continents defined', () => {
      expect(CONTINENTS.africa).toBeDefined();
      expect(CONTINENTS.americas).toBeDefined();
      expect(CONTINENTS.antarctica).toBeDefined();
      expect(CONTINENTS.asia).toBeDefined();
      expect(CONTINENTS.europe).toBeDefined();
      expect(CONTINENTS.oceania).toBeDefined();
    });

    it('should have multi-language continent names', () => {
      expect(CONTINENTS.asia.name.en).toBe('Asia');
      expect(CONTINENTS.asia.name.ja).toBe('アジア');
      expect(CONTINENTS.asia.name.zh).toBe('亚洲');
      expect(CONTINENTS.asia.name.ko).toBe('아시아');
    });

    it('should get continents with getContinents', () => {
      const veyform = new Veyform(baseConfig);
      const continents = veyform.getContinents();

      expect(continents).toHaveLength(6);
      expect(continents[0]).toHaveProperty('code');
      expect(continents[0]).toHaveProperty('name');
    });

    it('should get continents in specific language', () => {
      const veyform = new Veyform(baseConfig);
      const continents = veyform.getContinents('ja');

      expect(continents).toHaveLength(6);
      // Display property should be added
      expect(continents.find(c => c.code === 'asia')).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage.setItem to throw error
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const veyform = new Veyform(baseConfig);
      veyform.setLanguage('ja');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save language preference:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle storage retrieval errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage.getItem to throw error
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const veyform = new Veyform(baseConfig);

      expect(veyform.getLanguage()).toBe('en'); // Falls back to default
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load language preference:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Integration with Form State', () => {
    it('should maintain language across form operations', () => {
      const veyform = new Veyform(baseConfig);

      veyform.setLanguage('ja');
      veyform.selectCountry('JP');

      expect(veyform.getFormState().language).toBe('ja');
      expect(veyform.getFormState().country).toBe('JP');
    });

    it('should preserve language when form is reset', () => {
      const veyform = new Veyform(baseConfig);

      veyform.setLanguage('ja');
      veyform.selectCountry('JP');
      veyform.selectCountry('US'); // This resets form values

      expect(veyform.getFormState().language).toBe('ja');
      expect(veyform.getFormState().values).toEqual({});
    });
  });

  describe('Multiple Language Changes', () => {
    it('should handle multiple language changes correctly', () => {
      const callback = vi.fn();
      const veyform = new Veyform({
        ...baseConfig,
        onLanguageChange: callback,
      });

      veyform.setLanguage('ja');
      veyform.setLanguage('zh');
      veyform.setLanguage('ko');

      expect(veyform.getLanguage()).toBe('ko');
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, 'ja', 'en');
      expect(callback).toHaveBeenNthCalledWith(2, 'zh', 'ja');
      expect(callback).toHaveBeenNthCalledWith(3, 'ko', 'zh');
    });

    it('should persist final language preference', () => {
      const veyform = new Veyform(baseConfig);

      veyform.setLanguage('ja');
      veyform.setLanguage('zh');
      veyform.setLanguage('ko');

      expect(window.localStorage.getItem('veyform_language_preference')).toBe('ko');
    });
  });
});
