'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Address, LanguageSettings } from '../../src/types';
import { getTranslationService } from '../../src/services/translation.service';

export default function SettingsPage() {
  const translationService = getTranslationService();
  const supportedLanguages = translationService.getSupportedLanguages();

  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    defaultAddressId: '',
    language: 'en',
    languageSettings: {
      appLanguage: 'en',
      addressInputLanguages: ['en'],
      labelLanguage: 'en',
      enableAutoTranslation: false,
      translationTargets: [],
      countryLanguageOverrides: {},
    } as LanguageSettings,
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
  const [showAdvancedLanguage, setShowAdvancedLanguage] = useState(false);

  useEffect(() => {
    // TODO: Load user settings from API
    const mockSettings = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      defaultAddressId: '',
      language: 'en',
      languageSettings: {
        appLanguage: 'en',
        addressInputLanguages: ['en', 'ja'],
        labelLanguage: 'en',
        enableAutoTranslation: true,
        translationTargets: ['en', 'ja'],
        countryLanguageOverrides: {},
      } as LanguageSettings,
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
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev as any)[keys[0]],
            [keys[1]]: value,
          },
        };
      } else if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev as any)[keys[0]],
            [keys[1]]: {
              ...(prev as any)[keys[0]][keys[1]],
              [keys[2]]: value,
            },
          },
        };
      }
      return prev;
    });
  };

  const toggleAddressInputLanguage = (langCode: string) => {
    setSettings(prev => {
      const current = prev.languageSettings.addressInputLanguages;
      const updated = current.includes(langCode)
        ? current.filter(l => l !== langCode)
        : [...current, langCode];
      return {
        ...prev,
        languageSettings: {
          ...prev.languageSettings,
          addressInputLanguages: updated,
        },
      };
    });
  };

  const toggleTranslationTarget = (langCode: string) => {
    setSettings(prev => {
      const current = prev.languageSettings.translationTargets;
      const updated = current.includes(langCode)
        ? current.filter(l => l !== langCode)
        : [...current, langCode];
      return {
        ...prev,
        languageSettings: {
          ...prev.languageSettings,
          translationTargets: updated,
        },
      };
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
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              ℹ️ This is your app display language. Configure address language settings below.
            </p>
          </div>
        </div>

        {/* Language Settings - Enhanced */}
        <div className="card mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              🌍 Language Settings
            </h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAdvancedLanguage(!showAdvancedLanguage)}
              style={{ fontSize: '14px', padding: '6px 12px' }}
            >
              {showAdvancedLanguage ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>

          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Configure language preferences for address input, labels, and auto-translation.
            These settings are separate from address registration.
          </p>

          {/* App Language */}
          <div className="form-group">
            <label className="form-label">App Display Language</label>
            <select
              className="form-select"
              value={settings.languageSettings.appLanguage}
              onChange={(e) => handleChange('languageSettings.appLanguage', e.target.value)}
            >
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Language for app interface and menus
            </p>
          </div>

          {/* Label Language */}
          <div className="form-group">
            <label className="form-label">Label & Placeholder Language</label>
            <select
              className="form-select"
              value={settings.languageSettings.labelLanguage}
              onChange={(e) => handleChange('languageSettings.labelLanguage', e.target.value)}
            >
              {supportedLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Language for form labels and placeholders in address forms
            </p>
          </div>

          {/* Auto-Translation */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.languageSettings.enableAutoTranslation}
                onChange={(e) => handleChange('languageSettings.enableAutoTranslation', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>
                Enable Auto-Translation for Addresses
              </span>
            </label>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Automatically translate addresses between languages using free translation API
            </p>
          </div>

          {/* Advanced Settings */}
          {showAdvancedLanguage && (
            <>
              <hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
              
              {/* Address Input Languages */}
              <div className="form-group">
                <label className="form-label">Enabled Address Input Languages</label>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                  Select languages you want to use for entering addresses (native, English, delivery languages)
                </p>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '12px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                }}>
                  {supportedLanguages.map(lang => (
                    <label key={lang.code} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.languageSettings.addressInputLanguages.includes(lang.code)}
                        onChange={() => toggleAddressInputLanguage(lang.code)}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{ fontSize: '14px' }}>{lang.nativeName}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Translation Targets */}
              {settings.languageSettings.enableAutoTranslation && (
                <div className="form-group">
                  <label className="form-label">Auto-Translation Target Languages</label>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                    Addresses will be automatically translated to these languages
                  </p>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                    gap: '12px',
                    padding: '12px',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                  }}>
                    {supportedLanguages.map(lang => (
                      <label key={lang.code} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={settings.languageSettings.translationTargets.includes(lang.code)}
                          onChange={() => toggleTranslationTarget(lang.code)}
                          style={{ marginRight: '8px' }}
                        />
                        <span style={{ fontSize: '14px' }}>{lang.nativeName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#eff6ff',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1e40af',
              }}>
                <strong>💡 How Language Settings Work:</strong>
                <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                  <li>Address input languages don't have to match the app language</li>
                  <li>You can enter addresses in native language, English, or delivery-supported languages</li>
                  <li>Labels and placeholders use your preferred label language</li>
                  <li>Auto-translation uses free translation API (MyMemory)</li>
                  <li>Each country's native language is always available</li>
                </ul>
              </div>
            </>
          )}
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
