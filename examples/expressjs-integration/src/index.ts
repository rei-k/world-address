import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import addressRoutes from './routes/addresses.js';
import webhookRoutes from './routes/webhooks.js';
import authRoutes from './routes/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (simple version)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Express.js Address Integration Server');
  console.log('='.repeat(60));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT Auth: ${process.env.JWT_SECRET ? 'Configured' : 'Using default (change in production!)'}`);
  console.log(`🔑 API Keys: ${process.env.API_KEYS ? 'Configured' : 'Using default'}`);
  console.log(`🌐 CORS Origins: ${corsOrigins.join(', ')}`);
  console.log('='.repeat(60));
  console.log('\n📖 API Endpoints:');
  console.log('  GET  /health                    - Health check');
  console.log('  POST /api/auth/login            - Login (get JWT token)');
  console.log('  GET  /api/auth/me               - Get current user');
  console.log('  POST /api/addresses/validate    - Validate address');
  console.log('  GET  /api/addresses             - List addresses');
  console.log('  GET  /api/addresses/:id         - Get address');
  console.log('  POST /api/addresses             - Create address');
  console.log('  PUT  /api/addresses/:id         - Update address');
  console.log('  DELETE /api/addresses/:id       - Delete address');
  console.log('  GET  /api/webhooks              - List webhooks');
  console.log('  POST /api/webhooks              - Register webhook');
  console.log('  DELETE /api/webhooks/:id        - Delete webhook');
  console.log('='.repeat(60));
  console.log('\n💡 Quick Start:');
  console.log('  1. Login: curl -X POST http://localhost:3000/api/auth/login \\');
  console.log('       -H "Content-Type: application/json" \\');
  console.log('       -d \'{"username":"demo","password":"demo123"}\'');
  console.log('  2. Use the returned token in Authorization header');
  console.log('='.repeat(60));
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
