#!/usr/bin/env python3
"""SpeedReels — Genera reels automáticos en segundos."""

import os
import sys
import tempfile
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).parent))

from reel_cutter import (
    DEFAULT_AI_PROMPT,
    compute_acoustic_features,
    compute_audio_energy,
    cut_and_title_clip,
    detect_reel_segments,
    detect_reel_segments_ai,
    detect_silences,
    extract_audio,
    format_duration,
    generate_srt_for_clip,
    generate_title,
    get_video_duration,
    transcribe_audio,
    transcribe_audio_deepgram,
    upload_to_canva,
)


# ─── Page config ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="SpeedReels",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Design tokens (shadcn/ui · zinc) ────────────────────────────────────────
BG          = "#ffffff"
CARD        = "#ffffff"
CARD_HOVER  = "#f4f4f5"   # zinc-100
BORDER      = "#e4e4e7"   # zinc-200
BORDER_HI   = "#a1a1aa"   # zinc-400
TEXT        = "#09090b"   # zinc-950
MUTED       = "#71717a"   # zinc-500
SUBTLE      = "#a1a1aa"   # zinc-400
ACCENT      = "#18181b"   # zinc-900 — primary button
ACCENT_FG   = "#fafafa"   # zinc-50
SECONDARY   = "#f4f4f5"   # zinc-100

