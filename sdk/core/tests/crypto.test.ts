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
});
