/**
 * @vey/core - WebAuthn / FIDO2 Biometric Authentication
 * 
 * Provides passwordless authentication using biometrics, security keys,
 * or platform authenticators (Face ID, Touch ID, Windows Hello, etc.)
 */

/**
 * PublicKeyCredentialCreationOptions with typed extensions
 */
export interface WebAuthnRegistrationOptions {
  challenge: ArrayBuffer;
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: ArrayBuffer;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: {
    type: 'public-key';
    alg: number; // -7 (ES256), -257 (RS256)
  }[];
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    residentKey?: 'discouraged' | 'preferred' | 'required';
    userVerification?: 'required' | 'preferred' | 'discouraged';
  };
  excludeCredentials?: {
    type: 'public-key';
    id: ArrayBuffer;
    transports?: ('usb' | 'nfc' | 'ble' | 'internal')[];
  }[];
}

/**
 * PublicKeyCredentialRequestOptions for authentication
 */
export interface WebAuthnAuthenticationOptions {
  challenge: ArrayBuffer;
  timeout?: number;
  rpId?: string;
  allowCredentials?: {
    type: 'public-key';
    id: ArrayBuffer;
    transports?: ('usb' | 'nfc' | 'ble' | 'internal')[];
  }[];
  userVerification?: 'required' | 'preferred' | 'discouraged';
}

/**
 * Credential registration result
 */
export interface WebAuthnRegistrationResult {
  credentialId: string; // Base64URL encoded
  publicKey: string; // Base64URL encoded
  attestationObject: string; // Base64URL encoded
  clientDataJSON: string; // Base64URL encoded
  authenticatorData: string; // Base64URL encoded
  transports?: string[];
}

/**
 * Authentication result
 */
export interface WebAuthnAuthenticationResult {
  credentialId: string; // Base64URL encoded
  authenticatorData: string; // Base64URL encoded
  clientDataJSON: string; // Base64URL encoded
  signature: string; // Base64URL encoded
  userHandle?: string; // Base64URL encoded
}

/**
 * WebAuthn configuration
 */
export interface WebAuthnConfig {
  rpName: string; // Relying Party name (your app name)
  rpId?: string; // Relying Party ID (your domain, e.g., 'example.com')
  timeout?: number; // Timeout in milliseconds (default: 60000)
  userVerification?: 'required' | 'preferred' | 'discouraged'; // Default: 'preferred'
  authenticatorAttachment?: 'platform' | 'cross-platform'; // Default: undefined (both)
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise'; // Default: 'none'
}

/**
 * Check if WebAuthn is supported in this browser
 */
export function isWebAuthnSupported(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  );
}

/**
 * Check if platform authenticator is available (Face ID, Touch ID, Windows Hello)
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }
  
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Check if conditional UI is available (autofill for passkeys)
 */
export async function isConditionalUIAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }
  
  try {
    return await (window.PublicKeyCredential as any).isConditionalMediationAvailable?.() ?? false;
  } catch {
    return false;
  }
}

/**
 * Convert string to ArrayBuffer
 */
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

/**
 * Convert ArrayBuffer to Base64URL
 */
function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert Base64URL to ArrayBuffer
 */
