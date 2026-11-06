#!/usr/bin/env python3
"""Genera las ilustraciones del README con el sistema de diseño Frekvens.

    python3 scripts/readme_art.py                 # hero.svg + pipeline.svg
    backend/.venv/bin/python scripts/readme_art.py --subtitles   # + subtitles.png (necesita Pillow)

Frekvens: papel y tinta, color en bloques sólidos, ilustración con puntos,
círculos para estados, sin degradados ni sombras. Los SVG se ven en GitHub
como <img>, así que las fuentes caen a Helvetica/monospace si no hay Archivo.
"""

import math
import random
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "docs" / "assets"

# Tokens Frekvens · tema Papel (web/src/frekvens/tokens.json)
PAPER, SURFACE, WELL, DOT_OFF, LINE = "#e7e5e0", "#f5f4f0", "#d6d3cc", "#cbc7bf", "#c4c0b8"
INK, INK_MUTED = "#111111", "#57534d"
KLEIN, ON_KLEIN, SOL, RAMS, VERDE = "#002fa7", "#ffffff", "#ffd447", "#f2581e", "#1f5a3a"
SUB_YELLOW = "#FFD60A"  # amarillo que se quema en el MP4

SANS = 'font-family="Archivo, \'Helvetica Neue\', Helvetica, Arial, sans-serif"'
MONO = 'font-family="\'IBM Plex Mono\', ui-monospace, Menlo, monospace"'
DOT = 'font-family="Doto, \'IBM Plex Mono\', ui-monospace, monospace"'


