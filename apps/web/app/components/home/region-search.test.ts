import { describe, expect, it } from 'vitest';

import { getRegionSuggestions, type SearchRegion } from './region-search.js';

const regions: SearchRegion[] = [
  { id: 'tirane', name: 'Tiranë', slug: 'tirane', country: 'AL', parentId: null },
  {
    id: 'prizren-area',
    name: 'Rajoni i Prizrenit',
    slug: 'rajoni-i-prizrenit',
    country: 'XK',
    parentId: null,
  },
  { id: 'prishtine', name: 'Prishtinë', slug: 'prishtine', country: 'XK', parentId: null },
  { id: 'prizren', name: 'Prizren', slug: 'prizren', country: 'XK', parentId: null },
];

describe('getRegionSuggestions', () => {
  it('returns only matching places and ranks the exact city first', () => {
    const suggestions = getRegionSuggestions(regions, 'Prizren');

    expect(suggestions.map((region) => region.id)).toEqual(['prizren', 'prizren-area']);
    expect(suggestions).not.toContainEqual(expect.objectContaining({ id: 'tirane' }));
  });

  it('matches Albanian place names without requiring diacritics', () => {
    expect(getRegionSuggestions(regions, 'prishtine').map((region) => region.id)).toEqual([
      'prishtine',
    ]);
  });

  it('returns no suggestions for blank or unrelated queries', () => {
    expect(getRegionSuggestions(regions, '   ')).toEqual([]);
    expect(getRegionSuggestions(regions, 'Durres')).toEqual([]);
  });
});
