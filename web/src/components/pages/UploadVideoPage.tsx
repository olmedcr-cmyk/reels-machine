import { useCallback, useEffect, useRef, useState } from 'react'
import { getServerHealth } from '@/lib/api'
import { cn, formatBytes } from '@/lib/utils'
import { Button } from '../ui/button'
import { loadSettings } from '@/lib/settings'
import {
  CloudArrowUp, FileVideo, Trash, ArrowRight, GearSix,
} from '@phosphor-icons/react'

interface Props {
  onSelect: (file: File) => void
  error?: string | null
  onClearError?: () => void
  onSettingsClick?: () => void
}

const ACCEPT = 'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska'

export function UploadVideoPage({ onSelect, error, onClearError, onSettingsClick }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Key en el navegador (⌘ ,) o en el .env del backend
  const [serverHasKey, setServerHasKey] = useState(false)
  useEffect(() => {
    let alive = true
    getServerHealth().then((h) => { if (alive) setServerHasKey(Boolean(h?.anthropic)) })
    return () => { alive = false }
  }, [])
  const hasApiKey = !!loadSettings().anthropicKey || serverHasKey

  const handleFile = (f: File | null) => f && setFile(f)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }, [])

  const submit = () => { if (file) onSelect(file) }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-6 pb-5 shrink-0">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-hi leading-[1.2]">
          Creá reels automáticamente
        </h1>
        <p className="text-[13px] text-dim mt-1">
          Subí un video largo y la IA selecciona los mejores momentos.
        </p>

        {error && (
          <div
            className="mt-4 rounded-[9px] px-4 py-3 flex items-start justify-between gap-4 border text-[12px]"
            style={{ background: 'var(--amber-100)', borderColor: 'var(--amber-200)', color: 'var(--amber-800)' }}
          >
            <span className="leading-relaxed">{error}</span>
            {onClearError && (
              <button onClick={onClearError} className="font-medium hover:underline underline-offset-4 shrink-0">
                Cerrar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Drop zone — ocupa el espacio disponible */}
      <div className="flex-1 px-8 min-h-0">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'h-full bento-cell flex flex-col',
            dragging ? 'dropzone-active' : '',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          {!file ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center gap-5 p-10 text-mid hover:text-hi transition-colors"
            >
              <div className="h-16 w-16 rounded-[16px] bg-base border border-subtle flex items-center justify-center">
                <CloudArrowUp size={28} weight="regular" className="text-mid" />
              </div>
              <div className="text-center space-y-2">
                <div className="text-[16px] font-semibold text-hi">Arrastrá tu video aquí</div>
                <div className="text-[13px] text-dim">
                  o{' '}
                  <span className="text-hi font-medium underline underline-offset-4">
                    elegí un archivo
                  </span>
                </div>
              </div>
              <div className="font-mono text-[10px] text-faint tracking-wide">
                MP4 · MOV · AVI · MKV · hasta 2 GB
              </div>
            </button>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10">
              <div className="h-20 w-28 rounded-[12px] bg-hi flex items-center justify-center">
                <FileVideo size={28} weight="duotone" className="text-base" />
              </div>
              <div className="text-center space-y-1 max-w-[320px]">
                <div className="text-[15px] font-semibold text-hi truncate">{file.name}</div>
                <div className="font-mono text-[11px] text-dim">
                  {formatBytes(file.size)}{file.type ? ` · ${file.type.split('/')[1].toUpperCase()}` : ''}
                </div>
              </div>
              <button
                onClick={() => { setFile(null); inputRef.current?.click() }}
                className="inline-flex items-center gap-1.5 text-[12px] text-dim hover:text-hi transition-colors"
              >
                <Trash size={12} />
                Cambiar video
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer: API key status + CTA */}
      <div className="px-8 py-5 shrink-0 space-y-3">
        {/* API key status row */}
        {!hasApiKey ? (
          <div className="flex items-center justify-between rounded-[10px] bg-inset border border-subtle px-4 py-3">
            <div>
              <div className="text-[12px] font-medium text-hi">Falta configurar la API key</div>
              <div className="text-[11px] text-dim">Necesitás una key de Anthropic para analizar el video</div>
            </div>
            <Button variant="outline" size="sm" onClick={onSettingsClick} className="shrink-0 ml-4">
              <GearSix size={13} />
              Configurar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="block h-2 w-2 rounded-full bg-green" />
              <span className="text-[12px] text-dim">API key configurada</span>
            </div>
            <button
              onClick={onSettingsClick}
              className="text-[11px] text-faint hover:text-hi transition-colors"
            >
              ⌘ , para configuración
            </button>
          </div>
        )}

        {/* CTA */}
        <Button
          variant="primary"
          size="xl"
          onClick={submit}
          disabled={!file}
          className="w-full"
        >
          {!hasApiKey && file ? 'Ver demo' : 'Analizar video'}
          <ArrowRight size={14} weight="bold" />
        </Button>
      </div>
    </div>
  )
}
