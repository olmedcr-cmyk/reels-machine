/** Amarillo que se quema en el MP4 (marca del cliente, no un token de la UI). */
export const SUBTITLE_YELLOW = '#FFD60A'

const norm = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

/**
 * Réplica en CSS del subtítulo quemado por `engine/subtitles.py`:
 * Geomanist Black (o Archivo 800 si no está instalada), blanco con contorno
 * negro duro, sin sombra, y las palabras clave del director en amarillo.
 */
export function BrandSubtitle({
  text, highlight = [], size = 22,
}: { text: string; highlight?: string[]; size?: number }) {
  const hot = new Set(highlight.flatMap((h) => h.split(/\s+/).map(norm)))
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span
      style={{
        fontFamily: 'Geomanist, var(--font-sans)',
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.15,
        color: '#fff',
        WebkitTextStroke: `${Math.max(1, size / 11)}px #000`,
        paintOrder: 'stroke fill',
      }}
    >
      {words.map((w, i) => (
        <span key={i} style={hot.has(norm(w)) ? { color: SUBTITLE_YELLOW } : undefined}>
          {w}{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

export function firstWords(text: string, n: number) {
  if (!text) return 'clip'
  return text.split(/\s+/).slice(0, n).join(' ')
}
