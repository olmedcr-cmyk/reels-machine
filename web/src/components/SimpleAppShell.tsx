import { F } from '@/frekvens'

interface Props {
  /** Si está presente, muestra la tecla "Nuevo vídeo" arriba a la derecha. */
  onNewVideo?: () => void
  /** Abre los ajustes (también ⌘ ,). */
  onSettings?: () => void
  showCta?: boolean
  children: React.ReactNode
}

/**
 * Marco de la app en Frekvens: papel de fondo, el nombre compuesto en
 * Archivo 800 (el sistema no tiene logotipo) y las teclas de cabecera.
 */
export function SimpleAppShell({ onNewVideo, onSettings, showCta = true, children }: Props) {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--paper)' }}>
      <header className="shrink-0">
        <div
          className="mx-auto flex items-center justify-between gap-2"
          style={{ maxWidth: 1040, padding: 'var(--space-4) var(--space-5)' }}
        >
          <div className="flex items-center gap-3">
            <F.LED tone="klein" on />
            <span style={{ font: '800 20px/1 var(--font-sans)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              Reels Machine
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showCta && onNewVideo && (
              <F.KeyButton tone="paper" size="s" shape="pill" icon="plus" onClick={onNewVideo}>
                Nuevo vídeo
              </F.KeyButton>
            )}
            {onSettings && (
              <F.KeyButton
                tone="paper" size="s" shape="round" icon="dots"
                aria-label="Ajustes (⌘ ,)" title="Ajustes (⌘ ,)"
                onClick={onSettings}
              />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto min-h-full" style={{ maxWidth: 1040, padding: '0 var(--space-5) var(--space-6)' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
