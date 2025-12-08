# Next.js 14 Address Form Example

This example demonstrates how to use the `@vey/core` SDK with Next.js 14 App Router, including comprehensive API routes, multiple authentication methods, middleware, and validation.

## Features

- ✅ **Next.js 14 App Router** - Uses the latest App Router architecture
- ✅ **Server and Client Components** - Optimal performance with RSC
- ✅ **API Routes** - Full CRUD API for addresses with validation
- ✅ **Multiple Authentication Methods** - NextAuth, JWT, API Key, OAuth2
- ✅ **TypeScript** - Full type safety with Zod validation
- ✅ **Middleware** - Rate limiting, request logging, CORS
- ✅ **Real-time validation** - Client and server-side validation
- ✅ **Country-specific validation** - Different rules for different countries
- ✅ **Responsive design** - Tailwind CSS for modern UI
- ✅ **Webhooks** - Webhook integration support
- ✅ **Server Actions** - Modern data mutations with Server Actions
- ✅ **Security** - Built-in security headers and best practices

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to see the example in action.

## Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference for all endpoints
- **[Authentication Guide](./AUTHENTICATION.md)** - Detailed guide for NextAuth, JWT, API Key, and OAuth2
- **[Middleware Guide](./MIDDLEWARE.md)** - Rate limiting, logging, and CORS documentation

## Authentication Methods

This example supports four authentication methods:

### 1. NextAuth.js (Session-based)
- ✅ Credentials provider with demo users
- ✅ GitHub OAuth2 provider
- ✅ Session management
- ✅ Best for web applications

**Demo Credentials:**
```
Email: demo@example.com
Password: demo123
```

### 2. JWT Authentication
- ✅ Stateless token-based authentication
- ✅ 24-hour token expiration
- ✅ Best for mobile apps and SPAs

**Login Endpoint:** `POST /api/auth/jwt/login`

### 3. API Key Authentication
- ✅ Simple header-based authentication
- ✅ Best for server-to-server communication

**Demo API Keys:**
```
demo_api_key_12345
prod_api_key_67890
```

### 4. OAuth2 (GitHub)
- ✅ Social login with GitHub
- ✅ No password management needed
- ✅ Best for consumer applications

See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed setup instructions.

## Project Structure

```
nextjs-example/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Home page (server component)
│   │   ├── layout.tsx                        # Root layout
│   │   └── api/
│   │       ├── addresses/
│   │       │   ├── route.ts                  # GET, POST addresses
│   │       │   ├── validate/route.ts         # POST validate address
│   │       │   └── [id]/route.ts             # GET, PUT, DELETE address
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts    # NextAuth routes
│   │       │   ├── jwt/
│   │       │   │   ├── login/route.ts        # JWT login
│   │       │   │   └── verify/route.ts       # JWT verification
│   │       │   └── apikey/route.ts           # API key verification
│   │       ├── webhooks/route.ts             # Webhook management
│   │       └── examples/
│   │           └── protected/route.ts        # Protected endpoint example
│   ├── lib/
│   │   ├── auth.ts                           # JWT and API key utilities
│   │   ├── middleware.ts                     # Rate limiting, logging, CORS
│   │   ├── validation.ts                     # Zod schemas
│   │   └── services.ts                       # Business logic
│   └── types/
│       └── index.ts                          # TypeScript types
├── API_DOCUMENTATION.md                      # Complete API reference
├── AUTHENTICATION.md                         # Authentication guide
├── MIDDLEWARE.md                             # Middleware guide
├── .env.example                              # Environment variables template
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Key Concepts

### 1. Server Components (RSC)

The main page is a Server Component, which means it's rendered on the server:

```tsx
// src/app/page.tsx
export default function Home() {
  // This runs on the server
  return (
    <main>
      <AddressForm />
    </main>
  );
}
```

### 2. Client Components

Interactive components use the `'use client'` directive:

```tsx
'use client';

import { useState } from 'react';

export default function AddressForm() {
  const [address, setAddress] = useState({...});
  // Client-side interactivity
}
```

### 3. API Routes

Next.js 14 uses Route Handlers for API endpoints:

```typescript
// src/app/api/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Return addresses
}

