import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../types/index.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

/**
 * API Key Authentication Middleware
 * Verifies API key from X-API-Key header
 */
export function authenticateAPIKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing API key' });
    return;
  }

  const validApiKeys = (process.env.API_KEYS || 'demo-api-key').split(',');

  if (!validApiKeys.includes(apiKey as string)) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid API key' });
    return;
  }

  // Set a dummy user for API key auth
  req.user = {
    id: 'api-key-user',
    username: 'api-key-authenticated'
  };

  next();
}

/**
 * Combined Authentication Middleware
 * Allows both JWT and API Key authentication
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  // Try JWT first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticateJWT(req, res, next);
  }

  // Try API key
  if (apiKey) {
    return authenticateAPIKey(req, res, next);
  }

  res.status(401).json({
    error: 'Unauthorized',
    message: 'Authentication required. Provide either Bearer token or X-API-Key header'
  });
}
