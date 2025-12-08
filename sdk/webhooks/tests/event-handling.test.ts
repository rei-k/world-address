/**
 * @vey/webhooks - Tests for webhook event handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WebhookRegistry,
  createWebhookHandler,
  parsePayload,
  expressMiddleware,
  type WebhookConfig,
  type WebhookPayload,
  type WebhookHandler,
} from '../src/index';

describe('Webhook Event Handling', () => {
  const config: WebhookConfig = {
    secret: 'test-secret',
    tolerance: 300,
  };

  let registry: WebhookRegistry;

  beforeEach(() => {
    registry = new WebhookRegistry(config);
  });

  describe('WebhookRegistry', () => {
    it('should create registry with config', () => {
      expect(registry).toBeInstanceOf(WebhookRegistry);
    });

    it('should register event handler', () => {
      const handler = vi.fn();
      registry.on('address.created', handler);

      expect(() => registry.on('address.created', handler)).not.toThrow();
    });

    it('should register multiple handlers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      registry.on('address.created', handler1);
      registry.on('address.created', handler2);

      expect(() => {
        registry.on('address.created', handler1);
        registry.on('address.created', handler2);
      }).not.toThrow();
    });

    it('should register wildcard handler', () => {
      const handler = vi.fn();
      registry.on('*', handler);

      expect(() => registry.on('*', handler)).not.toThrow();
    });
  });

  describe('Event-specific registration methods', () => {
    it('should register address.updated handler', () => {
      const handler = vi.fn();
      registry.onAddressUpdate(handler);

      expect(() => registry.onAddressUpdate(handler)).not.toThrow();
    });

    it('should register address.created handler', () => {
      const handler = vi.fn();
      registry.onAddressCreated(handler);

      expect(() => registry.onAddressCreated(handler)).not.toThrow();
    });

    it('should register address.deleted handler', () => {
      const handler = vi.fn();
      registry.onAddressDeleted(handler);

      expect(() => registry.onAddressDeleted(handler)).not.toThrow();
    });

    it('should register delivery status handler for multiple events', () => {
      const handler = vi.fn();
      registry.onDeliveryStatus(handler);

      expect(() => registry.onDeliveryStatus(handler)).not.toThrow();
    });
  });

  describe('parsePayload', () => {
    it('should parse JSON string payload', () => {
      const payloadStr = JSON.stringify({
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      });

      const parsed = parsePayload(payloadStr);

      expect(parsed).toHaveProperty('event', 'address.created');
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('data');
    });

    it('should parse object payload', () => {
      const payloadObj = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      const parsed = parsePayload(payloadObj);

      expect(parsed).toEqual(payloadObj);
    });

    it('should throw on invalid JSON string', () => {
      const invalidJson = '{ invalid json }';

      expect(() => parsePayload(invalidJson)).toThrow();
    });
  });

  describe('handle method', () => {
    it('should execute registered handler when event matches', async () => {
      const handler = vi.fn();
      registry.on('address.created', handler);

      const payload: WebhookPayload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123', address: {} },
      };

      const result = await registry.handle(payload);

      expect(result.success).toBe(true);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        'address.created',
        payload.data,
        payload
      );
    });

    it('should execute multiple handlers for same event', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      registry.on('address.created', handler1);
      registry.on('address.created', handler2);

      const payload: WebhookPayload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      await registry.handle(payload);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should execute wildcard handler for any event', async () => {
      const wildcardHandler = vi.fn();
      const specificHandler = vi.fn();

      registry.on('*', wildcardHandler);
      registry.on('address.created', specificHandler);

      const payload: WebhookPayload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      await registry.handle(payload);

      expect(wildcardHandler).toHaveBeenCalledTimes(1);
      expect(specificHandler).toHaveBeenCalledTimes(1);
    });

    it('should not execute handler when event does not match', async () => {
      const handler = vi.fn();
      registry.on('address.created', handler);

      const payload: WebhookPayload = {
        event: 'address.updated',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      await registry.handle(payload);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle async handlers', async () => {
      const asyncHandler: WebhookHandler = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      registry.on('address.created', asyncHandler);

      const payload: WebhookPayload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      const result = await registry.handle(payload);

      expect(result.success).toBe(true);
      expect(asyncHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in handlers gracefully', async () => {
      const errorHandler: WebhookHandler = vi.fn(() => {
        throw new Error('Handler error');
      });

      registry.on('address.created', errorHandler);

      const payload: WebhookPayload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      // Should not throw, but return error in result
      await expect(registry.handle(payload)).resolves.toBeDefined();
    });

    it('should verify signature when provided', async () => {
      const handler = vi.fn();
      registry.on('address.created', handler);

      const payload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      const payloadStr = JSON.stringify(payload);

      // Create valid signature
      const { createSignature } = await import('../src/index');
      const signature = await createSignature(payloadStr, config.secret);

      const result = await registry.handle(payloadStr, signature);

      expect(result.success).toBe(true);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid signature', async () => {
      const handler = vi.fn();
      registry.on('address.created', handler);

      const payload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      const invalidSignature = 'sha256=' + 'a'.repeat(64);

      const result = await registry.handle(payload, invalidSignature);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid signature');
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle different event types correctly', async () => {
      const handlers = {
        created: vi.fn(),
        updated: vi.fn(),
        deleted: vi.fn(),
      };

      registry.on('address.created', handlers.created);
      registry.on('address.updated', handlers.updated);
      registry.on('address.deleted', handlers.deleted);

      const events = [
        { event: 'address.created' as const, data: { address_id: '1' } },
        { event: 'address.updated' as const, data: { address_id: '2' } },
        { event: 'address.deleted' as const, data: { address_id: '3' } },
      ];

      for (const evt of events) {
        await registry.handle({
          ...evt,
          timestamp: Date.now(),
        });
      }

      expect(handlers.created).toHaveBeenCalledTimes(1);
      expect(handlers.updated).toHaveBeenCalledTimes(1);
      expect(handlers.deleted).toHaveBeenCalledTimes(1);
    });
  });

  describe('createWebhookHandler', () => {
    it('should create WebhookRegistry instance', () => {
      const registry = createWebhookHandler(config);

      expect(registry).toBeInstanceOf(WebhookRegistry);
    });

    it('should create registry with provided config', () => {
      const customConfig: WebhookConfig = {
        secret: 'custom-secret',
        tolerance: 600,
      };

      const registry = createWebhookHandler(customConfig);

      expect(registry).toBeInstanceOf(WebhookRegistry);
    });
  });

  describe('expressMiddleware', () => {
    it('should create Express-compatible middleware', () => {
      const middleware = expressMiddleware(registry);

      expect(middleware).toBeInstanceOf(Function);
      expect(middleware.length).toBe(2); // (req, res) => {}
    });

    it('should handle successful webhook request', async () => {
      const handler = vi.fn();
      registry.on('address.created', handler);

      const middleware = expressMiddleware(registry);

      const req = {
        body: {
          event: 'address.created',
          timestamp: Date.now(),
          data: { address_id: 'addr_123' },
        },
        headers: {},
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await middleware(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should verify signature from headers', async () => {
      const handler = vi.fn();
      registry.on('address.created', handler);

      const middleware = expressMiddleware(registry);

      const payload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: { address_id: 'addr_123' },
      };

      const { createSignature } = await import('../src/index');
      const signature = await createSignature(JSON.stringify(payload), config.secret);

      const req = {
        body: payload,
        headers: {
          'x-vey-signature': signature,
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await middleware(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should reject request with invalid signature', async () => {
      const handler = vi.fn();
      registry.on('address.created', handler);

      const middleware = expressMiddleware(registry);

      const req = {
        body: {
          event: 'address.created',
          timestamp: Date.now(),
          data: { address_id: 'addr_123' },
        },
        headers: {
          'x-vey-signature': 'sha256=' + 'a'.repeat(64),
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await middleware(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid signature' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const errorHandler: WebhookHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      registry.on('address.created', errorHandler);

      const middleware = expressMiddleware(registry);

      const req = {
        body: {
          event: 'address.created',
          timestamp: Date.now(),
          data: { address_id: 'addr_123' },
        },
        headers: {},
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await middleware(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe('Type-specific event data', () => {
    it('should handle AddressUpdateData correctly', async () => {
      const handler = vi.fn();
      registry.onAddressUpdate(handler);

      const payload: WebhookPayload = {
        event: 'address.updated',
        timestamp: Date.now(),
        data: {
          address_id: 'addr_123',
          previous: { city: 'Tokyo' },
          current: { street: '123 Main St', city: 'Osaka', country: 'JP' },
          changed_fields: ['city'],
        },
      };

      await registry.handle(payload);

      expect(handler).toHaveBeenCalledWith(
        'address.updated',
        expect.objectContaining({
          address_id: 'addr_123',
          previous: expect.any(Object),
          current: expect.any(Object),
          changed_fields: expect.any(Array),
        }),
        payload
      );
    });

    it('should handle DeliveryStatusData correctly', async () => {
      const handler = vi.fn();
      registry.onDeliveryStatus(handler);

      const payload: WebhookPayload = {
        event: 'delivery.completed',
        timestamp: Date.now(),
        data: {
          address_id: 'addr_123',
          carrier: 'FedEx',
          tracking_number: '123456789',
          status: 'delivered',
        },
      };

      await registry.handle(payload);

      expect(handler).toHaveBeenCalledWith(
        'delivery.completed',
        expect.objectContaining({
          address_id: 'addr_123',
          carrier: 'FedEx',
          status: 'delivered',
        }),
        payload
      );
    });
  });
});
