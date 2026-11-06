# SpeedReels — Pipeline Técnico Completo

> **Nota (nov 2026):** el paso 10 ya no usa Scout → Verify. Con `two_pass` activo, el motor ejecuta el modo **Director**: el ML local preselecciona las 25 mejores ventanas por `viral_score` y Claude (Sonnet por defecto) elige los N finales en una sola llamada, guiado por el *brief* del proyecto (`select_reels_with_director` en `reel_cutter.py`). El resto del documento sigue vigente.

> Documento de referencia sobre la mecánica interna de SpeedReels: cómo detecta, puntúa y corta reels virales automáticamente a partir de un video largo.

---

## Arquitectura General

```
Video largo (MP4/MOV)
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│  1. UPLOAD           Recibe archivo, genera jobId, mide duración │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. PIPELINE DE SEÑALES (paralelo al texto)                      │
│                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌──────────────┐            │
│   │ Audio WAV   │  │ Silencios   │  │ Energía RMS  │            │
│   │ 16kHz mono  │  │ -30dB       │  │ ventana 0.5s │            │
│   └─────────────┘  └─────────────┘  └──────────────┘            │
│                                                                  │
│   ┌──────────────────────────────────────────────────┐           │
│   │ Features Acústicas (librosa)                     │           │
│   │ • RMS dB  • Onset strength  • Pitch f0 (YIN)    │           │
│   │ • Spectral centroid (brillo)                     │           │
│   └──────────────────────────────────────────────────┘           │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. TRANSCRIPCIÓN — Deepgram Nova-2 (español)                    │
│     → utterances con timestamps palabra por palabra              │
│     → sentiment por utterance                                    │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. CONSTRUCCIÓN DE SEGMENTOS                                    │
│     → fusión de utterances en oraciones completas                │
│     → alineación con silencios detectados                        │
│     → anotación: energía, pitch, novelty, sentiment, viral score │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. IA — Dos Pasadas (Scout → Verify)                            │
│                                                                  │
│   Pasada 1 · SCOUT (Haiku)                                       │
│   → Recibe transcript anotado con emojis de score                │
│   → Propone 3× candidatos (generous, over-include)               │
│                                                                  │
│   Pasada 2 · VERIFY (Sonnet / Opus)                              │
│   → Aplica el "4 Yes Test" a cada candidato                      │
│   → Solo pasan clips con score ≥ 7/10                            │
│   → Genera: título, hook, razón                                  │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. CORTE — ffmpeg libx264                                       │
│     → original o vertical (9:16)                                 │
│     → título overlay (drawtext)                                  │
│     → subtítulos SRT palabra por palabra (estilo TikTok)         │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│  7. OUTPUT — Descarga directa o upload a Canva                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Paso 1 — Upload del Video

| Detalle | Valor |
|---------|-------|
| Endpoint | `POST /api/upload` |
| Formatos | MP4, MOV, AVI, MKV |
| Límite | 2 GB |
| Storage | Temporal en `$TMPDIR/cinemania_jobs/{job_id}/` |

Se genera un `jobId` aleatorio (12 chars hex). La duración se obtiene con:

```bash
ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 video.mp4
```

---

## Paso 2 — Extracción de Audio

```bash
ffmpeg -y -i video.mp4 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
```

Convierte a **WAV mono 16kHz** — el formato requerido tanto por Deepgram como por los análisis acústicos con librosa/numpy.

---

## Paso 3 — Detección de Silencios

```bash
ffmpeg -hide_banner -nostats -i audio.wav \
  -af "silencedetect=noise=-30dB:d=0.35" -f null -
```

- Threshold: **-30 dB** (configurable -50 a -15)
- Duración mínima de silencio: **0.35s** (configurable 0.15-1.0s)
- Parsea `silence_start:` y `silence_end:` del stderr con regex
- Resultado: lista de tuplas `(start, end)`

**Para qué sirve:** Los silencios se usan después para **alinear los bordes de los clips** a pausas naturales del habla, evitando cortar palabras a mitad de frase.

---

## Paso 4 — Energía RMS

1. Decodifica audio a PCM crudo vía ffmpeg pipe
2. Lee en array NumPy int16, normaliza a float32 [-1, 1]
3. Calcula RMS en ventanas de **0.5 segundos** (vectorizado)
4. Convierte a dB: `20 × log₁₀(max(rms, 1e-6))`

**Score por segmento:** Para cada segmento, extrae mean_db, peak_db y dynamic_range. Normaliza a 0-1 relativo al min/max global del video completo.

---

## Paso 5 — Features Acústicas (librosa)

Se ejecuta **una sola vez** sobre el audio completo:

| Feature | Función librosa | Qué mide |
|---------|-----------------|----------|
| RMS Energy | `librosa.feature.rms()` | Volumen / intensidad vocal |
| Onset Strength | `librosa.onset.onset_strength()` | Velocidad de habla / ataques |
| Pitch (f0) | `librosa.yin(fmin=75, fmax=400)` | Frecuencia fundamental de la voz |
| Spectral Centroid | `librosa.feature.spectral_centroid()` | Brillo / claridad de la voz |

Para cada segmento se extraen: `rms_mean_db`, `rms_peak_db`, `onset_mean`, `onset_density`, `pitch_mean_hz`, `pitch_var_hz`, `brightness`.

---

## Paso 6 — Transcripción (Deepgram Nova-2)

| Parámetro | Valor |
|-----------|-------|
| API | `https://api.deepgram.com/v1/listen` |
| Modelo | `nova-2` |
| Idioma | `es` (español) |
| Features | `smart_format`, `utterances`, `punctuate`, `sentiment` |

