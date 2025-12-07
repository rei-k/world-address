/**
 * PostgreSQL Connection and Integration Tests
 * PostgreSQL 接続と統合テスト
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Client, Pool } from 'pg';
import { getDatabaseConfig, isServiceConfigured, skipIfNotConfigured } from '../config/test-config';
import { generateTestAddress, generateTestFriend, randomPID } from '../utils/database-helpers';
import type { AddressEntry, FriendEntry } from '../../../docs/examples/cloud-address-book/database-schema';

describe('PostgreSQL Integration Tests', () => {
  let pool: Pool;
  let client: Client;
  const config = getDatabaseConfig().postgres;

  beforeAll(async () => {
    skipIfNotConfigured('postgres');
    if (!isServiceConfigured('postgres')) {
      return;
    }

    // Create connection pool
    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });

    // Get a client for setup
    client = await pool.connect();

    // Create test tables
    await createTestTables(client);
  });

  afterAll(async () => {
    if (!isServiceConfigured('postgres')) {
      return;
    }

    // Cleanup test tables
    await dropTestTables(client);

    // Release client and close pool
    if (client) {
      client.release();
    }
    if (pool) {
      await pool.end();
    }
  });

  beforeEach(async () => {
    if (!isServiceConfigured('postgres')) {
      return;
    }

    // Clear test data before each test
    await client.query('DELETE FROM friend_entries');
    await client.query('DELETE FROM address_entries');
  });

  describe('Connection Tests', () => {
    it('should connect to PostgreSQL successfully', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const result = await client.query('SELECT NOW()');
      expect(result.rows).toBeDefined();
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should verify database version', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const result = await client.query('SELECT version()');
      expect(result.rows[0].version).toContain('PostgreSQL');
    });

    it('should check if tables exist', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('address_entries', 'friend_entries')
      `);

      expect(result.rows.length).toBe(2);
    });
  });

  describe('Address Entry CRUD Operations', () => {
    it('should insert an address entry', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testAddress = generateTestAddress();

      const result = await client.query(
        `INSERT INTO address_entries (
          id, user_did, pid, encrypted_address_local, encrypted_address_en,
          encryption_algorithm, encryption_iv, country_code, admin1_code, admin2_code,
          signature, is_revoked, is_primary, created_at, updated_at, label
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
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
          testAddress.is_revoked,
          testAddress.is_primary,
          testAddress.created_at,
          testAddress.updated_at,
          testAddress.label,
        ]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].pid).toBe(testAddress.pid);
    });

    it('should retrieve an address entry by PID', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(client, testAddress);

      const result = await client.query('SELECT * FROM address_entries WHERE pid = $1', [
        testAddress.pid,
      ]);

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].user_did).toBe(testAddress.user_did);
    });

    it('should update an address entry', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(client, testAddress);

      const newLabel = 'Updated Label';
      await client.query('UPDATE address_entries SET label = $1 WHERE pid = $2', [
        newLabel,
        testAddress.pid,
      ]);

      const result = await client.query('SELECT * FROM address_entries WHERE pid = $1', [
        testAddress.pid,
      ]);

      expect(result.rows[0].label).toBe(newLabel);
    });

    it('should delete an address entry', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(client, testAddress);

      await client.query('DELETE FROM address_entries WHERE pid = $1', [testAddress.pid]);

      const result = await client.query('SELECT * FROM address_entries WHERE pid = $1', [
        testAddress.pid,
      ]);

      expect(result.rows.length).toBe(0);
    });

    it('should enforce unique constraint on PID', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(client, testAddress);

      // Try to insert another address with the same PID
      const duplicateAddress = generateTestAddress({ pid: testAddress.pid });

      await expect(insertAddress(client, duplicateAddress)).rejects.toThrow();
    });
  });

  describe('Friend Entry CRUD Operations', () => {
    it('should insert a friend entry', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testFriend = generateTestFriend();

      const result = await client.query(
        `INSERT INTO friend_entries (
          id, owner_did, friend_did, friend_pid, friend_label_qr_hash,
          verified, label, is_revoked, can_use_for_shipping, added_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          testFriend.id,
          testFriend.owner_did,
          testFriend.friend_did,
          testFriend.friend_pid,
          testFriend.friend_label_qr_hash,
          testFriend.verified,
          testFriend.label,
          testFriend.is_revoked,
          testFriend.can_use_for_shipping,
          testFriend.added_at,
        ]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0].friend_pid).toBe(testFriend.friend_pid);
    });

    it('should retrieve all friends for an owner', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const ownerDid = 'did:key:test_owner_' + Date.now();
      const friend1 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });
      const friend2 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });

      await insertFriend(client, friend1);
      await insertFriend(client, friend2);

      const result = await client.query('SELECT * FROM friend_entries WHERE owner_did = $1', [
        ownerDid,
      ]);

      expect(result.rows.length).toBe(2);
    });

    it('should enforce unique constraint on owner + friend PID', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testFriend = generateTestFriend({ friend_pid: randomPID() });
      await insertFriend(client, testFriend);

      // Try to insert another friend with same owner and PID
      const duplicateFriend = generateTestFriend({
        owner_did: testFriend.owner_did,
        friend_pid: testFriend.friend_pid,
      });

      await expect(insertFriend(client, duplicateFriend)).rejects.toThrow();
    });
  });

  describe('Query Performance', () => {
    it('should handle bulk inserts efficiently', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const addresses = Array.from({ length: 100 }, () =>
        generateTestAddress({ pid: randomPID() })
      );

      const startTime = Date.now();

      for (const address of addresses) {
        await insertAddress(client, address);
      }

      const duration = Date.now() - startTime;

      console.log(`Inserted 100 addresses in ${duration}ms`);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should query with indexes efficiently', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      // Insert test data
      const userDid = 'did:key:test_user_' + Date.now();
      for (let i = 0; i < 50; i++) {
        await insertAddress(
          client,
          generateTestAddress({
            user_did: userDid,
            pid: randomPID(),
          })
        );
      }

      const startTime = Date.now();
      const result = await client.query('SELECT * FROM address_entries WHERE user_did = $1', [
        userDid,
      ]);
      const duration = Date.now() - startTime;

      expect(result.rows.length).toBe(50);
      expect(duration).toBeLessThan(100); // Should be very fast with index
    });
  });

  describe('Transaction Support', () => {
    it('should support transactions with commit', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });

      await client.query('BEGIN');
      await insertAddress(client, testAddress);
      await client.query('COMMIT');

      const result = await client.query('SELECT * FROM address_entries WHERE pid = $1', [
        testAddress.pid,
      ]);

      expect(result.rows.length).toBe(1);
    });

    it('should support transactions with rollback', async () => {
      if (!isServiceConfigured('postgres')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });

      await client.query('BEGIN');
      await insertAddress(client, testAddress);
      await client.query('ROLLBACK');

      const result = await client.query('SELECT * FROM address_entries WHERE pid = $1', [
        testAddress.pid,
      ]);

      expect(result.rows.length).toBe(0);
    });
  });
});

// Helper functions

async function createTestTables(client: Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS address_entries (
      id VARCHAR(255) PRIMARY KEY,
      user_did VARCHAR(255) NOT NULL,
      pid VARCHAR(255) NOT NULL UNIQUE,
      encrypted_address_local TEXT NOT NULL,
      encrypted_address_en TEXT NOT NULL,
      encryption_algorithm VARCHAR(50) NOT NULL DEFAULT 'AES-256-GCM',
      encryption_iv VARCHAR(255) NOT NULL,
      country_code VARCHAR(2) NOT NULL,
      admin1_code VARCHAR(10),
      admin2_code VARCHAR(10),
      signature TEXT NOT NULL,
      vc_id VARCHAR(255),
      geo_hash VARCHAR(20),
      geo_restriction_flags TEXT[],
      is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revoked_at TIMESTAMP WITH TIME ZONE,
      label VARCHAR(255),
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_address_entries_user_did ON address_entries(user_did);
    CREATE INDEX IF NOT EXISTS idx_address_entries_country_code ON address_entries(country_code);
    CREATE INDEX IF NOT EXISTS idx_address_entries_is_revoked ON address_entries(is_revoked);
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS friend_entries (
      id VARCHAR(255) PRIMARY KEY,
      owner_did VARCHAR(255) NOT NULL,
      friend_did VARCHAR(255) NOT NULL,
      friend_pid VARCHAR(255) NOT NULL,
      friend_label_qr_hash VARCHAR(255) NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT FALSE,
      label VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
      can_use_for_shipping BOOLEAN NOT NULL DEFAULT TRUE,
      added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_used_at TIMESTAMP WITH TIME ZONE,
      notes TEXT,
      CONSTRAINT unique_owner_friend UNIQUE (owner_did, friend_pid)
    );

    CREATE INDEX IF NOT EXISTS idx_friend_entries_owner_did ON friend_entries(owner_did);
    CREATE INDEX IF NOT EXISTS idx_friend_entries_friend_did ON friend_entries(friend_did);
    CREATE INDEX IF NOT EXISTS idx_friend_entries_friend_pid ON friend_entries(friend_pid);
  `);
}

async function dropTestTables(client: Client): Promise<void> {
  await client.query('DROP TABLE IF EXISTS friend_entries CASCADE');
  await client.query('DROP TABLE IF EXISTS address_entries CASCADE');
}

async function insertAddress(client: Client, address: AddressEntry): Promise<void> {
  await client.query(
    `INSERT INTO address_entries (
      id, user_did, pid, encrypted_address_local, encrypted_address_en,
      encryption_algorithm, encryption_iv, country_code, admin1_code, admin2_code,
      signature, is_revoked, is_primary, created_at, updated_at, label
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
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
      address.is_revoked,
      address.is_primary,
      address.created_at,
      address.updated_at,
      address.label,
    ]
  );
}

async function insertFriend(client: Client, friend: FriendEntry): Promise<void> {
  await client.query(
    `INSERT INTO friend_entries (
      id, owner_did, friend_did, friend_pid, friend_label_qr_hash,
      verified, label, is_revoked, can_use_for_shipping, added_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      friend.id,
      friend.owner_did,
      friend.friend_did,
      friend.friend_pid,
      friend.friend_label_qr_hash,
      friend.verified,
      friend.label,
      friend.is_revoked,
      friend.can_use_for_shipping,
      friend.added_at,
    ]
  );
}
