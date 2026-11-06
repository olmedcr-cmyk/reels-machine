import { Button } from './ui/button'
import { Plus } from '@phosphor-icons/react'

interface Props {
  /** Si está presente, muestra un CTA "Nuevo video" en el header. */
  onNewVideo?: () => void
  /** Header simplificado puede ocultarse en la pantalla de upload (ya tiene el branding). */
  showCta?: boolean
  children: React.ReactNode
}

export function SimpleAppShell({ onNewVideo, showCta = true, children }: Props) {
  return (
    <div className="h-screen w-screen flex flex-col bg-canvas overflow-hidden">
      <header className="h-14 border-b border-subtle bg-base shrink-0">
        <div className="px-6 h-full flex items-center justify-between" style={{ maxWidth: 960, marginLeft: 'auto', marginRight: 'auto' }}>
          <div className="flex items-center gap-2">
            <span className="block h-2 w-2 rounded-full bg-primary" />
            <span className="text-[15px] font-semibold tracking-[-0.012em] text-hi">
              Reels Machine
            </span>
          </div>

          {showCta && onNewVideo && (
            <Button variant="outline" size="md" onClick={onNewVideo}>
              <Plus size={13} weight="bold" />
              Nuevo video
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-base">
        <div className="h-full" style={{ maxWidth: 960, marginLeft: 'auto', marginRight: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
