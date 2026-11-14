import { redirect } from 'react-router';
import type { Route } from './+types/_index.js';

// Redirect root / to /sq (default Albanian locale)
export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const localeCookie = cookieHeader.match(/ts_locale=([^;]+)/)?.[1];

  if (localeCookie && ['sq', 'sq-XK', 'sq-MK', 'en'].includes(localeCookie)) {
    throw redirect(`/${localeCookie}`);
  }

  // Negotiate from Accept-Language
  const acceptLang = request.headers.get('Accept-Language') ?? '';
  const lang = acceptLang.toLowerCase().includes('sq') ? 'sq' : 'en';
  throw redirect(`/${lang}`);
}

export default function Index() {
  return null;
}
