# Middleware Guide

This guide covers the middleware utilities available in the Next.js example application.

## Table of Contents

- [Overview](#overview)
- [Rate Limiting](#rate-limiting)
- [Request Logging](#request-logging)
- [CORS](#cors)
- [Creating Custom Middleware](#creating-custom-middleware)

## Overview

The application includes several middleware utilities for:

- **Rate Limiting** - Prevent abuse and ensure fair usage
- **Request Logging** - Track and debug API requests
- **CORS** - Control cross-origin access
- **Authentication** - Covered in [AUTHENTICATION.md](./AUTHENTICATION.md)

All middleware is located in `src/lib/middleware.ts`.

## Rate Limiting

Rate limiting prevents abuse by limiting the number of requests a client can make within a time window.

### Default Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 1 minute |

### Basic Usage

```typescript
import { apiRateLimiter, rateLimitMiddleware, getClientIP } from '@/lib/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request, clientIP, apiRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse; // Returns 429 if limit exceeded
  }

  // Process request
  // ...
}
```

### Custom Rate Limiter

Create a custom rate limiter for specific endpoints:

```typescript
import { RateLimiter } from '@/lib/middleware';

// 10 requests per 5 minutes
const customLimiter = new RateLimiter(300000, 10);

export async function POST(request: NextRequest) {
  const identifier = getClientIP(request);
  
  const rateLimitResponse = rateLimitMiddleware(
    request, 
    identifier, 
    customLimiter
  );
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // ... your logic
}
```

### Rate Limit by User

Use user ID instead of IP for authenticated endpoints:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit by user ID
  const rateLimitResponse = rateLimitMiddleware(
    request,
    session.user.id,
    apiRateLimiter
  );
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // ... your logic
}
```

### Rate Limit Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200000
Retry-After: 60
```

Example response when limit is exceeded:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

### Client-side Handling

```typescript
async function makeRequest() {
  const response = await fetch('/api/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
    return makeRequest();
  }

  return response.json();
}
```

### Exponential Backoff

Implement exponential backoff for better retry logic:

```typescript
async function makeRequestWithBackoff(url: string, options: RequestInit, maxRetries = 3) {
  let retries = 0;
  let delay = 1000; // Start with 1 second

  while (retries < maxRetries) {
    const response = await fetch(url, options);

    if (response.status !== 429) {
      return response;
    }

    retries++;
    console.log(`Rate limited. Retry ${retries}/${maxRetries} after ${delay}ms`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    delay *= 2; // Exponential backoff
  }

  throw new Error('Max retries exceeded');
}
```

### Production Considerations

For production, use a distributed cache like Redis:

```typescript
// Example with Redis (not included in demo)
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

class RedisRateLimiter {
  constructor(private windowMs: number, private maxRequests: number) {}

  async check(identifier: string) {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    
    // Remove old entries
    await redis.zremrangebyscore(key, 0, now - this.windowMs);
    
    // Count requests in window
    const count = await redis.zcard(key);
    
    if (count >= this.maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    
    // Add new request
    await redis.zadd(key, now, `${now}`);
    await redis.expire(key, Math.ceil(this.windowMs / 1000));
    
    return { allowed: true, remaining: this.maxRequests - count - 1 };
  }
}
```

## Request Logging

Log all requests for debugging and monitoring.

### Basic Usage

```typescript
import { logRequest, getClientIP } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  // Log request
  logRequest(request, { clientIP });

  // ... your logic
}
```

### Log Output

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "method": "POST",
  "url": "http://localhost:3000/api/addresses",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "clientIP": "127.0.0.1"
}
```

### Log with Response

```typescript
import { logRequest, logResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const log = logRequest(request);

  try {
    // ... your logic
    const response = NextResponse.json({ success: true });
    
    // Log response
    logResponse({
      ...log,
      duration: Date.now() - startTime
    }, response);
    
    return response;
  } catch (error) {
    // Log error
    console.error('[ERROR]', { ...log, error: error.message });
    throw error;
  }
}
```

### Custom Log Fields

```typescript
logRequest(request, {
  userId: session?.user?.id,
  action: 'CREATE_ADDRESS',
  metadata: { country: 'JP' }
});
```

### Production Logging

Send logs to monitoring services:

```typescript
// Example with DataDog (not included)
import { datadogLogs } from '@datadog/browser-logs';

export function logRequest(request: NextRequest, additionalInfo?: Record<string, any>) {
  const log = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    ...additionalInfo
  };

  // Console log for development
  console.log('[REQUEST]', JSON.stringify(log));

  // Send to DataDog in production
  if (process.env.NODE_ENV === 'production') {
    datadogLogs.logger.info('API Request', log);
  }

  return log;
}
```

### Log Levels

Implement different log levels:

```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

function log(level: LogLevel, message: string, data?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };

  switch (level) {
    case LogLevel.ERROR:
      console.error('[ERROR]', logEntry);
      break;
    case LogLevel.WARN:
      console.warn('[WARN]', logEntry);
      break;
    case LogLevel.INFO:
      console.info('[INFO]', logEntry);
      break;
    case LogLevel.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        console.debug('[DEBUG]', logEntry);
      }
      break;
  }
}
```

## CORS

Control cross-origin resource sharing.

### Default Configuration

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Max-Age': '86400'
};
```

### Apply CORS Headers

```typescript
import { addCORSHeaders } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'your data' });
  
  // Add CORS headers
  return addCORSHeaders(response);
}
```

### Handle OPTIONS Requests

```typescript
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return addCORSHeaders(response);
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'your data' });
  return addCORSHeaders(response);
}
```

### Restrict Origins (Production)

