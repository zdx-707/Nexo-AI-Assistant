"""
مولّد فيديوهات الصلاة الكرتونية للأطفال
Kids Prayer Cartoon Video Generator using MoneyPrinterTurbo API
"""

import json
import requests
import time
import sys
from pathlib import Path

# ==============================
# إعدادات الاتصال
# ==============================
MONEY_PRINTER_URL = "http://localhost:8080"  # عدّل حسب إعداداتك

HEADERS = {"Content-Type": "application/json"}

PROMPTS_FILE = Path(__file__).parent.parent / "prompts" / "prayer_prompts_ar.json"


def load_prompts():
    with open(PROMPTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def build_video_request(topic: dict, prompts_data: dict) -> dict:
    system_prompt = prompts_data["system_prompt"]
    style = prompts_data["style_instructions"]

    return {
        "video_subject": topic["title"],
        "video_script": "",  # سيتم توليده تلقائياً
        "video_terms": topic["keywords"],
        "video_aspect": "9:16",
        "video_concat_mode": "random",
        "video_clip_duration": 5,
        "video_count": 1,
        "video_source": "pexels",
        "video_language": "Arabic",
        "voice_name": "ar-SA-HamedNeural",
        "voice_volume": 1.0,
        "bgm_type": "random",
        "bgm_volume": 0.3,
        "subtitle_enabled": True,
        "subtitle_position": "bottom",
        "font_name": "Cairo",
        "text_fore_color": "#FFFFFF",
        "text_background_color": "#000000",
        "font_size": 60,
        "stroke_color": "#000000",
        "stroke_width": 2,
        "n_threads": 2,
        "paragraph_number": 3,
        "custom_position": 70.0,
        "llm_provider": "openai",
        "custom_script_requirements": f"أسلوب بصري: {style['visual_style']}. النبرة: {style['tone']}. مستوى اللغة: {style['language_level']}. {topic['prompt']}",
        "system_prompt_override": system_prompt,
    }


def create_video(topic_id: str = None):
    data = load_prompts()
    topics = data["topics"]

    if topic_id:
        topics = [t for t in topics if t["id"] == topic_id]
        if not topics:
            print(f"خطأ: الموضوع {topic_id} غير موجود")
            sys.exit(1)

    print("\n" + "="*50)
    print("🎬 مولّد فيديوهات الصلاة الكرتونية للأطفال")
    print("="*50)

    for topic in topics:
        print(f"\n📹 جاري إنشاء: {topic['title']}")
        print(f"   الكلمات المفتاحية: {topic['keywords'][:60]}...")

        payload = build_video_request(topic, data)

        try:
            response = requests.post(
                f"{MONEY_PRINTER_URL}/api/v1/videos",
                headers=HEADERS,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                task_id = result.get("data", {}).get("task_id")
                print(f"   ✅ تم بدء المهمة | Task ID: {task_id}")
                poll_task(task_id, topic["title"])
            else:
                print(f"   ❌ خطأ: {response.status_code} - {response.text}")

        except requests.exceptions.ConnectionError:
            print("\n❌ تعذّر الاتصال بـ MoneyPrinterTurbo!")
            print("   تأكد أن التطبيق يعمل على: http://localhost:8080")
            print("   راجع ملف SETUP_GUIDE.md للتعليمات")
            sys.exit(1)


def poll_task(task_id: str, title: str, max_wait: int = 300):
    print(f"   ⏳ انتظار إنتاج الفيديو...")
    elapsed = 0
    interval = 10

    while elapsed < max_wait:
        try:
            resp = requests.get(
                f"{MONEY_PRINTER_URL}/api/v1/tasks/{task_id}",
                timeout=10
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                status = data.get("status")

                if status == "completed":
                    video_url = data.get("video_url", "")
                    print(f"   🎉 اكتمل الفيديو: {title}")
                    print(f"   🔗 رابط: {video_url}")
                    return
                elif status == "failed":
                    print(f"   ❌ فشل إنشاء الفيديو: {data.get('message')}")
                    return
                else:
                    print(f"   ⏳ الحالة: {status} ({elapsed}s)")

        except Exception as e:
            print(f"   ⚠️ خطأ في الاستعلام: {e}")

        time.sleep(interval)
        elapsed += interval

    print(f"   ⏰ انتهت مهلة الانتظار ({max_wait}s)")


def show_topics():
    data = load_prompts()
    print("\n📋 المواضيع المتاحة:")
    print("-" * 40)
    for topic in data["topics"]:
        print(f"  [{topic['id']}] {topic['title']} ({topic['duration']} ثانية)")


if __name__ == "__main__":
    if len(sys.argv) == 1:
        show_topics()
        print("\nالاستخدام:")
        print("  python generate_video.py <رقم الموضوع>")
        print("  python generate_video.py all")
        print("\nمثال:")
        print("  python generate_video.py 1   # تعلّم الوضوء")
        print("  python generate_video.py all  # كل المواضيع")
    elif sys.argv[1] == "all":
        create_video()
    else:
        create_video(sys.argv[1])
