/**
 * Common Types for Mini-Programs
 */

export interface ShippingItem {
  name: string;
  quantity: number;
  weight: number;
  value?: number;
  category?: string;
}

export interface Address {
  pid: string;
  countryCode: string;
  postalCode?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  building?: string;
  room?: string;
  recipientName: string;
  phoneNumber: string;
}

export interface ShippingFormData {
  recipientPID: string;
  recipientAddress?: Address;
  items: ShippingItem[];
  carrier: 'SF_EXPRESS' | 'JD_LOGISTICS' | 'YTO_EXPRESS' | 'ZTO_EXPRESS';
  notes?: string;
  pickupTime?: string;
  paymentMethod?: 'SENDER_PAY' | 'RECIPIENT_PAY';
}

export interface ValidationResult {
  valid: boolean;
  deliverable?: boolean;
  reason?: string;
  prohibitedItems?: string[];
  warnings?: string[];
}

export interface ShippingOrder {
  waybillNumber: string;
  handshakeToken: string;
  pickupId: string;
  estimatedPickupTime?: string;
  qrCode?: string;
}

export interface TrackingInfo {
  waybillNumber: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  currentLocation?: string;
  timeline: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface HandshakeToken {
  waybillNumber: string;
  pickupId: string;
  timestamp: number;
  signature: string;
  qrData: string;
}

export interface MiniProgramConfig {
  apiBaseUrl: string;
  appId: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
