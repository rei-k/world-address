/**
 * @vey/core - Tests for address-client module
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AddressClient,
  createAddressClient,
  type AddressClientConfig,
  type AuthCredentials,
} from '../src/address-client';

describe('AddressClient', () => {
  let client: AddressClient;
  const credentials: AuthCredentials = {
    did: 'did:key:test123',
    privateKey: 'test-private-key',
  };

  beforeEach(() => {
    client = new AddressClient({
      apiKey: 'test-api-key',
      apiEndpoint: 'https://api.example.com',
    });
  });

  describe('initialization', () => {
    it('should create client with config', () => {
      expect(client).toBeDefined();
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should create client with minimal config', () => {
      const minimalClient = new AddressClient();
      expect(minimalClient).toBeDefined();
    });

    it('should create client with full config', () => {
      const config: AddressClientConfig = {
        apiKey: 'test-key',
        apiEndpoint: 'https://api.vey.example',
        environment: 'production',
      };
      const fullClient = new AddressClient(config);
      expect(fullClient).toBeDefined();
    });
  });

  describe('authentication', () => {
    it('should authenticate user', async () => {
      await client.authenticate(credentials);
      expect(client.isAuthenticated()).toBe(true);
    });

    it('should store user DID after authentication', async () => {
      await client.authenticate(credentials);
      expect(client.getUserDid()).toBe(credentials.did);
    });

    it('should return undefined DID before authentication', () => {
      expect(client.getUserDid()).toBeUndefined();
    });

    it('should handle multiple authentication calls', async () => {
      await client.authenticate(credentials);
      const newCredentials: AuthCredentials = {
        did: 'did:key:new456',
        privateKey: 'new-key',
      };
      await client.authenticate(newCredentials);
      expect(client.getUserDid()).toBe(newCredentials.did);
    });
  });

  describe('addresses API', () => {
    beforeEach(async () => {
      await client.authenticate(credentials);
    });

    describe('create', () => {
      it('should create address entry', async () => {
        const addressEntry = {
          pid: 'JP-13-113-01',
          label: 'Home',
          street: '1-1-1 Example',
        };

        const result = await client.addresses.create(addressEntry);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.pid).toBe(addressEntry.pid);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(
          unauthClient.addresses.create({})
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('list', () => {
      it('should list addresses', async () => {
        const addresses = await client.addresses.list();
        expect(Array.isArray(addresses)).toBe(true);
      });

      it('should list with filter', async () => {
        const addresses = await client.addresses.list({ country: 'JP' });
        expect(Array.isArray(addresses)).toBe(true);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(unauthClient.addresses.list()).rejects.toThrow('not authenticated');
      });
    });

    describe('get', () => {
      it('should get address by ID', async () => {
        const result = await client.addresses.get('address-123');
        expect(result).toBeDefined();
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(unauthClient.addresses.get('id')).rejects.toThrow('not authenticated');
      });
    });

    describe('getByPid', () => {
      it('should get address by PID', async () => {
        const result = await client.addresses.getByPid('JP-13-113-01');
        expect(result).toBeDefined();
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(
          unauthClient.addresses.getByPid('JP-13-113-01')
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('update', () => {
      it('should update address', async () => {
        const updates = { label: 'New Home' };
        const result = await client.addresses.update('address-123', updates);
        expect(result).toBeDefined();
        expect(result.id).toBe('address-123');
        expect(result.label).toBe(updates.label);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(
          unauthClient.addresses.update('id', {})
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('delete', () => {
      it('should delete address', async () => {
        const result = await client.addresses.delete('address-123');
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(unauthClient.addresses.delete('id')).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('friends API', () => {
    beforeEach(async () => {
      await client.authenticate(credentials);
    });

    describe('create', () => {
      it('should create friend entry', async () => {
        const friendEntry = {
          friend_did: 'did:key:friend',
          friend_pid: 'US-CA-123',
          label: 'Best Friend',
        };

        const result = await client.friends.create(friendEntry);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.friend_did).toBe(friendEntry.friend_did);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(unauthClient.friends.create({})).rejects.toThrow('not authenticated');
      });
    });

    describe('list', () => {
      it('should list friends', async () => {
        const friends = await client.friends.list();
        expect(Array.isArray(friends)).toBe(true);
      });

      it('should list with filter', async () => {
        const friends = await client.friends.list({ verified: true });
        expect(Array.isArray(friends)).toBe(true);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(unauthClient.friends.list()).rejects.toThrow('not authenticated');
      });
    });

    describe('get', () => {
      it('should get friend by ID', async () => {
        const result = await client.friends.get('friend-123');
        expect(result).toBeDefined();
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(unauthClient.friends.get('id')).rejects.toThrow('not authenticated');
      });
    });

    describe('update', () => {
      it('should update friend', async () => {
        const updates = { label: 'New Label' };
        const result = await client.friends.update('friend-123', updates);
        expect(result).toBeDefined();
        expect(result.id).toBe('friend-123');
        expect(result.label).toBe(updates.label);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(
          unauthClient.friends.update('id', {})
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('delete', () => {
      it('should delete friend', async () => {
        const result = await client.friends.delete('friend-123');
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(unauthClient.friends.delete('id')).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('shipping API', () => {
    beforeEach(async () => {
      await client.authenticate(credentials);
    });

    describe('validate', () => {
      it('should validate shipping request', async () => {
        const request = {
          sender_pid: 'JP-13-113-01',
          recipient_pid: 'US-CA-123',
        };
        const circuit = {};

        const result = await client.shipping.validate(request, circuit);
        expect(result).toBeDefined();
        expect(result.valid).toBe(true);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(
          unauthClient.shipping.validate({}, {})
        ).rejects.toThrow('not authenticated');
      });
    });

    describe('createWaybill', () => {
      it('should create waybill', async () => {
        const waybill = {
          sender_pid: 'JP-13-113-01',
          recipient_pid: 'US-CA-123',
          carrier: 'DHL',
        };

        const result = await client.shipping.createWaybill(waybill);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.carrier).toBe(waybill.carrier);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(
          unauthClient.shipping.createWaybill({})
        ).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('carrier API', () => {
    beforeEach(async () => {
      await client.authenticate(credentials);
    });

    describe('resolvePID', () => {
      it('should attempt to resolve PID', async () => {
        const request = { pid: 'JP-13-113-01' };
        const policy = { allow_resolution: false };

        const result = await client.carrier.resolvePID(request, policy);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('address');
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(
          unauthClient.carrier.resolvePID({}, {})
        ).rejects.toThrow('not authenticated');
      });
    });
  });

  describe('audit API', () => {
    beforeEach(async () => {
      await client.authenticate(credentials);
    });

    describe('log', () => {
      it('should create audit log entry', async () => {
        const logEntry = {
          action: 'address_created',
          resource_id: 'address-123',
          timestamp: new Date().toISOString(),
        };

        const result = await client.audit.log(logEntry);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.action).toBe(logEntry.action);
      });

      it('should throw if not authenticated', async () => {
        const unauthClient = new AddressClient();
        await expect(unauthClient.audit.log({})).rejects.toThrow('not authenticated');
      });
    });
  });
});

describe('createAddressClient', () => {
  it('should create AddressClient instance', () => {
    const client = createAddressClient({
      apiKey: 'test-key',
    });
    expect(client).toBeInstanceOf(AddressClient);
  });

  it('should create client with no config', () => {
    const client = createAddressClient();
    expect(client).toBeInstanceOf(AddressClient);
  });

  it('should create client with full config', () => {
    const client = createAddressClient({
      apiKey: 'test-key',
      apiEndpoint: 'https://api.vey.example',
      environment: 'production',
    });
    expect(client).toBeInstanceOf(AddressClient);
  });
});

describe('error handling', () => {
  it('should throw meaningful error when not authenticated', async () => {
    const client = new AddressClient();
    
    await expect(client.addresses.list()).rejects.toThrow('not authenticated');
    await expect(client.friends.list()).rejects.toThrow('not authenticated');
    await expect(client.shipping.validate({}, {})).rejects.toThrow('not authenticated');
    await expect(client.carrier.resolvePID({}, {})).rejects.toThrow('not authenticated');
    await expect(client.audit.log({})).rejects.toThrow('not authenticated');
  });
});
