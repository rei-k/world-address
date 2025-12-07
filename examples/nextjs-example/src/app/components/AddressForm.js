'use client';

import { useState } from 'react';

// Mock country format data (in real app, load from @vey/core or API)
const countryFormats = {
  JP: {
    name: { en: 'Japan' },
    address_format: {
      order: ['recipient', 'postal_code', 'province', 'city', 'street_address', 'country'],
      postal_code: { required: true, regex: '^[0-9]{3}-[0-9]{4}$', example: '100-0001' },
      province: { required: true, type: 'Prefecture' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  US: {
    name: { en: 'United States' },
    address_format: {
      order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
      postal_code: { required: true, regex: '^\\d{5}(-\\d{4})?$', example: '12345' },
      province: { required: true, type: 'State' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  GB: {
    name: { en: 'United Kingdom' },
    address_format: {
      order: ['recipient', 'street_address', 'city', 'province', 'postal_code', 'country'],
      postal_code: { required: true, regex: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$', example: 'SW1A 1AA' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  FR: {
    name: { en: 'France' },
    address_format: {
      order: ['recipient', 'street_address', 'postal_code', 'city', 'country'],
      postal_code: { required: true, regex: '^\\d{5}$', example: '75001' },
      city: { required: true },
      street_address: { required: true },
    },
  },
  DE: {
    name: { en: 'Germany' },
    address_format: {
      order: ['recipient', 'street_address', 'postal_code', 'city', 'country'],
      postal_code: { required: true, regex: '^\\d{5}$', example: '10115' },
      city: { required: true },
      street_address: { required: true },
    },
  },
};

export default function AddressForm() {
  const [address, setAddress] = useState({
    country: '',
    postal_code: '',
    province: '',
    city: '',
    street_address: '',
  });

  const [validationResult, setValidationResult] = useState(null);
  const [currentFormat, setCurrentFormat] = useState(null);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setAddress({ ...address, country });
    setCurrentFormat(countryFormats[country]);
    setValidationResult(null);
  };

  const handleChange = (field, value) => {
    setAddress({ ...address, [field]: value });
  };

  const isFieldRequired = (field) => {
    return currentFormat?.address_format?.[field]?.required || false;
  };

  const getFieldLabel = (field) => {
    if (field === 'province') {
      const type = currentFormat?.address_format?.province?.type;
      return type || 'Province';
    }
    return field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
  };

  const validateAddress = (addr, format) => {
    const errors = [];

    // Validate required fields
    Object.keys(format.address_format).forEach((field) => {
      const fieldConfig = format.address_format[field];
      if (fieldConfig.required && !addr[field]) {
        errors.push({
          field,
          message: `${getFieldLabel(field)} is required`,
        });
      }
    });

    // Validate postal code format
    if (addr.postal_code && format.address_format.postal_code?.regex) {
      const regex = new RegExp(format.address_format.postal_code.regex);
      if (!regex.test(addr.postal_code)) {
        errors.push({
          field: 'postal_code',
          message: `Invalid postal code format. Expected format: ${format.address_format.postal_code.example}`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      normalized: errors.length === 0 ? addr : null,
    };
  };

  const handleValidate = (e) => {
    e.preventDefault();

    if (!currentFormat) return;

    const result = validateAddress(address, currentFormat);
    setValidationResult(result);

    if (result.valid) {
      console.log('✅ Address validated successfully:', result.normalized);
    } else {
      console.error('❌ Validation errors:', result.errors);
    }
  };

  const formatAddressForDisplay = () => {
    if (!validationResult?.valid) return '';

    const normalized = validationResult.normalized;
    const parts = [];

    if (normalized.street_address) parts.push(normalized.street_address);
    if (normalized.city) parts.push(normalized.city);
    if (normalized.province) parts.push(normalized.province);
    if (normalized.postal_code) parts.push(normalized.postal_code);
    if (normalized.country) parts.push(normalized.country);

    return parts.join('\n');
  };

  const postalCodeExample = currentFormat?.address_format?.postal_code?.example || '';

  return (
    <div className="form-container">
      <form onSubmit={handleValidate}>
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            value={address.country}
            onChange={handleCountryChange}
            required
          >
            <option value="">Select a country</option>
            <option value="JP">🇯🇵 Japan</option>
            <option value="US">🇺🇸 United States</option>
            <option value="GB">🇬🇧 United Kingdom</option>
            <option value="FR">🇫🇷 France</option>
            <option value="DE">🇩🇪 Germany</option>
          </select>
        </div>

        {address.country && (
          <>
            <div className="form-group">
              <label htmlFor="postal_code">
                Postal Code
                {postalCodeExample && (
                  <span className="hint"> (e.g., {postalCodeExample})</span>
                )}
              </label>
              <input
                id="postal_code"
                value={address.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                type="text"
                placeholder={postalCodeExample || 'Enter postal code'}
                required={isFieldRequired('postal_code')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="province">{getFieldLabel('province')}</label>
              <input
                id="province"
                value={address.province}
                onChange={(e) => handleChange('province', e.target.value)}
                type="text"
                placeholder={`Enter ${getFieldLabel('province').toLowerCase()}`}
                required={isFieldRequired('province')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                value={address.city}
                onChange={(e) => handleChange('city', e.target.value)}
                type="text"
                placeholder="Enter city"
                required={isFieldRequired('city')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="street_address">Street Address</label>
              <input
                id="street_address"
                value={address.street_address}
                onChange={(e) => handleChange('street_address', e.target.value)}
                type="text"
                placeholder="Enter street address"
                required={isFieldRequired('street_address')}
              />
            </div>
          </>
        )}

        <button type="submit" disabled={!address.country} className="btn-primary">
          Validate Address
        </button>
      </form>

      {validationResult && (
        <div className="result-container">
          {validationResult.valid ? (
            <div className="success">
              <h3>✅ Address is valid!</h3>
              <div className="formatted-address">
                <strong>Formatted Address:</strong>
                <pre>{formatAddressForDisplay()}</pre>
              </div>
            </div>
          ) : (
            <div className="error">
              <h3>❌ Validation Errors</h3>
              <ul>
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
