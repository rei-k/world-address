/**
 * @vey/qr-nfc - Tests for auto-fill functionality
 * 住所入力代行機能のテスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createAutoFillPayload,
  createAutoFillQR,
  parseAutoFillData,
  isAutoFillExpired,
  extractAutoFillAddress,
  autoFillForm,
  autoFillFormFromQR,
  DEFAULT_FIELD_MAPPING,
  generateQRData,
  type AddressInput,
  type AutoFillPayload,
  type QRPayload,
} from '../src/index';

// Sample address for testing
const sampleAddress: AddressInput = {
  recipient: '山田太郎',
  postal_code: '100-0001',
  province: '東京都',
  city: '千代田区',
  street_address: '千代田1-1',
  country: 'Japan',
};

describe('createAutoFillPayload', () => {
  it('should create a valid auto-fill payload', () => {
    const payload = createAutoFillPayload(sampleAddress);

    expect(payload.type).toBe('autofill');
    expect(payload.version).toBe(1);
    expect(payload.data.address).toEqual(sampleAddress);
    expect(payload.data.autofill_id).toMatch(/^autofill_\d+$/);
    expect(payload.data.created_at).toBeDefined();
    expect(payload.data.expires_at).toBeUndefined();
  });

  it('should include label when provided', () => {
    const payload = createAutoFillPayload(sampleAddress, { label: '自宅' });

    expect(payload.data.label).toBe('自宅');
  });

  it('should include custom autofill_id when provided', () => {
    const payload = createAutoFillPayload(sampleAddress, { autofillId: 'custom_123' });

    expect(payload.data.autofill_id).toBe('custom_123');
  });

  it('should set expiration when expiresIn is provided', () => {
    const payload = createAutoFillPayload(sampleAddress, { expiresIn: 3600 });

    expect(payload.data.expires_at).toBeDefined();
    const expiresAt = new Date(payload.data.expires_at!);
    const createdAt = new Date(payload.data.created_at);
    const diff = expiresAt.getTime() - createdAt.getTime();
    // Should be approximately 3600 seconds (1 hour)
    expect(diff).toBeGreaterThanOrEqual(3599000);
    expect(diff).toBeLessThanOrEqual(3601000);
  });
});

describe('createAutoFillQR', () => {
  it('should create QR data with vey:// protocol', () => {
    const qrData = createAutoFillQR(sampleAddress);

    expect(qrData).toMatch(/^vey:\/\//);
  });

  it('should create parseable QR data', () => {
    const qrData = createAutoFillQR(sampleAddress, { label: 'Office' });
    const parsed = parseAutoFillData(qrData);

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('autofill');
    expect(parsed?.data.address).toEqual(sampleAddress);
    expect(parsed?.data.label).toBe('Office');
  });
});

describe('parseAutoFillData', () => {
  it('should parse valid auto-fill QR data', () => {
    const qrData = createAutoFillQR(sampleAddress);
    const parsed = parseAutoFillData(qrData);

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('autofill');
    expect(parsed?.data.address).toEqual(sampleAddress);
  });

  it('should return null for invalid QR data', () => {
    const parsed = parseAutoFillData('invalid-data');

    expect(parsed).toBeNull();
  });

  it('should return null for non-autofill type QR data', () => {
    // Create a regular address QR (not autofill type)
    const payload: QRPayload = {
      type: 'address',
      version: 1,
      data: { address: sampleAddress },
    };
    const qrData = generateQRData(payload);
    const parsed = parseAutoFillData(qrData);

    expect(parsed).toBeNull();
  });
});

describe('isAutoFillExpired', () => {
  it('should return false for payload without expiration', () => {
    const payload = createAutoFillPayload(sampleAddress);

    expect(isAutoFillExpired(payload)).toBe(false);
  });

  it('should return false for non-expired payload', () => {
    const payload = createAutoFillPayload(sampleAddress, { expiresIn: 3600 });

    expect(isAutoFillExpired(payload)).toBe(false);
  });

  it('should return true for expired payload', () => {
    const payload: AutoFillPayload = {
      type: 'autofill',
      version: 1,
      data: {
        autofill_id: 'test',
        address: sampleAddress,
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        expires_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
    };

    expect(isAutoFillExpired(payload)).toBe(true);
  });
});

describe('extractAutoFillAddress', () => {
  it('should extract address from valid payload', () => {
    const payload = createAutoFillPayload(sampleAddress);
    const address = extractAutoFillAddress(payload);

    expect(address).toEqual(sampleAddress);
  });

  it('should return null for expired payload', () => {
    const payload: AutoFillPayload = {
      type: 'autofill',
      version: 1,
      data: {
        autofill_id: 'test',
        address: sampleAddress,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        expires_at: new Date(Date.now() - 3600000).toISOString(),
      },
    };

    expect(extractAutoFillAddress(payload)).toBeNull();
  });
});

describe('autoFillForm', () => {
  beforeEach(() => {
    // Reset document body before each test
    document.body.innerHTML = '';
  });

  it('should fill form fields with address data', () => {
    // Create a simple form
    document.body.innerHTML = `
      <form>
        <input name="recipient" />
        <input name="postal_code" />
        <input name="province" />
        <input name="city" />
        <input name="street_address" />
        <input name="country" />
      </form>
    `;

    const result = autoFillForm(sampleAddress);

    expect(result.success).toBe(true);
    expect(result.filledCount).toBe(6);
    expect(result.filledFields).toContain('recipient');
    expect(result.filledFields).toContain('postal_code');
    expect(result.filledFields).toContain('province');
    expect(result.filledFields).toContain('city');
    expect(result.filledFields).toContain('street_address');
    expect(result.filledFields).toContain('country');

    // Verify values
    expect((document.querySelector('[name="recipient"]') as HTMLInputElement).value).toBe('山田太郎');
    expect((document.querySelector('[name="postal_code"]') as HTMLInputElement).value).toBe('100-0001');
    expect((document.querySelector('[name="province"]') as HTMLInputElement).value).toBe('東京都');
  });

  it('should report missing fields when form elements not found', () => {
    document.body.innerHTML = `
      <form>
        <input name="recipient" />
        <input name="city" />
      </form>
    `;

    const result = autoFillForm(sampleAddress);

    expect(result.success).toBe(true);
    expect(result.filledCount).toBe(2);
    expect(result.filledFields).toContain('recipient');
    expect(result.filledFields).toContain('city');
    expect(result.missingFields).toContain('postal_code');
    expect(result.missingFields).toContain('province');
    expect(result.missingFields).toContain('street_address');
    expect(result.missingFields).toContain('country');
  });

  it('should fill textarea elements', () => {
    document.body.innerHTML = `
      <form>
        <textarea name="street_address"></textarea>
      </form>
    `;

    const result = autoFillForm({ street_address: 'Test Address' });

    expect(result.success).toBe(true);
    expect((document.querySelector('[name="street_address"]') as HTMLTextAreaElement).value).toBe('Test Address');
  });

  it('should fill select elements', () => {
    document.body.innerHTML = `
      <form>
        <select name="province">
          <option value="">選択してください</option>
          <option value="東京都">東京都</option>
          <option value="大阪府">大阪府</option>
        </select>
      </form>
    `;

    const result = autoFillForm({ province: '東京都' });

    expect(result.success).toBe(true);
    expect((document.querySelector('[name="province"]') as HTMLSelectElement).value).toBe('東京都');
  });

  it('should use custom field mapping', () => {
    document.body.innerHTML = `
      <form>
        <input id="customer-name" />
        <input id="zip" />
        <input id="pref" />
      </form>
    `;

    const customMapping = {
      recipient: '#customer-name',
      postal_code: '#zip',
      province: '#pref',
    };

    const result = autoFillForm(sampleAddress, customMapping);

    expect(result.success).toBe(true);
    expect((document.querySelector('#customer-name') as HTMLInputElement).value).toBe('山田太郎');
    expect((document.querySelector('#zip') as HTMLInputElement).value).toBe('100-0001');
    expect((document.querySelector('#pref') as HTMLInputElement).value).toBe('東京都');
  });

  it('should work with autocomplete attributes', () => {
    document.body.innerHTML = `
      <form>
        <input autocomplete="name" />
        <input autocomplete="postal-code" />
        <input autocomplete="address-level1" />
        <input autocomplete="address-level2" />
        <input autocomplete="street-address" />
        <input autocomplete="country" />
      </form>
    `;

    const result = autoFillForm(sampleAddress);

    expect(result.success).toBe(true);
    expect(result.filledCount).toBe(6);
  });
});

describe('autoFillFormFromQR', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should fill form from QR data', () => {
    document.body.innerHTML = `
      <form>
        <input name="recipient" />
        <input name="postal_code" />
        <input name="province" />
      </form>
    `;

    const qrData = createAutoFillQR(sampleAddress);
    const result = autoFillFormFromQR(qrData);

    expect(result.success).toBe(true);
    expect((document.querySelector('[name="recipient"]') as HTMLInputElement).value).toBe('山田太郎');
  });

  it('should return error for invalid QR data', () => {
    const result = autoFillFormFromQR('invalid-qr-data');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid QR code data format');
  });

  it('should return error for expired auto-fill data', () => {
    const expiredPayload: AutoFillPayload = {
      type: 'autofill',
      version: 1,
      data: {
        autofill_id: 'test',
        address: sampleAddress,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        expires_at: new Date(Date.now() - 3600000).toISOString(),
      },
    };
    const qrData = generateQRData(expiredPayload as QRPayload);

    const result = autoFillFormFromQR(qrData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Auto-fill data has expired');
  });

  it('should also work with regular address QR (not autofill type)', () => {
    document.body.innerHTML = `
      <form>
        <input name="recipient" />
        <input name="postal_code" />
      </form>
    `;

    // Create a regular address QR
    const payload: QRPayload = {
      type: 'address',
      version: 1,
      data: {
        address_id: 'test',
        address: sampleAddress,
      },
    };
    const qrData = generateQRData(payload);

    const result = autoFillFormFromQR(qrData);

    expect(result.success).toBe(true);
    expect((document.querySelector('[name="recipient"]') as HTMLInputElement).value).toBe('山田太郎');
  });
});

describe('DEFAULT_FIELD_MAPPING', () => {
  it('should have mappings for all address fields', () => {
    expect(DEFAULT_FIELD_MAPPING.recipient).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.building).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.floor).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.room).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.unit).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.street_address).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.district).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.ward).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.city).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.province).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.postal_code).toBeDefined();
    expect(DEFAULT_FIELD_MAPPING.country).toBeDefined();
  });
});
