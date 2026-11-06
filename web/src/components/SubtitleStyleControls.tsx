import { F } from '@/frekvens'
import type { SubtitlePosition } from '@/lib/settings'
import { SUBTITLE_YELLOW as BRAND_YELLOW } from './BrandSubtitle'

export interface SubtitleStyleValue {
  position: SubtitlePosition
  sidePadding: number
  wordsPerLine: number
}

interface Props {
  value: SubtitleStyleValue
  onChange: (v: SubtitleStyleValue) => void
}

const POSITIONS = [
  { value: 'top', label: 'Arriba' },
  { value: 'center', label: 'Centro' },
  { value: 'bottom', label: 'Abajo' },
]

/**
 * Posición vertical, margen lateral y palabras por bloque de los subtítulos
 * de marca (Segmented + Slider de Frekvens), con una previsualización 9:16
 * que respeta las proporciones de `engine/subtitles.py`.
 */
export function SubtitleStyleControls({ value, onChange }: Props) {
  const set = <K extends keyof SubtitleStyleValue>(k: K, v: SubtitleStyleValue[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <div className="grid grid-cols-[1fr_auto] items-start" style={{ gap: 'var(--space-5)' }}>
      <div className="flex flex-col min-w-0" style={{ gap: 'var(--space-5)' }}>
        <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
          <span className="frk-field__label">POSICIÓN</span>
          <F.Segmented
            label="Posición vertical de los subtítulos"
            options={POSITIONS}
            value={value.position}
            onChange={(v) => set('position', v as SubtitlePosition)}
          />
        </div>

        <F.Slider
            label={`Margen lateral · ${value.sidePadding} px`}
            min={0} max={160} step={8}
            value={value.sidePadding}
            onChange={(v) => set('sidePadding', v)}
            format={(v) => `${v} px`}
          />

        <F.Slider
            label={`Palabras por bloque · ${value.wordsPerLine}`}
            min={1} max={6} step={1}
            value={value.wordsPerLine}
            onChange={(v) => set('wordsPerLine', v)}
            format={(v) => String(v)}
          />

        <p style={{ font: '500 13px/18px var(--font-sans)', color: 'var(--ink-muted)' }}>
          Geomanist Black, contorno negro y las palabras clave que elige la IA en{' '}
          <span style={{ background: BRAND_YELLOW, color: '#111', fontWeight: 700, padding: '0 4px', borderRadius: 4 }}>amarillo</span>.
          {' '}Cada descarga trae también el <span style={{ fontFamily: 'var(--font-mono)' }}>.ass</span> editable.
        </p>
      </div>

      <Preview value={value} />
    </div>
  )
}

/** Mini 9:16 (108×192 = 1080×1920 a escala 1:10). */
function Preview({ value }: { value: SubtitleStyleValue }) {
  const W = 108
  const H = 192
  const pad = value.sidePadding / 10
  const sample = ['95%', 'de', 'la', 'gente', 'abandona', 'pronto'].slice(0, value.wordsPerLine)
  const hot = new Set(['95%'])
  const pos: React.CSSProperties =
    value.position === 'top'
      ? { top: H * 0.17 }
      : value.position === 'center'
        ? { top: '50%', transform: 'translateY(-50%)' }
        : { bottom: H * 0.27 }

  return (
    <div
      aria-hidden
      className="relative shrink-0 overflow-hidden"
      style={{ width: W, height: H, background: '#0e0e0d', borderRadius: 'var(--radius-md)' }}
    >
      <div className="absolute inset-y-0 border-x border-dashed border-white/25" style={{ left: pad, right: pad }} />
      <div
        className="absolute text-center leading-[1.15] transition-all duration-200"
        style={{
          left: pad, right: pad, ...pos,
          fontFamily: 'Geomanist, Inter, system-ui, sans-serif',
          fontWeight: 900, fontSize: 8,
          color: '#fff',
          textShadow: '0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000',
          WebkitTextStroke: '0.6px #000',
          paintOrder: 'stroke fill',
        }}
      >
        {sample.map((w, i) => (
          <span key={i} style={hot.has(w) ? { color: BRAND_YELLOW } : undefined}>
            {w}{i < sample.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}
