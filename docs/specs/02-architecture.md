# 02 — Architecture

## 1. High-level diagram

```
                ┌────────────────────────┐
                │        Browser         │
                │  React Router v7 SSR   │
                └──────────┬─────────────┘
                           │ HTTPS
                ┌──────────▼─────────────┐
                │   CDN / Reverse Proxy  │
                └──────────┬─────────────┘
       ┌───────────────────┼─────────────────────┐
       │                   │                     │
┌──────▼──────┐    ┌───────▼────────┐   ┌────────▼────────┐
│  apps/web   │    │   apps/api     │   │ Static / images │
│ (Container) │    │  (Container)   │   │ Object store+CDN│
└──────┬──────┘    └───┬────────┬───┘   └─────────────────┘
       │               │        │
       │   ┌───────────▼──┐ ┌───▼─────────┐
       │   │ PostgreSQL   │ │ Meilisearch │
       │   │ + PostGIS    │ │ (search)    │
       │   └──────────────┘ └─────────────┘
       │               │
       │       ┌───────▼────────┐
       │       │   Redis (cache │
       │       │   + BullMQ)    │
       │       └───────┬────────┘
       │               │
       │       ┌───────▼────────┐
       │       │ apps/worker    │
       │       │ image / email  │
       │       │ index jobs     │
       │       └────────────────┘
```

## 2. Components

### `apps/web` — React Router v7 (SSR)

- Renders public site and `/admin` tree.
- Talks to `apps/api` over HTTPS using a server-side fetch in loaders/actions.
- Uses cookies (HttpOnly, SameSite=Lax) for session; access token kept
  server-side, refresh token rotated.
- Streams non-critical data (e.g. map tiles) with `defer` / `<Await>`.

### `apps/api` — Fastify

- REST + JSON. Versioned under `/v1`.
- Stateless; horizontal scaling via container replicas.
- Uses Prisma for DB; pgbouncer/transaction-pooling friendly.
- Emits domain events to Redis Streams; workers consume.

### `apps/worker` — BullMQ

- **image-pipeline:** resize, strip EXIF, generate AVIF/WebP variants,
  upload to Blob.
- **search-index:** upsert/delete in Meilisearch on listing changes.
- **mail:** transactional email via Postmark/Resend (provider abstracted).
- **moderation-hooks:** auto-flag suspicious content (rules + heuristics).

### Storage

- **PostgreSQL 16** with PostGIS for geo queries; primary system of record.
- **Meilisearch** for fast typo-tolerant + faceted search; rebuilt from Postgres.
- **Redis** for cache (popular searches, geocoding) and queues.
- **S3-compatible object storage** (e.g. Cloudflare R2, Backblaze B2, or
  self-hosted MinIO) for original + derived images (public-read CDN container)
  and private temporary uploads (presigned URLs).

### Edge / CDN

- Cloudflare (or any reverse proxy) terminates TLS, applies WAF rules, caches
  static assets and image variants. SSR HTML is uncached or short-cached.

## 3. Request flows

### Listing detail (cold)

1. Browser → CDN/proxy → `apps/web` SSR.
2. `loader` calls `apps/api` `GET /v1/listings/:id`.
3. API queries Postgres (single read), returns DTO.
4. Web renders HTML, hydrates, lazy-loads MapLibre.
5. Images loaded from CDN (`<picture>` with AVIF → WebP → JPEG).

### Search

1. Browser submits filter form (URL-encoded querystring).
2. `loader` calls `apps/api` `GET /v1/listings?...`.
3. API hits Meilisearch (filters + bbox) and Postgres (price/area sanity, sort).
4. Result list + GeoJSON for map markers returned together.
5. Map cluster layer renders client-side via MapLibre + Supercluster.

### Listing create

1. Agent submits form via React Router `Form` → `action`.
2. Action calls `apps/api` `POST /v1/listings` (Bearer JWT from cookie).
3. API validates with Zod, persists via Prisma transaction, emits
   `listing.created` event.
4. Worker indexes in Meilisearch and processes images.
5. UI redirects to draft preview; admin moderation queue gets the listing.

## 4. Environments

| Env     | Purpose                  | Hostnames (example)                         |
| ------- | ------------------------ | ------------------------------------------- |
| `dev`   | Local docker-compose     | `http://localhost:3000`, `:4000`            |
| `pr-*`  | Per-PR preview env       | `pr-123.preview.tregprone.dev`           |
| `stg`   | Staging                  | `stg.tregprone.com`                      |
| `prod`  | Production               | `tregprone.com`, `www.tregprone.com`  |

## 5. Cross-cutting concerns

- **Tracing:** OpenTelemetry SDK in `apps/api` and `apps/web`. Exporter to
  any OTLP-compatible backend (e.g. Grafana, Sentry, or self-hosted Jaeger).
- **Logs:** Pino JSON; correlation id propagated via `x-request-id` header.
- **Config:** 12-factor; envs via environment variables / secrets provider.
  Local `.env` with `.env.example` checked in.
- **Feature flags:** Simple env-driven flags for MVP; later move to
  ConfigCat / Unleash.

## 6. Why this architecture

- Splitting `web` and `api` keeps SSR fast (no DB on the same node) and lets
  agents/3rd parties consume the API later.
- Meilisearch handles Albanian diacritics + typos better than naive `ILIKE`.
- BullMQ workers isolate image work so SSR p95 stays predictable.
- Provider-agnostic: the stack runs on any VPS, Railway, Render, Fly.io, or
  bare Docker host with no vendor lock-in.
