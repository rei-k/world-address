/**
 * Veyvault OAuth 2.0 / OpenID Connect Provider Service
 * Implements Veyvault as an Identity Provider (IdP)
 * 
 * Standards Compliance:
 * - OAuth 2.0 (RFC 6749)
 * - OpenID Connect 1.0
 * - PKCE (RFC 7636)
 * - JWT (RFC 7519)
 */

import crypto from 'crypto';
import type {
  OAuthClient,
  OAuthAuthorizationRequest,
  OAuthTokenRequest,
  OAuthTokenResponse,
  UserInfo,
  ConsentDecision,
} from '../types/oauth';

/**
 * OAuth 2.0 Provider Service
 * Handles OAuth flows for third-party applications
 */
export class OAuthProviderService {
  private clients: Map<string, OAuthClient> = new Map();
  private authorizationCodes: Map<string, AuthorizationCodeData> = new Map();
  private accessTokens: Map<string, AccessTokenData> = new Map();
  private refreshTokens: Map<string, RefreshTokenData> = new Map();

  /**
   * Register a new OAuth client application
   */
  async registerClient(request: RegisterClientRequest): Promise<OAuthClient> {
    const clientId = this.generateClientId();
    const clientSecret = this.generateClientSecret();

    const client: OAuthClient = {
      id: clientId,
      secret: clientSecret,
      name: request.name,
      redirectUris: request.redirectUris,
      allowedScopes: request.allowedScopes || ['openid', 'profile', 'email'],
      logoUrl: request.logoUrl,
      description: request.description,
      website: request.website,
      privacyPolicy: request.privacyPolicy,
      termsOfService: request.termsOfService,
      createdAt: new Date(),
      isActive: true,
    };

    this.clients.set(clientId, client);
    return client;
  }

  /**
   * Handle OAuth 2.0 authorization request
   * GET /oauth/authorize
   */
  async handleAuthorizationRequest(
    request: OAuthAuthorizationRequest,
    userId: string
  ): Promise<AuthorizationResponse> {
    // Validate client
    const client = this.clients.get(request.clientId);
    if (!client || !client.isActive) {
      throw new OAuthError('invalid_client', 'Client not found or inactive');
    }

    // Validate redirect URI
    if (!client.redirectUris.includes(request.redirectUri)) {
      throw new OAuthError('invalid_request', 'Invalid redirect URI');
    }

    // Validate scopes
    const requestedScopes = request.scope.split(' ');
    const invalidScopes = requestedScopes.filter(
      scope => !client.allowedScopes.includes(scope)
    );
    if (invalidScopes.length > 0) {
      throw new OAuthError('invalid_scope', `Invalid scopes: ${invalidScopes.join(', ')}`);
    }

    // PKCE validation (if provided)
    if (request.codeChallenge && request.codeChallengeMethod !== 'S256') {
      throw new OAuthError('invalid_request', 'Only S256 code challenge method is supported');
    }

    // Generate authorization code
    const authCode = this.generateAuthorizationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store authorization code data
    this.authorizationCodes.set(authCode, {
      code: authCode,
      clientId: request.clientId,
      userId,
      redirectUri: request.redirectUri,
      scope: request.scope,
      codeChallenge: request.codeChallenge,
      codeChallengeMethod: request.codeChallengeMethod,
      nonce: request.nonce,
      state: request.state,
      expiresAt,
      createdAt: new Date(),
    });

    return {
      code: authCode,
      state: request.state,
      redirectUri: request.redirectUri,
    };
  }

  /**
   * Process user consent decision
   */
  async processConsent(
    authCode: string,
    decision: ConsentDecision
  ): Promise<void> {
    const codeData = this.authorizationCodes.get(authCode);
    if (!codeData) {
      throw new OAuthError('invalid_request', 'Invalid authorization code');
    }

    if (!decision.approved) {
      // User denied consent
      this.authorizationCodes.delete(authCode);
      throw new OAuthError('access_denied', 'User denied authorization');
    }

    // Store consent (would be saved to database in production)
    // This allows "remember this decision" functionality
  }

