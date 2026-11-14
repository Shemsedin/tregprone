# Getting Started with tregprone

This document provides a complete overview of the tregprone project, including setup, development, and deployment instructions. tregprone is a property listing and search platform for Albania, Kosovo, North Macedonia, and the Albanian diaspora, built as an MVP with listing, searching, and contacting features.

## Project Overview

tregprone ("Albanian Market") is a Zoopla/Rightmove-style platform for real estate. The MVP focuses on:

- Property listings (sale/rent) with photos, descriptions, and features
- Search and filtering by location, type, price, etc.
- User accounts (buyers, agents) with favorites and contact forms
- Admin moderation queue
- Multi-locale support (Albanian variants + English)

### Tech Stack

- **Language**: TypeScript (strict mode, noUncheckedIndexedAccess)
- **Frontend**: React Router v7 (framework mode, SSR), Vite, Tailwind CSS, shadcn/ui, Lucide icons, MapLibre GL JS, TanStack Query
- **Backend**: Node.js 20+, Fastify 5, Prisma 5.21 (PostgreSQL 16 with PostGIS), Meilisearch, Redis (BullMQ queues), Pino logging
- **Auth**: @fastify/jwt (EdDSA), argon2id hashing, arctic OAuth (Google)
- **Storage**: S3-compatible object store (Cloudflare R2, Backblaze B2, MinIO, or AWS S3), presigned URLs
- **Testing**: Vitest (unit), Playwright (e2e), supertest
- **Tooling**: npm workspaces, ESLint (flat config), Prettier, Husky + lint-staged, Changesets
- **Infra**: Docker Compose locally; Railway / Render / Fly.io / VPS for production
- **Monorepo**: npm workspaces under `apps/` (web, api, worker) and `packages/` (db, types, ui, i18n, config)

### Key Features

- **Geospatial**: PostGIS for property locations (WGS84 SRID 4326)
- **Money**: Integers in minor units (cents/qindarka) + currency codes (ALL/EUR/MKD/USD)
- **i18n**: ICU MessageFormat with fallback chains (sq-AL → sq-XK/sq-MK → en)
- **Security**: JWT access (15min) + refresh tokens, CSRF, rate-limiting, image sanitization
- **Performance**: Lighthouse ≥90 mobile, API p95 <250ms

## File Structure

The repository is organized as follows (after copying `scaffold/` to a new repo):

```
tregprone/
├── apps/
│   ├── web/          # React Router v7 SSR app
│   ├── api/          # Fastify HTTP API
│   └── worker/       # BullMQ background jobs
├── packages/
│   ├── db/           # Prisma schema + client
│   ├── types/        # Zod schemas + TS types
│   ├── ui/           # shadcn/ui components
│   ├── i18n/         # Translation catalogs + runtime
│   └── config/       # Shared ESLint + Tailwind preset
├── infra/
│   └── github/              # GitHub Actions workflows
├── docker-compose.yml # Local dev stack (postgres, redis, meilisearch, mailhog, minio)
├── package.json      # Root with workspaces + scripts (dev, build, test, lint, db:*, i18n:*)
├── tsconfig.base.json
└── .env.example      # Environment variables
```

Additional assets:

- `docs/` (15 files): Product spec, prompts, glossary
- `assets/`: Design tokens, color palette, component inventory, sitemap
- `templates/`: 10 standalone UI HTML mockups + 6 theme variants
- `prompts/`: 16 GitHub Copilot prompts for implementation

## Development Setup

### Prerequisites

- Node.js 20+ LTS
- npm 10+
- Docker + Docker Compose
- Git

### Steps

1. **Clone and setup**:

   ```bash
   git clone <your-repo-url> tregprone
   cd tregprone
   cp .env.example .env.local
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start local stack**:

   ```bash
   docker compose up -d
   # Starts: postgres (postgis), redis, meilisearch (master key: dev-master-key), mailhog, minio
   ```

4. **Database setup**:

   ```bash
   npm --workspace=@treg/db run generate  # Generate Prisma client
   npx prisma db push --schema=packages/db/prisma/schema.prisma  # Create/update local schema
   npx tsx packages/db/prisma/seed.ts                           # Populate with sample data
   ```

   `npm run db:deploy` is not enough for a fresh local database in the current repo because there are no checked-in Prisma migration files yet.

5. **Start development servers**:

   ```bash
   npm --workspace=@treg/api run dev
   npm --workspace=apps/web run dev
   ```

   - Web: http://localhost:5173
   - API: http://localhost:4000 (docs at /docs, health at /health/live)
   - Mailhog: http://localhost:8025 (email previews)

6. **Lint and test**:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run test:e2e  # Playwright tests
   ```

