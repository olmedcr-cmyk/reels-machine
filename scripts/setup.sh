#!/usr/bin/env bash
# SpeedReels — instalación en un paso (macOS / Linux)
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf "\033[1;33m▸\033[0m %s\n" "$1"; }

# 1. ffmpeg
if ! command -v ffmpeg >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    say "Instalando ffmpeg con Homebrew…"; brew install ffmpeg
  else
    echo "✗ Falta ffmpeg. Instálalo (https://ffmpeg.org/download.html) y vuelve a ejecutar."; exit 1
  fi
fi
say "ffmpeg OK — $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"

# 2. Backend (Python venv)
PY="${PYTHON:-python3}"
if [ ! -x backend/.venv/bin/python ]; then
  say "Creando entorno Python en backend/.venv…"
  "$PY" -m venv --clear backend/.venv
fi
say "Instalando dependencias Python…"
backend/.venv/bin/python -m pip install --upgrade pip -q
backend/.venv/bin/python -m pip install -r backend/requirements.txt -q

# 3. Frontend
if command -v pnpm >/dev/null 2>&1; then PM=pnpm; else PM="npx --yes pnpm@9"; fi
say "Instalando dependencias del frontend…"
(cd SpeedReels && $PM install)

# 4. .env
[ -f .env ] || { cp .env.example .env; say "Creado .env — añade tus claves (opcional)"; }

say "Listo. Arranca con: ./scripts/dev.sh"
