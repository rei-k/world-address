# Veyvault Social Login - Complete Architecture

## Overview

**Veyvault Social Login** is an original authentication system that allows users to sign in to third-party applications using their Veyvault identity. Similar to "Sign in with Google" or "Sign in with Apple", but with enhanced privacy through Zero-Knowledge Proofs (ZKP) and address-based identity verification.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Veyvault Social Login Architecture                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Third-Party Applications                       │  │
│  │  • E-commerce Sites    • Booking Platforms    • SaaS Apps        │  │
│  │  • Social Networks     • Financial Services   • Healthcare       │  │
│  └───────────────────────┬──────────────────────────────────────────┘  │
│                          │                                              │
│                          │ OAuth 2.0 / OIDC Protocol                    │
│                          ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Veyvault Identity Provider (IdP)                     │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐            │  │
│  │  │   OAuth     │  │  OpenID     │  │  Consent     │            │  │
│  │  │  Server     │  │  Connect    │  │  Manager     │            │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘            │  │
│  │                                                                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐            │  │
│  │  │    DID      │  │    JWT      │  │     ZKP      │            │  │
│  │  │  Service    │  │  Manager    │  │  Verifier    │            │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘            │  │
│  │                                                                   │  │
│  └───────────────────────┬──────────────────────────────────────────┘  │
│                          │                                              │
│                          ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                Authentication Methods                             │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │   QR     │  │   NFC    │  │  Magic   │  │   Bio    │        │  │
│  │  │  Code    │  │  Tap     │  │  Link    │  │  metric  │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │  │
│  │                                                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │  Email   │  │  Social  │  │   MFA    │  │ Address  │        │  │
│  │  │   OTP    │  │  OAuth   │  │  TOTP    │  │  Verify  │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │  │
│  │                                                                   │  │
│  └───────────────────────┬──────────────────────────────────────────┘  │
│                          │                                              │
│                          ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Data Layer                                   │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │  • User Identities (DID)    • OAuth Clients    • Tokens          │  │
│  │  • Consent Records          • Sessions         • Audit Logs      │  │
│  │  • Address Data (ZKP)       • Trust Graph      • Device Tokens   │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow Diagrams

### Flow 1: Standard OAuth 2.0 Authorization Code Flow

```
┌──────────┐                                  ┌──────────────┐                  ┌─────────────┐
│  User    │                                  │ Third-Party  │                  │  Veyvault   │
│          │                                  │     App      │                  │     IdP     │
└────┬─────┘                                  └──────┬───────┘                  └──────┬──────┘
     │                                               │                                 │
     │ 1. Click "Sign in with Veyvault"             │                                 │
     ├──────────────────────────────────────────────▶                                 │
     │                                               │                                 │
     │                                               │ 2. Redirect to Veyvault         │
     │                                               ├────────────────────────────────▶│
     │                                               │    /oauth/authorize             │
     │                                               │    ?client_id=xxx               │
     │                                               │    &redirect_uri=...            │
     │                                               │    &scope=profile email         │
     │                                               │                                 │
     │                                               │                                 │
     │ 3. Login Page (if not authenticated)          │                                 │
     │◀──────────────────────────────────────────────────────────────────────────────│
     │                                               │                                 │
     │ 4. Authenticate via QR/Email/Biometric        │                                 │
     ├───────────────────────────────────────────────────────────────────────────────▶│
     │                                               │                                 │
     │                                               │                                 │
     │ 5. Consent Screen                             │                                 │
     │   "Allow [App] to access:"                    │                                 │
     │   ✓ Name and email                            │                                 │
     │   ✓ Verified address                          │                                 │
     │   ✓ ConveyID                                  │                                 │
     │◀──────────────────────────────────────────────────────────────────────────────│
     │                                               │                                 │
     │ 6. Approve/Deny                               │                                 │
     ├───────────────────────────────────────────────────────────────────────────────▶│
     │                                               │                                 │
     │                                               │                                 │
     │                                               │ 7. Redirect with auth code      │
     │                                               │◀────────────────────────────────│
     │                                               │    ?code=AUTHORIZATION_CODE     │
     │                                               │                                 │
     │                                               │                                 │
     │                                               │ 8. Exchange code for token      │
     │                                               ├────────────────────────────────▶│
     │                                               │    POST /oauth/token            │
     │                                               │    code=...                     │
     │                                               │    client_secret=...            │
     │                                               │                                 │
     │                                               │ 9. Access Token + ID Token      │
     │                                               │◀────────────────────────────────│
     │                                               │    {                            │
     │                                               │      "access_token": "...",     │
     │                                               │      "id_token": "...",         │
     │                                               │      "refresh_token": "..."     │
     │                                               │    }                            │
     │                                               │                                 │
     │ 10. Signed in!                                │                                 │
     │◀──────────────────────────────────────────────│                                 │
     │                                               │                                 │
```

