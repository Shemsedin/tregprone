import { useLoaderData, data } from 'react-router';
import { Link } from 'react-router';
import type { Route } from './+types/($lang).legal.terms.js';
import { buildMeta } from '~/lib/seo.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Kushtet e Shërbimit' });

export function loader({ params }: Route.LoaderArgs) {
  return data({ lang: params['lang'] ?? 'sq' });
}

export default function TermsOfServicePage() {
  const { lang } = useLoaderData<typeof loader>();

  return (
    <div className="bg-bg min-h-screen">
      <header className="border-border border-b bg-white">
        <div className="max-w-page mx-auto flex items-center gap-4 px-4 py-3">
          <Link to={`/${lang}`} className="text-primary text-xl font-bold">
            Treg Prone
          </Link>
        </div>
      </header>

      <main className="max-w-narrow prose prose-slate mx-auto px-4 py-12">
        <h1>Kushtet e Shërbimit</h1>
        <p>
          <strong>Data e hyrjes në fuqi:</strong> 1 Janar 2025
        </p>

        <h2>1. Pranimi i kushteve</h2>
        <p>
          Duke përdorur Treg Prone, pranoni këto kushte. Nëse nuk pajtoheni, mos e përdorni
          platformën.
        </p>

        <h2>2. Shërbimi</h2>
        <p>
          Treg Prone është platformë reklamimi pronash. Nuk garantojmë përfundimin e transaksioneve.
        </p>

        <h2>3. Llogaritë</h2>
        <ul>
          <li>Duhet të jeni të paktën 18 vjeç</li>
          <li>Jeni përgjegjës për sigurinë e llogarisë suaj</li>
          <li>Ndalim llogaritë false ose mashtrimin</li>
        </ul>

        <h2>4. Listingjet</h2>
        <p>
          Listingjet duhet të jenë të sakta dhe ligjore. Rezervojmë të drejtën të heqim çdo listim
          që shkel këto kushte.
        </p>

        <h2>5. Pronësia intelektuale</h2>
        <p>
          Të gjitha imazhet dhe përmbajtja e ngarkuar nga ju mbeten pronë juaj. Jepni tregprone
          licencë të limituar për të shfaqur përmbajtjen.
        </p>

        <h2>6. Kufizimi i përgjegjësisë</h2>
        <p>
          tregprone nuk mban përgjegjësi për humbjet financiare nga transaksionet e bëra nëpërmjet
          platformës.
        </p>

        <h2>7. Ligji i zbatueshëm</h2>
        <p>Këto kushte rregullohen nga ligjet e Republikës së Shqipërisë.</p>

        <h2>8. Kontakti</h2>
        <p>
          <a href="mailto:legal@tregprone.dev">legal@tregprone.dev</a>
        </p>
      </main>
    </div>
  );
}
