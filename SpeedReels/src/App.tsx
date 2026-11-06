import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { SimpleAppShell } from './components/SimpleAppShell'
import { UploadVideoPage } from './components/pages/UploadVideoPage'
import { ProcessingPage } from './components/pages/ProcessingPage'
import { ReelsReadyPage } from './components/pages/ReelsReadyPage'
import { SettingsDialog } from './components/SettingsDialog'
import { PIPELINE_STAGES, MOCK_REELS } from './lib/mock'
import { loadSettings } from './lib/settings'
import { uploadVideo, startAnalyze, streamProgress, getServerHealth, type ProgressEvent } from './lib/api'
import type { ReelConfig, Reel, Stage, StageId } from './lib/types'

// Vista técnica completa, sólo accesible con ?debug=1
const DebugApp = lazy(() => import('./DebugApp'))

type Phase = 'upload' | 'processing' | 'ready'

interface Job {
  jobId: string | null
  name: string
  durationSec: number
  reels: Reel[]
  stages: Stage[]
}

const STEP_TO_STAGE: Record<string, StageId> = {
  'EX-01': 'extract',
  'SD-01': 'silence',
  'EN-01': 'energy',
  'AC-01': 'acoustic',
  'TR-01': 'transcribe',
  'AI-01': 'scout',
  'AI-02': 'verify',
}

const DEFAULT_CONFIG: ReelConfig = {
  numReels: 5,
  minDuration: 25,
  maxDuration: 60,
  format: 'vertical',
  aspect: '9:16',
  burnSubtitles: true,
  subtitleWordsPerLine: 3,
  drawTitle: true,
  titlePosition: 'top',
  scoutModel: 'haiku',
  verifyModel: 'sonnet',
  silenceThresholdDb: -30,
  silenceMinDuration: 0.35,
}

export default function App() {
  // Debug mode override
  const isDebug = useIsDebug()
  if (isDebug) {
    return (
      <Suspense fallback={<div className="h-screen w-screen grid place-items-center text-dim">Cargando…</div>}>
        <DebugApp />
      </Suspense>
    )
  }
  return <SimpleApp />
}

