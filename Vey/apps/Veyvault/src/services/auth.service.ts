/**
 * Authentication Service
 * Implements OAuth authentication flows
 * Based on User Registration Flow from diagrams/data-flows.md
 */

import type { OAuthResponse, User } from '../types';

export type OAuthProvider = 'google' | 'apple' | 'line';

/**
 * OAuth configuration
 */
interface OAuthConfig {
  google?: {
    clientId: string;
    redirectUri: string;
  };
  apple?: {
    clientId: string;
    redirectUri: string;
  };
  line?: {
    clientId: string;
    redirectUri: string;
  };
}

/**
 * Authentication service
 */
export class AuthService {
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Initialize OAuth flow
   * Step 1 from User Registration Flow: Social Login
   * 
   * @param provider - OAuth provider
   */
  initiateOAuth(provider: OAuthProvider): void {
    const authUrl = this.getAuthUrl(provider);
    window.location.href = authUrl;
  }

  /**
   * Get OAuth authorization URL
   */
  private getAuthUrl(provider: OAuthProvider): string {
    switch (provider) {
      case 'google':
        return this.getGoogleAuthUrl();
      case 'apple':
        return this.getAppleAuthUrl();
      case 'line':
        return this.getLineAuthUrl();
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  /**
   * Get Google OAuth URL
   */
  private getGoogleAuthUrl(): string {
    const config = this.config.google;
    if (!config) {
      throw new Error('Google OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Get Apple OAuth URL
   */
  private getAppleAuthUrl(): string {
    const config = this.config.apple;
    if (!config) {
      throw new Error('Apple OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'name email',
      response_mode: 'form_post',
    });

    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  /**
   * Get LINE OAuth URL
   */
  private getLineAuthUrl(): string {
    const config = this.config.line;
    if (!config) {
      throw new Error('LINE OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'profile openid email',
      state: this.generateState(),
    });

    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }

  /**
   * Generate state parameter for CSRF protection
   * Uses cryptographically secure random values
   */
  private generateState(): string {
    const array = new Uint8Array(16);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else if (typeof global !== 'undefined' && global.crypto) {
      global.crypto.getRandomValues(array);
    } else {
      // Fallback for environments without crypto (should not happen in production)
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Parse OAuth callback
   * Extracts authorization code from callback URL
   */
  parseOAuthCallback(url: string): { code: string; state?: string } {
    const params = new URL(url).searchParams;
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      throw new Error('Authorization code not found in callback');
    }

    return { code, state: state || undefined };
  }

  /**
   * Store user session
   * 
   * WARNING: In production, tokens should be stored in httpOnly cookies
   * or secure storage to prevent XSS attacks. This implementation uses
   * localStorage for development convenience only.
   * 
   * For production:
   * - Use httpOnly cookies for access/refresh tokens
   * - Implement CSRF protection
   * - Consider using secure session storage
   */
  storeSession(response: OAuthResponse): void {
    // TODO: Replace with httpOnly cookie storage in production
    localStorage.setItem('vey_access_token', response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('vey_refresh_token', response.refreshToken);
    }
    localStorage.setItem('vey_user', JSON.stringify(response.user));
  }

  /**
   * Get stored session
   */
  getSession(): {
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
  } {
    const accessToken = localStorage.getItem('vey_access_token');
    const refreshToken = localStorage.getItem('vey_refresh_token');
    const userStr = localStorage.getItem('vey_user');
    const user = userStr ? JSON.parse(userStr) : null;

    return { accessToken, refreshToken, user };
  }

  /**
   * Clear session (logout)
   */
  clearSession(): void {
    localStorage.removeItem('vey_access_token');
    localStorage.removeItem('vey_refresh_token');
    localStorage.removeItem('vey_user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem('vey_access_token');
    return !!accessToken;
  }
}

/**
 * Create authentication service instance
 */
export function createAuthService(config: OAuthConfig): AuthService {
  return new AuthService(config);
}
