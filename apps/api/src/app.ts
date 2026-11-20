import type { FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import underPressure from '@fastify/under-pressure';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';

import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { listingsRoutes } from './routes/listings.js';
import { taxonomyRoutes } from './routes/taxonomy.js';
import { meRoutes } from './routes/me.js';
import { adminRoutes } from './routes/admin.js';

export async function buildApp(server: FastifyInstance) {
  // Zod type provider
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // Core plugins
  await server.register(sensible);
  await server.register(cookie, {
    secret: process.env['COOKIE_SECRET'] ?? 'treg-cookie-secret-change-in-prod',
  });

  // CORS
  const origins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000').split(',');
  await server.register(cors, {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Security headers
  await server.register(helmet, {
    contentSecurityPolicy: false, // Managed by reverse proxy
    crossOriginEmbedderPolicy: false,
  });

  // Rate limiting (in-memory; per API instance)
  await server.register(rateLimit, {
    global: true,
    max: 60,
    timeWindow: '1 minute',
  });

  // Health / back-pressure monitoring
  await server.register(underPressure, {
    maxEventLoopDelay: 1000,
    message: 'Under pressure!',
    retryAfter: 50,
  });

  // OpenAPI docs (dev only)
  if (process.env['NODE_ENV'] !== 'production') {
    await server.register(swagger, {
      transform: jsonSchemaTransform,
      openapi: {
        info: { title: 'tregprone API', version: '1.0.0' },
        servers: [{ url: `http://localhost:${process.env['API_PORT'] ?? 4000}` }],
      },
    });
    await server.register(swaggerUi, { routePrefix: '/docs' });
  }

  // Routes
  await server.register(healthRoutes, { prefix: '/health' });
  await server.register(authRoutes, { prefix: '/v1/auth' });
  await server.register(listingsRoutes, { prefix: '/v1/listings' });
  await server.register(taxonomyRoutes, { prefix: '/v1' });
  await server.register(meRoutes, { prefix: '/v1/me' });
  await server.register(adminRoutes, { prefix: '/v1/admin' });

  return server;
}
