import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Key, Upload } from '@phosphor-icons/react'

export function Topbar({
  creditsUsd = 4.82,
  onUpload,
  onSettings,
  hasKeys,
}: {
  creditsUsd?: number
  onUpload?: () => void
  onSettings?: () => void
  hasKeys?: boolean
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <header className="h-12 px-4 flex items-center justify-between border-b border-subtle bg-base shrink-0">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <span className="block h-2 w-2 rounded-full bg-primary" />
            <span className="text-[15px] font-semibold tracking-[-0.012em] text-hi">
              SpeedReels
            </span>
          </div>

          <span className="h-5 w-px bg-subtle" />

          {/* Tabs */}
          <nav className="flex items-center gap-0.5">
            <TabBtn active>Studio</TabBtn>
            <TabBtn>Biblioteca</TabBtn>
            <TabBtn>Plantillas</TabBtn>
            <TabBtn>API</TabBtn>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-dim tabular">
            ${creditsUsd.toFixed(2)} / mes
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onSettings}
                className={cn(
                  'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[5px] border text-[11px] font-medium transition-colors',
                  hasKeys
                    ? 'border-subtle bg-base text-mid hover:bg-hover'
                    : 'border-subtle bg-base text-dim hover:bg-hover',
                )}
              >
                <Key size={12} />
                API Keys
                {!hasKeys && <span className="h-1 w-1 rounded-full bg-amber-700" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {hasKeys ? 'Configuración' : 'Configurar tus keys'}
            </TooltipContent>
          </Tooltip>

          <Button variant="primary" size="sm" onClick={onUpload}>
            <Upload size={13} weight="bold" />
            Subir video
          </Button>
        </div>
      </header>
    </TooltipProvider>
  )
}

function TabBtn({
  children, active,
}: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={cn(
        'h-7 px-2.5 rounded-[5px] text-[12px] font-medium transition-colors',
        active
          ? 'bg-inset text-hi font-semibold'
          : 'text-dim hover:text-hi hover:bg-hover',
      )}
    >
      {children}
    </button>
  )
}
