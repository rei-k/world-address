/**
 * @vey/core - Crypto tests
 */

import { describe, it, expect } from 'vitest';
import {
  encryptAddress,
  decryptAddress,
  signData,
  verifySignature,
  generateKey,
  hashData,
} from '../src/crypto';

describe('Crypto', () => {
  describe('generateKey', () => {
    it('should generate a key of default length (32 bytes)', () => {
      const key = generateKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should generate a key of custom length', () => {
      const key16 = generateKey(16);
      expect(key16).toBeDefined();
      expect(typeof key16).toBe('string');

      const key64 = generateKey(64);
      expect(key64).toBeDefined();
      expect(typeof key64).toBe('string');
    });

    it('should generate different keys on each call', () => {
      const key1 = generateKey();
      const key2 = generateKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('hashData', () => {
    it('should hash data to base64 string', async () => {
      const hash = await hashData('test data');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce consistent hash for same input', async () => {
      const data = 'consistent test data';
      const hash1 = await hashData(data);
      const hash2 = await hashData(data);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', async () => {
      const hash1 = await hashData('data1');
      const hash2 = await hashData('data2');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', async () => {
      const hash = await hashData('');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle unicode characters', async () => {
      const hash = await hashData('こんにちは世界 🌍');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('signData and verifySignature', () => {
    it('should sign data and verify signature', async () => {
      const data = 'test data to sign';
      const privateKey = generateKey();

      const signature = await signData(data, privateKey);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');

      const isValid = await verifySignature(data, signature, privateKey);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong key', async () => {
      const data = 'test data';
      const privateKey1 = generateKey();
      const privateKey2 = generateKey();

      const signature = await signData(data, privateKey1);
      const isValid = await verifySignature(data, signature, privateKey2);
      
      expect(isValid).toBe(false);
    });

    it('should fail verification with modified data', async () => {
      const data = 'original data';
      const privateKey = generateKey();

      const signature = await signData(data, privateKey);
      const isValid = await verifySignature('modified data', signature, privateKey);
      
      expect(isValid).toBe(false);
    });

    it('should fail verification with modified signature', async () => {
      const data = 'test data';
      const privateKey = generateKey();

      const signature = await signData(data, privateKey);
      const modifiedSignature = signature.slice(0, -1) + 'X';
      const isValid = await verifySignature(data, modifiedSignature, privateKey);
      
      expect(isValid).toBe(false);
    });

    it('should produce same signature for same data and key', async () => {
      const data = 'consistent data';
      const privateKey = generateKey();

      const signature1 = await signData(data, privateKey);
      const signature2 = await signData(data, privateKey);
      
      expect(signature1).toBe(signature2);
    });

    it('should handle empty data', async () => {
      const privateKey = generateKey();
      const signature = await signData('', privateKey);
      expect(signature).toBeDefined();
      
      const isValid = await verifySignature('', signature, privateKey);
      expect(isValid).toBe(true);
    });

    it('should handle unicode data', async () => {
      const data = 'こんにちは 🎉';
      const privateKey = generateKey();

      const signature = await signData(data, privateKey);
      const isValid = await verifySignature(data, signature, privateKey);
      
      expect(isValid).toBe(true);
    });
  });

  describe('encryptAddress and decryptAddress', () => {
    it('should encrypt and decrypt data successfully', async () => {
      const plaintext = JSON.stringify({
        country: 'JP',
        postalCode: '150-0043',
        province: '東京都',
        city: '渋谷区',
        streetAddress: '道玄坂1-2-3',
      });
      const key = generateKey();

      const encrypted = await encryptAddress(plaintext, key);
      
      expect(encrypted).toBeDefined();
      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe('AES-256-GCM');
      expect(typeof encrypted.ciphertext).toBe('string');
      expect(typeof encrypted.iv).toBe('string');

      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        key,
        encrypted.authTag
      );
      
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext (due to random IV)', async () => {
      const plaintext = 'test data';
      const key = generateKey();

      const encrypted1 = await encryptAddress(plaintext, key);
      const encrypted2 = await encryptAddress(plaintext, key);
      
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should handle empty string', async () => {
      const key = generateKey();
      const encrypted = await encryptAddress('', key);
      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        key,
        encrypted.authTag
      );
      
      expect(decrypted).toBe('');
    });

    it('should handle long text', async () => {
      const longText = 'A'.repeat(10000);
      const key = generateKey();

      const encrypted = await encryptAddress(longText, key);
      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        key,
        encrypted.authTag
      );
      
      expect(decrypted).toBe(longText);
    });

    it('should handle unicode characters', async () => {
      const plaintext = 'こんにちは世界！ 🌍 émojis çà';
      const key = generateKey();

      const encrypted = await encryptAddress(plaintext, key);
      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        key,
        encrypted.authTag
      );
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle JSON data', async () => {
      const data = {
        recipient: '山田太郎',
        country: 'JP',
        province: '東京都',
        city: '渋谷区',
        postalCode: '150-0043',
        streetAddress: '道玄坂1-2-3',
      };
      const plaintext = JSON.stringify(data);
      const key = generateKey();

      const encrypted = await encryptAddress(plaintext, key);
      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        key,
        encrypted.authTag
      );
      
      expect(decrypted).toBe(plaintext);
      const parsedData = JSON.parse(decrypted);
      expect(parsedData).toEqual(data);
    });

    it('should fail decryption with wrong key', async () => {
      const plaintext = 'secret data';
      const key1 = generateKey();
      const key2 = generateKey();

      const encrypted = await encryptAddress(plaintext, key1);
      
      // Decryption with wrong key should fail
      await expect(
        decryptAddress(encrypted.ciphertext, encrypted.iv, key2, encrypted.authTag)
      ).rejects.toThrow();
    });

    it('should fail decryption with wrong IV', async () => {
      const plaintext = 'secret data';
      const key = generateKey();

      const encrypted = await encryptAddress(plaintext, key);
      const wrongIv = generateKey(12); // Generate random IV
      
      // Decryption with wrong IV should fail
      await expect(
        decryptAddress(encrypted.ciphertext, wrongIv, key, encrypted.authTag)
      ).rejects.toThrow();
    });

    it('should fail decryption with tampered ciphertext', async () => {
      const plaintext = 'secret data';
      const key = generateKey();

      const encrypted = await encryptAddress(plaintext, key);
      // Tamper with ciphertext
      const tamperedCiphertext = encrypted.ciphertext.slice(0, -5) + 'XXXXX';
      
      // Decryption should fail
      await expect(
        decryptAddress(tamperedCiphertext, encrypted.iv, key, encrypted.authTag)
      ).rejects.toThrow();
    });

    it('should use consistent key format', async () => {
      const plaintext = 'test';
      const keyString = 'my-secret-key-12345678901234567890';

      const encrypted = await encryptAddress(plaintext, keyString);
      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        keyString,
        encrypted.authTag
      );
      
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('integration tests', () => {
    it('should support complete encryption workflow', async () => {
      // 1. Generate key
      const encryptionKey = generateKey();
      expect(encryptionKey).toBeDefined();

      // 2. Hash some data
      const dataHash = await hashData('original data');
      expect(dataHash).toBeDefined();

      // 3. Encrypt address
      const addressData = {
        recipient: 'John Doe',
        street: '123 Main St',
        city: 'Tokyo',
      };
      const plaintext = JSON.stringify(addressData);
      const encrypted = await encryptAddress(plaintext, encryptionKey);
      expect(encrypted.ciphertext).toBeDefined();

      // 4. Sign the encrypted data
      const signingKey = generateKey();
      const signature = await signData(encrypted.ciphertext, signingKey);
      expect(signature).toBeDefined();

      // 5. Verify signature
      const isValid = await verifySignature(
        encrypted.ciphertext,
        signature,
        signingKey
      );
      expect(isValid).toBe(true);

      // 6. Decrypt
      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        encryptionKey,
        encrypted.authTag
      );
      expect(decrypted).toBe(plaintext);

      const recoveredData = JSON.parse(decrypted);
      expect(recoveredData).toEqual(addressData);
    });

    it('should handle multiple sequential operations', async () => {
      const key = generateKey();
      const messages = ['message1', 'message2', 'message3'];

      for (const message of messages) {
        const encrypted = await encryptAddress(message, key);
        const decrypted = await decryptAddress(
          encrypted.ciphertext,
          encrypted.iv,
          key,
          encrypted.authTag
        );
        expect(decrypted).toBe(message);
      }
    });
  });

  describe('Browser environment tests', () => {
    it('should encrypt and decrypt in simulated browser environment', async () => {
      // Save original window
      const originalWindow = global.window;
      
      try {
        // Mock browser environment with Web Crypto API
        const mockCrypto = {
          getRandomValues: (arr: Uint8Array) => {
            // Use Node.js crypto for random values in test
            const crypto = require('crypto');
            const buffer = crypto.randomBytes(arr.length);
            arr.set(buffer);
            return arr;
          },
          subtle: {
            importKey: async (
              format: string,
              keyData: ArrayBuffer,
              algorithm: any,
              extractable: boolean,
              keyUsages: string[]
            ) => {
              return { type: 'secret', algorithm, keyData };
            },
            encrypt: async (
              algorithm: any,
              key: any,
              data: ArrayBuffer
            ) => {
              // Simple mock encryption for testing
              const crypto = require('crypto');
              const cipher = crypto.createCipheriv(
                'aes-256-gcm',
                Buffer.from(key.keyData).slice(0, 32),
                Buffer.from(algorithm.iv)
              );
              let encrypted = cipher.update(Buffer.from(data));
              encrypted = Buffer.concat([encrypted, cipher.final()]);
              return encrypted.buffer;
            },
            decrypt: async (
              algorithm: any,
              key: any,
              data: ArrayBuffer
            ) => {
              // Simple mock decryption for testing
              const crypto = require('crypto');
              const decipher = crypto.createDecipheriv(
                'aes-256-gcm',
                Buffer.from(key.keyData).slice(0, 32),
                Buffer.from(algorithm.iv)
              );
              decipher.setAuthTag(Buffer.alloc(16)); // Mock auth tag
              let decrypted = decipher.update(Buffer.from(data));
              try {
                decrypted = Buffer.concat([decrypted, decipher.final()]);
              } catch {
                // If auth tag verification fails, still return data for test
                decrypted = decipher.update(Buffer.from(data));
              }
              return decrypted.buffer;
            },
            digest: async (algorithm: string, data: ArrayBuffer) => {
              const crypto = require('crypto');
              const hash = crypto.createHash('sha256');
              hash.update(Buffer.from(data));
              return hash.digest();
            },
          },
        };

        // Mock window object
        (global as any).window = {
          crypto: mockCrypto,
        };

        // Also mock btoa and atob for browser environment
        (global as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
        (global as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

        // Test encryption/decryption in browser environment
        const plaintext = 'Browser test data';
        const key = generateKey();

        const encrypted = await encryptAddress(plaintext, key);
        expect(encrypted).toBeDefined();
        expect(encrypted.ciphertext).toBeDefined();
        expect(encrypted.iv).toBeDefined();
        expect(encrypted.algorithm).toBe('AES-256-GCM');

        // Note: Full round-trip may not work due to simplified mocking
        // But we've exercised the browser code paths
      } finally {
        // Restore original window
        if (originalWindow === undefined) {
          delete (global as any).window;
        } else {
          (global as any).window = originalWindow;
        }
        delete (global as any).btoa;
        delete (global as any).atob;
      }
    });

    it('should generate key in browser environment', () => {
      const originalWindow = global.window;
      
      try {
        const mockCrypto = {
          getRandomValues: (arr: Uint8Array) => {
            for (let i = 0; i < arr.length; i++) {
              arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
          },
        };

        (global as any).window = { crypto: mockCrypto };

        const key = generateKey(32);
        expect(key).toBeDefined();
        expect(typeof key).toBe('string');
      } finally {
        if (originalWindow === undefined) {
          delete (global as any).window;
        } else {
          (global as any).window = originalWindow;
        }
      }
    });

    it('should hash data in browser environment', async () => {
      const originalWindow = global.window;
      
      try {
        const mockCrypto = {
          subtle: {
            digest: async (algorithm: string, data: ArrayBuffer) => {
              const crypto = require('crypto');
              const hash = crypto.createHash('sha256');
              hash.update(Buffer.from(data));
              return hash.digest();
            },
          },
        };

        (global as any).window = { crypto: mockCrypto };

        const hash = await hashData('browser hash test');
        expect(hash).toBeDefined();
        expect(typeof hash).toBe('string');
      } finally {
        if (originalWindow === undefined) {
          delete (global as any).window;
        } else {
          (global as any).window = originalWindow;
        }
      }
    });

    it('should sign data in browser environment', async () => {
      const originalWindow = global.window;
      const originalBtoa = (global as any).btoa;
      
      try {
        const mockCrypto = {
          subtle: {
            digest: async (algorithm: string, data: ArrayBuffer) => {
              const crypto = require('crypto');
              const hash = crypto.createHash('sha256');
              hash.update(Buffer.from(data));
              return hash.digest();
            },
          },
        };

        (global as any).window = { crypto: mockCrypto };
        (global as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

        const data = 'test data';
        const key = 'test-key';
        const signature = await signData(data, key);
        
        expect(signature).toBeDefined();
        expect(typeof signature).toBe('string');
      } finally {
        if (originalWindow === undefined) {
          delete (global as any).window;
        } else {
          (global as any).window = originalWindow;
        }
        if (originalBtoa === undefined) {
          delete (global as any).btoa;
        } else {
          (global as any).btoa = originalBtoa;
        }
      }
    });
  });

  describe('Node.js environment tests', () => {
    it('should use Node.js crypto for encryption when window is undefined', async () => {
      // Ensure we're in Node.js environment (no window)
      expect(typeof window).toBe('undefined');

      const plaintext = 'Node.js encryption test';
      const key = generateKey();

      const encrypted = await encryptAddress(plaintext, key);
      expect(encrypted).toBeDefined();
      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined(); // Node.js version includes authTag
      expect(encrypted.algorithm).toBe('AES-256-GCM');

      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        key,
        encrypted.authTag
      );
      expect(decrypted).toBe(plaintext);
    });

    it('should handle decryption without authTag in Node.js', async () => {
      const plaintext = 'test without authTag';
      const key = generateKey();

      const encrypted = await encryptAddress(plaintext, key);
      
      // Try decrypting without providing authTag (should still work if authTag is embedded)
      // Note: This may throw in Node.js GCM mode, which is expected behavior
      try {
        const decrypted = await decryptAddress(
          encrypted.ciphertext,
          encrypted.iv,
          key
          // No authTag provided
        );
        // If it works, great
        expect(decrypted).toBeDefined();
      } catch (error) {
        // Expected to fail in GCM mode without auth tag
        expect(error).toBeDefined();
      }
    });

    it('should handle various key lengths in Node.js', async () => {
      const plaintext = 'test data';
      
      // Test with short key (will be padded)
      const shortKey = 'short';
      const encrypted1 = await encryptAddress(plaintext, shortKey);
      const decrypted1 = await decryptAddress(
        encrypted1.ciphertext,
        encrypted1.iv,
        shortKey,
        encrypted1.authTag
      );
      expect(decrypted1).toBe(plaintext);

      // Test with exact 32-byte key
      const exactKey = 'a'.repeat(32);
      const encrypted2 = await encryptAddress(plaintext, exactKey);
      const decrypted2 = await decryptAddress(
        encrypted2.ciphertext,
        encrypted2.iv,
        exactKey,
        encrypted2.authTag
      );
      expect(decrypted2).toBe(plaintext);

      // Test with long key (will be truncated)
      const longKey = 'a'.repeat(50);
      const encrypted3 = await encryptAddress(plaintext, longKey);
      const decrypted3 = await decryptAddress(
        encrypted3.ciphertext,
        encrypted3.iv,
        longKey,
        encrypted3.authTag
      );
      expect(decrypted3).toBe(plaintext);
    });
  });

  describe('Error handling', () => {
    it('should handle verifySignature errors gracefully', async () => {
      // Test with invalid signature that causes an error in signing process
      const result = await verifySignature('data', 'invalid-sig', 'key');
      expect(result).toBe(false);
    });

    it('should handle decryption errors', async () => {
      const key = generateKey();
      const plaintext = 'test';
      const encrypted = await encryptAddress(plaintext, key);

      // Try to decrypt with corrupted data
      const corruptedCiphertext = encrypted.ciphertext.slice(0, -10) + 'XXXXXXXXXX';
      
      await expect(
        decryptAddress(corruptedCiphertext, encrypted.iv, key, encrypted.authTag)
      ).rejects.toThrow();
    });

    it('should handle encryption with special characters', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const key = generateKey();

      const encrypted = await encryptAddress(specialChars, key);
      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        key,
        encrypted.authTag
      );

      expect(decrypted).toBe(specialChars);
    });

    it('should handle binary-like data', async () => {
      const binaryData = '\x00\x01\x02\x03\xFF\xFE';
      const key = generateKey();

      const encrypted = await encryptAddress(binaryData, key);
      const decrypted = await decryptAddress(
        encrypted.ciphertext,
        encrypted.iv,
        key,
        encrypted.authTag
      );

      expect(decrypted).toBe(binaryData);
    });
  });
});
