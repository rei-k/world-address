/**
 * @vey/qr-nfc - QR code and NFC utilities for address handling
 *
 * Features:
 * - Address Proof QR API
 * - NFC quick-tap address register
 * - Zero-knowledge existence proof
 * - Address Auto-fill (住所入力代行)
 */

/**
 * Address input for validation and auto-fill
 * This is a local copy that's compatible with @vey/core's AddressInput
 * 住所入力のための型定義
 */
export interface AddressInput {
  /** Recipient name / 宛名 */
  recipient?: string;
  /** Building name / 建物名 */
  building?: string;
  /** Floor number / 階 */
  floor?: string;
  /** Room number / 部屋番号 */
  room?: string;
  /** Unit number / ユニット番号 */
  unit?: string;
  /** Street address / 番地・通り */
  street_address?: string;
  /** District / 地区 */
  district?: string;
  /** Ward / 区 */
  ward?: string;
  /** City / 市区町村 */
  city?: string;
  /** Province/Prefecture/State / 都道府県 */
  province?: string;
  /** Postal code / 郵便番号 */
  postal_code?: string;
  /** Country / 国 */
  country?: string;
}

// =============================================================================
// UTF-8 safe Base64 encoding/decoding utilities
// =============================================================================

/**
 * Encode a string to base64, handling UTF-8 characters properly
 * UTF-8文字を正しく処理するbase64エンコード
 */
function encodeBase64(str: string): string {
  if (typeof window !== 'undefined' && typeof TextEncoder !== 'undefined') {
    // Browser environment
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
    return btoa(binary);
  } else {
    // Node.js environment
    return Buffer.from(str, 'utf-8').toString('base64');
  }
}

/**
 * Decode a base64 string, handling UTF-8 characters properly
 * UTF-8文字を正しく処理するbase64デコード
 */
function decodeBase64(str: string): string {
  if (typeof window !== 'undefined' && typeof TextDecoder !== 'undefined') {
    // Browser environment
    const binary = atob(str);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } else {
    // Node.js environment
    return Buffer.from(str, 'base64').toString('utf-8');
  }
}

/**
 * QR code data types
 */
export type QRDataType = 'address' | 'proof' | 'locker' | 'delivery' | 'autofill';

/**
 * QR code payload
 */
export interface QRPayload {
  type: QRDataType;
  version: number;
  data: Record<string, unknown>;
  signature?: string;
  expiresAt?: string;
}

/**
 * Address proof payload
 */
export interface AddressProofPayload {
  type: 'proof';
  version: 1;
  data: {
    proof_id: string;
    address_hash: string;
    exists: boolean;
    verified_at: string;
    expires_at: string;
  };
  signature: string;
}

/**
 * Address QR payload
 */
export interface AddressQRPayload {
  type: 'address';
  version: 1;
  data: {
    address_id?: string;
    address: AddressInput;
  };
}

/**
 * Locker QR payload
 */
export interface LockerQRPayload {
  type: 'locker';
  version: 1;
  data: {
    locker_id: string;
    locker_name: string;
    address: AddressInput;
    compartment?: string;
  };
}

/**
 * NFC record type
 */
export type NFCRecordType = 'address' | 'locker' | 'delivery' | 'autofill';

/**
 * NFC record data
 */
export interface NFCRecord {
  type: NFCRecordType;
  data: Record<string, unknown>;
}

/**
 * Generate QR code data URL
 */
export function generateQRData(payload: QRPayload): string {
  const json = JSON.stringify(payload);
  // Encode as base64 for QR code (UTF-8 safe)
  return `vey://${encodeBase64(json)}`;
}

/**
 * Parse QR code data
 */
