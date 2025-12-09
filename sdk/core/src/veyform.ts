/**
 * Veyform - Universal Address Form System
 * 
 * Core SDK for world address form with:
 * - 3-layer country selection (Continent → Country → Address Hierarchy)
 * - Multi-language support with synchronized labels and placeholders
 * - Domain auto-detection
 * - Delivery-level validation
 * - Analytics tracking
 */

import type { 
  CountryAddressFormat, 
  Language,
  AddressField,
  ValidationResult,
  AddressInput,
  PostalCodeLookupResult,
} from './types';

/** Continent codes */
export type Continent = 
  | 'africa' 
  | 'americas' 
  | 'antarctica' 
  | 'asia' 
  | 'europe' 
  | 'oceania';

/** Continent metadata */
export interface ContinentInfo {
  code: Continent;
  name: {
    en: string;
    ja: string;
    zh: string;
    ko: string;
  };
  countries: string[]; // ISO alpha-2 codes
}

/** Country with flag emoji */
export interface CountryOption {
  code: string; // ISO alpha-2
  name: string;
  nameLocal?: string;
  flag: string; // Flag emoji
  continent: Continent;
  subregion: string;
}

/**
 * Language preference storage configuration
 * 
 * Controls how user language preferences are persisted across sessions.
 * By default, preferences are stored in localStorage for persistence across browser sessions.
 * 
 * @example
 * ```typescript
 * // Store in localStorage (persists across browser sessions)
 * const config = {
 *   languageStorage: {
 *     enabled: true,
 *     storageType: 'localStorage',
 *     storageKey: 'my_app_language'
 *   }
 * };
 * 
 * // Store in sessionStorage (cleared when browser tab closes)
 * const config = {
 *   languageStorage: {
 *     enabled: true,
 *     storageType: 'sessionStorage'
 *   }
 * };
 * 
 * // Disable persistence
 * const config = {
 *   languageStorage: {
 *     enabled: false
 *   }
 * };
 * ```
 */
export interface LanguageStorageConfig {
  /** 
   * Enable or disable language preference persistence
   * @default true
   */
  enabled?: boolean;
  
  /** 
   * Storage type for persisting language preference
   * - `localStorage`: Persists across browser sessions
   * - `sessionStorage`: Cleared when browser tab/window closes
   * @default 'localStorage'
   */
  storageType?: 'localStorage' | 'sessionStorage';
  
  /** 
   * Custom storage key name
   * @default 'veyform_language_preference'
   */
  storageKey?: string;
}

/**
 * Callback function invoked when the form language changes
 * 
 * Use this callback to respond to language changes in real-time, such as:
 * - Updating UI labels and text
 * - Fetching language-specific resources
 * - Tracking analytics events
 * - Syncing with external state management
 * 
 * @param language - The new language code (ISO 639-1 format, e.g., 'en', 'ja', 'zh')
 * @param previousLanguage - The previous language code, if any
 * 
 * @example
 * ```typescript
 * const veyform = createVeyform({
 *   apiKey: 'your-api-key',
 *   onLanguageChange: (newLang, prevLang) => {
 *     console.log(`Language changed from ${prevLang} to ${newLang}`);
 *     // Update your application's language state
 *     i18n.changeLanguage(newLang);
 *   }
 * });
 * ```
 */
export type LanguageChangeCallback = (language: string, previousLanguage?: string) => void;

/** Veyform initialization options */
export interface VeyformConfig {
  /** API key for authentication */
  apiKey: string;
  
  /** Auto-detect domain/origin for multi-tenant support */
  domainAutoDetect?: boolean;
  
  /** Explicitly set allowed origin (overrides auto-detection) */
  origin?: string;
  
  /** Default country (ISO alpha-2) */
  defaultCountry?: string;
  
  /** Allowed countries for this site (ISO alpha-2 codes) */
  allowedCountries?: string[];
  
  /** 
   * Default language code (ISO 639-1 format, e.g., 'en', 'ja', 'zh', 'ko')
   * 
   * This language will be used when:
   * - No saved language preference exists
   * - Saved language preference is invalid or not in allowedLanguages
   * 
   * @default 'en'
   */
  defaultLanguage?: string;
  
