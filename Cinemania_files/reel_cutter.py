#!/usr/bin/env python3
"""
🎬 Reel Cutter — Corta reels automáticamente de tus videos
Usa Whisper para transcribir y detectar los mejores momentos.
"""

import os
import sys
import json
import re
import subprocess
import argparse
from pathlib import Path
from typing import List, Dict, Tuple, Optional


# ─────────────────────────────────────────────
# 1. EXTRAER AUDIO CON FFMPEG
# ─────────────────────────────────────────────

def get_video_duration(video_path: str) -> float:
    """Obtiene la duración del video en segundos usando ffprobe."""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0


def format_duration(seconds: float) -> str:
    """Formatea segundos como MM:SS o HH:MM:SS."""
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def extract_audio(video_path: str, output_path: str, verbose: bool = False) -> str:
    """Extrae el audio del video en formato WAV (compatible con Whisper)."""
    print(f"\n🎵 Extrayendo audio...", end="", flush=True)
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        output_path
    ]
    result = subprocess.run(
        cmd,
        capture_output=not verbose,
        text=True
    )
    if result.returncode != 0:
        print(f"\n❌ Error extrayendo audio:")
        if not verbose:
            print(result.stderr[-500:])
        sys.exit(1)
    print(f" ✅")
    return output_path


# ─────────────────────────────────────────────
# 2. TRANSCRIBIR CON WHISPER
# ─────────────────────────────────────────────

def transcribe_audio(audio_path: str, model_name: str = "base") -> List[Dict]:
    """Transcribe el audio con Whisper local y devuelve segmentos con timestamps."""
    print(f"\n📝 Transcribiendo con Whisper [{model_name}]...", end="", flush=True)
    try:
        import whisper
    except ImportError:
        raise RuntimeError(
            "Whisper no está instalado. Ejecuta: pip install openai-whisper "
            "(o usa Deepgram con transcribe_audio_deepgram)"
        )

    model = whisper.load_model(model_name)
    # word_timestamps → subtítulos palabra a palabra (bloques de N palabras)
    result = model.transcribe(audio_path, language=None, word_timestamps=True)

    segments = result.get("segments", [])
    for seg in segments:
        seg["words"] = [
            {"word": str(w.get("word", "")).strip(), "start": float(w["start"]), "end": float(w["end"])}
            for w in seg.get("words") or []
            if str(w.get("word", "")).strip()
        ]
    print(f" ✅ ({len(segments)} segmentos)")

    transcript_path = audio_path.replace(".wav", "_transcript.json")
    with open(transcript_path, "w", encoding="utf-8") as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)

    return segments


def transcribe_audio_deepgram(audio_path: str, api_key: str, language: str = None) -> List[Dict]:
    """Transcribe el audio con Deepgram Cloud API y devuelve segmentos con timestamps.

    Devuelve una lista compatible con el formato de Whisper: [{start, end, text}, ...].
    """
    try:
        import requests
    except ImportError:
        raise RuntimeError("requests no está instalado. Ejecuta: pip install requests")

    print(f"\n📝 Transcribiendo con Deepgram [nova-2]...", end="", flush=True)

    url = "https://api.deepgram.com/v1/listen"
    params = {
        "model": "nova-2",
        "smart_format": "true",
        "utterances": "true",
        "punctuate": "true",
        "sentiment": "true",
    }
    if language:
        params["language"] = language
    else:
        # detect_language no es compatible con sentiment en algunos casos
        params["language"] = "es"

    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "audio/wav",
    }

    with open(audio_path, "rb") as f:
        response = requests.post(url, params=params, headers=headers, data=f, timeout=300)

    if response.status_code != 200:
        raise RuntimeError(
            f"Deepgram error {response.status_code}: {response.text[:300]}"
        )

    data = response.json()
    utterances = data.get("results", {}).get("utterances", [])

    # Sentiment per time-range — adjuntamos a las utterances que solapan
    sentiment_segs = (
        data.get("results", {}).get("sentiments", {}).get("segments", [])
        or data.get("sentiments", {}).get("segments", [])
        or []
    )

    def sentiment_for(start: float, end: float):
        """Devuelve (sentiment_label, sentiment_score) para un rango temporal."""
        best = None
        best_overlap = 0.0
        for sg in sentiment_segs:
            sg_start = sg.get("start_word", 0) if "start_word" in sg else sg.get("start", 0)
            sg_end = sg.get("end_word", 0) if "end_word" in sg else sg.get("end", 0)
            # Algunos formatos usan "text" + words con índices, otros tiempos directos.
            # Si no son números, saltamos.
            try:
                sg_start = float(sg_start)
                sg_end = float(sg_end)
            except (TypeError, ValueError):
                continue
            overlap = max(0, min(end, sg_end) - max(start, sg_start))
            if overlap > best_overlap:
                best_overlap = overlap
                best = sg
        if best:
            return best.get("sentiment", "neutral"), float(best.get("sentiment_score", 0))
        return None, None

    if not utterances:
        # Fallback a words si no hay utterances
        words = (
            data.get("results", {}).get("channels", [{}])[0]
            .get("alternatives", [{}])[0]
            .get("words", [])
        )
        # Agrupar palabras en segmentos por pausas
        segments = []
        if words:
            current = {"start": words[0]["start"], "end": words[0]["end"], "text": words[0]["word"]}
            for w in words[1:]:
                if w["start"] - current["end"] > 0.8:
                    segments.append(current)
                    current = {"start": w["start"], "end": w["end"], "text": w["word"]}
                else:
                    current["end"] = w["end"]
                    current["text"] += " " + w["word"]
            segments.append(current)
    else:
        # Extraer también las words con timestamps para subtítulos word-level
        all_words = (
            data.get("results", {}).get("channels", [{}])[0]
            .get("alternatives", [{}])[0]
            .get("words", [])
        )

        segments = []
        for u in utterances:
            seg = {"start": u["start"], "end": u["end"], "text": u["transcript"]}
            # Words que caen dentro de esta utterance (para subs precisos)
            seg["words"] = [
                {"word": w.get("punctuated_word", w.get("word", "")), "start": w["start"], "end": w["end"]}
                for w in all_words
                if w.get("start", 0) >= u["start"] and w.get("end", 0) <= u["end"] + 0.05
            ]
            if "sentiment" in u:
                seg["sentiment"] = u.get("sentiment")
                seg["sentiment_score"] = float(u.get("sentiment_score", 0))
            else:
                lbl, sc = sentiment_for(seg["start"], seg["end"])
                if lbl is not None:
                    seg["sentiment"] = lbl
                    seg["sentiment_score"] = sc
            segments.append(seg)

    print(f" ✅ ({len(segments)} segmentos)")

    transcript_path = audio_path.replace(".wav", "_transcript.json")
    with open(transcript_path, "w", encoding="utf-8") as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)

    return segments


# ─────────────────────────────────────────────
# 3. DETECTAR MEJORES MOMENTOS PARA REELS
# ─────────────────────────────────────────────

def detect_reel_segments(
    segments: List[Dict],
    min_duration: float = 30.0,
    max_duration: float = 90.0,
    num_reels: int = 3,
    total_duration: Optional[float] = None,
) -> List[Dict]:
    """
    Detecta los mejores momentos para reels usando:
    - Pausas largas como puntos de corte naturales
    - Densidad de palabras (momentos de más energía)
    - Ventanas deslizantes entre puntos de corte
    """
    print(f"\n🔍 Detectando mejores momentos...")

    if not segments:
        if total_duration and total_duration > 0:
            return simple_cuts(total_duration, min_duration, max_duration, num_reels)
        return []

    video_end = total_duration or segments[-1]["end"]

    # Video muy corto: devolver el video completo como un único reel
    if video_end < min_duration:
        print(f"   ⚠️  Video corto ({video_end:.1f}s < {min_duration:.1f}s mín). Generando 1 reel.")
        text_preview = " ".join(s["text"].strip() for s in segments[:3])
        text_preview = text_preview[:80] + "..." if len(text_preview) > 80 else text_preview
        return [{
            "start": 0.0,
            "end": video_end,
            "duration": video_end,
            "score": 1.0,
            "text_preview": text_preview,
        }]

    def word_density(seg):
        duration = seg["end"] - seg["start"]
        if duration == 0:
            return 0
        return len(seg["text"].split()) / duration

    gaps = []
    for i in range(1, len(segments)):
        gap = segments[i]["start"] - segments[i - 1]["end"]
        gaps.append(gap)

    cut_points = [0.0]
    for i, gap in enumerate(gaps):
        if gap > 1.0:
            cut_points.append(segments[i]["start"])
    cut_points.append(video_end)

    candidates = []
    for start_idx in range(len(cut_points) - 1):
        window_start = cut_points[start_idx]
        for end_idx in range(start_idx + 1, len(cut_points)):
            window_end = cut_points[end_idx]
            duration = window_end - window_start

            if duration < min_duration:
                continue
            if duration > max_duration:
                break

            window_segs = [
                s for s in segments
                if s["start"] >= window_start and s["end"] <= window_end
            ]
            if not window_segs:
                continue

            avg_density = sum(word_density(s) for s in window_segs) / len(window_segs)
            natural_start_bonus = 1.2 if window_start in cut_points else 1.0
            score = avg_density * natural_start_bonus * (duration / max_duration)

            text_preview = " ".join(s["text"].strip() for s in window_segs[:3])
            text_preview = text_preview[:80] + "..." if len(text_preview) > 80 else text_preview

            candidates.append({
                "start": window_start,
                "end": window_end,
                "duration": duration,
                "score": score,
                "text_preview": text_preview,
            })

    if not candidates:
        print("   ⚠️  Sin ventanas válidas. Usando cortes por tiempo.")
        return simple_cuts(video_end, min_duration, max_duration, num_reels)

    candidates.sort(key=lambda x: x["score"], reverse=True)
    selected = []
    for c in candidates:
        overlap = any(
            not (c["end"] <= s["start"] or c["start"] >= s["end"])
            for s in selected
        )
        if not overlap:
            selected.append(c)
        if len(selected) >= num_reels:
            break

    selected.sort(key=lambda x: x["start"])

    for i, seg in enumerate(selected):
        start_fmt = format_duration(seg["start"])
        end_fmt = format_duration(seg["end"])
        print(f"   Reel {i+1}: {start_fmt} → {end_fmt} ({seg['duration']:.0f}s) | \"{seg['text_preview']}\"")

    return selected


