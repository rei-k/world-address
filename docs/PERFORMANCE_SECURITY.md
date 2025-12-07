# Performance & Security Best Practices

## Performance Optimization

### Request Caching

The SDK includes built-in caching for geocoding requests:

```typescript
import { 
  forwardGeocode, 
  clearGeocodingCache, 
  getGeocodingCacheStats 
} from '@vey/core';

// Geocoding with automatic caching
const result = await forwardGeocode({
  address: { city: 'Tokyo', country: 'JP' }
});

// Check cache statistics
const stats = getGeocodingCacheStats();
console.log('Cache size:', stats.size);
console.log('Cached entries:', stats.keys);

// Clear cache when needed
clearGeocodingCache();
```

### Rate Limiting

Implement rate limiting for API calls to prevent abuse:

```typescript
/**
 * Simple rate limiter utility
 */
class RateLimiter {
  private requests: number[] = [];
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  async throttle(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      
      console.warn(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

// Usage
const limiter = new RateLimiter(100, 60000); // 100 requests per minute

async function validateWithRateLimit(address: AddressInput) {
  await limiter.throttle();
  return validateAddress(address, format);
}
```

### Custom Rate Limiter with Exponential Backoff

```typescript
class ExponentialBackoffLimiter {
  private failureCount = 0;
  private baseDelay = 1000; // 1 second
  private maxDelay = 60000; // 1 minute
  
  async executeWithBackoff<T>(
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await fn();
      this.failureCount = 0; // Reset on success
      return result;
    } catch (error) {
      this.failureCount++;
      const delay = Math.min(
        this.baseDelay * Math.pow(2, this.failureCount),
        this.maxDelay
      );
      
      console.warn(`Request failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.executeWithBackoff(fn);
    }
  }
}

// Usage
const backoffLimiter = new ExponentialBackoffLimiter();

const result = await backoffLimiter.executeWithBackoff(() =>
  forwardGeocode({ address: { city: 'Tokyo', country: 'JP' } })
);
```

### Performance Monitoring

```typescript
/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  async measure<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric(name, duration);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }
  
  private recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(duration);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }
  
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    
    if (values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
  
  getAllStats() {
    const stats: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name);
    }
    
    return stats;
  }
}

// Usage
const monitor = new PerformanceMonitor();

const result = await monitor.measure('address-validation', () =>
  validateAddress(address, format)
);

console.log('Performance stats:', monitor.getStats('address-validation'));
```

## Security Best Practices

### Secure Headers

When building an API server, always include security headers:

```typescript
import express from 'express';

const app = express();

// Security headers middleware
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Restrict referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  
  // HTTPS only (in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});
```

### Input Sanitization

Always sanitize user input before validation:

```typescript
function sanitizeAddressInput(address: any): AddressInput {
  return {
    country: sanitizeString(address.country),
    postal_code: sanitizeString(address.postal_code),
    province: sanitizeString(address.province),
    city: sanitizeString(address.city),
    street_address: sanitizeString(address.street_address),
    // ... other fields
  };
}

function sanitizeString(value: any): string {
  if (typeof value !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length (prevent DoS)
  const MAX_LENGTH = 500;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
}

// Usage
app.post('/api/validate-address', async (req, res) => {
  const sanitized = sanitizeAddressInput(req.body);
  const format = await loadCountryFormat(sanitized.country);
  const result = validateAddress(sanitized, format);
  
  res.json(result);
});
```

### API Key Management

Never expose API keys in client-side code:

```typescript
// ❌ Bad: API key in frontend code
const apiKey = 'sk_live_12345...';

// ✅ Good: API key on backend only
// Backend (Node.js/Express)
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VEY_API_KEY;

app.post('/api/geocode', async (req, res) => {
  // API key is safe on the backend
  const result = await geocodeWithKey(req.body.address, API_KEY);
  res.json(result);
});

// Frontend
// No API key exposed - calls your backend instead
fetch('/api/geocode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address })
});
```

### Dependency Audit

Regularly audit dependencies for vulnerabilities:

```bash
# Run npm audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# View detailed report
npm audit --json > audit-report.json

# Use GitHub Actions for automated auditing
# See .github/workflows/dependency-audit.yml
```

### Secure Data Storage

When storing address data:

```typescript
import { encryptAddress, decryptAddress } from '@vey/core';

// Encrypt before storing
const encrypted = await encryptAddress(address, encryptionKey);
await database.save({ id, encryptedData: encrypted });

// Decrypt when retrieving
const record = await database.findById(id);
const decrypted = await decryptAddress(record.encryptedData, encryptionKey);
```

### CORS Configuration

Properly configure CORS for your API:

```typescript
import cors from 'cors';

// ❌ Bad: Allow all origins
app.use(cors());

// ✅ Good: Whitelist specific origins
const allowedOrigins = [
  'https://yourapp.com',
  'https://www.yourapp.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400 // 24 hours
}));
```

### Request Validation

Validate all incoming requests:

```typescript
import Joi from 'joi';

const addressSchema = Joi.object({
  country: Joi.string().length(2).required(),
  postal_code: Joi.string().max(20).required(),
  province: Joi.string().max(100),
  city: Joi.string().max(100).required(),
  street_address: Joi.string().max(500),
});

app.post('/api/validate-address', async (req, res) => {
  try {
    // Validate request body
    const validated = await addressSchema.validateAsync(req.body);
    
    // Process validated data
    const format = await loadCountryFormat(validated.country);
    const result = validateAddress(validated, format);
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Monitoring & Logging

### Structured Logging

Use structured logging for better monitoring:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log validation attempts
logger.info('Address validation', {
  country: address.country,
  valid: result.valid,
  errorCount: result.errors.length,
  timestamp: new Date().toISOString()
});
```

### Error Tracking

Integrate error tracking (e.g., Sentry):

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

try {
  const result = validateAddress(address, format);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      country: address.country,
      function: 'validateAddress'
    }
  });
  throw error;
}
```

## Checklist

### Before Deploying to Production

- [ ] All dependencies audited and vulnerabilities fixed
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] API keys stored securely (environment variables)
- [ ] Input sanitization enabled
- [ ] CORS properly configured
- [ ] Request validation in place
- [ ] HTTPS enforced
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Caching strategy implemented
- [ ] Logging configured

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)

## License

MIT
