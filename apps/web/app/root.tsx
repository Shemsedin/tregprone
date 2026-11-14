import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from 'react-router';
import type { Route } from './+types/root.js';

import tailwindStyles from './styles/tailwind.css?url';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  },
  { rel: 'stylesheet', href: tailwindStyles },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
];

export async function loader({ request }: Route.LoaderArgs) {
  // Try to get logged-in user from cookie
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const sessionMatch = cookieHeader.match(/ts_session=([^;]+)/);
  const token = sessionMatch?.[1];

  let user = null;
  if (token) {
    try {
      const apiUrl = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { user: unknown };
        user = data.user;
      }
    } catch {
      // Session may be expired — not a fatal error
    }
  }

  return {
    user,
    ENV: {
      PUBLIC_APP_URL: process.env['PUBLIC_APP_URL'] ?? 'http://localhost:3000',
      PUBLIC_API_URL: process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000',
      PUBLIC_MAP_STYLE_URL: process.env['PUBLIC_MAP_STYLE_URL'] ?? '',
    },
  };
}

export function useUser() {
  const data = useRouteLoaderData<typeof loader>('root');
  return data?.user as Record<string, string> | null | undefined;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-bg text-fg">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  if (error instanceof Error) {
    details = error.message;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-danger text-2xl font-bold">{message}</h1>
      <p className="text-muted mt-2">{details}</p>
    </main>
  );
}
