# تشغيل مولّد فيديوهات الصلاة على جهازك

## الخطوة 1: تثبيت المتطلبات

```bash
# 1. حمّل المشروع
git clone https://github.com/harry0703/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo

# 2. ثبّت المتطلبات
pip install -r requirements.txt

# 3. انسخ الإعدادات
cp config.example.toml config.toml
```

## الخطوة 2: تعديل config.toml

افتح `config.toml` وعدّل هذه الأسطر فقط:

```toml
video_source = "local"
llm_provider = "pollinations"
```

## الخطوة 3: شغّل السيرفر

```bash
python main.py --port 8080
```

## الخطوة 4: شغّل مولّد الوضوء

انسخ السكريبت `create_wudu_video.py` إلى مجلد MoneyPrinterTurbo وشغّله:

```bash
python create_wudu_video.py
```

## النتيجة

- سيتم إنشاء 8 مشاهد بصوت عربي `ar-SA-HamedNeural`
- الفيديو النهائي في: `storage/tasks/<task_id>/`
- المدة: 2-5 دقائق

## ملاحظة

على جهازك الشخصي (Windows/Mac/Linux) Edge TTS يشتغل مباشرة بدون أي API key!
