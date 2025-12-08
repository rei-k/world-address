/**
 * @vey/core - Tests for WebAuthn / Biometric Authentication
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  isConditionalUIAvailable,
  generateChallenge,
  registerCredential,
  authenticateCredential,
  parseClientDataJSON,
  verifyOrigin,
  WebAuthnClient,
  createWebAuthnClient,
  type WebAuthnConfig,
} from '../src/webauthn';

// Mock window and navigator
const mockWindow = {
  PublicKeyCredential: function () {},
  location: { origin: 'https://example.com' },
};

const mockNavigator = {
  credentials: {
    create: vi.fn(),
    get: vi.fn(),
  },
};

describe('WebAuthn - Browser Support Detection', () => {
  beforeEach(() => {
    global.window = mockWindow as any;
  });

  afterEach(() => {
    delete (global as any).window;
  });

  describe('isWebAuthnSupported', () => {
    it('should return true when WebAuthn is supported', () => {
      const result = isWebAuthnSupported();
      expect(result).toBe(true);
    });

    it('should return false when window is undefined', () => {
      delete (global as any).window;
      const result = isWebAuthnSupported();
      expect(result).toBe(false);
    });

    it('should return false when PublicKeyCredential is undefined', () => {
      global.window = { PublicKeyCredential: undefined } as any;
      const result = isWebAuthnSupported();
      expect(result).toBe(false);
    });
  });

  describe('isPlatformAuthenticatorAvailable', () => {
    it('should check platform authenticator availability', async () => {
      (global.window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = vi
        .fn()
        .mockResolvedValue(true);

      const result = await isPlatformAuthenticatorAvailable();
      expect(result).toBe(true);
    });

    it('should return false when not supported', async () => {
      delete (global as any).window;
      const result = await isPlatformAuthenticatorAvailable();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      (global.window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = vi
        .fn()
        .mockRejectedValue(new Error('Not available'));

      const result = await isPlatformAuthenticatorAvailable();
      expect(result).toBe(false);
    });
  });

  describe('isConditionalUIAvailable', () => {
    it('should check conditional UI availability', async () => {
      (global.window as any).PublicKeyCredential.isConditionalMediationAvailable = vi
        .fn()
        .mockResolvedValue(true);

      const result = await isConditionalUIAvailable();
      expect(result).toBe(true);
    });

    it('should return false when method does not exist', async () => {
      (global.window as any).PublicKeyCredential.isConditionalMediationAvailable = undefined;

      const result = await isConditionalUIAvailable();
      expect(result).toBe(false);
    });

    it('should return false when not supported', async () => {
      delete (global as any).window;
      const result = await isConditionalUIAvailable();
      expect(result).toBe(false);
    });
  });
});

describe('WebAuthn - Challenge Generation', () => {
  describe('generateChallenge', () => {
    it('should generate random challenge of default length', () => {
      const challenge = generateChallenge();
      expect(challenge).toBeInstanceOf(ArrayBuffer);
      expect(challenge.byteLength).toBe(32);
    });

    it('should generate challenge of custom length', () => {
      const challenge = generateChallenge(64);
      expect(challenge).toBeInstanceOf(ArrayBuffer);
      expect(challenge.byteLength).toBe(64);
    });

    it('should generate different challenges each time', () => {
      const challenge1 = generateChallenge();
      const challenge2 = generateChallenge();

      const arr1 = new Uint8Array(challenge1);
      const arr2 = new Uint8Array(challenge2);

      expect(arr1).not.toEqual(arr2);
    });

    it('should generate cryptographically random values', () => {
      const challenge = generateChallenge(32);
      const arr = new Uint8Array(challenge);

      // Check that not all bytes are the same (very unlikely with random data)
      const firstByte = arr[0];
      const allSame = arr.every((byte) => byte === firstByte);
      expect(allSame).toBe(false);
    });
  });
});

describe('WebAuthn - Registration', () => {
  const config: WebAuthnConfig = {
    rpName: 'Test App',
    rpId: 'example.com',
    userVerification: 'preferred',
  };

  beforeEach(() => {
    global.window = mockWindow as any;
    global.navigator = mockNavigator as any;
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).navigator;
    vi.clearAllMocks();
  });

  describe('registerCredential', () => {
    it('should throw error when WebAuthn is not supported', async () => {
      delete (global as any).window;

      await expect(
        registerCredential('user-123', 'user@example.com', 'Test User', config)
      ).rejects.toThrow('WebAuthn is not supported');
    });

    it('should call navigator.credentials.create with correct options', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          attestationObject: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          getPublicKey: () => new Uint8Array([13, 14, 15, 16]).buffer,
          getAuthenticatorData: () => new Uint8Array([17, 18, 19, 20]).buffer,
          getTransports: () => ['usb', 'nfc'],
        },
      };

      mockNavigator.credentials.create.mockResolvedValueOnce(mockCredential);

      await registerCredential('user-123', 'user@example.com', 'Test User', config);

      expect(mockNavigator.credentials.create).toHaveBeenCalledWith({
        publicKey: expect.objectContaining({
          rp: {
            name: 'Test App',
            id: 'example.com',
          },
          user: expect.objectContaining({
            name: 'user@example.com',
            displayName: 'Test User',
          }),
          pubKeyCredParams: expect.arrayContaining([
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
          ]),
        }),
      });
    });

    it('should return registration result with credential data', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          attestationObject: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          getPublicKey: () => new Uint8Array([13, 14, 15, 16]).buffer,
          getAuthenticatorData: () => new Uint8Array([17, 18, 19, 20]).buffer,
          getTransports: () => ['internal'],
        },
      };

      mockNavigator.credentials.create.mockResolvedValueOnce(mockCredential);

      const result = await registerCredential(
        'user-123',
        'user@example.com',
        'Test User',
        config
      );

      expect(result).toHaveProperty('credentialId');
      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('attestationObject');
      expect(result).toHaveProperty('clientDataJSON');
      expect(result).toHaveProperty('authenticatorData');
      expect(result.transports).toEqual(['internal']);
    });

    it('should use provided challenge', async () => {
      const customChallenge = generateChallenge(64);

      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          attestationObject: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          getPublicKey: () => new Uint8Array([13, 14, 15, 16]).buffer,
          getAuthenticatorData: () => new Uint8Array([17, 18, 19, 20]).buffer,
        },
      };

      mockNavigator.credentials.create.mockResolvedValueOnce(mockCredential);

      await registerCredential(
        'user-123',
        'user@example.com',
        'Test User',
        config,
        customChallenge
      );

      const call = mockNavigator.credentials.create.mock.calls[0][0];
      expect(call.publicKey.challenge).toBe(customChallenge);
    });

    it('should throw error when credential creation fails', async () => {
      mockNavigator.credentials.create.mockResolvedValueOnce(null);

      await expect(
        registerCredential('user-123', 'user@example.com', 'Test User', config)
      ).rejects.toThrow('Failed to create credential');
    });

    it('should configure authenticator selection correctly', async () => {
      const platformConfig: WebAuthnConfig = {
        ...config,
        authenticatorAttachment: 'platform',
      };

      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          attestationObject: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          getPublicKey: () => new Uint8Array([13, 14, 15, 16]).buffer,
          getAuthenticatorData: () => new Uint8Array([17, 18, 19, 20]).buffer,
        },
      };

      mockNavigator.credentials.create.mockResolvedValueOnce(mockCredential);

      await registerCredential('user-123', 'user@example.com', 'Test User', platformConfig);

      const call = mockNavigator.credentials.create.mock.calls[0][0];
      expect(call.publicKey.authenticatorSelection.authenticatorAttachment).toBe('platform');
    });
  });
});

describe('WebAuthn - Authentication', () => {
  const config: WebAuthnConfig = {
    rpName: 'Test App',
    rpId: 'example.com',
  };

  beforeEach(() => {
    global.window = mockWindow as any;
    global.navigator = mockNavigator as any;
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).navigator;
    vi.clearAllMocks();
  });

  describe('authenticateCredential', () => {
    it('should throw error when WebAuthn is not supported', async () => {
      delete (global as any).window;

      await expect(authenticateCredential(config)).rejects.toThrow(
        'WebAuthn is not supported'
      );
    });

    it('should call navigator.credentials.get with correct options', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          signature: new Uint8Array([13, 14, 15, 16]).buffer,
          userHandle: new Uint8Array([17, 18, 19, 20]).buffer,
        },
      };

      mockNavigator.credentials.get.mockResolvedValueOnce(mockCredential);

      await authenticateCredential(config);

      expect(mockNavigator.credentials.get).toHaveBeenCalledWith({
        publicKey: expect.objectContaining({
          rpId: 'example.com',
          userVerification: 'preferred',
        }),
        mediation: undefined,
      });
    });

    it('should return authentication result with assertion data', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          signature: new Uint8Array([13, 14, 15, 16]).buffer,
          userHandle: new Uint8Array([17, 18, 19, 20]).buffer,
        },
      };

      mockNavigator.credentials.get.mockResolvedValueOnce(mockCredential);

      const result = await authenticateCredential(config);

      expect(result).toHaveProperty('credentialId');
      expect(result).toHaveProperty('authenticatorData');
      expect(result).toHaveProperty('clientDataJSON');
      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('userHandle');
    });

    it('should use provided challenge', async () => {
      const customChallenge = generateChallenge(64);

      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          signature: new Uint8Array([13, 14, 15, 16]).buffer,
        },
      };

      mockNavigator.credentials.get.mockResolvedValueOnce(mockCredential);

      await authenticateCredential(config, customChallenge);

      const call = mockNavigator.credentials.get.mock.calls[0][0];
      expect(call.publicKey.challenge).toBe(customChallenge);
    });

    it('should use allowCredentials when provided', async () => {
      const allowCredentials = [
        { id: 'cred1', transports: ['usb'] },
        { id: 'cred2', transports: ['nfc'] },
      ];

      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          signature: new Uint8Array([13, 14, 15, 16]).buffer,
        },
      };

      mockNavigator.credentials.get.mockResolvedValueOnce(mockCredential);

      await authenticateCredential(config, undefined, allowCredentials);

      const call = mockNavigator.credentials.get.mock.calls[0][0];
      expect(call.publicKey.allowCredentials).toHaveLength(2);
      expect(call.publicKey.allowCredentials[0]).toHaveProperty('type', 'public-key');
    });

    it('should use conditional mediation when specified', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          signature: new Uint8Array([13, 14, 15, 16]).buffer,
        },
      };

      mockNavigator.credentials.get.mockResolvedValueOnce(mockCredential);

      await authenticateCredential(config, undefined, undefined, 'conditional');

      const call = mockNavigator.credentials.get.mock.calls[0][0];
      expect(call.mediation).toBe('conditional');
    });

    it('should throw error when authentication fails', async () => {
      mockNavigator.credentials.get.mockResolvedValueOnce(null);

      await expect(authenticateCredential(config)).rejects.toThrow(
        'Failed to get credential'
      );
    });
  });
});

describe('WebAuthn - Helper Functions', () => {
  describe('parseClientDataJSON', () => {
    it('should parse client data JSON correctly', () => {
      const clientData = {
        type: 'webauthn.create',
        challenge: 'test-challenge',
        origin: 'https://example.com',
      };

      const encoder = new TextEncoder();
      const json = JSON.stringify(clientData);
      const buffer = encoder.encode(json).buffer;
      const base64url = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const parsed = parseClientDataJSON(base64url);

      expect(parsed.type).toBe('webauthn.create');
      expect(parsed.challenge).toBe('test-challenge');
      expect(parsed.origin).toBe('https://example.com');
    });
  });

  describe('verifyOrigin', () => {
    it('should return true when origin matches', () => {
      const clientData = {
        type: 'webauthn.create',
        challenge: 'test',
        origin: 'https://example.com',
      };

      const encoder = new TextEncoder();
      const json = JSON.stringify(clientData);
      const buffer = encoder.encode(json).buffer;
      const base64url = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const result = verifyOrigin(base64url, 'https://example.com');

      expect(result).toBe(true);
    });

    it('should return false when origin does not match', () => {
      const clientData = {
        type: 'webauthn.create',
        challenge: 'test',
        origin: 'https://example.com',
      };

      const encoder = new TextEncoder();
      const json = JSON.stringify(clientData);
      const buffer = encoder.encode(json).buffer;
      const base64url = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const result = verifyOrigin(base64url, 'https://evil.com');

      expect(result).toBe(false);
    });
  });
});

describe('WebAuthn - WebAuthnClient', () => {
  const config: WebAuthnConfig = {
    rpName: 'Test App',
    rpId: 'example.com',
  };

  beforeEach(() => {
    global.window = mockWindow as any;
    global.navigator = mockNavigator as any;
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).navigator;
    vi.clearAllMocks();
  });

  describe('Constructor and methods', () => {
    it('should create client with config', () => {
      const client = new WebAuthnClient(config);
      expect(client).toBeInstanceOf(WebAuthnClient);
    });

    it('should check if WebAuthn is supported', () => {
      const client = new WebAuthnClient(config);
      expect(client.isSupported()).toBe(true);
    });

    it('should check platform authenticator availability', async () => {
      (global.window as any).PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable =
        vi.fn().mockResolvedValue(true);

      const client = new WebAuthnClient(config);
      const result = await client.isPlatformAvailable();

      expect(result).toBe(true);
    });

    it('should check conditional UI availability', async () => {
      (global.window as any).PublicKeyCredential.isConditionalMediationAvailable = vi
        .fn()
        .mockResolvedValue(true);

      const client = new WebAuthnClient(config);
      const result = await client.isConditionalUIAvailable();

      expect(result).toBe(true);
    });

    it('should register credential', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          attestationObject: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          getPublicKey: () => new Uint8Array([13, 14, 15, 16]).buffer,
          getAuthenticatorData: () => new Uint8Array([17, 18, 19, 20]).buffer,
        },
      };

      mockNavigator.credentials.create.mockResolvedValueOnce(mockCredential);

      const client = new WebAuthnClient(config);
      const result = await client.register('user-123', 'user@example.com', 'Test User');

      expect(result).toHaveProperty('credentialId');
    });

    it('should authenticate with credential', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          signature: new Uint8Array([13, 14, 15, 16]).buffer,
        },
      };

      mockNavigator.credentials.get.mockResolvedValueOnce(mockCredential);

      const client = new WebAuthnClient(config);
      const result = await client.authenticate();

      expect(result).toHaveProperty('credentialId');
    });

    it('should authenticate with autofill', async () => {
      (global.window as any).PublicKeyCredential.isConditionalMediationAvailable = vi
        .fn()
        .mockResolvedValue(true);

      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        response: {
          authenticatorData: new Uint8Array([5, 6, 7, 8]).buffer,
          clientDataJSON: new Uint8Array([9, 10, 11, 12]).buffer,
          signature: new Uint8Array([13, 14, 15, 16]).buffer,
        },
      };

      mockNavigator.credentials.get.mockResolvedValueOnce(mockCredential);

      const client = new WebAuthnClient(config);
      const result = await client.authenticateWithAutofill();

      expect(result).toHaveProperty('credentialId');
      expect(mockNavigator.credentials.get).toHaveBeenCalledWith(
        expect.objectContaining({
          mediation: 'conditional',
        })
      );
    });

    it('should throw error when conditional UI not available', async () => {
      (global.window as any).PublicKeyCredential.isConditionalMediationAvailable = vi
        .fn()
        .mockResolvedValue(false);

      const client = new WebAuthnClient(config);

      await expect(client.authenticateWithAutofill()).rejects.toThrow(
        'Conditional UI (autofill) is not available'
      );
    });
  });

  describe('createWebAuthnClient', () => {
    it('should create WebAuthnClient instance', () => {
      const client = createWebAuthnClient(config);
      expect(client).toBeInstanceOf(WebAuthnClient);
    });
  });
});
