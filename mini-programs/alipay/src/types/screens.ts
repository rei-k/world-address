/**
 * Alipay Mini Program - Screen Type Definitions
 * 
 * このファイルは、Alipay Mini Programの全画面で使用される型定義を含みます。
 */

// ==================== Home Screen ====================

export interface HomeScreenState {
  searchQuery: string;
  recentAddresses: AddressSubmissionHistory[];
  quickActions: QuickAction[];
  scanMode: 'QR' | 'NFC' | null;
}

export interface AddressSubmissionHistory {
  pid: string;
  friendName: string;
  lastUsed: Date;
  frequency: number;
  tags: string[];
}

export interface QuickAction {
  type: 'NEW_GIFT' | 'SET_PICKUP' | 'TRACK_GIFTS';
  label: string;
  icon: string;
  route: string;
}

// ==================== Cloud Address Search ====================

export interface CloudAddressSearchState {
  filters: AddressSearchFilters;
  results: FriendAddress[];
  selectedAddress: FriendAddress | null;
  clusters: AddressCluster[];
}

export interface AddressSearchFilters {
  country?: string;
  region?: string;
  name?: string;
  tags?: string[];
}

export interface FriendAddress {
  pid: string;
  friendId: string;
  friendName: string;
  displayName: string; // 表示用の簡略名（詳細は非表示）
  tags: string[];
  lastUsed?: Date;
  verified: boolean; // PID検証済みフラグ
}

export interface AddressCluster {
  clusterId: string;
  centerPID: string;
  addresses: FriendAddress[];
  region: string;
  usageFrequency: number;
}

// ==================== Payment Select ====================

export interface PaymentSelectState {
  tokens: PaymentToken[];
  selectedToken: PaymentToken | null;
  recommendedToken: PaymentToken | null; // 住所に紐づく推薦
  sesameCreditScore?: number;
}

export interface PaymentToken {
  tokenId: string;
  type: 'ALIPAY_BALANCE' | 'BANK_CARD' | 'CREDIT_CARD';
  lastFourDigits?: string;
  expiryDate?: string;
  isDefault: boolean;
  linkedAddressPID?: string; // 住所との紐付け
  usageFrequency: number;
  displayName: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  timestamp: Date;
  submissionRights: SubmissionRightsPackage;
}

// ==================== Gift Setting (Pending) ====================

export interface GiftSettingState {
  giftId: string;
  recipientPID: string;
  deadline: Date;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  shareOptions: ShareOption[];
  selectedPickupLocation?: string;
}

export interface ShareOption {
  type: 'URL' | 'QR' | 'NFC' | 'WECHAT' | 'SMS' | 'EMAIL';
  data: string;
  generatedAt: Date;
}

export interface PendingGiftLink {
  linkId: string;
  giftId: string;
  expiryDate: Date;
  submissionRights: string; // 署名付き提出権
  usageId: string; // 用途ID
  deepLink: string;
  // 住所実データは含まない
}

// ==================== Waybill Preview ====================

export interface WaybillPreviewState {
  waybillNumber: string;
  nonce: string; // 一意性保証
  hash: string; // 追跡用ハッシュ
  carrier: CarrierInfo;
  status: WaybillStatus;
  qrCode: string;
  shipmentDetails: ShipmentDetails;
}

export interface CarrierInfo {
  carrierId: 'DHL' | 'SF_EXPRESS' | 'JD_LOGISTICS' | 'YTO_EXPRESS' | 'ZTO_EXPRESS' | string;
  name: string;
  trackingUrl: string;
  compatibilityVerified: boolean; // AI検証済み
  estimatedDelivery?: Date;
}

export interface WaybillStatus {
  current: 'PENDING' | 'READY' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  timeline: StatusEvent[];
}

export interface StatusEvent {
  status: string;
  timestamp: Date;
  location?: string;
  description: string;
}

export interface ShipmentDetails {
  senderName: string; // 送信者名のみ
  recipientPID: string; // 受取者PID（住所は非表示）
  destination: 'PENDING' | string; // Pending or 確定後の簡略表示
  items: ShipmentItem[];
}

