To list things to do and where last left

# Treg Prone — Progress Log

## What Has Been Done

### Infrastructure & Scaffold

- [x] Monorepo bootstrapped with npm workspaces (`apps/`, `packages/`)
- [x] Prisma schema defined with all core models (User, Listing, Image, Region, Favorite, Audit, etc.)
- [x] Fastify API wired up with JWT auth, routes for listings, users, regions, auth (login, register, Google OAuth, password reset)
- [x] React Router v7 SSR app (Vite + Tailwind) running on `/sq` locale root
- [x] BullMQ worker scaffolded for background jobs (image processing, indexing)
- [x] Docker Compose with Postgres/PostGIS, Redis, Meilisearch, MinIO, MailHog
- [x] Shared packages: `@treg/types` (Zod schemas + TS types), `@treg/db` (Prisma client), `@treg/i18n`, `@treg/ui` (shadcn primitives), `@treg/config` (ESLint + Tailwind preset)
- [x] Locale routing: all public routes prefixed `($lang)` defaulting to `'sq'`

### Routes Implemented

- [x] Home page (`($lang)._index.tsx`) — hero, city grid, recent listings, how it works
- [x] Search/filter page (`($lang).listings._index.tsx`) — filter sidebar, listing grid
- [x] Listing detail page (`($lang).listings.$slug.tsx`) — gallery, tabs, contact form, lightbox, JSON-LD
- [x] Favorites page (`($lang).favorites.tsx`)
- [x] Agent dashboard (`($lang).account.listings.tsx`) — list own listings
- [x] New listing wizard (`($lang).account.listings.new.tsx`)
- [x] Edit listing (`($lang).account.listings.$id.edit.tsx`)
- [x] Auth routes: login, register, forgot password, reset password
- [x] Legal pages: terms, privacy
- [x] Admin layout + sub-routes: listings moderation, users, audit log
- [x] Sitemap XML route

### Search Functionality

- [x] Search Functionlity

### Component Modularisation (completed this session)

- [x] **Phase 1 — Shared layout**: extracted `Header` and `Footer` into `apps/web/app/components/layout/`; removed all inline nav repetition from 6 routes
- [x] **Phase 2 — Home page decomposition**: extracted `HomeHeroSearch`, `FeaturedCities`, `HowItWorks` into `apps/web/app/components/home/`; home route now pure composition
- [x] **Phase 3 — Listing card consolidation**: created unified `ListingCard` with `variant="grid"` (home) and `variant="list"` (search); deleted inline `SearchListingCard` copy
- [x] **Phase 4 — PublicLayout wrapper**: created `PublicLayout` (Header + children + optional Footer) and applied to home, search, and listing detail routes; `showFooter` prop controls footer visibility per page

---

## Next Focus

### Highest Priority

- [ ] **Seed real properties** — extend `packages/db/prisma/seed.ts` with realistic listings (varied types, prices, regions, photos) so the UI has data to display; without this, the app looks empty
- [ ] **Image upload flow** — wire presigned URL endpoint so agents can upload listing photos; photos stored in MinIO/R2
- [ ] Relook at the tags
- [ ] Result list should be 50-50 width and other details should be on the right side and also loog at other details
- [ ] Search
- [ ] Admin section
- [ ] User profile section

### Core Features

- [ ] **Map integration** — add MapLibre GL JS to listing detail map tab and embed a mini-map in search results sidebar
- [ ] **Meilisearch indexing** — verify the worker indexes listings on create/update and that the search page filters work end-to-end
- [ ] **Auth UI** — apply shared `Header` to auth routes (`login`, `register`, `forgot`, `reset`) for visual consistency; currently these have no shared nav
- [ ] **Legal pages** — add `Footer` to privacy and terms pages

### Admin Panel

- [ ] Test moderation queue: approve/reject listings, manage users
- [ ] Admin routes still use inline headers — consider `AdminLayout` component

### i18n

- [ ] Run `npm run i18n:lint` to surface missing keys in the new components (hardcoded Albanian strings need extracting)
- [ ] Add English translations for all new component copy

### Quality & Polish

