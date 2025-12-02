/**
 * @vey/core - Logistics & Shipping Types
 *
 * Types for logistics features:
 * - Multi-carrier rate comparison
 * - ETD/ETA prediction
 * - Multi-piece shipments
 * - Pickup scheduling
 * - Carbon offset calculation
 * - Alternative delivery locations
 */

import type { AddressInput } from './types';
import type { PackageDimensions, WeightUnit } from './hardware';

// ============================================================================
// Carrier & Service Types
// ============================================================================

/**
 * Supported carriers
 */
export type CarrierCode =
  | 'fedex'
  | 'dhl'
  | 'ups'
  | 'usps'
  | 'ems'
  | 'yamato'       // ヤマト運輸
  | 'sagawa'       // 佐川急便
  | 'jppost'       // 日本郵便
  | 'sf_express'   // SF Express (顺丰速运)
  | 'jd_logistics' // JD Logistics (京东物流)
  | 'aramex'
  | 'dpd'
  | 'tnt'
  | 'chronopost'
  | 'purolator'
  | 'canada_post'
  | 'royal_mail'
  | 'australia_post'
  | 'other';

/**
 * Service level types
 */
export type ServiceLevel =
  | 'economy'
  | 'standard'
  | 'express'
  | 'priority'
  | 'overnight'
  | 'same_day'
  | 'time_definite';

/**
 * Carrier service definition
 */
export interface CarrierService {
  /** Carrier code */
  carrier: CarrierCode;
  /** Service code */
  serviceCode: string;
  /** Service name */
  serviceName: string;
  /** Service level */
  level: ServiceLevel;
  /** Estimated transit days (min-max) */
  transitDays: {
    min: number;
    max: number;
  };
  /** Features included */
  features: string[];
  /** Tracking available */
  trackingAvailable: boolean;
  /** Insurance included */
  insuranceIncluded: boolean;
  /** Signature required */
  signatureRequired: boolean;
}

// ============================================================================
// Rate Comparison
// ============================================================================

/**
 * Package info for rate quote
 */
export interface PackageInfo {
  /** Package weight */
  weight: {
    value: number;
    unit: WeightUnit;
  };
  /** Package dimensions */
  dimensions?: PackageDimensions;
  /** Package value for insurance */
  declaredValue?: {
    amount: number;
    currency: string;
  };
  /** Package type */
  packageType?: 'box' | 'envelope' | 'tube' | 'pallet' | 'custom';
  /** Is document only */
  documentOnly?: boolean;
}

/**
 * Rate quote request
 */
export interface RateQuoteRequest {
  /** Origin address */
  origin: AddressInput;
  /** Destination address */
  destination: AddressInput;
  /** Packages */
  packages: PackageInfo[];
  /** Preferred carriers (if empty, query all) */
  carriers?: CarrierCode[];
  /** Service levels to query */
  serviceLevels?: ServiceLevel[];
  /** Ship date */
  shipDate?: string;
  /** Include insurance */
  includeInsurance?: boolean;
  /** Include carbon offset */
  includeCarbonOffset?: boolean;
  /** Residential delivery */
  residential?: boolean;
  /** Saturday delivery */
  saturdayDelivery?: boolean;
}

/**
 * Rate breakdown
 */
export interface RateBreakdown {
  /** Base rate */
  baseRate: number;
  /** Fuel surcharge */
  fuelSurcharge?: number;
  /** Insurance */
  insurance?: number;
  /** Carbon offset */
  carbonOffset?: number;
  /** Residential surcharge */
  residentialSurcharge?: number;
  /** Saturday delivery surcharge */
  saturdaySurcharge?: number;
  /** Remote area surcharge */
  remoteAreaSurcharge?: number;
  /** Peak season surcharge */
  peakSurcharge?: number;
  /** Other surcharges */
  otherSurcharges?: Array<{
    name: string;
    amount: number;
  }>;
  /** Tax */
  tax?: number;
}

/**
 * Rate quote result
 */
export interface RateQuote {
  /** Carrier */
  carrier: CarrierCode;
  /** Service */
  service: CarrierService;
  /** Total rate */
  totalRate: number;
  /** Currency */
  currency: string;
  /** Rate breakdown */
  breakdown: RateBreakdown;
  /** Estimated delivery date */
  estimatedDelivery: {
    date: string;
    time?: string;
    guaranteed: boolean;
  };
  /** Transit days */
  transitDays: number;
  /** Quote ID (for booking) */
  quoteId: string;
  /** Valid until */
  validUntil: string;
  /** Carrier logo URL */
  carrierLogo?: string;
}

