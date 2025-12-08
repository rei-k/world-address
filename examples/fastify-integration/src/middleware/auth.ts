import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JWTPayload } from '../types/index.js';

// Demo users (replace with database in production)
const DEMO_USERS = [
  { id: '1', email: 'demo@example.com', password: 'demo123', name: 'Demo User' },
  { id: '2', email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
];

/**
 * Verify user credentials
 */
export async function verifyCredentials(email: string, password: string): Promise<JWTPayload | null> {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
  
  return null;
}

/**
 * JWT Authentication middleware
 */
export async function authenticateJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or missing JWT token' });
  }
}

/**
 * API Key Authentication middleware
 */
export async function authenticateAPIKey(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return reply.code(401).send({ error: 'Unauthorized', message: 'Missing API key' });
  }

  const validKeys = (process.env.API_KEYS || '').split(',').filter(Boolean);
  
  if (!validKeys.includes(apiKey)) {
    return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid API key' });
  }

  // Add a dummy user for API key auth
  (request as any).user = {
    id: 'api-key-user',
    email: 'api@example.com',
    name: 'API Key User'
  };
}

/**
 * Combined authentication middleware (JWT or API Key)
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  const apiKey = request.headers['x-api-key'];

  // Try JWT first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      await request.jwtVerify();
      return;
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid JWT token' });
    }
  }

  // Try API Key
  if (apiKey) {
    return authenticateAPIKey(request, reply);
  }

  return reply.code(401).send({ 
    error: 'Unauthorized', 
    message: 'Missing authentication. Provide JWT token or API key' 
  });
}