### Flow 2: QR Code Authentication

```
┌──────────┐              ┌──────────────┐              ┌─────────────┐
│  User    │              │ Third-Party  │              │  Veyvault   │
│ (Mobile) │              │     App      │              │     IdP     │
└────┬─────┘              └──────┬───────┘              └──────┬──────┘
     │                           │                             │
     │                           │ 1. Display QR code          │
     │                           │    for login                │
     │                           │◀────────────────────────────│
     │                           │                             │
     │ 2. Scan QR with           │                             │
     │    Veyvault app           │                             │
     ├───────────────────────────────────────────────────────▶│
     │                           │                             │
     │                           │                             │
     │ 3. Authentication request │                             │
     │◀──────────────────────────────────────────────────────│
     │   "Confirm login to [App]?"                            │
     │   Device: Desktop - Chrome                             │
     │   Location: Tokyo, Japan                               │
     │                           │                             │
     │ 4. Approve with biometric │                             │
     ├───────────────────────────────────────────────────────▶│
     │                           │                             │
     │                           │ 5. Push notification        │
     │                           │    "Login successful"       │
     │                           │◀────────────────────────────│
     │                           │                             │
     │ 6. User logged in         │                             │
     │                           │◀────────────────────────────│
     │                           │                             │
```

### Flow 3: Passwordless Email Magic Link

```
┌──────────┐              ┌──────────────┐              ┌─────────────┐
│  User    │              │ Third-Party  │              │  Veyvault   │
│          │              │     App      │              │     IdP     │
└────┬─────┘              └──────┬───────┘              └──────┬──────┘
     │                           │                             │
     │ 1. Click "Sign in with    │                             │
     │    Veyvault"              │                             │
     ├──────────────────────────▶│                             │
     │                           │                             │
     │                           │ 2. Request magic link       │
     │                           ├────────────────────────────▶│
     │                           │                             │
     │                           │                             │
     │ 3. Enter email            │                             │
     │◀──────────────────────────│                             │
     │                           │                             │
     │ 4. Submit email           │                             │
     ├──────────────────────────────────────────────────────▶│
     │                           │                             │
     │                           │                             │
     │ 5. Magic link email       │                             │
     │◀──────────────────────────────────────────────────────│
     │   Subject: "Sign in to [App]"                          │
     │   Click here to sign in (valid 10 min)                 │
     │                           │                             │
     │ 6. Click link             │                             │
     ├───────────────────────────────────────────────────────▶│
     │                           │                             │
     │                           │ 7. Redirect to app          │
     │                           │◀────────────────────────────│
     │                           │    with access token        │
     │                           │                             │
     │ 8. Logged in!             │                             │
     │◀──────────────────────────│                             │
     │                           │                             │
```

---

## Identity & Claims Structure

### OpenID Connect ID Token

```json
{
  "iss": "https://id.veyvault.com",
  "sub": "vey:did:1234567890abcdef",
  "aud": "client_app_id",
  "exp": 1735516800,
  "iat": 1735513200,
  "auth_time": 1735513200,
  
  // Standard OIDC Claims
  "email": "user@example.com",
  "email_verified": true,
  "name": "Taro Yamada",
  "given_name": "Taro",
  "family_name": "Yamada",
  "picture": "https://cdn.veyvault.com/avatars/123.jpg",
  "locale": "ja-JP",
  
  // Veyvault Custom Claims
  "convey_id": "taro@convey",
  "address_verified": true,
  "address_count": 3,
  "primary_address_country": "JP",
  "zkp_proof": "zkp:proof:abc123...",
  "trust_score": 95,
  "friend_count": 42,
  "delivery_count": 156,
  
  // Permissions
  "scope": "openid profile email address conveyid",
  "amr": ["pwd", "mfa", "biometric"]
}
```

### Decentralized Identifier (DID)

