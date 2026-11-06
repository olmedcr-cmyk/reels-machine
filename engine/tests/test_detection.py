"""Tests para la detección de segmentos de reel."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from reel_cutter import detect_reel_segments, simple_cuts, generate_title


def make_segments(entries):
    """Crea segmentos de transcripción a partir de tuplas (start, end, text)."""
    return [{"start": s, "end": e, "text": t} for s, e, t in entries]


# ─────────────────────────────────────────────
# detect_reel_segments
# ─────────────────────────────────────────────

def test_detect_segments_basic():
    """Debe devolver hasta num_reels reels en un video con suficiente contenido."""
    # 4 bloques bien separados, cada uno cubre ~40s, total ~200s
    segs = make_segments([
        (0,  10, "intro del primer bloque"),
        (10, 20, "continuación primer bloque"),
        (20, 38, "cierre primer bloque aquí"),
        (45, 55, "segundo bloque empieza"),    # pausa > 1s
        (55, 65, "desarrollando segundo tema"),
        (65, 82, "cierre segundo bloque aquí"),
        (90, 100, "tercer bloque diferente"),  # pausa > 1s
        (100, 110, "más contenido del tercero"),
        (110, 127, "cierre tercer bloque aquí"),
        (135, 145, "cuarto bloque importante"), # pausa > 1s
        (145, 155, "continuación cuarto"),
        (155, 170, "cierre cuarto bloque aquí"),
    ])
    result = detect_reel_segments(segs, min_duration=30, max_duration=45, num_reels=3, total_duration=180)
    assert len(result) >= 1, f"Se esperaba al menos 1 reel, se obtuvieron {len(result)}"
    assert len(result) <= 3, f"Se esperaban máximo 3 reels, se obtuvieron {len(result)}"


def test_detect_no_overlap():
    """Los reels seleccionados no deben solaparse."""
    segs = make_segments([
        (0, 15, "primer bloque de contenido largo"),
        (20, 35, "segundo bloque con más contenido"),  # pausa > 1s
        (40, 55, "tercer bloque diferente tema"),      # pausa > 1s
        (60, 75, "cuarto bloque interesante aquí"),    # pausa > 1s
        (80, 95, "quinto bloque final del video"),     # pausa > 1s
    ])
    result = detect_reel_segments(segs, min_duration=30, max_duration=90, num_reels=3, total_duration=100)
    for i in range(len(result)):
        for j in range(i + 1, len(result)):
            a, b = result[i], result[j]
            assert a["end"] <= b["start"] or a["start"] >= b["end"], \
                f"Reel {i+1} y {j+1} se solapan: [{a['start']}, {a['end']}] vs [{b['start']}, {b['end']}]"


def test_detect_respects_duration():
    """Todos los reels deben estar dentro del rango min/max de duración."""
    segs = make_segments([
        (0, 10, "inicio del contenido"),
        (11, 21, "segundo segmento aquí"),
        (30, 40, "tercer segmento nuevo"),   # pausa > 1s
        (41, 51, "continuación del tercero"),
        (60, 70, "cuarto segmento diferente"), # pausa > 1s
        (71, 81, "continuación del cuarto"),
    ])
    min_dur, max_dur = 30, 60
    result = detect_reel_segments(segs, min_duration=min_dur, max_duration=max_dur, num_reels=2, total_duration=90)
    for reel in result:
        assert reel["duration"] >= min_dur, \
            f"Reel demasiado corto: {reel['duration']:.1f}s < {min_dur}s"
        assert reel["duration"] <= max_dur, \
            f"Reel demasiado largo: {reel['duration']:.1f}s > {max_dur}s"


def test_detect_fallback_short_video():
    """Video más corto que min_duration → 1 reel con el video completo."""
    segs = make_segments([
        (0, 5, "video muy corto"),
        (5, 10, "continúa el video corto"),
    ])
    result = detect_reel_segments(segs, min_duration=30, max_duration=90, num_reels=3, total_duration=10)
    assert len(result) == 1, f"Se esperaba 1 reel, se obtuvieron {len(result)}"
    assert result[0]["start"] == 0.0
    assert result[0]["end"] == 10.0


def test_detect_empty_segments():
    """Sin segmentos de transcripción → cortes simples por tiempo."""
    result = detect_reel_segments([], min_duration=30, max_duration=60, num_reels=2, total_duration=120)
    assert len(result) > 0, "Se esperaban cortes simples por tiempo"
    for reel in result:
        assert reel["duration"] <= 60


# ─────────────────────────────────────────────
# simple_cuts
# ─────────────────────────────────────────────

def test_simple_cuts_count():
    """simple_cuts no debe generar más reels de los que caben en el video."""
    cuts = simple_cuts(total_duration=100, min_duration=30, max_duration=45, num_reels=3)
    assert len(cuts) <= 3
    for c in cuts:
        assert c["end"] <= 100


def test_simple_cuts_no_overflow():
    """Ningún corte debe exceder la duración total del video."""
    cuts = simple_cuts(total_duration=50, min_duration=30, max_duration=60, num_reels=5)
    for c in cuts:
        assert c["end"] <= 50


# ─────────────────────────────────────────────
# generate_title
# ─────────────────────────────────────────────

def test_generate_title_long():
    """Títulos largos deben truncarse a 50 caracteres en palabra completa."""
    long_text = "Este es un título muy largo que definitivamente supera los cincuenta caracteres permitidos"
    title = generate_title(long_text, 1)
    assert len(title) <= 50


def test_generate_title_empty():
    """Texto vacío debe devolver fallback con número de reel."""
    title = generate_title("", 2)
    assert title == "Reel 2"


def test_generate_title_strips_quotes():
    """El título no debe contener comillas simples ni dobles."""
    title = generate_title("El 'mejor' momento del \"video\"", 1)
    assert "'" not in title
    assert '"' not in title
