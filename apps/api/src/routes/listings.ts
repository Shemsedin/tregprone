import type { FastifyInstance } from 'fastify';

import {
  ListingFiltersSchema,
  CreateListingSchema,
  UpdateListingSchema,
  ContactRequestSchema,
} from '@treg/types';

import prisma from '../lib/prisma.js';
import { requireAuth, requireAgent } from '../plugins/auth.js';
import { generateUploadUrl } from '../lib/storage.js';
import { enqueueImageProcessing } from '../lib/images.js';
import { sendContactEmail } from '../lib/mail.js';
import { getRegionAndDescendantIds } from '../lib/region-tree.js';

function slugify(text: string, id: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) +
    '-' +
    id.slice(-6)
  );
}

function buildListingFilters(filters: ReturnType<typeof ListingFiltersSchema.parse>) {
  const where: Record<string, unknown> = { status: 'PUBLISHED' };

  if (filters.type) where['listingType'] = filters.type;
  if (filters.propertyType?.length) where['propertyType'] = { in: filters.propertyType };
  if (filters.regionId) where['regionId'] = filters.regionId;
  if (filters.currency) where['currency'] = filters.currency;

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where['priceMinor'] = {
      ...(filters.priceMin !== undefined ? { gte: BigInt(filters.priceMin) } : {}),
      ...(filters.priceMax !== undefined ? { lte: BigInt(filters.priceMax) } : {}),
    };
  }

  if (filters.bedroomsMin !== undefined) where['bedrooms'] = { gte: filters.bedroomsMin };
  if (filters.bathroomsMin !== undefined) where['bathrooms'] = { gte: filters.bathroomsMin };

  if (filters.areaMin !== undefined || filters.areaMax !== undefined) {
    where['areaM2'] = {
      ...(filters.areaMin !== undefined ? { gte: filters.areaMin } : {}),
      ...(filters.areaMax !== undefined ? { lte: filters.areaMax } : {}),
    };
  }

  return where;
}

function formatListing(listing: {
  id: string;
  slug: string;
  title: string;
  listingType: string;
  propertyType: string;
  status: string;
  priceMinor: bigint;
  currency: string;
  rentPeriod: string | null;
  areaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  lat: number;
  lng: number;
  regionId: string;
  region: { id: string; name: string; slug: string; country: string };
  images: Array<{
    id: string;
    url: string;
    width: number;
    height: number;
    blurhash: string | null;
    position: number;
    alt: string | null;
  }>;
  publishedAt: Date | null;
  createdAt: Date;
}) {
  return {
    ...listing,
    priceMinor: listing.priceMinor.toString(),
    publishedAt: listing.publishedAt?.toISOString() ?? null,
    createdAt: listing.createdAt.toISOString(),
    coverImage: listing.images[0] ?? null,
  };
}

