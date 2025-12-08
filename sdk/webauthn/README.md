# @vey/webauthn

WebAuthn/FIDO2 SDK for passwordless biometric authentication.

## Features

- ✅ **WebAuthn Registration** - Create new passkeys with biometric authentication
- ✅ **WebAuthn Authentication** - Sign in with fingerprint, Face ID, or other biometrics
- ✅ **Browser-compatible Crypto** - Utilities for encoding, hashing, and key management
- ✅ **Platform Authenticator Detection** - Check device capabilities
- ✅ **Conditional UI Support** - Autofill integration for seamless authentication
- ✅ **Passkey Management** - Store and manage passkey metadata

## Installation

```bash
npm install @vey/webauthn
```

## Quick Start

### 1. Initialize WebAuthn Client

```typescript
import { WebAuthnClient } from '@vey/webauthn';

const client = new WebAuthnClient({
  rpId: 'veyvault.com',           // Your domain
  rpName: 'Veyvault',              // Your app name
  apiEndpoint: 'https://api.veyvault.com/webauthn',
  timeout: 60000,                  // 60 seconds
  userVerification: 'required',    // Require biometric/PIN
});
```

### 2. Register a New Passkey

```typescript
// Get challenge from your server
const { challenge } = await fetch('/api/webauthn/register/challenge').then(r => r.json());

// Register passkey
const result = await client.register({
  userId: 'did:vey:1234567890',
  userName: 'taro@example.com',
  userDisplayName: 'Taro Yamada',
  challenge: challenge,
});

// Send result to server for verification
await fetch('/api/webauthn/register/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(result),
});
```

### 3. Authenticate with Passkey

```typescript
// Get challenge from your server
const { challenge } = await fetch('/api/webauthn/auth/challenge').then(r => r.json());

// Authenticate
const authResult = await client.authenticate({
  challenge: challenge,
});

// Send result to server for verification
const response = await fetch('/api/webauthn/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(authResult),
});

const { accessToken, user } = await response.json();
// User is now authenticated!
```

### 4. Conditional UI (Autofill)

```typescript
// Enable autofill for passkey authentication
const authResult = await client.authenticateWithConditionalUI({
  challenge: serverChallenge,
});
```

## Passkey Management

```typescript
import { PasskeyManager } from '@vey/webauthn';

const manager = new PasskeyManager();

// Save passkey metadata after registration
await manager.savePasskey({
  id: result.credentialId,
  name: 'iPhone 13 Face ID',
  deviceName: 'iPhone 13',
  createdAt: new Date().toISOString(),
  authenticatorAttachment: 'platform',
  transports: ['internal'],
});

// List all passkeys
const passkeys = await manager.listPasskeys();
console.log(`You have ${passkeys.length} passkeys`);

// Rename a passkey
await manager.renamePasskey(credentialId, 'Work MacBook Touch ID');

// Delete a passkey
await manager.deletePasskey(credentialId);
```

## Platform Detection

```typescript
import { detectPlatformAuthenticator, supportsConditionalUI } from '@vey/webauthn';

// Check platform capabilities
const info = await detectPlatformAuthenticator();
console.log(info);
// {
//   available: true,
//   conditionalUISupported: true,
//   webAuthnSupported: true,
//   platform: 'ios',
//   browser: 'safari'
// }

// Check if conditional UI is supported
const hasConditionalUI = await supportsConditionalUI();
if (hasConditionalUI) {
  // Show autofill hint
}
```

## Crypto Utilities

```typescript
import { WebAuthnCrypto } from '@vey/webauthn';

// Generate challenge
const challenge = WebAuthnCrypto.generateChallengeBase64url();

// Convert between formats
const base64url = WebAuthnCrypto.credentialIdToBase64url(credentialId);
const buffer = WebAuthnCrypto.base64urlToCredentialId(base64url);

// Hash data
const hash = await WebAuthnCrypto.hashBase64url('data to hash');

// Parse client data
const clientData = WebAuthnCrypto.parseClientDataJSON(clientDataJSON);

// Verify challenge and origin
const validChallenge = WebAuthnCrypto.verifyChallengeInClientData(
  clientDataJSON,
  expectedChallenge
);
const validOrigin = WebAuthnCrypto.verifyOriginInClientData(
  clientDataJSON,
  'https://veyvault.com'
);
```

