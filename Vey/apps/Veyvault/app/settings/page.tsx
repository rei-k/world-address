'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Address } from '../../src/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    defaultAddressId: '',
    language: 'en',
    notifications: {
      qrScans: true,
      barcodeScans: true,
      deliveries: true,
      marketing: false,
    },
    privacy: {
      showProfile: true,
      allowFriendRequests: true,
    },
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // TODO: Load user settings from API
    const mockSettings = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      defaultAddressId: '',
      language: 'en',
      notifications: {
        qrScans: true,
        barcodeScans: true,
        deliveries: true,
        marketing: false,
      },
      privacy: {
        showProfile: true,
        allowFriendRequests: true,
      },
    };
    setSettings(mockSettings);

    // TODO: Load user addresses from API
    const mockAddresses: Address[] = [];
    setAddresses(mockAddresses);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Save settings via API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev as any)[keys[0]],
            [keys[1]]: value,
          },
        };
      }
    });
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            Settings
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage your account settings and preferences
          </p>
        </div>
        <Link href="/" className="btn btn-secondary">
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSave}>
        {/* Profile Settings */}
        <div className="card mb-4">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Profile Information
          </h3>

          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={settings.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={settings.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-input"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1234567890"
            />
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Used for auto-fill in hotel check-ins and financial institutions
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Default Address</label>
            <select
              className="form-select"
              value={settings.defaultAddressId}
              onChange={(e) => handleChange('defaultAddressId', e.target.value)}
            >
              <option value="">No default address</option>
              {addresses.map(address => (
                <option key={address.id} value={address.id}>
                  {address.label || address.type} - {address.pid}
                  {address.isDefault && ' (Current Default)'}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              ⭐ Auto-fill this address for hotel check-ins, financial institutions, etc.
            </p>
            {addresses.length === 0 && (
              <p style={{ fontSize: '13px', color: '#f59e0b', marginTop: '8px' }}>
                ℹ️ Please add an address first to set as default
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Language</label>
            <select
              className="form-select"
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="ja">日本語 (Japanese)</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="ko">한국어 (Korean)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card mb-4">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Notifications
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.notifications.qrScans}
                onChange={(e) => handleChange('notifications.qrScans', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Notify me when someone scans my QR code</span>
            </label>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.notifications.barcodeScans}
                onChange={(e) => handleChange('notifications.barcodeScans', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Notify me when someone scans my barcode</span>
            </label>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.notifications.deliveries}
                onChange={(e) => handleChange('notifications.deliveries', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Notify me about delivery updates</span>
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.notifications.marketing}
                onChange={(e) => handleChange('notifications.marketing', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Receive marketing emails and updates</span>
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card mb-4">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Privacy & Security
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.privacy.showProfile}
                onChange={(e) => handleChange('privacy.showProfile', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Make my profile visible to friends</span>
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.privacy.allowFriendRequests}
                onChange={(e) => handleChange('privacy.allowFriendRequests', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Allow others to send me friend requests</span>
            </label>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#1e40af',
          }}>
            🔐 All your addresses are end-to-end encrypted. Only you can decrypt and view them.
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: '#fee2e2' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#dc2626' }}>
            Danger Zone
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (confirm('Are you sure you want to delete all your addresses?')) {
                  alert('This feature is not yet implemented');
                }
              }}
            >
              Delete All Addresses
            </button>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
              Permanently delete all your saved addresses
            </p>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  alert('This feature is not yet implemented');
                }
              }}
            >
              Delete Account
            </button>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
              Permanently delete your account and all associated data
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-2" style={{ marginTop: '20px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
