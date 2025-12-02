/**
 * @vey/core - World Address SDK Core
 *
 * Universal address format handling, validation, and formatting
 * With AI/Automation, POS Hardware, Logistics, and System features
 */

// Core Types
export type {
  Language,
  LocalName,
  IsoCodes,
  AddressField,
  OrderVariant,
  AddressFormat,
  AdministrativeDivision,
  AdministrativeDivisions,
  Validation,
  AddressExamples,
  CountryStatus,
  CountryAddressFormat,
  AddressInput,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  VeyConfig,
  WebhookEventType,
  WebhookPayload,
  RegionHierarchy,
  // PID types
  PIDComponents,
  AddressPID,
  PIDValidationResult,
  PIDValidationError,
  PIDEncodingOptions,
  NormalizedAddress,
  WaybillPayload,
  // Geo-coordinates types (緯度経度)
  GeoSource,
  GeoCoordinates,
  GeoBounds,
  GeoAddress,
  GeoVerificationResult,
  GeocodingRequest,
  GeocodingResult,
  GeoInsuranceConfig,
  // ZKP (Zero-Knowledge Proof) types
  DIDMethod,
  DIDDocument,
  VerificationMethod,
  ServiceEndpoint,
  VCType,
  VerifiableCredential,
  CredentialSubject,
  Proof,
  ZKProofType,
  ZKCircuit,
  ZKProof,
  ZKProofVerificationResult,
  ShippingCondition,
  ShippingValidationRequest,
  ShippingValidationResponse,
  AddressProvider,
  RevocationEntry,
  RevocationList,
  AccessControlPolicy,
  PIDResolutionRequest,
  PIDResolutionResponse,
  AuditLogEntry,
  TrackingEvent,
  ZKPWaybill,
  // Translation types
  TranslationService,
  TranslationServiceConfig,
  TranslationRequest,
  TranslationResult,
} from './types';

// Client
export { VeyClient, createVeyClient } from './client';

// Validator
export {
  validateAddress,
  getRequiredFields,
  getFieldOrder,
} from './validator';

// Formatter
export {
  formatAddress,
  formatShippingLabel,
  getPostalCodeExample,
  getPostalCodeRegex,
} from './formatter';
export type { FormatOptions } from './formatter';

// Loader
export { createDataLoader, dataLoader } from './loader';
export type { DataLoaderConfig } from './loader';

// Geocoding (緯度経度関連機能)
export {
  // Coordinate validation
  validateCoordinates,
  isWithinBounds,
  // Distance calculation
  calculateDistance,
  getBoundsCenter,
  // Geo-insurance (緯度経度を保険とする技術)
  defaultGeoInsuranceConfig,
  verifyAddressWithGeo,
  findBestMatchingAddress,
  // Coordinate formatting
  formatCoordinates,
  parseCoordinates,
  convertCoordinateFormat,
  // Geo-address creation
  createGeoAddress,
  createBoundsFromRadius,
} from './geocode';

// ZKP (Zero-Knowledge Proof) Address Protocol
export {
  // Flow 1: Address Registration & Authentication
  createDIDDocument,
  createAddressPIDCredential,
  signCredential,
  verifyCredential,
  // Flow 2: Shipping Request & Waybill Generation
  createZKCircuit,
  generateZKProof,
  verifyZKProof,
  validateShippingRequest,
  createZKPWaybill,
  // Flow 3: Delivery Execution & Tracking
  validateAccessPolicy,
  resolvePID,
  createAuditLogEntry,
  createTrackingEvent,
  // Flow 4: Address Update & Revocation
  createRevocationEntry,
  createRevocationList,
  isPIDRevoked,
  getNewPID,
  signRevocationList,
  // Address Provider Management
  createAddressProvider,
  validateProviderSignature,
} from './zkp';

// AMF (Address Mapping Framework)
export {
  normalizeAddress,
  denormalizeAddress,
  validateNormalizedAddress,
  normalizedAddressToPIDComponents,
} from './amf';

// Crypto (End-to-end encryption)
export {
  encryptAddress,
  decryptAddress,
  signData,
  verifySignature,
  generateKey,
  hashData,
} from './crypto';
export type { EncryptionResult } from './crypto';

// Address Client (Cloud Address Book)
export {
  AddressClient,
  createAddressClient,
} from './address-client';
export type {
  AddressClientConfig,
  AuthCredentials,
} from './address-client';

// Friends & QR Management
export {
  generateFriendQR,
  generateAddressQR,
  scanFriendQR,
  scanAddressQR,
  verifyFriendPID,
  createFriendFromQR,
  generateId,
} from './friends';
export type {
  FriendQRPayload,
  AddressQRPayload,
  FriendEntry,
} from './friends';

// Translation
export {
  translate,
  batchTranslate,
  clearTranslationCache,
  getTranslationCacheStats,
} from './translation';

// Logistics & Shipping
export type {
  // Core carrier types
  CarrierCode,
  ServiceLevel,
  CarrierService,
  // Rate comparison
  PackageInfo,
  RateQuoteRequest,
  RateBreakdown,
  RateQuote,
  RateComparisonResponse,
  // ETA prediction
  PredictionFactors,
  DeliveryPrediction,
  ETAPredictionRequest,
  ETAPredictionResponse,
  // Multi-piece shipments
  ShipmentPiece,
  MultiPieceShipment,
  MultiPieceRequest,
  MultiPieceResponse,
  // Pickup scheduling
  PickupWindow,
  PickupRequest,
  PickupConfirmation,
  PickupResponse,
  // Carbon offset
  CarbonOffsetRequest,
  CarbonOffsetResult,
  CarbonOffsetResponse,
  // Alternative delivery
  DeliveryLocationType,
  DeliveryLocation,
  AlternativeLocationRequest,
  AlternativeLocationResponse,
  DeliveryPreference,
  // Logistics service
  LogisticsConfig,
  LogisticsService,
  // Community Logistics (コミュニティ物流)
  ConsolidatedParticipant,
  ConsolidatedShippingGroup,
  ConsolidatedShippingRequest,
  JoinConsolidatedRequest,
  ConsolidatedShippingResponse,
  TravelerProfile,
  CrowdsourcedRoute,
  CrowdsourcedDeliveryRequest,
  CrowdsourcedMatch,
  CrowdsourcedDeliveryResponse,
  // Social Commerce (Daigou 2.0)
  SocialCommerceProduct,
  SocialBuyerCatalog,
  SocialCommerceOrder,
  InventoryItem,
  InventoryUpdateRequest,
  InventoryShipmentRequest,
  InventoryShipmentResponse,
  // Digital Handshake Logistics
  DigitalHandshakeToken,
  DigitalHandshakeEvent,
  DigitalHandshakeRequest,
  DigitalHandshakeResponse,
  HandoverScanRequest,
  HandoverScanResponse,
  // China-specific carriers
  SFExpressConfig,
  JDLogisticsConfig,
  ChinaAddressStandardizationRequest,
  ChinaAddressStandardizationResponse,
  // Extended logistics service
  CommunityLogisticsService,
} from './logistics';


