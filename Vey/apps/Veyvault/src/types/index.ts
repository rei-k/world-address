/**
 * Veyvault Application Types
 * Based on Veyvault README.md and data flow diagrams
 */

/**
 * User model - matches User Journey documentation
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  provider: 'google' | 'apple' | 'line' | 'email';
  defaultAddressId?: string; // Default address for auto-fill
  languageSettings?: LanguageSettings; // Language preferences (separate from address input)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Address model - matches Address Registration Flow
 */
export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  pid: string; // Place ID - hierarchical address identifier
  encryptedData: string; // End-to-end encrypted address data
  label?: string;
  isPrimary: boolean;
  isDefault: boolean; // Default address for hotel check-in, financial institutions, etc.
  multiLanguageData?: MultiLanguageAddress; // Address in multiple languages
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Friend model - matches Friend Management feature
 */
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendEmail?: string;
  status: 'pending' | 'accepted' | 'blocked';
  canSendTo: boolean; // Permission to use friend's address for delivery
  createdAt: Date;
}

/**
 * Address Token - ZKP-based address proof
 * Used for EC site integration without revealing raw address
 */
export interface AddressToken {
  id: string;
  addressId: string;
  userId: string;
  token: string; // ZKP proof token
  expiresAt: Date;
  createdAt: Date;
}

/**
 * OAuth authentication response
 */
