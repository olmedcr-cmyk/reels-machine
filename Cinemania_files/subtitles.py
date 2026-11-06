"""Subtítulos de marca para SpeedReels.

Estilo de marca: Geomanist Black, texto blanco con contorno negro duro
(sin sombra), texto tal cual se habla (sin MAYÚSCULAS forzadas) y 1-3
palabras clave por clip resaltadas en amarillo de marca #FFD60A, elegidas
por el director IA (`highlight_phrases`).

Dos salidas a partir de los mismos "chunks":

* ``render_overlay``: PNGs transparentes (Pillow) + lista ffconcat que
  FFmpeg superpone con ``overlay``. No depende de libass ni de freetype en
  FFmpeg, así que funciona con el FFmpeg mínimo de Homebrew. También pinta
  el título del reel.
* ``write_ass``: archivo .ass con el mismo estilo, para descargar y retocar
  en un editor (Premiere, CapCut, Aegisub…).
"""

from __future__ import annotations

import os
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

BRAND_YELLOW = (0xFF, 0xD6, 0x0A)
WHITE = (0xFF, 0xFF, 0xFF)
BLACK = (0x00, 0x00, 0x00)

FONTS_DIR = Path(__file__).resolve().parent / "assets" / "fonts"
BRAND_FONT_FILE = "Geomanist-Black.otf"
BRAND_FONT_ASS_NAME = "Geomanist Black"

_SYSTEM_FALLBACK_FONTS = [
    "/System/Library/Fonts/Supplemental/Arial Black.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
]

POSITIONS = ("top", "center", "bottom")


@dataclass
class SubtitleStyle:
    position: str = "bottom"      # top | center | bottom
    side_padding: int = 64        # px a cada lado (MarginL / MarginR)
    words_per_chunk: int = 3

    def normalized(self) -> "SubtitleStyle":
        pos = self.position if self.position in POSITIONS else "bottom"
        pad = max(0, min(int(self.side_padding), 240))
        wpc = max(1, min(int(self.words_per_chunk), 8))
        return SubtitleStyle(pos, pad, wpc)


# ──────────────────────────────────────────────────────────
# Fuentes
# ──────────────────────────────────────────────────────────

def brand_font_path() -> Optional[str]:
    """Ruta a Geomanist Black (env SPEEDREELS_FONT o assets/fonts/)."""
    env = os.environ.get("SPEEDREELS_FONT")
    if env and os.path.exists(env):
        return env
    p = FONTS_DIR / BRAND_FONT_FILE
    return str(p) if p.exists() else None


def resolve_font_path() -> Optional[str]:
    """Geomanist si está; si no, una sans gruesa del sistema."""
    path = brand_font_path()
    if path:
        return path
    for cand in _SYSTEM_FALLBACK_FONTS:
        if os.path.exists(cand):
            return cand
    return None


def _load_font(size: int):
    from PIL import ImageFont

    path = resolve_font_path()
    if path:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default(size=size)


# ──────────────────────────────────────────────────────────
# Palabras del clip + highlight
# ──────────────────────────────────────────────────────────

def _norm(text: str) -> str:
    """minúsculas, sin acentos, sin puntuación."""
    t = unicodedata.normalize("NFKD", text)
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^\w]+", "", t.lower(), flags=re.UNICODE)


def clip_words(segments: Sequence[Dict], clip_start: float, clip_end: float) -> List[Dict]:
    """Palabras del clip con tiempos relativos al inicio del clip.

    Usa timestamps palabra a palabra (Deepgram / Whisper word_timestamps).
    Si un segmento no los trae, reparte su duración entre sus palabras en
    proporción a su longitud — mejor que un bloque único de texto.
    """
    words: List[Dict] = []
    for seg in segments:
        s_start, s_end = float(seg.get("start", 0)), float(seg.get("end", 0))
        if s_end < clip_start or s_start > clip_end:
            continue
        seg_words = seg.get("words") or []
        if seg_words:
            items = [
                (str(w.get("word", "")).strip(), float(w.get("start", 0)), float(w.get("end", 0)))
                for w in seg_words
            ]
        else:
            tokens = str(seg.get("text", "")).split()
            total = sum(len(t) for t in tokens) or 1
            items, t = [], s_start
            for tok in tokens:
                dur = (s_end - s_start) * len(tok) / total
                items.append((tok, t, t + dur))
                t += dur
        for text, ws, we in items:
            if not text or we < clip_start or ws > clip_end:
                continue
            ws, we = max(ws, clip_start), min(we, clip_end)
            if we > ws:
                words.append({"word": text, "start": ws - clip_start, "end": we - clip_start})
    words.sort(key=lambda w: w["start"])
    return words


