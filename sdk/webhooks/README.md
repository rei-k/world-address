# @vey/webhooks

Webhook utilities for Vey World Address SDK - Secure event handling with automatic retries and signature verification.

## Features

- ✅ **Event-Driven Architecture** - Handle address lifecycle events (created, updated, deleted)
- ✅ **Signature Verification** - HMAC-SHA256 signature validation for security
- ✅ **Automatic Retries** - Configurable retry logic with exponential backoff
- ✅ **Framework Support** - Express, Fastify, Next.js middleware included
- ✅ **Type Safety** - Full TypeScript support with comprehensive type definitions
- ✅ **Cross-Platform** - Works in Node.js and modern browsers
- ✅ **Delivery Tracking** - Built-in delivery status and attempt tracking

## Installation

```bash
npm install @vey/webhooks
```

## Quick Start

### Receiving Webhooks (Server-Side)

```typescript
import { createWebhookHandler } from '@vey/webhooks';

// Initialize webhook handler with your secret
const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET,
  tolerance: 300, // 5 minutes tolerance for timestamp verification
});

// Register event handlers
webhookHandler.onAddressCreated(async (event, data) => {
  console.log('New address created:', data.address_id);
  console.log('Address data:', data.address);
  
  // Your business logic here
  await updateDatabase(data.address_id, data.address);
});

webhookHandler.onAddressUpdated(async (event, data) => {
  console.log('Address updated:', data.address_id);
  console.log('Changed fields:', data.changed_fields);
  console.log('Previous:', data.previous);
  console.log('Current:', data.current);
});

webhookHandler.onAddressDeleted(async (event, data) => {
  console.log('Address deleted:', data.address_id);
  await removeFromDatabase(data.address_id);
});

// Handle all events with wildcard
webhookHandler.on('*', async (event, data, payload) => {
  console.log('Webhook received:', event);
  // Log all events for auditing
  await auditLog.create({ event, data, timestamp: payload.timestamp });
});
```

### Express.js Integration

```typescript
import express from 'express';
import { createWebhookHandler, expressMiddleware } from '@vey/webhooks';

const app = express();

// Important: Use express.text() for webhooks to preserve raw body
app.use('/webhooks', express.text({ type: 'application/json' }));

const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET,
});

// Register your event handlers
webhookHandler.onAddressCreated(async (event, data) => {
  // Handle address created
});

// Use Express middleware
app.post('/webhooks/addresses', expressMiddleware(webhookHandler));

app.listen(3000);
```

### Next.js API Route

```typescript
// pages/api/webhooks/addresses.ts (or app/api/webhooks/addresses/route.ts)
import { createWebhookHandler } from '@vey/webhooks';
import { NextApiRequest, NextApiResponse } from 'next';

const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
});

webhookHandler.onAddressCreated(async (event, data) => {
  console.log('Address created:', data.address_id);
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['x-vey-signature'] as string;
  const result = await webhookHandler.handle(req.body, signature);

  if (result.success) {
    return res.status(200).json({ received: true });
  } else {
    return res.status(400).json({ error: result.error });
  }
}

// Disable body parsing to get raw body
export const config = {
  api: {
    bodyParser: false,
  },
};
```

### Sending Webhooks (Client-Side)

```typescript
import { createWebhookDelivery, WebhookPayload } from '@vey/webhooks';

const delivery = createWebhookDelivery({
  maxAttempts: 3,
  backoff: 'exponential',
  initialDelay: 1000,
  maxDelay: 60000,
});

// Prepare webhook payload
const payload: WebhookPayload = {
  event: 'address.created',
  timestamp: new Date().toISOString(),
  data: {
    address_id: 'addr_123456',
    address: {
      country: 'JP',
      postal_code: '100-0001',
      province: '東京都',
      city: '千代田区',
      street_address: '千代田1-1',
    },
  },
};

// Deliver webhook with automatic retries
const result = await delivery.deliver(
  'https://example.com/webhooks/addresses',
  payload,
  process.env.WEBHOOK_SECRET
);

if (result.success) {
  console.log(`Webhook delivered after ${result.attempts} attempts`);
} else {
  console.error(`Failed after ${result.attempts} attempts:`, result.error);
}
```

## API Reference

### `createWebhookHandler(config: WebhookConfig): WebhookRegistry`

Create a new webhook handler with configuration.

**Parameters:**
- `config.secret` (string, required) - Secret key for HMAC signature verification
- `config.tolerance` (number, optional) - Timestamp tolerance in seconds (default: 300)
- `config.retries` (object, optional) - Retry configuration
  - `maxAttempts` (number) - Maximum retry attempts (default: 3)
  - `backoff` ('linear' | 'exponential') - Backoff strategy (default: 'exponential')
  - `initialDelay` (number) - Initial delay in ms (default: 1000)
  - `maxDelay` (number) - Maximum delay in ms (default: 60000)

