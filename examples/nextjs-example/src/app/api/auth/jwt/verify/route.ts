import { NextRequest, NextResponse } from 'next/server';
import { verifyJWTFromRequest } from '@/lib/auth';
import { logRequest } from '@/lib/middleware';

/**
 * GET /api/auth/jwt/verify
 * Verify JWT token and return user information
 * 
 * Headers:
 *   Authorization: Bearer <token>
 * 
 * Response (valid token):
 * {
 *   "valid": true,
 *   "user": { "userId": "1", "email": "demo@example.com" }
 * }
 * 
 * Response (invalid token):
 * {
 *   "valid": false,
 *   "error": "Invalid or expired token"
 * }
 */
export async function GET(request: NextRequest) {
  logRequest(request);

  const payload = verifyJWTFromRequest(request);

  if (!payload) {
    return NextResponse.json(
      {
        valid: false,
        error: 'Invalid or expired token'
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    valid: true,
    user: {
      userId: payload.userId,
      email: payload.email
    }
  });
}