export interface ShipmentItem {
  name: string;
  quantity: number;
  weight: number;
}

// ==================== Gift Tracker ====================

export interface GiftTrackerState {
  sentGifts: GiftTrackingInfo[];
  receivedGifts: GiftTrackingInfo[];
  completedGifts: GiftTrackingInfo[];
  filter: GiftFilter;
}

export interface GiftTrackingInfo {
  giftId: string;
  recipientName: string; // 受取者名のみ
  recipientPID: string; // PIDのみ、住所は非表示
  status: GiftStatus;
  deadline?: Date;
  timeline: GiftEvent[];
  submissionRights: SubmissionRightsStatus;
}

export interface GiftStatus {
  current: 'PENDING_PICKUP' | 'PICKUP_CONFIRMED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'EXPIRED';
  updatedAt: Date;
}

export interface GiftEvent {
  eventType: 'CREATED' | 'SHARED' | 'PICKUP_SET' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REVOKED';
  timestamp: Date;
  description: string;
  reason?: string; // キャンセル理由など
}

export interface SubmissionRightsStatus {
  active: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  partnerId: string;
  permissions: string[];
}

export interface GiftFilter {
  status?: GiftStatus['current'];
  dateRange?: { start: Date; end: Date };
  recipient?: string;
}

// ==================== Permissions ====================

export interface PermissionsState {
  activePermissions: SubmissionPermission[];
  revokedPermissions: SubmissionPermission[];
  filter: PermissionFilter;
}

export interface SubmissionPermission {
  permissionId: string;
  partnerId: string;
  partnerName: string;
  partnerType: 'EC_SITE' | 'HOTEL' | 'DELIVERY' | 'FINANCIAL' | 'OTHER';
  addressPID: string; // PIDのみ
  paymentTokenId?: string;
  grantedAt: Date;
  expiryDate?: Date;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  revokedAt?: Date;
  permissions: PermissionType[];
  usageCount: number;
  lastUsedAt?: Date;
}

export interface PermissionType {
  type: 'READ_PID' | 'VALIDATE_SHIPMENT' | 'GENERATE_WAYBILL' | 'PAYMENT_PROCESS';
  granted: boolean;
}

export interface PermissionFilter {
  status?: SubmissionPermission['status'];
  partnerType?: SubmissionPermission['partnerType'];
  dateRange?: { start: Date; end: Date };
}

export interface RevocationResult {
  success: boolean;
  permissionId: string;
  revokedAt: Date;
  cacheInvalidated: boolean; // キャッシュ失効確認
  indexRemoved: boolean; // インデックス排除確認
  preventResubmission: boolean; // 再提出防止確認
}

// ==================== Settings ====================

