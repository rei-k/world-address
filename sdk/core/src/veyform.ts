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
  AddressInput 
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
  
  /** Default language code (ISO 639-1) */
  defaultLanguage?: string;
  
  /** Allowed languages */
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
  
  /** Enable auto-translation for address fields */
  enableAutoTranslation?: boolean;
  
  /** Translation service configuration */
  translationService?: {
    service: 'libretranslate' | 'apertium' | 'argostranslate' | 'mymemory';
    endpoint?: string;
    apiKey?: string;
  };
  
  /** Languages to auto-translate addresses to */
  autoTranslationTargets?: string[];
  
  /** Always include native and delivery languages in address forms */
  includeDeliveryLanguages?: boolean;
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
  /** Multi-language address data */
  multiLanguageData?: {
    native?: Record<string, string>;
    english?: Record<string, string>;
    deliveryLanguages?: Array<{
      language: string;
      fields: Record<string, string>;
    }>;
  };
  /** Available input languages for current country */
  availableInputLanguages?: string[];
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
 */
export class Veyform {
  private config: VeyformConfig;
  private countryData: Map<string, CountryAddressFormat> = new Map();
  private sessionId: string;
  private formState: FormState;

  constructor(config: VeyformConfig) {
    this.config = {
      validationLevel: 'strict',
      enableAnalytics: true,
      useContinentFilter: true,
      defaultLanguage: 'en',
      ...config
    };

    // Auto-detect domain if enabled
    if (this.config.domainAutoDetect && typeof window !== 'undefined') {
      this.config.origin = window.location.origin;
    }

    // Generate session ID
    this.sessionId = this.generateSessionId();

    // Initialize form state
    this.formState = {
      language: this.config.defaultLanguage!,
      values: {},
      errors: {},
      touched: {},
      isValid: false,
      completionRate: 0
    };
  }

  /**
   * Initialize Veyform instance
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
   * Change form language
   */
  setLanguage(language: string): void {
    this.formState.language = language;
    this.trackEvent('language_changed', { language });
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
   * Load country data
   */
  async loadCountryData(countryCode: string): Promise<void> {
    // In real implementation, this would load from data files
    // For now, just a placeholder
    throw new Error('Not implemented - would load country data from YAML/JSON');
  }
}

/**
 * Export factory function for easier initialization
 */
export function createVeyform(config: VeyformConfig): Veyform {
  return Veyform.init(config);
}
