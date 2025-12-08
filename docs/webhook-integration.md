# Webhook Integration Guide

Complete guide for implementing webhooks in your Vey World Address integration.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Webhook Events](#webhook-events)
4. [Security](#security)
5. [Server Integration](#server-integration)
6. [Event Handling](#event-handling)
7. [Delivery & Retries](#delivery--retries)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Webhooks allow your application to receive real-time notifications when events occur in the Vey World Address system. Instead of polling for changes, webhooks push updates to your server immediately.

### Key Benefits

- ⚡ **Real-time** - Instant notifications when events occur
- 🔄 **Automatic Retries** - Failed deliveries are retried with exponential backoff
- 🔐 **Secure** - HMAC signature verification prevents tampering
- 📊 **Event-Driven** - Build reactive systems that respond to changes
- 🎯 **Targeted** - Subscribe only to events you care about
- 💪 **Reliable** - Built-in delivery guarantees

### Common Use Cases

- **E-commerce Integration** - Update order status when addresses change
- **Analytics** - Track address creation, updates, and deletions
- **Notifications** - Alert users of delivery status changes
- **Data Synchronization** - Keep local database in sync with Vey
- **Compliance** - Audit trail for address access and modifications
- **Shipping Integration** - Trigger shipping workflows on address updates

---

## Getting Started

### Prerequisites

- Node.js 16+ or modern browser
- HTTPS endpoint (required for production)
- `@vey/webhooks` package installed

### Installation

```bash
npm install @vey/webhooks
```

### Quick Start

```typescript
import { createWebhookHandler } from '@vey/webhooks';

// 1. Create handler with secret
const handler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET,
});

// 2. Register event handlers
handler.onAddressCreated(async (event, data) => {
  console.log('New address:', data.address_id);
});

// 3. Handle incoming webhooks
app.post('/webhooks', async (req, res) => {
  const signature = req.headers['x-vey-signature'];
  const result = await handler.handle(req.body, signature);
  
  res.status(result.success ? 200 : 400).json(result);
});
```

---

## Webhook Events

### Event Types

| Event | Description | Payload |
|-------|-------------|---------|
| `address.created` | New address created | `AddressCreatedData` |
| `address.updated` | Address modified | `AddressUpdateData` |
| `address.deleted` | Address removed | `AddressDeletedData` |
| `delivery.started` | Delivery initiated | `DeliveryStatusData` |
| `delivery.completed` | Delivery successful | `DeliveryStatusData` |
| `delivery.failed` | Delivery failed | `DeliveryStatusData` |

### Event Payload Structure

All webhooks follow this structure:

```typescript
{
  "event": "address.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    // Event-specific data
  }
}
```

### Address Created Event

```typescript
{
  "event": "address.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "address_id": "addr_1234567890",
    "address": {
      "country": "JP",
      "postal_code": "100-0001",
      "province": "東京都",
      "city": "千代田区",
      "street_address": "千代田1-1",
      "recipient": "田中太郎"
    }
  }
}
```

### Address Updated Event

```typescript
{
  "event": "address.updated",
  "timestamp": "2024-01-15T11:00:00Z",
  "data": {
    "address_id": "addr_1234567890",
    "changed_fields": ["street_address", "apartment"],
    "previous": {
      "street_address": "千代田1-1",
      "apartment": null
    },
    "current": {
      "country": "JP",
      "postal_code": "100-0001",
      "province": "東京都",
      "city": "千代田区",
      "street_address": "千代田2-2",
      "apartment": "101号室",
      "recipient": "田中太郎"
    }
  }
}
```

### Address Deleted Event

```typescript
{
  "event": "address.deleted",
  "timestamp": "2024-01-15T12:00:00Z",
  "data": {
    "address_id": "addr_1234567890",
    "address": {
      "country": "JP",
      "postal_code": "100-0001",
      "province": "東京都",
      "city": "千代田区",
      "street_address": "千代田1-1",
      "recipient": "田中太郎"
    }
  }
}
```

### Delivery Status Event

```typescript
{
  "event": "delivery.completed",
  "timestamp": "2024-01-15T15:30:00Z",
  "data": {
    "address_id": "addr_1234567890",
    "carrier": "yamato",
    "tracking_number": "1234-5678-9012",
    "status": "delivered",
    "estimated_delivery": "2024-01-15T14:00:00Z"
  }
}
```

---

## Security

### HMAC Signature Verification

All webhook payloads are signed with HMAC-SHA256. **Always verify signatures** to ensure webhooks came from Vey.

#### How It Works

1. Vey signs the payload with your secret key
2. The signature is sent in the `X-Vey-Signature` header
3. Your server verifies the signature matches

#### Implementation

```typescript
import { verifySignature } from '@vey/webhooks';

const signature = req.headers['x-vey-signature'];
const rawBody = req.body; // Must be raw body, not parsed JSON

const isValid = await verifySignature(
  rawBody,
  signature,
  process.env.WEBHOOK_SECRET
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

#### Manual Verification

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = `sha256=${hmac.digest('hex')}`;
  
  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

### Best Practices

1. **Store secrets securely** - Never commit secrets to version control
2. **Use environment variables** - Load secrets from environment
3. **Implement rate limiting** - Prevent abuse
4. **Log suspicious activity** - Monitor for invalid signatures
5. **Use HTTPS only** - Webhooks should only be delivered over HTTPS

```typescript
// .env
WEBHOOK_SECRET=whsec_abc123xyz789...

// Usage
const secret = process.env.WEBHOOK_SECRET;
if (!secret) {
  throw new Error('WEBHOOK_SECRET is required');
}
```

---

## Server Integration

### Express.js

```typescript
import express from 'express';
import { createWebhookHandler, expressMiddleware } from '@vey/webhooks';

const app = express();

// IMPORTANT: Use express.text() for webhooks to preserve raw body
app.use('/webhooks', express.text({ type: 'application/json' }));

const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
});

// Register handlers
webhookHandler.onAddressCreated(async (event, data) => {
  await db.addresses.create(data.address_id, data.address);
});

webhookHandler.onAddressUpdated(async (event, data) => {
  await db.addresses.update(data.address_id, data.current);
  await notifyUser(data.address_id, 'Address updated');
});

webhookHandler.onAddressDeleted(async (event, data) => {
  await db.addresses.softDelete(data.address_id);
});

// Use middleware
app.post('/webhooks/addresses', expressMiddleware(webhookHandler));

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Fastify

```typescript
import Fastify from 'fastify';
import { createWebhookHandler } from '@vey/webhooks';

const fastify = Fastify();

const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
});

webhookHandler.onAddressCreated(async (event, data) => {
  console.log('Address created:', data.address_id);
});

fastify.post('/webhooks/addresses', {
  config: {
    rawBody: true, // Preserve raw body
  },
  handler: async (request, reply) => {
    const signature = request.headers['x-vey-signature'] as string;
    const result = await webhookHandler.handle(request.body, signature);

    if (result.success) {
      return { received: true };
    } else {
      reply.code(400);
      return { error: result.error };
    }
  },
});

fastify.listen({ port: 3000 });
```

### Next.js App Router

```typescript
// app/api/webhooks/addresses/route.ts
import { createWebhookHandler } from '@vey/webhooks';
import { db } from '@/lib/db';

const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
});

webhookHandler.onAddressCreated(async (event, data) => {
  await db.address.create({
    data: {
      id: data.address_id,
      ...data.address,
    },
  });
});

webhookHandler.onAddressUpdated(async (event, data) => {
  await db.address.update({
    where: { id: data.address_id },
    data: data.current,
  });
});

export async function POST(req: Request) {
  const signature = req.headers.get('x-vey-signature');
  const body = await req.text(); // Get raw body
  
  const result = await webhookHandler.handle(body, signature || undefined);

  if (result.success) {
    return Response.json({ received: true });
  } else {
    return Response.json({ error: result.error }, { status: 400 });
  }
}
```

### NestJS

```typescript
import { Controller, Post, Body, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { createWebhookHandler } from '@vey/webhooks';

@Controller('webhooks')
export class WebhooksController {
  private webhookHandler = createWebhookHandler({
    secret: process.env.WEBHOOK_SECRET!,
  });

  constructor(private addressService: AddressService) {
    this.webhookHandler.onAddressCreated(async (event, data) => {
      await this.addressService.create(data.address_id, data.address);
    });
    
    this.webhookHandler.onAddressUpdated(async (event, data) => {
      await this.addressService.update(data.address_id, data.current);
    });
  }

  @Post('addresses')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-vey-signature') signature: string,
  ) {
    // Use raw body
    const body = req.rawBody?.toString() || '';
    const result = await this.webhookHandler.handle(body, signature);

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return { received: true };
  }
}
```

### Cloudflare Workers

```typescript
import { createWebhookHandler } from '@vey/webhooks';

const webhookHandler = createWebhookHandler({
  secret: WEBHOOK_SECRET, // Environment variable
});

webhookHandler.onAddressCreated(async (event, data) => {
  // Store in KV or D1
  await env.KV.put(`address:${data.address_id}`, JSON.stringify(data.address));
});

export default {
  async fetch(request: Request, env: Env) {
    if (request.method !== 'POST' || !request.url.endsWith('/webhooks/addresses')) {
      return new Response('Not found', { status: 404 });
    }

    const signature = request.headers.get('x-vey-signature');
    const body = await request.text();
    
    const result = await webhookHandler.handle(body, signature || undefined);

    return Response.json(
      result.success ? { received: true } : { error: result.error },
      { status: result.success ? 200 : 400 }
    );
  },
};
```

---

## Event Handling

### Handling Specific Events

```typescript
// Handle address creation
handler.onAddressCreated(async (event, data) => {
  console.log('New address created:', data.address_id);
  
  // Insert into database
  await db.addresses.insert({
    id: data.address_id,
    ...data.address,
    created_at: new Date(),
  });
  
  // Send notification
  await sendEmail(data.address.recipient, 'Address registered successfully');
});

// Handle address updates
handler.onAddressUpdated(async (event, data) => {
  console.log('Address updated:', data.address_id);
  console.log('Changed:', data.changed_fields);
  
  // Update database
  await db.addresses.update(data.address_id, data.current);
  
  // Log changes for audit
  await auditLog.create({
    address_id: data.address_id,
    action: 'updated',
    changed_fields: data.changed_fields,
    previous: data.previous,
    current: data.current,
  });
});

// Handle delivery status
handler.onDeliveryStatus(async (event, data) => {
  console.log('Delivery status:', data.status);
  
  // Update order status
  await orders.updateDeliveryStatus(data.address_id, data.status);
  
  // Send push notification
  if (data.status === 'delivered') {
    await pushNotification.send(data.address_id, 'Package delivered!');
  }
});
```

### Wildcard Handler

Handle all events with a single handler:

```typescript
handler.on('*', async (event, data, payload) => {
  console.log('Webhook received:', event);
  console.log('Timestamp:', payload.timestamp);
  
  // Log all events for auditing
  await auditLog.create({
    event_type: event,
    event_data: data,
    timestamp: payload.timestamp,
  });
  
  // Send to analytics
  await analytics.track(event, data);
});
```

### Async Processing

For long-running operations, use a job queue:

```typescript
import { Queue } from 'bullmq';

const addressQueue = new Queue('address-processing');

handler.onAddressCreated(async (event, data) => {
  // Queue for background processing
  await addressQueue.add('process-new-address', {
    address_id: data.address_id,
    address: data.address,
  });
  
  // Return immediately to prevent timeout
});

// Process in worker
const worker = new Worker('address-processing', async (job) => {
  const { address_id, address } = job.data;
  
  // Geocode address
  const coordinates = await geocode(address);
  
  // Validate with carrier
  const validation = await validateWithCarrier(address);
  
  // Update database
  await db.addresses.update(address_id, {
    coordinates,
    carrier_validated: validation.valid,
  });
});
```

### Error Handling

```typescript
handler.onAddressCreated(async (event, data) => {
  try {
    await processAddress(data);
  } catch (error) {
    console.error('Failed to process address:', error);
    
    // Log error but don't throw (prevents retries)
    await errorLog.create({
      event: 'address.created',
      address_id: data.address_id,
      error: error.message,
      stack: error.stack,
    });
    
    // Alert on-call engineer
    if (error instanceof DatabaseError) {
      await pagerduty.alert('Database error processing webhook', error);
    }
  }
});
```

### Idempotency

Handle duplicate deliveries gracefully:

```typescript
handler.onAddressCreated(async (event, data, payload) => {
  const eventId = `${event}_${data.address_id}_${payload.timestamp}`;
  
  // Check if already processed
  const processed = await redis.get(eventId);
  if (processed) {
    console.log('Duplicate webhook, skipping');
    return;
  }
  
  // Process event
  await db.addresses.create(data.address_id, data.address);
  
  // Mark as processed (24 hour TTL)
  await redis.set(eventId, '1', 'EX', 86400);
});
```

---

## Delivery & Retries

### Sending Webhooks

```typescript
import { createWebhookDelivery, WebhookPayload } from '@vey/webhooks';

const delivery = createWebhookDelivery({
  maxAttempts: 5,
  backoff: 'exponential',
  initialDelay: 2000,    // 2 seconds
  maxDelay: 120000,      // 2 minutes
});

// Prepare payload
const payload: WebhookPayload = {
  event: 'address.created',
  timestamp: new Date().toISOString(),
  data: {
    address_id: 'addr_123',
    address: { /* ... */ },
  },
};

// Deliver with retries
const result = await delivery.deliver(
  'https://example.com/webhooks/addresses',
  payload,
  process.env.WEBHOOK_SECRET!
);

if (result.success) {
  console.log(`Delivered after ${result.attempts} attempt(s)`);
} else {
  console.error(`Failed after ${result.attempts} attempts:`, result.error);
  
  // Store failed delivery for manual retry
  await db.failedWebhooks.create({
    url: 'https://example.com/webhooks/addresses',
    payload,
    error: result.error,
    attempts: result.attempts,
  });
}
```

### Retry Strategy

The SDK supports two retry strategies:

#### Exponential Backoff (Recommended)

```typescript
const delivery = createWebhookDelivery({
  backoff: 'exponential',
  initialDelay: 1000,    // 1s
  maxDelay: 60000,       // 1 minute
});

// Retry delays: 1s, 2s, 4s, 8s, 16s, 32s, 60s (capped)
```

#### Linear Backoff

```typescript
const delivery = createWebhookDelivery({
  backoff: 'linear',
  initialDelay: 5000,    // 5s
  maxDelay: 60000,       // 1 minute
});

// Retry delays: 5s, 10s, 15s, 20s, 25s, 30s, 60s (capped)
```

### Retry Behavior

- **2xx status**: Success, no retry
- **4xx status**: Client error, no retry (permanent failure)
- **5xx status**: Server error, retry with backoff
- **Network error**: Retry with backoff

```typescript
// Example: Custom retry logic
const result = await delivery.deliver(url, payload, secret);

if (!result.success) {
  if (result.error?.includes('404')) {
    // Webhook endpoint removed - disable webhook
    await db.webhooks.disable(webhookId);
  } else if (result.error?.includes('timeout')) {
    // Timeout - queue for manual retry later
    await retryQueue.add(payload, { delay: 3600000 }); // 1 hour
  }
}
```

---

## Testing

### Local Testing with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# Expose to internet
ngrok http 3000

# Use ngrok URL for webhooks
# https://abc123.ngrok.io/webhooks/addresses
```

### Mock Webhooks

```typescript
import { createSignature } from '@vey/webhooks';

async function sendMockWebhook() {
  const payload = {
    event: 'address.created',
    timestamp: new Date().toISOString(),
    data: {
      address_id: 'test_addr_123',
      address: {
        country: 'JP',
        postal_code: '100-0001',
        province: '東京都',
        city: '千代田区',
        street_address: '千代田1-1',
      },
    },
  };

  const body = JSON.stringify(payload);
  const signature = await createSignature(body, process.env.WEBHOOK_SECRET!);

  const response = await fetch('http://localhost:3000/webhooks/addresses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vey-Signature': signature,
    },
    body,
  });

  console.log('Status:', response.status);
  console.log('Response:', await response.json());
}

sendMockWebhook();
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import { createSignature } from '@vey/webhooks';
import request from 'supertest';
import { app } from './app';

describe('Webhook Integration', () => {
  it('should process valid webhook', async () => {
    const payload = {
      event: 'address.created',
      timestamp: new Date().toISOString(),
      data: {
        address_id: 'test_123',
        address: { country: 'JP' },
      },
    };

    const body = JSON.stringify(payload);
    const signature = await createSignature(body, process.env.WEBHOOK_SECRET!);

    const response = await request(app)
      .post('/webhooks/addresses')
      .set('X-Vey-Signature', signature)
      .send(body)
      .expect(200);

    expect(response.body.received).toBe(true);

    // Verify database update
    const address = await db.addresses.findOne('test_123');
    expect(address).toBeDefined();
  });

  it('should reject invalid signature', async () => {
    await request(app)
      .post('/webhooks/addresses')
      .set('X-Vey-Signature', 'sha256=invalid')
      .send('{}')
      .expect(400);
  });
});
```

---

## Production Deployment

### Environment Configuration

```env
# .env.production
WEBHOOK_SECRET=whsec_production_secret_here
WEBHOOK_URL=https://api.yourdomain.com/webhooks/addresses
NODE_ENV=production
```

### HTTPS Requirement

```typescript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.status(403).json({ error: 'HTTPS required' });
    }
    next();
  });
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Max 1000 webhooks per 15 minutes
  message: 'Too many webhooks, please try again later',
});

