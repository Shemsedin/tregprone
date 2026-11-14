import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_NAMESPACES, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../src/index.js';

const ROOT = fileURLToPath(new URL('../catalogs/', import.meta.url));

type Tree = Record<string, unknown>;

function flatten(prefix: string, tree: Tree, out: Set<string>) {
  for (const [k, v] of Object.entries(tree)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(next, v as Tree, out);
    else out.add(next);
  }
}

function readTree(locale: string, ns: string): Tree | null {
  const file = path.join(ROOT, locale, `${ns}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8')) as Tree;
}

let errors = 0;

// Validate that every locale resolves the same key set as DEFAULT_LOCALE
// (after fallback chain merging). Missing keys in non-default catalogs are
// fine as long as they exist in DEFAULT_LOCALE.
const baseKeys = new Map<string, Set<string>>();
for (const ns of ALL_NAMESPACES) {
  const tree = readTree(DEFAULT_LOCALE, ns);
  if (!tree) {
    console.error(`[i18n] Missing default catalog: ${DEFAULT_LOCALE}/${ns}.json`);
    errors++;
    continue;
  }
  const keys = new Set<string>();
  flatten('', tree, keys);
  baseKeys.set(ns, keys);
}

for (const locale of SUPPORTED_LOCALES) {
  for (const ns of ALL_NAMESPACES) {
    const tree = readTree(locale, ns);
    if (!tree) {
      if (locale === DEFAULT_LOCALE || locale === 'en') {
        console.error(`[i18n] ${locale}/${ns}.json is required.`);
        errors++;
      }
      continue;
    }
    const keys = new Set<string>();
    flatten('', tree, keys);
    const base = baseKeys.get(ns);
    if (!base) continue;
    for (const k of keys) {
      if (!base.has(k)) {
        console.warn(`[i18n] Extra key in ${locale}/${ns}: ${k}`);
      }
    }
    if (locale === 'en') {
      // English must be a complete translation, not a Shqip echo.
      for (const k of base) {
        if (!keys.has(k)) {
          console.error(`[i18n] Missing key in en/${ns}.json: ${k}`);
          errors++;
        }
      }
    }
  }
}

// List of catalog files for visibility
console.log('[i18n] Catalogs found:');
for (const locale of SUPPORTED_LOCALES) {
  const dir = path.join(ROOT, locale);
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  console.log(`  - ${locale}: ${files.join(', ') || '(none)'}`);
}

if (errors > 0) {
  console.error(`\n[i18n] ${errors} error(s).`);
  process.exit(1);
}
console.log('\n[i18n] OK.');
