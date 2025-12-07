/**
 * MongoDB Connection and Integration Tests
 * MongoDB 接続と統合テスト
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoClient, Db, Collection } from 'mongodb';
import { getDatabaseConfig, isServiceConfigured, skipIfNotConfigured } from '../config/test-config';
import { generateTestAddress, generateTestFriend, randomPID } from '../utils/database-helpers';
import type { AddressEntry, FriendEntry } from '../../../docs/examples/cloud-address-book/database-schema';

describe('MongoDB Integration Tests', () => {
  let client: MongoClient;
  let db: Db;
  let addressCollection: Collection<AddressEntry>;
  let friendCollection: Collection<FriendEntry>;
  const config = getDatabaseConfig().mongodb;

  beforeAll(async () => {
    skipIfNotConfigured('mongodb');
    if (!isServiceConfigured('mongodb')) {
      return;
    }

    // Connect to MongoDB
    client = new MongoClient(config.uri);
    await client.connect();

    db = client.db(config.database);
    addressCollection = db.collection<AddressEntry>('address_entries');
    friendCollection = db.collection<FriendEntry>('friend_entries');

    // Create indexes
    await createIndexes();
  });

  afterAll(async () => {
    if (!isServiceConfigured('mongodb')) {
      return;
    }

    // Cleanup
    if (db) {
      await db.dropDatabase();
    }
    if (client) {
      await client.close();
    }
  });

  beforeEach(async () => {
    if (!isServiceConfigured('mongodb')) {
      return;
    }

    // Clear collections before each test
    await addressCollection.deleteMany({});
    await friendCollection.deleteMany({});
  });

  describe('Connection Tests', () => {
    it('should connect to MongoDB successfully', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const admin = db.admin();
      const serverInfo = await admin.serverInfo();
      expect(serverInfo.version).toBeDefined();
    });

    it('should verify database exists', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const admin = db.admin();
      const dbList = await admin.listDatabases();
      const dbExists = dbList.databases.some((d) => d.name === config.database);
      expect(dbExists).toBe(true);
    });

    it('should verify collections exist', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map((c) => c.name);
      expect(collectionNames).toContain('address_entries');
      expect(collectionNames).toContain('friend_entries');
    });
  });

  describe('Address Entry CRUD Operations', () => {
    it('should insert an address entry', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const testAddress = generateTestAddress();
      const result = await addressCollection.insertOne(testAddress);

      expect(result.insertedId).toBeDefined();
      expect(result.acknowledged).toBe(true);
    });

    it('should retrieve an address entry by PID', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await addressCollection.insertOne(testAddress);

      const found = await addressCollection.findOne({ pid: testAddress.pid });

      expect(found).toBeDefined();
      expect(found?.user_did).toBe(testAddress.user_did);
    });

    it('should update an address entry', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await addressCollection.insertOne(testAddress);

      const newLabel = 'Updated Label';
      await addressCollection.updateOne({ pid: testAddress.pid }, { $set: { label: newLabel } });

      const updated = await addressCollection.findOne({ pid: testAddress.pid });
      expect(updated?.label).toBe(newLabel);
    });

    it('should delete an address entry', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await addressCollection.insertOne(testAddress);

      const deleteResult = await addressCollection.deleteOne({ pid: testAddress.pid });
      expect(deleteResult.deletedCount).toBe(1);

      const found = await addressCollection.findOne({ pid: testAddress.pid });
      expect(found).toBeNull();
    });

    it('should enforce unique constraint on PID', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await addressCollection.insertOne(testAddress);

      // Try to insert another address with the same PID
      const duplicateAddress = generateTestAddress({ pid: testAddress.pid });

      await expect(addressCollection.insertOne(duplicateAddress)).rejects.toThrow();
    });

    it('should query by country code', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const jpAddress1 = generateTestAddress({ country_code: 'JP', pid: randomPID() });
      const jpAddress2 = generateTestAddress({ country_code: 'JP', pid: randomPID() });
      const usAddress = generateTestAddress({ country_code: 'US', pid: randomPID() });

      await addressCollection.insertMany([jpAddress1, jpAddress2, usAddress]);

      const jpAddresses = await addressCollection
        .find({ country_code: 'JP' })
        .toArray();

      expect(jpAddresses.length).toBe(2);
    });
  });

  describe('Friend Entry CRUD Operations', () => {
    it('should insert a friend entry', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const testFriend = generateTestFriend();
      const result = await friendCollection.insertOne(testFriend);

      expect(result.insertedId).toBeDefined();
      expect(result.acknowledged).toBe(true);
    });

    it('should retrieve all friends for an owner', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const ownerDid = 'did:key:test_owner_' + Date.now();
      const friend1 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });
      const friend2 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });

      await friendCollection.insertMany([friend1, friend2]);

      const friends = await friendCollection.find({ owner_did: ownerDid }).toArray();

      expect(friends.length).toBe(2);
    });

    it('should update a friend entry', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const testFriend = generateTestFriend({ friend_pid: randomPID() });
      await friendCollection.insertOne(testFriend);

      const newLabel = 'Best Friend';
      await friendCollection.updateOne({ id: testFriend.id }, { $set: { label: newLabel } });

      const updated = await friendCollection.findOne({ id: testFriend.id });
      expect(updated?.label).toBe(newLabel);
    });
  });

  describe('Query Performance', () => {
    it('should handle bulk inserts efficiently', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const addresses = Array.from({ length: 100 }, () =>
        generateTestAddress({ pid: randomPID() })
      );

      const startTime = Date.now();
      await addressCollection.insertMany(addresses);
      const duration = Date.now() - startTime;

      console.log(`Inserted 100 addresses in ${duration}ms`);
      expect(duration).toBeLessThan(5000);
    });

    it('should query with indexes efficiently', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const userDid = 'did:key:test_user_' + Date.now();
      const addresses = Array.from({ length: 50 }, () =>
        generateTestAddress({ user_did: userDid, pid: randomPID() })
      );

      await addressCollection.insertMany(addresses);

      const startTime = Date.now();
      const result = await addressCollection.find({ user_did: userDid }).toArray();
      const duration = Date.now() - startTime;

      expect(result.length).toBe(50);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Aggregation Pipeline', () => {
    it('should count addresses by country', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const addresses = [
        generateTestAddress({ country_code: 'JP', pid: randomPID() }),
        generateTestAddress({ country_code: 'JP', pid: randomPID() }),
        generateTestAddress({ country_code: 'US', pid: randomPID() }),
        generateTestAddress({ country_code: 'UK', pid: randomPID() }),
      ];

      await addressCollection.insertMany(addresses);

      const result = await addressCollection
        .aggregate([
          { $group: { _id: '$country_code', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      expect(result.length).toBe(3);
      expect(result[0]._id).toBe('JP');
      expect(result[0].count).toBe(2);
    });
  });

  describe('Transaction Support', () => {
    it('should support multi-document transactions', async () => {
      if (!isServiceConfigured('mongodb')) {
        return;
      }

      const session = client.startSession();
      const testAddress = generateTestAddress({ pid: randomPID() });
      const testFriend = generateTestFriend({ friend_pid: randomPID() });

      try {
        await session.withTransaction(async () => {
          await addressCollection.insertOne(testAddress, { session });
          await friendCollection.insertOne(testFriend, { session });
        });
      } finally {
        await session.endSession();
      }

      const address = await addressCollection.findOne({ pid: testAddress.pid });
      const friend = await friendCollection.findOne({ id: testFriend.id });

      expect(address).toBeDefined();
      expect(friend).toBeDefined();
    });
  });

  async function createIndexes(): Promise<void> {
    // Address entries indexes
    await addressCollection.createIndex({ pid: 1 }, { unique: true });
    await addressCollection.createIndex({ user_did: 1 });
    await addressCollection.createIndex({ country_code: 1 });
    await addressCollection.createIndex({ is_revoked: 1 });

    // Friend entries indexes
    await friendCollection.createIndex({ owner_did: 1, friend_pid: 1 }, { unique: true });
    await friendCollection.createIndex({ owner_did: 1 });
    await friendCollection.createIndex({ friend_did: 1 });
    await friendCollection.createIndex({ friend_pid: 1 });
  }
});
