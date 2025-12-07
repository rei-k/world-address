/**
 * MySQL/MariaDB Connection and Integration Tests
 * MySQL/MariaDB 接続と統合テスト
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mysql from 'mysql2/promise';
import { getDatabaseConfig, isServiceConfigured, skipIfNotConfigured } from '../config/test-config';
import { generateTestAddress, generateTestFriend, randomPID } from '../utils/database-helpers';
import type { AddressEntry, FriendEntry } from '../../../docs/examples/cloud-address-book/database-schema';

describe('MySQL/MariaDB Integration Tests', () => {
  let connection: mysql.Connection;
  const config = getDatabaseConfig().mysql;

  beforeAll(async () => {
    skipIfNotConfigured('mysql');
    if (!isServiceConfigured('mysql')) {
      return;
    }

    // Create connection
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    // Create test tables
    await createTestTables(connection);
  });

  afterAll(async () => {
    if (!isServiceConfigured('mysql')) {
      return;
    }

    // Cleanup test tables
    await dropTestTables(connection);

    // Close connection
    if (connection) {
      await connection.end();
    }
  });

  beforeEach(async () => {
    if (!isServiceConfigured('mysql')) {
      return;
    }

    // Clear test data before each test
    await connection.execute('DELETE FROM friend_entries');
    await connection.execute('DELETE FROM address_entries');
  });

  describe('Connection Tests', () => {
    it('should connect to MySQL/MariaDB successfully', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const [rows] = await connection.execute('SELECT NOW() as now');
      expect(rows).toBeDefined();
      expect(Array.isArray(rows)).toBe(true);
    });

    it('should verify database version', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const [rows] = await connection.execute('SELECT VERSION() as version') as any;
      const version = rows[0].version;
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });

    it('should check if tables exist', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const [rows] = await connection.execute(
        `SHOW TABLES LIKE 'address_entries'`
      );

      expect(Array.isArray(rows)).toBe(true);
      expect((rows as any[]).length).toBeGreaterThan(0);
    });
  });

  describe('Address Entry CRUD Operations', () => {
    it('should insert an address entry', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });

      const [result] = await connection.execute(
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
      ) as any;

      expect(result.affectedRows).toBe(1);
    });

    it('should retrieve an address entry by PID', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(connection, testAddress);

      const [rows] = await connection.execute(
        'SELECT * FROM address_entries WHERE pid = ?',
        [testAddress.pid]
      ) as any;

      expect(rows.length).toBe(1);
      expect(rows[0].user_did).toBe(testAddress.user_did);
    });

    it('should update an address entry', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(connection, testAddress);

      const newLabel = 'Updated Label';
      await connection.execute('UPDATE address_entries SET label = ? WHERE pid = ?', [
        newLabel,
        testAddress.pid,
      ]);

      const [rows] = await connection.execute(
        'SELECT * FROM address_entries WHERE pid = ?',
        [testAddress.pid]
      ) as any;

      expect(rows[0].label).toBe(newLabel);
    });

    it('should delete an address entry', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(connection, testAddress);

      await connection.execute('DELETE FROM address_entries WHERE pid = ?', [testAddress.pid]);

      const [rows] = await connection.execute(
        'SELECT * FROM address_entries WHERE pid = ?',
        [testAddress.pid]
      ) as any;

      expect(rows.length).toBe(0);
    });

    it('should enforce unique constraint on PID', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await insertAddress(connection, testAddress);

      // Try to insert another address with the same PID
      const duplicateAddress = generateTestAddress({ pid: testAddress.pid });

      await expect(insertAddress(connection, duplicateAddress)).rejects.toThrow();
    });

    it('should query addresses by country code', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const jpAddr1 = generateTestAddress({ country_code: 'JP', pid: randomPID() });
      const jpAddr2 = generateTestAddress({ country_code: 'JP', pid: randomPID() });
      const usAddr = generateTestAddress({ country_code: 'US', pid: randomPID() });

      await insertAddress(connection, jpAddr1);
      await insertAddress(connection, jpAddr2);
      await insertAddress(connection, usAddr);

      const [rows] = await connection.execute(
        'SELECT * FROM address_entries WHERE country_code = ?',
        ['JP']
      ) as any;

      expect(rows.length).toBe(2);
    });
  });

  describe('Friend Entry CRUD Operations', () => {
    it('should insert a friend entry', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const testFriend = generateTestFriend({ friend_pid: randomPID() });

      const [result] = await connection.execute(
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
      ) as any;

      expect(result.affectedRows).toBe(1);
    });

    it('should retrieve all friends for an owner', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const ownerDid = 'did:key:test_owner_' + Date.now();
      const friend1 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });
      const friend2 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });

      await insertFriend(connection, friend1);
      await insertFriend(connection, friend2);

      const [rows] = await connection.execute(
        'SELECT * FROM friend_entries WHERE owner_did = ?',
        [ownerDid]
      ) as any;

      expect(rows.length).toBe(2);
    });
  });

  describe('Query Performance', () => {
    it('should handle bulk inserts efficiently', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const addresses = Array.from({ length: 100 }, () =>
        generateTestAddress({ pid: randomPID() })
      );

      const startTime = Date.now();

      for (const address of addresses) {
        await insertAddress(connection, address);
      }

      const duration = Date.now() - startTime;

      console.log(`Inserted 100 addresses in ${duration}ms`);
      expect(duration).toBeLessThan(10000);
    });

    it('should query with indexes efficiently', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const userDid = 'did:key:test_user_' + Date.now();
      for (let i = 0; i < 50; i++) {
        await insertAddress(
          connection,
          generateTestAddress({
            user_did: userDid,
            pid: randomPID(),
          })
        );
      }

      const startTime = Date.now();
      const [rows] = await connection.execute(
        'SELECT * FROM address_entries WHERE user_did = ?',
        [userDid]
      ) as any;
      const duration = Date.now() - startTime;

      expect(rows.length).toBe(50);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Transaction Support', () => {
    it('should support transactions with commit', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });

      await connection.beginTransaction();
      await insertAddress(connection, testAddress);
      await connection.commit();

      const [rows] = await connection.execute(
        'SELECT * FROM address_entries WHERE pid = ?',
        [testAddress.pid]
      ) as any;

      expect(rows.length).toBe(1);
    });

    it('should support transactions with rollback', async () => {
      if (!isServiceConfigured('mysql')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });

      await connection.beginTransaction();
      await insertAddress(connection, testAddress);
      await connection.rollback();

      const [rows] = await connection.execute(
        'SELECT * FROM address_entries WHERE pid = ?',
        [testAddress.pid]
      ) as any;

      expect(rows.length).toBe(0);
    });
  });
});

// Helper functions

async function createTestTables(connection: mysql.Connection): Promise<void> {
  await connection.execute(`
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
      is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      revoked_at TIMESTAMP NULL,
      label VARCHAR(255),
      notes TEXT,
      INDEX idx_user_did (user_did),
      INDEX idx_country_code (country_code),
      INDEX idx_is_revoked (is_revoked)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.execute(`
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
      added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_used_at TIMESTAMP NULL,
      notes TEXT,
      UNIQUE KEY unique_owner_friend (owner_did, friend_pid),
      INDEX idx_owner_did (owner_did),
      INDEX idx_friend_did (friend_did),
      INDEX idx_friend_pid (friend_pid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function dropTestTables(connection: mysql.Connection): Promise<void> {
  await connection.execute('DROP TABLE IF EXISTS friend_entries');
  await connection.execute('DROP TABLE IF EXISTS address_entries');
}

async function insertAddress(
  connection: mysql.Connection,
  address: AddressEntry
): Promise<void> {
  await connection.execute(
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

async function insertFriend(
  connection: mysql.Connection,
  friend: FriendEntry
): Promise<void> {
  await connection.execute(
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
