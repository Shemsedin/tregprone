# 11 — Security & Compliance

## 1. Threat model (high-level)

| Asset                | Threat                            | Control                             |
| -------------------- | --------------------------------- | ----------------------------------- |
| User passwords       | Credential stuffing, dump leakage | argon2id, breach-list check, MFA*   |
| Sessions             | Session hijack, CSRF              | HttpOnly cookies, CSRF token, SameSite |
| PII (email, phone)   | Scraping, harvesting              | Hide raw contact until form submit  |
| Listings             | Spam, fraud                       | Email verification, manual moderation |
| Storage uploads      | Malware, oversized files          | Re-encode, mime sniff, size cap     |
| API                  | Abuse, scraping                   | Rate limit, bot signals, CAPTCHA*   |
| Admin                | Privilege escalation              | RBAC + secondary checks server-side |
| Logs                 | PII leakage                       | Pino redact list                    |

\* MFA + CAPTCHA are post-MVP; design hooks are present.

## 2. Authentication

- Email + password with argon2id (`memoryCost ≥ 19456`, `timeCost ≥ 2`,
  `parallelism = 1`).
- Email verification required before publishing a listing.
- Password reset uses single-use tokens (15-min TTL) tied to the user id.
- OAuth via Google through `arctic`. Email verified by provider implies
  verified for us.
- Refresh tokens are 256-bit random, hashed (sha-256) before storage; rotated
  on each refresh; revoked on logout/password change.
- Access tokens: JWT, 15 min TTL, signed `EdDSA` (ed25519). Public key
  published at `/.well-known/jwks.json`.

## 3. Sessions & cookies

- `ts_session` HttpOnly cookie carries the access token (server-side calls
  read it). Path `/`, `Secure`, `SameSite=Lax`.
- `ts_refresh` HttpOnly cookie scoped to `/auth/refresh`.
- CSRF: double-submit token (`ts_csrf` non-HttpOnly cookie + `x-csrf-token`
  header) for cookie-based POST/PATCH/DELETE.

## 4. Authorization

- Role hierarchy: `ADMIN > AGENT > USER > guest`.
- Resource checks: every mutating endpoint verifies (a) authenticated user,
  (b) role, (c) ownership where applicable.
- Admin actions write `AuditLog`.

## 5. Input validation

- Every body, query, and param validated by Zod.
- Reject unknown keys (`.strict()`); strip on output.
- Enforce string length caps (titles ≤ 140, descriptions ≤ 8,000).
- Reject `<script>` and HTML in plain-text fields; descriptions allowed
  Markdown subset (sanitized server-side via `rehype-sanitize`).

## 6. File upload

- Client requests a presigned URL → uploads original to a private container.
- Worker downloads, validates magic bytes, re-encodes via `sharp` to JPEG +
  WebP + AVIF responsive variants, strips EXIF, writes to public CDN
  container.
- Rejects: > 10 MB, non-image, > 8000×8000 px.
- Limits: 30 images per listing, 200 active uploads per user.

## 7. HTTP hardening

- Headers (set by Fastify + reverse proxy):
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Content-Security-Policy` (see below)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(self), camera=(), microphone=()`
  - `Cross-Origin-Opener-Policy: same-origin`

### CSP starter

```
default-src 'self';
img-src 'self' data: blob: https://cdn.tregprone.com https://*.maptiler.com;
style-src 'self' 'unsafe-inline';
script-src 'self' 'sha256-…' https://plausible.tregprone.com;
connect-src 'self' https://api.tregprone.com https://*.maptiler.com https://plausible.tregprone.com;
font-src 'self' data:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

## 8. Rate limiting

- Anonymous: 60 req/min/IP, 1,000 req/h/IP (sliding window in Redis).
- Auth endpoints: 10 req/min/IP, lockout for 15 min after 10 failures.
- Contact form: 5/min/IP, 20/day/IP.
- Image uploads: 30/min/user.
- Returns `429` with `Retry-After`.

## 9. Logging & monitoring

- Pino redact:
  `['req.headers.authorization','req.headers.cookie','password','token','*.email','*.phone']`.
- **Logs:** Pino JSON; correlation id propagated via `x-request-id` header.
- **Traces:** OpenTelemetry → any OTLP backend (e.g. Grafana, Sentry). Sample at 20% in prod.
- **Errors:** Structured error logs with sampling 100% for `error`, 5% for `info`.
- **Alerts:** 5xx rate > 1% for 5 min, login failure spikes, queue backlog > 1k.

## 10. Secrets management

- All secrets stored outside the repo: environment variables injected at
  runtime (e.g. via a secrets manager, platform dashboard, or `.env` on the
  host). Never committed to the repository.
- `.env.example` lists every variable name with an explanation but no values.

## 11. Backups & DR

- Postgres: automated PITR backups (7-day retention MVP, 30-day post-launch).
- Object storage: geo-redundant replication for production (provider-dependent).
- Quarterly restore drill into a temporary environment.
- RPO 1 h, RTO 4 h for MVP.

## 12. Compliance

- GDPR-aligned data handling (lawful basis = legitimate interest for
  listings, consent for marketing emails).
- Albania (law 9887/2008), Kosovo (law 06/L-082), North Macedonia
  (Personal Data Protection Law 2020) — all map closely to GDPR.
- Privacy policy, terms, cookie policy authored in `sq-AL` and `en`,
  reviewed by counsel before launch.
- Data subject rights endpoints:
  - `GET /v1/users/me/export` → JSON dump of user-owned data.
  - `DELETE /v1/users/me` → schedules anonymization within 30 days.

## 13. Incident response

- Documented runbook under `docs/runbooks/`.
- Severity matrix (Sev1-3) with response/recovery targets.
- Postmortems written within 5 business days; published internally.
