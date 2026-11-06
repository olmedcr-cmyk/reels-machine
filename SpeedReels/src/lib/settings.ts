// API keys + endpoint config — persisted in localStorage.

const STORAGE_KEY = 'speedreels.settings.v1'

export interface Settings {
  anthropicKey: string
  deepgramKey: string
  apiBaseUrl: string
  directorPrompt: string
  /** Subtítulos de marca (Geomanist + highlight IA) */
  subtitlePosition: SubtitlePosition
  subtitleSidePadding: number   // px a cada lado, 0–160
  subtitleWordsPerLine: number  // palabras por bloque, 1–6
}

export type SubtitlePosition = 'top' | 'center' | 'bottom'

export const DEFAULT_DIRECTOR_PROMPT = `Sos un director de contenido con 10 años de experiencia creando videos virales para TikTok, Instagram Reels y YouTube Shorts. Tu trabajo es identificar los momentos más poderosos de una conversación o video largo y convertirlos en clips independientes que paren el scroll.

BUSCÁ ACTIVAMENTE:
• Hooks que generen curiosidad en los primeros 3 segundos
• Números concretos y estadísticas sorprendentes ("el 80% de los emprendedores...")
• Confesiones o revelaciones personales ("me costó 3 años entender que...")
• Giros narrativos o contradicciones inesperadas
• Afirmaciones fuertes o contrarias al sentido común
• Frases que funcionen como quote — algo que la gente quiera compartir o guardar

DESCARTÁ:
• Clips que empiecen con conjunciones ("y...", "pero...", "entonces...")
• Clips que terminen con frases incompletas o en coma
• Clips que no se entiendan sin ver el resto del video
• Momentos de relleno, transiciones o saludos

TEST DE CALIDAD — cada clip debe responder SÍ a las 4 preguntas:
1. ¿La primera oración detiene el scroll?
2. ¿El clip cumple la promesa del hook?
3. ¿Se entiende sin contexto previo?
4. ¿Termina en una oración completa?

Seleccioná solo clips que superen el test con puntuación ≥ 7/10.`

const DEFAULTS: Settings = {
  anthropicKey: '',
  deepgramKey: '',
  apiBaseUrl: '/api',
  directorPrompt: DEFAULT_DIRECTOR_PROMPT,
  subtitlePosition: 'bottom',
  subtitleSidePadding: 64,
  subtitleWordsPerLine: 3,
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return DEFAULTS
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Lightweight validation — returns array of human-readable issues. */
export function validateSettings(s: Settings): string[] {
  const issues: string[] = []
  if (s.anthropicKey && !/^sk-ant-/.test(s.anthropicKey.trim())) {
    issues.push('La key de Anthropic suele empezar con "sk-ant-"')
  }
  if (s.deepgramKey && s.deepgramKey.trim().length < 30) {
    issues.push('La key de Deepgram parece muy corta')
  }
  if (!s.apiBaseUrl) {
    issues.push('Falta la URL base del backend')
  }
  return issues
}

export function maskKey(key: string): string {
  if (!key) return ''
  if (key.length <= 12) return '•'.repeat(key.length)
  return `${key.slice(0, 8)}${'•'.repeat(8)}${key.slice(-4)}`
}
