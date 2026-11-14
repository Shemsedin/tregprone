import { Form, Link, useActionData, redirect, data } from 'react-router';
import type { Route } from './+types/($lang).auth.login.js';

import { setSessionCookie } from '~/lib/auth.js';
import { buildMeta } from '~/lib/seo.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Hyrje' });

export async function action({ request, params }: Route.ActionArgs) {
  const lang = params['lang'] ?? 'sq';
  const formData = await request.formData();
  const next = new URL(request.url).searchParams.get('next') ?? `/${lang}`;

  const body = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  };

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return data({ error: 'Email ose fjalëkalim i gabuar.' }, { status: 401 });
  }

  const { accessToken } = (await res.json()) as { accessToken: string };
  const headers = new Headers();
  setSessionCookie(headers, accessToken);
  headers.append('Location', next);

  throw redirect(next, { headers });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const lang = 'sq';

  return (
    <div className="bg-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to={`/${lang}`} className="text-primary mb-8 block text-center text-xl font-bold">
          tregprone
        </Link>

        <div className="border-border bg-surface shadow-card rounded-xl border p-8">
          <h1 className="text-fg text-2xl font-bold">Hyrje</h1>
          <p className="text-muted mt-1 text-sm">Mirë se u kthye!</p>

          <Form method="post" className="mt-6 space-y-4">
            <div>
              <label className="text-fg text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="text-fg text-sm font-medium">Fjalëkalimi</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {actionData?.error && (
              <p className="bg-danger/10 text-danger rounded-md px-3 py-2 text-sm">
                {actionData.error}
              </p>
            )}

            <button
              type="submit"
              className="bg-primary text-primary-fg hover:bg-primary/90 w-full rounded-md py-2.5 text-sm font-semibold"
            >
              Hyr
            </button>
          </Form>

          <div className="mt-4 flex justify-between text-sm">
            <Link to={`/${lang}/auth/forgot`} className="text-primary hover:underline">
              Harrove fjalëkalimin?
            </Link>
            <Link to={`/${lang}/auth/register`} className="text-muted hover:text-fg">
              Regjistrohu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
