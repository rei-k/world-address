/**
 * WebAuthn Types
 */

/**
 * WebAuthn client configuration
 */
export interface WebAuthnConfig {
  /**
   * Relying party ID (usually your domain)
   * @example 'veyvault.com'
   */
  rpId: string;

  /**
   * Relying party name (displayed to user)
   * @example 'Veyvault'
   */
  rpName: string;

  /**
   * API endpoint for WebAuthn operations
   */
  apiEndpoint: string;

  /**
   * Timeout for WebAuthn operations in milliseconds
   * @default 60000 (60 seconds)
   */
  timeout?: number;

  /**
   * User verification requirement
   * @default 'required'
   */
  userVerification?: UserVerificationRequirement;

  /**
   * Authenticator attachment preference
   * @default undefined (any authenticator)
   */
  authenticatorAttachment?: AuthenticatorAttachment;

  /**
   * Require resident key (discoverable credential)
   * @default false
   */
  requireResidentKey?: boolean;
}

/**
 * Registration options for creating a new credential
 */
export interface RegistrationOptions {
  /**
   * User identifier (DID, email, etc.)
   */
  userId: string;

  /**
   * User display name
   */
  userName: string;

  /**
   * User display name (short form)
   */
  userDisplayName?: string;

  /**
   * Challenge from server (base64url encoded)
   */
  challenge: string;

  /**
   * Exclude existing credentials to prevent duplicate registration
   */
  excludeCredentials?: PublicKeyCredentialDescriptor[];

  /**
   * Override config timeout
   */
  timeout?: number;
}

/**
 * Authentication options for verifying a credential
 */
export interface AuthenticationOptions {
  /**
   * Challenge from server (base64url encoded)
   */
  challenge: string;

  /**
   * Allowed credentials (empty for conditional UI/autofill)
   */
  allowCredentials?: PublicKeyCredentialDescriptor[];

  /**
   * Override config timeout
   */
  timeout?: number;

  /**
   * Enable conditional UI (autofill)
   */
  conditionalUI?: boolean;
}

/**
 * Registration result
 */
export interface RegistrationResult {
  /**
   * Credential ID (base64url encoded)
   */
  credentialId: string;

  /**
   * Raw credential ID (ArrayBuffer converted to base64url)
   */
  rawId: string;

  /**
   * Attestation response
   */
  response: {
    /**
     * Client data JSON (base64url encoded)
     */
    clientDataJSON: string;

    /**
     * Attestation object (base64url encoded)
     */
    attestationObject: string;

    /**
     * Transports supported by the authenticator
     */
    transports?: AuthenticatorTransport[];
  };

  /**
   * Credential type (always 'public-key')
   */
  type: 'public-key';

  /**
   * Authenticator attachment (platform or cross-platform)
   */
  authenticatorAttachment?: AuthenticatorAttachment;
}

/**
 * Authentication result
 */
export interface AuthenticationResult {
  /**
   * Credential ID (base64url encoded)
   */
  credentialId: string;

  /**
   * Raw credential ID (ArrayBuffer converted to base64url)
   */
  rawId: string;

  /**
   * Assertion response
   */
  response: {
    /**
     * Client data JSON (base64url encoded)
     */
    clientDataJSON: string;

    /**
     * Authenticator data (base64url encoded)
     */
    authenticatorData: string;

    /**
     * Signature (base64url encoded)
     */
    signature: string;

    /**
     * User handle (base64url encoded, optional)
     */
    userHandle?: string;
  };

  /**
   * Credential type (always 'public-key')
   */
  type: 'public-key';

  /**
   * Authenticator attachment
   */
  authenticatorAttachment?: AuthenticatorAttachment;
}

/**
 * Stored passkey credential information
 */
export interface PasskeyCredential {
  /**
   * Credential ID
   */
  id: string;

  /**
   * User-friendly name for the credential
   */
  name: string;

  /**
   * Device/authenticator name
   */
  deviceName?: string;

  /**
   * Creation timestamp
   */
  createdAt: string;

  /**
   * Last used timestamp
   */
  lastUsedAt?: string;

  /**
   * Authenticator attachment type
   */
  authenticatorAttachment?: AuthenticatorAttachment;

  /**
   * Supported transports
   */
  transports?: AuthenticatorTransport[];
}

/**
 * Platform authenticator detection result
 */
export interface PlatformAuthenticatorInfo {
  /**
   * Whether platform authenticator is available
   */
  available: boolean;

  /**
   * Whether conditional UI is supported
   */
  conditionalUISupported: boolean;

  /**
   * Whether WebAuthn is supported
   */
  webAuthnSupported: boolean;

  /**
   * Platform type
   */
  platform?: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';

  /**
   * Browser type
   */
  browser?: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
}

// Re-export standard WebAuthn types
export type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';
export type AuthenticatorAttachment = 'platform' | 'cross-platform';
export type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid';

export interface PublicKeyCredentialDescriptor {
  type: 'public-key';
  id: BufferSource;
  transports?: AuthenticatorTransport[];
}
