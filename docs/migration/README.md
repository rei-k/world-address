# Authentication Migration Guides

This directory contains comprehensive guides for migrating from various authentication providers to Vey's WebAuthn-based passwordless authentication.

## Available Migration Guides

### 1. [Auth0 to Vey](./auth0-to-vey.md)
Migrate from Auth0 to Vey's WebAuthn authentication system.

**Key Topics:**
- Comparison table: Auth0 vs Vey
- Step-by-step migration process
- User data migration strategies
- Session management updates
- Best practices and common issues

**Best For:** Applications using Auth0 for authentication and want to move to passwordless biometric authentication.

### 2. [Firebase Auth to Vey](./firebase-auth-to-vey.md)
Migrate from Firebase Authentication to Vey's WebAuthn authentication.

**Key Topics:**
- Firebase Auth vs Vey comparison
- Replacing Firebase auth methods
- Backend verification updates
- Database migration (from Firestore)
- Email verification replacement
- Testing strategies

**Best For:** Applications built on Firebase platform looking to reduce vendor lock-in and adopt WebAuthn.

### 3. [Okta to Vey](./okta-to-vey.md)
Migrate from Okta to Vey's WebAuthn authentication system.

**Key Topics:**
- Okta vs Vey comparison
- Replacing OIDC/SAML flows
- SSO migration strategies
- Role and group management
- MFA replacement (WebAuthn is inherently MFA)
- Directory sync alternatives
- Audit logging implementation

**Best For:** Enterprise applications using Okta for identity management and SSO.

### 4. [OAuth2 to Vey](./oauth2-to-vey.md)
General guide for migrating from any OAuth2-based authentication to Vey.

**Key Topics:**
- OAuth2 flow vs WebAuthn flow comparison
- Removing redirect-based authentication
- Token management elimination
- Scope/permission migration
- Social login replacement
- API access patterns

**Best For:** Applications using custom OAuth2 implementations or any OAuth2-based provider.

## Quick Comparison

| Provider | Complexity | Migration Time | Data Export | Recommended Strategy |
|----------|-----------|----------------|-------------|----------------------|
| **Auth0** | Medium | 1-2 weeks | API available | Gradual migration |
| **Firebase** | Medium-High | 2-3 weeks | Admin SDK | Dual authentication |
| **Okta** | High | 3-4 weeks | API available | Phased rollout |
| **OAuth2** | Varies | 1-4 weeks | Depends | Depends on provider |

## General Migration Process

All migration guides follow a similar structure:

### Phase 1: Preparation (1-3 days)
1. Install Vey SDK (`@vey/core`)
2. Set up development environment
3. Review current authentication flow
4. Export user data from current provider

### Phase 2: Backend Implementation (3-7 days)
1. Set up database for users and credentials
2. Implement WebAuthn registration endpoint
3. Implement WebAuthn authentication endpoint
4. Set up session management
5. Create challenge generation system

### Phase 3: Frontend Update (2-5 days)
1. Remove existing auth provider SDK
2. Integrate Vey WebAuthn client
3. Update registration flow
4. Update login flow
5. Add browser compatibility checks

### Phase 4: Data Migration (1-3 days)
1. Export users from existing provider
2. Import users to new database
3. Flag users for WebAuthn setup
4. Send migration notifications

### Phase 5: Testing (3-7 days)
1. Test registration on multiple devices
2. Test authentication on multiple browsers
3. Test session management
4. Test edge cases and error handling
5. Performance testing

### Phase 6: Deployment (1-2 days)
1. Deploy to staging environment
2. Run smoke tests
3. Deploy to production
4. Monitor authentication metrics

### Phase 7: Cleanup (1-2 days)
1. Remove old authentication code
2. Remove provider SDKs and dependencies
3. Update documentation
4. Deactivate old provider account

## Common Migration Patterns

### Pattern 1: Gradual Migration (Recommended)

Maintain both authentication systems during transition:

```javascript
// Allow both old and new authentication
app.post('/api/auth/login', async (req, res) => {
  const { method, ...credentials } = req.body;
  
  if (method === 'webauthn') {
    // New: Vey WebAuthn
    return handleWebAuthnAuth(req, res);
  } else if (method === 'legacy') {
    // Old: Existing provider
    return handleLegacyAuth(req, res);
  }
  
  res.status(400).json({ error: 'Invalid auth method' });
});

// Prompt users to upgrade
if (user.hasLegacyAuth && !user.hasWebAuthn) {
  showUpgradePrompt();
}
```

### Pattern 2: Forced Migration