export interface OAuthResponse {
  provider: 'google' | 'apple' | 'line';
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

/**
 * API client configuration
 */
export interface ApiConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Address creation request - matches Address Registration Flow
 */
export interface CreateAddressRequest {
  type: 'home' | 'work' | 'other';
  country: string;
  postalCode?: string;
  admin1?: string; // Prefecture/State
  admin2?: string; // City/District
  locality?: string;
  addressLine1: string;
  addressLine2?: string;
  buildingName?: string;
  floor?: string;
  room?: string;
  label?: string;
  isPrimary?: boolean;
  // Multi-language support
  inputLanguage?: string; // Language used for input (native, en, etc.)
  multiLanguageData?: MultiLanguageAddress; // Pre-translated versions
  autoTranslate?: boolean; // Auto-translate to other languages
  translationTargets?: string[]; // Languages to translate to
}

/**
 * Address creation response
 */
export interface CreateAddressResponse {
  address: Address;
  pid: string;
  validation: {
    isValid: boolean;
    warnings?: string[];
  };
}

/**
 * Friend invitation via QR/NFC
 */
export interface FriendInvitation {
  inviterId: string;
  inviterName: string;
  qrCode: string; // QR code data
  nfcData?: string; // NFC tag data
  expiresAt: Date;
}

/**
 * Delivery tracking info
 */
export interface DeliveryTracking {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tracking event
 */
export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: Date;
}

/**
 * Veyform-enabled Site model
 * Represents a site that has integrated Veyform for address collection
 */
export interface VeyformSite {
  id: string;
  name: string;
  description: string;
  category: string;
  location?: {
    country: string;
    city?: string;
    address?: string;
  };
  logoUrl?: string;
  websiteUrl: string;
  veyformIntegrationStatus: 'active' | 'inactive';
  supportedServices: string[]; // e.g., ['shopping', 'booking', 'delivery']
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Site search request
 */
export interface SiteSearchRequest {
  query?: string;
  category?: string;
  location?: string;
  country?: string;
  services?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Site search response
 */
export interface SiteSearchResponse {
  sites: VeyformSite[];
  total: number;
  hasMore: boolean;
}

/**
 * Site access authorization
 * Tracks which sites have been granted access to user's address
 */
export interface SiteAccess {
  id: string;
  userId: string;
  siteId: string;
  siteName: string;
  addressId: string; // Which address is shared with this site
  grantedAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
  permissions: SiteAccessPermission[];
}

/**
 * Site access permissions
 */
export interface SiteAccessPermission {
  type: 'read_address' | 'use_for_delivery' | 'use_for_billing';
  granted: boolean;
  grantedAt: Date;
}

/**
 * Site access revocation request
 */
export interface RevokeAccessRequest {
  siteId: string;
  reason?: string;
}

/**
 * Site access history entry
 */
export interface SiteAccessHistory {
  id: string;
  siteAccessId: string;
  siteId: string;
  siteName: string;
  action: 'granted' | 'used' | 'revoked';
  details?: string;
  timestamp: Date;
}

/**
 * Waybill (Shipping Label) model
 * Represents a shipping label created for delivery
 */
export interface Waybill {
  id: string;
  userId: string;
  senderId: string; // User's own address ID
  receiverId: string; // Friend's address ID or own address ID
  senderType: 'self' | 'friend';
  receiverType: 'self' | 'friend';
  senderAddress?: Address; // Full address if self, null if friend (ZKP)
  receiverAddress?: Address; // Full address if self, null if friend (ZKP)
  senderZkpToken?: string; // ZKP token for friend's address
  receiverZkpToken?: string; // ZKP token for friend's address
  qrCode: string; // QR code for VeyPOS scanning
  status: 'draft' | 'pending' | 'submitted';
  carrierId?: string;
  trackingNumber?: string;
  packageInfo?: {
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    description?: string;
    value?: number;
    currency?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Carrier model
 * Represents a delivery carrier/service
 */
export interface Carrier {
  id: string;
  name: string;
  code: string; // e.g., 'ups', 'fedex', 'dhl', 'yamato'
  logoUrl?: string;
  supportedCountries: string[];
  services: CarrierService[];
  apiEnabled: boolean;
}

/**
 * Carrier service
 */
export interface CarrierService {
  id: string;
  name: string;
  type: 'standard' | 'express' | 'overnight' | 'economy';
  estimatedDays: number;
  price?: {
    amount: number;
    currency: string;
  };
}

/**
 * Delivery request
 * Request to carrier for pickup/delivery
 */
export interface DeliveryRequest {
  id: string;
  userId: string;
  waybillId: string;
  carrierId: string;
  carrierServiceId: string;
  status: 'new' | 'accepted' | 'in_transit' | 'delivered' | 'failed';
  trackingNumber?: string;
  pickupScheduled?: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  cost?: {
    amount: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wallet pass
 * Google Wallet / Apple Wallet pass for waybill
 */
export interface WalletPass {
  id: string;
  waybillId: string;
  userId: string;
  type: 'google' | 'apple';
  passUrl: string;
  passData: string; // JSON data for the pass
  qrCode: string;
  expiresAt?: Date;
  createdAt: Date;
}

/**
 * Create waybill request
 */
export interface CreateWaybillRequest {
  senderId: string;
  receiverId: string;
  senderType: 'self' | 'friend';
  receiverType: 'self' | 'friend';
  packageInfo?: {
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    description?: string;
    value?: number;
    currency?: string;
  };
}

/**
 * Submit delivery request
 */
export interface SubmitDeliveryRequest {
  waybillId: string;
  carrierId: string;
  carrierServiceId: string;
  pickupDate?: Date;
}

/**
 * Delivery history filter
 */
export interface DeliveryHistoryFilter {
  status?: 'new' | 'in_transit' | 'delivered' | 'failed';
  startDate?: Date;
  endDate?: Date;
  carrierId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Notification types for address registration and updates
 */
export interface Notification {
  id: string;
  userId: string;
  type: 'address_registered' | 'address_updated' | 'address_deleted' | 'qr_scanned' | 'barcode_scanned';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Barcode format options
 */
export type BarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13' | 'UPC' | 'ITF14' | 'QR';

/**
 * Barcode display options
 */
export interface BarcodeOptions {
  format: BarcodeFormat;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
}

/**
 * Default address auto-fill data
 */
export interface AutoFillData {
  name: string;
  phone: string;
  address: Address;
}

/**
 * User profile update request
 */
export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  defaultAddressId?: string;
  languageSettings?: LanguageSettings;
}

/**
 * Language settings for Veyvault
 * Separate from address input language
 */
export interface LanguageSettings {
  // App UI language
  appLanguage: string;
  
  // Preferred languages for address input (in order of preference)
  addressInputLanguages: string[];
  
  // Preferred language for labels and placeholders
  labelLanguage: string;
  
  // Enable auto-translation for address fields
  enableAutoTranslation: boolean;
  
  // Languages to auto-translate addresses to
  translationTargets: string[];
  
  // Country-specific language overrides
  countryLanguageOverrides?: Record<string, string>;
}

/**
 * Multi-language address data
 * Stores address in multiple languages
 */
export interface MultiLanguageAddress {
  // Address in original/native language
  native: {
    language: string;
    addressLine1: string;
    addressLine2?: string;
    locality?: string;
    admin1?: string;
    admin2?: string;
  };
  
  // English translation
  english?: {
    addressLine1: string;
    addressLine2?: string;
    locality?: string;
    admin1?: string;
    admin2?: string;
  };
  
  // Additional translations
  translations?: Array<{
    language: string;
    addressLine1: string;
    addressLine2?: string;
    locality?: string;
    admin1?: string;
    admin2?: string;
  }>;
  
  // Delivery-supported languages for this address
  deliveryLanguages?: string[];
}

/**
 * Language preference for address input
 */
export interface AddressLanguagePreference {
  country: string;
  preferredInputLanguage: string;
  enabledLanguages: string[]; // Native, English, and delivery languages
  autoTranslate: boolean;
}

/**
 * Translation result for address fields
 */
export interface AddressTranslationResult {
  originalLanguage: string;
  targetLanguage: string;
  fields: Record<string, string>;
  confidence: number;
}