/**
 * Rate comparison response
 */
export interface RateComparisonResponse {
  /** Whether comparison was successful */
  success: boolean;
  /** Available rates sorted by price */
  ratesByPrice: RateQuote[];
  /** Available rates sorted by delivery time */
  ratesByTime: RateQuote[];
  /** Cheapest option */
  cheapest?: RateQuote;
  /** Fastest option */
  fastest?: RateQuote;
  /** Best value (balanced) */
  bestValue?: RateQuote;
  /** Carriers that failed */
  failedCarriers?: Array<{
    carrier: CarrierCode;
    error: string;
  }>;
  /** Request metadata */
  metadata?: {
    quotedAt: string;
    originCountry: string;
    destinationCountry: string;
    totalWeight: number;
    totalPackages: number;
  };
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// ETD/ETA Prediction
// ============================================================================

/**
 * Delivery prediction factors
 */
export interface PredictionFactors {
  /** Historical on-time performance */
  historicalPerformance: number;
  /** Current carrier delays */
  carrierDelays: boolean;
  /** Weather impact */
  weatherImpact: 'none' | 'minor' | 'moderate' | 'severe';
  /** Holiday impact */
  holidayImpact: boolean;
  /** Customs processing time */
  customsProcessing?: number; // days
  /** Remote area adjustment */
  remoteArea: boolean;
}

/**
 * Delivery window prediction
 */
export interface DeliveryPrediction {
  /** Carrier */
  carrier: CarrierCode;
  /** Service */
  serviceCode: string;
  /** Predicted delivery date (earliest) */
  earliestDelivery: string;
  /** Predicted delivery date (latest) */
  latestDelivery: string;
  /** Most likely delivery date */
  mostLikely: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Prediction factors */
  factors: PredictionFactors;
  /** Potential delays */
  potentialDelays?: string[];
  /** Recommendations */
  recommendations?: string[];
}

/**
 * ETA prediction request
 */
export interface ETAPredictionRequest {
  /** Origin address */
  origin: AddressInput;
  /** Destination address */
  destination: AddressInput;
  /** Ship date */
  shipDate: string;
  /** Carrier */
  carrier: CarrierCode;
  /** Service code */
  serviceCode: string;
  /** Tracking number (for in-transit predictions) */
  trackingNumber?: string;
}

/**
 * ETA prediction response
 */
export interface ETAPredictionResponse {
  /** Whether prediction was successful */
  success: boolean;
  /** Prediction */
  prediction?: DeliveryPrediction;
  /** Current tracking status (if tracking number provided) */
  currentStatus?: {
    status: string;
    location: string;
    timestamp: string;
  };
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Multi-Piece Shipments
// ============================================================================

/**
 * Individual piece in multi-piece shipment
 */
export interface ShipmentPiece {
  /** Piece number */
  pieceNumber: number;
  /** Piece tracking number */
  trackingNumber?: string;
  /** Piece weight */
  weight: {
    value: number;
    unit: WeightUnit;
  };
  /** Piece dimensions */
  dimensions?: PackageDimensions;
  /** Piece description */
  description?: string;
  /** Piece reference */
  reference?: string;
}

/**
 * Multi-piece shipment
 */
export interface MultiPieceShipment {
  /** Master tracking number */
  masterTrackingNumber: string;
  /** Carrier */
  carrier: CarrierCode;
  /** Service */
  serviceCode: string;
  /** Origin */
  origin: AddressInput;
  /** Destination */
  destination: AddressInput;
  /** Total pieces */
  totalPieces: number;
  /** Individual pieces */
  pieces: ShipmentPiece[];
  /** Total weight */
  totalWeight: {
    value: number;
    unit: WeightUnit;
  };
  /** Shipment status */
  status: 'created' | 'picked_up' | 'in_transit' | 'delivered' | 'exception';
  /** Created date */
  createdAt: string;
}

/**
 * Multi-piece shipment request
 */
export interface MultiPieceRequest {
  /** Origin */
  origin: AddressInput;
  /** Destination */
  destination: AddressInput;
  /** Carrier */
  carrier: CarrierCode;
  /** Service */
  serviceCode: string;
  /** Pieces */
  pieces: Omit<ShipmentPiece, 'pieceNumber' | 'trackingNumber'>[];
  /** Shipper info */
  shipper: {
    name: string;
    company?: string;
    phone: string;
    email?: string;
  };
  /** Receiver info */
  receiver: {
    name: string;
    company?: string;
    phone: string;
    email?: string;
  };
  /** Ship date */
  shipDate: string;
  /** Reference */
  reference?: string;
}

/**
 * Multi-piece shipment response
 */
export interface MultiPieceResponse {
  /** Whether creation was successful */
  success: boolean;
  /** Created shipment */
  shipment?: MultiPieceShipment;
  /** Labels (one per piece) */
  labels?: Array<{
    pieceNumber: number;
    trackingNumber: string;
    labelData: string; // base64 PDF/ZPL
    labelFormat: 'pdf' | 'zpl' | 'png';
  }>;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Pickup Scheduling
// ============================================================================

/**
 * Pickup time window
 */
export interface PickupWindow {
  /** Date */
  date: string;
  /** Start time */
  startTime: string;
  /** End time */
  endTime: string;
}

/**
 * Pickup request
 */
export interface PickupRequest {
  /** Carrier */
  carrier: CarrierCode;
  /** Pickup address */
  address: AddressInput;
  /** Contact info */
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
  /** Preferred time window */
  preferredWindow: PickupWindow;
  /** Alternative window */
  alternativeWindow?: PickupWindow;
  /** Number of packages */
  packageCount: number;
  /** Total weight */
  totalWeight?: {
    value: number;
    unit: WeightUnit;
  };
  /** Special instructions */
  instructions?: string;
  /** Related shipment numbers */
  shipmentNumbers?: string[];
}

/**
 * Pickup confirmation
 */
export interface PickupConfirmation {
  /** Pickup confirmation number */
  confirmationNumber: string;
  /** Carrier */
  carrier: CarrierCode;
  /** Scheduled window */
  scheduledWindow: PickupWindow;
  /** Estimated arrival time */
  estimatedArrival?: string;
  /** Status */
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  /** Driver info */
  driver?: {
    name?: string;
    phone?: string;
  };
  /** Cancellation deadline */
  cancellationDeadline?: string;
}

/**
 * Pickup response
 */
export interface PickupResponse {
  /** Whether scheduling was successful */
  success: boolean;
  /** Pickup confirmation */
  confirmation?: PickupConfirmation;
  /** Alternative windows if requested window unavailable */
  alternativeWindows?: PickupWindow[];
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Carbon Offset
// ============================================================================

/**
 * Carbon offset calculation request
 */
export interface CarbonOffsetRequest {
  /** Origin */
  origin: AddressInput;
  /** Destination */
  destination: AddressInput;
  /** Transport mode */
  transportMode: 'air' | 'sea' | 'ground' | 'rail';
  /** Weight */
  weight: {
    value: number;
    unit: WeightUnit;
  };
  /** Number of packages */
  packageCount?: number;
}

/**
 * Carbon offset result
 */
export interface CarbonOffsetResult {
  /** CO2 emissions in kg */
  co2Emissions: number;
  /** Distance in km */
  distance: number;
  /** Offset cost */
  offsetCost: {
    amount: number;
    currency: string;
  };
  /** Offset projects available */
  offsetProjects?: Array<{
    id: string;
    name: string;
    type: 'reforestation' | 'renewable_energy' | 'methane_capture' | 'other';
    location: string;
    costPerKg: number;
  }>;
  /** Emissions breakdown by leg */
  breakdown?: Array<{
    leg: string;
    mode: string;
    distance: number;
    emissions: number;
  }>;
  /** Comparison with alternative modes */
  alternatives?: Array<{
    mode: string;
    emissions: number;
    savings: number;
    savingsPercent: number;
  }>;
}

/**
 * Carbon offset response
 */
export interface CarbonOffsetResponse {
  /** Whether calculation was successful */
  success: boolean;
  /** Offset result */
  result?: CarbonOffsetResult;
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Alternative Delivery Locations
// ============================================================================

/**
 * Delivery location types
 */
export type DeliveryLocationType =
  | 'home'
  | 'work'
  | 'pudo'           // Pick Up Drop Off point
  | 'locker'         // Parcel locker
  | 'convenience_store'
  | 'post_office'
  | 'carrier_store'  // FedEx Office, UPS Store, etc.
  | 'neighbor'
  | 'safe_place';    // Specified safe location

/**
 * Delivery location
 */
export interface DeliveryLocation {
  /** Location ID */
  id: string;
  /** Location name */
  name: string;
  /** Location type */
  type: DeliveryLocationType;
  /** Address */
  address: AddressInput;
  /** Operating hours */
  operatingHours?: Array<{
    day: string;
    open: string;
    close: string;
  }>;
  /** Distance from original address */
  distance?: {
    value: number;
    unit: 'km' | 'mi';
  };
  /** Available until date */
  availableUntil?: string;
  /** Locker size availability */
  lockerSizes?: Array<{
    size: 'small' | 'medium' | 'large' | 'xl';
    available: boolean;
  }>;
  /** Additional services */
  services?: string[];
  /** Provider/operator */
  provider?: string;
}

/**
 * Alternative location search request
 */
export interface AlternativeLocationRequest {
  /** Reference address (delivery address) */
  referenceAddress: AddressInput;
  /** Search radius */
  radius?: {
    value: number;
    unit: 'km' | 'mi';
  };
  /** Location types to search */
  types?: DeliveryLocationType[];
  /** Package size for locker availability */
  packageSize?: 'small' | 'medium' | 'large' | 'xl';
  /** Carrier filter */
  carrier?: CarrierCode;
  /** Maximum results */
  maxResults?: number;
}

/**
 * Alternative location response
 */
export interface AlternativeLocationResponse {
  /** Whether search was successful */
  success: boolean;
  /** Found locations */
  locations: DeliveryLocation[];
  /** Search radius used */
  searchRadius: {
    value: number;
    unit: 'km' | 'mi';
  };
  /** Error message if failed */
  error?: string;
}

/**
 * Delivery preference
 */
export interface DeliveryPreference {
  /** Preferred location */
  location: DeliveryLocation;
  /** Safe place instructions */
  safePlace?: string;
  /** Neighbor delivery allowed */
  neighborAllowed?: boolean;
  /** Specific delivery time window */
  timeWindow?: {
    start: string;
    end: string;
  };
  /** Leave with receptionist */
  leaveWithReceptionist?: boolean;
  /** Ring doorbell */
  ringDoorbell?: boolean;
  /** Additional instructions */
  instructions?: string;
}

// ============================================================================
// Logistics Service Interface
// ============================================================================

/**
 * Logistics service configuration
 */
export interface LogisticsConfig {
  /** API keys per carrier */
  carrierApiKeys?: Record<CarrierCode, string>;
  /** Default origin country */
  defaultOriginCountry?: string;
  /** Default weight unit */
  defaultWeightUnit?: WeightUnit;
  /** Default dimension unit */
  defaultDimensionUnit?: 'cm' | 'in';
  /** Enable carbon offset */
  enableCarbonOffset?: boolean;
}

/**
 * Logistics service interface
 */
export interface LogisticsService {
  /** Get rate comparison */
  compareRates(request: RateQuoteRequest): Promise<RateComparisonResponse>;
  
