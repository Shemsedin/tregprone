import { Link, useLoaderData, Form, data } from 'react-router';
import type { Route } from './+types/($lang).favorites.js';
import { requireToken } from '~/lib/auth.js';
import { buildMeta } from '~/lib/seo.js';
import { Header } from '~/components/layout/Header.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Të preferuarat' });

export async function loader({ request, params }: Route.LoaderArgs) {
  const lang = params['lang'] ?? 'sq';
  const token = requireToken(request, lang);

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/me/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { items } = (await res.json()) as { items: Array<Record<string, unknown>> };
  return data({ lang, favorites: items });
}

export async function action({ request, params }: Route.ActionArgs) {
  const lang = params['lang'] ?? 'sq';
  const token = requireToken(request, lang);
  const formData = await request.formData();
  const listingId = String(formData.get('listingId') ?? '');

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  await fetch(`${apiUrl}/v1/me/favorites/${listingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return null;
}

export default function FavoritesPage() {
  const { lang, favorites } = useLoaderData<typeof loader>();

  return (
    <div className="bg-bg min-h-screen">
      <Header
        lang={lang}
        brandText="tregprone"
        brandClassName="text-primary text-xl font-bold"
        navItems={[
          { label: 'Të preferuarat', to: `/${lang}/favorites`, className: 'text-fg text-sm' },
        ]}
      />

      <main className="max-w-page mx-auto px-4 py-8">
        <h1 className="text-fg text-2xl font-bold">Të preferuarat</h1>

        {favorites.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-muted text-lg">Nuk keni shtuar asnjë pronë të preferuar.</p>
            <Link
              to={`/${lang}/listings`}
              className="bg-primary text-primary-fg hover:bg-primary/90 mt-4 inline-flex rounded-md px-6 py-2.5 text-sm font-medium"
            >
              Kërko prona
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => {
              const listing = (fav['listing'] as Record<string, unknown>) ?? fav;
              return (
                <div
                  key={String(fav['id'])}
                  className="border-border bg-surface shadow-card overflow-hidden rounded-xl border"
                >
                  <Link to={`/${lang}/listings/${String(listing['slug'])}`}>
                    <div className="bg-border/20 h-48">
                      {(listing['coverImage'] as Record<string, string> | null)?.['url'] ? (
                        <img
                          src={String((listing['coverImage'] as Record<string, string>)['url'])}
                          alt={String(listing['title'])}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">🏠</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link
                      to={`/${lang}/listings/${String(listing['slug'])}`}
                      className="text-fg hover:text-primary line-clamp-1 font-medium"
                    >
                      {String(listing['title'])}
                    </Link>
                    <p className="text-muted mt-1 text-sm">{String(listing['region'] ?? '')}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-accent font-bold">
                        {Number(listing['priceMinor']) / 100} {String(listing['currency'])}
                      </span>
                      <Form method="post">
                        <input type="hidden" name="listingId" value={String(listing['id'])} />
                        <button type="submit" className="text-danger text-xs hover:underline">
                          Hiq
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