### Environment Variables (.env.local)

```bash
# Database
DATABASE_URL="postgresql://tregadmin:password@localhost:5432/treg"

# Redis
REDIS_URL="redis://localhost:6379"

# Meilisearch
MEILI_URL="http://localhost:7700"
MEILI_KEY="dev-master-key"

# Auth
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# OAuth (Google)
OAUTH_GOOGLE_CLIENT_ID="..."
OAUTH_GOOGLE_CLIENT_SECRET="..."

# Storage (MinIO for local dev)
BLOB_ACCOUNT="devstoreaccount1"
BLOB_ACCOUNT_KEY="Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=="
BLOB_PUBLIC_BASE_URL="http://localhost:10000/devstoreaccount1/images-public"

# Email (Mailhog)
MAIL_SMTP_HOST="localhost"
MAIL_SMTP_PORT="1025"

# CORS
CORS_ORIGINS="http://localhost:5173"
```

### i18n Catalogs

Translations are in `packages/i18n/catalogs/` (sq-AL, sq-XK, sq-MK, en). Run `npm run i18n:lint` to check parity. Extract new keys with `npm run i18n:extract`.

### UI Development

**Primitive components** live in `packages/ui/src/components/` (shadcn/ui): `button`, `card`, `input`, `badge`, `skeleton`, `textarea`.

**App-level components** live in `apps/web/app/components/`:

```
components/
├── layout/
│   ├── Header.tsx        — shared sticky nav (supports back link + nav items)
│   ├── Footer.tsx        — shared multi-column footer
│   └── PublicLayout.tsx  — public page wrapper (Header + children + optional Footer)
├── home/
│   ├── HomeHeroSearch.tsx   — hero section with buy/rent tabs + search form
│   ├── FeaturedCities.tsx   — city grid with links to filtered listings
│   └── HowItWorks.tsx       — 3-step explainer section
└── listings/
    └── ListingCard.tsx      — unified card (grid variant for home, list variant for search)
```

