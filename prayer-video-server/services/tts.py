import asyncio
import ssl
import tempfile
import os
import edge_tts

VOICE = "ar-SA-HamedNeural"

async def generate_audio(text: str, output_path: str) -> bool:
    try:
        tts = edge_tts.Communicate(text, VOICE, rate="-10%", volume="+10%")
        await tts.save(output_path)
        return os.path.getsize(output_path) > 0
    except Exception as e:
        print(f"TTS error: {e}")
        return False
