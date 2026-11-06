import type { Reel, ReelConfig, UploadedFile } from './types'
import { loadSettings } from './settings'

// ── helpers ─────────────────────────────────────────────────

function base() {
  return loadSettings().apiBaseUrl || '/api'
}

function modelId(scout: ReelConfig['scoutModel'], verify: ReelConfig['verifyModel']): string {
  // Backend espera UN model identifier. Si está en two-pass, usa Verify; Scout va aparte.
  if (verify === 'opus') return 'claude-opus-4-7'
  if (verify === 'sonnet') return 'claude-sonnet-4-6'
  return scout === 'haiku' ? 'claude-haiku-4-5' : 'claude-sonnet-4-6'
}

const THUMB_COLORS = ['#0a0a0a', '#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a']

function deriveTags(r: BackendReel): string[] {
  const tags: string[] = []
  if (/\d+%|\d+ años|\d+ veces/.test(r.hook)) tags.push('número')
  if (/nunca|jamás|no\s/.test(r.hook.toLowerCase())) tags.push('negación')
  if (/fracas|me equivoqué|me costó/i.test(r.hook + r.transcript)) tags.push('confesión')
  if (r.viral) tags.push('viral')
  if (tags.length === 0) tags.push('clip')
  return tags.slice(0, 4)
}

// Backend reel shape (lo que devuelve /api/analyze stream done event)
interface BackendReel {
  id: string
  title: string
  start: number
  end: number
  duration: number
  score: number     // 0..1
  viral: boolean
  hook: string
  reason: string
  transcript: string
  novelty: number
  sentiment: number
}

function mapReel(r: BackendReel, index: number): Reel {
  return {
    id: r.id,
    index: index + 1,
    title: r.title,
    hook: r.hook,
    reason: r.reason,
    start: r.start,
    end: r.end,
    score: Math.round(r.score * 100) / 10,   // 0..1 → 0..10
    viralScore: r.score,
    energy: 0.7,                              // backend no lo expone aún
    novelty: r.novelty,
    pitch: 0.6,
    sentiment: r.sentiment,
    tags: deriveTags(r),
    approved: r.viral,
    thumbColor: THUMB_COLORS[index % THUMB_COLORS.length],
    transcript: r.transcript,
  }
}

// ── REST ────────────────────────────────────────────────────

export async function uploadVideo(file: File): Promise<UploadedFile> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${base()}/upload`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`Upload falló (${res.status})`)
  const data = await res.json()
  return {
    jobId: data.jobId,
    name: data.fileName,
    durationSec: data.duration,
    size: file.size,
    type: file.type,
  }
}

export async function startAnalyze(
  jobId: string,
  config: ReelConfig,
  directorBrief: string = '',
): Promise<void> {
  const s = loadSettings()
  const fd = new FormData()
  fd.append('jobId', jobId)
  fd.append('anthropicKey', s.anthropicKey)
  fd.append('deepgramKey', s.deepgramKey)
  fd.append('numReels', String(config.numReels))
  fd.append('minDur', String(config.minDuration))
  fd.append('maxDur', String(config.maxDuration))
  fd.append('model', modelId(config.scoutModel, config.verifyModel))
  fd.append('twoPass', 'true')
  fd.append('useSilence', 'true')
  fd.append('useEnergy', 'true')
  fd.append('useLibrosa', 'true')
  fd.append('useNovelty', 'true')
  fd.append('directorBrief', directorBrief)

  const res = await fetch(`${base()}/analyze`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`Analyze start falló (${res.status})`)
}

export interface CutOneReelOpts {
  format?: 'original' | 'vertical'
  burnTitle?: boolean
  burnSubs?: boolean
  wordsPerSub?: number
}

export interface CutResult {
  reelId: string
  filename: string
  sizeMb: number
  downloadUrl: string
}

export async function cutOneReel(
  jobId: string,
  reelId: string,
  opts: CutOneReelOpts = {},
): Promise<CutResult> {
  const fd = new FormData()
  fd.append('jobId', jobId)
  fd.append('reelId', reelId)
  fd.append('format', opts.format ?? 'vertical')
  fd.append('burnTitle', String(opts.burnTitle ?? true))
  fd.append('burnSubs', String(opts.burnSubs ?? true))
  fd.append('wordsPerSub', String(opts.wordsPerSub ?? 3))
  const res = await fetch(`${base()}/cut-one`, { method: 'POST', body: fd })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Cut falló (${res.status})${body ? `: ${body}` : ''}`)
  }
  return (await res.json()) as CutResult
}

