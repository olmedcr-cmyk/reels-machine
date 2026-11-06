// Mapeo de fases técnicas del pipeline → mensajes humanos para usuario final.
// El backend emite eventos con códigos como EX-01, AI-01, CT-01 — los agrupamos
// en 4 fases narrativas que sí son comprensibles.

import type { Stage, StageId } from './types'

export type HumanPhaseKey = 'audio' | 'moments' | 'select'

export interface HumanPhase {
  key: HumanPhaseKey
  label: string
  stages: StageId[]
}

export const HUMAN_PHASES: HumanPhase[] = [
  { key: 'audio',   label: 'Analizando el audio',                       stages: ['extract', 'silence', 'energy', 'acoustic'] },
  { key: 'moments', label: 'Detectando los mejores momentos',           stages: ['transcribe', 'novelty', 'segments'] },
  { key: 'select',  label: 'Seleccionando los clips más prometedores',  stages: ['scout', 'verify', 'cut'] },
]

/** Devuelve la fase humana en la que cae un stageId, o 'export' si no se encuentra. */
export function phaseOf(stageId: StageId): HumanPhase {
  return HUMAN_PHASES.find((p) => p.stages.includes(stageId)) ?? HUMAN_PHASES[HUMAN_PHASES.length - 1]
}

/**
 * Resume el progreso del pipeline en términos humanos: cuál es la fase actual
 * y qué porcentaje global llevamos.
 */
export interface PipelineSummary {
  currentLabel: string
  percent: number             // 0..100
  isDone: boolean
  isRunning: boolean
  phaseIndex: number          // 0..3
  phaseCount: number          // 4
}

export function summarize(stages: Stage[]): PipelineSummary {
  if (!stages.length) {
    return {
      currentLabel: HUMAN_PHASES[0].label,
      percent: 0,
      isDone: false,
      isRunning: false,
      phaseIndex: 0,
      phaseCount: HUMAN_PHASES.length,
    }
  }

  const total = stages.length
  const doneCount = stages.filter((s) => s.status === 'done').length
  const runningStage = stages.find((s) => s.status === 'running')
  const allDone = doneCount === total

  const activeStage = runningStage ?? (allDone ? stages[stages.length - 1] : stages[doneCount])
  const phase = activeStage ? phaseOf(activeStage.id) : HUMAN_PHASES[0]
  const phaseIndex = HUMAN_PHASES.findIndex((p) => p.key === phase.key)

  // Suavizamos: stage progress dentro de la fase activa contribuye un poco.
  const baseFraction = doneCount / total
  const runningBoost = runningStage ? (runningStage.progress ?? 0.4) / total : 0
  const fraction = Math.min(1, baseFraction + runningBoost * 0.6)

  return {
    currentLabel: allDone ? 'Listo' : phase.label,
    percent: Math.round(fraction * 100),
    isDone: allDone,
    isRunning: !!runningStage,
    phaseIndex: Math.max(0, phaseIndex),
    phaseCount: HUMAN_PHASES.length,
  }
}
