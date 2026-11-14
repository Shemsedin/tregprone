# 12 — DevOps & Deployment

## 1. Environments

| Env     | Branch trigger        | Hosting             | Notes                                  |
| ------- | --------------------- | ------------------- | -------------------------------------- |
| `dev`   | local                 | docker-compose      | `make up`                              |
| `pr`    | PR open/sync          | Provider preview envs per PR | Ephemeral, 24-h TTL           |
| `stg`   | merge to `main`       | Staging host        | Auto-deploy after CI green             |
| `prod`  | release tag `v*.*.*`  | Production host     | Manual approval gate                   |

## 2. Local dev

`docker-compose.yml` services:
- `postgres` (PostGIS image) on `5432`
- `redis` on `6379`
- `meilisearch` on `7700`
- `mailhog` on `8025`
- `minio` (S3-compatible object store) on `9000` (API) / `9001` (console)

Commands:
```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev          # runs apps/web, apps/api, apps/worker
```

## 3. Repository layout for infra

```
infra/
└── github/
    └── workflows/
        ├── ci.yml
        ├── cd-stg.yml
        ├── cd-prod.yml
        └── pr-preview.yml
```

## 4. Production services (per environment)

- **Compute:** Three Docker containers — `web`, `api`, `worker` — deployed to
  the provider of your choice (Railway, Render, Fly.io, VPS, etc.).
- **Postgres:** Managed PostgreSQL 16 with PostGIS or self-hosted.
- **Redis:** Managed Redis 7 or self-hosted.
- **Object storage:** Any S3-compatible store (Cloudflare R2, Backblaze B2,
  MinIO, AWS S3). Configure via `S3_*` env vars.
- **Secrets:** Platform secrets store (e.g. Railway variables, Fly.io secrets,
  or a `.env` file on the host). Never committed.

## 5. CI pipeline (GitHub Actions)

`ci.yml` — runs on every PR and push to `main`:

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test -- --coverage`
5. `npm run build` (web + api + worker)
6. `npm run migrate:test --workspace=@treg/db` against ephemeral Postgres service
7. `npm run e2e:ci --workspace=@treg/web` (Playwright with built bundle)
8. Upload coverage; fail PR if below thresholds (80% statements).
9. Build & push Docker images to a container registry with tag `sha-<short>`.
10. (PR only) Trigger `pr-preview.yml`.

## 6. PR preview (`pr-preview.yml`)

-- Deploys the PR images to a preview environment with a unique URL pattern
  `pr-<num>.preview.tregprone.dev`.
- Comments the URL on the PR.
- Auto-cleanup on PR close.

## 7. Staging deploy (`cd-stg.yml`)

- Triggered on push to `main`.
- Re-tag images `:stg-<short>` and deploy `web`/`api`/`worker` to the staging
  environment.
- Run smoke tests (a curated Playwright tag `@smoke`).
- Notify Slack/Teams.

## 8. Production deploy (`cd-prod.yml`)

- Triggered by GitHub Release tag `v*.*.*`.
- Required reviewers (2) for the `prod` environment.
- Steps:
  1. Pull staged image, re-tag `:prod-<sha>`.
  2. Run DB migrations (`npm run migrate:deploy --workspace=@treg/db`), gated; rollback if exit ≠ 0.
  3. Deploy with **canary / gradual rollout** (provider-dependent).
  4. Run synthetic checks for 10 minutes (response codes + latency SLO).
  5. Promote to 100% on success, otherwise revert.
  6. Worker rolls separately after web/api are healthy.

## 9. Database migrations

- Forward-only with Prisma migrations in `packages/db/prisma/migrations`.
- Manual SQL files for PostGIS columns/indexes live alongside as
  `*.sql` referenced by `migration.sql`.
- Backwards-compatible deploys: deploy migration before code that requires it
  ("expand-then-contract" pattern).

## 10. Observability

- **Logs:** Pino → stdout → aggregated by platform log stream or log shipper.
- **Metrics:** Custom counters for `listing.created`, `contact.submitted`,
  `search.executed` exported via OpenTelemetry.
- **Traces:** OpenTelemetry → any OTLP backend. Sample at 20% in prod.
- **Dashboards:** Grafana (or platform equivalent) with golden signals
  (RPS, error rate, latency p50/p95/p99, queue depth, DB connections).

## 11. SLOs

| Service | SLI                              | Target  |
| ------- | -------------------------------- | ------- |
| `web`   | TTFB at 95th, public pages       | < 600ms |
| `api`   | success rate (non-5xx)           | 99.9%   |
| `api`   | read p95 latency                 | < 250ms |
| `api`   | write p95 latency                | < 600ms |
| `worker`| job p95 end-to-end (image)       | < 30s   |

## 12. Cost guardrails

- Configure minimum replicas/instances to 0 in `stg`, 1 in `prod`.
- Object storage bandwidth alerts at 50% of monthly budget.
- Image variant cap: 5 sizes max per asset.

## 13. Rollback

- `web`, `api`, `worker`: revert to previous image tag / revision
  (kept N=5 in deploy history).
- DB: rollback only via forward migration (`migrate resolve` + new fix).

## 14. Domain & email

-- Domain: `tregprone.com` (and `.al` if available).
- DNS: Cloudflare (recommended) or any DNS provider; CNAME to CDN/proxy.
- TLS: managed by Cloudflare or the hosting provider.
- Email: SPF, DKIM, DMARC records published; transactional via Resend
  (postmaster@tregprone.com).
