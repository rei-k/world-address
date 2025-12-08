# Migrating from Firebase Auth to Vey Authentication

This guide will help you migrate your authentication system from Firebase Authentication to Vey's WebAuthn-based passwordless authentication.

## Overview

Vey provides modern, passwordless authentication using WebAuthn/FIDO2, offering:
- **Enhanced Security**: Biometric authentication (Face ID, Touch ID, Windows Hello)
- **Better UX**: No passwords to remember or reset
- **Privacy-First**: Zero-knowledge proof protocol for address verification
- **Cost Effective**: No Firebase pricing tiers
- **Offline-First**: Works without constant Firebase connection

## Comparison Table

| Feature | Firebase Auth | Vey |
|---------|---------------|-----|
| **Authentication Method** | Email/Password, Social, Phone, Anonymous | WebAuthn/FIDO2, Biometrics |
| **Password Management** | Required (reset flows via email) | Not needed (passwordless) |
| **Biometric Support** | Not native | Native WebAuthn support |
| **Privacy** | Google infrastructure | Zero-knowledge proofs |
| **Pricing** | Free tier + pay-as-you-go | Flat rate/self-hosted |
| **Dependencies** | Firebase SDK (~300KB+) | Vey SDK (~50KB) |
| **Offline Support** | Limited | Full support |
| **Address Verification** | External service needed | Built-in with ZKP |
| **Vendor Lock-in** | High (Google ecosystem) | Low (open standards) |

## Migration Steps

### Step 1: Install Vey SDK

```bash
npm install @vey/core
# or
yarn add @vey/core
```

### Step 2: Update Authentication Flow

#### Firebase Auth (Before)

```javascript
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign up
const userCredential = await createUserWithEmailAndPassword(
  auth, 
  email, 
  password
);

// Sign in
const userCredential = await signInWithEmailAndPassword(
  auth, 
  email, 
  password
);

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User signed in:', user.uid);
  } else {
    console.log('User signed out');
  }
});
```

#### Vey WebAuthn (After)

```javascript
import { createWebAuthnClient } from '@vey/core';

const webauthn = createWebAuthnClient({
  rpName: 'Your App Name',
  rpId: 'yourdomain.com',
  userVerification: 'preferred'
});

// Register new user (replaces createUserWithEmailAndPassword)
async function registerUser(email, displayName) {
  // Generate user ID (you can use Firebase-style UID if needed)
  const userId = generateUserId(); // e.g., crypto.randomUUID()
  
  const registration = await webauthn.register(
    userId,
    email,
    displayName
  );

  // Send to backend for verification and storage
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...registration, email, displayName })
  });
  
  const { success, session } = await response.json();
  if (success) {
    localStorage.setItem('session', JSON.stringify(session));
    return session;
  }
  throw new Error('Registration failed');
}

// Authenticate user (replaces signInWithEmailAndPassword)
async function signIn() {
  const authentication = await webauthn.authenticate();

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authentication)
  });

  const { success, session } = await response.json();
  if (success) {
    localStorage.setItem('session', JSON.stringify(session));
    return session;
  }
  throw new Error('Authentication failed');
}

// Session state management (replaces onAuthStateChanged)
function getSession() {
  const session = localStorage.getItem('session');
  return session ? JSON.parse(session) : null;
}

async function checkSession() {
  const response = await fetch('/api/auth/session', {
    credentials: 'include'
  });
  const { authenticated, user } = await response.json();
  return authenticated ? user : null;
}
```

### Step 3: Update Backend Implementation

#### Firebase Admin SDK (Before)

