# 04 — Data Model

This is the canonical data model for the MVP. Copilot must use these names
and types when generating Prisma schema and Zod DTOs.

## 1. Entity overview

```
User ───< Listing >─── Region
  │           │            │
  │           ├──< ListingImage
  │           ├──< ListingFeature >── Feature
  │           └──< ContactRequest
  │
  └──< Favorite >── Listing
```

## 2. Enumerations

```ts
// packages/types/src/enums.ts
export const Locale = ['sq-AL', 'sq-XK', 'sq-MK', 'en'] as const;
export const Currency = ['ALL', 'EUR', 'MKD', 'USD'] as const;
export const ListingType = ['SALE', 'RENT'] as const;
export const PropertyType = [
  'APARTMENT', 'HOUSE', 'VILLA', 'STUDIO',
  'LAND', 'COMMERCIAL', 'OFFICE', 'GARAGE', 'OTHER',
] as const;
export const ListingStatus = [
  'DRAFT', 'PENDING_REVIEW', 'PUBLISHED',
  'REJECTED', 'SOLD', 'RENTED', 'ARCHIVED',
] as const;
export const UserRole = ['USER', 'AGENT', 'ADMIN'] as const;
export const RentPeriod = ['MONTH', 'WEEK', 'DAY'] as const; // null when SALE
```

## 3. Prisma schema (target)

```prisma
// packages/db/prisma/schema.prisma
generator client { provider = "prisma-client-js" }

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  emailVerified DateTime?
  passwordHash  String?
  name          String
  phone         String?
  role          UserRole   @default(USER)
  locale        String     @default("sq-AL")
  avatarUrl     String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  listings      Listing[]       @relation("ListingOwner")
  favorites     Favorite[]
  contacts      ContactRequest[] @relation("Sender")
  oauthAccounts OAuthAccount[]
  sessions      Session[]
}

model OAuthAccount {
  id           String  @id @default(cuid())
  userId       String
  provider     String  // 'google'
  providerUid  String
  accessToken  String?
  refreshToken String?
  expiresAt    DateTime?
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUid])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshHash  String
  userAgent    String?
  ipHash       String?
  createdAt    DateTime @default(now())
  expiresAt    DateTime
  revokedAt    DateTime?
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Region {
  id        String   @id @default(cuid())
  // 'AL', 'XK', 'MK' — ISO-3166-1 alpha-2 (XK = Kosovo, ad-hoc)
  country   String
  name      String   // canonical Albanian name
  slug      String   @unique
  parentId  String?
  parent    Region?  @relation("RegionTree", fields: [parentId], references: [id])
  children  Region[] @relation("RegionTree")
  listings  Listing[]
  // optional centroid for quick map jumps
  centroidLat Float?
  centroidLng Float?
}

model Listing {
  id            String         @id @default(cuid())
  ownerId       String
  owner         User           @relation("ListingOwner", fields: [ownerId], references: [id])
  status        ListingStatus  @default(DRAFT)
  listingType   ListingType
  propertyType  PropertyType
  title         String
  // Albanian description; long text
  description   String         @db.Text
  // money in minor units (e.g. cents). Always non-null for PUBLISHED.
  priceMinor    BigInt
  currency      String         // ALL / EUR / MKD / USD
  rentPeriod    RentPeriod?
  areaM2        Int?
  bedrooms      Int?
  bathrooms     Int?
  floor         Int?
  floorsTotal   Int?
  yearBuilt     Int?

  regionId      String
  region        Region         @relation(fields: [regionId], references: [id])
  addressLine   String?
  // PostGIS point (set via raw SQL in migrations)
  // location    Unsupported("geography(Point, 4326)")
  lat           Float
  lng           Float

  publishedAt   DateTime?
  expiresAt     DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  images        ListingImage[]
  features      ListingFeature[]
  contacts      ContactRequest[]
  favorites     Favorite[]

  @@index([status, listingType, propertyType])
  @@index([regionId])
  @@index([priceMinor])
}

model ListingImage {
  id          String   @id @default(cuid())
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url         String   // CDN URL of original
  width       Int
  height      Int
  blurhash    String?
  position    Int      @default(0)
  alt         String?

  @@index([listingId, position])
}

model Feature {
  id    String  @id @default(cuid())
  // canonical key; used as i18n message id, e.g. 'feature.balcony'
  key   String  @unique
}

model ListingFeature {
  listingId String
  featureId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  feature   Feature @relation(fields: [featureId], references: [id], onDelete: Cascade)

  @@id([listingId, featureId])
}

model Favorite {
  userId    String
  listingId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@id([userId, listingId])
}

model ContactRequest {
  id         String   @id @default(cuid())
  listingId  String
  senderId   String?
  senderName String
  senderEmail String
  senderPhone String?
  message    String   @db.Text
  ipHash     String?
  createdAt  DateTime @default(now())

  listing  Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  sender   User?   @relation("Sender", fields: [senderId], references: [id])

  @@index([listingId, createdAt])
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String   // 'listing.publish', 'user.suspend', ...
  targetId  String?
  meta      Json?
  createdAt DateTime @default(now())
}

enum UserRole       { USER AGENT ADMIN }
enum ListingType    { SALE RENT }
enum RentPeriod     { MONTH WEEK DAY }
enum PropertyType   { APARTMENT HOUSE VILLA STUDIO LAND COMMERCIAL OFFICE GARAGE OTHER }
enum ListingStatus  { DRAFT PENDING_REVIEW PUBLISHED REJECTED SOLD RENTED ARCHIVED }
```

> **Geo column:** Prisma cannot natively model `geography`. Add it via a manual
> migration step:
>
> ```sql
> ALTER TABLE "Listing" ADD COLUMN "location" geography(Point, 4326);
> CREATE INDEX listing_location_gix ON "Listing" USING GIST ("location");
> -- maintained by trigger from (lat, lng) or by application code.
> ```

## 4. Indexing strategy

- Composite index `(status, listingType, propertyType)` for the home/search.
- GIST index on `location` for bounding-box and radius queries.
- Btree on `priceMinor`, `regionId`, `createdAt DESC` (for "newest").
- Meilisearch primary key: `id`. Searchable: `title`, `description`,
  `region.name`, `addressLine`. Filterable: `listingType`, `propertyType`,
  `priceMinor`, `bedrooms`, `bathrooms`, `areaM2`, `regionId`, `status`,
  `lat`, `lng`. Sortable: `priceMinor`, `createdAt`, `_geo`.

## 5. Seed data

- Regions: Albania (Tirana, Durrës, Vlorë, Shkodër, Korçë, …), Kosovo
  (Prishtinë, Prizren, Pejë, …), North Macedonia (Shkup/Skopje, Tetovë,
  Gostivar, Kumanovë, …). Provide bilingual names where applicable.
- Features: balkon, parkim, ashensor, kopsht, bodrum, mobiluar, klimë,
  ngrohje qendrore, internet, pamje deti, pamje mali, etj.
- Demo users: 1 admin, 2 agents, 5 regular users; 30 sample listings.

## 6. Privacy & retention

- `User.email` and `senderEmail` are PII — never logged.
- Sessions auto-expire after 30 days; revoked on password change.
- `ContactRequest` retained 12 months, then anonymized (`senderEmail`,
  `senderPhone` → `null`, `ipHash` already hashed).
- `AuditLog` retained 24 months.
- GDPR data export: produce a single JSON of user-owned rows.
- GDPR delete: cascade except keep `AuditLog` actor as `null`.
