import { Form, Link, useLoaderData, useActionData, data } from 'react-router';
import type { Route } from './+types/($lang).auth.forgot.js';
import { buildMeta } from '~/lib/seo.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Rivendos fjalëkalimin' });

export function loader({ params }: Route.LoaderArgs) {
  return data({ lang: params['lang'] ?? 'sq' });
}

export async function action({ request, params }: Route.ActionArgs) {
  const lang = params['lang'] ?? 'sq';
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '');

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  await fetch(`${apiUrl}/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  return data({ sent: true, lang });
}

export default function ForgotPasswordPage() {
  const { lang } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  if (actionData?.sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-fg">Kontrollo emailin tuaj</h1>
          <p className="text-muted">Nëse adresa ekziston, do të merrni udhëzimet për rivendosjen e fjalëkalimit.</p>
          <Link to={`/${lang}/auth/login`} className="text-sm text-primary hover:underline">Kthehu te hyrja</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-card">
        <h1 className="text-2xl font-bold text-fg">Rivendos fjalëkalimin</h1>
        <p className="mt-2 text-sm text-muted">Shkruaj emailin tënd dhe do të dërgojmë udhëzimet.</p>

        <Form method="post" className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-fg">Email</label>
            <input type="email" name="email" required autoComplete="email"
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <button type="submit"
            className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary/90">
            Dërgo udhëzimet
          </button>
        </Form>

        <p className="mt-4 text-center text-sm text-muted">
          <Link to={`/${lang}/auth/login`} className="text-primary hover:underline">Kthehu te hyrja</Link>
        </p>
      </div>
    </div>
  );
}
