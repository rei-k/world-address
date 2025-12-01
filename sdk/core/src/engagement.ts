/**
 * @vey/core - UX & Customer Engagement Types
 *
 * Types for UX/customer features:
 * - LINE/WhatsApp notifications
 * - Digital receipts
 * - Member/repeater features
 * - Duplicate shipment creation
 * - Digital signage (idle screen)
 */

import type { AddressInput } from './types';
import type { PaymentResult, ShippingLabelData } from './hardware';
import type { RateQuote, DeliveryLocation } from './logistics';

// ============================================================================
// Messaging & Notifications
// ============================================================================

/**
 * Notification channel types
 */
export type NotificationChannel = 'line' | 'whatsapp' | 'sms' | 'email' | 'push';

/**
 * Notification event types
 */
export type NotificationEventType =
  | 'shipment.created'
  | 'shipment.label_printed'
  | 'shipment.picked_up'
  | 'shipment.in_transit'
  | 'shipment.out_for_delivery'
  | 'shipment.delivered'
  | 'shipment.exception'
  | 'payment.completed'
  | 'payment.failed'
  | 'pickup.scheduled'
  | 'pickup.reminder'
  | 'member.welcome'
  | 'member.points_earned'
  | 'promo.campaign';

/**
 * Notification recipient
 */
export interface NotificationRecipient {
  /** Recipient ID (phone, email, LINE ID, etc.) */
  id: string;
  /** Channel type */
  channel: NotificationChannel;
  /** Recipient name */
  name?: string;
  /** Language preference */
  language?: string;
}

/**
 * Notification content
 */
export interface NotificationContent {
  /** Message title (for push/email) */
  title?: string;
  /** Message body */
  body: string;
  /** Image URL */
  imageUrl?: string;
  /** Action buttons */
  actions?: Array<{
    label: string;
    url?: string;
    action?: string;
  }>;
  /** Template ID (for pre-defined templates) */
  templateId?: string;
  /** Template variables */
  templateVars?: Record<string, string>;
}

/**
 * Notification request
 */
export interface NotificationRequest {
  /** Event type */
  event: NotificationEventType;
  /** Recipients */
  recipients: NotificationRecipient[];
  /** Content */
  content: NotificationContent;
  /** Related data */
  data?: {
    trackingNumber?: string;
    shipmentId?: string;
    orderId?: string;
    [key: string]: unknown;
  };
  /** Schedule send time */
  scheduledAt?: string;
  /** Priority */
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Notification result
 */
export interface NotificationResult {
  /** Notification ID */
  id: string;
  /** Status */
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  /** Channel */
  channel: NotificationChannel;
  /** Recipient ID */
  recipientId: string;
  /** Sent timestamp */
  sentAt?: string;
  /** Delivered timestamp */
  deliveredAt?: string;
  /** Read timestamp */
  readAt?: string;
  /** Error message */
  error?: string;
}

/**
 * Notification response
 */
export interface NotificationResponse {
  /** Whether sending was successful */
  success: boolean;
  /** Results per recipient */
  results: NotificationResult[];
  /** Error message if completely failed */
  error?: string;
}

/**
 * LINE messaging configuration
 */
export interface LINEConfig {
  /** Channel access token */
  channelAccessToken: string;
  /** Channel secret */
  channelSecret: string;
  /** Rich menu ID for shipping status */
  richMenuId?: string;
}

/**
 * WhatsApp messaging configuration
 */
export interface WhatsAppConfig {
  /** Business account ID */
  accountId: string;
  /** Access token */
  accessToken: string;
  /** Phone number ID */
  phoneNumberId: string;
}

// ============================================================================
// Digital Receipts
// ============================================================================

/**
 * Receipt item
 */
export interface ReceiptItem {
  /** Item name */
  name: string;
  /** Quantity */
  quantity: number;
  /** Unit price */
  unitPrice: number;
  /** Total price */
  totalPrice: number;
  /** Tax rate applied */
  taxRate?: number;
  /** Tax amount */
  taxAmount?: number;
  /** Category */
  category?: string;
  /** SKU */
  sku?: string;
}

/**
 * Receipt tax breakdown
 */
export interface ReceiptTaxBreakdown {
  /** Tax rate */
  rate: number;
  /** Tax name */
  name: string;
  /** Taxable amount */
  taxableAmount: number;
  /** Tax amount */
  taxAmount: number;
}

/**
 * Digital receipt
 */
export interface DigitalReceipt {
  /** Receipt ID */
  id: string;
  /** Receipt number */
  receiptNumber: string;
  /** Business info */
  business: {
    name: string;
    address: AddressInput;
    phone?: string;
    taxId?: string;
    registrationNumber?: string;
    logoUrl?: string;
  };
  /** Customer info */
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    memberId?: string;
  };
  /** Items */
  items: ReceiptItem[];
  /** Subtotal */
  subtotal: number;
  /** Tax breakdown */
  taxBreakdown: ReceiptTaxBreakdown[];
  /** Total tax */
  totalTax: number;
  /** Discount applied */
  discount?: {
    type: 'percent' | 'fixed';
    value: number;
    amount: number;
    code?: string;
  };
  /** Total amount */
  total: number;
  /** Payment info */
  payment: {
    method: string;
    amount: number;
    reference?: string;
    cardLast4?: string;
  };
  /** Change given (for cash) */
  change?: number;
  /** Points earned */
  pointsEarned?: number;
  /** Points redeemed */
  pointsRedeemed?: number;
  /** Date and time */
  dateTime: string;
  /** Staff info */
  staff?: {
    id: string;
    name: string;
  };
  /** Terminal ID */
  terminalId?: string;
  /** QR code for verification */
  qrCode?: string;
  /** Related shipment */
  shipmentInfo?: {
    trackingNumber: string;
    carrier: string;
    service: string;
  };
  /** Notes */
  notes?: string;
}