```
Veyvault DID Structure:
did:vey:<user-id>

Example:
did:vey:1a2b3c4d5e6f7g8h9i0j

DID Document:
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:vey:1a2b3c4d5e6f7g8h9i0j",
  "verificationMethod": [
    {
      "id": "did:vey:1a2b3c4d5e6f7g8h9i0j#keys-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:vey:1a2b3c4d5e6f7g8h9i0j",
      "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
    }
  ],
  "authentication": ["did:vey:1a2b3c4d5e6f7g8h9i0j#keys-1"],
  "service": [
    {
      "id": "did:vey:1a2b3c4d5e6f7g8h9i0j#veyvault",
      "type": "VeyvaultService",
      "serviceEndpoint": "https://api.veyvault.com"
    },
    {
      "id": "did:vey:1a2b3c4d5e6f7g8h9i0j#convey",
      "type": "ConveyIDService",
      "serviceEndpoint": "taro@convey"
    }
  ]
}
```

---

## Consent Management

### Consent Screen UI

```
┌─────────────────────────────────────────────────────────────┐
│  Veyvault                                          [×]       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [App Logo]                                                  │
│                                                              │
│  "FoodDelivery App" wants to access:                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✓ Your name and email address                       │  │
│  │  ✓ Your verified address (hidden with ZKP)           │  │
│  │  ✓ Your ConveyID (taro@convey)                       │  │
│  │  ✓ Delivery permissions                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  This will allow FoodDelivery App to:                       │
│  • Send deliveries to your address without seeing it        │
│  • Use your ConveyID for simplified orders                 │
│  • Access your name for order confirmations                │
│                                                              │
│  Your address will NOT be shared with this app.             │
│  Only delivery companies will see it.                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Advanced Options ▼                                  │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ □ Allow offline access (refresh token)             │    │
│  │ □ Remember this decision                           │    │
│  │ ○ Use default address                              │    │
│  │ ○ Select address each time                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Cancel]                          [Allow Access]           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Permission Scopes

```typescript
// Standard OpenID Connect Scopes
"openid"          // Required - enables OIDC
"profile"         // Name, picture, locale
"email"           // Email address

// Veyvault Custom Scopes
"address"         // Access to encrypted address via ZKP
"conveyid"        // ConveyID for delivery
"delivery"        // Permission to send deliveries
"friends"         // Access to friend list (with ZKP)
"trust_score"     // User's trust/reputation score
"offline_access"  // Refresh token for long-term access
```

---

## Security Architecture

### Zero-Knowledge Proof Integration

```
Traditional OAuth:
App receives: { "address": "123 Main St, Tokyo" }
Problem: App can store, share, or misuse raw address

Veyvault OAuth with ZKP:
App receives: { "address_zkp": "zkp:proof:abc123..." }
Benefits:
- App can verify address exists
- App can verify delivery is possible
- App CANNOT see actual address
- Delivery company decrypts only when needed
```

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Transport Security                                │
│  • TLS 1.3                                                  │
│  • Certificate Pinning                                      │
│  • HSTS                                                     │
│                                                              │
│  Layer 2: Authentication                                    │
│  • Multi-factor authentication (MFA)                        │
│  • Biometric (fingerprint, face)                           │
│  • Device trust (device fingerprinting)                    │
│  • Location-based verification                             │
│                                                              │
│  Layer 3: Authorization                                     │
│  • OAuth 2.0 with PKCE                                      │
│  • Granular consent management                             │
│  • Time-bound access tokens (15 min)                       │
│  • Refresh token rotation                                  │
│                                                              │
│  Layer 4: Data Privacy                                      │
│  • Zero-Knowledge Proofs (ZKP)                              │
│  • End-to-end encryption (E2EE)                            │
│  • Selective disclosure                                    │
│  • Minimal data sharing                                    │
│                                                              │
│  Layer 5: Audit & Monitoring                                │
│  • Complete audit trail                                    │
│  • Anomaly detection                                       │
│  • User activity log                                       │
│  • GDPR compliance tools                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Developer Integration

### SDK Integration Example

```typescript
// Install SDK
npm install @veyvault/oauth-sdk

// Initialize
import { VeyvaultOAuth } from '@veyvault/oauth-sdk';

const auth = new VeyvaultOAuth({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://yourapp.com/auth/callback',
  scopes: ['openid', 'profile', 'email', 'address', 'conveyid']
});

// Initiate login
app.get('/login', (req, res) => {
  const authUrl = auth.getAuthorizationUrl({
    state: generateState(),
    nonce: generateNonce()
  });
  res.redirect(authUrl);
});

