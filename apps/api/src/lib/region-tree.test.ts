import { describe, expect, it } from 'vitest';

import { getRegionAndDescendantIds } from './region-tree.js';

describe('getRegionAndDescendantIds', () => {
  it('includes a region and descendants at every depth', () => {
    const regions = [
      { id: 'city', parentId: null },
      { id: 'district', parentId: 'city' },
      { id: 'neighborhood', parentId: 'district' },
      { id: 'other-city', parentId: null },
    ];

    expect(getRegionAndDescendantIds(regions, 'city')).toEqual([
      'city',
      'district',
      'neighborhood',
    ]);
  });

  it('returns the selected ID when it is unknown or has no children', () => {
    expect(getRegionAndDescendantIds([{ id: 'city', parentId: null }], 'missing')).toEqual([
      'missing',
    ]);
  });
});