/**
 * Receipt format options
 */
export interface ReceiptFormatOptions {
  /** Output format */
  format: 'html' | 'pdf' | 'json' | 'text';
  /** Paper width (for text format) */
  paperWidth?: '58mm' | '80mm';
  /** Include QR code */
  includeQRCode?: boolean;
  /** Include barcode */
  includeBarcode?: boolean;
  /** Language */
  language?: string;
  /** Custom template */
  templateId?: string;
}

/**
 * Receipt delivery options
 */
export interface ReceiptDeliveryOptions {
  /** Email address */
  email?: string;
  /** SMS number */
  sms?: string;
  /** LINE ID */
  lineId?: string;
  /** Show QR for scan */
  showQRCode?: boolean;
  /** Print paper receipt also */
  printPaper?: boolean;
}

/**
 * Digital receipt response
 */
export interface DigitalReceiptResponse {
  /** Receipt data */
  receipt: DigitalReceipt;
  /** HTML content (if format is html) */
  htmlContent?: string;
  /** PDF data (base64, if format is pdf) */
  pdfData?: string;
  /** QR code data URL */
  qrCodeDataUrl?: string;
  /** Delivery results */
  deliveryResults?: {
    email?: { sent: boolean; error?: string };
    sms?: { sent: boolean; error?: string };
    line?: { sent: boolean; error?: string };
  };
}

// ============================================================================
// Member/Repeater Features
// ============================================================================

/**
 * Member tier levels
 */
export type MemberTier = 'standard' | 'silver' | 'gold' | 'platinum' | 'vip';

/**
 * Member profile
 */
export interface MemberProfile {
  /** Member ID */
  id: string;
  /** Email */
  email?: string;
  /** Phone */
  phone?: string;
  /** Name */
  name: string;
  /** Tier */
  tier: MemberTier;
  /** Points balance */
  points: number;
  /** Lifetime points earned */
  lifetimePoints: number;
  /** Member since */
  memberSince: string;
  /** Preferred language */
  preferredLanguage?: string;
  /** Preferred currency */
  preferredCurrency?: string;
  /** Notification preferences */
  notificationPreferences?: {
    channel: NotificationChannel;
    enabled: boolean;
    events: NotificationEventType[];
  }[];
}

/**
 * Saved address in address book
 */
export interface SavedAddress {
  /** Address ID */
  id: string;
  /** Label (e.g., "Home", "Office", "Mom's House") */
  label: string;
  /** Address */
  address: AddressInput;
  /** Recipient name */
  recipientName: string;
  /** Phone */
  phone?: string;
  /** Email */
  email?: string;
  /** Is default */
  isDefault?: boolean;
  /** Usage count */
  usageCount: number;
  /** Last used */
  lastUsed?: string;
  /** Notes */
  notes?: string;
}

