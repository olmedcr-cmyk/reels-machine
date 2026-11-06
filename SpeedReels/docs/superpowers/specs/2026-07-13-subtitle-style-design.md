# Subtítulos de marca (estilo Geomanist + highlight IA) — Design

## Contexto

SpeedReels ya transcribe (Whisper/Deepgram) y quema subtítulos con FFmpeg
(`Cinemania_files/reel_cutter.py`), pero el estilo es genérico: fuente Arial,
`FontSize` fijo, `Bold=1`, `Shadow=1`, texto forzado a MAYÚSCULAS, un único
color, posición fija (`MarginV=350` en vertical). Esta feature reemplaza ese
estilo por el de la marca, visto en ejemplos reales de Instagram
Reels: fuente Geomanist, contorno negro duro sin sombra difusa, texto tal
cual se habla, y 1-3 palabras clave por bloque resaltadas en amarillo de
marca (`#FFD60A`), decidido por IA.

No se usa Remotion ni OpenMontage — todo sigue siendo FFmpeg/libass, cambiando
de SRT a ASS para poder colorear palabras sueltas dentro de una misma línea.

## Alcance

Incluye:
1. Estilo visual del subtítulo (fuente, color, contorno, case).
2. Selección de palabra(s) clave a resaltar, vía extensión del prompt Verify.
3. Migración del formato de subtítulo de SRT a ASS.
4. Control en la UI (tarjeta "Subtítulos" de `UploadView`) para posición
   vertical del bloque de subtítulos y padding lateral.

No incluye (fuera de alcance de este spec):
- B-rolls (se aborda en un spec aparte).
- Animación palabra-por-palabra tipo karaoke (descartado — el texto aparece
  en bloque completo, como en los ejemplos de referencia).
- Alineación horizontal (izquierda/derecha) — siempre centrado.

## 1. Estilo visual

- **Fuente**: `Geomanist-Black.otf` (la más gruesa disponible del pack
  aportado). El archivo se coloca en una carpeta `assets/fonts/` del backend
  y se registra para libass vía `fontsdir` en el filtro `subtitles=`.
- **Color de texto**: blanco `#FFFFFF`.
- **Contorno**: negro sólido, `Outline=3` (vertical) / `Outline=2`
  (horizontal), **sin** `Shadow` (se elimina `Shadow=1` del estilo actual).
- **Highlight**: amarillo de marca `#FFD60A` (mismo token que usa la UI),
  aplicado solo a las palabras marcadas como clave.
- **Case**: se elimina el `uppercase=True` — el texto se muestra tal cual lo
  transcribe el ASR (normalmente minúsculas con puntuación natural).
- **Tamaño y posición base**: se mantiene `FontSize` por formato
  (vertical/horizontal) como hoy, pero el `MarginV` por defecto sube
  respecto al actual (350px) para que el bloque quede a la altura de
  pecho/hombros en vertical, no pegado al borde inferior. Valor exacto se
  ajusta en implementación comparando contra las capturas de referencia.

## 2. Selección de highlight por IA

- Se extiende `VERIFY_PROMPT` (usado en `verify_candidates`,
  `reel_cutter.py:1091`) para pedir un campo adicional por candidato:
  `highlight_phrases: string[]` — de 1 a 3 palabras, **subcadena literal**
  del texto del candidato, la frase más impactante de todo el clip.
- No es una llamada de IA adicional: viaja en el mismo JSON de veredicto que
  ya devuelve `hook`, `title`, `reason`, `test_1_hook`, etc.
- `verify_candidates` propaga `highlight_phrases` en el dict de salida junto
  al resto de campos del reel.
- El campo viaja por el pipeline hasta el momento de generar el ASS (mismo
  camino que hoy sigue `reel["transcript"]` hasta `generate_srt_for_clip`).

### Matching en tiempo de subtitulado

Al trocear la transcripción en bloques de N palabras (troceo existente,
`words_per_chunk`, configurable como `subtitleWordsPerLine`), cada palabra
del bloque se compara (case-insensitive, sin acentos) contra
`highlight_phrases`. Si coincide, se envuelve con el tag de color ASS
correspondiente; si no, usa el color blanco por defecto del estilo.