// Handle callback
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  const tokens = await auth.exchangeCodeForTokens(code);
  // {
  //   access_token: "...",
  //   id_token: "...",
  //   refresh_token: "..."
  // }
  
  const userInfo = await auth.getUserInfo(tokens.access_token);
  // {
  //   sub: "did:vey:...",
  //   email: "user@example.com",
  //   name: "Taro Yamada",
  //   convey_id: "taro@convey",
  //   address_zkp: "zkp:proof:..."
  // }
  
  // Save user session
  req.session.user = userInfo;
  res.redirect('/dashboard');
});
```

### Frontend Button Component

```jsx
import { VeyvaultButton } from '@veyvault/react';

function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      
      {/* Standard OAuth Button */}
      <VeyvaultButton
        clientId="your_client_id"
        redirectUri="/auth/callback"
        scopes={['openid', 'profile', 'email']}
        onSuccess={(user) => console.log('Logged in:', user)}
        onError={(error) => console.error('Login failed:', error)}
      >
        Sign in with Veyvault
      </VeyvaultButton>
      
      {/* QR Code Login */}
      <VeyvaultQRLogin
        clientId="your_client_id"
        onSuccess={(user) => console.log('Logged in:', user)}
        size={256}
      />
    </div>
  );
}
```

---

## Use Cases

### 1. E-commerce Checkout

```
User Journey:
1. User browses products on e-commerce site
2. Clicks "Checkout"
3. Clicks "Sign in with Veyvault" button
4. Authenticates (QR/biometric)
5. Grants permission for delivery
6. Returns to checkout - name, email, and delivery address auto-filled
7. Completes purchase without typing address

Benefits:
- 80% faster checkout
- Zero typing errors
- Enhanced privacy (ZKP)
- Mobile-optimized (QR code)
```

### 2. Hotel Check-in

```
User Journey:
1. Arrives at hotel
2. Front desk scans QR code from Veyvault app
3. System auto-fills guest information
4. Guest verifies and signs
5. Room key issued

Benefits:
- Contactless check-in
- No paper forms
- Verified identity
- International address support
```

### 3. Financial Services (KYC)

```
User Journey:
1. User applies for bank account
2. Clicks "Verify with Veyvault"
3. Bank requests: name, DOB, address, ID verification
4. User reviews and approves
5. Bank receives verified credentials via ZKP
6. Account opened instantly

Benefits:
- Instant KYC verification
- Address proof included
- Regulatory compliance
- Reduced fraud
```

### 4. Healthcare Appointment

```
User Journey:
1. Books doctor appointment online
2. Signs in with Veyvault
3. Medical history permission requested
4. Address auto-filled for billing
5. Insurance information linked
6. Appointment confirmed

Benefits:
- Accurate patient information
- HIPAA compliant
- Multi-language support
- Emergency contact included
```

---

## Comparison with Traditional OAuth

| Feature | Traditional OAuth | Veyvault OAuth |
|---------|------------------|----------------|
| **Identity** | Email only | DID + ConveyID |
| **Address** | User types | ZKP-encrypted |
| **Privacy** | Data exposed | Zero-knowledge |
| **Delivery** | Not supported | Native support |
| **Trust** | External verification | Internal trust graph |
| **Multi-language** | Limited | 269 countries |
| **QR Auth** | Rare | Built-in |
| **Biometric** | App-dependent | Native |
| **Friends** | Not supported | Social graph |
| **Cross-device** | Cookie-based | QR-based |

---

## API Endpoints

### Authorization Endpoints

```
GET  /oauth/authorize          - Initiate OAuth flow
POST /oauth/token              - Exchange code for tokens
POST /oauth/token/refresh      - Refresh access token
POST /oauth/token/revoke       - Revoke token
GET  /oauth/userinfo           - Get user information
GET  /.well-known/openid-configuration - OIDC discovery
GET  /.well-known/jwks.json    - JSON Web Key Set
```

### QR Authentication

```
POST /auth/qr/generate         - Generate QR code for login
POST /auth/qr/verify           - Verify QR code scan
GET  /auth/qr/status/:id       - Check QR auth status
```

### Consent Management

```
GET  /consent                  - List user's consents
GET  /consent/:id              - Get consent details
POST /consent/:id/revoke       - Revoke consent
GET  /consent/:id/history      - Consent usage history
```

### Client Management

```
POST /clients                  - Register new client
GET  /clients/:id              - Get client details
PUT  /clients/:id              - Update client
DELETE /clients/:id            - Delete client
POST /clients/:id/rotate-secret - Rotate client secret
```

---

## Trust & Reputation System

### Trust Score Calculation

```typescript
interface TrustScore {
  overall: number;          // 0-100
  components: {
    addressVerified: number;   // 30 points
    emailVerified: number;     // 15 points
    phoneVerified: number;     // 15 points
    deliveryHistory: number;   // 20 points
    friendEndorsements: number; // 10 points
    accountAge: number;        // 10 points
  };
  lastUpdated: Date;
}

