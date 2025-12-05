/**
 * Premium Address Form Examples
 * 
 * Demonstrates how to use @vey/react premium components
 * with Stripe-like quality and developer experience
 */

import React, { useState } from 'react';
import {
  AddressFormPremium,
  AddressElement,
  PostalCodeElement,
  CountrySelectElement,
  type AddressInput,
  type ValidationResult,
  type AddressElementTheme,
} from '@vey/react';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export function BasicExample() {
  const handleSubmit = (address: AddressInput, validation: ValidationResult) => {
    console.log('Address submitted:', address);
    console.log('Validation result:', validation);
    // Send to your backend
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Basic Address Form</h2>
      <AddressFormPremium
        initialCountry="US"
        onSubmit={handleSubmit}
        submitLabel="Continue to Shipping"
      />
    </div>
  );
}

// ============================================================================
// Example 2: Custom Theme (Dark Mode)
// ============================================================================

export function DarkModeExample() {
  const darkTheme: AddressElementTheme = {
    colorPrimary: '#7C3AED',
    colorSuccess: '#10B981',
    colorError: '#EF4444',
    colorWarning: '#F59E0B',
    colorText: '#F9FAFB',
    colorTextSecondary: '#D1D5DB',
    colorBackground: '#1F2937',
    colorBorder: '#374151',
    colorBorderFocus: '#7C3AED',
    colorBorderError: '#EF4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '8px',
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#111827', minHeight: '100vh' }}>
      <h2 style={{ color: '#F9FAFB' }}>Dark Mode Address Form</h2>
      <AddressFormPremium
        initialCountry="US"
        theme={darkTheme}
        submitLabel="Save Address"
      />
    </div>
  );
}

// ============================================================================
// Example 3: Multi-Country with Validation
// ============================================================================

export function MultiCountryExample() {
  const [submittedAddress, setSubmittedAddress] = useState<AddressInput | null>(null);

  const handleSubmit = (address: AddressInput, validation: ValidationResult) => {
    setSubmittedAddress(address);
    alert('Address submitted successfully! Check console for details.');
    console.log('Submitted address:', address);
  };

  const handleChange = (address: AddressInput, isValid: boolean) => {
    console.log('Current address:', address, 'Valid:', isValid);
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Multi-Country Address Form</h2>
      <p style={{ color: '#6B7280', marginBottom: '20px' }}>
        Try different countries to see dynamic field layouts
      </p>
      
      <AddressFormPremium
        initialCountry="US"
        onSubmit={handleSubmit}
        onChange={handleChange}
        liveValidation={true}
        validateOnBlur={true}
        showCountrySelector={true}
        allowedCountries={['US', 'GB', 'CA', 'AU', 'JP', 'DE', 'FR']}
        submitLabel="Validate & Submit"
        successMessage="Address saved successfully!"
      />

      {submittedAddress && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#F3F4F6',
          borderRadius: '8px',
        }}>
          <h3>Submitted Address:</h3>
          <pre style={{ fontSize: '14px' }}>
            {JSON.stringify(submittedAddress, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 4: E-commerce Checkout
// ============================================================================

export function CheckoutExample() {
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [shippingAddress, setShippingAddress] = useState<AddressInput | null>(null);

  const handleShippingSubmit = (address: AddressInput) => {
    setShippingAddress(address);
    setStep('payment');
  };

  const customTheme: AddressElementTheme = {
    colorPrimary: '#0070F3',
    borderRadius: '4px',
    fontFamily: 'system-ui, sans-serif',
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '40px',
        justifyContent: 'center',
      }}>
        {['shipping', 'payment', 'review'].map((s, i) => (
          <div
            key={s}
            style={{
              padding: '10px 20px',
              backgroundColor: step === s ? '#0070F3' : '#E5E7EB',
              color: step === s ? 'white' : '#6B7280',
              borderRadius: '20px',
              fontWeight: 500,
            }}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      {step === 'shipping' && (
        <div>
          <h2>Shipping Address</h2>
          <AddressFormPremium
            initialCountry="US"
            onSubmit={handleShippingSubmit}
            theme={customTheme}
            submitLabel="Continue to Payment"
            liveValidation
          />
        </div>
      )}

      {step === 'payment' && (
        <div>
          <h2>Payment Method</h2>
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
            Payment form would go here...
            <br />
            <button
              onClick={() => setStep('review')}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#0070F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {step === 'review' && shippingAddress && (
        <div>
          <h2>Order Review</h2>
          <div style={{
            padding: '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            <h3>Shipping Address:</h3>
            <p>{shippingAddress.recipient}</p>
            <p>{shippingAddress.street_address}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
            </p>
            <button
              onClick={() => setStep('shipping')}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#E5E7EB',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Edit Address
            </button>
          </div>
          <button
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: '#10B981',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => alert('Order placed!')}
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}

export default CheckoutExample;
