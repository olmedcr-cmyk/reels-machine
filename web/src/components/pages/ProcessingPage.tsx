import { useEffect, useState } from 'react'
import { F } from '@/frekvens'
import { HUMAN_PHASES, summarize } from '@/lib/phases'
import type { Stage, StageStatus } from '@/lib/types'

interface Props {
  fileName: string
  durationSec?: number
  stages: Stage[]
  onCancel: () => void
  error?: string | null
  onRetry?: () => void
  onShowTechnical?: () => void
}

const DOTS = 40

/**
 * 02 · Procesando. Un número que manda (tiempo en Doto), una rejilla de puntos
 * que se llena y las tres fases con StateMark: aro · puntos · disco.
 * Mientras trabaja, Beam recorre el borde de la caja.
 */
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

  if (error) {
    return (
      <div className="flex flex-col min-h-full" style={{ gap: 'var(--space-6)', paddingTop: 'var(--space-6)' }}>
        <F.Text variant="display-xl" as="h1" sub={fileName}>No se pudo procesar</F.Text>
        <F.Banner tone="error" title="El análisis se detuvo">{error}</F.Banner>
        <div className="mt-auto flex flex-col" style={{ gap: 'var(--space-2)' }}>
          <F.KeyButton tone="klein" size="m" block icon="refresh" onClick={onRetry}>
            Probar con otro vídeo
          </F.KeyButton>
          {onShowTechnical && (
            <F.KeyButton tone="paper" size="s" block onClick={onShowTechnical}>
              Ver detalles técnicos
            </F.KeyButton>
          )}
        </div>
      </div>
    )
  }

  const eta = estimateRemaining(durationSec, summary.percent, elapsed)
  const filled = Math.round((summary.percent / 100) * DOTS)

  return (
    <div className="flex flex-col min-h-full" style={{ gap: 'var(--space-6)', paddingTop: 'var(--space-6)' }}>
      <F.Text variant="display-xl" as="h1" sub={fileName}>
        {summary.isDone ? 'Reels listos' : 'Creando reels'}
      </F.Text>

      <F.Beam active={!summary.isDone} tone="klein" radius={24} label="Analizando el vídeo">
        <section
          className="grid items-center"
          style={{
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
            gap: 'var(--space-6)',
            padding: 'var(--space-6)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div className="flex flex-col" style={{ gap: 'var(--space-4)' }}>
            <F.Readout
              size="hero"
              label="TRANSCURRIDO"
              value={formatMS(elapsed)}
              meta={eta ? `~${eta} RESTANTE` : summary.isDone ? 'HECHO' : 'CALCULANDO…'}
            />
            <F.DotGrid total={DOTS} filled={filled} columns={10} size={20} gap={8} tone="rams" label={`${summary.percent} % completado`} />
            <span className="frk-field__label" aria-hidden>{summary.percent} % · FASE {summary.phaseIndex + 1}/{summary.phaseCount}</span>
          </div>

          <ol className="flex flex-col" style={{ gap: 'var(--space-4)' }} aria-label="Fases">
            {HUMAN_PHASES.map((phase) => {
              const state = phaseState(phase.stages.map((id) => stages.find((s) => s.id === id)?.status))
              return (
                <li key={phase.key} style={{ color: state === 'empty' ? 'var(--ink-muted)' : 'var(--ink)' }}>
                  <F.StateMark state={state} size={28}>
                    <span style={{ font: '700 18px/24px var(--font-sans)', letterSpacing: '-0.01em' }}>
                      {phase.label}
                    </span>
                  </F.StateMark>
                </li>
              )
            })}
          </ol>
        </section>
      </F.Beam>

      <div className="mt-auto flex items-center flex-wrap" style={{ gap: 'var(--space-2)' }}>
        <F.KeyButton tone="paper" size="s" shape="pill" icon="close" onClick={onCancel}>
          Cancelar
        </F.KeyButton>
        {onShowTechnical && (
          <F.KeyButton tone="paper" size="s" shape="pill" icon="arrow-up-right" onClick={onShowTechnical}>
            Detalles técnicos
          </F.KeyButton>
        )}
        <span className="frk-field__label ml-auto">Puedes dejar esta página abierta</span>
      </div>
    </div>
  )
}

function phaseState(statuses: (StageStatus | undefined)[]): 'empty' | 'partial' | 'full' {
  const known = statuses.filter(Boolean)
  if (known.length && known.every((s) => s === 'done')) return 'full'
  if (known.some((s) => s === 'running' || s === 'done')) return 'partial'
  return 'empty'
}

function estimateRemaining(durationSec: number | undefined, percent: number, elapsed: number): string | null {
  if (percent <= 0 || percent >= 100) return null
  if (elapsed < 5) {
    if (!durationSec) return null
    return formatMS(Math.max(60, Math.round(durationSec * 0.18)))
  }
  const total = Math.round((elapsed / percent) * 100)
  return formatMS(Math.max(5, total - elapsed))
}

function formatMS(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
