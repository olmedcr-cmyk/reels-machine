#!/usr/bin/env python3
"""FastAPI backend for Reels Machine — wraps reel_cutter.py with REST + SSE."""

import os
import sys
import uuid
import json
import asyncio
import tempfile
import shutil
import hashlib
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from sse_starlette.sse import EventSourceResponse

# Add engine to path so we can import reel_cutter
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "engine"))

import re

import reel_cutter
import subtitles

# Optional .env support (ANTHROPIC_API_KEY, DEEPGRAM_API_KEY) — keys sent from
# the UI take precedence; these are the server-side fallback.
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass


def _env_key(name: str) -> str:
    return os.environ.get(name, "").strip()


def _safe_slug(text: str, limit: int = 40) -> str:
    slug = re.sub(r"[^\w\-]+", "_", text, flags=re.UNICODE).strip("_")
    return slug[:limit] or "reel"


app = FastAPI(title="Reels Machine API")

WORK_DIR = Path(tempfile.gettempdir()) / "reelsmachine_jobs"
WORK_DIR.mkdir(exist_ok=True)

jobs: dict = {}


def job_dir(job_id: str) -> Path:
    d = WORK_DIR / job_id
    d.mkdir(exist_ok=True)
    return d


# ──────────────────────────────────────────────────────────
# POST /api/upload  — receive video, return job_id + duration
# ──────────────────────────────────────────────────────────
@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    job_id = uuid.uuid4().hex[:12]
    d = job_dir(job_id)
    # Keep only the basename so a crafted filename can't escape the job folder
    safe_name = Path(file.filename or "video.mp4").name or "video.mp4"
    video_path = d / safe_name
    with open(video_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    duration = reel_cutter.get_video_duration(str(video_path))
    jobs[job_id] = {
        "video_path": str(video_path),
        "duration": duration,
        "state": "uploaded",
        "reels": [],
        "outputs": [],
        "prompt_sent": None,
        "transcript_sent": None,
    }
    return {"jobId": job_id, "duration": duration, "fileName": safe_name}


# ──────────────────────────────────────────────────────────
# GET /api/health  — liveness + which keys the server has from .env
# ──────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {
        "ok": True,
        "anthropic": bool(_env_key("ANTHROPIC_API_KEY")),
        "deepgram": bool(_env_key("DEEPGRAM_API_KEY")),
        "ffmpeg": shutil.which("ffmpeg") is not None,
    }


# ──────────────────────────────────────────────────────────
# POST /api/analyze  — start analysis, returns immediately
# GET  /api/analyze/stream/{job_id}  — SSE progress stream
# ──────────────────────────────────────────────────────────
@app.post("/api/analyze")
async def start_analyze(
    jobId: str = Form(...),
    anthropicKey: str = Form(""),
    deepgramKey: str = Form(""),
    numReels: int = Form(5),
    minDur: float = Form(15),
    maxDur: float = Form(28),
    model: str = Form("claude-sonnet-4-6"),
    twoPass: bool = Form(True),
    useSilence: bool = Form(True),
    useEnergy: bool = Form(True),
    useLibrosa: bool = Form(True),
    useNovelty: bool = Form(True),
    directorBrief: str = Form(""),
):
    if jobId not in jobs:
        raise HTTPException(404, "Job not found")
    job = jobs[jobId]
    job["state"] = "analyzing"
    job["progress"] = []
    job["analyze_params"] = {
        "anthropicKey": anthropicKey.strip() or _env_key("ANTHROPIC_API_KEY"),
        "deepgramKey": deepgramKey.strip() or _env_key("DEEPGRAM_API_KEY"),
        "numReels": numReels,
        "minDur": minDur,
        "maxDur": maxDur,
        "model": model,
        "twoPass": twoPass,
        "directorBrief": directorBrief,
        "useSilence": useSilence,
        "useEnergy": useEnergy,
        "useLibrosa": useLibrosa,
        "useNovelty": useNovelty,
    }
    return {"ok": True}