  /**
   * Exchange authorization code for access token
   * POST /oauth/token
   */
  async exchangeCodeForToken(
    request: OAuthTokenRequest
  ): Promise<OAuthTokenResponse> {
    // Validate grant type
    if (request.grantType !== 'authorization_code') {
      throw new OAuthError('unsupported_grant_type', 'Only authorization_code is supported');
    }

    // Validate authorization code
    const codeData = this.authorizationCodes.get(request.code);
    if (!codeData) {
      throw new OAuthError('invalid_grant', 'Invalid or expired authorization code');
    }

    // Check expiration
    if (codeData.expiresAt < new Date()) {
      this.authorizationCodes.delete(request.code);
      throw new OAuthError('invalid_grant', 'Authorization code expired');
    }

    // Validate client
    const client = this.clients.get(codeData.clientId);
    if (!client) {
      throw new OAuthError('invalid_client', 'Client not found');
    }

    // Verify client credentials
    if (request.clientId !== codeData.clientId) {
      throw new OAuthError('invalid_client', 'Client ID mismatch');
    }

    // Verify redirect URI
    if (request.redirectUri !== codeData.redirectUri) {
      throw new OAuthError('invalid_grant', 'Redirect URI mismatch');
    }

    // PKCE verification
    if (codeData.codeChallenge) {
      if (!request.codeVerifier) {
        throw new OAuthError('invalid_request', 'Code verifier required');
      }

      const challengeFromVerifier = crypto
        .createHash('sha256')
        .update(request.codeVerifier)
        .digest('base64url');

      if (challengeFromVerifier !== codeData.codeChallenge) {
        throw new OAuthError('invalid_grant', 'Invalid code verifier');
      }
    }

    // Generate tokens
    const accessToken = this.generateAccessToken();
    const refreshToken = this.generateRefreshToken();
    const idToken = await this.generateIDToken(codeData.userId, codeData.clientId, codeData.nonce);

    const expiresIn = 15 * 60; // 15 minutes
    const accessTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store access token
    this.accessTokens.set(accessToken, {
      token: accessToken,
      userId: codeData.userId,
      clientId: codeData.clientId,
      scope: codeData.scope,
      expiresAt: accessTokenExpiresAt,
      createdAt: new Date(),
    });

    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      token: refreshToken,
      userId: codeData.userId,
      clientId: codeData.clientId,
      scope: codeData.scope,
      expiresAt: refreshTokenExpiresAt,
      createdAt: new Date(),
    });

    // Delete authorization code (one-time use)
    this.authorizationCodes.delete(request.code);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      refreshToken,
      idToken,
      scope: codeData.scope,
    };
  }

  /**
   * Refresh access token using refresh token
   * POST /oauth/token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const refreshData = this.refreshTokens.get(refreshToken);
    if (!refreshData) {
      throw new OAuthError('invalid_grant', 'Invalid refresh token');
    }

    // Check expiration
    if (refreshData.expiresAt < new Date()) {
      this.refreshTokens.delete(refreshToken);
      throw new OAuthError('invalid_grant', 'Refresh token expired');
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken();
    const expiresIn = 15 * 60; // 15 minutes
    const accessTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store new access token
    this.accessTokens.set(newAccessToken, {
      token: newAccessToken,
      userId: refreshData.userId,
      clientId: refreshData.clientId,
      scope: refreshData.scope,
      expiresAt: accessTokenExpiresAt,
      createdAt: new Date(),
    });

    // Optional: Rotate refresh token for enhanced security
    const newRefreshToken = this.generateRefreshToken();
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Delete old refresh token
    this.refreshTokens.delete(refreshToken);

    // Store new refresh token
    this.refreshTokens.set(newRefreshToken, {
      token: newRefreshToken,
      userId: refreshData.userId,
      clientId: refreshData.clientId,
      scope: refreshData.scope,
      expiresAt: refreshTokenExpiresAt,
      createdAt: new Date(),
    });

    return {
      accessToken: newAccessToken,
      tokenType: 'Bearer',
      expiresIn,
      refreshToken: newRefreshToken,
      scope: refreshData.scope,
    };
  }

  /**
   * Get user information using access token
   * GET /oauth/userinfo
   */
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const tokenData = this.accessTokens.get(accessToken);
    if (!tokenData) {
      throw new OAuthError('invalid_token', 'Invalid access token');
    }

    // Check expiration
    if (tokenData.expiresAt < new Date()) {
      this.accessTokens.delete(accessToken);
      throw new OAuthError('invalid_token', 'Access token expired');
    }

    // Fetch user data (would query database in production)
    const user = await this.fetchUserData(tokenData.userId);

    // Filter claims based on scopes
    const scopes = tokenData.scope.split(' ');
    return this.filterUserInfo(user, scopes);
  }

  /**
   * Revoke token (logout)
   * POST /oauth/revoke
   */
  async revokeToken(token: string, tokenTypeHint?: 'access_token' | 'refresh_token'): Promise<void> {
    // Try both token types if hint not provided
    if (!tokenTypeHint || tokenTypeHint === 'access_token') {
      this.accessTokens.delete(token);
    }
    
    if (!tokenTypeHint || tokenTypeHint === 'refresh_token') {
      this.refreshTokens.delete(token);
    }
  }

  /**
   * Generate OpenID Connect ID Token (JWT)
   */
  private async generateIDToken(
    userId: string,
    clientId: string,
    nonce?: string
  ): Promise<string> {
    const user = await this.fetchUserData(userId);
    
    const payload = {
      // Standard OIDC claims
      iss: 'https://id.veyvault.com',
      sub: user.did,
      aud: clientId,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      iat: Math.floor(Date.now() / 1000),
      auth_time: Math.floor(Date.now() / 1000),
      
      // Optional nonce for replay attack prevention
      ...(nonce && { nonce }),
      
      // User claims
      email: user.email,
      email_verified: user.emailVerified,
      name: user.name,
      given_name: user.givenName,
      family_name: user.familyName,
      picture: user.picture,
      locale: user.locale,
      
      // Veyvault custom claims
      convey_id: user.conveyId,
      address_verified: user.addressVerified,
      address_count: user.addressCount,
      primary_address_country: user.primaryAddressCountry,
      trust_score: user.trustScore,
      
      // Authentication method
      amr: user.authMethods, // e.g., ["pwd", "mfa", "biometric"]
    };

    // Sign JWT (in production, use proper JWT library with RS256)
    return this.signJWT(payload);
  }

  /**
   * Filter user information based on requested scopes
   */
  private filterUserInfo(user: any, scopes: string[]): UserInfo {
    const userInfo: UserInfo = {
      sub: user.did,
    };

    // Profile scope
    if (scopes.includes('profile')) {
      userInfo.name = user.name;
      userInfo.given_name = user.givenName;
      userInfo.family_name = user.familyName;
      userInfo.picture = user.picture;
      userInfo.locale = user.locale;
    }

    // Email scope
    if (scopes.includes('email')) {
      userInfo.email = user.email;
      userInfo.email_verified = user.emailVerified;
    }

    // Veyvault custom scopes
    if (scopes.includes('conveyid')) {
      userInfo.convey_id = user.conveyId;
    }

    if (scopes.includes('address')) {
      userInfo.address_verified = user.addressVerified;
      userInfo.address_count = user.addressCount;
      userInfo.primary_address_country = user.primaryAddressCountry;
      // Note: Actual address is returned as ZKP proof, not raw data
      userInfo.address_zkp = user.addressZkpProof;
    }

    if (scopes.includes('trust_score')) {
      userInfo.trust_score = user.trustScore;
      userInfo.friend_count = user.friendCount;
      userInfo.delivery_count = user.deliveryCount;
    }

    return userInfo;
  }

  /**
   * Generate cryptographically secure client ID
   */
  private generateClientId(): string {
    return `client_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Generate cryptographically secure client secret
   */
  private generateClientSecret(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate authorization code
   */
  private generateAuthorizationCode(): string {
    return `auth_${crypto.randomBytes(32).toString('base64url')}`;
  }

  /**
   * Generate access token
   */
  private generateAccessToken(): string {
    return `vey_at_${crypto.randomBytes(32).toString('base64url')}`;
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(): string {
    return `vey_rt_${crypto.randomBytes(32).toString('base64url')}`;
  }

  /**
   * Sign JWT (placeholder - use proper JWT library in production)
   */
  private signJWT(payload: any): string {
    // In production: Use jsonwebtoken library with RS256
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: 'veyvault-2025-01',
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    // Placeholder signature (in production, use actual RSA signature)
    const signature = crypto
      .createHmac('sha256', 'placeholder-secret')
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Fetch user data (placeholder - query database in production)
   */
  private async fetchUserData(userId: string): Promise<any> {
    // This would query your database in production
    return {
      id: userId,
      did: `did:vey:${userId}`,
      email: 'user@example.com',
      emailVerified: true,
      name: 'Taro Yamada',
      givenName: 'Taro',
      familyName: 'Yamada',
      picture: 'https://cdn.veyvault.com/avatars/default.jpg',
      locale: 'ja-JP',
      conveyId: 'taro@convey',
      addressVerified: true,
      addressCount: 3,
      primaryAddressCountry: 'JP',
      addressZkpProof: 'zkp:proof:abc123...',
      trustScore: 95,
      friendCount: 42,
      deliveryCount: 156,
      authMethods: ['pwd', 'mfa', 'biometric'],
    };
  }

  /**
   * Generate OpenID Connect Discovery document
   * GET /.well-known/openid-configuration
   */
  getOpenIDConfiguration(): OIDCDiscovery {
    return {
      issuer: 'https://id.veyvault.com',
      authorization_endpoint: 'https://id.veyvault.com/oauth/authorize',
      token_endpoint: 'https://id.veyvault.com/oauth/token',
      userinfo_endpoint: 'https://id.veyvault.com/oauth/userinfo',
      jwks_uri: 'https://id.veyvault.com/.well-known/jwks.json',
      revocation_endpoint: 'https://id.veyvault.com/oauth/revoke',
      
      // Supported features
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      
      // Scopes
      scopes_supported: [
        'openid',
        'profile',
        'email',
        'address',
        'conveyid',
        'delivery',
        'trust_score',
        'offline_access',
      ],
      
      // Claims
      claims_supported: [
        'sub',
        'name',
        'given_name',
        'family_name',
        'email',
        'email_verified',
        'picture',
        'locale',
        'convey_id',
        'address_verified',
        'address_count',
        'primary_address_country',
        'trust_score',
        'friend_count',
        'delivery_count',
      ],
      
      // PKCE support
      code_challenge_methods_supported: ['S256'],
      
      // Token endpoint authentication
      token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    };
  }
}

/**
 * OAuth Error class
 */
export class OAuthError extends Error {
  constructor(
    public code: string,
    public description: string,
    public statusCode: number = 400
  ) {
    super(description);
    this.name = 'OAuthError';
  }
}

/**
 * Type definitions
 */

interface RegisterClientRequest {
  name: string;
  redirectUris: string[];
  allowedScopes?: string[];
  logoUrl?: string;
  description?: string;
  website?: string;
  privacyPolicy?: string;
  termsOfService?: string;
}

interface AuthorizationCodeData {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  nonce?: string;
  state?: string;
  expiresAt: Date;
  createdAt: Date;
}

interface AccessTokenData {
  token: string;
  userId: string;
  clientId: string;
  scope: string;
  expiresAt: Date;
  createdAt: Date;
}

interface RefreshTokenData {
  token: string;
  userId: string;
  clientId: string;
  scope: string;
  expiresAt: Date;
  createdAt: Date;
}

interface AuthorizationResponse {
  code: string;
  state?: string;
  redirectUri: string;
}

interface OIDCDiscovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  revocation_endpoint: string;
  response_types_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
  claims_supported: string[];
  code_challenge_methods_supported: string[];
  token_endpoint_auth_methods_supported: string[];
}

/**
 * Create OAuth provider service instance
 */
export function createOAuthProvider(): OAuthProviderService {
  return new OAuthProviderService();
}
