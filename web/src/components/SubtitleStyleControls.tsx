import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { Slider } from './ui/slider'
import type { SubtitlePosition } from '@/lib/settings'

/** Amarillo de marca: el mismo que quema el backend en los subtítulos. */
const BRAND_YELLOW = '#FFD60A'

export interface SubtitleStyleValue {
  position: SubtitlePosition
  sidePadding: number
  wordsPerLine: number
}

interface Props {
  value: SubtitleStyleValue
  onChange: (v: SubtitleStyleValue) => void
}

const POSITIONS: { id: SubtitlePosition; label: string }[] = [
  { id: 'top', label: 'Arriba' },
  { id: 'center', label: 'Centro' },
  { id: 'bottom', label: 'Abajo' },
]

/**
 * Posición vertical, padding lateral y palabras por bloque de los subtítulos
 * de marca, con una previsualización 9:16 que respeta las mismas proporciones
 * que `engine/subtitles.py`.
 */
export function SubtitleStyleControls({ value, onChange }: Props) {
  const set = <K extends keyof SubtitleStyleValue>(k: K, v: SubtitleStyleValue[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <div className="grid grid-cols-[1fr_auto] gap-6 items-start">
      <div className="space-y-5 min-w-0">
        <Row label="Posición">
          <ToggleGroup
            type="single"
            value={value.position}
            onValueChange={(v) => v && set('position', v as SubtitlePosition)}
            aria-label="Posición vertical de los subtítulos"
          >
            {POSITIONS.map((p) => (
              <ToggleGroupItem key={p.id} value={p.id}>{p.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Row>

        <Row label="Margen lateral" value={`${value.sidePadding} px`}>
          <Slider
            min={0} max={160} step={8}
            value={[value.sidePadding]}
            onValueChange={(v) => set('sidePadding', v[0])}
            aria-label="Margen lateral de los subtítulos"
          />
        </Row>

        <Row label="Palabras por bloque" value={String(value.wordsPerLine)}>
          <Slider
            min={1} max={6} step={1}
            value={[value.wordsPerLine]}
            onValueChange={(v) => set('wordsPerLine', v[0])}
            aria-label="Palabras por bloque de subtítulo"
          />
        </Row>

        <p className="text-[12px] text-dim leading-relaxed">
          Geomanist Black, contorno negro y las palabras clave que elige la IA en{' '}
          <span className="font-semibold text-hi px-1 rounded-[4px]" style={{ background: BRAND_YELLOW }}>
            amarillo
          </span>
          . Al descargar un reel también obtienes el <span className="font-mono">.ass</span> editable.
        </p>
      </div>

      <Preview value={value} />
    </div>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-dim">{label}</span>
        {value && <span className="font-mono text-[12px] font-medium text-hi tabular">{value}</span>}
      </div>
      {children}
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
      className="relative shrink-0 rounded-[10px] overflow-hidden border border-subtle"
      style={{ width: W, height: H, background: 'linear-gradient(160deg,#3f3f46,#18181b 70%)' }}
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
