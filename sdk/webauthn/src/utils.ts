/**
 * Platform authenticator detection and capability checking utilities
 */

import type { PlatformAuthenticatorInfo } from './types';

/**
 * Check if WebAuthn is supported in the current browser
 */
export function supportsWebAuthn(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined'
  );
}

/**
 * Check if platform authenticator is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!supportsWebAuthn()) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Check if conditional UI (autofill) is supported
 */
export async function supportsConditionalUI(): Promise<boolean> {
  if (!supportsWebAuthn()) {
    return false;
  }

  try {
    // Check if conditional mediation is available
    return await PublicKeyCredential.isConditionalMediationAvailable();
  } catch {
    return false;
  }
}

/**
 * Detect platform type
 */
export function detectPlatform(): 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown' {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'unknown';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  if (/win/.test(platform)) {
    return 'windows';
  }
  if (/mac/.test(platform) && !/iphone|ipad|ipod/.test(userAgent)) {
    return 'macos';
  }
  if (/linux/.test(platform)) {
    return 'linux';
  }

  return 'unknown';
}

/**
 * Detect browser type
 */
export function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'unknown';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/edg/.test(userAgent)) {
    return 'edge';
  }
  if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) {
    return 'chrome';
  }
  if (/firefox/.test(userAgent)) {
    return 'firefox';
  }
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    return 'safari';
  }

  return 'unknown';
}

/**
 * Detect platform authenticator capabilities
 */
export async function detectPlatformAuthenticator(): Promise<PlatformAuthenticatorInfo> {
  const webAuthnSupported = supportsWebAuthn();
  const available = webAuthnSupported
    ? await isPlatformAuthenticatorAvailable()
    : false;
  const conditionalUISupported = webAuthnSupported
    ? await supportsConditionalUI()
    : false;

  return {
    available,
    conditionalUISupported,
    webAuthnSupported,
    platform: detectPlatform(),
    browser: detectBrowser(),
  };
}

/**
 * Get user-friendly error message for WebAuthn errors
 */
export function getWebAuthnErrorMessage(error: Error): string {
  const errorName = error.name;

  switch (errorName) {
    case 'NotAllowedError':
      return 'Authentication was cancelled or timed out. Please try again.';
    case 'SecurityError':
      return 'Security error. Make sure you are using HTTPS.';
    case 'NotSupportedError':
      return 'WebAuthn is not supported in this browser.';
    case 'InvalidStateError':
      return 'This authenticator is already registered.';
    case 'ConstraintError':
      return 'The authenticator does not support the required features.';
    case 'UnknownError':
      return 'An unknown error occurred. Please try again.';
    case 'AbortError':
      return 'The operation was aborted.';
    default:
      return error.message || 'An error occurred during authentication.';
  }
}

/**
 * Check if the current context is secure (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

/**
 * Get supported public key algorithms
 */
export function getSupportedAlgorithms(): PublicKeyCredentialParameters[] {
  return [
    { type: 'public-key', alg: -7 },  // ES256 (recommended)
    { type: 'public-key', alg: -257 }, // RS256
    { type: 'public-key', alg: -8 },  // EdDSA
  ];
}