SCOUT_PROMPT = """Eres un cazador de momentos potencialmente virales.

Te paso un transcript con segmentos numerados. Tu trabajo: encontrar TODOS los candidatos a clip viral. Sé generoso — pasa todos los que tengan algún hook potencial. Habrá una segunda pasada de filtrado, así que es mejor sobre-incluir que descartar buenos candidatos.

Quiero <<NUM_CANDIDATES>> candidatos, ordenados por timestamp.

CADA CANDIDATO DEBE:
- Durar entre <<MIN_DURATION>>s y <<MAX_DURATION>>s
- Empezar y terminar en segmentos que cierren oración (.!?)
- Tener algún elemento de potencial viral: hook fuerte, emoción, dato concreto, contradicción, plot twist, confesión, frase quotable

NO TE PREOCUPES POR FILTRAR FINAMENTE. Pasa todos los candidatos plausibles. La segunda pasada los validará.

Marcadores en cada segmento (cuando están disponibles):
- 🔥 score viral alto, ⚡ medio, 💤 bajo
- 🔇 silencio adyacente (corte limpio)
- ✨ vocabulario único / quotable
- 😀😠 sentimiento fuerte

PRIORIZA momentos con marcadores 🔥 ✨ 😀😠.

TRANSCRIPT:
<<TRANSCRIPT>>

Devuelve SOLO un JSON array (sin markdown, sin texto extra):
[
  {"start_segment": 12, "end_segment": 17, "rough_score": 7, "reason": "muy breve max 60 chars"},
  {"start_segment": 45, "end_segment": 52, "rough_score": 8, "reason": "..."}
]

Ordena por start_segment ascendente. NO solapes candidatos."""


VERIFY_PROMPT = """Eres un editor de TikTok experto que VALIDA si un candidato a clip es realmente viral.

Te paso <<NUM_CANDIDATES>> candidatos. Para CADA UNO, aplica el TEST DE LOS 4 SÍES y dale un score 0-10.

# TEST DE LOS 4 SÍES (cada uno vale 2.5 puntos)

1. ¿La PRIMERA frase para el scroll? (hook brutal: pregunta, dato shock, contradicción, confesión, promesa)
2. ¿Cumple lo que prometió la primera frase? (payoff denso, una sola idea clara)
3. ¿Self-contained? (un desconocido lo entiende sin ver nada antes — sin "como decía", sin "pero entonces" abriendo)
4. ¿Termina en frase completa con .!? (no en coma, no con "y...", no a mitad)

Score = (Sí_1 + Sí_2 + Sí_3 + Sí_4) × 2.5

Solo aceptamos clips con score ≥ 7. Sé EXIGENTE — preferimos rechazar buenos a aprobar malos.

# CANDIDATOS A VERIFICAR

<<CANDIDATES>>

# Tu respuesta

Devuelve SOLO un JSON array (sin markdown, sin texto extra). UN OBJETO POR CANDIDATO en el mismo orden:

[
  {
    "candidate_idx": 0,
    "score": 8.5,
    "test_1_hook": true,
    "test_2_payoff": true,
    "test_3_standalone": true,
    "test_4_complete_end": true,
    "verdict": "ACCEPT",
    "hook": "primera frase exacta del clip",
    "title": "titulo punchy max 45 chars",
    "reason": "por qué pasa o falla max 100 chars"
  }
]

verdict: "ACCEPT" si score ≥ 7, "REJECT" si < 7."""


DIRECTOR_PROMPT = """Eres el DIRECTOR creativo de un canal de reels virales. Hablas en español natural, sin jerga corporativa.

# Brief del proyecto

<<DIRECTOR_BRIEF>>

# Tu tarea

Te paso <<NUM_CANDIDATES>> candidatos a clip pre-rankeados por señales de audio + texto (energía vocal, novelty léxica, pitch, sentimiento). Tu trabajo: ELEGIR los <<NUM_REELS>> MEJORES siguiendo el brief de arriba.

NO estás obligado a usar los más rankeados — el orden del ML es una pista, no una orden. La calidad creativa importa más.

# Reglas no negociables

Cada clip elegido DEBE:
- Empezar con un HOOK que detenga el scroll (pregunta, dato shock, contradicción, confesión, promesa).
- Cumplir lo que el hook promete (payoff denso, una idea clara).
- Ser SELF-CONTAINED — un desconocido lo entiende sin ver nada antes. Nada de "y entonces…", "como decía…".
- Terminar en frase completa con .!? — nunca a mitad de oración ni en coma.
- Durar entre <<MIN_DURATION>>s y <<MAX_DURATION>>s.

Para cada clip elegido, marca también `highlight_phrases`: de 1 a 3 frases cortas (1-3 palabras cada una) copiadas LITERALMENTE del texto del clip — las palabras clave más impactantes (un número, una negación fuerte, el concepto central). Se resaltarán en amarillo en los subtítulos, así que menos es más.

Si menos de <<NUM_REELS>> candidatos cumplen estas reglas, devuelve menos. Mejor 3 reels que detengan el scroll que 5 mediocres.

# Candidatos pre-rankeados

Cada candidato tiene su `cand_id`, duración, score multimodal del ML, y el texto completo. Marcadores: 🔥/⚡/💤 viral score · ✨ vocabulario único · 😀/😠 sentimiento fuerte.

<<TOP_CANDIDATES>>

# Formato de respuesta

Devuelve SOLO un JSON array (sin markdown, sin texto extra), envuelto en `<final>...</final>`:

<final>
[
  {
    "cand_id": 7,
    "title": "título punchy max 45 chars",
    "hook": "primera frase exacta del clip",
    "reason": "por qué ese clip funciona, max 100 chars",
    "highlight_phrases": ["95%", "mes tres"]
  }
]
</final>

Ordena por aparición en el video (cand_id ascendente). NO repitas candidatos."""


