# 🎬 Reel Cutter

Corta reels automáticamente de tus videos usando Whisper (local, gratis).
Opcionalmente sube los clips a tu librería de Canva.

---

## ⚡ Instalación rápida (Mac)

### 1. Instalar ffmpeg
```bash
brew install ffmpeg
```

### 2. Instalar dependencias Python
```bash
pip install openai-whisper requests
```

> Whisper descarga el modelo automáticamente la primera vez (~140MB para el modelo "base").

---

## 🚀 Uso básico

```bash
# Generar 3 reels verticales (9:16) de tu video
python reel_cutter.py mi_video.mp4

# Personalizar número y duración
python reel_cutter.py mi_video.mp4 --num-reels 5 --min-duration 45 --max-duration 60

# Mantener el formato original del video
python reel_cutter.py mi_video.mp4 --format original

# Especificar carpeta de salida
python reel_cutter.py mi_video.mp4 --output-dir ./mis_reels
```

---

## ☁️ Subir a Canva automáticamente

### Obtener tu token de Canva:
1. Ve a https://www.canva.com/developers/
2. Crea una app (tipo "Integration")
3. En "OAuth Scopes" activa: `asset:write`
4. Genera un token de acceso

```bash
# Con subida automática a Canva
python reel_cutter.py mi_video.mp4 --canva-token TU_TOKEN_AQUI
```

Los clips aparecerán en tu librería de Canva en:
**Proyectos → Subidas** (https://www.canva.com/folder/all-designs)

---

## 🎛️ Todas las opciones

| Opción | Default | Descripción |
|--------|---------|-------------|
| `--num-reels` | 3 | Número de reels a generar |
| `--min-duration` | 30 | Duración mínima en segundos |
| `--max-duration` | 90 | Duración máxima en segundos |
| `--format` | vertical | `vertical` (9:16) u `original` |
| `--output-dir` | `{video}_reels/` | Carpeta de salida |
| `--canva-token` | — | Token para subir a Canva |

---

## 📁 Archivos generados

```
mi_video_reels/
├── reel_01_mi_video.mp4    ← Clip con título
├── reel_02_mi_video.mp4
├── reel_03_mi_video.mp4
└── audio_temp_transcript.json  ← Transcripción completa
```

---

## 🧠 ¿Cómo detecta los mejores momentos?

1. **Transcribe** el audio con Whisper (modelo `base`)
2. **Detecta pausas** largas (>1 segundo) como puntos de corte naturales
3. **Mide la densidad** de palabras por segmento (momentos de más energía/actividad)
4. **Selecciona ventanas** de 30-90s con mayor puntuación que no se solapen
5. **Genera un título** a partir de las primeras palabras del segmento

---

## 🛠️ Requisitos

- Python 3.8+
- ffmpeg instalado (`brew install ffmpeg`)
- `openai-whisper` (`pip install openai-whisper`)
- `requests` (solo si usas Canva upload)
