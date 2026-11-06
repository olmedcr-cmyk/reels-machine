import { useEffect, useId, useState } from 'react'
import { F } from '@/frekvens'
import { getServerHealth } from '@/lib/api'
import { loadSettings } from '@/lib/settings'
import { formatBytes } from '@/lib/utils'

interface Props {
  onSelect: (file: File) => void
  error?: string | null
  onClearError?: () => void
  onSettingsClick?: () => void
}

const ACCEPT = 'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska'

/**
 * 01 · Subir. Composición Frekvens: título en dos líneas, un héroe (la zona
 * de puntos) y la tecla principal en el tercio inferior.
 * La zona usa las piezas de FileDrop (frk-drop / frk-file) con estado propio,
 * porque aquí se elige un único vídeo y la app tiene que saber si se quita.
 */
export function UploadVideoPage({ onSelect, error, onClearError, onSettingsClick }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [over, setOver] = useState(false)
  const inputId = useId()

  // Key en el navegador (⌘ ,) o en el .env del backend
  const [serverHasKey, setServerHasKey] = useState(false)
  useEffect(() => {
    let alive = true
    getServerHealth().then((h) => { if (alive) setServerHasKey(Boolean(h?.anthropic)) })
    return () => { alive = false }
  }, [])
  const hasApiKey = !!loadSettings().anthropicKey || serverHasKey

  const pick = (list: FileList | null | undefined) => {
    const f = list?.[0]
    if (f) setFile(f)
  }

  return (
    <div className="flex flex-col min-h-full" style={{ gap: 'var(--space-6)', paddingTop: 'var(--space-6)' }}>
      <F.Text variant="display-xl" as="h1" sub="La IA elige los mejores momentos">
        Sube un vídeo
      </F.Text>

      {error && (
        <F.Banner
          tone="error"
          title="No se pudo subir"
          action={onClearError ? { label: 'Cerrar', onClick: onClearError } : undefined}
        >
          {error}
        </F.Banner>
      )}

      <div className="frk-drop-wrap">
        <label
          htmlFor={inputId}
          className={`frk-drop${over ? ' is-over' : ''}`}
          style={{ minHeight: 280 }}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files) }}
        >
          <F.DotMatrix shape={over || file ? 'disc' : 'ring'} grid={11} dot={6} pitch={10} showOff label="" />
          <span className="frk-drop__title">
            {over ? 'Suelta para subir' : file ? 'Vídeo listo' : 'Arrastra tu vídeo'}
          </span>
          <span className="frk-drop__hint">o toca para elegir · MP4, MOV, AVI, MKV · hasta 2 GB</span>
          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="frk-sr"
            onChange={(e) => { pick(e.target.files); e.target.value = '' }}
          />
        </label>

        {file && (
          <div className="frk-file-sec">
            <span className="frk-field__label">Listo · 1</span>
            <ul>
              <li className="frk-file is-done">
                <span className="frk-file__icon" aria-hidden><F.Icon name="check" size={18} /></span>
                <span className="frk-file__main">
                  <span className="frk-file__name">{file.name}</span>
                  <span className="frk-file__meta">{formatBytes(file.size)} · {extOf(file.name)}</span>
                </span>
                <button
                  type="button"
                  className="frk-file__x"
                  aria-label={`Quitar ${file.name}`}
                  onClick={() => setFile(null)}
                >
                  <F.Icon name="close" size={16} />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Tercio inferior: aviso (si falta key) + tecla principal */}
      <div className="mt-auto flex flex-col" style={{ gap: 'var(--space-3)' }}>
        {!hasApiKey && (
          <F.Banner
            tone="info"
            title="Modo demo"
            action={onSettingsClick ? { label: 'Añadir key', onClick: onSettingsClick } : undefined}
          >
            Sin key de Anthropic verás reels de ejemplo. Añádela para analizar tu vídeo.
          </F.Banner>
        )}
        <F.KeyButton
          tone="klein"
          size="m"
          block
          icon="arrow-right"
          label={hasApiKey ? 'IA · DIRECTOR' : 'DEMO'}
          disabled={!file}
          onClick={() => file && onSelect(file)}
        >
          {hasApiKey ? 'Crear reels' : 'Ver demo'}
        </F.KeyButton>
      </div>
    </div>
  )
}

function extOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name)
  return m ? m[1].toUpperCase() : 'VÍDEO'
}
