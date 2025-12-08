import { NextRequest, NextResponse } from 'next/server';
import { verifyAPIKey } from '@/lib/auth';
import { apiRateLimiter, rateLimitMiddleware, getClientIP, logRequest } from '@/lib/middleware';

/**
 * GET /api/auth/apikey/verify
 * Verify API key authentication
 * 
 * Headers:
 *   x-api-key: <your-api-key>
 * 
 * Response (valid API key):
 * {
 *   "valid": true,
 *   "message": "API key is valid"
 * }
 * 
 * Response (invalid API key):
 * {
 *   "valid": false,
 *   "error": "Invalid API key"
 * }
 */
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  logRequest(request, { clientIP });

  // Rate limiting based on IP
  const rateLimitResponse = rateLimitMiddleware(request, clientIP, apiRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const isValid = verifyAPIKey(request);

  if (!isValid) {
    return NextResponse.json(
      {
        valid: false,
        error: 'Invalid API key'
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    valid: true,
    message: 'API key is valid'
  });

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');

  return response;
}
