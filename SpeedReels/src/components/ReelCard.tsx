import { cn, formatTime } from '@/lib/utils'
import { Button } from './ui/button'
import {
  Play, Quotes, Download, ArrowRight, Sparkle,
} from '@phosphor-icons/react'
import type { Reel } from '@/lib/types'

export function ReelCard({
  reel, selected, onSelect, onPreview,
}: {
  reel: Reel
  selected?: boolean
  onSelect: () => void
  onPreview: () => void
}) {
  const duration = reel.end - reel.start
  return (
    <article
      className={cn(
        'card-lift bg-card border border-subtle rounded-[9px] overflow-hidden flex flex-col',
        selected && 'border-hi shadow-[0_0_0_1px_var(--tx-hi)]',
      )}
    >
      {/* Thumb */}
      <button
        onClick={onPreview}
        className="relative aspect-[9/16] w-full overflow-hidden group"
        style={{ background: reel.thumbColor }}
      >
        {/* Decorative wave */}
        <div className="absolute inset-0 flex items-end justify-center gap-[3px] px-6 pb-6 opacity-30">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="wave-bar"
              style={{
                height: `${20 + Math.abs(Math.sin(i * 1.4 + reel.index)) * 60}%`,
                background: 'rgba(255,255,255,0.7)',
              }}
            />
          ))}
        </div>

        {/* Subtitle preview */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center px-6">
          <span className="inline-block bg-base/95 text-hi px-2 py-1 rounded-[5px] text-[11px] font-bold tracking-tight uppercase">
            {firstWords(reel.transcript, 3)}
          </span>
        </div>

        {/* Score */}
        <div className="absolute top-3 left-3">
          <span className="pill-mono pill-mono--solid h-[22px] px-2">
            <Sparkle size={9} weight="fill" />
            {reel.score.toFixed(1)}
          </span>
        </div>

        {/* Index */}
        <div className="absolute top-3 right-3">
          <span className="font-mono text-[9px] tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            REEL · {String(reel.index).padStart(2, '0')}
          </span>
        </div>

        {/* Duration */}
        <div className="absolute bottom-3 right-3">
          <span
            className="pill-mono h-[22px] px-2"
            style={{
              background: 'rgba(0,0,0,0.55)',
              borderColor: 'rgba(255,255,255,0.18)',
              color: '#fafafa',
            }}
          >
            {formatTime(duration)}
          </span>
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity h-12 w-12 rounded-full bg-base text-hi flex items-center justify-center shadow-lg">
            <Play size={16} weight="fill" />
          </span>
        </div>
      </button>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-faint">REEL · {String(reel.index).padStart(2, '0')}</span>
            <span className="text-faint">·</span>
            <span className="timecode">
              {formatTime(reel.start)} → {formatTime(reel.end)}
            </span>
          </div>
          <h3 className="text-[14px] font-semibold tracking-tight text-hi leading-snug line-clamp-2">
            {reel.title}
          </h3>
        </div>

        <blockquote className="relative pl-3 border-l-2 border-yellow">
          <Quotes
            size={11}
            weight="fill"
            className="absolute -left-[6.5px] top-0 bg-base text-yellow"
            style={{ background: 'var(--bg-base)' }}
          />
          <p className="text-[12px] text-dim leading-relaxed line-clamp-3 italic">
            “{reel.hook}”
          </p>
        </blockquote>

        <div className="mt-auto pt-1 flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onSelect}>
            <ArrowRight size={11} />
            Detalle
          </Button>
          <Button variant="primary" size="sm" className="flex-1">
            <Download size={11} weight="bold" />
            Exportar
          </Button>
        </div>
      </div>
    </article>
  )
}

function firstWords(text: string, n: number) {
  return text.split(/\s+/).slice(0, n).join(' ').toUpperCase()
}