/**
 * Address book
 */
export interface AddressBook {
  /** Owner member ID */
  memberId: string;
  /** Addresses */
  addresses: SavedAddress[];
  /** Total count */
  totalCount: number;
  /** Groups/categories */
  groups?: Array<{
    name: string;
    addressIds: string[];
  }>;
}

/**
 * Shipment history entry
 */
export interface ShipmentHistoryEntry {
  /** Shipment ID */
  id: string;
  /** Tracking number */
  trackingNumber: string;
  /** Created date */
  createdAt: string;
  /** Origin */
  origin: AddressInput;
  /** Destination */
  destination: AddressInput;
  /** Carrier */
  carrier: string;
  /** Service */
  service: string;
  /** Status */
  status: string;
  /** Cost */
  cost: {
    amount: number;
    currency: string;
  };
  /** Points earned */
  pointsEarned?: number;
  /** Can duplicate */
  canDuplicate: boolean;
  /** Label data for reprint */
  labelData?: string;
}

/**
 * Member dashboard data
 */
export interface MemberDashboard {
  /** Profile */
  profile: MemberProfile;
  /** Recent shipments */
  recentShipments: ShipmentHistoryEntry[];
  /** Frequently used addresses */
  frequentAddresses: SavedAddress[];
  /** Points summary */
  pointsSummary: {
    current: number;
    expiringSoon: number;
    expiringDate?: string;
    nextTierPoints?: number;
    nextTier?: MemberTier;
  };
  /** Promotions */
  promotions?: Array<{
    id: string;
    title: string;
    description: string;
    validUntil: string;
    code?: string;
  }>;
}

// ============================================================================
// Duplicate Shipment ("Same as Before")
// ============================================================================

/**
 * Duplicate shipment request
 */
export interface DuplicateShipmentRequest {
  /** Original shipment ID or tracking number */
  originalId: string;
  /** Override fields */
  overrides?: {
    shipDate?: string;
    service?: string;
    weight?: { value: number; unit: string };
    reference?: string;
  };
  /** Recalculate rate */
  recalculateRate?: boolean;
}

/**
 * Duplicate shipment response
 */
export interface DuplicateShipmentResponse {
  /** Whether duplication was successful */
  success: boolean;
  /** New shipment data (pre-filled) */
  shipmentData?: {
    origin: AddressInput;
    destination: AddressInput;
    carrier: string;
    service: string;
    weight: { value: number; unit: string };
    dimensions?: { length: number; width: number; height: number; unit: string };
    reference?: string;
  };
  /** New rate quote */
  rateQuote?: RateQuote;
  /** Changes from original */
  changes?: string[];
  /** Warnings */
  warnings?: string[];
  /** Error message if failed */
  error?: string;
}

/**
 * QR code for shipment duplication
 */
export interface ShipmentQRData {
  /** Type */
  type: 'shipment_duplicate';
  /** Version */
  version: 1;
  /** Shipment ID */
  shipmentId: string;
  /** Expiration */
  expiresAt?: string;
  /** Checksum */
  checksum: string;
}

// ============================================================================
// Digital Signage
// ============================================================================

/**
 * Signage content types
 */
export type SignageContentType =
  | 'video'
  | 'image'
  | 'html'
  | 'promo'
  | 'weather'
  | 'news'
  | 'queue_status'
  | 'service_info';

/**
 * Signage content item
 */
export interface SignageContent {
  /** Content ID */
  id: string;
  /** Content type */
  type: SignageContentType;
  /** Title */
  title?: string;
  /** Media URL (for video/image) */
  mediaUrl?: string;
  /** HTML content */
  htmlContent?: string;
  /** Duration in seconds */
  duration: number;
  /** Transition effect */
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
  /** Priority (higher = more frequent) */
  priority?: number;
  /** Valid from */
  validFrom?: string;
  /** Valid until */
  validUntil?: string;
  /** Target audience */
  targetAudience?: 'all' | 'members' | 'first_time';
  /** Click action */
  clickAction?: {
    type: 'url' | 'qr' | 'start_flow';
    value: string;
  };
}

