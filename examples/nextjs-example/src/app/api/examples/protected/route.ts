import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTFromRequest, verifyAPIKey } from '@/lib/auth';
import { apiRateLimiter, rateLimitMiddleware, getClientIP, logRequest } from '@/lib/middleware';
import { addressSchema, validateBody } from '@/lib/validation';

/**
 * GET /api/examples/protected
 * Example protected endpoint demonstrating JWT and API key authentication
 * 
 * Supports two authentication methods:
 * 1. JWT: Authorization header with "Bearer <token>"
 * 2. API Key: x-api-key header
 * 
 * Headers:
 *   Authorization: Bearer <jwt-token>
 *   OR
 *   x-api-key: <api-key>
 * 
 * Response:
 * {
 *   "message": "Access granted",
 *   "authMethod": "jwt" | "apikey",
 *   "user": { "userId": "1", "email": "demo@example.com" }
 * }
 */
export async function GET(request: NextRequest) {
  const clientIP = getClientIP(request);
  logRequest(request, { clientIP });

  // Rate limiting
  const rateLimitResponse = rateLimitMiddleware(request, clientIP, apiRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Try JWT authentication first
  const jwtPayload = verifyJWTFromRequest(request);
  if (jwtPayload) {
    return NextResponse.json({
      message: 'Access granted',
      authMethod: 'jwt',
      user: {
        userId: jwtPayload.userId,
        email: jwtPayload.email
      }
    });
  }

  // Try API key authentication
  if (verifyAPIKey(request)) {
    return NextResponse.json({
      message: 'Access granted',
      authMethod: 'apikey',
      apiKey: request.headers.get('x-api-key')?.substring(0, 10) + '...'
    });
  }

  // No valid authentication
  return NextResponse.json(
    {
      error: 'Unauthorized',
      message: 'Please provide valid JWT token or API key'
    },
    { status: 401 }
  );
}

/**
 * POST /api/examples/protected
 * Example protected endpoint with request validation
 * 
 * Demonstrates:
 * - Authentication (JWT or API key)
 * - Rate limiting
 * - Request logging
 * - Request body validation with Zod
 * 
 * Request body:
 * {
 *   "country": "JP",
 *   "postal_code": "100-0001",
 *   "city": "Tokyo"
 * }
 */
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const startTime = Date.now();
  
  logRequest(request, { clientIP });

  // Rate limiting
  const rateLimitResponse = rateLimitMiddleware(request, clientIP, apiRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Authentication
  const jwtPayload = verifyJWTFromRequest(request);
  const hasAPIKey = verifyAPIKey(request);

  if (!jwtPayload && !hasAPIKey) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Please provide valid JWT token or API key'
      },
      { status: 401 }
    );
  }

  // Validate request body
  try {
    const body = await request.json();
    const validation = validateBody(addressSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    // Process validated data
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      message: 'Data validated and processed successfully',
      data: validation.data,
      meta: {
        duration: `${duration}ms`,
        authMethod: jwtPayload ? 'jwt' : 'apikey'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }
}