export async function POST(request: NextRequest) {
  const address = await request.json();
  // Process address
  return NextResponse.json({ success: true });
}
```

### 4. Authentication

Multiple authentication methods supported:

```typescript
// NextAuth Session
const session = await getServerSession(authOptions);

// JWT Token
const payload = verifyJWTFromRequest(request);

// API Key
const isValid = verifyAPIKey(request);
```

### 5. Middleware

Rate limiting, logging, and CORS:

```typescript
import { 
  rateLimitMiddleware, 
  logRequest, 
  addCORSHeaders 
} from '@/lib/middleware';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = rateLimitMiddleware(request, clientIP);
  if (rateLimitResponse) return rateLimitResponse;
  
  // Logging
  logRequest(request);
  
  // Process request
  const response = NextResponse.json(data);
  
  // Add CORS headers
  return addCORSHeaders(response);
}
```

### 6. Validation with Zod

Type-safe request validation:

```typescript
import { addressSchema, validateBody } from '@/lib/validation';

const body = await request.json();
const validation = validateBody(addressSchema, body);

if (!validation.success) {
  return NextResponse.json(
    { error: 'Validation Error', errors: validation.errors },
    { status: 400 }
  );
}

// Use validated data
const address = validation.data;
```

### 7. TypeScript Integration

Full TypeScript support with auto-completion:

```typescript
import type { Address, ValidationResult } from '@/types';

const [address, setAddress] = useState<Address>({
  country: 'JP',
  postal_code: '',
  province: '',
  city: '',
  street_address: '',
});
```

## API Endpoints

### Address Management

- **GET /api/addresses** - List all addresses (requires auth)
- **POST /api/addresses** - Create address (requires auth)
- **GET /api/addresses/{id}** - Get single address (requires auth)
- **PUT /api/addresses/{id}** - Update address (requires auth)
- **DELETE /api/addresses/{id}** - Delete address (requires auth)
- **POST /api/addresses/validate** - Validate address without saving (requires auth)

### Authentication

- **POST /api/auth/jwt/login** - Login with email/password, get JWT token
- **GET /api/auth/jwt/verify** - Verify JWT token
- **GET /api/auth/apikey** - Verify API key
- **GET/POST /api/auth/[...nextauth]** - NextAuth endpoints

### Webhooks

- **GET /api/webhooks** - List webhooks (requires auth)
- **POST /api/webhooks** - Register webhook (requires auth)

### Examples

- **GET/POST /api/examples/protected** - Protected endpoint demonstrating auth and validation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference with request/response examples.

## Quick Examples

### Example 1: JWT Authentication

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/jwt/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}' \
  | jq -r '.token')

# Use token to create address
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "JP",
    "postal_code": "100-0001",
    "city": "Tokyo"
  }'
```

### Example 2: API Key Authentication

```bash
curl -X GET http://localhost:3000/api/addresses \
  -H "x-api-key: demo_api_key_12345"
```

### Example 3: JavaScript/TypeScript

```typescript
// Login with JWT
const loginResponse = await fetch('/api/auth/jwt/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'demo@example.com',
    password: 'demo123'
  })
});

const { token } = await loginResponse.json();

// Create address with JWT
const addressResponse = await fetch('/api/addresses', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    country: 'JP',
    postal_code: '100-0001',
    city: 'Tokyo'
  })
});

const address = await addressResponse.json();
```

## Features in Detail

### Server-Side Rendering (SSR)

- Fast initial page load
- SEO-friendly
- Pre-rendered HTML

### Client-Side Interactivity

- Real-time validation
- Dynamic form fields based on country
- Smooth user experience

### API Integration

```typescript
// Submit address to API
const response = await fetch('/api/addresses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(address),
});

const result = await response.json();
```

## Extending This Example

### Add Database Integration

This example uses in-memory storage. For production, add a database:

```typescript
// Install Prisma
npm install @prisma/client
npm install -D prisma

// Initialize Prisma
npx prisma init

// Update src/lib/services.ts
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const address = await request.json();
  
  const saved = await prisma.address.create({
    data: address,
  });
  
  return NextResponse.json(saved);
}
```

### Add Redis for Rate Limiting

