# Color palette

Inspired by the calm, trustworthy palette of Muslim Pro, adapted for a
property marketplace. All values are also in
[`design-tokens.json`](./design-tokens.json).

## Light theme

| Token            | Hex / Value                       | Usage                                |
| ---------------- | --------------------------------- | ------------------------------------ |
| `bg`             | `#FAFAF7`                         | Page background, warm off-white      |
| `surface`        | `#FFFFFF`                         | Cards, inputs, dialogs               |
| `fg`             | `#0F1A14`                         | Primary text                         |
| `muted`          | `#5C6B63`                         | Secondary text, captions             |
| `border`         | `#E5E7E2`                         | Hairlines, separators, input borders |
| `primary`        | `#2E7D5B`                         | Buttons, links, active states        |
| `primary-fg`     | `#FFFFFF`                         | Text on primary                      |
| `primary-hover`  | `#256A4D`                         | Hover state for primary              |
| `accent`         | `#C9A24A`                         | Highlights, "featured" badges        |
| `accent-fg`      | `#1A1A1A`                         | Text on accent                       |
| `danger`         | `#B3261E`                         | Errors, destructive buttons          |
| `success`        | `#2E7D5B`                         | Success toasts, "Sold" pill          |
| `warning`        | `#A8741A`                         | Caution states                       |
| `info`           | `#1F6FB2`                         | Informational banners                |
| `overlay`        | `rgba(15, 26, 20, 0.55)`          | Dialog scrims, lightbox backdrop     |

## Contrast (WCAG)

| Foreground    | Background | Ratio | Pass    |
| ------------- | ---------- | ----- | ------- |
| `fg`          | `bg`       | 14.2  | AAA     |
| `muted`       | `bg`       | 4.6   | AA      |
| `primary-fg`  | `primary`  | 5.1   | AA      |
| `accent-fg`   | `accent`   | 9.7   | AAA     |
| `danger`      | `bg`       | 5.4   | AA      |

## Status pills

| State            | Pill bg     | Pill fg     |
| ---------------- | ----------- | ----------- |
| `DRAFT`          | `#E5E7E2`   | `#0F1A14`   |
| `PENDING_REVIEW` | `#FCEFD2`   | `#7A5300`   |
| `PUBLISHED`      | `#D8EFE2`   | `#1F5A41`   |
| `REJECTED`       | `#F8DAD6`   | `#7A1B14`   |
| `SOLD`           | `#D8EFE2`   | `#1F5A41`   |
| `RENTED`         | `#D6E5F2`   | `#163E66`   |
| `ARCHIVED`       | `#E5E7E2`   | `#5C6B63`   |

## Map

- Marker fill: `primary` (`#2E7D5B`), border `surface`, 2 px.
- Cluster fill: `accent` (`#C9A24A`), text `accent-fg`, font `Inter SemiBold`.
- Highlight (hovered marker): scale 1.15, ring with `shadow.ring`.

## Accessibility notes

- Never use color alone to convey state — always pair with a label/icon.
- Focus ring uses `shadow.ring` against any surface; works on light only.
- Verify any new combination with `npm run a11y:contrast` (script runs
  `@axe-core/cli` on the Storybook build).