- Design tokens: `assets/design-tokens.json`
- Preview templates: open `templates/*.html` in browser
- Design inspiration: [onthemarket.com](https://www.onthemarket.com/) (layout), [jitty.com](https://jitty.com/) (component style)

## Hosting and Deployment

### Local Hosting

Use Docker Compose for full-stack local development (see above).

### Production Hosting

Deploy using Docker images to any provider that supports containers. Recommended options: Railway, Render, Fly.io, DigitalOcean App Platform, or a VPS with Docker Compose.

#### Prerequisites

- Docker (for building images)
- Account with your chosen hosting provider
- S3-compatible object store (Cloudflare R2, Backblaze B2, MinIO, or AWS S3)
- Custom domains (optional)

#### Steps

1. **Build images**:

   ```bash
   IMAGE_TAG=$(git rev-parse --short HEAD)
   docker build -t treg-web:$IMAGE_TAG ./apps/web
   docker build -t treg-api:$IMAGE_TAG ./apps/api
   docker build -t treg-worker:$IMAGE_TAG ./apps/worker
   ```

2. **Set environment variables** on your hosting provider:

   ```bash
   DATABASE_URL=postgres://...
   REDIS_URL=redis://...
   MEILI_URL=https://...
   MEILI_KEY=...
   JWT_PRIVATE_KEY_PEM=...
   JWT_PUBLIC_KEY_PEM=...
   OAUTH_GOOGLE_CLIENT_ID=...
   OAUTH_GOOGLE_CLIENT_SECRET=...
   S3_ENDPOINT=...
   S3_ACCESS_KEY=...
   S3_SECRET_KEY=...
   ```

3. **Run migrations**:

   ```bash
   npm run migrate:deploy --workspace=@treg/db
   ```

4. **Monitor**:
   - Logs: platform log stream or a log aggregator (Grafana, Papertrail, etc.)
   - Metrics: OpenTelemetry → OTLP backend of your choice
   - Alerts: set up via your monitoring provider

### Alternative Hosting Options

If you are on a budget or prefer simpler managed hosting, here are lower-cost or free-tier alternatives. These support Node.js, PostgreSQL, Redis, and object storage. Costs are approximate for light usage (1-10 users); scale up as needed. Adapt the `docker-compose.yml` for local parity.

#### 1. Railway (Recommended for Simplicity)

- **Pros**: Managed full-stack (Node.js + Postgres + Redis), easy deploys from Git, free tier for small apps.
- **Cons**: Limited customization; vendor lock-in.
- **Costs**: Free tier (~$0/month for hobby use), then $5-10/month per service.
- **Setup**:
  1. Sign up at railway.app.
  2. Connect Git repo; Railway auto-detects Node.js.
  3. Add Postgres and Redis services.
  4. Set env vars (DATABASE_URL, REDIS_URL, etc.).
  5. Deploy: `railway up`.
  - Storage: Use Railway's built-in or integrate Cloudflare R2 (~$0.015/GB).

#### 2. Render

- **Pros**: Free tier for web services, managed Postgres/Redis, Docker support, good for SSR.
- **Cons**: Free tier sleeps after inactivity; limited bandwidth.
- **Costs**: Free tier (~$0/month), paid plans $7-25/month per service.
- **Setup**:
  1. Sign up at render.com.
  2. Create web service from Git (Dockerfile or Node.js).
  3. Add managed Postgres and Redis.
  4. Configure env vars and build settings.
  5. Deploy automatically on push.
  - Storage: Integrate with Cloudflare R2 or Backblaze B2.

#### 3. DigitalOcean App Platform

- **Pros**: Docker-based, scales easily, affordable VPS alternative.
- **Cons**: Less managed than Railway/Render; steeper learning curve.
- **Costs**: $5/month for basic app, $7/month for Postgres, $6/month for Redis.
- **Setup**:
  1. Sign up at digitalocean.com.
  2. Create App Platform app from Git (use Dockerfile).
  3. Add managed databases (Postgres, Redis).
  4. Set env vars and resource limits.
  5. Deploy via Git push.
  - Storage: Spaces (S3-compatible, $1/month for 250GB).

#### 4. Vercel + Neon + Upstash (Serverless-ish)

- **Pros**: Vercel for frontend (free), Neon for Postgres (free tier), Upstash for Redis (generous free tier).
- **Cons**: Backend may need serverless functions; not full SSR without hacks.
- **Costs**: Mostly free ($0-10/month total).
- **Setup**:
  1. Vercel (vercel.com) for web app (React Router SSR).
  2. Neon (neon.tech) for Postgres (free 512MB).
  3. Upstash (upstash.com) for Redis (free 10k requests/day).
  4. For API/worker: Use Vercel functions or migrate to Railway/Render.
  - Storage: Vercel Blob or Cloudflare R2.

#### General Tips

- **Storage**: Use Cloudflare R2 (free tier: 10GB) or Backblaze B2 (~$5/month) for images.
- **Email**: Keep Resend or switch to SendGrid free tier.
- **Monitoring**: Use free tiers of Sentry or LogRocket.
- **Costs Comparison**: Self-hosted VPS ~$10-30/month; managed platforms ~$20-80/month for MVP.
- **Migration**: The stack is provider-agnostic; switch hosting by updating env vars.

Start with Railway or Render for the easiest full-stack experience.

## Next Steps

1. **Seed real data**: Add realistic property listings via the API or by extending `packages/db/prisma/seed.ts` with more varied data (images, prices, locations across AL/XK/MK).
2. **Image uploads**: Wire up the presigned URL flow so agents can upload property photos to MinIO/R2.
3. **Search (Meilisearch)**: Confirm the worker is indexing listings and the search page returns filtered results end-to-end.
4. **Auth flows**: Test the full register → login → JWT refresh cycle; verify Google OAuth works.
5. **Map integration**: Add MapLibre GL JS to the listing detail map tab and the search results page.
6. **Admin panel**: Test the moderation queue (approve/reject listings, user management).
7. **i18n**: Add English translations; run `npm run i18n:lint` and fix any missing keys.
8. **Testing**: Add Vitest unit tests for API routes and Playwright e2e for critical user journeys.
9. **CI/CD**: Set up GitHub Actions for build, typecheck, and lint on push.
10. **Design polish**: Apply [onthemarket.com](https://www.onthemarket.com/) layout patterns and [jitty.com](https://jitty.com/) component style details.

For questions, refer to `docs/` or open an issue.