def _run_pipeline(job_id: str):
    """Run the full analysis pipeline synchronously (called from a thread)."""
    job = jobs[job_id]
    p = job["analyze_params"]
    video_path = job["video_path"]
    d = job_dir(job_id)
    audio_path = str(d / "audio_temp.wav")

    def emit(step: str, label: str, detail: str = ""):
        job["progress"].append({"step": step, "label": label, "detail": detail})

    try:
        # 1. Extract audio
        emit("EX-01", "Extrayendo audio")
        reel_cutter.extract_audio(video_path, audio_path)
        emit("EX-01", "Extrayendo audio", "done")

        # 2. Silence detection
        silences = []
        if p["useSilence"]:
            emit("SD-01", "Detectando silencios")
            silences = reel_cutter.detect_silences(audio_path)
            emit("SD-01", "Detectando silencios", f"{len(silences)} silencios")

        # 3. Energy RMS
        energy_curve = []
        if p["useEnergy"]:
            emit("EN-01", "Energía RMS")
            energy_curve = reel_cutter.compute_audio_energy(audio_path, window_sec=0.5)
            emit("EN-01", "Energía RMS", f"{len(energy_curve)} ventanas")

        # 4. Acoustic features (librosa)
        acoustic_features = None
        if p["useLibrosa"]:
            emit("AC-01", "Features acústicas")
            acoustic_features = reel_cutter.compute_acoustic_features(audio_path)
            emit("AC-01", "Features acústicas", "done" if acoustic_features else "librosa no disponible")

        # 5. Transcription
        if p["deepgramKey"]:
            emit("TR-01", "Transcribiendo (Deepgram)")
            segs = reel_cutter.transcribe_audio_deepgram(audio_path, p["deepgramKey"])
        else:
            emit("TR-01", "Transcribiendo (Whisper)")
            segs = reel_cutter.transcribe_audio(audio_path)
        emit("TR-01", "Transcribiendo", f"{len(segs)} segmentos")
        job["segments"] = segs  # con timestamps por palabra → subtítulos

        # 6+7. AI detection
        if p["anthropicKey"]:
            def _progress_cb(msg):
                emit("AI-01", msg)

            def _capture_cb(prompt, transcript):
                job["prompt_sent"] = prompt
                job["transcript_sent"] = transcript

            emit("AI-01", "Director: rankeando con ML local…")
            reels = reel_cutter.detect_reel_segments_ai(
                segs,
                api_key=p["anthropicKey"],
                num_reels=p["numReels"],
                min_duration=p["minDur"],
                max_duration=p["maxDur"],
                total_duration=job["duration"],
                model=p["model"],
                silences=silences or None,
                energy_curve=energy_curve or None,
                acoustic_features=acoustic_features,
                two_pass=p["twoPass"],
                scout_model=None,
                director_brief=p.get("directorBrief", ""),
                progress_cb=_progress_cb,
                capture_prompt_cb=_capture_cb,
            )
            if not reels:
                emit("AI-02", "Fallback mecánico")
                reels = reel_cutter.detect_reel_segments(
                    segs,
                    min_duration=p["minDur"],
                    max_duration=p["maxDur"],
                    num_reels=p["numReels"],
                    total_duration=job["duration"],
                )
            emit("AI-02", "Verify → selección final", "done")
        else:
            emit("AI-01", "Detección por densidad")
            reels = reel_cutter.detect_reel_segments(
                segs,
                min_duration=p["minDur"],
                max_duration=p["maxDur"],
                num_reels=p["numReels"],
                total_duration=job["duration"],
            )
            emit("AI-02", "Detección completada", "done")

        # Clean up audio
        if os.path.exists(audio_path):
            os.remove(audio_path)

        # Normalize reels to consistent shape
        normalized = []
        for i, r in enumerate(reels):
            start = r.get("start", 0)
            end = r.get("end", 0)
            normalized.append({
                "id": f"SR-{i+1:02d}",
                "title": r.get("title") or r.get("ai_title") or f"Reel {i+1}",
                "start": round(start, 2),
                "end": round(end, 2),
                "duration": round(end - start, 1),
                "score": round(r.get("score", 0) / 10, 2) if r.get("score", 0) > 1 else round(r.get("score", 0), 2),
                "viral": (r.get("score", 0) >= 7) if r.get("score", 0) > 1 else (r.get("score", 0) >= 0.7),
                "hook": r.get("hook", ""),
                "reason": r.get("reason", ""),
                "transcript": r.get("transcript") or r.get("text") or r.get("text_preview", ""),
                "highlight": r.get("highlight_phrases", []),
                "novelty": round(r.get("novelty_score", r.get("novelty", 0.5)), 2),
                "sentiment": round(r.get("sentiment_score", r.get("sentiment", 0)), 2) if isinstance(r.get("sentiment_score", r.get("sentiment", 0)), (int, float)) else 0,
            })

        job["reels"] = normalized
        job["state"] = "done"
        emit("DONE", "Pipeline completado")

    except Exception as e:
        job["state"] = "error"
        emit("ERROR", str(e))


