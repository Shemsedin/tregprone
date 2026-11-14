import { Outlet, Link, redirect, useLoaderData, data } from 'react-router';
import type { Route } from './+types/admin.js';

import { getToken } from '~/lib/auth.js';
import { buildMeta } from '~/lib/seo.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Admin' });

export async function loader({ request }: Route.LoaderArgs) {
  const token = getToken(request);
  if (!token) throw redirect('/sq/auth/login?next=/admin');

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw redirect('/sq/auth/login');

  const { user } = await res.json() as { user: Record<string, string> };
  if (user['role'] !== 'ADMIN') throw redirect('/sq');

  return data({ user, token });
}

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <nav className="hidden w-56 shrink-0 border-r border-border bg-surface md:flex flex-col">
        <div className="border-b border-border p-4">
          <Link to="/admin" className="text-lg font-bold text-primary">Admin</Link>
          <p className="text-xs text-muted mt-1">{user['name']}</p>
        </div>
        <ul className="flex-1 space-y-1 p-3 text-sm">
          {[
            ['/admin', 'Dashboard'],
            ['/admin/listings', 'Listingjet'],
            ['/admin/users', 'Përdoruesit'],
            ['/admin/audit', 'Audit Log'],
          ].map(([to, label]) => (
            <li key={to}>
              <Link to={to} className="flex rounded-md px-3 py-2 text-fg hover:bg-border/40">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-3">
          <Link to="/sq" className="text-xs text-muted hover:text-fg">← Kthe të faqen</Link>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
