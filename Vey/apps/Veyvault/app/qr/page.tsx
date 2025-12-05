'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCodeDisplay from '../components/QRCodeDisplay';
import type { Address } from '../../src/types';

export default function QRCodePage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call
    const mockAddresses: Address[] = [];
    setAddresses(mockAddresses);
    setLoading(false);

    // Listen for QR scan events (simulated)
    const handleQRScanned = () => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    };

    // Simulate QR scan notification
    window.addEventListener('qr-scanned', handleQRScanned);
    return () => window.removeEventListener('qr-scanned', handleQRScanned);
  }, []);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Notification */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>✓</span>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                QR Code Scanned!
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Someone just scanned your QR code
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            QR Codes
          </h1>
          <p style={{ color: '#6b7280' }}>
            Generate and manage QR codes for your addresses
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Back
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
            No addresses available
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            You need to add an address first before generating QR codes.
          </p>
          <Link href="/addresses/new" className="btn btn-primary">
            Add Your First Address
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2" style={{ gap: '30px' }}>
          {/* Address Selection */}
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Select Address
            </h3>
            <div className="form-group">
              <label className="form-label">Choose an address to generate QR code</label>
              <select
                className="form-select"
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                <option value="">Select an address...</option>
                {addresses.map(address => (
                  <option key={address.id} value={address.id}>
                    {address.label || address.type} - {address.pid}
                  </option>
                ))}
              </select>
            </div>

            {selectedAddress && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Address Details
                </h4>
                <div style={{ 
                  background: '#f9fafb',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}>
                  <p><strong>Type:</strong> {selectedAddress.type}</p>
                  <p><strong>PID:</strong> {selectedAddress.pid}</p>
                  {selectedAddress.isPrimary && (
                    <p style={{ color: '#2563eb', marginTop: '8px' }}>
                      ⭐ Primary Address
                    </p>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', padding: '16px', background: '#eff6ff', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e40af' }}>
                🔐 Privacy & Security
              </h4>
              <ul style={{ fontSize: '13px', color: '#1e40af', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '4px' }}>QR codes contain encrypted address tokens</li>
                <li style={{ marginBottom: '4px' }}>Your actual address is never exposed</li>
                <li>You'll be notified when someone scans your QR</li>
              </ul>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="card">
            {selectedAddress ? (
              <QRCodeDisplay address={selectedAddress} />
            ) : (
              <div className="text-center" style={{ padding: '60px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>
                  📱
                </div>
                <p style={{ color: '#6b7280' }}>
                  Select an address to generate QR code
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="card" style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          QR Code Features
        </h3>
        <div className="grid grid-cols-3">
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              📥 Download
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Save QR codes as PNG images for printing or sharing
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              🔔 Notifications
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Get real-time notifications when someone scans your QR
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              🔒 Secure Sharing
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Share addresses without revealing your actual location
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
