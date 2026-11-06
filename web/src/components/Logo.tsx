import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Mark — cuadrado con un play/punta vertical en amarillo de marca */}
      <div className="relative h-7 w-7 rounded-[8px] bg-hi flex items-center justify-center">
        <span className="absolute inset-1.5 rounded-[6px] bg-fg" />
        <span className="relative h-3 w-[3px] bg-hi rounded-[2px]" />
        <span className="relative h-3 w-[3px] bg-hi rounded-[2px] ml-1" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[14px] font-semibold tracking-tight text-hi">Reels Machine</span>
      </div>
    </div>
  )
}
