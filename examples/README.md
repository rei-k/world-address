# Examples

This directory contains example implementations of the Vey World Address SDK for various frameworks and platforms.

## Available Examples

### 🚀 Quick Start

Each example is self-contained and demonstrates best practices for using the Vey SDK in production applications.

| Example | Description | Tech Stack | Status |
|---------|-------------|------------|--------|
| [react-example](./react-example/) | React + TypeScript address form with validation | React, TypeScript | ✅ Ready |
| [vue-example](./vue-example/) | Vue 3 composition API example | Vue 3 | ✅ Ready |
| [nextjs-example](./nextjs-example/) | Next.js 14 with App Router, API routes, and auth | Next.js 14, NextAuth.js | ✅ Ready |
| [nuxtjs-integration](./nuxtjs-integration/) | Nuxt.js 3 with server API routes and authentication | Nuxt 3, Nitro | ✅ Ready |
| [expressjs-integration](./expressjs-integration/) | Express.js RESTful API with JWT and webhooks | Express, TypeScript | ✅ Ready |
| [fastify-integration](./fastify-integration/) | High-performance Fastify API with auth | Fastify, TypeScript | ✅ Ready |
| [vanilla-js-example](./vanilla-js-example/) | Pure JavaScript example | Vanilla JS | 📋 Planned |

## Running an Example

### Frontend Examples

**React Example**
```bash
cd examples/react-example
npm install
npm start
```

**Vue Example**
```bash
cd examples/vue-example
npm install
npm run dev
```

### Full-Stack Examples

**Next.js Example**
```bash
cd examples/nextjs-example
npm install
cp .env.example .env.local
npm run dev
```

**Nuxt.js Example**
```bash
cd examples/nuxtjs-integration
npm install
cp .env.example .env
npm run dev
```

### Backend API Examples

**Express.js Integration**
```bash
cd examples/expressjs-integration
npm install
cp .env.example .env
npm run dev
```

**Fastify Integration**
```bash
cd examples/fastify-integration
npm install
cp .env.example .env
npm run dev
```

Visit the respective localhost URL (usually `http://localhost:3000`) to see each example in action.

## Features Demonstrated

All examples demonstrate:

- ✅ **Country-specific validation** - Different rules for different countries
- ✅ **Real-time validation** - Immediate feedback as users type
- ✅ **Postal code formatting** - Country-specific postal code patterns
- ✅ **Required field detection** - Dynamic required fields based on country
- ✅ **Error messaging** - Clear, actionable error messages
- ✅ **Territorial restrictions** - Compliance with territorial naming policies
- ✅ **Multi-language support** - Address validation in multiple languages

## Common Use Cases

### 1. E-commerce Checkout

```typescript
import { validateAddress, formatShippingLabel } from '@vey/core';

// Validate shipping address before checkout
const result = validateAddress(checkoutAddress, countryFormat);

if (result.valid) {
  // Generate shipping label
  const label = formatShippingLabel(result.normalized, countryFormat);
  await createShipment(label);
}
```

### 2. User Profile Management

```typescript
import { validateAddress, getRequiredFields } from '@vey/core';

// Show dynamic required fields based on country
const required = getRequiredFields(countryFormat);

// Validate on form submission
const result = validateAddress(profileAddress, countryFormat);
```

### 3. International Shipping Calculator

```typescript
import { validateAddress, normalizeAddress } from '@vey/core';

// Validate and normalize address for shipping calculation
const result = validateAddress(address, countryFormat);

if (result.valid) {
  const normalized = normalizeAddress(result.normalized, countryFormat.iso_codes.alpha2);
  const shippingCost = await calculateShipping(normalized);
}
```

## Authentication Patterns

The backend examples (Next.js, Nuxt.js, Express.js, and Fastify) demonstrate various authentication patterns for securing your address APIs.

### 1. JWT Authentication

JSON Web Tokens (JWT) are used for stateless authentication. Best for APIs and single-page applications.

**Example (Next.js with NextAuth.js):**
```typescript
// Login and get token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'demo@example.com', password: 'demo123' })
});
const { token } = await response.json();

// Use token in subsequent requests
const addresses = await fetch('/api/addresses', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Example (Fastify):**
```typescript
// Server: Verify JWT
fastify.addHook('onRequest', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Client: Use JWT
const response = await fetch('http://localhost:3000/api/addresses', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
```

**When to use:**
- Single-page applications (React, Vue, Angular)
- Mobile apps
- Microservices
- APIs consumed by multiple clients

### 2. API Key Authentication

Simple authentication using API keys in headers. Best for machine-to-machine communication.

**Example (Express.js / Fastify):**
```typescript
// Server: Validate API key
const validKeys = process.env.API_KEYS?.split(',') || [];
const apiKey = request.headers['x-api-key'];

if (!validKeys.includes(apiKey)) {
  return reply.code(401).send({ error: 'Invalid API key' });
}

// Client: Send API key
const response = await fetch('http://localhost:3000/api/addresses', {
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
```

**When to use:**
- Server-to-server communication
- Third-party integrations
- Internal tools and scripts
- Webhook endpoints

### 3. Session-Based Authentication

Traditional session-based auth using cookies. Best for server-rendered applications.

**Example (Next.js with NextAuth.js):**
```typescript
// Server: Get session
import { getServerSession } from 'next-auth';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // User is authenticated
  const addresses = await getAddresses(session.user.id);
  res.json({ addresses });
}

// Client: Session is handled automatically via cookies
const response = await fetch('/api/addresses');
```

**Example (Nuxt.js with @sidebase/nuxt-auth):**
```typescript
// Composable: Check auth status
const { status, data } = useAuth();

if (status.value === 'authenticated') {
  console.log('User:', data.value?.user);
}

// Server route: Require auth
export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  
  if (!session) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
  
  return { user: session.user };
});
```

**When to use:**
- Traditional server-rendered apps (Next.js, Nuxt.js)
- Applications with server-side rendering
- When you need fine-grained session control

### 4. OAuth2 Integration

Third-party authentication (Google, GitHub, etc.). Best for social login.

**Example (Next.js with NextAuth.js):**
```typescript
// pages/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
};

