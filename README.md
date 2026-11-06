<p align="center">
  <img src="docs/assets/hero.svg" alt="SpeedReels: un vídeo largo entra, reels virales salen" width="100%">
</p>

<p align="center">
  <b>Sube un vídeo largo y SpeedReels te devuelve los mejores momentos ya cortados en 9:16, con título y subtítulos.</b><br>
  Analiza el audio y el texto en tu máquina y llama a Claude una sola vez para elegir con criterio de editor.
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-09090b?logo=react&logoColor=FFD60A">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-09090b?logo=vite&logoColor=FFD60A">
  <img alt="Tailwind v4" src="https://img.shields.io/badge/Tailwind-v4-09090b?logo=tailwindcss&logoColor=FFD60A">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-SSE-09090b?logo=fastapi&logoColor=FFD60A">
  <img alt="FFmpeg" src="https://img.shields.io/badge/FFmpeg-libx264-09090b?logo=ffmpeg&logoColor=FFD60A">
  <img alt="Claude" src="https://img.shields.io/badge/Claude-Director-09090b?logo=anthropic&logoColor=FFD60A">
</p>

---

## Qué hace

1. **Subes** un podcast, una charla o una entrevista (MP4, MOV, AVI o MKV, hasta 2 GB).
2. **SpeedReels escucha**: detecta silencios, energía de la voz, tono, ritmo y frases que no se repiten, y transcribe con Deepgram o con Whisper en local.
3. **Puntúa cada frase** con un *viral score* multimodal y se queda con las 25 mejores ventanas.
4. **Claude actúa de director**: con tu *brief* elige los N clips que detienen el scroll, con hook, payoff, que se entiendan solos y que acaben en frase completa.
5. **FFmpeg corta** cada reel en 9:16 (1080×1920), con título y subtítulos quemados, listo para descargar o subir a Canva.

<p align="center">
  <img src="docs/assets/pipeline.svg" alt="Pipeline: upload, señales, viral score, director IA y corte" width="100%">
</p>

## Capturas

| Subir | Procesando | Reels listos |
|:--:|:--:|:--:|
| <img src="docs/assets/screen-selected.png" alt="Pantalla de subida"> | <img src="docs/assets/screen-processing.png" alt="Progreso en vivo"> | <img src="docs/assets/screen-results.png" alt="Grid de reels"> |

La **vista técnica** (`?debug=1`) muestra todos los parámetros: formato, duración, modelos, coste estimado, transcript y métricas por clip.

<p align="center"><img src="docs/assets/screen-debug.png" alt="Vista técnica" width="85%"></p>

## Puesta en marcha

Necesitas **macOS o Linux**, **Python 3.11+**, **Node 20.19+** y **FFmpeg**. El script de instalación pone FFmpeg con Homebrew si falta.

```bash
git clone <este-repo> speedreels && cd speedreels
./scripts/setup.sh     # venv Python + dependencias + pnpm install + .env
./scripts/dev.sh       # backend :8000 + frontend :5173
```

Abre **http://localhost:5173**.

> **Modo demo:** sin clave de Anthropic (ni en `.env` ni en la app) la interfaz recorre el pipeline simulado y muestra reels de ejemplo. Sirve para enseñar el producto sin gastar nada.

### Claves

Copia `.env.example` a `.env`. El script de instalación ya lo hace.

| Variable | Para qué | ¿Obligatoria? |
|---|---|---|
| `ANTHROPIC_API_KEY` | El director IA que elige los clips | Sí, para el modo real |
| `DEEPGRAM_API_KEY` | Transcripción rápida con sentimiento | No: si falta, se usa Whisper en local |

También puedes ponerlas en la app con <kbd>⌘</kbd> <kbd>,</kbd>. Se guardan sólo en tu navegador y tienen prioridad sobre el `.env`.

## Arquitectura

```
SpeedReels/          Frontend — React 19 · Vite · Tailwind v4 · shadcn/ui · Phosphor
  src/App.tsx          flujo simple: subir → procesando (SSE) → reels
  src/DebugApp.tsx     vista técnica completa (?debug=1)
  src/lib/api.ts       cliente REST + EventSource
backend/server.py    API FastAPI: upload · analyze (SSE) · cut-one · clips · video (Range) · health
Cinemania_files/     Motor: reel_cutter.py (señales, viral score, director IA, FFmpeg)
  app.py               interfaz Streamlit alternativa (la herramienta original)
  tests/               tests de detección (pytest)
docs/PIPELINE.md     documentación técnica paso a paso
scripts/             setup.sh · dev.sh
```

| Endpoint | Qué hace |
|---|---|
| `POST /api/upload` | Recibe el vídeo y devuelve `jobId` y duración |
| `POST /api/analyze` · `GET /api/analyze/stream/{id}` | Lanza el pipeline y emite el progreso por SSE (`EX-01` … `AI-02`, `DONE`) |
| `POST /api/cut-one` | Corta un reel bajo demanda (9:16 u original, título, subtítulos) |
| `GET /api/clips/{id}/{file}` | Descarga el clip |
| `GET /api/video/{id}` | *Streaming* del original con soporte de `Range` |
| `GET /api/health` | Estado del servidor y qué claves tiene en `.env` |

### El viral score

| Señal | Peso | Qué capta |
|---|---:|---|
| Energía RMS | 30 % | Momentos de intensidad vocal |
| Novelty TF-IDF | 20 % | Frases únicas frente a relleno repetido |
| Varianza de pitch | 15 % | Emoción en la voz |
| Sentimiento | 15 % | Intensidad, positiva o negativa |
| Densidad de onsets | 10 % | Ritmo y urgencia al hablar |
| Brillo espectral | 10 % | Claridad y entusiasmo |

Si alguna señal no está disponible, el score se recalcula sólo con las demás. El detalle completo está en [docs/PIPELINE.md](docs/PIPELINE.md).

## Otras formas de usarlo

```bash
# CLI: 5 reels verticales de 45–60 s
backend/.venv/bin/python Cinemania_files/reel_cutter.py mi_video.mp4 --num-reels 5 --min-duration 45 --max-duration 60

# Interfaz Streamlit original
backend/.venv/bin/pip install "streamlit>=1.28"
cd Cinemania_files && ../backend/.venv/bin/streamlit run app.py
```

## Desarrollo

```bash
(cd SpeedReels && pnpm build)                                 # type-check + build de producción
backend/.venv/bin/pip install pytest
backend/.venv/bin/python -m pytest -q Cinemania_files/tests   # tests del motor
```

El backend escucha en `127.0.0.1` por defecto. Para abrirlo a tu red local usa `HOST=0.0.0.0`.

## Hoja de ruta

- [ ] **Subtítulos de marca:** fuente Geomanist, contorno duro y 1-3 palabras clave en amarillo elegidas por la IA, pasando de SRT a ASS. Está diseñado en [`SpeedReels/docs/superpowers/specs/2026-07-13-subtitle-style-design.md`](SpeedReels/docs/superpowers/specs/2026-07-13-subtitle-style-design.md).
- [ ] La vista técnica todavía nombra las fases «Scout» y «Verify» del pipeline anterior; el motor ya usa el modo Director.
- [ ] Persistir los jobs: ahora viven en memoria y en `$TMPDIR/cinemania_jobs`.