def mark_highlights(words: Sequence[Dict], phrases: Optional[Sequence[str]]) -> List[bool]:
    """True en las palabras que forman alguna highlight_phrase.

    Coincidencia sin mayúsculas ni acentos ni puntuación; se marca la primera
    aparición de cada frase. Frases que no aparecen (alucinadas) se ignoran.
    """
    flags = [False] * len(words)
    if not phrases:
        return flags
    normed = [_norm(w["word"]) for w in words]
    for phrase in list(phrases)[:3]:
        target = [_norm(t) for t in str(phrase).split()]
        target = [t for t in target if t]
        if not target or len(target) > 3:
            continue
        n = len(target)
        for i in range(len(normed) - n + 1):
            if normed[i:i + n] == target:
                for j in range(i, i + n):
                    flags[j] = True
                break
    return flags


def build_chunks(
    words: Sequence[Dict],
    flags: Sequence[bool],
    words_per_chunk: int = 3,
) -> List[Dict]:
    """Agrupa en bloques de N palabras. Una frase resaltada que cruza dos
    bloques queda resaltada en cada uno de forma independiente."""
    chunks = []
    for i in range(0, len(words), max(1, words_per_chunk)):
        group = list(range(i, min(i + words_per_chunk, len(words))))
        chunks.append({
            "start": words[group[0]]["start"],
            "end": words[group[-1]]["end"],
            "tokens": [(words[k]["word"], bool(flags[k])) for k in group],
        })
    # Sin huecos de parpadeo: cada bloque dura hasta que empieza el siguiente
    # (si la pausa es corta, < 0.6 s).
    for a, b in zip(chunks, chunks[1:]):
        if 0 < b["start"] - a["end"] < 0.6:
            a["end"] = b["start"]
    return chunks


def make_chunks(
    segments: Sequence[Dict],
    clip_start: float,
    clip_end: float,
    highlight_phrases: Optional[Sequence[str]] = None,
    words_per_chunk: int = 3,
) -> List[Dict]:
    words = clip_words(segments, clip_start, clip_end)
    return build_chunks(words, mark_highlights(words, highlight_phrases), words_per_chunk)


# ──────────────────────────────────────────────────────────
# Métricas de estilo (en píxeles de salida)
# ──────────────────────────────────────────────────────────

def _metrics(width: int, height: int, style: SubtitleStyle) -> Dict:
    vertical = height > width
    size = round(height * (0.040 if vertical else 0.052))
    return {
        "size": size,
        "stroke": max(2, round(size * 0.085)),
        "line_h": round(size * 1.18),
        # Bloque a la altura de pecho/hombros en vertical, no pegado abajo
        "margin_bottom": round(height * (0.27 if vertical else 0.11)),
        "margin_top": round(height * (0.17 if vertical else 0.11)),
        "side": style.side_padding,
    }


# ──────────────────────────────────────────────────────────
# ASS (descargable / editable)
# ──────────────────────────────────────────────────────────

def _ass_time(t: float) -> str:
    t = max(0.0, t)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def _ass_escape(text: str) -> str:
    return text.replace("\\", "").replace("{", "(").replace("}", ")")


