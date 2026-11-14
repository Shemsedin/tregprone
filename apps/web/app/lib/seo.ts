// SEO helpers
interface MetaOptions {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  locale?: string;
  alternates?: Array<{ hreflang: string; href: string }>;
}

export function buildMeta(opts: MetaOptions) {
  const title = `${opts.title} | tregprone`;
  const description =
    opts.description ??
    'Platforma kryesore e pronave për Shqipëri, Kosovë dhe Maqedoninë e Veriut.';
  const image = opts.image ?? '/og-default.png';

  const meta: Array<{
    name?: string;
    property?: string;
    content?: string;
    tagName?: string;
    rel?: string;
    href?: string;
  }> = [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:type', content: opts.type ?? 'website' },
    { property: 'og:locale', content: opts.locale ?? 'sq_AL' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];

  if (opts.canonical) {
    meta.push({ tagName: 'link', rel: 'canonical', href: opts.canonical });
  }

  if (opts.alternates) {
    for (const alt of opts.alternates) {
      meta.push({ tagName: 'link', rel: 'alternate', href: alt.href });
    }
  }

  return [{ title }, ...meta];
}

export function buildListingJsonLd(listing: {
  title: string;
  description: string;
  priceMinor: string | bigint;
  currency: string;
  lat: number;
  lng: number;
  images?: Array<{ url: string }>;
}) {
  const price = Number(listing.priceMinor) / 100;
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description,
    offers: { '@type': 'Offer', price, priceCurrency: listing.currency },
    geo: { '@type': 'GeoCoordinates', latitude: listing.lat, longitude: listing.lng },
    ...(listing.images?.length ? { image: listing.images.map((i) => i.url) } : {}),
  };
}
