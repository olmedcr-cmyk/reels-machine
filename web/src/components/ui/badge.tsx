import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 h-6 px-2 rounded-[8px] text-[11px] font-medium tracking-tight border',
  {
    variants: {
      variant: {
        neutral:  'bg-inset text-mid border-subtle',
        outline:  'bg-transparent text-mid border-subtle',
        solid:    'bg-hi text-base border-hi',
        accent:   'bg-fg-soft text-fg-text border-[var(--fg-soft-bd)]',
        accentSolid: 'bg-fg text-fg-text border-[var(--fg-lo)]',
        ghost:    'bg-transparent text-dim border-transparent',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
