# 03 — Tech Stack

## 1. Languages & runtime

- TypeScript 5.x with `strict: true`, `noUncheckedIndexedAccess: true`.
- Node.js 20 LTS (target both `apps/web` and `apps/api`).
- npm 10+ as the package manager.

## 2. Frontend

| Concern         | Choice                                              |
| --------------- | --------------------------------------------------- |
| Framework       | **React Router v7** (framework mode, SSR)           |
| Bundler         | Vite 5                                              |
| UI primitives   | shadcn/ui (Radix under the hood) + Tailwind CSS 3.x |
| Icons           | `lucide-react`                                      |
| Forms           | `react-hook-form` + `zod` resolver                  |
| Client data     | TanStack Query 5 (only for non-route data)          |
| Maps            | MapLibre GL JS + `supercluster`                     |
| Image gallery   | `yet-another-react-lightbox`                        |
| Date/number i18n| Native `Intl`                                       |
| Animations      | `framer-motion` (sparingly)                         |
| Analytics       | Plausible (self-hostable, GDPR-friendly)            |

## 3. Backend

| Concern        | Choice                                              |
| -------------- | --------------------------------------------------- |
| HTTP framework | **Fastify 4**                                       |
| ORM            | Prisma 5                                            |
| Database       | PostgreSQL 16 with PostGIS                          |
| Search         | Meilisearch 1.x                                     |
| Queues         | BullMQ on Redis 7                                   |
| Validation     | Zod (shared with frontend via `packages/types`)     |
| Auth           | `@fastify/jwt`, `@fastify/cookie`, `arctic` (OAuth) |
| Password hash  | `argon2` (argon2id)                                 |
| Logging        | Pino + `pino-http`                                  |
| Mail           | Resend (default) — provider abstracted              |
| Storage SDK    | `@aws-sdk/client-s3` (S3-compatible; works with R2, MinIO, B2, etc.) |
| Tracing        | `@opentelemetry/sdk-node`                           |

## 4. Shared packages

- `packages/types` — Zod schemas + inferred TS types (DTO contracts).
- `packages/db` — Prisma schema, migrations, seed scripts.
- `packages/ui` — Tailwind preset, design tokens, shadcn/ui primitives.
- `packages/i18n` — message catalogs, ICU helpers, locale negotiation.
- `packages/config` — eslint, tsconfig base, prettier, tailwind preset.

## 5. Tooling

- ESLint flat config (`@typescript-eslint`, `eslint-plugin-react`,
  `eslint-plugin-jsx-a11y`, `eslint-plugin-import`).
- Prettier with `prettier-plugin-tailwindcss`.
- Husky + lint-staged: format & typecheck staged files.
- Commitlint with Conventional Commits.
- Changesets for versioning shared packages.

## 6. Testing

| Layer       | Tool                                  |
| ----------- | ------------------------------------- |
| Unit        | Vitest                                |
| Component   | Vitest + Testing Library              |
| API         | Vitest + Supertest                    |
| e2e         | Playwright (Chromium, WebKit, mobile) |
| Contract    | Zod schemas shared between web/api    |
| a11y        | `@axe-core/playwright`                |
| Load        | k6 (smoke + soak)                     |

## 7. Infrastructure & DevOps

- **Cloud:** Provider-agnostic (Docker / VPS / Railway / Render / Fly.io).
- **Compute:** Three Docker containers — `web`, `api`, `worker`.
- **DB:** PostgreSQL 16 with PostGIS (managed or self-hosted).
- **Cache/queue:** Redis 7.
- **Storage:** Any S3-compatible object store (Cloudflare R2, Backblaze B2,
  MinIO, or AWS S3). `@aws-sdk/client-s3` is used throughout.
- **CDN/WAF:** Cloudflare or any reverse proxy.
- **Secrets:** Environment variables (`.env` locally; provider-specific secrets
  store in production).
- **IaC:** Docker Compose for local; `docker-compose.prod.yml` or platform
  dashboards / Terraform for production.
- **CI/CD:** GitHub Actions with reusable workflows.
- **Monitoring:** OpenTelemetry + OTLP export; Pino structured logs.

### Alternative cheap path

- Vercel for `apps/web`, Fly.io / Render for `apps/api`, Neon for Postgres,
  Upstash for Redis, Cloudflare R2 for images, Cloudflare in front. The code
  must remain provider-agnostic (use `@aws-sdk/client-s3` and standard env vars).

## 8. Versioning policy

- API: `/v1` URL versioning. Breaking changes require `/v2` and a 90-day
  deprecation window.
- DB: forward-only Prisma migrations. Use `prisma migrate deploy` in CI.
- Shared packages: SemVer via Changesets.

## 9. Dependency hygiene

- `npm dedupe` on every PR.
- Renovate bot for weekly minor updates; majors via separate PRs.
- No transitive packages with known CVEs at release time
  (`npm audit --omit=dev`).
