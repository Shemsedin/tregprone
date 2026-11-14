import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { FALLBACK_CHAIN, type Locale, type Namespace } from './index.js';

const CATALOGS_ROOT = fileURLToPath(new URL('../catalogs/', import.meta.url));

export type CatalogTree = Record<string, unknown>;

const cache = new Map<string, CatalogTree>();

export async function loadCatalog(locale: Locale, ns: Namespace): Promise<CatalogTree> {
  const key = `${locale}:${ns}`;
  const cached = cache.get(key);
  if (cached) return cached;

  // Merge fallback chain so missing keys fall back to sq-AL (or en).
  const chain = FALLBACK_CHAIN[locale];
  let merged: CatalogTree = {};
  for (const candidate of [...chain].reverse()) {
    const file = path.join(CATALOGS_ROOT, candidate, `${ns}.json`);
    try {
      const json = JSON.parse(await readFile(file, 'utf8')) as CatalogTree;
      merged = deepMerge(merged, json);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }
  cache.set(key, merged);
  return merged;
}

export async function loadCatalogs(
  locale: Locale,
  namespaces: Namespace[],
): Promise<Record<Namespace, CatalogTree>> {
  const out = {} as Record<Namespace, CatalogTree>;
  await Promise.all(
    namespaces.map(async (ns) => {
      out[ns] = await loadCatalog(locale, ns);
    }),
  );
  return out;
}

function deepMerge(base: CatalogTree, override: CatalogTree): CatalogTree {
  const out: CatalogTree = { ...base };
  for (const [k, v] of Object.entries(override)) {
    const cur = out[k];
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      cur &&
      typeof cur === 'object' &&
      !Array.isArray(cur)
    ) {
      out[k] = deepMerge(cur as CatalogTree, v as CatalogTree);
    } else {
      out[k] = v;
    }
  }
  return out;
}
