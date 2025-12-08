# Authentication Guide

This guide covers all authentication methods available in the Next.js example application.

## Table of Contents

- [Overview](#overview)
- [NextAuth.js (Session-based)](#nextauthjs-session-based)
- [JWT Authentication](#jwt-authentication)
- [API Key Authentication](#api-key-authentication)
- [OAuth2 with GitHub](#oauth2-with-github)
- [Choosing the Right Method](#choosing-the-right-method)

## Overview

The application supports four authentication methods:

| Method | Use Case | Stateful | Best For |
|--------|----------|----------|----------|
| **NextAuth** | Web applications | Yes | User-facing apps with sessions |
| **JWT** | Mobile/SPA apps | No | Stateless APIs, mobile apps |
| **API Key** | Server-to-server | No | Machine-to-machine, webhooks |
| **OAuth2** | Social login | Yes | Third-party authentication |

## NextAuth.js (Session-based)

NextAuth.js provides session-based authentication with built-in support for many providers.

### Setup

1. Install dependencies (already included):
```bash
npm install next-auth
```

2. Configure environment variables:
```env
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

3. Use in your API routes:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User is authenticated
  const userId = session.user.id;
  // ... your logic
}
```

### Client-side Usage

```typescript
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function Component() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <button onClick={() => signIn()}>Sign In</button>;
  }

  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Demo Credentials

```
Email: demo@example.com
Password: demo123

Email: admin@example.com
Password: admin123
```

## JWT Authentication

JWT (JSON Web Token) provides stateless authentication perfect for APIs and mobile apps.

### How It Works

1. User logs in with credentials
2. Server generates a JWT token
3. Client includes token in subsequent requests
4. Server verifies token without database lookup

### Login Flow

**1. Login to get token:**

```bash
curl -X POST http://localhost:3000/api/auth/jwt/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE3MDQxNTM2MDB9.signature",
  "user": {
    "id": "1",
    "email": "demo@example.com",
    "name": "Demo User"
  },
  "expiresIn": "24h"
}
```

**2. Use token in requests:**

```bash
curl -X GET http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Implementation

**Server-side:**

```typescript
import { verifyJWTFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const payload = verifyJWTFromRequest(request);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  const userId = payload.userId;
  // ... your logic
}
```

**Client-side (React):**

```typescript
import { useState, useEffect } from 'react';

function useJWTAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from localStorage
    const storedToken = localStorage.getItem('jwt_token');
    setToken(storedToken);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/jwt/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);
      return data;
    }

    throw new Error('Login failed');
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
  };

  return { token, login, logout };
}

// Usage
function MyComponent() {
  const { token, login, logout } = useJWTAuth();

  const fetchData = async () => {
    const response = await fetch('/api/addresses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  };

  // ...
}
```

### Configuration

Set JWT secret in `.env.local`:

```env
JWT_SECRET=your-jwt-secret-change-in-production
```

### Token Expiration

- Default: 24 hours
- Customize in `src/lib/auth.ts`:

```typescript
const token = generateJWT(userId, email, '7d'); // 7 days
```

## API Key Authentication

API keys are simple tokens for server-to-server authentication.

### Setup

Add valid API keys to `src/lib/auth.ts`:

```typescript
const VALID_API_KEYS = new Set([
  'demo_api_key_12345',
  'prod_api_key_67890',
  'your_new_api_key_here'
]);
```

### Usage

**Include API key in header:**

```bash
curl -X GET http://localhost:3000/api/addresses \
  -H "x-api-key: demo_api_key_12345"
```

**Verify in API route:**

```typescript
import { verifyAPIKey } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!verifyAPIKey(request)) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  // API key is valid
  // ... your logic
}
```

### Demo API Keys

```
demo_api_key_12345
prod_api_key_67890
```

### Best Practices

1. **Generate strong keys:** Use cryptographically random strings
2. **Rotate regularly:** Change API keys periodically
3. **Use HTTPS:** Never send API keys over HTTP
4. **Store securely:** Don't commit keys to version control
5. **Limit scope:** Consider separate keys for different services

### Generating API Keys

```bash
# Generate a secure random API key
node -e "console.log('api_key_' + require('crypto').randomBytes(32).toString('hex'))"
```

## OAuth2 with GitHub

OAuth2 allows users to sign in with their GitHub account.

### Setup

**1. Create GitHub OAuth App:**

- Go to https://github.com/settings/developers
- Click "New OAuth App"
- Fill in details:
  - **Application name:** Your app name
  - **Homepage URL:** `http://localhost:3000`
  - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
- Click "Register application"
- Copy Client ID and generate Client Secret

**2. Configure environment variables:**

```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=http://localhost:3000
```

**3. The GitHub provider is already configured:**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || ''
    }),
    // ... other providers
  ],
  // ... other config
};
```

### Client Usage

```typescript
'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div>
      <button onClick={() => signIn('github')}>
        Sign in with GitHub
      </button>
    </div>
  );
}
```

### OAuth Flow

1. User clicks "Sign in with GitHub"
2. User is redirected to GitHub
3. User authorizes your application
4. GitHub redirects back with authorization code
5. NextAuth exchanges code for access token
6. User is authenticated with GitHub profile

### Accessing GitHub Data

```typescript
import { getServerSession } from 'next-auth';

