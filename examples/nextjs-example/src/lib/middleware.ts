/**
 * Middleware utilities for rate limiting, logging, and request handling
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiter using in-memory store
 * In production, use Redis or similar distributed cache
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   * @param identifier - Unique identifier (IP, API key, user ID)
   * @returns Object with allowed status and remaining requests
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    // Clean up expired records
    if (record && record.resetTime < now) {
      this.requests.delete(identifier);
    }

    const current = this.requests.get(identifier);

    if (!current) {
      // First request in window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }

    if (current.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      };
    }

    current.count++;
    this.requests.set(identifier, current);

    return {
      allowed: true,
      remaining: this.maxRequests - current.count,
      resetTime: current.resetTime
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Global rate limiter instances
export const apiRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute
export const authRateLimiter = new RateLimiter(900000, 5); // 5 requests per 15 minutes

/**
 * Rate limiting middleware
 * @param request - Next.js request
 * @param identifier - Unique identifier for rate limiting
 * @param limiter - Rate limiter instance
 * @returns NextResponse with rate limit headers or null if allowed
 */
export function rateLimitMiddleware(
  request: NextRequest,
  identifier: string,
  limiter: RateLimiter = apiRateLimiter
): NextResponse | null {
  const result = limiter.check(identifier);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limiter['maxRequests'].toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': retryAfter.toString()
        }
      }
    );
  }

  return null;
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limiter: RateLimiter,
  identifier: string
): NextResponse {
  const result = limiter.check(identifier);
  
  response.headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

  return response;
}

/**
 * Request logger interface
 */
export interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  duration?: number;
  status?: number;
}

/**
 * Log request details
 * @param request - Next.js request
 * @param additionalInfo - Additional info to log
 */
export function logRequest(request: NextRequest, additionalInfo?: Record<string, any>): RequestLog {
  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    ...additionalInfo
  };

  // In production, send to logging service (e.g., CloudWatch, Datadog)
  console.log('[REQUEST]', JSON.stringify(log));

  return log;
}

/**
 * Log response details
 * @param log - Original request log
 * @param response - NextResponse object
 */
export function logResponse(log: RequestLog, response: NextResponse): void {
  const duration = log.duration || 0;
  
  const responseLog = {
    ...log,
    status: response.status,
    duration: `${duration}ms`
  };

  console.log('[RESPONSE]', JSON.stringify(responseLog));
}

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * CORS headers configuration
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Max-Age': '86400'
};

/**
 * Add CORS headers to response
 */
export function addCORSHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
