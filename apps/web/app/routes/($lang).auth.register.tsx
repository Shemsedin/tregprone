import { Form, Link, useActionData, redirect, data } from 'react-router';
import type { Route } from './+types/($lang).auth.register.js';

import { setSessionCookie } from '~/lib/auth.js';
import { buildMeta } from '~/lib/seo.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Regjistrohu' });

export async function action({ request, params }: Route.ActionArgs) {
  const lang = params['lang'] ?? 'sq';
  const formData = await request.formData();

  const body = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    name: String(formData.get('name') ?? ''),
    role: String(formData.get('role') ?? 'USER'),
  };

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as { title?: string };
    return data({ error: errorBody.title ?? 'Regjistrimi dështoi.' }, { status: res.status });
  }

  const { accessToken } = (await res.json()) as { accessToken: string };
  const headers = new Headers();
  setSessionCookie(headers, accessToken);
  throw redirect(`/${lang}`, { headers });
}

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();
  const lang = 'sq';

  return (
    <div className="bg-bg flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to={`/${lang}`} className="text-primary mb-8 block text-center text-xl font-bold">
          tregprone
        </Link>

        <div className="border-border bg-surface shadow-card rounded-xl border p-8">
          <h1 className="text-fg text-2xl font-bold">Regjistrohu</h1>
          <p className="text-muted mt-1 text-sm">Krijo llogari falas</p>

          <Form method="post" className="mt-6 space-y-4">
            <div>
              <label className="text-fg text-sm font-medium">Emri i plotë</label>
              <input
                name="name"
                required
                minLength={2}
                autoComplete="name"
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
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
                minLength={8}
                autoComplete="new-password"
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
              <p className="text-muted mt-1 text-xs">Minimumi 8 karaktere, me letra dhe numra</p>
            </div>
            <div>
              <label className="text-fg text-sm font-medium">Regjistrohu si</label>
              <select
                name="role"
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="USER">Blerës / Qiramarrës</option>
                <option value="AGENT">Agjent / Pronar</option>
              </select>
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
              Regjistrohu
            </button>
          </Form>

          <p className="text-muted mt-4 text-center text-sm">
            Ke llogari?{' '}
            <Link to={`/${lang}/auth/login`} className="text-primary hover:underline">
              Hyr
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
