/**
 * Veybook Application Types
 * Based on Veybook README.md and data flow diagrams
 */

/**
 * User model - matches User Journey documentation
 */
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  provider: 'google' | 'apple' | 'line' | 'email';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Address model - matches Address Registration Flow
 */
export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  pid: string; // Place ID - hierarchical address identifier
  encryptedData: string; // End-to-end encrypted address data
  label?: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Friend model - matches Friend Management feature
 */
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendEmail?: string;
  status: 'pending' | 'accepted' | 'blocked';
  canSendTo: boolean; // Permission to use friend's address for delivery
  createdAt: Date;
}

/**
 * Address Token - ZKP-based address proof
 * Used for EC site integration without revealing raw address
 */
export interface AddressToken {
  id: string;
  addressId: string;
  userId: string;
  token: string; // ZKP proof token
  expiresAt: Date;
  createdAt: Date;
}

/**
 * OAuth authentication response
 */
export interface OAuthResponse {
  provider: 'google' | 'apple' | 'line';
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

/**
 * API client configuration
 */
export interface ApiConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Address creation request - matches Address Registration Flow
 */
export interface CreateAddressRequest {
  type: 'home' | 'work' | 'other';
  country: string;
  postalCode?: string;
  admin1?: string; // Prefecture/State
  admin2?: string; // City/District
  locality?: string;
  addressLine1: string;
  addressLine2?: string;
  buildingName?: string;
  floor?: string;
  room?: string;
  label?: string;
  isPrimary?: boolean;
}

/**
 * Address creation response
 */
export interface CreateAddressResponse {
  address: Address;
  pid: string;
  validation: {
    isValid: boolean;
    warnings?: string[];
  };
}

/**
 * Friend invitation via QR/NFC
 */
export interface FriendInvitation {
  inviterId: string;
  inviterName: string;
  qrCode: string; // QR code data
  nfcData?: string; // NFC tag data
  expiresAt: Date;
}

/**
 * Delivery tracking info
 */
export interface DeliveryTracking {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tracking event
 */
export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: Date;
}
