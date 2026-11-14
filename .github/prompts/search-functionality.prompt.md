## User Story

As a home-page visitor looking to buy or rent, I want the location field under “Kërko prona për blerje” or “Kërko prona me qira” to suggest the place I actually typed and let me select it, so that my search shows properties in that location instead of unrelated towns and cities.

## Task

Improve the location search field in the home-page buy/rent hero. Replace the current plain-text-only behavior with location autocomplete backed by the project's regions data. Inspect the current home search component, region API, and listing loader/API behavior first. Preserve the buy/rent tabs and canonical routes (`/:lang/property-to-buy` and `/:lang/property-to-rent`); do not broaden this task into redesigning the listing results page or adding unrelated filters.

---

## Acceptance Criteria

### Scenario 1: Suggestions match the typed place

**Given** a user focuses the home-page location field and types a place such as “Prizren”,
**When** matching region suggestions are shown,
**Then** suggestions are actual regions matching the entered text, with exact or prefix matches ranked before weaker matches,
**And** unrelated towns and cities are never presented as matches merely because they have listings or are otherwise popular.

### Scenario 2: Selecting a suggestion constrains results

**Given** a user selects a region suggestion,
**When** they submit the home-page search,
**Then** the selected region's canonical `regionId` is sent to the existing listings search route,
**And** returned listings belong to that selected region (and its child regions when the region hierarchy requires it), never unrelated cities.

### Scenario 3: Free text is not mistaken for a selected region

**Given** a user types a location but does not select a suggestion,
**When** they edit the text or submit the form,
**Then** the UI does not silently substitute a different region,
**And** it either performs the documented text search or asks the user to select a matching location, with the chosen behavior made clear in the interface.

### Scenario 4: Buy and rent searches preserve their intent

**Given** a user selects a region and either the “Blej” or “Qira” tab,
**When** they submit the search,
**Then** navigation uses the matching canonical buy or rent route and includes the selected region,
**And** changing the text after selecting a suggestion clears the stale region selection.

### Scenario 5: Autocomplete is usable and resilient

**Given** suggestions are loading, no regions match, or the region request fails,
**When** the user interacts with the field,
**Then** the field communicates the appropriate state and remains usable,
**And** suggestions support keyboard navigation, selection, and accessible labeling.

### Scenario 6: The location behavior is verified

**Given** automated tests run for the home-page search field and its integration,
**When** the user searches for and selects a location,
**Then** tests verify that “Prizren” does not produce unrelated city suggestions, that the selected region ID reaches the results URL, and that both buy and rent routes are preserved,
**And** tests cover no matches, text edits after selection, and keyboard selection.

## Implementation Notes

- Use the existing region endpoint and canonical region IDs; extend the API only if necessary to support efficient text-matched suggestions or correct filtering across child regions.
- Display enough region context (such as city, parent region, and country) to distinguish duplicate place names.
- Debounce requests and avoid showing stale suggestions after the query changes. Normalize case and Albanian diacritics for matching while preserving the correctly localized display name.
- Keep the selected region in the URL as `regionId` so the search is shareable and refresh-safe. Keep arbitrary text in `q` only when following the documented text-search behavior; never treat an unselected query as a confirmed region.
- Follow the existing locale and UI patterns, and add focused tests for suggestion matching, selection, navigation, and result scoping.
