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
