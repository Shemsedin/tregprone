# Treg Prone — Local Development

tregprone is a Zoopla/Rightmove-style property listing and search platform for Albania, Kosovo, North Macedonia, and the Albanian diaspora. The app is running — API, web, and all backing services are wired up and populated with seed data.

## Quick Start (Development)

**Prerequisites:** Node.js 20 LTS, npm, Docker & Docker Compose

```bash
# 1. Install dependencies
npm ci

# 2. Copy and edit environment variables (first time only)
cp .env.example .env

# 3. Start backing services (Postgres, MinIO, MailHog)
docker compose up -d
docker compose ps

# 4. Set up database (first time only)
npm --workspace=@treg/db run generate
npx prisma db push --schema=packages/db/prisma/schema.prisma
npx tsx packages/db/prisma/seed.ts

# 5. Run apps (separate terminals)
npm --workspace=@treg/api run dev   # http://localhost:4000
npm --workspace=apps/web run dev    # http://localhost:5173
```

**URLs:**

- Web app: http://localhost:5173/sq (Albanian locale)
- API: http://localhost:4000/health/live · /docs
- MailHog: http://localhost:8025

> If the home page shows `fetch failed`, the API is not running or the database has not been seeded.

## Project Structure

```
tregprone/
├── apps/
│   ├── web/          # React Router v7 SSR (Vite + Tailwind)
│   └── api/          # Fastify 5 REST API (also sends email and processes images)
├── packages/
│   ├── db/           # Prisma schema + client (@treg/db)
│   ├── types/        # Shared Zod schemas + TS types (@treg/types)
│   ├── ui/           # shadcn/ui primitives (@treg/ui)
│   ├── i18n/         # ICU translation catalogs + runtime (@treg/i18n)
│   └── config/       # Shared ESLint + Tailwind preset (@treg/config)
├── docs/             # Product spec, architecture, API spec, etc.
├── assets/           # Design tokens, component inventory, color palette
├── prompts/          # GitHub Copilot implementation prompts
└── docker-compose.yml
```

**Web app component layout** (`apps/web/app/`):

```
components/
├── layout/
│   ├── Header.tsx       — shared sticky nav
│   ├── Footer.tsx       — shared multi-column footer
│   └── PublicLayout.tsx — public page wrapper
├── home/
│   ├── HomeHeroSearch.tsx
│   ├── FeaturedCities.tsx
│   └── HowItWorks.tsx
└── listings/
    └── ListingCard.tsx  — grid + list variants
routes/
├── ($lang)._index.tsx              — home page
├── ($lang).listings._index.tsx     — search & filter
├── ($lang).listings.$slug.tsx      — listing detail
├── ($lang).favorites.tsx
├── ($lang).account.listings.tsx    — agent dashboard
├── ($lang).auth.{login,register,forgot,reset}.tsx
├── ($lang).legal.{terms,privacy}.tsx
├── admin.{_index,listings,users,audit}.tsx
└── sitemap[.]xml.tsx
```

## Useful Commands

```bash
npm run build           # build all packages + apps
npm run lint            # ESLint across workspace
npm run typecheck       # tsc across workspace
npm test                # Vitest unit tests
npm run test:e2e        # Playwright e2e tests
npm run i18n:lint       # check translation parity
npm run i18n:extract    # extract new i18n keys
npm run db:generate     # regenerate Prisma client
```

## Makefile Shortcuts

`make help` lists every target. Each one wraps an npm script or `docker compose` command:

| Target | What it does |
| --- | --- |
| `make up` / `down` / `ps` / `logs` | Start, stop, list, and tail the Docker services |
| `make reset` | Remove Docker volumes and restart (**destroys local data**) |
| `make install` | `npm ci` |
| `make dev` | Run web + api in parallel |
| `make build` / `test` / `lint` / `typecheck` | Run the matching npm script across all workspaces |
| `make db-migrate` / `db-deploy` | Prisma migrate (dev / CI-prod). Needs migration files, which the repo does not have yet — use `prisma db push` (see Quick Start) |
| `make db-seed` / `db-reset` / `db-studio` | Seed, drop + migrate + seed, or open Prisma Studio |
| `make i18n-lint` | Check translation key parity |
| `make clean` | Remove build output and `node_modules` |

## Notes

- Domain candidate: **tregprone.com**
- Design inspiration: [onthemarket.com](https://www.onthemarket.com/) (home page layout), [jitty.com](https://jitty.com/) (button/card components)
- See [TODO.md](./TODO.md) for current build status and next priorities
- See [docs/getting-started.md](./docs/getting-started.md) for full setup and deployment guide