app.post('/webhooks/addresses', webhookLimiter, webhookMiddleware);
```

### Monitoring

```typescript
import { metrics } from '@/lib/monitoring';

handler.on('*', async (event, data, payload) => {
  // Track webhook metrics
  metrics.increment('webhook.received', {
    event_type: event,
  });
  
  const startTime = Date.now();
  
  try {
    await processWebhook(event, data);
    
    metrics.timing('webhook.processing_time', Date.now() - startTime, {
      event_type: event,
      status: 'success',
    });
  } catch (error) {
    metrics.increment('webhook.error', {
      event_type: event,
      error_type: error.name,
    });
    
    throw error;
  }
});
```

### Health Check

```typescript
app.get('/webhooks/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
  });
});
```

---

## Troubleshooting

### Webhooks Not Received

**Check:**
1. Is your endpoint publicly accessible?
   ```bash
   curl -X POST https://your-domain.com/webhooks/addresses
   ```

2. Is HTTPS configured correctly?
3. Are firewall rules blocking incoming requests?
4. Check webhook configuration in Vey dashboard

### Signature Verification Fails

**Common causes:**

1. **Using parsed JSON instead of raw body**
   ```typescript
   // ❌ Wrong - body is parsed
   app.use(express.json());
   
   // ✅ Correct - preserve raw body
   app.use('/webhooks', express.text({ type: 'application/json' }));
   ```

2. **Wrong secret**
   ```typescript
   console.log('Using secret:', process.env.WEBHOOK_SECRET);
   ```

3. **Body encoding issues**
   ```typescript
   // Ensure UTF-8 encoding
   const body = Buffer.from(req.body).toString('utf8');
   ```

### Duplicate Events

**Solution:** Implement idempotency

```typescript
const eventId = `${payload.event}_${payload.data.address_id}_${payload.timestamp}`;
const exists = await redis.exists(eventId);
if (exists) return;

