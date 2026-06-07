import asyncio
import os
import uuid
import tempfile
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from services.scripts import VIDEOS
from services.tts import generate_audio
from services.video import (
    create_colored_clip, merge_audio_video,
    concat_videos, SCENE_COLORS
)

app = FastAPI(title="مولّد فيديوهات الصلاة للأطفال")

JOBS: dict = {}  # task_id -> status/path
OUTPUT_DIR = "/tmp/prayer_videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.get("/", response_class=HTMLResponse)
async def home():
    with open("templates/index.html", encoding="utf-8") as f:
        return f.read()


@app.get("/api/videos")
async def list_videos():
    return [{"id": k, "title": v["title"], "scenes": len(v["scenes"])}
            for k, v in VIDEOS.items()]


@app.post("/api/generate/{video_id}")
async def generate(video_id: str, background_tasks: BackgroundTasks):
    if video_id not in VIDEOS:
        return JSONResponse({"error": "فيديو غير موجود"}, status_code=404)
    task_id = str(uuid.uuid4())[:8]
    JOBS[task_id] = {"status": "processing", "progress": 0, "title": VIDEOS[video_id]["title"]}
    background_tasks.add_task(build_video, task_id, video_id)
    return {"task_id": task_id, "message": "بدأ التوليد..."}


@app.get("/api/status/{task_id}")
async def status(task_id: str):
    if task_id not in JOBS:
        return JSONResponse({"error": "مهمة غير موجودة"}, status_code=404)
    return JOBS[task_id]


@app.get("/api/download/{task_id}")
async def download(task_id: str):
    job = JOBS.get(task_id)
    if not job or job["status"] != "done":
        return JSONResponse({"error": "الفيديو غير جاهز"}, status_code=404)
    path = job["path"]
    title = job["title"].replace(" ", "_").replace("?", "").replace("💧", "").replace("🌙", "").replace("🕌", "")
    return FileResponse(path, media_type="video/mp4", filename=f"{title}.mp4")


async def build_video(task_id: str, video_id: str):
    video_data = VIDEOS[video_id]
    scenes = video_data["scenes"]
    work_dir = os.path.join(OUTPUT_DIR, task_id)
    os.makedirs(work_dir, exist_ok=True)
    scene_videos = []

    for i, scene in enumerate(scenes):
        progress = int((i / len(scenes)) * 90)
        JOBS[task_id]["progress"] = progress
        JOBS[task_id]["current"] = scene["title"]

        color = scene.get("color", SCENE_COLORS[i % len(SCENE_COLORS)])
        audio_path = os.path.join(work_dir, f"audio_{i}.mp3")
        bg_path    = os.path.join(work_dir, f"bg_{i}.mp4")
        scene_path = os.path.join(work_dir, f"scene_{i}.mp4")

        # توليد الصوت
        ok = await generate_audio(scene["text"], audio_path)
        if not ok:
            # استخدم صوت صامت كبديل
            open(audio_path, "wb").write(b"")

        # احسب مدة الصوت
        duration = await get_audio_duration(audio_path) if ok else 8

        # أنشئ خلفية ملوّنة
        create_colored_clip(color, int(duration) + 1, bg_path)

        if ok:
            merge_audio_video(bg_path, audio_path, scene_path)
        else:
            os.rename(bg_path, scene_path)

        scene_videos.append(scene_path)

    # دمج كل المشاهد
    JOBS[task_id]["progress"] = 95
    JOBS[task_id]["current"] = "دمج المشاهد..."
    final = os.path.join(work_dir, "final.mp4")
    concat_videos(scene_videos, final)

    JOBS[task_id] = {
        "status": "done",
        "progress": 100,
        "path": final,
        "title": video_data["title"],
        "current": "اكتمل!"
    }


async def get_audio_duration(path: str) -> float:
    try:
        from imageio_ffmpeg import get_ffmpeg_exe
        import subprocess
        result = subprocess.run(
            [get_ffmpeg_exe(), "-i", path],
            capture_output=True, text=True
        )
        for line in result.stderr.splitlines():
            if "Duration" in line:
                t = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = t.split(":")
                return float(h)*3600 + float(m)*60 + float(s)
    except:
        pass
    return 8.0


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
