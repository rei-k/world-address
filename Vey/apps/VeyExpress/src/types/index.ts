/**
 * VeyExpress Core Types
 * Comprehensive type definitions for the VeyExpress platform
 */

// ============================================================================
// Address & Location Types (254 Countries Support)
// ============================================================================

export interface Address {
  pid?: string; // Hierarchical Address ID
  country: string; // ISO 3166-1 alpha-2
  administrativeArea?: string; // State/Province
  locality?: string; // City
  dependentLocality?: string; // District
  postalCode?: string;
  sortingCode?: string;
  addressLine1: string;
  addressLine2?: string;
  organization?: string;
  recipient: string;
  phone?: string;
  email?: string;
  coordinates?: GeoCoordinates;
  localLanguage?: LocalizedAddress;
}

export interface LocalizedAddress {
  language: string; // ISO 639-1
  addressLine1: string;
  addressLine2?: string;
  locality?: string;
  administrativeArea?: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // meters
}

export interface PID {
  id: string;
  hierarchy: string[]; // Country > Admin > Locality > etc.
  version: string;
  createdAt: Date;
}

// ============================================================================
// Delivery & Tracking Types
// ============================================================================

export interface DeliveryOrder {
  orderId: string;
  trackingNumber?: string;
  waybillNumber?: string;
  status: DeliveryStatus;
  origin: Address;
  destination: Address;
  carrier: Carrier;
  service: ServiceLevel;
  package: Package;
  timeline: DeliveryTimeline;
  metadata: DeliveryMetadata;
}

export enum DeliveryStatus {
  CREATED = 'created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
  FAILED = 'failed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export interface DeliveryTimeline {
  createdAt: Date;
  estimatedPickup?: Date;
  pickedUpAt?: Date;
  estimatedDelivery: Date;
  deliveredAt?: Date;
  events: DeliveryEvent[];
}

export interface DeliveryEvent {
  timestamp: Date;
  status: DeliveryStatus;
  location?: GeoCoordinates;
  description: string;
  facility?: string;
}

export interface DeliveryMetadata {
  insuranceValue?: number;
  insuranceId?: string;
  customsDeclaration?: CustomsDeclaration;
  signature?: string;
  photoProof?: string;
  recipientNotes?: string;
  riskScore?: RiskScore;
}

// ============================================================================
// Carrier & Service Types
// ============================================================================

export interface Carrier {
  id: string;
  name: string;
  code: string;
  type: CarrierType;
  country: string;
  services: ServiceLevel[];
  capabilities: CarrierCapabilities;
  apiEndpoint?: string;
  apiKey?: string;
}

export enum CarrierType {
  POSTAL = 'postal',
  EXPRESS = 'express',
  FREIGHT = 'freight',
  THREE_PL = '3pl',
  FOUR_PL = '4pl',
  SEA = 'sea',
  RAIL = 'rail',
  AIR = 'air',
}

export interface ServiceLevel {
  id: string;
  name: string;
  deliveryDays: number;
  price: Money;
  features: string[];
}

export interface CarrierCapabilities {
  tracking: boolean;
  proofOfDelivery: boolean;
  signatureRequired: boolean;
  insurance: boolean;
  internationalShipping: boolean;
  pickupPoints: boolean;
  lockers: boolean;
}

// ============================================================================
// Package Types
// ============================================================================

export interface Package {
  weight: Weight;
  dimensions: Dimensions;
  contents: PackageContent[];
  value: Money;
  dangerous?: boolean;
  fragile?: boolean;
  perishable?: boolean;
}

export interface Weight {
  value: number;
  unit: 'kg' | 'lb' | 'oz' | 'g';
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in' | 'm';
}

export interface PackageContent {
  description: string;
  quantity: number;
  value: Money;
  hsCode?: string; // Harmonized System code for customs
  originCountry?: string;
}

export interface Money {
  amount: number;
  currency: string; // ISO 4217
}

// ============================================================================
// Customs & Cross-Border Types
// ============================================================================

export interface CustomsDeclaration {
  declarationType: 'gift' | 'merchandise' | 'documents' | 'returned_goods' | 'other';
  contentType: string;
  totalValue: Money;
  items: CustomsItem[];
  invoiceNumber?: string;
  exportLicense?: string;
}

