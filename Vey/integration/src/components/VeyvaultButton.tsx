/**
 * VeyvaultButton React Component
 * 
 * One-click checkout button for e-commerce integration.
 * Allows customers to select delivery address from their Veyvault.
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { AddressRegistration, DeliveryResponse } from '../zkp-integration';

export interface VeyvaultButtonProps {
  /** Callback when address is selected */
  onSelect: (response: DeliveryResponse) => void;
  /** Callback for errors */
  onError?: (error: Error) => void;
  /** Button label */
  label?: string;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Disable button */
  disabled?: boolean;
  /** ConveyID of the user (if already known) */
  conveyId?: string;
  /** Package details for delivery request */
  packageDetails?: {
    weight: number;
    dimensions: { length: number; width: number; height: number };
    value: number;
    currency: string;
  };
  /** Store/sender information */
  storeInfo?: {
    name: string;
    conveyId: string;
  };
}

export interface VeyvaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: AddressRegistration, proofType: 'membership' | 'selective-reveal' | 'locker') => void;
  availableAddresses: AddressRegistration[];
  packageDetails?: VeyvaultButtonProps['packageDetails'];
}

/**
 * Veyvault Address Selection Modal
 */
export const VeyvaultModal: React.FC<VeyvaultModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  availableAddresses,
  packageDetails,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [proofType, setProofType] = useState<'membership' | 'selective-reveal' | 'locker'>('selective-reveal');
  const [revealFields, setRevealFields] = useState<string[]>(['country', 'postalCode']);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const selected = availableAddresses[selectedIndex];
    if (selected) {
      onSelect(selected, proofType);
    }
  };

  return (
    <div className="veyvault-modal-overlay" onClick={onClose}>
      <div className="veyvault-modal" onClick={(e) => e.stopPropagation()}>
        <div className="veyvault-modal-header">
          <h2>Select Delivery Address</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="veyvault-modal-body">
          {/* Package Details */}
          {packageDetails && (
            <div className="package-details">
              <h3>Package Details</h3>
              <p>Weight: {packageDetails.weight}kg</p>
              <p>Dimensions: {packageDetails.dimensions.length}×{packageDetails.dimensions.width}×{packageDetails.dimensions.height}cm</p>
              <p>Value: {packageDetails.currency} {packageDetails.value}</p>
            </div>
          )}

          {/* Address Selection */}
          <div className="address-selection">
            <h3>Your Addresses</h3>
            {availableAddresses.map((address, index) => (
              <div
                key={address.pid}
                className={`address-card ${selectedIndex === index ? 'selected' : ''}`}
                onClick={() => setSelectedIndex(index)}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedIndex === index}
                  onChange={() => setSelectedIndex(index)}
                />
                <div className="address-info">
                  <div className="address-label">{address.fullAddress.recipient || 'Default Address'}</div>
                  <div className="address-details">
                    {address.fullAddress.country}, {address.fullAddress.province}, {address.fullAddress.city}
                  </div>
                  <div className="address-pid">PID: {address.pid}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Settings */}
          <div className="privacy-settings">
            <h3>Privacy Settings</h3>
            
            <div className="proof-type-selector">
              <label>
                <input
                  type="radio"
                  name="proofType"
                  value="membership"
                  checked={proofType === 'membership'}
                  onChange={() => setProofType('membership')}
                />
                <span>Maximum Privacy (Membership Proof)</span>
                <p className="description">Only prove address is valid. Store sees nothing.</p>
              </label>

              <label>
                <input
                  type="radio"
                  name="proofType"
                  value="selective-reveal"
                  checked={proofType === 'selective-reveal'}
                  onChange={() => setProofType('selective-reveal')}
                />
                <span>Partial Reveal (Selective Disclosure)</span>
                <p className="description">Reveal only selected fields to store.</p>
              </label>

              <label>
                <input
                  type="radio"
                  name="proofType"
                  value="locker"
                  checked={proofType === 'locker'}
                  onChange={() => setProofType('locker')}
                />
                <span>Locker Delivery (Anonymous)</span>
                <p className="description">Use pickup locker for complete anonymity.</p>
              </label>
            </div>

            {/* Selective Reveal Options */}
            {proofType === 'selective-reveal' && (
              <div className="reveal-fields">
                <h4>Fields to Reveal</h4>
                {['country', 'province', 'city', 'postalCode'].map((field) => (
                  <label key={field}>
                    <input
                      type="checkbox"
                      checked={revealFields.includes(field)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRevealFields([...revealFields, field]);
                        } else {
                          setRevealFields(revealFields.filter(f => f !== field));
                        }
                      }}
                    />
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="privacy-notice">
            <p>🔒 Your full address will only be shared with the delivery carrier.</p>
            <p>⚡ The store will only see what you choose to reveal.</p>
          </div>
        </div>

        <div className="veyvault-modal-footer">
          <button className="button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button-primary" onClick={handleSubmit}>
            Confirm & Generate ZKP Proof
          </button>
        </div>
      </div>

      <style jsx>{`
        .veyvault-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .veyvault-modal {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .veyvault-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e0e0e0;
        }

        .veyvault-modal-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: #666;
        }

        .veyvault-modal-body {
          padding: 24px;
        }

        .package-details {
          background: #f5f5f5;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .package-details h3 {
          margin-top: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .package-details p {
          margin: 4px 0;
        }

        .address-selection {
          margin-bottom: 24px;
        }

        .address-selection h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .address-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: all 0.2s;
        }

        .address-card:hover {
          border-color: #2196F3;
          background: #f0f7ff;
        }

        .address-card.selected {
          border-color: #2196F3;
          background: #e3f2fd;
        }

        .address-info {
          flex: 1;
        }

        .address-label {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .address-details {
          color: #666;
          font-size: 14px;
        }

        .address-pid {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }

        .privacy-settings {
          margin-bottom: 24px;
        }

        .privacy-settings h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .proof-type-selector label {
          display: block;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .proof-type-selector label:hover {
          border-color: #2196F3;
          background: #f0f7ff;
        }

        .proof-type-selector input[type="radio"] {
          margin-right: 8px;
        }

        .proof-type-selector span {
          font-weight: 600;
        }

        .proof-type-selector .description {
          margin: 4px 0 0 24px;
          font-size: 14px;
          color: #666;
        }

        .reveal-fields {
          margin-top: 16px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .reveal-fields h4 {
          margin-top: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .reveal-fields label {
          display: block;
          margin-bottom: 8px;
        }

        .privacy-notice {
          background: #e8f5e9;
          border-left: 4px solid #4CAF50;
          padding: 12px 16px;
          border-radius: 4px;
        }

        .privacy-notice p {
          margin: 4px 0;
          font-size: 14px;
        }

        .veyvault-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e0e0e0;
        }

        .button-primary,
        .button-secondary {
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .button-primary {
          background: #2196F3;
          color: white;
        }

        .button-primary:hover {
          background: #1976D2;
        }

        .button-secondary {
          background: white;
          border: 2px solid #e0e0e0;
          color: #333;
        }

        .button-secondary:hover {
          border-color: #2196F3;
          background: #f0f7ff;
        }
      `}</style>
    </div>
  );
};

/**
 * Veyvault Button Component
 */
export const VeyvaultButton: React.FC<VeyvaultButtonProps> = ({
  onSelect,
  onError,
  label = 'Pay with Veyvault',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  conveyId,
  packageDetails,
  storeInfo,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableAddresses, setAvailableAddresses] = useState<AddressRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, fetch user's addresses from API
      // For demo, use mock data
      const mockAddresses: AddressRegistration[] = [
        {
          userDid: 'did:key:example123',
          pid: 'JP-13-113-01-T07-B12-R401',
          countryCode: 'JP',
          hierarchyDepth: 7,
          fullAddress: {
            country: 'Japan',
            province: 'Tokyo',
            city: 'Shibuya',
            postalCode: '150-0001',
            street: 'Jingumae 1-2-3',
            building: 'Shibuya Building 4F',
            room: '401',
            recipient: 'Default Address',
          },
        },
      ];

      setAvailableAddresses(mockAddresses);
      setIsModalOpen(true);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const handleAddressSelect = useCallback(
    async (address: AddressRegistration, proofType: 'membership' | 'selective-reveal' | 'locker') => {
      try {
        setIsLoading(true);

        // In production, generate actual ZKP proof
        const mockResponse: DeliveryResponse = {
          requestId: 'req_' + Math.random().toString(36).substring(7),
          accepted: true,
          selectedAddress: {
            pid: address.pid,
          },
          zkpProof: {
            type: proofType,
            proof: { commitment: 'mock_commitment' },
            publicSignals: ['mock_signal_1', 'mock_signal_2'],
          },
          respondedAt: new Date().toISOString(),
        };

        onSelect(mockResponse);
        setIsModalOpen(false);
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [onSelect, onError]
  );

  const sizeClasses = {
    small: 'veyvault-button-small',
    medium: 'veyvault-button-medium',
    large: 'veyvault-button-large',
  };

  const variantClasses = {
    primary: 'veyvault-button-primary',
    secondary: 'veyvault-button-secondary',
    outline: 'veyvault-button-outline',
  };

  return (
    <>
      <button
        className={`veyvault-button ${variantClasses[variant]} ${sizeClasses[size]}`}
        onClick={handleClick}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v5h-2zm0 6h2v2h-2z" />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>

      <VeyvaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddressSelect}
        availableAddresses={availableAddresses}
        packageDetails={packageDetails}
      />

      <style jsx>{`
        .veyvault-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .veyvault-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .veyvault-button-small {
          padding: 8px 16px;
          font-size: 14px;
        }

        .veyvault-button-medium {
          padding: 12px 24px;
          font-size: 16px;
        }

        .veyvault-button-large {
          padding: 16px 32px;
          font-size: 18px;
        }

        .veyvault-button-primary {
          background: #2196F3;
          color: white;
        }

        .veyvault-button-primary:hover:not(:disabled) {
          background: #1976D2;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
        }

        .veyvault-button-secondary {
          background: #4CAF50;
          color: white;
        }

        .veyvault-button-secondary:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }

        .veyvault-button-outline {
          background: white;
          border: 2px solid #2196F3;
          color: #2196F3;
        }

        .veyvault-button-outline:hover:not(:disabled) {
          background: #f0f7ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
        }
      `}</style>
    </>
  );
};

export default VeyvaultButton;
