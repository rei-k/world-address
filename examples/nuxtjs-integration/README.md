# Nuxt.js 3 Address Integration Example

This example demonstrates how to integrate the `@vey/core` SDK with Nuxt.js 3, including server API routes and authentication.

## Features

- ✅ **Nuxt.js 3** - Latest Nuxt 3 with Vue 3 Composition API
- ✅ **Server API Routes** - Nitro-powered API endpoints
- ✅ **TypeScript** - Full type safety throughout
- ✅ **Authentication** - Session-based auth with @sidebase/nuxt-auth
- ✅ **Address CRUD API** - Complete address management
- ✅ **Webhooks** - Event-driven architecture for address changes
- ✅ **Validation** - Zod-based request validation
- ✅ **Tailwind CSS** - Modern, responsive UI
- ✅ **Auto-imports** - Nuxt auto-import for composables and components

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

# Preview production build
npm run preview
```

Visit `http://localhost:3000` to see the example in action.

## Project Structure

```
nuxtjs-integration/
├── server/
│   ├── api/
│   │   ├── addresses/
│   │   │   ├── index.get.ts          # GET all addresses
│   │   │   ├── index.post.ts         # POST new address
│   │   │   ├── [id].get.ts           # GET single address
│   │   │   ├── [id].put.ts           # PUT update address
│   │   │   ├── [id].delete.ts        # DELETE address
│   │   │   └── validate.post.ts      # POST validate address
│   │   └── webhooks/
│   │       ├── index.get.ts          # GET all webhooks
│   │       ├── index.post.ts         # POST register webhook
│   │       └── [id].delete.ts        # DELETE webhook
│   ├── utils/
│   │   ├── services.ts               # Business logic services
│   │   └── auth.ts                   # Authentication utilities
│   └── types/
│       └── index.ts                  # TypeScript type definitions
├── pages/
│   └── index.vue                     # Home page
├── components/                        # Vue components
├── composables/                       # Composables
├── layouts/
│   └── default.vue                   # Default layout
├── nuxt.config.ts                    # Nuxt configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json
└── README.md
```

## API Endpoints

### Authentication

All protected endpoints require authentication. The demo uses session-based authentication with @sidebase/nuxt-auth.

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123`

### Address Endpoints

#### List All Addresses
```http
GET /api/addresses
```

**Response:**
```json
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

#### Create Address
```http
POST /api/addresses
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

#### Get Address
```http
GET /api/addresses/:id
```

#### Update Address
```http
PUT /api/addresses/:id
Content-Type: application/json

{
  "street_address": "千代田2-2"
}
```

#### Delete Address
```http
DELETE /api/addresses/:id
```

#### Validate Address
```http
POST /api/addresses/validate
Content-Type: application/json

{
  "country": "JP",
  "postal_code": "100-0001",
  "province": "東京都",
  "city": "千代田区",
  "street_address": "千代田1-1"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "address": { ... }
}
```

### Webhook Endpoints

#### List Webhooks
```http
GET /api/webhooks
```

#### Register Webhook
```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/address-events",
  "events": ["address.created", "address.updated", "address.deleted"],
  "secret": "your-webhook-secret"
}
```

#### Delete Webhook
```http
DELETE /api/webhooks/:id
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
X-Webhook-Signature: sha256=...
```

### Verifying Webhook Signatures

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
```

## Server API Routes

Nuxt 3 uses file-based routing for server API routes. Each file in the `server/api/` directory automatically becomes an API endpoint.

### Route Naming Convention

- `index.get.ts` → `GET /api/resource`
- `index.post.ts` → `POST /api/resource`
- `[id].get.ts` → `GET /api/resource/:id`
- `[id].put.ts` → `PUT /api/resource/:id`
- `[id].delete.ts` → `DELETE /api/resource/:id`

### Example: Creating an API Endpoint

```typescript
// server/api/addresses/index.post.ts
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  
  // Validate and process
  const address = await addressService.create(body, user.id);
  
  setResponseStatus(event, 201);
  return address;
});
```

## Authentication

This example uses `@sidebase/nuxt-auth` for authentication.

### In Components

```vue
<script setup lang="ts">
const { status, data, signIn, signOut } = useAuth();

// Check if authenticated
if (status.value === 'authenticated') {
  console.log('User:', data.value?.user);
}

// Sign in
await signIn({ email: 'demo@example.com', password: 'demo123' });

// Sign out
await signOut();
</script>
```

### In Server Routes

```typescript
import { requireAuth } from '../utils/auth';

export default defineEventHandler(async (event) => {
  // This will throw 401 if not authenticated
  const user = await requireAuth(event);
  
  // User is authenticated, proceed
  return { userId: user.id };
});
```

## Validation

This example uses Zod for request validation:

```typescript
import { z } from 'zod';

const addressSchema = z.object({
  country: z.string().min(2).max(2),
  postal_code: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  street_address: z.string().optional(),
  recipient: z.string().optional()
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const parseResult = addressSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body',
      data: parseResult.error.errors
    });
  }
  
  // Process valid data
  const data = parseResult.data;
});
```

## Environment Variables

Create a `.env` file:

```env
# Nuxt.js Configuration
NUXT_PUBLIC_API_BASE=/api

# Authentication
AUTH_SECRET=your-super-secret-auth-key-change-in-production
AUTH_ORIGIN=http://localhost:3000

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret-change-in-production
```

## Using with Client-Side Code

### Fetch API

```vue
<script setup lang="ts">
const addresses = ref([]);

// Fetch addresses
const { data, error } = await useFetch('/api/addresses');
if (data.value) {
  addresses.value = data.value.addresses;
}

// Create address
const createAddress = async (address) => {
  const { data, error } = await $fetch('/api/addresses', {
    method: 'POST',
    body: address
  });
  
  if (!error) {
    addresses.value.push(data);
  }
};
</script>
```

### Composables

```typescript
// composables/useAddresses.ts
export const useAddresses = () => {
  const addresses = ref([]);
  const loading = ref(false);
  
  const fetchAddresses = async () => {
    loading.value = true;
    const { data } = await useFetch('/api/addresses');
    addresses.value = data.value?.addresses || [];
    loading.value = false;
  };
  
  const createAddress = async (address) => {
    const data = await $fetch('/api/addresses', {
      method: 'POST',
      body: address
    });
    addresses.value.push(data);
    return data;
  };
  
  return {
    addresses,
    loading,
    fetchAddresses,
    createAddress
  };
};
```

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `.output` directory with your production-ready application.

### Node.js Server

```bash
node .output/server/index.mjs
```

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

### Static Site Generation

```bash
npm run generate
```

This creates a `dist/` directory with pre-rendered static files.

## Performance

Nuxt 3 provides excellent performance out of the box:

- **Nitro Server** - High-performance server engine
- **Vue 3** - Faster rendering and smaller bundle size
- **Auto Code Splitting** - Automatic route-based splitting
- **Tree Shaking** - Remove unused code
- **Edge-Ready** - Deploy to edge networks (Cloudflare, Vercel Edge)

## Learn More

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Nitro Documentation](https://nitro.unjs.io/)
- [Vue 3 Documentation](https://vuejs.org/)
- [@sidebase/nuxt-auth](https://sidebase.io/nuxt-auth/)
- [@vey/core SDK Documentation](../../sdk/core/README.md)

## License

MIT