Require all users to set up WebAuthn:

```javascript
// Redirect to migration page
app.get('/app/*', requireAuth, async (req, res, next) => {
  if (!req.user.hasWebAuthn) {
    return res.redirect('/migrate');
  }
  next();
});

// Migration page
app.get('/migrate', requireAuth, (req, res) => {
  res.render('migration', {
    userId: req.user.id,
    email: req.user.email,
    name: req.user.displayName
  });
});
```

### Pattern 3: New Users Only

Only new users use WebAuthn, existing users keep old auth:

```javascript
// Registration only allows WebAuthn
app.post('/api/auth/register', async (req, res) => {
  // Only WebAuthn registration allowed
  return handleWebAuthnRegistration(req, res);
});

// Login supports both
app.post('/api/auth/login', async (req, res) => {
  // Check if user has WebAuthn
  const user = await findUserByCredential(req.body.credentialId);
  
  if (user) {
    return handleWebAuthnAuth(req, res);
  } else {
    return handleLegacyAuth(req, res);
  }
});
```

## Technology Stack

All migrations involve these technologies:

### Client-Side
- **@vey/core** - WebAuthn client SDK
- Modern browser with WebAuthn support

### Server-Side
- **@simplewebauthn/server** - WebAuthn verification library
- **express-session** - Session management
- **connect-redis** - Distributed session storage (recommended)
- Database (PostgreSQL, MySQL, MongoDB, etc.)

### Infrastructure
- HTTPS (required for WebAuthn)
- Redis (recommended for sessions)
- Session-compatible hosting (not serverless by default)

## Browser Compatibility

WebAuthn is supported by:

- ✅ Chrome 67+
- ✅ Firefox 60+
- ✅ Safari 13+
- ✅ Edge 18+
- ✅ iOS Safari 14.5+
- ✅ Android Chrome 70+

For older browsers, provide fallback authentication (magic link, email OTP).

## Security Considerations

### Advantages of WebAuthn over Traditional Auth
1. **No Passwords**: No password database to breach
2. **Phishing Resistant**: Origin binding prevents phishing
3. **Biometric Privacy**: Biometric data never leaves device
4. **Multi-Factor Built-In**: Device + biometric/PIN
5. **No Session Hijacking**: Credential is device-bound

### Migration Security Checklist
- [ ] Use HTTPS everywhere (required for WebAuthn)
- [ ] Generate challenges server-side
- [ ] Verify origin and RP ID
- [ ] Use constant-time comparison for signatures
- [ ] Store credentials securely (encrypted at rest)
- [ ] Implement rate limiting
- [ ] Log authentication events
- [ ] Monitor for suspicious activity
- [ ] Test against common attacks (CSRF, XSS, etc.)

## Cost Comparison

| Provider | Before (100K users) | After (Vey) | Annual Savings |
|----------|--------------------:|------------:|---------------:|
| Auth0 | ~$35,000/year | ~$2,000/year | **$33,000** |
| Firebase | ~$15,000/year | ~$2,000/year | **$13,000** |
| Okta | ~$50,000/year | ~$2,000/year | **$48,000** |
| AWS Cognito | ~$5,000/year | ~$2,000/year | **$3,000** |

*Costs are estimates. Vey costs include infrastructure (database, Redis, hosting).*

## Support and Resources

### Documentation
- [WebAuthn Integration Guide](./webauthn-integration.md)
- [Webhook Integration Guide](./webhook-integration.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Vey API Documentation](../veyform/)

### External Resources
- [WebAuthn Guide](https://webauthn.guide/) - Comprehensive WebAuthn documentation
- [W3C WebAuthn Spec](https://www.w3.org/TR/webauthn-2/) - Official specification
- [MDN WebAuthn](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API) - Browser API documentation

### Community
- [GitHub Repository](https://github.com/rei-k/world-address)
- [Issue Tracker](https://github.com/rei-k/world-address/issues)
- [Discussions](https://github.com/rei-k/world-address/discussions)

## Need Help?

If you encounter issues during migration:

1. **Check Documentation**: Review the relevant migration guide and troubleshooting docs
2. **Search Issues**: Check if others have encountered similar issues
3. **Open an Issue**: Provide details about your setup and the problem
4. **Community Discussion**: Ask questions in GitHub Discussions

## Contributing

Found an issue in the migration guides? Have suggestions for improvement?

1. Fork the repository
2. Make your changes
3. Submit a pull request

We welcome contributions that improve the migration experience!

## License

MIT License - See [LICENSE](../../LICENSE) for details
