import { useState, useRef, useCallback } from 'react'
import { cn, formatBytes } from '@/lib/utils'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import {
  Upload, Trash, Lightning, Info, FileVideo, ArrowsHorizontal,
} from '@phosphor-icons/react'
import type { ReelConfig } from '@/lib/types'
import { loadSettings, saveSettings } from '@/lib/settings'
import { SubtitleStyleControls, type SubtitleStyleValue } from './SubtitleStyleControls'

const DEFAULT_CONFIG: ReelConfig = {
  numReels: 5,
  minDuration: 25,
  maxDuration: 60,
  format: 'vertical',
  aspect: '9:16',
  burnSubtitles: true,
  subtitleWordsPerLine: 3,
  drawTitle: true,
  titlePosition: 'top',
  scoutModel: 'haiku',
  verifyModel: 'sonnet',
  silenceThresholdDb: -30,
  silenceMinDuration: 0.35,
}

interface Props {
  onStart: (file: File, config: ReelConfig) => void
}

export function UploadView({ onStart }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [config, setConfig] = useState<ReelConfig>(DEFAULT_CONFIG)
  // Estilo de subtítulos: vive en los ajustes (lo usan también los cortes del flujo simple)
  const [subStyle, setSubStyle] = useState<SubtitleStyleValue>(() => {
    const s = loadSettings()
    return { position: s.subtitlePosition, sidePadding: s.subtitleSidePadding, wordsPerLine: s.subtitleWordsPerLine }
  })
  const updateSubStyle = (v: SubtitleStyleValue) => {
    setSubStyle(v)
    try {
      saveSettings({
        ...loadSettings(),
        subtitlePosition: v.position,
        subtitleSidePadding: v.sidePadding,
        subtitleWordsPerLine: v.wordsPerLine,
      })
    } catch { /* localStorage no disponible: se usa sólo en esta sesión */ }
  }
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => f && setFile(f)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }, [])

  const setCfg = <K extends keyof ReelConfig>(k: K, v: ReelConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }))

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-full flex flex-col">
        {/* Scrollable content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6 w-full">
            {/* Hero */}
            <header className="space-y-2">
              <div className="eyebrow-md">01 · Source</div>
              <h1 className="text-[24px] font-bold tracking-[-0.02em] text-hi leading-[1.15]">
                Convierte un video largo en{' '}
                <span className="highlight-yellow">reels punchy</span>
              </h1>
              <p className="text-[13px] text-dim max-w-[620px] leading-[1.5]">
                Pipeline multimodal de dos pasadas — Scout en Haiku detecta candidatos,
                Verify en Sonnet aplica el filtro.
              </p>
            </header>

            {/* Dropzone */}
            <Card
              className={cn(
                'overflow-hidden transition-colors',
                dragging && 'border-primary bg-yellow-soft',
              )}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              {!file ? (
                <button
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    'w-full h-[220px] flex flex-col items-center justify-center gap-3.5',
                    'transition-colors text-mid hover:text-hi',
                    dragging && 'dropzone-active',
                  )}
                >
                  <div className="h-11 w-11 rounded-[9px] bg-inset flex items-center justify-center">
                    <Upload size={20} weight="regular" className="text-mid" />
                  </div>
                  <div className="text-[15px] font-semibold text-hi">Arrastra tu video aquí</div>
                  <div className="text-[12px] text-dim flex items-center gap-1">
                    <span>o</span>
                    <span className="text-hi font-medium">elige un archivo</span>
                    <span>· MP4, MOV, AVI, MKV · hasta 2 GB</span>
                  </div>
                  <div className="font-mono text-[10px] font-medium text-faint mt-1">
                    H.264 &nbsp;·&nbsp; ≥ 5 min &nbsp;·&nbsp; audio limpio
                  </div>
                </button>
              ) : (
                <FilePreview file={file} onRemove={() => setFile(null)} />
              )}
            </Card>

            {/* Params label */}
            <div className="eyebrow-md">Parámetros del job</div>

            {/* 2-col grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* col 1: Output */}
              <div className="space-y-3">
                <Card className="p-5 space-y-3.5">
                  <header>
                    <div className="eyebrow">02 · Output</div>
                    <h2 className="text-[14px] font-semibold tracking-tight text-hi mt-1">
                      Formato y dimensiones
                    </h2>
                  </header>

                  <Field label="Aspecto">
                    <SegmentedAspect
                      value={config.aspect}
                      onChange={(v) => setCfg('aspect', v)}
                    />
                  </Field>

                  <FieldRow label="Cantidad" value={`${config.numReels} reels`}>
                    <Slider
                      min={1} max={10} step={1}
                      value={[config.numReels]}
                      onValueChange={(v) => setCfg('numReels', v[0])}
                    />
                  </FieldRow>

                  <FieldRow label="Duración" value={`${config.minDuration}s — ${config.maxDuration}s`}>
                    <Slider
                      min={5} max={120} step={1}
                      value={[config.minDuration, config.maxDuration]}
                      onValueChange={(v) => {
                        setCfg('minDuration', v[0])
                        setCfg('maxDuration', v[1])
                      }}
                    />
                  </FieldRow>
                </Card>
              </div>

              {/* col 2: IA + Coste */}
              <div className="space-y-3">
                <Card className="p-5 space-y-3.5">
                  <header>
                    <div className="eyebrow">03 · IA</div>
                    <h2 className="text-[14px] font-semibold tracking-tight text-hi mt-1">
                      Modelos · Scout → Verify
                    </h2>
                  </header>

                  <Field label="Scout (proposes)" hint="Haiku: 80% calidad con 5% del coste">
                    <Select
                      value={config.scoutModel}
                      onValueChange={(v) => setCfg('scoutModel', v as 'haiku' | 'sonnet')}
                    >
                      <SelectTrigger className="h-8 text-[11px] font-mono"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="haiku">claude-haiku-4-5 · rápido, barato</SelectItem>
                        <SelectItem value="sonnet">claude-sonnet-4-6 · balance</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Verify (validates)" hint="Sólo se invoca para los que pasan el filtro">
                    <Select
                      value={config.verifyModel}
                      onValueChange={(v) => setCfg('verifyModel', v as 'sonnet' | 'opus')}
                    >
                      <SelectTrigger className="h-8 text-[11px] font-mono"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sonnet">claude-sonnet-4-6 · balance</SelectItem>
                        <SelectItem value="opus">claude-opus-4-7 · máxima calidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Pipeline cascada banner */}
                  <div className="rounded-[7px] bg-inset px-3 py-2.5 flex items-start gap-2">
                    <Lightning size={14} weight="fill" className="text-amber-800 mt-[1px]" />
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[12px] font-semibold text-hi">Pipeline cascada activa</div>
                      <p className="text-[11px] text-dim leading-[1.35]">
                        Scout filtra el 70% del contenido sin invocar Verify.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Coste estimado — amber */}
                <div
                  className="rounded-[9px] p-5 space-y-2.5"
                  style={{
                    background: 'var(--amber-100)',
                    border: '1px solid var(--amber-200)',
                  }}
                >
                  <div
                    className="font-mono text-[9px] font-semibold tracking-wider uppercase"
                    style={{ color: 'var(--amber-800)' }}
                  >
                    Coste estimado
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: 'var(--amber-800)' }}>
                    {config.numReels} reels · Scout {config.scoutModel} → Verify {config.verifyModel}
                  </div>
                  <ul className="space-y-1 pt-1">
                    <CostRow label="Transcripción" value="~$0.04" />
                    <CostRow label={`Scout · ${cap(config.scoutModel)}`} value="~$0.01" />
                    <CostRow label={`Verify · ${cap(config.verifyModel)}`} value="~$0.06" />
                  </ul>
                </div>

                {/* Subs toggles */}
                <Card className="p-5 space-y-3">
                  <header>
                    <div className="eyebrow">04 · Subtítulos</div>
                    <h2 className="text-[14px] font-semibold tracking-tight text-hi mt-1">
                      Estilo y overlay
                    </h2>
                  </header>
                  <Toggle label="Quemar subtítulos" hint="Geomanist · palabras clave en amarillo por IA"
                          value={config.burnSubtitles} onChange={(v) => setCfg('burnSubtitles', v)} />
                  <Toggle label="Mostrar título" hint="Caja negra semitransparente"
                          value={config.drawTitle} onChange={(v) => setCfg('drawTitle', v)} />
                  {config.burnSubtitles && (
                    <div className="pt-2">
                      <SubtitleStyleControls value={subStyle} onChange={updateSubStyle} />
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar — sticky 48px */}
        <div className="h-12 px-6 flex items-center justify-between border-t border-subtle bg-base shrink-0">
          <div className="flex items-center gap-4">
            <BottomTag icon={<ArrowsHorizontal size={12} className="text-faint" />}>
              {config.numReels} reels
            </BottomTag>
            <BottomTag>{config.minDuration}-{config.maxDuration}s</BottomTag>
            <BottomTag>{config.aspect}</BottomTag>
            <BottomTag>Scout {config.scoutModel} → Verify {config.verifyModel}</BottomTag>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => setConfig(DEFAULT_CONFIG)}>
              Restablecer
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!file}
              onClick={() => file && onStart(file, config)}
            >
              <Lightning size={13} weight="fill" />
              Detectar reels virales
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