**Example:**
```typescript
const handler = createWebhookHandler({
  secret: 'whsec_abc123',
  tolerance: 300,
  retries: {
    maxAttempts: 5,
    backoff: 'exponential',
    initialDelay: 2000,
    maxDelay: 120000,
  },
});
```

### WebhookRegistry Methods

#### `on(event: WebhookEventType | '*', handler: WebhookHandler): void`

Register a handler for a specific event type or all events.

```typescript
handler.on('address.created', async (event, data, payload) => {
  console.log('Address created:', data);
});

handler.on('*', async (event, data, payload) => {
  console.log('Any event:', event);
});
```

#### `onAddressCreated(handler: WebhookHandler<AddressCreatedData>): void`

Register a handler specifically for address creation events.

```typescript
handler.onAddressCreated(async (event, data) => {
  console.log('New address:', data.address_id);
});
```

#### `onAddressUpdated(handler: WebhookHandler<AddressUpdateData>): void`

Register a handler for address update events.

```typescript
handler.onAddressUpdated(async (event, data) => {
  console.log('Changed fields:', data.changed_fields);
  console.log('Previous:', data.previous);
  console.log('Current:', data.current);
});
```

#### `onAddressDeleted(handler: WebhookHandler<AddressDeletedData>): void`

Register a handler for address deletion events.

```typescript
handler.onAddressDeleted(async (event, data) => {
  console.log('Deleted:', data.address_id);
});
```

#### `onDeliveryStatus(handler: WebhookHandler<DeliveryStatusData>): void`

Register a handler for delivery status events (started, completed, failed).

```typescript
handler.onDeliveryStatus(async (event, data) => {
  console.log('Delivery status:', data.status);
  console.log('Tracking:', data.tracking_number);
});
```

#### `handle(body: string | object, signature?: string): Promise<Result>`

Process an incoming webhook with optional signature verification.

```typescript
const result = await handler.handle(req.body, req.headers['x-vey-signature']);
if (result.success) {
  console.log('Webhook processed successfully');
} else {
  console.error('Webhook failed:', result.error);
}
```

### Signature Verification

#### `createSignature(payload: string, secret: string): Promise<string>`

Create HMAC-SHA256 signature for a payload (async, cross-platform).

```typescript
const signature = await createSignature(JSON.stringify(payload), secret);
console.log(signature); // "sha256=abc123..."
```

#### `createSignatureSync(payload: string, secret: string): string`

Create signature synchronously (Node.js only).

```typescript
const signature = createSignatureSync(JSON.stringify(payload), secret);
```

#### `verifySignature(payload: string, signature: string, secret: string, tolerance?: number): Promise<boolean>`

Verify webhook signature with constant-time comparison.

```typescript
const isValid = await verifySignature(
  rawBody,
  req.headers['x-vey-signature'],
  process.env.WEBHOOK_SECRET,
  300 // 5 minutes tolerance
);
```

### Webhook Delivery

#### `createWebhookDelivery(config?: RetryConfig): WebhookDelivery`

Create a webhook delivery client with retry logic.

```typescript
const delivery = createWebhookDelivery({
  maxAttempts: 3,
  backoff: 'exponential',
  initialDelay: 1000,
  maxDelay: 60000,
});
```

#### `deliver(url: string, payload: WebhookPayload, secret: string): Promise<DeliveryResult>`

Deliver webhook with automatic retries.

```typescript
const result = await delivery.deliver(webhookUrl, payload, secret);
console.log('Success:', result.success);
console.log('Attempts:', result.attempts);
console.log('Error:', result.error);
```

## Event Types

### Address Events

```typescript
type WebhookEventType =
  | 'address.created'    // New address created
  | 'address.updated'    // Address modified
  | 'address.deleted'    // Address removed
  | 'delivery.started'   // Delivery initiated
  | 'delivery.completed' // Delivery successful
  | 'delivery.failed';   // Delivery failed
```

### Event Data Types

#### AddressCreatedData
```typescript
interface AddressCreatedData {
  address_id: string;
  address: AddressInput;
}
```

#### AddressUpdateData
```typescript
interface AddressUpdateData {
  address_id: string;
  previous: Partial<AddressInput>;
  current: AddressInput;
  changed_fields: string[];
}
```

#### AddressDeletedData
```typescript
interface AddressDeletedData {
  address_id: string;
  address: AddressInput;
}
```

