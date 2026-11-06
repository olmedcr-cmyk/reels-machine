// ── Tipos compartidos del pipeline ──────────────────────────

export type StageId =
  | 'upload'
  | 'extract'
  | 'silence'
  | 'energy'
  | 'acoustic'
  | 'transcribe'
  | 'novelty'
  | 'segments'
  | 'scout'
  | 'verify'
  | 'cut'
  | 'done'

export type StageStatus = 'idle' | 'running' | 'done' | 'error'

export interface Stage {
  id: StageId
  code: string         // 'EX-01' …
  label: string
  detail?: string
  status: StageStatus
  progress?: number    // 0..1
  estCostUsd?: number  // para mostrar ahorro de IA
}

export interface PipelineEvent {
  code: string
  detail?: string
  step?: StageId
}

export type ClipFormat = 'original' | 'vertical'
export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9'

export interface ReelConfig {
  numReels: number
  minDuration: number       // s
  maxDuration: number       // s
  format: ClipFormat
  aspect: AspectRatio
  burnSubtitles: boolean
  subtitleWordsPerLine: number
  drawTitle: boolean
  titlePosition: 'top' | 'center' | 'bottom'
  scoutModel: 'haiku' | 'sonnet'
  verifyModel: 'sonnet' | 'opus'
  silenceThresholdDb: number
  silenceMinDuration: number
}

export interface Reel {
  id: string
  index: number
  title: string
  hook: string
  reason: string
  start: number
  end: number
  score: number          // 0–10
  viralScore: number     // 0–1
  energy: number         // 0–1
  novelty: number        // 0–1
  pitch: number
  sentiment: number      // -1..1
  tags: string[]
  approved: boolean
  thumbColor: string     // for placeholder
  transcript: string
  /** Palabras clave que el director IA resalta en amarillo en los subtítulos */
  highlight?: string[]
}

export interface UploadedFile {
  jobId: string
  name: string
  size: number
  durationSec: number
  type: string
}
