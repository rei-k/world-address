/**
 * WebAuthn Client - Main class for WebAuthn operations
 */

import type {
  WebAuthnConfig,
  RegistrationOptions,
  AuthenticationOptions,
  RegistrationResult,
  AuthenticationResult,
} from './types';
import { arrayBufferToBase64url, base64urlToArrayBuffer } from './crypto';
import {
  supportsWebAuthn,
  isSecureContext,
  getSupportedAlgorithms,
  getWebAuthnErrorMessage,
} from './utils';

/**
 * WebAuthn Client for passwordless authentication
 * 
 * @example
 * ```typescript
 * const client = new WebAuthnClient({
 *   rpId: 'veyvault.com',
 *   rpName: 'Veyvault',
 *   apiEndpoint: 'https://api.veyvault.com/webauthn'
 * });
 * 
 * // Register new credential
 * const result = await client.register({
 *   userId: 'did:vey:1234',
 *   userName: 'taro@example.com',
 *   userDisplayName: 'Taro Yamada',
 *   challenge: serverChallenge
 * });
 * 
 * // Authenticate
 * const authResult = await client.authenticate({
 *   challenge: serverChallenge
 * });
 * ```
 */
export class WebAuthnClient {
  private config: Required<WebAuthnConfig>;

  constructor(config: WebAuthnConfig) {
    this.config = {
      timeout: 60000,
      userVerification: 'required',
      authenticatorAttachment: undefined,
      requireResidentKey: false,
      ...config,
    };

    // Validate environment
    if (!supportsWebAuthn()) {
      console.warn('WebAuthn is not supported in this browser');
    }

    if (!isSecureContext()) {
      console.warn('WebAuthn requires a secure context (HTTPS or localhost)');
    }
  }

  /**
   * Register a new credential (passkey)
   * 
   * @param options - Registration options
   * @returns Registration result to send to server
   * @throws {Error} If registration fails
   */
  async register(options: RegistrationOptions): Promise<RegistrationResult> {
    if (!supportsWebAuthn()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    if (!isSecureContext()) {
      throw new Error('WebAuthn requires a secure context (HTTPS)');
    }

    try {
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64urlToArrayBuffer(options.challenge),
        rp: {
          id: this.config.rpId,
          name: this.config.rpName,
        },
        user: {
          id: new TextEncoder().encode(options.userId),
          name: options.userName,
          displayName: options.userDisplayName || options.userName,
        },
        pubKeyCredParams: getSupportedAlgorithms(),
        timeout: options.timeout || this.config.timeout,
        attestation: 'none', // Privacy-preserving
        authenticatorSelection: {
          authenticatorAttachment: this.config.authenticatorAttachment,
          requireResidentKey: this.config.requireResidentKey,
          residentKey: this.config.requireResidentKey ? 'required' : 'preferred',
          userVerification: this.config.userVerification,
        },
        excludeCredentials: options.excludeCredentials?.map((cred) => ({
          ...cred,
          id: base64urlToArrayBuffer(cred.id as string),
        })),
      };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      return {
        credentialId: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
          attestationObject: arrayBufferToBase64url(response.attestationObject),
          transports: response.getTransports?.() as AuthenticatorTransport[],
        },
        type: 'public-key',
        authenticatorAttachment: credential.authenticatorAttachment as
          | 'platform'
          | 'cross-platform'
          | undefined,
      };
    } catch (error) {
      const message = getWebAuthnErrorMessage(error as Error);
      throw new Error(`Registration failed: ${message}`);
    }
  }

  /**
   * Authenticate with an existing credential
   * 
   * @param options - Authentication options
   * @returns Authentication result to send to server
   * @throws {Error} If authentication fails
   */
  async authenticate(
    options: AuthenticationOptions
  ): Promise<AuthenticationResult> {
    if (!supportsWebAuthn()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    if (!isSecureContext()) {
      throw new Error('WebAuthn requires a secure context (HTTPS)');
    }

    try {
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64urlToArrayBuffer(options.challenge),
        timeout: options.timeout || this.config.timeout,
        rpId: this.config.rpId,
        userVerification: this.config.userVerification,
        allowCredentials: options.allowCredentials?.map((cred) => ({
          ...cred,
          id: base64urlToArrayBuffer(cred.id as string),
        })),
      };

      // Use conditional UI if requested and supported
      const credential = (await navigator.credentials.get({
        publicKey: publicKeyOptions,
        mediation: options.conditionalUI ? 'conditional' : undefined,
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error('Failed to get credential');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      return {
        credentialId: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
          authenticatorData: arrayBufferToBase64url(response.authenticatorData),
          signature: arrayBufferToBase64url(response.signature),
          userHandle: response.userHandle
            ? arrayBufferToBase64url(response.userHandle)
            : undefined,
        },
        type: 'public-key',
        authenticatorAttachment: credential.authenticatorAttachment as
          | 'platform'
          | 'cross-platform'
          | undefined,
      };
    } catch (error) {
      const message = getWebAuthnErrorMessage(error as Error);
      throw new Error(`Authentication failed: ${message}`);
    }
  }

  /**
   * Start conditional UI authentication (autofill)
   * This allows users to authenticate directly from password autofill UI
   * 
   * @param options - Authentication options
   * @returns Authentication result when user selects a credential
   */
  async authenticateWithConditionalUI(
    options: Omit<AuthenticationOptions, 'conditionalUI'>
  ): Promise<AuthenticationResult> {
    return this.authenticate({
      ...options,
      conditionalUI: true,
      allowCredentials: [], // Empty to allow any credential
    });
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<Required<WebAuthnConfig>> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WebAuthnConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
