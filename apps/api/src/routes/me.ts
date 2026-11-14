import type { FastifyInstance } from 'fastify';

import { UpdateUserSchema } from '@treg/types';

import prisma from '../lib/prisma.js';
import { requireAuth } from '../plugins/auth.js';

export async function meRoutes(server: FastifyInstance) {
  // GET /v1/me
  server.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true,
        phone: true, locale: true, emailVerified: true, createdAt: true,
      },
    });
    if (!user) return reply.status(404).send();
    return reply.send({
      ...user,
      emailVerified: user.emailVerified?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    });
  });

  // PATCH /v1/me
  server.patch('/', { preHandler: [requireAuth] }, async (request, reply) => {
    const body = UpdateUserSchema.parse(request.body);
    const user = await prisma.user.update({
      where: { id: request.user!.id },
      data: body,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, phone: true, locale: true },
    });
    return reply.send(user);
  });

  // DELETE /v1/me
  server.delete('/', { preHandler: [requireAuth] }, async (request, reply) => {
    await prisma.user.update({
      where: { id: request.user!.id },
      data: { email: `deleted_${request.user!.id}@treg.deleted`, name: '[Deleted]', phone: null, avatarUrl: null },
    });
    return reply.status(204).send();
  });

  // GET /v1/me/favorites
  server.get('/favorites', { preHandler: [requireAuth] }, async (request, reply) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: request.user!.id },
      include: {
        listing: {
          include: {
            region: { select: { id: true, name: true, slug: true, country: true } },
            images: { orderBy: { position: 'asc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      items: favorites.map((f) => ({
        ...f.listing,
        priceMinor: f.listing.priceMinor.toString(),
        publishedAt: f.listing.publishedAt?.toISOString() ?? null,
        createdAt: f.listing.createdAt.toISOString(),
        coverImage: f.listing.images[0] ?? null,
        savedAt: f.createdAt.toISOString(),
      })),
    });
  });

  // PUT /v1/me/favorites/:listingId
  server.put('/favorites/:listingId', { preHandler: [requireAuth] }, async (request, reply) => {
    const { listingId } = request.params as { listingId: string };
    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: request.user!.id, listingId } },
      update: {},
      create: { userId: request.user!.id, listingId },
    });
    return reply.status(204).send();
  });

  // DELETE /v1/me/favorites/:listingId
  server.delete('/favorites/:listingId', { preHandler: [requireAuth] }, async (request, reply) => {
    const { listingId } = request.params as { listingId: string };
    await prisma.favorite.deleteMany({
      where: { userId: request.user!.id, listingId },
    });
    return reply.status(204).send();
  });

  // GET /v1/me/listings
  server.get('/listings', { preHandler: [requireAuth] }, async (request, reply) => {
    const listings = await prisma.listing.findMany({
      where: { ownerId: request.user!.id },
      include: {
        region: { select: { id: true, name: true, slug: true, country: true } },
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      items: listings.map((l) => ({
        ...l,
        priceMinor: l.priceMinor.toString(),
        publishedAt: l.publishedAt?.toISOString() ?? null,
        createdAt: l.createdAt.toISOString(),
        coverImage: l.images[0] ?? null,
      })),
    });
  });
}