/**
 * Signage playlist
 */
export interface SignagePlaylist {
  /** Playlist ID */
  id: string;
  /** Playlist name */
  name: string;
  /** Content items */
  items: SignageContent[];
  /** Loop */
  loop: boolean;
  /** Schedule */
  schedule?: {
    days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
    startTime: string;
    endTime: string;
  };
  /** Idle timeout (seconds before showing signage) */
  idleTimeout: number;
}

/**
 * Signage configuration
 */
export interface SignageConfig {
  /** Current playlist ID */
  currentPlaylistId: string;
  /** Playlists */
  playlists: SignagePlaylist[];
  /** Default idle timeout */
  defaultIdleTimeout: number;
  /** Show clock */
  showClock: boolean;
  /** Show weather */
  showWeather: boolean;
  /** Weather location */
  weatherLocation?: string;
  /** Mute audio */
  muteAudio: boolean;
  /** Brightness (0-100) */
  brightness: number;
}

/**
 * Signage event handlers
 */
export interface SignageEventHandlers {
  onIdleStart?: () => void;
  onIdleEnd?: () => void;
  onContentChange?: (content: SignageContent) => void;
  onInteraction?: (contentId: string) => void;
}

// ============================================================================
// Customer Engagement Service
// ============================================================================

/**
 * Customer engagement service configuration
 */
export interface CustomerEngagementConfig {
  /** LINE configuration */
  line?: LINEConfig;
  /** WhatsApp configuration */
  whatsApp?: WhatsAppConfig;
  /** Default notification channel */
  defaultChannel?: NotificationChannel;
  /** Member program enabled */
  memberProgramEnabled?: boolean;
  /** Points per currency unit */
  pointsPerUnit?: number;
  /** Signage enabled */
  signageEnabled?: boolean;
}

/**
 * Customer engagement service interface
 */
export interface CustomerEngagementService {
  /** Send notification */
  sendNotification(request: NotificationRequest): Promise<NotificationResponse>;
  
  /** Generate digital receipt */
  generateReceipt(
    receipt: Omit<DigitalReceipt, 'id' | 'receiptNumber' | 'qrCode'>,
    options?: ReceiptFormatOptions
  ): Promise<DigitalReceiptResponse>;
  
  /** Deliver receipt to customer */
  deliverReceipt(
    receiptId: string,
    options: ReceiptDeliveryOptions
  ): Promise<{ success: boolean; error?: string }>;
  
  /** Get member profile */
  getMemberProfile(memberId: string): Promise<MemberProfile | null>;
  
  /** Get member dashboard */
  getMemberDashboard(memberId: string): Promise<MemberDashboard>;
  
  /** Get address book */
  getAddressBook(memberId: string): Promise<AddressBook>;
  
  /** Save address to address book */
  saveAddress(memberId: string, address: Omit<SavedAddress, 'id' | 'usageCount'>): Promise<SavedAddress>;
  
  /** Delete address from address book */
  deleteAddress(memberId: string, addressId: string): Promise<{ success: boolean }>;
  
  /** Get shipment history */
  getShipmentHistory(memberId: string, options?: {
    limit?: number;
    offset?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ shipments: ShipmentHistoryEntry[]; total: number }>;
  
  /** Duplicate shipment */
  duplicateShipment(request: DuplicateShipmentRequest): Promise<DuplicateShipmentResponse>;
  
  /** Generate shipment QR code */
  generateShipmentQR(shipmentId: string): Promise<{ qrDataUrl: string; data: ShipmentQRData }>;
  
  /** Parse shipment QR code */
  parseShipmentQR(qrData: string): ShipmentQRData | null;
  
  /** Get signage configuration */
  getSignageConfig(): Promise<SignageConfig>;
  
  /** Update signage playlist */
  updateSignagePlaylist(playlistId: string, items: SignageContent[]): Promise<{ success: boolean }>;
  
  /** Add/update points */
  addPoints(memberId: string, points: number, reason: string): Promise<{ newBalance: number }>;
  
  /** Redeem points */
  redeemPoints(memberId: string, points: number, forWhat: string): Promise<{ success: boolean; newBalance: number; error?: string }>;
}
