import type { FastifyInstance } from 'fastify';
import { verifyCredentials } from '../middleware/auth.js';

export default async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/auth/login
   * Login with credentials and get JWT token
   */
  fastify.post('/api/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            expiresIn: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    const user = await verifyCredentials(email, password);

    if (!user) {
      return reply.code(401).send({ 
        error: 'Unauthorized', 
        message: 'Invalid credentials' 
      });
    }

    const token = fastify.jwt.sign(user);

    return {
      token,
      expiresIn: '24h',
      user
    };
  });
}