/* ── helpers ─────────────────────────────────────────────── */

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-medium text-dim">{label}</span>
        {hint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-faint hover:text-mid transition" aria-label="info">
                <Info size={11} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px]">{hint}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  )
}

function FieldRow({
  label, value, children,
}: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-dim">{label}</span>
        <span className="font-mono text-[12px] font-medium text-hi tabular">{value}</span>
      </div>
      {children}
    </div>
  )
}

function Toggle({
  label, hint, value, onChange,
}: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-0.5 min-w-0">
        <div className="text-[12px] font-medium text-hi">{label}</div>
        {hint && <p className="text-[11px] text-dim">{hint}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}

function SegmentedAspect({
  value, onChange,
}: { value: ReelConfig['aspect']; onChange: (v: ReelConfig['aspect']) => void }) {
  const opts: ReelConfig['aspect'][] = ['9:16', '4:5', '1:1', '16:9']
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-[7px] bg-inset border border-subtle">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            'h-7 px-2.5 rounded-[5px] font-mono text-[11px] font-semibold transition-colors',
            value === o
              ? 'bg-base text-hi shadow-sm'
              : 'text-dim hover:text-hi',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function BottomTag({
  icon, children,
}: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-dim">
      {icon}
      {children}
    </span>
  )
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <li
      className="flex items-center justify-between text-[11px]"
      style={{ color: 'var(--amber-800)' }}
    >
      <span>{label}</span>
      <span className="font-mono font-semibold tabular">{value}</span>
    </li>
  )
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="h-12 w-16 rounded-[7px] bg-primary flex items-center justify-center shrink-0">
        <FileVideo size={20} weight="duotone" className="text-yellow" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-[13px] font-semibold text-hi truncate">{file.name}</div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-dim">
          <span>{formatBytes(file.size)}</span>
          <span className="text-faint">·</span>
          <span>{file.type || 'video'}</span>
        </div>
      </div>
      <Button variant="ghost" size="iconSm" onClick={onRemove} aria-label="Eliminar archivo">
        <Trash size={13} />
      </Button>
    </div>
  )
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