export interface ProgressEvent {
  step: string
  label: string
  detail?: string
}

export interface ProgressHandlers {
  onProgress: (evt: ProgressEvent) => void
  onDone: (reels: Reel[]) => void
  onError: (msg: string) => void
}

/**
 * Conecta el SSE del backend (/api/analyze/stream/{jobId}).
 * Usa addEventListener para los named events de sse-starlette: progress / done / error.
 */
export function streamProgress(jobId: string, handlers: ProgressHandlers): () => void {
  const es = new EventSource(`${base()}/analyze/stream/${jobId}`)

  es.addEventListener('progress', (e) => {
    try {
      const data = JSON.parse((e as MessageEvent).data) as ProgressEvent
      handlers.onProgress(data)
    } catch (err) {
      handlers.onError(`Evento inválido: ${err}`)
    }
  })

  es.addEventListener('done', (e) => {
    try {
      const data = JSON.parse((e as MessageEvent).data) as { reels: BackendReel[] }
      const mapped = data.reels.map((r, i) => mapReel(r, i))
      handlers.onDone(mapped)
    } catch (err) {
      handlers.onError(`Done malformado: ${err}`)
    } finally {
      es.close()
    }
  })

  es.addEventListener('error', (e) => {
    try {
      const data = JSON.parse((e as MessageEvent).data ?? '{}') as { message?: string }
      handlers.onError(data.message ?? 'Error en el pipeline')
    } catch {
      handlers.onError('Conexión perdida con el backend')
    } finally {
      es.close()
    }
  })

  return () => es.close()
}

// ── Cut + descarga ──────────────────────────────────────────

export async function cutReels(jobId: string, opts: {
  format?: 'original' | 'vertical'
  burnTitle?: boolean
  burnSubs?: boolean
  wordsPerSub?: number
}): Promise<{ reelId: string; filename: string; sizeMb: number }[]> {
  const fd = new FormData()
  fd.append('jobId', jobId)
  fd.append('format', opts.format ?? 'vertical')
  fd.append('burnTitle', String(opts.burnTitle ?? true))
  fd.append('burnSubs', String(opts.burnSubs ?? true))
  fd.append('wordsPerSub', String(opts.wordsPerSub ?? 3))
  const res = await fetch(`${base()}/cut`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`Cut falló (${res.status})`)
  return (await res.json()).outputs
}

export function clipDownloadUrl(jobId: string, filename: string): string {
  return `${base()}/clips/${jobId}/${filename}`
}

export function videoStreamUrl(jobId: string): string {
  return `${base()}/video/${jobId}`
}

// ── Health check ────────────────────────────────────────────

export interface ServerHealth {
  ok: boolean
  /** El backend tiene ANTHROPIC_API_KEY en su .env */
  anthropic: boolean
  deepgram: boolean
  ffmpeg: boolean
}

/** null si el backend no responde (→ modo demo). */
export async function getServerHealth(): Promise<ServerHealth | null> {
  try {
    const res = await fetch(`${base()}/health`)
    if (!res.ok) return null
    return (await res.json()) as ServerHealth
  } catch {
    return null
  }
}

export async function pingBackend(): Promise<boolean> {
  try {
    // Cualquier respuesta del server cuenta como "vivo" — incluso 405 (Method Not Allowed)
    // porque significa que el endpoint existe pero no acepta GET.
    const res = await fetch(`${base()}/upload`, { method: 'GET' })
    return res.status >= 200 && res.status < 600
  } catch {
    return false
  }
}
