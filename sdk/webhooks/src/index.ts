/**
 * @vey/webhooks - Webhook utilities for address events
 */

import type { WebhookEventType, WebhookPayload, AddressInput } from '@vey/core';

export { WebhookEventType, WebhookPayload };

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  secret: string;
  tolerance?: number; // Timestamp tolerance in seconds
  retries?: {
    maxAttempts?: number; // Maximum retry attempts (default: 3)
    backoff?: 'linear' | 'exponential'; // Backoff strategy (default: exponential)
    initialDelay?: number; // Initial delay in ms (default: 1000)
    maxDelay?: number; // Maximum delay in ms (default: 60000)
  };
}

/**
 * Retry configuration with defaults
 */
export interface RetryConfig {
  maxAttempts: number;
  backoff: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
}

/**
 * Webhook handler function type
 */
export type WebhookHandler<T = unknown> = (
  event: WebhookEventType,
  data: T,
  payload: WebhookPayload
) => void | Promise<void>;

/**
 * Address update event data
 */
export interface AddressUpdateData {
  address_id: string;
  previous: Partial<AddressInput>;
  current: AddressInput;
  changed_fields: string[];
}

/**
 * Address created event data
 */
export interface AddressCreatedData {
  address_id: string;
  address: AddressInput;
}

/**
 * Address deleted event data
 */
export interface AddressDeletedData {
  address_id: string;
  address: AddressInput;
}

/**
 * Delivery status event data
 */
export interface DeliveryStatusData {
  address_id: string;
  carrier: string;
  tracking_number?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  estimated_delivery?: string;
}

/**
 * Create HMAC-SHA256 signature for payload
 * Works in both Node.js and browser environments
 */
