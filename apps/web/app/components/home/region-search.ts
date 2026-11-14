export interface SearchRegion {
  id: string;
  name: string;
  slug: string;
  country: string;
  parentId: string | null;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getRegionSuggestions(
  regions: readonly SearchRegion[],
  query: string,
  limit = 8,
): SearchRegion[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  return regions
    .flatMap((region) => {
      const normalizedName = normalize(region.name);
      const normalizedSlug = normalize(region.slug.replace(/-/g, ' '));
      if (!normalizedName.includes(normalizedQuery) && !normalizedSlug.includes(normalizedQuery)) {
        return [];
      }

      const rank =
        normalizedName === normalizedQuery
          ? 0
          : normalizedName.startsWith(normalizedQuery)
            ? 1
            : normalizedName.split(/\s+/).some((word) => word.startsWith(normalizedQuery))
              ? 2
              : normalizedSlug === normalizedQuery
                ? 0
                : normalizedSlug.startsWith(normalizedQuery)
                  ? 1
                  : 3;

      return [{ region, rank }];
    })
    .sort(
      (left, right) => left.rank - right.rank || left.region.name.localeCompare(right.region.name),
    )
    .slice(0, limit)
    .map(({ region }) => region);
}
