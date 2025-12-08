/**
 * QR Code Authentication Service
 * Implements cross-device authentication using QR codes
 * 
 * Flow:
 * 1. Desktop browser requests QR code
 * 2. User scans QR with Veyvault mobile app
 * 3. Mobile app verifies and approves login
 * 4. Desktop browser receives notification and completes login
 */

import crypto from 'crypto';
import type { QRAuthSession } from '../types/oauth';

export class QRAuthService {
  private sessions: Map<string, QRAuthSession> = new Map();
  private readonly SESSION_EXPIRY = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate QR code for authentication
   * Called by desktop browser
   */
  async generateQRCode(request: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state?: string;
  }): Promise<QRAuthSession> {
    const sessionId = this.generateSessionId();
    const challenge = this.generateChallenge();
    
    // QR code data (to be encoded as QR image)
    const qrData = {
      version: '1.0',
      type: 'veyvault_auth',
      sessionId,
      challenge,
      timestamp: Date.now(),
    };

    const qrCode = this.encodeQRData(qrData);
    const expiresAt = new Date(Date.now() + this.SESSION_EXPIRY);

    const session: QRAuthSession = {
      id: sessionId,
      sessionId,
      challenge,
      clientId: request.clientId,
      redirectUri: request.redirectUri,
      scope: request.scope,
      state: request.state,
      qrCode,
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
    };

    this.sessions.set(sessionId, session);

    // Auto-cleanup expired session
    setTimeout(() => {
      const currentSession = this.sessions.get(sessionId);
      if (currentSession && currentSession.status === 'pending') {
        currentSession.status = 'expired';
        this.sessions.delete(sessionId);
      }
    }, this.SESSION_EXPIRY);

    return session;
  }

  /**
   * Verify QR code scan from mobile app
   * Called when user scans QR code
   */
  async verifyQRScan(request: {
    sessionId: string;
    userId: string;
    deviceId: string;
    location?: { latitude: number; longitude: number };
  }): Promise<QRScanVerification> {
    const session = this.sessions.get(request.sessionId);

    if (!session) {
      throw new Error('Session not found or expired');
    }

    if (session.status !== 'pending') {
      throw new Error(`Session status is ${session.status}`);
    }

    if (session.expiresAt < new Date()) {
      session.status = 'expired';
      throw new Error('Session expired');
    }

    // Mark as scanned
    session.status = 'scanned';

    // Return login request details for user confirmation
    return {
      success: true,
      sessionId: session.sessionId,
      loginRequest: {
        clientId: session.clientId,
        device: session.deviceInfo?.userAgent || 'Unknown device',
        location: session.deviceInfo?.location || 'Unknown location',
        ip: session.deviceInfo?.ip || 'Unknown IP',
        scopes: session.scope.split(' '),
        timestamp: session.createdAt,
      },
    };
  }

  /**
   * Approve QR authentication
   * Called when user confirms login on mobile app
   */
  async approveQRAuth(request: {
    sessionId: string;
    userId: string;
    biometricVerified: boolean;
  }): Promise<{ success: boolean; authCode?: string }> {
    const session = this.sessions.get(request.sessionId);

    if (!session) {
      throw new Error('Session not found or expired');
    }

    if (session.status !== 'scanned') {
      throw new Error(`Cannot approve session with status: ${session.status}`);
    }

    if (!request.biometricVerified) {
      throw new Error('Biometric verification required');
    }

    // Generate authorization code for OAuth flow
    const authCode = this.generateAuthorizationCode();

    session.status = 'approved';
    session.approvedAt = new Date();
    session.approvedBy = request.userId;

    // Store auth code for later exchange
    // In production, this would be stored with the session

    return {
      success: true,
      authCode,
    };
  }

  /**
   * Deny QR authentication
   * Called when user rejects login on mobile app
   */
  async denyQRAuth(request: {
    sessionId: string;
    userId: string;
    reason?: string;
  }): Promise<{ success: boolean }> {
    const session = this.sessions.get(request.sessionId);

    if (!session) {
      throw new Error('Session not found or expired');
    }

    session.status = 'denied';
    
    // Notify desktop browser of denial
    // (would use WebSocket or polling in production)

    return { success: true };
  }

  /**
   * Get QR authentication status
   * Called by desktop browser (polling)
   */
  async getStatus(sessionId: string): Promise<QRAuthStatusResponse> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return {
        status: 'expired',
        error: 'Session not found or expired',
      };
    }

    if (session.expiresAt < new Date() && session.status === 'pending') {
      session.status = 'expired';
    }

    const response: QRAuthStatusResponse = {
      status: session.status,
      sessionId: session.sessionId,
    };

    // If approved, return auth code for OAuth flow
    if (session.status === 'approved') {
      response.authCode = this.generateAuthorizationCode();
      response.userId = session.approvedBy;
    }

    return response;
  }

  /**
   * Set device info for QR session
   * Called by desktop browser when displaying QR
   */
  setDeviceInfo(sessionId: string, deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
  }): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.deviceInfo = deviceInfo;
    }
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return `qr_${crypto.randomBytes(32).toString('base64url')}`;
  }

  /**
   * Generate challenge for anti-replay protection
   */
  private generateChallenge(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate authorization code
   */
  private generateAuthorizationCode(): string {
    return `auth_${crypto.randomBytes(32).toString('base64url')}`;
  }

  /**
   * Encode data as QR code
   * In production, use a QR code library like `qrcode` or `qr-image`
   */
  private encodeQRData(data: any): string {
    // This would generate actual QR code image
    // For now, return JSON string
    const json = JSON.stringify(data);
    return `data:text/plain;base64,${Buffer.from(json).toString('base64')}`;
  }
}

