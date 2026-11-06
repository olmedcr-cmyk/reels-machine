"""Subtítulos de marca: highlight, troceo, ASS y layout del overlay."""

import os
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import subtitles as S  # noqa: E402

TEXT = "Mira, el 95% de la gente abandona en el mes tres. Y eso pasa por una sola razón."


def _segments(start=1.0, with_words=True):
    t, words = start, []
    for w in TEXT.split():
        d = 0.2 + 0.03 * len(w)
        words.append({"word": w, "start": t, "end": t + d})
        t += d + 0.05
    seg = {"start": start, "end": t, "text": TEXT}
    if with_words:
        seg["words"] = words
    return [seg]


def test_highlight_marks_literal_phrases_and_ignores_hallucinations():
    words = S.clip_words(_segments(), 0, 30)
    flags = S.mark_highlights(words, ["95%", "mes tres", "esto no aparece"])
    marked = [w["word"] for w, f in zip(words, flags) if f]
    assert marked == ["95%", "mes", "tres."]


def test_highlight_ignores_case_accents_and_punctuation():
    words = [{"word": "Están"}, {"word": "AÑOS"}, {"word": "tres."}]
    assert S.mark_highlights(words, ["estan años", "Tres"]) == [True, True, True]


def test_highlight_rejects_long_phrases_and_caps_at_three():
    words = S.clip_words(_segments(), 0, 30)
    assert not any(S.mark_highlights(words, ["el 95% de la gente"]))  # > 3 palabras
    flags = S.mark_highlights(words, ["Mira,", "gente", "abandona", "razón."])
    assert [w["word"] for w, f in zip(words, flags) if f] == ["Mira,", "gente", "abandona"]


def test_phrase_crossing_chunk_boundary_is_highlighted_in_both():
    chunks = S.make_chunks(_segments(), 0, 30, ["mes tres"], words_per_chunk=2)
    hot = [(i, w) for i, c in enumerate(chunks) for w, h in c["tokens"] if h]
    assert [w for _, w in hot] == ["mes", "tres."]
    assert len({i for i, _ in hot}) == 2  # "mes" y "tres." caen en bloques distintos


def test_clip_words_are_relative_and_clipped():
    words = S.clip_words(_segments(start=10.0), 10.5, 12.0)
    assert words and words[0]["start"] >= 0
    assert all(w["end"] <= 1.5 + 1e-9 for w in words)


def test_fallback_without_word_timestamps_spreads_text():
    words = S.clip_words(_segments(with_words=False), 0, 30)
    assert [w["word"] for w in words] == TEXT.split()
    assert all(b["start"] >= a["start"] for a, b in zip(words, words[1:]))


def test_style_is_clamped():
    st = S.SubtitleStyle("weird", 999, 0).normalized()
    assert (st.position, st.side_padding, st.words_per_chunk) == ("bottom", 240, 1)


def test_ass_has_brand_style_and_bgr_yellow(tmp_path):
    chunks = S.make_chunks(_segments(), 0.5, 10, ["95%"], 3)
    path = S.write_ass(chunks, str(tmp_path / "x.ass"), 1080, 1920, S.SubtitleStyle("top", 80, 3))
    txt = open(path, encoding="utf-8").read()
    assert "PlayResX: 1080" in txt and "PlayResY: 1920" in txt
    style = next(ln for ln in txt.splitlines() if ln.startswith("Style: Brand"))
    fields = style.split(",")
    assert fields[1] == "Geomanist Black"
    assert fields[17] == "0"            # Shadow
    assert fields[18] == "8"            # Alignment top
    assert fields[19] == fields[20] == "80"  # MarginL/R
    assert "{\\c&H0AD6FF&}95%{\\c&HFFFFFF&}" in txt


@pytest.mark.parametrize("size", [(1080, 1920), (1920, 1080)])
@pytest.mark.parametrize("pad", [0, 240])
def test_overlay_text_stays_inside_frame(size, pad):
    pytest.importorskip("PIL")
    from PIL import Image

    W, H = size
    chunk = {"start": 0, "end": 1, "tokens": [
        ("Desafortunadamente", False), ("extraordinariamente", True),
        ("incomprensible", False), ("internacionalización", True),
    ]}
    st = S.SubtitleStyle("bottom", pad, 4).normalized()
    m = S._metrics(W, H, st)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    S._draw_subtitle(img, chunk, st, m, S._load_font(m["size"]))
    x0, y0, x1, y1 = img.getbbox()
    assert x0 >= 0 and y0 >= 0 and x1 <= W and y1 <= H


def test_render_overlay_timeline_covers_duration(tmp_path):
    pytest.importorskip("PIL")
    chunks = S.make_chunks(_segments(), 0.5, 6.0, ["95%"], 3)
    lst = S.render_overlay(chunks, str(tmp_path / "ov"), 540, 960, 5.5, S.SubtitleStyle(), title="Hola")
    lines = open(lst, encoding="utf-8").read().splitlines()
    total = sum(float(ln.split()[1]) for ln in lines if ln.startswith("duration"))
    assert abs(total - 5.5) < 0.01
    assert all(os.path.isabs(ln[6:-1]) for ln in lines if ln.startswith("file "))
