# دليل إعداد مولّد فيديوهات الصلاة الكرتونية للأطفال

## الخطوة 1: تثبيت MoneyPrinterTurbo

```bash
git clone https://github.com/harry0703/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo
```

## الخطوة 2: إعداد الإعدادات الأساسية

```bash
cp config.example.toml config.toml
```

افتح `config.toml` وأضف مفاتيح API التالية:

```toml
[app]
# مفتاح OpenAI أو أي نموذج LLM
llm_provider = "openai"
openai_api_key = "YOUR_API_KEY"
openai_base_url = "https://api.openai.com/v1"
openai_model_name = "gpt-4o-mini"

[azure]
# إذا أردت صوت عربي عالي الجودة من Microsoft
azure_speech_key = "YOUR_AZURE_KEY"
azure_speech_region = "eastus"
```

## الخطوة 3: الحصول على مفتاح Pexels (للصور والفيديوهات)

1. سجّل على https://www.pexels.com/api
2. احصل على API Key مجاني
3. أضفه في `config.toml`:
```toml
[app]
pexels_api_keys = ["YOUR_PEXELS_KEY"]
```

## الخطوة 4: تشغيل MoneyPrinterTurbo

### باستخدام Docker (الأسهل):
```bash
docker compose up -d
```

### أو محلياً:
```bash
pip install -r requirements.txt
streamlit run webui.py --server.port=8501
```

## الخطوة 5: توليد الفيديوهات

### من الواجهة (WebUI):
افتح المتصفح على: http://localhost:8501

- انسخ أي prompt من ملف `prompts/prayer_prompts_ar.json`
- الصق في حقل "موضوع الفيديو"
- اختر الصوت: `ar-SA-HamedNeural`
- اضبط الأبعاد: 9:16 (عمودي)
- اضغط "إنشاء"

### من السكريبت تلقائياً:
```bash
cd scripts/

# عرض كل المواضيع
python generate_video.py

# إنشاء فيديو واحد (مثلاً موضوع الوضوء)
python generate_video.py 1

# إنشاء كل الفيديوهات دفعة واحدة
python generate_video.py all
```

## المواضيع المتاحة

| الرقم | الموضوع | المدة |
|-------|---------|-------|
| 1 | تعلّم الوضوء مع حمدان | 60 ثانية |
| 2 | صلاة الفجر مع نور | 60 ثانية |
| 3 | أركان الصلاة الخمسة | 90 ثانية |
| 4 | كيف نقف في الصلاة | 90 ثانية |
| 5 | الأذان - نداء الصلاة | 60 ثانية |
| 6 | فضل الصلاة - لماذا نصلي؟ | 60 ثانية |

## نصائح لأفضل نتيجة

1. **الصوت:** استخدم `ar-SA-HamedNeural` للرجال أو `ar-SA-ZariyahNeural` للنساء
2. **الكلمات المفتاحية:** تأكد أن كلمات البحث تحتوي على: `cartoon, kids, Islamic, animated`
3. **الأبعاد:** استخدم 9:16 للنشر على TikTok وInstagram وYouTube Shorts
4. **الموسيقى:** اختر موسيقى هادئة بدون كلمات (volume 20-30%)
5. **الترجمة:** فعّل الترجمة العربية بخط Cairo بحجم 60-70

## استكشاف الأخطاء

**الصوت العربي لا يعمل:**
- تأكد من تفعيل Azure Speech في config.toml

**الفيديوهات غير مناسبة للأطفال:**
- أضف كلمات سلبية: `violence, adult, scary, dark, inappropriate`
- استخدم مصدر فيديو Pexels مع keywords كرتونية واضحة

**الفيديو بطيء:**
- قلل مدة الفيديو إلى 30-45 ثانية
- قلل عدد الفقرات إلى 2
