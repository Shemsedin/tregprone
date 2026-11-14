# 06 — Frontend Specification (React Router v7)

## 1. App layout

`apps/web` is a React Router v7 **framework mode** application with SSR and
file-based routes.

```
apps/web/
├── app/
│   ├── root.tsx                 # HTML shell, locale, theme
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── routes/
│   │   ├── _index.tsx                          # /  -> redirect to /sq
│   │   ├── ($lang).tsx                         # locale wrapper layout
│   │   ├── ($lang)._index.tsx                  # /:lang  -> home
│   │   ├── ($lang).listings._index.tsx         # /:lang/listings  search
│   │   ├── ($lang).listings.$slug.tsx          # /:lang/listings/:slug
│   │   ├── ($lang).favorites.tsx
│   │   ├── ($lang).account.tsx
│   │   ├── ($lang).account.listings.tsx        # agent dashboard
│   │   ├── ($lang).account.listings.new.tsx
│   │   ├── ($lang).account.listings.$id.edit.tsx
│   │   ├── ($lang).auth.login.tsx
│   │   ├── ($lang).auth.register.tsx
│   │   ├── ($lang).auth.forgot.tsx
│   │   ├── ($lang).auth.reset.tsx
│   │   ├── ($lang).legal.privacy.tsx
│   │   ├── ($lang).legal.terms.tsx
│   │   ├── admin.tsx                           # admin shell (no locale prefix)
│   │   ├── admin._index.tsx
│   │   ├── admin.listings.tsx
│   │   ├── admin.users.tsx
│   │   ├── admin.regions.tsx
│   │   └── admin.audit.tsx
│   ├── components/              # generic, app-level
│   ├── lib/                     # api client, auth, i18n, seo helpers
│   └── styles/
│       └── tailwind.css
├── public/
│   ├── favicon.svg
│   ├── og-default.png
│   └── robots.txt
├── vite.config.ts
└── tailwind.config.ts
```

## 2. Routing rules

- The `($lang)` segment captures `sq`, `sq-XK`, `sq-MK`, `en`. A `loader` in
  `($lang).tsx` validates and sets the active locale.
- `/` redirects via `Accept-Language` and a cookie (`ts_locale`) to the best
  match, defaulting to `/sq`.
- 404 page localized.
- All loaders/actions throw `Response` with `data()` from `react-router` — no
  client-only state needed for SSR data.

## 3. Pages (MVP)

### Home `/:lang`

- Hero with a single search bar (location + buy/rent toggle).
- "Featured cities" cards (Tirana, Prishtinë, Shkup, Durrës, Vlorë).
- "Latest listings" 8 cards.
- "How it works" 3-step strip.
- Footer with locale switcher + legal links.

### Search `/:lang/listings`

- **Layout:** left = filter rail (collapsible on mobile), center = result list,
  right = map (sticky on desktop). On mobile, tabs: List / Map / Filters.
- **URL state:** every filter is a query param so URLs are shareable.
- **Loader:** call `GET /v1/listings` with the parsed filters; return both
  `items` and `geo`.
- Filter components:
  - Listing type toggle (Sale / Rent)
  - Property type select (multi)
  - Price range (currency-aware)
  - Bedrooms / bathrooms (chip selectors)
  - Area range
  - Region/city autocomplete (calls `GET /v1/regions`)
  - "Draw on map" → polygon → `bbox` derived
- **Result card:** image (with blurhash placeholder), price, type, title,
  `bedrooms · bathrooms · area`, region, "saved" heart toggle.
- Sort dropdown: Newest / Price ↑ / Price ↓.
- Pagination via `nextCursor`.

### Listing detail `/:lang/listings/:slug`

- Image gallery with lightbox; first image is `priority` for LCP.
- Sticky right sidebar on desktop with price, contact form, and "save" button.
- Sections: Overview, Features chips, Description, Map (deferred), Owner card.
- JSON-LD `RealEstateListing` injected from the loader.

### Auth pages

- Login, register, forgot, reset. Use React Router `Form` + server actions.
- Show inline Zod errors from the server action.
- After login, redirect to `?next=` if safe; default to `/:lang`.

### Account / agent dashboard

- Tabs: My listings, Favorites, Profile.
- "New listing" wizard: 4 steps (Basics → Location → Photos → Review).
- Image upload uses signed URLs from `POST /listings/:id/images/sign`; show
  client-side progress; reorder via drag.

### Admin (English-only is OK for MVP)

- See `07-admin-panel.md`.

## 4. State & data

- **Route data:** loaders/actions only.
- **Cross-route client state:** TanStack Query (favorites toggling, optimistic).
- **Form state:** `react-hook-form` with the Zod resolver from `packages/types`.
- **Auth state:** server-rendered (cookie); client uses a `useUser()` hook
  reading from `useRouteLoaderData('root')`.

## 5. Components & UI

- Use shadcn/ui generators; output goes under `packages/ui/src/components/ui`.
- Primitives needed for MVP:
  Button, Input, Textarea, Select, Combobox, Checkbox, RadioGroup, Slider,
  RangeSlider, DropdownMenu, Dialog, Sheet, Tabs, Tooltip, Toast, Card,
  Badge, Avatar, Skeleton, Pagination, ScrollArea, Separator, Switch.
- App-level composites: `SearchBar`, `FilterRail`, `ListingCard`,
  `ListingGrid`, `ListingMap`, `Gallery`, `LocaleSwitcher`,
  `CurrencySwitcher`, `ContactForm`, `ImageUploader`, `Breadcrumbs`.

## 6. Styling

- Tailwind with a custom preset from `packages/config/tailwind.preset.ts`.
- Design tokens (see `assets/design-tokens.json`) drive the preset.
- Dark mode disabled at MVP launch (focus on light theme); theme classes wired
  for later.
- Typography: Inter (Latin) for UI; system fallback for Albanian Cyrillic
  edge cases (none expected, but planned).

## 7. SEO

- Each page exports a `meta` function with title, description, canonical, and
  `hreflang` alternates for the 4 locales.
- `sitemap.xml` route generated from a streaming loader hitting Postgres.
- `robots.txt` allows all in `prod`, disallows in `stg`.
- JSON-LD on detail pages; OpenGraph tags on all public pages.
- 301 from `/listings/:id` → `/listings/:slug` if slug differs.

## 8. Performance

- Code-split MapLibre and Lightbox. Map only renders when in viewport.
- Use `<Image>` wrapper that emits responsive `srcset` for AVIF/WebP/JPEG.
- Preload first hero image.
- Cache GET API responses in HTTP cache for SSR; revalidate on actions.

## 9. Accessibility

- Color contrast ≥ 4.5:1 for text.
- All inputs have associated labels and error text linked via `aria-describedby`.
- Focus styles preserved (no `outline: none` without replacement).
- Map has a "list" alternative; markers are reachable as a list with
  `aria-live` announcements.
- Skip-to-content link in `root.tsx`.

## 10. Error & empty states

- Route-level `ErrorBoundary` with a friendly Albanian message and a request id.
- Empty searches show suggestions to broaden filters.
- Image upload errors show inline with retry.

## 11. Analytics & consent

- Plausible self-hosted; cookieless.
- A consent banner appears only if we ever add cookie-based analytics.
