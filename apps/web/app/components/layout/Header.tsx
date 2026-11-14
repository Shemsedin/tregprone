import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

type HeaderNavItem = {
  label: string;
  to: string;
  variant?: 'text' | 'button';
  className?: string;
};

type HeaderProps = {
  lang: string;
  brandText?: string;
  brandTo?: string;
  brandClassName?: string;
  navItems?: HeaderNavItem[];
  backLink?: {
    to: string;
    label: string;
  };
  className?: string;
};

export function Header({
  lang,
  brandText = 'Tregprone',
  brandTo,
  brandClassName,
  navItems = [],
  backLink,
  className,
}: HeaderProps) {
  const rootClassName = ['border-border sticky top-0 z-40 border-b bg-white', className]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={rootClassName}>
      <div className="max-w-page mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          {backLink ? (
            <Link
              to={backLink.to}
              className="text-muted hover:text-fg flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="h-4 w-4" /> {backLink.label}
            </Link>
          ) : null}
          <Link
            to={brandTo ?? `/${lang}`}
            className={brandClassName ?? 'text-xl font-bold text-[#23206F]'}
          >
            {brandText}
          </Link>
        </div>

        {navItems.length > 0 ? (
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={`${item.label}-${item.to}`}
                to={item.to}
                className={
                  item.className ??
                  (item.variant === 'button'
                    ? 'bg-primary text-primary-fg hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium'
                    : 'text-muted hover:text-fg text-sm')
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
