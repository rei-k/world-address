/**
 * Mock WebAuthn Backend Server
 * 
 * This simulates a backend server for demo purposes only.
 * In production, implement proper server-side verification with:
 * - Challenge storage and validation
 * - Public key verification
 * - Signature verification
 * - Database storage
 * - Rate limiting
 */

class MockWebAuthnServer {
  constructor() {
    this.challenges = new Map();
    this.credentials = new Map();
    this.sessions = new Map();
  }

  /**
   * Generate registration challenge
   */
  async generateRegistrationChallenge(username) {
    // Generate random challenge
    const challenge = this._generateChallenge();
    const userId = `user_${Date.now()}`;

    this.challenges.set(challenge, {
      type: 'registration',
      username,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000, // 5 minutes
    });

    return {
      challenge,
      userId,
      username,
    };
  }

  /**
   * Verify registration response
   */
  async verifyRegistration(registrationResult, expectedChallenge) {
    const challengeData = this.challenges.get(expectedChallenge);

    if (!challengeData) {
      throw new Error('Challenge not found or expired');
    }

    if (challengeData.type !== 'registration') {
      throw new Error('Invalid challenge type');
    }

    if (Date.now() > challengeData.expiresAt) {
      this.challenges.delete(expectedChallenge);
      throw new Error('Challenge expired');
    }

    // In production: verify attestation object, extract public key, etc.
    // For demo purposes, we just store the credential

    const credential = {
      credentialId: registrationResult.credentialId,
      userId: challengeData.userId,
      username: challengeData.username,
      publicKey: registrationResult.rawId, // Mock public key
      transports: registrationResult.response.transports || [],
      createdAt: new Date().toISOString(),
      counter: 0,
    };

    this.credentials.set(registrationResult.credentialId, credential);
    this.challenges.delete(expectedChallenge);

    return {
      success: true,
      credential: {
        id: credential.credentialId,
        userId: credential.userId,
        username: credential.username,
      },
    };
  }

  /**
   * Generate authentication challenge
   */
  async generateAuthenticationChallenge() {
    const challenge = this._generateChallenge();

    this.challenges.set(challenge, {
      type: 'authentication',
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000, // 5 minutes
    });

    // Get list of allowed credentials (all registered credentials)
    const allowCredentials = Array.from(this.credentials.values()).map((cred) => ({
      type: 'public-key',
      id: cred.credentialId,
      transports: cred.transports,
    }));

    return {
      challenge,
      allowCredentials,
    };
  }

  /**
   * Verify authentication response
   */
  async verifyAuthentication(authenticationResult, expectedChallenge) {
    const challengeData = this.challenges.get(expectedChallenge);

    if (!challengeData) {
      throw new Error('Challenge not found or expired');
    }

    if (challengeData.type !== 'authentication') {
      throw new Error('Invalid challenge type');
    }

    if (Date.now() > challengeData.expiresAt) {
      this.challenges.delete(expectedChallenge);
      throw new Error('Challenge expired');
    }

    // Look up credential
    const credential = this.credentials.get(authenticationResult.credentialId);

    if (!credential) {
      throw new Error('Credential not found');
    }

    // In production: verify signature using public key
    // For demo purposes, we just create a session

    const sessionId = this._generateSessionId();
    const session = {
      sessionId,
      userId: credential.userId,
      username: credential.username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour
    };

    this.sessions.set(sessionId, session);
    this.challenges.delete(expectedChallenge);

    // Update credential counter
    credential.counter++;
    credential.lastUsedAt = new Date().toISOString();

    return {
      success: true,
      accessToken: sessionId,
      user: {
        id: credential.userId,
        username: credential.username,
      },
    };
  }

  /**
   * Validate session
   */
  async validateSession(accessToken) {
    const session = this.sessions.get(accessToken);

    if (!session) {
      return { valid: false };
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(accessToken);
      return { valid: false };
    }

    return {
      valid: true,
      user: {
        id: session.userId,
        username: session.username,
      },
    };
  }

  /**
   * Logout
   */
  async logout(accessToken) {
    this.sessions.delete(accessToken);
    return { success: true };
  }

  /**
   * Helper: Generate challenge
   */
  _generateChallenge() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Helper: Generate session ID
   */
  _generateSessionId() {
    return `sess_${this._generateChallenge()}`;
  }
}

// Export singleton instance
export const mockServer = new MockWebAuthnServer();