def hero() -> str:
    random.seed(11)
    W, H = 1280, 460
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
         'aria-label="Reels Machine: un vídeo largo entra, reels virales salen">']
    o.append('''<style>
.ph{animation:ph 7s linear infinite}
@keyframes ph{0%{transform:translateX(0)}72%{transform:translateX(560px)}100%{transform:translateX(560px)}}
.s1{animation:s1 7s steps(1,end) infinite}.s2{animation:s2 7s steps(1,end) infinite}.s3{animation:s3 7s steps(1,end) infinite}
@keyframes s1{0%,16%{opacity:0}17%,92%{opacity:1}93%,100%{opacity:0}}
@keyframes s2{0%,38%{opacity:0}39%,92%{opacity:1}93%,100%{opacity:0}}
@keyframes s3{0%,58%{opacity:0}59%,92%{opacity:1}93%,100%{opacity:0}}
.p1,.p2,.p3{transform-box:fill-box;transform-origin:50% 100%}
.p1{animation:p1 7s cubic-bezier(.25,.8,.25,1) infinite}.p2{animation:p2 7s cubic-bezier(.25,.8,.25,1) infinite}.p3{animation:p3 7s cubic-bezier(.25,.8,.25,1) infinite}
@keyframes p1{0%,18%{opacity:0;transform:translateY(16px) scale(.96)}27%,90%{opacity:1;transform:none}96%,100%{opacity:0;transform:none}}
@keyframes p2{0%,40%{opacity:0;transform:translateY(16px) scale(.96)}49%,90%{opacity:1;transform:none}96%,100%{opacity:0;transform:none}}
@keyframes p3{0%,60%{opacity:0;transform:translateY(16px) scale(.96)}69%,90%{opacity:1;transform:none}96%,100%{opacity:0;transform:none}}
.led{animation:led 1.2s steps(2,jump-none) infinite}@keyframes led{50%{opacity:.25}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.s1,.s2,.s3,.p1,.p2,.p3{opacity:1}}
</style>''')
    o.append(f'<rect width="{W}" height="{H}" rx="40" fill="{PAPER}"/>')

    # ── Título en dos líneas (display-xl) ──
    o.append(f'<circle cx="64" cy="70" r="6" fill="{KLEIN}" class="led"/>')
    o.append(f'<text x="80" y="75" {MONO} font-size="13" font-weight="500" letter-spacing="1.2" fill="{INK_MUTED}">PWR:ON · DIRECTOR IA</text>')
    o.append(f'<text x="56" y="160" {SANS} font-size="76" font-weight="800" letter-spacing="-2.3" fill="{INK}">Reels</text>')
    o.append(f'<text x="56" y="232" {SANS} font-size="76" font-weight="800" letter-spacing="-2.3" fill="{INK}">Machine</text>')
    o.append(f'<text x="56" y="290" {SANS} font-size="30" font-weight="800" letter-spacing="-0.9" fill="{INK_MUTED}">Vídeo largo dentro.</text>')
    o.append(f'<text x="56" y="326" {SANS} font-size="30" font-weight="800" letter-spacing="-0.9" fill="{INK_MUTED}">Reels virales fuera.</text>')
    # Tecla klein (la acción de la casa)
    o.append(f'<rect x="56" y="360" width="232" height="56" rx="28" fill="{KLEIN}"/>')
    o.append(f'<text x="84" y="394" {SANS} font-size="18" font-weight="700" fill="{ON_KLEIN}">→  Crear reels</text>')
    o.append(f'<text x="308" y="393" {MONO} font-size="12" font-weight="500" letter-spacing="1" fill="{INK_MUTED}">MP4 · 9:16 · SUBS</text>')

    # ── Panel derecho: tile surface r24 ──
    PX, PY, PW, PH = 520, 32, 728, 396
    o.append(f'<rect x="{PX}" y="{PY}" width="{PW}" height="{PH}" rx="24" fill="{SURFACE}"/>')
    o.append(f'<text x="{PX+24}" y="{PY+36}" {MONO} font-size="11" font-weight="500" letter-spacing="1" fill="{INK_MUTED}">REELS · ORDENADOS POR PUNTUACIÓN</text>')

    # Línea temporal de puntos (abajo del panel)
    TX, TY, COLS, PITCH, DOTR, ROWS = PX + 84, PY + 340, 57, 10, 3, 7
    segs = [(9, 16), (25, 33), (41, 48)]
    levels = []
    for c in range(COLS):
        base = 2 + int(2.2 * abs(math.sin(c * 0.45))) + random.randint(0, 2)
        if any(a <= c <= b for a, b in segs):
            base += 2
        levels.append(min(ROWS, base))
    o.append(f'<text x="{PX+24}" y="{TY+4}" {MONO} font-size="11" font-weight="500" letter-spacing="1" fill="{INK_MUTED}">AUDIO</text>')
    for c, lv in enumerate(levels):
        for r in range(ROWS):
            on = r < lv
            o.append(f'<circle cx="{TX + c*PITCH}" cy="{TY - r*PITCH}" r="{DOTR}" fill="{INK if on else DOT_OFF}"/>')
    for k, (a, b) in enumerate(segs):
        g = [f'<g class="s{k+1}">']
        for c in range(a, b + 1):
            for r in range(levels[c]):
                g.append(f'<circle cx="{TX + c*PITCH}" cy="{TY - r*PITCH}" r="{DOTR}" fill="{KLEIN}"/>')
        g.append('</g>')
        o.append(''.join(g))
    # Cabezal rams
    o.append(f'<g class="ph"><rect x="{TX-1}" y="{TY - ROWS*PITCH}" width="2" height="{ROWS*PITCH + 10}" fill="{RAMS}"/>'
             f'<circle cx="{TX}" cy="{TY - ROWS*PITCH - 4}" r="6" fill="{RAMS}"/></g>')

    # Tres reels 9:16 (ink r16) que suben al cruzar el cabezal
    PHW, PHH, gap = 108, 192, 24
    x0 = PX + PW - 24 - 3 * PHW - 2 * gap
    data = [("9.2", ["El", "95%", "abandona"], 1), ("8.8", ["Fracasé", "tres", "años."], 0), ("8.4", ["Nunca", "midas", "el peso"], 0)]
    for k, (score, words, hot) in enumerate(data):
        x, y = x0 + k * (PHW + gap), PY + 56
        o.append(f'<g class="p{k+1}">')
        o.append(f'<rect x="{x}" y="{y}" width="{PHW}" height="{PHH}" rx="16" fill="{INK}"/>')
        o.append(f'<text x="{x+12}" y="{y+24}" {MONO} font-size="10" font-weight="500" letter-spacing="1" fill="#a8a39a">#{k+1}</text>')
        o.append(f'<text x="{x+PHW-12}" y="{y+28}" {DOT} font-size="22" font-weight="800" fill="#f2f0ea" text-anchor="end">{score}</text>')
        # subtítulo de marca en dos líneas: blanco con contorno, palabra clave en amarillo
        lines = [words[:2], words[2:]]
        for li, ws in enumerate(lines):
            if not ws:
                continue
            o.append(f'<text x="{x+PHW/2}" y="{y+PHH*0.64 + li*16}" {SANS} font-size="13" font-weight="900" text-anchor="middle" '
                     f'stroke="#000" stroke-width="2.4" paint-order="stroke" fill="#fff">')
            for i, w in enumerate(ws):
                idx = li * 2 + i
                fill = SUB_YELLOW if idx == hot else "#fff"
                o.append(f'<tspan fill="{fill}">{w}{" " if i < len(ws)-1 else ""}</tspan>')
            o.append('</text>')
        o.append(f'<circle cx="{x+16}" cy="{y+PHH-16}" r="4" fill="{SOL}"/>')
        o.append(f'<text x="{x+26}" y="{y+PHH-12}" {MONO} font-size="10" font-weight="500" fill="#a8a39a">00:3{6-k} · 9:16</text>')
        o.append('</g>')
        # punto de origen en la línea temporal
        a, b = segs[k]
        o.append(f'<circle class="s{k+1}" cx="{TX + (a+b)/2*PITCH}" cy="{TY - ROWS*PITCH - 18}" r="5" fill="{SOL}" stroke="{INK}" stroke-width="1.5"/>')
    o.append('</svg>')
    return '\n'.join(o)


