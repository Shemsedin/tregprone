import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route(':lang', 'routes/($lang).tsx', [
    index('routes/($lang)._index.tsx'),
    route('favorites', 'routes/($lang).favorites.tsx'),
    route('legal/privacy', 'routes/($lang).legal.privacy.tsx'),
    route('legal/terms', 'routes/($lang).legal.terms.tsx'),
    route('listings', 'routes/($lang).listings._index.tsx'),
    route('property-to-buy', 'routes/($lang).property-to-buy.tsx'),
    route('property-to-rent', 'routes/($lang).property-to-rent.tsx'),
    route('listings/:slug', 'routes/($lang).listings.$slug.tsx'),
    route('auth/login', 'routes/($lang).auth.login.tsx'),
    route('auth/register', 'routes/($lang).auth.register.tsx'),
    route('auth/forgot', 'routes/($lang).auth.forgot.tsx'),
    route('auth/reset', 'routes/($lang).auth.reset.tsx'),
    route('account/listings', 'routes/($lang).account.listings.tsx'),
    route('account/listings/new', 'routes/($lang).account.listings.new.tsx'),
    route('account/listings/:id/edit', 'routes/($lang).account.listings.$id.edit.tsx'),
  ]),
  route('admin', 'routes/admin.tsx', [
    index('routes/admin._index.tsx'),
    route('listings', 'routes/admin.listings.tsx'),
    route('users', 'routes/admin.users.tsx'),
    route('audit', 'routes/admin.audit.tsx'),
  ]),
  route('sitemap.xml', 'routes/sitemap[.]xml.tsx'),
] satisfies RouteConfig;