await redis.set(eventId, '1', 'EX', 86400);
// Process event
```

### Timeouts

**Solution:** Respond quickly and process async

```typescript
handler.onAddressCreated(async (event, data) => {
  // Queue for background processing
  await queue.add('process-address', data);
  // Returns immediately
});
```

---

## Best Practices

### 1. Acknowledge Quickly

Return 200 status as soon as possible:

```typescript
handler.onAddressCreated(async (event, data) => {
  // Queue for processing
  await jobQueue.add(data);
  // Returns quickly
});
```

### 2. Validate Signatures

Always verify webhook signatures:

```typescript
const isValid = await verifySignature(body, signature, secret);
if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### 3. Handle Duplicates

Use idempotency keys:

```typescript
const eventKey = `webhook:${payload.timestamp}:${payload.data.address_id}`;
if (await redis.exists(eventKey)) return;
await redis.set(eventKey, '1', 'EX', 86400);
```

### 4. Monitor & Alert

Track webhook health:

```typescript
metrics.increment('webhook.received');
metrics.increment('webhook.processed');
metrics.increment('webhook.failed');
```

### 5. Secure Secrets

Never hardcode or commit secrets:

```typescript
const secret = process.env.WEBHOOK_SECRET;
if (!secret) throw new Error('WEBHOOK_SECRET required');
```

---

## Resources

- [@vey/webhooks SDK](../sdk/webhooks)
- [Express Example](../examples/expressjs-integration)
- [Webhook API Reference](./webhook-api.md)

---

## License

MIT
