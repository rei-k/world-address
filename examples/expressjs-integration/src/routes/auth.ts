import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { validateLogin } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { LoginRequest, LoginResponse } from '../types/index.js';

const router = Router();

// Demo users (replace with database in production)
const DEMO_USERS = [
  { id: '1', username: 'demo', password: 'demo123' }, // In production, use hashed passwords!
  { id: '2', username: 'admin', password: 'admin123' }
];

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', validateLogin, asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body as LoginRequest;

  // Find user (in production, query database and verify hashed password)
  const user = DEMO_USERS.find(u => u.username === username && u.password === password);

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid username or password'
    });
    return;
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';

  const token = jwt.sign(
    { id: user.id, username: user.username },
    jwtSecret,
    { expiresIn: '24h' }
  );

  const response: LoginResponse = {
    token,
    expiresIn: '24h'
  };

  res.json(response);
}));

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  // This endpoint would typically be protected by auth middleware
  // For demo purposes, we'll return the user from the token if provided
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    return;
  }

  try {
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(token, jwtSecret);

    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
}));

export default router;
