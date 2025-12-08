import type { H3Event } from 'h3';
import type { User } from '../types';

// Demo users (replace with database in production)
const DEMO_USERS = [
  { id: '1', email: 'demo@example.com', password: 'demo123', name: 'Demo User' },
  { id: '2', email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
];

/**
 * Verify user credentials
 */
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
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
 * Get authenticated user from session
 */
export async function getAuthenticatedUser(event: H3Event): Promise<User | null> {
  const session = await getServerSession(event);
  
  if (!session?.user?.id) {
    return null;
  }
  
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name || ''
  };
}

/**
 * Require authentication middleware
 */
export async function requireAuth(event: H3Event): Promise<User> {
  const user = await getAuthenticatedUser(event);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  return user;
}
