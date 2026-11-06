import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { ReelCard } from './ReelCard'
import { ClipDetail } from './ClipDetail'
import type { Icon as PhIcon } from '@phosphor-icons/react'
import {
  MagnifyingGlass, Download, CheckCircle, Sparkle,
  Lightning, ArrowsClockwise,
} from '@phosphor-icons/react'
import type { Reel } from '@/lib/types'

interface Props {
  reels: Reel[]
  jobName: string
  durationSec: number
  onRestart: () => void
}

type SortKey = 'score' | 'time' | 'duration'
type Filter = 'all' | 'approved' | 'top'

export function ResultsView({ reels, jobName, onRestart }: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('score')
  const [filter, setFilter] = useState<Filter>('all')
  const [activeId, setActiveId] = useState<string | null>(reels[0]?.id ?? null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = useMemo(() => {
    let arr = reels
    if (filter === 'approved') arr = arr.filter((r) => r.approved)
    if (filter === 'top') arr = arr.filter((r) => r.score >= 8.5)
    if (query) {
      arr = arr.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.hook.toLowerCase().includes(query.toLowerCase()),
      )
    }
    return [...arr].sort((a, b) => {
      if (sort === 'score') return b.score - a.score
      if (sort === 'time') return a.start - b.start
      return (b.end - b.start) - (a.end - a.start)
    })
  }, [reels, filter, sort, query])

  const active = reels.find((r) => r.id === activeId) ?? null
  const avgScore = reels.reduce((acc, r) => acc + r.score, 0) / Math.max(reels.length, 1)

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6 w-full">
        {/* Header */}
        <header className="flex items-end justify-between gap-6">
          <div className="space-y-2 min-w-0">
            <div className="eyebrow-md">07 · Reels</div>
            <h1 className="text-[20px] font-bold tracking-[-0.012em] text-hi truncate">
              {reels.length} reels detectados
            </h1>
            <p className="text-[12px] text-dim truncate">
              de <span className="text-mid font-medium">“{jobName}”</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="md" onClick={onRestart}>
              <ArrowsClockwise size={12} />
              Reprocesar
            </Button>
            <Button variant="primary" size="md">
              <Download size={13} weight="bold" />
              Exportar todos
            </Button>
          </div>
        </header>

        {/* 3 stats compactas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <BigStat
            icon={Sparkle}
            eyebrow="Score promedio"
            value={avgScore.toFixed(1)}
            unit="/ 10"
          />
          <BigStat
            icon={CheckCircle}
            eyebrow="Aprobados"
            value={`${reels.filter((r) => r.approved).length}`}
            unit={`de ${reels.length}`}
          />
          <BigStat
            icon={Lightning}
            eyebrow="Coste IA"
            value="$0.11"
            unit="USD"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center flex-1 min-w-[260px] max-w-md gap-2 h-8 px-3 rounded-[7px] border border-subtle bg-base">
            <MagnifyingGlass size={13} className="text-faint" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, hook…"
              className="h-8 border-0 bg-transparent focus-visible:ring-0 px-0 text-[12px]"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="h-6 px-2.5 text-[11px]">Todos · {reels.length}</TabsTrigger>
              <TabsTrigger value="approved" className="h-6 px-2.5 text-[11px]">Aprobados</TabsTrigger>
              <TabsTrigger value="top" className="h-6 px-2.5 text-[11px]">Top ≥ 8.5</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="ml-auto flex items-center gap-0.5 rounded-[7px] border border-subtle bg-inset p-0.5">
            {(['score', 'time', 'duration'] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={cn(
                  'h-7 px-2.5 rounded-[5px] text-[11px] font-medium transition-colors',
                  sort === k
                    ? 'bg-base text-hi shadow-sm'
                    : 'text-dim hover:text-hi',
                )}
              >
                {k === 'score' ? 'Score' : k === 'time' ? 'Tiempo' : 'Duración'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((reel) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              selected={activeId === reel.id}
              onSelect={() => { setActiveId(reel.id); setDetailOpen(true) }}
              onPreview={() => { setActiveId(reel.id); setDetailOpen(true) }}
            />
          ))}
        </div>
      </div>

      {active && (
        <ClipDetail
          reel={active}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  )
}

function BigStat({
  icon: I, eyebrow, value, unit,
}: {
  icon: PhIcon
  eyebrow: string
  value: string
  unit?: string
}) {
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow">{eyebrow}</span>
        <I size={13} className="text-faint" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[28px] font-bold tabular tracking-[-0.02em] leading-none text-hi">
          {value}
        </span>
        {unit && <span className="text-[11px] tabular text-faint">{unit}</span>}
      </div>
    </Card>
  )
}
