# Migrating from Okta to Vey Authentication

This guide will help you migrate your authentication system from Okta to Vey's WebAuthn-based passwordless authentication.

## Overview

Vey provides modern, passwordless authentication using WebAuthn/FIDO2, offering:
- **Enhanced Security**: Biometric authentication (Face ID, Touch ID, Windows Hello)
- **Better UX**: No passwords to remember or reset
- **Privacy-First**: Zero-knowledge proof protocol for address verification
- **Cost Effective**: No per-user licensing costs like Okta
- **Simplified Architecture**: No complex federation or IdP setup

## Comparison Table

| Feature | Okta | Vey |
|---------|------|-----|
| **Authentication Method** | Username/Password, SAML, OIDC, MFA | WebAuthn/FIDO2, Biometrics |
| **Password Management** | Required (complex policies) | Not needed (passwordless) |
| **Biometric Support** | Via Okta Verify app | Native WebAuthn support |
| **Privacy** | Centralized identity provider | Zero-knowledge proofs |
| **Pricing Model** | Per user/month | Flat rate/self-hosted |
| **Implementation** | Complex (OIDC/SAML flows) | Simple (Web APIs) |
| **Enterprise Features** | SSO, Directory sync, MFA | Biometrics, Multi-device |
| **SDK Size** | ~500KB+ | ~50KB core |
| **Setup Complexity** | High | Low-Medium |

## Migration Steps

### Step 1: Install Vey SDK

```bash
npm install @vey/core
# or
yarn add @vey/core
```

### Step 2: Update Authentication Flow

#### Okta Authentication (Before)

```javascript
import { OktaAuth } from '@okta/okta-auth-js';

const oktaAuth = new OktaAuth({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/callback',
  scopes: ['openid', 'profile', 'email']
});

// Login
await oktaAuth.signInWithRedirect();

// Handle callback
const { tokens } = await oktaAuth.token.parseFromUrl();
oktaAuth.tokenManager.setTokens(tokens);

// Get user info
const user = await oktaAuth.getUser();

// Check authentication
const isAuthenticated = await oktaAuth.isAuthenticated();
```

#### Vey WebAuthn (After)

```javascript
import { createWebAuthnClient } from '@vey/core';

const webauthn = createWebAuthnClient({
  rpName: 'Your App Name',
  rpId: 'yourdomain.com',
  userVerification: 'preferred'
});

// Register new user
async function register(email, displayName) {
  const userId = generateUserId();
  
  const registration = await webauthn.register(
    userId,
    email,
    displayName
  );

  // Send to backend
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...registration, email, displayName })
  });

  return await response.json();
}

// Login
async function login() {
  const authentication = await webauthn.authenticate();

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authentication)
  });

  return await response.json();
}

// Check authentication (server-side session)
async function isAuthenticated() {
  const response = await fetch('/api/auth/session', {
    credentials: 'include'
  });
  const { authenticated } = await response.json();
  return authenticated;
}
```

### Step 3: Update Backend Verification

#### Okta Token Verification (Before)

```javascript
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}'
});

// Middleware to verify Okta token
async function verifyOktaToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  try {
    const jwt = await oktaJwtVerifier.verifyAccessToken(token, 'api://default');
    req.jwt = jwt;
    req.user = {
      uid: jwt.claims.uid,
      email: jwt.claims.sub
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/api/protected', verifyOktaToken, (req, res) => {
  res.json({ user: req.user });
});
```

#### Vey WebAuthn Verification (After)

