import type { FastifyInstance } from 'fastify';

import prisma from '../lib/prisma.js';

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

    const allOk = Object.values(checks).every((v) => v === 'ok');
    return reply.status(allOk ? 200 : 503).send({ status: allOk ? 'ok' : 'degraded', checks });
  });
}
