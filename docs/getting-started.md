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
- **Backend**: Node.js 20+, Fastify 5, Prisma 5.21 (PostgreSQL 16), sharp (image processing), nodemailer (SMTP), Pino logging
- **Auth**: @fastify/jwt (EdDSA), argon2id hashing, arctic OAuth (Google)
- **Storage**: S3-compatible object store (Cloudflare R2, Backblaze B2, MinIO, or AWS S3), presigned URLs
- **Testing**: Vitest (unit), Playwright (e2e), supertest
- **Tooling**: npm workspaces, ESLint (flat config), Prettier, Husky + lint-staged, Changesets
- **Infra**: Docker Compose locally; a single VPS with Docker Compose for production
- **Monorepo**: npm workspaces under `apps/` (web, api) and `packages/` (db, types, ui, i18n, config)

### Key Features

- **Geospatial**: Property locations stored as WGS84 `lat`/`lng` floats (PostGIS can be added later if radius/polygon queries are needed)
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
│   └── api/          # Fastify HTTP API (also sends email and processes images)
├── packages/
│   ├── db/           # Prisma schema + client
│   ├── types/        # Zod schemas + TS types
│   ├── ui/           # shadcn/ui components
│   ├── i18n/         # Translation catalogs + runtime
│   └── config/       # Shared ESLint + Tailwind preset
├── infra/
│   └── github/              # GitHub Actions workflows
├── docker-compose.yml # Local dev stack (postgres, mailhog, minio)
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
   cp .env.example .env
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start local stack**:

   ```bash
   docker compose up -d
   # Starts: postgres, mailhog, minio
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

   > Shortcuts: the root `Makefile` wraps these commands (`make up`, `make dev`, `make lint`, `make test`, `make db-seed`, …). Run `make help` for the full list.

### Environment Variables

Copy `.env.example` to `.env` — the defaults match `docker-compose.yml`, so nothing needs changing for local development. Only the variables below are read by the code; all have local defaults.

```bash
DATABASE_URL="postgresql://treg:treg@localhost:5432/treg?schema=public"

# JWT (EdDSA). Leave empty locally: an ephemeral key pair is generated on each API start.
JWT_PRIVATE_KEY_PEM=
JWT_PUBLIC_KEY_PEM=

# Storage (S3-compatible; MinIO locally)
BLOB_ENDPOINT="http://localhost:9002"
BLOB_ACCESS_KEY="minioadmin"
BLOB_SECRET_KEY="minioadmin"
BLOB_PUBLIC_BASE_URL="http://localhost:9002/images-public"

# Email (MailHog locally)
SMTP_HOST="localhost"
SMTP_PORT="1025"

