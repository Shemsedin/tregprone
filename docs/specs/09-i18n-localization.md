# 09 — Internationalization & Localization

## 1. Locales

| Code    | Audience                    | Default? |
| ------- | --------------------------- | -------- |
| `sq-AL` | Albania (default)           | ✅       |
| `sq-XK` | Kosovo                      |          |
| `sq-MK` | Albanian speakers in NM     |          |
| `en`    | Diaspora & SEO              |          |

## 2. URL strategy

- Locale prefix in path: `/sq`, `/sq-XK`, `/sq-MK`, `/en`.
- `/` performs server-side negotiation:
  1. `ts_locale` cookie if set
  2. `Accept-Language` header
  3. Geo-IP hint (post-MVP)
  4. Fallback `/sq`
- All public pages emit `<link rel="alternate" hreflang>` for the 4 locales
  plus `x-default` → `/sq`.

## 3. Catalogs

- Format: ICU MessageFormat in JSON, one file per namespace per locale.

```
packages/i18n/
├── src/
│   ├── index.ts
│   ├── negotiate.ts
│   └── format.ts
├── catalogs/
│   ├── sq-AL/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── listing.json
│   │   ├── search.json
│   │   ├── account.json
│   │   ├── admin.json
│   │   └── errors.json
│   ├── sq-XK/...
│   ├── sq-MK/...
│   └── en/...
```

- Keys are dot-namespaced: `listing.detail.contactCta`.
- Long strings use `description` keys for translators in a parallel `*.notes.json`.

## 4. Authoring rules

- The base catalog is `sq-AL`. `sq-XK` and `sq-MK` only override keys that
  differ regionally (e.g. currency presentation, place names).
- `en` is a hand-written translation, not machine-generated, for marketing
  pages. UI strings may start machine-translated then be reviewed.
- Never hard-code text in components. ESLint rule
  `i18n/no-literal-string` enforces this in `apps/web/app/routes/**`.

## 5. Numbers, dates, currency

- Use `Intl.NumberFormat(locale, { style: 'currency', currency })`.
- Currency per region default:
  - `sq-AL` → `ALL` (`Lekë`)
  - `sq-XK` → `EUR`
  - `sq-MK` → `MKD`
  - `en`    → `EUR`
- Allow user to switch currency on listing detail; convert via cached daily
  rate from a free FX API (post-MVP). For MVP, show only the listing's stored
  currency.
- Dates: `Intl.DateTimeFormat(locale, { dateStyle: 'medium' })`.

## 6. Pluralization & gender

- Albanian has standard plural (singular vs other). Use ICU plural:
  `{count, plural, one {# dhomë} other {# dhoma}}`.
- Avoid gendered constructions in CTAs; prefer neutral imperatives.

## 7. SEO content

- Each locale has its own `meta` data and OG image where helpful.
- Sitemap includes localized URLs grouped per `<url>` with `xhtml:link`
  `hreflang` alternates.

## 8. Right-to-left & scripts

- Not needed today; design system reserves `dir="ltr"`. If Arabic is added
  for diaspora later, switch via `dir` on `<html>` and verify Tailwind
  logical properties (`ms-`, `me-`).

## 9. Translation workflow

- Source of truth: catalog files in the repo.
- Tooling: `npm run i18n:extract` to find missing keys; `npm run i18n:lint` to
  verify all locales have the same keys.
- Optional: connect to a TMS (Crowdin/Lokalise) via GitHub action.

## 10. Helper API

```ts
// apps/web/app/lib/i18n.ts
export function t(key: string, vars?: Record<string, unknown>): string;
export function useT(): (key: string, vars?: Record<string, unknown>) => string;
export function formatMoney(amountMinor: bigint, currency: string, locale: string): string;
export function formatNumber(n: number, locale: string): string;
export function formatDate(d: Date | string, locale: string): string;
```

`t` is bound to the active locale via React context populated by the
`($lang)` route loader.
