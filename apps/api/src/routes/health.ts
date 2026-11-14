import type { FastifyInstance } from 'fastify';

import prisma from '../lib/prisma.js';
import { getMeili } from '../lib/meili.js';
import { getRedis } from '../lib/redis.js';

export async function healthRoutes(server: FastifyInstance) {
  server.get('/live', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  server.get('/ready', async (_req, reply) => {
    const checks: Record<string, 'ok' | 'error'> = {};

    // Postgres
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks['postgres'] = 'ok';
    } catch {
      checks['postgres'] = 'error';
    }

    // Redis
    try {
      const redis = getRedis();
      await redis.ping();
      checks['redis'] = 'ok';
    } catch {
      checks['redis'] = 'error';
    }

    // Meilisearch
    try {
      await getMeili().health();
      checks['meilisearch'] = 'ok';
    } catch {
      checks['meilisearch'] = 'error';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');
    return reply.status(allOk ? 200 : 503).send({ status: allOk ? 'ok' : 'degraded', checks });
  });
}