#### DeliveryStatusData
```typescript
interface DeliveryStatusData {
  address_id: string;
  carrier: string;
  tracking_number?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  estimated_delivery?: string;
}
```

## Framework Integration Examples

### Fastify

```typescript
import Fastify from 'fastify';
import { createWebhookHandler } from '@vey/webhooks';

const fastify = Fastify();

const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET,
});

webhookHandler.onAddressCreated(async (event, data) => {
  // Handle event
});

fastify.post('/webhooks/addresses', {
  config: {
    // Get raw body for signature verification
    rawBody: true,
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
```

### Koa

```typescript
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { createWebhookHandler } from '@vey/webhooks';

const app = new Koa();
const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET,
});

// Preserve raw body
app.use(bodyParser({
  enableTypes: ['json', 'text'],
}));

app.use(async (ctx) => {
  if (ctx.path === '/webhooks/addresses' && ctx.method === 'POST') {
    const signature = ctx.headers['x-vey-signature'] as string;
    const result = await webhookHandler.handle(ctx.request.body, signature);

    if (result.success) {
      ctx.status = 200;
      ctx.body = { received: true };
    } else {
      ctx.status = 400;
      ctx.body = { error: result.error };
    }
  }
});
```

### NestJS

```typescript
import { Controller, Post, Body, Headers, HttpException } from '@nestjs/common';
import { createWebhookHandler } from '@vey/webhooks';

@Controller('webhooks')
export class WebhooksController {
  private webhookHandler = createWebhookHandler({
    secret: process.env.WEBHOOK_SECRET,
  });

  constructor() {
    this.webhookHandler.onAddressCreated(async (event, data) => {
      // Handle event
    });
  }

  @Post('addresses')
  async handleWebhook(
    @Body() body: unknown,
    @Headers('x-vey-signature') signature: string,
  ) {
    const result = await this.webhookHandler.handle(body, signature);

    if (!result.success) {
      throw new HttpException(result.error, 400);
    }

    return { received: true };
  }
}
```

## Security Best Practices

### 1. Always Verify Signatures

Never process webhooks without signature verification in production.

