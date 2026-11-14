import { Link } from 'react-router';

type FooterProps = {
  lang: string;
};

export function Footer({ lang }: FooterProps) {
  return (
    <footer className="bg-[#f5f5f4] py-[90px] text-[#1a2e3b]">
      <div className="mx-auto max-w-screen-xl px-5 xl:px-8 2xl:px-0">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6 pb-9">
          <span className="text-2xl font-bold tracking-tight text-[#1a2e3b]">tregprone</span>
          <div className="flex items-center gap-5 text-[#5c6b7a]">
            <a href="#" aria-label="Facebook" className="hover:text-[#1a2e3b]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.54V12h2.54v-2.2c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter / X" className="hover:text-[#1a2e3b]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.4 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622ZM17.083 20.25h1.833L7.084 4.126H5.117Z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-[#1a2e3b]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.851s-.012 3.585-.07 4.851c-.062 1.366-.333 2.633-1.308 3.608-.975.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308C2.497 19.467 2.226 18.2 2.163 16.834 2.105 15.568 2.093 15.188 2.093 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.446 2.567 5.713 2.296 7.079 2.233c1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.527.069-2.884.41-3.96 1.487C1.116 2.636.775 3.993.706 5.52.648 6.8.634 7.208.634 12s.014 5.2.072 6.48c.069 1.527.41 2.884 1.487 3.96 1.076 1.077 2.433 1.418 3.96 1.487 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.527-.069 2.884-.41 3.96-1.487 1.077-1.076 1.418-2.433 1.487-3.96.058-1.28.072-1.688.072-6.48s-.014-5.2-.072-6.48c-.069-1.527-.41-2.884-1.487-3.96-1.076-1.077-2.433-1.418-3.96-1.487C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324A6.162 6.162 0 0 0 12 5.838zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-[#1a2e3b]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-12">
          <div className="min-w-[260px] flex-1">
            <h3 className="mb-1 text-xl font-bold text-[#1a2e3b]">tregprone</h3>
            <p className="mb-6 text-sm text-[#5c6b7a]">
              Mënyra e thjeshtë për të kërkuar prona për blerje ose qira.
            </p>
            <div className="flex gap-12">
              <ul className="space-y-3 text-sm text-[#5c6b7a]">
                <li>
                  <Link
                    to={`/${lang}/property-to-buy`}
                    className="whitespace-nowrap hover:underline"
                  >
                    Prona për shitje
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${lang}/property-to-rent`}
                    className="whitespace-nowrap hover:underline"
                  >
                    Prona me qira
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Gjej agjentë
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Çmimet e shtëpive
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Vlerësimet
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Shtëpi të reja
                  </Link>
                </li>
              </ul>
              <ul className="space-y-3 text-sm text-[#5c6b7a]">
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Udhëzues
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Aplikacionet mobile
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Na kontaktoni
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Rreth nesh
                  </Link>
                </li>
                <li>
                  <Link to="#" className="whitespace-nowrap hover:underline">
                    Karriera
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="min-w-[200px]">
            <h3 className="mb-1 text-xl font-bold text-[#1a2e3b]">tregprone Expert</h3>
            <p className="mb-6 text-sm text-[#5c6b7a]">Faqe për profesionistët e pronave.</p>
            <ul className="space-y-3 text-sm text-[#5c6b7a]">
              <li>
                <Link to="#" className="whitespace-nowrap hover:underline">
                  Dëshmitë
                </Link>
              </li>
              <li>
                <Link to="#" className="whitespace-nowrap hover:underline">
                  Hyrja e anëtarëve
                </Link>
              </li>
              <li>
                <Link to="#" className="whitespace-nowrap hover:underline">
                  Bëhu anëtar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-[#dddbd8] pt-8">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#5c6b7a]">
            <Link to={`/${lang}/legal/terms`} className="hover:underline">
              Kushtet e përdorimit
            </Link>
            <span>|</span>
            <Link to={`/${lang}/legal/privacy`} className="hover:underline">
              Politika e privatësisë
            </Link>
            <span>|</span>
            <Link to="#" className="hover:underline">
              Politika e cookies
            </Link>
          </div>
          <div className="mt-1 text-xs text-[#5c6b7a]">© {new Date().getFullYear()} tregprone</div>
        </div>
      </div>
    </footer>
  );
}
