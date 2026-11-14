import { useLoaderData, data } from 'react-router';
import type { Route } from './+types/admin._index.js';

import { getToken } from '~/lib/auth.js';

export async function loader({ request }: Route.LoaderArgs) {
  const token = getToken(request)!;
  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/admin/metrics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const metrics = await res.json() as Record<string, unknown>;
  return data({ metrics });
}

export default function AdminDashboard() {
  const { metrics } = useLoaderData<typeof loader>();

  const stats = [
    { label: 'Përdorues', value: String(metrics['totalUsers'] ?? 0) },
    { label: 'Listingje', value: String(metrics['totalListings'] ?? 0) },
    { label: 'Në pritje', value: String(metrics['pendingListings'] ?? 0) },
    { label: 'Kontakte 24h', value: String(metrics['contacts24h'] ?? 0) },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-fg">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-surface p-4 shadow-card">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-fg">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-fg">Listingje sipas statusit</h2>
        <div className="mt-4 space-y-2">
          {Object.entries(metrics['listingsByStatus'] as Record<string, number> ?? {}).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-2">
              <span className="text-sm font-medium text-fg">{status}</span>
              <span className="text-sm tabular-nums text-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
