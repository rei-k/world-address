/**
 * @vey/core - Extended AI Types and Interfaces
 *
 * Types for 10 extended AI capabilities:
 * 1. Atlas Routing AI - Address hierarchy and geo-relationship understanding, optimal route format conversion
 * 2. GAP Oracle - Cloud address index priority determination AI
 * 3. Schema Resolve AI - Country/territory address format grammar learning AI
 * 4. Noise Block AI - Low-relevance address/invalid site filtering AI
 * 5. Ledger Link AI - Address-linked payment token/contract/reservation auto-linking AI
 * 6. Fraud Radar AI - Fraudulent address lookup/payment link/mass access detection AI
 * 7. Edge Normalize AI - Abbreviation/variation/multilingual address normalization AI
 * 8. Checkout Cast AI - Partner EC/booking site checkout/reservation UI extraction AI
 * 9. Revocation Sense AI - Revocation intent prediction and suggestion AI
 * 10. Context Locale AI - Country/language/currency/service-based address filtering AI
 */

import type { AddressInput } from './types';

// ============================================================================
// 1. Atlas Routing AI
// ============================================================================

/**
 * Delivery system types for route optimization
 */
export type DeliverySystemType = 'wms' | 'tms' | 'last_mile' | 'drone' | 'autonomous';

/**
 * Route optimization request
 */
export interface RouteOptimizationRequest {
  /** Address PID to optimize */
  addressPID: string;
  /** Target delivery system */
  systemType: DeliverySystemType;
  /** Delivery time window */
  timeWindow?: {
    start: string;
    end: string;
  };
  /** Package information */
  package?: {
    weight: number;
    dimensions: { width: number; height: number; depth: number };
    fragile: boolean;
  };
  /** Constraints */
  constraints?: {
    maxDistance?: number;
    avoidTolls?: boolean;
    preferredCarrier?: string;
  };
}

/**
 * WMS (Warehouse Management System) format
 */
export interface WMSFormat {
  /** Sorting zone */
  sortingZone: string;
  /** Shelf location */
  shelfLocation: string;
  /** Delivery priority */
  deliveryPriority: 'express' | 'standard' | 'economy';
  /** Batch number */
  batchNumber?: string;
}

/**
 * TMS (Transportation Management System) format
 */
export interface TMSFormat {
  /** Route segment */
  routeSegment: string;
  /** Estimated delivery time */
  estimatedTime: string;
  /** Vehicle type */
  vehicleType: 'truck' | 'van' | 'bike' | 'walk';
  /** Route waypoints */
  waypoints?: Array<{ lat: number; lon: number; order: number }>;
}

/**
 * Last mile delivery format
 */
export interface LastMileFormat {
  /** Delivery sequence */
  sequence: number;
  /** GPS coordinates */
  coordinates: { lat: number; lon: number };
  /** Access instructions */
  accessInstructions: string;
  /** Preferred delivery time */
  preferredTime?: string;
  /** Contact method */
  contactMethod?: 'call' | 'text' | 'doorbell' | 'leave_at_door';
}

/**
 * Route optimization response
 */
export interface RouteOptimizationResponse {
  /** Success status */
  success: boolean;
  /** Original address PID */
  addressPID: string;
  /** Optimized formats by system type */
  formats: {
    wms?: WMSFormat;
    tms?: TMSFormat;
    lastMile?: LastMileFormat;
  };
  /** Estimated delivery time */
  estimatedDeliveryTime?: string;
  /** Route efficiency score (0-1) */
  efficiencyScore: number;
  /** Alternative routes */
  alternatives?: Array<{
    format: any;
    score: number;
    reason: string;
  }>;
  /** Error message if failed */
  error?: string;
}

/**
 * Booking system integration request
 */
export interface BookingSystemRequest {
  /** Address PID */
  addressPID: string;
  /** Booking type */
  bookingType: 'hotel' | 'restaurant' | 'event' | 'appointment';
  /** Check-in/reservation time */
  reservationTime: string;
  /** Number of guests/attendees */
  partySize?: number;
  /** Special requests */
  specialRequests?: string[];
}

