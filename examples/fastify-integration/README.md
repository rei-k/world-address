# Fastify Address Integration Example

This example demonstrates how to integrate the `@vey/core` SDK with Fastify - a high-performance Node.js web framework optimized for speed and low overhead.

## Features

- ⚡ **Fastify** - Ultra-fast web framework (up to 30,000 req/sec)
- 🔒 **Security** - Helmet.js for security headers
- 🔐 **Authentication** - JWT and API Key authentication
- 🚀 **Performance** - Built-in schema-based validation and serialization
- 🛡️ **Rate Limiting** - Protect against abuse
- 📝 **TypeScript** - Full type safety
- ✅ **Validation** - Zod + JSON Schema validation
- 🪝 **Webhooks** - HMAC-signed webhook delivery
- 📊 **Logging** - Built-in Pino logger for production

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server will start on `http://localhost:3000`.

## Performance

Fastify is one of the fastest Node.js web frameworks:

- **~30,000 requests/second** (on average hardware)
- **Low overhead** - Minimal CPU and memory usage
- **Schema-based** - Validation and serialization are optimized
- **Async/await native** - Built for modern JavaScript
- **Plugin architecture** - Modular and extensible

## Project Structure

```
fastify-integration/
├── src/
│   ├── index.ts                  # Main application entry point
│   ├── routes/
│   │   ├── auth.ts               # Authentication routes
│   │   ├── addresses.ts          # Address CRUD routes
│   │   └── webhooks.ts           # Webhook management routes
│   ├── middleware/
│   │   └── auth.ts               # Authentication middleware
│   ├── services/
│   │   └── addressService.ts    # Address business logic
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## API Endpoints

### Public Endpoints

#### Health Check
```bash
GET /health

# Response:
{
  "status": "ok",
  "timestamp": "2024-12-08T12:00:00.000Z",
  "uptime": 3600.5
}
```

#### API Documentation
```bash
GET /

# Response:
{
  "name": "Fastify Address API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth/login",
    "addresses": "/api/addresses",
    "webhooks": "/api/webhooks",
    "health": "/health"
  }
}
```

### Authentication

#### Login (Get JWT Token)
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "demo123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h",
  "user": {
    "id": "1",
    "email": "demo@example.com",
    "name": "Demo User"
  }
}
```

**Demo Credentials:**
- Email: `demo@example.com`, Password: `demo123`
- Email: `admin@example.com`, Password: `admin123`

### Protected Endpoints

All protected endpoints require authentication via:
- **JWT Token:** `Authorization: Bearer <token>`
- **API Key:** `X-API-Key: <api-key>`

#### Address Endpoints

**List All Addresses**
```bash
GET /api/addresses
Authorization: Bearer <token>

# Response:
{
  "addresses": [
    {
      "id": "addr_1",
      "country": "JP",
      "postal_code": "100-0001",
      "province": "東京都",
      "city": "千代田区",
      "street_address": "千代田1-1"
    }
  ],
  "count": 1
}
```

**Create Address**
```bash
POST /api/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "country": "JP",
  "postal_code": "100-0001",
  "province": "東京都",
  "city": "千代田区",
  "street_address": "千代田1-1",
  "recipient": "田中太郎"
}
```

**Get Address**
```bash
GET /api/addresses/:id
Authorization: Bearer <token>
```

**Update Address**
```bash
PUT /api/addresses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "street_address": "千代田2-2"
}
```

**Delete Address**
```bash
DELETE /api/addresses/:id
Authorization: Bearer <token>
```

**Validate Address**
```bash
POST /api/addresses/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "country": "JP",
  "postal_code": "100-0001",
  "province": "東京都",
  "city": "千代田区",
  "street_address": "千代田1-1"
}

# Response:
{
  "valid": true,
  "errors": [],
  "address": { ... }
}
```

#### Webhook Endpoints

**List Webhooks**
```bash
GET /api/webhooks
Authorization: Bearer <token>
```

**Register Webhook**
```bash
POST /api/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/address-events",
  "events": ["address.created", "address.updated", "address.deleted"],
  "secret": "your-webhook-secret"
}
```

**Delete Webhook**
```bash
DELETE /api/webhooks/:id
Authorization: Bearer <token>
```

## Authentication Methods

### 1. JWT Authentication

Get a token via login endpoint, then use it in requests:

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}' \
  | jq -r '.token')

# Use token
curl http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $TOKEN"
```

### 2. API Key Authentication

Set API keys in `.env` file:

```env
API_KEYS=demo-api-key-1,demo-api-key-2
```

Use in requests:

```bash
curl http://localhost:3000/api/addresses \
  -H "X-API-Key: demo-api-key-1"
```

## Webhooks

### Webhook Events

- `address.created` - Fired when a new address is created
- `address.updated` - Fired when an address is updated
- `address.deleted` - Fired when an address is deleted

### Webhook Payload

```json
{
  "event": "address.created",
  "timestamp": "2024-12-08T12:00:00Z",
  "data": {
    "id": "addr_123",
    "country": "JP",
    "postal_code": "100-0001",
    "province": "東京都",
    "city": "千代田区",
    "street_address": "千代田1-1"
  }
}
```

### Webhook Headers

```
Content-Type: application/json
X-Webhook-Event: address.created
X-Webhook-Timestamp: 2024-12-08T12:00:00Z
X-Webhook-Signature: sha256=abc123...
```

### Verifying Webhook Signatures

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook endpoint
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'your-webhook-secret';
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  res.send('OK');
});
```

