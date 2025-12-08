/**
 * @vey/webhooks - Tests for webhook delivery and retry logic
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  WebhookDelivery,
  createWebhookDelivery,
  type WebhookPayload,
  type WebhookConfig,
} from '../src/index';

// Mock fetch globally
global.fetch = vi.fn();

describe('Webhook Delivery and Retry Logic', () => {
  const testPayload: WebhookPayload = {
    event: 'address.created',
    timestamp: Date.now(),
    data: {
      address_id: 'addr_123',
      address: {
        street: '123 Main St',
        city: 'Tokyo',
        country: 'JP',
      },
    },
  };

  const testUrl = 'https://example.com/webhook';
  const testSecret = 'test-secret';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('WebhookDelivery', () => {
    it('should create delivery instance with default config', () => {
      const delivery = new WebhookDelivery();
      expect(delivery).toBeInstanceOf(WebhookDelivery);
    });

    it('should create delivery instance with custom config', () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 5,
        backoff: 'linear',
        initialDelay: 2000,
        maxDelay: 120000,
      });
      expect(delivery).toBeInstanceOf(WebhookDelivery);
    });
  });

  describe('deliver method - Success cases', () => {
    it('should deliver webhook successfully on first attempt', async () => {
      const delivery = new WebhookDelivery();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await delivery.deliver(testUrl, testPayload, testSecret);

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(result.error).toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should include correct headers in request', async () => {
      const delivery = new WebhookDelivery();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await delivery.deliver(testUrl, testPayload, testSecret);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Vey-Event']).toBe('address.created');
      expect(headers['X-Vey-Signature']).toMatch(/^sha256=[a-f0-9]{64}$/);
      expect(headers['X-Vey-Delivery-Attempt']).toBe('1');
    });

    it('should send correct payload body', async () => {
      const delivery = new WebhookDelivery();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await delivery.deliver(testUrl, testPayload, testSecret);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = fetchCall[1].body;

      expect(JSON.parse(body)).toEqual(testPayload);
    });
  });

  describe('deliver method - Retry with exponential backoff', () => {
    it('should retry on server error (5xx)', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
        backoff: 'exponential',
        initialDelay: 1000,
      });

      // Fail twice, succeed on third
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' })
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      // Fast-forward through delays
      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff delays', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
        backoff: 'exponential',
        initialDelay: 1000,
      });

      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      // First attempt - immediate
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second attempt - after ~1000ms (with jitter)
      await vi.advanceTimersByTimeAsync(1500);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Third attempt - after ~2000ms (with jitter)
      await vi.advanceTimersByTimeAsync(3000);
      expect(global.fetch).toHaveBeenCalledTimes(3);

      await resultPromise;
    });

    it('should respect maxDelay', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 5,
        backoff: 'exponential',
        initialDelay: 1000,
        maxDelay: 5000,
      });

      (global.fetch as any).mockResolvedValue({ ok: false, status: 500 });

      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      // Fast-forward through all retries
      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(5);
    });
  });

  describe('deliver method - Retry with linear backoff', () => {
    it('should use linear backoff delays', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
        backoff: 'linear',
        initialDelay: 1000,
      });

      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      // First attempt
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second attempt - after 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Third attempt - after 2000ms (linear: 1000 * 2)
      await vi.advanceTimersByTimeAsync(2000);
      expect(global.fetch).toHaveBeenCalledTimes(3);

      await resultPromise;
    });
  });

  describe('deliver method - Error cases', () => {
    it('should not retry on client error (4xx)', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const result = await delivery.deliver(testUrl, testPayload, testSecret);

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(result.error).toContain('Client error: 400');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 404 Not Found', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await delivery.deliver(testUrl, testPayload, testSecret);

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
        initialDelay: 1000,
      });

      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retry attempts', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
        initialDelay: 1000,
      });

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
      expect(result.error).toContain('Server error after 3 attempts');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should return network error message on final failure', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 2,
        initialDelay: 1000,
      });

      const networkError = new Error('DNS lookup failed');
      (global.fetch as any).mockRejectedValue(networkError);

      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2);
      expect(result.error).toBe('DNS lookup failed');
    });
  });

  describe('deliver method - Attempt tracking', () => {
    it('should include attempt number in headers', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
        initialDelay: 100,
      });

      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      await vi.runAllTimersAsync();

      await resultPromise;

      const calls = (global.fetch as any).mock.calls;
      expect(calls[0][1].headers['X-Vey-Delivery-Attempt']).toBe('1');
      expect(calls[1][1].headers['X-Vey-Delivery-Attempt']).toBe('2');
      expect(calls[2][1].headers['X-Vey-Delivery-Attempt']).toBe('3');
    });
  });

  describe('createWebhookDelivery', () => {
    it('should create WebhookDelivery instance', () => {
      const delivery = createWebhookDelivery();
      expect(delivery).toBeInstanceOf(WebhookDelivery);
    });

    it('should create delivery with custom config', () => {
      const delivery = createWebhookDelivery({
        maxAttempts: 5,
        backoff: 'linear',
      });
      expect(delivery).toBeInstanceOf(WebhookDelivery);
    });
  });

  describe('Edge cases', () => {
    it('should handle very large payload', async () => {
      const delivery = new WebhookDelivery();

      const largePayload: WebhookPayload = {
        event: 'address.created',
        timestamp: Date.now(),
        data: {
          address_id: 'addr_123',
          large_field: 'x'.repeat(100000),
        },
      };

      (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await delivery.deliver(testUrl, largePayload, testSecret);

      expect(result.success).toBe(true);
    });

    it('should handle special characters in URL', async () => {
      const delivery = new WebhookDelivery();
      const specialUrl = 'https://example.com/webhook?key=value&test=123';

      (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await delivery.deliver(specialUrl, testPayload, testSecret);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(specialUrl, expect.any(Object));
    });

    it('should handle maxAttempts of 1 (no retries)', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 1,
      });

      (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await delivery.deliver(testUrl, testPayload, testSecret);

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle response without statusText', async () => {
      const delivery = new WebhookDelivery();

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: undefined,
      });

      const result = await delivery.deliver(testUrl, testPayload, testSecret);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should complete retries within reasonable time', async () => {
      const delivery = new WebhookDelivery({
        maxAttempts: 3,
        backoff: 'exponential',
        initialDelay: 100,
        maxDelay: 1000,
      });

      (global.fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const startTime = Date.now();
      const resultPromise = delivery.deliver(testUrl, testPayload, testSecret);

      await vi.runAllTimersAsync();

      const result = await resultPromise;
      const endTime = Date.now();

      expect(result.success).toBe(true);
      // With fake timers, this should complete quickly
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
