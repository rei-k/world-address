/**
 * VeyformAddressForm - React component for universal address input
 * 
 * Features:
 * - 3-layer country selection (Continent → Country → Address)
 * - Country flag dropdown
 * - Multi-language support with synchronized labels/placeholders
 * - Auto-validation
 * - Analytics tracking
 */

import React, { useState, useEffect, useMemo } from 'react';
import type {
  Veyform,
  VeyformConfig,
  CountryOption,
  Continent,
  ContinentInfo,
  FieldConfig,
  FormState,
} from '@vey/core';
import { createVeyform, CountryRegistry } from '@vey/core';

/** VeyformAddressForm props */
export interface VeyformAddressFormProps {
  /** Veyform configuration */
  config: VeyformConfig;
  
  /** Callback when form is submitted */
  onSubmit?: (data: Record<string, string>) => void;
  
  /** Callback when form state changes */
  onChange?: (state: FormState) => void;
  
  /** Custom CSS class name */
  className?: string;
  
  /** Show continent filter tabs */
  showContinentFilter?: boolean;
  
  /** Continent filter display style (tabs or dropdown) */
  continentFilterStyle?: 'tabs' | 'dropdown';
  
  /** Theme */
  theme?: 'light' | 'dark' | 'auto';
  
  /** Compact mode */
  compact?: boolean;
}

/**
 * VeyformAddressForm component
 */