  /** 
   * Allowed languages for the form
   * 
   * If specified, only these languages can be selected. Attempts to set
   * other languages will be rejected with a console warning.
   * If not specified, defaults to ['en', 'ja', 'zh', 'ko'].
   * 
   * @example ['en', 'ja', 'zh', 'ko', 'es', 'fr']
   */
  allowedLanguages?: string[];
  
  /** Use continent filter tabs */
  useContinentFilter?: boolean;
  
  /** Continent filter display style (tabs or dropdown) */
  continentFilterStyle?: 'tabs' | 'dropdown';
  
  /** Validation strictness */
  validationLevel?: 'strict' | 'medium' | 'loose';
  
  /** Enable analytics tracking (anonymized) */
  enableAnalytics?: boolean;
  
  /** Custom analytics endpoint */
  analyticsEndpoint?: string;
  
  /** 
   * Language preference storage configuration
   * 
   * Controls how user language preferences are persisted across sessions.
   * When enabled, the selected language is automatically saved and restored
   * when the user returns.
   * 
   * @see {@link LanguageStorageConfig} for configuration options
   * @default { enabled: true, storageType: 'localStorage', storageKey: 'veyform_language_preference' }
   */
  languageStorage?: LanguageStorageConfig;
  
  /** 
   * Callback invoked when the form language changes
   * 
   * This callback is triggered after the language has been successfully changed
   * via `setLanguage()`. Use it to update your application's UI, fetch
   * language-specific resources, or track analytics.
   * 
   * @see {@link LanguageChangeCallback} for callback signature details
   * @example
   * ```typescript
   * onLanguageChange: (newLang, prevLang) => {
   *   console.log(`Language changed from ${prevLang} to ${newLang}`);
   *   updateUILabels(newLang);
   * }
   * ```
   */
  onLanguageChange?: LanguageChangeCallback;
}

/** Analytics event types */
export type AnalyticsEventType =
  | 'country_selected'
  | 'language_changed'
  | 'continent_filter_used'
  | 'field_focused'
  | 'field_completed'
  | 'validation_failed'
  | 'validation_passed'
  | 'form_submitted'
  | 'form_abandoned';

/** Analytics event data */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: string;
  data: {
    country?: string;
    language?: string;
    continent?: Continent;
    field?: string;
    validationErrors?: number;
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    completionRate?: number;
  };
  sessionId: string;
  origin?: string;
}

/** Field configuration with language support */
export interface FieldConfig {
  name: string;
  type: 'text' | 'select' | 'postal_code';
  required: boolean;
  labels: Record<string, string>; // Language code -> label
  placeholders: Record<string, string>; // Language code -> placeholder
  validation?: {
    regex?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => boolean;
  };
  autoComplete?: string;
}

/** Address form state */
export interface FormState {
  country?: string;
  language: string;
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  completionRate: number;
}

/**
 * Continent data registry
 */
export const CONTINENTS: Record<Continent, ContinentInfo> = {
  africa: {
    code: 'africa',
    name: {
      en: 'Africa',
      ja: 'アフリカ',
      zh: '非洲',
      ko: '아프리카'
    },
    countries: []
  },
  americas: {
    code: 'americas',
    name: {
      en: 'Americas',
      ja: 'アメリカ大陸',
      zh: '美洲',
      ko: '아메리카'
    },
    countries: []
  },
  antarctica: {
    code: 'antarctica',
    name: {
      en: 'Antarctica',
      ja: '南極',
      zh: '南极洲',
      ko: '남극'
    },
    countries: []
  },
  asia: {
    code: 'asia',
    name: {
      en: 'Asia',
      ja: 'アジア',
      zh: '亚洲',
      ko: '아시아'
    },
    countries: []
  },
  europe: {
    code: 'europe',
    name: {
      en: 'Europe',
      ja: 'ヨーロッパ',
      zh: '欧洲',
      ko: '유럽'
    },
    countries: []
  },
  oceania: {
    code: 'oceania',
    name: {
      en: 'Oceania',
      ja: 'オセアニア',
      zh: '大洋洲',
      ko: '오세아니아'
    },
    countries: []
  }
};

