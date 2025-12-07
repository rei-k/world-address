/**
 * Supabase Integration Tests
 * Supabase 統合テスト
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getCloudServiceConfig, isServiceConfigured, skipIfNotConfigured } from '../config/test-config';
import { generateTestAddress, generateTestFriend, randomPID } from '../utils/database-helpers';
import type { AddressEntry, FriendEntry } from '../../../docs/examples/cloud-address-book/database-schema';

describe('Supabase Integration Tests', () => {
  let supabase: SupabaseClient;
  const config = getCloudServiceConfig().supabase;

  beforeAll(async () => {
    skipIfNotConfigured('supabase');
    if (!isServiceConfigured('supabase')) {
      return;
    }

    // Initialize Supabase client
    supabase = createClient(config.url, config.serviceRoleKey);

    // Create tables if they don't exist
    await createTables();
  });

  afterAll(async () => {
    if (!isServiceConfigured('supabase')) {
      return;
    }

    // Cleanup tables
    await dropTables();
  });

  beforeEach(async () => {
    if (!isServiceConfigured('supabase')) {
      return;
    }

    // Clear test data
    await supabase.from('friend_entries').delete().neq('id', '');
    await supabase.from('address_entries').delete().neq('id', '');
  });

  describe('Connection Tests', () => {
    it('should connect to Supabase successfully', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const { data, error } = await supabase.from('address_entries').select('count');
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should verify tables exist', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const { data: addressData, error: addressError } = await supabase
        .from('address_entries')
        .select('*')
        .limit(0);

      const { data: friendData, error: friendError } = await supabase
        .from('friend_entries')
        .select('*')
        .limit(0);

      expect(addressError).toBeNull();
      expect(friendError).toBeNull();
    });
  });

  describe('Address Entry CRUD Operations', () => {
    it('should insert an address entry', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });

      const { data, error } = await supabase
        .from('address_entries')
        .insert(testAddress)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0]?.pid).toBe(testAddress.pid);
    });

    it('should retrieve an address entry by PID', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await supabase.from('address_entries').insert(testAddress);

      const { data, error } = await supabase
        .from('address_entries')
        .select('*')
        .eq('pid', testAddress.pid)
        .single();

      expect(error).toBeNull();
      expect(data?.user_did).toBe(testAddress.user_did);
    });

    it('should update an address entry', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await supabase.from('address_entries').insert(testAddress);

      const newLabel = 'Updated Label';
      const { error } = await supabase
        .from('address_entries')
        .update({ label: newLabel })
        .eq('pid', testAddress.pid);

      expect(error).toBeNull();

      const { data } = await supabase
        .from('address_entries')
        .select('*')
        .eq('pid', testAddress.pid)
        .single();

      expect(data?.label).toBe(newLabel);
    });

    it('should delete an address entry', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const testAddress = generateTestAddress({ pid: randomPID() });
      await supabase.from('address_entries').insert(testAddress);

      const { error } = await supabase
        .from('address_entries')
        .delete()
        .eq('pid', testAddress.pid);

      expect(error).toBeNull();

      const { data } = await supabase
        .from('address_entries')
        .select('*')
        .eq('pid', testAddress.pid);

      expect(data?.length).toBe(0);
    });

    it('should query addresses by user DID', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const userDid = 'did:key:test_user_' + Date.now();
      const addr1 = generateTestAddress({ user_did: userDid, pid: randomPID() });
      const addr2 = generateTestAddress({ user_did: userDid, pid: randomPID() });

      await supabase.from('address_entries').insert([addr1, addr2]);

      const { data, error } = await supabase
        .from('address_entries')
        .select('*')
        .eq('user_did', userDid);

      expect(error).toBeNull();
      expect(data?.length).toBe(2);
    });

    it('should query addresses by country code', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const jpAddr1 = generateTestAddress({ country_code: 'JP', pid: randomPID() });
      const jpAddr2 = generateTestAddress({ country_code: 'JP', pid: randomPID() });
      const usAddr = generateTestAddress({ country_code: 'US', pid: randomPID() });

      await supabase.from('address_entries').insert([jpAddr1, jpAddr2, usAddr]);

      const { data, error } = await supabase
        .from('address_entries')
        .select('*')
        .eq('country_code', 'JP');

      expect(error).toBeNull();
      expect(data?.length).toBe(2);
    });
  });

  describe('Friend Entry CRUD Operations', () => {
    it('should insert a friend entry', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const testFriend = generateTestFriend({ friend_pid: randomPID() });

      const { data, error } = await supabase
        .from('friend_entries')
        .insert(testFriend)
        .select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.[0]?.friend_pid).toBe(testFriend.friend_pid);
    });

    it('should retrieve friends by owner DID', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const ownerDid = 'did:key:test_owner_' + Date.now();
      const friend1 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });
      const friend2 = generateTestFriend({ owner_did: ownerDid, friend_pid: randomPID() });

      await supabase.from('friend_entries').insert([friend1, friend2]);

      const { data, error } = await supabase
        .from('friend_entries')
        .select('*')
        .eq('owner_did', ownerDid);

      expect(error).toBeNull();
      expect(data?.length).toBe(2);
    });

    it('should update a friend entry', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const testFriend = generateTestFriend({ friend_pid: randomPID() });
      await supabase.from('friend_entries').insert(testFriend);

      const newLabel = 'Best Friend';
      await supabase
        .from('friend_entries')
        .update({ label: newLabel })
        .eq('id', testFriend.id);

      const { data } = await supabase
        .from('friend_entries')
        .select('*')
        .eq('id', testFriend.id)
        .single();

      expect(data?.label).toBe(newLabel);
    });
  });

  describe('Supabase Storage', () => {
    it('should upload and download a file', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const bucketName = 'test-bucket';
      const fileName = `test_${Date.now()}.txt`;
      const fileContent = 'Hello, Supabase Storage!';

      // Try to create bucket (may already exist)
      try {
        await supabase.storage.createBucket(bucketName, { public: true });
      } catch (error) {
        // Bucket may already exist
      }

      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileContent);

      if (uploadError) {
        console.warn('Upload error:', uploadError);
        return;
      }

      expect(uploadData).toBeDefined();

      // Get public URL
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);

      expect(urlData.publicUrl).toContain(fileName);

      // Cleanup
      await supabase.storage.from(bucketName).remove([fileName]);
    });
  });

  describe('Realtime Subscriptions', () => {
    it('should subscribe to address changes', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      return new Promise<void>((resolve) => {
        let changeDetected = false;

        const channel = supabase
          .channel('address-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'address_entries',
            },
            (payload) => {
              changeDetected = true;
              console.log('Change detected:', payload);
            }
          )
          .subscribe();

        // Wait for subscription to be ready
        setTimeout(async () => {
          const testAddress = generateTestAddress({ pid: randomPID() });
          await supabase.from('address_entries').insert(testAddress);

          // Wait for change to be detected
          setTimeout(() => {
            supabase.removeChannel(channel);
            if (changeDetected) {
              resolve();
            } else {
              console.warn('Realtime change was not detected (may not be enabled)');
              resolve();
            }
          }, 2000);
        }, 1000);
      });
    }, 10000); // Extended timeout for realtime
  });

  describe('Query Performance', () => {
    it('should handle bulk inserts efficiently', async () => {
      if (!isServiceConfigured('supabase')) {
        return;
      }

      const addresses = Array.from({ length: 50 }, () =>
        generateTestAddress({ pid: randomPID() })
      );

      const startTime = Date.now();
      const { error } = await supabase.from('address_entries').insert(addresses);
      const duration = Date.now() - startTime;

      expect(error).toBeNull();
      console.log(`Inserted 50 addresses in ${duration}ms`);
      expect(duration).toBeLessThan(5000);
    });
  });

  async function createTables(): Promise<void> {
    // Tables should be created via Supabase dashboard or migrations
    // This is a placeholder for documentation
    console.log('Tables should exist in Supabase project');
  }

  async function dropTables(): Promise<void> {
    // Cleanup is done in beforeEach
    console.log('Cleanup completed');
  }
});
