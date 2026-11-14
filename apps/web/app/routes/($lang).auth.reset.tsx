import { Form, Link, useLoaderData, useActionData, redirect, data } from 'react-router';
import type { Route } from './+types/($lang).auth.reset.js';
import { buildMeta } from '~/lib/seo.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Vendos fjalëkalim të ri' });

export function loader({ request, params }: Route.LoaderArgs) {
  const lang = params['lang'] ?? 'sq';
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  if (!token) throw redirect(`/${lang}/auth/forgot`);
  return data({ lang, token });
}

export async function action({ request, params }: Route.ActionArgs) {
  const lang = params['lang'] ?? 'sq';
  const formData = await request.formData();
  const token = String(formData.get('token') ?? '');
  const password = String(formData.get('password') ?? '');

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword: password }),
  });

  if (!res.ok) {
    return data({ error: 'Tokeni nuk është i vlefshëm ose ka skaduar.' });
  }

  throw redirect(`/${lang}/auth/login?reset=1`);
}

export default function ResetPasswordPage() {
  const { lang, token } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-bold text-fg">Fjalëkalim i Ri</h1>

        <Form method="post" className="mt-6 space-y-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="text-sm font-medium text-fg">Fjalëkalimi i ri</label>
            <input type="password" name="password" required minLength={8}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {actionData?.error && (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{actionData.error}</p>
          )}

          <button type="submit"
            className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary/90">
            Ndrysho fjalëkalimin
          </button>
        </Form>

        <p className="mt-4 text-center text-sm text-muted">
          <Link to={`/${lang}/auth/login`} className="text-primary hover:underline">Kthehu te hyrja</Link>
        </p>
      </div>
    </div>
  );
}
