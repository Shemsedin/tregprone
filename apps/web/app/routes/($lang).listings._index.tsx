import { Link, useLoaderData, useSearchParams, Form, redirect } from 'react-router';
import { SlidersHorizontal } from 'lucide-react';
import type { Route } from './+types/($lang).listings._index.js';

import { getListings } from '~/lib/api.js';
import { buildMeta } from '~/lib/seo.js';
import { PublicLayout } from '~/components/layout/PublicLayout.js';
import { ListingCard } from '~/components/listings/ListingCard.js';
import type { ListingSummary } from '@treg/types';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Kërko Prona' });

function parseTransactionToType(value: string | null): 'SALE' | 'RENT' | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'blej' || normalized === 'shitje') return 'SALE';
  if (normalized === 'qira') return 'RENT';
  return undefined;
}

function parseLegacyType(value: string | null): 'SALE' | 'RENT' | undefined {
  const normalized = value?.trim().toUpperCase();
  if (normalized === 'SALE' || normalized === 'RENT') return normalized;
  return undefined;
}

function typeToTransaction(value: 'SALE' | 'RENT' | undefined): 'blej' | 'qira' | '' {
  if (value === 'SALE') return 'blej';
  if (value === 'RENT') return 'qira';
  return '';
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const lang = params['lang'] ?? 'sq';
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();

  const typeFromPath = pathname.endsWith('/property-to-buy')
    ? 'SALE'
    : pathname.endsWith('/property-to-rent')
      ? 'RENT'
      : undefined;

  const listingType =
    parseTransactionToType(url.searchParams.get('transaksion')) ??
    parseLegacyType(url.searchParams.get('type')) ??
    typeFromPath;

  const canonicalPath = listingType
    ? `/${lang}/${listingType === 'SALE' ? 'property-to-buy' : 'property-to-rent'}`
    : `/${lang}/listings`;

  const normalizedParams = new URLSearchParams(url.searchParams);
  normalizedParams.delete('transaksion');
  normalizedParams.delete('type');

  const hasLegacyTypeParams = url.searchParams.has('transaksion') || url.searchParams.has('type');
  const pathNeedsRedirect = url.pathname !== canonicalPath;

  if (pathNeedsRedirect || hasLegacyTypeParams) {
    const queryString = normalizedParams.toString();
    throw redirect(queryString ? `${canonicalPath}?${queryString}` : canonicalPath);
  }

  const filters = {
    type: listingType,
    propertyType: url.searchParams.getAll('propertyType').filter(Boolean),
    regionId: url.searchParams.get('regionId')?.trim() || undefined,
    priceMin: url.searchParams.get('priceMin')
      ? Number(url.searchParams.get('priceMin'))
      : undefined,
    priceMax: url.searchParams.get('priceMax')
      ? Number(url.searchParams.get('priceMax'))
      : undefined,
    bedroomsMin: url.searchParams.get('bedroomsMin')
      ? Number(url.searchParams.get('bedroomsMin'))
      : undefined,
    q: url.searchParams.get('q')?.trim() || undefined,
    sort:
      (url.searchParams.get('sort') as '-createdAt' | 'priceMinor' | '-priceMinor') ?? '-createdAt',
    limit: 20,
    cursor: url.searchParams.get('cursor')?.trim() || undefined,
  };

  const data = await getListings(filters);
  return {
    lang,
    listings: data.items,
    nextCursor: data.nextCursor,
    geo: data.geo,
    filters,
    transaksion: typeToTransaction(listingType),
  };
}

export default function SearchPage() {
  const { lang, listings, nextCursor, filters, transaksion } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const propertyTypeOptions: Array<[string, string]> = [
    ['APARTMENT', 'Apartament'],
    ['HOUSE', 'Shtëpi'],
    ['VILLA', 'Vilë'],
    ['LAND', 'Tokë'],
    ['COMMERCIAL', 'Komercial'],
  ];

  return (
    <PublicLayout lang={lang} showFooter={false}>
      <div className="max-w-page mx-auto flex gap-0 px-0 py-6 md:gap-6 md:px-4">
        {/* Filter Rail */}
        <aside className="hidden w-64 shrink-0 md:block">
          <Form
            method="get"
            className="border-border bg-surface shadow-card sticky top-24 space-y-4 rounded-lg border p-4"
          >
            <h2 className="text-fg flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filtrat
            </h2>

            {/* Search */}
            <div>
              <label className="text-muted text-xs font-medium">Kërkim</label>
              <input
                name="q"
                defaultValue={filters.q}
                placeholder="Qyteti, zona…"
                className="border-border focus:ring-primary mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-muted text-xs font-medium">Lloji i transaksionit</label>
              <select
                name="transaksion"
                defaultValue={transaksion}
                className="border-border focus:ring-primary mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1"
              >
                <option value="">Të gjitha</option>
                <option value="blej">Blej</option>
                <option value="qira">Qira</option>
              </select>
            </div>

            {/* Property type */}
            <div>
              <label className="text-muted text-xs font-medium">Tipi i pronës</label>
              {propertyTypeOptions.map(([v, l]) => (
                <label key={v} className="text-fg mt-1 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="propertyType"
                    value={v}
                    defaultChecked={filters.propertyType?.includes(v)}
                    className="rounded"
                  />
                  {l}
                </label>
              ))}
            </div>

            {/* Sort */}
            <div>
              <label className="text-muted text-xs font-medium">Renditja</label>
              <select
                name="sort"
                defaultValue={filters.sort}
                className="border-border focus:ring-primary mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1"
              >
                <option value="-createdAt">Më të reja</option>
                <option value="priceMinor">Çmimi ↑</option>
                <option value="-priceMinor">Çmimi ↓</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-primary text-primary-fg hover:bg-primary/90 w-full rounded-md py-2 text-sm font-medium"
            >
              Kërko
            </button>
          </Form>
        </aside>

        {/* Results */}
        <main className="flex-1 px-4 md:px-0">
          {listings.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-muted text-sm font-medium">{listings.length} prona u gjetën</p>
              </div>

              <div className="space-y-3">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    lang={lang}
                    variant="list"
                    showListingTypeBadge={false}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-muted mt-16 text-center">
              <p className="text-lg font-medium">Nuk u gjet asnjë pronë</p>
              <p className="mt-1 text-sm">Provo të ndryshosh filtrat</p>
            </div>
          )}

          {nextCursor && (
            <div className="mt-8 flex justify-center">
              <Link
                to={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), cursor: nextCursor })}`}
                className="border-border text-fg hover:bg-border/30 rounded-md border px-6 py-2 text-sm font-medium"
              >
                Ngarko më shumë
              </Link>
            </div>
          )}
        </main>
      </div>
    </PublicLayout>
  );
}