Resultado:
- **Utterances** con timestamps inicio/fin
- **Palabras individuales** con timestamps (para subtítulos)
- **Sentiment** por utterance (positivo/negativo/neutro + score numérico)

Fallback: si Deepgram falla, usa **OpenAI Whisper** local (modelo configurable: tiny/base/small/medium).

---

## Paso 7 — Novelty de Texto (TF-IDF)

- Usa `TfidfVectorizer` de scikit-learn con bigramas (`ngram_range=(1,2)`) y max 600 features
- Stop words en español personalizadas (~50 palabras)
- Calcula matriz de **similaridad coseno** entre todos los segmentos
- **Novelty = 1 - similaridad media normalizada**
  - 0 = texto repetitivo/genérico
  - 1 = texto único/quotable

Identifica qué frases son realmente diferentes del resto del video.

---

## Paso 8 — Construcción de Segmentos Limpios

Paso crítico que convierte utterances crudas en "unidades atómicas" que la IA puede seleccionar:

1. **Fusión de oraciones:** Acumula utterances consecutivas hasta encontrar un punto final (`.`, `!`, `?`) — así las sub-divisiones de Deepgram se convierten en oraciones completas
2. **Alineación a silencios:** Ajusta el inicio del segmento al `silence_end` más cercano y el fin al `silence_start` más cercano (tolerancia 1s)
3. **Anotación:** Cada segmento recibe: energy_score, acoustic features, sentiment, novelty y **viral_score**

---

## Paso 9 — Viral Score (puntuación multimodal)

Fórmula ponderada que combina todas las señales:

| Señal | Peso | Rango | Qué indica |
|-------|------|-------|------------|
| Energía RMS | **30%** | dB normalizado [-45, -10] → [0, 1] | Momentos de alta intensidad vocal |
| Novelty TF-IDF | **20%** | 0-1 directo | Frases únicas vs repetitivas |
| Varianza de Pitch | **15%** | std(f0) / 40 Hz | Variación melódica (emoción) |
| Sentiment | **15%** | \|score\| absoluto | Intensidad emocional (positiva o negativa) |
| Onset Density | **10%** | normalizado | Rapidez/urgencia del habla |
| Brightness | **10%** | centroid [800, 2300] Hz | Claridad vocal / excitement |

> Solo se cuentan los pesos de las features disponibles (degradación graceful si alguna falla).

---

## Paso 10 — IA: Scout → Verify (Dos Pasadas)

### Pasada 1: SCOUT (Claude Haiku)

- **Modelo:** `claude-haiku-4-5` (rápido, económico)
- **Candidatos:** `num_reels × 3` (mín 8, máx 15)
- **Estrategia:** Generoso, sobre-incluir — es mejor tener falsos positivos que perderse un buen clip

El transcript que recibe la IA está **anotado con emojis** indicando las señales:
- 🔥 / ⚡ / 💤 para viral score (alto / medio / bajo)
- 🟢 / 🔴 / 😐 para sentiment
- ⭐ para novelty alta
- `[SILENCIO 2.3s]` para pausas dramáticas

Respuesta: array JSON de `{start_segment, end_segment, rough_score, reason}`

### Pasada 2: VERIFY (Claude Sonnet / Opus)

- **Modelo:** Configurable (por defecto `claude-sonnet-4-6`)
- **Test de validación — "4 Yes Test":**

| # | Pregunta | Qué evalúa |
|---|----------|-------------|
| 1 | ¿La primera frase detiene el scroll? | Hook |
| 2 | ¿Cumple la promesa del hook? | Payoff |
| 3 | ¿Se entiende sin contexto? | Standalone |
| 4 | ¿Termina en oración completa? | Clean end |

- **Score:** (cantidad de "sí") × 2.5, máximo 10
- **Filtro:** Solo pasan clips con score **≥ 7** y veredicto `ACCEPT`
- Genera para cada clip: `title`, `hook`, `reason`

### Anti-patrones en los prompts

La IA tiene instrucciones explícitas de evitar:
- Empezar con conjunciones ("y entonces", "pero")
- Terminar en comas o frases incompletas
- Segmentos sin gancho inicial claro

Y buscar activamente:
- Números específicos ("el 95% se rinde en el mes 3")
- Negaciones fuertes ("nunca", "jamás")
- Confesiones ("fracasé tres años seguidos")
- Plot twists / giros narrativos

---

## Paso 11 — Corte con ffmpeg

