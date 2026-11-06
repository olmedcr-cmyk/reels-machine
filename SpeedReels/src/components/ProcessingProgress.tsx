import { cn } from '@/lib/utils'

interface Props {
  percent: number              // 0..100
  label: string                // "Analizando el audio…"
  phaseIndex: number           // 0..3
  phaseCount: number           // 4
  className?: string
}

export function ProcessingProgress({ percent, label, phaseIndex, phaseCount, className }: Props) {
  return (
    <div className={cn('w-full space-y-5', className)}>
      {/* % grande */}
      <div className="flex items-baseline justify-between">
        <span className="text-[44px] font-bold tabular tracking-[-0.02em] text-hi leading-none">
          {percent}%
        </span>
        <span className="text-[11px] font-mono text-faint tabular">
          Fase {Math.min(phaseIndex + 1, phaseCount)} / {phaseCount}
        </span>
      </div>

      {/* Bar h-2 */}
      <div className="h-2 w-full bg-inset rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Mensaje humano */}
      <div className="flex items-center gap-2.5">
        <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[14px] font-medium text-hi">{label}…</span>
      </div>
    </div>
  )
}
