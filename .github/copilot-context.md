---
# 🧠 GitHub Copilot Context Header

**Purpose:** Repository-wide instructions and context for GitHub Copilot.  
**Suggested path & name:** `.github/copilot-instructions.md`  
**Intended effect:** Improve Copilot’s code suggestions by providing product scope, architecture, taxonomy, APIs, and acceptance criteria for a MerrJep‑like classifieds marketplace.  
**How to use:** Keep this file near the top of the repo’s `.github/` folder. Update when requirements change. Copilot reads Markdown context; no special config required.  
**Last updated:** 2025-11-08 09:44:54 UTC

---


@todo this is sample prompt file


# Classifieds Marketplace (MerrJep‑like) — Master Build Prompt

> **Use this prompt with an LLM (e.g., Copilot/ChatGPT/Claude)** to generate a complete, actionable plan to build a local classifieds marketplace **similar to MerrJep** (large categories, municipality browsing, posting flow, search/filters, and mobile presence) for an MVP in 8–12 weeks and a V1 in ~6 months. References to the MerrJep pattern are annotated below.[^1][^2][^3][^4]

---

## 🔧 Copy‑paste “Master Build” Prompt

**Role:** Act as a *principal product manager and solution architect* tasked with designing and planning an MVP → V1 rollout for a **local classifieds marketplace** similar to MerrJep (a Kosovo/Albania–focused platform with listings across Vehicles, Real Estate, Jobs, Electronics, Home & Family, Sports & Recreation, Machinery/Tools, and Services, plus municipality-based browsing and mobile apps).[^1][^2][^3]

**Objective:** Produce a complete, actionable build plan that a small engineering team can execute in **8–12 weeks for MVP**, with a path to **V1 in ~6 months**.

**Outputs (deliver in this order, clearly headed):**

1. **Product Brief (1 page)** — problem, users, JTBD, success metrics (DAU, listing conversion, contact rate, reply latency, fraud rate), north-star metric, key constraints.
2. **Competitive Snapshot (short)** — what we’re replicating from MerrJep (categories, municipality browsing, posting flow, search & filters) and what we’ll *improve/differentiate* (trust/safety, modern UX, moderation, payments, analytics). Cite assumptions to a “MerrJep-like classifieds” pattern.[^1][^2]
3. **MVP Scope (must-have vs nice-to-have)** —
    - **Must-have:** auth, user profiles, post listing (with images/video), faceted search & filters, location/region taxonomy, buyer–seller chat, saved searches & alerts, admin console (moderation, reports), listing bump/feature, basic payments for promoted listings, analytics.
    - **Nice-to-have:** verification tiers, ratings, delivery/escrow option, business “shops,” bulk upload, mobile apps parity.
4. **UX Flows & Wireframe Notes** — critical flows (onboarding, post-ad, search, listing detail, chat, report/mute, promote/bump, checkout for promotion). Provide **low‑fi wireframe descriptions** and accessibility notes.
5. **Information Architecture & Taxonomy** — categories (Vehicles, Real Estate, Jobs, Electronics, Home & Family, Sports & Recreation, Machinery/Tools, Services, Pets), subcategories, attributes (e.g., **Vehicles:** make, model, year, mileage, fuel, transmission; **Real Estate:** type, rooms, m², price, furnished; **Jobs:** type, seniority, salary range; etc.). Include **region hierarchy** (Country → Region/Prefecture → Municipality/City). Base categories on a MerrJep-like structure.[^2]
6. **Architecture (clear and pragmatic)** — recommend a path that balances speed and scale:
    - **Frontend:** Next.js (App Router) + TypeScript + Tailwind; SSR/ISR; i18n; SEO‑ready.
    - **Backend:** Node.js (NestJS) *or* .NET 8 minimal APIs (choose one, justify); REST + OpenAPI 3.
    - **Database:** PostgreSQL (core relational);
    - **Search:** OpenSearch/Elasticsearch (full‑text, filters, geo, synonyms);
    - **Cache/Queues:** Redis;
    - **Object Storage:** S3‑compatible for media;
    - **CDN:** Cloudflare/Azure CDN.
    - **Infra:** Azure (AKS or App Service + Azure Postgres + Azure Cache for Redis + Azure Storage).
    - **Observability:** OpenTelemetry, structured logs, tracing, metrics, alerting.
    - Provide a **component diagram** (Mermaid) and **sequence diagrams** for: post listing, search, chat, moderation.
