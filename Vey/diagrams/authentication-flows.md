# Veyvault Authentication Flows - Detailed Diagrams

## Table of Contents

1. [Multi-Method Authentication Overview](#multi-method-authentication-overview)
2. [QR Code Cross-Device Flow](#qr-code-cross-device-flow)
3. [NFC Tap Authentication](#nfc-tap-authentication)
4. [Biometric Authentication](#biometric-authentication)
5. [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
6. [Address-Based Verification](#address-based-verification)
7. [Friend Trust Verification](#friend-trust-verification)
8. [Session Management](#session-management)
9. [Token Lifecycle](#token-lifecycle)
10. [Error Handling Flows](#error-handling-flows)

---

## Multi-Method Authentication Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│            Veyvault Authentication Methods                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Primary Methods (Single-Factor)                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  📱 QR Code Scan          - Cross-device authentication     │  │
│  │     └─ Use Case: Desktop login from mobile                  │  │
│  │     └─ Security: Device binding + location check            │  │
│  │     └─ Speed: ~2 seconds                                    │  │
│  │                                                              │  │
│  │  📲 NFC Tap               - Contactless authentication      │  │
│  │     └─ Use Case: Physical location check-in                 │  │
│  │     └─ Security: Proximity verification                     │  │
│  │     └─ Speed: ~1 second                                     │  │
│  │                                                              │  │
│  │  📧 Magic Link            - Passwordless email              │  │
│  │     └─ Use Case: First-time login, password recovery        │  │
│  │     └─ Security: Time-limited token + device fingerprint    │  │
│  │     └─ Speed: ~30 seconds                                   │  │
│  │                                                              │  │
│  │  🔐 Password + Email      - Traditional login               │  │
│  │     └─ Use Case: Fallback authentication                    │  │
│  │     └─ Security: Argon2id hashing + rate limiting           │  │
│  │     └─ Speed: ~3 seconds                                    │  │
│  │                                                              │  │
│  │  👤 Social OAuth          - Third-party identity            │  │
│  │     └─ Providers: Google, Apple, LINE                       │  │
│  │     └─ Use Case: Quick signup/login                         │  │
│  │     └─ Speed: ~5 seconds                                    │  │
│  │                                                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Secondary Factors (MFA)                                           │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │  👆 Biometric             - Fingerprint, Face ID, Iris      │  │
│  │     └─ Standard: FIDO2 / WebAuthn                           │  │
│  │     └─ Local verification (never leaves device)             │  │
│  │                                                              │  │
│  │  🔢 TOTP (6-digit code)   - Time-based OTP                  │  │
│  │     └─ Apps: Google Authenticator, Authy                    │  │
│  │     └─ Backup codes provided                                │  │
│  │                                                              │  │
│  │  📱 SMS OTP               - Phone number verification       │  │
│  │     └─ Fallback option                                      │  │
│  │     └─ Regional availability                                │  │
│  │                                                              │  │
│  │  🏠 Address Verification  - Unique to Veyvault              │  │
│  │     └─ Verify postal code of registered address             │  │
│  │     └─ ZKP-based proof                                      │  │
│  │                                                              │  │
│  │  👥 Friend Endorsement    - Social trust                    │  │
│  │     └─ Confirm via trusted friend                           │  │
│  │     └─ Used for account recovery                            │  │
│  │                                                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## QR Code Cross-Device Flow

### Scenario: Desktop Login via Mobile App

```
Desktop Browser                Mobile App                 Veyvault Backend
─────────────────              ──────────                ─────────────────

1. User visits login page
│
├─ GET /login
│                                                         Generate session ID
│◀────────────────────────────────────────────────────── session_xyz123
│
├─ Display QR code
│  ┌─────────────────┐
│  │  ▓▓▓  ▓  ▓▓▓   │
│  │  ▓ ▓  ▓▓ ▓ ▓   │           
│  │  ▓▓▓  ▓  ▓▓▓   │
│  │  Scan with      │
│  │  Veyvault App   │
│  └─────────────────┘
│  Contains: session_xyz123
│             timestamp
│             challenge
│
│
│                              2. User opens Veyvault app
│                              │
│                              ├─ Tap "Scan QR Code"
│                              │
│                              ├─ Camera opens
│                              │
│                              ├─ Scan QR code
│                              │
│                              ├─ Parse QR data
│                              │  {
│                              │    session: "xyz123",
│                              │    challenge: "abc...",
│                              │    timestamp: 1735...
│                              │  }
│                              │
│                              ├─ POST /auth/qr/verify
│                              ├─────────────────────────▶ Verify session
│                              │  {                         Check timestamp
│                              │    session: "xyz123",      Validate challenge
│                              │    device_id: "mobile1",
│                              │    location: {lat,lng}
│                              │  }
│                              │
│                              │                           3. Show confirmation
│                              │◀──────────────────────────
│                              │  {
│                              │    success: true,
│                              │    login_request: {
│                              │      device: "Desktop Chrome",
│                              │      location: "Tokyo, Japan",
│                              │      ip: "203.0.113.1"
│                              │    }
│                              │  }
│                              │
│                              ├─ Display confirmation
│                              │  ┌─────────────────────┐
│                              │  │ Confirm Login?      │
│                              │  │                     │
│                              │  │ Device:             │
│                              │  │ Desktop Chrome      │
│                              │  │                     │
│                              │  │ Location:           │
│                              │  │ Tokyo, Japan        │
│                              │  │                     │
│                              │  │ [Deny]  [Approve]   │
│                              │  └─────────────────────┘
│                              │
│                              ├─ User taps "Approve"
│                              │
│                              ├─ Biometric verification
│                              │  👆 Touch ID
│                              │
│                              ├─ POST /auth/qr/approve
│                              ├─────────────────────────▶ 4. Create session
│                              │  {                         Generate tokens
│                              │    session: "xyz123",      Link to user
│                              │    approved: true,
│                              │    biometric: true
│                              │  }
│                              │
│                              │◀──────────────────────────
│                              │  {
│                              │    success: true
│                              │  }
│                              │
│                              ├─ Show success
│                              │  ✅ Login approved!
│
5. Desktop polls for status
│
├─ GET /auth/qr/status/xyz123
├─ ... (polling every 2s)
├─ GET /auth/qr/status/xyz123
│                                                         5. Status changed
│◀────────────────────────────────────────────────────── {
│  {                                                        status: "approved",
│    status: "approved",                                   access_token: "...",
│    access_token: "...",                                  id_token: "...",
│    id_token: "...",                                      user: {...}
│    user: {...}                                         }
│  }
│
├─ Store tokens
│
├─ Redirect to /dashboard
│
└─ ✅ Logged in!


Timeline:
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
0s    2s    4s    6s    8s   10s   12s   14s
│     │     │     │     │     │     │     │
QR    Scan  Conf  Bio   Aprv  Poll  Redir Done
```

### Security Measures

```typescript
interface QRAuthSecurity {
  // Session expires after 5 minutes
  sessionExpiry: 300000; // ms
  
  // Challenge-response to prevent replay attacks
  challenge: string; // Cryptographic nonce
  
  // Device fingerprinting
  deviceFingerprint: {
    userAgent: string;
    screen: { width: number; height: number };
    timezone: string;
    language: string;
    platform: string;
  };
  
  // Location verification (optional)
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  
  // Rate limiting
  maxAttempts: 3; // per IP per 15 minutes
  
  // Biometric confirmation required
  requireBiometric: boolean;
}
```

---

## NFC Tap Authentication

### Scenario: Physical Check-in (e.g., Hotel, Office)

```
NFC Reader/Terminal          Mobile App                 Veyvault Backend
──────────────────           ──────────                ─────────────────

1. Terminal displays
   "Tap to check in"
│
├─ NFC enabled
│  waiting for tap...
│
│
│                           2. User approaches with phone
│                           │
│                           ├─ NFC detected
│                           │
│                           ├─ Read terminal ID
│                           │  {
│                           │    terminal: "hotel_lobby_01",
│                           │    location: "Tokyo Hilton",
│                           │    timestamp: 1735...
│                           │  }
│                           │
│                           ├─ POST /auth/nfc/verify
│                           ├──────────────────────────▶ 3. Verify terminal
│                           │  {                          Check location
│                           │    terminal_id: "...",     Validate user
│                           │    user_id: "...",
│                           │    nfc_uid: "...",
│                           │    timestamp: ...
│                           │  }
│                           │
│                           │◀──────────────────────────
│                           │  {
│                           │    success: true,
│                           │    session_token: "...",
│                           │    user: {
│                           │      name: "Taro Yamada",
│                           │      reservation: "123456"
│                           │    }
│                           │  }
│                           │
4. Terminal receives data   │
│◀───────────────────────────────────────────────────── Push notification
│  {                        │                            to terminal
│    user: {                │
│      name: "Taro Yamada", │
│      check_in: true,      │
│      room: "1505"         │
│    }                      │
│  }                        │
│                           │
├─ Display welcome          │
│  ┌──────────────────────┐│
│  │ Welcome!             ││
│  │ Taro Yamada          ││
│  │                      ││
│  │ Room: 1505           ││
│  │ Floor: 15            ││
│  │                      ││
│  │ Enjoy your stay! ✨  ││
│  └──────────────────────┘│
│                           │
│                           ├─ Vibration feedback
│                           │  📳
│                           │
│                           ├─ Show confirmation
│                           │  ✅ Checked in!
│
└─ Issue room key
   (digital or physical)


Timeline:
┌─────┬─────┬─────┬─────┐
0s    1s    2s    3s
│     │     │     │
Tap   Read  Verif Done
```

### NFC Data Structure

```typescript
interface NFCAuthData {
  // NFC tag information
  nfcTag: {
    uid: string;          // Unique NFC tag ID
    technology: string;   // NFC-A, NFC-B, NFC-F
    maxSize: number;      // Max data size
  };
  
  // Terminal information
  terminal: {
    id: string;           // Terminal identifier
    location: {
      name: string;       // e.g., "Tokyo Hilton Lobby"
      lat: number;
      lng: number;
    };
    type: string;         // hotel, office, event, etc.
    publicKey: string;    // For encrypted communication
  };
  
  // User verification
  user: {
    did: string;          // Veyvault DID
    signature: string;    // Digital signature
    timestamp: number;
  };
  
  // Security
  challenge: string;      // Prevent replay attacks
  expiry: number;         // Token expiration
}
```

---

## Biometric Authentication

### Scenario: Fingerprint/Face ID Verification

```
Client Device                 FIDO2 Server              Veyvault Backend
─────────────                ────────────              ─────────────────

1. User initiates login
│
├─ Click "Sign in"
│
│                                                       Generate challenge
│◀────────────────────────────────────────────────────
│  {
│    challenge: "base64...",
│    rpId: "veyvault.com",
│    timeout: 60000,
│    userVerification: "required"
│  }
│
├─ Show biometric prompt
│  ┌───────────────────┐
│  │  Touch ID         │
│  │                   │
│  │      👆          │
│  │                   │
│  │  Tap to sign in   │
│  └───────────────────┘
│
2. User provides biometric
│
├─ Fingerprint scanned
│  📱 (local verification)
│
├─ Generate assertion
│  using private key
│  (stored in secure enclave)
│
├─ POST /auth/webauthn/verify
├──────────────────────────────▶ 3. Verify credential
│  {                              Check signature
│    id: "credential_id",         Validate challenge
│    rawId: "...",                Verify origin
│    response: {
│      authenticatorData: "...",
│      clientDataJSON: "...",
│      signature: "...",
│      userHandle: "..."
│    },
│    type: "public-key"
│  }
│
│                              ├─ Decode assertion
│                              │
│                              ├─ Verify signature
│                              │  using public key
│                              │
│                              ├─────────────────────▶ 4. Create session
│                              │                        Generate tokens
│                              │
│◀──────────────────────────────────────────────────── 
│  {
│    success: true,
│    access_token: "...",
│    id_token: "...",
│    user: {
│      id: "...",
│      name: "Taro Yamada",
│      email: "taro@example.com"
│    }
│  }
│
├─ Store tokens
│
└─ ✅ Logged in!
   (Total time: ~1.5 seconds)


Security Benefits:
┌──────────────────────────────────────────┐
│ ✅ Phishing-resistant                     │
│ ✅ No password to steal                   │
│ ✅ Private key never leaves device        │
│ ✅ Origin validation                      │
│ ✅ User presence verification             │
│ ✅ FIDO2 certified                        │
└──────────────────────────────────────────┘
```

### Biometric Registration Flow

```
Client Device                               Veyvault Backend
─────────────                              ─────────────────

1. User enables biometric auth
│
├─ Settings → Security → Add Fingerprint
│
├─ POST /auth/webauthn/register
├────────────────────────────────────────▶ Generate challenge
│                                           {
│◀──────────────────────────────────────── challenge,
│  {                                        rpId,
│    challenge: "base64...",                userId
│    rp: {                                }
│      id: "veyvault.com",
│      name: "Veyvault"
│    },
│    user: {
│      id: "did:vey:...",
│      name: "Taro Yamada",
│      displayName: "Taro"
│    },
│    pubKeyCredParams: [{
│      type: "public-key",
│      alg: -7  // ES256
│    }],
│    authenticatorSelection: {
│      authenticatorAttachment: "platform",
│      requireResidentKey: true,
│      userVerification: "required"
│    }
│  }
│
2. Create credential
│
├─ navigator.credentials.create(...)
│
├─ Show biometric prompt
│  "Touch ID to register fingerprint"
│
├─ User provides fingerprint
│  📱 👆
│
├─ Generate key pair
│  (in secure enclave)
│  • Private key: stays in device
│  • Public key: sent to server
│
├─ POST /auth/webauthn/register/complete
├────────────────────────────────────────▶ 3. Store public key
│  {                                        Link to user account
│    id: "credential_id",                  Enable for future auth
│    rawId: "...",
│    response: {
│      attestationObject: "...",
│      clientDataJSON: "..."
│    },
│    type: "public-key"
│  }
│
│◀────────────────────────────────────────
│  {
│    success: true,
│    credential: {
│      id: "...",
│      name: "iPhone 13",
│      createdAt: "2025-12-08"
│    }
│  }
│
├─ Show success
│  ✅ Fingerprint registered!
│
└─ Can now use for login
```

---

## Multi-Factor Authentication (MFA)

### MFA Enrollment Flow

```
User Dashboard                            Veyvault Backend
──────────────                           ─────────────────

1. Navigate to Security Settings
│
├─ Settings → Security → Enable MFA
│
├─ Select MFA method:
│  ○ Authenticator App (TOTP)
│  ○ SMS
│  ○ Biometric
│  ○ Address Verification
│
2. User selects "Authenticator App"
│
├─ POST /auth/mfa/totp/enroll
├────────────────────────────────────────▶ Generate TOTP secret
│                                          {
│◀──────────────────────────────────────   secret: "BASE32...",
│  {                                       qr_code: "data:image/png..."
│    secret: "JBSWY3DPEHPK3PXP",         }
│    qr_code: "data:image/png;base64...",
│    manual_entry: "JBSWY-3DPEH-PK3PXP",
│    issuer: "Veyvault",
│    account: "taro@example.com"
│  }
│
├─ Display QR code
│  ┌───────────────────────────┐
│  │ Scan with authenticator   │
│  │                           │
│  │  ▓▓▓▓  ▓  ▓▓  ▓▓▓▓       │
│  │  ▓  ▓ ▓▓▓ ▓▓▓ ▓  ▓       │
│  │  ▓▓▓▓  ▓  ▓▓  ▓▓▓▓       │
│  │                           │
│  │ Or enter manually:        │
│  │ JBSWY-3DPEH-PK3PXP       │
│  └───────────────────────────┘
│
3. User scans with Google Authenticator
│
├─ App shows 6-digit code
│  Veyvault (taro@example.com)
│  [4][5][8][2][9][1] ⏱ 25s
│
4. User enters code to verify
│
├─ Enter code: [4][5][8][2][9][1]
│
├─ POST /auth/mfa/totp/verify
├────────────────────────────────────────▶ Verify TOTP code
│  {                                       using shared secret
│    code: "458291"
│  }
│
│◀────────────────────────────────────────
│  {
│    success: true,
│    backup_codes: [
│      "A1B2-C3D4-E5F6",
│      "G7H8-I9J0-K1L2",
│      "M3N4-O5P6-Q7R8",
│      ...
│    ],
│    mfa_enabled: true
│  }
│
├─ Show backup codes
│  ⚠️  Save these backup codes!
│  A1B2-C3D4-E5F6
│  G7H8-I9J0-K1L2
│  M3N4-O5P6-Q7R8
│  [Download] [Print] [Copy]
│
└─ ✅ MFA enabled successfully!
```

### MFA Login Flow

```
User                                      Veyvault Backend
────                                     ─────────────────

1. Enter email/password
│
├─ POST /auth/login
├────────────────────────────────────────▶ Verify credentials
│  {                                       MFA required!
│    email: "taro@example.com",
│    password: "..."
│  }
│
│◀────────────────────────────────────────
│  {
│    mfa_required: true,
│    methods: ["totp", "sms", "biometric"],
│    session_id: "temp_session_xyz"
│  }
│
├─ Show MFA prompt
│  ┌────────────────────────────┐
│  │ Two-Factor Authentication  │
│  │                            │
│  │ Select method:             │
│  │ ● Authenticator App        │
│  │ ○ SMS to +81-**-****-1234  │
│  │ ○ Fingerprint             │
│  │                            │
│  │ [Continue]                 │
│  └────────────────────────────┘
│
2. User selects Authenticator App
│
├─ Enter code: [__][__][__][__][__][__]
│
├─ User opens Google Authenticator
│  Veyvault
│  [7][3][9][2][8][5] ⏱ 18s
│
├─ Enter: 739285
│
├─ POST /auth/mfa/verify
├────────────────────────────────────────▶ Verify MFA code
│  {                                       Check TOTP
│    session_id: "temp_session_xyz",      within time window
│    method: "totp",
│    code: "739285"
│  }
│
│◀────────────────────────────────────────
│  {
│    success: true,
│    access_token: "...",
│    id_token: "...",
│    user: {...}
│  }
│
└─ ✅ Logged in successfully!
```

---

## Address-Based Verification

### Scenario: Verify Ownership of Address

```
User                                      Veyvault Backend
────                                     ─────────────────

1. High-risk action detected
   (e.g., change payment method,
    ship to new country)
│
│◀────────────────────────────────────────
│  {
│    verification_required: true,
│    type: "address_verification",
│    message: "Verify your address to continue"
│  }
│
├─ Show verification prompt
│  ┌────────────────────────────────┐
│  │ Address Verification Required  │
│  │                                │
│  │ To protect your account,       │
│  │ please verify your address.    │
│  │                                │
│  │ What is your postal code?      │
│  │ [___]-[____] (Japan)          │
│  │                                │
│  │ Or select address:             │
│  │ ○ Home (Tokyo, ****-****)     │
│  │ ○ Work (Osaka, ****-****)     │
│  │                                │
│  │ [Cancel] [Verify]              │
│  └────────────────────────────────┘
│
2. User enters postal code
│
├─ Enter: 150-0001
│
├─ POST /auth/address/verify
├────────────────────────────────────────▶ ZKP verification
│  {                                       Generate proof
│    address_id: "addr_123",              Verify postal code
│    postal_code: "150-0001",             without revealing
│    zkp_proof: "zkp:proof:..."           full address
│  }
│
│                                         3. Verify proof
│                                         ├─ Parse ZKP proof
│                                         ├─ Verify postal code
│                                         │  matches encrypted data
│                                         ├─ Check ZK circuit
│                                         └─ Validate
│
│◀────────────────────────────────────────
│  {
│    success: true,
│    verified: true,
│    address_confirmed: {
│      country: "JP",
│      region: "Tokyo",
│      // No full address revealed
│    }
│  }
│
├─ Show success
│  ✅ Address verified!
│
└─ Continue with action


ZKP Proof Process:
┌─────────────────────────────────────────────────┐
│ Zero-Knowledge Proof for Address Verification   │
├─────────────────────────────────────────────────┤
│                                                  │
│ Prover (User):                                  │
│ • Has: Full address with postal code            │
│ • Wants to prove: Postal code matches           │
│ • Without revealing: Street name, building      │
│                                                  │
│ Verifier (Backend):                             │
│ • Wants to verify: User knows postal code       │
│ • Without knowing: Full address details         │
│                                                  │
│ ZK Circuit:                                     │
│ 1. Hash full address: H(address)                │
│ 2. Extract postal code: postal_code             │
│ 3. Generate proof: P(H(address), postal_code)   │
│ 4. Verify: V(P, postal_code) = true/false       │
│                                                  │
│ Result:                                         │
│ ✅ Postal code verified                         │
│ ✅ Full address remains encrypted                │
│ ✅ Privacy preserved                            │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Friend Trust Verification

### Scenario: Account Recovery via Friends

```
User (Lost Access)               Friend                  Veyvault Backend
──────────────                  ──────                  ─────────────────

1. User initiates recovery
│
├─ "I can't access my account"
│
├─ POST /auth/recovery/initiate
├────────────────────────────────────────────────────▶ Create recovery
│  {                                                    request
│    email: "taro@example.com"
│  }
│
│◀──────────────────────────────────────────────────── 
│  {
│    recovery_id: "rec_xyz123",
│    methods: ["friend_verification", "email", "support"],
│    friends_required: 3  // Need 3 friends to confirm
│  }
│
├─ Select "Friend Verification"
│
├─ Show friend list
│  ┌────────────────────────────┐
│  │ Select 3 friends to help:  │
│  │                            │
│  │ ☑ Hanako Suzuki           │
│  │ ☑ Jiro Tanaka             │
│  │ ☑ Yuki Sato               │
│  │ ☐ Ken Yamamoto            │
│  │                            │
│  │ [Request Help]             │
│  └────────────────────────────┘
│
2. Send requests to friends
│
├─ POST /auth/recovery/request-friends
├────────────────────────────────────────────────────▶ Send notifications
│  {                                                    to selected friends
│    recovery_id: "rec_xyz123",
│    friend_ids: ["f1", "f2", "f3"]
│  }
│                                                       
│                                                      3. Notify friends
│                                  ┌───────────────────────────────────
│                                  │ 📱 Push notification
│                                  │ "Taro needs your help
│                                  │  to recover their account"
│                                  │
│                                  ├─ Friend opens app
│                                  │
│                                  ├─ Shows recovery request
│                                  │  ┌──────────────────────┐
│                                  │  │ Account Recovery     │
│                                  │  │                      │
│                                  │  │ Taro Yamada needs   │
│                                  │  │ your help to recover │
│                                  │  │ their account.       │
│                                  │  │                      │
│                                  │  │ Verify identity:     │
│                                  │  │                      │
│                                  │  │ Q: Last delivery to  │
│                                  │  │    this person?      │
│                                  │  │ A: [Your answer]     │
│                                  │  │                      │
│                                  │  │ [Deny] [Confirm]     │
│                                  │  └──────────────────────┘
│                                  │
│                                  ├─ Friend confirms
│                                  │  (with biometric)
│                                  │
│                                  ├─ POST /auth/recovery/confirm
│                                  ├─────────────────────────▶ Record
│                                  │  {                        confirmation
│                                  │    recovery_id: "...",
│                                  │    friend_id: "f1",
│                                  │    confirmed: true,
│                                  │    answer: "..."
│                                  │  }
│                                  │
│                                  │◀─────────────────────────
│                                  │  { success: true }
│                                  │
│                                  └─ ✅ Confirmed!
│
4. Check recovery status
│
├─ GET /auth/recovery/status/rec_xyz123
│
│◀────────────────────────────────────────────────────
│  {
│    confirmed: 3,
│    required: 3,
│    friends: [
│      { name: "Hanako", confirmed: true, at: "..." },
│      { name: "Jiro", confirmed: true, at: "..." },
│      { name: "Yuki", confirmed: true, at: "..." }
│    ],
│    status: "approved"
│  }
│
├─ Recovery approved!
│
├─ POST /auth/recovery/complete
├────────────────────────────────────────────────────▶ Generate new
│  {                                                    credentials
│    recovery_id: "rec_xyz123",
│    new_password: "...",
│    new_email: "..." (if changed)
│  }
│
│◀────────────────────────────────────────────────────
│  {
│    success: true,
│    access_token: "...",
│    message: "Account recovered! Please set up MFA."
│  }
│
└─ ✅ Account recovered!
   Logged in successfully


Trust Requirements:
┌────────────────────────────────────┐
│ Friend must meet criteria:         │
│ • Connected for > 30 days          │
│ • Exchanged > 3 deliveries         │
│ • Mutual friend connections        │
│ • Active account (used in 90 days) │
│ • Not previously used for recovery │
└────────────────────────────────────┘
```

---

## Session Management

### Session Lifecycle

```
Session Creation → Active Session → Token Refresh → Session Expiry/Logout
────────────────   ──────────────   ─────────────   ─────────────────────

1. Login successful
│
├─ Create session
│  {
│    session_id: "sess_abc123",
│    user_id: "did:vey:...",
│    device: {
│      id: "dev_xyz789",
│      name: "iPhone 13",
│      os: "iOS 17.2",
│      browser: "Safari"
│    },
│    ip_address: "203.0.113.1",
│    location: {
│      city: "Tokyo",
│      country: "JP"
│    },
│    created_at: "2025-12-08T12:00:00Z",
│    expires_at: "2025-12-08T12:15:00Z",  // 15 min access token
│    last_activity: "2025-12-08T12:00:00Z"
│  }
│
2. Active session
│
├─ User browses app
│  Activity tracked:
│  • Page views
│  • API requests
│  • Location changes
│  • Device changes
│
3. Token refresh (before expiry)
│
├─ Access token expiring in 2 min
│
├─ POST /auth/token/refresh
│  {
│    refresh_token: "...",
│    grant_type: "refresh_token"
│  }
│
├─ Verify refresh token
│  • Check not revoked
│  • Check not expired
│  • Verify device
│  • Check suspicious activity
│
├─ Issue new tokens
│  {
│    access_token: "new_...",
│    id_token: "new_...",
│    expires_in: 900  // 15 min
│  }
│
├─ Rotate refresh token (optional)
│  New refresh_token: "rotated_..."
│
4. Session monitoring
│
├─ Detect anomalies:
│  • Impossible travel
│    (Tokyo → New York in 1 hour)
│  • Device fingerprint change
│  • Unusual API patterns
│  • High-risk actions
│
├─ If anomaly detected:
│  ┌────────────────────────────┐
│  │ ⚠️  Unusual Activity        │
│  │                            │
│  │ We detected a login from:  │
│  │ • Location: New York, USA  │
│  │ • Device: Unknown Desktop  │
│  │ • Time: Just now           │
│  │                            │
│  │ Was this you?              │
│  │ [No, Secure Account]       │
│  │ [Yes, This Was Me]         │
│  └────────────────────────────┘
│
5. Manual logout
│
├─ User clicks "Logout"
│
├─ POST /auth/logout
│  {
│    session_id: "sess_abc123",
│    all_devices: false  // or true for logout everywhere
│  }
│
├─ Revoke tokens
│  • Blacklist access token
│  • Revoke refresh token
│  • Delete session
│
└─ ✅ Logged out


Session Dashboard:
┌──────────────────────────────────────────────────────┐
│ Active Sessions                                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│ 📱 iPhone 13 (this device)                           │
│    Tokyo, Japan • Active now                         │
│    [Current Session]                                 │
│                                                       │
│ 💻 Chrome on Windows                                 │
│    Tokyo, Japan • Active 2 hours ago                 │
│    [End Session]                                     │
│                                                       │
│ 🖥️  Safari on Mac                                    │
│    Osaka, Japan • Active 1 day ago                   │
│    [End Session]                                     │
│                                                       │
│ [End All Other Sessions]                             │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## Token Lifecycle

### JWT Token Management

```
Token Structure:
┌──────────────────────────────────────────────────────┐
│ Access Token (JWT)                                    │
├──────────────────────────────────────────────────────┤
│ Header:                                               │
│ {                                                     │
│   "alg": "RS256",                                    │
│   "typ": "JWT",                                      │
│   "kid": "veyvault-2025-01"                          │
│ }                                                     │
│                                                       │
│ Payload:                                              │
│ {                                                     │
│   "iss": "https://id.veyvault.com",                  │
│   "sub": "did:vey:1234567890",                       │
│   "aud": "client_app_id",                            │
│   "exp": 1735514100,  // 15 minutes                  │
│   "iat": 1735513200,                                 │
│   "jti": "unique_token_id",                          │
│   "scope": "openid profile email address",           │
│   "session_id": "sess_abc123"                        │
│ }                                                     │
│                                                       │
│ Signature: RS256(Header + Payload, Private Key)      │
└──────────────────────────────────────────────────────┘

Token Refresh Flow:
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Access Token Lifespan: 15 minutes                      │
│  Refresh Token Lifespan: 30 days                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Timeline:                                         │  │
│  │                                                   │  │
│  │ 0 min          15 min        30 min        45 min│  │
│  │  │              │              │              │   │  │
│  │  ├─ Login       ├─ Refresh    ├─ Refresh    ├─  │  │
│  │  │              │              │              │   │  │
│  │  AT1            AT2            AT3            AT4 │  │
│  │  │              │              │              │   │  │
│  │  └──────────────┴──────────────┴──────────────┘   │  │
│  │                                                   │  │
│  │  RT (valid for 30 days)                          │  │
│  │  └────────────────────────────────────────────▶  │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Token Rotation (Security Best Practice):               │
│  • Each refresh generates new refresh token             │
│  • Old refresh token becomes invalid                    │
│  • Prevents token reuse attacks                         │
│                                                          │
└─────────────────────────────────────────────────────────┘

Token Revocation:
┌─────────────────────────────────────────────────────────┐
│ Revocation Scenarios:                                    │
│                                                          │
│ 1. User logout                                          │
│    → Revoke all tokens for that session                │
│                                                          │
│ 2. Password change                                      │
│    → Revoke all refresh tokens                         │
│    → Force re-authentication                            │
│                                                          │
│ 3. Suspicious activity detected                         │
│    → Revoke all tokens                                  │
│    → Lock account                                       │
│    → Notify user                                        │
│                                                          │
│ 4. User request                                         │
│    → "End all other sessions"                           │
│    → Revoke tokens except current                      │
│                                                          │
│ 5. Token expiry (natural)                               │
│    → Access token: 15 min                               │
│    → Refresh token: 30 days                             │
│    → ID token: Until access token expires               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Error Handling Flows

### Common Error Scenarios

```
1. Invalid Credentials
─────────────────────

POST /auth/login
{
  "email": "user@example.com",
  "password": "wrong_password"
}

Response: 401 Unauthorized
{
  "error": "invalid_credentials",
  "error_description": "Email or password is incorrect",
  "attempts_remaining": 2,
  "lockout_in": null
}

UI Display:
┌────────────────────────────┐
│ ❌ Login Failed             │
│                            │
│ Email or password is       │
│ incorrect.                 │
│                            │
│ Attempts remaining: 2      │
│                            │
│ [Forgot Password?]         │
│ [Try Again]                │
└────────────────────────────┘


2. Account Locked (Too Many Attempts)
──────────────────────────────────────

Response: 429 Too Many Requests
{
  "error": "account_locked",
  "error_description": "Too many failed login attempts",
  "locked_until": "2025-12-08T13:15:00Z",
  "duration_minutes": 15
}

UI Display:
┌────────────────────────────┐
│ 🔒 Account Temporarily     │
│    Locked                  │
│                            │
│ Too many failed attempts.  │
│ Try again in 15 minutes.   │
│                            │
│ Locked until: 13:15        │
│                            │
│ [Reset Password]           │
│ [Contact Support]          │
└────────────────────────────┘


3. MFA Code Invalid
────────────────────

POST /auth/mfa/verify
{
  "code": "123456",
  "session_id": "temp_xyz"
}

Response: 400 Bad Request
{
  "error": "invalid_mfa_code",
  "error_description": "The code you entered is incorrect or expired",
  "attempts_remaining": 2
}

UI Display:
┌────────────────────────────┐
│ ❌ Invalid Code             │
│                            │
│ The code is incorrect      │
│ or has expired.            │
│                            │
│ Attempts remaining: 2      │
│                            │
│ [Use Backup Code]          │
│ [Resend Code]              │
│ [Try Again]                │
└────────────────────────────┘


4. Session Expired
───────────────────

GET /api/user/profile
Authorization: Bearer expired_token

Response: 401 Unauthorized
{
  "error": "token_expired",
  "error_description": "Your session has expired",
  "expires_at": "2025-12-08T12:15:00Z"
}

UI Behavior:
1. Attempt token refresh automatically
2. If refresh fails → redirect to login
3. Save current state for return after login

┌────────────────────────────┐
│ ⏱️  Session Expired         │
│                            │
│ Please sign in again to    │
│ continue.                  │
│                            │
│ [Sign In]                  │
└────────────────────────────┘


5. QR Code Expired
───────────────────

GET /auth/qr/status/xyz123

Response: 410 Gone
{
  "error": "qr_expired",
  "error_description": "QR code has expired",
  "created_at": "2025-12-08T12:00:00Z",
  "expired_at": "2025-12-08T12:05:00Z",
  "validity_minutes": 5
}

UI Display:
┌────────────────────────────┐
│ ⏱️  QR Code Expired         │
│                            │
│ This QR code has expired.  │
│ Please generate a new one. │
│                            │
│ [Generate New QR]          │
└────────────────────────────┘


6. Rate Limit Exceeded
───────────────────────

POST /auth/oauth/token

Response: 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "error_description": "Too many requests",
  "retry_after": 60,
  "limit": 10,
  "window": "1 minute"
}

Headers:
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735513260

UI Display:
┌────────────────────────────┐
│ ⏱️  Too Many Requests       │
│                            │
│ You've made too many       │
│ requests. Please wait.     │
│                            │
│ Retry in: 60 seconds       │
│                            │
│ [OK]                       │
└────────────────────────────┘


7. Network Error
─────────────────

Request failed (no response from server)

Error: NetworkError

UI Display:
┌────────────────────────────┐
│ 📡 Connection Error         │
│                            │
│ Unable to connect to       │
│ Veyvault servers.          │
│                            │
│ Please check your internet │
│ connection and try again.  │
│                            │
│ [Retry]  [Offline Mode]    │
└────────────────────────────┘


8. Consent Denied
──────────────────

User clicks "Deny" on consent screen

Response: Redirect to app with error
https://app.example.com/callback?
  error=access_denied&
  error_description=User+denied+consent

App Behavior:
┌────────────────────────────┐
│ ❌ Login Cancelled          │
│                            │
│ You declined to share      │
│ your information.          │
│                            │
│ Some features may not be   │
│ available.                 │
│                            │
│ [Try Again]  [Continue]    │
└────────────────────────────┘
```

---

## Performance Metrics

```
Authentication Performance Targets:
┌──────────────────────────────────────────────────┐
│ Method              │ Target Time │ Success Rate │
├─────────────────────┼─────────────┼──────────────┤
│ QR Code Scan        │ <  2s       │ 99.5%        │
│ NFC Tap             │ <  1s       │ 99.8%        │
│ Biometric           │ <  1.5s     │ 99.9%        │
│ Magic Link          │ < 30s       │ 98.5%        │
│ Password + MFA      │ <  5s       │ 99.0%        │
│ Social OAuth        │ <  8s       │ 97.5%        │
│ Token Refresh       │ <  500ms    │ 99.9%        │
└──────────────────────────────────────────────────┘

System Scalability:
• Concurrent users: 1M+
• Authentications/sec: 10,000+
• Token validations/sec: 100,000+
• Global latency: < 200ms (p95)
```

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2025-12-08  
**Contact:** dev@veyvault.com