export interface CustomsItem {
  description: string;
  quantity: number;
  unitValue: Money;
  hsCode: string;
  originCountry: string;
  weight: Weight;
}

export interface CustomsCalculation {
  duties: Money;
  taxes: Money;
  fees: Money;
  total: Money;
  breakdown: CustomsFee[];
}

export interface CustomsFee {
  type: string;
  description: string;
  amount: Money;
}

// ============================================================================
// API Types
// ============================================================================

export interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: APIMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface APIMetadata {
  requestId: string;
  timestamp: Date;
  version: string;
  rateLimit?: RateLimit;
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: Date;
}

// ============================================================================
// Risk & AI Prediction Types
// ============================================================================

export interface RiskScore {
  overall: number; // 0-100
  accident: number;
  delay: number;
  theft: number;
  loss: number;
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskFactor {
  type: string;
  impact: number; // -100 to 100
  description: string;
}

export interface RouteOptimization {
  originalRoute: Route;
  optimizedRoute: Route;
  savings: Money;
  timeSaved: number; // minutes
  carbonReduced: number; // kg CO2
}

export interface Route {
  stops: RouteStop[];
  distance: number; // km
  duration: number; // minutes
  carrier: Carrier;
  mode: CarrierType;
}

export interface RouteStop {
  sequence: number;
  location: GeoCoordinates;
  address: Address;
  arrivalTime: Date;
  departureTime: Date;
  type: 'pickup' | 'delivery' | 'hub' | 'customs';
}

// ============================================================================
// Integration Types (EC/ERP/OMS/WMS/TMS/DMS)
// ============================================================================

export interface Integration {
  id: string;
  type: IntegrationType;
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  credentials?: IntegrationCredentials;
  lastSync?: Date;
  config: IntegrationConfig;
}

export enum IntegrationType {
  EC = 'ec', // E-Commerce
  ERP = 'erp', // Enterprise Resource Planning
  OMS = 'oms', // Order Management System
  WMS = 'wms', // Warehouse Management System
  TMS = 'tms', // Transportation Management System
  DMS = 'dms', // Distribution Management System
}

export interface IntegrationCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  shopUrl?: string;
}

