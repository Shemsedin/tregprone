import type { ReactNode } from 'react';
import { Header } from './Header.js';
import { Footer } from './Footer.js';

type HeaderNavItem = {
  label: string;
  to: string;
  variant?: 'text' | 'button';
  className?: string;
};

type PublicLayoutProps = {
  lang: string;
  children: ReactNode;
  /** Override nav items. Defaults to Prona + Hyr links. */
  navItems?: HeaderNavItem[];
  headerBackLink?: { to: string; label: string };
  headerBrandText?: string;
  headerBrandClassName?: string;
  headerClassName?: string;
  /** Show footer (default: true) */
  showFooter?: boolean;
};

export function PublicLayout({
  lang,
  children,
  navItems = [
    { label: 'Prona', to: `/${lang}/listings` },
    { label: 'Hyr', to: `/${lang}/auth/login` },
  ],
  headerBackLink,
  headerBrandText,
  headerBrandClassName,
  headerClassName,
  showFooter = true,
}: PublicLayoutProps) {
  return (
    <div className="bg-bg min-h-screen">
      <Header
        lang={lang}
        navItems={navItems}
        backLink={headerBackLink}
        brandText={headerBrandText}
        brandClassName={headerBrandClassName}
        className={headerClassName}
      />
      {children}
      {showFooter ? <Footer lang={lang} /> : null}
    </div>
  );
}
