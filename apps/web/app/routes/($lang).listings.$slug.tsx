import { useState } from 'react';
import { Link, useLoaderData, Form, data } from 'react-router';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Heart,
  Phone,
  Mail,
  Building2,
  Home,
  Layers,
  // feature icons
  Car,
  Snowflake,
  Flame,
  Sofa,
  Package,
  Leaf,
  Waves,
  Droplets,
  Shield,
  Archive,
  Mountain,
  Sun,
  Wifi,
  Accessibility,
  DoorOpen,
  ArrowUpDown,
  type LucideIcon,
} from 'lucide-react';
import type { Route } from './+types/($lang).listings.$slug.js';

import { getListing } from '~/lib/api.js';
import { buildMeta, buildListingJsonLd } from '~/lib/seo.js';
import { PublicLayout } from '~/components/layout/PublicLayout.js';
import type { ListingDetail } from '@treg/types';

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta: Route.MetaFunction = ({ data: loaderData }) => {
  if (!loaderData) return [{ title: 'Pronë | tregprone' }];
  const d = loaderData as { listing: ListingDetail };
  return buildMeta({
    title: d.listing.title,
    description: d.listing.description.slice(0, 160),
    image: d.listing.images?.[0]?.url,
  });
};

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ params }: Route.LoaderArgs) {
  const lang = params['lang'] ?? 'sq';
  const slug = params['slug'];
  if (!slug) throw new Response('Not found', { status: 404 });
  try {
    const listing = await getListing(slug);
    return data({ lang, listing });
  } catch {
    throw new Response('Not found', { status: 404 });
  }
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function action({ request, params }: Route.ActionArgs) {
  const slug = params['slug'] ?? '';
  const formData = await request.formData();
  const body = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: formData.get('phone') ? String(formData.get('phone')) : undefined,
    message: String(formData.get('message') ?? ''),
  };
  try {
    const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
    const listingId = String(formData.get('listingId') ?? '');
    const res = await fetch(`${apiUrl}/v1/listings/${listingId}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return data({ error: 'Dërgimi dështoi. Provo përsëri.' }, { status: res.status });
    return data({ success: true });
  } catch {
    return data({ error: 'Gabim i brendshëm.' }, { status: 500 });
  }
}

const FEATURE_ICONS: Partial<Record<string, LucideIcon>> = {
  'feature.balcony': DoorOpen,
  'feature.parking': Car,
  'feature.elevator': ArrowUpDown,
  'feature.ac': Snowflake,
  'feature.heating_central': Flame,
  'feature.heating_gas': Flame,
  'feature.furnished': Sofa,
  'feature.semi_furnished': Package,
  'feature.garden': Leaf,
  'feature.pool': Droplets,
  'feature.security': Shield,
  'feature.storage': Archive,
  'feature.sea_view': Waves,
  'feature.mountain_view': Mountain,
  'feature.basement': Layers,
  'feature.solar_panels': Sun,
  'feature.fireplace': Flame,
  'feature.disability_access': Accessibility,
  'feature.fiber_internet': Wifi,
};

const FEATURE_LABELS: Record<string, string> = {
  'feature.balcony': 'Ballkon',
  'feature.parking': 'Parkim',
  'feature.elevator': 'Ashensor',
  'feature.ac': 'Klima',
  'feature.heating_central': 'Ngrohje qendrore',
  'feature.heating_gas': 'Ngrohje gaz',
  'feature.furnished': 'I mobiluar',
  'feature.semi_furnished': 'Gjysmë i mobiluar',
  'feature.garden': 'Kopësht',
  'feature.pool': 'Pishinë',
  'feature.security': 'Siguri',
  'feature.storage': 'Depo',
  'feature.sea_view': 'Pamje deti',
  'feature.mountain_view': 'Pamje mali',
  'feature.basement': 'Bodrum',
  'feature.solar_panels': 'Panele diellore',
  'feature.fireplace': 'Kamin',
  'feature.disability_access': 'Akses me karrocë',
  'feature.fiber_internet': 'Internet fibër',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartament',
  HOUSE: 'Shtëpi',
  VILLA: 'Vilë',
  STUDIO: 'Studio',
  LAND: 'Tokë',
  COMMERCIAL: 'Komerciale',
  OFFICE: 'Zyrë',
  GARAGE: 'Garazh',
  OTHER: 'Tjetër',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ListingDetailPage() {
  const { lang, listing } = useLoaderData<typeof loader>();
  const actionData = useLoaderData<typeof action>() as { success?: boolean; error?: string } | null;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'map'>('overview');
  const [copied, setCopied] = useState(false);

  const images = listing.images ?? [];

  const openLightbox = (i: number) => {
    setLightboxIdx(i);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImg = () => setLightboxIdx((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setLightboxIdx((i) => (i + 1) % images.length);

  const fmtPrice = (minor: string | bigint, currency: string) =>
    new Intl.NumberFormat('sq-AL', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(minor) / 100);

  const price = fmtPrice(listing.priceMinor as any, listing.currency);
  const priceM2 = listing.areaM2
    ? fmtPrice(
        BigInt(Math.round(Number(listing.priceMinor) / 100 / listing.areaM2)) * BigInt(100),
        listing.currency,
      )
    : null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: listing.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const jsonLd = buildListingJsonLd(listing);

  return (
    <PublicLayout
      lang={lang}
      headerBackLink={{ to: `/${lang}/listings`, label: 'Kthehu' }}
      headerClassName="shadow-sm"
      showFooter={false}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="max-w-page text-muted mx-auto flex items-center gap-1 px-4 py-2 text-xs">
        <Link to={`/${lang}`} className="hover:underline">
          Kryefaqja
        </Link>
        <span>/</span>
        <Link to={`/${lang}/listings`} className="hover:underline">
          Prona
        </Link>
        <span>/</span>
        <Link to={`/${lang}/listings?regionId=${listing.regionId}`} className="hover:underline">
          {listing.region.name}
        </Link>
        <span>/</span>
        <span className="text-fg max-w-[200px] truncate">{listing.title}</span>
      </div>

      <div className="max-w-page mx-auto px-4 pb-12">
        {/* ── Image gallery ──────────────────────────────────────────────── */}
        {images.length > 0 ? (
          <div
            className="relative grid grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-xl"
            style={{ height: 480 }}
          >
            {images.slice(0, 5).map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => openLightbox(i)}
                className={`bg-border/20 group relative cursor-zoom-in overflow-hidden focus:outline-none ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? listing.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                {/* "See all photos" overlay on the last shown image */}
                {i === 4 && images.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
                    +{images.length - 5} foto
                  </div>
                )}
              </button>
            ))}
            {/* Photo count badge */}
            <button
              type="button"
              onClick={() => openLightbox(0)}
              className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white hover:bg-black/80"
            >
              <span>📷</span> {images.length} foto
            </button>
          </div>
        ) : (
          <div className="bg-border/20 flex h-64 items-center justify-center rounded-xl text-6xl">
            🏠
          </div>
        )}

        {/* ── Main layout ─────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* Type badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${listing.listingType === 'SALE' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}
              >
                {listing.listingType === 'SALE' ? 'Shitje' : 'Qira'}
              </span>
              <span className="bg-surface border-border text-fg flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium">
                {listing.propertyType === 'APARTMENT' && <Building2 className="h-3 w-3" />}
                {['HOUSE', 'VILLA'].includes(listing.propertyType) && <Home className="h-3 w-3" />}
                {!['APARTMENT', 'HOUSE', 'VILLA'].includes(listing.propertyType) && (
                  <Layers className="h-3 w-3" />
                )}
                {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-fg mt-2 text-2xl font-bold leading-snug">{listing.title}</h1>

            {/* Address */}
            <div className="text-muted mt-1 flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{listing.region.name}</span>
              {listing.addressLine && <span>· {listing.addressLine}</span>}
            </div>

            {/* Price row */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <p className="text-fg text-3xl font-bold tabular-nums">{price}</p>
              {listing.rentPeriod && (
                <span className="text-muted text-base">
                  / {listing.rentPeriod === 'MONTH' ? 'muaj' : 'javë'}
                </span>
              )}
              {priceM2 && listing.listingType === 'SALE' && (
                <span className="text-muted text-sm">({priceM2}/m²)</span>
              )}
            </div>

            {/* ── Info reel ───────────────────────────────────────────────
                 Semantic <dl> with one cell per key fact.
                 gap-px + bg-border creates 1 px dividers between cells.
            ──────────────────────────────────────────────────────────── */}
            <dl className="bg-border border-border mt-5 flex flex-wrap gap-px overflow-hidden rounded-xl border">
              {/* Property type — always shown */}
              <div className="bg-surface flex min-w-[120px] flex-1 flex-col gap-2 px-5 py-4">
                <dt className="text-muted text-[10px] font-semibold uppercase tracking-widest">
                  Lloji i pronës
                </dt>
                <dd className="flex items-center gap-2">
                  <span className="text-fg">
                    {listing.propertyType === 'APARTMENT' && <Building2 className="h-5 w-5" />}
                    {['HOUSE', 'VILLA'].includes(listing.propertyType) && (
                      <Home className="h-5 w-5" />
                    )}
                    {!['APARTMENT', 'HOUSE', 'VILLA'].includes(listing.propertyType) && (
                      <Layers className="h-5 w-5" />
                    )}
                  </span>
                  <p className="text-fg text-sm font-semibold">
                    {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
                  </p>
                </dd>
              </div>

              {/* Bedrooms */}
              {listing.bedrooms != null && listing.bedrooms > 0 && (
                <div className="bg-surface flex min-w-[100px] flex-1 flex-col gap-2 px-5 py-4">
                  <dt className="text-muted text-[10px] font-semibold uppercase tracking-widest">
                    Dhoma gjumi
                  </dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-fg">
                      <Bed className="h-5 w-5" />
                    </span>
                    <p className="text-fg text-sm font-semibold">{listing.bedrooms}</p>
                  </dd>
                </div>
              )}

              {/* Bathrooms */}
              {listing.bathrooms != null && listing.bathrooms > 0 && (
                <div className="bg-surface flex min-w-[100px] flex-1 flex-col gap-2 px-5 py-4">
                  <dt className="text-muted text-[10px] font-semibold uppercase tracking-widest">
                    Banjo
                  </dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-fg">
                      <Bath className="h-5 w-5" />
                    </span>
                    <p className="text-fg text-sm font-semibold">{listing.bathrooms}</p>
                  </dd>
                </div>
              )}

              {/* Area */}
              {listing.areaM2 != null && (
                <div className="bg-surface flex min-w-[110px] flex-1 flex-col gap-2 px-5 py-4">
                  <dt className="text-muted text-[10px] font-semibold uppercase tracking-widest">
                    Sipërfaqja
                  </dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-fg">
                      <Maximize className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-fg text-sm font-semibold">{listing.areaM2} m²</p>
                    </div>
                  </dd>
                </div>
              )}

              {/* Floor */}
              {listing.floor != null && (
                <div className="bg-surface flex min-w-[100px] flex-1 flex-col gap-2 px-5 py-4">
                  <dt className="text-muted text-[10px] font-semibold uppercase tracking-widest">
                    Kati
                  </dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-fg">
                      <Layers className="h-5 w-5" />
                    </span>
                    <p className="text-fg text-sm font-semibold">
                      {listing.floor}
                      {listing.floorsTotal ? ` / ${listing.floorsTotal}` : ''}
                    </p>
                  </dd>
                </div>
              )}

              {/* Year built */}
              {listing.yearBuilt != null && (
                <div className="bg-surface flex min-w-[110px] flex-1 flex-col gap-2 px-5 py-4">
                  <dt className="text-muted text-[10px] font-semibold uppercase tracking-widest">
                    Viti i ndërtimit
                  </dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-fg">
                      <Calendar className="h-5 w-5" />
                    </span>
                    <p className="text-fg text-sm font-semibold">{listing.yearBuilt}</p>
                  </dd>
                </div>
              )}
            </dl>

            {/* Tabs */}
            <div className="border-border mt-8 flex gap-0 border-b">
              {(['overview', 'map'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'text-muted hover:text-fg border-transparent'
                  }`}
                >
                  {tab === 'overview' ? 'Detaje' : 'Harta'}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="mt-6 space-y-8">
                {/* Features */}
                {listing.featureKeys.length > 0 && (
                  <section>
                    <h2 className="text-fg mb-3 text-base font-semibold">Karakteristika</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.featureKeys.map((key) => {
                        const Icon = FEATURE_ICONS[key];
                        return (
                          <span
                            key={key}
                            className="border-border bg-surface text-fg inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm"
                          >
                            {Icon && (
                              <Icon className="text-fg h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                            )}
                            {FEATURE_LABELS[key] ?? key}
                          </span>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Description */}
                <section>
                  <h2 className="text-fg mb-3 text-base font-semibold">Përshkrimi</h2>
                  <p className="text-fg/80 whitespace-pre-line text-sm leading-7">
                    {listing.description}
                  </p>
                </section>

                {/* Property details table */}
                <section>
                  <h2 className="text-fg mb-3 text-base font-semibold">Të dhëna teknike</h2>
                  <dl className="divide-border divide-y text-sm">
                    {[
                      ['Lloji i pronës', PROPERTY_TYPE_LABELS[listing.propertyType]],
                      ['Lloji i transaksionit', listing.listingType === 'SALE' ? 'Shitje' : 'Qira'],
                      listing.areaM2 != null && ['Sipërfaqja', `${listing.areaM2} m²`],
                      listing.bedrooms != null &&
                        listing.bedrooms > 0 && ['Dhoma gjumi', listing.bedrooms],
                      listing.bathrooms != null &&
                        listing.bathrooms > 0 && ['Banjo', listing.bathrooms],
                      listing.floor != null && [
                        'Kati',
                        `${listing.floor}${listing.floorsTotal ? ` nga ${listing.floorsTotal}` : ''}`,
                      ],
                      listing.yearBuilt != null && ['Viti i ndërtimit', listing.yearBuilt],
                      listing.addressLine && ['Adresa', listing.addressLine],
                      ['Rajoni', listing.region.name],
                    ]
                      .filter(Boolean)
                      .map(([label, value]) => (
                        <div key={String(label)} className="flex justify-between gap-4 py-2.5">
                          <dt className="text-muted shrink-0">{label}</dt>
                          <dd className="text-fg text-right font-medium">{String(value)}</dd>
                        </div>
                      ))}
                  </dl>
                </section>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="mt-6">
                <div
                  className="border-border overflow-hidden rounded-xl border"
                  style={{ height: 400 }}
                >
                  <iframe
                    title="Harta e pronës"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.01},${listing.lat - 0.008},${listing.lng + 0.01},${listing.lat + 0.008}&layer=mapnik&marker=${listing.lat},${listing.lng}`}
                    style={{ border: 0 }}
                  />
                </div>
                <p className="text-muted mt-2 text-right text-xs">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${listing.lat}&mlon=${listing.lng}#map=15/${listing.lat}/${listing.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-fg underline"
                  >
                    Hap në OpenStreetMap ↗
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-80 lg:shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Price card */}
              <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-fg text-2xl font-bold tabular-nums">{price}</p>
                {listing.rentPeriod && (
                  <p className="text-muted text-sm">
                    / {listing.rentPeriod === 'MONTH' ? 'muaj' : 'javë'}
                  </p>
                )}
                {priceM2 && listing.listingType === 'SALE' && (
                  <p className="text-muted mt-0.5 text-xs">{priceM2} / m²</p>
                )}
                {/* Share & Save */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="border-border bg-surface text-fg hover:bg-border/30 flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    {copied ? 'Kopjuar!' : 'Ndaj'}
                  </button>
                  <button
                    type="button"
                    className="border-border bg-surface text-fg hover:bg-border/30 flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    Ruaj
                  </button>
                </div>
              </div>

              {/* Agent card */}
              <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  {(listing as any).ownerAvatarUrl ? (
                    <img
                      src={(listing as any).ownerAvatarUrl}
                      alt={listing.ownerName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="bg-primary/20 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                      aria-hidden="true"
                    ></div>
                  )}
                  <div>
                    <p className="text-fg text-sm font-semibold">{listing.ownerName}</p>
                    <p className="text-muted text-xs">Agjent / Pronar</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href="tel:+355691234567"
                    className="bg-primary text-primary-fg hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  >
                    <Phone className="h-4 w-4" /> Telefono
                  </a>
                </div>
              </div>

              {/* Contact form */}
              <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
                <h3 className="text-fg mb-4 text-sm font-semibold">Dërgo mesazh</h3>

                {(actionData as { success?: boolean } | null)?.success ? (
                  <p className="text-success text-sm">✓ Mesazhi u dërgua me sukses!</p>
                ) : (
                  <Form method="post" className="space-y-3">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <input
                      name="name"
                      required
                      placeholder="Emri juaj"
                      minLength={2}
                      className="border-border focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Email"
                      className="border-border focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Telefon (opsional)"
                      className="border-border focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    />
                    <textarea
                      name="message"
                      required
                      rows={3}
                      minLength={10}
                      placeholder={`Jam i interesuar për pronën "${listing.title}"…`}
                      className="border-border focus:ring-primary w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    />
                    {(actionData as { error?: string } | null)?.error && (
                      <p className="text-danger text-xs">
                        {(actionData as { error?: string })?.error}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="bg-primary text-primary-fg hover:bg-primary/90 w-full rounded-lg py-2.5 text-sm font-medium transition-colors"
                    >
                      Dërgo Mesazhin
                    </button>
                  </Form>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95" onClick={closeLightbox}>
          {/* Controls */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm opacity-70">
              {lightboxIdx + 1} / {images.length}
            </p>
            <p className="max-w-[60%] truncate text-center text-sm font-medium">{listing.title}</p>
            <button type="button" onClick={closeLightbox} className="p-1 hover:opacity-70">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main image */}
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIdx]!.url}
              alt={images[lightboxIdx]!.alt ?? listing.title}
              className="max-h-full max-w-full rounded object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          <div
            className="flex shrink-0 gap-2 overflow-x-auto px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setLightboxIdx(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded border-2 transition-colors ${i === lightboxIdx ? 'border-white' : 'border-white/20 opacity-60 hover:opacity-90'}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
