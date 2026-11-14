# 10 — Search & Map

## 1. Search engine

- **Meilisearch** is the primary listing index. Postgres remains the source of
  truth and is used for sanity bounds, sorting tie-breaks, and fallback.

### Index: `listings`

- **Primary key:** `id`
- **Searchable attributes (in order):**
  1. `title`
  2. `description`
  3. `regionPath` (e.g. `Tiranë › Njësia 5 › Komuna Parisit`)
  4. `addressLine`
- **Filterable:** `listingType`, `propertyType`, `priceEUR`, `bedrooms`,
  `bathrooms`, `areaM2`, `regionId`, `country`, `status`, `_geo`.
- **Sortable:** `priceEUR`, `createdAtTs`, `_geo`.
- **Synonyms:** `apartament` ↔ `banesë`, `dhomë` ↔ `dhoma`, `qira` ↔ `me qira`,
  `në shitje` ↔ `shitet`, `garazh` ↔ `parking`, etc.
- **Stop words:** Albanian articles/particles such as `në, me, e, i, të, dhe`.
- **Typo tolerance:** default (1 typo for ≥ 5 chars, 2 for ≥ 9 chars).
- **Ranking rules:** default + `priceEUR:asc` as a tie-breaker for "Cheapest".

### Document shape (denormalized)

```ts
type ListingDoc = {
  id: string;
  slug: string;
  title: string;
  description: string;
  listingType: 'SALE' | 'RENT';
  propertyType: string;
  status: 'PUBLISHED'; // only PUBLISHED is indexed
  regionId: string;
  regionPath: string;
  country: 'AL' | 'XK' | 'MK';
  addressLine: string | null;
  priceMinor: number;        // original
  currency: string;
  priceEUR: number;          // normalized for cross-region sort
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  features: string[];        // canonical feature keys
  _geo: { lat: number; lng: number };
  coverImage: { url: string; blurhash: string | null } | null;
  publishedAtTs: number;     // unix
  createdAtTs: number;
};
```

### Indexing pipeline

- Triggered by domain events from `apps/api`:
  - `listing.published` → upsert
  - `listing.updated` (PUBLISHED) → upsert
  - `listing.unpublished | rejected | sold | rented | archived | deleted`
    → delete
- Worker `search-index` consumes from BullMQ; idempotent by `id`.
- Nightly reconcile job: full reindex from Postgres for safety.

### Currency normalization

- Maintain a `fx_rates` table (daily): `currency → rateToEUR`.
- On indexing, compute `priceEUR = round(priceMinor * rate / 100)`.
- Re-index nightly to keep EUR sort fresh.

## 2. Geo queries

- `_geoBoundingBox` for the visible map area.
- `_geoRadius` for "near me" (post-MVP).
- Postgres PostGIS used for:
  - "Listings within polygon drawn on map" (advanced filter; pass GeoJSON
    polygon to API; API converts to ST_Within).
  - Region centroid lookups.

## 3. Map (MapLibre GL JS)

- **Tile provider:** MapTiler (free tier with attribution) or self-hosted
  OpenMapTiles. Plan B: OSM raster tiles. URL is configurable via
  `PUBLIC_MAP_STYLE_URL`.
- **Style:** light, low-saturation, custom-tweaked to match brand neutrals.
- **Layers:**
  - Vector base map.
  - GeoJSON source for the current result set's points.
  - `cluster` layer using Supercluster or MapLibre's built-in clustering.
  - Highlighted marker for the hovered list card.
- **Interactions:**
  - Pan/zoom updates URL `bbox` (debounced 300 ms) and re-fires the loader
    via `useSubmit()`.
  - Click marker → scroll list to card + open mini popover with image, price.
  - Polygon draw via `mapbox-gl-draw` (compat fork) for shape filtering.
- **Performance:**
  - Lazy import MapLibre (`React.lazy` + `Suspense`).
  - Reuse a single map instance across navigation.
  - Marker cap: 1,000 points; beyond that show clusters only and bbox query.

## 4. Search UI behavior

- Filter changes update the URL and trigger the loader. No client refetch.
- Map and list share the same loader data → always in sync.
- Empty result: explain why and offer "remove area filter" CTA.
- Loading: skeleton cards + map tile fade.

## 5. Albanian-specific tuning

- Diacritics insensitive (`ë` ↔ `e`, `ç` ↔ `c`) — Meilisearch handles by
  default; verify with tests.
- Address tokens like `Rr.` (Rruga), `L.` (Lagjja), `Bul.` (Bulevardi) added
  as synonyms to long forms.
- City pairs (`Skopje` ↔ `Shkup`, `Pristina` ↔ `Prishtinë`) added as synonyms.

## 6. Telemetry

- Log every search: anonymized query, filter hash, hit count, latency.
- Surface "no-result queries" in the admin metrics so we can add synonyms.
