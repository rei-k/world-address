import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '@/lib/auth';
import { authRateLimiter, rateLimitMiddleware, getClientIP, logRequest } from '@/lib/middleware';

// Demo users for JWT authentication
const DEMO_USERS = [
  { id: '1', email: 'demo@example.com', password: 'demo123', name: 'Demo User' },
  { id: '2', email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
];

/**
 * POST /api/auth/jwt/login
 * Login with email and password to receive JWT token
 * 
 * Request body:
 * {
 *   "email": "demo@example.com",
 *   "password": "demo123"
 * }
 * 
 * Response:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": { "id": "1", "email": "demo@example.com", "name": "Demo User" },
 *   "expiresIn": "24h"
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  
  // Log request
  logRequest(request, { clientIP });

  // Rate limiting
  const rateLimitResponse = rateLimitMiddleware(request, clientIP, authRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user (in production, query database and verify hashed password)
    const user = DEMO_USERS.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateJWT(user.id, user.email);

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      expiresIn: '24h'
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '5');
    response.headers.set('X-RateLimit-Remaining', '4');

    // Log response time
    const duration = Date.now() - startTime;
    console.log(`[JWT LOGIN] ${email} - ${duration}ms`);

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