```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Verify ID token
app.post('/api/protected', async (req, res) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    res.json({ uid, data: 'protected data' });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

#### Vey WebAuthn Backend (After)

```javascript
const {
  verifyRegistrationResponse,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const crypto = require('crypto');

// Database to store credentials (replace Firestore)
const db = require('./database'); // Your database solution

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
    // Verify registration
    const verification = await verifyRegistrationResponse({
      response: {
        id: credentialId,
        rawId: credentialId,
        response: {
          attestationObject,
          clientDataJSON
        },
        type: 'public-key'
      },
      expectedChallenge: req.session.challenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN || 'https://yourdomain.com',
      expectedRPID: process.env.RP_ID || 'yourdomain.com'
    });

    if (verification.verified) {
      // Create user record (replaces Firebase Auth user)
      const userId = crypto.randomUUID();
      await db.users.create({
        id: userId,
        email,
        displayName,
        createdAt: new Date()
      });

      // Store credential
      await db.credentials.create({
        id: credentialId,
        userId,
        publicKey,
        counter: verification.registrationInfo.counter,
        createdAt: new Date()
      });

      // Create session
      req.session.userId = userId;
      req.session.email = email;

      res.json({ 
        success: true, 
        session: { userId, email, displayName } 
      });
    } else {
      res.status(400).json({ error: 'Verification failed' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { credentialId, authenticatorData, clientDataJSON, signature } = req.body;
  
  try {
    // Get credential from database
    const credential = await db.credentials.findById(credentialId);
    if (!credential) {
      return res.status(401).json({ error: 'Credential not found' });
    }

    // Verify authentication
    const verification = await verifyAuthenticationResponse({
      response: {
        id: credentialId,
        rawId: credentialId,
        response: {
          authenticatorData,
          clientDataJSON,
          signature
        },
        type: 'public-key'
      },
      expectedChallenge: req.session.challenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN || 'https://yourdomain.com',
      expectedRPID: process.env.RP_ID || 'yourdomain.com',
      authenticator: {
        credentialID: Buffer.from(credential.id, 'base64url'),
        credentialPublicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: credential.counter
      }
    });

    if (verification.verified) {
      // Update counter
      await db.credentials.updateCounter(
        credentialId, 
        verification.authenticationInfo.newCounter
      );

      // Get user
      const user = await db.users.findById(credential.userId);

      // Create session
      req.session.userId = user.id;
      req.session.email = user.email;

      res.json({ 
        success: true, 
        session: { 
          userId: user.id, 
          email: user.email, 
          displayName: user.displayName 
        } 
      });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Session check endpoint (replaces Firebase token refresh)
app.get('/api/auth/session', async (req, res) => {
  if (req.session?.userId) {
    const user = await db.users.findById(req.session.userId);
    res.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.json({ success: true });
    }
  });
});
```

### Step 4: Migrate User Data

You have two migration strategies:

#### Option A: Export and Import (Recommended for small user bases)

```javascript
// 1. Export Firebase users
const admin = require('firebase-admin');

async function exportFirebaseUsers() {
  const users = [];
  let nextPageToken;
  
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    users.push(...result.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
      createdAt: user.metadata.creationTime
    })));
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  
  return users;
}

// 2. Migrate to new database
async function migrateUsers() {
  const firebaseUsers = await exportFirebaseUsers();
  
  for (const user of firebaseUsers) {
    await db.users.create({
      id: user.uid, // Keep Firebase UID for compatibility
      email: user.email,
      displayName: user.displayName,
      createdAt: new Date(user.createdAt),
      needsWebAuthnSetup: true // Flag for migration
    });
  }
  
  console.log(`Migrated ${firebaseUsers.length} users`);
}
```

#### Option B: Gradual Migration (Recommended for large user bases)

```javascript
// Dual authentication during migration period
app.post('/api/auth/login-migration', async (req, res) => {
  const { email, password, useWebAuthn } = req.body;
  
  if (useWebAuthn) {
    // Use Vey WebAuthn authentication
    return handleWebAuthnAuth(req, res);
  } else {
    // Still allow Firebase authentication during migration
    try {
      // Verify with Firebase
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Prompt user to set up WebAuthn
      res.json({
        success: true,
        needsWebAuthnSetup: true,
        userId: userRecord.uid,
        email: userRecord.email
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
});

// WebAuthn setup for existing users
app.post('/api/auth/setup-webauthn', async (req, res) => {
  const { userId, credentialId, publicKey } = req.body;
  
  // Verify user exists in Firebase
  const userRecord = await admin.auth().getUser(userId);
  
  // Migrate user to Vey
  await db.users.create({
    id: userId,
    email: userRecord.email,
    displayName: userRecord.displayName,
    createdAt: new Date()
  });
  
  // Store WebAuthn credential
  await db.credentials.create({
    id: credentialId,
    userId,
    publicKey,
    counter: 0,
    createdAt: new Date()
  });
  
  res.json({ success: true });
});
```

### Step 5: Replace Firebase Features

#### User Profile Management

**Firebase (Before):**
```javascript
// Update profile
await updateProfile(auth.currentUser, {
  displayName: 'New Name',
  photoURL: 'https://example.com/photo.jpg'
});

// Update email
await updateEmail(auth.currentUser, 'newemail@example.com');
```

**Vey (After):**
```javascript
// Update profile
await fetch('/api/user/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    displayName: 'New Name',
    photoURL: 'https://example.com/photo.jpg'
  })
});

// Update email (requires re-registration)
const newRegistration = await webauthn.register(
  userId,
  'newemail@example.com',
  displayName
);

await fetch('/api/user/email', {
  method: 'PUT',
  body: JSON.stringify({ ...newRegistration, email: 'newemail@example.com' })
});
```

#### Email Verification

**Firebase:** Built-in email verification
**Vey:** Implement custom email verification

```javascript
// Backend: Send verification email
const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store token
  await db.verificationTokens.create({
    userId,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
  
  // Send email
  const transporter = nodemailer.createTransport(emailConfig);
  await transporter.sendMail({
    from: 'noreply@yourdomain.com',
    to: email,
    subject: 'Verify your email',
    html: `Click <a href="https://yourdomain.com/verify?token=${token}">here</a> to verify your email.`
  });
}

// Verification endpoint
app.get('/api/auth/verify', async (req, res) => {
  const { token } = req.query;
  
  const verification = await db.verificationTokens.findByToken(token);
  if (!verification || verification.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  await db.users.update(verification.userId, { emailVerified: true });
  await db.verificationTokens.delete(token);
  
  res.redirect('/dashboard?verified=true');
});
```

## Best Practices

### 1. Feature Parity Checklist

Ensure all Firebase features are replaced:

- [ ] User registration → WebAuthn registration
- [ ] User login → WebAuthn authentication
- [ ] Password reset → Not needed (passwordless)
- [ ] Email verification → Custom implementation
- [ ] User profile updates → Custom API endpoints
- [ ] Session management → Server-side sessions
- [ ] Multi-device support → Multiple WebAuthn credentials

### 2. Database Migration

Choose a database solution to replace Firestore:

```javascript
// Example with PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create tables
await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS credentials (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    counter BIGINT DEFAULT 0,
    device_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
  );
`);
```

### 3. Environment Variables

Update your environment configuration:

```bash
# .env file

# Remove Firebase config
# FIREBASE_API_KEY=...
# FIREBASE_AUTH_DOMAIN=...

# Add Vey config
RP_NAME=Your App Name
RP_ID=yourdomain.com
EXPECTED_ORIGIN=https://yourdomain.com
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
SESSION_SECRET=your-secret-key-here
```

### 4. Browser Compatibility

Firebase works everywhere, but WebAuthn requires modern browsers:

```javascript
import { isWebAuthnSupported } from '@vey/core';

if (!isWebAuthnSupported()) {
  // Show upgrade message or use fallback
  showMessage('Please upgrade your browser to use biometric authentication');
  // Or provide magic link fallback
  showMagicLinkOption();
}
```

### 5. Testing

Test thoroughly before removing Firebase:

```javascript
// Test WebAuthn registration
describe('WebAuthn Registration', () => {
  it('should register new user', async () => {
    const registration = await webauthn.register(
      'user-123',
      'user@example.com',
      'Test User'
    );
    expect(registration.credentialId).toBeDefined();
  });
});

// Test authentication
describe('WebAuthn Authentication', () => {
  it('should authenticate existing user', async () => {
    const authentication = await webauthn.authenticate();
    expect(authentication.credentialId).toBeDefined();
  });
});
```

## Migration Checklist

- [ ] Install `@vey/core` package
- [ ] Set up database (replacing Firestore)
- [ ] Implement WebAuthn registration endpoint
- [ ] Implement WebAuthn authentication endpoint
- [ ] Migrate user data from Firebase
- [ ] Replace email verification system
- [ ] Update user profile management
- [ ] Implement session management
- [ ] Test registration flow
- [ ] Test authentication flow
- [ ] Test on multiple browsers/devices
- [ ] Set up monitoring and logging
- [ ] Remove Firebase dependencies
- [ ] Update environment variables

## Common Issues and Solutions

### Issue: "Cannot access Firebase user data"

**Solution**: Export data before migration:

```javascript
// Use Firebase Admin SDK to export all user data
const users = await admin.auth().listUsers(1000);
const userData = users.users.map(u => ({
  uid: u.uid,
  email: u.email,
  displayName: u.displayName
}));
fs.writeFileSync('users-export.json', JSON.stringify(userData, null, 2));
```

### Issue: "WebAuthn not working on mobile"

**Solution**: Ensure proper RPID and origin configuration:

```javascript
// Mobile requires exact domain match
const webauthn = createWebAuthnClient({
  rpName: 'Your App',
  rpId: 'yourdomain.com', // Not 'www.yourdomain.com'
  userVerification: 'preferred'
});
```

### Issue: "Users can't sign in on different devices"

**Solution**: Allow multiple credentials per user:

```javascript
// Let users register multiple devices
const credentials = await db.credentials.findByUserId(userId);
console.log(`User has ${credentials.length} registered devices`);
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