const session = await getServerSession(authOptions);

// Session includes GitHub profile data
console.log(session.user.name);    // GitHub name
console.log(session.user.email);   // GitHub email
console.log(session.user.image);   // GitHub avatar
```

### Production Configuration

For production, update the callback URL:

```env
NEXTAUTH_URL=https://yourdomain.com
```

And update GitHub OAuth app settings with:
- **Homepage URL:** `https://yourdomain.com`
- **Callback URL:** `https://yourdomain.com/api/auth/callback/github`

## Choosing the Right Method

### NextAuth.js
✅ **Use when:**
- Building a web application
- Need session management
- Want social login (Google, GitHub, etc.)
- Need server-side rendering with auth

❌ **Don't use when:**
- Building stateless APIs
- Need mobile app authentication
- Want complete control over tokens

### JWT
✅ **Use when:**
- Building mobile applications
- Need stateless authentication
- Building microservices
- Want to scale horizontally

❌ **Don't use when:**
- Need to revoke tokens immediately
- Building simple web apps (NextAuth is easier)
- Security requirements prohibit client-side token storage

### API Key
✅ **Use when:**
- Server-to-server communication
- Webhook authentication
- CLI tools
- Simple machine authentication

❌ **Don't use when:**
- Authenticating end users
- Need fine-grained permissions
- Tokens should expire automatically

### OAuth2
✅ **Use when:**
- Want social login
- Don't want to manage passwords
- Need to access third-party APIs
- Building consumer applications

❌ **Don't use when:**
- Building internal tools
- Can't depend on external services
- Need offline authentication

## Combining Methods

You can support multiple authentication methods simultaneously:

```typescript
export async function GET(request: NextRequest) {
  // Try NextAuth session first
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return processRequest(session.user.id);
  }

  // Try JWT token
  const jwtPayload = verifyJWTFromRequest(request);
  if (jwtPayload) {
    return processRequest(jwtPayload.userId);
  }

  // Try API key
  if (verifyAPIKey(request)) {
    return processRequest('api_user');
  }

  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

## Security Considerations

### General
- ✅ Always use HTTPS in production
- ✅ Implement rate limiting
- ✅ Log authentication attempts
- ✅ Use strong secrets
- ✅ Never expose secrets in client code

### NextAuth
- ✅ Use secure session cookies
- ✅ Set strong NEXTAUTH_SECRET
- ✅ Configure proper CORS
- ✅ Implement CSRF protection (built-in)

### JWT
- ✅ Use strong signing secrets
- ✅ Set appropriate expiration times
- ✅ Store tokens securely (httpOnly cookies preferred)
- ✅ Validate all claims
- ✅ Consider refresh tokens for long sessions

### API Keys
- ✅ Generate cryptographically random keys
- ✅ Hash keys in database
- ✅ Implement key rotation
- ✅ Monitor key usage
- ✅ Limit key permissions

### OAuth2
- ✅ Verify redirect URIs
- ✅ Use state parameter (built-in)
- ✅ Keep secrets secure
- ✅ Handle token refresh
- ✅ Request minimal scopes

## Testing

### Test Credentials

**NextAuth Credentials:**
```
demo@example.com / demo123
admin@example.com / admin123
```

**API Keys:**
```
demo_api_key_12345
prod_api_key_67890
```

### Example Test

```typescript
// Test JWT authentication
describe('JWT Authentication', () => {
  it('should login and receive token', async () => {
    const response = await fetch('/api/auth/jwt/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'demo123'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('demo@example.com');
  });

  it('should reject invalid credentials', async () => {
    const response = await fetch('/api/auth/jwt/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'wrong'
      })
    });

    expect(response.status).toBe(401);
  });
});
```

## Troubleshooting

### "Unauthorized" Errors

1. Check that authentication credentials are correct
2. Verify tokens haven't expired
3. Ensure proper headers are sent
4. Check environment variables are set

### NextAuth Session Issues

```bash
# Clear cookies and try again
# Check NEXTAUTH_SECRET is set
# Verify NEXTAUTH_URL matches your domain
```

### JWT Token Issues

```bash
# Check JWT_SECRET is set
# Verify token format: "Bearer <token>"
# Test token at https://jwt.io
```

### API Key Issues

```bash
# Verify key is in VALID_API_KEYS set
# Check header name is "x-api-key"
# Ensure key is exact match (case-sensitive)
```

## Next Steps

- Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
- Review [MIDDLEWARE.md](./MIDDLEWARE.md) for rate limiting and logging
- Check [examples/](./examples/) for code samples
