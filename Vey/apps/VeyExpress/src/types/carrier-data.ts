/**
 * Extended Carrier Types for Worldwide Carriers Database
 * These types extend the base Carrier types to support the comprehensive carrier database
 */

import { CarrierType, CarrierCapabilities, Money } from './index';

// ============================================================================
// Extended Carrier Types (Database Schema)
// ============================================================================

/**
 * Comprehensive carrier data from worldwide-carriers.yaml/json
 */
export interface CarrierData {
  id: string;
  name: CarrierName;
  code: string;
  country: string; // ISO 3166-1 alpha-2
  region: CarrierRegion;
  type: CarrierType | 'instant';
  founded?: number;
  market_share?: number;
  website: string;
  tracking_url: string;
  api_available: boolean;
  services: CarrierService[];
  capabilities: ExtendedCarrierCapabilities;
  coverage: CarrierCoverage;
}

/**
 * Carrier name in multiple languages
 */
export interface CarrierName {
  en: string; // English name
  local: string; // Local language name
}

/**
 * Geographic regions for carriers
 */
export type CarrierRegion = 'asia' | 'americas' | 'europe' | 'oceania' | 'middle_east' | 'africa';

/**
 * Carrier service definition
 */
export interface CarrierService {
  name: string;
  type: ServiceType;
  delivery_days?: number;
  delivery_hours?: number;
  countries_covered?: number;
  max_weight_kg?: number;
  max_dimensions_cm?: number[];
}

/**
 * Service type categories
 */
export type ServiceType =
  | 'domestic_parcel'
  | 'domestic_express'
  | 'small_parcel'
  | 'document'
  | 'express'
  | 'standard'
  | 'international'
  | 'international_express'
  | 'freight'
  | 'sea'
  | 'rail'
  | 'air'
  | 'instant'
  | 'same_day';

/**
 * Extended capabilities beyond base CarrierCapabilities
 */
export interface ExtendedCarrierCapabilities extends CarrierCapabilities {
  same_day_delivery?: boolean;
  refrigerated?: boolean;
  cold_chain?: boolean;
  dangerous_goods?: boolean;
  customs_clearance?: boolean;
  warehouse_services?: boolean;
}

/**
 * Coverage information for carriers
 */
export interface CarrierCoverage {
  domestic: boolean;
  international: boolean;
}

/**
 * Root structure of worldwide-carriers.yaml/json
 */
export interface WorldwideCarriersDatabase {
  version: string;
  total_carriers: number;
  regions: CarrierRegion[];
  carriers: CarrierData[];
  metadata: CarrierDatabaseMetadata;
}

/**
 * Metadata for the carrier database
 */
export interface CarrierDatabaseMetadata {
  last_updated: string; // ISO 8601 timestamp
  version: string;
  total_countries: number;
  data_sources: string[];
  notes?: string;
}

// ============================================================================
// Carrier Query & Filter Types
// ============================================================================

/**
 * Query parameters for carrier search
 */
export interface CarrierQuery {
  country?: string; // ISO 3166-1 alpha-2
  region?: CarrierRegion;
  type?: CarrierType | 'instant';
  capabilities?: Partial<ExtendedCarrierCapabilities>;
  international?: boolean;
  api_available?: boolean;
}

/**
 * Carrier comparison result
 */
export interface CarrierComparison {
  carrier: CarrierData;
  service: CarrierService;
  estimatedCost?: Money;
  estimatedDeliveryDays?: number;
  score?: number; // 0-100 overall score
  pros: string[];
  cons: string[];
}

/**
 * Carrier recommendation based on requirements
 */
export interface CarrierRecommendation {
  origin: string; // Country code
  destination: string; // Country code
  weight_kg: number;
  dimensions_cm?: number[];
  value?: Money;
  required_capabilities?: string[];
  recommendations: CarrierComparison[];
  timestamp: Date;
}

// ============================================================================
// Carrier Integration Types
// ============================================================================

/**
 * Carrier API configuration
 */
export interface CarrierAPIConfig {
  carrier_id: string;
  carrier_code: string;
  api_endpoint?: string;
  api_key?: string;
  api_secret?: string;
  sandbox_mode: boolean;
  rate_limit?: {
    requests_per_minute: number;
    requests_per_day: number;
  };
}

/**
 * Carrier tracking request
 */
export interface CarrierTrackingRequest {
  carrier_code: string;
  tracking_number: string;
  additional_reference?: string;
}

/**
 * Carrier tracking response (standardized)
 */
export interface CarrierTrackingResponse {
  carrier: CarrierData;
  tracking_number: string;
  status: string;
  events: TrackingEvent[];
  estimated_delivery?: Date;
  current_location?: string;
  last_updated: Date;
}

/**
 * Tracking event
 */
export interface TrackingEvent {
  timestamp: Date;
  status: string;
  location?: string;
  description: string;
  facility?: string;
}

/**
 * Shipping rate request
 */
export interface ShippingRateRequest {
  origin_country: string;
  destination_country: string;
  weight_kg: number;
  dimensions_cm?: {
    length: number;
    width: number;
    height: number;
  };
  value?: Money;
  service_type?: ServiceType;
  carriers?: string[]; // Specific carrier codes to query
}

/**
 * Shipping rate response
 */
export interface ShippingRateResponse {
  carrier: CarrierData;
  service: CarrierService;
  rate: Money;
  estimated_delivery_days: number;
  available: boolean;
  restrictions?: string[];
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  CarrierData,
  CarrierName,
  CarrierRegion,
  CarrierService,
  ServiceType,
  ExtendedCarrierCapabilities,
  CarrierCoverage,
  WorldwideCarriersDatabase,
  CarrierDatabaseMetadata,
  CarrierQuery,
  CarrierComparison,
  CarrierRecommendation,
  CarrierAPIConfig,
  CarrierTrackingRequest,
  CarrierTrackingResponse,
  TrackingEvent,
  ShippingRateRequest,
  ShippingRateResponse,
};