export default NextAuth(authOptions);
```

**Environment variables:**
```env
# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

**When to use:**
- User-facing applications
- When you want to avoid password management
- Social login features

### Comparison

| Method | Complexity | Security | Use Case | Stateless |
|--------|------------|----------|----------|-----------|
| JWT | Medium | High | APIs, SPAs | ✅ Yes |
| API Key | Low | Medium | M2M, Scripts | ✅ Yes |
| Session | Medium | High | SSR Apps | ❌ No |
| OAuth2 | High | Very High | Social Login | ✅ Yes |

### Security Best Practices

1. **Always use HTTPS** in production
2. **Rotate secrets regularly** - JWT secrets, API keys
3. **Set short expiration times** - For JWTs (e.g., 15 minutes access, 7 days refresh)
4. **Validate all inputs** - Never trust client data
5. **Use rate limiting** - Prevent brute force attacks
6. **Implement refresh tokens** - For long-lived sessions
7. **Whitelist CORS origins** - Don't use `*` in production
8. **Hash API keys** - Store hashed versions in database
9. **Monitor authentication attempts** - Log and alert on suspicious activity
10. **Use secure cookies** - HttpOnly, Secure, SameSite

### Example Implementations

- **Next.js:** See [nextjs-example](./nextjs-example/) for NextAuth.js integration
- **Nuxt.js:** See [nuxtjs-integration](./nuxtjs-integration/) for @sidebase/nuxt-auth
- **Express.js:** See [expressjs-integration](./expressjs-integration/) for JWT + API key
- **Fastify:** See [fastify-integration](./fastify-integration/) for high-performance auth

## Webhook Integration

Backend examples include webhook support for real-time notifications when addresses are created, updated, or deleted.

### Webhook Events

- `address.created` - Fired when a new address is created
- `address.updated` - Fired when an address is updated
- `address.deleted` - Fired when an address is deleted

### Register a Webhook

```typescript
const response = await fetch('/api/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://your-app.com/webhooks/address-events',
    events: ['address.created', 'address.updated', 'address.deleted'],
    secret: 'your-webhook-secret'
  })
});
```

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

### Verify Webhook Signature

All webhook payloads are signed using HMAC-SHA256. Always verify signatures to prevent spoofing:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook endpoint
app.post('/webhooks/address-events', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'your-webhook-secret';
  
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook safely
  const { event, data } = req.body;
  console.log(`Received ${event}:`, data);
  
  res.send('OK');
});
```

## Testing Your Integration

### Unit Tests

```typescript
import { validateAddress } from '@vey/core';

describe('Address Validation', () => {
  it('should validate Japanese address with postal code', async () => {
    const address = {
      country: 'JP',
      postal_code: '100-0001',
      province: '東京都',
      city: '千代田区',
      street_address: '千代田1-1'
    };
    
    const format = await loadCountryFormat('JP');
    const result = validateAddress(address, format);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### Integration Tests

```typescript
import { validateAddress, formatAddress } from '@vey/core';

describe('Address Flow', () => {
  it('should validate and format address', async () => {
    const format = await loadCountryFormat('US');
    
    // Validate
    const result = validateAddress(testAddress, format);
    expect(result.valid).toBe(true);
    
    // Format
    const formatted = formatAddress(result.normalized, format);
    expect(formatted).toContain(testAddress.city);
  });
});
```

## Performance Tips

### 1. Cache Country Formats

```typescript
const formatCache = new Map();

async function getCachedFormat(countryCode: string) {
  if (!formatCache.has(countryCode)) {
    const format = await loadCountryFormat(countryCode);
    formatCache.set(countryCode, format);
  }
  return formatCache.get(countryCode);
}
```

### 2. Debounce Real-time Validation

```typescript
import { debounce } from 'lodash';

const validateDebounced = debounce(async (address) => {
  const format = await getCachedFormat(address.country);
  const result = validateAddress(address, format);
  setValidationResult(result);
}, 300);
```

### 3. Lazy Load Country Data

```typescript
// Only load country format when needed
const format = useMemo(async () => {
  if (selectedCountry) {
    return await loadCountryFormat(selectedCountry);
  }
}, [selectedCountry]);
```

## Troubleshooting

### Common Issues

#### 1. "Required field missing" errors

**Problem**: Getting errors for fields that seem optional
**Solution**: Check `getRequiredFields()` for the specific country

```typescript
const required = getRequiredFields(format);
console.log('Required fields:', required);
```

#### 2. Postal code validation failing

**Problem**: Valid postal codes are being rejected
**Solution**: Check the expected format for the country

```typescript
const regex = getPostalCodeRegex(format);
const example = getPostalCodeExample(format);
console.log(`Format: ${regex}, Example: ${example}`);
```

#### 3. Territorial restriction errors

**Problem**: Certain place names are rejected (Japan)
**Solution**: Use the approved names from territorial restrictions

```typescript
import { validateJapaneseTerritorialInput } from '@vey/core';

const result = validateJapaneseTerritorialInput(placeName, 'ja');
if (!result.valid) {
  console.log('Suggestion:', result.suggestion);
}
```

## Contributing

Found an issue or have a suggestion for these examples? 

1. Open an issue on GitHub
2. Submit a pull request with improvements
3. Share your own example implementation

## License

MIT License - see [LICENSE](../LICENSE) for details