@app.get("/api/analyze/stream/{job_id}")
async def analyze_stream(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")

    job = jobs[job_id]
    sent = 0

    # Start pipeline in a thread
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _run_pipeline, job_id)

    async def event_gen():
        nonlocal sent
        while True:
            progress = job.get("progress", [])
            while sent < len(progress):
                evt = progress[sent]
                sent += 1
                yield {"event": "progress", "data": json.dumps(evt)}

            if job["state"] in ("done", "error"):
                if job["state"] == "done":
                    yield {"event": "done", "data": json.dumps({"reels": job["reels"]})}
                else:
                    last = progress[-1] if progress else {"label": "Unknown error"}
                    yield {"event": "error", "data": json.dumps({"message": last.get("label", "")})}
                return

            await asyncio.sleep(0.3)

    return EventSourceResponse(event_gen())


def _render_reel(
    job_id: str,
    reel: dict,
    prefix: str,
    fmt: str,
    burn_title: bool,
    burn_subs: bool,
    words_per_sub: int,
    sub_position: str,
    sub_padding: int,
) -> dict:
    """Corta un reel con título + subtítulos de marca. Bloqueante (ffmpeg)."""
    job = jobs[job_id]
    d = job_dir(job_id)
    style = subtitles.SubtitleStyle(sub_position, sub_padding, words_per_sub).normalized()
    # Las opciones forman parte del nombre: cambiar el estilo no devuelve un corte viejo
    opts = hashlib.sha1(
        f"{fmt}|{burn_title}|{burn_subs}|{style.position}|{style.side_padding}|{style.words_per_chunk}".encode()
    ).hexdigest()[:6]
    stem = f"{prefix}_{reel['id'].lower()}_{_safe_slug(reel.get('title') or reel['id'])}_{opts}"
    filename, ass_name = f"{stem}.mp4", f"{stem}.ass"
    output_path, ass_path = d / filename, d / ass_name

    if not output_path.exists():
        chunks = None
        if burn_subs:
            # Palabras con timestamp de la transcripción; si no hay (job antiguo),
            # se reparte el texto del reel a lo largo del clip.
            segments = job.get("segments") or [
                {"start": reel["start"], "end": reel["end"], "text": reel.get("transcript", "")}
            ]
            chunks = subtitles.make_chunks(
                segments, reel["start"], reel["end"],
                highlight_phrases=reel.get("highlight", []),
                words_per_chunk=style.words_per_chunk,
            )
        success, err = reel_cutter.cut_and_title_clip(
            job["video_path"],
            start=reel["start"],
            end=reel["end"],
            title=reel.get("title", ""),
            output_path=str(output_path),
            reel_format=fmt,
            no_title=not burn_title,
            subtitle_chunks=chunks,
            subtitle_style=style,
            ass_output_path=str(ass_path) if chunks else None,
        )
        if not success:
            raise HTTPException(500, f"ffmpeg falló: {err}")

    out = {
        "reelId": reel["id"],
        "filename": filename,
        "sizeMb": round(output_path.stat().st_size / (1024 * 1024), 1),
        "downloadUrl": f"/api/clips/{job_id}/{filename}",
    }
    if ass_path.exists():
        out["subtitlesUrl"] = f"/api/clips/{job_id}/{ass_name}"
    return out


# ──────────────────────────────────────────────────────────
# POST /api/cut  — cut all reels of a job
# ──────────────────────────────────────────────────────────
@app.post("/api/cut")
async def cut_reels(
    jobId: str = Form(...),
    format: str = Form("original"),
    burnTitle: bool = Form(False),
    burnSubs: bool = Form(True),
    wordsPerSub: int = Form(3),
    subPosition: str = Form("bottom"),
    subPadding: int = Form(64),
):
    if jobId not in jobs:
        raise HTTPException(404, "Job not found")
    job = jobs[jobId]
    if not job["reels"]:
        raise HTTPException(400, "No reels to cut")

    job["state"] = "cutting"
    outputs = []
    for reel in job["reels"]:
        try:
            outputs.append(await asyncio.to_thread(
                _render_reel, jobId, reel, "reelsmachine", format,
                burnTitle, burnSubs, wordsPerSub, subPosition, subPadding,
            ))
        except HTTPException:
            continue  # un clip fallido no tumba el lote
    job["outputs"] = outputs
    job["state"] = "output"
    return {"outputs": outputs}