export interface IntegrationConfig {
  autoSync: boolean;
  syncInterval?: number; // minutes
  webhookUrl?: string;
  mappings?: Record<string, string>;
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface DashboardSummary {
  totalDeliveries: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  returned: number;
  insured: number;
  integrations: IntegrationStatus[];
  worldMap: MapData;
}

export interface IntegrationStatus {
  type: IntegrationType;
  connected: boolean;
  lastSync?: Date;
  errorCount: number;
}

export interface MapData {
  deliveries: MapDelivery[];
  heatmap?: HeatmapPoint[];
}

export interface MapDelivery {
  orderId: string;
  origin: GeoCoordinates;
  destination: GeoCoordinates;
  status: DeliveryStatus;
  currentLocation?: GeoCoordinates;
}

export interface HeatmapPoint {
  location: GeoCoordinates;
  intensity: number;
}

// ============================================================================
// Warehouse & Logistics Types
// ============================================================================

export interface Warehouse {
  id: string;
  name: string;
  address: Address;
  capacity: number;
  currentStock: number;
  zones: WarehouseZone[];
  operations: WarehouseOperation[];
}

export interface WarehouseZone {
  id: string;
  name: string;
  type: 'receiving' | 'storage' | 'picking' | 'packing' | 'shipping';
  capacity: number;
  currentOccupancy: number;
}

export interface WarehouseOperation {
  id: string;
  type: 'receive' | 'store' | 'pick' | 'pack' | 'ship' | 'transfer';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  timestamp: Date;
  items: InventoryItem[];
}

export interface InventoryItem {
  sku: string;
  name: string;
  quantity: number;
  location?: string;
  value: Money;
}

// ============================================================================
// Insurance Types
// ============================================================================

export interface Insurance {
  id: string;
  policyNumber: string;
  orderId: string;
  coverage: Money;
  premium: Money;
  provider: string;
  status: 'active' | 'claimed' | 'expired' | 'cancelled';
  validFrom: Date;
  validTo: Date;
}

export interface InsuranceClaim {
  id: string;
  insuranceId: string;
  orderId: string;
  amount: Money;
  reason: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  submittedAt: Date;
  resolvedAt?: Date;
  documents: string[];
}

// ============================================================================
// Hardware & QR/NFC Types
// ============================================================================

export interface QRCode {
  id: string;
  type: 'enterprise' | 'store' | 'facility' | 'personal' | 'branch';
  data: string;
  url: string;
  createdAt: Date;
  expiresAt?: Date;
  usageCount: number;
}

export interface NFCTag {
  id: string;
  uid: string;
  type: string;
  data: Record<string, any>;
  linkedEntity?: string;
  createdAt: Date;
}

export interface SmartHardware {
  id: string;
  type: 'sorter' | 'ocr' | 'terminal' | 'scanner' | 'printer';
  status: 'online' | 'offline' | 'maintenance';
  location: string;
  lastActivity?: Date;
}

// ============================================================================
// Recipient & Pickup Types
// ============================================================================

export interface RecipientPreference {
  userId: string;
  preferredDeliveryTime?: TimeWindow[];
  preferredLocation?: 'home' | 'locker' | 'store' | 'office';
  alternativeRecipients?: AlternativeRecipient[];
  notifications: NotificationPreference[];
}

export interface TimeWindow {
  dayOfWeek?: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface AlternativeRecipient {
  name: string;
  phone: string;
  relationship: string;
  address?: Address;
}

export interface NotificationPreference {
  channel: 'email' | 'sms' | 'push' | 'webhook';
  enabled: boolean;
  events: string[];
  contact: string;
}

export interface PickupPoint {
  id: string;
  type: 'locker' | 'store' | 'post_office' | 'convenience_store';
  name: string;
  address: Address;
  hours: OperatingHours[];
  capacity: number;
  available: boolean;
}

export interface OperatingHours {
  dayOfWeek: number; // 0-6
  open: string; // HH:mm
  close: string; // HH:mm
}

// ============================================================================
// Security & Compliance Types
// ============================================================================

export interface AccessControl {
  userId: string;
  role: 'admin' | 'operator' | 'viewer' | 'api';
  permissions: Permission[];
  dataAccess: DataAccessLevel;
  expiresAt?: Date;
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'admin')[];
}

export enum DataAccessLevel {
  FULL = 'full',
  PII_RESTRICTED = 'pii_restricted',
  ANONYMIZED = 'anonymized',
  METADATA_ONLY = 'metadata_only',
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: any;
  ipAddress?: string;
  encrypted: boolean;
}

export interface ComplianceRecord {
  id: string;
  type: 'gdpr' | 'ccpa' | 'other';
  dataSubject: string;
  request: 'access' | 'delete' | 'export' | 'rectify';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  submittedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// SDK & Plugin Types
// ============================================================================

export interface SDKConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  version: string;
  options?: SDKOptions;
}

export interface SDKOptions {
  timeout?: number;
  retries?: number;
  logging?: boolean;
  autoAddressValidation?: boolean;
  defaultCarrier?: string;
}

export interface PluginConfig {
  platform: 'shopify' | 'woocommerce' | 'magento' | 'custom';
  credentials: Record<string, string>;
  webhooks?: WebhookConfig[];
  features: PluginFeature[];
}

export interface WebhookConfig {
  event: string;
  url: string;
  secret?: string;
}

export interface PluginFeature {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

// ============================================================================
// Revenue & Monetization Types
// ============================================================================

export interface AdSlot {
  id: string;
  type: 'banner' | 'native' | 'sponsored';
  position: string;
  targetAudience?: string[];
  impressions: number;
  clicks: number;
  revenue: Money;
}

export interface AffiliateCommission {
  id: string;
  type: 'carrier' | 'insurance' | 'service';
  orderId: string;
  amount: Money;
  rate: number; // percentage
  status: 'pending' | 'approved' | 'paid';
  paidAt?: Date;
}

export interface QRTemplate {
  id: string;
  name: string;
  type: 'enterprise' | 'store' | 'facility';
  design: string;
  price: Money;
  purchases: number;
}
