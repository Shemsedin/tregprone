import type { Route } from './+types/sitemap[.]xml.js';

import { getListings } from '~/lib/api.js';

const BASE_URL = process.env['SITE_URL'] ?? 'https://tregprone.al';
const LOCALES = ['sq', 'sq-XK', 'sq-MK', 'en'];

export async function loader({ request }: Route.LoaderArgs) {
  const { items: listings } = await getListings({ limit: 100, sort: '-createdAt' });

  const staticPaths = [
    '',
    '/listings',
    '/auth/login',
    '/auth/register',
    '/legal/privacy',
    '/legal/terms',
  ];

  const urls: string[] = [];

  for (const locale of LOCALES) {
    for (const path of staticPaths) {
      urls.push(`
    <url>
      <loc>${BASE_URL}/${locale}${path}</loc>
      <changefreq>weekly</changefreq>
      <priority>${path === '' ? '1.0' : '0.7'}</priority>
    </url>`);
    }

    for (const listing of listings) {
      const lastModified = listing.publishedAt ?? listing.createdAt;

      urls.push(`
    <url>
      <loc>${BASE_URL}/${locale}/listings/${listing.slug}</loc>
      <lastmod>${lastModified.split('T')[0]}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