Casos borde:
- Si `highlight_phrases` no aparece literalmente en la transcripción del
  clip (alucinación del modelo), no se resalta nada — no se lanza error, el
  subtítulo se genera igual solo en blanco.
- Si una frase de highlight cruza el límite de dos bloques de subtítulo, se
  resalta la parte de la frase que cae en cada bloque de forma independiente.

## 3. Migración SRT → ASS

- Nueva función `generate_ass_for_clip` (reemplaza `generate_srt_for_clip`)
  en `reel_cutter.py`:
  - Mismo troceo en bloques de `words_per_chunk` palabras y mismo cálculo de
    timestamps relativos al clip que la función actual.
  - Por cada bloque, genera una línea de diálogo ASS con tags inline
    `{\c&H0AD6FF&}` (BGR hex de `#FFD60A` — ASS invierte el orden RGB→BGR)
    alrededor de las palabras resaltadas y `{\c&HFFFFFF&}` para el resto.
  - Cabecera ASS (`[Script Info]`, `[V4+ Styles]`, `[Events]`) define el
    estilo base (fuente Geomanist Black, tamaño, contorno, sin sombra,
    alineación y márgenes — ver sección 4).
- `cut_and_title_clip` cambia el filtro de `subtitles='{srt}':force_style=...`
  a `subtitles='{ass}'` (el estilo ya va embebido en el propio `.ass`, no
  hace falta `force_style` salvo overrides puntuales de tamaño por formato).
- Los endpoints `/cut` y `/cut-one` en `backend/server.py` no cambian de
  contrato — siguen recibiendo `wordsPerSub` y generando el archivo de
  subtítulos internamente; solo cambia la extensión interna del archivo
  temporal (`.ass` en vez de `.srt`).

## 4. Control de posición en la UI

Nuevos campos en `ReelConfig` (`src/lib/types.ts`):

```ts
subtitlePosition: 'top' | 'center' | 'bottom'   // default: 'bottom'
subtitleSidePadding: number                      // px, default: 64
```

En la tarjeta "Subtítulos" de `UploadView` (o donde viva hoy
`burnSubtitles`/`subtitleWordsPerLine`):

- **Posición vertical**: `ToggleGroup` de 3 opciones (Arriba / Centro /
  Abajo), mismo patrón visual que `titlePosition` que ya existe para el
  título.
- **Padding lateral**: un `Slider` (componente ya disponible en
  `components/ui/slider.tsx`) de 0 a ~160px, con el valor numérico visible.

Mapeo a ASS:

| `subtitlePosition` | `Alignment` (numpad ASS) |
|---|---|
| `top`    | 8 |
| `center` | 5 |
| `bottom` | 2 |

`subtitleSidePadding` se mapea 1:1 a `MarginL` y `MarginR` en el estilo ASS
(simétrico). `MarginV` (offset respecto al borde superior/inferior según
`Alignment`) mantiene el valor por defecto ajustado en la sección 1, sin
control de UI adicional en esta iteración (queda para una futura si hace
falta más finura).

Estos dos campos se envían igual que el resto de `ReelConfig` en
`startAnalyze`/`cutOneReel`/`cutReels` (`lib/api.ts`), y el backend los
usa al construir la cabecera del `.ass`.

## Testing

- Verificación manual: generar un clip de prueba con `cut-one` y confirmar
  visualmente contorno, color, ausencia de sombra, y que el highlight caiga
  sobre las palabras correctas.
- Caso de highlight no encontrado en el texto (frase alucinada por la IA):
  confirmar que no rompe el render, solo no resalta nada.
- Los tres valores de `subtitlePosition` producen el offset esperado en
  vertical y horizontal.
- `subtitleSidePadding` en 0 y en el máximo no corta el texto ni lo saca del
  frame.

## Fuera de alcance / bloqueantes conocidos

- Licencia de Geomanist para uso en vídeo: la resuelve el usuario
  (fuente ya aportada en el pack `Geomanist-Complete-Desktop/`).
- Registro de la fuente para libass puede requerir ajustar `fontconfig` o
  usar `fontsdir` del filtro `subtitles=` — se resuelve en implementación,
  no cambia el diseño.