export const VeyformAddressForm: React.FC<VeyformAddressFormProps> = ({
  config,
  onSubmit,
  onChange,
  className = '',
  showContinentFilter = true,
  continentFilterStyle = 'tabs',
  theme = 'light',
  compact = false,
}) => {
  const [veyform] = useState<Veyform>(() => createVeyform(config));
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    config.defaultCountry || null
  );
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    config.defaultLanguage || 'en'
  );
  const [formState, setFormState] = useState<FormState>(veyform.getFormState());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initialize country registry
  useEffect(() => {
    CountryRegistry.init();
  }, []);

  // Get continents
  const continents = useMemo<ContinentInfo[]>(() => {
    return CountryRegistry.getAllContinents();
  }, []);

  // Get available countries based on filters
  const availableCountries = useMemo<CountryOption[]>(() => {
    let countries = CountryRegistry.getAllCountries();

    // Filter by allowed countries if specified
    if (config.allowedCountries && config.allowedCountries.length > 0) {
      countries = countries.filter(c => config.allowedCountries!.includes(c.code));
    }

    // Filter by continent if selected
    if (selectedContinent) {
      countries = countries.filter(c => c.continent === selectedContinent);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      countries = countries.filter(c =>
        c.name.en.toLowerCase().includes(query) ||
        (c.name.local && c.name.local.toLowerCase().includes(query))
      );
    }

    return countries.map(c => CountryRegistry.toCountryOption(c));
  }, [config.allowedCountries, selectedContinent, searchQuery]);

  // Get form fields for selected country
  const formFields = useMemo<FieldConfig[]>(() => {
    if (!selectedCountry) return [];
    try {
      return veyform.getFormFields(selectedCountry, currentLanguage);
    } catch (error) {
      console.error('Error loading form fields:', error);
      return [];
    }
  }, [selectedCountry, currentLanguage, veyform]);

  // Handle continent selection
  const handleContinentSelect = (continent: Continent | string) => {
    if (continent === '' || continent === selectedContinent) {
      setSelectedContinent(null);
    } else {
      // Type assertion is safe here because continents are sourced from CountryRegistry
      setSelectedContinent(continent as Continent);
    }
  };

  // Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    veyform.selectCountry(countryCode);
    const newState = veyform.getFormState();
    setFormState(newState);
    onChange?.(newState);
  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    veyform.setLanguage(language);
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: string) => {
    veyform.setFieldValue(fieldName, value);
    const newState = veyform.getFormState();
    setFormState(newState);
    onChange?.(newState);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await veyform.submit();
    if (result.success && result.data) {
      onSubmit?.(result.data);
    }
  };

  // Get available languages
  const availableLanguages = config.allowedLanguages || ['en', 'ja', 'zh', 'ko'];

  return (
    <div className={`veyform-address-form ${theme} ${compact ? 'compact' : ''} ${className}`}>
      {/* Language Selector */}
      <div className="veyform-language-selector">
        {availableLanguages.map(lang => (
          <button
            key={lang}
            className={`veyform-language-btn ${currentLanguage === lang ? 'active' : ''}`}
            onClick={() => handleLanguageChange(lang)}
            type="button"
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Continent Filter Tabs */}
      {showContinentFilter && config.useContinentFilter && continentFilterStyle === 'tabs' && (
        <div className="veyform-continent-filter">
          {continents.map(continent => (
            <button
              key={continent.code}
              className={`veyform-continent-tab ${selectedContinent === continent.code ? 'active' : ''}`}
              onClick={() => handleContinentSelect(continent.code)}
              type="button"
            >
              {continent.name[currentLanguage as keyof typeof continent.name] || continent.name.en}
            </button>
          ))}
        </div>
      )}

      {/* Continent Filter Dropdown */}
      {showContinentFilter && config.useContinentFilter && continentFilterStyle === 'dropdown' && (
        <div className="veyform-continent-dropdown">
          <select
            className="veyform-continent-select"
            value={selectedContinent || ''}
            onChange={(e) => handleContinentSelect(e.target.value)}
          >
            <option value="">
              {currentLanguage === 'ja' ? 'すべての大陸' : currentLanguage === 'zh' ? '所有大陆' : 'All continents'}
            </option>
            {continents.map(continent => (
              <option key={continent.code} value={continent.code}>
                {continent.name[currentLanguage as keyof typeof continent.name] || continent.name.en}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Country Selector with Flags */}
      <div className="veyform-country-selector">
        <div className="veyform-search-box">
          <input
            type="text"
            placeholder={currentLanguage === 'ja' ? '国を検索...' : currentLanguage === 'zh' ? '搜索国家...' : 'Search country...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="veyform-search-input"
          />
        </div>

        <select
          className="veyform-country-select"
          value={selectedCountry || ''}
          onChange={(e) => handleCountrySelect(e.target.value)}
        >
          <option value="">
            {currentLanguage === 'ja' ? '国を選択してください' : currentLanguage === 'zh' ? '请选择国家' : 'Select a country'}
          </option>
          {availableCountries.map(country => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name} {country.nameLocal ? `(${country.nameLocal})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Address Form */}
      {selectedCountry && (
        <form className="veyform-address-fields" onSubmit={handleSubmit}>
          {formFields.map(field => (
            <div key={field.name} className="veyform-field-group">
              <label htmlFor={field.name} className="veyform-field-label">
                {field.labels[currentLanguage] || field.labels.en}
                {field.required && <span className="veyform-required">*</span>}
              </label>
              <input
                id={field.name}
                type="text"
                className={`veyform-field-input ${formState.errors[field.name] ? 'error' : ''}`}
                value={formState.values[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholders[currentLanguage] || field.placeholders.en}
                required={field.required}
                autoComplete={field.autoComplete}
              />
              {formState.errors[field.name] && (
                <span className="veyform-field-error">{formState.errors[field.name]}</span>
              )}
            </div>
          ))}

          {/* Completion Rate */}
          <div className="veyform-completion-rate">
            <div className="veyform-progress-bar">
              <div
                className="veyform-progress-fill"
                style={{ width: `${formState.completionRate}%` }}
              />
            </div>
            <span className="veyform-progress-text">
              {Math.round(formState.completionRate)}%{' '}
              {currentLanguage === 'ja' ? '完了' : currentLanguage === 'zh' ? '完成' : 'complete'}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="veyform-submit-btn"
            disabled={!formState.isValid}
          >
            {currentLanguage === 'ja' ? '送信' : currentLanguage === 'zh' ? '提交' : 'Submit'}
          </button>
        </form>
      )}

      <style jsx>{`
        .veyform-address-form {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .veyform-language-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .veyform-language-btn {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .veyform-language-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .veyform-continent-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .veyform-continent-tab {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
        }

        .veyform-continent-tab.active {
          background: #28a745;
          color: white;
          border-color: #28a745;
        }

        .veyform-continent-dropdown {
          margin-bottom: 16px;
        }

        .veyform-continent-select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .veyform-country-selector {
          margin-bottom: 24px;
        }

        .veyform-search-box {
          margin-bottom: 12px;
        }

        .veyform-search-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .veyform-country-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          background: white;
          cursor: pointer;
        }

        .veyform-address-fields {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .veyform-field-group {
          display: flex;
          flex-direction: column;
        }

        .veyform-field-label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
          color: #333;
        }

        .veyform-required {
          color: #dc3545;
          margin-left: 4px;
        }

        .veyform-field-input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .veyform-field-input.error {
          border-color: #dc3545;
        }

        .veyform-field-error {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
        }

        .veyform-completion-rate {
          margin: 20px 0;
        }

        .veyform-progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .veyform-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          transition: width 0.3s ease;
        }

        .veyform-progress-text {
          font-size: 12px;
          color: #666;
        }

        .veyform-submit-btn {
          padding: 12px 24px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .veyform-submit-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .veyform-submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .veyform-address-form.dark {
          color: #f0f0f0;
        }

        .veyform-address-form.dark .veyform-language-btn,
        .veyform-address-form.dark .veyform-continent-tab,
        .veyform-address-form.dark .veyform-continent-select,
        .veyform-address-form.dark .veyform-search-input,
        .veyform-address-form.dark .veyform-country-select,
        .veyform-address-form.dark .veyform-field-input {
          background: #2d3748;
          color: #f0f0f0;
          border-color: #4a5568;
        }

        .veyform-address-form.compact {
          padding: 12px;
        }

        .veyform-address-form.compact .veyform-field-group {
          gap: 12px;
        }
      `}</style>
    </div>
  );
};

export default VeyformAddressForm;
