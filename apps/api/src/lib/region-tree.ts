export interface RegionReference {
  id: string;
  parentId: string | null;
}

export function getRegionAndDescendantIds(
  regions: readonly RegionReference[],
  regionId: string,
): string[] {
  const childrenByParent = new Map<string, string[]>();

  for (const region of regions) {
    if (!region.parentId) continue;
    const children = childrenByParent.get(region.parentId) ?? [];
    children.push(region.id);
    childrenByParent.set(region.parentId, children);
  }

  const result = new Set([regionId]);
  const pending = [regionId];
  for (const currentRegionId of pending) {
    for (const childId of childrenByParent.get(currentRegionId) ?? []) {
      if (result.has(childId)) continue;
      result.add(childId);
      pending.push(childId);
    }
  }

  return [...result];
}
