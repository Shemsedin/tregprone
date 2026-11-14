import { Form, Link, useLoaderData, useActionData, redirect, data } from 'react-router';
import type { Route } from './+types/($lang).account.listings.$id.edit.js';
import { requireToken } from '~/lib/auth.js';
import { buildMeta } from '~/lib/seo.js';
import { Header } from '~/components/layout/Header.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Ndrysho listimin' });

export async function loader({ request, params }: Route.LoaderArgs) {
  const lang = params['lang'] ?? 'sq';
  const token = requireToken(request, lang);
  const id = params['id']!;

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const [listingRes, regionsRes] = await Promise.all([
    fetch(`${apiUrl}/v1/listings/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${apiUrl}/v1/regions`),
  ]);

  const listing = (await listingRes.json()) as Record<string, unknown>;
  const { items: regions } = (await regionsRes.json()) as {
    items: Array<{ id: string; name: string; country: string }>;
  };

  return data({ lang, listing, regions });
}

export async function action({ request, params }: Route.ActionArgs) {
  const lang = params['lang'] ?? 'sq';
  const token = requireToken(request, lang);
  const id = params['id']!;
  const formData = await request.formData();

  const body: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === 'price') {
      body['priceMinor'] = BigInt(Math.round(Number(value) * 100)).toString();
    } else if (['areaM2', 'bedrooms', 'bathrooms'].includes(key)) {
      body[key] = value ? Number(value) : undefined;
    } else {
      body[key] = String(value);
    }
  }

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/listings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { title?: string };
    return data({ error: err.title ?? 'Ndryshimi dështoi.' }, { status: res.status });
  }

  const { slug } = (await res.json()) as { slug: string };
  throw redirect(`/${lang}/listings/${slug}`);
}

export default function EditListingPage() {
  const { lang, listing, regions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="bg-bg min-h-screen">
      <Header
        lang={lang}
        brandText="Ndrysho Listimin"
        brandClassName="text-primary text-xl font-bold"
        backLink={{ to: `/${lang}/account/listings`, label: 'Kthehu' }}
      />

      <main className="max-w-narrow mx-auto px-4 py-8">
        <Form
          method="post"
          className="border-border bg-surface shadow-card space-y-6 rounded-xl border p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-fg text-sm font-medium">Titulli *</label>
              <input
                name="title"
                required
                defaultValue={String(listing['title'] ?? '')}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Tipi i transaksionit</label>
              <select
                name="listingType"
                defaultValue={String(listing['listingType'] ?? 'SALE')}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="SALE">Shitje</option>
                <option value="RENT">Qira</option>
              </select>
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Tipi i pronës</label>
              <select
                name="propertyType"
                defaultValue={String(listing['propertyType'] ?? 'APARTMENT')}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="APARTMENT">Apartament</option>
                <option value="HOUSE">Shtëpi</option>
                <option value="VILLA">Vilë</option>
                <option value="STUDIO">Studio</option>
                <option value="LAND">Tokë</option>
                <option value="COMMERCIAL">Komercial</option>
                <option value="OFFICE">Zyrë</option>
                <option value="GARAGE">Garazh</option>
              </select>
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Çmimi *</label>
              <input
                name="price"
                type="number"
                min={0}
                defaultValue={Number(listing['priceMinor'] ?? 0) / 100}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Monedha</label>
              <select
                name="currency"
                defaultValue={String(listing['currency'] ?? 'ALL')}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="ALL">ALL</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="MKD">MKD</option>
              </select>
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Rajoni</label>
              <select
                name="regionId"
                defaultValue={String(listing['regionId'] ?? '')}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.country})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Sipërfaqja (m²)</label>
              <input
                name="areaM2"
                type="number"
                defaultValue={listing['areaM2'] != null ? Number(listing['areaM2']) : ''}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Dhoma gjumi</label>
              <input
                name="bedrooms"
                type="number"
                defaultValue={listing['bedrooms'] != null ? Number(listing['bedrooms']) : ''}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Banjo</label>
              <input
                name="bathrooms"
                type="number"
                defaultValue={listing['bathrooms'] != null ? Number(listing['bathrooms']) : ''}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-fg text-sm font-medium">Përshkrimi</label>
              <textarea
                name="description"
                rows={6}
                defaultValue={String(listing['description'] ?? '')}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {actionData?.error && (
            <p className="bg-danger/10 text-danger rounded-md px-3 py-2 text-sm">
              {actionData.error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-primary text-primary-fg hover:bg-primary/90 rounded-md px-6 py-2.5 text-sm font-semibold"
            >
              Ruaj ndryshimet
            </button>
            <Link
              to={`/${lang}/account/listings`}
              className="border-border text-fg hover:bg-border/30 rounded-md border px-6 py-2.5 text-sm"
            >
              Anulo
            </Link>
          </div>
        </Form>
      </main>
    </div>
  );
}
