import type { FastifyInstance } from 'fastify';

import prisma from '../lib/prisma.js';

export async function taxonomyRoutes(server: FastifyInstance) {
  // GET /v1/regions
  server.get('/regions', async (request, reply) => {
    const { country, parentId } = request.query as { country?: string; parentId?: string };

    const regions = await prisma.region.findMany({
      where: {
        ...(country ? { country } : {}),
        ...(parentId !== undefined ? { parentId: parentId || null } : {}),
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        parentId: true,
        centroidLat: true,
        centroidLng: true,
        _count: { select: { listings: { where: { status: 'PUBLISHED' } } } },
      },
    });

    return reply.send({ items: regions });
  });

  // GET /v1/features
  server.get('/features', async (_request, reply) => {
    const features = await prisma.feature.findMany({ orderBy: { key: 'asc' } });
    return reply.send({ items: features });
  });
}
