/**
 * @vey/react - Premium AddressForm Component (Stripe-like quality)
 * 
 * Complete, production-ready address form with:
 * - Dynamic field generation based on country
 * - Real-time validation
 * - Smart field ordering
 * - Accessibility (WCAG 2.1 AA)
 * - Responsive design
 * - Smooth animations
 * - Comprehensive error handling
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { AddressInput, ValidationResult, CountryAddressFormat } from '@vey/core';
import { 
  AddressElement, 
  PostalCodeElement, 
  CountrySelectElement,
  type AddressElementTheme 
} from './premium-components';

// ============================================================================
// Types
// ============================================================================

export interface AddressFormPremiumProps {
  /** Initial country code (ISO alpha-2) */
  initialCountry?: string;
  /** Initial address values */
  initialValue?: AddressInput;
  /** Submit handler */
  onSubmit?: (address: AddressInput, validation: ValidationResult) => void;
  /** Change handler - called on every field change */
  onChange?: (address: AddressInput, isValid: boolean) => void;
  /** Validation handler */
  onValidate?: (validation: ValidationResult) => void;
  /** Enable real-time validation */
  liveValidation?: boolean;
  /** Validate on blur */
  validateOnBlur?: boolean;
  /** Show validation messages */
  showValidation?: boolean;
  /** Submit button label */
  submitLabel?: string;
  /** Hide submit button */
  hideSubmit?: boolean;
  /** Show country selector */
  showCountrySelector?: boolean;
  /** Allowed countries */
  allowedCountries?: string[];
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom theme */
  theme?: AddressElementTheme;
  /** Custom class name */
  className?: string;
  /** Success message after submit */
  successMessage?: string;
  /** Show success message duration (ms) */
  successDuration?: number;
}

interface FieldDefinition {
  name: string;
  label: string;
  required: boolean;
  type: 'text' | 'postal_code' | 'select';
  placeholder?: string;
  autoComplete?: string;
  pattern?: string;
  maxLength?: number;
  helperText?: string;
}

// ============================================================================
// Field Configurations by Country
// ============================================================================

const getFieldsForCountry = (countryCode: string): FieldDefinition[] => {
  // Base fields that most countries use
  const baseFields: Record<string, FieldDefinition> = {
    recipient: {
      name: 'recipient',
      label: 'Full Name',
      required: true,
      type: 'text',
      placeholder: 'John Doe',
      autoComplete: 'name',
      helperText: 'Recipient\'s full name',
    },
    street_address: {
      name: 'street_address',
      label: 'Street Address',
      required: true,
      type: 'text',
      placeholder: '123 Main Street',
      autoComplete: 'street-address',
    },
    city: {
      name: 'city',
      label: 'City',
      required: true,
      type: 'text',
      placeholder: 'San Francisco',
      autoComplete: 'address-level2',
    },
    province: {
      name: 'province',
      label: 'State / Province',
      required: true,
      type: 'text',
      placeholder: 'California',
      autoComplete: 'address-level1',
    },
    postal_code: {
      name: 'postal_code',
      label: 'Postal Code',
      required: true,
      type: 'postal_code',
      placeholder: '94102',
      autoComplete: 'postal-code',
    },
  };

  // Country-specific configurations
  switch (countryCode) {
    case 'US':
      return [
        baseFields.recipient,
        baseFields.street_address,
        {
          ...baseFields.city,
          label: 'City',
        },
        {
          ...baseFields.province,
          label: 'State',
          placeholder: 'CA',
          maxLength: 2,
          helperText: 'Two-letter state code (e.g., CA, NY)',
        },
        {
          ...baseFields.postal_code,
          label: 'ZIP Code',
          placeholder: '94102',
          pattern: '^\\d{5}(-\\d{4})?$',
          helperText: 'Format: 12345 or 12345-6789',
        },
      ];

    case 'JP':
      return [
        baseFields.recipient,
        {
          ...baseFields.postal_code,
          label: 'Postal Code',
          placeholder: '100-0001',
          pattern: '^[0-9]{3}-[0-9]{4}$',
          helperText: 'Format: XXX-XXXX',
        },
        {
          ...baseFields.province,
          label: 'Prefecture',
          placeholder: 'Tokyo',
        },
        {
          ...baseFields.city,
          label: 'City / Municipality',
          placeholder: 'Chiyoda-ku',
        },
        {
          ...baseFields.street_address,
          label: 'Street Address',
          placeholder: '1-1-1 Chiyoda',
        },
      ];

    case 'GB':
      return [
        baseFields.recipient,
        baseFields.street_address,
        baseFields.city,
        {
          ...baseFields.postal_code,
          label: 'Postcode',
          placeholder: 'SW1A 1AA',
          helperText: 'UK postcode format',
        },
      ];

    case 'CA':
      return [
        baseFields.recipient,
        baseFields.street_address,
        baseFields.city,
        {
          ...baseFields.province,
          label: 'Province',
          placeholder: 'ON',
          maxLength: 2,
          helperText: 'Two-letter province code',
        },
        {
          ...baseFields.postal_code,
          label: 'Postal Code',
          placeholder: 'K1A 0B1',
          pattern: '^[A-Z]\\d[A-Z] \\d[A-Z]\\d$',
          helperText: 'Format: A1A 1A1',
        },
      ];

    case 'AU':
      return [
        baseFields.recipient,
        baseFields.street_address,
        {
          ...baseFields.city,
          label: 'Suburb',
        },
        {
          ...baseFields.province,
          label: 'State',
          placeholder: 'NSW',
          maxLength: 3,
        },
        {
          ...baseFields.postal_code,
          label: 'Postcode',
          placeholder: '2000',
          pattern: '^\\d{4}$',
          helperText: 'Four-digit postcode',
        },
      ];

    default:
      // Generic format for other countries
      return [
        baseFields.recipient,
        baseFields.street_address,
        baseFields.city,
        baseFields.province,
        baseFields.postal_code,
      ];
  }
};

