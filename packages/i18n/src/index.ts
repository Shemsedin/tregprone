export const SUPPORTED_LOCALES = ['sq-AL', 'sq-XK', 'sq-MK', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'sq-AL';
export const FALLBACK_CHAIN: Record<Locale, Locale[]> = {
  'sq-AL': ['sq-AL'],
  'sq-XK': ['sq-XK', 'sq-AL'],
  'sq-MK': ['sq-MK', 'sq-AL'],
  en: ['en'],
};

export const DEFAULT_CURRENCY_FOR_LOCALE: Record<Locale, 'ALL' | 'EUR' | 'MKD' | 'USD'> = {
  'sq-AL': 'ALL',
  'sq-XK': 'EUR',
  'sq-MK': 'MKD',
  en: 'EUR',
};

export type Namespace =
  | 'common'
  | 'auth'
  | 'listing'
  | 'search'
  | 'account'
  | 'admin'
  | 'errors';

export const ALL_NAMESPACES: Namespace[] = [
  'common',
  'auth',
  'listing',
  'search',
  'account',
  'admin',
  'errors',
];

export { negotiate, parseLocale } from './negotiate.js';
export { loadCatalog, loadCatalogs } from './loader.js';
export { createFormatter, type Formatter } from './format.js';
