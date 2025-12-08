# Migrating from Auth0 to Vey Authentication

This guide will help you migrate your authentication system from Auth0 to Vey's WebAuthn-based passwordless authentication.

## Overview

Vey provides modern, passwordless authentication using WebAuthn/FIDO2, offering:
- **Enhanced Security**: Biometric authentication (Face ID, Touch ID, Windows Hello)
- **Better UX**: No passwords to remember or reset
- **Privacy-First**: Zero-knowledge proof protocol for address verification
- **Lower Cost**: No per-user pricing like Auth0

## Comparison Table

| Feature | Auth0 | Vey |
|---------|-------|-----|
| **Authentication Method** | Username/Password, Social, MFA | WebAuthn/FIDO2, Biometrics |
| **Password Management** | Required (reset flows, complexity rules) | Not needed (passwordless) |
| **Biometric Support** | Via SMS/TOTP MFA only | Native WebAuthn support |
| **Privacy** | Centralized user data | Zero-knowledge proofs |
| **Pricing Model** | Per active user | Flat rate/self-hosted |
| **Address Verification** | External service needed | Built-in with ZKP |
| **SDK Size** | ~200KB+ | ~50KB core |
| **Setup Complexity** | Medium-High | Low-Medium |

## Migration Steps

### Step 1: Install Vey SDK

```bash
npm install @vey/core
# or
yarn add @vey/core
```

### Step 2: Update Authentication Flow

#### Auth0 Login (Before)

```javascript
import { Auth0Client } from '@auth0/auth0-spa-js';

const auth0 = new Auth0Client({
  domain: 'YOUR_DOMAIN.auth0.com',
  clientId: 'YOUR_CLIENT_ID',
  authorizationParams: {
    redirect_uri: window.location.origin
  }
});

// Login
await auth0.loginWithRedirect();

// Get user
const user = await auth0.getUser();
```

#### Vey WebAuthn (After)

```javascript
import { createWebAuthnClient } from '@vey/core';

const webauthn = createWebAuthnClient({
  rpName: 'Your App Name',
  rpId: 'yourdomain.com', // Your domain
  userVerification: 'preferred'
});

// Register new user (one-time)
const registration = await webauthn.register(
  userId,
  username,
  displayName
);

// Send registration to your backend for verification
await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify(registration)
});

// Authenticate existing user
const authentication = await webauthn.authenticate();

// Send authentication to your backend for verification
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(authentication)
});

const session = await response.json();
```

### Step 3: Update Backend Verification

#### Auth0 Token Verification (Before)

```javascript
const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
  audience: 'YOUR_API_IDENTIFIER',
  issuerBaseURL: 'https://YOUR_DOMAIN.auth0.com/'
});

app.get('/api/protected', checkJwt, (req, res) => {
  res.json({ user: req.auth });
});
```

#### Vey WebAuthn Verification (After)

```javascript
// Install server-side WebAuthn library
// npm install @simplewebauthn/server

const {
  verifyRegistrationResponse,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  const { credentialId, publicKey, attestationObject, clientDataJSON } = req.body;
  
  // Verify registration
  const verification = await verifyRegistrationResponse({
    response: req.body,
    expectedChallenge: req.session.challenge, // Store challenge in session
    expectedOrigin: 'https://yourdomain.com',
    expectedRPID: 'yourdomain.com'
  });

  if (verification.verified) {
    // Store credential in database
    await db.credentials.create({
      userId: req.session.userId,
      credentialId,
      publicKey,
      counter: verification.registrationInfo.counter
    });
    
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Verification failed' });
  }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { credentialId, authenticatorData, clientDataJSON, signature } = req.body;
  
  // Get stored credential from database
  const credential = await db.credentials.findByCredentialId(credentialId);
  
  // Verify authentication
  const verification = await verifyAuthenticationResponse({
    response: req.body,
    expectedChallenge: req.session.challenge,
    expectedOrigin: 'https://yourdomain.com',
    expectedRPID: 'yourdomain.com',
    authenticator: {
      credentialID: credential.credentialId,
      credentialPublicKey: credential.publicKey,
      counter: credential.counter
    }
  });

  if (verification.verified) {
    // Update counter
    await db.credentials.updateCounter(credentialId, verification.authenticationInfo.newCounter);
    
    // Create session
    req.session.userId = credential.userId;
    res.json({ success: true, userId: credential.userId });
  } else {
    res.status(401).json({ error: 'Authentication failed' });
  }
});
```

### Step 4: Migrate User Data

You have two options for migrating existing Auth0 users:

#### Option A: Gradual Migration (Recommended)

Allow users to register WebAuthn credentials on their next login:

```javascript
// After successful Auth0 login
if (!user.hasWebAuthnCredential) {
  // Prompt user to set up passwordless login
  const registration = await webauthn.register(
    user.id,
    user.email,
    user.name
  );
  
  // Store credential
  await saveCredential(registration);
  
  // Mark user as migrated
  user.hasWebAuthnCredential = true;
}
```

#### Option B: Forced Migration

Require all users to set up WebAuthn on next login:

