# 14 — MVP Roadmap

## Phase 0 — Foundations (week 1–2)

- Repo bootstrap: npm workspaces, ESLint flat config, Prettier, Husky.
- `packages/config`, `packages/types`, `packages/i18n` skeletons.
- `apps/web` (React Router v7 framework mode) with locale routing + Tailwind.
- `apps/api` (Fastify) with healthchecks, request ids, pino, OpenAPI.
- `packages/db` Prisma schema scaffold + first migration.
- `docker-compose` for Postgres/Redis/Meili/MinIO/Mailhog.
- `infra/github` CI skeleton + placeholder PR preview workflow.

## Phase 1 — Auth & accounts (week 3)

- Register, login, refresh, logout, forgot/reset.
- Google OAuth.
- Sessions + RBAC middleware.
- `/account` profile page.

## Phase 2 — Listing CRUD (week 4–5)

- Prisma models + zod DTOs.
- Endpoints: create, update, submit, list (owner), get.
- Image upload pipeline (signed URL, worker re-encode, CDN).
- Agent dashboard pages with the 4-step wizard.

## Phase 3 — Public search & detail (week 6–7)

- Meili index + worker reindexer.
- `GET /v1/listings` with filters + facets + GeoJSON.
- Search results page with map (MapLibre) and filter rail.
- Listing detail page with gallery + JSON-LD + contact form.

## Phase 4 — Admin & moderation (week 8)

- Admin shell + moderation queue.
- Approve/reject + email notifications.
- Region/feature taxonomy CRUD.
- Audit log read-only.

## Phase 5 — Polish & launch (week 9–10)

- Lighthouse + a11y pass.
- Albanian copy review (legal, microcopy).
- Sitemap, robots, OG images.
- Production deploy, DNS, TLS, monitoring dashboards.
- Beta with 20 invited agents → public launch.

## MVP cut-line

In:
- Listing search/detail/contact, agent dashboard, admin moderation,
  4 locales, mobile-first responsive, basic SEO, image pipeline, map.

Out (queued for v1.1+):
- Property comparison view
- User reviews
- Saved-search email alerts
- Mortgage calculator
- In-app chat
- Paid listing tiers / payments
- Native apps
- Bulk import for agencies (CSV / RSS)
- AI-generated listing descriptions
- Currency conversion on detail page

## Stretch tracks (parallelizable)

1. **Quality** — visual regression suite, Sentry session replay (consent-aware).
2. **Growth** — referral codes, agent badges, curated city pages.
3. **Trust** — agent verification (ID + license), badges, fraud heuristics.
4. **Content** — guides for foreign buyers (taxes, residency).
