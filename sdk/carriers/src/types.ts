/**
 * Type definitions for carrier integration
 */

export interface Address {
  country: string;
  province: string;
  city: string;
  district?: string;
  street: string;
  building?: string;
  unit?: string;
  room?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Contact {
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

export interface Recipient extends Contact {
  address: Address;
}

export interface Sender extends Contact {
  address: Address;
}

export interface CargoItem {
  name: string;
  quantity: number;
  weight: number; // kg
  volume?: number; // m³
  value?: number; // currency value
  currency?: string;
  hsCode?: string; // Harmonized System code for customs
  description?: string;
}

export interface Shipment {
  sender: Sender;
  recipient: Recipient;
  items: CargoItem[];
  preferredPickupTime?: Date;
  deliveryRequirement?: 'STANDARD' | 'EXPRESS' | 'ECONOMY';
  paymentMethod: 'SENDER_PAY' | 'RECIPIENT_PAY' | 'THIRD_PARTY';
  insurance?: {
    value: number;
    currency: string;
  };
  notes?: string;
}

export interface ValidationResult {
  valid: boolean;
  deliverable: boolean;
  prohibitedItems: string[];
  estimatedCost?: {
    amount: number;
    currency: string;
    breakdown?: {
      base: number;
      fuel: number;
      insurance?: number;
      tax?: number;
    };
  };
  estimatedDeliveryTime?: {
    min: number; // hours
    max: number;
  };
  warnings?: string[];
  reason?: string;
}

export interface PickupOrder {
  shipment: Shipment;
  pickupTime?: Date | 'ASAP';
  paymentMethod: 'SENDER_PAY' | 'RECIPIENT_PAY' | 'THIRD_PARTY';
  serviceType?: string;
}

export interface OrderResult {
  waybillNumber: string;
  orderId: string;
  pickupId?: string;
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  trackingUrl?: string;
  qrCode?: string;
}

export interface TrackingEvent {
  timestamp: Date;
  status: TrackingStatus;
  location?: string;
  description: string;
  operator?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export enum TrackingStatus {
  ORDER_CREATED = 'ORDER_CREATED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_AT_FACILITY = 'ARRIVED_AT_FACILITY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERY_ATTEMPTED = 'DELIVERY_ATTEMPTED',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export interface TrackingInfo {
  waybillNumber: string;
  currentStatus: TrackingStatus;
  events: TrackingEvent[];
  estimatedDelivery?: Date;
  currentLocation?: string;
}

export interface CancelResult {
  success: boolean;
  refund?: {
    amount: number;
    currency: string;
  };
  reason?: string;
}

export interface HandshakeToken {
  version: string;
  type: 'PICKUP' | 'DELIVERY';
  waybillNumber: string;
  orderId: string;
  carrierCode: string;
  timestamp: number;
  expiresAt: number;
  signature: string;
  nonce: string;
  metadata?: Record<string, any>;
}

export interface TokenVerification {
  valid: boolean;
  token?: HandshakeToken;
  reason?: 'TOKEN_EXPIRED' | 'INVALID_SIGNATURE' | 'NONCE_REUSED' | 'INVALID_TOKEN';
}

export interface CarrierConfig {
  apiKey: string;
  apiSecret: string;
  customerId?: string;
  environment?: 'sandbox' | 'production';
  timeout?: number;
  retries?: number;
}