/**
 * Booking system response
 */
export interface BookingSystemResponse {
  /** Success status */
  success: boolean;
  /** Access instructions */
  accessInstructions: {
    /** Recommended transportation */
    transportation: Array<{
      method: 'walk' | 'train' | 'bus' | 'car' | 'taxi';
      duration: number;
      cost?: number;
      instructions: string;
    }>;
    /** Nearby landmarks */
    landmarks?: string[];
    /** Parking availability */
    parking?: {
      available: boolean;
      type: 'street' | 'lot' | 'garage';
      cost?: number;
    };
  };
  /** Multilingual directions */
  directions?: Record<string, string>;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// 2. GAP Oracle
// ============================================================================

/**
 * User context for priority determination
 */
export interface UserContext {
  /** Current location */
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    country?: string;
  };
  /** Timestamp */
  timestamp: string;
  /** Time of day */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  /** Day of week */
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  /** Device type */
  deviceType: 'mobile' | 'tablet' | 'desktop';
  /** Service category */
  serviceCategory?: 'ecommerce' | 'booking' | 'finance' | 'delivery' | 'other';
  /** User state */
  userState?: 'home' | 'work' | 'moving' | 'traveling';
}

/**
 * Address priority score
 */
export interface AddressPriorityScore {
  /** Address PID */
  addressPID: string;
  /** Overall score (0-1) */
  score: number;
  /** Score components */
  components: {
    proximityScore: number;
    timeRelevanceScore: number;
    usageFrequencyScore: number;
    serviceCompatibilityScore: number;
    recencyScore: number;
    defaultScore: number;
  };
  /** Reasons for score */
  reasons: string[];
  /** Confidence level */
  confidence: number;
}

/**
 * Priority determination request
 */
export interface PriorityDeterminationRequest {
  /** User context */
  context: UserContext;
  /** Candidate address PIDs */
  candidateAddresses: string[];
  /** Maximum results to return */
  maxResults?: number;
  /** Include explanations */
  includeExplanations?: boolean;
}

/**
 * Priority determination response
 */
export interface PriorityDeterminationResponse {
  /** Success status */
  success: boolean;
  /** Ranked addresses with scores */
  rankedAddresses: AddressPriorityScore[];
  /** Predicted next address */
  predictedNextAddress?: string;
  /** Context interpretation */
  contextInterpretation?: {
    detectedScenario: string;
    confidence: number;
  };
  /** Error message if failed */
  error?: string;
}

/**
 * Payment token priority score
 */
export interface PaymentTokenPriorityScore {
  /** Token ID */
  tokenId: string;
  /** Score (0-1) */
  score: number;
  /** Reasons */
  reasons: string[];
  /** Compatibility with address */
  addressCompatibility: number;
  /** Expected success rate */
  successRate: number;
}

// ============================================================================
// 3. Schema Resolve AI
// ============================================================================

/**
 * Address format grammar
 */
export interface AddressFormatGrammar {
  /** Country code */
  countryCode: string;
  /** Field order */
  fieldOrder: string[];
  /** Required fields */
  requiredFields: string[];
  /** Optional fields */
  optionalFields: string[];
  /** Field separators */
  separators: {
    betweenFields: string;
    withinField?: string;
  };
  /** Postal code format */
  postalCodeFormat?: {
    pattern: string;
    example: string;
    position: number;
  };
  /** Administrative hierarchy */
  hierarchyDepth: number;
  /** Hierarchy labels */
  hierarchyLabels: string[];
}

/**
 * Schema resolution request
 */
export interface SchemaResolutionRequest {
  /** Raw address text */
  rawAddress: string;
  /** Country hint (optional) */
  countryHint?: string;
  /** Language hint (optional) */
  languageHint?: string;
  /** Resolution level */
  resolutionLevel?: 'basic' | 'full' | 'strict';
}

