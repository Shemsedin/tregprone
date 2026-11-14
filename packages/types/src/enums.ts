export const LOCALE = ['sq-AL', 'sq-XK', 'sq-MK', 'en'] as const;
export type Locale = (typeof LOCALE)[number];

export const CURRENCY = ['ALL', 'EUR', 'MKD', 'USD'] as const;
export type Currency = (typeof CURRENCY)[number];

export const LISTING_TYPE = ['SALE', 'RENT'] as const;
export type ListingType = (typeof LISTING_TYPE)[number];

export const PROPERTY_TYPE = [
  'APARTMENT',
  'HOUSE',
  'VILLA',
  'STUDIO',
  'LAND',
  'COMMERCIAL',
  'OFFICE',
  'GARAGE',
  'OTHER',
] as const;
export type PropertyType = (typeof PROPERTY_TYPE)[number];

export const LISTING_STATUS = [
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'SOLD',
  'RENTED',
  'ARCHIVED',
] as const;
export type ListingStatus = (typeof LISTING_STATUS)[number];

export const USER_ROLE = ['USER', 'AGENT', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLE)[number];

export const RENT_PERIOD = ['MONTH', 'WEEK', 'DAY'] as const;
export type RentPeriod = (typeof RENT_PERIOD)[number];