For distributed rate limiting in production:

```typescript
npm install ioredis

// Update src/lib/middleware.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Implement Redis-based rate limiter
```

### Add More OAuth Providers

NextAuth supports many providers:

```typescript
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET
  })
]
```

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# NextAuth.js Configuration (required)
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth2 Provider (optional)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# JWT Authentication (required for JWT auth)
JWT_SECRET=your-jwt-secret-change-in-production

# API Key Authentication
# Add valid keys to src/lib/auth.ts VALID_API_KEYS set

# Webhook Configuration
WEBHOOK_SECRET=your-webhook-secret-change-in-production

# Optional: Database URL
# DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```

### Generating Secrets

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API key
node -e "console.log('api_key_' + require('crypto').randomBytes(32).toString('hex'))"
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Always use HTTPS** - In production environments
3. **Implement rate limiting** - Prevent abuse and DoS attacks
4. **Validate all input** - Use Zod schemas for type-safe validation
5. **Hash passwords** - Use bcrypt (current demo uses plain text)
6. **Rotate API keys** - Periodically change keys
7. **Set CORS policies** - Restrict origins in production
8. **Use secure headers** - Implement CSP, X-Frame-Options, etc.
9. **Log authentication attempts** - Monitor for suspicious activity
10. **Keep dependencies updated** - Regular security updates

See [AUTHENTICATION.md](./AUTHENTICATION.md) and [MIDDLEWARE.md](./MIDDLEWARE.md) for detailed security guidelines.

## Testing

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Build the application
npm run build
```

### Testing Authentication

```bash
# Test JWT login
curl -X POST http://localhost:3000/api/auth/jwt/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'

# Test API key
curl -X GET http://localhost:3000/api/auth/apikey \
  -H "x-api-key: demo_api_key_12345"
```

### Testing Rate Limiting

```bash
# Make multiple requests to test rate limiting
for i in {1..105}; do
  curl -X GET http://localhost:3000/api/examples/protected \
    -H "x-api-key: demo_api_key_12345"
done
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `JWT_SECRET`
   - `GITHUB_ID` and `GITHUB_SECRET` (if using OAuth)
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t nextjs-example .
docker run -p 3000:3000 --env-file .env.local nextjs-example
```

### Environment Variables in Production

Remember to set all required environment variables:

- `NEXTAUTH_SECRET` - Random 32-character string
- `NEXTAUTH_URL` - Your production URL
- `JWT_SECRET` - Random 32-character string
- `GITHUB_ID` and `GITHUB_SECRET` - If using OAuth
- Update allowed origins for CORS

## Performance

This example uses Next.js 14 optimizations:

- **React Server Components** - Reduce client-side JavaScript
- **Streaming** - Progressive rendering
- **Automatic Code Splitting** - Load only what's needed
- **Image Optimization** - Optimized images with next/image
- **Rate Limiting** - Prevent abuse and ensure fair resource usage
- **Efficient Middleware** - Minimal overhead for request processing

## Troubleshooting

### Common Issues

**"Unauthorized" errors**
- Check that environment variables are set correctly
- Verify authentication credentials are valid
- Ensure tokens haven't expired

**Rate limit exceeded**
- Wait for the rate limit window to reset
- Implement exponential backoff in client code
- Check rate limit headers for reset time

**CORS errors**
- Verify origin is allowed in CORS configuration
- Check that proper headers are included
- Ensure OPTIONS handler exists for preflight requests

**NextAuth errors**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear cookies and try again

**JWT errors**
- Verify `JWT_SECRET` is set
- Check token format is "Bearer <token>"
- Test token at https://jwt.io

See troubleshooting sections in:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#troubleshooting)
- [AUTHENTICATION.md](./AUTHENTICATION.md#troubleshooting)
- [MIDDLEWARE.md](./MIDDLEWARE.md#troubleshooting)

## Learn More

### Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Authentication Guide](./AUTHENTICATION.md)** - All authentication methods
- **[Middleware Guide](./MIDDLEWARE.md)** - Rate limiting, logging, CORS

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Zod Documentation](https://zod.dev/)
- [@vey/core SDK Documentation](../../sdk/core/README.md)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT
