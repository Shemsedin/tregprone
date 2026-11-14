import { Form, Link, useLoaderData, data } from 'react-router';
import type { Route } from './+types/($lang).account.listings.js';

import { requireToken } from '~/lib/auth.js';
import { buildMeta } from '~/lib/seo.js';
import { Header } from '~/components/layout/Header.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Listingjet e mia' });

export async function loader({ request, params }: Route.LoaderArgs) {
  const lang = params['lang'] ?? 'sq';
  const token = requireToken(request, lang);

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/me/listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return data({ lang, listings: [] });
  const { items } = (await res.json()) as { items: unknown[] };
  return data({ lang, listings: items });
}

export default function AccountListingsPage() {
  const { lang, listings } = useLoaderData<typeof loader>();

  return (
    <div className="bg-bg min-h-screen">
      <Header
        lang={lang}
        brandText="Tregprone"
        brandClassName="text-[#23206F] text-xl font-bold"
        navItems={[
          {
            label: 'Listingjet',
            to: `/${lang}/account/listings`,
            className: 'text-primary text-sm font-medium',
          },
          {
            label: '+ Shto listim',
            to: `/${lang}/account/listings/new`,
            variant: 'button',
          },
        ]}
      />

      <main className="max-w-page mx-auto px-4 py-8">
        <h1 className="text-fg text-2xl font-bold">Listingjet e mia</h1>

        {(listings as Array<Record<string, unknown>>).length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted text-lg">Nuk keni asnjë listim akoma.</p>
            <Link
              to={`/${lang}/account/listings/new`}
              className="bg-primary text-primary-fg hover:bg-primary/90 mt-4 inline-flex rounded-md px-6 py-2.5 text-sm font-medium"
            >
              Krijo Listimin e Parë
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {(listings as Array<Record<string, unknown>>).map((listing) => (
              <div
                key={String(listing['id'])}
                className="border-border bg-surface shadow-card flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="bg-border/30 h-16 w-16 shrink-0 overflow-hidden rounded-md">
                  {(listing['coverImage'] as Record<string, string> | null)?.['url'] ? (
                    <img
                      src={String((listing['coverImage'] as Record<string, string>)['url'])}
                      alt={String(listing['title'])}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">🏠</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-fg truncate font-medium">{String(listing['title'])}</h3>
                  <p className="text-muted text-xs">
                    Status: <span className="font-medium">{String(listing['status'])}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/${lang}/listings/${String(listing['slug'])}`}
                    className="border-border hover:bg-border/30 rounded border px-3 py-1.5 text-xs"
                  >
                    Shiko
                  </Link>
                  {['DRAFT', 'REJECTED'].includes(String(listing['status'])) && (
                    <Link
                      to={`/${lang}/account/listings/${String(listing['id'])}/edit`}
                      className="bg-primary text-primary-fg hover:bg-primary/90 rounded px-3 py-1.5 text-xs"
                    >
                      Ndrysho
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
