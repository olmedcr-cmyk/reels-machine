# SpeedReels — UI rebuild

Frontend rehecho de SpeedReels, la herramienta que convierte videos largos en
reels cortos virales con un pipeline multimodal **Scout → Verify** que ahorra
~78% del coste de IA frente a procesar todo en Opus.

## Stack

- **React 19** + TypeScript + Vite 6
- **Tailwind CSS v4** (con `@tailwindcss/vite`)
- **shadcn/ui** (primitivas custom sobre Radix) — Button, Card, Input, Label, Slider, Switch, Tabs, Badge, Progress, Tooltip, Select, Separator, Toggle Group, Dialog, Scroll Area
- **Phosphor Icons** (`@phosphor-icons/react`) — weight `regular` por defecto, `duotone` sólo en hero
- Tipografía: **Geist** (sans) + **JetBrains Mono** (timecodes, scores, eyebrows)

## Design system

| Token              | Valor                                |
|--------------------|--------------------------------------|
| Grid base          | 8 px                                 |
| Padding canónico   | 24 px (`p-6`)                        |
| Gaps               | 8 / 16 / 24 px                       |
| Radii              | 8 / 16 / 24 px (sólo múltiplos de 8) |
| Paleta             | Escala zinc 50→950 desde el blanco   |
| Único acento       | **amarillo de marca** `#FFD60A` con texto negro |
| Font sizes         | 11 / 12 / 13 / 14 / 15 / 22 / 28 px  |

El amarillo de marca aparece **sólo** en CTAs primarios, indicadores live, badges
de score y resaltados puntuales — el resto es escala de grises sobre blanco.
Tokens definidos en `src/index.css`.

## Estructura

```
src/
├── App.tsx                  # orquesta vistas
├── main.tsx
├── index.css                # design system + tokens shadcn
├── components/
│   ├── Topbar.tsx           # h-16 · logo + nav + créditos + CTA
│   ├── Sidebar.tsx          # 256px · job activo + flujo + coste IA
│   ├── Logo.tsx
│   ├── UploadView.tsx       # 01 — dropzone + 4 cards de config
│   ├── PipelineView.tsx     # 06 — fases en vivo + telemetría
│   ├── ResultsView.tsx      # 07 — grid de reels + filtros
│   ├── ReelCard.tsx
│   ├── ClipDetail.tsx       # modal con player + 4 Yes Test
│   ├── ExportView.tsx       # 08 — selección + destino
│   └── ui/                  # shadcn primitives
└── lib/
    ├── api.ts               # /api/upload, /process, SSE /progress
    ├── icon.tsx             # wrapper Phosphor
    ├── mock.ts              # fases + reels demo
    ├── types.ts
    └── utils.ts
```

## Flujo en la UI

1. **Upload** — dropzone con marching-ants en drag, 4 tarjetas de configuración
   (Output, IA, Audio, Subtítulos). Sticky CTA con cost preview.
2. **Pipeline** — split 1fr/420px. Izquierda: lista vertical de las 10 fases
   (`EX-01`…`CT-01`) con dot indicator y progreso por fase. Derecha:
   meter de coste IA en vivo, señales agregadas (RMS, novelty, sentiment, onset),
   stream con códigos.
3. **Results** — grid responsive de `ReelCard`s (thumb 9:16 con waveform faux,
   hook tipo TikTok burnt-in, score chip amarillo, métricas multimodales).
   Toolbar con búsqueda, filtros y orden.
4. **ClipDetail** — modal 920px con player + transcripción + viral signals + 4 Yes Test.
5. **Export** — selección con checkboxes, destino (Local/Canva/Cloud), resumen.

## Cómo correrlo

```bash
cd SpeedReels
pnpm install      # o npm/yarn
pnpm dev
```

El frontend hace proxy de `/api` → `http://localhost:8000` (FastAPI backend de
`Cinemania/backend/server.py`). En modo demo, sin backend, la pipeline avanza
con un timer simulado y se cargan los reels de `lib/mock.ts`.

## Filosofía

> *Eficiente en recursos de IA pero punchy en virales*

- **Scout (Haiku)** propone 3× candidatos para no perder ninguno.
- **Verify (Sonnet/Opus)** corre sólo sobre los candidatos filtrados por el
  viral_score multimodal — el cost meter de la sidebar lo refleja en vivo.
- La UI prioriza la lectura del **score, hook y razón** antes que la duración
  total — para iterar rápido sin abrir cada clip.