function base64URLToArrayBuffer(base64URL: string): ArrayBuffer {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random challenge for WebAuthn
 */
export function generateChallenge(length: number = 32): ArrayBuffer {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array.buffer;
}

/**
 * Register a new credential (create passkey)
 * 
 * @param userId - Unique user identifier (will be converted to ArrayBuffer)
 * @param username - User's username or email
 * @param displayName - User's display name
 * @param config - WebAuthn configuration
 * @param challenge - Optional challenge (will be generated if not provided)
 * @returns Registration result with credential data
 */
export async function registerCredential(
  userId: string,
  username: string,
  displayName: string,
  config: WebAuthnConfig,
  challenge?: ArrayBuffer
): Promise<WebAuthnRegistrationResult> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  const actualChallenge = challenge ?? generateChallenge();
  const userIdBuffer = stringToArrayBuffer(userId);

  const options: WebAuthnRegistrationOptions = {
    challenge: actualChallenge,
    rp: {
      name: config.rpName,
      id: config.rpId,
    },
    user: {
      id: userIdBuffer,
      name: username,
      displayName: displayName,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },  // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    timeout: config.timeout ?? 60000,
    attestation: config.attestation ?? 'none',
    authenticatorSelection: {
      authenticatorAttachment: config.authenticatorAttachment,
      requireResidentKey: false,
      residentKey: 'preferred',
      userVerification: config.userVerification ?? 'preferred',
    },
  };

  const credential = await navigator.credentials.create({
    publicKey: options as PublicKeyCredentialCreationOptions,
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Failed to create credential');
  }

  const response = credential.response as AuthenticatorAttestationResponse;
  
  return {
    credentialId: arrayBufferToBase64URL(credential.rawId),
    publicKey: arrayBufferToBase64URL(response.getPublicKey()!),
    attestationObject: arrayBufferToBase64URL(response.attestationObject),
    clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
    authenticatorData: arrayBufferToBase64URL(response.getAuthenticatorData()),
    transports: response.getTransports?.(),
  };
}

/**
 * Authenticate with an existing credential (use passkey)
 * 
 * @param config - WebAuthn configuration
 * @param challenge - Optional challenge (will be generated if not provided)
 * @param allowCredentials - Optional list of allowed credentials
 * @param mediation - Credential mediation mode ('conditional' for autofill)
 * @returns Authentication result with assertion data
 */
export async function authenticateCredential(
  config: WebAuthnConfig,
  challenge?: ArrayBuffer,
  allowCredentials?: { id: string; transports?: string[] }[],
  mediation?: CredentialMediationRequirement
): Promise<WebAuthnAuthenticationResult> {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  const actualChallenge = challenge ?? generateChallenge();

  const options: WebAuthnAuthenticationOptions = {
    challenge: actualChallenge,
    timeout: config.timeout ?? 60000,
    rpId: config.rpId,
    userVerification: config.userVerification ?? 'preferred',
  };

  if (allowCredentials && allowCredentials.length > 0) {
    options.allowCredentials = allowCredentials.map(cred => ({
      type: 'public-key',
      id: base64URLToArrayBuffer(cred.id),
      transports: cred.transports as ('usb' | 'nfc' | 'ble' | 'internal')[] | undefined,
    }));
  }

  const credential = await navigator.credentials.get({
    publicKey: options as PublicKeyCredentialRequestOptions,
    mediation,
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Failed to get credential');
  }

  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    credentialId: arrayBufferToBase64URL(credential.rawId),
    authenticatorData: arrayBufferToBase64URL(response.authenticatorData),
    clientDataJSON: arrayBufferToBase64URL(response.clientDataJSON),
    signature: arrayBufferToBase64URL(response.signature),
    userHandle: response.userHandle ? arrayBufferToBase64URL(response.userHandle) : undefined,
  };
}

/**
 * Helper to parse client data JSON
 */
export function parseClientDataJSON(clientDataJSON: string): {
  type: string;
  challenge: string;
  origin: string;
  crossOrigin?: boolean;
} {
  const buffer = base64URLToArrayBuffer(clientDataJSON);
  const decoder = new TextDecoder();
  const json = decoder.decode(buffer);
  return JSON.parse(json);
}

/**
 * Helper to verify the origin matches expected origin
 */
export function verifyOrigin(clientDataJSON: string, expectedOrigin: string): boolean {
  const data = parseClientDataJSON(clientDataJSON);
  return data.origin === expectedOrigin;
}

/**
 * Create a WebAuthn client with configuration
 */
export class WebAuthnClient {
  private config: WebAuthnConfig;

  constructor(config: WebAuthnConfig) {
    this.config = config;
  }

  /**
   * Check if WebAuthn is supported
   */
  isSupported(): boolean {
    return isWebAuthnSupported();
  }

  /**
   * Check if platform authenticator is available
   */
  async isPlatformAvailable(): Promise<boolean> {
    return isPlatformAuthenticatorAvailable();
  }

  /**
   * Check if conditional UI is available
   */
  async isConditionalUIAvailable(): Promise<boolean> {
    return isConditionalUIAvailable();
  }

  /**
   * Register a new credential
   */
  async register(
    userId: string,
    username: string,
    displayName: string,
    challenge?: ArrayBuffer
  ): Promise<WebAuthnRegistrationResult> {
    return registerCredential(userId, username, displayName, this.config, challenge);
  }

  /**
   * Authenticate with a credential
   */
  async authenticate(
    challenge?: ArrayBuffer,
    allowCredentials?: { id: string; transports?: string[] }[],
    mediation?: CredentialMediationRequirement
  ): Promise<WebAuthnAuthenticationResult> {
    return authenticateCredential(this.config, challenge, allowCredentials, mediation);
  }

  /**
   * Authenticate with autofill (conditional UI)
   */
  async authenticateWithAutofill(
    challenge?: ArrayBuffer
  ): Promise<WebAuthnAuthenticationResult> {
    const isAvailable = await this.isConditionalUIAvailable();
    if (!isAvailable) {
      throw new Error('Conditional UI (autofill) is not available in this browser');
    }
    return this.authenticate(challenge, undefined, 'conditional');
  }
}

/**
 * Create a WebAuthn client
 */
export function createWebAuthnClient(config: WebAuthnConfig): WebAuthnClient {
  return new WebAuthnClient(config);
}
