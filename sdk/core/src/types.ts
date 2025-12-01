/**
 * @vey/core - Core types and interfaces for World Address SDK
 */

/** Language information for address representation */
export interface Language {
  name: string;
  script: string;
  direction: 'ltr' | 'rtl';
  role: 'official' | 'auxiliary' | 'shipping_required';
  required_for_shipping?: boolean;
  country_name?: string;
}

/** Local name variant */
export interface LocalName {
  lang: string;
  value: string;
  script: string;
  direction: 'ltr' | 'rtl';
}

/** ISO country codes */
export interface IsoCodes {
  alpha2: string;
  alpha3?: string;
  numeric?: string;
}

/** Address field definition */
export interface AddressField {
  required: boolean;
  example?: string;
  label_local?: string;
  label_en?: string;
  regex?: string;
  length?: number;
  description?: string;
  type?: string;
  count?: number;
  since?: number;
  value?: string;
}

/** Address format order variant */
export interface OrderVariant {
  context: 'domestic' | 'international' | 'postal';
  order: string[];
}

/** Address format definition */
export interface AddressFormat {
  order?: string[];
  order_variants?: OrderVariant[];
  recipient?: AddressField;
  building?: AddressField;
  floor?: AddressField;
  room?: AddressField;
  unit?: AddressField;
  street_address?: AddressField;
  district?: AddressField;
  ward?: AddressField;
  city?: AddressField;
  province?: AddressField;
  postal_code?: AddressField;
  country?: AddressField;
}

/** Administrative division level */
export interface AdministrativeDivision {
  type: string;
  label_local?: string;
  label_en?: string;
  count?: number;
  required?: boolean;
  source?: string;
}

/** Administrative divisions structure */
export interface AdministrativeDivisions {
  level1?: AdministrativeDivision;
  level2?: AdministrativeDivision;
  level3?: AdministrativeDivision;
}

/** Validation rules */
export interface Validation {
  allow_latin_transliteration?: boolean;
  postal_code_rules?: {
    general?: string;
    exceptions?: string;
  };
  fallback?: string;
  rules?: string[];
}

/** Address examples */
export interface AddressExamples {
  domestic_raw?: string;
  domestic_normalized?: string;
  international?: string;
}

/** Country status */
export interface CountryStatus {
  un_member?: boolean;
  recognized?: boolean;
  disputed?: boolean;
}

/** Complete country address format */
export interface CountryAddressFormat {
  name: {
    en: string;
    local?: LocalName[];
  };
  iso_codes: IsoCodes;
  continent?: string;
  subregion?: string;
  languages: Language[];
  administrative_divisions?: AdministrativeDivisions;
  address_format: AddressFormat;
  validation?: Validation;
  examples?: AddressExamples;
  status?: CountryStatus;
}

/** Address input for validation */
export interface AddressInput {
  recipient?: string;
  building?: string;
  floor?: string;
  room?: string;
  unit?: string;
  street_address?: string;
  district?: string;
  ward?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  normalized?: AddressInput;
}

/** Validation error */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

/** Validation warning */
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

/** SDK Configuration */
export interface VeyConfig {
  apiKey?: string;
  environment?: 'sandbox' | 'production';
  language?: string;
  dataPath?: string;
}

/** Webhook event types */
export type WebhookEventType = 
  | 'address.created'
  | 'address.updated'
  | 'address.deleted'
  | 'address.verified'
  | 'delivery.started'
  | 'delivery.completed'
  | 'delivery.failed';

/** Webhook payload */
export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
  signature?: string;
}

/** Region hierarchy for hierarchical picker */
export interface RegionHierarchy {
  continent: string;
  countries: {
    code: string;
    name: string;
    provinces?: {
      code: string;
      name: string;
      cities?: {
        code?: string;
        name: string;
        districts?: {
          code?: string;
          name: string;
        }[];
      }[];
    }[];
  }[];
}

