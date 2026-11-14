import type { Config } from 'tailwindcss';
import tokens from '../../assets/design-tokens.json' with { type: 'json' };

// Tailwind preset built from the canonical design tokens.
// Imported by every workspace's tailwind.config.ts.

type T = typeof tokens;
const v = <K extends keyof T>(group: K) =>
  Object.fromEntries(
    Object.entries(tokens[group] as Record<string, { value: string | number | string[] }>).map(
      ([k, t]) => [k, t.value],
    ),
  );

const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        fg: 'var(--color-fg)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        footerBg: 'var(--color-footerBg)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          fg: 'var(--color-primary-fg)',
          hover: 'var(--color-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          fg: 'var(--color-accent-fg)',
        },
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
      },
      fontFamily: { sans: tokens.fontFamily.sans.value },
      fontSize: v('fontSize'),
      lineHeight: v('lineHeight'),
      letterSpacing: v('letterSpacing'),
      spacing: v('spacing'),
      borderRadius: v('radius'),
      boxShadow: v('shadow'),
      transitionDuration: v('motion').duration as never,
      transitionTimingFunction: v('motion').easing as never,
      maxWidth: { page: '1200px', narrow: '720px' },
      zIndex: v('z') as never,
    },
  },
  plugins: [],
};

export default preset;
