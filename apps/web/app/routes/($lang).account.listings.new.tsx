import { Form, Link, useLoaderData, useActionData, redirect, data } from 'react-router';
import type { Route } from './+types/($lang).account.listings.new.js';

import { requireToken } from '~/lib/auth.js';
import { buildMeta } from '~/lib/seo.js';
import { Header } from '~/components/layout/Header.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Listim i Ri' });

export async function loader({ request, params }: Route.LoaderArgs) {
  const lang = params['lang'] ?? 'sq';
  requireToken(request, lang);

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const regionsRes = await fetch(`${apiUrl}/v1/regions`);
  const regionsData = (await regionsRes.json()) as {
    items: Array<{ id: string; name: string; country: string }>;
  };

  return data({ lang, regions: regionsData.items });
}

export async function action({ request, params }: Route.ActionArgs) {
  const lang = params['lang'] ?? 'sq';
  const token = requireToken(request, lang);
  const formData = await request.formData();

  const body = {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    listingType: String(formData.get('listingType') ?? 'SALE'),
    propertyType: String(formData.get('propertyType') ?? 'APARTMENT'),
    priceMinor: BigInt(Math.round(Number(formData.get('price') ?? 0) * 100)).toString(),
    currency: String(formData.get('currency') ?? 'ALL'),
    areaM2: formData.get('areaM2') ? Number(formData.get('areaM2')) : undefined,
    bedrooms: formData.get('bedrooms') ? Number(formData.get('bedrooms')) : undefined,
    bathrooms: formData.get('bathrooms') ? Number(formData.get('bathrooms')) : undefined,
    regionId: String(formData.get('regionId') ?? ''),
    lat: Number(formData.get('lat') ?? 41.3275),
    lng: Number(formData.get('lng') ?? 19.8189),
    featureKeys: [],
  };

  const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
  const res = await fetch(`${apiUrl}/v1/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { title?: string };
    return data({ error: err.title ?? 'Krijimi dështoi.' }, { status: res.status });
  }

  const { id, slug } = (await res.json()) as { id: string; slug: string };
  throw redirect(`/${lang}/listings/${slug}`);
}

export default function NewListingPage() {
  const { lang, regions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="bg-bg min-h-screen">
      <Header
        lang={lang}
        brandText="Listim i Ri"
        brandClassName="text-primary text-xl font-bold"
        backLink={{ to: `/${lang}/account/listings`, label: 'Kthehu' }}
      />

      <main className="max-w-narrow mx-auto px-4 py-8">
        <Form
          method="post"
          className="border-border bg-surface shadow-card space-y-6 rounded-xl border p-6"
        >
          <h1 className="text-fg text-2xl font-bold">Krijo listim të ri</h1>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-fg text-sm font-medium">Titulli *</label>
              <input
                name="title"
                required
                minLength={3}
                maxLength={140}
                placeholder="p.sh. Apartament 2+1 në Bllok, Tiranë"
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Tipi i transaksionit</label>
              <select
                name="listingType"
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
                required
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Monedha</label>
              <select
                name="currency"
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="ALL">ALL (Lekë)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD</option>
                <option value="MKD">MKD (Denarë)</option>
              </select>
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Rajoni *</label>
              <select
                name="regionId"
                required
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="">-- Zgjidh --</option>
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
                min={1}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Dhoma gjumi</label>
              <input
                name="bedrooms"
                type="number"
                min={0}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-fg text-sm font-medium">Banjo</label>
              <input
                name="bathrooms"
                type="number"
                min={0}
                className="border-border focus:ring-primary mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Hidden lat/lng defaults — in a real app this would be a map picker */}
            <input type="hidden" name="lat" value="41.3275" />
            <input type="hidden" name="lng" value="19.8189" />

            <div className="sm:col-span-2">
              <label className="text-fg text-sm font-medium">Përshkrimi *</label>
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={8000}
                rows={6}
                placeholder="Përshkruani pronën në detaje…"
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
              Krijo Listimin
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