# ─── CSS ──────────────────────────────────────────────────────────────────────
st.markdown(f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Reset & base ── */
*, *::before, *::after {{ box-sizing: border-box; }}
html, body, [data-testid="stAppViewContainer"] {{
    background: {BG} !important; color: {TEXT} !important;
    font-family: 'Inter', -apple-system, sans-serif !important;
    -webkit-font-smoothing: antialiased;
}}
[data-testid="stHeader"] {{ display: none !important; }}
[data-testid="stAppViewContainer"] *, [data-testid="stSidebar"] * {{
    font-family: 'Inter', -apple-system, sans-serif !important;
}}
.main .block-container {{
    max-width: 960px !important; padding: 2rem 2.5rem 6rem !important; margin: 0 auto !important;
}}

/* ── Sidebar shell ── */
[data-testid="stSidebar"] {{
    min-width: 248px !important; width: 248px !important; max-width: 248px !important;
    background: {BG} !important; border-right: 1px solid {BORDER} !important;
    transform: translateX(0) !important; visibility: visible !important;
}}
[data-testid="stSidebar"][aria-expanded="false"] {{
    transform: translateX(0) !important; visibility: visible !important;
}}
[data-testid="stSidebar"] > div,
[data-testid="stSidebar"] > div > div,
[data-testid="stSidebar"] section[data-testid="stSidebarContent"],
[data-testid="stSidebar"] [data-testid="stVerticalBlock"] {{
    padding-top: 0 !important; margin-top: 0 !important;
    gap: 0 !important; width: 248px !important;
}}
[data-testid="stSidebarCollapseButton"],
[data-testid="stSidebarCollapsedControl"],
[data-testid="stSidebar"] button[kind="headerNoPadding"] {{
    display: none !important; height: 0 !important; overflow: hidden !important;
}}
[data-testid="stIconMaterial"], span[data-testid="stIconMaterial"] {{
    font-size: 0 !important; width: 14px !important; height: 14px !important; overflow: hidden !important;
}}

/* ── Sidebar labels ── */
[data-testid="stSidebar"] label,
[data-testid="stSidebar"] .stSlider label,
[data-testid="stSidebar"] .stSelectbox label,
[data-testid="stSidebar"] .stTextInput label,
[data-testid="stSidebar"] .stToggle label,
[data-testid="stSidebar"] .stCheckbox label {{
    font-size: 12px !important; font-weight: 400 !important;
    color: {MUTED} !important; letter-spacing: 0 !important; text-transform: none !important;
}}
[data-testid="stSidebar"] hr {{
    border: none !important; border-top: 1px solid {BORDER} !important; margin: 4px 0 !important;
}}
[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] strong {{
    font-size: 10px !important; font-weight: 500 !important;
    text-transform: uppercase !important; letter-spacing: 0.08em !important; color: {SUBTLE} !important;
}}
[data-testid="stSidebar"] [data-testid="stCaptionContainer"] p {{
    font-size: 11px !important; color: {SUBTLE} !important; line-height: 1.5 !important;
}}
[data-testid="stSidebar"] .stElementContainer {{
    padding-left: 16px !important; padding-right: 16px !important;
}}

/* ── Typography ── */
h1 {{ font-size: 28px !important; font-weight: 600 !important; letter-spacing: -0.02em !important; color: {TEXT} !important; line-height: 1.2 !important; }}
h2 {{ font-size: 16px !important; font-weight: 600 !important; color: {TEXT} !important; }}
p, .stMarkdown p {{ font-size: 13px !important; color: {MUTED} !important; line-height: 1.6 !important; }}

/* ── Inputs ── */
[data-baseweb="select"] > div, [data-baseweb="input"] {{
    background: {BG} !important; border: 1px solid {BORDER} !important;
    border-radius: 7px !important; transition: border-color 0.12s, box-shadow 0.12s; box-shadow: none !important;
}}
[data-baseweb="select"] > div:hover, [data-baseweb="input"]:hover {{ border-color: {BORDER_HI} !important; }}
[data-baseweb="select"] > div:focus-within, [data-baseweb="input"]:focus-within {{
    border-color: {TEXT} !important; box-shadow: 0 0 0 3px rgba(9,9,11,0.07) !important;
}}
[data-baseweb="input"] input {{ color: {TEXT} !important; font-size: 13px !important; }}
[data-baseweb="textarea"] textarea {{
    border: 1px solid {BORDER} !important; border-radius: 7px !important;
    font-size: 12px !important; color: {TEXT} !important; background: {BG} !important;
}}

/* ── Slider — only color, no sizing overrides ── */
[data-baseweb="slider"] [role="slider"] {{
    background: {TEXT} !important;
}}

/* ── Buttons ── */
.stButton > button {{
    font-size: 13px !important; font-weight: 500 !important; height: 34px !important;
    padding: 0 14px !important; border-radius: 7px !important;
    border: 1px solid {BORDER} !important; background: {BG} !important; color: {TEXT} !important;
    transition: background 0.12s, border-color 0.12s !important;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04) !important; letter-spacing: -0.01em !important;
}}
.stButton > button:hover {{ background: {SECONDARY} !important; border-color: {BORDER_HI} !important; }}
.stButton > button[kind="primary"] {{
    background: {ACCENT} !important; color: {ACCENT_FG} !important; border-color: {ACCENT} !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;
}}
.stButton > button[kind="primary"]:hover {{ background: #27272a !important; border-color: #27272a !important; }}
.stDownloadButton > button {{
    font-size: 13px !important; font-weight: 500 !important; height: 34px !important;
    padding: 0 14px !important; border-radius: 7px !important;
    border: 1px solid {ACCENT} !important; background: {ACCENT} !important; color: {ACCENT_FG} !important;
    transition: opacity 0.12s !important;
}}
.stDownloadButton > button:hover {{ opacity: 0.82 !important; }}

/* ── File uploader ── */
[data-testid="stFileUploader"] section {{
    background: {BG} !important; border: 1.5px dashed {BORDER} !important;
    border-radius: 10px !important; padding: 32px 24px !important;
    transition: border-color 0.12s, background 0.12s !important;
}}
[data-testid="stFileUploader"] section:hover {{ border-color: {BORDER_HI} !important; background: {SECONDARY} !important; }}
[data-testid="stFileUploader"] button {{
    font-size: 12px !important; font-weight: 500 !important; height: 32px !important;
    padding: 0 14px !important; border-radius: 7px !important;
    border: 1px solid {BORDER} !important; background: {BG} !important; color: {TEXT} !important;
}}
[data-testid="stFileUploader"] button [data-testid="stIconMaterial"],
[data-testid="stFileUploader"] button span[aria-hidden="true"],
[data-testid="stFileUploader"] button > div > span:first-child {{ display: none !important; }}
[data-testid="stFileUploaderDropzoneInstructions"] span {{ font-size: 13px !important; color: {MUTED} !important; }}
[data-testid="stFileUploaderDropzoneInstructions"] small {{ font-size: 11px !important; color: {SUBTLE} !important; }}

/* ── Metrics ── */
[data-testid="stMetric"] {{
    background: {BG}; border: 1px solid {BORDER}; padding: 16px 18px; border-radius: 9px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}}
[data-testid="stMetricLabel"] {{
    font-size: 11px !important; font-weight: 500 !important; color: {MUTED} !important;
    text-transform: none !important; letter-spacing: 0 !important;
}}
[data-testid="stMetricValue"] {{
    font-size: 24px !important; font-weight: 600 !important;
    color: {TEXT} !important; letter-spacing: -0.02em !important;
}}

/* ── Status / Progress ── */
[data-testid="stStatusWidget"] {{
    background: {BG} !important; border: 1px solid {BORDER} !important; border-radius: 9px !important;
}}
[data-testid="stStatusWidget"] summary {{
    font-size: 12px !important; font-weight: 500 !important; color: {TEXT} !important; padding: 12px 16px !important;
}}
[data-testid="stStatusWidget"] > div > div {{
    padding: 0 16px 14px !important; font-size: 12px !important; color: {MUTED} !important;
}}
[data-testid="stProgress"] > div > div > div {{ background: {TEXT} !important; border-radius: 9999px !important; }}
[data-testid="stProgress"] > div > div {{ border-radius: 9999px !important; background: {BORDER} !important; height: 3px !important; }}

/* ── Expander ── */
[data-testid="stExpander"] {{
    background: {BG} !important; border: 1px solid {BORDER} !important;
    border-radius: 9px !important; margin-bottom: 0 !important; overflow: hidden !important;
}}
[data-testid="stExpander"] summary {{
    font-size: 12px !important; font-weight: 500 !important;
    padding: 11px 14px !important; color: {TEXT} !important; list-style: none !important;
}}
[data-testid="stExpander"] summary::-webkit-details-marker {{ display: none !important; }}
[data-testid="stExpander"] summary:hover {{ background: {SECONDARY} !important; }}
[data-testid="stExpander"] > div > div {{ padding: 0 !important; }}
[data-testid="stExpander"] summary [data-testid="stIconMaterial"] {{
    font-size: 0 !important; width: 14px !important; height: 14px !important;
}}

/* ── Toggle ── */
[data-testid="stToggle"] label > div[role="checkbox"],
[data-testid="stToggle"] [role="switch"] {{
    height: 20px !important; width: 36px !important;
    border-radius: 9999px !important;
}}
[data-testid="stToggle"] label > div[role="checkbox"][aria-checked="true"],
[data-testid="stToggle"] [role="switch"][aria-checked="true"] {{
    background: {ACCENT} !important; background-color: {ACCENT} !important;
}}

/* ── Misc ── */
hr {{ border: none !important; border-top: 1px solid {BORDER} !important; margin: 20px 0 !important; }}
[data-testid="stCaptionContainer"] p {{ font-size: 11px !important; color: {SUBTLE} !important; line-height: 1.5 !important; }}
[data-testid="stAlert"] {{ border-radius: 9px !important; font-size: 13px !important; }}
::-webkit-scrollbar {{ width: 3px; height: 3px; }}
::-webkit-scrollbar-track {{ background: transparent; }}
::-webkit-scrollbar-thumb {{ background: {BORDER}; border-radius: 99px; }}
::-webkit-scrollbar-thumb:hover {{ background: {BORDER_HI}; }}

/* ── Reel rows ── */
.reel-row {{ border-bottom: 1px solid {BORDER}; padding: 14px 16px; background: {BG}; transition: background 0.1s; }}
.reel-row:hover {{ background: {SECONDARY}; }}
.reel-row:last-child {{ border-bottom: none; }}
.reel-row-head {{ display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }}
.reel-code {{ font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.06em; color: {SUBTLE}; background: {SECONDARY}; padding: 2px 5px; border-radius: 4px; border: 1px solid {BORDER}; flex-shrink: 0; }}
.reel-title {{ font-size: 13px; font-weight: 500; color: {TEXT}; flex: 1; }}
.reel-meta {{ font-family: 'JetBrains Mono', monospace; font-size: 9px; color: {SUBTLE}; flex-shrink: 0; }}
.tag-viral {{ font-size: 9px; font-weight: 600; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 9999px; border: 1px solid #fde68a; }}
.tag-plain {{ font-size: 9px; font-weight: 500; border: 1px solid {BORDER}; color: {MUTED}; padding: 2px 8px; border-radius: 9999px; background: {SECONDARY}; }}
.reel-transcript {{ font-family: 'JetBrains Mono', monospace; font-size: 10px; line-height: 1.7; color: {MUTED}; padding: 8px 12px; border-top: 1px solid {BORDER}; max-height: 100px; overflow-y: auto; background: {SECONDARY}; }}
.reel-hook {{ font-size: 12px; color: {TEXT}; font-weight: 500; line-height: 1.5; padding: 5px 0 3px 10px; border-left: 2px solid {BORDER_HI}; margin: 4px 0 4px 44px; }}
.reel-reason {{ font-size: 11px; color: {MUTED}; line-height: 1.5; margin: 2px 0 4px 44px; }}

/* ── Brand ── */
.brand {{ display: flex; align-items: center; gap: 10px; padding: 14px 16px 13px; border-bottom: 1px solid {BORDER}; }}
.brand-mark {{ width: 22px; height: 22px; background: {ACCENT}; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }}
.brand-name {{ font-size: 13px; font-weight: 600; letter-spacing: -0.01em; color: {TEXT}; }}

/* ── Hero ── */
.hero {{ text-align: center; padding: 56px 24px 48px; border: 1px solid {BORDER}; border-radius: 12px; background: linear-gradient(160deg, {SECONDARY} 0%, {BG} 100%); margin-bottom: 24px; }}
.hero-title {{ font-size: 38px; font-weight: 700; letter-spacing: -0.03em; color: {TEXT}; margin-bottom: 10px; line-height: 1.1; }}
.hero-title span {{ background: {ACCENT}; color: {ACCENT_FG}; padding: 1px 8px 2px; border-radius: 5px; }}
.hero-sub {{ font-size: 13px; color: {MUTED}; }}

/* ── Section header ── */
.section-cell {{ display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; border: 1px solid {BORDER}; border-radius: 8px 8px 0 0; background: {SECONDARY}; margin-top: 20px; }}
.section-label {{ font-size: 11px; font-weight: 600; color: {MUTED}; letter-spacing: 0.05em; text-transform: uppercase; }}
.section-meta {{ font-family: 'JetBrains Mono', monospace; font-size: 9px; color: {SUBTLE}; }}
</style>
""", unsafe_allow_html=True)


BRAND_HTML = (
    '<div class="brand">'
    '<div class="brand-mark">'
    '<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">'
    '<path d="M7 0 L0 8 L4.5 8 L3 14 L12 6 L7.5 6 L9 0 Z" fill="#fafafa"/>'
    '</svg></div>'
    '<span class="brand-name">SpeedReels</span>'
    '</div>'
)


# ─── Helpers ──────────────────────────────────────────────────────────────────
def reel_full_text(segments, reel) -> str:
    """Reconstruye el transcript completo de un reel a partir de los segmentos."""
    texts = []
    for s in segments:
        # Cualquier segmento que se solape con el rango del reel
        if s["end"] >= reel["start"] and s["start"] <= reel["end"]:
            texts.append(s["text"].strip())
    text = " ".join(texts).strip()
    return text or reel.get("text_preview", "")


def timeline_svg(total: float, reels: list) -> str:
    W, H = 720, 40
    CY = H // 2  # centre y
    lines = [
        f'<svg width="100%" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">',
        # axis hairline
        f'<line x1="0" y1="{CY}" x2="{W}" y2="{CY}" stroke="{BORDER}" stroke-width="1"/>',
    ]
    # tick marks every ~10% of duration
    tick_interval = max(30, int(total / 10))
    t = tick_interval
    while t < total:
        x = (t / total) * W
        lines.append(f'<line x1="{x:.1f}" y1="{CY-6}" x2="{x:.1f}" y2="{CY+6}" stroke="{BORDER}" stroke-width="1"/>')
        label = f"{int(t//60):02d}:{int(t%60):02d}"
        lines.append(f'<text x="{x:.1f}" y="{H-2}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7" fill="{SUBTLE}" letter-spacing="0.1">{label}</text>')
        t += tick_interval
    # reel markers
    for i, r in enumerate(reels):
        x = (r["start"] / total) * W
        w = max((r["duration"] / total) * W, 4)
        lines.append(f'<rect x="{x:.1f}" y="{CY-6}" width="{w:.1f}" height="12" fill="{ACCENT}"/>')
        lines.append(f'<text x="{x+w/2:.1f}" y="{CY+4}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="7" fill="{ACCENT_FG}">{i+1:02d}</text>')
    lines.append("</svg>")
    return "\n".join(lines)


def reset_analysis():
    st.session_state.analyzed = False
    st.session_state.reels = None
    st.session_state.output_clips = []
    st.session_state.cut_done = False


def get_work_dir() -> str:
    if not st.session_state.get("work_dir"):
        st.session_state.work_dir = tempfile.mkdtemp(prefix="speedreels_")
    return st.session_state.work_dir


# ─── Session ──────────────────────────────────────────────────────────────────
for k, v in {
    "work_dir": None,
    "video_path": None,
    "total_duration": 0.0,
    "segments": None,
    "reels": None,
    "output_clips": [],
    "analyzed": False,
    "cut_done": False,
    "last_file": None,
    "prompt_sent": None,
    "transcript_sent": None,
}.items():
    if k not in st.session_state:
        st.session_state[k] = v


# ─── Sidebar ─────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown(BRAND_HTML, unsafe_allow_html=True)

    st.markdown("**Reels**")
    num_reels = st.slider("Número de reels", 1, 12, 5)
    min_dur = st.slider("Duración mínima (s)", 5, 60, 15, step=1)
    max_dur = st.slider("Duración máxima (s)", 10, 90, 25, step=1)
    st.caption("Reels virales: 15–30s. TikTok/Reels/Shorts pegan más cuanto más corto y punchy.")

    st.markdown("---")
    st.markdown("**Transcripción**")
    engine = st.selectbox("Motor", ["Deepgram (cloud)", "Whisper (local)"], index=0)
    if engine.startswith("Deepgram"):
        deepgram_key = st.text_input(
            "API key",
            value=os.environ.get("DEEPGRAM_API_KEY", ""),
            type="password",
        )
        whisper_model = None
    else:
        deepgram_key = None
        whisper_model = st.selectbox("Modelo Whisper", ["tiny", "base", "small", "medium"], index=1)

    st.markdown("---")
    st.markdown("**Detección de hooks**")
    use_ai = st.toggle(
        "Selección con IA",
        value=True,
        help="Claude analiza el transcript y elige los momentos más virales con hook",
    )
    if use_ai:
        anthropic_key = st.text_input(
            "Anthropic API key",
            value=os.environ.get("ANTHROPIC_API_KEY", ""),
            type="password",
            placeholder="sk-ant-...",
            help="https://console.anthropic.com/settings/keys",
        )
        ai_model = st.selectbox(
            "Modelo principal",
            ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-7"],
            index=0,
            help="Modelo que valida los candidatos (verify pass)",
        )

        two_pass = st.toggle(
            "Pipeline 2 pasadas (Scout → Verify)",
            value=True,
            help="Haiku busca 10-15 candidatos rápido, luego Sonnet valida cada uno con score 0-10. Mucho más preciso que 1 sola pasada.",
        )
        if two_pass:
            scout_model = st.selectbox(
                "Modelo scout (rápido)",
                ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
                index=0,
                help="Haiku para velocidad/coste, Sonnet si quieres más calidad en la búsqueda",
            )
        else:
            scout_model = None

        with st.expander("Prompt avanzado", expanded=False):
            st.caption(
                "Edita el prompt que se manda a Claude. Mantén los placeholders "
                "`<<NUM_REELS>>`, `<<MIN_DURATION>>`, `<<MAX_DURATION>>`, `<<TRANSCRIPT>>`."
            )
            if "custom_prompt" not in st.session_state:
                st.session_state.custom_prompt = DEFAULT_AI_PROMPT
            custom_prompt = st.text_area(
                "Prompt",
                value=st.session_state.custom_prompt,
                height=320,
                key="prompt_editor",
                label_visibility="collapsed",
            )
            st.session_state.custom_prompt = custom_prompt
            if st.button("Restaurar prompt por defecto", use_container_width=True):
                st.session_state.custom_prompt = DEFAULT_AI_PROMPT
                st.rerun()
    else:
        anthropic_key = None
        ai_model = None
        custom_prompt = None

    st.markdown("---")
    st.markdown("**Canva** *(opcional)*")
    canva_token = st.text_input(
        "API token",
        type="password",
        placeholder="Pega tu integration token",
        key="canva_token_input",
        help="canva.com/developers → tu app → Generate token",
    )

    st.markdown("---")
    st.markdown("**Análisis acústico**")
    use_silence_snap = st.toggle(
        "Cortar en pausas reales del audio",
        value=True,
        help="Detecta silencios con ffmpeg y ajusta el corte a pausas naturales (no corta palabras)",
    )
    if use_silence_snap:
        silence_threshold = st.slider(
            "Umbral silencio (dB)",
            min_value=-50, max_value=-15, value=-30, step=1,
        )
        silence_min_dur = st.slider(
            "Duración mín. silencio (s)",
            min_value=0.15, max_value=1.0, value=0.35, step=0.05,
        )
    else:
        silence_threshold = -30
        silence_min_dur = 0.35

    use_energy = st.toggle(
        "Energía RMS (NumPy)",
        value=True,
        help="Volumen por segmento — útil para detectar momentos con énfasis",
    )
    use_librosa = st.toggle(
        "Análisis acústico avanzado (librosa)",
        value=True,
        help="Pitch, onset, brillo espectral. La IA detecta entusiasmo, velocidad, claridad",
    )
    use_novelty = st.toggle(
        "Novedad textual (sklearn TF-IDF)",
        value=True,
        help="Detecta segmentos con vocabulario único respecto al resto del video — frases quotables",
    )

    st.markdown("---")
    st.markdown("**Salida**")
    reel_format = st.selectbox("Formato", ["original", "vertical (9:16)"])
    reel_format_val = "vertical" if "vertical" in reel_format else "original"

    burn_title = st.toggle("Añadir título al vídeo", value=False)
    if burn_title:
        title_style = st.selectbox("Posición", ["bottom", "top", "center"])
        title_color = st.color_picker("Color del título", "#FFFFFF")
    else:
        title_style = "bottom"
        title_color = "#FFFFFF"
    no_title = not burn_title

    burn_subs = st.toggle(
        "Subtítulos quemados",
        value=True,
        help="Añade subtítulos word-by-word estilo TikTok al video final (gratis, mejora retention ~40%)",
    )
    if burn_subs:
        words_per_sub = st.slider("Palabras por subtítulo", 1, 6, 3)
    else:
        words_per_sub = 3



# ─── Header ──────────────────────────────────────────────────────────────────
# ─── Header ──────────────────────────────────────────────────────────────────
st.markdown(
    '<div class="hero">'
    '<div class="hero-title">Speed<span>Reels</span></div>'
    '<div class="hero-sub">detecta hooks · corta · exporta</div>'
    '</div>',
    unsafe_allow_html=True,
)

# ─── Upload ──────────────────────────────────────────────────────────────────
st.markdown(
    f'<div class="section-cell"><span class="section-label">fuente</span>'
    f'<span class="section-meta">SR-00</span></div>',
    unsafe_allow_html=True,
)
uploaded = st.file_uploader(
    "Selecciona tu video",
    type=["mp4", "mov", "avi", "mkv"],
    label_visibility="collapsed",
)

if uploaded is None:
    st.stop()

# ─── Save file if new ────────────────────────────────────────────────────────
if uploaded.name != st.session_state.last_file:
    work_dir = get_work_dir()
    video_path = os.path.join(work_dir, uploaded.name)
    with open(video_path, "wb") as f:
        f.write(uploaded.read())
    st.session_state.video_path = video_path
    st.session_state.last_file = uploaded.name
    st.session_state.total_duration = get_video_duration(video_path)
    reset_analysis()

video_path = st.session_state.video_path
total_duration = st.session_state.total_duration

# ─── Source preview + info ───────────────────────────────────────────────────
size_mb = os.path.getsize(video_path) / 1024 / 1024
st.markdown(
    f'<div class="section-cell">'
    f'<span class="section-label">{uploaded.name}</span>'
    f'<span class="section-meta">{format_duration(total_duration)} · {size_mb:.1f} MB · SR-00</span>'
    f'</div>',
    unsafe_allow_html=True,
)
col_v, col_i = st.columns([3, 1])

with col_v:
    st.video(video_path)

with col_i:
    st.metric("Duración", format_duration(total_duration))
    st.metric("Reels", num_reels)
    st.metric("Tamaño", f"{size_mb:.1f} MB")


# ─── Analyze ─────────────────────────────────────────────────────────────────
if not st.session_state.analyzed:
    st.markdown("")
    if st.button("Analizar video", type="primary", use_container_width=True):
        work_dir = get_work_dir()
        audio_path = os.path.join(work_dir, "audio_temp.wav")

        try:
            with st.status("Procesando…", expanded=True) as status:
                st.write("Extrayendo audio…")
                extract_audio(video_path, audio_path)

                silences = []
                if use_silence_snap:
                    st.write("Detectando silencios del audio…")
                    silences = detect_silences(
                        audio_path,
                        threshold_db=silence_threshold,
                        min_silence=silence_min_dur,
                    )
                    st.write(f"{len(silences)} silencios detectados")

                energy_curve = []
                if use_energy:
                    st.write("Analizando energía RMS (NumPy)…")
                    energy_curve = compute_audio_energy(audio_path, window_sec=0.5)
                    st.write(f"Curva RMS: {len(energy_curve)} ventanas")

                acoustic_features = None
                if use_librosa:
                    st.write("Análisis acústico avanzado (librosa: pitch, onset, brillo)…")
                    acoustic_features = compute_acoustic_features(audio_path)
                    if acoustic_features:
                        st.write(f"Features extraídas (pitch, onsets, centroide espectral)")
                    else:
                        st.write("⚠️ librosa no disponible, saltando")

                if deepgram_key:
                    st.write("Transcribiendo con Deepgram Nova-2…")
                    segs = transcribe_audio_deepgram(audio_path, deepgram_key)
                else:
                    st.write(f"Transcribiendo con Whisper [{whisper_model}]…")
                    segs = transcribe_audio(audio_path, model_name=whisper_model)
                st.session_state.segments = segs
                st.write(f"{len(segs)} segmentos transcritos")

                if use_ai and anthropic_key:
                    import time as _time
                    from reel_cutter import build_clean_segments
                    clean_preview = build_clean_segments(
                        segs,
                        silences=silences if silences else None,
                        energy_curve=energy_curve if energy_curve else None,
                        acoustic_features=acoustic_features,
                        compute_novelty=use_novelty,
                    )
                    st.write(f"Pre-procesando: {len(segs)} utterances → {len(clean_preview)} segmentos limpios")
                    viral_high = sum(1 for s in clean_preview if s.get("viral_score", 0) >= 0.65)
                    novelty_high = sum(1 for s in clean_preview if s.get("novelty_score", 0) >= 0.75)
                    sent_strong = sum(1 for s in clean_preview if abs(s.get("sentiment_score", 0) or 0) >= 0.5)
                    st.markdown(
                        f"<span style='color:{MUTED};font-size:13px;'>"
                        f"🔥 {viral_high} virales &middot; "
                        f"✨ {novelty_high} novedosos &middot; "
                        f"💬 {sent_strong} con sentimiento fuerte"
                        f"</span>",
                        unsafe_allow_html=True,
                    )
                    st.write(f"Mandando a Claude [{ai_model or 'claude-sonnet-4-6'}]… (~30-90s)")
                    t0 = _time.time()
                    try:
                        progress_messages = []
                        def _cb(msg):
                            st.write(f"  → {msg}")
                        def _capture(prompt, transcript):
                            st.session_state.prompt_sent = prompt
                            st.session_state.transcript_sent = transcript

                        reels = detect_reel_segments_ai(
                            segs,
                            api_key=anthropic_key,
                            num_reels=num_reels,
                            min_duration=min_dur,
                            max_duration=max_dur,
                            total_duration=total_duration,
                            model=ai_model or "claude-sonnet-4-6",
                            prompt_template=custom_prompt,
                            silences=silences if silences else None,
                            energy_curve=energy_curve if energy_curve else None,
                            acoustic_features=acoustic_features,
                            two_pass=two_pass,
                            scout_model=scout_model,
                            progress_cb=_cb,
                            capture_prompt_cb=_capture,
                        )
                        st.write(f"Claude respondió en {_time.time() - t0:.1f}s")
                        if not reels:
                            st.warning("La IA no devolvió reels. Usando algoritmo mecánico.")
                            reels = detect_reel_segments(
                                segs, min_duration=min_dur, max_duration=max_dur,
                                num_reels=num_reels, total_duration=total_duration,
                            )
                    except Exception as e:
                        st.warning(f"IA falló tras {_time.time() - t0:.1f}s: {e}. Usando algoritmo mecánico.")
                        reels = detect_reel_segments(
                            segs, min_duration=min_dur, max_duration=max_dur,
                            num_reels=num_reels, total_duration=total_duration,
                        )
                else:
                    st.write("Detectando momentos por densidad de palabras…")
                    reels = detect_reel_segments(
                        segs,
                        min_duration=min_dur,
                        max_duration=max_dur,
                        num_reels=num_reels,
                        total_duration=total_duration,
                    )
                st.session_state.reels = reels
                st.write(f"{len(reels)} reels detectados")

                if os.path.exists(audio_path):
                    os.remove(audio_path)

                status.update(label="Análisis completado", state="complete")

            st.session_state.analyzed = True
            st.rerun()
        except RuntimeError as e:
            st.error(str(e))
            st.stop()


# ─── Results ─────────────────────────────────────────────────────────────────
if not st.session_state.analyzed or st.session_state.reels is None:
    st.stop()

reels = st.session_state.reels
segments = st.session_state.segments or []

st.markdown(
    f'<div class="section-cell">'
    f'<span class="section-label">reels detectados</span>'
    f'<span class="section-meta">{len(reels)} SEGMENTOS · {format_duration(total_duration)} · SR-01</span>'
    f'</div>',
    unsafe_allow_html=True,
)

# Timeline
if total_duration > 0:
    st.markdown(
        f'<div style="border:1px solid {BORDER};border-radius:0 0 8px 8px;padding:12px 16px;background:{SECONDARY};">'
        + timeline_svg(total_duration, reels)
        + '</div>',
        unsafe_allow_html=True,
    )

# Reel rows
rows_html = ""
for i, reel in enumerate(reels):
    full_text = reel_full_text(segments, reel)
    ai_title = reel.get("ai_title", "") or f"Reel {i+1:02d}"
    viral = reel.get("viral_score", 0) or reel.get("score", 0)
    tag = '<span class="tag-viral">VIRAL</span>' if viral >= 0.7 else '<span class="tag-plain">REEL</span>'
    hook = reel.get("hook", "").strip()
    reason = reel.get("reason", "").strip()
    extra = ""
    if hook:
        extra += f'<div class="reel-hook">{hook}</div>'
    if reason:
        extra += f'<div class="reel-reason">{reason}</div>'
    rows_html += f"""
<div class="reel-row">
  <div class="reel-row-head">
    <span class="reel-code">SR-{i+1:02d}</span>
    <span class="reel-title">{ai_title}</span>
    <span class="reel-meta">{format_duration(reel['start'])} → {format_duration(reel['end'])} · {reel['duration']:.0f}S</span>
    {tag}
  </div>
  {extra}
  <div class="reel-transcript">{full_text}</div>
</div>"""

st.markdown(
    f'<div style="border:1px solid {BORDER};border-radius:0 0 8px 8px;margin-bottom:0;overflow:hidden;">{rows_html}</div>',
    unsafe_allow_html=True,
)

# Preview players inline
for i, reel in enumerate(reels):
    with st.expander(f"SR-{i+1:02d}  ·  preview", expanded=False):
        st.video(video_path, start_time=int(reel["start"]), end_time=int(reel["end"]) + 1)

# ─── Prompt del director ──────────────────────────────────────────────────────
if st.session_state.get("prompt_sent") or st.session_state.get("transcript_sent"):
    with st.expander("🎬 Prompt del director · ver cómo la IA busca y corta", expanded=False):
        tab_prompt, tab_transcript = st.tabs(["Prompt enviado", "Transcript anotado"])

        with tab_prompt:
            if st.session_state.get("prompt_sent"):
                prompt_display = st.session_state.prompt_sent
                # Truncate transcript section for readability — show just the template part
                if "<<TRANSCRIPT>>" not in prompt_display:
                    # transcript already substituted — split off the transcript block
                    lines = prompt_display.split("\n")
                    in_transcript = False
                    header_lines, transcript_block = [], []
                    for line in lines:
                        if line.strip() == "# Transcript":
                            in_transcript = True
                            header_lines.append(line)
                        elif in_transcript and line.strip() == "# Tu respuesta":
                            in_transcript = False
                            header_lines.append("\n_[transcript omitido — ver pestaña Transcript anotado]_\n")
                            header_lines.append(line)
                        elif in_transcript:
                            transcript_block.append(line)
                        else:
                            header_lines.append(line)
                    prompt_display = "\n".join(header_lines)
                st.markdown(
                    f'<div style="font-family:JetBrains Mono,monospace;font-size:11px;'
                    f'line-height:1.7;color:{MUTED};background:{SECONDARY};'
                    f'border:1px solid {BORDER};border-radius:8px;padding:16px;'
                    f'white-space:pre-wrap;max-height:520px;overflow-y:auto;">'
                    + prompt_display.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                    + "</div>",
                    unsafe_allow_html=True,
                )
            else:
                st.caption("Prompt no disponible (pipeline 2 pasadas — ver scout/verify en reel_cutter.py)")

        with tab_transcript:
            if st.session_state.get("transcript_sent"):
                st.markdown(
                    f'<div style="font-family:JetBrains Mono,monospace;font-size:11px;'
                    f'line-height:1.7;color:{MUTED};background:{SECONDARY};'
                    f'border:1px solid {BORDER};border-radius:8px;padding:16px;'
                    f'white-space:pre-wrap;max-height:520px;overflow-y:auto;">'
                    + st.session_state.transcript_sent.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                    + "</div>",
                    unsafe_allow_html=True,
                )
            else:
                st.caption("Transcript no disponible.")

st.markdown("")

# ─── Cut ─────────────────────────────────────────────────────────────────────
if not st.session_state.cut_done:
    col_cut, col_re = st.columns([3, 1])
    with col_cut:
        cut = st.button("Cortar reels", type="primary", use_container_width=True)
    with col_re:
        if st.button("Re-analizar", use_container_width=True):
            reset_analysis()
            st.rerun()

    if cut:
        work_dir = get_work_dir()
        output_clips = []
        bar = st.progress(0, text="Iniciando…")

        errors = []
        for i, reel in enumerate(reels):
            bar.progress(i / len(reels), text=f"Cortando reel {i+1}/{len(reels)}")
            ai_title = reel.get("ai_title", "").strip()
            title = ai_title if ai_title else generate_title(reel.get("text_preview", ""), i + 1)
            stem = Path(video_path).stem
            out = os.path.join(work_dir, f"reel_{i+1:02d}_{stem}.mp4")

            srt_path = None
            if burn_subs:
                srt_candidate = os.path.join(work_dir, f"reel_{i+1:02d}.srt")
                if generate_srt_for_clip(
                    st.session_state.segments or [],
                    reel["start"],
                    reel["end"],
                    srt_candidate,
                    words_per_chunk=words_per_sub,
                    uppercase=True,
                ):
                    srt_path = srt_candidate

            ok, err = cut_and_title_clip(
                video_path,
                reel["start"],
                reel["end"],
                title,
                out,
                reel_format=reel_format_val,
                title_style=title_style,
                title_color=title_color,
                no_title=no_title,
                subtitle_srt_path=srt_path,
            )
            if ok:
                output_clips.append((out, title, reel))
            else:
                errors.append((i + 1, err))

        bar.progress(1.0, text=f"Listo · {len(output_clips)} de {len(reels)} reels")
        st.session_state.output_clips = output_clips
        st.session_state.cut_done = True

        if errors:
            for reel_num, err in errors:
                st.error(f"Reel {reel_num} falló:\n```\n{err[-400:]}\n```")
            if not output_clips:
                st.warning("Ningún clip se generó. Revisa los errores arriba.")
                st.stop()

        st.rerun()


# ─── Outputs ─────────────────────────────────────────────────────────────────
if st.session_state.cut_done and st.session_state.output_clips:
    n = len(st.session_state.output_clips)
    st.markdown(
        f'<div class="section-cell">'
        f'<span class="section-label">export</span>'
        f'<span class="section-meta">{n} CLIPS LISTOS · SR-02</span>'
        f'</div>',
        unsafe_allow_html=True,
    )

    for i, (clip_path, title, reel) in enumerate(st.session_state.output_clips):
        full_text = reel_full_text(segments, reel)
        size = os.path.getsize(clip_path) / 1024 / 1024
        viral = reel.get("viral_score", 0) or reel.get("score", 0)
        tag = '<span class="tag-viral">VIRAL</span>' if viral >= 0.7 else '<span class="tag-plain">REEL</span>'

        st.markdown(
            f'<div class="reel-row">'
            f'<div class="reel-row-head">'
            f'<span class="reel-code">SR-{i+1:02d}</span>'
            f'<span class="reel-title">{title}</span>'
            f'<span class="reel-meta">{format_duration(reel["start"])} → {format_duration(reel["end"])} · {size:.1f} MB</span>'
            f'{tag}'
            f'</div>'
            f'<div class="reel-transcript">{full_text}</div>'
            f'</div>',
            unsafe_allow_html=True,
        )

        c_vid, c_btn = st.columns([2, 1])
        with c_vid:
            st.video(clip_path)
        with c_btn:
            with open(clip_path, "rb") as f:
                st.download_button(
                    label="Descargar",
                    data=f.read(),
                    file_name=os.path.basename(clip_path),
                    mime="video/mp4",
                    use_container_width=True,
                    key=f"dl_{i}",
                )
            if canva_token:
                if st.button("Subir a Canva", key=f"canva_{i}", use_container_width=True):
                    with st.spinner("Subiendo…"):
                        ok = upload_to_canva(clip_path, title, canva_token)
                    if ok:
                        st.success("Subido ✓")
                    else:
                        st.error("Error al subir. Revisa el token.")

        st.markdown("")

    st.markdown("---")
    col_a, col_b, col_c = st.columns(3)
    with col_a:
        if st.button("Re-cortar", use_container_width=True, type="primary",
                     help="Vuelve a cortar con la configuración actual de títulos y subtítulos"):
            st.session_state.cut_done = False
            st.session_state.output_clips = []
            st.rerun()
    with col_b:
        if st.button("Cambiar parámetros", use_container_width=True):
            st.session_state.cut_done = False
            st.session_state.output_clips = []
            st.rerun()
    with col_c:
        if st.button("Otro video", use_container_width=True):
            st.session_state.last_file = None
            reset_analysis()
            st.rerun()
