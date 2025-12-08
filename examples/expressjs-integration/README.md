# Express.js Integration Example

This example demonstrates how to integrate the `@vey/core` SDK with Express.js, including webhooks and authentication.

## Features

- ✅ **RESTful API** - Full CRUD operations for addresses
- ✅ **Address Validation** - Real-time validation using @vey/core
- ✅ **Webhooks** - Event-driven architecture for address changes
- ✅ **Authentication** - JWT-based API authentication
- ✅ **API Key Auth** - Support for API key authentication
- ✅ **Security** - Helmet.js for security headers
- ✅ **CORS** - Configurable CORS support
- ✅ **TypeScript** - Full type safety
- ✅ **Error Handling** - Comprehensive error handling middleware

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Public Endpoints

#### Health Check
```bash
GET /health
```

### Protected Endpoints (require authentication)

#### Validate Address
```bash
POST /api/addresses/validate
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "country": "JP",
  "postal_code": "100-0001",
  "province": "東京都",
  "city": "千代田区",
  "street_address": "千代田1-1"
}
```

#### Create Address
```bash
POST /api/addresses
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "country": "JP",
  "postal_code": "100-0001",
  "province": "東京都",
  "city": "千代田区",
  "street_address": "千代田1-1",
  "recipient": "田中太郎"
}
```

#### Get Address
```bash
GET /api/addresses/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Address
```bash
PUT /api/addresses/:id
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "street_address": "千代田2-2"
}
```

#### Delete Address
```bash
DELETE /api/addresses/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### List Addresses
```bash
GET /api/addresses
Authorization: Bearer YOUR_JWT_TOKEN
```

### Webhook Endpoints

#### Register Webhook
```bash
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "url": "https://your-app.com/webhooks/address-events",
  "events": ["address.created", "address.updated", "address.deleted"],
  "secret": "your-webhook-secret"
}
```

#### List Webhooks
```bash
GET /api/webhooks
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Delete Webhook
```bash
DELETE /api/webhooks/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

## Authentication

### JWT Authentication

Get a JWT token (for demo purposes - in production, use a proper auth service):

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "demo",
  "password": "demo123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

Use the token in subsequent requests:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key Authentication

Alternatively, use API key authentication:

```bash
X-API-Key: your-api-key-here
```

## Webhooks

Webhooks allow you to receive real-time notifications when addresses are created, updated, or deleted.

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
  },
  "signature": "sha256=..."
}
```

### Webhook Security

Webhooks are signed using HMAC-SHA256. Verify the signature:

```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# API Keys (comma-separated)
API_KEYS=demo-api-key-1,demo-api-key-2

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Webhook Configuration
WEBHOOK_SIGNATURE_SECRET=your-webhook-signing-secret
```

## Project Structure

```
expressjs-integration/
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── routes/
│   │   ├── addresses.ts         # Address CRUD routes
│   │   ├── webhooks.ts          # Webhook management routes
│   │   └── auth.ts              # Authentication routes
│   ├── middleware/
│   │   ├── auth.ts              # Authentication middleware
│   │   ├── errorHandler.ts     # Error handling middleware
│   │   └── validation.ts        # Request validation middleware
│   ├── services/
│   │   ├── addressService.ts   # Address business logic
│   │   └── webhookService.ts   # Webhook delivery service
│   └── types/
│       └── index.ts             # TypeScript types
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Usage Examples

### Using with cURL

```bash
# Login to get JWT token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}' \
  | jq -r '.token')

# Validate an address
curl -X POST http://localhost:3000/api/addresses/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "JP",
    "postal_code": "100-0001",
    "province": "東京都",
    "city": "千代田区",
    "street_address": "千代田1-1"
  }'

# Create an address
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "JP",
    "postal_code": "100-0001",
    "province": "東京都",
    "city": "千代田区",
    "street_address": "千代田1-1",
    "recipient": "田中太郎"
  }'

# Register a webhook
curl -X POST http://localhost:3000/api/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/your-unique-url",
    "events": ["address.created", "address.updated"],
    "secret": "my-webhook-secret"
  }'
```

### Using with JavaScript/TypeScript

```typescript
import fetch from 'node-fetch';

// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'demo', password: 'demo123' })
});
const { token } = await loginResponse.json();

// Validate address
const validateResponse = await fetch('http://localhost:3000/api/addresses/validate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    country: 'JP',
    postal_code: '100-0001',
    province: '東京都',
    city: '千代田区',
    street_address: '千代田1-1'
  })
});
const result = await validateResponse.json();

if (result.valid) {
  console.log('Address is valid!');
} else {
  console.log('Validation errors:', result.errors);
}
```

## Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test with invalid authentication
curl -X GET http://localhost:3000/api/addresses \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized
```

## Production Deployment

### Using Docker

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

### Environment Configuration

For production, ensure you:

1. Change all secrets (JWT_SECRET, API_KEYS, WEBHOOK_SIGNATURE_SECRET)
2. Set NODE_ENV=production
3. Configure CORS_ORIGIN to your actual frontend URLs
4. Use a proper database instead of in-memory storage
5. Implement rate limiting
6. Add logging and monitoring
7. Use HTTPS in production

## Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate secrets regularly** - JWT secrets, API keys, webhook secrets
3. **Validate all inputs** - Use express-validator for request validation
4. **Implement rate limiting** - Prevent abuse
5. **Use environment variables** - Never commit secrets to git
6. **Verify webhook signatures** - Prevent webhook spoofing
7. **Set security headers** - Using Helmet.js
8. **Audit dependencies** - Regularly check for vulnerabilities

## Extending This Example

### Add Database Support

Replace in-memory storage with a database:

```typescript
// Use Prisma, TypeORM, or MongoDB
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createAddress(address: Address) {
  return await prisma.address.create({
    data: address
  });
}
```

### Add Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Add Request Logging

```typescript
import morgan from 'morgan';

app.use(morgan('combined'));
```

## Learn More

- [Express.js Documentation](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)
- [Webhook Best Practices](https://webhooks.fyi/)
- [@vey/core SDK Documentation](../../sdk/core/README.md)

## License

MIT