## Rate Limiting

Rate limiting is enabled by default:

```env
RATE_LIMIT_MAX=100           # Max requests per time window
RATE_LIMIT_TIME_WINDOW=15m   # Time window (e.g., 1m, 15m, 1h)
```

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": "900"
}
```

## Environment Variables

Create a `.env` file:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Keys (comma-separated)
API_KEYS=demo-api-key-1,demo-api-key-2

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=15m

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-signing-secret
```

## Performance Optimization

### 1. Schema-Based Validation

Fastify uses JSON Schema for validation and serialization:

```typescript
fastify.post('/api/addresses', {
  schema: {
    body: {
      type: 'object',
      required: ['country'],
      properties: {
        country: { type: 'string', minLength: 2, maxLength: 2 },
        postal_code: { type: 'string' }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          country: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  // Request is already validated
  const address = await createAddress(request.body);
  return reply.code(201).send(address);
});
```

### 2. Async/Await

Fastify is built for async/await:

```typescript
fastify.get('/addresses', async (request, reply) => {
  const addresses = await db.query('SELECT * FROM addresses');
  return addresses; // Fastify handles serialization
});
```

### 3. Logging

Fastify uses Pino, one of the fastest loggers:

```typescript
fastify.log.info('Address created');
fastify.log.error({ err: error }, 'Failed to create address');
```

### 4. Plugin System

Encapsulate logic with plugins:

```typescript
import fp from 'fastify-plugin';

async function myPlugin(fastify, options) {
  fastify.decorate('myUtility', () => {
    // Utility logic
  });
}

export default fp(myPlugin);
```

## Deployment

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
NODE_ENV=production npm start
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t fastify-address-api .
docker run -p 3000:3000 --env-file .env fastify-address-api
```

### Production Considerations

1. **Use Redis for rate limiting** - Replace in-memory store
2. **Enable clustering** - Use `cluster` module for multi-core support
3. **Use a proper database** - Replace in-memory storage with PostgreSQL/MongoDB
4. **Set up monitoring** - Use Prometheus, Grafana, or similar
5. **Configure logging** - Use log aggregation (ELK, Datadog)
6. **Use HTTPS** - Terminate SSL at load balancer or use `fastify-ssl`
7. **Environment-specific configs** - Use different .env files per environment

## Benchmarking

Fastify is designed for performance. Here's a simple benchmark:

```bash
# Install autocannon (Fastify's benchmarking tool)
npm install -g autocannon

# Benchmark health endpoint
autocannon -c 100 -d 10 http://localhost:3000/health

# Benchmark API endpoint (with authentication)
autocannon -c 100 -d 10 \
  -H "Authorization: Bearer <your-token>" \
  http://localhost:3000/api/addresses
```

Expected results (on average hardware):
- **Requests/sec:** 20,000 - 30,000
- **Latency (avg):** 3-5ms
- **Throughput:** 20-30 MB/sec

## Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate secrets regularly** - JWT secret, API keys, webhook secrets
3. **Validate all inputs** - Use JSON Schema and Zod
4. **Implement rate limiting** - Prevent abuse and DoS attacks
5. **Use environment variables** - Never commit secrets to git
6. **Verify webhook signatures** - Prevent webhook spoofing
7. **Set security headers** - Using Helmet.js
8. **Audit dependencies** - Regularly check for vulnerabilities
9. **Use API key rotation** - Implement key rotation strategy
10. **Monitor suspicious activity** - Log and alert on anomalies

## Extending This Example

### Add Database Support

```typescript
// Using Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addressService = {
  async create(data: Address) {
    return await prisma.address.create({ data });
  },
  
  async getAll(userId: string) {
    return await prisma.address.findMany({
      where: { userId }
    });
  }
};
```

### Add Request Logging

```typescript
// Log all requests
fastify.addHook('onRequest', async (request, reply) => {
  request.log.info({
    method: request.method,
    url: request.url,
    ip: request.ip
  }, 'Incoming request');
});
```

### Add Swagger Documentation

```typescript
import swagger from '@fastify/swagger';

await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'Address API',
      description: 'API documentation',
      version: '1.0.0'
    },
    tags: [
      { name: 'addresses', description: 'Address endpoints' },
      { name: 'webhooks', description: 'Webhook endpoints' }
    ]
  }
});

// Access docs at http://localhost:3000/documentation
```

## Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Change PORT in .env
PORT=3001
```

**2. JWT verification fails**
```bash
# Ensure JWT_SECRET matches between login and verification
# Check token expiration
```

**3. Rate limit exceeded**
```bash
# Increase RATE_LIMIT_MAX or RATE_LIMIT_TIME_WINDOW in .env
# Or whitelist your IP in the code
```

## Learn More

- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Fastify Best Practices](https://www.fastify.io/docs/latest/Guides/Getting-Started/)
- [Pino Logger](https://getpino.io/)
- [JSON Schema](https://json-schema.org/)
- [@vey/core SDK Documentation](../../sdk/core/README.md)

## License

MIT
