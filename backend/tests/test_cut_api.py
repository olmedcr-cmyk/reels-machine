"""Corte de reels de punta a punta: upload → cut-one / cut con subtítulos de marca.

Necesita ffmpeg en el PATH (genera un vídeo sintético con lavfi).
"""

import shutil
import subprocess
import sys
from pathlib import Path

import pytest

pytest.importorskip("httpx")
pytest.importorskip("PIL")
if not shutil.which("ffmpeg"):
    pytest.skip("ffmpeg no disponible", allow_module_level=True)

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

import server  # noqa: E402

TEXT = "Mira, el 95% de la gente abandona en el mes tres. Y eso pasa por una sola razón."


@pytest.fixture(scope="module")
def src_video(tmp_path_factory):
    p = tmp_path_factory.mktemp("src") / "src.mp4"
    subprocess.run([
        "ffmpeg", "-v", "error", "-y",
        "-f", "lavfi", "-i", "testsrc2=size=640x360:rate=24:duration=8",
        "-f", "lavfi", "-i", "sine=frequency=220:duration=8",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", str(p),
    ], check=True)
    return p


@pytest.fixture()
def job(src_video):
    c = TestClient(server.app)
    with open(src_video, "rb") as f:
        up = c.post("/api/upload", files={"file": ("../mi vídeo.mp4", f, "video/mp4")}).json()
    jid = up["jobId"]
    t, words = 1.0, []
    for w in TEXT.split():
        d = 0.18 + 0.02 * len(w)
        words.append({"word": w, "start": t, "end": t + d})
        t += d + 0.04
    j = server.jobs[jid]
    j["segments"] = [{"start": 1.0, "end": t, "text": TEXT, "words": words}]
    j["reels"] = [{
        "id": "SR-01", "title": "El error del mes tres", "start": 0.5, "end": 6.5,
        "duration": 6.0, "score": 0.8, "viral": True, "hook": "", "reason": "",
        "transcript": TEXT, "novelty": 0.5, "sentiment": 0, "highlight": ["95%", "mes tres"],
    }]
    j["state"] = "done"
    yield c, jid, up
    server.jobs.pop(jid, None)


def test_upload_sanitizes_filename(job):
    _, _, up = job
    assert up["fileName"] == "mi vídeo.mp4"


def test_cut_one_returns_vertical_mp4_and_ass(job):
    c, jid, _ = job
    r = c.post("/api/cut-one", data={"jobId": jid, "reelId": "SR-01"})
    assert r.status_code == 200, r.text
    body = r.json()
    mp4 = c.get(body["downloadUrl"])
    assert mp4.status_code == 200 and mp4.headers["content-type"] == "video/mp4"
    ass = c.get(body["subtitlesUrl"])
    assert ass.status_code == 200
    assert "{\\c&H0AD6FF&}95%" in ass.text

    out = server.job_dir(jid) / body["filename"]
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height", "-of", "csv=p=0", str(out)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    assert probe == "1080,1920"


def test_style_change_produces_new_file_and_same_style_is_cached(job):
    c, jid, _ = job
    a = c.post("/api/cut-one", data={"jobId": jid, "reelId": "SR-01", "subPosition": "bottom"}).json()
    b = c.post("/api/cut-one", data={"jobId": jid, "reelId": "SR-01", "subPosition": "bottom"}).json()
    d = c.post("/api/cut-one", data={"jobId": jid, "reelId": "SR-01", "subPosition": "top", "subPadding": "120"}).json()
    assert a["filename"] == b["filename"] != d["filename"]


def test_job_without_word_timestamps_still_subtitles(job):
    c, jid, _ = job
    server.jobs[jid].pop("segments")
    r = c.post("/api/cut-one", data={"jobId": jid, "reelId": "SR-01", "wordsPerSub": "2", "subPosition": "center"})
    assert r.status_code == 200 and "subtitlesUrl" in r.json()


def test_cut_all_and_original_format(job):
    c, jid, _ = job
    r = c.post("/api/cut", data={"jobId": jid, "format": "original", "burnTitle": "true"})
    assert r.status_code == 200 and len(r.json()["outputs"]) == 1


def test_clip_download_rejects_traversal_and_other_files(job):
    c, jid, _ = job
    assert c.get(f"/api/clips/{jid}/..%2F..%2Fetc%2Fpasswd").status_code == 404
    assert c.get(f"/api/clips/{jid}/audio_temp.wav").status_code == 404
    assert c.get("/api/clips/nope/x.mp4").status_code == 404