```bash
ffmpeg -y -ss {start} -i video.mp4 -t {duration} \
  -vf "{scale},{drawtext},{subtitles}" \
  -c:v libx264 -preset fast -crf 23 \
  -c:a aac -b:a 128k \
  output.mp4
```

### Formatos de salida

| Formato | Scale | Resolución |
|---------|-------|------------|
| Original | `scale=trunc(iw/2)*2:trunc(ih/2)*2` | Mantiene original |
| Vertical (9:16) | `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920` | 1080×1920 |

### Título overlay (opcional)

Usa filtro `drawtext` con:
- Fondo negro semi-transparente (`box=1:boxcolor=black@0.6`)
- Posición configurable (top / center / bottom)
- Auto-detecta fuentes del sistema (Arial, Helvetica, Geneva en macOS; DejaVu en Linux)

---

## Paso 12 — Subtítulos Automáticos

> **Actualizado (nov 2026):** ahora son subtítulos de marca. Llevan Geomanist Black, no fuerzan mayúsculas y el director resalta en amarillo sus `highlight_phrases`. Se renderizan con Pillow y se superponen con `overlay`, y además se genera un `.ass` editable. Ver `Cinemania_files/subtitles.py` y el spec en `SpeedReels/docs/superpowers/specs/`. Lo que sigue describe la versión SRT anterior.

### Generación de SRT

- Usa **timestamps palabra por palabra** de Deepgram
- Agrupa en chunks de N palabras (por defecto 3, configurable 1-6)
- Formato SRT con tiempos relativos al inicio del clip
- Texto en **MAYÚSCULAS** por defecto (estilo TikTok/Reels)
- Fallback a nivel de utterance si no hay word timestamps

### Quemado en el video

```
subtitles='clip.srt':force_style='
  FontName=Arial,
  FontSize=18,
  PrimaryColour=&H00FFFFFF,
  OutlineColour=&H00000000,
  BorderStyle=1,
  Outline=3,
  Shadow=1,
  Alignment=2,
  MarginV=350,
  Bold=1
'
```

En formato vertical: FontSize más grande y más margen inferior.

---

## Paso 13 — Streaming de Progreso (SSE)

El pipeline corre en un **thread** del servidor FastAPI. El progreso se transmite al frontend en tiempo real vía **Server-Sent Events**:

| Código | Paso | Ejemplo de detail |
|--------|------|-------------------|
| `EX-01` | Extracción de audio | "wav 16kHz mono" |
| `SD-01` | Detección de silencios | "42 silencios detectados" |
| `EN-01` | Energía RMS | "1424 ventanas de 0.5s" |
| `AC-01` | Features acústicas | "pitch, onset, brightness" |
| `TR-01` | Transcripción | "87 segmentos transcritos" |
| `AI-01` | Scout → candidatos | "15 candidatos propuestos" |
| `AI-02` | Verify → selección | "5 reels aprobados" |
| `DONE` | Finalizado | Array JSON con todos los reels |
| `ERROR` | Error | Mensaje de error |

El frontend usa `EventSource` nativo del browser para consumir el stream.

---

## Paso 14 — Canva (Opcional)

- **API:** Canva Connect REST `POST /rest/v1/asset-uploads`
- Envía el video cortado como bytes crudos con `Content-Type: application/octet-stream`
- Título como base64 en header `Asset-Upload-Metadata`
- Límite: 100 MB por archivo
- Autenticación: OAuth 2.0 PKCE flow (token configurable en sidebar)

---

## Stack Tecnológico

### Backend
- **Python** con FastAPI + Uvicorn
- **ffmpeg / ffprobe** para audio/video
- **Deepgram Nova-2** para transcripción + sentiment
- **Claude AI** (Haiku + Sonnet/Opus) vía API directa
- **librosa** para features acústicas
- **NumPy** para energía RMS
- **scikit-learn** para TF-IDF / novelty
- **sse-starlette** para Server-Sent Events

### Frontend
- **React 19** + TypeScript + Vite
- **Tailwind CSS v4** con `@tailwindcss/vite`
- **shadcn/ui** (base-nova) componentes: Button, Input, Label, Slider, Switch, Select, Badge, Card, Progress, Tabs, Tooltip
- **Lucide React** para iconografía
- Design system propio con tokens zinc (`--bg-*`, `--bd-*`, `--tx-*`, `--am-*`)

---

## Flujo Completo (Ejemplo)

1. Usuario sube `entrevista_60min.mp4` (712s)
2. Se extrae audio WAV (16kHz mono)
3. Se detectan 42 silencios naturales
4. Se calculan 1424 ventanas de energía RMS
5. librosa analiza pitch, onsets y brillo en el audio completo
6. Deepgram transcribe 87 utterances con timestamps y sentiment
7. Se construyen ~45 segmentos limpios alineados a silencios
8. TF-IDF calcula novelty de cada segmento
9. Se computa viral_score multimodal para cada segmento
10. **Scout (Haiku)** propone 15 candidatos del transcript anotado
11. **Verify (Sonnet)** aplica 4 Yes Test → 5 reels pasan (score ≥ 7)
12. ffmpeg corta 5 clips con subtítulos palabra por palabra
13. Usuario descarga o sube a Canva
