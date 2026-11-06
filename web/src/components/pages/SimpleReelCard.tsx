import { useState } from 'react'
import { F } from '@/frekvens'
import { formatTime } from '@/lib/utils'
import { cutOneReel, clipDownloadUrl } from '@/lib/api'
import { BrandSubtitle, firstWords } from '../BrandSubtitle'
import type { Reel } from '@/lib/types'

interface Props {
  reel: Reel
  rank: number
  jobId?: string
  onView: () => void
}

type DLState =
  | { kind: 'idle' }
  | { kind: 'cutting' }
  | { kind: 'ready'; url: string; filename: string }
  | { kind: 'error' }

/**
 * Tarjeta de reel en Frekvens: caja `surface` radio 24 con 8 de padding y,
 * dentro, la miniatura 9:16 a radio 16 (concéntrico). La miniatura enseña el
 * subtítulo de marca tal y como saldrá en el MP4.
 */
export function SimpleReelCard({ reel, rank, jobId, onView }: Props) {
  const [dl, setDl] = useState<DLState>({ kind: 'idle' })
  const duration = reel.end - reel.start

  const handleDownload = async () => {
    if (!jobId || dl.kind === 'cutting') return
    if (dl.kind === 'ready') return triggerDownload(dl.url, dl.filename)
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
    <article
      className="flex flex-col"
      style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2)', gap: 'var(--space-3)' }}
    >
      <button
        type="button"
        onClick={onView}
        aria-label={`Ver reel ${rank}: ${reel.title}`}
        className="relative w-full overflow-hidden text-left"
        style={{ aspectRatio: '9 / 16', borderRadius: 'var(--radius-md)', background: '#0e0e0d' }}
      >
        <div className="absolute top-3 inset-x-3 flex items-start justify-between">
          {rank === 1
            ? <F.Chip tone="sol">Mejor clip</F.Chip>
            : <span className="frk-field__label" style={{ color: '#a8a39a' }}>#{rank}</span>}
          <span
            style={{ font: '800 28px/1 var(--font-dot)', color: '#f2f0ea', letterSpacing: '-0.02em' }}
            aria-label={`Puntuación ${reel.score.toFixed(1)} de 10`}
          >
            {reel.score.toFixed(1)}
          </span>
        </div>

        <div className="absolute inset-x-4 text-center" style={{ bottom: '24%' }}>
          <BrandSubtitle text={firstWords(reel.transcript || reel.hook, 4)} highlight={reel.highlight} size={20} />
        </div>

        <span className="absolute bottom-3 left-3 frk-field__label" style={{ color: '#a8a39a' }}>
          {formatTime(duration)} · 9:16
        </span>
      </button>

      <div className="flex flex-col flex-1" style={{ gap: 'var(--space-1)', padding: '0 var(--space-2)' }}>
        <h3 className="line-clamp-2" style={{ font: '700 20px/24px var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          {reel.title}
        </h3>
        {reel.reason && (
          <p className="line-clamp-2" style={{ font: '500 13px/18px var(--font-sans)', color: 'var(--ink-muted)' }}>
            {reel.reason}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2" style={{ gap: 'var(--space-2)' }}>
        <F.KeyButton tone="well" size="s" icon="play" onClick={onView}>Ver</F.KeyButton>
        <F.KeyButton
          tone="ink"
          size="s"
          icon={dl.kind === 'ready' ? 'check' : dl.kind === 'error' ? 'refresh' : undefined}
          disabled={!jobId || dl.kind === 'cutting'}
          title={!jobId ? 'Disponible al analizar un vídeo real' : undefined}
          onClick={handleDownload}
        >
          {dl.kind === 'cutting' ? 'Cortando…' : dl.kind === 'ready' ? 'Listo' : dl.kind === 'error' ? 'Reintentar' : 'Descargar'}
        </F.KeyButton>
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
