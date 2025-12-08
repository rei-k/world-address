import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

import authRoutes from './routes/auth.js';
import addressRoutes from './routes/addresses.js';
import webhookRoutes from './routes/webhooks.js';

// Load environment variables
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || '*').split(',');
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const RATE_LIMIT_TIME_WINDOW = process.env.RATE_LIMIT_TIME_WINDOW || '15m';

/**
 * Create and configure Fastify instance
 */
async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    },
    // Increase request size limits for address data
    bodyLimit: 1048576, // 1MB
    // Add request IDs for tracking
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId'
  });

  // Register security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  });

  // Register CORS
  await fastify.register(cors, {
    origin: CORS_ORIGIN,
    credentials: true
  });

  // Register JWT
  await fastify.register(jwt, {
    secret: JWT_SECRET
  });

  // Register rate limiting
  await fastify.register(rateLimit, {
    max: RATE_LIMIT_MAX,
    timeWindow: RATE_LIMIT_TIME_WINDOW,
    cache: 10000,
    allowList: ['127.0.0.1'], // Whitelist localhost
    redis: undefined // Use in-memory store (use Redis in production)
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  // Root endpoint
  fastify.get('/', async () => {
    return {
      name: 'Fastify Address API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth/login',
        addresses: '/api/addresses',
        webhooks: '/api/webhooks',
        health: '/health'
      }
    };
  });

  // Register route modules
  await fastify.register(authRoutes);
  await fastify.register(addressRoutes);
  await fastify.register(webhookRoutes);

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    // JWT errors
    if (error.statusCode === 401) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: error.message
      });
    }

    // Validation errors
    if (error.statusCode === 400) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: error.message,
        validation: error.validation
      });
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      return reply.code(429).send({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: reply.getHeader('Retry-After')
      });
    }

    // Generic error
    reply.code(error.statusCode || 500).send({
      error: error.name || 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : error.message
    });
  });

  return fastify;
}

/**
 * Start the server
 */
async function start() {
  try {
    const fastify = await buildServer();

    await fastify.listen({ port: PORT, host: HOST });

    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   Fastify Address API Server                          ║
║                                                       ║
║   Server running at: http://${HOST}:${PORT}         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Documentation: http://${HOST}:${PORT}/          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

// Start the server
start();