```javascript
const {
  verifyRegistrationResponse,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  const { 
    credentialId, 
    publicKey, 
    attestationObject, 
    clientDataJSON,
    email,
    displayName 
  } = req.body;

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
      // Create user
      const userId = crypto.randomUUID();
      await db.users.create({
        id: userId,
        email,
        displayName,
        emailVerified: false,
        createdAt: new Date()
      });

      // Store credential
      await db.credentials.create({
        id: credentialId,
        userId,
        publicKey,
        counter: verification.registrationInfo.counter
      });

      // Create session
      req.session.userId = userId;
      req.session.email = email;

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
      await db.credentials.updateCounter(
        credentialId,
        verification.authenticationInfo.newCounter
      );

      const user = await db.users.findById(credential.userId);
      req.session.userId = user.id;
      req.session.email = user.email;

      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Session middleware (replaces Okta token verification)
async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = await db.users.findById(req.session.userId);
  next();
}

app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

### Step 4: Migrate User Data

#### Export Okta Users

```javascript
const okta = require('@okta/okta-sdk-nodejs');

const client = new okta.Client({
  orgUrl: 'https://{yourOktaDomain}',
  token: '{apiToken}'
});

async function exportOktaUsers() {
  const users = [];
  
  await client.userApi.listUsers().each(user => {
    users.push({
      id: user.id,
      email: user.profile.email,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      displayName: `${user.profile.firstName} ${user.profile.lastName}`,
      status: user.status,
      createdAt: user.created
    });
  });

  console.log(`Exported ${users.length} users`);
  return users;
}
```

#### Import to Vey Database

```javascript
async function migrateOktaUsers() {
  const oktaUsers = await exportOktaUsers();

  for (const oktaUser of oktaUsers) {
    // Only migrate active users
    if (oktaUser.status === 'ACTIVE') {
      await db.users.create({
        id: oktaUser.id, // Keep Okta ID for compatibility
        email: oktaUser.email,
        displayName: oktaUser.displayName,
        firstName: oktaUser.firstName,
        lastName: oktaUser.lastName,
        createdAt: new Date(oktaUser.createdAt),
        needsWebAuthnSetup: true
      });
    }
  }

  console.log('Migration complete');
}
```

### Step 5: Replace Okta Features

#### SSO (Single Sign-On)

**Okta:** SAML/OIDC federation
**Vey:** Shared session across subdomains

```javascript
// Set session cookie for all subdomains
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    domain: '.yourdomain.com', // Shared across *.yourdomain.com
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

#### Group/Role Management

**Okta:** Built-in groups and roles
**Vey:** Custom implementation

```javascript
// Database schema
await pool.query(`
  CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    permissions JSONB
  );

  CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
  );
`);

// Assign role to user
async function assignRole(userId, roleName) {
  const role = await db.roles.findByName(roleName);
  await db.userRoles.create({ userId, roleId: role.id });
}

// Check user permissions
async function hasPermission(userId, permission) {
  const roles = await db.userRoles.findByUserId(userId);
  for (const role of roles) {
    if (role.permissions.includes(permission)) {
      return true;
    }
  }
  return false;
}

// Middleware
function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hasPermission = await hasPermission(req.session.userId, permission);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

app.get('/api/admin', requirePermission('admin:read'), (req, res) => {
  res.json({ data: 'admin data' });
});
```

#### MFA (Multi-Factor Authentication)

**Okta:** SMS, Email, Okta Verify
**Vey:** WebAuthn IS multi-factor (biometric + device)

WebAuthn inherently provides:
- **Something you have**: The device with the credential
- **Something you are**: Biometric verification (fingerprint, face)

```javascript
// Enforce strict user verification for sensitive operations
const webauthn = createWebAuthnClient({
  rpName: 'Your App',
  rpId: 'yourdomain.com',
  userVerification: 'required' // Enforce biometric/PIN
});

// For extra security, require re-authentication
async function requireReauth(req, res, next) {
  if (!req.session?.reauthAt || Date.now() - req.session.reauthAt > 5 * 60 * 1000) {
    return res.status(401).json({ error: 'Re-authentication required' });
  }
  next();
}

app.post('/api/sensitive', requireReauth, (req, res) => {
  // Sensitive operation
});
```

## Best Practices

### 1. Directory Sync Replacement

If using Okta for Active Directory/LDAP sync:

