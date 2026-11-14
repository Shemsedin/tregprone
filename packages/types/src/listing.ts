import { z } from 'zod';

import { CURRENCY, LISTING_STATUS, LISTING_TYPE, PROPERTY_TYPE, RENT_PERIOD } from './enums.js';

export const MoneySchema = z.object({
  amountMinor: z.bigint().nonnegative(),
  currency: z.enum(CURRENCY),
});
export type Money = z.infer<typeof MoneySchema>;

export const RegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  country: z.string(),
  parentId: z.string().nullable(),
  centroidLat: z.number().nullable(),
  centroidLng: z.number().nullable(),
});
export type Region = z.infer<typeof RegionSchema>;

export const ListingImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurhash: z.string().nullable(),
  position: z.number().int().nonnegative(),
  alt: z.string().nullable(),
});
export type ListingImage = z.infer<typeof ListingImageSchema>;

export const ListingSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  listingType: z.enum(LISTING_TYPE),
  propertyType: z.enum(PROPERTY_TYPE),
  status: z.enum(LISTING_STATUS),
  priceMinor: z.bigint().nonnegative(),
  currency: z.enum(CURRENCY),
  rentPeriod: z.enum(RENT_PERIOD).nullable(),
  areaM2: z.number().int().positive().nullable(),
  bedrooms: z.number().int().nonnegative().nullable(),
  bathrooms: z.number().int().nonnegative().nullable(),
  lat: z.number(),
  lng: z.number(),
  regionId: z.string(),
  region: RegionSchema.pick({ id: true, name: true, slug: true, country: true }),
  coverImage: ListingImageSchema.nullable(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type ListingSummary = z.infer<typeof ListingSummarySchema>;

export const ListingDetailSchema = ListingSummarySchema.extend({
  description: z.string(),
  addressLine: z.string().nullable(),
  floor: z.number().int().nullable(),
  floorsTotal: z.number().int().nullable(),
  yearBuilt: z.number().int().nullable(),
  images: z.array(ListingImageSchema),
  featureKeys: z.array(z.string()),
  ownerId: z.string(),
  ownerName: z.string(),
});
export type ListingDetail = z.infer<typeof ListingDetailSchema>;

export const ListingsResponseSchema = z.object({
  items: z.array(ListingSummarySchema),
  nextCursor: z.string().nullable(),
  geo: z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(
      z.object({
        type: z.literal('Feature'),
        geometry: z.object({
          type: z.literal('Point'),
          coordinates: z.tuple([z.number(), z.number()]),
        }),
        properties: z.object({ id: z.string(), title: z.string() }),
      }),
    ),
  }),
  facets: z.record(z.string(), z.record(z.string(), z.number())),
});
export type ListingsResponse = z.infer<typeof ListingsResponseSchema>;

// ── Mutation bodies ──────────────────────────────────────────────────────────

export const CreateListingSchema = z
  .object({
    title: z.string().min(3).max(140),
    description: z.string().min(10).max(8000),
    listingType: z.enum(LISTING_TYPE),
    propertyType: z.enum(PROPERTY_TYPE),
    priceMinor: z.bigint().nonnegative(),
    currency: z.enum(CURRENCY),
    rentPeriod: z.enum(RENT_PERIOD).optional(),
    areaM2: z.number().int().positive().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    floor: z.number().int().optional(),
    floorsTotal: z.number().int().optional(),
    yearBuilt: z.number().int().min(1800).max(new Date().getFullYear() + 5).optional(),
    regionId: z.string(),
    addressLine: z.string().max(200).optional(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    featureKeys: z.array(z.string()).max(50).default([]),
  })
  .strict();
export type CreateListing = z.infer<typeof CreateListingSchema>;

export const UpdateListingSchema = CreateListingSchema.partial().strict();
export type UpdateListing = z.infer<typeof UpdateListingSchema>;

export const ContactRequestSchema = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(254),
    phone: z.string().max(30).optional(),
    message: z.string().min(10).max(2000),
  })
  .strict();
export type ContactRequest = z.infer<typeof ContactRequestSchema>;

export const ListingFiltersSchema = z.object({
  type: z.enum(LISTING_TYPE).optional(),
  propertyType: z.array(z.enum(PROPERTY_TYPE)).optional(),
  regionId: z.string().optional(),
  priceMin: z.coerce.number().int().nonnegative().optional(),
  priceMax: z.coerce.number().int().nonnegative().optional(),
  currency: z.enum(CURRENCY).optional(),
  bedroomsMin: z.coerce.number().int().nonnegative().optional(),
  bathroomsMin: z.coerce.number().int().nonnegative().optional(),
  areaMin: z.coerce.number().int().nonnegative().optional(),
  areaMax: z.coerce.number().int().nonnegative().optional(),
  bbox: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/).optional(),
  q: z.string().max(200).optional(),
  sort: z.enum(['-createdAt', 'priceMinor', '-priceMinor']).default('-createdAt'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
export type ListingFilters = z.infer<typeof ListingFiltersSchema>;
