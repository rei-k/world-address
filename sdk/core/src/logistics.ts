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
  | 'yamato'     // ヤマト運輸
  | 'sagawa'     // 佐川急便
  | 'jppost'     // 日本郵便
  | 'sf_express' // SF Express
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
