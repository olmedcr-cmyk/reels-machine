import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-10 w-full rounded-[8px] border border-subtle bg-inset px-3',
        'text-[13px] text-hi placeholder:text-faint',
        'transition-colors focus-visible:outline-none focus-visible:border-strong',
        'focus-visible:ring-2 focus-visible:ring-fg/40 focus-visible:bg-base',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-hi',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
