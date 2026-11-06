import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { SimpleReelCard } from './SimpleReelCard'
import { ClipDetail } from '../ClipDetail'
import { Plus } from '@phosphor-icons/react'
import type { Reel } from '@/lib/types'

interface Props {
  reels: Reel[]
  jobId?: string
  onNewVideo: () => void
}

export function ReelsReadyPage({ reels, jobId, onNewVideo }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...reels].sort((a, b) => b.score - a.score),
    [reels],
  )

  const labelFor = (idx: number): string | undefined => {
    if (sorted.length === 0) return
    if (idx === 0) return 'Mejor clip'
    if (idx <= 2 && sorted[idx].score >= 8) return 'Recomendado'
    return
  }

  const previewReel = previewId ? reels.find((r) => r.id === previewId) ?? null : null

  // Grid layout según cantidad de reels
  const count = sorted.length
  const useBento = count >= 3

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      {/* Header izquierda/derecha */}
      <header className="flex items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-hi leading-tight">
            {count > 0 ? `${count} clip${count > 1 ? 's' : ''} encontrado${count > 1 ? 's' : ''}` : 'Sin clips'}
          </h1>
          <p className="text-[13px] text-dim mt-0.5">
            Revisá, editá y descargá los clips generados.
          </p>
        </div>
        {/* La topbar ya muestra "Nuevo video"; aquí sólo cuando no hay clips */}
        {count === 0 && (
          <Button variant="outline" size="md" onClick={onNewVideo} className="shrink-0">
            <Plus size={12} weight="bold" />
            Nuevo video
          </Button>
        )}
      </header>

      {count > 0 ? (
        useBento ? (
          /* Bento asimétrico: primer clip (mejor) ocupa 2 filas */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gridAutoRows: 'auto',
              gap: '12px',
            }}
          >
            {sorted.map((reel, i) => (
              <div
                key={reel.id}
                style={i === 0 ? { gridRow: 'span 2' } : undefined}
              >
                <SimpleReelCard
                  reel={reel}
                  recommendedLabel={labelFor(i)}
                  jobId={jobId}
                  onView={() => setPreviewId(reel.id)}
                  large={i === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Grid uniforme para <3 reels */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sorted.map((reel, i) => (
              <SimpleReelCard
                key={reel.id}
                reel={reel}
                recommendedLabel={labelFor(i)}
                jobId={jobId}
                onView={() => setPreviewId(reel.id)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="border border-dashed border-subtle rounded-[14px] p-12 text-center space-y-2">
          <p className="text-[14px] font-medium text-hi">No se generaron clips</p>
          <p className="text-[12px] text-dim">
            Probá con otro video más largo o de mejor calidad de audio.
          </p>
        </div>
      )}

      {previewReel && (
        <ClipDetail
          reel={previewReel}
          open={!!previewReel}
          onClose={() => setPreviewId(null)}
          jobId={jobId}
        />
      )}
    </div>
  )
}