7. **API Spec (OpenAPI YAML)** — cover: Auth, Users, Listings, Media Upload (pre‑signed URLs), Search, Messages, Notifications, Payments (promotions), Moderation, Admin.
8. **Data Model (SQL DDL)** — tables, indexes, FKs; include **search index mappings** for Listings with analyzers (language-aware), numeric ranges, keyword fields, and geo fields.
9. **Search & Ranking** — relevance strategy (BM25 + category boosts + freshness + paid boost), anti‑spam, typo tolerance, synonyms, query suggestions, saved searches & notifications.
10. **Trust & Safety** — policy, AI‑assisted moderation pipeline (image/text), fraud/abuse detection signals, rate limits, watermarking, PII redaction in chat, reporting workflows, audit trails.
11. **Monetization** — featured/bumped listings, subscription for business “shops,” category‑specific fees; payments through Stripe/Adyen (EU cards), invoicing for B2B; fraud/chargeback considerations.
12. **Legal & Compliance** — **GDPR** (consent, DSRs, data retention, audit), T&Cs, content policies, user verification tiers (optional), cookies, age limits.
13. **Localization/Internationalization** — initial languages **sq, en** (optionally **sr**); currency **EUR**; regional formats; translation strategy; RTL readiness (future). MerrJep has a Kosovo/Albania footprint—mirror the **municipality-style browsing** UX.[^1]
14. **Analytics Plan** — event schema (search, click, view, contact, chat send, report, promote, checkout); funnels; dashboards; cohort retention.
15. **Security & Performance NFRs** — OWASP ASVS mapping, SSO option, password policy, 2FA, rate limiting, WAF, CSP, object‑level auth, secrets management; SLOs (p95 latency), capacity planning, media optimization.
16. **Test Strategy** — unit, contract tests, e2e (Playwright), load tests (k6), security testing, red team drills; staging & blue/green deploy.
17. **Delivery Plan** — **12‑week MVP roadmap** (by sprint), RACI, risks, cut lines, success criteria; **6‑month V1** trajectory.
18. **Backlog (Jira‑ready)** — **epics → stories → acceptance criteria** for each domain: Auth, Listings, Search, Chat, Payments, Admin/Moderation, Analytics.
19. **Runbook** — on‑call, SLAs, incident response, data backups/restore, migration plan, feature flags, A/B testing.

**Constraints & Assumptions to use (editables):**

- **Target market:** `{Kosovo first, later Albania}`; **Languages:** `{sq, en (optionally sr)}`; **Currency:** `{EUR}`; **Regions:** `{municipalities model}` (MerrJep-like regional browsing).[^1]
- **MVP is web-first**; mobile apps targeted for V1 (or adopt React Native/Flutter later).
- **Photo uploads:** ≤ 10 per listing; max 10 MB per image; automatic compression and safe‑content checks.
- **Chat:** in‑app only (no email relay) for MVP; email/push notifications for new messages.
- **Promotion:** paid bumps/featured at MVP; full business “shops” at V1.

**Deliverables Formatting:**

- Use **clear headings**, checklists, Mermaid diagrams, and code blocks for OpenAPI & SQL.
- Keep MVP decisions opinionated and scrappy; call out trade‑offs and scale risks.
- For each section, include **“What could go wrong?”** and mitigations.
- End with a **one‑page executive summary** a stakeholder can sign off.

---

## 🎯 Example “Feature Parity Notes” to keep in scope

