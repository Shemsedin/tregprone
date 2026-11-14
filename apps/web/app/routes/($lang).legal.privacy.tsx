import { useLoaderData, data } from 'react-router';
import { Link } from 'react-router';
import type { Route } from './+types/($lang).legal.privacy.js';
import { buildMeta } from '~/lib/seo.js';

export const meta: Route.MetaFunction = () => buildMeta({ title: 'Politika e Privatësisë' });

export function loader({ params }: Route.LoaderArgs) {
  return data({ lang: params['lang'] ?? 'sq' });
}

export default function PrivacyPolicyPage() {
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
        <h1>Politika e Privatësisë</h1>
        <p>
          <strong>Data e hyrjes në fuqi:</strong> 1 Janar 2025
        </p>

        <h2>1. Të dhënat që mbledhim</h2>
        <p>
          Mbledhim informacionin që ju jepni drejtpërdrejt, si emrin, adresën email, numrin e
          telefonit dhe informacionin e pronave.
        </p>

        <h2>2. Si i përdorim të dhënat</h2>
        <ul>
          <li>Të ofrojmë dhe përmirësojmë shërbimin tonë</li>
          <li>Të komunikojmë me ju rreth listimeve dhe shërbimeve</li>
          <li>Të sigurojmë sigurinë e platformës</li>
        </ul>

        <h2>3. Ndarja e të dhënave</h2>
        <p>
          Nuk ndajmë të dhënat tuaja personale me palë të treta pa miratimin tuaj, me përjashtim kur
          kërkohet me ligj.
        </p>

        <h2>4. Siguria</h2>
        <p>Zbatojmë masa teknike dhe organizative të duhura për të mbrojtur të dhënat tuaja.</p>

        <h2>5. Të drejtat tuaja (GDPR)</h2>
        <p>
          Ju keni të drejtë të aksesoni, ndreqni dhe fshini të dhënat tuaja personale. Kontaktoni{' '}
          <strong>privacy@tregprone.dev</strong>.
        </p>

        <h2>6. Kontakti</h2>
        <p>
          Për çdo pyetje: <a href="mailto:privacy@tregprone.dev">privacy@tregprone.dev</a>
        </p>
      </main>
    </div>
  );
}
