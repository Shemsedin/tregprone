import { IntlMessageFormat } from 'intl-messageformat';

import type { CatalogTree } from './loader.js';
import type { Locale, Namespace } from './index.js';

export interface Formatter {
  t: (key: string, vars?: Record<string, unknown>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatMoney: (amountMinor: bigint | number, currency: string) => string;
}

export function createFormatter(
  locale: Locale,
  catalogs: Partial<Record<Namespace, CatalogTree>>,
): Formatter {
  function getMessage(key: string): string | undefined {
    const [ns, ...rest] = key.split('.');
    if (!ns || rest.length === 0) return undefined;
    const tree = catalogs[ns as Namespace];
    if (!tree) return undefined;
    let cur: unknown = tree;
    for (const segment of rest) {
      if (cur && typeof cur === 'object' && segment in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[segment];
      } else {
        return undefined;
      }
    }
    return typeof cur === 'string' ? cur : undefined;
  }

  function t(key: string, vars: Record<string, unknown> = {}): string {
    const msg = getMessage(key);
    if (!msg) return key;
    try {
      return new IntlMessageFormat(msg, locale).format(vars) as string;
    } catch {
      return msg;
    }
  }

  return {
    t,
    formatNumber: (value, options) => new Intl.NumberFormat(locale, options).format(value),
    formatDate: (value, options) =>
      new Intl.DateTimeFormat(locale, options ?? { dateStyle: 'medium' }).format(
        typeof value === 'string' || typeof value === 'number' ? new Date(value) : value,
      ),
    formatMoney: (amountMinor, currency) => {
      const major = Number(amountMinor) / 100;
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        maximumFractionDigits: currency === 'ALL' || currency === 'MKD' ? 0 : 2,
      }).format(major);
    },
  };
}
