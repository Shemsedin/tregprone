import type { FastifyInstance } from 'fastify';

import prisma from '../lib/prisma.js';
import { requireAdmin } from '../plugins/auth.js';

export async function adminRoutes(server: FastifyInstance) {
  server.addHook('preHandler', requireAdmin);

  // GET /v1/admin/listings
  server.get('/listings', async (request, reply) => {
    const { status, limit = 20, cursor } = request.query as {
      status?: string;
      limit?: number;
      cursor?: string;
    };

    const listings = await prisma.listing.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      include: {
        region: { select: { id: true, name: true, slug: true, country: true } },
        owner: { select: { id: true, name: true, email: true } },
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) + 1,
    });

    const hasMore = listings.length > Number(limit);
    const items = hasMore ? listings.slice(0, -1) : listings;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return reply.send({
      items: items.map((l) => ({
        ...l,
        priceMinor: l.priceMinor.toString(),
        publishedAt: l.publishedAt?.toISOString() ?? null,
        createdAt: l.createdAt.toISOString(),
        coverImage: l.images[0] ?? null,
      })),
      nextCursor,
    });
  });

  // POST /v1/admin/listings/:id/approve
  server.post('/listings/:id/approve', async (request, reply) => {
    const { id } = request.params as { id: string };
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return reply.status(404).send({ type: 'not_found', status: 404 });

    await prisma.$transaction([
      prisma.listing.update({
        where: { id },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actorId: request.user!.id,
          action: 'listing.approve',
          entityType: 'Listing',
          entityId: id,
        },
      }),
    ]);

    return reply.send({ status: 'PUBLISHED' });
  });

  // POST /v1/admin/listings/:id/reject
  server.post('/listings/:id/reject', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { reason } = request.body as { reason: string };

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return reply.status(404).send({ type: 'not_found', status: 404 });

    await prisma.$transaction([
      prisma.listing.update({ where: { id }, data: { status: 'REJECTED' } }),
      prisma.auditLog.create({
        data: {
          actorId: request.user!.id,
          action: 'listing.reject',
          entityType: 'Listing',
          entityId: id,
          meta: { reason },
        },
      }),
    ]);

    return reply.send({ status: 'REJECTED' });
  });

  // GET /v1/admin/users
  server.get('/users', async (request, reply) => {
    const { limit = 20, cursor, q } = request.query as { limit?: number; cursor?: string; q?: string };

    const users = await prisma.user.findMany({
      where: {
        ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}),
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      select: {
        id: true, email: true, name: true, role: true, suspended: true,
        emailVerified: true, createdAt: true, _count: { select: { listings: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) + 1,
    });

    const hasMore = users.length > Number(limit);
    const items = hasMore ? users.slice(0, -1) : users;
    return reply.send({
      items: items.map((u) => ({
        ...u,
        emailVerified: u.emailVerified?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      })),
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
    });
  });

  // POST /v1/admin/users/:id/suspend
  server.post('/users/:id/suspend', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { suspended: true } }),
      prisma.auditLog.create({
        data: { actorId: request.user!.id, action: 'user.suspend', entityType: 'User', entityId: id },
      }),
    ]);
    return reply.send({ suspended: true });
  });

  // POST /v1/admin/users/:id/unsuspend
  server.post('/users/:id/unsuspend', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.user.update({ where: { id }, data: { suspended: false } });
    return reply.send({ suspended: false });
  });

  // GET /v1/admin/metrics
  server.get('/metrics', async (_request, reply) => {
    const [totalUsers, totalListings, pendingListings, contacts24h] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.contactRequest.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const listingsByStatus = await prisma.listing.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return reply.send({
      totalUsers,
      totalListings,
      pendingListings,
      contacts24h,
      listingsByStatus: Object.fromEntries(
        listingsByStatus.map((s) => [s.status, s._count._all]),
      ),
    });
  });

  // GET /v1/admin/audit-log
  server.get('/audit-log', async (request, reply) => {
    const { limit = 100, cursor } = request.query as { limit?: number; cursor?: string };

    const logs = await prisma.auditLog.findMany({
      where: cursor ? { id: { lt: cursor } } : {},
      orderBy: { createdAt: 'desc' },
      take: Number(limit) + 1,
    });

    const hasMore = logs.length > Number(limit);
    const items = hasMore ? logs.slice(0, -1) : logs;
    return reply.send({
      items: items.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
    });
  });
}
