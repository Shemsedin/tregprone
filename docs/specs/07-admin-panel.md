# 07 — Admin Panel

A role-gated section of the same React Router v7 app at `/admin/*` (no locale
prefix; admin UI is in English to keep ops simple at MVP).

## 1. Access control

- Requires `role = ADMIN` in the JWT.
- Loader on `admin.tsx` throws `redirect('/sq/auth/login?next=/admin')` if no
  session, and `403` if not admin.
- All admin actions also re-check role server-side; never trust the UI.
- Every mutation writes an `AuditLog` row.

## 2. Information architecture

```
/admin                    Dashboard
/admin/listings           Moderation queue (default = PENDING_REVIEW)
/admin/listings/:id       Listing detail with approve/reject actions
/admin/users              User management
/admin/users/:id          User detail
/admin/regions            Region tree CRUD
/admin/features           Feature dictionary CRUD
/admin/audit              Audit log (read-only)
/admin/settings           Feature flags, mail templates (later)
```

## 3. Dashboard widgets

- Counts: users (today/total), agents, listings by status, contacts last 24h.
- Chart: listings published per day, last 30 days.
- Queue size: PENDING_REVIEW count with a CTA "Review now".

## 4. Listings moderation

- Table columns: cover thumb, title, owner, region, type, submittedAt, status.
- Filters: status, region, type, owner email/contains.
- Bulk actions: approve, reject (with reason picker), archive.
- Detail page shows full preview with the same renderer as the public site,
  plus a side panel:
  - Owner info
  - Submission history
  - Reject reasons checklist (`spam`, `fake`, `bad-photos`, `wrong-region`,
    `duplicate`, `pricing-suspect`, `other`).
  - Free-text note for the owner (sent in email).

## 5. Users

- Table: email, name, role, createdAt, status (active/suspended).
- Actions: suspend, unsuspend, change role (USER ↔ AGENT, never directly to
  ADMIN — that requires direct CLI/DB access).
- Detail: list of their listings, contact requests received, sessions with
  revoke buttons.

## 6. Taxonomy

- Regions: tree editor (drag to reorder; expand/collapse).
  - Required: `country`, `name`, `slug`, optional `centroid`.
- Features: simple list with key (i18n id) + Albanian default label preview.

## 7. Audit log

- Read-only. Filters: action, actor, dateRange.
- Each row links to the affected entity if reachable.

## 8. UX patterns

- Two-pane layout: persistent left nav + main; no nested tabs deeper than 2.
- Keyboard shortcuts:
  - `g l` → listings, `g u` → users, `g r` → regions
  - `a` approve, `r` reject (in moderation queue)
  - `?` shows shortcut help
- Toasts for every action; failures show problem-detail `detail` field.
- Confirmation dialogs for destructive actions; type the email/title to confirm.

## 9. Implementation notes

- Use `<Outlet />` in `admin.tsx` and a shared `<AdminShell>` component.
- Tables use TanStack Table v8 with server-driven pagination/sort.
- All admin loaders use the same `requireAdmin(request)` helper which
  inspects the cookie and 403s otherwise.
- Reject reasons are an enum in `packages/types` so they are documented and
  i18n-ready in the email templates.