export async function createSignature(payload: string, secret: string): Promise<string> {
  // Try to use Node.js crypto module first
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto?.subtle) {
    // Use Web Crypto API (available in both modern Node.js and browsers)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);
    
    const cryptoKey = await (globalThis as any).crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await (globalThis as any).crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256=${hashHex}`;
  }
  
  // Fallback for older Node.js environments
  try {
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  } catch (err) {
    throw new Error('Crypto API not available. Please use Node.js 16+ or a modern browser.');
  }
}

/**
 * Create HMAC-SHA256 signature synchronously (Node.js only)
 */
export function createSignatureSync(payload: string, secret: string): string {
  try {
    // Dynamic require to avoid bundler issues
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  } catch (err) {
    throw new Error('Synchronous signature creation requires Node.js with crypto module.');
  }
}

/**
 * Verify webhook signature
 */
export async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance: number = 300
): Promise<boolean> {
  const expectedSignature = await createSignature(payload, secret);

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Verify webhook signature synchronously (Node.js only)
 */
export function verifySignatureSync(
  payload: string,
  signature: string,
  secret: string,
  tolerance: number = 300
): boolean {
  const expectedSignature = createSignatureSync(payload, secret);

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Parse webhook payload
 */
export function parsePayload(body: string | object): WebhookPayload {
  const payload = typeof body === 'string' ? JSON.parse(body) : body;

  return {
    event: payload.event,
    timestamp: payload.timestamp,
    data: payload.data,
    signature: payload.signature,
  };
}

/**
 * Webhook handler registry
 */
export class WebhookRegistry {
  private handlers: Map<WebhookEventType | '*', WebhookHandler[]> = new Map();
  private config: WebhookConfig;

  constructor(config: WebhookConfig) {
    this.config = config;
  }

  /**
   * Register a handler for a specific event type
   */
  on<T = unknown>(event: WebhookEventType | '*', handler: WebhookHandler<T>): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler as WebhookHandler);
    this.handlers.set(event, handlers);
  }

  /**
   * Register handler for address updates
   */
  onAddressUpdate(handler: WebhookHandler<AddressUpdateData>): void {
    this.on('address.updated', handler);
  }

  /**
   * Register handler for address creation
   */
  onAddressCreated(handler: WebhookHandler<AddressCreatedData>): void {
    this.on('address.created', handler);
  }

  /**
   * Register handler for address deletion
   */
  onAddressDeleted(handler: WebhookHandler<AddressDeletedData>): void {
    this.on('address.deleted', handler);
  }

  /**
   * Register handler for delivery status changes
   */
  onDeliveryStatus(handler: WebhookHandler<DeliveryStatusData>): void {
    this.on('delivery.completed', handler);
    this.on('delivery.started', handler);
    this.on('delivery.failed', handler);
  }

  /**
   * Process incoming webhook
   */
  async handle(
    body: string | object,
    signature?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = parsePayload(body);
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

      // Verify signature if provided
      if (signature) {
        const isValid = await verifySignature(
          bodyStr,
          signature,
          this.config.secret,
          this.config.tolerance
        );
        if (!isValid) {
          return { success: false, error: 'Invalid signature' };
        }
      }

      // Get handlers for this event type
      const eventHandlers = this.handlers.get(payload.event) ?? [];
      const wildcardHandlers = this.handlers.get('*') ?? [];
      const allHandlers = [...eventHandlers, ...wildcardHandlers];

      // Execute handlers
      for (const handler of allHandlers) {
        await handler(payload.event, payload.data, payload);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

/**
 * Calculate delay for retry attempt
 */
function calculateRetryDelay(
  attempt: number,
  config: RetryConfig
): number {
  if (config.backoff === 'linear') {
    return Math.min(config.initialDelay * attempt, config.maxDelay);
  }
  // Exponential backoff with jitter
  const exponentialDelay = config.initialDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add 0-30% jitter
  return Math.min(exponentialDelay + jitter, config.maxDelay);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Webhook delivery client with retry logic
 */
export class WebhookDelivery {
  private config: RetryConfig;

  constructor(retryConfig?: WebhookConfig['retries']) {
    this.config = {
      maxAttempts: retryConfig?.maxAttempts ?? 3,
      backoff: retryConfig?.backoff ?? 'exponential',
      initialDelay: retryConfig?.initialDelay ?? 1000,
      maxDelay: retryConfig?.maxDelay ?? 60000,
    };
  }

  /**
   * Deliver webhook with automatic retries
   */
  async deliver(
    url: string,
    payload: WebhookPayload,
    secret: string
  ): Promise<{ success: boolean; attempts: number; error?: string }> {
    const body = JSON.stringify(payload);
    const signature = await createSignature(body, secret);

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Vey-Signature': signature,
            'X-Vey-Event': payload.event,
            'X-Vey-Delivery-Attempt': attempt.toString(),
          },
          body,
        });

        if (response.ok) {
          return { success: true, attempts: attempt };
        }

        // Don't retry for client errors (4xx), only server errors (5xx)
        if (response.status >= 400 && response.status < 500) {
          return {
            success: false,
            attempts: attempt,
            error: `Client error: ${response.status} ${response.statusText}`,
          };
        }

        // Server error - retry if we have attempts left
        if (attempt < this.config.maxAttempts) {
          const delay = calculateRetryDelay(attempt, this.config);
          await sleep(delay);
          continue;
        }

        return {
          success: false,
          attempts: attempt,
          error: `Server error after ${attempt} attempts: ${response.status}`,
        };
      } catch (err) {
        // Network error - retry if we have attempts left
        if (attempt < this.config.maxAttempts) {
          const delay = calculateRetryDelay(attempt, this.config);
          await sleep(delay);
          continue;
        }

        return {
          success: false,
          attempts: attempt,
          error: err instanceof Error ? err.message : 'Network error',
        };
      }
    }

    return {
      success: false,
      attempts: this.config.maxAttempts,
      error: 'Max retry attempts reached',
    };
  }
}

/**
 * Create a webhook delivery client with retry logic
 */
export function createWebhookDelivery(config?: WebhookConfig['retries']): WebhookDelivery {
  return new WebhookDelivery(config);
}

/**
 * Create a webhook registry
 */
export function createWebhookHandler(config: WebhookConfig): WebhookRegistry {
  return new WebhookRegistry(config);
}

/**
 * Express-compatible request interface
 */
export interface WebhookRequest {
  body: unknown;
  headers: Record<string, string | undefined>;
}

/**
 * Express-compatible response interface
 */
export interface WebhookResponse {
  status: (code: number) => { json: (data: unknown) => void };
}

/**
 * Express middleware for webhook handling
 * Compatible with Express, Koa (with adapter), and similar frameworks
 */
export function expressMiddleware(registry: WebhookRegistry) {
  return async (req: WebhookRequest, res: WebhookResponse) => {
    const signature = req.headers['x-vey-signature'];
    const result = await registry.handle(req.body as string | object, signature);

    if (result.success) {
      res.status(200).json({ received: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  };
}
