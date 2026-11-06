import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-[9999px] border border-subtle',
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/50',
      'data-[state=checked]:bg-fg data-[state=unchecked]:bg-inset',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-[9999px] bg-base shadow-sm border border-subtle',
        'transition-transform data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-1',
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName
