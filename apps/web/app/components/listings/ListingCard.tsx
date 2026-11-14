import { MapPin } from 'lucide-react';
import { Link } from 'react-router';
import type { ListingSummary } from '@treg/types';

type ListingCardProps = {
  listing: ListingSummary;
  lang: string;
  variant?: 'grid' | 'list';
  showListingTypeBadge?: boolean;
};

export function ListingCard({
  listing,
  lang,
  variant = 'grid',
  showListingTypeBadge = true,
}: ListingCardProps) {
  const price = new Intl.NumberFormat('sq-AL', {
    style: 'currency',
    currency: listing.currency,
    maximumFractionDigits: 0,
  }).format(Number(listing.priceMinor) / 100);

  if (variant === 'list') {
    return (
      <Link
        to={`/${lang}/listings/${listing.slug}`}
        className="border-border bg-surface shadow-card hover:shadow-pop group flex gap-4 overflow-hidden rounded-lg border p-4 transition-shadow"
      >
        <div className="bg-border/30 relative h-40 w-40 shrink-0 overflow-hidden rounded">
          {listing.coverImage ? (
            <img
              src={listing.coverImage.url}
              alt={listing.coverImage.alt ?? listing.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl">🏠</div>
          )}
          {showListingTypeBadge ? (
            <span
              className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${listing.listingType === 'SALE' ? 'bg-primary' : 'bg-accent'}`}
            >
              {listing.listingType === 'SALE' ? 'Shitje' : 'Qira'}
            </span>
          ) : null}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-fg line-clamp-2 text-lg font-bold">{listing.title}</h3>
              <div className="text-muted mt-1 flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4" />
                {listing.region.name}
              </div>
            </div>
            <p className="text-fg ml-4 whitespace-nowrap text-lg font-bold tabular-nums">{price}</p>
          </div>

          <div className="text-muted mt-3 flex flex-wrap gap-3 text-sm">
            {listing.bedrooms != null && <span>{listing.bedrooms} dhoma</span>}
            {listing.bathrooms != null && <span>· {listing.bathrooms} banjo</span>}
            {listing.areaM2 != null && <span>· {listing.areaM2} m²</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/${lang}/listings/${listing.slug}`}
      className="border-border bg-surface shadow-card hover:shadow-pop group overflow-hidden rounded-lg border transition-shadow"
    >
      <div className="bg-border/30 relative aspect-[4/3] overflow-hidden">
        {listing.coverImage ? (
          <img
            src={listing.coverImage.url}
            alt={listing.coverImage.alt ?? listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="text-muted flex h-full items-center justify-center">📷</div>
        )}
        {showListingTypeBadge ? (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${listing.listingType === 'SALE' ? 'bg-primary' : 'bg-accent'}`}
          >
            {listing.listingType === 'SALE' ? 'Shitje' : 'Qira'}
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <p className="text-fg text-xl font-bold tabular-nums">
          {price}
          {listing.rentPeriod ? (
            <span className="text-muted ml-1 text-sm font-normal">
              /
              {listing.rentPeriod === 'MONTH'
                ? 'muaj'
                : listing.rentPeriod === 'WEEK'
                  ? 'javë'
                  : 'ditë'}
            </span>
          ) : null}
        </p>
        <h3 className="text-fg mt-1 line-clamp-2 text-sm font-medium">{listing.title}</h3>
        <div className="text-muted mt-2 flex flex-wrap gap-2 text-xs">
          {listing.bedrooms != null && <span>{listing.bedrooms} dhoma</span>}
          {listing.bathrooms != null && <span>· {listing.bathrooms} banjo</span>}
          {listing.areaM2 != null && <span>· {listing.areaM2} m²</span>}
        </div>
        <div className="text-muted mt-2 flex items-center gap-1 text-xs">
          <MapPin className="h-3 w-3" />
          <span>{listing.region.name}</span>
        </div>
      </div>
    </Link>
  );
}
