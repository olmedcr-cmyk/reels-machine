#!/usr/bin/env bash
# Reels Machine — arranca backend (:8000) y frontend (:5173) juntos. Ctrl+C para todo.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -x backend/.venv/bin/python ] || { echo "Primero: ./scripts/setup.sh"; exit 1; }
if command -v pnpm >/dev/null 2>&1; then PM=pnpm; else PM="npx --yes pnpm@9"; fi

backend/.venv/bin/python backend/server.py &
API=$!
trap 'kill $API 2>/dev/null' EXIT INT TERM

printf "\n\033[1;33m▸ Reels Machine\033[0m  →  http://localhost:5173\n\n"
(cd web && $PM dev)
