# Sitemap

URL inventory for the public site, account area, and admin panel. Locale
prefix `:lang ∈ { sq, sq-XK, sq-MK, en }`.

## Public

- `/` → 302 to negotiated locale
- `/:lang`                                Home
- `/:lang/listings`                       Search results
- `/:lang/listings/:slug`                 Listing detail
- `/:lang/listings/sale`                  Pre-filtered SALE search
- `/:lang/listings/rent`                  Pre-filtered RENT search
- `/:lang/regions/:regionSlug`            City/region landing (post-MVP, SEO)
- `/:lang/agents/:agentSlug`              Agent profile (post-MVP)
- `/:lang/legal/privacy`                  Privacy policy
- `/:lang/legal/terms`                    Terms of service
- `/:lang/legal/cookies`                  Cookie policy
- `/:lang/about`                          About
- `/:lang/contact`                        Contact us
- `/sitemap.xml`                          Multi-locale sitemap
- `/robots.txt`
- `/.well-known/jwks.json`                JWT public keys

## Auth

- `/:lang/auth/login`
- `/:lang/auth/register`
- `/:lang/auth/forgot`
- `/:lang/auth/reset?token=…`
- `/:lang/auth/verify?token=…`            Email verification

## Account (logged-in)

- `/:lang/account`                        Profile + tabs
- `/:lang/account/listings`               Agent dashboard
- `/:lang/account/listings/new`           Create wizard
- `/:lang/account/listings/:id/edit`
- `/:lang/account/listings/:id/preview`
- `/:lang/favorites`                      Saved listings
- `/:lang/account/security`               Password, sessions
- `/:lang/account/notifications`          Email prefs (post-MVP)

## Admin (no locale prefix)

- `/admin`                                Dashboard
- `/admin/listings`                       Moderation queue
- `/admin/listings/:id`                   Detail + actions
- `/admin/users`
- `/admin/users/:id`
- `/admin/regions`
- `/admin/features`
- `/admin/audit`
- `/admin/settings`                       (post-MVP)

## API (under `https://api.tregprone.com`)

See [`../docs/05-api-spec.md`](../docs/05-api-spec.md). Highlights:
- `/v1/health/{live,ready}`
- `/v1/auth/*`
- `/v1/users/*`
- `/v1/listings`, `/v1/listings/:id`, `/v1/listings/slug/:slug`
- `/v1/listings/:id/contact`
- `/v1/me/favorites/*`
- `/v1/regions`, `/v1/features`
- `/v1/admin/*`
- `/openapi.json` (production), `/docs` (dev)
