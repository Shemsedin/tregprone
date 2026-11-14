# 05 — API Specification

REST + JSON. All routes versioned under `/v1`. All requests/responses are
UTF-8 JSON unless noted. Errors use [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807)
problem details.

## 1. Conventions

- **Base URL:** `https://api.tregprone.com/v1`
- **Auth:** `Authorization: Bearer <jwt>` for SPA clients; HttpOnly cookie
  (`ts_session`) for browser SSR.
- **Pagination:** cursor-based. Query params: `limit` (default 20, max 100),
  `cursor` (opaque string). Responses include `nextCursor` (nullable).
- **Filtering:** explicit query params, not nested JSON bodies.
- **Sorting:** `sort=field` or `sort=-field`. Allowed fields documented per route.
- **IDs:** `cuid` strings.
- **Time:** ISO-8601 with timezone (`2026-04-29T12:34:56.000Z`).
- **Money:** integer minor units + `currency`.

### Error envelope

```json
{
  "type": "https://tregprone.com/errors/validation",
  "title": "Invalid request",
  "status": 400,
  "detail": "title: must be at most 140 characters",
  "instance": "/v1/listings",
  "errors": [{ "path": ["title"], "code": "too_big" }]
}
```

## 2. Endpoints

### Health

- `GET /health/live` → `200 {status:"ok"}`
- `GET /health/ready` → DB + Redis + Meili checks

### Auth

- `POST /auth/register`
  - body: `{ email, password, name, role: 'USER'|'AGENT' }`
  - response: `201 { user, accessToken, refreshToken }`
- `POST /auth/login` → `{ user, accessToken, refreshToken }`
- `POST /auth/refresh` → rotates refresh; returns new tokens.
- `POST /auth/logout` → revokes session.
- `POST /auth/forgot-password` → emails reset link (always 202).
- `POST /auth/reset-password` → `{ token, newPassword }`
- `GET  /auth/oauth/:provider/start` → 302 to provider
- `GET  /auth/oauth/:provider/callback` → 302 to web with cookie set
- `GET  /auth/me` → current user

### Users

- `GET /users/me`
- `PATCH /users/me` → `{ name?, phone?, locale?, avatarUrl? }`
- `DELETE /users/me` → soft delete + GDPR purge job

### Listings (public)

- `GET /listings`
  - filters: `type=SALE|RENT`, `propertyType`, `regionId`, `priceMin`,
    `priceMax`, `currency`, `bedroomsMin`, `bathroomsMin`, `areaMin`,
    `areaMax`, `bbox=west,south,east,north`, `q` (free text),
    `sort=-createdAt|priceMinor|-priceMinor`, `limit`, `cursor`.
  - response:
    ```json
    {
      "items": [ /* ListingSummary */ ],
      "nextCursor": "…",
      "geo": { "type": "FeatureCollection", "features": [/* points */] },
      "facets": { "propertyType": { "APARTMENT": 412, "HOUSE": 88 } }
    }
    ```
- `GET /listings/:id` → `ListingDetail`
- `GET /listings/slug/:slug` → `ListingDetail` (SEO-friendly)

### Listings (owner)

All require role `AGENT` or owner of the resource.

- `POST   /listings` → create as `DRAFT`.
- `PATCH  /listings/:id` → partial update (DRAFT or REJECTED only).
- `POST   /listings/:id/submit` → moves to `PENDING_REVIEW`.
- `POST   /listings/:id/sold` → status `SOLD`.
- `POST   /listings/:id/rented` → status `RENTED`.
- `POST   /listings/:id/archive` → status `ARCHIVED`.
- `DELETE /listings/:id` → soft delete (admin can hard delete).

### Listing images

- `POST /listings/:id/images/sign` → `{ uploadUrl, headers, key }` (SAS).
- `POST /listings/:id/images` → after upload, body `{ key, width, height }`.
- `PATCH /listings/:id/images/reorder` → `{ order: ["imgId1", "imgId2"] }`.
- `DELETE /listings/:id/images/:imageId`

### Favorites

- `GET    /me/favorites`
- `PUT    /me/favorites/:listingId`
- `DELETE /me/favorites/:listingId`

### Contact

- `POST /listings/:id/contact`
  - body: `{ name, email, phone?, message }`
  - rate-limit: 5/min/IP, 20/day/IP.
  - response: `202 Accepted` (email enqueued).

### Taxonomy

- `GET /regions?country=AL|XK|MK&parentId=…`
- `GET /features` → list of canonical feature keys.

### Admin (role `ADMIN`)

- `GET   /admin/listings?status=PENDING_REVIEW`
- `POST  /admin/listings/:id/approve`
- `POST  /admin/listings/:id/reject` → `{ reason }`
- `GET   /admin/users`
- `POST  /admin/users/:id/suspend`
- `POST  /admin/users/:id/unsuspend`
- `GET   /admin/audit-log?limit=100&cursor=…`
- `POST  /admin/regions` / `PATCH` / `DELETE`
- `POST  /admin/features` / `DELETE`
- `GET   /admin/metrics` → counts of users, listings by status, contacts/24h.

## 3. DTO shapes (Zod-generated TS)

```ts
// packages/types/src/listing.ts
import { z } from 'zod';
import { ListingType, PropertyType, ListingStatus, RentPeriod, Currency } from './enums';

export const Money = z.object({
  amountMinor: z.bigint().nonnegative(),
  currency: z.enum(Currency),
});

export const ListingSummary = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  listingType: z.enum(ListingType),
  propertyType: z.enum(PropertyType),
  price: Money,
  rentPeriod: z.enum(RentPeriod).nullable(),
  areaM2: z.number().int().positive().nullable(),
  bedrooms: z.number().int().nonnegative().nullable(),
  bathrooms: z.number().int().nonnegative().nullable(),
  region: z.object({ id: z.string(), name: z.string(), country: z.string() }),
  coords: z.object({ lat: z.number(), lng: z.number() }),
  coverImage: z.object({ url: z.string().url(), blurhash: z.string().nullable() }).nullable(),
  publishedAt: z.string().datetime().nullable(),
});

export const ListingDetail = ListingSummary.extend({
  description: z.string(),
  features: z.array(z.string()),
  images: z.array(z.object({
    id: z.string(),
    url: z.string().url(),
    width: z.number().int(),
    height: z.number().int(),
    blurhash: z.string().nullable(),
    alt: z.string().nullable(),
  })),
  owner: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().url().nullable(),
    role: z.enum(['USER','AGENT','ADMIN']),
  }),
  status: z.enum(ListingStatus),
});
```

## 4. Caching

- `GET /listings/:id` → `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600`.
- `GET /listings` (anonymous) → `s-maxage=30, stale-while-revalidate=60`.
- Vary on `Accept-Language`.

## 5. Rate limiting

- Anonymous: 60 req/min/IP.
- Authenticated: 600 req/min/user.
- `POST /auth/*`: 10 req/min/IP.
- `POST /listings/:id/contact`: 5/min/IP, 20/day/IP.
- 429 with `Retry-After`.

## 6. Webhooks (post-MVP)

- `listing.published`, `listing.contacted`, `user.created`. HMAC-signed.
