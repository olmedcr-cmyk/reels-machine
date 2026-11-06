import { useMemo, useState } from 'react'
import { F } from '@/frekvens'
import { SimpleReelCard } from './SimpleReelCard'
import { ClipDetail } from '../ClipDetail'
import type { Reel } from '@/lib/types'

interface Props {
  reels: Reel[]
  jobId?: string
  onNewVideo: () => void
}

/** 03 · Reels. Título con el recuento y rejilla de tarjetas con junta de 8. */
export function ReelsReadyPage({ reels, jobId, onNewVideo }: Props) {
  const [previewId, setPreviewId] = useState<string | null>(null)
  const sorted = useMemo(() => [...reels].sort((a, b) => b.score - a.score), [reels])
  const previewReel = previewId ? reels.find((r) => r.id === previewId) ?? null : null
  const count = sorted.length

  return (
    <div className="flex flex-col" style={{ gap: 'var(--space-6)', paddingTop: 'var(--space-6)' }}>
      <F.Text
        variant="display-xl"
        as="h1"
        sub={count ? `Ordenados por puntuación${jobId ? '' : ' · demo'}` : 'Prueba con otro vídeo'}
      >
        {count ? `${count} ${count === 1 ? 'reel' : 'reels'}` : 'Sin clips'}
      </F.Text>

      {count > 0 ? (
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-2)' }}
        >
          {sorted.map((reel, i) => (
            <SimpleReelCard
              key={reel.id}
              reel={reel}
              rank={i + 1}
              jobId={jobId}
              onView={() => setPreviewId(reel.id)}
            />
          ))}
        </div>
      ) : (
        <F.EmptyState
          shape="ring"
          title="No salió ningún clip"
          text="Un vídeo más largo o con mejor audio suele dar más momentos."
          action={{ label: 'Nuevo vídeo', onClick: onNewVideo }}
        />
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