export async function listingsRoutes(server: FastifyInstance) {
  // GET /v1/listings
  server.get('/', async (request, reply) => {
    const filters = ListingFiltersSchema.parse(request.query);
    const where = buildListingFilters(filters);
    if (filters.regionId) {
      const regions = await prisma.region.findMany({ select: { id: true, parentId: true } });
      where.regionId = {
        in: getRegionAndDescendantIds(regions, filters.regionId),
      };
    }

    // Build sort
    const sortMap: Record<string, Record<string, string>> = {
      '-createdAt': { createdAt: 'desc' },
      priceMinor: { priceMinor: 'asc' },
      '-priceMinor': { priceMinor: 'desc' },
    };
    const orderBy = sortMap[filters.sort] ?? { createdAt: 'desc' };

    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      take: filters.limit + 1,
      include: {
        region: { select: { id: true, name: true, slug: true, country: true } },
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
    });

    const hasMore = listings.length > filters.limit;
    const items = hasMore ? listings.slice(0, -1) : listings;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    // GeoJSON for map
    const geo = {
      type: 'FeatureCollection' as const,
      features: items.map((l) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [l.lng, l.lat] as [number, number] },
        properties: { id: l.id, title: l.title },
      })),
    };

    return reply.send({
      items: items.map(formatListing),
      nextCursor,
      geo,
      facets: {},
    });
  });

  // GET /v1/listings/:slug
  server.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const listing = await prisma.listing.findFirst({
      where: { slug, status: { in: ['PUBLISHED', 'SOLD', 'RENTED'] } },
      include: {
        region: { select: { id: true, name: true, slug: true, country: true } },
        images: { orderBy: { position: 'asc' } },
        features: { include: { feature: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!listing) {
      return reply.status(404).send({ type: 'not_found', title: 'Listing not found', status: 404 });
    }

    return reply.send({
      ...formatListing({ ...listing, images: listing.images }),
      description: listing.description,
      addressLine: listing.addressLine,
      floor: listing.floor,
      floorsTotal: listing.floorsTotal,
      yearBuilt: listing.yearBuilt,
      images: listing.images,
      featureKeys: listing.features.map((f) => f.feature.key),
      ownerId: listing.owner.id,
      ownerName: listing.owner.name,
      ownerAvatarUrl: listing.owner.avatarUrl,
    });
  });

  // POST /v1/listings — create draft
  server.post(
    '/',
    {
      preHandler: [requireAgent],
    },
    async (request, reply) => {
      const body = CreateListingSchema.parse(request.body);
      const user = request.user!;

      const listing = await prisma.listing.create({
        data: {
          ownerId: user.id,
          title: body.title,
          slug: 'placeholder', // will be updated
          description: body.description,
          listingType: body.listingType,
          propertyType: body.propertyType,
          priceMinor: body.priceMinor,
          currency: body.currency,
          rentPeriod: body.rentPeriod,
          areaM2: body.areaM2,
          bedrooms: body.bedrooms,
          bathrooms: body.bathrooms,
          floor: body.floor,
          floorsTotal: body.floorsTotal,
          yearBuilt: body.yearBuilt,
          regionId: body.regionId,
          addressLine: body.addressLine,
          lat: body.lat,
          lng: body.lng,
          status: 'DRAFT',
        },
      });

      // Update slug to include ID
      const slug = slugify(body.title, listing.id);
      await prisma.listing.update({ where: { id: listing.id }, data: { slug } });

      // Connect features
      if (body.featureKeys.length > 0) {
        const features = await prisma.feature.findMany({
          where: { key: { in: body.featureKeys } },
        });
        await prisma.listingFeature.createMany({
          data: features.map((f) => ({ listingId: listing.id, featureId: f.id })),
          skipDuplicates: true,
        });
      }

      return reply.status(201).send({ id: listing.id, slug });
    },
  );

  // PATCH /v1/listings/:id
  server.patch(
    '/:id',
    {
      preHandler: [requireAuth],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user!;
      const body = UpdateListingSchema.parse(request.body);

      const listing = await prisma.listing.findUnique({ where: { id } });
      if (!listing) return reply.status(404).send({ type: 'not_found', status: 404 });
      if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
        return reply.status(403).send({ type: 'forbidden', status: 403 });
      }
      if (!['DRAFT', 'REJECTED'].includes(listing.status) && user.role !== 'ADMIN') {
        return reply
          .status(400)
          .send({
            type: 'invalid_status',
            title: 'Only DRAFT or REJECTED listings can be edited',
            status: 400,
          });
      }

      const updated = await prisma.listing.update({
        where: { id },
        data: {
          ...(body.title !== undefined && {
            title: body.title,
            slug: slugify(body.title, id),
          }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.listingType !== undefined && { listingType: body.listingType }),
          ...(body.propertyType !== undefined && { propertyType: body.propertyType }),
          ...(body.priceMinor !== undefined && { priceMinor: body.priceMinor }),
          ...(body.currency !== undefined && { currency: body.currency }),
          ...(body.rentPeriod !== undefined && { rentPeriod: body.rentPeriod }),
          ...(body.areaM2 !== undefined && { areaM2: body.areaM2 }),
          ...(body.bedrooms !== undefined && { bedrooms: body.bedrooms }),
          ...(body.bathrooms !== undefined && { bathrooms: body.bathrooms }),
          ...(body.regionId !== undefined && { regionId: body.regionId }),
          ...(body.addressLine !== undefined && { addressLine: body.addressLine }),
          ...(body.lat !== undefined && { lat: body.lat }),
          ...(body.lng !== undefined && { lng: body.lng }),
        },
      });

      return reply.send({ id: updated.id, slug: updated.slug });
    },
  );

  // POST /v1/listings/:id/submit
  server.post(
    '/:id/submit',
    {
      preHandler: [requireAgent],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user!;

      const listing = await prisma.listing.findUnique({ where: { id } });
      if (!listing) return reply.status(404).send({ type: 'not_found', status: 404 });
      if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
        return reply.status(403).send({ type: 'forbidden', status: 403 });
      }
      if (!['DRAFT', 'REJECTED'].includes(listing.status)) {
        return reply
          .status(400)
          .send({ type: 'invalid_status', title: 'Cannot submit this listing', status: 400 });
      }

      await prisma.listing.update({ where: { id }, data: { status: 'PENDING_REVIEW' } });
      return reply.send({ status: 'PENDING_REVIEW' });
    },
  );

  // POST /v1/listings/:id/sold|rented|archive
  for (const [action, status] of [
    ['sold', 'SOLD'],
    ['rented', 'RENTED'],
    ['archive', 'ARCHIVED'],
  ] as const) {
    server.post(
      `/:id/${action}`,
      {
        preHandler: [requireAuth],
      },
      async (request, reply) => {
        const { id } = request.params as { id: string };
        const user = request.user!;

        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) return reply.status(404).send({ type: 'not_found', status: 404 });
        if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
          return reply.status(403).send({ type: 'forbidden', status: 403 });
        }

        await prisma.listing.update({ where: { id }, data: { status } });
        return reply.send({ status });
      },
    );
  }

  // POST /v1/listings/:id/images/sign
  server.post(
    '/:id/images/sign',
    {
      preHandler: [requireAgent],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user!;
      const { contentType } = request.body as { contentType: string };

      const listing = await prisma.listing.findUnique({ where: { id } });
      if (!listing) return reply.status(404).send({ type: 'not_found', status: 404 });
      if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
        return reply.status(403).send({ type: 'forbidden', status: 403 });
      }

      const imageCount = await prisma.listingImage.count({ where: { listingId: id } });
      if (imageCount >= 30) {
        return reply
          .status(400)
          .send({ type: 'too_many_images', title: 'Maximum 30 images per listing', status: 400 });
      }

      const key = `listings/${id}/${crypto.randomUUID()}`;
      const { uploadUrl } = await generateUploadUrl(key, contentType ?? 'image/jpeg');

      return reply.send({ uploadUrl, key });
    },
  );

  // POST /v1/listings/:id/images (register after upload)
  server.post(
    '/:id/images',
    {
      preHandler: [requireAgent],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const user = request.user!;
      const body = request.body as { key: string; width: number; height: number; alt?: string };

      const listing = await prisma.listing.findUnique({ where: { id } });
      if (!listing) return reply.status(404).send({ type: 'not_found', status: 404 });
      if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
        return reply.status(403).send({ type: 'forbidden', status: 403 });
      }

      const position = await prisma.listingImage.count({ where: { listingId: id } });
      const image = await prisma.listingImage.create({
        data: {
          listingId: id,
          url: body.key, // Will be replaced by worker with CDN URL
          width: body.width,
          height: body.height,
          position,
          alt: body.alt,
        },
      });

      enqueueImageProcessing({ listingId: id, imageId: image.id, key: body.key }, request.log);

      return reply.status(201).send({ id: image.id });
    },
  );

  // POST /v1/listings/:id/contact
  server.post('/:id/contact', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = ContactRequestSchema.parse(request.body);

    const listing = await prisma.listing.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: { owner: { select: { email: true, name: true } } },
    });

    if (!listing) {
      return reply.status(404).send({ type: 'not_found', status: 404 });
    }

    const contactReq = await prisma.contactRequest.create({
      data: {
        listingId: id,
        senderId: request.user?.id,
        senderName: body.name,
        senderEmail: body.email,
        senderPhone: body.phone,
        message: body.message,
        ipHash: crypto.createHash('sha256').update(request.ip).digest('hex'),
      },
    });

    void sendContactEmail({
      agentEmail: listing.owner.email,
      senderName: body.name,
      senderEmail: body.email,
      senderPhone: body.phone,
      message: body.message,
      listingTitle: listing.title,
      listingUrl: `${process.env['PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/sq/listings/${listing.slug}`,
    }).catch((err: unknown) => {
      request.log.error({ err, contactRequestId: contactReq.id }, 'Contact email failed');
    });

    return reply.status(202).send({ message: 'Contact request received.' });
  });
}
