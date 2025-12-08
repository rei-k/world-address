/**
 * Authentication utilities for JWT and API key validation
 */

import { NextRequest } from 'next/server';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';
const API_KEY_HEADER = 'x-api-key';

// Demo API keys (replace with database in production)
const VALID_API_KEYS = new Set([
  'demo_api_key_12345',
  'prod_api_key_67890'
]);

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for a user
 * @param userId - User ID
 * @param email - User email
 * @param expiresIn - Token expiration (default: 24h)
 * @returns JWT token string
 */
export function generateJWT(userId: string, email: string, expiresIn = '24h'): string {
  const payload: JWTPayload = {
    userId,
    email
  };

  return sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract JWT token from Authorization header
 * @param request - Next.js request object
 * @returns JWT token string or null
 */
export function extractJWTFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Support "Bearer <token>" format
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  // Support plain token
  return authHeader;
}

/**
 * Verify JWT token from request and return user info
 * @param request - Next.js request object
 * @returns User info or null if invalid
 */
export function verifyJWTFromRequest(request: NextRequest): JWTPayload | null {
  const token = extractJWTFromRequest(request);
  
  if (!token) {
    return null;
  }

  return verifyJWT(token);
}

/**
 * Verify API key from request header
 * @param request - Next.js request object
 * @returns true if API key is valid, false otherwise
 */
export function verifyAPIKey(request: NextRequest): boolean {
  const apiKey = request.headers.get(API_KEY_HEADER);
  
  if (!apiKey) {
    return false;
  }

  return VALID_API_KEYS.has(apiKey);
}

/**
 * Get API key from request header
 * @param request - Next.js request object
 * @returns API key string or null
 */
export function getAPIKey(request: NextRequest): string | null {
  return request.headers.get(API_KEY_HEADER);
}
