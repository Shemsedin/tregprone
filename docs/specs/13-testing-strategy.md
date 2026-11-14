# 13 — Testing Strategy

## 1. Pyramid

```
          ┌──────────────┐
          │  e2e (few)   │   Playwright across web + api
          ├──────────────┤
          │  integration │   API + DB + Meili in containers
          ├──────────────┤
          │ unit (many)  │   Vitest, pure functions, components
          └──────────────┘
```

## 2. Coverage gates (per package)

| Package        | Statements | Branches |
| -------------- | ---------- | -------- |
| `apps/api`     | 85%        | 75%      |
| `apps/web`     | 75%        | 65%      |
| `apps/worker`  | 80%        | 70%      |
| `packages/*`   | 90%        | 80%      |

CI fails below thresholds. Coverage uploaded to Codecov.

## 3. Unit tests (Vitest)

- Pure utilities, formatters, validators, reducers.
- Test Zod schemas with both happy and 5+ pathological inputs.
- For React components, prefer Testing Library + user-event; one test per
  component answering "does it render the role/label users expect?"

## 4. Integration tests (API)

- Spin up Postgres, Redis, Meili via `testcontainers-node`.
- Migrate + seed once per worker; truncate between tests with `npm run db:reset`
  helper.
- Use Supertest to hit Fastify in-process.
- Cover every endpoint: 1 happy path + auth-failure + validation-failure.

## 5. e2e (Playwright)

- Run against the built `apps/web` against a started `apps/api` + `worker`.
- Browser matrix: Chromium desktop, Chromium mobile (Pixel 7), WebKit desktop.
- Mandatory flows for MVP:
  - Visitor searches "Tirana 2+1 me qira" and opens a result.
  - Visitor sends a contact request (rate limit observed on retry).
  - Agent registers, verifies email (mailhog), creates a draft listing,
    uploads 3 images, submits, sees `PENDING_REVIEW`.
  - Admin approves the listing; visitor finds it in search.
  - Locale switch from `sq` to `en` preserves the current page.
- a11y: `@axe-core/playwright` on `/`, `/listings`, `/listings/:slug`,
  `/auth/login`, `/account/listings/new`. Zero serious violations allowed.
- Visual regression (optional, post-MVP) via Playwright screenshots on a
  fixed seed.

## 6. Contract tests

- `packages/types` Zod schemas are imported by both web and api; a single CI
  step (`npm run test --workspace=@treg/types`) round-trips JSON fixtures to detect drift.
- API uses `zod-to-openapi` to publish `/openapi.json`. A schemathesis-style
  fuzz job runs against staging weekly.

## 7. Performance tests

- k6 smoke scripts in `packages/perf/`:
  - `search-smoke.js` — 5 vus × 2 min on `/v1/listings?...`.
  - `detail-smoke.js` — 10 vus × 2 min.
  - `contact-spike.js` — verifies rate limiter.
- Run on `stg` after each deploy; alert if p95 regresses > 20%.

## 8. Security tests

- `npm audit --omit=dev` in CI.
- `eslint-plugin-security`, `eslint-plugin-no-unsanitized`.
- Dependabot/Renovate for vuln alerts.
- Quarterly threat-model review against `docs/11-security-and-compliance.md`.
- Pen test before public launch.

## 9. Test data

- Faker-based factories in `apps/api/src/test/factories/*`.
- Realistic Albanian text snippets (titles, regions, addresses) committed
  as fixtures, not generated, to keep tests deterministic.

## 10. Manual QA checklist (per release)

- New listing: create, edit, submit, approve, edit again, archive.
- Search: city autocomplete, filters, map polygon.
- Map: clusters resolve correctly at multiple zoom levels.
- Mobile: 360 px width pass (no horizontal scroll).
- Email: registration, password reset, contact-received notification.
- Locale: switch on every top-level page.
- Admin: moderation queue empty state.

## 11. Reporting

- HTML report uploaded as a GitHub Actions artifact for every CI run.
- Flaky test policy: 2 retries; if flaky thrice in a week, it must be
  rewritten or quarantined with an issue.
