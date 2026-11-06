import { useState } from 'react'
import { cn, formatTime } from '@/lib/utils'
import { Button } from '../ui/button'
import { Play, Download, Spinner, Check } from '@phosphor-icons/react'
import { cutOneReel, clipDownloadUrl } from '@/lib/api'
import type { Reel } from '@/lib/types'

interface Props {
  reel: Reel
  recommendedLabel?: string
  jobId?: string
  onView: () => void
  /** Si true, aplica estilos para la celda grande del bento */
  large?: boolean
}

type DLState =
  | { kind: 'idle' }
  | { kind: 'cutting' }
  | { kind: 'ready'; url: string; filename: string }
  | { kind: 'error' }

export function SimpleReelCard({
  reel, recommendedLabel, jobId, onView, large,
}: Props) {
  const [dl, setDl] = useState<DLState>({ kind: 'idle' })
  const duration = reel.end - reel.start
  const hookText = reel.hook || reel.title

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!jobId || dl.kind === 'cutting') return

    if (dl.kind === 'ready') {
      triggerDownload(dl.url, dl.filename)
      return
    }

    setDl({ kind: 'cutting' })
    try {
      const result = await cutOneReel(jobId, reel.id, { format: 'vertical' })
      const url = clipDownloadUrl(jobId, result.filename)
      setDl({ kind: 'ready', url, filename: result.filename })
      triggerDownload(url, result.filename)
    } catch {
      setDl({ kind: 'error' })
    }
  }

  return (
    <article className={cn(
      'group bg-card border border-subtle rounded-[14px] overflow-hidden flex flex-col card-lift h-full',
    )}>
      {/* Thumbnail */}
      <button
        onClick={onView}
        className="relative w-full overflow-hidden shrink-0"
        style={{
          background: reel.thumbColor,
          aspectRatio: large ? '9 / 14' : '9 / 16',
        }}
      >
        {/* Hook text overlay — centro del thumb */}
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <p
            className={cn(
              'text-center font-bold leading-snug tracking-tight',
              large ? 'text-[16px]' : 'text-[12px]',
            )}
            style={{
              color: '#ffffff',
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {hookText}
          </p>
        </div>

        {/* Badge top-left: #1 o label */}
        {recommendedLabel && (
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center h-6 px-2 rounded-[5px] font-mono text-[10px] font-bold tracking-wide"
              style={{ background: 'rgba(0,0,0,0.65)', color: '#ffffff' }}
            >
              {recommendedLabel === 'Mejor clip' ? '#1' : recommendedLabel}
            </span>
          </div>
        )}

        {/* Score + duration — bottom row */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          <span
            className="inline-flex items-center h-6 px-2 rounded-[5px] font-mono text-[10px] font-bold"
            style={{ background: 'rgba(0,0,0,0.65)', color: '#ffffff' }}
          >
            {reel.score.toFixed(1)}
          </span>
          <span
            className="inline-flex items-center h-6 px-2 rounded-[5px] font-mono text-[10px] font-semibold"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fafafa' }}
          >
            {formatTime(duration)}
          </span>
        </div>

        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full bg-base text-hi flex items-center justify-center shadow-lg">
            <Play size={16} weight="fill" />
          </span>
        </div>
      </button>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-1 space-y-1">
          {/* Hook resumido */}
          <p className={cn(
            'font-semibold tracking-tight text-hi leading-snug line-clamp-2',
            large ? 'text-[14px]' : 'text-[12px]',
          )}>
            {hookText}
          </p>
          {/* Título como subtítulo secundario */}
          {reel.title && reel.title !== hookText && (
            <p className="text-[11px] text-dim line-clamp-1">{reel.title}</p>
          )}
        </div>

        <div className="pt-1 flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Play size={11} weight="fill" />
            Ver
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
            disabled={!jobId || dl.kind === 'cutting'}
          >
            {dl.kind === 'cutting' && (
              <>
                <Spinner size={11} weight="bold" className="animate-spin" />
                Cortando…
              </>
            )}
            {dl.kind === 'ready' && (
              <>
                <Check size={11} weight="bold" />
                Listo
              </>
            )}
            {(dl.kind === 'idle' || dl.kind === 'error') && (
              <>
                <Download size={11} weight="bold" />
                {dl.kind === 'error' ? 'Reintentar' : 'Descargar'}
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
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
