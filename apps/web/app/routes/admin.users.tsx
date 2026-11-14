import { useLoaderData, Form, data } from 'react-router';
import type { Route } from './+types/admin.users.js';

import { getToken } from '~/lib/auth.js';

export async function loader({ request }: Route.LoaderArgs) {
  const token = getToken(request)!;
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const params = q ? `?q=${encodeURIComponent(q)}&limit=50` : '?limit=50';
  const res = await fetch(`${apiUrl}/v1/admin/users${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { items } = await res.json() as { items: Array<Record<string, unknown>> };
  return data({ users: items, q });
}

export async function action({ request }: Route.ActionArgs) {
  const token = getToken(request)!;
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const userId = String(formData.get('userId') ?? '');

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  await fetch(`${apiUrl}/v1/admin/users/${userId}/${intent}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return null;
}

export default function AdminUsersPage() {
  const { users, q } = useLoaderData<typeof loader>();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-fg">Përdoruesit</h1>

      <Form method="get" className="mt-4">
        <input name="q" defaultValue={q} placeholder="Kërko sipas emrit ose emailit…"
          className="rounded-md border border-border px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary" />
      </Form>

      <div className="mt-6 space-y-2">
        {users.map((user) => (
          <div key={String(user['id'])}
            className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 shadow-card">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-fg">{String(user['name'])}</p>
              <p className="text-xs text-muted">{String(user['email'])} · {String(user['role'])}</p>
              {user['suspended'] === true && <p className="text-xs font-medium text-danger">Suspenduar</p>}
            </div>
            <Form method="post">
              <input type="hidden" name="userId" value={String(user['id'])} />
              <input type="hidden" name="intent" value={user['suspended'] ? 'unsuspend' : 'suspend'} />
              <button type="submit"
                className={`rounded-md px-3 py-1.5 text-xs font-medium text-white ${user['suspended'] ? 'bg-success hover:bg-success/90' : 'bg-danger hover:bg-danger/90'}`}>
                {user['suspended'] ? 'Aktivizo' : 'Suspendo'}
              </button>
            </Form>
          </div>
        ))}
      </div>
    </main>
  );
}