export function parseQRData(data: string): QRPayload | null {
  try {
    // Remove protocol prefix
    const encoded = data.replace(/^vey:\/\//, '');
    const json = decodeBase64(encoded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Create address proof QR payload
 */
export function createAddressProof(
  address: AddressInput,
  options: {
    proofId?: string;
    expiresIn?: number; // seconds
    secret?: string;
  } = {}
): AddressProofPayload {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (options.expiresIn ?? 3600) * 1000);

  // Create address hash (simplified - would use crypto in production)
  const addressString = JSON.stringify(address);
  const addressHash = encodeBase64(addressString).slice(0, 32);

  // Create signature (simplified - would use proper signing in production)
  const signatureData = `${addressHash}:${expiresAt.toISOString()}`;
  const signature = encodeBase64(signatureData);

  return {
    type: 'proof',
    version: 1,
    data: {
      proof_id: options.proofId ?? `proof_${Date.now()}`,
      address_hash: addressHash,
      exists: true,
      verified_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    },
    signature,
  };
}

/**
 * Verify address proof
 */
export function verifyAddressProof(proof: AddressProofPayload): {
  valid: boolean;
  expired: boolean;
  error?: string;
} {
  try {
    const expiresAt = new Date(proof.data.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      return { valid: false, expired: true, error: 'Proof has expired' };
    }

    // Verify signature (simplified)
    const expectedSignatureData = `${proof.data.address_hash}:${proof.data.expires_at}`;
    const expectedSignature = encodeBase64(expectedSignatureData);

    if (proof.signature !== expectedSignature) {
      return { valid: false, expired: false, error: 'Invalid signature' };
    }

    return { valid: true, expired: false };
  } catch {
    return { valid: false, expired: false, error: 'Invalid proof format' };
  }
}

/**
 * Create address QR payload
 */
export function createAddressQR(
  address: AddressInput,
  addressId?: string
): AddressQRPayload {
  return {
    type: 'address',
    version: 1,
    data: {
      address_id: addressId,
      address,
    },
  };
}

/**
 * Create locker QR payload
 */
export function createLockerQR(
  lockerId: string,
  lockerName: string,
  address: AddressInput,
  compartment?: string
): LockerQRPayload {
  return {
    type: 'locker',
    version: 1,
    data: {
      locker_id: lockerId,
      locker_name: lockerName,
      address,
      compartment,
    },
  };
}

/**
 * NFC handler for address registration
 */
export class VeyNFCHandler {
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
  }

  /**
   * Check if NFC is supported
   */
  get supported(): boolean {
    return this.isSupported;
  }

  /**
   * Get NDEFReader constructor if available
   */
  private getNDEFReader(): (new () => NDEFReaderLike) | null {
    if (!this.isSupported) {
      return null;
    }
    // Safe access with proper runtime check
    const win = window as { NDEFReader?: new () => NDEFReaderLike };
    return win.NDEFReader ?? null;
  }

  /**
   * Read NFC tag
   */
  async read(): Promise<NFCRecord | null> {
    const NDEFReaderClass = this.getNDEFReader();
    if (!NDEFReaderClass) {
      throw new Error('NFC is not supported on this device');
    }

    const reader = new NDEFReaderClass();

    return new Promise((resolve, reject) => {
      reader.scan().then(() => {
        reader.onreading = (event: NDEFReadingEventLike) => {
          const record = event.message.records[0];
          if (record) {
            try {
              const decoder = new TextDecoder();
              const text = decoder.decode(record.data);
              const payload = parseQRData(text);
              if (payload) {
                resolve({
                  type: payload.type as NFCRecordType,
                  data: payload.data,
                });
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          }
        };

        reader.onreadingerror = () => {
          reject(new Error('Failed to read NFC tag'));
        };
      }).catch(reject);
    });
  }

  /**
   * Write to NFC tag
   */
  async write(record: NFCRecord): Promise<void> {
    const NDEFReaderClass = this.getNDEFReader();
    if (!NDEFReaderClass) {
      throw new Error('NFC is not supported on this device');
    }

    const writer = new NDEFReaderClass();

    const payload: QRPayload = {
      type: record.type,
      version: 1,
      data: record.data,
    };

    const data = generateQRData(payload);

    await writer.write({
      records: [{ recordType: 'text', data }],
    });
  }
}

// Type definitions for Web NFC API
interface NDEFReaderLike {
  scan(): Promise<void>;
  write(message: { records: Array<{ recordType: string; data: string }> }): Promise<void>;
  onreading: ((event: NDEFReadingEventLike) => void) | null;
  onreadingerror: (() => void) | null;
}

interface NDEFReadingEventLike {
  message: {
    records: Array<{
      data: ArrayBuffer;
    }>;
  };
}

/**
 * Create NFC handler instance
 */
export function createNFCHandler(): VeyNFCHandler {
  return new VeyNFCHandler();
}

/**
 * Generate QR code URL for use with QR code libraries
 */
export function generateQRCodeURL(payload: QRPayload): string {
  const data = generateQRData(payload);
  // This returns data that can be passed to QR code libraries
  return data;
}

// =============================================================================
// Address Auto-fill (住所入力代行) - QR/NFC経由での住所自動入力
// =============================================================================

/**
 * Auto-fill payload for address input delegation
 * 住所入力代行用のペイロード
 */
export interface AutoFillPayload {
  type: 'autofill';
  version: 1;
  data: {
    /** Unique identifier for this auto-fill request */
    autofill_id?: string;
    /** The address data to auto-fill */
    address: AddressInput;
    /** Optional label for this address (e.g., "自宅", "会社", "Home", "Office") */
    label?: string;
    /** ISO 8601 timestamp when this auto-fill was created */
    created_at: string;
    /** ISO 8601 timestamp when this auto-fill expires (optional) */
    expires_at?: string;
  };
}

/**
 * Field mapping configuration for auto-fill
 * フォームフィールドとの対応設定
 */
export interface AutoFillFieldMapping {
  /** CSS selector or field name for recipient field */
  recipient?: string;
  /** CSS selector or field name for building field */
  building?: string;
  /** CSS selector or field name for floor field */
  floor?: string;
  /** CSS selector or field name for room field */
  room?: string;
  /** CSS selector or field name for unit field */
  unit?: string;
  /** CSS selector or field name for street address field */
  street_address?: string;
  /** CSS selector or field name for district field */
  district?: string;
  /** CSS selector or field name for ward field */
  ward?: string;
  /** CSS selector or field name for city field */
  city?: string;
  /** CSS selector or field name for province/prefecture field */
  province?: string;
  /** CSS selector or field name for postal code field */
  postal_code?: string;
  /** CSS selector or field name for country field */
  country?: string;
}

/**
 * Result of auto-fill operation
 * 自動入力の結果
 */
export interface AutoFillResult {
  /** Whether the auto-fill was successful */
  success: boolean;
  /** Number of fields that were filled */
  filledCount: number;
  /** List of fields that were filled */
  filledFields: string[];
  /** List of fields that could not be filled (field not found) */
  missingFields: string[];
  /** Error message if unsuccessful */
  error?: string;
}

/**
 * Options for creating auto-fill QR/NFC data
 * 自動入力用QR/NFCデータ作成オプション
 */
export interface CreateAutoFillOptions {
  /** Unique identifier for this auto-fill */
  autofillId?: string;
  /** Label for this address */
  label?: string;
  /** Expiration time in seconds (optional) */
  expiresIn?: number;
}

/**
 * Create an auto-fill payload for QR code or NFC
 * QRコードまたはNFC用の自動入力ペイロードを作成
 *
 * @param address - The address to encode for auto-fill
 * @param options - Optional configuration
 * @returns AutoFillPayload ready to be encoded as QR or NFC
 *
 * @example
 * ```typescript
 * const address = {
 *   recipient: '山田太郎',
 *   postal_code: '100-0001',
 *   province: '東京都',
 *   city: '千代田区',
 *   street_address: '千代田1-1'
 * };
 *
 * const payload = createAutoFillPayload(address, { label: '自宅' });
 * const qrData = generateQRData(payload);
 * // Use qrData with your QR code library
 * ```
 */
export function createAutoFillPayload(
  address: AddressInput,
  options: CreateAutoFillOptions = {}
): AutoFillPayload {
  const now = new Date();
  const expiresAt = options.expiresIn
    ? new Date(now.getTime() + options.expiresIn * 1000)
    : undefined;

  return {
    type: 'autofill',
    version: 1,
    data: {
      autofill_id: options.autofillId ?? `autofill_${Date.now()}`,
      address,
      label: options.label,
      created_at: now.toISOString(),
      expires_at: expiresAt?.toISOString(),
    },
  };
}

/**
 * Create QR code data for address auto-fill
 * 住所自動入力用QRコードデータを生成
 *
 * @param address - The address to encode
 * @param options - Optional configuration
 * @returns QR code data string (vey:// protocol)
 *
 * @example
 * ```typescript
 * const qrData = createAutoFillQR({
 *   recipient: '山田太郎',
 *   postal_code: '100-0001',
 *   province: '東京都',
 *   city: '千代田区',
 *   street_address: '千代田1-1'
 * }, { label: '自宅' });
 *
 * // Use with QR code library
 * // qrcode.toCanvas(canvas, qrData);
 * ```
 */
export function createAutoFillQR(
  address: AddressInput,
  options: CreateAutoFillOptions = {}
): string {
  const payload = createAutoFillPayload(address, options);
  return generateQRData(payload);
}

/**
 * Parse auto-fill data from QR code or NFC
 * QRコードまたはNFCから自動入力データをパース
 *
 * @param data - The QR code data string
 * @returns Parsed auto-fill payload or null if invalid
 *
 * @example
 * ```typescript
 * const result = parseAutoFillData(scannedQRData);
 * if (result) {
 *   console.log('Address:', result.data.address);
 *   console.log('Label:', result.data.label);
 * }
 * ```
 */
export function parseAutoFillData(data: string): AutoFillPayload | null {
  const payload = parseQRData(data);
  if (!payload || payload.type !== 'autofill') {
    return null;
  }
  return payload as AutoFillPayload;
}

/**
 * Check if auto-fill data is expired
 * 自動入力データが期限切れかどうかを確認
 *
 * @param payload - The auto-fill payload to check
 * @returns true if expired, false otherwise
 */
export function isAutoFillExpired(payload: AutoFillPayload): boolean {
  if (!payload.data.expires_at) {
    return false;
  }
  const expiresAt = new Date(payload.data.expires_at);
  return new Date() > expiresAt;
}

/**
 * Extract address from auto-fill payload
 * 自動入力ペイロードから住所を抽出
 *
 * @param payload - The auto-fill payload
 * @returns The address data or null if expired
 */
export function extractAutoFillAddress(payload: AutoFillPayload): AddressInput | null {
  if (isAutoFillExpired(payload)) {
    return null;
  }
  return payload.data.address;
}

/**
 * Default field mapping for common form field names/IDs
 * 一般的なフォームフィールド名/IDのデフォルトマッピング
 */
export const DEFAULT_FIELD_MAPPING: AutoFillFieldMapping = {
  recipient: '[name="recipient"], [name="name"], [id="recipient"], [id="name"], [autocomplete="name"]',
  building: '[name="building"], [id="building"], [name="building_name"]',
  floor: '[name="floor"], [id="floor"]',
  room: '[name="room"], [id="room"], [name="room_number"]',
  unit: '[name="unit"], [id="unit"]',
  street_address: '[name="street_address"], [name="address"], [name="address1"], [id="street_address"], [id="address"], [autocomplete="street-address"]',
  district: '[name="district"], [id="district"]',
  ward: '[name="ward"], [id="ward"]',
  city: '[name="city"], [id="city"], [autocomplete="address-level2"]',
  province: '[name="province"], [name="prefecture"], [name="state"], [id="province"], [id="prefecture"], [id="state"], [autocomplete="address-level1"]',
  postal_code: '[name="postal_code"], [name="zip"], [name="zipcode"], [id="postal_code"], [id="zip"], [id="zipcode"], [autocomplete="postal-code"]',
  country: '[name="country"], [id="country"], [autocomplete="country"]',
};

/**
 * Auto-fill form fields with address data from QR code or NFC
 * QRコードまたはNFCから読み取った住所データでフォームを自動入力
 *
 * @param address - The address data to fill
 * @param mapping - Field mapping configuration (optional, uses defaults if not provided)
 * @param container - The container element to search for fields (optional, defaults to document)
 * @returns AutoFillResult with details about what was filled
 *
 * @example
 * ```typescript
 * // With default mapping
 * const result = autoFillForm(address);
 *
 * // With custom mapping
 * const result = autoFillForm(address, {
 *   recipient: '#customer-name',
 *   postal_code: '#zip-code',
 *   province: '#prefecture-select',
 *   city: '#city-input',
 *   street_address: '#address-line1'
 * });
 *
 * console.log(`Filled ${result.filledCount} fields`);
 * ```
 */
export function autoFillForm(
  address: AddressInput,
  mapping: AutoFillFieldMapping = DEFAULT_FIELD_MAPPING,
  container?: Element | Document
): AutoFillResult {
  const doc = container ?? (typeof document !== 'undefined' ? document : null);

  if (!doc) {
    return {
      success: false,
      filledCount: 0,
      filledFields: [],
      missingFields: Object.keys(address),
      error: 'Document is not available (server-side environment)',
    };
  }

  const filledFields: string[] = [];
  const missingFields: string[] = [];

  // Helper function to dispatch input events on form elements
  const dispatchInputEvents = (element: HTMLElement, includeInput = true): void => {
    if (includeInput) {
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    element.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // Get the field keys from the mapping, which defines all supported fields
  const mappingKeys = Object.keys(mapping) as (keyof AutoFillFieldMapping)[];

  for (const field of mappingKeys) {
    const value = address[field as keyof AddressInput];
    if (value === undefined || value === null || value === '') {
      continue;
    }

    const selector = mapping[field];
    if (!selector) {
      missingFields.push(field);
      continue;
    }

    const element = doc.querySelector(selector);
    if (!element) {
      missingFields.push(field);
      continue;
    }

    // Fill the field based on element type
    if (element instanceof HTMLInputElement) {
      element.value = value;
      dispatchInputEvents(element);
      filledFields.push(field);
    } else if (element instanceof HTMLTextAreaElement) {
      element.value = value;
      dispatchInputEvents(element);
      filledFields.push(field);
    } else if (element instanceof HTMLSelectElement) {
      // Try to find matching option
      const option = Array.from(element.options).find(
        (opt) => opt.value === value || opt.text === value
      );
      if (option) {
        element.value = option.value;
        dispatchInputEvents(element, false);
        filledFields.push(field);
      } else {
        missingFields.push(field);
      }
    } else {
      missingFields.push(field);
    }
  }

  return {
    success: filledFields.length > 0,
    filledCount: filledFields.length,
    filledFields,
    missingFields,
  };
}

/**
 * Process QR code data and auto-fill form
 * QRコードデータを処理してフォームを自動入力
 *
 * @param qrData - The scanned QR code data
 * @param mapping - Field mapping configuration (optional)
 * @param container - The container element (optional)
 * @returns AutoFillResult with details about what was filled
 *
 * @example
 * ```typescript
 * // When QR code is scanned
 * scanner.onScan((qrData) => {
 *   const result = autoFillFormFromQR(qrData);
 *   if (result.success) {
 *     showMessage(`${result.filledCount}件のフィールドを入力しました`);
 *   }
 * });
 * ```
 */
export function autoFillFormFromQR(
  qrData: string,
  mapping: AutoFillFieldMapping = DEFAULT_FIELD_MAPPING,
  container?: Element | Document
): AutoFillResult {
  const payload = parseAutoFillData(qrData);

  if (!payload) {
    // Try parsing as regular address QR
    const genericPayload = parseQRData(qrData);
    if (genericPayload?.type === 'address') {
      const addressData = (genericPayload as AddressQRPayload).data.address;
      return autoFillForm(addressData, mapping, container);
    }

    return {
      success: false,
      filledCount: 0,
      filledFields: [],
      missingFields: [],
      error: 'Invalid QR code data format',
    };
  }

  if (isAutoFillExpired(payload)) {
    return {
      success: false,
      filledCount: 0,
      filledFields: [],
      missingFields: [],
      error: 'Auto-fill data has expired',
    };
  }

  return autoFillForm(payload.data.address, mapping, container);
}

/**
 * NFC Auto-fill handler for address registration
 * NFC経由の住所自動入力ハンドラー
 */
export class VeyNFCAutoFillHandler {
  private nfcHandler: VeyNFCHandler;
  private fieldMapping: AutoFillFieldMapping;
  private container?: Element | Document;

  constructor(
    mapping: AutoFillFieldMapping = DEFAULT_FIELD_MAPPING,
    container?: Element | Document
  ) {
    this.nfcHandler = new VeyNFCHandler();
    this.fieldMapping = mapping;
    this.container = container;
  }

  /**
   * Check if NFC is supported
   */
  get supported(): boolean {
    return this.nfcHandler.supported;
  }

  /**
   * Read NFC tag and auto-fill form
   * NFCタグを読み取りフォームを自動入力
   *
   * @returns Promise resolving to AutoFillResult
   *
   * @example
   * ```typescript
   * const nfcAutoFill = new VeyNFCAutoFillHandler();
   *
   * if (nfcAutoFill.supported) {
   *   try {
   *     const result = await nfcAutoFill.readAndFill();
   *     if (result.success) {
   *       showMessage('住所を入力しました');
   *     }
   *   } catch (error) {
   *     showError('NFCの読み取りに失敗しました');
   *   }
   * }
   * ```
   */
  async readAndFill(): Promise<AutoFillResult> {
    if (!this.supported) {
      return {
        success: false,
        filledCount: 0,
        filledFields: [],
        missingFields: [],
        error: 'NFC is not supported on this device',
      };
    }

    const record = await this.nfcHandler.read();

    if (!record) {
      return {
        success: false,
        filledCount: 0,
        filledFields: [],
        missingFields: [],
        error: 'No valid address data found on NFC tag',
      };
    }

    let address: AddressInput | null = null;

    if (record.type === 'autofill') {
      const payload = record.data as AutoFillPayload['data'];
      if (payload.expires_at && new Date() > new Date(payload.expires_at)) {
        return {
          success: false,
          filledCount: 0,
          filledFields: [],
          missingFields: [],
          error: 'Auto-fill data has expired',
        };
      }
      address = payload.address as AddressInput;
    } else if (record.type === 'address') {
      address = record.data as AddressInput;
    }

    if (!address) {
      return {
        success: false,
        filledCount: 0,
        filledFields: [],
        missingFields: [],
        error: 'No address data found in NFC record',
      };
    }

    return autoFillForm(address, this.fieldMapping, this.container);
  }

  /**
   * Write address to NFC tag for auto-fill
   * NFCタグに自動入力用の住所を書き込み
   *
   * @param address - The address to write
   * @param options - Creation options
   *
   * @example
   * ```typescript
   * const nfcAutoFill = new VeyNFCAutoFillHandler();
   *
   * await nfcAutoFill.writeAddress({
   *   recipient: '山田太郎',
   *   postal_code: '100-0001',
   *   province: '東京都',
   *   city: '千代田区',
   *   street_address: '千代田1-1'
   * }, { label: '自宅' });
   * ```
   */
  async writeAddress(
    address: AddressInput,
    options: CreateAutoFillOptions = {}
  ): Promise<void> {
    if (!this.supported) {
      throw new Error('NFC is not supported on this device');
    }

    const payload = createAutoFillPayload(address, options);

    await this.nfcHandler.write({
      type: 'autofill',
      data: payload.data,
    });
  }
}

/**
 * Create NFC auto-fill handler instance
 * NFC自動入力ハンドラーのインスタンスを作成
 *
 * @param mapping - Field mapping configuration (optional)
 * @param container - Container element for form fields (optional)
 * @returns VeyNFCAutoFillHandler instance
 *
 * @example
 * ```typescript
 * const nfcAutoFill = createNFCAutoFillHandler();
 *
 * // With custom mapping
 * const nfcAutoFill = createNFCAutoFillHandler({
 *   postal_code: '#zip',
 *   province: '#prefecture',
 *   city: '#city',
 *   street_address: '#address'
 * });
 * ```
 */
export function createNFCAutoFillHandler(
  mapping?: AutoFillFieldMapping,
  container?: Element | Document
): VeyNFCAutoFillHandler {
  return new VeyNFCAutoFillHandler(mapping, container);
}
