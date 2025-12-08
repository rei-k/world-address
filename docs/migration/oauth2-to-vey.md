# Migrating from OAuth2 to Vey Authentication

This guide will help you migrate from any OAuth2-based authentication system to Vey's WebAuthn-based passwordless authentication.

## Overview

Vey provides modern, passwordless authentication using WebAuthn/FIDO2, offering:
- **Enhanced Security**: Biometric authentication (Face ID, Touch ID, Windows Hello)
- **Simpler Flow**: No complex redirect-based flows
- **Privacy-First**: Zero-knowledge proof protocol
- **No Third-Party Dependency**: Self-hosted authentication
- **Better Performance**: No external API calls during auth

## OAuth2 vs Vey Comparison

| Feature | OAuth2 | Vey WebAuthn |
|---------|--------|--------------|
| **Flow Type** | Redirect-based (authorization code, implicit) | API-based (Web Crypto) |
| **User Experience** | Multiple redirects, consent screens | Single biometric prompt |
| **Credentials** | Passwords, social logins | Biometric, security keys |
| **Token Management** | Access tokens, refresh tokens, expiry | Server-side sessions |
| **PKCE Required** | Yes (for SPAs) | Not applicable |
| **Redirect URIs** | Must be registered | Not needed |
| **State Management** | CSRF tokens, state params | Challenge-response |
| **Backend Complexity** | Token validation, refresh logic | Credential verification |
| **Privacy** | Third-party IdP knows user activity | Self-hosted, no tracking |

## Migration Steps

### Step 1: Install Vey SDK

```bash
npm install @vey/core
# or
yarn add @vey/core
```

### Step 2: Replace OAuth2 Flow

#### OAuth2 Authorization Code Flow (Before)

```javascript
// Step 1: Redirect to authorization endpoint
const authUrl = new URL('https://oauth-provider.com/authorize');
authUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID');
authUrl.searchParams.set('redirect_uri', 'https://yourapp.com/callback');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('state', generateState());
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

window.location.href = authUrl.toString();

// Step 2: Handle callback
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

// Verify state
if (state !== storedState) {
  throw new Error('Invalid state');
}

// Step 3: Exchange code for tokens
const tokenResponse = await fetch('https://oauth-provider.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'https://yourapp.com/callback',
    client_id: 'YOUR_CLIENT_ID',
    code_verifier: codeVerifier
  })
});

const { access_token, refresh_token, id_token } = await tokenResponse.json();

// Step 4: Get user info
const userResponse = await fetch('https://oauth-provider.com/userinfo', {
  headers: { Authorization: `Bearer ${access_token}` }
});

const user = await userResponse.json();
```

#### Vey WebAuthn Flow (After)

```javascript
import { createWebAuthnClient } from '@vey/core';

const webauthn = createWebAuthnClient({
  rpName: 'Your App Name',
  rpId: 'yourapp.com',
  userVerification: 'preferred'
});

// Single-step authentication (no redirects!)
async function login() {
  try {
    // Get challenge from your server
    const { challenge } = await fetch('/api/auth/challenge').then(r => r.json());
    const challengeBuffer = base64URLToArrayBuffer(challenge);

    // Authenticate with biometrics
    const authentication = await webauthn.authenticate(challengeBuffer);

    // Verify with your server
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authentication)
    });

    const { success, user } = await response.json();
    if (success) {
      // User is authenticated - session is set server-side
      return user;
    }
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
}

// Helper function
function base64URLToArrayBuffer(base64URL) {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
```

### Step 3: Update Backend Token Validation

#### OAuth2 Token Validation (Before)

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Create JWKS client
const client = jwksClient({
  jwksUri: 'https://oauth-provider.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Middleware to validate JWT
async function validateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  jwt.verify(token, getKey, {
    audience: 'YOUR_CLIENT_ID',
    issuer: 'https://oauth-provider.com',
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
}

// Refresh token flow
app.post('/api/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  const response = await fetch('https://oauth-provider.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET'
    })
  });

  const tokens = await response.json();
  res.json(tokens);
});
```

#### Vey WebAuthn Validation (After)

```javascript
const {
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} = require('@simplewebauthn/server');
const crypto = require('crypto');

