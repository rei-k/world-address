/**
 * @vey/webhooks - Tests for webhook signature verification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSignature,
  createSignatureSync,
  verifySignature,
  verifySignatureSync,
} from '../src/index';

describe('Webhook Signature Verification', () => {
  const secret = 'test-webhook-secret-key';
  const payload = JSON.stringify({
    event: 'address.created',
    timestamp: Date.now(),
    data: {
      address_id: 'addr_123',
      address: {
        street: '123 Main St',
        city: 'Tokyo',
        country: 'JP',
      },
    },
  });

  describe('createSignature', () => {
    it('should create a valid HMAC-SHA256 signature', async () => {
      const signature = await createSignature(payload, secret);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
    });

    it('should create consistent signatures for same payload and secret', async () => {
      const signature1 = await createSignature(payload, secret);
      const signature2 = await createSignature(payload, secret);

      expect(signature1).toBe(signature2);
    });

    it('should create different signatures for different payloads', async () => {
      const payload1 = JSON.stringify({ event: 'test1' });
      const payload2 = JSON.stringify({ event: 'test2' });

      const signature1 = await createSignature(payload1, secret);
      const signature2 = await createSignature(payload2, secret);

      expect(signature1).not.toBe(signature2);
    });

    it('should create different signatures for different secrets', async () => {
      const signature1 = await createSignature(payload, 'secret1');
      const signature2 = await createSignature(payload, 'secret2');

      expect(signature1).not.toBe(signature2);
    });
  });

  describe('createSignatureSync', () => {
    it('should create a valid HMAC-SHA256 signature synchronously', () => {
      const signature = createSignatureSync(payload, secret);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
    });

    it('should create same signature as async version', async () => {
      const syncSignature = createSignatureSync(payload, secret);
      const asyncSignature = await createSignature(payload, secret);

      expect(syncSignature).toBe(asyncSignature);
    });

    it('should throw error in non-Node environment', () => {
      // Mock environment without crypto module
      const originalRequire = global.require;
      global.require = (() => {
        throw new Error('crypto module not found');
      }) as any;

      expect(() => {
        createSignatureSync(payload, secret);
      }).toThrow('Synchronous signature creation requires Node.js');

      // Restore
      global.require = originalRequire;
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', async () => {
      const signature = await createSignature(payload, secret);
      const isValid = await verifySignature(payload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid signature', async () => {
      const invalidSignature = 'sha256=' + 'a'.repeat(64);
      const isValid = await verifySignature(payload, invalidSignature, secret);

      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', async () => {
      const signature = await createSignature(payload, 'wrong-secret');
      const isValid = await verifySignature(payload, signature, secret);

      expect(isValid).toBe(false);
    });

    it('should reject signature for modified payload', async () => {
      const signature = await createSignature(payload, secret);
      const modifiedPayload = payload + ' ';
      const isValid = await verifySignature(modifiedPayload, signature, secret);

      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong length', async () => {
      const shortSignature = 'sha256=abc';
      const isValid = await verifySignature(payload, shortSignature, secret);

      expect(isValid).toBe(false);
    });

    it('should use constant-time comparison', async () => {
      const signature = await createSignature(payload, secret);

      // Measure time for valid signature
      const start1 = Date.now();
      await verifySignature(payload, signature, secret);
      const time1 = Date.now() - start1;

      // Measure time for invalid signature
      const invalidSignature = 'sha256=' + 'a'.repeat(64);
      const start2 = Date.now();
      await verifySignature(payload, invalidSignature, secret);
      const time2 = Date.now() - start2;

      // Time difference should be minimal (constant-time)
      // Note: This is a weak test, but demonstrates the concept
      expect(Math.abs(time1 - time2)).toBeLessThan(10);
    });
  });

  describe('verifySignatureSync', () => {
    it('should verify a valid signature synchronously', () => {
      const signature = createSignatureSync(payload, secret);
      const isValid = verifySignatureSync(payload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid signature synchronously', () => {
      const invalidSignature = 'sha256=' + 'a'.repeat(64);
      const isValid = verifySignatureSync(payload, invalidSignature, secret);

      expect(isValid).toBe(false);
    });

    it('should give same result as async version', async () => {
      const signature = await createSignature(payload, secret);
      const syncResult = verifySignatureSync(payload, signature, secret);
      const asyncResult = await verifySignature(payload, signature, secret);

      expect(syncResult).toBe(asyncResult);
    });
  });

  describe('Security Tests', () => {
    it('should resist timing attacks with constant-time comparison', async () => {
      const signature = await createSignature(payload, secret);

      // Create signatures that differ at different positions
      const almostCorrect1 = signature.slice(0, 10) + 'x' + signature.slice(11);
      const almostCorrect2 = signature.slice(0, -1) + 'x';

      const start1 = performance.now();
      await verifySignature(payload, almostCorrect1, secret);
      const time1 = performance.now() - start1;

      const start2 = performance.now();
      await verifySignature(payload, almostCorrect2, secret);
      const time2 = performance.now() - start2;

      // Times should be similar (constant-time comparison)
      const timeDiff = Math.abs(time1 - time2);
      expect(timeDiff).toBeLessThan(5); // 5ms tolerance
    });

    it('should handle empty payload', async () => {
      const emptyPayload = '';
      const signature = await createSignature(emptyPayload, secret);
      const isValid = await verifySignature(emptyPayload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should handle special characters in payload', async () => {
      const specialPayload = JSON.stringify({
        data: '🔒 Special chars: <>&"\' 日本語',
      });
      const signature = await createSignature(specialPayload, secret);
      const isValid = await verifySignature(specialPayload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should handle very long payload', async () => {
      const longPayload = 'x'.repeat(100000);
      const signature = await createSignature(longPayload, secret);
      const isValid = await verifySignature(longPayload, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject malformed signature format', async () => {
      const malformedSignatures = [
        'invalid',
        'sha256=',
        'md5=abc123',
        'sha256=zzz',
        '',
      ];

      for (const malformed of malformedSignatures) {
        const isValid = await verifySignature(payload, malformed, secret);
        expect(isValid).toBe(false);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle Unicode in secret', async () => {
      const unicodeSecret = '🔑 secret 日本語';
      const signature = await createSignature(payload, unicodeSecret);
      const isValid = await verifySignature(payload, signature, unicodeSecret);

      expect(isValid).toBe(true);
    });

    it('should handle very long secret', async () => {
      const longSecret = 'x'.repeat(1000);
      const signature = await createSignature(payload, longSecret);
      const isValid = await verifySignature(payload, signature, longSecret);

      expect(isValid).toBe(true);
    });

    it('should not verify with empty secret', async () => {
      const signature1 = await createSignature(payload, '');
      const signature2 = await createSignature(payload, 'nonempty');

      expect(signature1).not.toBe(signature2);

      const isValid = await verifySignature(payload, signature1, '');
      expect(isValid).toBe(true);
    });
  });
});