```javascript
// Implement LDAP sync with ldapjs
const ldap = require('ldapjs');

const client = ldap.createClient({
  url: 'ldap://ldap.example.com'
});

async function syncLDAPUsers() {
  const opts = {
    filter: '(objectClass=person)',
    scope: 'sub',
    attributes: ['mail', 'cn', 'displayName']
  };

  client.search('ou=users,dc=example,dc=com', opts, (err, res) => {
    res.on('searchEntry', async (entry) => {
      const user = entry.pojo;
      await db.users.upsert({
        email: user.attributes.mail,
        displayName: user.attributes.displayName,
        syncedFromLDAP: true
      });
    });
  });
}

// Run sync periodically
setInterval(syncLDAPUsers, 60 * 60 * 1000); // Every hour
```

### 2. Audit Logging

Replace Okta's system log:

```javascript
// Log authentication events
async function logAuthEvent(userId, eventType, metadata = {}) {
  await db.auditLogs.create({
    userId,
    eventType, // 'login', 'logout', 'register', 'failed_login'
    metadata: JSON.stringify(metadata),
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    timestamp: new Date()
  });
}

// Use in authentication flow
app.post('/api/auth/login', async (req, res) => {
  try {
    const authentication = await authenticateUser(req.body);
    
    await logAuthEvent(authentication.userId, 'login', {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true });
  } catch (error) {
    await logAuthEvent(null, 'failed_login', {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      error: error.message
    });

    res.status(401).json({ error: 'Authentication failed' });
  }
});
```

### 3. Session Management

Replace Okta's session management:

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Use Redis for distributed sessions
const redisClient = createClient({
  url: process.env.REDIS_URL
});
redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### 4. API Access Tokens

Replace Okta API tokens:

```javascript
const jwt = require('jsonwebtoken');

// Generate API token
function generateAPIToken(userId, expiresIn = '7d') {
  return jwt.sign(
    { userId, type: 'api' },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

// Verify API token
function verifyAPIToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware
function requireAPIToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  const decoded = verifyAPIToken(token);
  if (!decoded || decoded.type !== 'api') {
    return res.status(401).json({ error: 'Invalid API token' });
  }

  req.userId = decoded.userId;
  next();
}

app.get('/api/data', requireAPIToken, (req, res) => {
  res.json({ data: 'API data' });
});
```

## Migration Checklist

- [ ] Install `@vey/core` package
- [ ] Export Okta users and groups
- [ ] Set up database for users and credentials
- [ ] Implement WebAuthn registration endpoint
- [ ] Implement WebAuthn authentication endpoint
- [ ] Implement role-based access control
- [ ] Set up session management (with Redis)
- [ ] Implement audit logging
- [ ] Migrate SSO to shared sessions
- [ ] Create API token system
- [ ] Test registration flow
- [ ] Test authentication flow
- [ ] Test authorization/permissions
- [ ] Update environment variables
- [ ] Remove Okta dependencies

## Common Issues and Solutions

### Issue: "Users expect SSO across multiple apps"

**Solution**: Use shared session cookies:

```javascript
// Set cookie domain to parent domain
app.use(session({
  cookie: {
    domain: '.yourdomain.com', // Works for app1.yourdomain.com, app2.yourdomain.com
    secure: true
  }
}));
```

### Issue: "Need to enforce password policies"

**Solution**: Not applicable with WebAuthn (passwordless)

WebAuthn replaces password policies with:
- Device possession (something you have)
- Biometric verification (something you are)
- Optional PIN (something you know)

### Issue: "Missing directory sync"

**Solution**: Implement LDAP/AD sync or use user provisioning API:

```javascript
// Provisioning API endpoint
app.post('/api/provision/user', requireAPIToken, async (req, res) => {
  const { email, displayName, roles } = req.body;
  
  const user = await db.users.create({
    id: crypto.randomUUID(),
    email,
    displayName,
    provisionedBy: 'api',
    createdAt: new Date()
  });

  // Assign roles
  for (const roleName of roles) {
    await assignRole(user.id, roleName);
  }

  res.json({ success: true, userId: user.id });
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
