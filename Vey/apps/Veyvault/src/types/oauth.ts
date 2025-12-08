/**
 * OAuth 2.0 / OpenID Connect Type Definitions
 * For Veyvault Identity Provider (IdP)
 */

/**
 * OAuth Client Application
 * Represents a third-party app that integrates with Veyvault
 */
export interface OAuthClient {
  id: string;
  secret: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  redirectUris: string[];
  allowedScopes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * OAuth 2.0 Authorization Request
 * GET /oauth/authorize
 */
export interface OAuthAuthorizationRequest {
  clientId: string;
  redirectUri: string;
  responseType: 'code'; // Only authorization code flow supported
  scope: string; // Space-separated scopes
  state?: string; // Recommended for CSRF protection
  nonce?: string; // Required for OpenID Connect
  
  // PKCE parameters
  codeChallenge?: string;
  codeChallengeMethod?: 'S256';
  
  // Optional parameters
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
  maxAge?: number;
  display?: 'page' | 'popup' | 'touch' | 'wap';
  uiLocales?: string;
  loginHint?: string;
}

/**
 * OAuth 2.0 Token Request
 * POST /oauth/token
 */
export interface OAuthTokenRequest {
  grantType: 'authorization_code' | 'refresh_token';
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret?: string;
  
  // PKCE parameter
  codeVerifier?: string;
  
  // For refresh token grant
  refreshToken?: string;
}

/**
 * OAuth 2.0 Token Response
 */
export interface OAuthTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // Seconds until expiration
  refreshToken?: string;
  idToken?: string; // OpenID Connect ID Token (JWT)
  scope?: string;
}

/**
 * OpenID Connect UserInfo Response
 * GET /oauth/userinfo
 */
export interface UserInfo {
  // Standard OIDC claims
  sub: string; // Subject (user ID / DID)
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  updated_at?: number;
  
  // Veyvault custom claims
  convey_id?: string; // ConveyID (e.g., taro@convey)
  address_verified?: boolean;
  address_count?: number;
  primary_address_country?: string;
  address_zkp?: string; // ZKP proof token for address
  trust_score?: number;
  friend_count?: number;
  delivery_count?: number;
}

/**
 * User consent decision
 */
export interface ConsentDecision {
  approved: boolean;
  scope: string[];
  rememberDecision?: boolean;
  selectedAddress?: string; // For address sharing
}

/**
 * Consent record
 * Tracks user's permission grants to OAuth clients
 */
export interface ConsentRecord {
  id: string;
  userId: string;
  clientId: string;
  scope: string[];
  grantedAt: Date;
  expiresAt?: Date;
  isRemembered: boolean;
  lastUsedAt?: Date;
  usageCount: number;
}

/**
 * OAuth scope definition
 */
export interface OAuthScope {
  name: string;
  displayName: string;
  description: string;
  category: 'standard' | 'veyvault' | 'sensitive';
  requiresConsent: boolean;
}

/**
 * Available OAuth scopes
 */
export const OAUTH_SCOPES: Record<string, OAuthScope> = {
  openid: {
    name: 'openid',
    displayName: 'OpenID Connect',
    description: 'Enables OpenID Connect authentication',
    category: 'standard',
    requiresConsent: false,
  },
  profile: {
    name: 'profile',
    displayName: 'Profile Information',
    description: 'Your name, picture, and basic profile information',
    category: 'standard',
    requiresConsent: true,
  },
  email: {
    name: 'email',
    displayName: 'Email Address',
    description: 'Your email address',
    category: 'standard',
    requiresConsent: true,
  },
  address: {
    name: 'address',
    displayName: 'Address (ZKP)',
    description: 'Access to your verified address (encrypted with Zero-Knowledge Proof)',
    category: 'veyvault',
    requiresConsent: true,
  },
  conveyid: {
    name: 'conveyid',
    displayName: 'ConveyID',
    description: 'Your ConveyID for simplified delivery',
    category: 'veyvault',
    requiresConsent: true,
  },
  delivery: {
    name: 'delivery',
    displayName: 'Delivery Permissions',
    description: 'Allow this app to send deliveries to your address',
    category: 'veyvault',
    requiresConsent: true,
  },
  friends: {
    name: 'friends',
    displayName: 'Friend List',
    description: 'Access your friend list (names only, addresses protected by ZKP)',
    category: 'veyvault',
    requiresConsent: true,
  },
  trust_score: {
    name: 'trust_score',
    displayName: 'Trust Score',
    description: 'Your trust score and reputation information',
    category: 'veyvault',
    requiresConsent: true,
  },
  offline_access: {
    name: 'offline_access',
    displayName: 'Offline Access',
    description: 'Keep access to your data even when you\'re not using the app',
    category: 'sensitive',
    requiresConsent: true,
  },
};

/**
 * OAuth error types
 */
export type OAuthErrorCode =
  | 'invalid_request'
  | 'unauthorized_client'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unsupported_grant_type'
  | 'invalid_token';

/**
 * OAuth error response
 */
export interface OAuthErrorResponse {
  error: OAuthErrorCode;
  error_description?: string;
  error_uri?: string;
  state?: string;
}

/**
 * QR Code authentication session
 */
