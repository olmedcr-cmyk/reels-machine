import type { Icon as PhIcon, IconProps } from '@phosphor-icons/react'
import { cn } from './utils'

/**
 * Wrapper de iconografía Phosphor con weight unificado y tamaño consistente.
 * Tamaño por defecto 16, weight "regular". Usar weight="duotone" sólo en hero.
 */
export function Icon({
  as: Component,
  size = 16,
  weight = 'regular',
  className,
  ...rest
}: { as: PhIcon } & Omit<IconProps, 'ref'>) {
  return (
    <Component
      size={size}
      weight={weight}
      className={cn('shrink-0', className)}
      {...rest}
    />
  )
}