```typescript
const signature = req.headers['x-vey-signature'];
if (!signature) {
  return res.status(401).json({ error: 'Missing signature' });
}

const isValid = await verifySignature(rawBody, signature, secret);
if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### 2. Use HTTPS Only

Webhooks should only be delivered over HTTPS to prevent man-in-the-middle attacks.

```typescript
const webhookUrl = process.env.WEBHOOK_URL;
if (!webhookUrl.startsWith('https://')) {
  throw new Error('Webhook URL must use HTTPS');
}
```

### 3. Implement Timestamp Validation

Set an appropriate tolerance to prevent replay attacks.

```typescript
const handler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET,
  tolerance: 300, // 5 minutes
});
```

### 4. Protect Secret Keys

Never hardcode secrets or commit them to version control.

```bash
# .env
WEBHOOK_SECRET=whsec_your_secret_key_here
```

```typescript
// Load from environment
const secret = process.env.WEBHOOK_SECRET;
if (!secret) {
  throw new Error('WEBHOOK_SECRET is required');
}
```

### 5. Rate Limiting

Implement rate limiting to prevent abuse.

```typescript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.post('/webhooks/addresses', webhookLimiter, expressMiddleware(webhookHandler));
```

### 6. Idempotency

Design handlers to be idempotent to handle duplicate deliveries.

```typescript
webhookHandler.onAddressCreated(async (event, data) => {
  // Check if already processed
  const exists = await db.addresses.exists(data.address_id);
  if (exists) {
    console.log('Already processed, skipping');
    return;
  }
  
  // Process the event
  await db.addresses.create(data);
});
```

### 7. Error Handling

Handle errors gracefully and return appropriate status codes.

```typescript
webhookHandler.on('address.created', async (event, data) => {
  try {
    await processAddress(data);
  } catch (error) {
    console.error('Failed to process webhook:', error);
    // Log error but don't throw - return 200 to prevent retries
    await errorLog.create({ event, error: error.message });
  }
});
```

## Troubleshooting

### Signature Verification Fails

**Problem:** Webhook signature verification always fails.

**Solutions:**

1. **Check raw body**: Ensure you're using the raw request body, not parsed JSON
   ```typescript
   // Correct: Use express.text() or similar
   app.use('/webhooks', express.text({ type: 'application/json' }));
   
   // Incorrect: Using express.json() modifies the body
   app.use(express.json()); // Don't use this for webhook routes
   ```

2. **Verify secret key**: Ensure sender and receiver use the same secret
   ```typescript
   console.log('Using secret:', process.env.WEBHOOK_SECRET);
   ```

3. **Check timestamp tolerance**: Increase tolerance if there's clock skew
   ```typescript
   const handler = createWebhookHandler({
     secret: process.env.WEBHOOK_SECRET,
     tolerance: 600, // 10 minutes instead of 5
   });
   ```

### Webhooks Not Received

**Problem:** Webhook endpoint never receives events.

**Solutions:**

1. **Check URL accessibility**: Ensure your webhook URL is publicly accessible
   ```bash
   curl -X POST https://your-domain.com/webhooks/addresses
   ```

2. **Verify firewall rules**: Check that incoming requests aren't blocked

3. **Test locally with ngrok**:
   ```bash
   ngrok http 3000
   # Use the ngrok URL as your webhook endpoint
   ```

### Duplicate Events

**Problem:** Same webhook received multiple times.

**Solutions:**

1. **Implement idempotency**: Use a unique event ID to track processed webhooks
   ```typescript
   webhookHandler.on('*', async (event, data, payload) => {
     const eventId = `${event}_${data.address_id}_${payload.timestamp}`;
     
     const exists = await redis.exists(eventId);
     if (exists) {
       console.log('Duplicate event, skipping');
       return;
     }
     
     await redis.set(eventId, '1', 'EX', 86400); // 24 hour TTL
     // Process event
   });
   ```

2. **Return 200 quickly**: Respond fast to prevent sender retries
   ```typescript
   // Process async
   webhookHandler.on('address.created', async (event, data) => {
     // Queue for background processing
     await queue.add('process-address', data);
   });
   ```

### Retry Logic Not Working

**Problem:** Failed webhook deliveries aren't retried.

**Solutions:**

1. **Check retry configuration**:
   ```typescript
   const delivery = createWebhookDelivery({
     maxAttempts: 5, // Increase attempts
     backoff: 'exponential',
     initialDelay: 2000, // Longer initial delay
     maxDelay: 120000,
   });
   ```

2. **Verify error status codes**: Only 5xx errors trigger retries, not 4xx
   ```typescript
   // 4xx errors (client errors) don't retry
   // 5xx errors (server errors) trigger retries
   ```

3. **Check logs for actual errors**:
   ```typescript
   const result = await delivery.deliver(url, payload, secret);
   if (!result.success) {
     console.error('Delivery failed:', result.error);
     console.log('Attempts:', result.attempts);
   }
   ```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  WebhookConfig,
  WebhookPayload,
  WebhookHandler,
  WebhookEventType,
  AddressCreatedData,
  AddressUpdateData,
  AddressDeletedData,
  DeliveryStatusData,
  RetryConfig,
} from '@vey/webhooks';
```

## Testing

### Unit Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createWebhookHandler, createSignature } from '@vey/webhooks';

describe('Webhook Handler', () => {
  it('should handle valid webhook', async () => {
    const handler = createWebhookHandler({ secret: 'test_secret' });
    const mockFn = vi.fn();
    
    handler.onAddressCreated(mockFn);
    
    const payload = {
      event: 'address.created',
      timestamp: new Date().toISOString(),
      data: { address_id: 'test_123', address: {} },
    };
    
    const body = JSON.stringify(payload);
    const signature = await createSignature(body, 'test_secret');
    
    const result = await handler.handle(body, signature);
    
    expect(result.success).toBe(true);
    expect(mockFn).toHaveBeenCalledOnce();
  });
  
  it('should reject invalid signature', async () => {
    const handler = createWebhookHandler({ secret: 'test_secret' });
    
    const result = await handler.handle('{}', 'sha256=invalid');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid signature');
  });
});
```

### Integration Testing

```typescript
import request from 'supertest';
import { app } from './app';

describe('Webhook Endpoint', () => {
  it('should accept valid webhook', async () => {
    const payload = {
      event: 'address.created',
      timestamp: new Date().toISOString(),
      data: { address_id: 'test_123', address: {} },
    };
    
    const response = await request(app)
      .post('/webhooks/addresses')
      .send(payload)
      .set('X-Vey-Signature', await createSignature(JSON.stringify(payload), secret))
      .expect(200);
    
    expect(response.body.received).toBe(true);
  });
});
```

## Related Packages

- [@vey/core](../core) - Core address validation SDK
- [@vey/webauthn](../webauthn) - WebAuthn/FIDO2 authentication
- [@vey/react](../react) - React components and hooks
- [@vey/vue](../vue) - Vue components and composables

## License

MIT

## Support

- [Documentation](../../docs)
- [Examples](../../examples)
- [GitHub Issues](https://github.com/rei-k/world-address/issues)
