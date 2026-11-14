import { MapPin } from 'lucide-react';
import { Link } from 'react-router';

const CITIES = [
  { name: 'Tiranë', slug: 'tirane', country: 'AL' },
  { name: 'Prishtinë', slug: 'prishtine', country: 'XK' },
  { name: 'Shkup', slug: 'shkup', country: 'MK' },
  { name: 'Durrës', slug: 'durres', country: 'AL' },
  { name: 'Vlorë', slug: 'vlore', country: 'AL' },
  { name: 'Prizren', slug: 'prizren', country: 'XK' },
];

type FeaturedCitiesProps = {
  lang: string;
};

export function FeaturedCities({ lang }: FeaturedCitiesProps) {
  return (
    <section className="max-w-page mx-auto px-4 py-12">
      <h2 className="text-fg text-2xl font-bold">Qytetet kryesore</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {CITIES.map((city) => (
          <Link
            key={city.slug}
            to={`/${lang}/listings?regionId=${city.slug}`}
            className="border-border bg-surface hover:border-primary hover:shadow-card flex flex-col items-center gap-2 rounded-lg border p-4 transition-all"
          >
            <MapPin className="text-primary h-6 w-6" />
            <span className="text-fg text-sm font-medium">{city.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
