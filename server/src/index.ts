import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { createHealthHandler, createRootHandler, HealthConfig } from '@exyconn/common/server';
import contactRoutes from './routes/contact';
import organizationsRoutes from './organizations/organizations.routes';
import emailRoutes from './email';
import imagekitRoutes from './imagekit';
import siteStatusRoutes from './site-status';
import envKeysRoutes from './env-keys';
import aiRoutes from './ai';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4004;

// CORS configuration for production and development
const allowedOrigins = [
  // Local development
  'http://localhost:4003',
  'http://127.0.0.1:4003',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // Production domains
  'https://services.exyconn.com',
  'https://www.services.exyconn.com',
  'https://exyconn.com',
  'https://www.exyconn.com',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow all subdomains of exyconn.com
    if (origin.endsWith('.exyconn.com') || origin === 'https://exyconn.com') {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-api-key',
    'X-API-Key',
  ],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/organizations/:orgId/email', emailRoutes);
app.use('/api/organizations/:orgId/imagekit', imagekitRoutes);
app.use('/api/organizations/:orgId/site-status', siteStatusRoutes);
app.use('/api/organizations/:orgId/env-keys', envKeysRoutes);
app.use('/api/organizations/:orgId/ai', aiRoutes);

// Standardized Health Configuration
const healthConfig: HealthConfig = {
  name: 'exyconn-services-server',
  version: '1.0.0',
  port: PORT,
  domain: 'exyconn-service-server.exyconn.com',
  description: 'Exyconn Services & Organizations API Server',
  uiUrl: 'https://services.exyconn.com',
  serverUrl: 'https://exyconn-service-server.exyconn.com',
  criticalPackages: ['express', 'mongoose', 'cors', 'nodemailer'],
  async checkDependencies() {
    const mongoose = await import('mongoose');
    return { mongodb: mongoose.connection.readyState === 1 ? 'UP' : 'DOWN' };
  },
};

// Health check endpoints
app.get('/health', createHealthHandler(healthConfig));
app.get('/api/health', createHealthHandler(healthConfig));

// Root endpoint
app.get(
  '/',
  createRootHandler({
    ...healthConfig,
    endpoints: {
      health: '/health',
      contact: '/api/contact',
      organizations: '/api/organizations',
      email: '/api/organizations/:orgId/email',
      imagekit: '/api/organizations/:orgId/imagekit',
      siteStatus: '/api/organizations/:orgId/site-status',
      envKeys: '/api/organizations/:orgId/env-keys',
      ai: '/api/organizations/:orgId/ai',
    },
  })
);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Connect to database and start server
const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Services Server is running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
