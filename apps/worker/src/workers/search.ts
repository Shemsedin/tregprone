import type { Job } from 'bullmq';
import { MeiliSearch } from 'meilisearch';

import { prisma } from '@treg/db';

const LISTINGS_INDEX = 'listings';

function getMeili() {
  return new MeiliSearch({
    host: process.env['MEILI_URL'] ?? 'http://localhost:7700',
    apiKey: process.env['MEILI_KEY'] ?? 'dev-master-key',
  });
}

interface SearchIndexJob {
  type: 'upsert' | 'delete';
  listingId: string;
}

export async function searchWorker(job: Job<SearchIndexJob>) {
  const { type, listingId } = job.data;
  const meili = getMeili();
  const index = meili.index(LISTINGS_INDEX);

  if (type === 'delete') {
    await index.deleteDocument(listingId);
    return;
  }

  // Fetch full listing from DB
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      region: true,
      features: { include: { feature: true } },
    },
  });

  if (!listing || listing.status !== 'PUBLISHED') {
    // Delete from index if not published
    await index.deleteDocument(listingId).catch(() => {});
    return;
  }

  const doc = {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    status: listing.status,
    priceMinor: Number(listing.priceMinor),
    currency: listing.currency,
    areaM2: listing.areaM2,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    lat: listing.lat,
    lng: listing.lng,
    regionId: listing.regionId,
    regionName: listing.region.name,
    regionCountry: listing.region.country,
    featureKeys: listing.features.map((f) => f.feature.key),
    publishedAt: listing.publishedAt ? listing.publishedAt.getTime() : null,
    createdAt: listing.createdAt.getTime(),
  };

  await index.addDocuments([doc]);
}
