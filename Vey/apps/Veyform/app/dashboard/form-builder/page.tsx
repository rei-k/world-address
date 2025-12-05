'use client';

import { useState, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
  localName: string;
  languages: Language[];
  addressFormat: {
    order: string[];
    postalCode?: {
      required: boolean;
      regex?: string;
      example?: string;
    };
  };
  continent: string;
  subregion: string;
}

interface Language {
  name: string;
  code?: string;
  script?: string;
  role?: string;
  countryName?: string | { [key: string]: string };
  fieldLabels?: { [key: string]: string };
}

export default function FormBuilderPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [defaultCountry, setDefaultCountry] = useState<string>('JP');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['JP']);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [formType, setFormType] = useState<'signup' | 'signin'>('signup');
  const [continentFilterStyle, setContinentFilterStyle] = useState<'tabs' | 'dropdown'>('tabs');
  
  useEffect(() => {
    // Load countries data
    fetch('/countries-index.json')
      .then(res => res.json())
      .then(data => {
        setCountries(data);
      })
      .catch(err => console.error('Failed to load countries:', err));
  }, []);
  
  const currentCountry = countries.find(c => c.code === defaultCountry);
  const availableLanguages = currentCountry?.languages || [];
  
  // Auto-select first language when country changes
  useEffect(() => {
    if (availableLanguages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(availableLanguages[0].code || availableLanguages[0].name);
    }
  }, [defaultCountry, availableLanguages, selectedLanguage]);
  
  const currentLanguage = availableLanguages.find(
    lang => (lang.code || lang.name) === selectedLanguage
  );
  
  const getFieldLabel = (field: string) => {
    const labels = currentLanguage?.fieldLabels;
    if (labels && labels[field]) {
      return labels[field];
    }
    
    // Fallback to English labels
    const fieldLabels: { [key: string]: string } = {
      recipient: 'Recipient',
      building: 'Building',
      floor: 'Floor',
      room: 'Room',
      street_address: 'Street Address',
      city: 'City',
      province: 'Province/State',
      prefecture: 'Prefecture',
      state: 'State',
      postal_code: 'Postal Code',
      country: 'Country',
      district: 'District',
      ward: 'Ward',
      pobox: 'PO Box',
    };
    
    return fieldLabels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getPlaceholder = (field: string) => {
    const format = currentCountry?.addressFormat;
    
    if (field === 'postal_code' && format?.postalCode?.example) {
      return format.postalCode.example;
    }
    
    return '';
  };
  
  const handleCountryToggle = (code: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(code)) {
        return prev.filter(c => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };
  
  const showCountryDropdown = selectedCountries.length > 1;
  const hasMultipleLanguages = availableLanguages.length > 1;
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Form Builder / 開発画面
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configuration / 設定
            </h2>
            
            <div className="space-y-4">
              {/* Default Country Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Country / デフォルトの国
                </label>
                <select
                  value={defaultCountry}
                  onChange={(e) => {
                    setDefaultCountry(e.target.value);
                    setSelectedLanguage('');
                    if (!selectedCountries.includes(e.target.value)) {
                      setSelectedCountries([...selectedCountries, e.target.value]);
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.localName})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Additional Countries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Countries / 他に含める国
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {countries.slice(0, 20).map(country => (
                    <label key={country.code} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country.code)}
                        onChange={() => handleCountryToggle(country.code)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {country.name} ({country.code})
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {selectedCountries.join(', ')}
                </p>
              </div>
              
              {/* Language Selection */}
              {hasMultipleLanguages && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language / 言語
                  </label>
                  <div className="flex space-x-2">
                    {availableLanguages.map((lang) => {
                      const langKey = lang.code || lang.name;
                      return (
                        <button
                          key={langKey}
                          onClick={() => setSelectedLanguage(langKey)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedLanguage === langKey
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {lang.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Form Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Type / フォームタイプ
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFormType('signup')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      formType === 'signup'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setFormType('signin')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      formType === 'signin'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              </div>
              
              {/* Continent Filter Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Continent Filter Style / 大陸フィルタースタイル
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setContinentFilterStyle('tabs')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      continentFilterStyle === 'tabs'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Tabs / タブ
                  </button>
                  <button
                    onClick={() => setContinentFilterStyle('dropdown')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      continentFilterStyle === 'dropdown'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Dropdown / プルダウン
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Live Preview Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Live Preview / プレビュー
          </h2>
          
          {formType === 'signup' ? (
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">New Member Registration</h3>
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>
              
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Address / 住所</h4>
                
                {/* Country Dropdown (only if multiple countries) */}
                {showCountryDropdown && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getFieldLabel('country')}
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    >
                      {selectedCountries.map(code => {
                        const country = countries.find(c => c.code === code);
                        return (
                          <option key={code} value={code}>
                            {country?.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                
                {/* Address Fields */}
                {currentCountry?.addressFormat.order.map((field) => {
                  if (field === 'country') {
                    return null; // Already shown above
                  }
                  
                  return (
                    <div key={field} className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getFieldLabel(field)}
                        {field === 'postal_code' && currentCountry?.addressFormat.postalCode?.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder={getPlaceholder(field)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled
                      />
                    </div>
                  );
                })}
              </div>
              
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Create Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-800">Sign In</h3>
              
              {/* Social Login Button */}
              <button className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google (Quick Address Registration)</span>
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>
              
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>
              
              {/* Forgot Password Link */}
              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </a>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Generated Code Preview */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Generated Code / 生成されたコード
        </h2>
        <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
          <pre className="text-sm text-gray-100">
            <code>{`import { AddressForm } from '@vey/veyform';

function ${formType === 'signup' ? 'SignUpPage' : 'SignInPage'}() {
  return (
    <div>
      ${formType === 'signup' ? `<h2>New Member Registration</h2>
      
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      
      <AddressForm
        defaultCountry="${defaultCountry}"
        ${showCountryDropdown ? `countries={${JSON.stringify(selectedCountries)}}` : '// Single country mode - no dropdown'}
        language="${selectedLanguage || 'en'}"
        continentFilterStyle="${continentFilterStyle}"
        onSubmit={(address) => {
          console.log('Address:', address);
        }}
      />` : `<h2>Sign In</h2>
      
      <button>Sign in with Google (Quick Address Registration)</button>
      
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <a href="#">Forgot Password?</a>`}
    </div>
  );
}`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
