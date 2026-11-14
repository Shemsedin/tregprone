import { useLoaderData, data } from 'react-router';
import { Link } from 'react-router';
import type { Route } from './+types/admin.audit.js';

import { getToken } from '~/lib/auth.js';

export async function loader({ request }: Route.LoaderArgs) {
  const token = getToken(request)!;
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const params = cursor ? `?cursor=${cursor}&limit=50` : '?limit=50';
  const res = await fetch(`${apiUrl}/v1/admin/audit-log${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { items, nextCursor } = await res.json() as {
    items: Array<Record<string, unknown>>;
    nextCursor: string | null;
  };

  return data({ entries: items, nextCursor });
}

export default function AdminAuditPage() {
  const { entries, nextCursor } = useLoaderData<typeof loader>();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-fg">Audit Log</h1>

      <div className="mt-6 space-y-2">
        {entries.map((entry) => (
          <div key={String(entry['id'])}
            className="rounded-lg border border-border bg-surface p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="font-medium text-fg">{String(entry['action'])}</span>
                <span className="ml-2 text-muted">nga <strong>{String((entry['actor'] as Record<string, string> | null)?.['email'] ?? 'system')}</strong></span>
                {entry['targetId'] && (
                  <span className="ml-2 text-muted">· {String(entry['targetType'])} {String(entry['targetId'])}</span>
                )}
                {entry['note'] && (
                  <p className="mt-1 text-muted italic">{String(entry['note'])}</p>
                )}
              </div>
              <time className="shrink-0 text-xs text-muted tabular-nums">
                {new Date(String(entry['createdAt'])).toLocaleString('sq-AL')}
              </time>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="text-center text-muted">Nuk ka regjistrime.</p>
        )}
      </div>

      {nextCursor && (
        <div className="mt-6 text-center">
          <Link to={`?cursor=${nextCursor}`}
            className="rounded-md border border-border px-4 py-2 text-sm text-fg hover:bg-border/30">
            Faqja tjetër
          </Link>
        </div>
      )}
    </main>
  );
}
