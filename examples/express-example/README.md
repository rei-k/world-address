# Express.js Integration Example

This example demonstrates how to integrate the Vey World Address SDK with Express.js, including webhook handling for third-party integrations.

## Features

- ✅ **Address validation API** - RESTful endpoint for validating addresses
- ✅ **Address formatting API** - Format addresses according to country standards
- ✅ **Required fields API** - Dynamic required fields based on country
- ✅ **Webhook integration** - Receive and process address events
- ✅ **Automatic retries** - Webhook delivery with exponential backoff
- ✅ **HMAC signature verification** - Secure webhook validation

## Installation

```bash
cd examples/express-example
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
WEBHOOK_SECRET=your-webhook-secret-here
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-reload)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The server will start at `http://localhost:3000`.

## API Endpoints

### 1. Health Check

```http
GET /
```

Response:
```json
{
  "status": "ok",
  "message": "Vey Address API - Express Example",
  "endpoints": {
    "validate": "/api/address/validate",
    "format": "/api/address/format",
    "required": "/api/address/required/:country",
    "webhooks": "/api/webhooks"
  }
}
```

### 2. Validate Address

```http
POST /api/address/validate
Content-Type: application/json

{
  "country": "JP",
  "address": {
    "postal_code": "100-0001",
    "province": "東京都",
    "city": "千代田区",
    "street_address": "千代田1-1"
  }
}
```

Response:
```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "normalized": {
    "postal_code": "100-0001",
    "province": "東京都",
    "city": "千代田区",
    "street_address": "千代田1-1",
    "country": "JP"
  }
}
```

### 3. Format Address

```http
POST /api/address/format
Content-Type: application/json

{
  "country": "US",
  "address": {
    "recipient": "John Doe",
    "street_address": "1600 Amphitheatre Parkway",
    "city": "Mountain View",
    "province": "CA",
    "postal_code": "94043",
    "country": "US"
  },
  "options": {
    "separator": "\n"
  }
}
```

Response:
```json
{
  "formatted": "John Doe\n1600 Amphitheatre Parkway\nMountain View, CA 94043\nUnited States",
  "country": "United States"
}
```

### 4. Get Required Fields

```http
GET /api/address/required/JP
```

Response:
```json
{
  "country": "Japan",
  "requiredFields": ["postal_code", "province", "city", "street_address"],
  "addressFormat": {
    "order": ["recipient", "postal_code", "province", "city", "street_address", "country"],
    "postal_code": {
      "required": true,
      "regex": "^[0-9]{3}-[0-9]{4}$",
      "example": "100-0001"
    }
  }
}
```

### 5. Webhook Endpoint

```http
POST /api/webhooks
Content-Type: application/json
X-Vey-Signature: sha256=<hmac_signature>

{
  "event": "address.created",
  "timestamp": "2024-12-08T12:00:00Z",
  "data": {
    "address_id": "addr_123",
    "address": {
      "street_address": "1600 Amphitheatre Parkway",
      "city": "Mountain View",
      "province": "CA",
      "postal_code": "94043",
      "country": "US"
    }
  },
  "signature": "sha256=..."
}
```

Response:
```json
{
  "received": true
}
```

## Webhook Events

The following webhook events are supported:

### Address Events

- **`address.created`** - New address created
  ```json
  {
    "address_id": "addr_123",
    "address": { ... }
  }
  ```

- **`address.updated`** - Address updated
  ```json
  {
    "address_id": "addr_123",
    "previous": { ... },
    "current": { ... },
    "changed_fields": ["city", "postal_code"]
  }
  ```

- **`address.deleted`** - Address deleted
  ```json
  {
    "address_id": "addr_123",
    "address": { ... }
  }
  ```

### Delivery Events

- **`delivery.started`** - Delivery started
- **`delivery.completed`** - Delivery completed
- **`delivery.failed`** - Delivery failed

```json
{
  "address_id": "addr_123",
  "carrier": "usps",
  "tracking_number": "9400111899560513508669",
  "status": "delivered",
  "estimated_delivery": "2024-12-10T18:00:00Z"
}
```

## Webhook Security

All webhooks are signed using HMAC-SHA256. The signature is included in the `X-Vey-Signature` header.

### Verifying Webhooks

The webhook handler automatically verifies signatures:

```javascript
import { createWebhookHandler } from '@vey/webhooks';

const webhookHandler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET,
  tolerance: 300, // 5 minutes
});
```

### Manual Signature Verification

```javascript
import { verifySignatureSync } from '@vey/webhooks';

const body = JSON.stringify(req.body);
const signature = req.headers['x-vey-signature'];
const isValid = verifySignatureSync(body, signature, process.env.WEBHOOK_SECRET);
```

## Webhook Retry Logic

The webhook system automatically retries failed deliveries:

```javascript
import { createWebhookDelivery } from '@vey/webhooks';

const delivery = createWebhookDelivery({
  maxAttempts: 3,
  backoff: 'exponential', // or 'linear'
  initialDelay: 1000,     // 1 second
  maxDelay: 60000,        // 60 seconds
});

const result = await delivery.deliver(
  'https://your-app.com/webhooks',
  payload,
  secret
);

console.log(`Delivered in ${result.attempts} attempt(s)`);
```

### Retry Strategy

- **Exponential backoff**: 1s → 2s → 4s (with jitter)
- **Linear backoff**: 1s → 2s → 3s
- **Max attempts**: Configurable (default: 3)
- **Smart retry**: Only retries on 5xx errors, not 4xx

## Testing Webhooks

In development mode, use the test endpoint:

```bash
curl -X POST http://localhost:3000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{
    "event": "address.created",
    "data": {
      "address_id": "test_123",
      "address": {
        "street_address": "123 Test St",
        "city": "Test City",
        "country": "US"
      }
    }
  }'
```

## Integration Examples

### Using with Axios

```javascript
import axios from 'axios';

const validateAddress = async (address, country) => {
  const response = await axios.post('http://localhost:3000/api/address/validate', {
    address,
    country,
  });
  return response.data;
};

const result = await validateAddress({
  postal_code: '94043',
  city: 'Mountain View',
  province: 'CA',
  street_address: '1600 Amphitheatre Parkway',
}, 'US');

console.log('Valid:', result.valid);
```

### Using with Fetch

```javascript
const response = await fetch('http://localhost:3000/api/address/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    country: 'JP',
    address: {
      postal_code: '100-0001',
      province: '東京都',
      city: '千代田区',
      street_address: '千代田1-1',
    },
  }),
});

const result = await response.json();
```

## Production Deployment

### Environment Variables

```env
PORT=3000
WEBHOOK_SECRET=<generate-strong-secret>
NODE_ENV=production
```

### Security Best Practices

1. **Use HTTPS** - Always use HTTPS in production
2. **Rate limiting** - Add rate limiting middleware
3. **Input validation** - Validate all inputs
4. **Secret rotation** - Rotate webhook secrets regularly
5. **Logging** - Log all webhook events for auditing

### Example with Helmet and Rate Limiting

```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common status codes:
- `400` - Bad request (missing or invalid parameters)
- `404` - Not found (country format not found)
- `500` - Internal server error

## License

MIT - see [LICENSE](../../LICENSE) for details