  /** Predict delivery time */
  predictDelivery(request: ETAPredictionRequest): Promise<ETAPredictionResponse>;
  
  /** Create multi-piece shipment */
  createMultiPieceShipment(request: MultiPieceRequest): Promise<MultiPieceResponse>;
  
  /** Schedule pickup */
  schedulePickup(request: PickupRequest): Promise<PickupResponse>;
  
  /** Cancel pickup */
  cancelPickup(confirmationNumber: string, carrier: CarrierCode): Promise<{ success: boolean; error?: string }>;
  
  /** Calculate carbon offset */
  calculateCarbonOffset(request: CarbonOffsetRequest): Promise<CarbonOffsetResponse>;
  
  /** Purchase carbon offset */
  purchaseCarbonOffset(result: CarbonOffsetResult, projectId?: string): Promise<{ success: boolean; certificateUrl?: string; error?: string }>;
  
  /** Find alternative delivery locations */
  findAlternativeLocations(request: AlternativeLocationRequest): Promise<AlternativeLocationResponse>;
  
  /** Get carrier services */
  getCarrierServices(carrier: CarrierCode): Promise<CarrierService[]>;
  
  /** Track shipment */
  trackShipment(trackingNumber: string, carrier?: CarrierCode): Promise<{
    events: Array<{
      timestamp: string;
      location: string;
      status: string;
      description: string;
    }>;
    currentStatus: string;
    estimatedDelivery?: string;
  }>;
}

// ============================================================================
// Community Logistics (コミュニティ物流)
// ============================================================================

/**
 * Consolidated Shipping (ご近所シェア配送)
 * Community-based shipping where neighbors consolidate shipments to save on shipping costs
 */

/**
 * Consolidated shipping participant
 */
export interface ConsolidatedParticipant {
  /** User identifier */
  userId: string;
  /** User name */
  name: string;
  /** Package count */
  packageCount: number;
  /** Total weight */
  totalWeight: {
    value: number;
    unit: WeightUnit;
  };
  /** User's share of total cost */
  costShare?: number;
  /** Participant role */
  role: 'organizer' | 'participant';
  /** Join timestamp */
  joinedAt: string;
  /** Pickup address */
  pickupAddress: AddressInput;
}

/**
 * Consolidated shipping group
 */
export interface ConsolidatedShippingGroup {
  /** Group identifier */
  groupId: string;
  /** Group name */
  name: string;
  /** Location (building/office name) */
  location: string;
  /** Pickup address */
  pickupAddress: AddressInput;
  /** Organizer */
  organizer: ConsolidatedParticipant;
  /** Participants */
  participants: ConsolidatedParticipant[];
  /** Total participants */
  totalParticipants: number;
  /** Maximum participants allowed */
  maxParticipants?: number;
  /** Group status */
  status: 'open' | 'full' | 'scheduled' | 'picked_up' | 'completed' | 'cancelled';
  /** Scheduled pickup time */
  scheduledPickup?: PickupWindow;
  /** Carrier */
  carrier?: CarrierCode;
  /** Service level */
  serviceLevel?: ServiceLevel;
  /** Total cost */
  totalCost?: {
    amount: number;
    currency: string;
  };
  /** Cost per participant (split equally or by weight) */
  costSplitMethod: 'equal' | 'by_weight' | 'by_package';
  /** Created timestamp */
  createdAt: string;
  /** Expiry timestamp (auto-close if not full) */
  expiresAt?: string;
}

/**
 * Consolidated shipping request
 */
export interface ConsolidatedShippingRequest {
  /** Location identifier */
  location: string;
  /** Pickup address */
  pickupAddress: AddressInput;
  /** Organizer info */
  organizer: {
    userId: string;
    name: string;
    phone: string;
    email?: string;
  };
  /** Initial packages */
  packages: PackageInfo[];
  /** Maximum participants */
  maxParticipants?: number;
  /** Preferred carriers */
  preferredCarriers?: CarrierCode[];
  /** Service level */
  serviceLevel?: ServiceLevel;
  /** Cost split method */
  costSplitMethod: 'equal' | 'by_weight' | 'by_package';
  /** Pickup time window */
  pickupWindow: PickupWindow;
  /** Group name */
  groupName?: string;
}

/**
 * Join consolidated shipping request
 */
export interface JoinConsolidatedRequest {
  /** Group ID to join */
  groupId: string;
  /** Participant info */
  participant: {
    userId: string;
    name: string;
    phone: string;
    email?: string;
  };
  /** Packages to add */
  packages: PackageInfo[];
  /** Pickup address (must match group location) */
  pickupAddress: AddressInput;
}

/**
 * Consolidated shipping response
 */
export interface ConsolidatedShippingResponse {
  /** Whether creation was successful */
  success: boolean;
  /** Created group */
  group?: ConsolidatedShippingGroup;
  /** Shareable group link */
  groupLink?: string;
  /** QR code for joining */
  qrCode?: string;
  /** Error message if failed */
  error?: string;
}

/**
 * Crowdsourced Delivery (ついでに持って行って機能)
 * Uber-like logistics where travelers carry packages for others
 */

/**
 * Traveler profile for crowdsourced delivery
 */
export interface TravelerProfile {
  /** Traveler user ID */
  userId: string;
  /** Traveler name */
  name: string;
  /** Trust score (e.g., Alipay Sesame Credit) */
  trustScore?: number;
  /** Trust provider */
  trustProvider?: 'alipay_sesame' | 'wechat_pay' | 'platform_rating';
  /** Verified identity */
  identityVerified: boolean;
  /** Average rating */
  rating?: number;
  /** Total deliveries completed */
  deliveriesCompleted: number;
  /** Available capacity */
  capacity?: {
    maxWeight: {
      value: number;
      unit: WeightUnit;
    };
    maxDimensions?: PackageDimensions;
  };
}

/**
 * Crowdsourced delivery route
 */
export interface CrowdsourcedRoute {
  /** Route identifier */
  routeId: string;
  /** Traveler */
  traveler: TravelerProfile;
  /** Origin */
  origin: AddressInput;
  /** Destination */
  destination: AddressInput;
  /** Departure date/time */
  departureTime: string;
  /** Arrival date/time */
  arrivalTime: string;
  /** Transport mode */
  transportMode: 'flight' | 'train' | 'bus' | 'car' | 'other';
  /** Available capacity remaining */
  availableCapacity: {
    weight: {
      value: number;
      unit: WeightUnit;
    };
    dimensions?: PackageDimensions;
  };
  /** Price per kg */
  pricePerKg: {
    amount: number;
    currency: string;
  };
  /** Route status */
  status: 'available' | 'full' | 'in_progress' | 'completed' | 'cancelled';
  /** Created timestamp */
  createdAt: string;
}

/**
 * Crowdsourced delivery request
 */
export interface CrowdsourcedDeliveryRequest {
  /** Package info */
  package: PackageInfo;
  /** Pickup location */
  pickup: AddressInput;
  /** Delivery location */
  delivery: AddressInput;
  /** Required delivery by date */
  requiredBy?: string;
  /** Sender info */
  sender: {
    userId: string;
    name: string;
    phone: string;
    email?: string;
  };
  /** Receiver info */
  receiver: {
    name: string;
    phone: string;
  };
  /** Maximum price willing to pay */
  maxPrice?: {
    amount: number;
    currency: string;
  };
  /** Insurance required */
  insuranceRequired?: boolean;
  /** Special handling instructions */
  instructions?: string;
}

/**
 * Crowdsourced delivery match
 */
export interface CrowdsourcedMatch {
  /** Match identifier */
  matchId: string;
  /** Traveler route */
  route: CrowdsourcedRoute;
  /** Package request */
  request: CrowdsourcedDeliveryRequest;
  /** Match score (0-1) */
  matchScore: number;
  /** Estimated price */
  estimatedPrice: {
    amount: number;
    currency: string;
  };
  /** Estimated delivery time */
  estimatedDelivery: string;
  /** Match status */
  status: 'proposed' | 'accepted' | 'in_transit' | 'delivered' | 'rejected';
  /** Created timestamp */
  createdAt: string;
}

/**
 * Crowdsourced delivery response
 */
export interface CrowdsourcedDeliveryResponse {
  /** Whether matching was successful */
  success: boolean;
  /** Available matches sorted by score */
  matches?: CrowdsourcedMatch[];
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Cross-Border Social Commerce (Daigou 2.0)
// ============================================================================

/**
 * Social commerce product catalog
 * WeChat Moments integration for social buyers
 */
export interface SocialCommerceProduct {
  /** Product identifier */
  productId: string;
  /** Product name */
  name: string;
  /** Product description */
  description?: string;
  /** Product images */
  images: string[];
  /** Price */
  price: {
    amount: number;
    currency: string;
  };
  /** Inventory quantity */
  inventory: number;
  /** Product category */
  category?: string;
  /** Product weight */
  weight?: {
    value: number;
    unit: WeightUnit;
  };
  /** Product dimensions */
  dimensions?: PackageDimensions;
  /** Source country */
  sourceCountry: string;
  /** Created timestamp */
  createdAt: string;
}

/**
 * Social buyer catalog
 */
export interface SocialBuyerCatalog {
  /** Catalog identifier */
  catalogId: string;
  /** Buyer identifier */
  buyerId: string;
  /** Buyer name */
  buyerName: string;
  /** Products */
  products: SocialCommerceProduct[];
  /** WeChat sharing enabled */
  wechatSharingEnabled: boolean;
  /** Catalog link */
  catalogLink?: string;
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

/**
 * Social commerce order
 */
export interface SocialCommerceOrder {
  /** Order identifier */
  orderId: string;
  /** Product */
  product: SocialCommerceProduct;
  /** Quantity */
  quantity: number;
  /** Customer info */
  customer: {
    name: string;
    phone: string;
    wechatId?: string;
  };
  /** Delivery address (pre-filled from cloud address book) */
  deliveryAddress: AddressInput;
  /** Order total */
  total: {
    amount: number;
    currency: string;
  };
  /** Order status */
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  /** Created timestamp */
  createdAt: string;
}

/**
 * Inventory item for WMS functionality
 */
export interface InventoryItem {
  /** Item identifier */
  itemId: string;
  /** Product reference */
  productId: string;
  /** Product name */
  productName: string;
  /** Quantity in stock */
  quantity: number;
  /** Location (e.g., home storage) */
  location?: string;
  /** Product images */
  images?: string[];
  /** Weight */
  weight?: {
    value: number;
    unit: WeightUnit;
  };
  /** Dimensions */
  dimensions?: PackageDimensions;
  /** Purchase date */
  purchaseDate?: string;
  /** Expiry date (if applicable) */
  expiryDate?: string;
  /** Notes */
  notes?: string;
}

/**
 * Inventory management request
 */
export interface InventoryUpdateRequest {
  /** Buyer identifier */
  buyerId: string;
  /** Items to add/update */
  items: Omit<InventoryItem, 'itemId'>[];
  /** Operation type */
  operation: 'add' | 'update' | 'remove' | 'ship';
}

/**
 * Inventory shipment (ship from inventory)
 */
export interface InventoryShipmentRequest {
  /** Buyer identifier */
  buyerId: string;
  /** Items to ship */
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
  /** Delivery address */
  deliveryAddress: AddressInput;
  /** Receiver info */
  receiver: {
    name: string;
    phone: string;
  };
  /** Carrier */
  carrier?: CarrierCode;
  /** Service level */
  serviceLevel?: ServiceLevel;
}

/**
 * Inventory shipment response
 */
export interface InventoryShipmentResponse {
  /** Whether shipment was successful */
  success: boolean;
  /** Updated inventory */
  inventory?: InventoryItem[];
  /** Shipping label */
  label?: {
    trackingNumber: string;
    labelData: string;
    labelFormat: 'pdf' | 'zpl' | 'png';
  };
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Digital Handshake Logistics (デジタル・ハンドシェイク物流)
// ============================================================================

/**
 * Digital handshake QR/NFC token
 * Contains shipment information for courier handover
 */
export interface DigitalHandshakeToken {
  /** Token identifier */
  tokenId: string;
  /** Waybill number */
  waybillNumber: string;
  /** Carrier */
  carrier: CarrierCode;
  /** Shipment details */
  shipment: {
    origin: AddressInput;
    destination: AddressInput;
    packages: PackageInfo[];
  };
  /** Sender info */
  sender: {
    name: string;
    phone: string;
  };
  /** Receiver info */
  receiver: {
    name: string;
    phone: string;
  };
  /** Token type */
  tokenType: 'pickup' | 'delivery';
  /** QR code data */
  qrCode?: string;
  /** NFC data */
  nfcData?: string;
  /** Token status */
  status: 'pending' | 'scanned' | 'completed' | 'expired';
  /** Created timestamp */
  createdAt: string;
  /** Expires timestamp */
  expiresAt: string;
}

/**
 * Digital handshake event
 */
export interface DigitalHandshakeEvent {
  /** Event identifier */
  eventId: string;
  /** Token identifier */
  tokenId: string;
  /** Event type */
  eventType: 'token_created' | 'token_scanned' | 'handover_initiated' | 'handover_completed' | 'handover_failed';
  /** Actor (user or courier) */
  actor: {
    id: string;
    name: string;
    role: 'sender' | 'courier' | 'receiver';
  };
  /** Location coordinates */
  location?: {
    latitude: number;
    longitude: number;
  };
  /** Device info */
  device?: {
    type: 'mobile' | 'pda' | 'tablet';
    id?: string;
  };
  /** Event timestamp */
  timestamp: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Digital handshake request
 */
export interface DigitalHandshakeRequest {
  /** Shipment details */
  shipment: {
    origin: AddressInput;
    destination: AddressInput;
    packages: PackageInfo[];
  };
  /** Sender info */
  sender: {
    userId: string;
    name: string;
    phone: string;
    email?: string;
  };
  /** Receiver info */
  receiver: {
    name: string;
    phone: string;
  };
  /** Carrier */
  carrier: CarrierCode;
  /** Service code */
  serviceCode: string;
  /** Pickup time window */
  pickupWindow: PickupWindow;
  /** Pre-validation enabled */
  preValidation?: boolean;
}

/**
 * Digital handshake response
 */
export interface DigitalHandshakeResponse {
  /** Whether request was successful */
  success: boolean;
  /** Waybill number */
  waybillNumber?: string;
  /** Pickup token (QR/NFC) */
  pickupToken?: DigitalHandshakeToken;
  /** Delivery token (QR/NFC) */
  deliveryToken?: DigitalHandshakeToken;
  /** Pre-validation result */
  preValidation?: {
    addressValid: boolean;
    itemsAllowed: boolean;
    errors?: string[];
  };
  /** Error message if failed */
  error?: string;
}

/**
 * Handover scan request
 */
export interface HandoverScanRequest {
  /** Token identifier */
  tokenId: string;
  /** Scanner (courier) info */
  scanner: {
    id: string;
    name: string;
    carrier: CarrierCode;
  };
  /** Scan location */
  location?: {
    latitude: number;
    longitude: number;
  };
  /** Scan timestamp */
  timestamp: string;
  /** Scan method */
  scanMethod: 'qr' | 'nfc' | 'manual';
}

/**
 * Handover scan response
 */
export interface HandoverScanResponse {
  /** Whether scan was successful */
  success: boolean;
  /** Shipment details */
  shipment?: {
    waybillNumber: string;
    origin: AddressInput;
    destination: AddressInput;
    packages: PackageInfo[];
  };
  /** Next action */
  nextAction?: 'print_label' | 'confirm_pickup' | 'deliver' | 'scan_receiver';
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// China-Specific Carrier Integration
// ============================================================================

/**
 * SF Express (顺丰速运) specific types
 */
export interface SFExpressConfig {
  /** SF Express account ID */
  accountId: string;
  /** API key */
  apiKey: string;
  /** Environment */
  environment: 'sandbox' | 'production';
  /** Endpoint */
  endpoint?: string;
}

/**
 * JD Logistics (京东物流) specific types
 */
export interface JDLogisticsConfig {
  /** JD account ID */
  accountId: string;
  /** API key */
  apiKey: string;
  /** Environment */
  environment: 'sandbox' | 'production';
  /** Endpoint */
  endpoint?: string;
}

/**
 * China address standardization request
 * Standardizes addresses to carrier master data (4-level: province/city/district/street)
 */
export interface ChinaAddressStandardizationRequest {
  /** Raw address input */
  rawAddress: string;
  /** Province name (optional, for disambiguation) */
  province?: string;
  /** City name (optional, for disambiguation) */
  city?: string;
  /** District name (optional, for disambiguation) */
  district?: string;
  /** Street/detailed address */
  street?: string;
}

/**
 * China address standardization response
 */
export interface ChinaAddressStandardizationResponse {
  /** Whether standardization was successful */
  success: boolean;
  /** Standardized address */
  standardized?: {
    /** Province (一级) */
    province: {
      code: string;
      name: string;
    };
    /** City (二级) */
    city: {
      code: string;
      name: string;
    };
    /** District (三级) */
    district: {
      code: string;
      name: string;
    };
    /** Street (四级) */
    street?: {
      code?: string;
      name: string;
    };
    /** Detailed address */
    detail: string;
    /** Postal code */
    postalCode?: string;
  };
  /** Confidence score (0-1) */
  confidence: number;
  /** Alternative matches */
  alternatives?: Array<{
    province: { code: string; name: string };
    city: { code: string; name: string };
    district: { code: string; name: string };
    street?: { code?: string; name: string };
    detail: string;
    confidence: number;
  }>;
  /** Error message if failed */
  error?: string;
}

/**
 * Extended Logistics Service with Community Features
 */
export interface CommunityLogisticsService extends LogisticsService {
  /** Create consolidated shipping group */
  createConsolidatedShipping(request: ConsolidatedShippingRequest): Promise<ConsolidatedShippingResponse>;
  
