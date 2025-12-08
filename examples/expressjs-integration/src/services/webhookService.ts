import crypto from 'crypto';
import { Webhook, WebhookEvent, WebhookPayload, Address } from '../types/index.js';

// In-memory storage (replace with database in production)
const webhooks: Map<string, Webhook> = new Map();
let webhookIdCounter = 1;

/**
 * Generate a unique ID for webhooks
 */
function generateWebhookId(): string {
  return `webhook_${webhookIdCounter++}`;
}

/**
 * Create a webhook signature using HMAC-SHA256
 */
function createWebhookSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  return 'sha256=' + hmac.update(payload).digest('hex');
}

/**
 * Register a new webhook
 */
export function registerWebhook(url: string, events: WebhookEvent[], secret: string): Webhook {
  const id = generateWebhookId();
  
  const webhook: Webhook = {
    id,
    url,
    events,
    secret,
    created_at: new Date(),
    active: true
  };

  webhooks.set(id, webhook);
  return webhook;
}

/**
 * Get all webhooks
 */
export function getAllWebhooks(): Webhook[] {
  return Array.from(webhooks.values());
}

/**
 * Get webhook by ID
 */
export function getWebhookById(id: string): Webhook | undefined {
  return webhooks.get(id);
}

/**
 * Delete a webhook
 */
export function deleteWebhook(id: string): boolean {
  return webhooks.delete(id);
}

/**
 * Trigger webhooks for an event
 */
export async function triggerWebhook(event: WebhookEvent, data: Address): Promise<void> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data
  };

  // Find all active webhooks that listen to this event
  const activeWebhooks = Array.from(webhooks.values()).filter(
    webhook => webhook.active && webhook.events.includes(event)
  );

  // Send webhook requests in parallel
  const promises = activeWebhooks.map(webhook => deliverWebhook(webhook, payload));
  
  // Wait for all webhooks to be delivered (or fail)
  await Promise.allSettled(promises);
}

/**
 * Deliver a webhook to a specific URL
 */
async function deliverWebhook(webhook: Webhook, payload: WebhookPayload): Promise<void> {
  try {
    const payloadString = JSON.stringify(payload);
    const signature = createWebhookSignature(payloadString, webhook.secret);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp
      },
      body: payloadString
    });

    if (!response.ok) {
      console.error(`Webhook delivery failed for ${webhook.id}: ${response.status} ${response.statusText}`);
    } else {
      console.log(`Webhook delivered successfully to ${webhook.url} for event ${payload.event}`);
    }
  } catch (error) {
    console.error(`Webhook delivery error for ${webhook.id}:`, error);
  }
}

/**
 * Verify a webhook signature (for incoming webhook requests)
 */
export function verifyWebhookSignature(
  payloadString: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createWebhookSignature(payloadString, secret);
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