DEFAULT_AI_PROMPT = """Eres un editor experto de TikTok, Reels y Shorts virales. Tu única misión: elegir los <<NUM_REELS>> MEJORES microclips de este transcript, cortados en frases COMPLETAS.

Te paso el transcript NUMERADO por SEGMENTOS. Cada segmento es una unidad atómica que NO se puede partir. Solo puedes elegir DÓNDE EMPIEZA un clip y DÓNDE TERMINA, usando los IDs de los segmentos.

# Formato del transcript
Cada línea: `[ID] (start→end) [marcadores]: "texto"`
- ID es un entero. Tu respuesta usa SOLO esos IDs.
- start/end están en segundos.

Marcadores ML (cuando están disponibles):
- 🔇← / →🔇 = SILENCIO acústico detectado adyacente. Cortar aquí garantiza que NO partes una palabra.
- 🔥X.XX / ⚡X.XX / 💤X.XX = SCORE VIRAL [0-1] combinando: volumen, variación de pitch (entusiasmo), velocidad de habla, novedad léxica, intensidad de sentimiento. 🔥 ≥ 0.65 alta, ⚡ media, 💤 baja.
- 😀+X.XX / 😠-X.XX = SENTIMIENTO fuerte detectado por Deepgram (positivo o negativo intenso).
- ✨X.XX = NOVEDAD textual alta (TF-IDF): este segmento dice algo distinto al resto del video. Probablemente quotable.

REGLAS DE USO:
- El INICIO del clip DEBE ser un segmento con 🔥 o ⚡ alto y ✨ si es posible. NUNCA inicies en 💤.
- El PUNCH (frase clave del clip) suele ser el segmento con score más alto del rango.
- Un sentiment 😀/😠 fuerte indica emoción → muy reel-able.
- ✨ marca frases originales/únicas → ideales como hook por sorpresa.

# Qué hace que un clip sea viral

Un buen clip ≠ un fragmento punchy. Un buen clip = UNA IDEA ENTERA, como un chiste:
1. SETUP — 1-3 frases que preparan al oyente
2. PUNCH — la frase impactante (dato, contradicción, confesión, plot twist)
3. CIERRE breve (opcional) — un remate de 1 frase

Si quitas el setup, el punch no se entiende. Si quitas el punch, ¿para qué publicarlo?

# El TEST de los 4 SÍes (TODO clip debe pasarlos)

Léelo en voz alta como si fuera un TikTok que vas a publicar:

1. ¿La PRIMERA frase para el scroll? (pregunta intrigante, cifra shocking, afirmación contraintuitiva, confesión, promesa concreta)
2. ¿Cumple lo que prometió la primera frase?
3. ¿Un desconocido lo entiende sin haber visto nada antes?
4. ¿Termina en frase COMPLETA con `.`, `!` o `?`? (NO en coma, NO en "y...", NO a mitad)

Si CUALQUIER respuesta es NO → DESCARTA, busca otro.

# Proceso paso a paso (OBLIGATORIO)

Para cada candidato:

PASO 1 — Encuentra el PUNCH: ¿Cuál es la frase más quotable/screenshotable? Esa es tu ancla.

PASO 2 — Camina HACIA ATRÁS desde el punch:
- ¿El segmento anterior empieza con "y", "pero", "porque", "entonces", un demostrativo ("este", "esa")? Sigue caminando atrás.
- Para cuando encuentres un segmento que abre una idea NUEVA (la frase anterior podría borrarse sin perder sentido).
- Ese es tu START.

PASO 3 — Camina HACIA ADELANTE desde el punch:
- Para cuando un segmento termine con `.`, `!` o `?` Y la idea esté cerrada.
- NUNCA pares en un segmento que termina con coma o conjunción.
- Ese es tu END.

PASO 4 — Verifica duración:
- ¿Entre <<MIN_DURATION>>s y <<MAX_DURATION>>s? Si pasa de <<MAX_DURATION>>s → ESTE MOMENTO NO ES PARA REEL. Busca otro más concentrado.
- Lo más corto posible dentro del rango.

PASO 5 — Aplica el TEST de los 4 SÍes. Si falla, DESCARTA.

# ❌ ERRORES COMUNES (rechaza si los ves)

- Empezar con conjunción/conector: "y por eso...", "pero entonces...", "porque..."
- Empezar con pronombre sin antecedente: "este problema...", "esa idea..."
- Terminar con coma o "y...": "...porque la gente cree que," / "...y entonces y..."
- Cortar en medio de una palabra o frase
- Listas sin payoff final
- Intros del podcast: "Hola a todos, bienvenidos..."
- Despedidas: "eso es todo, gracias..."
- Anécdotas que requieren contexto previo de >30s

# ✅ PRIORIZA estos patrones

- Cifras concretas: "el 80%...", "perdió 30 mil euros..."
- Negaciones fuertes: "NO funciona", "es MENTIRA", "todos se equivocan"
- Confesiones: "yo también lo hice mal durante años"
- Plot twists: "pero entonces descubrí que..."
- Preguntas con respuesta inmediata: "¿Sabes por qué? Porque..."
- Verdades contraintuitivas: "lo contrario de lo que crees"
- Promesas con tiempo: "en 20 segundos te explico"

# Transcript

<<TRANSCRIPT>>

# Tu respuesta

Primero piensa en voz alta dentro de `<reasoning>` (analiza candidatos, descarta los malos, justifica los buenos).

Después devuelve EXACTAMENTE este formato (sin markdown adicional, sin ```):

<reasoning>
[Sé CONCISO. Lista los <<NUM_REELS>> elegidos con: punch, start_segment, end_segment, duración, y 1 línea de por qué. Máximo 3 líneas por clip. NO escribas párrafos largos.]
</reasoning>

<final>
[
  {"start_segment": 12, "end_segment": 17, "hook": "primera frase exacta del clip", "title": "título punchy max 45 chars", "reason": "por qué viral max 100 chars"},
  {"start_segment": 45, "end_segment": 52, "hook": "...", "title": "...", "reason": "..."}
]
</final>

REGLAS DE LA RESPUESTA:
- `start_segment` y `end_segment` son IDs ENTEROS del transcript. NUNCA inventes números.
- `start_segment` < `end_segment` (puede ser igual si una sola línea es el clip).
- Los clips NO se solapan entre sí.
- Devuelve EXACTAMENTE <<NUM_REELS>> clips, ordenados por start_segment ascendente.
- Si no encuentras <<NUM_REELS>> clips que pasen TODOS los tests, devuelve menos. Mejor pocos buenos que muchos malos."""


def build_clean_segments(
    utterances: List[Dict],
    silences: Optional[List[Tuple[float, float]]] = None,
    silence_window: float = 1.0,
    energy_curve: Optional[List[Tuple[float, float]]] = None,
    acoustic_features: Optional[Dict] = None,
    compute_novelty: bool = True,
) -> List[Dict]:
    """Pre-procesa utterances → segmentos LIMPIOS atómicos:
    - Cada segmento es una oración completa (termina en .!?…)
    - Si Deepgram divide una oración en varias utterances (por pausas cortas/comas),
      las MERGE en un solo segmento.
    - Alinea los bordes al silencio acústico más cercano si hay info de silencios.
    - Cada segmento es la unidad MÍNIMA INDIVISIBLE que el AI puede elegir.

    Devuelve lista de dicts con: start, end, text, has_silence_before, has_silence_after.
    """
    if not utterances:
        return []

    SENTENCE_END = (".", "!", "?", "…")

    def is_sentence_end(text: str) -> bool:
        return bool(text) and text.rstrip()[-1:] in SENTENCE_END

    def nearest_silence_end_to(t: float) -> Optional[float]:
        if not silences:
            return None
        best, dist = None, silence_window + 1
        for s, e in silences:
            d = abs(e - t)
            if d < dist and d <= silence_window:
                best, dist = e, d
        return best

    def nearest_silence_start_to(t: float) -> Optional[float]:
        if not silences:
            return None
        best, dist = None, silence_window + 1
        for s, e in silences:
            d = abs(s - t)
            if d < dist and d <= silence_window:
                best, dist = s, d
        return best

    clean = []
    buf_text: List[str] = []
    buf_start: Optional[float] = None
    buf_end: Optional[float] = None
    buf_utts: List[Dict] = []

    for u in utterances:
        text = u.get("text", "").strip()
        if not text:
            continue
        if buf_start is None:
            buf_start = u["start"]
        buf_end = u["end"]
        buf_text.append(text)
        buf_utts.append(u)

        if is_sentence_end(text):
            seg_start = buf_start
            seg_end = buf_end
            # Alineación acústica
            sil_e = nearest_silence_end_to(seg_start)
            if sil_e is not None and sil_e < seg_end:
                seg_start = sil_e
            sil_s = nearest_silence_start_to(seg_end)
            if sil_s is not None and sil_s > seg_start:
                seg_end = sil_s
            seg = {
                "start": seg_start,
                "end": seg_end,
                "text": " ".join(buf_text),
                "has_silence_before": sil_e is not None,
                "has_silence_after": sil_s is not None,
            }
            # Sentiment heredado de las utterances que componen el segmento
            buf_sentiments = [u.get("sentiment_score") for u in buf_utts if u.get("sentiment_score") is not None]
            if buf_sentiments:
                seg["sentiment_score"] = sum(buf_sentiments) / len(buf_sentiments)
                # Label dominante
                buf_labels = [u.get("sentiment") for u in buf_utts if u.get("sentiment")]
                if buf_labels:
                    seg["sentiment"] = max(set(buf_labels), key=buf_labels.count)

            if energy_curve:
                seg.update(segment_energy_score(seg, energy_curve))
            if acoustic_features:
                seg.update(features_for_segment(acoustic_features, seg_start, seg_end))
            clean.append(seg)
            buf_text = []
            buf_start = None
            buf_end = None
            buf_utts = []

    if buf_text and buf_start is not None and buf_end is not None:
        seg = {
            "start": buf_start,
            "end": buf_end,
            "text": " ".join(buf_text),
            "has_silence_before": False,
            "has_silence_after": False,
        }
        if energy_curve:
            seg.update(segment_energy_score(seg, energy_curve))
        if acoustic_features:
            seg.update(features_for_segment(acoustic_features, buf_start, buf_end))
        clean.append(seg)

    # Novedad de texto (sklearn TF-IDF + cosine similarity)
    if compute_novelty and len(clean) >= 3:
        novelty_scores = compute_text_novelty([s["text"] for s in clean])
        for s, nv in zip(clean, novelty_scores):
            s["novelty_score"] = nv

    # Score viral combinado (todas las señales)
    for s in clean:
        s["viral_score"] = round(viral_score(s), 2)

    return clean


def compute_acoustic_features(audio_path: str) -> Dict:
    """Análisis acústico avanzado con librosa.

    Calcula UNA SOLA VEZ sobre todo el audio (rápido, vectorizado):
    - RMS energy (volumen)
    - Onset strength (densidad de ataques / habla rápida)
    - Pitch (f0) con YIN
    - Spectral centroid (brillo)

    Devuelve dict con arrays alineados temporalmente para queries por segmento.
    """
    try:
        import librosa
        import numpy as np
    except ImportError:
        return {}

    try:
        y, sr = librosa.load(audio_path, sr=16000, mono=True)
    except Exception:
        return {}

    if len(y) < sr:
        return {}

    hop = 512
    # RMS energy
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    rms_db = 20.0 * np.log10(np.maximum(rms, 1e-6))
    times_rms = librosa.times_like(rms, sr=sr, hop_length=hop)

    # Onset strength
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    times_onset = librosa.times_like(onset_env, sr=sr, hop_length=hop)

    # Pitch f0 (YIN — más rápido y robusto que pyin para nuestro caso)
    pitch_hop = 2048
    try:
        f0 = librosa.yin(y, fmin=75, fmax=400, sr=sr, frame_length=4096, hop_length=pitch_hop)
        times_f0 = librosa.times_like(f0, sr=sr, hop_length=pitch_hop)
    except Exception:
        f0 = np.array([])
        times_f0 = np.array([])

    # Spectral centroid (brillo / claridad de pronunciación)
    try:
        cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
        times_cent = librosa.times_like(cent, sr=sr, hop_length=hop)
    except Exception:
        cent = np.array([])
        times_cent = np.array([])

    return {
        "rms_db": rms_db,
        "times_rms": times_rms,
        "onset_env": onset_env,
        "times_onset": times_onset,
        "f0": f0,
        "times_f0": times_f0,
        "centroid": cent,
        "times_cent": times_cent,
        "sr": sr,
        "duration": len(y) / sr,
    }


