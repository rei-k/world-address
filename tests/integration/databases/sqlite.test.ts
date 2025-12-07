/**
 * SQLite Connection and Integration Tests
 * SQLite 接続と統合テスト（ローカル開発用）
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { getDatabaseConfig, isServiceConfigured } from '../config/test-config';
import { generateTestAddress, generateTestFriend, randomPID } from '../utils/database-helpers';
import type { AddressEntry, FriendEntry } from '../../../docs/examples/cloud-address-book/database-schema';

// Promisified SQLite wrapper
class Database {
  private db: sqlite3.Database;

  constructor(filename: string) {
    this.db = new sqlite3.Database(filename);
  }

  run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

describe('SQLite Integration Tests', () => {
  let db: Database;
  const config = getDatabaseConfig().sqlite;
  const dbPath = config.path;

  beforeAll(async () => {
    // SQLite is always available for local development
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database
    db = new Database(dbPath);

    // Create test tables
    await createTestTables(db);
  });

  afterAll(async () => {
    // Close database
    if (db) {
      await db.close();
    }

    // Remove test database file using async operation
    if (fs.existsSync(dbPath)) {
      await fs.promises.unlink(dbPath).catch(err => {
        console.warn('Failed to delete test database file:', err.message);
      });
    }
  });

  beforeEach(async () => {
    // Clear test data before each test
    await db.run('DELETE FROM friend_entries');
    await db.run('DELETE FROM address_entries');
  });

  describe('Connection Tests', () => {
    it('should connect to SQLite successfully', async () => {
      const result = await db.get('SELECT 1 as test');
      expect(result.test).toBe(1);
    });

    it('should verify SQLite version', async () => {
      const result = await db.get('SELECT sqlite_version() as version');
      expect(result.version).toBeDefined();
      console.log('SQLite version:', result.version);
    });

    it('should check if tables exist', async () => {
      const result = await db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name IN ('address_entries', 'friend_entries')
      `);

      expect(result.length).toBe(2);
    });
  });

  describe('Address Entry CRUD Operations', () => {
    it('should insert an address entry', async () => {
      const testAddress = generateTestAddress({ pid: randomPID() });

      await db.run(
        `INSERT INTO address_entries (
          id, user_did, pid, encrypted_address_local, encrypted_address_en,
          encryption_algorithm, encryption_iv, country_code, admin1_code, admin2_code,
          signature, is_revoked, is_primary, created_at, updated_at, label
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testAddress.id,
          testAddress.user_did,
          testAddress.pid,
          testAddress.encrypted_address_local,
          testAddress.encrypted_address_en,
          testAddress.encryption_algorithm,
          testAddress.encryption_iv,
          testAddress.country_code,
          testAddress.admin1_code,
          testAddress.admin2_code,
          testAddress.signature,
          testAddress.is_revoked ? 1 : 0,
          testAddress.is_primary ? 1 : 0,
          testAddress.created_at,
          testAddress.updated_at,
          testAddress.label,
        ]
      );

      const result = await db.get('SELECT * FROM address_entries WHERE pid = ?', [
        testAddress.pid,
      ]);

      expect(result).toBeDefined();
      expect(result.pid).toBe(testAddress.pid);
    });

    it('should retrieve an address entry by PID', async () => {
      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(db, testAddress);

      const result = await db.get('SELECT * FROM address_entries WHERE pid = ?', [
        testAddress.pid,
      ]);

      expect(result).toBeDefined();
      expect(result.user_did).toBe(testAddress.user_did);
    });

    it('should update an address entry', async () => {
      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(db, testAddress);

      const newLabel = 'Updated Label';
      await db.run('UPDATE address_entries SET label = ? WHERE pid = ?', [
        newLabel,
        testAddress.pid,
      ]);

      const result = await db.get('SELECT * FROM address_entries WHERE pid = ?', [
        testAddress.pid,
      ]);

      expect(result.label).toBe(newLabel);
    });

    it('should delete an address entry', async () => {
      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(db, testAddress);

      await db.run('DELETE FROM address_entries WHERE pid = ?', [testAddress.pid]);

      const result = await db.get('SELECT * FROM address_entries WHERE pid = ?', [
        testAddress.pid,
      ]);

      expect(result).toBeUndefined();
    });

    it('should enforce unique constraint on PID', async () => {
      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(db, testAddress);

      // Try to insert another address with the same PID
      const duplicateAddress = generateTestAddress({ pid: testAddress.pid });

      await expect(insertAddress(db, duplicateAddress)).rejects.toThrow();
    });

    it('should query addresses by user DID', async () => {
      const userDid = 'did:key:test_user_' + Date.now();
      const addr1 = generateTestAddress({ user_did: userDid, pid: randomPID() });
      const addr2 = generateTestAddress({ user_did: userDid, pid: randomPID() });

      await insertAddress(db, addr1);
      await insertAddress(db, addr2);

      const results = await db.all('SELECT * FROM address_entries WHERE user_did = ?', [
        userDid,
      ]);

      expect(results.length).toBe(2);
    });

    it('should query addresses by country code', async () => {
      const jpAddr1 = generateTestAddress({ country_code: 'JP', pid: randomPID() });
      const jpAddr2 = generateTestAddress({ country_code: 'JP', pid: randomPID() });
      const usAddr = generateTestAddress({ country_code: 'US', pid: randomPID() });

      await insertAddress(db, jpAddr1);
      await insertAddress(db, jpAddr2);
      await insertAddress(db, usAddr);

      const results = await db.all('SELECT * FROM address_entries WHERE country_code = ?', [
        'JP',
      ]);

      expect(results.length).toBe(2);
    });
  });

  describe('Friend Entry CRUD Operations', () => {
    it('should insert a friend entry', async () => {
      const testFriend = generateTestFriend({ friend_pid: randomPID() });

      await db.run(
        `INSERT INTO friend_entries (
          id, owner_did, friend_did, friend_pid, friend_label_qr_hash,
          verified, label, is_revoked, can_use_for_shipping, added_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testFriend.id,
          testFriend.owner_did,
          testFriend.friend_did,
          testFriend.friend_pid,
          testFriend.friend_label_qr_hash,
          testFriend.verified ? 1 : 0,
          testFriend.label,
          testFriend.is_revoked ? 1 : 0,
          testFriend.can_use_for_shipping ? 1 : 0,
          testFriend.added_at,
        ]
      );

      const result = await db.get('SELECT * FROM friend_entries WHERE id = ?', [testFriend.id]);

      expect(result).toBeDefined();
      expect(result.friend_pid).toBe(testFriend.friend_pid);
    });

    it('should retrieve all friends for an owner', async () => {
      const ownerDid = 'did:key:test_owner_' + Date.now();
      const friend1 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });
      const friend2 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });

      await insertFriend(db, friend1);
      await insertFriend(db, friend2);

      const results = await db.all('SELECT * FROM friend_entries WHERE owner_did = ?', [
        ownerDid,
      ]);

      expect(results.length).toBe(2);
    });
  });

  describe('Query Performance', () => {
    it('should handle bulk inserts efficiently', async () => {
      const addresses = Array.from({ length: 100 }, () =>
        generateTestAddress({ pid: randomPID() })
      );

      const startTime = Date.now();

      // SQLite performs better with transactions for bulk operations
      await db.run('BEGIN TRANSACTION');
      for (const address of addresses) {
        await insertAddress(db, address);
      }
      await db.run('COMMIT');

      const duration = Date.now() - startTime;

      console.log(`Inserted 100 addresses in ${duration}ms`);
      expect(duration).toBeLessThan(5000);
    });

    it('should query with indexes efficiently', async () => {
      const userDid = 'did:key:test_user_' + Date.now();

      await db.run('BEGIN TRANSACTION');
      for (let i = 0; i < 50; i++) {
        await insertAddress(
          db,
          generateTestAddress({
            user_did: userDid,
            pid: randomPID(),
          })
        );
      }
      await db.run('COMMIT');

      const startTime = Date.now();
      const results = await db.all('SELECT * FROM address_entries WHERE user_did = ?', [
        userDid,
      ]);
      const duration = Date.now() - startTime;

      expect(results.length).toBe(50);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Transaction Support', () => {
    it('should support transactions with commit', async () => {
      const testAddress = generateTestAddress({ pid: randomPID() });

      await db.run('BEGIN TRANSACTION');
      await insertAddress(db, testAddress);
      await db.run('COMMIT');

      const result = await db.get('SELECT * FROM address_entries WHERE pid = ?', [
        testAddress.pid,
      ]);

      expect(result).toBeDefined();
    });

    it('should support transactions with rollback', async () => {
      const testAddress = generateTestAddress({ pid: randomPID() });

      await db.run('BEGIN TRANSACTION');
      await insertAddress(db, testAddress);
      await db.run('ROLLBACK');

      const result = await db.get('SELECT * FROM address_entries WHERE pid = ?', [
        testAddress.pid,
      ]);

      expect(result).toBeUndefined();
    });
  });

  describe('SQLite-specific Features', () => {
    it('should support PRAGMA queries', async () => {
      const result = await db.get('PRAGMA foreign_keys');
      expect(result).toBeDefined();
    });

    it('should support JSON functions (SQLite 3.38+)', async () => {
      try {
        const result = await db.get(`SELECT json('{"test": true}') as json`);
        expect(result).toBeDefined();
      } catch (error) {
        console.warn('JSON functions not available in this SQLite version');
      }
    });

    it('should get database size info', async () => {
      const result = await db.get('PRAGMA page_count');
      expect(result).toBeDefined();
      console.log('Database page count:', result);
    });
  });
});

// Helper functions

async function createTestTables(db: Database): Promise<void> {
  await db.run(`
    CREATE TABLE IF NOT EXISTS address_entries (
      id TEXT PRIMARY KEY,
      user_did TEXT NOT NULL,
      pid TEXT NOT NULL UNIQUE,
      encrypted_address_local TEXT NOT NULL,
      encrypted_address_en TEXT NOT NULL,
      encryption_algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
      encryption_iv TEXT NOT NULL,
      country_code TEXT NOT NULL,
      admin1_code TEXT,
      admin2_code TEXT,
      signature TEXT NOT NULL,
      vc_id TEXT,
      geo_hash TEXT,
      is_revoked INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      revoked_at TEXT,
      label TEXT,
      notes TEXT
    )
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_address_entries_user_did 
    ON address_entries(user_did)
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_address_entries_country_code 
    ON address_entries(country_code)
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_address_entries_is_revoked 
    ON address_entries(is_revoked)
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS friend_entries (
      id TEXT PRIMARY KEY,
      owner_did TEXT NOT NULL,
      friend_did TEXT NOT NULL,
      friend_pid TEXT NOT NULL,
      friend_label_qr_hash TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      label TEXT NOT NULL,
      avatar_url TEXT,
      is_revoked INTEGER NOT NULL DEFAULT 0,
      can_use_for_shipping INTEGER NOT NULL DEFAULT 1,
      added_at TEXT NOT NULL,
      last_used_at TEXT,
      notes TEXT,
      UNIQUE(owner_did, friend_pid)
    )
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_friend_entries_owner_did 
    ON friend_entries(owner_did)
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_friend_entries_friend_did 
    ON friend_entries(friend_did)
  `);

  await db.run(`
    CREATE INDEX IF NOT EXISTS idx_friend_entries_friend_pid 
    ON friend_entries(friend_pid)
  `);
}

async function insertAddress(db: Database, address: AddressEntry): Promise<void> {
  await db.run(
    `INSERT INTO address_entries (
      id, user_did, pid, encrypted_address_local, encrypted_address_en,
      encryption_algorithm, encryption_iv, country_code, admin1_code, admin2_code,
      signature, is_revoked, is_primary, created_at, updated_at, label
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      address.id,
      address.user_did,
      address.pid,
      address.encrypted_address_local,
      address.encrypted_address_en,
      address.encryption_algorithm,
      address.encryption_iv,
      address.country_code,
      address.admin1_code,
      address.admin2_code,
      address.signature,
      address.is_revoked ? 1 : 0,
      address.is_primary ? 1 : 0,
      address.created_at,
      address.updated_at,
      address.label,
    ]
  );
}

async function insertFriend(db: Database, friend: FriendEntry): Promise<void> {
  await db.run(
    `INSERT INTO friend_entries (
      id, owner_did, friend_did, friend_pid, friend_label_qr_hash,
      verified, label, is_revoked, can_use_for_shipping, added_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      friend.id,
      friend.owner_did,
      friend.friend_did,
      friend.friend_pid,
      friend.friend_label_qr_hash,
      friend.verified ? 1 : 0,
      friend.label,
      friend.is_revoked ? 1 : 0,
      friend.can_use_for_shipping ? 1 : 0,
      friend.added_at,
    ]
  );
}
