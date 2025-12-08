# WebAuthn Integration Guide

Complete guide for integrating passwordless biometric authentication with @vey/webauthn.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Client-Side Integration](#client-side-integration)
4. [Server-Side Integration](#server-side-integration)
5. [Framework Integration](#framework-integration)
6. [Advanced Features](#advanced-features)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Migration Guide](#migration-guide)

---

## Overview

WebAuthn (Web Authentication) is a web standard for passwordless authentication using biometrics (fingerprint, Face ID, Touch ID) or security keys. The `@vey/webauthn` SDK simplifies WebAuthn integration with the Vey World Address ecosystem.

### Key Benefits

- 🔒 **Passwordless** - No passwords to remember or compromise
- 👆 **Biometric** - Fingerprint, Face ID, Touch ID support
- 🚀 **Fast** - One-tap authentication
- 🔐 **Secure** - FIDO2 certified, phishing-resistant
- 📱 **Cross-Platform** - Works on iOS, Android, desktop
- 🌐 **Standards-Based** - W3C WebAuthn specification

### Use Cases

- **User Authentication** - Replace passwords with biometrics
- **Address Verification** - Verify address ownership with biometrics
- **Transaction Signing** - Authorize shipping requests with fingerprint
- **Multi-Factor Auth** - Add biometric 2FA to existing systems

---

## Getting Started

### Prerequisites

- **HTTPS**: WebAuthn requires HTTPS (or localhost for development)
- **Modern Browser**: Chrome 67+, Safari 13+, Firefox 60+, Edge 18+
- **Supported Device**: Platform authenticator (Touch ID, Face ID, Windows Hello) or security key

### Installation

```bash
npm install @vey/webauthn
```

### Environment Setup

```env
# .env
WEBAUTHN_RP_ID=yourdomain.com
WEBAUTHN_RP_NAME=Your App Name
WEBAUTHN_ORIGIN=https://yourdomain.com
WEBAUTHN_TIMEOUT=60000
```

---

## Client-Side Integration

### Basic Setup

```typescript
import { WebAuthnClient } from '@vey/webauthn';

const client = new WebAuthnClient({
  rpId: 'veyvault.com',              // Your domain (without https://)
  rpName: 'Veyvault',                 // Your app name
  apiEndpoint: '/api/webauthn',       // Your API endpoint
  timeout: 60000,                     // 60 seconds
  userVerification: 'required',       // Require biometric/PIN
});
```

### Registration Flow

```typescript
// 1. Get challenge from server
async function registerPasskey() {
  try {
    // Request challenge from your server
    const { challenge, userId } = await fetch('/api/webauthn/register/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
      }),
    }).then(r => r.json());

    // 2. Create passkey with WebAuthn
    const result = await client.register({
      userId: userId,                      // Unique user ID
      userName: user.email,                 // User identifier (email)
      userDisplayName: user.name,           // Display name
      challenge: challenge,                 // Server challenge
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use device biometrics
        requireResidentKey: true,            // Passwordless (discoverable)
        userVerification: 'required',        // Require biometric
      },
    });

    // 3. Send credential to server for verification
    const response = await fetch('/api/webauthn/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });

    if (response.ok) {
      console.log('✅ Passkey registered successfully!');
      
      // Optional: Save passkey metadata locally
      await savePasskeyMetadata(result);
    }
  } catch (error) {
    console.error('Registration failed:', error.message);
    handleRegistrationError(error);
  }
}
```

### Authentication Flow

```typescript
// 1. Get challenge from server
async function authenticateWithPasskey() {
  try {
    // Request challenge
    const { challenge } = await fetch('/api/webauthn/auth/challenge', {
      method: 'POST',
    }).then(r => r.json());

    // 2. Authenticate with passkey
    const authResult = await client.authenticate({
      challenge: challenge,
      userVerification: 'required',
    });

    // 3. Send assertion to server
    const response = await fetch('/api/webauthn/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authResult),
    });

    const { accessToken, user } = await response.json();
    
    // 4. Store token and redirect
    localStorage.setItem('accessToken', accessToken);
    window.location.href = '/dashboard';
    
    console.log('✅ Authenticated successfully!');
  } catch (error) {
    console.error('Authentication failed:', error.message);
    handleAuthenticationError(error);
  }
}
```

### Conditional UI (Autofill)

Enable autofill for seamless authentication:

```typescript
async function enableAutofill() {
  // Check if conditional UI is supported
  const supported = await supportsConditionalUI();
  if (!supported) {
    console.log('Conditional UI not supported, using button flow');
    return;
  }

  try {
    // Get challenge
    const { challenge } = await fetch('/api/webauthn/auth/challenge', {
      method: 'POST',
    }).then(r => r.json());

    // Enable autofill authentication
    const authResult = await client.authenticateWithConditionalUI({
      challenge: challenge,
    });

    // Verify with server
    const response = await fetch('/api/webauthn/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authResult),
    });

    const { accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    
    console.log('✅ Authenticated via autofill!');
  } catch (error) {
    // User cancelled or no passkey available
    console.log('Autofill authentication cancelled');
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', enableAutofill);
```

### HTML Setup for Autofill

```html
<!-- Add autocomplete="webauthn" to enable autofill -->
<form>
  <input
    type="text"
    name="email"
    autocomplete="username webauthn"
    placeholder="Email"
  />
  <button type="button" onclick="authenticateWithPasskey()">
    Sign in with passkey
  </button>
</form>
```

---

## Server-Side Integration

### Challenge Generation

```typescript
// POST /api/webauthn/register/challenge
import { WebAuthnCrypto } from '@vey/webauthn';

export async function POST(req: Request) {
  const { email } = await req.json();
  
  // Generate random challenge
  const challenge = WebAuthnCrypto.generateChallengeBase64url();
  
  // Create or get user
  const user = await db.users.findOrCreate({ email });
  
  // Store challenge temporarily (5 minutes)
  await redis.set(
    `webauthn:challenge:${user.id}`,
    challenge,
    'EX',
    300
  );
  
  return Response.json({
    challenge,
    userId: user.id,
  });
}
```

### Registration Verification

```typescript
// POST /api/webauthn/register/verify
import { base64urlToBuffer } from '@vey/webauthn';
import cbor from 'cbor';

export async function POST(req: Request) {
  const result = await req.json();
  
  // 1. Verify challenge
  const storedChallenge = await redis.get(
    `webauthn:challenge:${result.userId}`
  );
  
  const clientData = JSON.parse(
    Buffer.from(result.response.clientDataJSON, 'base64url').toString()
  );
  
  if (clientData.challenge !== storedChallenge) {
    return Response.json({ error: 'Challenge mismatch' }, { status: 400 });
  }
  
  // 2. Verify origin
  if (clientData.origin !== process.env.WEBAUTHN_ORIGIN) {
    return Response.json({ error: 'Origin mismatch' }, { status: 400 });
  }
  
  // 3. Parse attestation object
  const attestationBuffer = base64urlToBuffer(result.response.attestationObject);
  const attestation = cbor.decodeFirstSync(attestationBuffer);
  
  const authData = parseAuthenticatorData(attestation.authData);
  
  // 4. Extract public key
  const publicKey = authData.credentialPublicKey;
  
  // 5. Store credential
  await db.credentials.create({
    credentialId: result.credentialId,
    userId: result.userId,
    publicKey: publicKey.toString('base64'),
    counter: authData.signCount,
    transports: result.response.transports,
    createdAt: new Date(),
  });
  
  // Clean up challenge
  await redis.del(`webauthn:challenge:${result.userId}`);
  
  return Response.json({ success: true });
}

// Helper function to parse authenticator data
function parseAuthenticatorData(buffer: Buffer) {
  let offset = 0;
  
  const rpIdHash = buffer.slice(offset, offset + 32);
  offset += 32;
  
  const flags = buffer[offset];
  offset += 1;
  
  const signCount = buffer.readUInt32BE(offset);
  offset += 4;
  
  // AAGUID
  const aaguid = buffer.slice(offset, offset + 16);
  offset += 16;
  
  // Credential ID length
  const credIdLength = buffer.readUInt16BE(offset);
  offset += 2;
  
  // Credential ID
  const credentialId = buffer.slice(offset, offset + credIdLength);
  offset += credIdLength;
  
  // Public key (COSE format)
  const credentialPublicKey = buffer.slice(offset);
  
  return {
    rpIdHash,
    flags,
    signCount,
    aaguid,
    credentialId,
    credentialPublicKey,
  };
}
```

### Authentication Verification

```typescript
// POST /api/webauthn/auth/verify
import crypto from 'crypto';
import cbor from 'cbor';

export async function POST(req: Request) {
  const authResult = await req.json();
  
  // 1. Look up credential
  const credential = await db.credentials.findOne({
    credentialId: authResult.credentialId,
  });
  
  if (!credential) {
    return Response.json({ error: 'Credential not found' }, { status: 404 });
  }
  
  // 2. Verify challenge
  const clientData = JSON.parse(
    Buffer.from(authResult.response.clientDataJSON, 'base64url').toString()
  );
  
  const storedChallenge = await redis.get(
    `webauthn:auth-challenge:${credential.userId}`
  );
  
  if (clientData.challenge !== storedChallenge) {
    return Response.json({ error: 'Challenge mismatch' }, { status: 400 });
  }
  
  // 3. Verify signature
  const publicKey = Buffer.from(credential.publicKey, 'base64');
  const signature = base64urlToBuffer(authResult.response.signature);
  const authenticatorData = base64urlToBuffer(authResult.response.authenticatorData);
  const clientDataHash = crypto
    .createHash('sha256')
    .update(Buffer.from(authResult.response.clientDataJSON, 'base64url'))
    .digest();
  
  const signatureBase = Buffer.concat([authenticatorData, clientDataHash]);
  
  // Parse COSE public key
  const coseKey = cbor.decodeFirstSync(publicKey);
  const verified = verifySignature(coseKey, signatureBase, signature);
  
  if (!verified) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // 4. Update counter (prevent replay attacks)
  const authData = parseAuthenticatorData(authenticatorData);
  if (authData.signCount <= credential.counter) {
    return Response.json({ error: 'Invalid counter' }, { status: 401 });
  }
  
  await db.credentials.update(credential.id, {
    counter: authData.signCount,
    lastUsedAt: new Date(),
  });
  
  // 5. Generate session token
  const user = await db.users.findOne({ id: credential.userId });
  const accessToken = generateJWT(user);
  
  // Clean up challenge
  await redis.del(`webauthn:auth-challenge:${credential.userId}`);
  
  return Response.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

function verifySignature(coseKey: any, data: Buffer, signature: Buffer): boolean {
  // Extract coordinates from COSE key
  const x = coseKey.get(-2); // X coordinate
  const y = coseKey.get(-3); // Y coordinate
  
  // Create public key in DER format
  const publicKeyDer = createPublicKeyDer(x, y);
  
  // Verify with Node.js crypto
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  return verify.verify(
    {
      key: publicKeyDer,
      format: 'der',
      type: 'spki',
    },
    signature
  );
}

function createPublicKeyDer(x: Buffer, y: Buffer): Buffer {
  // ES256 (P-256) public key in DER format
  const prefix = Buffer.from([
    0x30, 0x59, // SEQUENCE
    0x30, 0x13, // SEQUENCE
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID for EC
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID for P-256
    0x03, 0x42, 0x00, // BIT STRING
  ]);
  
  return Buffer.concat([
    prefix,
    Buffer.from([0x04]), // Uncompressed point
    x,
    y,
  ]);
}
```

---

## Framework Integration

### React

```typescript
// hooks/useWebAuthn.ts
import { useState } from 'react';
import { WebAuthnClient } from '@vey/webauthn';

const client = new WebAuthnClient({
  rpId: process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID!,
  rpName: process.env.NEXT_PUBLIC_WEBAUTHN_RP_NAME!,
  apiEndpoint: '/api/webauthn',
});

export function useWebAuthn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { challenge, userId } = await fetch('/api/webauthn/register/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(r => r.json());

      const result = await client.register({
        userId,
        userName: email,
        userDisplayName: name,
        challenge,
      });

      await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { challenge } = await fetch('/api/webauthn/auth/challenge', {
        method: 'POST',
      }).then(r => r.json());

      const authResult = await client.authenticate({ challenge });

      const response = await fetch('/api/webauthn/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResult),
      });

      const { accessToken, user } = await response.json();
      return { accessToken, user };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { register, authenticate, loading, error };
}

// components/BiometricLogin.tsx
export function BiometricLogin() {
  const { authenticate, loading, error } = useWebAuthn();

  const handleLogin = async () => {
    const result = await authenticate();
    if (result) {
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Authenticating...' : '👆 Sign in with Biometric'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Vue

```typescript
// composables/useWebAuthn.ts
import { ref } from 'vue';
import { WebAuthnClient } from '@vey/webauthn';

const client = new WebAuthnClient({
  rpId: import.meta.env.VITE_WEBAUTHN_RP_ID,
  rpName: import.meta.env.VITE_WEBAUTHN_RP_NAME,
  apiEndpoint: '/api/webauthn',
});

export function useWebAuthn() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const register = async (email: string, name: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { challenge, userId } = await fetch('/api/webauthn/register/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(r => r.json());

      const result = await client.register({
        userId,
        userName: email,
        userDisplayName: name,
        challenge,
      });

      await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      return true;
    } catch (err: any) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const authenticate = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { challenge } = await fetch('/api/webauthn/auth/challenge', {
        method: 'POST',
      }).then(r => r.json());

      const authResult = await client.authenticate({ challenge });

      const response = await fetch('/api/webauthn/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResult),
      });

      const { accessToken, user } = await response.json();
      return { accessToken, user };
    } catch (err: any) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  return { register, authenticate, loading, error };
}
```

### Next.js App Router

```typescript
// app/api/webauthn/register/challenge/route.ts
import { NextRequest } from 'next/server';
import { WebAuthnCrypto } from '@vey/webauthn';
import { redis } from '@/lib/redis';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  
  const challenge = WebAuthnCrypto.generateChallengeBase64url();
  const user = await db.users.findOrCreate({ email });
  
  await redis.set(`webauthn:challenge:${user.id}`, challenge, 'EX', 300);
  
  return Response.json({ challenge, userId: user.id });
}

// app/login/page.tsx
'use client';

import { useWebAuthn } from '@/hooks/useWebAuthn';

export default function LoginPage() {
  const { authenticate, loading, error } = useWebAuthn();

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={authenticate} disabled={loading}>
        👆 Sign in with Biometric
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

---

## Advanced Features

### Passkey Management

```typescript
import { PasskeyManager } from '@vey/webauthn';

const manager = new PasskeyManager();

// Save passkey metadata after registration
await manager.savePasskey({
  id: result.credentialId,
  name: 'iPhone 13 Face ID',
  deviceName: navigator.userAgent,
  createdAt: new Date().toISOString(),
  authenticatorAttachment: 'platform',
  transports: result.response.transports,
});

// List all passkeys
const passkeys = await manager.listPasskeys();

// Rename a passkey
await manager.renamePasskey(credentialId, 'Work MacBook');

// Delete a passkey
await manager.deletePasskey(credentialId);
```

### Platform Detection

```typescript
import { detectPlatformAuthenticator, supportsConditionalUI } from '@vey/webauthn';

// Detect capabilities
const info = await detectPlatformAuthenticator();
console.log('Platform:', info.platform); // 'ios', 'android', 'macos', etc.
console.log('Biometric available:', info.available);
console.log('Conditional UI:', info.conditionalUISupported);

// Show appropriate UI
if (info.available) {
  showBiometricButton();
} else {
  showPasswordForm();
}
```

### Transaction Signing

```typescript
// Sign a shipping request with biometric
async function signShippingRequest(addressId: string) {
  const { challenge } = await fetch('/api/webauthn/sign-challenge', {
    method: 'POST',
    body: JSON.stringify({ addressId }),
  }).then(r => r.json());

  const authResult = await client.authenticate({
    challenge,
    userVerification: 'required',
  });

  // Submit signed request
  await fetch('/api/shipping/create', {
    method: 'POST',
    body: JSON.stringify({
      addressId,
      signature: authResult,
    }),
  });
}
```

---

## Security Best Practices

### 1. Always Use HTTPS

WebAuthn requires HTTPS in production:

```typescript
if (process.env.NODE_ENV === 'production' && !window.location.protocol.startsWith('https')) {
  throw new Error('WebAuthn requires HTTPS');
}
```

### 2. Validate Relying Party ID

Ensure `rpId` matches your domain:

```typescript
const client = new WebAuthnClient({
  rpId: window.location.hostname, // Must match current domain
  rpName: 'Your App',
});
```

### 3. Require User Verification

Always require biometric or PIN:

```typescript
const client = new WebAuthnClient({
  userVerification: 'required', // Don't use 'preferred' or 'discouraged'
});
```

### 4. Implement Counter Validation

Prevent replay attacks:

```typescript
const authData = parseAuthenticatorData(authenticatorData);
if (authData.signCount <= credential.counter) {
  throw new Error('Possible cloned authenticator');
}
```

### 5. Store Challenges Temporarily

Never reuse challenges:

```typescript
// Store with short TTL
await redis.set(`challenge:${userId}`, challenge, 'EX', 300); // 5 minutes

// Delete after use
await redis.del(`challenge:${userId}`);
```

### 6. Use Attestation (Optional)

Verify authenticator models if needed:

```typescript
const result = await client.register({
  // ...
  attestation: 'direct', // Request attestation
});

// Server: Verify attestation statement
verifyAttestation(result.response.attestationObject);
```

---

## Troubleshooting

### "WebAuthn not supported"

**Cause:** Browser doesn't support WebAuthn.

**Solution:**
```typescript
if (!window.PublicKeyCredential) {
  alert('Your browser does not support WebAuthn. Please use Chrome, Safari, or Firefox.');
  return;
}
```

### "Security error"

**Cause:** Not using HTTPS or rpId mismatch.

**Solutions:**
- Use HTTPS in production
- Use `localhost` for local development
- Ensure `rpId` matches domain

### "User cancelled"

**Cause:** User dismissed biometric prompt.

**Solution:**
```typescript
try {
  await client.authenticate({ challenge });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // User cancelled - show message
    alert('Authentication was cancelled. Please try again.');
  }
}
```

### "Timeout"

**Cause:** User didn't respond within timeout.

**Solution:**
```typescript
const client = new WebAuthnClient({
  timeout: 120000, // Increase to 2 minutes
});
```

---

## Migration Guide

### From Password-Based Auth

```typescript
// 1. Add WebAuthn alongside password auth
async function login(email: string, password?: string) {
  if (password) {
    // Traditional password login
    return await loginWithPassword(email, password);
  } else {
    // WebAuthn login
    return await loginWithPasskey();
  }
}

// 2. Encourage users to register passkeys
if (user.hasPassword && !user.hasPasskey) {
  showPasskeyRegistrationPrompt();
}

// 3. Eventually remove password requirement
```

### From Other Biometric Solutions

```typescript
// WebAuthn is a standard - no vendor lock-in
// Simply replace proprietary SDK with @vey/webauthn

// Before (TouchID.js or similar)
await TouchID.authenticate('Sign in');

// After (WebAuthn standard)
await client.authenticate({ challenge });
```

---

## Examples

See complete examples:

- [Biometric Auth Example](../../examples/biometric-auth-example)
- [Next.js Example](../../examples/nextjs-example)
- [Express Example](../../examples/expressjs-integration)

---

## Resources

- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [FIDO Alliance](https://fidoalliance.org/)
- [MDN WebAuthn Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [@vey/webauthn SDK](../sdk/webauthn)

---

## License

MIT