def features_for_segment(features: Dict, start: float, end: float) -> Dict[str, float]:
    """Extrae features acústicas para un segmento dado el resultado global de compute_acoustic_features."""
    try:
        import numpy as np
    except ImportError:
        return {}
    if not features:
        return {}

    def _slice_stat(arr, times, s, e, ignore_nan=False):
        if len(arr) == 0:
            return None
        mask = (times >= s) & (times <= e)
        sub = arr[mask]
        if ignore_nan:
            sub = sub[~np.isnan(sub)]
        if len(sub) == 0:
            return None
        return sub

    rms = _slice_stat(features.get("rms_db", []), features.get("times_rms", []), start, end)
    onset = _slice_stat(features.get("onset_env", []), features.get("times_onset", []), start, end)
    f0 = _slice_stat(features.get("f0", []), features.get("times_f0", []), start, end, ignore_nan=True)
    cent = _slice_stat(features.get("centroid", []), features.get("times_cent", []), start, end)

    out = {}
    if rms is not None:
        out["rms_mean_db"] = float(rms.mean())
        out["rms_peak_db"] = float(rms.max())
    if onset is not None and len(onset) > 0:
        out["onset_mean"] = float(onset.mean())
        # Pico de onset normalizado vs el promedio global
        global_onset = features.get("onset_env", [])
        if len(global_onset) > 0:
            out["onset_density"] = float(onset.mean() / max(global_onset.mean(), 1e-6))
    if f0 is not None and len(f0) > 0:
        out["pitch_mean_hz"] = float(f0.mean())
        out["pitch_var_hz"] = float(f0.std())
    if cent is not None and len(cent) > 0:
        out["brightness"] = float(cent.mean())

    return out


def compute_text_novelty(texts: List[str]) -> List[float]:
    """Calcula score de novedad por texto usando TF-IDF + similitud coseno (sklearn).

    Score [0,1]: 1 = muy único respecto al resto, 0 = muy repetitivo/común.
    Útil para identificar momentos con contenido distintivo (potenciales hooks).
    """
    if len(texts) < 3:
        return [0.5] * len(texts)
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
    except ImportError:
        return [0.5] * len(texts)

    try:
        # Stop words españolas básicas (sklearn no las trae built-in para español)
        spanish_stops = {
            "el", "la", "los", "las", "un", "una", "unos", "unas",
            "y", "o", "pero", "porque", "que", "qué", "como", "cómo",
            "de", "del", "al", "a", "en", "con", "sin", "por", "para",
            "es", "son", "ser", "estar", "está", "están", "fue", "fueron",
            "se", "le", "lo", "su", "sus", "mi", "mis", "tu", "tus",
            "yo", "tú", "él", "ella", "nosotros", "vosotros", "ellos",
            "esto", "esta", "este", "esa", "ese", "eso", "aquí", "ahí",
            "muy", "más", "menos", "ya", "no", "sí", "también", "tan",
            "hay", "hace", "hacer", "puede", "tiene", "tener",
        }
        vec = TfidfVectorizer(
            max_features=600,
            ngram_range=(1, 2),
            stop_words=list(spanish_stops),
            min_df=1,
        )
        X = vec.fit_transform(texts)
        if X.shape[1] == 0:
            return [0.5] * len(texts)
        sim = cosine_similarity(X)
        np.fill_diagonal(sim, 0.0)
        avg_sim = sim.mean(axis=1)
        rng = avg_sim.max() - avg_sim.min()
        if rng < 1e-6:
            return [0.5] * len(texts)
        norm = (avg_sim - avg_sim.min()) / rng
        novelty = 1.0 - norm
        return [float(round(v, 2)) for v in novelty]
    except Exception:
        return [0.5] * len(texts)


def viral_score(seg: Dict) -> float:
    """Score combinado [0,1] de potencial viral usando todas las features disponibles."""
    weights = {
        "energy": 0.30,
        "pitch_var": 0.15,
        "onset": 0.10,
        "novelty": 0.20,
        "sentiment": 0.15,
        "brightness": 0.10,
    }
    parts = []
    if "rms_mean_db" in seg:
        # RMS típicamente entre -45 y -10 dB → normalizamos a 0-1
        rms_norm = max(0, min(1, (seg["rms_mean_db"] + 45) / 35))
        parts.append(weights["energy"] * rms_norm)
    if "pitch_var_hz" in seg:
        # Pitch variance típicamente 5-50 Hz para habla expresiva
        pv_norm = max(0, min(1, seg["pitch_var_hz"] / 40.0))
        parts.append(weights["pitch_var"] * pv_norm)
    if "onset_density" in seg:
        on_norm = max(0, min(1, (seg["onset_density"] - 0.5) / 1.0))
        parts.append(weights["onset"] * on_norm)
    if "novelty_score" in seg:
        parts.append(weights["novelty"] * seg["novelty_score"])
    if "sentiment_score" in seg:
        parts.append(weights["sentiment"] * abs(seg["sentiment_score"]))
    if "brightness" in seg:
        # Brightness > 1500 Hz suele indicar pronunciación clara/aguda
        b_norm = max(0, min(1, (seg["brightness"] - 800) / 1500))
        parts.append(weights["brightness"] * b_norm)

    if not parts:
        return 0.5
    total_weight = sum(weights[k] for k, present in [
        ("energy", "rms_mean_db" in seg),
        ("pitch_var", "pitch_var_hz" in seg),
        ("onset", "onset_density" in seg),
        ("novelty", "novelty_score" in seg),
        ("sentiment", "sentiment_score" in seg),
        ("brightness", "brightness" in seg),
    ] if present)
    return sum(parts) / max(total_weight, 1e-6)


