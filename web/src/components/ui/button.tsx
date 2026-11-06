import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold select-none transition-[background,color,border-color,box-shadow,transform]",
    "duration-150 focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-primary/40 focus-visible:ring-offset-2 ring-offset-base",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "[&_svg]:shrink-0",
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border border-primary hover:bg-[var(--primary-bg-hi)]",
        secondary:
          "bg-base text-hi border border-subtle hover:bg-hover",
        ghost:
          "bg-transparent text-mid hover:bg-hover hover:text-hi",
        outline:
          "bg-transparent text-hi border border-subtle hover:border-strong hover:bg-hover",
        link:
          "bg-transparent text-hi underline underline-offset-4 hover:text-mid",
        accent:
          "bg-yellow text-hi border border-yellow hover:opacity-90",
      },
      size: {
        sm:  "h-7 px-2.5 rounded-[5px] text-[11px]",
        md:  "h-8 px-3 rounded-[7px] text-[12px]",
        lg:  "h-9 px-3.5 rounded-[7px] text-[12px]",
        xl:  "h-10 px-4 rounded-[7px] text-[13px]",
        icon:"h-8 w-8 rounded-[7px]",
        iconSm:"h-7 w-7 rounded-[5px]",
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