```javascript
// Migration flow
app.get('/migrate', requireAuth0, async (req, res) => {
  res.render('migration-page', {
    userId: req.user.id,
    email: req.user.email,
    name: req.user.name
  });
});

// Frontend migration page
async function migrateToWebAuthn() {
  const registration = await webauthn.register(
    userId,
    email,
    name
  );
  
  await fetch('/api/migrate/complete', {
    method: 'POST',
    body: JSON.stringify(registration)
  });
  
  // Redirect to app
  window.location.href = '/dashboard';
}
```

### Step 5: Update Session Management

#### Auth0 Sessions (Before)

```javascript
// Check authentication
const isAuthenticated = await auth0.isAuthenticated();

// Get access token
const token = await auth0.getTokenSilently();

// Logout
await auth0.logout({ 
  returnTo: window.location.origin 
});
```

#### Vey Sessions (After)

```javascript
// Check authentication (server-side session)
const response = await fetch('/api/auth/session');
const { authenticated, user } = await response.json();

// Session is maintained server-side
// No token refresh needed for WebAuthn

// Logout
await fetch('/api/auth/logout', { method: 'POST' });
sessionStorage.clear();
window.location.href = '/';
```

## Best Practices

### 1. Browser Compatibility Check

Always check WebAuthn support before attempting registration:

```javascript
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable } from '@vey/core';

if (!isWebAuthnSupported()) {
  // Fallback to email/magic link or show upgrade message
  console.error('WebAuthn not supported');
  return;
}

const platformAvailable = await isPlatformAuthenticatorAvailable();
if (platformAvailable) {
  // User can use Face ID, Touch ID, or Windows Hello
  console.log('Platform authenticator available');
}
```

### 2. Fallback Authentication

Provide fallback options for users without WebAuthn support:

```javascript
if (isWebAuthnSupported()) {
  // Primary: WebAuthn
  showWebAuthnLogin();
} else {
  // Fallback: Magic link email
  showMagicLinkLogin();
}
```

### 3. Multiple Credentials

Allow users to register multiple devices:

```javascript
// List user's credentials
const credentials = await fetch('/api/auth/credentials').then(r => r.json());

// Add new credential
async function addDevice() {
  const registration = await webauthn.register(
    userId,
    username,
    `${displayName} - ${deviceName}`
  );
  
  await fetch('/api/auth/credentials/add', {
    method: 'POST',
    body: JSON.stringify({ ...registration, deviceName })
  });
}

// Remove credential
async function removeDevice(credentialId) {
  await fetch(`/api/auth/credentials/${credentialId}`, {
    method: 'DELETE'
  });
}
```

### 4. Challenge Generation

Always generate secure challenges on the server:

```javascript
// Backend: Generate challenge
const crypto = require('crypto');

app.post('/api/auth/challenge', (req, res) => {
  const challenge = crypto.randomBytes(32);
  req.session.challenge = challenge.toString('base64url');
  res.json({ challenge: req.session.challenge });
});

// Frontend: Get challenge before registration/authentication
const { challenge } = await fetch('/api/auth/challenge').then(r => r.json());
const challengeBuffer = Uint8Array.from(atob(challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

const registration = await webauthn.register(
  userId,
  username,
  displayName,
  challengeBuffer.buffer
);
```

### 5. Error Handling

Implement comprehensive error handling:

```javascript
try {
  const authentication = await webauthn.authenticate();
  await login(authentication);
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // User cancelled the authentication
    console.log('Authentication cancelled');
  } else if (error.name === 'InvalidStateError') {
    // Authenticator is already registered
    console.error('Credential already registered');
  } else if (error.name === 'NotSupportedError') {
    // WebAuthn not supported
    console.error('WebAuthn not supported');
  } else {
    console.error('Authentication failed:', error);
  }
}
```

## Migration Checklist

- [ ] Install `@vey/core` package
- [ ] Set up WebAuthn registration endpoint
- [ ] Set up WebAuthn authentication endpoint
- [ ] Implement challenge generation and storage
- [ ] Set up credential storage in database
- [ ] Create migration UI for existing users
- [ ] Implement browser compatibility checks
- [ ] Set up fallback authentication method
- [ ] Test registration flow on multiple devices
- [ ] Test authentication flow on multiple devices
- [ ] Update session management
- [ ] Remove Auth0 dependencies
- [ ] Update documentation and user guides

## Common Issues and Solutions

### Issue: "WebAuthn not supported"

**Solution**: Check browser compatibility and provide fallback:

```javascript
const supported = isWebAuthnSupported();
if (!supported) {
  // Show upgrade message or fallback to magic link
}
```

### Issue: "User cancelled authentication"

**Solution**: Handle gracefully and allow retry:

```javascript
try {
  await webauthn.authenticate();
} catch (error) {
  if (error.name === 'NotAllowedError') {
    showMessage('Authentication cancelled. Please try again.');
  }
}
```

### Issue: "Challenge verification failed"

**Solution**: Ensure challenges are properly stored and compared:

```javascript
// Store challenge in session when generated
req.session.challenge = challenge;

// Verify challenge matches during authentication
if (clientData.challenge !== expectedChallenge) {
  throw new Error('Challenge mismatch');
}
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
