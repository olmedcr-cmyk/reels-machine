import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { HUMAN_PHASES, summarize } from '@/lib/phases'
import type { Stage } from '@/lib/types'
import { X, FileVideo, Clock, Check } from '@phosphor-icons/react'

interface Props {
  fileName: string
  durationSec?: number
  stages: Stage[]
  onCancel: () => void
  error?: string | null
  onRetry?: () => void
  onShowTechnical?: () => void
}

export function ProcessingPage({
  fileName, durationSec, stages, onCancel, error, onRetry, onShowTechnical,
}: Props) {
  const summary = summarize(stages)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (error || summary.isDone) return
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(tick)
  }, [error, summary.isDone])

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="w-full max-w-[520px] space-y-6 text-center">
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-hi leading-tight">
            No pudimos procesar este video
          </h1>
          <p className="text-[13px] text-dim leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" size="lg" onClick={onRetry}>
              Intentar con otro video
            </Button>
            {onShowTechnical && (
              <Button variant="ghost" size="lg" onClick={onShowTechnical}>
                Ver detalles técnicos
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Working state ──────────────────────────────────────────
  const eta = estimateRemaining(durationSec, summary.percent, elapsed)

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] space-y-8">

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-hi leading-tight">
            Creando tus reels…
          </h1>
          <div className="inline-flex items-center gap-2 rounded-[7px] bg-inset border border-subtle px-3 py-1.5 max-w-full">
            <FileVideo size={12} className="text-faint shrink-0" />
            <span className="text-[12px] text-mid truncate font-medium">{fileName}</span>
          </div>
        </div>

        {/* Stage list */}
        <div className="rounded-[14px] border border-subtle bg-base overflow-hidden">
          {HUMAN_PHASES.map((phase) => {
            const phaseStages = stages.filter((s) => phase.stages.includes(s.id))
            const isDone = phaseStages.length > 0 && phaseStages.every((s) => s.status === 'done')
            const isRunning = !isDone && phaseStages.some((s) => s.status === 'running')

            return (
              <div
                key={phase.key}
                className="flex items-center gap-4 px-5 h-14 border-b border-hairline last:border-0"
              >
                {/* Icon */}
                <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                  {isDone ? (
                    <Check size={14} weight="bold" className="text-green" />
                  ) : isRunning ? (
                    <span className="live-dot" />
                  ) : (
                    <span className="block h-[5px] w-[5px] rounded-full bg-subtle" />
                  )}
                </div>

                {/* Label */}
                <span
                  className="flex-1 text-[13px] font-medium"
                  style={{
                    color: isDone
                      ? 'var(--tx-dim)'
                      : isRunning
                        ? 'var(--tx-hi)'
                        : 'var(--tx-faint)',
                  }}
                >
                  {phase.label}
                </span>

                {/* Running indicator */}
                {isRunning && (
                  <span className="font-mono text-[10px] text-faint">en proceso</span>
                )}
                {isDone && (
                  <span className="font-mono text-[10px] text-faint">listo</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer row: elapsed + eta */}
        <div className="flex items-center justify-between text-[11px] font-mono text-faint px-1">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={11} />
            {formatHMS(elapsed)} transcurrido
          </span>
          {eta && <span className="tabular">~{eta} restantes</span>}
        </div>

        <p className="text-[12px] text-faint leading-relaxed text-center">
          Podés dejar esta página abierta mientras procesamos.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="md" onClick={onCancel}>
            <X size={12} />
            Cancelar
          </Button>
          {onShowTechnical && (
            <Button variant="link" size="md" onClick={onShowTechnical}>
              Ver detalles técnicos
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function estimateRemaining(durationSec: number | undefined, percent: number, elapsed: number): string | null {
  if (percent <= 0 || percent >= 100) return null
  if (elapsed < 5) {
    if (!durationSec) return null
    const total = Math.max(60, Math.round(durationSec * 0.18))
    return formatHMS(total)
  }
  const total = Math.round((elapsed / percent) * 100)
  const remaining = Math.max(5, total - elapsed)
  return formatHMS(remaining)
}

function formatHMS(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
