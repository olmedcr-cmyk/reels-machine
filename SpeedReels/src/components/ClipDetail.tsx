import { useEffect, useRef, useState } from 'react'
import { formatTime } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import {
  Download, Quotes, Spinner, Check, ArrowClockwise,
} from '@phosphor-icons/react'
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
  | { kind: 'ready'; url: string; filename: string }
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
      setDownloadState({ kind: 'ready', url, filename: result.filename })
      triggerDownload(url, result.filename)
    } catch (e) {
      setDownloadState({ kind: 'error', msg: e instanceof Error ? e.message : String(e) })
    }
  }

  const canPlay = !!jobId
  const downloadDisabled = !jobId || downloadState.kind === 'cutting'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[960px] p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[400px_1fr]">
          {/* Player */}
          <div
            className="relative aspect-[9/16] flex items-center justify-center bg-black overflow-hidden"
            style={{ background: canPlay ? '#000' : reel.thumbColor }}
          >
            {canPlay ? (
              <video
                ref={videoRef}
                src={videoStreamUrl(jobId)}
                className="h-full w-full object-contain bg-black"
                preload="metadata"
                controls
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-6">
                  <span className="inline-block bg-base/95 text-hi px-2.5 py-1 rounded-[8px] text-[12px] font-bold tracking-tight uppercase">
                    {firstWords(reel.transcript, 3)}
                  </span>
                </div>
                <div
                  className="absolute bottom-4 inset-x-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <span>{formatTime(reel.start)}</span>
                  <span>{formatTime(reel.end)}</span>
                </div>
              </>
            )}
          </div>

          {/* Body */}
          <div className="p-8 space-y-6 overflow-auto">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-faint">
                <span className="eyebrow">Reel · {String(reel.index).padStart(2, '0')}</span>
                <span className="h-px w-6 bg-hairline" />
                <span className="timecode">{formatTime(reel.end - reel.start)}</span>
              </div>
              <DialogTitle>{reel.title}</DialogTitle>
              {reel.reason && <DialogDescription>{reel.reason}</DialogDescription>}
            </div>

            {reel.hook && (
              <blockquote className="relative pl-4 border-l-2 border-yellow">
                <Quotes
                  size={12}
                  weight="fill"
                  className="absolute -left-[7px] top-0 bg-base text-yellow"
                  style={{ background: 'var(--bg-base)' }}
                />
                <p className="text-[14px] text-hi leading-relaxed font-medium">
                  “{reel.hook}”
                </p>
              </blockquote>
            )}

            {reel.transcript && (
              <div>
                <div className="eyebrow mb-2">Transcripción</div>
                <p className="text-[13px] text-mid leading-relaxed">
                  {reel.transcript}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-3 border-t border-hairline">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                disabled={downloadDisabled}
                onClick={handleDownload}
              >
                {downloadState.kind === 'cutting' && (
                  <>
                    <Spinner size={13} weight="bold" className="animate-spin" />
                    Preparando MP4…
                  </>
                )}
                {downloadState.kind === 'ready' && (
                  <>
                    <Check size={13} weight="bold" />
                    Volver a descargar
                  </>
                )}
                {downloadState.kind === 'idle' && (
                  <>
                    <Download size={13} weight="bold" />
                    Descargar MP4
                  </>
                )}
                {downloadState.kind === 'error' && (
                  <>
                    <ArrowClockwise size={13} weight="bold" />
                    Reintentar
                  </>
                )}
              </Button>
              {downloadState.kind === 'error' && (
                <p className="text-[11px]" style={{ color: 'var(--amber-800)' }}>
                  {downloadState.msg}
                </p>
              )}
              {!jobId && (
                <p className="text-[11px] text-dim leading-relaxed">
                  Preview no disponible en modo demo.
                </p>
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

function firstWords(text: string, n: number) {
  if (!text) return 'CLIP'
  return text.split(/\s+/).slice(0, n).join(' ').toUpperCase()
}
