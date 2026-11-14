// Auth helpers for React Router loaders/actions
import { redirect } from 'react-router';

const SESSION_COOKIE = 'ts_session';

/** Extract access token from cookie header */
export function getToken(request: Request): string | undefined {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match?.[1];
}

/** Set session cookie on a response */
export function setSessionCookie(headers: Headers, token: string, ttl = 900) {
  const secure = process.env['NODE_ENV'] === 'production' ? '; Secure' : '';
  headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/${secure}; Max-Age=${ttl}`,
  );
}

/** Clear session cookie */
export function clearSessionCookie(headers: Headers) {
  headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );
}

/** Redirect to login if no token */
export function requireToken(request: Request, lang = 'sq') {
  const token = getToken(request);
  if (!token) throw redirect(`/${lang}/auth/login?next=${encodeURIComponent(new URL(request.url).pathname)}`);
  return token;
}
