import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils.js';

/**
 * CVA variant map for `<Button>`.
 *
 * **Variants**
 * | variant       | appearance                                              |
 * |---------------|---------------------------------------------------------|
 * | `primary`     | Filled indigo — default CTA                            |
 * | `secondary`   | Lavender tint with indigo border and text              |
 * | `ghost`       | Transparent with subtle hover background               |
 * | `danger`      | Filled red — destructive actions                       |
 * | `link`        | Inline text link (no box model)                        |
 * | `promotional` | Animated underline text link for marketing CTAs        |
 *
 * **Sizes** — `sm` · `md` (default) · `lg` · `icon`
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-fg hover:bg-primary-hover active:scale-[0.98]',
        secondary:
          'bg-[#F0EFF9] text-[#494ACC] border border-[#C9C8EA] hover:bg-[#E5E4F5] active:scale-[0.98]',
        ghost: 'text-fg hover:bg-border/40',
        danger: 'bg-danger text-white hover:bg-danger/90 active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
        promotional:
          'text-primary font-semibold h-auto p-0 gap-1 hover:gap-2.5 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /**
   * When `true`, the button renders as a `Slot` rather than a `<button>` element,
   * merging its props onto the immediate child (e.g. a router `<Link>`).
   * Currently a placeholder — wire up Radix `Slot` if needed.
   */
  asChild?: boolean;
}

/**
 * General-purpose button component.
 *
 * @example
 * // Primary CTA
 * <Button>Shpall pronën</Button>
 *
 * @example
 * // Secondary, small
 * <Button variant="secondary" size="sm">Ruaj</Button>
 *
 * @example
 * // Danger action
 * <Button variant="danger">Fshi</Button>
 *
 * @example
 * // Icon-only (pair with an `aria-label`)
 * <Button variant="ghost" size="icon" aria-label="Share">
 *   <Share2 />
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