// ============================================================================
// Validation Logic
// ============================================================================

const validateField = (field: FieldDefinition, value: string): string | undefined => {
  if (field.required && !value?.trim()) {
    return `${field.label} is required`;
  }

  if (value && field.pattern) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(value)) {
      return field.helperText || `Invalid ${field.label.toLowerCase()} format`;
    }
  }

  if (value && field.maxLength && value.length > field.maxLength) {
    return `${field.label} must be ${field.maxLength} characters or less`;
  }

  return undefined;
};

const validateAddress = (
  fields: FieldDefinition[],
  address: AddressInput
): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const error = validateField(field, (address as any)[field.name] || '');
    if (error) {
      errors[field.name] = error;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// AddressFormPremium Component
// ============================================================================

export function AddressFormPremium({
  initialCountry = 'US',
  initialValue = {},
  onSubmit,
  onChange,
  onValidate,
  liveValidation = true,
  validateOnBlur = true,
  showValidation = true,
  submitLabel = 'Continue',
  hideSubmit = false,
  showCountrySelector = true,
  allowedCountries,
  loading = false,
  disabled = false,
  theme,
  className = '',
  successMessage,
  successDuration = 3000,
}: AddressFormPremiumProps): JSX.Element {
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [address, setAddress] = useState<AddressInput>(initialValue);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get fields for selected country
  const fields = useMemo(() => getFieldsForCountry(selectedCountry), [selectedCountry]);

  // Validate address
  const validate = useCallback(() => {
    const result = validateAddress(fields, address);
    setErrors(result.errors);
    
    const validationResult: ValidationResult = {
      valid: result.valid,
      errors: Object.entries(result.errors).map(([field, message]) => ({
        field,
        code: 'invalid',
        message,
      })),
      warnings: [],
    };
    
    onValidate?.(validationResult);
    return validationResult;
  }, [fields, address, onValidate]);

  // Handle field change
  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    const newAddress = { ...address, [fieldName]: value } as AddressInput;
    setAddress(newAddress);

    // Live validation
    if (liveValidation && touched[fieldName]) {
      const field = fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || '',
        }));
      }
    }

    // Call onChange
    const isValid = validateAddress(fields, newAddress).valid;
    onChange?.(newAddress, isValid);
  }, [address, fields, liveValidation, touched, onChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    if (validateOnBlur) {
      const field = fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, (address as any)[fieldName] || '');
        setErrors(prev => ({
          ...prev,
          [fieldName]: error || '',
        }));
      }
    }
  }, [fields, address, validateOnBlur]);

  // Handle country change
  const handleCountryChange = useCallback((countryCode: string) => {
    setSelectedCountry(countryCode);
    setAddress({ country: countryCode });
    setErrors({});
    setTouched({});
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate
    const validationResult = validate();
    
    if (!validationResult.valid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit?.(address, validationResult);
      
      if (successMessage) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), successDuration);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, validate, address, onSubmit, successMessage, successDuration]);

  // Styles
  const formStyle: CSSProperties = {
    maxWidth: '500px',
    margin: '0 auto',
  };

  const buttonStyle: CSSProperties = {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#FFFFFF',
    backgroundColor: theme?.colorPrimary || '#635BFF',
    border: 'none',
    borderRadius: theme?.borderRadius || '6px',
    cursor: (disabled || loading || isSubmitting) ? 'not-allowed' : 'pointer',
    opacity: (disabled || loading || isSubmitting) ? 0.6 : 1,
    transition: 'all 0.15s ease',
    fontFamily: theme?.fontFamily || 'inherit',
  };

  const successStyle: CSSProperties = {
    padding: '12px',
    marginBottom: '20px',
    backgroundColor: '#D4EDDA',
    border: '1px solid #C3E6CB',
    borderRadius: theme?.borderRadius || '6px',
    color: '#155724',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle} className={className} noValidate>
      {showSuccess && successMessage && (
        <div style={successStyle} role="status">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {showCountrySelector && (
        <CountrySelectElement
          value={selectedCountry}
          onChange={handleCountryChange}
          label="Country / Region"
          required
          disabled={disabled || loading}
          allowedCountries={allowedCountries}
          theme={theme}
        />
      )}

      {fields.map(field => {
        const fieldError = showValidation && touched[field.name] ? errors[field.name] : undefined;
        
        if (field.type === 'postal_code') {
          return (
            <PostalCodeElement
              key={field.name}
              value={(address as any)[field.name] || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
              onBlur={() => handleFieldBlur(field.name)}
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              error={fieldError}
              disabled={disabled || loading}
              countryCode={selectedCountry}
              autoFormat
              theme={theme}
              helperText={!fieldError ? field.helperText : undefined}
            />
          );
        }

        return (
          <AddressElement
            key={field.name}
            value={(address as any)[field.name] || ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            onBlur={() => handleFieldBlur(field.name)}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            error={fieldError}
            disabled={disabled || loading}
            autoComplete={field.autoComplete}
            pattern={field.pattern}
            maxLength={field.maxLength}
            theme={theme}
            helperText={!fieldError ? field.helperText : undefined}
          />
        );
      })}

      {!hideSubmit && (
        <button
          type="submit"
          disabled={disabled || loading || isSubmitting}
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (!disabled && !loading && !isSubmitting) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isSubmitting ? 'Processing...' : loading ? 'Loading...' : submitLabel}
        </button>
      )}
    </form>
  );
}

// ============================================================================
// Export
// ============================================================================

export default AddressFormPremium;
