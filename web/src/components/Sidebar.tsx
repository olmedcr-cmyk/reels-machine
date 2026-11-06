import { cn } from '@/lib/utils'
import {
  UploadSimple,
  Pulse,
  Scissors,
  Download,
  FileText,
  TrendUp,
  LinkSimple,
  type Icon,
} from '@phosphor-icons/react'

export type ViewKey = 'upload' | 'pipeline' | 'results' | 'export'

interface NavItem {
  key: ViewKey
  label: string
  icon: Icon
  badge?: 'live' | string
  count?: string
}

const FLOW: NavItem[] = [
  { key: 'upload',   label: 'Source',     icon: UploadSimple },
  { key: 'pipeline', label: 'Pipeline',   icon: Pulse, badge: 'live' },
  { key: 'results',  label: 'Reels',      icon: Scissors, count: '5' },
  { key: 'export',   label: 'Exportar',   icon: Download },
]

const INSPECTION: { label: string; icon: Icon }[] = [
  { label: 'Transcript', icon: FileText },
  { label: 'Métricas',   icon: TrendUp },
]

export function Sidebar({
  active,
  onChange,
  jobName,
}: {
  active: ViewKey
  onChange: (k: ViewKey) => void
  jobName?: string
}) {
  return (
    <aside className="w-[220px] shrink-0 border-r border-subtle bg-panel flex flex-col">
      {/* Project */}
      <Section padded>
        <div className="eyebrow mb-1">Proyecto activo</div>
        <div className="text-[12px] text-dim truncate">
          {jobName || 'Ningún video cargado'}
        </div>
      </Section>

      {/* Flow */}
      <Section className="py-3 px-2">
        <div className="eyebrow px-2 pb-1.5">Flujo</div>
        <ul className="space-y-0.5">
          {FLOW.map((it) => (
            <NavRow
              key={it.key}
              item={it}
              active={active === it.key}
              onClick={() => onChange(it.key)}
            />
          ))}
        </ul>
      </Section>

      {/* Inspección */}
      <Section className="py-3 px-2 flex-1">
        <div className="eyebrow px-2 pb-1.5">Inspección</div>
        <ul className="space-y-0.5">
          {INSPECTION.map((it) => (
            <li key={it.label}>
              <button
                disabled
                className="w-full h-8 px-2 rounded-[6px] flex items-center gap-2 text-[13px] font-medium text-dim opacity-60 cursor-not-allowed"
              >
                <it.icon size={14} />
                <span>{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {/* Footer */}
      <div className="border-t border-subtle px-4 py-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Coste IA · Job</span>
          <span className="font-mono text-[13px] font-semibold text-hi tabular">$0.11</span>
        </div>
        <p className="text-[10px] text-faint leading-tight">
          Scout Haiku ahorra ~78% vs. Opus
        </p>

        <button className="mt-2 w-full h-7 px-2 rounded-[5px] border border-subtle bg-base hover:bg-hover transition flex items-center gap-1.5">
          <LinkSimple size={12} className="text-faint" />
          <span className="text-[11px] font-medium text-dim">Conectar Canva</span>
          <span className="ml-auto font-mono text-[9px] text-faint">opt</span>
        </button>
      </div>
    </aside>
  )
}

function Section({
  children, className, padded,
}: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <div
      className={cn(
        'border-b border-subtle',
        padded && 'px-4 py-3.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

function NavRow({
  item, active, onClick,
}: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          'w-full h-8 px-2 rounded-[6px] flex items-center justify-between gap-2',
          'text-[13px] transition-colors',
          active
            ? 'bg-inset text-hi font-semibold'
            : 'text-dim hover:bg-hover hover:text-hi font-medium',
        )}
      >
        <span className="flex items-center gap-2">
          <item.icon size={14} weight={active ? 'fill' : 'regular'} />
          <span>{item.label}</span>
        </span>
        {item.badge === 'live' && (
          <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-[3px] bg-green text-white font-mono text-[8px] font-bold tracking-wider">
            LIVE
          </span>
        )}
        {item.count && (
          <span className="font-mono text-[11px] tabular text-faint">{item.count}</span>
        )}
      </button>
    </li>
  )
}