// Challenge generation
app.post('/api/auth/challenge', (req, res) => {
  const challenge = crypto.randomBytes(32);
  req.session.challenge = challenge.toString('base64url');
  res.json({ challenge: req.session.challenge });
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  const { credentialId, publicKey, attestationObject, clientDataJSON, email, displayName } = req.body;

  try {
    const verification = await verifyRegistrationResponse({
      response: {
        id: credentialId,
        rawId: credentialId,
        response: { attestationObject, clientDataJSON },
        type: 'public-key'
      },
      expectedChallenge: req.session.challenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN,
      expectedRPID: process.env.RP_ID
    });

    if (verification.verified) {
      const userId = crypto.randomUUID();
      
      await db.users.create({ id: userId, email, displayName });
      await db.credentials.create({
        id: credentialId,
        userId,
        publicKey,
        counter: verification.registrationInfo.counter
      });

      req.session.userId = userId;
      res.json({ success: true, userId });
    } else {
      res.status(400).json({ error: 'Verification failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { credentialId, authenticatorData, clientDataJSON, signature } = req.body;

  try {
    const credential = await db.credentials.findById(credentialId);
    if (!credential) {
      return res.status(401).json({ error: 'Credential not found' });
    }

    const verification = await verifyAuthenticationResponse({
      response: {
        id: credentialId,
        rawId: credentialId,
        response: { authenticatorData, clientDataJSON, signature },
        type: 'public-key'
      },
      expectedChallenge: req.session.challenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN,
      expectedRPID: process.env.RP_ID,
      authenticator: {
        credentialID: Buffer.from(credential.id, 'base64url'),
        credentialPublicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: credential.counter
      }
    });

    if (verification.verified) {
      await db.credentials.updateCounter(credentialId, verification.authenticationInfo.newCounter);
      
      const user = await db.users.findById(credential.userId);
      req.session.userId = user.id;

      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Session middleware (replaces token validation)
async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = await db.users.findById(req.session.userId);
  next();
}

// No refresh token needed - sessions are managed server-side
app.get('/api/auth/session', async (req, res) => {
  if (req.session?.userId) {
    const user = await db.users.findById(req.session.userId);
    res.json({ authenticated: true, user });
  } else {
    res.json({ authenticated: false });
  }
});
```

### Step 4: Remove OAuth2 Dependencies

#### OAuth2 Libraries to Remove

```bash
# Remove OAuth2 client libraries
npm uninstall oauth
npm uninstall simple-oauth2
npm uninstall passport-oauth2
npm uninstall @okta/okta-auth-js
npm uninstall @auth0/auth0-spa-js

# Remove JWT validation libraries
npm uninstall jsonwebtoken
npm uninstall jwks-rsa

# Remove PKCE libraries
npm uninstall pkce-challenge
```

#### Install WebAuthn Libraries

```bash
# Client-side (already included in @vey/core)
npm install @vey/core

# Server-side
npm install @simplewebauthn/server
npm install express-session
npm install connect-redis redis  # For session storage
```

### Step 5: Update Environment Variables

#### OAuth2 Environment Variables (Remove)

```bash
# .env (BEFORE - remove these)
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
OAUTH_AUTHORIZATION_URL=...
OAUTH_TOKEN_URL=...
OAUTH_USERINFO_URL=...
OAUTH_REDIRECT_URI=...
OAUTH_SCOPE=...
JWKS_URI=...
```

#### Vey Environment Variables (Add)

```bash
# .env (AFTER - add these)
RP_NAME=Your App Name
RP_ID=yourapp.com
EXPECTED_ORIGIN=https://yourapp.com
SESSION_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
```

### Step 6: Simplify Frontend Logic

#### OAuth2 Frontend (Before)

Complex state management, multiple screens:

```javascript
// Manage OAuth state
const state = {
  codeVerifier: null,
  codeChallenge: null,
  state: null,
  nonce: null,
  accessToken: null,
  refreshToken: null,
  idToken: null,
  tokenExpiry: null
};

// Handle login
async function login() {
  // Generate PKCE
  state.codeVerifier = generateCodeVerifier();
  state.codeChallenge = await generateCodeChallenge(state.codeVerifier);
  state.state = generateState();
  
  // Store in sessionStorage
  sessionStorage.setItem('oauth_state', JSON.stringify(state));
  
  // Redirect
  window.location.href = buildAuthUrl(state);
}

// Handle callback
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const savedState = JSON.parse(sessionStorage.getItem('oauth_state'));
  
  // Validate state
  if (params.get('state') !== savedState.state) {
    throw new Error('State mismatch');
  }
  
  // Exchange code for token
  const tokens = await exchangeCodeForTokens(params.get('code'), savedState.codeVerifier);
  
  // Store tokens
  sessionStorage.setItem('access_token', tokens.access_token);
  sessionStorage.setItem('refresh_token', tokens.refresh_token);
  
  // Decode ID token
  const idToken = parseJwt(tokens.id_token);
  
  // Get user info
  const user = await getUserInfo(tokens.access_token);
}

// Auto-refresh tokens
setInterval(async () => {
  if (Date.now() > state.tokenExpiry - 60000) {
    await refreshAccessToken();
  }
}, 60000);
```

#### Vey Frontend (After)

Simple, straightforward:

```javascript
import { createWebAuthnClient } from '@vey/core';

const webauthn = createWebAuthnClient({
  rpName: 'Your App',
  rpId: 'yourapp.com'
});

// Handle login (single function, no redirects)
async function login() {
  try {
    const authentication = await webauthn.authenticate();
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authentication),
      credentials: 'include' // Important for cookies
    });

    const { success, user } = await response.json();
    
    if (success) {
      // User is logged in - session is managed server-side
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
}

// Check session (no token refresh needed)
async function checkSession() {
  const response = await fetch('/api/auth/session', {
    credentials: 'include'
  });
  const { authenticated, user } = await response.json();
  return authenticated ? user : null;
}

// No auto-refresh needed!
```

## Migration Patterns

### Pattern 1: Social Login Replacement

#### OAuth2 Social Login (Before)

```javascript
// Google OAuth2
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=${GOOGLE_CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  response_type=code&
  scope=openid%20profile%20email&
  state=${state}`;

// GitHub OAuth2
const githubAuthUrl = `https://github.com/login/oauth/authorize?
  client_id=${GITHUB_CLIENT_ID}&
  redirect_uri=${REDIRECT_URI}&
  scope=user:email&
  state=${state}`;
```

#### Vey Unified Login (After)

```javascript
// Single authentication method for all users
async function login() {
  const authentication = await webauthn.authenticate();
  // Verify with your backend
}

// Optional: Allow email as username for familiarity
const registration = await webauthn.register(
  userId,
  'user@gmail.com', // Can use email from any provider
  displayName
);
```

### Pattern 2: Scope/Permission Migration

#### OAuth2 Scopes (Before)

```javascript
const scopes = ['openid', 'profile', 'email', 'read:user', 'write:data'];
const authUrl = `${OAUTH_URL}?scope=${scopes.join(' ')}`;
```

#### Vey Permissions (After)

```javascript
// Implement custom permission system
async function checkPermission(userId, resource, action) {
  const user = await db.users.findById(userId);
  const permissions = await db.permissions.findByUserId(userId);
  
  return permissions.some(p => 
    p.resource === resource && p.action === action
  );
}

// Use in middleware
function requirePermission(resource, action) {
  return async (req, res, next) => {
    const hasPermission = await checkPermission(
      req.session.userId,
      resource,
      action
    );
    
    if (hasPermission) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };
}

app.get('/api/users', requirePermission('users', 'read'), (req, res) => {
  // Handler
});
```

### Pattern 3: API Access

#### OAuth2 Bearer Tokens (Before)

```javascript
// Client
const response = await fetch('/api/data', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});
```

#### Vey Session-Based (After)

```javascript
// Client - use session cookies
const response = await fetch('/api/data', {
  credentials: 'include' // Automatically sends session cookie
});

// Or generate API tokens for machine-to-machine
const apiToken = await generateAPIToken(userId);
const response = await fetch('/api/data', {
  headers: {
    Authorization: `Bearer ${apiToken}`
  }
});
```

## Best Practices

### 1. Browser Compatibility

Always check WebAuthn support:

```javascript
import { isWebAuthnSupported } from '@vey/core';

if (!isWebAuthnSupported()) {
  // Fallback to magic link or show upgrade message
  console.warn('WebAuthn not supported');
}
```

### 2. Session Security

Use secure session configuration:

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // Prevent XSS
    sameSite: 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### 3. Challenge Security

Always generate challenges server-side:

```javascript
// ✅ Good: Server-side challenge generation
app.post('/api/auth/challenge', (req, res) => {
  const challenge = crypto.randomBytes(32).toString('base64url');
  req.session.challenge = challenge;
  res.json({ challenge });
});

// ❌ Bad: Client-side challenge generation
// Never trust client-generated challenges!
```

### 4. Error Handling

Handle WebAuthn errors gracefully:

```javascript
try {
  await webauthn.authenticate();
} catch (error) {
  switch (error.name) {
    case 'NotAllowedError':
      console.log('User cancelled authentication');
      break;
    case 'NotSupportedError':
      console.log('WebAuthn not supported');
      break;
    case 'InvalidStateError':
      console.log('Authenticator already registered');
      break;
    default:
      console.error('Authentication error:', error);
  }
}
```

## Migration Checklist

- [ ] Install `@vey/core` and `@simplewebauthn/server`
- [ ] Remove OAuth2 client libraries
- [ ] Update environment variables
- [ ] Implement WebAuthn registration endpoint
- [ ] Implement WebAuthn authentication endpoint
- [ ] Set up session management
- [ ] Migrate permission/scope system
- [ ] Replace token refresh logic
- [ ] Remove redirect callback handlers
- [ ] Update frontend authentication flow
- [ ] Test on multiple browsers/devices
- [ ] Update API authentication
- [ ] Remove OAuth2 provider configuration

## Common Issues and Solutions

### Issue: "Users expect social login"

**Solution**: Social login is about convenience, not security. WebAuthn is more convenient (no password) and more secure (biometric).

Educate users:
```javascript
// Show upgrade message
const message = `
  We've upgraded to passwordless authentication using biometrics!
  
  Benefits:
  - No password to remember
  - Faster login with Face ID/Touch ID
  - More secure than passwords
  
  Set up now to continue using our service.
`;
```

### Issue: "Need to maintain OAuth2 for API access"

**Solution**: Use API tokens for machine-to-machine:

```javascript
const jwt = require('jsonwebtoken');

function generateAPIToken(userId, scopes = []) {
  return jwt.sign(
    { userId, scopes, type: 'api' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}
```

### Issue: "Lost CSRF protection from state parameter"

**Solution**: Use SameSite cookies and CSRF tokens:

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.post('/api/sensitive', csrfProtection, (req, res) => {
  // Handler
});
```

## Support and Resources

- [Vey WebAuthn API Documentation](../veyform/webauthn-api.md)
- [WebAuthn Integration Guide](./webauthn-integration.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [GitHub Repository](https://github.com/rei-k/world-address)

## Need Help?

If you encounter issues during migration:

1. Check the [troubleshooting guide](./troubleshooting.md)
2. Review [WebAuthn best practices](https://webauthn.guide/)
3. Open an issue on [GitHub](https://github.com/rei-k/world-address/issues)