function SimpleApp() {
  const [phase, setPhase] = useState<Phase>('upload')
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const stopStream = useRef<(() => void) | null>(null)

  useEffect(() => () => { stopStream.current?.() }, [])

  // ⌘ , abre settings (uso power user)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setSettingsOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── Upload ─────────────────────────────────────────────────
  const handleSelect = async (file: File) => {
    setError(null)
    const settings = loadSettings()
    const directorBrief = settings.directorPrompt || ''
    const initialStages = PIPELINE_STAGES.map((s) => ({ ...s, status: 'idle' as const }))

    // Modo real si hay key en el navegador (⌘ ,) o en el .env del backend.
    // Sin ninguna de las dos (o sin backend) → demo con reels de ejemplo.
    const hasKey = Boolean(settings.anthropicKey) || Boolean((await getServerHealth())?.anthropic)
    if (!hasKey) {
      const demoJob: Job = {
        jobId: null,
        name: file.name,
        durationSec: 712,
        reels: [],
        stages: initialStages,
      }
      setJob(demoJob)
      setPhase('processing')
      runDemo(demoJob)
      return
    }

    try {
      const uploaded = await uploadVideo(file)
      const liveJob: Job = {
        jobId: uploaded.jobId,
        name: uploaded.name,
        durationSec: uploaded.durationSec,
        reels: [],
        stages: initialStages,
      }
      setJob(liveJob)
      setPhase('processing')

      await startAnalyze(uploaded.jobId, DEFAULT_CONFIG, directorBrief)

      stopStream.current?.()
      stopStream.current = streamProgress(uploaded.jobId, {
        onProgress: (evt) => applyProgress(evt),
        onDone: (reels) => {
          setJob((j) => (j ? { ...j, reels, stages: completeStages(j.stages) } : j))
          setPhase('ready')
        },
        onError: (msg) => setError(msg),
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      // Volver a upload si fue antes de empezar a procesar
      setPhase('upload')
    }
  }

  // Avance simulado para modo demo
  const runDemo = (initial: Job) => {
    let i = 0
    const total = initial.stages.length
    const tick = setInterval(() => {
      setJob((j) => {
        if (!j) return j
        const next = j.stages.map((s) => ({ ...s }))
        if (i < total) {
          if (i > 0) next[i - 1] = { ...next[i - 1], status: 'done', progress: 1 }
          next[i] = { ...next[i], status: 'running', progress: 0.5 }
          i += 1
        } else {
          next.forEach((_, idx) => { next[idx] = { ...next[idx], status: 'done', progress: 1 } })
          clearInterval(tick)
          setTimeout(() => {
            setJob((cur) => (cur ? { ...cur, reels: MOCK_REELS } : cur))
            setPhase('ready')
          }, 300)
        }
        return { ...j, stages: next }
      })
    }, 800)
    stopStream.current?.()
    stopStream.current = () => clearInterval(tick)
  }

  const applyProgress = (evt: ProgressEvent) => {
    const stageId = STEP_TO_STAGE[evt.step]
    if (!stageId) return
    setJob((j) => {
      if (!j) return j
      const next = j.stages.map((s) => ({ ...s }))
      const idx = next.findIndex((s) => s.id === stageId)
      if (idx === -1) return j

      for (let i = 0; i < idx; i++) {
        if (next[i].status === 'idle' || next[i].status === 'running') {
          next[i] = { ...next[i], status: 'done', progress: 1 }
        }
      }
      const isDoneEvt = (evt.detail ?? '').toLowerCase().includes('done')
      next[idx] = {
        ...next[idx],
        status: isDoneEvt ? 'done' : 'running',
        detail: evt.detail || next[idx].detail,
        progress: isDoneEvt ? 1 : Math.min(0.9, (next[idx].progress ?? 0.4) + 0.15),
      }
      return { ...j, stages: next }
    })
  }

  const handleRestart = () => {
    stopStream.current?.()
    stopStream.current = null
    setJob(null)
    setError(null)
    setPhase('upload')
  }

  const handleShowDebug = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('debug', '1')
    window.location.href = url.toString()
  }

  // ── Render ─────────────────────────────────────────────────
  const showHeaderCta = phase !== 'upload'

  return (
    <>
      <SimpleAppShell
        showCta={showHeaderCta}
        onNewVideo={showHeaderCta ? handleRestart : undefined}
      >
        {phase === 'upload' && (
          <UploadVideoPage
            onSelect={handleSelect}
            error={error}
            onClearError={() => setError(null)}
            onSettingsClick={() => setSettingsOpen(true)}
          />
        )}

        {phase === 'processing' && job && (
          <ProcessingPage
            fileName={job.name}
            durationSec={job.durationSec}
            stages={job.stages}
            onCancel={handleRestart}
            error={error}
            onRetry={handleRestart}
            onShowTechnical={handleShowDebug}
          />
        )}

        {phase === 'ready' && job && (
          <ReelsReadyPage
            reels={job.jobId ? job.reels : MOCK_REELS}
            jobId={job.jobId ?? undefined}
            onNewVideo={handleRestart}
          />
        )}
      </SimpleAppShell>

      {/* Settings sólo accesible con ⌘ , — usuario normal no lo ve */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}

function completeStages(stages: Stage[]): Stage[] {
  return stages.map((s) => ({ ...s, status: 'done' as const, progress: 1 }))
}

function useIsDebug(): boolean {
  const [debug, setDebug] = useState(() => readDebug())
  useEffect(() => {
    const onPop = () => setDebug(readDebug())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return debug
}

function readDebug(): boolean {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.get('debug') === '1') return true
  try {
    return localStorage.getItem('speedreels.debug') === '1'
  } catch {
    return false
  }
}