PUBLIC_APP_URL="http://localhost:3000"
PUBLIC_API_URL="http://localhost:4000"
CORS_ORIGINS="http://localhost:3000"
```

> Google OAuth (`OAUTH_GOOGLE_*`) and `RESEND_API_KEY` appear in `.env.example` but are not used by the code yet.

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

**Recommended:** a single small VPS (~€4–6/month) running Docker Compose — the cheapest and simplest option for this stack. See [Hosting Options](#hosting-options) for details and alternatives.

Deploy using Docker images to any provider that supports containers. A full deployment needs **three containers/services plus external accounts** (see [Accounts to Create](#accounts-to-create)):

| Piece | Notes |
| --- | --- |
| `web`, `api` | The two app images (Dockerfiles in `apps/*`). The API also sends email and processes uploaded images in-process |
| PostgreSQL 16 | Any standard Postgres (no extensions required) |
| S3-compatible object store | Cloudflare R2, Backblaze B2, MinIO, or AWS S3 |
| SMTP server | Any SMTP provider (the code speaks SMTP only) |

#### Prerequisites

- Docker (for building images)
- Account with your chosen hosting provider
- S3-compatible object store with a public bucket (`images-public`) and a private bucket (`images-private`)
- SMTP credentials (e.g. Resend, Brevo, or Mailgun)
- Custom domains (optional)

#### Accounts to Create

| # | Account | Needed for | Required? | Cost |
| --- | --- | --- | --- | --- |
| 1 | **Hosting provider** (e.g. Hetzner Cloud, or Oracle Cloud for the $0 variant) | VPS that runs `web`, `api` and Postgres | Yes | ~€4–6/month |
| 2 | **Object storage**: Cloudflare R2 (card required, free up to 10 GB) or Backblaze B2 | Listing images and `pg_dump` backups. Skip if you run MinIO on the VPS | Yes, unless using MinIO | Free tier / ~$5/month |
| 3 | **SMTP provider** (Resend, Brevo or Mailgun) | Verification and password-reset emails (`SMTP_*`) | Yes | Free tier |
| 4 | **Domain registrar** (Namecheap, Cloudflare Registrar, etc.) | Public domain pointing at the VPS (Caddy handles HTTPS automatically) | Recommended | ~€10/year |
| 5 | **GitHub** | Repository and CI/CD (`infra/github/workflows`) | Already have | Free |
| 6 | **MapTiler** (or another vector tile provider) | Map tiles via `PUBLIC_MAP_STYLE_URL`, once map integration is added | Later | Free tier |
| 7 | **Google Cloud Console** (OAuth client) | "Sign in with Google" (`OAUTH_GOOGLE_*`), once implemented | Later | Free |
| 8 | **Sentry** or an OTLP backend such as Grafana Cloud | Error tracking and metrics | Optional | Free tier |
| 9 | **Plausible** | Privacy-friendly analytics (`PUBLIC_PLAUSIBLE_DOMAIN`) | Optional | Paid, or self-host |

To launch with the minimum, create accounts **1, 3 and 4**, plus **2** if you don't want to self-host storage with MinIO.

#### Steps

1. **Build images** (the Dockerfiles expect the repository root as build context):

   ```bash
   IMAGE_TAG=$(git rev-parse --short HEAD)
   docker build -f apps/web/Dockerfile -t treg-web:$IMAGE_TAG .
   docker build -f apps/api/Dockerfile -t treg-api:$IMAGE_TAG .
   ```

2. **Set environment variables** on your hosting provider. Only the variables below are read by the code; see `.env.example` for the full list.

   Required in production (`api` unless noted):

   ```bash
   NODE_ENV=production
   DATABASE_URL=postgres://...          # api, migrations
   JWT_PRIVATE_KEY_PEM=...              # api only; EdDSA PKCS8 PEM (use \n for newlines)
   JWT_PUBLIC_KEY_PEM=...               # api only; EdDSA SPKI PEM
   COOKIE_SECRET=...                    # api only; long random string
   PUBLIC_APP_URL=https://yourdomain    # api
   PUBLIC_API_URL=https://api.yourdomain # web
   CORS_ORIGINS=https://yourdomain      # api, comma-separated
   BLOB_ENDPOINT=https://...            # S3 endpoint
   BLOB_ACCESS_KEY=...
   BLOB_SECRET_KEY=...
   BLOB_PUBLIC_BASE_URL=https://...     # public URL of the images-public bucket
   SMTP_HOST=...
   SMTP_PORT=587
   SMTP_USER=...
   SMTP_PASS=...
   MAIL_FROM="Treg Prone <noreply@yourdomain>"
   ```

   Optional: `BLOB_REGION` (default `auto`), `BLOB_PUBLIC_CONTAINER` / `BLOB_PRIVATE_CONTAINER` (default `images-public` / `images-private`), `API_PORT`, `API_LOG_LEVEL`, `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`.

   Not needed yet: `OAUTH_GOOGLE_*` (Google login is not implemented in the API) and `RESEND_API_KEY` (use Resend's SMTP credentials via `SMTP_*` instead).

   Without `JWT_*_PEM` the API generates a new key pair on every start, which invalidates all sessions on restart and breaks multi-instance setups. Generate a key pair with:

   ```bash
   openssl genpkey -algorithm ed25519 -out jwt-private.pem
   openssl pkey -in jwt-private.pem -pubout -out jwt-public.pem
   ```

3. **Run migrations**:

   ```bash
   npm run migrate:deploy --workspace=@treg/db
   ```

4. **Monitor**:
   - Logs: platform log stream or a log aggregator (Grafana, Papertrail, etc.)
   - Metrics: OpenTelemetry → OTLP backend of your choice
   - Alerts: set up via your monitoring provider

### Hosting Options

Because the stack still needs several services (app containers, Postgres, object storage, SMTP), managed platforms add up quickly. A single VPS is the cheapest and simplest option. Prices are approximate (checked late 2026) — verify before committing. E.g Hetzner

#### Recommended: single small VPS + Docker Compose (cheapest, one bill)

- **Pros**: One flat price (~€4–6/month, e.g. Hetzner Cloud with 4 GB RAM) runs everything: web, api and Postgres. Reuses the Postgres service already defined in `docker-compose.yml` (`postgres:16-alpine`). No per-service or per-GB billing surprises.
- **Cons**: You manage the server (updates, backups).
- **Setup**:
  1. Create a VPS with Docker installed and point your domain's DNS at it.
  2. Build the images (step 1 above) or build on the server, and add `web` and `api` to a compose file alongside Postgres (do not publish the Postgres port publicly).
  3. Put Caddy (automatic HTTPS) in front of `web` (port 3000) and `api` (port 4000).
  4. Set the environment variables above, with `DATABASE_URL` pointing at the Postgres compose service name.
  5. Run migrations, then `docker compose up -d`.
  6. Schedule `pg_dump` backups to your object store.
  - Storage: Cloudflare R2 (free up to 10 GB) — or MinIO on the same box.
  - Email: Resend/Brevo free tier via SMTP.
- **$0 variant**: Oracle Cloud "Always Free" ARM VM (up to 4 vCPU / 24 GB). Free, but signup can be fussy and capacity is not guaranteed. Build images for `linux/arm64`.

#### General Tips

- **Storage**: Cloudflare R2 (free tier: 10GB) or Backblaze B2 (~$5/month) for images.
- **Email**: Use any SMTP provider's free tier (Resend, Brevo). The code uses SMTP only.
- **Monitoring**: Use free tiers of Sentry or LogRocket.
- **Migration**: The stack is provider-agnostic; switch hosting by updating env vars.

To keep costs near zero while staying simple, start with the single VPS.

## Next Steps

1. **Seed real data**: Add realistic property listings via the API or by extending `packages/db/prisma/seed.ts` with more varied data (images, prices, locations across AL/XK/MK).
2. **Image uploads**: Wire up the presigned URL flow so agents can upload property photos to MinIO/R2.
3. **Search**: Confirm the search page returns filtered results end-to-end (Postgres-backed; add `pg_trgm` for free-text search if needed).
4. **Auth flows**: Test the full register → login → JWT refresh cycle; verify Google OAuth works.
5. **Map integration**: Add MapLibre GL JS to the listing detail map tab and the search results page.
6. **Admin panel**: Test the moderation queue (approve/reject listings, user management).
7. **i18n**: Add English translations; run `npm run i18n:lint` and fix any missing keys.
8. **Testing**: Add Vitest unit tests for API routes and Playwright e2e for critical user journeys.
9. **CI/CD**: Set up GitHub Actions for build, typecheck, and lint on push.
10. **Design polish**: Apply [onthemarket.com](https://www.onthemarket.com/) layout patterns and [jitty.com](https://jitty.com/) component style details.

For questions, refer to `docs/` or open an issue.
