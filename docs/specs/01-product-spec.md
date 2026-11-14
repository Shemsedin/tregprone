# 01 — Product Specification

## 1. Vision

Build the leading Albanian-language property marketplace for Albania, Kosovo,
North Macedonia, and the Albanian-speaking diaspora. Offer a fast, mobile-first
experience for finding homes to **buy** or **rent**, with trustworthy listings
and clear contact paths to agents and owners.

## 2. Target users

| Persona             | Goals                                                  | Frustrations today                       |
| ------------------- | ------------------------------------------------------ | ---------------------------------------- |
| Local buyer/renter  | Find a home in their city by budget, size, area        | Listings scattered on Facebook groups    |
| Diaspora buyer      | Buy/invest remotely; needs good photos, map, contacts  | Hard to verify listings from abroad      |
| Independent agent   | Promote listings; capture leads                        | No standard portal; manual cross-posting |
| Agency              | Bulk-manage listings, branding, lead pipeline          | Spreadsheets + WhatsApp                  |
| Private landlord    | Rent quickly with minimal fuss                         | Spam from non-serious enquirers          |
| Admin/Operator (us) | Moderate content, fight fraud, monetize                | —                                        |

## 3. MVP user stories

### Public

- As a visitor, I can switch language between `sq-AL`, `sq-XK`, `sq-MK`, `en`.
- As a visitor, I can search properties by location (free text + map polygon),
  price range, type, bedrooms, and listing type (sale/rent).
- As a visitor, I can view a results list and a synchronized map.
- As a visitor, I can open a property detail page with photos, description,
  features, location map, and contact form.
- As a visitor, I can contact the lister via an in-app form (rate-limited)
  without seeing the raw email/phone until after submission (configurable).
- As a visitor, I can browse without an account.

### Account holders

- As a registered user, I can save listings to favorites.
- As a registered user, I can save searches and (post-MVP) get email alerts.

### Agents/landlords

- As an agent, I can sign up, verify email, and create a profile.
- As an agent, I can create, edit, unpublish, and delete listings.
- As an agent, I can upload up to 30 images per listing (auto-resized).
- As an agent, I can mark a listing as sold/rented.

### Admin

- As an admin, I can review and approve/reject listings.
- As an admin, I can suspend users and remove listings.
- As an admin, I can manage taxonomies (regions, property types, features).
- As an admin, I can view basic platform metrics.

## 4. Out-of-scope for MVP (parking lot)

- Property comparison side-by-side view
- User reviews/ratings
- Saved-search email alerts
- In-app chat
- Payments / paid listing tiers
- Mortgage calculator
- Mobile native apps

These are **planned** but not part of the first release. See
[`14-roadmap-mvp.md`](./14-roadmap-mvp.md).

## 5. Functional requirements (MVP)

1. Listing CRUD with moderation queue.
2. Search with filters: type (sale/rent), property type (apartment, house,
   land, commercial), price range, area (m²), bedrooms, bathrooms, region/city,
   and free-text within a bounding box / polygon.
3. Map view with clustered markers; clicking a marker scrolls/highlights the
   list item.
4. Property detail with photo gallery (lightbox), key facts, description,
   amenities, embedded map, contact form.
5. Authentication: email+password, Google OAuth, password reset.
6. RBAC: `guest`, `user`, `agent`, `admin`.
7. Image uploads: drag-and-drop, EXIF-stripped, resized variants, served via
   CDN.
8. Internationalization: 4 locales, locale-prefixed URLs, `hreflang` tags.
9. Admin panel: moderation, taxonomy, users.
10. SEO: SSR pages, JSON-LD `RealEstateListing`, sitemap, robots.txt.

## 6. Non-functional requirements

- **Performance:** TTI < 3.5 s on 4G mid-tier mobile for listing detail.
- **Availability:** 99.5% MVP, 99.9% post-launch.
- **Privacy:** GDPR-aligned (Albania law 9887/2008, Kosovo law 06/L-082, NM
  law on personal data protection). Data export & delete on request.
- **Accessibility:** WCAG 2.1 AA.
- **Localization:** All UI text translatable; numbers/dates per locale.
- **Mobile-first:** Designed at 360 px width up.

## 7. Success metrics (first 90 days)

- 5,000 active listings
- 25,000 monthly unique visitors
- 1,500 registered users; 200 active agents
- Median listing → first contact < 48 h
- < 1% moderated content violation rate

## 8. Risks & mitigations

| Risk                          | Mitigation                                                |
| ----------------------------- | --------------------------------------------------------- |
| Fake/spam listings            | Email verification, manual moderation queue, rate limits  |
| Image bandwidth cost          | CDN + WebP/AVIF + responsive sizes                        |
| Map provider cost spikes      | MapLibre + open tiles (MapTiler/OSM); cap requests        |
| Albanian dialectal variations | Single base catalog `sq` + region overrides for terms     |
| GDPR exposure                 | Minimize PII, log redaction, export/delete endpoints      |
