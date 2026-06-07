"""
توليد فيديو الوضوء للأطفال
"""
import os
import sys
import json
import time
import requests
import numpy as np

# Add project to path
sys.path.insert(0, "/home/user/MoneyPrinterTurbo")

# ============================
# السكريبت العربي الكامل للوضوء
# ============================
WUDU_SCRIPT = """أهلاً يا أبطال النظافة! هل تعرفون ماذا نفعل قبل أن نقف بين يدي الله للصلاة؟ نعم، نتوضأ! قال النبي صلى الله عليه وسلم: لا تقبل صلاة بغير طهور. هيا نتعلم معاً!

في البداية، ننوي الوضوء في قلبنا. والنية محلها القلب. ثم نقول: بسم الله. ونبدأ بغسل كفينا ثلاث مرات مع تخليل الأصابع جيداً، كما علمنا النبي صلى الله عليه وسلم!

الآن نأخذ الماء في يدنا اليمنى، ونمضمض فمنا ثلاث مرات، ثم نستنشق الماء في أنفنا ونستنثره ثلاث مرات.

الآن نغسل وجهنا الجميل ثلاث مرات، من منبت الشعر فوق الجبهة إلى الذقن، ومن الأذن إلى الأذن. الوضوء يُنير الوجه يوم القيامة!

حان دور أيدينا القوية! نغسل يدنا اليمنى إلى المرفق ثلاث مرات، ثم يدنا اليسرى ثلاث مرات، مع تخليل الأصابع في كل مرة. اليمين قبل اليسار دائماً!

نبلّل يدينا بالماء مرة واحدة، ونمسح رأسنا كله من الأمام إلى الخلف ثم من الخلف إلى الأمام. ثم ندخل السبابتين في الأذنين، ونمسح بالإبهامين ظاهر الأذنين.

وأخيراً، نغسل قدمنا اليمنى إلى الكعب ثلاث مرات مع تخليل أصابع القدم، ثم قدمنا اليسرى كذلك. الكعب هو العظمة الجانبية في القدم!

انتهينا يا أبطال! الآن نرفع بصرنا للسماء ونقول: أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمداً عبده ورسوله، اللهم اجعلني من التوابين واجعلني من المتطهرين."""


def create_background_videos():
    """إنشاء فيديوهات خلفية ملونة بسيطة"""
    try:
        from imageio_ffmpeg import get_ffmpeg_exe
        ffmpeg = get_ffmpeg_exe()
    except:
        print("❌ ffmpeg غير متوفر")
        return []

    os.makedirs("/tmp/wudu_materials", exist_ok=True)

    # ألوان هادئة ومناسبة للأطفال لكل مشهد
    scenes = [
        ("scene1_intro",    "87CEEB", "FFFFFF"),  # أزرق سماوي
        ("scene2_niyah",    "98FB98", "006400"),  # أخضر فاتح
        ("scene3_madmada",  "ADD8E6", "00008B"),  # أزرق فاتح
        ("scene4_wajh",     "FFE4B5", "8B6914"),  # أصفر دافئ
        ("scene5_yadain",   "DDA0DD", "4B0082"),  # بنفسجي
        ("scene6_ras",      "F0E68C", "8B6914"),  # أصفر ذهبي
        ("scene7_qadam",    "90EE90", "228B22"),  # أخضر
        ("scene8_dua",      "FFD700", "8B0000"),  # ذهبي
    ]

    videos = []
    for name, bg_color, _ in scenes:
        output = f"/tmp/wudu_materials/{name}.mp4"
        r = int(bg_color[0:2], 16)
        g = int(bg_color[2:4], 16)
        b = int(bg_color[4:6], 16)
        cmd = (
            f'{ffmpeg} -y -f lavfi '
            f'-i color=c=#{bg_color}:size=1080x1920:duration=10:rate=24 '
            f'-c:v libx264 -pix_fmt yuv420p -shortest '
            f'{output} -loglevel quiet'
        )
        ret = os.system(cmd)
        if ret == 0:
            videos.append(output)
            print(f"  ✅ {name}.mp4")
        else:
            print(f"  ⚠️ {name} - جرب بديل")

    return videos


def generate_video(task_id_check=None):
    BASE = "http://localhost:8080"

    print("\n" + "="*55)
    print("🕌 مولّد فيديو الوضوء الكرتوني للأطفال")
    print("="*55)

    # 1. إنشاء الخلفيات
    print("\n📽️  إنشاء خلفيات الفيديو...")
    videos = create_background_videos()

    # 2. بناء payload
    video_materials = [{"url": v, "provider": "local"} for v in videos] if videos else []

    payload = {
        "video_subject": "كيف نتوضأ يا أبطال؟ - تعلم الوضوء الصحيح",
        "video_script": WUDU_SCRIPT,
        "video_source": "local" if videos else "pexels",
        "video_materials": video_materials,
        "video_aspect": "9:16",
        "video_concat_mode": "sequential",
        "video_clip_duration": 10,
        "video_count": 1,
        "voice_name": "ar-SA-HamedNeural",
        "voice_volume": 1.0,
        "voice_rate": 0.9,
        "bgm_type": "random",
        "bgm_volume": 0.15,
        "subtitle_enabled": True,
        "subtitle_position": "bottom",
        "font_name": "STHeitiMedium.ttc",
        "text_fore_color": "#FFFFFF",
        "text_background_color": True,
        "font_size": 55,
        "stroke_color": "#000000",
        "stroke_width": 2.0,
        "paragraph_number": 8,
        "n_threads": 4,
    }

    print("\n🚀 إرسال طلب التوليد...")
    try:
        resp = requests.post(f"{BASE}/api/v1/videos", json=payload, timeout=30)
        data = resp.json()
        if resp.status_code == 200:
            task_id = data["data"]["task_id"]
            print(f"✅ بدأت المهمة | Task ID: {task_id}")
            poll(BASE, task_id)
        else:
            print(f"❌ خطأ: {resp.status_code}")
            print(json.dumps(data, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")


def poll(base, task_id, timeout=600):
    print(f"\n⏳ انتظار إنتاج الفيديو (قد يأخذ 2-5 دقائق)...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = requests.get(f"{base}/api/v1/tasks/{task_id}", timeout=10)
            data = resp.json().get("data", {})
            status = data.get("state", data.get("status", ""))
            if status in ("completed", 4, "4"):
                print(f"\n🎉 اكتمل الفيديو!")
                print(f"📁 الموقع: {data.get('videos', data)}")
                return
            elif status in ("failed", 3, "3"):
                print(f"\n❌ فشل: {data.get('message', data)}")
                return
            else:
                elapsed = int(time.time() - start)
                print(f"  ⏳ الحالة: {status} | {elapsed}s مضت...", end="\r")
        except Exception as e:
            print(f"  ⚠️ {e}")
        time.sleep(8)
    print("\n⏰ انتهت المهلة")


if __name__ == "__main__":
    generate_video()
