import { useState } from 'react'
import { cn, formatTime } from '@/lib/utils'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import {
  Download, CloudArrowUp, FileZip, Copy, Sparkle, Check,
  Cloud, FileText,
} from '@phosphor-icons/react'
import type { Reel } from '@/lib/types'

export function ExportView({ reels }: { reels: Reel[] }) {
  const [target, setTarget] = useState<'local' | 'canva' | 'cloud'>('local')
  const [batch, setBatch] = useState(true)
  const [keepSrt, setKeepSrt] = useState(true)
  const [picked, setPicked] = useState<Set<string>>(new Set(reels.map((r) => r.id)))

  const togglePick = (id: string) => {
    const next = new Set(picked)
    if (next.has(id)) next.delete(id); else next.add(id)
    setPicked(next)
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6 w-full">
        <header className="space-y-2">
          <div className="eyebrow-md">08 · Exportar</div>
          <h1 className="text-[20px] font-bold tracking-[-0.012em] text-hi">
            Empaqueta y publica tus reels
          </h1>
        </header>

        <div className="grid grid-cols-12 gap-3">
          {/* Selección */}
          <Card className="col-span-12 lg:col-span-8 overflow-hidden p-0">
            <div className="px-5 h-12 flex items-center justify-between border-b border-subtle">
              <div className="flex items-center gap-2">
                <span className="eyebrow">Selección</span>
                <span className="font-mono text-[10px] tabular text-dim">
                  {picked.size} / {reels.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPicked(new Set(reels.map((r) => r.id)))}>
                  Todos
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPicked(new Set())}>
                  Ninguno
                </Button>
              </div>
            </div>
            <ul className="divide-y divide-subtle">
              {reels.map((r) => (
                <li
                  key={r.id}
                  className={cn(
                    'px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors',
                    picked.has(r.id) ? 'bg-base' : 'bg-inset/40 hover:bg-hover',
                  )}
                  onClick={() => togglePick(r.id)}
                >
                  <button
                    className={cn(
                      'h-4 w-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors',
                      picked.has(r.id)
                        ? 'bg-primary border-primary'
                        : 'bg-base border-strong',
                    )}
                    aria-label="Seleccionar"
                  >
                    {picked.has(r.id) && (
                      <Check size={10} weight="bold" className="text-primary-foreground" />
                    )}
                  </button>
                  <div
                    className="h-9 w-6 rounded-[5px] shrink-0"
                    style={{ background: r.thumbColor }}
                  />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] tracking-wider font-semibold text-faint">
                        {String(r.index).padStart(2, '0')}
                      </span>
                      <span className="text-[12px] font-medium text-hi truncate">
                        {r.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-dim flex items-center gap-1.5 font-mono">
                      <span>{formatTime(r.start)} → {formatTime(r.end)}</span>
                      <span className="text-faint">·</span>
                      <span>score {r.score.toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] tabular text-dim">
                    {formatTime(r.end - r.start)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Destino */}
          <div className="col-span-12 lg:col-span-4 space-y-3">
            <Card className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="eyebrow">Destino</div>
                <Tabs value={target} onValueChange={(v) => setTarget(v as typeof target)}>
                  <TabsList className="w-full grid grid-cols-3 h-8">
                    <TabsTrigger value="local" className="h-6 text-[11px]">
                      <Download size={11} weight="bold" />
                      Local
                    </TabsTrigger>
                    <TabsTrigger value="canva" className="h-6 text-[11px]">
                      <CloudArrowUp size={11} weight="bold" />
                      Canva
                    </TabsTrigger>
                    <TabsTrigger value="cloud" className="h-6 text-[11px]">
                      <Cloud size={11} weight="bold" />
                      Cloud
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-3">
                <Row
                  label="Empaquetar como ZIP"
                  hint="Un único archivo"
                  control={<Switch checked={batch} onCheckedChange={setBatch} />}
                />
                <Row
                  label="Incluir .srt"
                  hint="Subtítulos editables"
                  control={<Switch checked={keepSrt} onCheckedChange={setKeepSrt} />}
                />
              </div>

              <div className="rounded-[7px] bg-inset border border-subtle p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Sparkle size={11} weight="fill" className="text-amber-800" />
                  <span className="text-[11px] font-semibold text-hi">Resumen</span>
                </div>
                <ul className="text-[11px] text-mid space-y-1">
                  <li className="flex items-center justify-between">
                    <span className="text-dim">Clips</span>
                    <span className="tabular font-mono">{picked.size}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-dim">Formato</span>
                    <span className="font-mono">MP4 · 1080×1920</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-dim">Tamaño</span>
                    <span className="tabular font-mono">~{(picked.size * 12).toFixed(0)} MB</span>
                  </li>
                </ul>
              </div>

              <Button variant="primary" size="md" className="w-full" disabled={picked.size === 0}>
                {target === 'local' && (
                  <>
                    <FileZip size={13} weight="fill" />
                    Descargar {batch ? 'ZIP' : 'archivos'}
                  </>
                )}
                {target === 'canva' && (
                  <>
                    <CloudArrowUp size={13} weight="fill" />
                    Subir a Canva
                  </>
                )}
                {target === 'cloud' && (
                  <>
                    <Cloud size={13} weight="fill" />
                    Sincronizar
                  </>
                )}
              </Button>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="eyebrow mb-1">Compartir</div>
              <Button variant="outline" size="md" className="w-full justify-start">
                <Copy size={12} />
                Copiar enlace de revisión
              </Button>
              <Button variant="outline" size="md" className="w-full justify-start">
                <FileText size={12} />
                JSON con metadata
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({
  label, hint, control,
}: {
  label: string
  hint?: string
  control: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-0.5 min-w-0">
        <div className="text-[12px] font-medium text-hi">{label}</div>
        {hint && <p className="text-[10px] text-dim">{hint}</p>}
      </div>
      {control}
    </div>
  )
}