/**
 * Resolved address hierarchy
 */
export interface ResolvedAddressHierarchy {
  /** Country */
  country: string;
  /** Admin level 1 (state/province) */
  admin1?: string;
  /** Admin level 2 (city/county) */
  admin2?: string;
  /** Admin level 3 (district) */
  admin3?: string;
  /** Admin level 4 (subdistrict) */
  admin4?: string;
  /** Locality */
  locality?: string;
  /** Sublocality */
  sublocality?: string;
  /** Street */
  street?: string;
  /** Building */
  building?: string;
  /** Unit */
  unit?: string;
  /** Postal code */
  postalCode?: string;
}

/**
 * Schema resolution response
 */
export interface SchemaResolutionResponse {
  /** Success status */
  success: boolean;
  /** Detected country */
  detectedCountry: string;
  /** Applied grammar */
  appliedGrammar: AddressFormatGrammar;
  /** Resolved hierarchy */
  resolvedHierarchy: ResolvedAddressHierarchy;
  /** Generated PID */
  generatedPID: string;
  /** Validation results */
  validation: {
    isValid: boolean;
    issues: Array<{
      field: string;
      severity: 'error' | 'warning' | 'info';
      message: string;
    }>;
  };
  /** Confidence score */
  confidence: number;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// 4. Noise Block AI
// ============================================================================

/**
 * Relevance score
 */
export interface RelevanceScore {
  /** Address PID or site ID */
  targetId: string;
  /** Relevance score (0-1) */
  score: number;
  /** Relevance factors */
  factors: {
    textMatch: number;
    contextFit: number;
    availability: number;
    recency: number;
    userPreference: number;
  };
  /** Reasons for inclusion/exclusion */
  reasons: string[];
}

/**
 * Invalid site detection
 */
export interface InvalidSiteDetection {
  /** Site URL or ID */
  siteId: string;
  /** Is invalid */
  isInvalid: boolean;
  /** Invalid reasons */
  invalidReasons: Array<{
    type: 'http_error' | 'ssl_error' | 'dns_error' | 'service_ended' | 'reported_fraud';
    severity: 'high' | 'medium' | 'low';
    details: string;
    detectedAt: string;
  }>;
  /** Recommendation */
  recommendation: 'block' | 'warn' | 'monitor';
}

/**
 * Noise filtering request
 */
export interface NoiseFilteringRequest {
  /** Search query */
  query: string;
  /** Candidate results */
  candidates: Array<{
    id: string;
    type: 'address' | 'site';
    data: any;
  }>;
  /** User context */
  userContext: UserContext;
  /** Filtering threshold */
  threshold?: number;
  /** Include blocked items in response */
  includeBlocked?: boolean;
}

/**
 * Noise filtering response
 */
export interface NoiseFilteringResponse {
  /** Success status */
  success: boolean;
  /** Filtered results */
  filteredResults: Array<{
    id: string;
    type: 'address' | 'site';
    relevanceScore: RelevanceScore;
    data: any;
  }>;
  /** Blocked items */
  blockedItems?: Array<{
    id: string;
    type: 'address' | 'site';
    blockReason: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  /** Statistics */
  statistics: {
    totalCandidates: number;
    filteredCount: number;
    blockedCount: number;
    averageRelevance: number;
  };
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// 5. Ledger Link AI
// ============================================================================

/**
 * Linked payment token
 */
export interface LinkedPaymentToken {
  /** Token ID */
  tokenId: string;
  /** Token type */
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'digital_wallet';
  /** Display name */
  displayName: string;
  /** Link reason */
  linkReason: string;
  /** Link confidence (0-1) */
  confidence: number;
  /** Compatibility score with address */
  compatibilityScore: number;
}

/**
 * Linked contract
 */
export interface LinkedContract {
  /** Contract ID */
  contractId: string;
  /** Contract type */
  type: 'utility' | 'telecom' | 'subscription' | 'insurance' | 'other';
  /** Provider name */
  provider: string;
  /** Status */
  status: 'active' | 'inactive' | 'pending' | 'expired';
  /** Link confidence */
  confidence: number;
}

/**
 * Linked reservation
 */
export interface LinkedReservation {
  /** Reservation ID */
  reservationId: string;
  /** Reservation type */
  type: 'hotel' | 'restaurant' | 'event' | 'delivery' | 'service';
  /** Date/time */
  dateTime: string;
  /** Status */
  status: 'upcoming' | 'completed' | 'cancelled';
  /** Link confidence */
  confidence: number;
}

/**
 * Ledger linking request
 */
export interface LedgerLinkingRequest {
  /** Address PID */
  addressPID: string;
  /** Include payment tokens */
  includePayments?: boolean;
  /** Include contracts */
  includeContracts?: boolean;
  /** Include reservations */
  includeReservations?: boolean;
  /** Include subscriptions */
  includeSubscriptions?: boolean;
  /** Minimum confidence threshold */
  minConfidence?: number;
}

/**
 * Ledger linking response
 */
export interface LedgerLinkingResponse {
  /** Success status */
  success: boolean;
  /** Address PID */
  addressPID: string;
  /** Linked data summary */
  linkedDataSummary: {
    paymentCount: number;
    contractCount: number;
    reservationCount: number;
    subscriptionCount: number;
  };
  /** Linked payments */
  linkedPayments?: LinkedPaymentToken[];
  /** Linked contracts */
  linkedContracts?: LinkedContract[];
  /** Linked reservations */
  linkedReservations?: LinkedReservation[];
  /** Recommendations */
  recommendations?: string[];
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// 6. Fraud Radar AI
// ============================================================================

/**
 * Fraud detection pattern
 */
export type FraudPattern =
  | 'dictionary_attack'
  | 'brute_force'
  | 'list_attack'
  | 'bot_attack'
  | 'distributed_attack'
  | 'payment_fraud'
  | 'account_takeover'
  | 'fake_address';

/**
 * Detected threat
 */
export interface DetectedThreat {
  /** Threat ID */
  threatId: string;
  /** Pattern type */
  pattern: FraudPattern;
  /** Severity */
  severity: 'critical' | 'high' | 'medium' | 'low';
  /** Confidence (0-1) */
  confidence: number;
  /** Detection details */
  details: {
    requestCount?: number;
    timeWindow?: string;
    successRate?: number;
    sourceIPs?: string[];
    targetAddresses?: string[];
  };
  /** Recommended action */
  recommendedAction: 'block' | 'challenge' | 'rate_limit' | 'monitor';
  /** Detected at */
  detectedAt: string;
}

/**
 * Fraud detection request
 */
export interface FraudDetectionRequest {
  /** Request type */
  requestType: 'address_lookup' | 'payment_link' | 'checkout' | 'bulk_operation';
  /** Request metadata */
  metadata: {
    sourceIP: string;
    userAgent: string;
    sessionId?: string;
    userId?: string;
    timestamp: string;
  };
  /** Request payload */
  payload: {
    addressPID?: string;
    paymentTokenId?: string;
    amount?: number;
    currency?: string;
  };
  /** Historical context */
  historicalContext?: {
    previousRequests: number;
    previousFailures: number;
    accountAge?: number;
  };
}

/**
 * Fraud detection response
 */
export interface FraudDetectionResponse {
  /** Success status */
  success: boolean;
  /** Overall risk level */
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  /** Risk score (0-1) */
  riskScore: number;
  /** Detected threats */
  threats: DetectedThreat[];
  /** Behavioral anomalies */
  anomalies?: Array<{
    type: string;
    description: string;
    severity: string;
  }>;
  /** Recommended action */
  recommendedAction: 'allow' | 'challenge' | 'block';
  /** Challenge type if recommended */
  challengeType?: 'captcha' | '2fa' | 'email_verification' | 'phone_verification';
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// 7. Edge Normalize AI
// ============================================================================

/**
 * Address variant
 */
export interface AddressVariant {
  /** Original text */
  original: string;
  /** Normalized text */
  normalized: string;
  /** Variant type */
  variantType: 'abbreviation' | 'spelling' | 'language' | 'historical' | 'colloquial';
  /** Language */
  language: string;
  /** Confidence (0-1) */
  confidence: number;
}

/**
 * Normalization request
 */
export interface NormalizationRequest {
  /** Address text to normalize */
  addressText: string;
  /** Country code hint */
  countryHint?: string;
  /** Language hints */
  languageHints?: string[];
  /** Normalization options */
  options?: {
    expandAbbreviations?: boolean;
    standardizeNumbers?: boolean;
    removeSpaces?: boolean;
    convertToRoman?: boolean;
  };
}

/**
 * Normalization response
 */
export interface NormalizationResponse {
  /** Success status */
  success: boolean;
  /** Original address */
  original: string;
  /** Normalized address */
  normalized: string;
  /** Canonical PID */
  canonicalPID: string;
  /** All detected variants */
  variants: AddressVariant[];
  /** Detected languages */
  detectedLanguages: string[];
  /** Applied transformations */
  transformations: Array<{
    type: string;
    from: string;
    to: string;
    reason: string;
  }>;
  /** Error message if failed */
  error?: string;
}

/**
 * Multi-language address representation
 */
export interface MultiLanguageAddress {
  /** Canonical PID */
  canonicalPID: string;
  /** Language variants */
  variants: {
    [languageCode: string]: {
      formatted: string;
      native: string;
      romanized?: string;
    };
  };
  /** Default display language */
  defaultLanguage: string;
}

// ============================================================================
// 8. Checkout Cast AI
// ============================================================================

/**
 * Checkout step
 */
export interface CheckoutStep {
  /** Step number */
  step: number;
  /** Step action */
  action: 'select_address' | 'select_payment' | 'select_shipping' | 'confirm_order' | 'review';
  /** Is prefilled */
  prefilled: boolean;
  /** Prefilled data */
  prefilledData?: any;
  /** Requires user review */
  requiresReview: boolean;
  /** Display name */
  displayName: string;
  /** Estimated time (seconds) */
  estimatedTime: number;
}

/**
 * UI optimization request
 */
export interface UIOptimizationRequest {
  /** Site ID or URL */
  siteId: string;
  /** Site category */
  siteCategory: 'ecommerce' | 'booking' | 'subscription' | 'marketplace';
  /** User context */
  userContext: UserContext;
  /** Cart/booking information */
  transactionData?: {
    totalAmount: number;
    currency: string;
    itemCount: number;
    deliveryRequired: boolean;
  };
  /** Device capabilities */
  deviceCapabilities?: {
    screenSize: 'small' | 'medium' | 'large';
    touchEnabled: boolean;
    oneClickEnabled: boolean;
  };
}

/**
 * UI optimization response
 */
export interface UIOptimizationResponse {
  /** Success status */
  success: boolean;
  /** Optimized checkout flow */
  checkoutFlow: {
    steps: CheckoutStep[];
    estimatedTotalTime: number;
    totalClicks: number;
  };
  /** Pre-selected options */
  preselectedOptions: {
    addressPID?: string;
    paymentTokenId?: string;
    shippingMethod?: string;
  };
  /** UI components to render */
  uiComponents?: Array<{
    componentType: string;
    props: Record<string, any>;
    order: number;
  }>;
  /** A/B test variant */
  variant?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Auto-fill request
 */
export interface AutoFillRequest {
  /** Form type */
  formType: 'checkout' | 'booking' | 'registration' | 'shipping';
  /** Site ID */
  siteId: string;
  /** Form fields */
  formFields: Array<{
    fieldName: string;
    fieldType: string;
    required: boolean;
  }>;
  /** User context */
  userContext: UserContext;
}

/**
 * Auto-fill response
 */
export interface AutoFillResponse {
  /** Success status */
  success: boolean;
  /** Filled fields */
  filledFields: Record<string, {
    value: any;
    source: string;
    confidence: number;
  }>;
  /** Missing fields */
  missingFields: string[];
  /** Warnings */
  warnings?: string[];
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// 9. Revocation Sense AI
// ============================================================================

/**
 * Revocation candidate
 */
export interface RevocationCandidate {
  /** Site ID */
  siteId: string;
  /** Site name */
  siteName: string;
  /** Risk score (0-1) */
  riskScore: number;
  /** Revocation reasons */
  reasons: Array<{
    reason: string;
    severity: 'high' | 'medium' | 'low';
    weight: number;
  }>;
  /** Recommended action */
  recommendedAction: 'revoke' | 'archive' | 'monitor';
  /** Confidence (0-1) */
  confidence: number;
  /** Last used */
  lastUsed?: string;
  /** Days inactive */
  daysInactive?: number;
}

/**
 * Revocation impact analysis
 */
export interface RevocationImpactAnalysis {
  /** Site ID */
  siteId: string;
  /** Positive impacts */
  positiveImpacts: string[];
  /** Negative impacts */
  negativeImpacts: string[];
  /** Neutral impacts */
  neutralImpacts: string[];
  /** Overall recommendation */
  recommendation: 'highly_recommended' | 'recommended' | 'optional' | 'not_recommended';
  /** Impact severity */
  impactSeverity: 'high' | 'medium' | 'low';
}

/**
 * Revocation prediction request
 */
export interface RevocationPredictionRequest {
  /** User ID */
  userId: string;
  /** Include all partnerships */
  includeAllPartnerships?: boolean;
  /** Minimum risk threshold */
  minRiskThreshold?: number;
  /** Analysis depth */
  analysisDepth?: 'quick' | 'standard' | 'deep';
}

/**
 * Revocation prediction response
 */
export interface RevocationPredictionResponse {
  /** Success status */
  success: boolean;
  /** Revocation candidates */
  candidates: RevocationCandidate[];
  /** User intent prediction */
  intentPrediction?: {
    likelyToRevoke: boolean;
    confidence: number;
    predictedTimeline: string;
  };
  /** Batch revocation suggestions */
  batchSuggestions?: Array<{
    category: string;
    siteIds: string[];
    reason: string;
  }>;
  /** Error message if failed */
  error?: string;
}

/**
 * Revocation execution request
 */
export interface RevocationExecutionRequest {
  /** Site IDs to revoke */
  siteIds: string[];
  /** Revocation type */
  revocationType: 'soft' | 'hard' | 'archive';
  /** Reason for revocation */
  reason?: string;
  /** Schedule for future */
  scheduledFor?: string;
}

/**
 * Revocation execution response
 */
export interface RevocationExecutionResponse {
  /** Success status */
  success: boolean;
  /** Revoked sites */
  revokedSites: Array<{
    siteId: string;
    status: 'revoked' | 'failed' | 'pending';
    impact: RevocationImpactAnalysis;
  }>;
  /** Failed revocations */
  failures?: Array<{
    siteId: string;
    reason: string;
  }>;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// 10. Context Locale AI
// ============================================================================

/**
 * Multi-dimensional context
 */
export interface MultiDimensionalContext {
  /** Geographic context */
  geographic: {
    currentCountry: string;
    currentRegion?: string;
    timezone: string;
    language: string;
  };
  /** Temporal context */
  temporal: {
    timestamp: string;
    dayOfWeek: string;
    season: 'spring' | 'summer' | 'fall' | 'winter';
    holiday: boolean;
    businessHours: boolean;
  };
  /** Service context */
  service: {
    category: string;
    subcategory?: string;
    deliveryMethod?: string;
    paymentCurrency: string;
  };
  /** Device context */
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    screenSize: 'small' | 'medium' | 'large';
  };
  /** User context */
  user: {
    preferredLanguage: string;
    homeCountry: string;
    currentLocation: 'home' | 'work' | 'moving' | 'traveling';
  };
}

/**
 * Filtering rule
 */
export interface FilteringRule {
  /** Rule name */
  name: string;
  /** Rule type */
  type: 'include' | 'exclude' | 'prioritize';
  /** Conditions */
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
    value: any;
  }>;
  /** Priority */
  priority: number;
}

/**
 * Context-based filtering request
 */
export interface ContextFilteringRequest {
  /** User context */
  context: MultiDimensionalContext;
  /** Candidate addresses */
  candidateAddresses: string[];
  /** Apply strict filtering */
  strictMode?: boolean;
  /** Custom filtering rules */
  customRules?: FilteringRule[];
  /** Maximum results */
  maxResults?: number;
}

/**
 * Localized address display
 */
export interface LocalizedAddressDisplay {
  /** Address PID */
  addressPID: string;
  /** Primary display (user's preferred language) */
  primaryDisplay: string;
  /** Native display (address's native language) */
  nativeDisplay: string;
  /** Romanized display */
  romanizedDisplay?: string;
  /** Multi-language variants */
  variants?: Record<string, string>;
}

/**
 * Context filtering response
 */
export interface ContextFilteringResponse {
  /** Success status */
  success: boolean;
  /** Filtered addresses with localized display */
  filteredAddresses: Array<{
    addressPID: string;
    display: LocalizedAddressDisplay;
    relevanceScore: number;
    matchedRules: string[];
  }>;
  /** Applied context interpretation */
  appliedContext: {
    detectedScenario: string;
    appliedRules: FilteringRule[];
    confidence: number;
  };
  /** Currency information */
  currencyInfo?: {
    displayCurrency: string;
    exchangeRate?: number;
    conversionNotice?: string;
  };
  /** Statistics */
  statistics: {
    totalCandidates: number;
    filteredCount: number;
    excludedCount: number;
  };
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Extended AI Service Interface
// ============================================================================

/**
 * Extended AI service configuration
 */
export interface ExtendedAIServiceConfig {
  /** API key */
  apiKey?: string;
  /** AI model version */
  modelVersion?: string;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Enable caching */
  enableCache?: boolean;
  /** Base URL for custom endpoints */
  baseUrl?: string;
}

/**
 * Extended AI service interface
 */
export interface ExtendedAIService {
  // 1. Atlas Routing AI
  optimizeRoute(request: RouteOptimizationRequest): Promise<RouteOptimizationResponse>;
  integrateBookingSystem(request: BookingSystemRequest): Promise<BookingSystemResponse>;

  // 2. GAP Oracle
  determinePriority(request: PriorityDeterminationRequest): Promise<PriorityDeterminationResponse>;

  // 3. Schema Resolve AI
  resolveSchema(request: SchemaResolutionRequest): Promise<SchemaResolutionResponse>;

  // 4. Noise Block AI
  filterNoise(request: NoiseFilteringRequest): Promise<NoiseFilteringResponse>;

  // 5. Ledger Link AI
  linkLedgerData(request: LedgerLinkingRequest): Promise<LedgerLinkingResponse>;

  // 6. Fraud Radar AI
  detectFraud(request: FraudDetectionRequest): Promise<FraudDetectionResponse>;

  // 7. Edge Normalize AI
  normalizeAddress(request: NormalizationRequest): Promise<NormalizationResponse>;

  // 8. Checkout Cast AI
  optimizeCheckoutUI(request: UIOptimizationRequest): Promise<UIOptimizationResponse>;
  autoFillForm(request: AutoFillRequest): Promise<AutoFillResponse>;

  // 9. Revocation Sense AI
  predictRevocation(request: RevocationPredictionRequest): Promise<RevocationPredictionResponse>;
  executeRevocation(request: RevocationExecutionRequest): Promise<RevocationExecutionResponse>;

  // 10. Context Locale AI
  filterByContext(request: ContextFilteringRequest): Promise<ContextFilteringResponse>;
}