```typescript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://app.yourdomain.com'
];

export function addCORSHeaders(response: NextResponse, origin?: string): NextResponse {
  if (process.env.NODE_ENV === 'production') {
    // Restrict to specific origins
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  } else {
    // Allow all in development
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

// Usage
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = NextResponse.json({ data: 'your data' });
  return addCORSHeaders(response, origin);
}
```

### CORS with Credentials

```typescript
response.headers.set('Access-Control-Allow-Credentials', 'true');
response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com'); // Can't use '*' with credentials
```

## Creating Custom Middleware

### Middleware Pattern

```typescript
type Middleware = (
  request: NextRequest,
  next: () => Promise<NextResponse>
) => Promise<NextResponse>;

function composeMiddleware(...middlewares: Middleware[]) {
  return async (request: NextRequest) => {
    let index = 0;

    const next = async (): Promise<NextResponse> => {
      if (index >= middlewares.length) {
        return NextResponse.next();
      }

      const middleware = middlewares[index++];
      return middleware(request, next);
    };

    return next();
  };
}
```

### Example: Request ID Middleware

```typescript
function requestIdMiddleware(): Middleware {
  return async (request: NextRequest, next) => {
    const requestId = crypto.randomUUID();
    
    // Add to request headers
    request.headers.set('x-request-id', requestId);
    
    const response = await next();
    
    // Add to response headers
    response.headers.set('x-request-id', requestId);
    
    return response;
  };
}
```

### Example: Timing Middleware

```typescript
function timingMiddleware(): Middleware {
  return async (request: NextRequest, next) => {
    const startTime = Date.now();
    
    const response = await next();
    
    const duration = Date.now() - startTime;
    response.headers.set('x-response-time', `${duration}ms`);
    
    console.log(`${request.method} ${request.url} - ${duration}ms`);
    
    return response;
  };
}
```

### Example: Security Headers Middleware

```typescript
function securityHeadersMiddleware(): Middleware {
  return async (request: NextRequest, next) => {
    const response = await next();
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    
    return response;
  };
}
```

### Combining Middleware

```typescript
const middleware = composeMiddleware(
  requestIdMiddleware(),
  timingMiddleware(),
  securityHeadersMiddleware()
);

export async function GET(request: NextRequest) {
  return middleware(request);
}
```

## Complete Example

Here's a complete example combining all middleware:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  apiRateLimiter,
  rateLimitMiddleware,
  getClientIP,
  logRequest,
  logResponse,
  addCORSHeaders
} from '@/lib/middleware';
import { verifyJWTFromRequest } from '@/lib/auth';
import { addressSchema, validateBody } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  // 1. Log request
  const log = logRequest(request, { clientIP });

  // 2. Rate limiting
  const rateLimitResponse = rateLimitMiddleware(request, clientIP, apiRateLimiter);
  if (rateLimitResponse) {
    return addCORSHeaders(rateLimitResponse);
  }

  // 3. Authentication
  const jwtPayload = verifyJWTFromRequest(request);
  if (!jwtPayload) {
    const response = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
    return addCORSHeaders(response);
  }

  // 4. Validation
  try {
    const body = await request.json();
    const validation = validateBody(addressSchema, body);

    if (!validation.success) {
      const response = NextResponse.json(
        { error: 'Validation Error', errors: validation.errors },
        { status: 400 }
      );
      return addCORSHeaders(response);
    }

    // 5. Process request
    const result = await processData(validation.data);

    // 6. Create response
    const response = NextResponse.json(result);

    // 7. Log response
    logResponse({
      ...log,
      duration: Date.now() - startTime,
      userId: jwtPayload.userId
    }, response);

    // 8. Add CORS headers
    return addCORSHeaders(response);

  } catch (error) {
    console.error('[ERROR]', { ...log, error: error.message });
    
    const response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
    return addCORSHeaders(response);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return addCORSHeaders(response);
}
```

## Best Practices

1. **Always log requests** - Helps with debugging and monitoring
2. **Implement rate limiting** - Protects against abuse
3. **Use CORS properly** - Restrict origins in production
4. **Add security headers** - Protect against common attacks
5. **Handle OPTIONS requests** - Required for CORS preflight
6. **Log errors** - Include context for troubleshooting
7. **Monitor performance** - Track response times
8. **Use appropriate limits** - Don't be too restrictive or too lenient

## Performance Tips

1. **Cache rate limit checks** - Use in-memory or Redis cache
2. **Async logging** - Don't block requests for logging
3. **Minimal middleware** - Only add what you need
4. **Efficient identifiers** - Use hashed IPs or user IDs
5. **Cleanup old data** - Prevent memory leaks in rate limiters

## Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Rate Limiting', () => {
  it('should allow requests within limit', async () => {
    for (let i = 0; i < 5; i++) {
      const response = await fetch('/api/test');
      expect(response.status).toBe(200);
    }
  });

  it('should block requests exceeding limit', async () => {
    // Make requests up to limit
    for (let i = 0; i < 100; i++) {
      await fetch('/api/test');
    }

    // Next request should be blocked
    const response = await fetch('/api/test');
    expect(response.status).toBe(429);
  });
});
```

## Troubleshooting

### Rate Limit Not Working

- Check identifier is consistent (IP or user ID)
- Verify rate limiter instance is reused
- Check time window configuration

### CORS Issues

- Verify origin is allowed
- Check OPTIONS handler exists
- Ensure credentials setting matches

### Logs Not Appearing

- Check console in development
- Verify logging service in production
- Check log level configuration

## Next Steps

- Read [AUTHENTICATION.md](./AUTHENTICATION.md) for auth middleware
- Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
- Check [examples/](./examples/) for code samples