  /** Join consolidated shipping group */
  joinConsolidatedShipping(request: JoinConsolidatedRequest): Promise<{ success: boolean; group?: ConsolidatedShippingGroup; error?: string }>;
  
  /** Find available traveler routes for crowdsourced delivery */
  findTravelerRoutes(request: CrowdsourcedDeliveryRequest): Promise<CrowdsourcedDeliveryResponse>;
  
  /** Register as traveler for crowdsourced delivery */
  registerTravelerRoute(route: Omit<CrowdsourcedRoute, 'routeId' | 'status' | 'createdAt'>): Promise<{ success: boolean; route?: CrowdsourcedRoute; error?: string }>;
  
  /** Create social buyer catalog */
  createSocialCatalog(buyerId: string, products: SocialCommerceProduct[]): Promise<{ success: boolean; catalog?: SocialBuyerCatalog; error?: string }>;
  
  /** Update inventory */
  updateInventory(request: InventoryUpdateRequest): Promise<{ success: boolean; inventory?: InventoryItem[]; error?: string }>;
  
  /** Ship from inventory */
  shipFromInventory(request: InventoryShipmentRequest): Promise<InventoryShipmentResponse>;
  
  /** Create digital handshake shipment */
  createDigitalHandshake(request: DigitalHandshakeRequest): Promise<DigitalHandshakeResponse>;
  
  /** Scan handover token */
  scanHandoverToken(request: HandoverScanRequest): Promise<HandoverScanResponse>;
  
  /** Standardize China address */
  standardizeChinaAddress(request: ChinaAddressStandardizationRequest): Promise<ChinaAddressStandardizationResponse>;
  
  /** Configure SF Express */
  configureSFExpress(config: SFExpressConfig): Promise<{ success: boolean; error?: string }>;
  
  /** Configure JD Logistics */
  configureJDLogistics(config: JDLogisticsConfig): Promise<{ success: boolean; error?: string }>;
}
