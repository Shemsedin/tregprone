import { Link, useLoaderData } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { Route } from './+types/($lang)._index.js';

import { getListings, getRegions } from '~/lib/api.js';
import { buildMeta } from '~/lib/seo.js';
import { buttonVariants, cn } from '@treg/ui';
import { PublicLayout } from '~/components/layout/PublicLayout.js';
import { HomeHeroSearch } from '~/components/home/HomeHeroSearch.js';
import { FeaturedCities } from '~/components/home/FeaturedCities.js';
import { HowItWorks } from '~/components/home/HowItWorks.js';
import { ListingCard } from '~/components/listings/ListingCard.js';

export const meta: Route.MetaFunction = ({ data }) => {
  const locale = (data as { locale?: string })?.locale ?? 'sq-AL';
  return buildMeta({
    title: 'Kreu',
    description:
      'Gjej pronën tënde të ëndrrave — apartamente, shtëpi, villa dhe tokë në Shqipëri, Kosovë dhe Maqedoni.',
    locale,
  });
};

export async function loader({ params }: Route.LoaderArgs) {
  const lang = params['lang'] ?? 'sq';

  const [listingsData, regionsData] = await Promise.all([
    getListings({ limit: 8, sort: '-createdAt' }),
    getRegions()
      .then((data) => ({ items: data.items, available: true as const }))
      .catch(() => ({ items: [], available: false as const })),
  ]);

  return {
    lang,
    listings: listingsData.items,
    regions: regionsData.items,
    regionLookupAvailable: regionsData.available,
  };
}

export default function HomePage() {
  const { lang, listings, regions, regionLookupAvailable } = useLoaderData<typeof loader>();

  return (
    <PublicLayout lang={lang}>
      <HomeHeroSearch lang={lang} regions={regions} regionLookupAvailable={regionLookupAvailable} />

      <FeaturedCities lang={lang} />

      {/* Latest Listings */}
      <section className="max-w-page mx-auto px-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="text-fg text-2xl font-bold">Listimet e fundit</h2>
          <Link
            to={`/${lang}/listings`}
            className={cn(buttonVariants({ variant: 'promotional' }), 'text-sm')}
          >
            Shiko të gjitha <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} lang={lang} />
          ))}
        </div>
      </section>

      <HowItWorks />
    </PublicLayout>
  );
}
