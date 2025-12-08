/**
 * @vey/webauthn - WebAuthn/FIDO2 Biometric Authentication SDK
 * 
 * Provides passwordless authentication using biometrics (fingerprint, Face ID, etc.)
 * following the Web Authentication API (WebAuthn) standard.
 */

export { WebAuthnClient } from './client';
export { WebAuthnCrypto } from './crypto';
export { PasskeyManager } from './passkey-manager';
export type {
  WebAuthnConfig,
  RegistrationOptions,
  AuthenticationOptions,
  RegistrationResult,
  AuthenticationResult,
  PasskeyCredential,
  PlatformAuthenticatorInfo,
} from './types';
export {
  detectPlatformAuthenticator,
  supportsConditionalUI,
  supportsWebAuthn,
} from './utils';
