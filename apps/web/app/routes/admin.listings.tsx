import { useLoaderData, Form, data } from 'react-router';
import { Link } from 'react-router';
import type { Route } from './+types/admin.listings.js';

import { getToken } from '~/lib/auth.js';

export async function loader({ request }: Route.LoaderArgs) {
  const token = getToken(request)!;
  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'PENDING_REVIEW';

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/admin/listings?status=${status}&limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { items } = await res.json() as { items: Array<Record<string, unknown>> };
  return data({ listings: items, status, token });
}

export async function action({ request }: Route.ActionArgs) {
  const token = getToken(request)!;
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const listingId = String(formData.get('listingId') ?? '');
  const reason = formData.get('reason') ? String(formData.get('reason')) : undefined;

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  await fetch(`${apiUrl}/v1/admin/listings/${listingId}/${intent}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(reason ? { reason } : {}),
  });

  return null;
}

export default function AdminListingsPage() {
  const { listings, status } = useLoaderData<typeof loader>();

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-fg">Listingjet</h1>
        <div className="flex gap-2">
          {['PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'DRAFT'].map((s) => (
            <Link key={s} to={`?status=${s}`}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${status === s ? 'bg-primary text-primary-fg' : 'border border-border text-fg hover:bg-border/30'}`}>
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {listings.map((listing) => (
          <div key={String(listing['id'])}
            className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4 shadow-card">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-fg">{String(listing['title'])}</h3>
              <p className="text-xs text-muted">
                {String((listing['owner'] as Record<string, string> | null)?.['name'] ?? '')} · {String(listing['region'] as unknown)}
              </p>
              <p className="text-xs text-muted">ID: {String(listing['id'])}</p>
            </div>

            {status === 'PENDING_REVIEW' && (
              <div className="flex shrink-0 gap-2">
                <Form method="post">
                  <input type="hidden" name="listingId" value={String(listing['id'])} />
                  <input type="hidden" name="intent" value="approve" />
                  <button type="submit"
                    className="rounded-md bg-success px-3 py-1.5 text-xs font-medium text-white hover:bg-success/90">
                    Aprovo
                  </button>
                </Form>
                <Form method="post">
                  <input type="hidden" name="listingId" value={String(listing['id'])} />
                  <input type="hidden" name="intent" value="reject" />
                  <input type="hidden" name="reason" value="Përmbajtje e papërshtatshme" />
                  <button type="submit"
                    className="rounded-md bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-danger/90">
                    Refuzo
                  </button>
                </Form>
              </div>
            )}
          </div>
        ))}

        {listings.length === 0 && (
          <p className="text-center text-muted">Nuk ka listingje me statusin {status}</p>
        )}
      </div>
    </main>
  );
}
