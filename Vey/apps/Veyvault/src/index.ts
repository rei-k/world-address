/**
 * Veyvault Application Entry Point
 * 
 * Exports all services, clients, and types for use in the application
 */

// API Client
export { VeyvaultClient, createVeyvaultClient } from './api/client';

// Services
export { AddressService } from './services/address.service';
export { AuthService, createAuthService } from './services/auth.service';
export type { OAuthProvider } from './services/auth.service';

// Types
export type {
  User,
  Address,
  Friend,
  AddressToken,
  OAuthResponse,
  ApiConfig,
  CreateAddressRequest,
  CreateAddressResponse,
  FriendInvitation,
  DeliveryTracking,
  TrackingEvent,
  VeyformSite,
  SiteSearchRequest,
  SiteSearchResponse,
  SiteAccess,
  SiteAccessPermission,
  RevokeAccessRequest,
  SiteAccessHistory,
} from './types';
