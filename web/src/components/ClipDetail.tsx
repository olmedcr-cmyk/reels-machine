import { useEffect, useRef, useState } from 'react'
import { formatTime } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog'
import { F } from '@/frekvens'
import { BrandSubtitle, firstWords } from './BrandSubtitle'
import { cutOneReel, videoStreamUrl, clipDownloadUrl } from '@/lib/api'
import type { Reel } from '@/lib/types'

interface Props {
  reel: Reel
  open: boolean
  onClose: () => void
  /** Si está presente, el `<video>` reproduce el source con seek a `reel.start`. */
  jobId?: string
}

type DownloadState =
  | { kind: 'idle' }
  | { kind: 'cutting' }
  | { kind: 'ready'; url: string; filename: string; assUrl?: string }
  | { kind: 'error'; msg: string }

export function ClipDetail({ reel, open, onClose, jobId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [downloadState, setDownloadState] = useState<DownloadState>({ kind: 'idle' })

  // Reset cuando cambia de reel
  useEffect(() => {
    setDownloadState({ kind: 'idle' })
  }, [reel.id])

  // Cuando se abre, posicionar al inicio del clip
  useEffect(() => {
    if (!open) return
    const video = videoRef.current
    if (!video) return
    const onMeta = () => {
      try { video.currentTime = reel.start } catch { /* ignore */ }
    }
    video.addEventListener('loadedmetadata', onMeta, { once: true })
    return () => video.removeEventListener('loadedmetadata', onMeta)
  }, [open, reel.start])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= reel.end) {
      video.pause()
      video.currentTime = reel.start
    }
  }

  const handleDownload = async () => {
    if (!jobId) return
    if (downloadState.kind === 'cutting') return

    if (downloadState.kind === 'ready') {
      // Ya cortado — disparar descarga
      triggerDownload(downloadState.url, downloadState.filename)
      return
    }

    setDownloadState({ kind: 'cutting' })
    try {
      const result = await cutOneReel(jobId, reel.id, { format: 'vertical' })
      const url = clipDownloadUrl(jobId, result.filename)
      const assUrl = result.subtitlesUrl
        ? clipDownloadUrl(jobId, result.subtitlesUrl.split('/').pop() as string)
        : undefined
      setDownloadState({ kind: 'ready', url, filename: result.filename, assUrl })
      triggerDownload(url, result.filename)
    } catch (e) {
      setDownloadState({ kind: 'error', msg: e instanceof Error ? e.message : String(e) })
    }
  }

  const canPlay = !!jobId
  const downloadDisabled = !jobId || downloadState.kind === 'cutting'
  const hook = reel.hook.replace(/^["“”']+|["“”']+$/g, '')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-[960px] p-0 overflow-hidden border-0"
        style={{ background: 'var(--paper)', borderRadius: 'var(--radius-xl)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr]" style={{ gap: 'var(--space-2)', padding: 'var(--space-2)' }}>
          {/* Visor 9:16 — radio 32 dentro de 40 con 8 de padding */}
          <div
            className="relative aspect-[9/16] flex items-center justify-center overflow-hidden"
            style={{ background: '#0e0e0d', borderRadius: 32 }}
          >
            {canPlay ? (
              <video
                ref={videoRef}
                src={videoStreamUrl(jobId)}
                className="h-full w-full object-contain"
                preload="metadata"
                controls
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <>
                <div className="absolute inset-x-6 text-center" style={{ bottom: '27%' }}>
                  <BrandSubtitle text={firstWords(reel.transcript || hook, 4)} highlight={reel.highlight} size={26} />
                </div>
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between frk-field__label" style={{ color: '#a8a39a' }}>
                  <span>{formatTime(reel.start)}</span>
                  <span>{formatTime(reel.end)}</span>
                </div>
              </>
            )}
          </div>

          {/* Ficha */}
          <div className="flex flex-col overflow-auto" style={{ gap: 'var(--space-5)', padding: 'var(--space-5)' }}>
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <span className="frk-field__label">
                REEL · {String(reel.index).padStart(2, '0')} · {formatTime(reel.end - reel.start)} · {reel.score.toFixed(1)}/10
              </span>
              <DialogTitle asChild>
                <h2 style={{ font: '800 32px/1 var(--font-sans)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
                  {reel.title}
                </h2>
              </DialogTitle>
              {reel.reason && (
                <DialogDescription asChild>
                  <p style={{ font: '500 15px/22px var(--font-sans)', color: 'var(--ink-muted)' }}>{reel.reason}</p>
                </DialogDescription>
              )}
            </div>

            {hook && (
              <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                <span className="frk-field__label">HOOK</span>
                <p style={{ font: '700 20px/24px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--ink)' }}>“{hook}”</p>
              </div>
            )}

            {reel.transcript && (
              <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                <span className="frk-field__label">TRANSCRIPCIÓN</span>
                <p style={{ font: '400 16px/22px var(--font-sans)', color: 'var(--ink)' }}>{reel.transcript}</p>
              </div>
            )}

            {!!reel.highlight?.length && (
              <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
                <span className="frk-field__label">RESALTADO EN SUBTÍTULOS</span>
                <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
                  {reel.highlight.map((h) => <F.Chip key={h} tone="sol">{h}</F.Chip>)}
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-col" style={{ gap: 'var(--space-2)' }}>
              {downloadState.kind === 'error' && (
                <F.Banner tone="error" title="No se pudo cortar">{downloadState.msg}</F.Banner>
              )}
              <F.KeyButton
                tone="klein"
                size="s"
                block
                label="MP4 · 9:16"
                icon={downloadState.kind === 'ready' ? 'check' : downloadState.kind === 'error' ? 'refresh' : 'arrow-right'}
                disabled={downloadDisabled}
                onClick={handleDownload}
              >
                {downloadState.kind === 'cutting' ? 'Cortando…'
                  : downloadState.kind === 'ready' ? 'Descargar otra vez'
                  : downloadState.kind === 'error' ? 'Reintentar'
                  : 'Descargar'}
              </F.KeyButton>
              {downloadState.kind === 'ready' && downloadState.assUrl && (
                <a className="frk-field__label text-center underline underline-offset-4" href={downloadState.assUrl} download>
                  Subtítulos editables (.ass)
                </a>
              )}
              {!jobId && (
                <span className="frk-field__label text-center">Vista previa y descarga al analizar un vídeo real</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
