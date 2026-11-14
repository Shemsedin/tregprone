import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from './index.js';

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export function parseLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const v = value.trim();
  if (LOCALE_SET.has(v)) return v as Locale;
  // map short forms: 'sq' -> 'sq-AL', 'en-US' -> 'en'
  const lang = v.toLowerCase().split(/[-_]/)[0];
  if (lang === 'sq') return 'sq-AL';
  if (lang === 'en') return 'en';
  return null;
}

export function negotiate(input: {
  cookie?: string | null;
  acceptLanguage?: string | null;
  pathLocale?: string | null;
}): Locale {
  return (
    parseLocale(input.pathLocale) ??
    parseLocale(input.cookie) ??
    parseAcceptLanguage(input.acceptLanguage) ??
    DEFAULT_LOCALE
  );
}

function parseAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const candidates = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: (tag ?? '').trim(), q: q ? Number(q.split('=')[1]) : 1 };
    })
    .filter((c) => c.tag)
    .sort((a, b) => b.q - a.q);

  for (const c of candidates) {
    const matched = parseLocale(c.tag);
    if (matched) return matched;
  }
  return null;
}