# ──────────────────────────────────────────────────────────
# GET /api/clips/{job_id}/{filename}  — download a clip (.mp4) or its subtitles (.ass)
# ──────────────────────────────────────────────────────────
@app.get("/api/clips/{job_id}/{filename}")
async def get_clip(job_id: str, filename: str):
    if job_id not in jobs or Path(filename).name != filename:
        raise HTTPException(404, "Clip not found")
    path = job_dir(job_id) / filename
    if not path.is_file() or path.suffix not in (".mp4", ".ass"):
        raise HTTPException(404, "Clip not found")
    media = "video/mp4" if path.suffix == ".mp4" else "text/x-ssa; charset=utf-8"
    return FileResponse(str(path), media_type=media, filename=filename)


# ──────────────────────────────────────────────────────────
# POST /api/cut-one  — cut a single reel lazily on demand
# ──────────────────────────────────────────────────────────
@app.post("/api/cut-one")
async def cut_one_reel(
    jobId: str = Form(...),
    reelId: str = Form(...),
    format: str = Form("vertical"),
    burnTitle: bool = Form(True),
    burnSubs: bool = Form(True),
    wordsPerSub: int = Form(3),
    subPosition: str = Form("bottom"),
    subPadding: int = Form(64),
):
    if jobId not in jobs:
        raise HTTPException(404, "Job not found")
    reel = next((r for r in jobs[jobId]["reels"] if r["id"] == reelId), None)
    if reel is None:
        raise HTTPException(404, "Reel not found in job")
    return await asyncio.to_thread(
        _render_reel, jobId, reel, "reelsmachine", format,
        burnTitle, burnSubs, wordsPerSub, subPosition, subPadding,
    )


# ──────────────────────────────────────────────────────────
# GET /api/video/{job_id}  — stream source video with Range support
# ──────────────────────────────────────────────────────────
@app.get("/api/video/{job_id}")
async def get_video(job_id: str, request: Request):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    path = jobs[job_id]["video_path"]
    if not os.path.exists(path):
        raise HTTPException(404, "Video not found")

    file_size = os.path.getsize(path)
    range_header = request.headers.get("range")

    # Sin Range → respuesta completa pero declarando Accept-Ranges
    if not range_header:
        return FileResponse(
            path,
            media_type="video/mp4",
            headers={"Accept-Ranges": "bytes"},
        )

    # Parsear "bytes=start-end"
    try:
        units, _, ranges = range_header.partition("=")
        if units.strip().lower() != "bytes":
            raise ValueError("only byte ranges")
        start_s, _, end_s = ranges.partition("-")
        start = int(start_s) if start_s else 0
        end = int(end_s) if end_s else file_size - 1
    except (ValueError, AttributeError):
        raise HTTPException(416, "Invalid Range header")

    end = min(end, file_size - 1)  # RFC 7233: clamp an end past EOF
    if start >= file_size or start > end:
        raise HTTPException(416, "Range not satisfiable")

    chunk_size = end - start + 1

    def iter_chunk(chunk: int = 1024 * 256):
        with open(path, "rb") as f:
            f.seek(start)
            remaining = chunk_size
            while remaining > 0:
                data = f.read(min(chunk, remaining))
                if not data:
                    break
                remaining -= len(data)
                yield data

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(chunk_size),
        "Content-Type": "video/mp4",
    }
    return StreamingResponse(iter_chunk(), status_code=206, headers=headers)


# ──────────────────────────────────────────────────────────
# GET /api/job/{job_id}  — job status + reels
# ──────────────────────────────────────────────────────────
@app.get("/api/job/{job_id}")
async def get_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    job = jobs[job_id]
    return {
        "state": job["state"],
        "duration": job["duration"],
        "reels": job["reels"],
        "outputs": job["outputs"],
    }


if __name__ == "__main__":
    import uvicorn
    # Local tool: bind to loopback by default. Set HOST=0.0.0.0 to expose on LAN.
    uvicorn.run(app, host=os.environ.get("HOST", "127.0.0.1"), port=int(os.environ.get("PORT", "8000")))
