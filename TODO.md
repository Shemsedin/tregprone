To list things to do and where last left

# Treg Prone — Progress Log

## What Has Been Done

### Infrastructure & Scaffold

- [x] Monorepo bootstrapped with npm workspaces (`apps/`, `packages/`)
- [x] Prisma schema defined with all core models (User, Listing, Image, Region, Favorite, Audit, etc.)
- [x] Fastify API wired up with JWT auth, routes for listings, users, regions, auth (login, register, Google OAuth, password reset)
- [x] React Router v7 SSR app (Vite + Tailwind) running on `/sq` locale root
- [x] Stack simplified: image processing and email run in the API (no worker/Redis), no Meilisearch, plain PostgreSQL (no PostGIS)
- [x] Docker Compose with Postgres, MinIO, MailHog
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
- [ ] **Search filters** — verify the search page filters (Postgres-backed) work end-to-end
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

## Part 2: Stack Simplification — Remaining

Done: Meilisearch, PostGIS, Redis/BullMQ and the separate worker were removed. Email and image processing now run inside the API; rate limiting is in-memory (per instance). The stack is `web` + `api` + Postgres, plus S3-compatible storage (R2) and SMTP.

- [ ] **(Optional) Consolidate API and Web.** If no separate mobile app is planned, call Prisma directly from React Router loaders/actions and run a single Node.js container.
- [ ] **Search beyond filters.** If free-text search is needed, add Postgres `pg_trgm` or full-text search on `Listing.title`/`description`.
- [ ] **Persistent jobs.** Image processing and email are in-process and are lost if the API restarts mid-job. If that becomes a problem, add `pg-boss` or `graphile-worker` (Postgres-backed, no Redis).
- [ ] **Rate limiting across instances.** In-memory limits are per instance; revisit only if you run more than one API instance.
