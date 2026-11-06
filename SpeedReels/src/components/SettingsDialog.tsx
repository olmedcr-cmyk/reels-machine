import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { cn } from '@/lib/utils'
import {
  loadSettings, saveSettings, validateSettings, maskKey, DEFAULT_DIRECTOR_PROMPT,
  type Settings,
} from '@/lib/settings'
import { pingBackend } from '@/lib/api'
import {
  Eye, EyeSlash, Key, Plug, CheckCircle, WarningCircle,
  ArrowSquareOut, Sparkle, Microphone, Globe, Trash, ClosedCaptioning,
} from '@phosphor-icons/react'
import { SubtitleStyleControls } from './SubtitleStyleControls'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: Props) {
  const [s, setS] = useState<Settings>(() => loadSettings())
  const [tab, setTab] = useState<'keys' | 'prompt' | 'subs' | 'backend'>('keys')
  const [revealAnthropic, setRevealAnthropic] = useState(false)
  const [revealDeepgram, setRevealDeepgram] = useState(false)
  const [healthStatus, setHealthStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle')

  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) setS(loadSettings())
    wasOpen.current = open
  }, [open])

  const issues = useMemo(() => validateSettings(s), [s])
  const dirty = useMemo(() => JSON.stringify(s) !== JSON.stringify(loadSettings()), [s])

  const setField = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setS((prev) => ({ ...prev, [k]: v }))

  const handleSave = () => { saveSettings(s); onOpenChange(false) }
  const handleReset = () => { setS(loadSettings()) }

  const checkHealth = async () => {
    setHealthStatus('checking')
    const ok = await pingBackend()
    setHealthStatus(ok ? 'ok' : 'fail')
  }

  const prompt = s.directorPrompt ?? DEFAULT_DIRECTOR_PROMPT

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] p-0 overflow-hidden">
        <div className="px-8 pt-8 pb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[12px] bg-inset border border-subtle flex items-center justify-center">
              <Key size={16} weight="duotone" className="text-mid" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Configuración</DialogTitle>
              <DialogDescription>
                Tus API keys se guardan localmente en este navegador (localStorage).
                Nunca se envían a un servidor de Anthropic — sólo a tu backend FastAPI.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="keys">
                <Key size={12} weight="bold" />
                API keys
              </TabsTrigger>
              <TabsTrigger value="prompt">
                <Sparkle size={12} weight="bold" />
                Prompt
              </TabsTrigger>
              <TabsTrigger value="subs">
                <ClosedCaptioning size={12} weight="bold" />
                Subtítulos
              </TabsTrigger>
              <TabsTrigger value="backend">
                <Plug size={12} weight="bold" />
                Backend
              </TabsTrigger>
            </TabsList>

            {/* API Keys */}
            <TabsContent value="keys" className="space-y-6">
              <KeyField
                label="Anthropic"
                hint="Para Scout (Haiku) y Verify (Sonnet/Opus). Obtené una en console.anthropic.com"
                placeholder="sk-ant-api03-…"
                icon={Sparkle}
                value={s.anthropicKey}
                onChange={(v) => setField('anthropicKey', v)}
                reveal={revealAnthropic}
                onToggleReveal={() => setRevealAnthropic((x) => !x)}
                href="https://console.anthropic.com/settings/keys"
              />

              <KeyField
                label="Deepgram"
                hint="Para transcripción Nova-2 con timestamps por palabra. Si la dejás vacía, usa Whisper local (más lento)."
                placeholder="dg-…"
                icon={Microphone}
                value={s.deepgramKey}
                onChange={(v) => setField('deepgramKey', v)}
                reveal={revealDeepgram}
                onToggleReveal={() => setRevealDeepgram((x) => !x)}
                href="https://console.deepgram.com/"
                optional
              />

              {issues.length > 0 && (
                <div className="rounded-[12px] border border-subtle bg-inset p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <WarningCircle size={14} weight="fill" className="text-hi" />
                    <span className="text-[12px] font-medium text-hi">Avisos</span>
                  </div>
                  <ul className="text-[12px] text-dim space-y-1 pl-5 list-disc">
                    {issues.map((it, i) => <li key={i}>{it}</li>)}
                  </ul>
                </div>
              )}
            </TabsContent>

            {/* Director Prompt */}
            <TabsContent value="prompt" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prompt del director</Label>
                    <p className="text-[11px] text-dim mt-0.5 leading-relaxed">
                      Define cómo la IA selecciona los mejores momentos. Se aplica a cada análisis.
                    </p>
                  </div>
                  <button
                    onClick={() => setField('directorPrompt', DEFAULT_DIRECTOR_PROMPT)}
                    className="text-[11px] text-dim hover:text-hi transition-colors underline underline-offset-4 shrink-0 ml-4"
                  >
                    Restaurar default
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setField('directorPrompt', e.target.value)}
                  rows={14}
                  className="w-full rounded-[9px] border border-subtle bg-base text-hi text-[12px] leading-relaxed p-3 resize-none focus-visible:outline-none focus-visible:border-strong transition-colors font-mono"
                  spellCheck={false}
                />
                <p className="text-[10px] text-faint text-right font-mono">
                  {prompt.length} chars
                </p>
              </div>
            </TabsContent>

            {/* Subtítulos de marca */}
            <TabsContent value="subs" className="space-y-4">
              <SubtitleStyleControls
                value={{
                  position: s.subtitlePosition,
                  sidePadding: s.subtitleSidePadding,
                  wordsPerLine: s.subtitleWordsPerLine,
                }}
                onChange={(v) => setS((prev) => ({
                  ...prev,
                  subtitlePosition: v.position,
                  subtitleSidePadding: v.sidePadding,
                  subtitleWordsPerLine: v.wordsPerLine,
                }))}
              />
            </TabsContent>

            {/* Backend */}
            <TabsContent value="backend" className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe size={13} className="text-mid" />
                  <Label>URL base del backend</Label>
                </div>
                <Input
                  value={s.apiBaseUrl}
                  onChange={(e) => setField('apiBaseUrl', e.target.value)}
                  placeholder="/api"
                  className="font-mono"
                />
                <p className="text-[11px] text-dim leading-relaxed">
                  En desarrollo, dejá <span className="font-mono text-hi">/api</span> y Vite hace
                  proxy a <span className="font-mono text-hi">localhost:8000</span>.
                </p>
              </div>

              <div className="rounded-[12px] border border-subtle bg-inset p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-medium text-hi">Test de conexión</div>
                    <p className="text-[11px] text-dim">
                      Verifica que el backend responde en{' '}
                      <span className="font-mono text-hi">{s.apiBaseUrl}</span>
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={checkHealth}
                    disabled={healthStatus === 'checking'}
                  >
                    {healthStatus === 'checking' ? 'Probando…' : 'Probar'}
                  </Button>
                </div>

                {healthStatus !== 'idle' && (
                  <div
                    className={cn(
                      'flex items-center gap-2 text-[12px] px-3 py-2 rounded-[8px]',
                      healthStatus === 'ok' && 'bg-inset border border-subtle',
                      healthStatus === 'fail' && 'bg-base border border-subtle text-hi',
                    )}
                  >
                    {healthStatus === 'ok' && <CheckCircle size={13} weight="fill" className="text-green" />}
                    {healthStatus === 'fail' && <WarningCircle size={13} weight="fill" />}
                    {healthStatus === 'ok' && 'Backend respondiendo correctamente'}
                    {healthStatus === 'fail' && 'No se pudo conectar — ¿está corriendo el server?'}
                  </div>
                )}
              </div>

              <div className="rounded-[12px] border border-subtle bg-inset p-5 space-y-3">
                <div className="text-[12px] font-medium text-hi">Cómo arrancar el backend</div>
                <pre className="text-[11px] font-mono text-mid bg-base border border-subtle rounded-[8px] p-3 leading-relaxed overflow-auto">
{`cd Cinemania/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-hairline bg-panel flex items-center justify-between gap-4">
          <div className="text-[11px] text-dim">
            {s.anthropicKey ? (
              <span className="font-mono">
                Anthropic: <span className="text-hi">{maskKey(s.anthropicKey)}</span>
              </span>
            ) : (
              <span>Sin Anthropic key — IA deshabilitada</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={handleReset} disabled={!dirty}>
              <Trash size={12} />
              Descartar
            </Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface KeyFieldProps {
  label: string
  hint: string
  placeholder: string
  icon: typeof Sparkle
  value: string
  onChange: (v: string) => void
  reveal: boolean
  onToggleReveal: () => void
  href: string
  optional?: boolean
}

function KeyField({
  label, hint, placeholder, icon: I, value, onChange, reveal, onToggleReveal, href, optional,
}: KeyFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <I size={13} className="text-mid" />
          <Label>{label}</Label>
          {optional && <Badge variant="outline" className="font-mono">opcional</Badge>}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-dim hover:text-hi inline-flex items-center gap-1 transition"
        >
          Obtener key
          <ArrowSquareOut size={11} />
        </a>
      </div>

      <div className="relative">
        <Input
          type={reveal ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10 font-mono text-[12px]"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={onToggleReveal}
          type="button"
          aria-label={reveal ? 'Ocultar' : 'Mostrar'}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-faint hover:text-hi transition"
        >
          {reveal ? <EyeSlash size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <p className="text-[11px] text-dim leading-relaxed">{hint}</p>
    </div>
  )
}