export interface QRAuthSession {
  id: string;
  sessionId: string;
  challenge: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
  qrCode: string; // Base64 encoded QR code image
  status: 'pending' | 'scanned' | 'approved' | 'denied' | 'expired';
  deviceInfo?: {
    userAgent: string;
    ip: string;
    location?: string;
  };
  createdAt: Date;
  expiresAt: Date;
  approvedAt?: Date;
  approvedBy?: string; // User ID who approved
}

/**
 * NFC authentication session
 */
export interface NFCAuthSession {
  id: string;
  terminalId: string;
  terminalName: string;
  terminalLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  nfcUid: string;
  userId?: string;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  sessionToken?: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Biometric authentication request
 */
export interface BiometricAuthRequest {
  challenge: string;
  rpId: string; // Relying Party ID (domain)
  userId: string;
  userDisplayName: string;
  timeout: number;
  userVerification: 'required' | 'preferred' | 'discouraged';
  authenticatorAttachment?: 'platform' | 'cross-platform';
}

/**
 * Biometric authentication response
 */
export interface BiometricAuthResponse {
  id: string;
  rawId: string;
  response: {
    authenticatorData: string;
    clientDataJSON: string;
    signature: string;
    userHandle?: string;
  };
  type: 'public-key';
}

/**
 * Multi-factor authentication configuration
 */
export interface MFAConfig {
  enabled: boolean;
  methods: MFAMethod[];
  defaultMethod?: MFAMethodType;
  backupCodes: string[];
  backupCodesUsed: number;
}

/**
 * MFA method
 */
export interface MFAMethod {
  id: string;
  type: MFAMethodType;
  name: string;
  enabled: boolean;
  isPrimary: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  
  // Type-specific data
  totpSecret?: string; // For TOTP
  phoneNumber?: string; // For SMS
  credentialId?: string; // For FIDO2/WebAuthn
}

/**
 * MFA method types
 */
export type MFAMethodType = 
  | 'totp'           // Time-based One-Time Password (Google Authenticator, etc.)
  | 'sms'            // SMS OTP
  | 'email'          // Email OTP
  | 'biometric'      // FIDO2/WebAuthn biometric
  | 'address'        // Address verification (Veyvault-specific)
  | 'friend';        // Friend endorsement (Veyvault-specific)

/**
 * MFA verification request
 */
export interface MFAVerificationRequest {
  sessionId: string;
  method: MFAMethodType;
  code?: string; // For TOTP/SMS/Email
  biometricResponse?: BiometricAuthResponse; // For biometric
  addressProof?: string; // For address verification
  friendConfirmation?: string; // For friend endorsement
}

/**
 * Session information
 */
export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  os: string;
  browser: string;
  ipAddress: string;
  location?: {
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

/**
 * Audit log entry for OAuth events
 */
export interface OAuthAuditLog {
  id: string;
  userId: string;
  clientId?: string;
  eventType: OAuthEventType;
  eventDetails: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
  errorCode?: string;
  timestamp: Date;
}

/**
 * OAuth event types for audit logging
 */
export type OAuthEventType =
  | 'authorization_requested'
  | 'authorization_approved'
  | 'authorization_denied'
  | 'token_issued'
  | 'token_refreshed'
  | 'token_revoked'
  | 'userinfo_accessed'
  | 'consent_granted'
  | 'consent_revoked'
  | 'qr_auth_initiated'
  | 'qr_auth_approved'
  | 'nfc_auth_verified'
  | 'biometric_auth_success'
  | 'mfa_required'
  | 'mfa_verified'
  | 'session_created'
  | 'session_ended'
  | 'suspicious_activity_detected';

/**
 * Device fingerprint for fraud detection
 */
export interface DeviceFingerprint {
  id: string;
  userId: string;
  fingerprint: string; // Hash of device characteristics
  characteristics: {
    userAgent: string;
    screen: {
      width: number;
      height: number;
      colorDepth: number;
    };
    timezone: string;
    language: string;
    platform: string;
    plugins: string[];
    fonts: string[];
    canvas: string; // Canvas fingerprint
    webgl: string; // WebGL fingerprint
  };
  trusted: boolean;
  firstSeenAt: Date;
  lastSeenAt: Date;
  usageCount: number;
}

/**
 * Trust score calculation
 */
export interface TrustScore {
  overall: number; // 0-100
  components: {
    addressVerified: number;
    emailVerified: number;
    phoneVerified: number;
    deliveryHistory: number;
    friendEndorsements: number;
    accountAge: number;
  };
  lastCalculated: Date;
  history: TrustScoreHistory[];
}

/**
 * Trust score history entry
 */
export interface TrustScoreHistory {
  score: number;
  reason: string;
  timestamp: Date;
}

/**
 * Delivery permission
 */
export interface DeliveryPermission {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  addressId: string;
  grantedAt: Date;
  expiresAt?: Date;
  maxDeliveries?: number;
  deliveriesUsed: number;
  isActive: boolean;
  lastUsedAt?: Date;
}

/**
 * Address sharing configuration
 */
export interface AddressSharingConfig {
  mode: 'none' | 'zkp' | 'full';
  zkpOnly: boolean; // Always use ZKP, never share raw address
  allowedClients: string[]; // Client IDs allowed to request address
  autoApprove: boolean; // Auto-approve trusted clients
  requireConfirmation: boolean; // Always ask for confirmation
  expiryDays?: number; // Auto-expire permissions after N days
}