def compute_audio_energy(audio_path: str, window_sec: float = 0.5) -> List[Tuple[float, float]]:
    """Calcula la energía RMS (en dB) del audio en ventanas de `window_sec` usando NumPy.

    Devuelve lista de (tiempo_centro_seg, rms_db). Útil para:
    - Identificar momentos de alta energía (hooks emocionales, énfasis)
    - Detectar slowdowns dramáticos (caídas de energía)
    - Re-rankear segmentos por engagement

    No requiere librerías ML pesadas — solo NumPy + ffmpeg para decodificar.
    """
    try:
        import numpy as np
    except ImportError:
        raise RuntimeError("numpy no disponible: pip install numpy")

    # Decodificar audio a PCM int16 mono 16kHz
    cmd = [
        "ffmpeg", "-i", audio_path,
        "-f", "s16le",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        "-loglevel", "error",
        "pipe:1",
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0:
        return []

    samples = np.frombuffer(result.stdout, dtype=np.int16).astype(np.float32) / 32768.0
    if len(samples) == 0:
        return []

    sr = 16000
    window = max(1, int(window_sec * sr))
    n_windows = len(samples) // window

    if n_windows == 0:
        return []

    # RMS por ventana de forma vectorizada
    trimmed = samples[: n_windows * window].reshape(n_windows, window)
    rms = np.sqrt(np.mean(trimmed ** 2, axis=1))
    rms_db = 20.0 * np.log10(np.maximum(rms, 1e-6))

    times = (np.arange(n_windows) + 0.5) * window_sec
    return list(zip(times.tolist(), rms_db.tolist()))


def segment_energy_score(
    segment: Dict,
    energy_curve: List[Tuple[float, float]],
) -> Dict[str, float]:
    """Resume la energía de un segmento dado la curva RMS global.

    Devuelve dict con: mean_db, peak_db, dynamic_range_db, energy_score (0-1 normalizado).
    """
    try:
        import numpy as np
    except ImportError:
        return {"mean_db": 0, "peak_db": 0, "dynamic_range_db": 0, "energy_score": 0.5}

    if not energy_curve:
        return {"mean_db": 0, "peak_db": 0, "dynamic_range_db": 0, "energy_score": 0.5}

    s, e = segment["start"], segment["end"]
    in_range = [db for t, db in energy_curve if s <= t <= e]
    if not in_range:
        return {"mean_db": 0, "peak_db": 0, "dynamic_range_db": 0, "energy_score": 0.5}

    arr = np.array(in_range)
    mean = float(arr.mean())
    peak = float(arr.max())
    dr = float(arr.max() - arr.min())

    # Normalizar respecto a la curva global para tener un score [0,1]
    all_means = np.array([db for _, db in energy_curve])
    g_min = float(all_means.min())
    g_max = float(all_means.max())
    if g_max - g_min < 1e-3:
        score = 0.5
    else:
        score = (mean - g_min) / (g_max - g_min)
        score = max(0.0, min(1.0, float(score)))

    return {
        "mean_db": round(mean, 1),
        "peak_db": round(peak, 1),
        "dynamic_range_db": round(dr, 1),
        "energy_score": round(score, 2),
    }


def detect_silences(audio_path: str, threshold_db: float = -30.0, min_silence: float = 0.35) -> List[Tuple[float, float]]:
    """Detecta silencios en el audio usando el filtro silencedetect de ffmpeg.

    Devuelve una lista de tuplas (silence_start, silence_end) en segundos.
    Usa para snap fino del start/end del clip a pausas reales del speaker.
    """
    import re
    cmd = [
        "ffmpeg", "-hide_banner", "-nostats",
        "-i", audio_path,
        "-af", f"silencedetect=noise={threshold_db}dB:d={min_silence}",
        "-f", "null", "-",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stderr  # ffmpeg manda silencedetect a stderr

    silences = []
    current_start = None
    for line in output.splitlines():
        m_start = re.search(r"silence_start:\s*([\d.]+)", line)
        m_end = re.search(r"silence_end:\s*([\d.]+)", line)
        if m_start:
            current_start = float(m_start.group(1))
        elif m_end and current_start is not None:
            silences.append((current_start, float(m_end.group(1))))
            current_start = None
    return silences


def _call_claude(api_key: str, model: str, prompt: str, max_tokens: int = 4000, timeout: int = 120) -> str:
    """Helper: llamada simple a Claude, devuelve el texto del response."""
    try:
        import requests
    except ImportError:
        raise RuntimeError("requests no disponible")
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=timeout,
    )
    if response.status_code != 200:
        raise RuntimeError(f"Claude {response.status_code}: {response.text[:300]}")
    return response.json()["content"][0]["text"].strip()


def _extract_json_array(text: str) -> List[Dict]:
    """Extrae JSON array de un response de Claude (con o sin <final> o ```)."""
    import re
    # Buscar <final>...</final>
    m = re.search(r"<final>\s*(\[.*?\])\s*</final>", text, re.DOTALL)
    if m:
        json_text = m.group(1)
    else:
        m2 = re.search(r"(\[\s*\{.*\}\s*\])", text, re.DOTALL)
        json_text = m2.group(1) if m2 else text
    json_text = json_text.strip()
    if json_text.startswith("```"):
        lines = json_text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        json_text = "\n".join(lines).strip()
    return json.loads(json_text)


def scout_candidates(
    api_key: str,
    transcript: str,
    num_candidates: int,
    min_duration: float,
    max_duration: float,
    model: str = "claude-haiku-4-5-20251001",
) -> List[Dict]:
    """PASO 1 — Scout: detecta candidatos amplios con Haiku (rápido, barato)."""
    prompt = (
        SCOUT_PROMPT
        .replace("<<NUM_CANDIDATES>>", str(num_candidates))
        .replace("<<MIN_DURATION>>", f"{min_duration:.0f}")
        .replace("<<MAX_DURATION>>", f"{max_duration:.0f}")
        .replace("<<TRANSCRIPT>>", transcript)
    )
    text = _call_claude(api_key, model, prompt, max_tokens=8000, timeout=120)
    return _extract_json_array(text)


def verify_candidates(
    api_key: str,
    candidates: List[Dict],
    clean_segments: List[Dict],
    num_reels: int,
    model: str = "claude-sonnet-4-6",
) -> List[Dict]:
    """PASO 2 — Verify: valida cada candidato con Sonnet/Opus (preciso, exigente)."""
    if not candidates:
        return []

    # Construir descripción de cada candidato
    cand_blocks = []
    for i, c in enumerate(candidates):
        si, ei = c.get("start_segment"), c.get("end_segment")
        if si is None or ei is None:
            continue
        try:
            si, ei = int(si), int(ei)
        except (TypeError, ValueError):
            continue
        if si < 0 or ei >= len(clean_segments) or ei < si:
            continue
        text = " ".join(s["text"] for s in clean_segments[si:ei+1])
        start_t = clean_segments[si]["start"]
        end_t = clean_segments[ei]["end"]
        duration = end_t - start_t
        cand_blocks.append(
            f"[Candidato {i}] segments {si}→{ei} | {start_t:.1f}s→{end_t:.1f}s ({duration:.0f}s)\n"
            f"Texto: \"{text}\"\n"
        )

    prompt = (
        VERIFY_PROMPT
        .replace("<<NUM_CANDIDATES>>", str(len(candidates)))
        .replace("<<CANDIDATES>>", "\n".join(cand_blocks))
    )
    text = _call_claude(api_key, model, prompt, max_tokens=12000, timeout=180)
    verdicts = _extract_json_array(text)

    # Combinar candidatos con verdicts
    out = []
    by_idx = {v.get("candidate_idx"): v for v in verdicts}
    for i, c in enumerate(candidates):
        v = by_idx.get(i, {})
        score = float(v.get("score", 0))
        if v.get("verdict") == "ACCEPT" and score >= 7.0:
            si, ei = int(c["start_segment"]), int(c["end_segment"])
            out.append({
                "start_segment": si,
                "end_segment": ei,
                "score": score,
                "hook": v.get("hook", ""),
                "title": v.get("title", ""),
                "reason": v.get("reason", ""),
                "test_results": {
                    "hook": v.get("test_1_hook", False),
                    "payoff": v.get("test_2_payoff", False),
                    "standalone": v.get("test_3_standalone", False),
                    "complete_end": v.get("test_4_complete_end", False),
                },
            })

    # Ordenar por score descendente y quedarse con los mejores
    out.sort(key=lambda x: x["score"], reverse=True)
    out = out[:num_reels]
    # Re-ordenar por timestamp
    out.sort(key=lambda x: clean_segments[x["start_segment"]]["start"])
    return out


def _build_candidate_windows(
    clean_segments: List[Dict],
    min_duration: float,
    max_duration: float,
    target_count: int = 25,
) -> List[Dict]:
    """Genera ventanas no-solapantes pre-rankeadas por viral_score.

    El ML ya calculó viral_score por segmento. Acá agrupamos segmentos
    consecutivos en ventanas que cumplen la duración deseada y rankeamos
    para que la IA reciba SÓLO los mejores candidatos pre-curados.
    """
    windows: List[Dict] = []
    n = len(clean_segments)

    for i in range(n):
        scores: List[float] = []
        for j in range(i, n):
            seg = clean_segments[j]
            scores.append(float(seg.get("viral_score") or 0.5))

            start = clean_segments[i]["start"]
            end = seg["end"]
            duration = end - start

            if duration > max_duration:
                break
            if duration < min_duration:
                continue

            # Bonus por bordes naturales (silencio adyacente, fin de oración)
            start_bonus = 1.05 if clean_segments[i].get("has_silence_before") else 1.0
            end_bonus = 1.05 if seg.get("has_silence_after") else 1.0
            text = seg.get("text", "").strip()
            if text and text[-1:] in ".!?":
                end_bonus *= 1.05

            avg = sum(scores) / max(1, len(scores))
            windows.append({
                "start_seg": i,
                "end_seg": j,
                "start": start,
                "end": end,
                "duration": duration,
                "score": avg * start_bonus * end_bonus,
            })

    # Greedy non-overlapping por score desc
    windows.sort(key=lambda w: w["score"], reverse=True)
    selected: List[Dict] = []

    def overlaps(a: Dict, b: Dict) -> bool:
        return not (a["end"] <= b["start"] or b["end"] <= a["start"])

    for w in windows:
        if any(overlaps(w, s) for s in selected):
            continue
        selected.append(w)
        if len(selected) >= target_count:
            break

    # Ordenar por aparición en el video
    selected.sort(key=lambda w: w["start"])
    return selected


def _format_director_candidates(
    candidates: List[Dict],
    clean_segments: List[Dict],
) -> str:
    """Render compacto: cada candidato con su id, duración, score, marcadores y texto."""
    lines: List[str] = []
    for cand_id, w in enumerate(candidates):
        si, ei = w["start_seg"], w["end_seg"]
        duration = w["duration"]
        score = w["score"]

        # Marcador viral
        if score >= 0.65:
            mark = "🔥"
        elif score >= 0.45:
            mark = "⚡"
        else:
            mark = "💤"

        # Marcadores adicionales (sentiment, novelty) del primer segmento "líder"
        extras: List[str] = []
        leader = clean_segments[si]
        nv = leader.get("novelty_score")
        if nv is not None and nv >= 0.75:
            extras.append("✨")
        sent = leader.get("sentiment")
        sent_score = leader.get("sentiment_score")
        if sent and sent_score is not None and abs(sent_score) >= 0.5:
            extras.append("😀" if sent == "positive" else "😠")

        # Texto completo (todos los segmentos del candidato)
        text_parts = [s.get("text", "").strip() for s in clean_segments[si:ei + 1]]
        full_text = " ".join(t for t in text_parts if t)

        # Recorte amable si es muy largo (raro a estos rangos)
        if len(full_text) > 1200:
            full_text = full_text[:1200].rsplit(" ", 1)[0] + "…"

        marks_str = f"{mark} {' '.join(extras)}".strip()
        lines.append(
            f"[cand_id={cand_id}] {duration:.0f}s · {marks_str} · score={score:.2f}\n"
            f"  ({w['start']:.1f}→{w['end']:.1f})\n"
            f"  \"{full_text}\""
        )

    return "\n\n".join(lines)


def _clean_highlights(value) -> List[str]:
    """Normaliza highlight_phrases del modelo: lista de ≤3 frases de 1-3 palabras."""
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list):
        return []
    out = []
    for v in value:
        phrase = " ".join(str(v).split())
        if phrase and 1 <= len(phrase.split()) <= 3:
            out.append(phrase)
    return out[:3]