/**
 * Address PID (Place ID) Components
 * 
 * Hierarchical ID structure: <Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
 * Example: JP-13-113-01-T07-B12-BN02-R342
 */
export interface PIDComponents {
  /** ISO 3166-1 alpha-2 country code (e.g., 'JP') */
  country: string;
  /** First administrative level code (e.g., '13' for Tokyo) */
  admin1?: string;
  /** Second administrative level code (e.g., '113' for Shibuya) */
  admin2?: string;
  /** Locality code (e.g., '01') */
  locality?: string;
  /** Sublocality code (e.g., 'T07' for 7-chome) */
  sublocality?: string;
  /** Block code (e.g., 'B12' for block 12) */
  block?: string;
  /** Building code (e.g., 'BN02' for building 02) */
  building?: string;
  /** Unit/room code (e.g., 'R342' for room 342) */
  unit?: string;
  /** Collision counter suffix (e.g., 'C01' for first collision) */
  collision?: string;
}

/**
 * Address PID representation
 * 
 * PID serves as:
 * 1. Unique identifier for world addresses
 * 2. Lossless key to address hierarchy DAG
 * 3. ZK proof input for address validity verification
 * 4. Shipping routing code compatible with WMS/TMS/Carrier
 */
export interface AddressPID {
  /** Full PID string (e.g., 'JP-13-113-01-T07-B12-BN02-R342') */
  pid: string;
  /** Parsed PID components */
  components: PIDComponents;
  /** Whether this PID has been validated */
  validated?: boolean;
}

/** PID validation result */
export interface PIDValidationResult {
  /** Whether the PID is valid */
  valid: boolean;
  /** Validation errors */
  errors: PIDValidationError[];
  /** Parsed components if valid */
  components?: PIDComponents;
}

/** PID validation error */
export interface PIDValidationError {
  /** Component that caused the error */
  component: keyof PIDComponents | 'format';
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
}

/** PID encoding options */
export interface PIDEncodingOptions {
  /** Collision counter to append (1-99) */
  collisionCounter?: number;
}

/** Normalized address input for PID generation */
export interface NormalizedAddress {
  /** ISO 3166-1 alpha-2 country code */
  countryCode: string;
  /** First administrative division (e.g., prefecture, state) */
  admin1?: string;
  /** Second administrative division (e.g., city, ward) */
  admin2?: string;
  /** Locality/neighborhood */
  locality?: string;
  /** Sublocality (e.g., town, chome) */
  sublocality?: string;
  /** Block/street number */
  block?: string;
  /** Building name/number */
  building?: string;
  /** Unit/room number */
  unit?: string;
}

/**
 * Waybill with PID (shipping label payload)
 * 
 * Example QR payload structure for shipping labels
 */
export interface WaybillPayload {
  /** Waybill ID */
  waybill_id: string;
  /** Address PID */
  addr_pid: string;
  /** Parcel weight in kg */
  parcel_weight?: number;
  /** Parcel size code */
  parcel_size?: string;
  /** Carrier zone */
  carrier_zone?: string;
  /** ZK proof blob */
  zkp?: string;
  /** BLS signature */
  sig?: string;
}

// ============================================================================
// Geo-coordinates (緯度経度) Types
// ============================================================================

/**
 * Source of geo-coordinates
 * 緯度経度の取得元
 */
export type GeoSource =
  | 'gps'           // GPS device
  | 'geocoder'      // Geocoding service
  | 'manual'        // Manual entry
  | 'database'      // Address database
  | 'device'        // Device location API
  | 'unknown';      // Unknown source

/**
 * Geographic coordinates with accuracy information
 * 緯度経度と精度情報
 * 
 * Used for:
 * 1. Address relationship mapping (住所との関係性)
 * 2. Address verification/insurance (緯度経度を保険とする技術)
 * 3. Fallback address resolution
 */
