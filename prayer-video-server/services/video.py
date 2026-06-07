import os
import subprocess
import tempfile
from imageio_ffmpeg import get_ffmpeg_exe

FFMPEG = get_ffmpeg_exe()

SCENE_COLORS = [
    "#1a6b8a",  # أزرق عميق - مقدمة
    "#2d7a3e",  # أخضر - النية
    "#1e5f8a",  # أزرق - المضمضة
    "#8a6b1e",  # ذهبي - الوجه
    "#6b2d8a",  # بنفسجي - اليدين
    "#2d8a6b",  # فيروزي - الرأس
    "#3d8a2d",  # أخضر غامق - القدمين
    "#8a4a1e",  # برتقالي - الدعاء
]

def create_colored_clip(color: str, duration: int, output: str) -> bool:
    color_hex = color.lstrip("#")
    cmd = [
        FFMPEG, "-y",
        "-f", "lavfi",
        "-i", f"color=c=#{color_hex}:size=1080x1920:duration={duration}:rate=24",
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        output, "-loglevel", "quiet"
    ]
    return subprocess.run(cmd, capture_output=True).returncode == 0


def merge_audio_video(video: str, audio: str, output: str) -> bool:
    cmd = [
        FFMPEG, "-y",
        "-i", video,
        "-i", audio,
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        output, "-loglevel", "quiet"
    ]
    return subprocess.run(cmd, capture_output=True).returncode == 0


def concat_videos(video_list: list, output: str) -> bool:
    list_file = output + "_list.txt"
    with open(list_file, "w") as f:
        for v in video_list:
            f.write(f"file '{v}'\n")
    cmd = [
        FFMPEG, "-y",
        "-f", "concat", "-safe", "0",
        "-i", list_file,
        "-c", "copy",
        output, "-loglevel", "quiet"
    ]
    result = subprocess.run(cmd, capture_output=True).returncode == 0
    os.remove(list_file)
    return result


def add_subtitle(video: str, text: str, output: str) -> bool:
    safe_text = text.replace("'", "\\'").replace(":", "\\:")[:80]
    filter_str = (
        f"drawtext=text='{safe_text}':"
        f"fontcolor=white:fontsize=45:borderw=3:bordercolor=black:"
        f"x=(w-text_w)/2:y=h-150:font=Arial"
    )
    cmd = [
        FFMPEG, "-y",
        "-i", video,
        "-vf", filter_str,
        "-c:a", "copy",
        output, "-loglevel", "quiet"
    ]
    return subprocess.run(cmd, capture_output=True).returncode == 0