def pipeline() -> str:
    W, H = 1280, 500
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
         'aria-label="Pipeline de Reels Machine: subir, señales, viral score, director IA y corte">']
    o.append('''<style>
.mv{animation:mv 1.6s cubic-bezier(.45,0,.1,1) infinite}
@keyframes mv{0%{transform:translateX(0);opacity:0}15%,85%{opacity:1}100%{transform:translateX(24px);opacity:0}}
.on{animation:on 5s steps(1,end) infinite}
@keyframes on{0%,12%{fill:#cbc7bf}13%,92%{fill:#111111}93%,100%{fill:#cbc7bf}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>''')
    o.append(f'<rect width="{W}" height="{H}" rx="40" fill="{PAPER}"/>')
    o.append(f'<text x="48" y="64" {SANS} font-size="40" font-weight="800" letter-spacing="-1.2" fill="{INK}">Cómo elige un reel</text>')
    o.append(f'<text x="48" y="104" {SANS} font-size="40" font-weight="800" letter-spacing="-1.2" fill="{INK_MUTED}">Cinco pasos, uno solo con IA</text>')

    CW, CH, G, X0, Y0 = 227, 272, 12, 48, 140

    def card(i, title, sub, tone=SURFACE, ink=INK, muted=INK_MUTED):
        x = X0 + i * (CW + G)
        o.append(f'<rect x="{x}" y="{Y0}" width="{CW}" height="{CH}" rx="24" fill="{tone}"/>')
        o.append(f'<text x="{x+20}" y="{Y0+32}" {MONO} font-size="11" font-weight="500" letter-spacing="1" fill="{muted}">{i+1:02d}</text>')
        o.append(f'<text x="{x+20}" y="{Y0+62}" {SANS} font-size="20" font-weight="700" letter-spacing="-0.2" fill="{ink}">{title}</text>')
        o.append(f'<text x="{x+20}" y="{Y0+84}" {SANS} font-size="13" font-weight="500" fill="{muted}">{sub}</text>')
        return x

    def rows(x, y, items, ink=INK, muted=INK_MUTED):
        for k, (l, r) in enumerate(items):
            yy = y + k * 26
            o.append(f'<text x="{x+20}" y="{yy}" {SANS} font-size="14" font-weight="500" fill="{ink}">{l}</text>')
            o.append(f'<text x="{x+CW-20}" y="{yy}" {MONO} font-size="12" font-weight="500" fill="{muted}" text-anchor="end">{r}</text>')

    x = card(0, "Subir", "Podcast, charla, entrevista")
    for f in range(5):
        o.append(f'<rect x="{x+20+f*36}" y="{Y0+108}" width="30" height="48" rx="8" fill="{INK}"/>')
    rows(x, Y0 + 196, [("Formatos", "MP4 · MOV"), ("Máximo", "2 GB"), ("Audio", "16 kHz")])

    x = card(1, "Señales", "En local, sin coste")
    rows(x, Y0 + 120, [("Silencios", "−30 dB"), ("Energía", "RMS"), ("Pitch · onset", "librosa"),
                       ("Novelty", "TF-IDF"), ("Texto", "Deepgram"), ("", "o Whisper")])

    x = card(2, "Viral score", "Peso de cada señal")
    weights = [("Energía", 6), ("Novelty", 4), ("Pitch", 3), ("Sentiment", 3), ("Onset", 2), ("Brillo", 2)]
    for k, (l, n) in enumerate(weights):
        yy = Y0 + 120 + k * 24
        o.append(f'<text x="{x+20}" y="{yy+4}" {SANS} font-size="14" font-weight="500" fill="{INK}">{l}</text>')
        for d in range(6):
            cls = ' class="on"' if d < n else ''
            o.append(f'<circle{cls} cx="{x+118+d*14}" cy="{yy}" r="5" fill="{INK if d < n else DOT_OFF}" '
                     f'style="animation-delay:{(k*6+d)*0.03:.2f}s"/>' if d < n else
                     f'<circle cx="{x+118+d*14}" cy="{yy}" r="5" fill="{DOT_OFF}"/>')

    x = card(3, "Director IA", "Una llamada, con tu brief", tone=SOL, ink=INK, muted=INK)
    o.append(f'<text x="{x+20}" y="{Y0+122}" {SANS} font-size="14" font-weight="700" fill="{INK}">25 candidatos → N</text>')
    for k, c in enumerate(["Hook", "Payoff", "Autónomo", "Cierre"]):
        yy = Y0 + 150 + k * 26
        o.append(f'<circle cx="{x+30}" cy="{yy-4}" r="8" fill="{INK}"/>')
        o.append(f'<text x="{x+46}" y="{yy}" {SANS} font-size="14" font-weight="500" fill="{INK}">{c}</text>')
    o.append(f'<text x="{x+20}" y="{Y0+CH-20}" {MONO} font-size="11" font-weight="500" letter-spacing=".6" fill="{INK}">~2K TOKENS, NO ~40K</text>')

    x = card(4, "Corte", "FFmpeg · libx264", tone=INK, ink="#f2f0ea", muted="#a8a39a")
    for k in range(3):
        px, py = x + 20 + k * 60, Y0 + 104
        o.append(f'<rect x="{px}" y="{py}" width="52" height="92" rx="8" fill="#2b2925"/>')
        o.append(f'<rect x="{px+8}" y="{py+56}" width="36" height="5" rx="2.5" fill="#fff"/>')
        o.append(f'<rect x="{px+12}" y="{py+64}" width="16" height="5" rx="2.5" fill="{SUB_YELLOW}"/>')
    rows(x, Y0 + 224, [("1080×1920", "9:16"), ("Subtítulos", ".ass")], ink="#f2f0ea", muted="#a8a39a")

    # Juntas: punto rams que viaja
    for i in range(4):
        xg = X0 + (i + 1) * CW + i * G
        o.append(f'<circle class="mv" style="animation-delay:{i*0.3:.1f}s" cx="{xg}" cy="{Y0+CH/2}" r="5" fill="{RAMS}"/>')

    o.append(f'<rect x="48" y="{Y0+CH+20}" width="{W-96}" height="56" rx="28" fill="{KLEIN}"/>')
    o.append(f'<text x="80" y="{Y0+CH+54}" {SANS} font-size="16" font-weight="700" fill="{ON_KLEIN}">'
             'El ML local hace el trabajo pesado gratis. Claude solo ve los mejores candidatos: ~20× menos contexto por vídeo.</text>')
    o.append('</svg>')
    return '\n'.join(o)


