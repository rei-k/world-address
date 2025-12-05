'use client';

import { useState, useEffect } from 'react';
import type { CreateAddressRequest } from '../../src/types';
import { COUNTRIES } from '../lib/countries';

interface AddressFormProps {
  initialData?: Partial<CreateAddressRequest>;
  onSubmit: (data: CreateAddressRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type LanguageTab = 'native' | 'english';

export default function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AddressFormProps) {
  const [activeTab, setActiveTab] = useState<LanguageTab>('native');
  const [formData, setFormData] = useState<CreateAddressRequest>({
    type: initialData?.type || 'home',
    country: initialData?.country || '',
    postalCode: initialData?.postalCode || '',
    admin1: initialData?.admin1 || '',
    admin2: initialData?.admin2 || '',
    locality: initialData?.locality || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    buildingName: initialData?.buildingName || '',
    floor: initialData?.floor || '',
    room: initialData?.room || '',
    label: initialData?.label || '',
    isPrimary: initialData?.isPrimary || false,
  });

  const [englishData, setEnglishData] = useState<Partial<CreateAddressRequest>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

  const handleInputChange = (field: keyof CreateAddressRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePostalCodeChange = async (postalCode: string) => {
    handleInputChange('postalCode', postalCode);
    
    // TODO: Implement auto-fill based on postal code
    // For Japan: postal code → city/prefecture auto-fill
    // For US: ZIP → city/state auto-fill
    if (formData.country === 'JP' && /^[0-9]{3}-[0-9]{4}$/.test(postalCode)) {
      // Simulate postal code lookup for properly formatted Japanese postal codes
      console.log('Auto-filling from postal code:', postalCode);
    }
  };

  const handleTabSwitch = async (tab: LanguageTab) => {
    if (tab === 'english' && activeTab === 'native') {
      // Auto-translate from native to English
      // TODO: Implement translation API
      setEnglishData({
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        admin1: formData.admin1,
        admin2: formData.admin2,
        locality: formData.locality,
      });
    } else if (tab === 'native' && activeTab === 'english') {
      // Sync English data back to native
      if (Object.keys(englishData).length > 0) {
        setFormData(prev => ({ ...prev, ...englishData }));
      }
    }
    setActiveTab(tab);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.addressLine1) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    // Country-specific validation
    if (formData.country === 'JP') {
      if (!formData.postalCode) {
        newErrors.postalCode = 'Postal code is required';
      } else if (!/^[0-9]{3}-[0-9]{4}$/.test(formData.postalCode)) {
        newErrors.postalCode = 'Postal code must be in format: 123-4567';
      }
    } else if (formData.country === 'US') {
      if (formData.postalCode && !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
        newErrors.postalCode = 'ZIP code must be in format: 12345 or 12345-6789';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        {/* Language Tabs */}
        <div style={{ 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px'
        }}>
          <button
            type="button"
            onClick={() => handleTabSwitch('native')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'native' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'native' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'native' ? '600' : '400',
              cursor: 'pointer',
            }}
          >
            {selectedCountry?.nativeLang || 'Native Language'}
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('english')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'english' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'english' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'english' ? '600' : '400',
              cursor: 'pointer',
            }}
          >
            English
          </button>
        </div>

        {/* Address Type */}
        <div className="form-group">
          <label className="form-label">Address Type</label>
          <select
            className="form-select"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as any)}
          >
            <option value="home">🏠 Home</option>
            <option value="work">🏢 Work</option>
            <option value="other">📍 Other</option>
          </select>
        </div>

        {/* Label */}
        <div className="form-group">
          <label className="form-label">Label (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., My Apartment, Office, Parent's House"
            value={formData.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
          />
        </div>

        {/* Country */}
        <div className="form-group">
          <label className="form-label">Country *</label>
          <select
            className="form-select"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
          >
            <option value="">Select a country...</option>
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <div className="form-error">{errors.country}</div>
          )}
        </div>

        {formData.country && (
          <>
            {/* Postal Code */}
            <div className="form-group">
              <label className="form-label">
                {selectedCountry?.postalCodeName || 'Postal Code'}
                {selectedCountry?.postalCodeRequired && ' *'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={selectedCountry?.postalCodeExample || ''}
                value={formData.postalCode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
              />
              {errors.postalCode && (
                <div className="form-error">{errors.postalCode}</div>
              )}
            </div>

            {/* State/Prefecture */}
            <div className="form-group">
              <label className="form-label">
                {selectedCountry?.admin1Name || 'State/Province'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={`Enter ${selectedCountry?.admin1Name || 'state/province'}`}
                value={formData.admin1}
                onChange={(e) => handleInputChange('admin1', e.target.value)}
              />
            </div>

            {/* City/District */}
            <div className="form-group">
              <label className="form-label">
                {selectedCountry?.admin2Name || 'City/District'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={`Enter ${selectedCountry?.admin2Name || 'city'}`}
                value={formData.admin2}
                onChange={(e) => handleInputChange('admin2', e.target.value)}
              />
            </div>

            {/* Locality */}
            {selectedCountry?.hasLocality && (
              <div className="form-group">
                <label className="form-label">Locality/Town</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter locality or town"
                  value={formData.locality}
                  onChange={(e) => handleInputChange('locality', e.target.value)}
                />
              </div>
            )}

            {/* Address Line 1 */}
            <div className="form-group">
              <label className="form-label">Address Line 1 *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address, P.O. box, company name"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              />
              {errors.addressLine1 && (
                <div className="form-error">{errors.addressLine1}</div>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="form-group">
              <label className="form-label">Address Line 2 (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              />
            </div>

            {/* Building Name */}
            <div className="form-group">
              <label className="form-label">Building Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter building name"
                value={formData.buildingName}
                onChange={(e) => handleInputChange('buildingName', e.target.value)}
              />
            </div>

            {/* Floor and Room */}
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Floor (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 5"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Room/Unit (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 501"
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                />
              </div>
            </div>

            {/* Set as Primary */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => handleInputChange('isPrimary', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Set as primary address
                </span>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2" style={{ marginTop: '20px' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Address'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