/**
 * Country flag emoji lookup (ISO alpha-2 to flag)
 */
export function getCountryFlag(countryCode: string): string {
  // Convert ISO alpha-2 to regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Veyform class - Main SDK interface
 * 
 * Provides a comprehensive address form system with multi-language support,
 * country-specific validation, and automatic language preference persistence.
 */
export class Veyform {
  private config: VeyformConfig;
  private countryData: Map<string, CountryAddressFormat> = new Map();
  private sessionId: string;
  private formState: FormState;

  /**
   * Create a new Veyform instance
   * 
   * Initializes the form with the provided configuration, including:
   * - Language preference loading from browser storage (if enabled)
   * - Domain auto-detection for multi-tenant support (if enabled)
   * - Session ID generation for analytics tracking
   * - Default language fallback when no saved preference exists
   * 
   * @param config - Veyform configuration options
   * 
   * @remarks
   * The constructor automatically loads saved language preferences from storage.
   * Language preference loading priority:
   * 1. Saved preference from storage (if valid and in allowedLanguages)
   * 2. defaultLanguage from config
   * 3. 'en' (hardcoded fallback)
   * 
   * @example
   * ```typescript
   * // Basic initialization
   * const veyform = new Veyform({
   *   apiKey: 'your-api-key',
   *   defaultLanguage: 'en'
   * });
   * 
   * // With language storage and callback
   * const veyform = new Veyform({
   *   apiKey: 'your-api-key',
   *   defaultLanguage: 'en',
   *   allowedLanguages: ['en', 'ja', 'zh'],
   *   languageStorage: {
   *     enabled: true,
   *     storageType: 'localStorage'
   *   },
   *   onLanguageChange: (newLang, prevLang) => {
   *     console.log(`Language changed: ${prevLang} → ${newLang}`);
   *   }
   * });
   * ```
   */
  constructor(config: VeyformConfig) {
    this.config = {
      validationLevel: 'strict',
      enableAnalytics: true,
      useContinentFilter: true,
      defaultLanguage: 'en',
      languageStorage: {
        enabled: true,
        storageType: 'localStorage',
        storageKey: 'veyform_language_preference',
        ...config.languageStorage
      },
      ...config
    };

    // Auto-detect domain if enabled
    if (this.config.domainAutoDetect && typeof window !== 'undefined') {
      this.config.origin = window.location.origin;
    }

    // Generate session ID
    this.sessionId = this.generateSessionId();

    // Load saved language preference or use default
    const savedLanguage = this.loadLanguagePreference();
    const initialLanguage = savedLanguage || this.config.defaultLanguage!;

    // Initialize form state
    this.formState = {
      language: initialLanguage,
      values: {},
      errors: {},
      touched: {},
      isValid: false,
      completionRate: 0
    };
  }

  /**
   * Initialize Veyform instance (static factory method)
   * 
   * Alternative way to create a Veyform instance using a static method.
   * This is functionally identical to using the constructor directly.
   * 
   * @param config - Veyform configuration options
   * @returns A new Veyform instance
   * 
   * @see {@link Veyform.constructor} for detailed initialization behavior
   * 
   * @example
   * ```typescript
   * const veyform = Veyform.init({
   *   apiKey: 'your-api-key',
   *   defaultLanguage: 'en'
   * });
   * ```
   */
  static init(config: VeyformConfig): Veyform {
    return new Veyform(config);
  }

  /**
   * Get continent information
   */
  getContinents(language: string = 'en'): ContinentInfo[] {
    return Object.values(CONTINENTS).map(continent => ({
      ...continent,
      name: {
        ...continent.name,
        display: continent.name[language as keyof typeof continent.name] || continent.name.en
      } as any
    }));
  }

  /**
   * Get countries by continent
   */
  getCountriesByContinent(continent: Continent, language: string = 'en'): CountryOption[] {
    const countries: CountryOption[] = [];
    
    // This would be loaded from data files in real implementation
    // For now, return structure
    return countries.map(country => ({
      ...country,
      flag: getCountryFlag(country.code)
    }));
  }

  /**
   * Get filtered countries based on configuration
   */
  getAvailableCountries(language: string = 'en'): CountryOption[] {
    let countries: CountryOption[] = [];
    
    // Load all countries or filter by allowedCountries
    if (this.config.allowedCountries) {
      countries = countries.filter(c => 
        this.config.allowedCountries!.includes(c.code)
      );
    }
    
    return countries.map(country => ({
      ...country,
      flag: getCountryFlag(country.code)
    }));
  }

  /**
   * Get address form fields for selected country
   */
  getFormFields(countryCode: string, language: string): FieldConfig[] {
    const countryData = this.countryData.get(countryCode);
    if (!countryData) {
      throw new Error(`Country data not found: ${countryCode}`);
    }

    const fields: FieldConfig[] = [];
    const format = countryData.address_format;
    const langs = countryData.languages;

    // Build field configurations from address format
    const order = format.order || [];
    for (const fieldName of order) {
      const fieldDef = format[fieldName as keyof typeof format] as AddressField;
      if (!fieldDef) continue;

      const field: FieldConfig = {
        name: fieldName,
        type: fieldName === 'postal_code' ? 'postal_code' : 'text',
        required: fieldDef.required || false,
        labels: {},
        placeholders: {}
      };

      // Extract labels for all languages
      for (const lang of langs) {
        const langCode = lang.code || 'en';
        field.labels[langCode] = lang.field_labels?.[fieldName] || fieldDef.label_en || fieldName;
        field.placeholders[langCode] = fieldDef.example || '';
      }

      // Add validation
      if (fieldDef.regex) {
        field.validation = {
          regex: fieldDef.regex
        };
      }

      fields.push(field);
    }

    return fields;
  }

  /**
   * Change the form language
   * 
   * Updates the current language for the form and all its field labels and placeholders.
   * This method performs the following actions:
   * 1. Validates the language is in the allowedLanguages list (if configured)
   * 2. Updates the form state with the new language
   * 3. Persists the language preference to storage (if enabled)
   * 4. Triggers the onLanguageChange callback (if configured)
   * 5. Tracks a language_changed analytics event (if enabled)
   * 
   * @param language - ISO 639-1 language code (e.g., 'en', 'ja', 'zh', 'ko')
   * 
   * @throws {void} Does not throw errors. Invalid languages are logged as warnings.
   * 
   * @example
   * ```typescript
   * // Change to Japanese
   * veyform.setLanguage('ja');
   * 
   * // Change to Chinese with callback
   * const veyform = createVeyform({
   *   apiKey: 'your-api-key',
   *   allowedLanguages: ['en', 'ja', 'zh'],
   *   onLanguageChange: (newLang, prevLang) => {
   *     console.log(`Changed from ${prevLang} to ${newLang}`);
   *   }
   * });
   * veyform.setLanguage('zh'); // Triggers callback
   * ```
   */
  setLanguage(language: string): void {
    // Validate language is allowed if allowedLanguages is configured
    if (this.config.allowedLanguages && !this.config.allowedLanguages.includes(language)) {
      console.warn(`Language "${language}" is not in the allowed languages list`);
      return;
    }

    const previousLanguage = this.formState.language;
    this.formState.language = language;
    
    // Save language preference if enabled
    this.saveLanguagePreference(language);
    
    // Trigger callback if provided
    if (this.config.onLanguageChange) {
      this.config.onLanguageChange(language, previousLanguage);
    }
    
    this.trackEvent('language_changed', { language });
  }

  /**
   * Get the current language code
   * 
   * Returns the currently active language for the form. This is the language
   * used for displaying field labels, placeholders, and validation messages.
   * 
   * @returns The current language code (ISO 639-1 format)
   * 
   * @example
   * ```typescript
   * const currentLang = veyform.getLanguage();
   * console.log(currentLang); // 'en', 'ja', 'zh', etc.
   * 
   * // Use current language to get localized form fields
   * const fields = veyform.getFormFields('JP', veyform.getLanguage());
   * ```
   */
  getLanguage(): string {
    return this.formState.language;
  }

  /**
   * Get the list of available languages
   * 
   * Returns an array of language codes that can be used with setLanguage().
   * If allowedLanguages was specified in the configuration, returns that list.
   * Otherwise, returns the default supported languages: ['en', 'ja', 'zh', 'ko'].
   * 
   * @returns Array of ISO 639-1 language codes
   * 
   * @example
   * ```typescript
   * const languages = veyform.getAvailableLanguages();
   * console.log(languages); // ['en', 'ja', 'zh', 'ko']
   * 
   * // Build a language switcher UI
   * languages.forEach(lang => {
   *   const button = document.createElement('button');
   *   button.textContent = lang.toUpperCase();
   *   button.onclick = () => veyform.setLanguage(lang);
   *   languageSwitcher.appendChild(button);
   * });
   * ```
   */
  getAvailableLanguages(): string[] {
    return this.config.allowedLanguages || ['en', 'ja', 'zh', 'ko'];
  }

  /**
   * Save language preference to browser storage
   * 
   * Private helper method that persists the selected language to localStorage
   * or sessionStorage based on configuration. This method is automatically
   * called by setLanguage() when language storage is enabled.
   * 
   * @param language - The language code to save
   * 
   * @remarks
   * - Silently returns if storage is disabled or in non-browser environment
   * - Logs warning to console if storage operation fails (e.g., quota exceeded)
   * - Uses the configured storage type and key from languageStorage config
   * 
   * @private
   */
  private saveLanguagePreference(language: string): void {
    if (!this.config.languageStorage?.enabled) return;
    if (typeof window === 'undefined') return;

    try {
      const storageType = this.config.languageStorage.storageType || 'localStorage';
      const storageKey = this.config.languageStorage.storageKey || 'veyform_language_preference';
      const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
      
      storage.setItem(storageKey, language);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }

  /**
   * Load language preference from browser storage
   * 
   * Private helper method that retrieves the previously saved language preference
   * from localStorage or sessionStorage. This method is automatically called
   * during Veyform initialization to restore the user's language preference.
   * 
   * @returns The saved language code, or null if no valid preference exists
   * 
   * @remarks
   * - Returns null if storage is disabled or in non-browser environment
   * - Validates saved language against allowedLanguages if configured
   * - Returns null for invalid/disallowed saved languages
   * - Logs warning to console if storage operation fails
   * 
   * @private
   */
  private loadLanguagePreference(): string | null {
    if (!this.config.languageStorage?.enabled) return null;
    if (typeof window === 'undefined') return null;

    try {
      const storageType = this.config.languageStorage.storageType || 'localStorage';
      const storageKey = this.config.languageStorage.storageKey || 'veyform_language_preference';
      const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
      
      const savedLanguage = storage.getItem(storageKey);
      
      // Validate saved language is allowed
      if (savedLanguage && this.config.allowedLanguages) {
        return this.config.allowedLanguages.includes(savedLanguage) ? savedLanguage : null;
      }
      
      return savedLanguage;
    } catch (error) {
      console.warn('Failed to load language preference:', error);
      return null;
    }
  }

  /**
   * Clear the saved language preference
   * 
   * Removes the persisted language preference from browser storage.
   * After calling this method, the next Veyform instance will use the
   * defaultLanguage instead of a saved preference.
   * 
   * This method is useful for:
   * - Implementing a "Reset to default" feature
   * - User logout/session cleanup
   * - Testing different language configurations
   * - Clearing user preferences on request
   * 
   * @remarks
   * - Does nothing if storage is disabled or in non-browser environment
   * - Logs warning to console if storage operation fails
   * - Does not change the current form's language (only affects future instances)
   * 
   * @example
   * ```typescript
   * // Clear saved preference
   * veyform.clearLanguagePreference();
   * 
   * // Next instance will use default language
   * const newVeyform = createVeyform({
   *   apiKey: 'your-api-key',
   *   defaultLanguage: 'en'
   * });
   * // Will start with 'en' instead of saved preference
   * 
   * // To also change current form's language
   * veyform.clearLanguagePreference();
   * veyform.setLanguage('en'); // Reset to default
   * ```
   */
  clearLanguagePreference(): void {
    if (!this.config.languageStorage?.enabled) return;
    if (typeof window === 'undefined') return;

    try {
      const storageType = this.config.languageStorage.storageType || 'localStorage';
      const storageKey = this.config.languageStorage.storageKey || 'veyform_language_preference';
      const storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
      
      storage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear language preference:', error);
    }
  }

  /**
   * Select country
   */
  selectCountry(countryCode: string): void {
    this.formState.country = countryCode;
    this.formState.values = {}; // Reset form
    this.formState.errors = {};
    this.formState.touched = {};
    this.trackEvent('country_selected', { country: countryCode });
  }

  /**
   * Update field value
   */
  setFieldValue(fieldName: string, value: string): void {
    this.formState.values[fieldName] = value;
    this.formState.touched[fieldName] = true;
    this.updateCompletionRate();
  }

  /**
   * Validate current form state
   */
  validate(): ValidationResult {
    const errors: Array<{ field: string; code: string; message: string }> = [];
    
    if (!this.formState.country) {
      return {
        valid: false,
        errors: [{ field: 'country', code: 'required', message: 'Country is required' }],
        warnings: []
      };
    }

    const fields = this.getFormFields(this.formState.country, this.formState.language);
    
    for (const field of fields) {
      const value = this.formState.values[field.name];
      
      // Check required
      if (field.required && !value) {
        errors.push({
          field: field.name,
          code: 'required',
          message: `${field.labels[this.formState.language]} is required`
        });
      }
      
      // Check regex validation
      if (value && field.validation?.regex) {
        const regex = new RegExp(field.validation.regex);
        if (!regex.test(value)) {
          errors.push({
            field: field.name,
            code: 'invalid_format',
            message: `${field.labels[this.formState.language]} format is invalid`
          });
        }
      }
    }

    const valid = errors.length === 0;
    this.formState.isValid = valid;
    
    this.trackEvent(valid ? 'validation_passed' : 'validation_failed', {
      validationErrors: errors.length
    });

    return {
      valid,
      errors,
      warnings: []
    };
  }

  /**
   * Submit form
   */
  submit(): Promise<{ success: boolean; data?: AddressInput }> {
    const validation = this.validate();
    
    if (!validation.valid) {
      return Promise.resolve({ success: false });
    }

    this.trackEvent('form_submitted', {
      country: this.formState.country,
      language: this.formState.language,
      completionRate: this.formState.completionRate
    });

    return Promise.resolve({
      success: true,
      data: this.formState.values as AddressInput
    });
  }

  /**
   * Track analytics event
   */
  private trackEvent(type: AnalyticsEventType, data: Record<string, any> = {}): void {
    if (!this.config.enableAnalytics) return;

    const event: AnalyticsEvent = {
      type,
      timestamp: new Date().toISOString(),
      data: {
        ...data,
        deviceType: this.detectDeviceType()
      },
      sessionId: this.sessionId,
      origin: this.config.origin
    };

    // Send to analytics endpoint
    if (this.config.analyticsEndpoint) {
      this.sendAnalytics(event);
    }
  }

  /**
   * Send analytics to server
   */
  private async sendAnalytics(event: AnalyticsEvent): Promise<void> {
    try {
      if (typeof fetch !== 'undefined') {
        await fetch(this.config.analyticsEndpoint!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify(event)
        });
      }
    } catch (error) {
      // Silent fail for analytics
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    
    const ua = window.navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Update completion rate
   */
  private updateCompletionRate(): void {
    if (!this.formState.country) {
      this.formState.completionRate = 0;
      return;
    }

    const fields = this.getFormFields(this.formState.country, this.formState.language);
    const requiredFields = fields.filter(f => f.required);
    const completedFields = requiredFields.filter(f => 
      this.formState.values[f.name] && this.formState.values[f.name].length > 0
    );
    
    this.formState.completionRate = requiredFields.length > 0
      ? (completedFields.length / requiredFields.length) * 100
      : 0;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `veyform_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current form state
   */
  getFormState(): FormState {
    return { ...this.formState };
  }

  /**
   * Lookup address by postal code and auto-fill form fields
   * 
   * Performs postal code lookup using free APIs (Zippopotam.us or GeoNames)
   * and automatically fills in city, province, and other available fields.
   * 
   * Supported countries: 60+ via Zippopotam.us (free, no API key)
   * Worldwide coverage via GeoNames (free tier with registration)
   * 
   * @param postalCode - Postal code to lookup
   * @param options - Lookup options
   * @param options.overwriteExisting - Whether to overwrite user-entered values (default: false)
   * @param options.geonamesUsername - GeoNames username for worldwide coverage
   * @returns Promise<PostalCodeLookupResult> - Lookup result with address data
   * 
   * @example
   * ```typescript
   * // Auto-fill from postal code (US)
   * const result = await veyform.autoFillFromPostalCode('90210');
   * console.log(result.city); // "Beverly Hills"
   * console.log(result.province); // "California"
   * 
   * // Auto-fill from postal code (Japan)
   * const result = await veyform.autoFillFromPostalCode('100-0001');
   * console.log(result.city); // City name
   * console.log(result.province); // Prefecture name
   * 
   * // With GeoNames for worldwide coverage
   * const result = await veyform.autoFillFromPostalCode('12345', {
   *   geonamesUsername: 'your_username'
   * });
   * ```
   * 
   * @throws Error if postal code lookup fails or country not selected
   */
  async autoFillFromPostalCode(
    postalCode: string,
    options: {
      overwriteExisting?: boolean;
      geonamesUsername?: string;
    } = {}
  ): Promise<PostalCodeLookupResult> {
    if (!this.formState.country) {
      throw new Error('Country must be selected before postal code lookup');
    }

    // Dynamically import to avoid circular dependencies
    const { lookupPostalCode, autoFillAddress } = await import('./postal-lookup');
    
    const lookupResult = await lookupPostalCode(
      {
        countryCode: this.formState.country,
        postalCode,
      },
      {
        preferredService: 'zippopotam',
        enableFallback: true,
        geonamesUsername: options.geonamesUsername,
      }
    );

    // Auto-fill form with lookup result
    const currentAddress = this.formState.values as AddressInput;
    const filledAddress = autoFillAddress(currentAddress, lookupResult, {
      overwriteExisting: options.overwriteExisting,
    });

    // Update form state
    for (const field in filledAddress) {
      if (filledAddress[field as keyof AddressInput]) {
        this.setFieldValue(field, filledAddress[field as keyof AddressInput] as string);
      }
    }

    return lookupResult;
  }

  /**
   * Check if postal code auto-fill is available for current country
   * 
   * @param geonamesUsername - Optional GeoNames username for worldwide coverage
   * @returns Whether postal code lookup is available
   * 
   * @example
   * ```typescript
   * if (veyform.isPostalCodeAutoFillAvailable()) {
   *   // Show postal code auto-fill button
   * }
   * ```
   */
  async isPostalCodeAutoFillAvailable(geonamesUsername?: string): Promise<boolean> {
    if (!this.formState.country) {
      return false;
    }

    const { isPostalCodeLookupAvailable } = await import('./postal-lookup');
    return isPostalCodeLookupAvailable(this.formState.country, { geonamesUsername });
  }

  /**
   * Translate all address fields to target language
   * 
   * Translates form field values using free translation APIs when switching
   * between languages. Preserves non-translatable fields (postal code, country, etc.).
   * 
   * Supported translation services:
   * - LibreTranslate (free tier available)
   * - Apertium (free, open source)
   * - Argos Translate (free, local deployment)
   * 
   * @param targetLanguage - Target language code (ISO 639-1)
   * @param options - Translation options
   * @param options.service - Translation service to use (default: 'libretranslate')
   * @param options.endpoint - Custom API endpoint for LibreTranslate
   * @param options.apiKey - API key if required
   * 
   * @example
   * ```typescript
   * // Translate Japanese address to English
   * veyform.setFieldValue('city', '東京');
   * veyform.setFieldValue('province', '東京都');
   * 
   * await veyform.translateFields('en', {
   *   service: 'libretranslate',
   *   endpoint: 'https://libretranslate.com'
   * });
   * 
   * console.log(veyform.getFormState().values.city); // "Tokyo"
   * ```
   * 
   * @throws Error if translation fails
   */
  async translateFields(
    targetLanguage: string,
    options: {
      service?: 'libretranslate' | 'apertium' | 'argostranslate';
      endpoint?: string;
      apiKey?: string;
    } = {}
  ): Promise<void> {
    const currentLanguage = this.formState.language;
    
    if (currentLanguage === targetLanguage) {
      return; // No translation needed
    }

    // Dynamically import to avoid circular dependencies
    const { translateAddressFields } = await import('./translation');
    
    const translatedAddress = await translateAddressFields(
      this.formState.values,
      currentLanguage,
      targetLanguage,
      {
        service: options.service || 'libretranslate',
        endpoint: options.endpoint,
        apiKey: options.apiKey,
      }
    );

    // Update form state with translated values
    for (const field in translatedAddress) {
      const value = translatedAddress[field];
      if (value !== undefined) {
        this.formState.values[field] = value;
      }
    }
  }

  /**
   * Change language and optionally translate existing field values
   * 
   * Enhanced version of setLanguage() that can automatically translate
   * existing form field values when switching languages.
   * 
   * @param language - Target language code
   * @param options - Translation options
   * @param options.translateFields - Whether to translate existing field values (default: false)
   * @param options.translationService - Translation service to use
   * @param options.translationEndpoint - Custom translation API endpoint
   * @param options.translationApiKey - Translation API key if required
   * 
   * @example
   * ```typescript
   * // Change language without translation
   * veyform.setLanguageWithTranslation('ja');
   * 
   * // Change language AND translate existing values
   * await veyform.setLanguageWithTranslation('ja', {
   *   translateFields: true,
   *   translationService: 'libretranslate',
   *   translationEndpoint: 'https://libretranslate.com'
   * });
   * ```
   */
  async setLanguageWithTranslation(
    language: string,
    options: {
      translateFields?: boolean;
      translationService?: 'libretranslate' | 'apertium' | 'argostranslate';
      translationEndpoint?: string;
      translationApiKey?: string;
    } = {}
  ): Promise<void> {
    const previousLanguage = this.formState.language;
    
    // Change the language first
    this.setLanguage(language);
    
    // Optionally translate existing field values
    if (options.translateFields && Object.keys(this.formState.values).length > 0) {
      try {
        await this.translateFields(language, {
          service: options.translationService,
          endpoint: options.translationEndpoint,
          apiKey: options.translationApiKey,
        });
      } catch (error) {
        console.warn('Field translation failed during language switch:', error);
        // Don't revert language change even if translation fails
      }
    }
  }

  /**
   * Load country data
   */
  async loadCountryData(countryCode: string): Promise<void> {
    // In real implementation, this would load from data files
    // For now, just a placeholder
    throw new Error('Not implemented - would load country data from YAML/JSON');
  }
}

/**
 * Create a new Veyform instance (factory function)
 * 
 * Convenience factory function for creating Veyform instances.
 * This is the recommended way to create Veyform instances as it provides
 * a cleaner, more functional API.
 * 
 * @param config - Veyform configuration options
 * @returns A new Veyform instance
 * 
 * @see {@link Veyform.constructor} for detailed initialization behavior
 * @see {@link VeyformConfig} for all available configuration options
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const veyform = createVeyform({
 *   apiKey: 'your-api-key',
 *   defaultLanguage: 'en'
 * });
 * 
 * // Full configuration with language features
 * const veyform = createVeyform({
 *   apiKey: 'your-api-key',
 *   defaultCountry: 'JP',
 *   defaultLanguage: 'en',
 *   allowedLanguages: ['en', 'ja', 'zh', 'ko'],
 *   allowedCountries: ['JP', 'US', 'CN', 'KR'],
 *   languageStorage: {
 *     enabled: true,
 *     storageType: 'localStorage',
 *     storageKey: 'my_app_lang'
 *   },
 *   onLanguageChange: (newLang, prevLang) => {
 *     console.log(`Language: ${prevLang} → ${newLang}`);
 *     updateApplicationLanguage(newLang);
 *   },
 *   enableAnalytics: true
 * });
 * ```
 */
export function createVeyform(config: VeyformConfig): Veyform {
  return Veyform.init(config);
}
