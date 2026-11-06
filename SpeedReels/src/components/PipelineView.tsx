import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from './ui/card'
import { Button } from './ui/button'
import type { Stage, StageStatus } from '@/lib/types'
import { PIPELINE_STAGES } from '@/lib/mock'
import type { Icon as PhIcon } from '@phosphor-icons/react'
import {
  Check, Spinner, X, Lightning, Clock, Pulse,
} from '@phosphor-icons/react'

interface Props {
  jobName: string
  durationSec: number
  externalStages: Stage[] | null
  onCancel: () => void
  onComplete: () => void
}

export function PipelineView({ jobName, durationSec, externalStages, onCancel, onComplete }: Props) {
  const [stages, setStages] = useState<Stage[]>(PIPELINE_STAGES)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (externalStages) { setStages(externalStages); return }
    let i = 0
    setStages((arr) => arr.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'running' as StageStatus : 'idle' as StageStatus,
    })))
    const tick = setInterval(() => {
      setStages((arr) => {
        const next = [...arr]
        if (i < next.length) {
          next[i] = { ...next[i], status: 'done', progress: 1 }
          if (i + 1 < next.length) next[i + 1] = { ...next[i + 1], status: 'running', progress: 0.4 }
          i += 1
        } else {
          clearInterval(tick)
          setTimeout(() => onComplete(), 600)
        }
        return next
      })
    }, 900)
    const elapsedTick = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => { clearInterval(tick); clearInterval(elapsedTick) }
  }, [externalStages, onComplete])

  const total = stages.length
  const doneCount = stages.filter((s) => s.status === 'done').length
  const runningStage = stages.find((s) => s.status === 'running')
  const overall = doneCount / total
  const aiSpent = stages.filter((s) => s.status === 'done').reduce((acc, s) => acc + (s.estCostUsd ?? 0), 0)
  const aiTotal = stages.reduce((acc, s) => acc + (s.estCostUsd ?? 0), 0)

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6 w-full">
        {/* Header */}
        <header className="flex items-center justify-between gap-6">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className="eyebrow-md">06 · Pipeline</span>
              <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-[3px] bg-green text-white font-mono text-[8px] font-bold tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                LIVE
              </span>
            </div>
            <h1 className="text-[20px] font-bold tracking-[-0.012em] text-hi truncate">
              {jobName}
            </h1>
          </div>
          <Button variant="outline" size="md" onClick={onCancel}>
            <X size={12} />
            Cancelar
          </Button>
        </header>

        {/* 3 stats compactas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard
            icon={Pulse}
            eyebrow="Progreso"
            value={`${Math.round(overall * 100)}%`}
            unit={`${doneCount} / ${total} fases`}
            footer={
              <div className="score-track h-1">
                <div className="score-fill" style={{ width: `${overall * 100}%` }} />
              </div>
            }
          />
          <StatCard
            icon={Clock}
            eyebrow="Tiempo"
            value={formatHMS(elapsed)}
            unit={`/ ~${formatHMS(estimateTotal(durationSec))} estimado`}
          />
          <StatCard
            icon={Lightning}
            eyebrow="Coste IA"
            value={`$${aiSpent.toFixed(2)}`}
            unit={`/ $${aiTotal.toFixed(2)} máx`}
            footer={
              <div className="score-track h-1">
                <div
                  className="score-fill"
                  style={{ width: `${(aiSpent / Math.max(aiTotal, 0.0001)) * 100}%` }}
                />
              </div>
            }
          />
        </div>

        {/* Phases */}
        <Card className="p-5">
          <header className="flex items-center justify-between mb-5">
            <div className="space-y-0.5">
              <div className="eyebrow">Fases del pipeline</div>
              <h2 className="text-[14px] font-semibold tracking-tight text-hi">
                {runningStage ? `Trabajando: ${runningStage.label}` : 'Pipeline detenido'}
              </h2>
            </div>
            <span className="font-mono text-[11px] tabular text-dim">
              {doneCount} / {total}
            </span>
          </header>

          <ul className="space-y-0.5">
            {stages.map((s, i) => (
              <StageRow key={s.id} stage={s} index={i} isLast={i === stages.length - 1} />
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon: I, eyebrow, value, unit, footer,
}: {
  icon: PhIcon
  eyebrow: string
  value: string
  unit?: string
  footer?: React.ReactNode
}) {
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{eyebrow}</span>
        <I size={13} className="text-faint" />
      </div>
      <div className="space-y-0.5">
        <div className="text-[24px] font-bold tabular tracking-[-0.02em] leading-none text-hi">
          {value}
        </div>
        {unit && <div className="text-[11px] font-mono text-faint">{unit}</div>}
      </div>
      {footer}
    </Card>
  )
}

function StageRow({ stage, index, isLast }: { stage: Stage; index: number; isLast: boolean }) {
  return (
    <li className={cn('flex items-start gap-4 py-3', !isLast && 'border-b border-hairline')}>
      <div className="relative flex flex-col items-center pt-0.5">
        <StageDot status={stage.status} index={index} />
        {!isLast && (
          <span className={cn('mt-1.5 w-px h-7', stage.status === 'done' ? 'bg-hi' : 'bg-hairline')} />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[9px] tracking-wider font-semibold text-faint">{stage.code}</span>
          <span
            className={cn(
              'text-[13px] font-medium tracking-tight',
              stage.status === 'idle' ? 'text-dim' : 'text-hi',
            )}
          >
            {stage.label}
          </span>
          {stage.status === 'running' && (
            <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-[3px] bg-yellow text-hi font-mono text-[8px] font-bold tracking-wider uppercase">
              <span className="live-dot" style={{ background: 'var(--tx-hi)' }} />
              Procesando
            </span>
          )}
          {stage.status === 'done' && (
            <span className="pill-mono">
              <Check size={9} weight="bold" />
              Listo
            </span>
          )}
        </div>
        {stage.detail && <p className="text-[11px] text-dim">{stage.detail}</p>}
        {stage.status === 'running' && (
          <div className="score-track">
            <div
              className="score-fill score-fill--accent"
              style={{ width: `${(stage.progress ?? 0.4) * 100}%` }}
            />
          </div>
        )}
      </div>

      {stage.estCostUsd != null && stage.estCostUsd > 0 && (
        <span className="font-mono text-[10px] tabular text-faint pt-0.5 shrink-0">
          ${stage.estCostUsd.toFixed(2)}
        </span>
      )}
    </li>
  )
}

function StageDot({ status, index }: { status: StageStatus; index: number }) {
  if (status === 'done') return (
    <span className="h-6 w-6 rounded-[6px] bg-primary text-primary-foreground flex items-center justify-center">
      <Check size={11} weight="bold" />
    </span>
  )
  if (status === 'running') return (
    <span className="h-6 w-6 rounded-[6px] bg-yellow text-hi flex items-center justify-center">
      <Spinner size={11} weight="bold" className="animate-spin" />
    </span>
  )
  if (status === 'error') return (
    <span className="h-6 w-6 rounded-[6px] bg-base border border-hi text-hi flex items-center justify-center">
      <X size={11} weight="bold" />
    </span>
  )
  return (
    <span className="h-6 w-6 rounded-[6px] bg-base border border-subtle text-faint flex items-center justify-center font-mono text-[10px] tabular">
      {String(index + 1).padStart(2, '0')}
    </span>
  )
}

function estimateTotal(secs: number) {
  return Math.max(60, Math.round(secs * 0.18))
}

function formatHMS(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
