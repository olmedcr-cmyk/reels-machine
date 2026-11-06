#!/bin/bash
# 🎬 Reel Cutter — Setup rápido para Mac

echo "════════════════════════════════════"
echo "🎬 Reel Cutter — Instalación"
echo "════════════════════════════════════"

# Verificar Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew no encontrado."
    echo "   Instálalo en: https://brew.sh"
    exit 1
fi

# Instalar ffmpeg si no está
if ! command -v ffmpeg &> /dev/null; then
    echo "📦 Instalando ffmpeg..."
    brew install ffmpeg
else
    echo "✅ ffmpeg ya instalado: $(ffmpeg -version 2>&1 | head -1)"
fi

# Instalar dependencias Python
echo ""
echo "📦 Instalando dependencias Python..."
pip install openai-whisper requests "streamlit>=1.28" --quiet

echo ""
echo "════════════════════════════════════"
echo "✅ ¡Todo listo!"
echo "════════════════════════════════════"
echo ""
echo "Interfaz web:"
echo "  streamlit run app.py"
echo ""
echo "CLI:"
echo "  python reel_cutter.py tu_video.mp4"
echo ""
echo "Con subida a Canva:"
echo "  python reel_cutter.py tu_video.mp4 --canva-token TU_TOKEN"