def select_reels_with_director(
    api_key: str,
    clean_segments: List[Dict],
    director_brief: str,
    num_reels: int,
    min_duration: float,
    max_duration: float,
    model: str = "claude-sonnet-4-6",
    top_k: int = 25,
    progress_cb=None,
    capture_prompt_cb=None,
) -> List[Dict]:
    """Pipeline director: ML local pre-rankea TOP K → Claude elige los N finales.

    Esto reemplaza el flujo Scout (Haiku) → Verify (Sonnet) por una sola
    llamada a un modelo capaz, con contexto reducido (~2K tokens vs ~40K).
    """
    if not clean_segments:
        return []

    if progress_cb:
        progress_cb("ML: rankeando candidatos por viral_score…")

    candidates = _build_candidate_windows(
        clean_segments,
        min_duration=min_duration,
        max_duration=max_duration,
        target_count=top_k,
    )
    if not candidates:
        return []

    if progress_cb:
        progress_cb(f"Director: eligiendo los {num_reels} mejores de {len(candidates)} candidatos…")

    brief_text = (director_brief or "").strip()
    if not brief_text:
        brief_text = (
            "Detecta los momentos más impactantes y compartibles del video. "
            "Tono cercano, gancho fuerte, una idea por reel. Audiencia general."
        )

    candidates_block = _format_director_candidates(candidates, clean_segments)

    prompt = (
        DIRECTOR_PROMPT
        .replace("<<DIRECTOR_BRIEF>>", brief_text)
        .replace("<<NUM_CANDIDATES>>", str(len(candidates)))
        .replace("<<NUM_REELS>>", str(num_reels))
        .replace("<<MIN_DURATION>>", f"{min_duration:.0f}")
        .replace("<<MAX_DURATION>>", f"{max_duration:.0f}")
        .replace("<<TOP_CANDIDATES>>", candidates_block)
    )

    print(f"   ↪ director prompt: ~{len(prompt)//4} tokens")

    if capture_prompt_cb:
        capture_prompt_cb(prompt, candidates_block)

    text = _call_claude(api_key, model, prompt, max_tokens=4000, timeout=180)
    verdicts = _extract_json_array(text)

    out: List[Dict] = []
    for v in verdicts:
        cand_id = v.get("cand_id")
        if cand_id is None or cand_id < 0 or cand_id >= len(candidates):
            continue
        w = candidates[cand_id]
        out.append({
            "start_segment": w["start_seg"],
            "end_segment": w["end_seg"],
            "score": 8.0,  # los que pasan el director quedan calificados
            "hook": v.get("hook", ""),
            "title": v.get("title", ""),
            "reason": v.get("reason", ""),
            "highlight_phrases": _clean_highlights(v.get("highlight_phrases")),
        })

    # Limitar y ordenar por aparición
    out = out[:num_reels]
    out.sort(key=lambda r: clean_segments[r["start_segment"]]["start"])
    return out


def detect_reel_segments_ai(
    segments: List[Dict],
    api_key: str,
    num_reels: int = 3,
    min_duration: float = 30.0,
    max_duration: float = 90.0,
    total_duration: Optional[float] = None,
    model: str = "claude-sonnet-4-6",
    prompt_template: Optional[str] = None,
    silences: Optional[List[Tuple[float, float]]] = None,
    energy_curve: Optional[List[Tuple[float, float]]] = None,
    acoustic_features: Optional[Dict] = None,
    two_pass: bool = False,
    scout_model: Optional[str] = None,
    director_brief: str = "",
    progress_cb=None,
    capture_prompt_cb=None,
) -> List[Dict]:
    """Detecta los mejores momentos usando Claude para análisis semántico.

    Le pide a Claude que identifique segmentos con HOOKS fuertes y potencial viral.
    """
    try:
        import requests
    except ImportError:
        raise RuntimeError("requests no está instalado: pip install requests")

    if not segments:
        return []

    print(f"\n🤖 Analizando contenido con Claude [{model}]...", end="", flush=True)

    # Pre-procesar a segmentos LIMPIOS + scoring multi-feature
    clean_segments = build_clean_segments(
        segments,
        silences=silences,
        energy_curve=energy_curve,
        acoustic_features=acoustic_features,
    )
    if not clean_segments:
        clean_segments = segments

    # Construir transcript NUMERADO con anotaciones ricas
    transcript_lines = []
    for i, s in enumerate(clean_segments):
        text = s["text"].strip()
        if not text:
            continue
        marks = []
        if s.get("has_silence_before"):
            marks.append("🔇←")
        if s.get("has_silence_after"):
            marks.append("→🔇")
        # Score viral combinado (todas las señales ML)
        vs = s.get("viral_score")
        if vs is not None:
            if vs >= 0.65:
                marks.append(f"🔥{vs:.2f}")
            elif vs >= 0.45:
                marks.append(f"⚡{vs:.2f}")
            else:
                marks.append(f"💤{vs:.2f}")
        # Sentiment fuerte (positivo o negativo extremo)
        sent = s.get("sentiment")
        sent_score = s.get("sentiment_score")
        if sent and sent_score is not None and abs(sent_score) >= 0.5:
            if sent == "positive":
                marks.append(f"😀{sent_score:+.2f}")
            elif sent == "negative":
                marks.append(f"😠{sent_score:+.2f}")
        # Novedad textual alta (contenido único / quotable)
        nv = s.get("novelty_score")
        if nv is not None and nv >= 0.75:
            marks.append(f"✨{nv:.2f}")

        mark_str = f" {' '.join(marks)}" if marks else ""
        transcript_lines.append(
            f"[{i}] ({s['start']:.1f}→{s['end']:.1f}){mark_str}: {text}"
        )
    transcript = "\n".join(transcript_lines)

    # ── Pipeline DIRECTOR: ML local pre-rankea + Sonnet único ──
    # (El flag two_pass se mantiene por compatibilidad de signature; cuando
    # está activado, ahora corre el director en vez de Scout+Verify.)
    if two_pass:
        selections = select_reels_with_director(
            api_key=api_key,
            clean_segments=clean_segments,
            director_brief=director_brief,
            num_reels=num_reels,
            min_duration=min_duration,
            max_duration=max_duration,
            model=model,
            top_k=25,
            progress_cb=progress_cb,
            capture_prompt_cb=capture_prompt_cb,
        )

        # Construir reels finales
        reels = []
        for sel in selections:
            si = int(sel["start_segment"])
            ei = int(sel["end_segment"])
            if si < 0 or ei >= len(clean_segments) or ei < si:
                continue
            start = clean_segments[si]["start"]
            end = clean_segments[ei]["end"]
            if total_duration:
                end = min(end, total_duration)
            if end <= start:
                continue
            duration = end - start
            if duration > max_duration:
                end = start + max_duration
                duration = max_duration

            preview_segs = [
                s["text"].strip()
                for s in clean_segments[si:ei + 1]
            ]
            preview = " ".join(t for t in preview_segs if t)
            if len(preview) > 100:
                preview = preview[:100].rsplit(" ", 1)[0] + "…"

            reels.append({
                "start": start,
                "end": end,
                "duration": duration,
                "score": sel.get("score", 8.0) / 10.0,
                "text_preview": preview,
                "reason": sel.get("reason", ""),
                "hook": sel.get("hook", ""),
                "ai_title": sel.get("title", ""),
                "title": sel.get("title", ""),
                "transcript": " ".join(t for t in preview_segs if t),
                "highlight_phrases": sel.get("highlight_phrases", []),
            })
        reels.sort(key=lambda r: r["start"])
        print(f" ✅ ({len(reels)} reels seleccionados — director · top-25 ML)")
        return reels

    # ── Modo de 1 pasada (legacy) ──
    template = prompt_template or DEFAULT_AI_PROMPT
    prompt = (
        template
        .replace("<<NUM_REELS>>", str(num_reels))
        .replace("<<MIN_DURATION>>", f"{min_duration:.0f}")
        .replace("<<MAX_DURATION>>", f"{max_duration:.0f}")
        .replace("<<TRANSCRIPT>>", transcript)
    )
    if capture_prompt_cb:
        capture_prompt_cb(prompt, transcript)
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": 8000,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=180,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"Claude API error {response.status_code}: {response.text[:400]}"
        )

    data = response.json()
    text = data["content"][0]["text"].strip()

    # Extraer el JSON entre <final>...</final> si está, sino usar el texto entero
    import re as _re
    m = _re.search(r"<final>\s*(\[.*?\])\s*</final>", text, _re.DOTALL)
    if m:
        json_text = m.group(1)
    else:
        # Fallback: buscar el primer array JSON en el texto
        m2 = _re.search(r"(\[\s*\{.*\}\s*\])", text, _re.DOTALL)
        json_text = m2.group(1) if m2 else text

    # Quitar fences markdown si quedan
    json_text = json_text.strip()
    if json_text.startswith("```"):
        lines = json_text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        json_text = "\n".join(lines).strip()

    selections = json.loads(json_text)

    # ── Helpers para snap a fin/inicio de oración (.!?) ──
    SENTENCE_END = (".", "!", "?", "…")

    def is_sentence_end(text: str) -> bool:
        return bool(text) and text.rstrip()[-1:] in SENTENCE_END

    def snap_start_to_sentence(t: float) -> float:
        """Devuelve el inicio del segmento donde empieza una nueva oración (o el inicio absoluto)."""
        # Encontrar índice del segmento que contiene t o el siguiente
        idx = None
        for i, s in enumerate(segments):
            if s["start"] <= t <= s["end"]:
                idx = i
                break
            if s["start"] >= t:
                idx = i
                break
        if idx is None:
            return t
        # Retroceder mientras el segmento anterior NO cierre oración
        while idx > 0 and not is_sentence_end(segments[idx - 1]["text"]):
            idx -= 1
        return segments[idx]["start"]

    def snap_end_to_sentence(t: float) -> float:
        """Devuelve el fin del segmento que cierra una oración cerca de t."""
        # Encontrar último segmento que termina antes o cerca de t
        idx = None
        for i, s in enumerate(segments):
            if s["end"] <= t + 0.5:
                idx = i
            elif s["start"] > t:
                break
        if idx is None:
            return t
        # Avanzar mientras el segmento actual NO cierre oración (con un margen razonable)
        max_skip = 6
        skipped = 0
        while idx < len(segments) - 1 and not is_sentence_end(segments[idx]["text"]) and skipped < max_skip:
            idx += 1
            skipped += 1
        return segments[idx]["end"]

    # Construir reels en formato interno + validar duraciones
    reels = []
    skipped_long = 0
    n_clean = len(clean_segments)

    for sel in selections:
        # Modo nuevo: el AI devolvió IDs de segmentos limpios → mapear a timestamps
        if "start_segment" in sel and "end_segment" in sel:
            try:
                si = int(sel["start_segment"])
                ei = int(sel["end_segment"])
            except (TypeError, ValueError):
                continue
            if si < 0 or ei < 0 or si >= n_clean or ei >= n_clean or ei < si:
                continue
            start = clean_segments[si]["start"]
            end = clean_segments[ei]["end"]
        # Modo legacy: timestamps libres → snap como antes
        elif "start" in sel and "end" in sel:
            start = max(0.0, float(sel["start"]))
            end = float(sel["end"])
            start = snap_start_to_sentence(start)
            end = snap_end_to_sentence(end)
            if silences:
                TOL = 1.0
                best = None
                bd = TOL + 1
                for sil_s, sil_e in silences:
                    if abs(sil_e - start) < bd and abs(sil_e - start) <= TOL:
                        best, bd = sil_e, abs(sil_e - start)
                if best is not None:
                    start = best
                best = None
                bd = TOL + 1
                for sil_s, sil_e in silences:
                    if abs(sil_s - end) < bd and abs(sil_s - end) <= TOL:
                        best, bd = sil_s, abs(sil_s - end)
                if best is not None:
                    end = best
        else:
            continue

        if total_duration:
            end = min(end, total_duration)
        if end <= start:
            continue

        duration = end - start

        # Si quedó demasiado corto tras el snap, extender al siguiente fin de oración
        if duration < min_duration:
            for s in segments:
                if s["end"] > end and is_sentence_end(s["text"]) and (s["end"] - start) <= max_duration:
                    end = s["end"]
                    duration = end - start
                    if duration >= min_duration:
                        break

        # Si quedó demasiado largo, recortar al último fin de oración dentro del max
        if duration > max_duration:
            target_end = start + max_duration
            new_end = None
            for s in segments:
                if s["start"] >= start and s["end"] <= target_end and is_sentence_end(s["text"]):
                    new_end = s["end"]
            if new_end:
                end = new_end
                duration = end - start
            else:
                # Recorte duro como último recurso
                end = start + max_duration
                duration = max_duration
                skipped_long += 1

        if duration < 1.0:
            continue

        # Preview construido a partir de clean_segments dentro del rango
        preview_segs = [
            s["text"].strip()
            for s in clean_segments
            if s["end"] >= start and s["start"] <= end
        ]
        preview = " ".join(preview_segs)
        if len(preview) > 100:
            preview = preview[:100].rsplit(" ", 1)[0] + "…"

        reels.append({
            "start": start,
            "end": end,
            "duration": duration,
            "score": 1.0,
            "text_preview": preview,
            "reason": sel.get("reason", ""),
            "hook": sel.get("hook", ""),
            "ai_title": sel.get("title", ""),
        })

    if skipped_long > 0:
        print(f"\n   ⚠️  {skipped_long} clip(s) recortados al máximo de {max_duration:.0f}s")

    # Ordenar por inicio
    reels.sort(key=lambda r: r["start"])

    print(f" ✅ ({len(reels)} reels seleccionados)")
    return reels


