# 08 — Theme & Design System

Inspired by the calm, confident, content-first aesthetic of
[Muslim Pro](https://www.muslimpro.com/): generous whitespace, soft cards,
warm primary teal/green, restrained typography, and high-trust imagery.

> Design tokens are the source of truth. See
> [`assets/design-tokens.json`](../assets/design-tokens.json) and
> [`assets/color-palette.md`](../assets/color-palette.md).

## 1. Design principles

1. **Quiet UI, loud content.** Photos and price are the heroes; chrome is muted.
2. **Trust by default.** Clear sources, real photos, no aggressive ads.
3. **Mobile-first.** Every layout designed at 360 px first.
4. **Albanian-native.** Typography and spacing tested with the longest
   real-world Albanian strings (e.g. "Apartament 2+1 me pamje deti …").
5. **Accessible.** WCAG 2.1 AA color, focus, and motion.

## 2. Color palette

| Token                | Light value | Use                                |
| -------------------- | ----------- | ---------------------------------- |
| `--color-bg`         | `#FAFAF7`   | App background (warm off-white)    |
| `--color-surface`    | `#FFFFFF`   | Cards, inputs                      |
| `--color-fg`         | `#0F1A14`   | Primary text                       |
| `--color-muted`      | `#5C6B63`   | Secondary text                     |
| `--color-border`     | `#E5E7E2`   | Hairlines, dividers                |
| `--color-primary`    | `#2E7D5B`   | CTAs, links (Muslim-Pro-like teal) |
| `--color-primary-fg` | `#FFFFFF`   | Text on primary                    |
| `--color-accent`     | `#C9A24A`   | Highlights, badges (warm gold)     |
| `--color-danger`     | `#B3261E`   | Errors, destructive                |
| `--color-success`    | `#2E7D5B`   | Confirmations                      |
| `--color-warning`    | `#A8741A`   | Warnings                           |

All pairs above meet 4.5:1 contrast against their intended background.

## 3. Typography

- **Display & body:** Inter (system fallback `ui-sans-serif`).
- **Numerals (price):** Inter `tabular-nums` so prices align in tables.
- Scale (rem):
  - `xs 0.75 / sm 0.875 / base 1 / lg 1.125 / xl 1.25 / 2xl 1.5 / 3xl 1.875 / 4xl 2.25 / 5xl 3`
- Line height: tight (1.2) for headings, relaxed (1.6) for paragraphs.
- Letter-spacing: `-0.01em` for `2xl+`.

## 4. Spacing & radii

- Spacing scale: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96`.
- Radii: `sm 6 / md 10 / lg 14 / xl 20 / 2xl 28 / full`.
- Cards default to `radius.lg` and a soft 1-px border + subtle shadow.

## 5. Elevation

- `shadow-card`: `0 1px 2px rgba(15,26,20,0.04), 0 8px 24px -12px rgba(15,26,20,0.10)`
- `shadow-pop`: `0 8px 24px -8px rgba(15,26,20,0.18)`
- Dialogs: `shadow-pop` + 8 px ring of `--color-bg/60`.

## 6. Motion

- Default duration `180ms`, easing `cubic-bezier(0.2, 0, 0, 1)`.
- Respect `prefers-reduced-motion: reduce`.

## 7. Components — visual contract

- **Buttons:** `primary` (filled teal), `secondary` (outline on surface),
  `ghost` (text only). 40 px height, 16 px x-padding.
- **Inputs:** 44 px height on mobile, 40 px desktop. Floating focus ring uses
  `--color-primary` at 30% alpha.
- **Cards:** white surface, 16 px padding, `shadow-card`, `radius.lg`.
- **Listing card:**
  - 4:3 image with rounded top corners
  - Price (display 2xl tabular)
  - Type badge (Sale/Rent) + property type chip
  - Title (truncate 2 lines)
  - `bedrooms · bathrooms · area` row
  - Region with map-pin icon
- **Filter pills:** rounded-full, accent on active.
- **Map markers:** primary teal circle with white border; clusters use accent.

## 8. Iconography

- `lucide-react` only. Stroke 1.5 px, 20 px default.

## 9. Imagery

- Original images shown at the chosen aspect ratio with a subtle blurhash
  while loading. Avoid heavy filters; never letterbox in cover positions.

## 10. Tailwind preset

- Provided by `packages/config/tailwind.preset.ts`. Frontend imports it from
  `tailwind.config.ts`.
- Tokens are exposed as CSS custom properties in `app/styles/tailwind.css`
  (`:root { --color-bg: …; }`) so non-Tailwind consumers (e.g. emails) can
  read the same values.

## 11. Email theme

- Plain, single-column, max-width 560 px, tokens duplicated inline.
- Header: brand wordmark + favicon. Footer: "tregprone — Tiranë".

## 12. Logo & brand

- Wordmark in Inter SemiBold, primary color.
- Provide an SVG logomark (a stylized roof / map-pin hybrid). Place SVG under
  `apps/web/public/brand/`. (Designer to refine post-MVP.)

## 13. Do / don't

- **Do** keep one accent color per screen.
- **Do** use real apartment photos in marketing.
- **Don't** use red as a primary color (cultural and fraud-warning ambiguity).
- **Don't** stack more than 2 modal layers.