// Example calculation
const trustScore = {
  overall: 95,
  components: {
    addressVerified: 30,    // ✓ Address verified
    emailVerified: 15,      // ✓ Email verified
    phoneVerified: 15,      // ✓ Phone verified
    deliveryHistory: 18,    // 156 deliveries (90%)
    friendEndorsements: 9,  // 42 friends (90%)
    accountAge: 8          // 2 years (80%)
  },
  lastUpdated: new Date()
};
```

### Friend-based Trust

```
Trust Graph:
- Level 1 Friends: Direct connections (verified via QR/NFC)
- Level 2 Friends: Friends of friends
- Trusted Merchants: Verified business accounts
- Community Endorsements: Mutual friend confirmations

Trust Verification:
"John Doe has 42 mutual friends with you"
"This merchant is trusted by 156 of your friends"
```

---

## Analytics & Monitoring

### Metrics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  Veyvault OAuth Analytics                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Active Users:        1,234,567                             │
│  Daily Logins:        45,678                                │
│  Monthly Growth:      +12.5%                                │
│                                                              │
│  Top Authentication Methods:                                │
│  ████████████████████ QR Code (45%)                         │
│  ███████████████ Biometric (35%)                            │
│  ██████████ Email Magic Link (20%)                          │
│                                                              │
│  Top Integration Categories:                                │
│  1. E-commerce (34%)                                        │
│  2. Food Delivery (28%)                                     │
│  3. Travel & Hotels (18%)                                   │
│  4. Financial Services (12%)                                │
│  5. Healthcare (8%)                                         │
│                                                              │
│  Average Login Time:  1.2 seconds                           │
│  Success Rate:        99.8%                                 │
│  MFA Adoption:        78%                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Compliance & Privacy

### GDPR Compliance

```
✓ Right to Access        - Users can export all data
✓ Right to Erasure       - One-click account deletion
✓ Right to Portability   - DID-based data export
✓ Right to Rectification - Self-service data updates
✓ Consent Management     - Granular consent controls
✓ Data Minimization      - ZKP ensures minimal sharing
✓ Audit Trail            - Complete activity logs
```

### Regulatory Standards

```
✓ OAuth 2.0 (RFC 6749)
✓ OpenID Connect 1.0
✓ PKCE (RFC 7636)
✓ JWT (RFC 7519)
✓ DID (W3C)
✓ Verifiable Credentials (W3C)
✓ FIDO2 / WebAuthn
✓ ISO/IEC 27001
```

---

## Roadmap

### Phase 1 (Current)
- ✅ OAuth 2.0 / OIDC implementation
- ✅ QR code authentication
- ✅ Email magic links
- ✅ Basic consent management
- ✅ DID integration

### Phase 2 (Q1 2026)
- 🔄 Biometric authentication (FIDO2)
- 🔄 Social graph trust scores
- 🔄 Advanced analytics dashboard
- 🔄 Multi-region deployment
- 🔄 Mobile SDK (iOS/Android)

### Phase 3 (Q2 2026)
- 📋 Verifiable Credentials (VC)
- 📋 Decentralized reputation
- 📋 Cross-chain identity (blockchain)
- 📋 AI-powered fraud detection
- 📋 Enterprise SSO integration

### Phase 4 (Q3 2026)
- 📋 Self-sovereign identity (SSI)
- 📋 Government ID integration
- 📋 Passwordless everything
- 📋 Quantum-resistant crypto
- 📋 Global identity federation

---

## Conclusion

Veyvault Social Login revolutionizes authentication by combining:

1. **Privacy-first design** - Zero-knowledge proofs protect user data
2. **Seamless UX** - QR codes, biometrics, magic links
3. **Address-native** - Built for delivery and logistics
4. **Trust network** - Social graph-based verification
5. **Global scale** - Support for 269 countries
6. **Developer-friendly** - Easy integration with standard OAuth/OIDC

**Next Steps:**
- Review implementation roadmap
- Integrate Veyvault OAuth into your application
- Join the developer community
- Provide feedback for continuous improvement

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2025-12-08  
**Contact:** dev@veyvault.com