- **Category coverage & volume** like MerrJep’s major groups (Vehicles, Real Estate, Jobs, Electronics, etc.) and dense long‑tail subcategories.[^2]
- **Region browsing** by municipalities (e.g., Prishtinë, Prizren, Gjakovë, etc.) for local discovery.[^1]
- **Mobile presence:** MerrJep has Android/iOS apps; plan parity and push notifications timeline.[^3]

---

## 🧩 Optional Add‑On Sub‑Prompts

**A) DB & Search Design Deep‑Dive**  
“Design a PostgreSQL schema and Elasticsearch/OpenSearch mappings for a classifieds marketplace. Optimize for: (1) faceted search by category‑specific attributes, (2) geo radius search, (3) recency & promoted boosts, (4) moderation signals. Provide DDL + index strategy + sample queries.”

**B) Moderation Pipeline**  
“Propose an AI‑assisted moderation workflow for images/text: NSFW/weapons/fraud, duplicate‐listing detection, seller trust scoring, abuse reporting triage, and auditor tooling. Include data model, queues, SLAs, and escalation runbook.”

**C) Listing Promotion & Billing**  
“Model paid ‘bump’, ‘featured’, and ‘homepage spotlight’ products. Define pricing config, entitlement checks, anti‑abuse, Stripe integration, invoicing for B2B, and revenue dashboards. Provide API endpoints + state diagram.”

**D) Buyer–Seller Messaging**  
“Specify a real‑time chat service: data model, APIs, delivery/read receipts, typing indicators, spam controls, retention & export, and notification fan‑out. Include rate‑limits and privacy/PII redaction.”

**E) SEO & Growth**  
“Deliver an SEO plan: crawlable category pages, canonicalization, pagination, structured data (ItemList, Product, JobPosting, RealEstateListing), sitemap jobs, and content guidelines. Add an email/notifications growth loop for saved searches.”

---

## ✅ Quick Acceptance Criteria Checklist (Jira‑ready)

- **Listing Post:** supports 10 images, category‑specific attributes, price, location (lat/lon + region), preview → publish; uploads via pre‑signed URLs; failure fallback & retry.
- **Search:** faceted filters per category; text relevance + freshness + paid boost; type‑ahead; saved searches & alerts.
- **Chat:** in‑app real‑time messaging with message reporting; notifications via email/push; rate‑limit spam.
- **Admin:** moderate listings/messages/users; bulk actions; audit logs; configurable reasons; export CSV.
- **Payments:** create promotion, pay, issue invoice; show entitlement in listing; reconcile webhooks; refund path.
- **Security/Privacy:** GDPR DSR export/delete; consent banner; access logs; 2FA optional; CSP + WAF; PII redaction in chat.
- **Perf:** p95 < 300 ms for search API with cache warm; image CDN; LCP < 2.5s on listing pages.

---

## 🗓️ Suggested MVP Timeline (12 weeks, single squad)

- **Weeks 1–2:** IA & taxonomy, skeleton Next.js app, auth, media service, listing create/view.
- **Weeks 3–4:** Search (indexing + filters), listing detail, basic admin moderation.
- **Weeks 5–6:** Buyer–seller chat + notifications, saved searches & alerts.
- **Weeks 7–8:** Payments for promotions, business rules, receipts/webhooks.
- **Weeks 9–10:** SEO, analytics events, anti‑abuse, rate limits, audit logs.
- **Weeks 11–12:** Hardening, load tests, runbooks, beta launch.

---

## Sources used for grounding

[^1]: MerrJep homepage — categories & municipality browsing. https://www.merrjep.com/

[^2]: “Në shitje” listings page — category breakdown & taxonomy examples. https://www.merrjep.com/shpalljet/ne-shitje

[^3]: MerrJep Kosovo Android app page — mobile presence & features. https://play.google.com/store/apps/details?id=com.merrjep&hl=en

[^4]: MerrJep company overview on LinkedIn — footprint context. https://ca.linkedin.com/company/merrjep-com
