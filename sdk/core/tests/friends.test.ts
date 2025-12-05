/**
 * @vey/core - Tests for friends module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateFriendQR,
  generateAddressQR,
  scanFriendQR,
  scanAddressQR,
  verifyFriendPID,
  createFriendFromQR,
  generateId,
  type FriendQRPayload,
  type AddressQRPayload,
  type FriendEntry,
} from '../src/friends';

describe('generateFriendQR', () => {
  it('should generate friend QR code with valid payload', async () => {
    const userDid = 'did:key:z6MkTest123';
    const userPid = 'JP-13-113-01';
    const userPrivateKey = 'test-private-key';
    
    const qrData = await generateFriendQR(userDid, userPid, userPrivateKey);
    
    expect(qrData).toBeDefined();
    expect(typeof qrData).toBe('string');
    
    const payload: FriendQRPayload = JSON.parse(qrData);
    expect(payload.version).toBe('1.0');
    expect(payload.did).toBe(userDid);
    expect(payload.pid).toBe(userPid);
    expect(payload.timestamp).toBeDefined();
    expect(payload.expires_at).toBeDefined();
    expect(payload.signature).toBeDefined();
  });

  it('should generate QR with custom expiration', async () => {
    const qrData = await generateFriendQR(
      'did:key:test',
      'US-CA-123',
      'private-key',
      30 // 30 days
    );
    
    const payload: FriendQRPayload = JSON.parse(qrData);
    const expiresAt = new Date(payload.expires_at!);
    const now = new Date();
    const diffDays = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);
  });

  it('should generate QR with default 365 days expiration', async () => {
    const qrData = await generateFriendQR(
      'did:key:test',
      'US-CA-123',
      'private-key'
    );
    
    const payload: FriendQRPayload = JSON.parse(qrData);
    const expiresAt = new Date(payload.expires_at!);
    const now = new Date();
    const diffDays = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBeGreaterThanOrEqual(364);
    expect(diffDays).toBeLessThanOrEqual(366);
  });
});

describe('generateAddressQR', () => {
  it('should generate address QR code with valid payload', async () => {
    const pid = 'JP-13-113-01';
    const encryptedAddress = 'encrypted-data-123';
    const signature = 'signature-abc';
    const authTag = 'auth-tag-xyz';
    
    const qrData = await generateAddressQR(pid, encryptedAddress, signature, authTag);
    
    expect(qrData).toBeDefined();
    expect(typeof qrData).toBe('string');
    
    const payload: AddressQRPayload = JSON.parse(qrData);
    expect(payload.version).toBe('1.0');
    expect(payload.pid).toBe(pid);
    expect(payload.encrypted_address).toBe(encryptedAddress);
    expect(payload.signature).toBe(signature);
    expect(payload.auth_tag).toBe(authTag);
    expect(payload.timestamp).toBeDefined();
    expect(payload.expires_at).toBeDefined();
  });

  it('should generate address QR without auth tag', async () => {
    const qrData = await generateAddressQR(
      'US-NY-001',
      'encrypted-data',
      'signature'
    );
    
    const payload: AddressQRPayload = JSON.parse(qrData);
    expect(payload.auth_tag).toBeDefined(); // undefined would be included in JSON
  });

  it('should use custom expiration for address QR', async () => {
    const qrData = await generateAddressQR(
      'GB-LON-001',
      'encrypted',
      'sig',
      'tag',
      7 // 7 days
    );
    
    const payload: AddressQRPayload = JSON.parse(qrData);
    const expiresAt = new Date(payload.expires_at!);
    const now = new Date();
    const diffDays = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBeGreaterThanOrEqual(6);
    expect(diffDays).toBeLessThanOrEqual(8);
  });
});

describe('scanFriendQR', () => {
  it('should parse valid friend QR code', async () => {
    const originalPayload: FriendQRPayload = {
      version: '1.0',
      did: 'did:key:test123',
      pid: 'JP-13-113-01',
      timestamp: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      signature: 'test-signature',
    };
    
    const qrData = JSON.stringify(originalPayload);
    const parsed = await scanFriendQR(qrData);
    
    expect(parsed).toEqual(originalPayload);
  });

  it('should reject unsupported version', async () => {
    const payload = {
      version: '2.0',
      did: 'did:key:test',
      pid: 'US-CA-123',
      timestamp: new Date().toISOString(),
    };
    
    await expect(scanFriendQR(JSON.stringify(payload))).rejects.toThrow('Unsupported QR code version');
  });

  it('should reject expired QR code', async () => {
    const payload: FriendQRPayload = {
      version: '1.0',
      did: 'did:key:test',
      pid: 'US-CA-123',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    };
    
    await expect(scanFriendQR(JSON.stringify(payload))).rejects.toThrow('QR code has expired');
  });

  it('should reject QR code missing required fields', async () => {
    const invalidPayload = {
      version: '1.0',
      did: 'did:key:test',
      // Missing pid
      timestamp: new Date().toISOString(),
    };
    
    await expect(scanFriendQR(JSON.stringify(invalidPayload))).rejects.toThrow('missing required fields');
  });

  it('should reject malformed JSON', async () => {
    await expect(scanFriendQR('invalid-json')).rejects.toThrow('Failed to parse friend QR');
  });

  it('should accept QR without expiration', async () => {
    const payload: FriendQRPayload = {
      version: '1.0',
      did: 'did:key:test',
      pid: 'US-CA-123',
      timestamp: new Date().toISOString(),
    };
    
    const parsed = await scanFriendQR(JSON.stringify(payload));
    expect(parsed.did).toBe('did:key:test');
  });
});

describe('scanAddressQR', () => {
  it('should parse valid address QR code', async () => {
    const originalPayload: AddressQRPayload = {
      version: '1.0',
      pid: 'JP-13-113-01',
      encrypted_address: 'encrypted-data',
      signature: 'signature',
      auth_tag: 'auth-tag',
      timestamp: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const qrData = JSON.stringify(originalPayload);
    const parsed = await scanAddressQR(qrData);
    
    expect(parsed).toEqual(originalPayload);
  });

  it('should reject unsupported version', async () => {
    const payload = {
      version: '3.0',
      pid: 'US-CA-123',
      encrypted_address: 'data',
      signature: 'sig',
      timestamp: new Date().toISOString(),
    };
    
    await expect(scanAddressQR(JSON.stringify(payload))).rejects.toThrow('Unsupported QR code version');
  });

  it('should reject expired address QR', async () => {
    const payload: AddressQRPayload = {
      version: '1.0',
      pid: 'US-CA-123',
      encrypted_address: 'data',
      signature: 'sig',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    await expect(scanAddressQR(JSON.stringify(payload))).rejects.toThrow('QR code has expired');
  });

  it('should reject missing required fields', async () => {
    const invalidPayload = {
      version: '1.0',
      pid: 'US-CA-123',
      encrypted_address: 'data',
      // Missing signature
      timestamp: new Date().toISOString(),
    };
    
    await expect(scanAddressQR(JSON.stringify(invalidPayload))).rejects.toThrow('missing required fields');
  });

  it('should reject malformed JSON', async () => {
    await expect(scanAddressQR('not-valid-json')).rejects.toThrow('Failed to parse address QR');
  });
});

describe('verifyFriendPID', () => {
  it('should accept valid PID format', async () => {
    const validPIDs = [
      'JP-13-113-01',
      'US-CA-123',
      'GB-LON',
      'CN-BJ-001',
      'AU-NSW-001-ABC',
    ];
    
    for (const pid of validPIDs) {
      const result = await verifyFriendPID(pid);
      expect(result).toBe(true);
    }
  });

  it('should reject invalid PID format', async () => {
    const invalidPIDs = [
      'invalid',
      'jp-13-113', // lowercase
      '123-456', // numbers first
      'US_CA_123', // underscores
      'US CA 123', // spaces
      '',
    ];
    
    for (const pid of invalidPIDs) {
      const result = await verifyFriendPID(pid);
      expect(result).toBe(false);
    }
  });

  it('should accept country code only', async () => {
    const result = await verifyFriendPID('JP');
    expect(result).toBe(true);
  });
});

describe('createFriendFromQR', () => {
  it('should create friend entry from valid QR', async () => {
    const friendQR = await generateFriendQR(
      'did:key:friend123',
      'JP-13-113-01',
      'friend-private-key'
    );
    
    const friendEntry = await createFriendFromQR(
      friendQR,
      'did:key:owner456',
      'My Friend'
    );
    
    expect(friendEntry.owner_did).toBe('did:key:owner456');
    expect(friendEntry.friend_did).toBe('did:key:friend123');
    expect(friendEntry.friend_pid).toBe('JP-13-113-01');
    expect(friendEntry.label).toBe('My Friend');
    expect(friendEntry.verified).toBe(true);
    expect(friendEntry.is_revoked).toBe(false);
    expect(friendEntry.can_use_for_shipping).toBe(true);
    expect(friendEntry.added_at).toBeDefined();
    expect(friendEntry.friend_label_qr_hash).toBeDefined();
  });

  it('should reject QR with invalid PID', async () => {
    const invalidPayload: FriendQRPayload = {
      version: '1.0',
      did: 'did:key:test',
      pid: 'invalid-pid', // Invalid format
      timestamp: new Date().toISOString(),
    };
    
    const qrData = JSON.stringify(invalidPayload);
    
    await expect(
      createFriendFromQR(qrData, 'did:key:owner', 'Friend')
    ).rejects.toThrow('Invalid friend PID');
  });

  it('should reject expired QR', async () => {
    const expiredPayload: FriendQRPayload = {
      version: '1.0',
      did: 'did:key:test',
      pid: 'JP-13-113-01',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const qrData = JSON.stringify(expiredPayload);
    
    await expect(
      createFriendFromQR(qrData, 'did:key:owner', 'Friend')
    ).rejects.toThrow('QR code has expired');
  });
});

describe('generateId', () => {
  it('should generate unique ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(typeof id1).toBe('string');
    expect(typeof id2).toBe('string');
    expect(id1).not.toBe(id2);
  });

  it('should generate ID with timestamp and random part', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

describe('FriendEntry types', () => {
  it('should create valid friend entry object', () => {
    const entry: FriendEntry = {
      id: 'entry-123',
      owner_did: 'did:key:owner',
      friend_did: 'did:key:friend',
      friend_pid: 'JP-13-113-01',
      friend_label_qr_hash: 'hash123',
      verified: true,
      label: 'Friend Label',
      avatar_url: 'https://example.com/avatar.jpg',
      is_revoked: false,
      can_use_for_shipping: true,
      added_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
      notes: 'Some notes',
    };
    
    expect(entry).toBeDefined();
    expect(entry.owner_did).toBe('did:key:owner');
  });
});