def subtitles_sheet() -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "engine"))
    import subtitles as S
    from PIL import Image, ImageDraw, ImageFilter

    W, H = 1080, 1920

    def bg():
        img = Image.new("RGB", (W, H), (36, 34, 31))
        d = ImageDraw.Draw(img)
        d.ellipse([W*0.30, H*0.20, W*0.70, H*0.44], fill=(150, 120, 105))
        d.rounded_rectangle([W*0.12, H*0.44, W*0.88, H*1.05], radius=260, fill=(24, 24, 26))
        return img.filter(ImageFilter.GaussianBlur(28)).convert("RGBA")

    chunks = [[("El", 0), ("95%", 1), ("abandona", 0)],
              [("en", 0), ("el", 0), ("mes", 1), ("tres.", 1)],
              [("Nunca", 1), ("midieron", 0), ("nada.", 0)]]
    panels = []
    for pos, ch in zip(("top", "center", "bottom"), chunks):
        st = S.SubtitleStyle(pos, 64, 4).normalized()
        m = S._metrics(W, H, st)
        img = bg()
        if pos != "top":
            S._draw_title(img, "El error del mes tres", "top")
        S._draw_subtitle(img, {"start": 0, "end": 1, "tokens": [(w, bool(h)) for w, h in ch]}, st, m, S._load_font(m["size"]))
        panels.append(img.resize((360, 640), Image.LANCZOS))
    pad = 24
    sheet = Image.new("RGBA", (360*3 + 8*2 + pad*2, 640 + pad*2 + 48), PAPER)
    d = ImageDraw.Draw(sheet)
    f = S._load_font(20)
    for i, (p, lab) in enumerate(zip(panels, ("ARRIBA", "CENTRO", "ABAJO · POR DEFECTO"))):
        x = pad + i * (360 + 8)
        mask = Image.new("L", p.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, 359, 639], radius=24, fill=255)
        sheet.paste(p, (x, pad), mask)
        d.text((x + 180, pad + 640 + 26), lab, font=f, fill=INK_MUTED, anchor="mm")
    sheet.convert("RGB").save(OUT / "subtitles.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "hero.svg").write_text(hero(), encoding="utf-8")
    (OUT / "pipeline.svg").write_text(pipeline(), encoding="utf-8")
    if "--subtitles" in sys.argv:
        subtitles_sheet()
    print("ok →", OUT)