/**
 * NFC Authentication Service
 * Implements near-field communication authentication
 * 
 * Use cases:
 * - Hotel check-in
 * - Office access
 * - Event registration
 * - Retail POS
 */

import type { NFCAuthSession } from '../types/oauth';

export class NFCAuthService {
  private sessions: Map<string, NFCAuthSession> = new Map();
  private readonly SESSION_EXPIRY = 2 * 60 * 1000; // 2 minutes

  /**
   * Verify NFC tap
   * Called when user taps NFC-enabled device to terminal
   */
  async verifyNFCTap(request: {
    terminalId: string;
    nfcUid: string;
    userId: string;
    timestamp: number;
  }): Promise<NFCVerificationResponse> {
    // Verify terminal is registered and active
    const terminal = await this.getTerminal(request.terminalId);
    if (!terminal) {
      throw new Error('Terminal not found or inactive');
    }

    // Verify timestamp (prevent replay attacks)
    const timeDiff = Date.now() - request.timestamp;
    if (timeDiff > 30000 || timeDiff < 0) {
      throw new Error('Invalid timestamp');
    }

    // Create NFC auth session
    const sessionId = this.generateSessionId();
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + this.SESSION_EXPIRY);

    const session: NFCAuthSession = {
      id: sessionId,
      terminalId: request.terminalId,
      terminalName: terminal.name,
      terminalLocation: terminal.location,
      nfcUid: request.nfcUid,
      userId: request.userId,
      status: 'verified',
      sessionToken,
      createdAt: new Date(),
      expiresAt,
    };

    this.sessions.set(sessionId, session);

    // Fetch user data for terminal display
    const user = await this.getUserData(request.userId);

    return {
      success: true,
      sessionToken,
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        // Additional data based on terminal type
        ...(terminal.type === 'hotel' && user.reservation && {
          reservation: user.reservation,
        }),
      },
      terminal: {
        name: terminal.name,
        location: terminal.location.name,
      },
    };
  }

  /**
   * Generate NFC write data
   * Data to be written to NFC tag for user identification
   */
  generateNFCData(userId: string): NFCData {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Create signature for verification
    const dataToSign = `${userId}:${timestamp}:${nonce}`;
    const signature = this.signData(dataToSign);

    return {
      version: '1.0',
      type: 'veyvault_nfc',
      userId,
      timestamp,
      nonce,
      signature,
    };
  }

  /**
   * Verify NFC data signature
   */
  verifyNFCData(data: NFCData): boolean {
    const dataToVerify = `${data.userId}:${data.timestamp}:${data.nonce}`;
    return this.verifySignature(dataToVerify, data.signature);
  }

  /**
   * Register new NFC terminal
   */
  async registerTerminal(request: {
    name: string;
    type: 'hotel' | 'office' | 'event' | 'retail';
    location: {
      name: string;
      latitude: number;
      longitude: number;
    };
    publicKey: string;
  }): Promise<NFCTerminal> {
    const terminal: NFCTerminal = {
      id: `terminal_${crypto.randomBytes(16).toString('hex')}`,
      name: request.name,
      type: request.type,
      location: request.location,
      publicKey: request.publicKey,
      isActive: true,
      createdAt: new Date(),
    };

    // Store terminal (would be in database in production)
    return terminal;
  }

  /**
   * Get terminal information
   */
  private async getTerminal(terminalId: string): Promise<NFCTerminal | null> {
    // In production, query database
    // For now, return mock data
    return {
      id: terminalId,
      name: 'Tokyo Hilton Lobby',
      type: 'hotel',
      location: {
        name: 'Tokyo Hilton Hotel, Shinjuku',
        latitude: 35.6938,
        longitude: 139.6917,
      },
      publicKey: 'public_key_placeholder',
      isActive: true,
      createdAt: new Date(),
    };
  }

  /**
   * Get user data
   */
  private async getUserData(userId: string): Promise<any> {
    // In production, query database
    return {
      id: userId,
      name: 'Taro Yamada',
      email: 'taro@example.com',
      picture: 'https://cdn.veyvault.com/avatars/default.jpg',
      reservation: 'RES-12345', // For hotel check-in
    };
  }

  /**
   * Sign data with private key
   */
  private signData(data: string): string {
    // In production, use proper cryptographic signing
    return crypto
      .createHmac('sha256', 'private_key_placeholder')
      .update(data)
      .digest('hex');
  }

  /**
   * Verify data signature
   */
  private verifySignature(data: string, signature: string): boolean {
    const expectedSignature = this.signData(data);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `nfc_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Generate session token
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }
}

/**
 * Type definitions
 */

interface QRScanVerification {
  success: boolean;
  sessionId: string;
  loginRequest: {
    clientId: string;
    device: string;
    location: string;
    ip: string;
    scopes: string[];
    timestamp: Date;
  };
}

interface QRAuthStatusResponse {
  status: 'pending' | 'scanned' | 'approved' | 'denied' | 'expired';
  sessionId?: string;
  authCode?: string;
  userId?: string;
  error?: string;
}

interface NFCVerificationResponse {
  success: boolean;
  sessionToken: string;
  sessionId: string;
  user: {
    id: string;
    name: string;
    email: string;
    picture: string;
    reservation?: string;
  };
  terminal: {
    name: string;
    location: string;
  };
}

interface NFCData {
  version: string;
  type: string;
  userId: string;
  timestamp: number;
  nonce: string;
  signature: string;
}

interface NFCTerminal {
  id: string;
  name: string;
  type: 'hotel' | 'office' | 'event' | 'retail';
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  publicKey: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Create service instances
 */
export function createQRAuthService(): QRAuthService {
  return new QRAuthService();
}

export function createNFCAuthService(): NFCAuthService {
  return new NFCAuthService();
}
