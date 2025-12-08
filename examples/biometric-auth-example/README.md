# Biometric Authentication Example

This example demonstrates how to implement passwordless biometric authentication using the `@vey/webauthn` SDK with WebAuthn/FIDO2.

## Features

- 👆 **Fingerprint/Face ID Registration** - Create passkeys with biometric authentication
- 🔐 **Passwordless Login** - Sign in using biometrics without passwords
- 📱 **Platform Authenticator Detection** - Check device capabilities
- 🔑 **Passkey Management** - View, rename, and delete passkeys
- ✨ **Conditional UI** - Autofill integration for seamless authentication

## Quick Start

### 1. Open the Example

```bash
cd examples/biometric-auth-example
```

### 2. Open in Browser

Open `index.html` in a web browser. **Note:** WebAuthn requires HTTPS or localhost.

For local testing:
```bash
# Use a simple HTTP server
python3 -m http.server 8000
# Or
npx serve .
```

Then visit: http://localhost:8000

## How It Works

### Registration Flow

1. User clicks "Register Passkey"
2. System checks for platform authenticator support
3. Server generates a challenge
4. Browser prompts for biometric (fingerprint/Face ID)
5. Passkey is created and stored in device's secure enclave
6. Public key is sent to server for verification

### Authentication Flow

1. User clicks "Sign In with Passkey"
2. Server generates a challenge
3. Browser prompts for biometric
4. Device signs the challenge with private key
5. Signature is sent to server for verification
6. User is authenticated and logged in

## Demo Features

### Platform Detection
- Checks if WebAuthn is supported
- Detects platform authenticator availability
- Shows conditional UI support status
- Displays platform and browser information

### Registration
- Create passkeys with biometric authentication
- Custom credential naming
- Device detection and labeling
- Duplicate credential prevention

### Authentication
- Sign in with registered passkeys
- Conditional UI/autofill support
- Error handling and user feedback

### Passkey Management
- List all registered passkeys
- View creation and last used dates
- Rename passkeys
- Delete passkeys
- Export/import passkey metadata

## Code Structure

```
biometric-auth-example/
├── index.html          # Main demo page
├── styles.css          # Styling
├── app.js             # Main application logic
├── mock-server.js     # Mock backend for demo
└── README.md          # This file
```

## Mock Server

This example includes a mock server (`mock-server.js`) that simulates backend operations:

- Challenge generation
- Registration verification
- Authentication verification
- Session management

**Note:** In production, implement proper server-side verification with cryptographic libraries.

## Security Notes

### Client-Side
- ✅ Private keys never leave the device
- ✅ Stored in secure enclave (iOS) or TPM (Windows)
- ✅ Biometric verification required
- ✅ Origin binding prevents phishing

### Server-Side (Production Requirements)
- Verify challenge matches
- Validate origin domain
- Check signature with public key
- Implement rate limiting
- Use HTTPS only
- Store public keys securely

## Browser Support

Tested on:
- ✅ Chrome 90+ (Windows, macOS, Android)
- ✅ Safari 14+ (iOS, macOS)
- ✅ Edge 90+
- ✅ Firefox 87+

## Troubleshooting

### "WebAuthn is not supported"
- Ensure you're using HTTPS or localhost
- Update your browser to the latest version
- Check if your device has a platform authenticator

### "No platform authenticator available"
- iOS: Requires Touch ID or Face ID enabled
- macOS: Requires Touch ID or password
- Windows: Requires Windows Hello
- Android: Requires fingerprint or face unlock

### "Registration failed"
- Check browser console for detailed errors
- Ensure you're not registering duplicate credentials
- Try clearing existing passkeys from device settings

## Learn More

- [WebAuthn Specification](https://www.w3.org/TR/webauthn/)
- [FIDO Alliance](https://fidoalliance.org/)
- [@vey/webauthn Documentation](../../sdk/webauthn/README.md)

## License

MIT
