import { MeiliSearch } from 'meilisearch';

let client: MeiliSearch | null = null;

export function getMeili(): MeiliSearch {
  if (!client) {
    client = new MeiliSearch({
      host: process.env['MEILI_URL'] ?? 'http://localhost:7700',
      apiKey: process.env['MEILI_KEY'] ?? 'dev-master-key',
    });
  }
  return client;
}

export const LISTINGS_INDEX = 'listings';

export interface ListingIndexDocument {
  id: string;
  slug: string;
  title: string;
  description: string;
  listingType: string;
  propertyType: string;
  status: string;
  priceMinor: number;
  currency: string;
  areaM2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  lat: number;
  lng: number;
  regionId: string;
  regionName: string;
  regionCountry: string;
  featureKeys: string[];
  publishedAt: number | null;
  createdAt: number;
}

export async function ensureListingsIndex() {
  const meili = getMeili();
  const index = meili.index(LISTINGS_INDEX);

  await index.updateSettings({
    searchableAttributes: ['title', 'description', 'regionName'],
    filterableAttributes: [
      'listingType',
      'propertyType',
      'status',
      'priceMinor',
      'currency',
      'areaM2',
      'bedrooms',
      'bathrooms',
      'regionId',
      'regionCountry',
    ],
    sortableAttributes: ['priceMinor', 'createdAt', 'publishedAt'],
    displayedAttributes: ['id', 'slug', 'title', 'listingType', 'propertyType', 'priceMinor', 'currency', 'areaM2', 'bedrooms', 'bathrooms', 'lat', 'lng', 'regionId', 'regionName', 'regionCountry', 'featureKeys', 'publishedAt', 'createdAt'],
  });
}