export interface GeoCoordinates {
  /** Latitude in decimal degrees (-90 to 90) / 緯度 */
  latitude: number;
  /** Longitude in decimal degrees (-180 to 180) / 経度 */
  longitude: number;
  /** Accuracy radius in meters (optional) / 精度（メートル） */
  accuracy?: number;
  /** Altitude in meters (optional) / 高度（メートル） */
  altitude?: number;
  /** Source of the coordinates / 取得元 */
  source?: GeoSource;
  /** Timestamp when coordinates were captured / 取得日時 */
  capturedAt?: string;
}

/**
 * Geo-bounds for area representation
 * 地理的境界（範囲表現用）
 */
export interface GeoBounds {
  /** Northeast corner / 北東端 */
  northeast: {
    latitude: number;
    longitude: number;
  };
  /** Southwest corner / 南西端 */
  southwest: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Address with geo-coordinates relationship
 * 住所と緯度経度の関係性
 * 
 * This type represents the mapping between an address and its geographic location,
 * enabling the "insurance" (保険) feature where coordinates serve as a fallback
 * verification mechanism.
 */
export interface GeoAddress {
  /** Primary address PID */
  pid: string;
  /** Geographic center point / 中心座標 */
  center: GeoCoordinates;
  /** Geographic bounds of the address area / 住所範囲 */
  bounds?: GeoBounds;
  /** Verification status / 検証状態 */
  verified?: boolean;
  /** Last verified timestamp / 最終検証日時 */
  verifiedAt?: string;
}

/**
 * Geo-verification result
 * 緯度経度を用いた住所検証結果（保険機能）
 */
export interface GeoVerificationResult {
  /** Whether the coordinates match the address / 座標と住所の一致 */
  valid: boolean;
  /** Confidence score (0-1) / 信頼度スコア */
  confidence: number;
  /** Distance from expected location in meters / 期待位置からの距離 */
  distance: number;
  /** Whether within acceptable tolerance / 許容範囲内か */
  withinTolerance: boolean;
  /** Suggested PID if coordinates indicate different address / 候補PID */
  suggestedPid?: string;
  /** Verification method used / 検証方法 */
  method: 'bounds' | 'center' | 'reverse_geocode';
}

/**
 * Geocoding request
 * ジオコーディングリクエスト
 */
export interface GeocodingRequest {
  /** Address input for forward geocoding */
  address?: AddressInput;
  /** PID for PID-based geocoding */
  pid?: string;
  /** Coordinates for reverse geocoding */
  coordinates?: GeoCoordinates;
  /** Preferred language for results */
  language?: string;
}

/**
 * Geocoding result
 * ジオコーディング結果
 */
export interface GeocodingResult {
  /** Success status */
  success: boolean;
  /** Resolved coordinates (for forward geocoding) */
  coordinates?: GeoCoordinates;
  /** Resolved address (for reverse geocoding) */
  address?: AddressInput;
  /** Resolved PID */
  pid?: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Alternative results */
  alternatives?: Array<{
    coordinates?: GeoCoordinates;
    address?: AddressInput;
    pid?: string;
    confidence: number;
  }>;
  /** Error message if failed */
  error?: string;
}

/**
 * Geo-insurance configuration
 * 緯度経度保険設定
 * 
 * Configuration for using coordinates as address verification fallback
 */
export interface GeoInsuranceConfig {
  /** Enable geo-insurance feature / 緯度経度保険を有効化 */
  enabled: boolean;
  /** Maximum acceptable distance in meters / 最大許容距離（メートル） */
  toleranceMeters: number;
  /** Minimum confidence threshold (0-1) / 最小信頼度閾値 */
  minConfidence: number;
  /** Whether to auto-correct address based on coordinates / 座標に基づく住所自動補正 */
  autoCorrect: boolean;
  /** Fallback behavior when address verification fails */
  fallbackBehavior: 'reject' | 'warn' | 'accept_with_flag';
}
