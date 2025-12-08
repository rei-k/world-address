# Veyvault Social Login - Developer Guide

## Quick Start

Get started with Veyvault Social Login in 5 minutes.

### 1. Register Your Application

Visit [Veyvault Developer Console](https://developers.veyvault.com) and register your application:

1. Click "Create New App"
2. Enter your app name and description
3. Add redirect URIs (e.g., `https://yourapp.com/auth/callback`)
4. Select required OAuth scopes
5. Save and copy your **Client ID** and **Client Secret**

### 2. Install SDK

```bash
# npm
npm install @veyvault/oauth-sdk

# yarn
yarn add @veyvault/oauth-sdk

# pnpm
pnpm add @veyvault/oauth-sdk
```

### 3. Add Login Button

#### React

```tsx
import { VeyvaultButton } from '@veyvault/react';
import '@veyvault/react/dist/styles.css';

function LoginPage() {
  return (
    <VeyvaultButton
      clientId="your_client_id"
      redirectUri="https://yourapp.com/auth/callback"
      scopes={['openid', 'profile', 'email']}
      onSuccess={(user) => {
        console.log('Logged in:', user);
        // Redirect to dashboard or save session
      }}
      onError={(error) => {
        console.error('Login failed:', error);
      }}
    />
  );
}
```

#### Vue

```vue
<template>
  <VeyvaultButton
    :client-id="clientId"
    :redirect-uri="redirectUri"
    :scopes="['openid', 'profile', 'email']"
    @success="handleSuccess"
    @error="handleError"
  />
</template>

<script setup>
import { VeyvaultButton } from '@veyvault/vue';
import '@veyvault/vue/dist/styles.css';

const clientId = 'your_client_id';
const redirectUri = 'https://yourapp.com/auth/callback';

function handleSuccess(user) {
  console.log('Logged in:', user);
}

function handleError(error) {
  console.error('Login failed:', error);
}
</script>
```

#### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.veyvault.com/oauth/v1/veyvault.css">
</head>
<body>
  <div id="veyvault-login"></div>

  <script src="https://cdn.veyvault.com/oauth/v1/veyvault.js"></script>
  <script>
    VeyvaultAuth.renderButton('veyvault-login', {
      clientId: 'your_client_id',
      redirectUri: 'https://yourapp.com/auth/callback',
      scopes: ['openid', 'profile', 'email'],
      onSuccess: (user) => {
        console.log('Logged in:', user);
      },
      onError: (error) => {
        console.error('Login failed:', error);
      }
    });
  </script>
</body>
</html>
```

### 4. Handle OAuth Callback

When Veyvault redirects back to your app, handle the authorization code:

#### Node.js/Express

```javascript
const { VeyvaultOAuth } = require('@veyvault/oauth-sdk');

const auth = new VeyvaultOAuth({
  clientId: process.env.VEYVAULT_CLIENT_ID,
  clientSecret: process.env.VEYVAULT_CLIENT_SECRET,
  redirectUri: 'https://yourapp.com/auth/callback',
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  try {
    // Exchange code for tokens
    const tokens = await auth.exchangeCodeForTokens(code);
    
    // Get user info
    const user = await auth.getUserInfo(tokens.access_token);
    
    // Save session
    req.session.user = user;
    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token;
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect('/login?error=auth_failed');
  }
});
```

#### Next.js (App Router)

```typescript
// app/auth/callback/route.ts
import { VeyvaultOAuth } from '@veyvault/oauth-sdk';
import { NextRequest, NextResponse } from 'next/server';

const auth = new VeyvaultOAuth({
  clientId: process.env.VEYVAULT_CLIENT_ID!,
  clientSecret: process.env.VEYVAULT_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const tokens = await auth.exchangeCodeForTokens(code);
    const user = await auth.getUserInfo(tokens.access_token);

    // Set session cookie (use next-auth or similar in production)
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('vey_session', JSON.stringify({ user, tokens }), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
```

---

## Advanced Features

### QR Code Authentication

Allow users to log in by scanning a QR code with their Veyvault mobile app:

```tsx
import { VeyvaultQRLogin } from '@veyvault/react';

function LoginPage() {
  return (
    <div>
      <h2>Scan to Sign In</h2>
      <VeyvaultQRLogin
        clientId="your_client_id"
        redirectUri="https://yourapp.com/auth/callback"
        scopes={['openid', 'profile', 'email']}
        size={256}
        onSuccess={(user) => console.log('Logged in:', user)}
        onScan={() => console.log('QR code scanned')}
      />
    </div>
  );
}
```

### PKCE (Proof Key for Code Exchange)

For enhanced security in mobile and single-page applications:

```typescript
const auth = new VeyvaultOAuth({
  clientId: 'your_client_id',
  redirectUri: 'https://yourapp.com/auth/callback',
  usePKCE: true, // Enable PKCE
});

// Generate PKCE challenge
const { challenge, verifier } = await auth.generatePKCE();

// Store verifier for later use
sessionStorage.setItem('pkce_verifier', verifier);

// Build authorization URL with PKCE
const authUrl = auth.getAuthorizationUrl({
  scope: 'openid profile email',
  state: generateState(),
  codeChallenge: challenge,
  codeChallengeMethod: 'S256',
});

// Redirect user
window.location.href = authUrl;

// In callback handler:
const verifier = sessionStorage.getItem('pkce_verifier');
const tokens = await auth.exchangeCodeForTokens(code, { codeVerifier: verifier });
```

### Token Refresh

Automatically refresh expired access tokens:

```typescript
async function makeAuthenticatedRequest(url, accessToken) {
  let response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // If token expired, refresh it
  if (response.status === 401) {
    const newTokens = await auth.refreshAccessToken(refreshToken);
    
    // Save new tokens
    accessToken = newTokens.access_token;
    refreshToken = newTokens.refresh_token;
    
    // Retry request
    response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  return response.json();
}
```

### Custom Scopes

Request Veyvault-specific scopes for address and delivery:

```typescript
<VeyvaultButton
  clientId="your_client_id"
  redirectUri="https://yourapp.com/auth/callback"
  scopes={[
    'openid',
    'profile',
    'email',
    'address',      // ZKP-encrypted address
    'conveyid',     // ConveyID for delivery
    'delivery',     // Permission to send deliveries
    'trust_score',  // User's trust score
  ]}
  onSuccess={(user) => {
    console.log('User info:', user);
    console.log('ConveyID:', user.convey_id);
    console.log('Address (ZKP):', user.address_zkp);
    console.log('Trust Score:', user.trust_score);
  }}
/>
```

### Session Management

Track and manage user sessions across devices:

```typescript
// Get all active sessions
const sessions = await auth.getSessions(accessToken);

// End a specific session
await auth.endSession(accessToken, sessionId);

// End all other sessions (keep current)
await auth.endAllOtherSessions(accessToken);

// Session info includes:
// - Device name and type
// - Location
// - IP address
// - Last activity
// - Created date
```

---

## API Reference

### VeyvaultOAuth Class

Main OAuth client for backend authentication flows.

#### Constructor

```typescript
new VeyvaultOAuth(config: {
  clientId: string;
  clientSecret?: string;  // Optional for PKCE flow
  redirectUri: string;
  usePKCE?: boolean;      // Default: false
  timeout?: number;       // Request timeout in ms
})
```

#### Methods

##### `getAuthorizationUrl(options)`

Generate OAuth authorization URL.

```typescript
auth.getAuthorizationUrl({
  scope: string;              // Space-separated scopes
  state?: string;             // CSRF protection
  nonce?: string;             // Replay attack prevention
  codeChallenge?: string;     // PKCE challenge
  codeChallengeMethod?: 'S256';
  prompt?: 'none' | 'login' | 'consent' | 'select_account';
  maxAge?: number;            // Max authentication age
  loginHint?: string;         // Pre-fill email
}): string
```

##### `exchangeCodeForTokens(code, options?)`

Exchange authorization code for tokens.

```typescript
await auth.exchangeCodeForTokens(
  code: string,
  options?: {
    codeVerifier?: string;  // For PKCE
  }
): Promise<{
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}>
```

##### `getUserInfo(accessToken)`

Get user information using access token.

```typescript
await auth.getUserInfo(accessToken: string): Promise<{
  sub: string;              // User ID (DID)
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  
  // Veyvault custom claims
  convey_id?: string;
  address_verified?: boolean;
  address_count?: number;
  primary_address_country?: string;
  address_zkp?: string;
  trust_score?: number;
  friend_count?: number;
  delivery_count?: number;
}>
```

##### `refreshAccessToken(refreshToken)`

Refresh expired access token.

```typescript
await auth.refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;  // Rotated refresh token
  scope?: string;
}>
```

##### `revokeToken(token, tokenTypeHint?)`

Revoke access or refresh token (logout).

```typescript
await auth.revokeToken(
  token: string,
  tokenTypeHint?: 'access_token' | 'refresh_token'
): Promise<void>
```

### React Components

#### `<VeyvaultButton />`

OAuth login button component.

```typescript
interface VeyvaultButtonProps {
  clientId: string;
  redirectUri: string;
  scopes?: string[];                    // Default: ['openid', 'profile', 'email']
  state?: string;
  theme?: 'default' | 'dark' | 'light'; // Default: 'default'
  size?: 'small' | 'medium' | 'large';  // Default: 'medium'
  text?: string;                        // Default: 'Sign in with Veyvault'
  showLogo?: boolean;                   // Default: true
  usePKCE?: boolean;                    // Default: true
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  onLoading?: (loading: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}
```

#### `<VeyvaultQRLogin />`

QR code authentication component.

```typescript
interface VeyvaultQRLoginProps {
  clientId: string;
  redirectUri: string;
  scopes?: string[];            // Default: ['openid', 'profile', 'email']
  size?: number;                // Default: 256
  pollingInterval?: number;     // Default: 2000 (ms)
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  onScan?: () => void;
  className?: string;
}
```

#### `<VeyvaultConsentScreen />`

OAuth consent screen (internal use).

```typescript
interface VeyvaultConsentScreenProps {
  client: {
    id: string;
    name: string;
    logoUrl?: string;
    description?: string;
    website?: string;
  };
  scopes: string[];
  onApprove: (decision: {
    approved: boolean;
    rememberDecision: boolean;
  }) => void;
  onDeny: () => void;
}
```

---

## OAuth Scopes

| Scope | Description | Data Returned |
|-------|-------------|---------------|
| `openid` | Required for OpenID Connect | Enables OIDC authentication |
| `profile` | User profile information | name, given_name, family_name, picture, locale |
| `email` | Email address | email, email_verified |
| `address` | Verified address (ZKP) | address_verified, address_count, primary_address_country, address_zkp |
| `conveyid` | ConveyID for delivery | convey_id (e.g., taro@convey) |
| `delivery` | Delivery permissions | Permission to send deliveries to user's address |
| `friends` | Friend list | Access to friend list (names only, ZKP-protected) |
| `trust_score` | Trust and reputation | trust_score, friend_count, delivery_count |
| `offline_access` | Refresh token | Long-lived refresh token for offline access |

---

## Security Best Practices

### 1. Always Use HTTPS

Never use OAuth over HTTP in production. All redirect URIs must use HTTPS.

```javascript
// ✅ Good
redirectUri: 'https://yourapp.com/auth/callback'

// ❌ Bad (only for local development)
redirectUri: 'http://localhost:3000/auth/callback'
```

### 2. Validate State Parameter

Prevent CSRF attacks by verifying the state parameter:

```javascript
// Generate and store state
const state = generateState();
sessionStorage.setItem('oauth_state', state);

// In callback:
const receivedState = new URLSearchParams(window.location.search).get('state');
const expectedState = sessionStorage.getItem('oauth_state');

if (receivedState !== expectedState) {
  throw new Error('Invalid state parameter');
}
```

### 3. Store Tokens Securely

**Frontend (SPA):**
- Use httpOnly cookies (set by backend)
- Never store tokens in localStorage (XSS vulnerable)
- Use session storage for temporary data only

**Backend:**
- Store refresh tokens in encrypted database
- Use httpOnly, secure, sameSite cookies for access tokens
- Implement token rotation

```javascript
// ✅ Good (Backend sets httpOnly cookie)
res.cookie('access_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// ❌ Bad (XSS vulnerable)
localStorage.setItem('access_token', token);
```

### 4. Use PKCE for SPAs and Mobile Apps

```typescript
// Always enable PKCE for public clients
const auth = new VeyvaultOAuth({
  clientId: 'your_client_id',
  redirectUri: 'https://yourapp.com/callback',
  usePKCE: true, // ✅ Required for SPAs
});
```

### 5. Implement Token Refresh

Don't wait for token to expire. Refresh proactively:

```javascript
// Refresh token 2 minutes before expiry
const refreshThreshold = 2 * 60 * 1000; // 2 minutes
const expiresAt = Date.now() + (expiresIn * 1000);

setTimeout(async () => {
  const newTokens = await auth.refreshAccessToken(refreshToken);
  // Save new tokens
}, expiresAt - Date.now() - refreshThreshold);
```

### 6. Validate ID Token

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://id.veyvault.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

jwt.verify(idToken, getKey, {
  issuer: 'https://id.veyvault.com',
  audience: 'your_client_id',
  algorithms: ['RS256']
}, (err, decoded) => {
  if (err) {
    console.error('Invalid ID token:', err);
  } else {
    console.log('Valid ID token:', decoded);
  }
});
```

---

## Error Handling

### Common OAuth Errors

| Error Code | Description | How to Handle |
|------------|-------------|---------------|
| `invalid_request` | Malformed request | Check request parameters |
| `unauthorized_client` | Client not authorized | Verify client ID and secret |
| `access_denied` | User denied authorization | Show friendly message, allow retry |
| `unsupported_response_type` | Invalid response_type | Use `code` for authorization code flow |
| `invalid_scope` | Invalid or unauthorized scope | Check allowed scopes in developer console |
| `server_error` | Server error | Retry after a delay |
| `temporarily_unavailable` | Service temporarily down | Retry with exponential backoff |
| `invalid_grant` | Invalid/expired authorization code | Request new authorization |
| `invalid_token` | Invalid/expired access token | Refresh token or re-authenticate |

### Error Handling Example

```typescript
try {
  const tokens = await auth.exchangeCodeForTokens(code);
} catch (error) {
  if (error.code === 'invalid_grant') {
    // Code expired, redirect to login
    window.location.href = '/login';
  } else if (error.code === 'server_error') {
    // Retry after delay
    setTimeout(() => retry(), 3000);
  } else {
    // Show error message
    showError(error.message);
  }
}
```

---

## Testing

### Test in Development

Use localhost redirect URI for development:

```javascript
const isDev = process.env.NODE_ENV === 'development';

const auth = new VeyvaultOAuth({
  clientId: process.env.VEYVAULT_CLIENT_ID,
  clientSecret: process.env.VEYVAULT_CLIENT_SECRET,
  redirectUri: isDev
    ? 'http://localhost:3000/auth/callback'
    : 'https://yourapp.com/auth/callback',
});
```

### Mock OAuth for Unit Tests

```typescript
// __mocks__/@veyvault/oauth-sdk.ts
export class VeyvaultOAuth {
  async getUserInfo() {
    return {
      sub: 'test_user_123',
      email: 'test@example.com',
      name: 'Test User',
      convey_id: 'test@convey',
    };
  }
  
  async exchangeCodeForTokens() {
    return {
      access_token: 'mock_access_token',
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: 'mock_refresh_token',
    };
  }
}
```

---

## Support

- **Documentation**: https://developers.veyvault.com/docs
- **API Reference**: https://developers.veyvault.com/api
- **GitHub**: https://github.com/rei-k/world-address
- **Discord**: https://discord.gg/veyvault
- **Email**: dev@veyvault.com

---

## Changelog

### v1.0.0 (2025-12-08)

- ✨ Initial release
- OAuth 2.0 / OpenID Connect support
- QR code authentication
- PKCE support
- React, Vue, and vanilla JS SDKs
- Zero-Knowledge Proof address sharing
- ConveyID integration

---

**Made with ❤️ by Veyvault Team**