def simple_cuts(total_duration: float, min_duration: float, max_duration: float, num_reels: int) -> List[Dict]:
    """Cortes simples por tiempo cuando no hay suficiente transcripción."""
    reel_duration = min(max_duration, total_duration / max(num_reels, 1))
    cuts = []
    for i in range(num_reels):
        start = i * reel_duration
        end = start + reel_duration
        if end > total_duration:
            break
        cuts.append({
            "start": start,
            "end": end,
            "duration": reel_duration,
            "score": 1.0,
            "text_preview": f"Segmento {i + 1}",
        })
    return cuts


# ─────────────────────────────────────────────
# 4. CORTAR Y AÑADIR TÍTULO CON FFMPEG
# ─────────────────────────────────────────────

def generate_title(text_preview: str, reel_number: int) -> str:
    """Genera un título limpio para el reel."""
    clean = text_preview.replace('"', '').replace("'", "").strip()
    if len(clean) > 50:
        clean = clean[:50].rsplit(' ', 1)[0]
    return clean if clean else f"Reel {reel_number}"


def _format_srt_time(seconds: float) -> str:
    """Formatea segundos como HH:MM:SS,mmm para SRT."""
    if seconds < 0:
        seconds = 0
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def generate_srt_for_clip(
    segments: List[Dict],
    clip_start: float,
    clip_end: float,
    output_path: str,
    words_per_chunk: int = 3,
    uppercase: bool = True,
) -> bool:
    """Genera un .srt con subtítulos en chunks de N palabras, ajustados al inicio del clip.

    Devuelve True si se escribió el archivo, False si no había words disponibles.
    """
    # Recolectar todas las words dentro del rango del clip
    words = []
    for seg in segments:
        seg_words = seg.get("words") or []
        for w in seg_words:
            ws, we = w.get("start", 0), w.get("end", 0)
            if we >= clip_start and ws <= clip_end:
                # Recortar al rango del clip
                ws = max(ws, clip_start)
                we = min(we, clip_end)
                if we > ws:
                    words.append({
                        "word": w["word"],
                        "start": ws - clip_start,  # tiempo relativo al clip
                        "end": we - clip_start,
                    })

    if not words:
        # Fallback: usar utterance-level
        for seg in segments:
            ss, se = seg["start"], seg["end"]
            if se >= clip_start and ss <= clip_end:
                ss = max(ss, clip_start)
                se = min(se, clip_end)
                if se > ss:
                    words.append({
                        "word": seg["text"].strip(),
                        "start": ss - clip_start,
                        "end": se - clip_start,
                    })
        if not words:
            return False

    # Agrupar en chunks
    lines = []
    idx = 1
    for i in range(0, len(words), words_per_chunk):
        group = words[i:i + words_per_chunk]
        start = group[0]["start"]
        end = group[-1]["end"]
        text = " ".join(w["word"] for w in group)
        if uppercase:
            text = text.upper()
        lines.append(f"{idx}\n{_format_srt_time(start)} --> {_format_srt_time(end)}\n{text}\n")
        idx += 1

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    return True


def _find_system_font() -> Optional[str]:
    """Busca una fuente del sistema para drawtext (no asume fontconfig)."""
    candidates = [
        # macOS
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Geneva.ttf",
        "/System/Library/Fonts/Supplemental/Verdana.ttf",
        # Linux
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None


def _normalize_color(color: str) -> str:
    """Convierte #RRGGBB a 0xRRGGBB (ffmpeg algunos builds no aceptan #)."""
    if not color:
        return "white"
    color = color.strip()
    if color.startswith("#"):
        return "0x" + color[1:]
    return color


def get_video_size(video_path: str) -> Tuple[int, int]:
    """(ancho, alto) de visualización — tiene en cuenta la rotación de móvil."""
    cmd = [
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:stream_tags=rotate:stream_side_data=rotation",
        "-of", "json", video_path,
    ]
    try:
        data = json.loads(subprocess.run(cmd, capture_output=True, text=True).stdout or "{}")
        st = (data.get("streams") or [{}])[0]
        w, h = int(st.get("width", 1920)), int(st.get("height", 1080))
        rot = st.get("tags", {}).get("rotate")
        for sd in st.get("side_data_list", []) or []:
            rot = sd.get("rotation", rot)
        if rot is not None and abs(int(float(rot))) % 180 == 90:
            w, h = h, w
        return w, h
    except (ValueError, IndexError, OSError):
        return 1920, 1080


def _parse_srt_chunks(srt_path: str) -> List[Dict]:
    """Compatibilidad: convierte un .srt existente en chunks sin highlight."""
    def t(v: str) -> float:
        hh, mm, rest = v.strip().replace(",", ".").split(":")
        return int(hh) * 3600 + int(mm) * 60 + float(rest)

    chunks = []
    text = open(srt_path, encoding="utf-8").read().strip()
    for block in re.split(r"\n\s*\n", text):
        lines = block.strip().splitlines()
        timing = next((ln for ln in lines if "-->" in ln), None)
        if not timing:
            continue
        a, b = timing.split("-->")
        body = " ".join(lines[lines.index(timing) + 1:]).split()
        chunks.append({"start": t(a), "end": t(b), "tokens": [(w, False) for w in body]})
    return chunks


def cut_and_title_clip(
    video_path: str,
    start: float,
    end: float,
    title: str,
    output_path: str,
    reel_format: str = "vertical",
    title_style: str = "bottom",
    title_color: str = "white",
    no_title: bool = False,
    verbose: bool = False,
    subtitle_srt_path: Optional[str] = None,
    subtitle_chunks: Optional[List[Dict]] = None,
    subtitle_style=None,
    ass_output_path: Optional[str] = None,
) -> Tuple[bool, str]:
    """Corta el clip, lo reencuadra y quema título + subtítulos de marca.

    Título y subtítulos se pintan con Pillow (``subtitles.render_overlay``) y
    se superponen con el filtro ``overlay``: no hace falta un FFmpeg con
    libass/freetype. Si se pasa ``ass_output_path`` también se escribe un .ass
    editable con el mismo estilo.

    Devuelve (success, error_message). Si success=True, error_message es "".
    """
    import shutil
    import subtitles as subs

    style = (subtitle_style or subs.SubtitleStyle()).normalized()
    if subtitle_chunks is None and subtitle_srt_path and os.path.exists(subtitle_srt_path):
        subtitle_chunks = _parse_srt_chunks(subtitle_srt_path)
    subtitle_chunks = subtitle_chunks or []

    if reel_format == "vertical":
        out_w, out_h = 1080, 1920
        scale_filter = (
            "scale=1080:1920:force_original_aspect_ratio=increase,"
            "crop=1080:1920"
        )
    else:
        src_w, src_h = get_video_size(video_path)
        out_w, out_h = src_w - src_w % 2, src_h - src_h % 2
        scale_filter = f"scale={out_w}:{out_h}"

    duration = end - start
    overlay_dir = output_path + ".overlay"
    overlay_list = subs.render_overlay(
        subtitle_chunks, overlay_dir, out_w, out_h, duration, style,
        title=None if no_title else title, title_position=title_style,
    )
    if ass_output_path and subtitle_chunks:
        subs.write_ass(subtitle_chunks, ass_output_path, out_w, out_h, style)

    cmd = ["ffmpeg", "-y", "-ss", str(start), "-i", video_path]
    if overlay_list:
        cmd += ["-f", "concat", "-safe", "0", "-i", overlay_list]
        cmd += [
            "-filter_complex",
            f"[0:v]{scale_filter},setsar=1[base];[1:v]format=rgba[ov];"
            "[base][ov]overlay=0:0:eof_action=pass:format=auto,format=yuv420p[v]",
            "-map", "[v]", "-map", "0:a?",
        ]
    else:
        cmd += ["-vf", f"{scale_filter},setsar=1"]
    cmd += [
        "-t", str(duration),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        output_path,
    ]

    print(f"\n✂️  Cortando {os.path.basename(output_path)}...", end="", flush=True)

    try:
        result = subprocess.run(cmd, capture_output=not verbose, text=True)
    finally:
        shutil.rmtree(overlay_dir, ignore_errors=True)
    if result.returncode != 0:
        err = (result.stderr or "")[-800:]
        print(f"\n❌ Error cortando clip:\n{err}")
        return False, err

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f" ✅ ({size_mb:.1f} MB)")
    return True, ""


