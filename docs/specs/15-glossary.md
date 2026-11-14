# 15 — Glossary

| Term                 | Meaning                                                  |
| -------------------- | -------------------------------------------------------- |
| **tregprone**        | Working brand name ("Albanian Market"). Not final.       |
| **Listing**          | A property record: sale or rent, with photos, price.     |
| **Agent**            | A user with role `AGENT`; can publish listings.          |
| **Region**           | Hierarchical place: country → city → neighborhood.       |
| **Feature**          | Tagged amenity (e.g. balcony, parking) by canonical key. |
| **Moderation queue** | Listings in `PENDING_REVIEW` awaiting admin action.      |
| **Cover image**      | First image (position = 0) of a listing.                 |
| **Slug**             | URL-safe identifier, generated from title + id suffix.   |
| **PostGIS**          | Geographic extension for PostgreSQL.                     |
| **Meilisearch**      | Search engine used for listings.                         |
| **PWA**              | Progressive Web App. Considered post-MVP.                |
| **CDN**              | Cloudflare (or equivalent) distributing images & static. |
| **JWT**              | JSON Web Token used for short-lived access tokens.       |
| **CSP**              | Content-Security-Policy HTTP header.                     |
| **GDPR**             | EU privacy framework; Albanian/Kosovo/NM laws align.     |
| **SLO/SLI**          | Service-level objective / indicator.                     |
| **MVP**              | Minimum viable product; see `14-roadmap-mvp.md`.         |
| **RBAC**             | Role-based access control.                               |
| **DTO**              | Data-transfer object; in this repo, Zod schemas.         |
| **SAS URL**          | Short-lived signed URL for blob upload.                  |
| **bbox**             | Bounding box `west,south,east,north`.                    |
| **Cluster**          | Aggregated map marker representing many points.          |
| **Synonym (search)** | Alternate term mapped to a canonical query token.        |