- [ ] Add Vitest unit tests for API routes and for `ListingCard`, `Header`, `Footer` components
- [ ] Add Playwright e2e test for home → search → listing detail happy path
- [ ] Design polish pass: reference [onthemarket.com](https://www.onthemarket.com/) for home layout and [jitty.com](https://jitty.com/) for component details
- [ ] Set up GitHub Actions CI (build + typecheck + lint on push)

# What the cost could be

# tregprone — Operational Costs & Stack Simplification Guide

---

## Part 1: Operational Costs (Beyond VPS Hosting)

If you host the application on a single low-cost VPS (~€4–6/month, e.g., Hetzner Cloud / 4 GB RAM), here is the breakdown of all other external services and potential expenses.

### 1. Mandatory & Core Costs

| Item | Estimated Cost | Notes |
| :--- | :--- | :--- |
| **Domain Name** | **~€10–15/year** (`.com`)<br>**~€20–45/year** (`.al`, `.mk`) | Buy through **Cloudflare Registrar** or **Porkbun** for wholesale pricing without markup. |
| **Transactional Email** | **€0/month** (at launch) | **Resend** (3,000 free emails/mo) or **Brevo** (300 free emails/day). Plugs in via standard SMTP. Paid tiers start around ~$15–20/mo once scale exceeds limits. |
| **Map Tiles** | **€0 to $25/month** | `.env.example` defaults to MapTiler (free tier has strict non-commercial limits). **Free alternative:** Use **OpenFreeMap** (completely free, zero-config Vector/Raster tiles) or self-hosted Protomaps tiles on R2. |

### 2. Free Tiers with Generous Limits

| Item | Free Allowance | Over-Limit Costs |
| :--- | :--- | :--- |
| **Image Storage (Cloudflare R2)** | **10 GB storage free** / month<br>1M write operations free | **$0.015/GB** storage. **$0 egress fees** (unlike AWS S3 which charges bandwidth fees). |
| **SSL / TLS Certificates** | **100% Free** | Automated via **Caddy** or Let's Encrypt / Certbot. |
| **DNS & DDoS Protection** | **100% Free** | Cloudflare Free Tier. |
| **Error Monitoring** | **Free Tier** | Sentry (5k events/month) or GlitchTip (open-source Sentry alternative). |
| **Web Analytics** | **€0 to €9/month** | Self-host **Umami** (lightweight, zero-cost on your VPS) or use Plausible Cloud (~€9/mo). |

### 3. Hidden or Future Costs to Keep in Mind

- **Automated Database Backups**: €0 storage cost by running a nightly `cron` with `pg_dump` pushed straight into Cloudflare R2. VPS snapshots add ~20% of your VPS cost (~€1/mo).
- **Google OAuth**: $0 (Google Cloud Console OAuth client credentials are free).
- **Mobile Store Licenses (Optional)**: If you wrap this into an app later: Apple Developer ($99/year), Google Play Console ($25 one-time).

### Monthly Budget Summary

- **Minimal MVP Launch:** **~€5 – €7 / month** *(Hetzner VPS + amortized domain + free tiers for email, R2, and OpenFreeMap)*.
- **Growing / Production Comfort:** **~€20 – €35 / month** *(VPS + paid email volume + commercial map provider + automated VPS snapshots)*.

---

## Part 2: Stack Simplification Plan

### The Current Problem

The current repository is structured around **6 moving infrastructure pieces**:
1. `apps/web` (React Router v7 SSR)
2. `apps/api` (Fastify HTTP server)
3. `apps/worker` (BullMQ background worker)
4. PostgreSQL 16 (with PostGIS extension enabled)
5. Redis (for BullMQ queues & Fastify rate-limiting)
6. Meilisearch (search index)

### What the Code Actually Uses Today

An inspection of the codebase reveals that much of this is premature complexity:

- **Meilisearch is practically unused:** The search route (`GET /v1/listings` in `apps/api/src/routes/listings.ts`) queries PostgreSQL directly via Prisma. Meilisearch is only indexed by the worker and pinged in `/health`.
- **PostGIS is not utilized:** The Prisma schema specifies `extensions = [postgis]`, but listing coordinates are stored as basic `Float` columns (`lat`, `lng`). There are zero raw spatial queries (`ST_*`) in the codebase.
- **Worker & Redis are overhead:** Redis and BullMQ are only used for 3 tasks: sending emails (rare), image resizing (infrequent), and Meilisearch sync (redundant). In addition, image uploads currently enqueue to the wrong worker queue (`search-index` instead of `image-pipeline`).

---

### Step-by-Step Simplification Roadmap

#### Step 1: Remove Meilisearch (Instant Win)
- **Action:**
  - Delete `apps/api/src/lib/meili.ts` and `apps/worker/src/workers/search.ts`.
  - Remove Meili ping from `apps/api/src/routes/health.ts`.
  - Remove Meilisearch from `docker-compose.yml` and `.env.example`.
- **Benefit:** Eliminates 1 heavy container, saves ~200–500 MB RAM, removes search indexing sync bugs. Postgres `WHERE` and `ILIKE` / `pg_trgm` handle MVP search seamlessly.

#### Step 2: Remove PostGIS Extension
- **Action:**
  - Remove `previewFeatures = ["postgresqlExtensions"]` and `extensions = [postgis]` from `packages/db/prisma/schema.prisma`.
  - Use standard PostgreSQL image `postgres:16-alpine` instead of `postgis/postgis`.
- **Benefit:** Allows you to use any standard PostgreSQL database without worrying about custom Docker images or managed DB extension restrictions.

#### Step 3: Inline Worker Jobs & Retire Redis
- **Action:**
  - **Emails:** Send directly within Fastify route handlers using `nodemailer` (or fire-and-forget `void sendMail(...)`).
  - **Images:** Process images directly on upload using `sharp` before writing to R2, or offload transformations to Cloudflare Image Resizing.
  - **Rate Limiting:** Switch `@fastify/rate-limit` to in-memory store (default) instead of Redis.
  - Retire `apps/worker` and Redis container.
- **Benefit:** Eliminates Redis container and the background worker process. Reduces background memory usage by ~150–250 MB and simplifies local development.

*(Optional)* **Step 4: Consolidate API and Web**
- If you don't plan to build a separate mobile app in the short term, you can run React Router v7 loaders and actions with direct Prisma calls, collapsing the deployment into a **single Node.js web container**.

---

### Architecture: Before vs. After

| Component | Before (Current Repo) | After (Simplified MVP) |
| :--- | :--- | :--- |
| **Compute** | 3 containers (`web`, `api`, `worker`) | **2 containers** (`web`, `api`) — or 1 unified app |
| **Database** | PostgreSQL + PostGIS | **Standard PostgreSQL 16** |
| **Cache / Queue** | Redis 7 + BullMQ | **None** (in-memory rate limiting + inline tasks) |
| **Search Engine** | Meilisearch v1.10 | **PostgreSQL** (`WHERE`, `ORDER BY`, `pg_trgm`) |
| **File Storage** | MinIO (local) / S3 | **Cloudflare R2** (10 GB free) |
| **RAM Footprint** | ~1.5 GB – 2.0 GB minimum | **~400 MB – 600 MB** total |
| **VPS Cost** | Requires €8–15/mo server | **Runs comfortably on a €4–6/mo VPS** |