def write_ass(
    chunks: Sequence[Dict],
    path: str,
    width: int,
    height: int,
    style: SubtitleStyle,
) -> str:
    style = style.normalized()
    m = _metrics(width, height, style)
    alignment = {"top": 8, "center": 5, "bottom": 2}[style.position]
    margin_v = m["margin_top"] if style.position == "top" else (0 if style.position == "center" else m["margin_bottom"])
    yellow = "&H%02X%02X%02X&" % (BRAND_YELLOW[2], BRAND_YELLOW[1], BRAND_YELLOW[0])  # BGR
    lines = [
        "[Script Info]",
        "; SpeedReels — subtítulos de marca",
        "ScriptType: v4.00+",
        f"PlayResX: {width}",
        f"PlayResY: {height}",
        "WrapStyle: 0",
        "ScaledBorderAndShadow: yes",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, "
        "Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
        "Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Brand,{BRAND_FONT_ASS_NAME},{m['size']},&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,"
        f"0,0,0,0,100,100,0,0,1,{m['stroke']},0,{alignment},{m['side']},{m['side']},{margin_v},1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    for ch in chunks:
        parts = []
        for word, hl in ch["tokens"]:
            w = _ass_escape(word)
            parts.append(f"{{\\c{yellow}}}{w}{{\\c&HFFFFFF&}}" if hl else w)
        lines.append(
            f"Dialogue: 0,{_ass_time(ch['start'])},{_ass_time(ch['end'])},Brand,,0,0,0,,{' '.join(parts)}"
        )
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


# ──────────────────────────────────────────────────────────
# Overlay PNG (lo que se quema en el vídeo)
# ──────────────────────────────────────────────────────────

def _wrap(tokens: Sequence[Tuple[str, bool]], font, max_width: int) -> List[List[Tuple[str, bool, float]]]:
    space = font.getlength(" ")
    lines: List[List[Tuple[str, bool, float]]] = [[]]
    width = 0.0
    for word, hl in tokens:
        w = font.getlength(word)
        extra = w if not lines[-1] else space + w
        if lines[-1] and width + extra > max_width:
            lines.append([])
            width, extra = 0.0, w
        lines[-1].append((word, hl, w))
        width += extra
    return [ln for ln in lines if ln]


def _draw_subtitle(img, chunk: Dict, style: SubtitleStyle, m: Dict, font) -> None:
    from PIL import ImageDraw

    W, H = img.size
    max_w = max(80, W - 2 * m["side"] - 2 * m["stroke"])
    lines = _wrap(chunk["tokens"], font, max_w)
    block_h = len(lines) * m["line_h"]
    if style.position == "top":
        y = m["margin_top"]
    elif style.position == "center":
        y = (H - block_h) // 2
    else:
        y = H - m["margin_bottom"] - block_h
    draw = ImageDraw.Draw(img)
    space = font.getlength(" ")
    for line in lines:
        line_w = sum(w for _, _, w in line) + space * (len(line) - 1)
        x = m["side"] + (W - 2 * m["side"] - line_w) / 2
        for word, hl, w in line:
            draw.text(
                (x, y), word, font=font,
                fill=BRAND_YELLOW if hl else WHITE,
                stroke_width=m["stroke"], stroke_fill=BLACK,
            )
            x += w + space
        y += m["line_h"]


def _draw_title(img, title: str, position: str) -> None:
    """Título en caja negra translúcida (arriba / centro / abajo)."""
    from PIL import Image, ImageDraw

    W, H = img.size
    size = round(H * (0.029 if H > W else 0.040))
    font = _load_font(size)
    pad = round(size * 0.38)
    tokens = [(t, False) for t in title.split()]
    lines = _wrap(tokens, font, W - 2 * round(W * 0.08) - 2 * pad)
    if not lines:
        return
    line_h = round(size * 1.2)
    space = font.getlength(" ")
    widths = [sum(w for _, _, w in ln) + space * (len(ln) - 1) for ln in lines]
    box_w = int(max(widths) + 2 * pad)
    box_h = int(len(lines) * line_h + 2 * pad)
    edge = round(H * 0.068)
    if position == "top":
        y0 = edge
    elif position == "center":
        y0 = (H - box_h) // 2
    else:
        y0 = H - edge - box_h
    x0 = (W - box_w) // 2
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle([x0, y0, x0 + box_w, y0 + box_h], radius=round(size * 0.25), fill=(0, 0, 0, 153))
    y = y0 + pad
    for ln, lw in zip(lines, widths):
        d.text(((W - lw) / 2, y), " ".join(w for w, _, _ in ln), font=font, fill=WHITE)
        y += line_h
    img.alpha_composite(layer)


def render_overlay(
    chunks: Sequence[Dict],
    workdir: str,
    width: int,
    height: int,
    duration: float,
    style: SubtitleStyle,
    title: Optional[str] = None,
    title_position: str = "bottom",
) -> Optional[str]:
    """Genera PNGs transparentes + lista ffconcat. Devuelve la ruta de la lista
    (o None si no hay nada que dibujar)."""
    from PIL import Image

    title = (title or "").strip()
    if not chunks and not title:
        return None
    style = style.normalized()
    m = _metrics(width, height, style)
    font = _load_font(m["size"])
    out = Path(workdir).resolve()
    out.mkdir(parents=True, exist_ok=True)

    def frame(name: str, chunk: Optional[Dict]) -> str:
        img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        if title:
            _draw_title(img, title, title_position)
        if chunk:
            _draw_subtitle(img, chunk, style, m, font)
        p = out / name
        img.save(p, optimize=False, compress_level=1)
        return str(p)

    blank = frame("blank.png", None)
    entries: List[Tuple[str, float]] = []
    t = 0.0
    for i, ch in enumerate(sorted(chunks, key=lambda c: c["start"])):
        start, end = max(ch["start"], t), min(ch["end"], duration)
        if end <= start:
            continue
        if start - t > 0.001:
            entries.append((blank, start - t))
        entries.append((frame(f"sub_{i:04d}.png", ch), end - start))
        t = end
    if duration - t > 0.001:
        entries.append((blank, duration - t))
    if not entries:
        entries.append((blank, duration))

    lines = ["ffconcat version 1.0"]
    def q(path: str) -> str:  # comillas simples escapadas para ffconcat
        return "'" + path.replace("'", "'\\''") + "'"

    for path, dur in entries:
        lines += [f"file {q(path)}", f"duration {dur:.3f}"]
    lines.append(f"file {q(entries[-1][0])}")  # el demuxer ignora la última duración
    list_path = out / "overlay.ffconcat"
    list_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return str(list_path)