# ─────────────────────────────────────────────
# 5. SUBIR A CANVA (opcional)
# ─────────────────────────────────────────────

def upload_to_canva(clip_path: str, title: str, canva_token: str) -> bool:
    """Sube un clip a la librería de Canva via Connect API."""
    try:
        import requests
    except ImportError:
        print("❌ requests no instalado: pip install requests")
        return False

    print(f"\n☁️  Subiendo a Canva: {os.path.basename(clip_path)}...", end="", flush=True)

    file_size = os.path.getsize(clip_path)
    if file_size > 100 * 1024 * 1024:
        print(f"\n⚠️  Archivo demasiado grande ({file_size / 1024 / 1024:.1f}MB). Máximo 100MB.")
        return False

    import base64
    name_b64 = base64.b64encode(title.encode()).decode()

    headers = {
        "Authorization": f"Bearer {canva_token}",
        "Content-Type": "application/octet-stream",
        "Asset-Upload-Metadata": json.dumps({"name_base64": name_b64}),
    }

    with open(clip_path, "rb") as f:
        response = requests.post(
            "https://api.canva.com/rest/v1/asset-uploads",
            headers=headers,
            data=f,
        )

    if response.status_code in (200, 201):
        job_id = response.json().get("job", {}).get("id")
        print(f" ✅ (Job: {job_id})")
        return True
    elif response.status_code == 401:
        print(f"\n❌ Token de Canva inválido (401). Revisa tu token en https://www.canva.com/developers/")
        return False
    else:
        print(f"\n❌ Error subiendo a Canva: {response.status_code} — {response.text[:300]}")
        return False


def canva_exchange_token(
    code: str,
    code_verifier: str,
    client_id: str,
    client_secret: str,
    redirect_uri: str,
) -> str | None:
    """Intercambia un authorization code por un access_token de Canva (OAuth 2.0 PKCE)."""
    try:
        import requests as _req
    except ImportError:
        return None

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "code_verifier": code_verifier,
    }
    if client_secret:
        payload["client_secret"] = client_secret

    resp = _req.post(
        "https://api.canva.com/rest/v1/oauth/token",
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=20,
    )

    if resp.status_code == 200:
        return resp.json().get("access_token")
    print(f"❌ Canva token exchange failed {resp.status_code}: {resp.text[:200]}")
    return None


# ─────────────────────────────────────────────
# 6. MAIN
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="🎬 Reel Cutter — Corta reels automáticamente de tus videos"
    )
    parser.add_argument("video", help="Ruta al video MP4")
    parser.add_argument("--num-reels", type=int, default=3,
                        help="Número de reels a generar (default: 3)")
    parser.add_argument("--min-duration", type=float, default=30.0,
                        help="Duración mínima del reel en segundos (default: 30)")
    parser.add_argument("--max-duration", type=float, default=90.0,
                        help="Duración máxima del reel en segundos (default: 90)")
    parser.add_argument("--format", choices=["vertical", "original"], default="vertical",
                        help="Formato del reel: vertical (9:16) u original (default: vertical)")
    parser.add_argument("--model", choices=["tiny", "base", "small", "medium"], default="base",
                        help="Modelo Whisper a usar (default: base)")
    parser.add_argument("--canva-token", default=None,
                        help="Token de Canva para upload automático (opcional)")
    parser.add_argument("--output-dir", default=None,
                        help="Carpeta de salida (default: misma carpeta que el video)")
    parser.add_argument("--title-style", choices=["bottom", "top", "center"], default="bottom",
                        help="Posición del título: bottom, top o center (default: bottom)")
    parser.add_argument("--title-color", default="white",
                        help="Color del texto del título (default: white)")
    parser.add_argument("--no-title", action="store_true",
                        help="No añadir título al clip")
    parser.add_argument("--verbose", action="store_true",
                        help="Mostrar output completo de ffmpeg")

    args = parser.parse_args()

    video_path = Path(args.video).resolve()
    if not video_path.exists():
        print(f"❌ Video no encontrado: {video_path}")
        sys.exit(1)

    # Verificar ffmpeg
    if subprocess.run(["which", "ffmpeg"], capture_output=True).returncode != 0:
        print("❌ ffmpeg no está instalado. Ejecuta: brew install ffmpeg")
        sys.exit(1)

    if args.output_dir:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    else:
        output_dir = video_path.parent / f"{video_path.stem}_reels"
        output_dir.mkdir(exist_ok=True)

    video_duration = get_video_duration(str(video_path))
    duration_fmt = format_duration(video_duration) if video_duration > 0 else "?"

    format_label = "vertical (1080×1920)" if args.format == "vertical" else "original"

    print(f"\n{'═'*42}")
    print(f"🎬 REEL CUTTER")
    print(f"{'═'*42}")
    print(f"Video:     {video_path.name} ({duration_fmt})")
    print(f"Reels:     {args.num_reels} ({args.min_duration:.0f}s — {args.max_duration:.0f}s)")
    print(f"Formato:   {format_label}")
    print(f"Modelo:    whisper/{args.model}")
    print(f"Salida:    {output_dir}")
    print(f"{'═'*42}")

    audio_path = str(output_dir / "audio_temp.wav")
    extract_audio(str(video_path), audio_path, verbose=args.verbose)

    segments = transcribe_audio(audio_path, model_name=args.model)

    reels = detect_reel_segments(
        segments,
        min_duration=args.min_duration,
        max_duration=args.max_duration,
        num_reels=args.num_reels,
        total_duration=video_duration or None,
    )

    if not reels:
        print("❌ No se pudo detectar ningún reel.")
        sys.exit(1)

    output_clips = []
    for i, reel in enumerate(reels):
        title = generate_title(reel["text_preview"], i + 1)
        output_path = str(output_dir / f"reel_{i+1:02d}_{video_path.stem}.mp4")

        success, _err = cut_and_title_clip(
            str(video_path),
            reel["start"],
            reel["end"],
            title,
            output_path,
            reel_format=args.format,
            title_style=args.title_style,
            title_color=args.title_color,
            no_title=args.no_title,
            verbose=args.verbose,
        )
        if success:
            output_clips.append((output_path, title))

    if args.canva_token:
        print(f"\n{'═'*42}")
        print(f"☁️  SUBIENDO A CANVA")
        print(f"{'═'*42}")
        for clip_path, title in output_clips:
            upload_to_canva(clip_path, title, args.canva_token)
        print(f"   Ver en: https://www.canva.com/folder/all-designs")

    if os.path.exists(audio_path):
        os.remove(audio_path)

    print(f"\n{'═'*42}")
    print(f"✅ REELS GENERADOS: {len(output_clips)}/{args.num_reels}")
    print(f"{'═'*42}")
    for i, (path, title) in enumerate(output_clips):
        size_mb = os.path.getsize(path) / (1024 * 1024)
        print(f"  {i+1}. {os.path.basename(path)} ({size_mb:.1f} MB)")
        if not args.no_title:
            print(f"     Título: \"{title}\"")
    print(f"\n📁 Guardados en: {output_dir}")

    if not args.canva_token:
        print(f"\n💡 Para subir a Canva: python reel_cutter.py {args.video} --canva-token TU_TOKEN")


if __name__ == "__main__":
    main()
