import { Outlet, redirect } from 'react-router';
import type { Route } from './+types/($lang).js';

import { negotiate } from '@treg/i18n';

const VALID_LANGS = ['sq', 'sq-XK', 'sq-MK', 'en'] as const;
type Lang = (typeof VALID_LANGS)[number];

const LANG_TO_LOCALE: Record<string, string> = {
  sq: 'sq-AL',
  'sq-XK': 'sq-XK',
  'sq-MK': 'sq-MK',
  en: 'en',
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const lang = params['lang'] as Lang | undefined;

  if (!lang || !VALID_LANGS.includes(lang)) {
    // Negotiate and redirect
    const locale = negotiate({
      acceptLanguage: request.headers.get('Accept-Language'),
      cookie: request.headers.get('Cookie')?.match(/ts_locale=([^;]+)/)?.[1],
    });
    const redirectLang = locale.startsWith('sq-AL') ? 'sq' :
      locale.startsWith('sq-XK') ? 'sq-XK' :
      locale.startsWith('sq-MK') ? 'sq-MK' : 'en';
    throw redirect(`/${redirectLang}`);
  }

  const locale = LANG_TO_LOCALE[lang] ?? 'sq-AL';
  return { lang, locale };
}

export default function LangLayout() {
  return <Outlet />;
}
