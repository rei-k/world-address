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
  ZKPPatternType,
  ZKCircuit,
  ZKProof,
  ZKMembershipProof,
  ZKStructureProof,
  ZKSelectiveRevealProof,
  ZKVersionProof,
  ZKLockerProof,
  ZKResumeMembershipProof,
  ZKResumeSelectiveRevealProof,
  ZKResumeQualificationProof,
  ZKResumeSkillProof,
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
  // Resume/CV types
  ResumeData,
  EmploymentRecord,
  EducationRecord,
  CertificationRecord,
  SkillEntry,
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

// Territorial Restrictions
export {
  isBlockedTerritorialName,
  isBlockedLanguageForJapan,
  getTerritorialRestrictionInfo,
  validateJapaneseTerritorialInput,
  JAPANESE_TERRITORIAL_RESTRICTIONS,
} from './territorial-restrictions';
export type { TerritorialRestriction } from './territorial-restrictions';

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
  // Forward & Reverse Geocoding
  forwardGeocode,
  reverseGeocode,
  geocode,
  clearGeocodingCache,
  getGeocodingCacheStats,
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
  // 5 ZKP Patterns
  generateZKMembershipProof,
  verifyZKMembershipProof,
  generateZKStructureProof,
  verifyZKStructureProof,
  generateZKSelectiveRevealProof,
  verifyZKSelectiveRevealProof,
  generateZKVersionProof,
  verifyZKVersionProof,
  generateZKLockerProof,
  verifyZKLockerProof,
  // Resume ZKP - Verifiable Credentials
  createResumeCredential,
  createEmploymentCredential,
  createEducationCredential,
  createCertificationCredential,
  signResumeCredential,
  verifyResumeCredential,
  // Resume ZKP - 4 Patterns
  generateZKResumeMembershipProof,
  verifyZKResumeMembershipProof,
  generateZKResumeSelectiveRevealProof,
  verifyZKResumeSelectiveRevealProof,
  generateZKResumeQualificationProof,
  verifyZKResumeQualificationProof,
  generateZKResumeSkillProof,
  verifyZKResumeSkillProof,
} from './zkp';

// ZKP Cryptographic Utilities
export {
  generateEd25519KeyPair,
  signEd25519,
  verifyEd25519,
  hashSHA256,
  hashSHA512,
  buildMerkleTree,
  getMerkleRoot,
  generateMerkleProof,
  verifyMerkleProof,
  generateSecureUUID,
  generateSecureNonce,
  publicKeyToMultibase,
  generateDIDKey,
  canonicalizeJSON,
} from './zkp-crypto';

// AMF (Address Mapping Framework)
export {
  normalizeAddress,
  denormalizeAddress,
  validateNormalizedAddress,
  normalizedAddressToPIDComponents,
} from './amf';

// PID (Place ID) - Address PID functions
export {
  encodePID,
  decodePID,
  validatePID,
  createPID,
  parsePID,
  generatePIDFromAddress,
  addCollisionCounter,
  removeCollisionCounter,
  extractPIDPath,
  comparePIDHierarchy,
  isPIDParent,
  getPIDDepth,
  createWaybillPayload,
} from './pid';

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

// Gift Delivery System
export type {
  // Gift order types
  GiftOrder,
  GiftOrderStatus,
  PendingWaybill,
  GiftDeliveryCandidate,
  GiftDeliverySelection,
  CandidateCluster,
  CancellationReason,
  ExpirationRisk,
  ReminderSchedule,
  RecipientPreferences,
  TimeWindow,
  LocationSuggestion,
  ProbabilityFactors,
  Action,
  Suggestion,
} from './types';

export {
  // Gift order management
  createGiftOrder,
  getGiftOrder,
  updateGiftOrderStatus,
  // Delivery location selection
  getGiftDeliveryCandidates,
  selectDeliveryLocation,
  // AI classes
  CarrierIntentAI,
  GiftDeadlineWatchAI,
  LocationClusteringAI,
  SmartAddressSuggestionAI,
  CancelReasonAI,
  // Auto cancellation
  autoCancelExpiredGift,
} from './gift';

export type {
  // Request/Response types
  CreateGiftOrderRequest,
  CreateGiftOrderResponse,
  GetDeliveryCandidatesRequest,
  GetDeliveryCandidatesResponse,
  SelectDeliveryLocationRequest,
  SelectDeliveryLocationResponse,
} from './gift';

// Veyform - Universal Address Form System
export {
  Veyform,
  createVeyform,
  getCountryFlag,
  CONTINENTS,
} from './veyform';

export type {
  Continent,
  ContinentInfo,
  CountryOption,
  VeyformConfig,
  AnalyticsEventType,
  AnalyticsEvent,
  FieldConfig,
  FormState,
  LanguageStorageConfig,
  LanguageChangeCallback,
} from './veyform';

// Country Registry
export {
  CountryRegistry,
} from './country-registry';

export type {
  CountryMetadata,
} from './country-registry';

// Payment & Credit Card
export type {
  CreditCardBrand,
  CreditCardBrandInfo,
  PaymentMethodType,
  PaymentMethod,
  CardValidationResult,
} from './payment';

export {
  CREDIT_CARD_PATTERNS,
  detectCardBrand,
  validateLuhn,
  validateCardNumber,
  formatCardNumber,
  maskCardNumber,
  getDefaultCreditCardBrands,
} from './payment';

// Convenience functions for country information
import { CountryRegistry } from './country-registry';
export const getCountryInfo = (code: string) => CountryRegistry.getCountry(code);
export const getAllCountries = () => CountryRegistry.getAllCountries();
export const searchCountries = (query: string, language?: 'en' | 'local') => CountryRegistry.searchCountries(query, language);