## Server-Side Verification

The server should verify registration and authentication responses:

### Registration Verification

```typescript
// 1. Verify challenge matches
// 2. Verify origin matches your domain
// 3. Parse attestation object
// 4. Extract and store public key
// 5. Store credential ID linked to user

// Example (pseudo-code):
function verifyRegistration(result, expectedChallenge) {
  const clientData = parseClientDataJSON(result.response.clientDataJSON);
  
  if (clientData.challenge !== expectedChallenge) {
    throw new Error('Challenge mismatch');
  }
  
  if (clientData.origin !== 'https://veyvault.com') {
    throw new Error('Origin mismatch');
  }
  
  // Parse attestation object and extract public key
  const { publicKey, credentialId } = parseAttestationObject(
    result.response.attestationObject
  );
  
  // Store in database
  await db.credentials.create({
    credentialId: result.credentialId,
    userId: user.id,
    publicKey: publicKey,
    transports: result.response.transports,
  });
  
  return { success: true };
}
```

### Authentication Verification

```typescript
// 1. Verify challenge matches
// 2. Verify origin matches
// 3. Look up credential and public key
// 4. Verify signature using public key
// 5. Check user verification flag
// 6. Update credential counter (prevent replay)

// Example (pseudo-code):
function verifyAuthentication(authResult, expectedChallenge) {
  const clientData = parseClientDataJSON(authResult.response.clientDataJSON);
  
  if (clientData.challenge !== expectedChallenge) {
    throw new Error('Challenge mismatch');
  }
  
  // Look up credential
  const credential = await db.credentials.findOne({
    credentialId: authResult.credentialId
  });
  
  if (!credential) {
    throw new Error('Credential not found');
  }
  
  // Verify signature
  const verified = verifySignature(
    credential.publicKey,
    authResult.response.signature,
    authResult.response.authenticatorData,
    clientData
  );
  
  if (!verified) {
    throw new Error('Signature verification failed');
  }
  
  // Generate session token
  const accessToken = generateJWT(credential.userId);
  
  return { accessToken, user: credential.user };
}
```

## Error Handling

```typescript
try {
  const result = await client.register(options);
} catch (error) {
  console.error('Registration failed:', error.message);
  
  // User-friendly error messages are automatically provided:
  // - "Authentication was cancelled or timed out. Please try again."
  // - "Security error. Make sure you are using HTTPS."
  // - "This authenticator is already registered."
  // etc.
}
```

## Browser Compatibility

WebAuthn is supported in:

- ✅ Chrome/Edge 67+
- ✅ Firefox 60+
- ✅ Safari 13+
- ✅ Opera 54+
- ✅ iOS Safari 14+
- ✅ Chrome Android 70+

**Note:** WebAuthn requires HTTPS or localhost.

## Security Best Practices

1. **Always use HTTPS** in production
2. **Verify challenges** on the server side
3. **Validate origins** to prevent phishing
4. **Use user verification** (`userVerification: 'required'`)
5. **Store public keys securely** in your database
6. **Implement rate limiting** for authentication attempts
7. **Use attestation** if you need to verify authenticator models
8. **Enable resident keys** for better UX (passwordless)

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type {
  WebAuthnConfig,
  RegistrationOptions,
  AuthenticationOptions,
  RegistrationResult,
  AuthenticationResult,
  PasskeyCredential,
  PlatformAuthenticatorInfo,
} from '@vey/webauthn';
```

## License

MIT

## Related

- [@vey/core](../core) - Core address validation SDK
- [@vey/webhooks](../webhooks) - Webhook utilities
- [WebAuthn Specification](https://www.w3.org/TR/webauthn/)
- [FIDO Alliance](https://fidoalliance.org/)
