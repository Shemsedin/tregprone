# Component inventory

A canonical list of every UI component the MVP needs. Use this when running
[`../prompts/12-theme-design-system.prompt.md`](../prompts/12-theme-design-system.prompt.md).

## Primitives (shadcn/ui or equivalent)

- `Button` — variants: `primary`, `secondary`, `ghost`, `danger`. Sizes: `sm`, `md`, `lg`, `icon`.
- `IconButton`
- `Input`
- `Textarea`
- `Select`
- `Combobox` (autocomplete with async data)
- `Checkbox`
- `RadioGroup`
- `Switch`
- `Slider`
- `RangeSlider`
- `DatePicker`
- `DropdownMenu`
- `Dialog`
- `Drawer` / `Sheet`
- `Popover`
- `Tooltip`
- `Toast` / `Toaster`
- `Tabs`
- `Accordion`
- `Avatar`
- `Badge`
- `Card`
- `Separator`
- `Skeleton`
- `ScrollArea`
- `Pagination`
- `Breadcrumbs`
- `Alert`
- `Progress`
- `Spinner`

## App-level composites

- `LocaleSwitcher` — dropdown with flag-free labels (`Shqip (AL)`,
  `Shqip (XK)`, `Shqip (MK)`, `English`).
- `CurrencySwitcher` — dropdown for `ALL / EUR / MKD / USD`.
- `Header` — logo, primary nav, search shortcut, account menu.
- `Footer` — link columns, locale switcher, legal.
- `SearchBar` — region combobox + buy/rent toggle + submit.
- `FilterRail` — collapsible filter container.
- `FilterPill` — chip-style filter for compact views.
- `ListingCard` — image, price, type badges, title, key facts, region.
- `ListingGrid` — responsive grid with skeleton states.
- `ListingMap` — see [`../prompts/09-map-integration.prompt.md`](../prompts/09-map-integration.prompt.md).
- `Gallery` — primary + thumbs + lightbox.
- `Image` — responsive `<picture>` with AVIF/WebP/JPEG and blurhash.
- `ContactForm`
- `ImageUploader`
- `MapPicker` — single draggable marker for selecting a location.
- `WizardStepper` — used by the new-listing wizard.
- `EmptyState`
- `ErrorState`
- `RoleGate` — renders children only for the given role.
- `Money` — currency-aware price formatter.
- `Distance` — formats meters/km in active locale.
- `RelativeTime`
- `Markdown` — sanitized renderer for descriptions.
- `Toolbar` — generic toolbar for admin tables.
- `DataTable` — TanStack Table wrapper with consistent paging/sort UI.
- `KeyboardShortcuts` — listens for admin shortcuts and shows the help dialog.

## Email components (`packages/ui/src/email`)

- `EmailLayout`
- `EmailHeader`
- `EmailFooter`
- `EmailButton`
- `EmailHero`

## Storybook coverage (recommended)

- All primitives + composites: 1 default story + edge cases (long text,
  Albanian text, 0 results, error).
