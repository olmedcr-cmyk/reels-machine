import { useEffect, useRef, useState } from 'react'
import { Topbar } from './components/Topbar'
import { Sidebar, type ViewKey } from './components/Sidebar'
import { UploadView } from './components/UploadView'
import { PipelineView } from './components/PipelineView'
import { ResultsView } from './components/ResultsView'
import { ExportView } from './components/ExportView'
import { SettingsDialog } from './components/SettingsDialog'
import { MOCK_REELS, PIPELINE_STAGES } from './lib/mock'
import { loadSettings } from './lib/settings'
import { uploadVideo, startAnalyze, streamProgress, type ProgressEvent } from './lib/api'
import type { ReelConfig, Reel, Stage, StageId } from './lib/types'

interface Job {
  jobId: string | null            // null cuando es demo
  name: string
  durationSec: number
  config: ReelConfig
  reels: Reel[]
  stages: Stage[] | null          // null = demo simulado
  mode: 'demo' | 'live'
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

export default function DebugApp() {
  const [view, setView] = useState<ViewKey>('upload')
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTick, setSettingsTick] = useState(0)
  const stopStream = useRef<(() => void) | null>(null)
  const hasKeys = !!loadSettings().anthropicKey
  void settingsTick // re-render after closing settings

  useEffect(() => () => { stopStream.current?.() }, [])

  // ⌘, atajo para Settings
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

  const handleStart = async (file: File, config: ReelConfig) => {
    setError(null)
    const settings = loadSettings()

    // Sin Anthropic key → modo demo
    if (!settings.anthropicKey) {
      setJob({
        jobId: null,
        name: file.name,
        durationSec: 712,
        config,
        reels: [],
        stages: null,
        mode: 'demo',
      })
      setView('pipeline')
      return
    }

    // Live mode: upload → analyze → SSE
    try {
      const initialStages = PIPELINE_STAGES.map((s) => ({ ...s, status: 'idle' as const }))
      const uploaded = await uploadVideo(file)

      setJob({
        jobId: uploaded.jobId,
        name: uploaded.name,
        durationSec: uploaded.durationSec,
        config,
        reels: [],
        stages: initialStages,
        mode: 'live',
      })
      setView('pipeline')

      await startAnalyze(uploaded.jobId, config)

      stopStream.current?.()
      stopStream.current = streamProgress(uploaded.jobId, {
        onProgress: (evt) => applyProgress(evt),
        onDone: (reels) => {
          setJob((j) => (j ? { ...j, reels, stages: completeStages(j.stages) } : j))
          setView('results')
        },
        onError: (msg) => setError(msg),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const applyProgress = (evt: ProgressEvent) => {
    const stageId = STEP_TO_STAGE[evt.step]
    if (!stageId) return
    setJob((j) => {
      if (!j || !j.stages) return j
      const next = j.stages.map((s) => ({ ...s }))
      const idx = next.findIndex((s) => s.id === stageId)
      if (idx === -1) return j

      // marca anteriores como done si aún están idle
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

  const handlePipelineDoneDemo = () => {
    setJob((j) => (j ? { ...j, reels: MOCK_REELS } : j))
    setView('results')
  }

  const handleRestart = () => {
    stopStream.current?.()
    stopStream.current = null
    setJob(null)
    setError(null)
    setView('upload')
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-canvas overflow-hidden">
      <Topbar
        onUpload={handleRestart}
        onSettings={() => setSettingsOpen(true)}
        hasKeys={hasKeys}
      />

      {error && (
        <div
          className="px-4 py-2 flex items-center justify-between gap-4 border-b border-amber-200"
          style={{ background: 'var(--amber-100)' }}
        >
          <div className="text-[12px]" style={{ color: 'var(--amber-800)' }}>
            <span className="font-semibold">Error:</span> {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-[11px] font-medium hover:underline underline-offset-4"
            style={{ color: 'var(--amber-800)' }}
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <Sidebar active={view} onChange={setView} jobName={job?.name} />

        <main className="flex-1 bg-base overflow-hidden">
          {view === 'upload' && <UploadView onStart={handleStart} />}
          {view === 'pipeline' && job && (
            <PipelineView
              jobName={job.name}
              durationSec={job.durationSec}
              externalStages={job.stages}
              onCancel={handleRestart}
              onComplete={handlePipelineDoneDemo}
            />
          )}
          {view === 'results' && (
            <ResultsView
              reels={job?.reels.length ? job.reels : MOCK_REELS}
              jobName={job?.name ?? 'demo.mp4'}
              durationSec={job?.durationSec ?? 712}
              onRestart={handleRestart}
            />
          )}
          {view === 'export' && (
            <ExportView reels={job?.reels.length ? job.reels : MOCK_REELS} />
          )}
        </main>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(v) => {
          setSettingsOpen(v)
          if (!v) setSettingsTick((t) => t + 1)
        }}
      />
    </div>
  )
}

function completeStages(stages: Stage[] | null): Stage[] | null {
  if (!stages) return stages
  return stages.map((s) => ({ ...s, status: 'done' as const, progress: 1 }))
}
