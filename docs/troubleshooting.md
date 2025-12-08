# Troubleshooting Guide

Comprehensive troubleshooting guide for common issues with the Vey World Address SDK.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Address Validation Issues](#address-validation-issues)
3. [WebAuthn Issues](#webauthn-issues)
4. [Webhook Issues](#webhook-issues)
5. [Framework Integration Issues](#framework-integration-issues)
6. [Performance Issues](#performance-issues)
7. [Security Issues](#security-issues)
8. [API & Network Issues](#api--network-issues)
9. [Build & Deployment Issues](#build--deployment-issues)
10. [Getting Help](#getting-help)

---

## Installation Issues

### Package Not Found

**Problem:** `npm install @vey/core` fails with "404 Not Found"

**Solutions:**

1. Check package name spelling
   ```bash
   npm install @vey/core  # Correct
   npm install @vey/cores # Wrong
   ```

2. Check npm registry
   ```bash
   npm config get registry
   # Should be: https://registry.npmjs.org/
   ```

3. Clear npm cache
   ```bash
   npm cache clean --force
   npm install
   ```

### Version Conflicts

**Problem:** Peer dependency warnings or conflicts

**Solutions:**

1. Check version compatibility
   ```bash
   npm ls @vey/core
   ```

2. Use compatible versions
   ```json
   {
     "dependencies": {
       "@vey/core": "^1.0.0",
       "@vey/react": "^1.0.0"  // Same major version
     }
   }
   ```

3. Force resolution (npm 8.3+)
   ```json
   {
     "overrides": {
       "@vey/core": "^1.0.0"
     }
   }
   ```

4. Force resolution (Yarn)
   ```json
   {
     "resolutions": {
       "@vey/core": "^1.0.0"
     }
   }
   ```

### TypeScript Errors After Install

**Problem:** TypeScript can't find type definitions

**Solutions:**

1. Install type dependencies
   ```bash
   npm install --save-dev @types/node
   ```

2. Check `tsconfig.json`
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "skipLibCheck": true
     }
   }
   ```

3. Restart TypeScript server (VS Code)
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Select "TypeScript: Restart TS Server"

---

## Address Validation Issues

### Validation Always Fails

**Problem:** Valid addresses are rejected

**Diagnosis:**

```typescript
import { validateAddress, getCountryData } from '@vey/core';

// 1. Check country requirements
const countryData = await getCountryData('JP');
console.log('Required fields:', countryData.address_format.order);
console.log('Postal code format:', countryData.address_format.postal_code.regex);

// 2. Validate with detailed errors
const result = await validateAddress(address);
console.log('Validation result:', result);
console.log('Errors:', result.errors);
```

**Common Causes:**

1. **Missing required fields**
   ```typescript
   // ❌ Missing city
   const address = {
     country: 'JP',
     postal_code: '100-0001',
     province: '東京都',
     street_address: '千代田1-1',
   };
   
   // ✅ Include all required fields
   const address = {
     country: 'JP',
     postal_code: '100-0001',
     province: '東京都',
     city: '千代田区',  // Added
     street_address: '千代田1-1',
   };
   ```

2. **Wrong postal code format**
   ```typescript
   // ❌ Wrong format for Japan
   postal_code: '1000001'
   
   // ✅ Correct format (hyphen required)
   postal_code: '100-0001'
   ```

3. **Invalid province/state name**
   ```typescript
   // ❌ English name for local field
   province: 'Tokyo'
   
   // ✅ Local language required
   province: '東京都'
   ```

### Postal Code Validation Fails

**Problem:** Valid postal codes are rejected

**Solutions:**

1. Check format requirements
   ```typescript
   const countryData = await getCountryData('JP');
   console.log('Postal code regex:', countryData.address_format.postal_code.regex);
   console.log('Example:', countryData.address_format.postal_code.example);
   ```

2. Format correctly
   ```typescript
   // Japan
   '100-0001'  // ✅
   '1000001'   // ❌
   
   // USA
   '90210'      // ✅
   '90210-1234' // ✅ (ZIP+4)
   '902101234'  // ❌
   
   // UK
   'SW1A 1AA'  // ✅
   'sw1a1aa'   // ❌ (needs space and uppercase)
   ```

3. Validate before submission
   ```typescript
   function formatPostalCode(code: string, country: string): string {
     if (country === 'JP') {
       // Add hyphen if missing
       return code.replace(/^(\d{3})(\d{4})$/, '$1-$2');
     }
     if (country === 'GB') {
       // Uppercase and ensure space
       return code.toUpperCase().replace(/^([A-Z]{1,2}\d{1,2}[A-Z]?)(\d[A-Z]{2})$/, '$1 $2');
     }
     return code;
   }
   ```

### Province/State Not Found

**Problem:** Valid province names are rejected

**Solutions:**

1. Use province codes instead of names
   ```typescript
   // ❌ Name might not match
   province: 'Tokyo'
   
   // ✅ Use ISO code
   province: 'JP-13'
   
   // Or local name
   province: '東京都'
   ```

2. Get valid provinces
   ```typescript
   import { getProvinces } from '@vey/core';
   
   const provinces = await getProvinces('JP');
   console.log('Valid provinces:', provinces);
   ```

3. Implement autocomplete
   ```typescript
   const provinces = await getProvinces(address.country);
   const suggestions = provinces.filter(p => 
     p.name.toLowerCase().startsWith(query.toLowerCase())
   );
   ```

---

## WebAuthn Issues

### "WebAuthn not supported"

**Problem:** Browser doesn't support WebAuthn

**Check Support:**

```typescript
if (!window.PublicKeyCredential) {
  alert('Your browser does not support WebAuthn. Please use Chrome 67+, Safari 13+, or Firefox 60+.');
  return;
}
```

**Solutions:**

1. Update browser to latest version
2. Use supported browser:
   - Chrome/Edge 67+
   - Firefox 60+
   - Safari 13+
   - iOS Safari 14+

### "Security Error"

**Problem:** WebAuthn throws security error

**Common Causes:**

1. **Not using HTTPS**
   ```typescript
   // ❌ HTTP in production
   http://mysite.com
   
   // ✅ HTTPS required
   https://mysite.com
   
   // ✅ localhost allowed for development
   http://localhost:3000
   ```

2. **rpId mismatch**
   ```typescript
   // ❌ Wrong rpId
   const client = new WebAuthnClient({
     rpId: 'example.com',  // Current domain is mysite.com
   });
   
   // ✅ Match current domain
   const client = new WebAuthnClient({
     rpId: window.location.hostname,
   });
   ```

3. **Origin mismatch**
   ```typescript
   // Server verification
   if (clientData.origin !== 'https://mysite.com') {
     throw new Error('Origin mismatch');
   }
   ```

### "User cancelled"

**Problem:** User dismisses biometric prompt

**Handle Gracefully:**

```typescript
try {
  const result = await client.authenticate({ challenge });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // User cancelled - show friendly message
    showMessage('Authentication was cancelled. Please try again.');
  } else if (error.name === 'AbortError') {
    // Timeout
    showMessage('Authentication timed out. Please try again.');
  } else {
    // Other error
    console.error('WebAuthn error:', error);
  }
}
```

### Challenge Verification Fails

**Problem:** Server rejects challenge

**Solutions:**

1. Store challenge temporarily
   ```typescript
   // Store with short TTL
   await redis.set(`challenge:${userId}`, challenge, 'EX', 300);
   
   // Verify
   const storedChallenge = await redis.get(`challenge:${userId}`);
   if (clientData.challenge !== storedChallenge) {
     throw new Error('Challenge mismatch');
   }
   
   // Delete after use
   await redis.del(`challenge:${userId}`);
   ```

2. Don't reuse challenges
   ```typescript
   // ❌ Reusing challenge
   const challenge = 'same-challenge-for-everyone';
   
   // ✅ Generate unique challenge
   import { WebAuthnCrypto } from '@vey/webauthn';
   const challenge = WebAuthnCrypto.generateChallengeBase64url();
   ```

---

## Webhook Issues

### Webhooks Not Received

**Problem:** Webhook endpoint never receives events

**Diagnosis:**

1. Check endpoint accessibility
   ```bash
   curl -X POST https://your-domain.com/webhooks/addresses \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

2. Check webhook configuration
   ```typescript
   console.log('Webhook URL:', process.env.WEBHOOK_URL);
   console.log('Webhook Secret:', process.env.WEBHOOK_SECRET ? 'Set' : 'Missing');
   ```

3. Check firewall/security groups
   - Allow incoming HTTPS traffic on port 443
   - Whitelist Vey webhook IPs if needed

**Solutions:**

1. **Use ngrok for local testing**
   ```bash
   # Install ngrok
   npm install -g ngrok
   
   # Start your server
   npm run dev
   
   # Expose to internet
   ngrok http 3000
   
   # Use ngrok URL
   # https://abc123.ngrok.io/webhooks/addresses
   ```

2. **Verify HTTPS certificate**
   ```bash
   curl -v https://your-domain.com/webhooks/addresses
   ```

3. **Check server logs**
   ```typescript
   app.post('/webhooks/addresses', (req, res) => {
     console.log('Webhook received:', req.headers, req.body);
     // ... handle webhook
   });
   ```

### Signature Verification Fails

**Problem:** All webhooks fail signature verification

**Common Causes:**

1. **Using parsed JSON instead of raw body**
   ```typescript
   // ❌ Wrong - body is parsed and re-stringified
   app.use(express.json());
   app.post('/webhooks', async (req, res) => {
     const signature = req.headers['x-vey-signature'];
     const body = JSON.stringify(req.body); // Modified!
     const valid = await verifySignature(body, signature, secret);
   });
   
   // ✅ Correct - preserve raw body
   app.use('/webhooks', express.text({ type: 'application/json' }));
   app.post('/webhooks', async (req, res) => {
     const signature = req.headers['x-vey-signature'];
     const body = req.body; // Raw string
     const valid = await verifySignature(body, signature, secret);
   });
   ```

2. **Wrong secret**
   ```typescript
   // Check secret is correct
   console.log('Using secret:', process.env.WEBHOOK_SECRET);
   
   // Test signature generation
   import { createSignature } from '@vey/webhooks';
   const testSig = await createSignature('test payload', secret);
   console.log('Test signature:', testSig);
   ```

3. **Encoding issues**
   ```typescript
   // Ensure UTF-8 encoding
   const body = Buffer.from(req.body).toString('utf8');
   ```

**Debug:**

```typescript
import { verifySignature } from '@vey/webhooks';

app.post('/webhooks', async (req, res) => {
  const signature = req.headers['x-vey-signature'];
  const body = req.body;
  
  console.log('Received signature:', signature);
  console.log('Body type:', typeof body);
  console.log('Body length:', body.length);
  console.log('Body preview:', body.substring(0, 100));
  
  const valid = await verifySignature(body, signature, process.env.WEBHOOK_SECRET!);
  console.log('Signature valid:', valid);
  
  if (!valid) {
    console.error('Signature verification failed!');
    // Log for debugging
    await fs.writeFile('webhook-debug.json', JSON.stringify({
      headers: req.headers,
      body: body,
      signature: signature,
    }, null, 2));
  }
});
```

### Duplicate Events

**Problem:** Same webhook received multiple times

**Solution: Implement Idempotency**

```typescript
import { createWebhookHandler } from '@vey/webhooks';

const handler = createWebhookHandler({
  secret: process.env.WEBHOOK_SECRET!,
});

handler.on('*', async (event, data, payload) => {
  // Create unique event ID
  const eventId = `${event}_${data.address_id}_${payload.timestamp}`;
  
  // Check if already processed
  const exists = await redis.exists(eventId);
  if (exists) {
    console.log('Duplicate event detected, skipping');
    return;
  }
  
  // Mark as processed (24 hour TTL)
  await redis.set(eventId, '1', 'EX', 86400);
  
  // Process event
  await processEvent(event, data);
});
```

---

## Framework Integration Issues

### React Hook Errors

**Problem:** "Invalid hook call" or "Hooks can only be called inside the body of a function component"

**Solutions:**

1. Ensure using React 16.8+
   ```bash
   npm ls react
   # Should be 16.8.0 or higher
   ```

2. Only call hooks at top level
   ```typescript
   // ❌ Wrong - hook in condition
   function Component() {
     if (condition) {
       const { validate } = useAddressValidation();
     }
   }
   
   // ✅ Correct - hook at top level
   function Component() {
     const { validate } = useAddressValidation();
     
     if (condition) {
       // use validate here
     }
   }
   ```

3. Check for duplicate React versions
   ```bash
   npm ls react
   # Should only show one version
   
   # Fix duplicates
   npm dedupe
   ```

### Next.js Import Errors

**Problem:** "Module not found" or "Cannot use import statement outside a module"

**Solutions:**

1. Use correct import for server/client components
   ```typescript
   // ✅ Server component (app router)
   import { validateAddress } from '@vey/core';
   
   // ✅ Client component
   'use client';
   import { useAddressValidation } from '@vey/next';
   ```

2. Configure Next.js for SDK
   ```javascript
   // next.config.js
   module.exports = {
     transpilePackages: ['@vey/core', '@vey/react'],
   };
   ```

3. Check import paths
   ```typescript
   // ❌ Wrong
   import { validateAddress } from '@vey/core/dist/index';
   
   // ✅ Correct
   import { validateAddress } from '@vey/core';
   ```

### Vue Composition API Errors

**Problem:** "inject() can only be used inside setup()"

**Solutions:**

1. Use Composition API correctly
   ```vue
   <script setup lang="ts">
   // ✅ Correct - using <script setup>
   import { useAddressValidation } from '@vey/vue';
   const { validate } = useAddressValidation();
   </script>
   
   <script lang="ts">
   // ❌ Wrong - not using setup()
   import { useAddressValidation } from '@vey/vue';
   const { validate } = useAddressValidation();
   </script>
   ```

2. Ensure Vue 3
   ```bash
   npm ls vue
   # Should be 3.x
   ```

---

## Performance Issues

### Slow Validation

**Problem:** Address validation takes too long

**Solutions:**

1. **Cache country data**
   ```typescript
   const countryCache = new Map();
   
   async function getCachedCountryData(code: string) {
     if (!countryCache.has(code)) {
       const data = await getCountryData(code);
       countryCache.set(code, data);
     }
     return countryCache.get(code);
   }
   ```

2. **Debounce validation**
   ```typescript
   import { debounce } from 'lodash';
   
   const debouncedValidate = debounce(async (address) => {
     const result = await validateAddress(address);
     setErrors(result.errors);
   }, 500); // Wait 500ms after user stops typing
   
   // Use in onChange
   onChange={(e) => {
     setAddress({ ...address, [field]: e.target.value });
     debouncedValidate({ ...address, [field]: e.target.value });
   }}
   ```

3. **Validate on blur, not on change**
   ```typescript
   <input
     onBlur={() => validateField('postal_code')}
     // Instead of onChange validation
   />
   ```

4. **Use client-side validation first**
   ```typescript
   // Quick client-side checks
   if (!address.postal_code) {
     setError('Postal code required');
     return;
   }
   
   // Only call API if client-side checks pass
   const result = await validateAddress(address);
   ```

### Large Bundle Size

**Problem:** SDK increases bundle size significantly

**Solutions:**

1. **Use tree-shaking**
   ```typescript
   // ❌ Imports everything
   import * as Vey from '@vey/core';
   
   // ✅ Import only what you need
   import { validateAddress, getCountryData } from '@vey/core';
   ```

2. **Dynamic imports**
   ```typescript
   // Load heavy features on demand
   const handleGeocode = async () => {
     const { geocodeAddress } = await import('@vey/core/geocoding');
     const coords = await geocodeAddress(address);
   };
   ```

3. **Check bundle analyzer**
   ```bash
   npm install --save-dev webpack-bundle-analyzer
   
   # Analyze bundle
   npm run build -- --analyze
   ```

---

## Security Issues

### API Key Exposed

**Problem:** API key visible in client-side code

**Solutions:**

1. **Use environment variables**
   ```typescript
   // ❌ Hardcoded
   const apiKey = 'vey_abc123';
   
   // ✅ Environment variable
   const apiKey = process.env.VEY_API_KEY;
   ```

2. **Use public vs secret keys correctly**
   ```typescript
   // Client-side: Use public key
   const publicKey = process.env.NEXT_PUBLIC_VEY_PUBLIC_KEY;
   
   // Server-side: Use secret key
   const secretKey = process.env.VEY_SECRET_KEY;
   ```

3. **Proxy through your backend**
   ```typescript
   // Client calls your API
   const result = await fetch('/api/validate', {
     method: 'POST',
     body: JSON.stringify(address),
   });
   
   // Your backend calls Vey
   // api/validate.ts
   const result = await validateAddress(address, {
     apiKey: process.env.VEY_SECRET_KEY,
   });
   ```

### CORS Errors

**Problem:** Browser blocks requests due to CORS

**Solutions:**

1. **Configure CORS on server**
   ```typescript
   import cors from 'cors';
   
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS.split(','),
     credentials: true,
   }));
   ```

2. **Use proxy in development**
   ```javascript
   // vite.config.ts
   export default {
     server: {
       proxy: {
         '/api': 'http://localhost:3000',
       },
     },
   };
   ```

---

## API & Network Issues

### "401 Unauthorized"

**Problem:** API requests fail with 401

**Check:**
```typescript
console.log('API Key:', process.env.VEY_API_KEY ? 'Set' : 'Missing');
```

**Solutions:**

1. Verify API key is set
2. Check key hasn't expired
3. Ensure using correct environment (dev/prod)

### "429 Too Many Requests"

**Problem:** Rate limit exceeded

**Solutions:**

1. **Implement caching**
   ```typescript
   const cache = new Map();
   
   async function getCachedValidation(address) {
     const key = JSON.stringify(address);
     if (cache.has(key)) {
       return cache.get(key);
     }
     
     const result = await validateAddress(address);
     cache.set(key, result);
     return result;
   }
   ```

2. **Add retry with backoff**
   ```typescript
   async function validateWithRetry(address, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await validateAddress(address);
       } catch (error) {
         if (error.status === 429 && i < maxRetries - 1) {
           await sleep(1000 * Math.pow(2, i)); // Exponential backoff
           continue;
         }
         throw error;
       }
     }
   }
   ```

### Network Timeout

**Problem:** Requests timeout

**Solutions:**

1. **Increase timeout**
   ```typescript
   const result = await validateAddress(address, {
     timeout: 30000, // 30 seconds
   });
   ```

2. **Add timeout handling**
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 10000);
   
   try {
     const result = await validateAddress(address, {
       signal: controller.signal,
     });
   } catch (error) {
     if (error.name === 'AbortError') {
       console.error('Request timed out');
     }
   } finally {
     clearTimeout(timeoutId);
   }
   ```

---

## Build & Deployment Issues

### TypeScript Build Errors

**Problem:** Build fails with TypeScript errors

**Solutions:**

1. **Check tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "node",
       "esModuleInterop": true,
       "skipLibCheck": true,
       "strict": true
     }
   }
   ```

2. **Install type definitions**
   ```bash
   npm install --save-dev @types/node
   ```

3. **Skip lib check temporarily**
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true
     }
   }
   ```

### Production Deployment Errors

**Problem:** Works locally but fails in production

**Check:**

1. **Environment variables**
   ```bash
   # Verify all required env vars are set
   echo $VEY_API_KEY
   echo $WEBHOOK_SECRET
   ```

2. **Build output**
   ```bash
   npm run build
   ls -la dist/
   ```

3. **Node version**
   ```bash
   node --version
   # Should be 16+ for SDK
   ```

**Solutions:**

1. **Use same Node version**
   ```json
   // package.json
   {
     "engines": {
       "node": ">=16.0.0"
     }
   }
   ```

2. **Check production dependencies**
   ```bash
   npm install --production
   ```

---

## Getting Help

### Check Documentation

- [Integration Guide](./integration-guide.md)
- [WebAuthn Guide](./webauthn-integration.md)
- [Webhook Guide](./webhook-integration.md)
- [Examples](../examples)

### Search Issues

Search [GitHub Issues](https://github.com/rei-k/world-address/issues) for similar problems.

### Create Issue

If you can't find a solution, [create an issue](https://github.com/rei-k/world-address/issues/new) with:

1. **Description** - What's the problem?
2. **Steps to reproduce** - How can we reproduce it?
3. **Expected behavior** - What should happen?
4. **Actual behavior** - What actually happens?
5. **Environment** - OS, Node version, SDK version
6. **Code sample** - Minimal reproduction code

### Enable Debug Logging

```typescript
// Enable debug mode
process.env.VEY_DEBUG = 'true';

// SDK will log detailed information
const result = await validateAddress(address);
```

### Community Support

- [Discord Community](https://discord.gg/vey)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vey-address)

---

## License

MIT