export interface SettingsState {
  defaults: DefaultSettings;
  scan: ScanSettings;
  wallet: WalletIntegration;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

export interface DefaultSettings {
  country: string;
  language: string;
  preferredCarriers: CarrierPriority[];
  defaultPaymentToken?: string;
}

export interface CarrierPriority {
  carrierId: string;
  priority: number; // 1が最優先
}

export interface ScanSettings {
  preferredMode: 'CAMERA' | 'NFC' | 'AUTO';
  autoExecute: boolean;
  qrCodeQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  nfcEnabled: boolean;
}

export interface WalletIntegration {
  googleWallet: WalletConnection;
  appleWallet: WalletConnection;
  autoImport: boolean;
  syncEnabled: boolean;
}

export interface WalletConnection {
  enabled: boolean;
  connected: boolean;
  lastSync?: Date;
}

export interface NotificationSettings {
  giftDeadline: boolean;
  deliveryStatus: boolean;
  permissionRevocation: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  autoLockDuration: number; // 秒
  requireAuthForPayment: boolean;
  requireAuthForRevocation: boolean;
}

// ==================== Common Types ====================

export interface SubmissionRightsPackage {
  rightId: string; // 一意の提出権ID
  addressPID: string; // 友達住所のPID
  orderId: string; // EC注文ID
  partnerId: string; // ECサイトID
  signature: string; // 署名
  usageId: string; // 用途ID（この注文のみ有効）
  expiryDate: Date; // 有効期限
  permissions: PermissionType[];
  // 生住所データは含まれない
}

export interface ScanPayload {
  version: string; // "1.0"
  type: 'GIFT_RECEIPT' | 'ADDRESS_SHARE' | 'TRACKING';
  linkId: string; // ギフトリンクID
  signature: string; // 署名（改ざん防止）
  usageId: string; // 用途ID（この取引専用）
  expiryDate: string; // ISO 8601形式
  deepLink: string; // "alipay://gift/pending/{linkId}"
}

export interface VeyWalletLaunch {
  orderId: string;
  ecSite: {
    name: string;
    partnerId: string;
  };
  items: OrderItem[];
  totalAmount: number;
  currency: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  weight?: number;
}

// ==================== UX Flow Types ====================

export interface DeadlineExpiredFlow {
  giftId: string;
  steps: {
    orderCancellation: boolean;
    paymentRefund: boolean;
    submissionRightsRevocation: boolean;
    indexExclusion: boolean;
    cacheInvalidation: boolean;
    notificationToSender: boolean;
  };
}

export interface PickupConfirmed {
  giftId: string;
  selectedPickupPID: string; // 友達が選んだ受取場所のPID
  confirmedAt: Date;
}

export interface PendingWaybill {
  waybillNumber: string;
  nonce: string; // 一意性保証
  hash: string; // 追跡用ハッシュ
  status: 'PENDING'; // 受取場所未確定
  recipientPID: string;
  destination: 'PENDING'; // まだ確定していない
  carrier: CarrierInfo; // AI互換判定済み
  submissionRights: SubmissionRightsPackage;
  createdAt: Date;
  expiryDate: Date; // 友達が選択する期限
}

export interface FinalWaybill {
  waybillNumber: string;
  nonce: string;
  hash: string;
  status: 'READY_FOR_SHIPMENT'; // 配送準備完了
  recipientPID: string; // 友達が選んだ受取場所
  destination: string; // 確定した受取場所（簡略表示）
  carrier: CarrierInfo;
  submittedToCarrier: boolean;
  submittedAt: Date;
  trackingUrl: string;
}

// ==================== AI Types ====================

export interface CarrierCompatibilityCheck {
  addressPID: string;
  carrier: CarrierInfo;
  compatible: boolean;
  reason?: string;
  checks: {
    regionSupported: boolean;
    weightLimit: boolean;
    prohibitedItems: boolean;
    deliveryDays: number;
  };
}

export interface LocationFilter {
  addressPID: string;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  filters: {
    deliverable: boolean;
    estimatedDistance: number;
    accessRestrictions: string[];
  };
}

export interface PaymentCompatibility {
  paymentToken: PaymentToken;
  carrier: CarrierInfo;
  compatible: boolean;
  supportedMethods: string[];
}

// ==================== Revocation Types ====================

export interface RevocationProcess {
  permissionId: string;
  revokedAt: Date;
  steps: {
    cacheInvalidation: RevocationStep;
    indexRemoval: RevocationStep;
    submissionKeyInvalidation: RevocationStep;
    webhookNotification: RevocationStep;
  };
  searchExclusion: {
    partnerSites: string[];
    permanentBlock: boolean;
  };
}

export interface RevocationStep {
  action: string;
  target: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp?: Date;
}

export interface CacheInvalidation {
  cacheKeys: string[];
  action: 'DELETE';
  targets: {
    redis: {
      keys: string[];
      invalidated: boolean;
    };
  };
}

export interface IndexRemoval {
  indexName: 'addresses' | 'permissions';
  documentId: string;
  action: 'DELETE';
  targets: {
    elasticsearch: {
      indices: string[];
      removed: boolean;
    };
  };
}

export interface SubmissionKeyInvalidation {
  permissionId: string;
  submissionRights: SubmissionRightsPackage;
  invalidation: {
    database: {
      status: 'REVOKED';
      revokedAt: Date;
      preventResubmission: boolean;
    };
    webhooks: {
      notifyPartner: boolean;
      partnerMustInvalidate: boolean;
    };
  };
}
