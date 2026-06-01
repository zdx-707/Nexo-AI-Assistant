# بحث مكتبات وتحسينات Nexo Infiltrator 3026

> تاريخ البحث: يونيو 2026
> الهدف: إيجاد أفضل المكتبات والأدوات لتحسين لعبة التسلل ثلاثية الأبعاد المبنية بـ Three.js في المتصفح

---

## 1. Pathfinding للحراس (الأولوية القصوى)

### three-pathfinding
- **GitHub:** https://github.com/donmccurdy/three-pathfinding
- **النجوم:** 1,400+
- **الوصف:** مكتبة navmesh لـ Three.js مبنية على PatrolJS. تحسب المسارات بين نقطتين على شبكة ملاحية ثلاثية الأبعاد، تدعم مناطق متعددة، وتقيّد متجهات الحركة لـ FPS controls.
- **لماذا مفيدة للعبة:** تحل مشكلة الحراس الذين يتحركون بطريقة غبية حاليًا. بدلاً من state machine بسيطة، يمكن للحراس التنقل في بيئة ثلاثية الأبعاد فعلياً عبر ممرات وحول عقبات.
- **يعمل في المتصفح بدون build tools؟** نعم — يدعم UMD عبر `window.threePathfinding.Pathfinding`
- **تحذير مهم:** لا تُنشئ المكتبة الـ navmesh تلقائياً — تحتاج إلى إنشائها في Blender (v2.7x) أو عبر موقع NavMesh Generator أونلاين ثم تصديرها كـ glTF/OBJ
- **بديل أحدث:** `recast-navigation-js` (انظر أدناه) يولّد الـ navmesh تلقائياً من الـ geometry

### recast-navigation-js
- **GitHub:** https://github.com/isaac-mason/recast-navigation-js
- **النجوم:** 418+
- **الوصف:** منفذ WebAssembly لمكتبتي Recast وDetour — الأدوات التي تستخدمها محركات الألعاب الاحترافية (Unity, Unreal) لبناء الـ navmesh
- **لماذا مفيدة للعبة:** تولّد الـ navmesh تلقائياً من geometry المستوى في وقت التشغيل، مما يعني عدم الحاجة لأداة خارجية. تشمل حزمة `@recast-navigation/three` تكاملاً مباشراً مع Three.js وأدوات debug visualization.
- **يعمل في المتصفح بدون build tools؟** يعمل كـ ESM modules في المتصفح الحديث، لكن يتطلب WASM
- **المقارنة:** أحدث وأكثر مرونة من three-pathfinding، لكن أعقد في الإعداد

### PathFinding.js
- **GitHub:** https://github.com/qiao/PathFinding.js
- **النجوم:** ~6,000
- **الوصف:** مكتبة شاملة لخوارزميات الـ pathfinding ثنائية الأبعاد (A*, BFS, Dijkstra, وغيرها)
- **لماذا مفيدة للعبة:** مناسبة إذا بقيت خريطة اللعبة على شبكة grid ثنائية الأبعاد، لكنها **غير مناسبة** للفضاء ثلاثي الأبعاد الحقيقي
- **يعمل في المتصفح بدون build tools؟** نعم — script tag مباشر

---

## 2. Post-Processing (جو Sci-Fi)

### pmndrs/postprocessing
- **GitHub:** https://github.com/pmndrs/postprocessing
- **النجوم:** 2,800+
- **آخر إصدار:** v6.39.1 (أبريل 2026) — نشط جداً
- **الوصف:** مكتبة post-processing عالية الأداء لـ Three.js، تستخدم EffectComposer لدمج تأثيرات متعددة في pass واحد
- **التأثيرات المتاحة ذات الصلة بالجو Sci-Fi:**
  - **BloomEffect** — وهج نيون مثالي للإضاءة المستقبلية
  - **GlitchEffect** — تشويه هولوغرافي وchromatic aberration
  - **ChromaticAberrationEffect** — انزياح ألواني يوحي بالتقنية
  - **ScanlineEffect** — خطوط مسح الشاشات القديمة
  - **NoiseEffect** — ضجيج الكاميرا
  - **PixelationEffect** — تأثير رقمي
  - **GodRaysEffect** — أشعة الضوء
- **لماذا مفيدة للعبة:** تحول المظهر التقني للعبة من مجرد Three.js عادي إلى جو cyberpunk حقيقي. الـ Bloom على الأضواء + Glitch عند الاكتشاف = تجربة بصرية مميزة
- **يعمل في المتصفح بدون build tools؟** نعم — عبر import map أو CDN Skypack:
  ```html
  <script type="importmap">{"imports": {"postprocessing": "https://cdn.skypack.dev/postprocessing"}}</script>
  ```
- **ملاحظة:** المكتبة ESM-only منذ فبراير 2025، تحتاج import map

### Three.js UnrealBloomPass (مدمج)
- **GitHub:** https://github.com/mrdoob/three.js (مدمج في `/examples/jsm/`)
- **النجوم:** الـ Three.js الرئيسي ~100,000
- **الوصف:** تأثير bloom مدمج في Three.js addons، متاح مباشرة
- **لماذا مفيدة للعبة:** بديل أبسط لـ pmndrs/postprocessing إذا احتجت فقط Bloom، يعمل بنفس طريقة import Three.js الحالية
- **يعمل في المتصفح بدون build tools؟** نعم — نفس طريقة import three.js addons الحالية

---

## 3. Collision Detection المتقدم

### three-mesh-bvh
- **GitHub:** https://github.com/gkjohnson/three-mesh-bvh
- **النجوم:** 3,400+
- **آخر إصدار:** v0.9.10 (مايو 2026) — نشط جداً
- **الوصف:** تطبيق Bounding Volume Hierarchy لتسريع الـ raycasting والاستعلامات المكانية على meshes في Three.js
- **لماذا مفيدة للعبة:** الـ AABB collision الحالية بطيئة ومحدودة. BVH تجعل الـ collision detection دقيقاً لأشكال معقدة (أعمدة، جدران منحنية) وأسرع بكثير. تدعم player movement collision وsphere physics.
- **حالات الاستخدام في اللعبة:**
  - Collision دقيق مع geometry المستوى
  - Raycasting للرصاص والنظر
  - Sight detection للحراس (raycast لرؤية اللاعب)
- **يعمل في المتصفح بدون build tools؟** يحتاج bundler أو CDN مثل jsDelivr/esm.sh

### cannon-es
- **GitHub:** https://github.com/pmndrs/cannon-es
- **النجوم:** ~1,934
- **الوصف:** fork محدثة من cannon.js الأصلية، محرك فيزياء JavaScript خفيف ثلاثي الأبعاد
- **لماذا مفيدة للعبة:** إضافة فيزياء حقيقية للاعب (gravity, jumping, rigid body) بدلاً من الـ FPS controller اليدوي الحالي. سهل التكامل مع Three.js.
- **يعمل في المتصفح بدون build tools؟** نعم — يوجد UMD version للـ CDN
- **آخر تحديث:** يناير 2024 (تطوير أبطأ مقارنة بالبدائل)

### Rapier.js
- **GitHub:** https://github.com/dimforge/rapier.js
- **النجوم:** 682 (لكن dimforge/rapier الرئيسي له 4,000+)
- **الوصف:** JavaScript bindings رسمية لمحرك Rapier المكتوب بـ Rust، يعمل كـ WASM
- **لماذا مفيدة للعبة:** أسرع بكثير من cannon-es (2x-5x)، يدعم الـ determinism (مهم للـ multiplayer مستقبلاً)، ومكتبة React Three Rapier تجعله سهل الاستخدام
- **يعمل في المتصفح بدون build tools؟** يحتاج WASM support وESM — أصعب للاستخدام المباشر

---

## 4. FPS Controller المتقدم

### three-fps (mohsenheydari)
- **GitHub:** https://github.com/mohsenheydari/three-fps
- **النجوم:** 228
- **الوصف:** لعبة FPS مثال كاملة بـ Three.js تستخدم ammo.js + three-pathfinding
- **لماذا مفيدة للعبة:** كود مرجعي ممتاز يجمع كل المكونات معاً — FPS controller بفيزياء حقيقية، NPC بـ animations وAI، والـ pathfinding. يمكن دراسة الكود مباشرة
- **التقنيات:** entity/component system، ammo.js rigidbody للتحكم، animations بـ root motion
- **يعمل في المتصفح بدون build tools؟** لا — يستخدم Webpack + Babel

### enari-engine (iErcann)
- **GitHub:** https://github.com/iErcann/enari-engine
- **النجوم:** غير محدد
- **الوصف:** ThreeJS First Person Shooter Playground
- **لماذا مفيدة للعبة:** playground للتجريب والاستلهام من implementations مختلفة

### Three.js PointerLockControls (مدمج)
- **GitHub:** مدمج في three.js addons
- **الوصف:** تنفيذ pointer lock للـ FPS controls، أساسي ومدمج
- **لماذا مفيدة للعبة:** إذا لم يكن الـ FPS controller الحالي مبنياً عليه، فهذا هو الأساس الذي يبنيه الجميع عليه
- **يعمل في المتصفح بدون build tools؟** نعم — نفس import three.js addons

---

## 5. Particle Systems

### three.quarks (Alchemist0823)
- **GitHub:** https://github.com/Alchemist0823/three.quarks
- **النجوم:** 942
- **الوصف:** محرك VFX وparticle system عالي الأداء لـ Three.js، مكتوب بـ TypeScript
- **لماذا مفيدة للعبة:**
  - تأثيرات الرصاص والانفجارات
  - مؤثرات لحظة الاكتشاف (تنبيه الحارس)
  - تأثيرات البيئة Sci-Fi (دخان، شرارات، بخار)
  - يدعم استيراد particle systems من Unity's Shuriken engine
- **الميزة التقنية:** batch rendering يقلل draw calls، مما يحسن الأداء
- **يعمل في المتصفح بدون build tools؟** يحتاج دراسة — لم تؤكد المعلومات الحالية

### three-nebula
- **GitHub:** https://github.com/creativelifeform/three-nebula
- **النجوم:** 1,200
- **الوصف:** محرك particle ثلاثي الأبعاد لـ Three.js مع GUI editor لتصميم التأثيرات
- **لماذا مفيدة للعبة:** تصميم التأثيرات بصرياً بدون كتابة كود، ثم تصدير JSON وتحميله في اللعبة
- **تحذير:** آخر تحديث نوفمبر 2021 — المشروع شبه متوقف
- **يعمل في المتصفح بدون build tools؟** نعم — script tag عبر `three-nebula.js`

---

## 6. Stealth Game Mechanics (Sight Cones & Detection)

لا يوجد مكتبة JavaScript جاهزة لـ sight cones في Three.js تحديداً، لكن هناك مشاريع مرجعية:

### Stealth-Game (rishav000111)
- **GitHub:** https://github.com/rishav000111/Stealth-Game
- **النجوم:** صغيرة
- **الوصف:** لعبة تسلل JavaScript مع line-of-sight ونظام كشف الضجيج، مثالية للاستلهام
- **لماذا مفيدة للعبة:** تطبيق عملي لنفس المفاهيم المطلوبة

### Red Blob Games — 2D Visibility
- **الرابط:** https://www.redblobgames.com/articles/visibility/
- **الوصف:** مرجع رياضي ممتاز لحساب خوارزميات الرؤية والـ FOV (Field of View)
- **لماذا مفيدة للعبة:** الخوارزميات الأساسية للـ sight cones — يمكن تطبيقها بـ Three.js raycasting

### النهج المقترح في Three.js:
يمكن بناء نظام sight cone للحراس باستخدام:
1. **Three.js Raycasting** (مدمج) — إطلاق أشعة من الحارس في زاوية FOV
2. **SpotLight cone** — للتصور البصري للمخروط
3. **three-mesh-bvh** — لتسريع raycasts الكشف

---

## 7. 3D Minimap

لا توجد مكتبة جاهزة محددة، لكن النهج الاحترافي موثق:

### النهج بـ OrthographicCamera + WebGLRenderTarget
- **المصدر:** https://waelyasmina.net/articles/how-to-create-a-minimap-for-interactive-threejs-apps-and-games/
- **التقنية:**
  1. إنشاء `OrthographicCamera` تنظر من الأعلى للأسفل
  2. إنشاء `WebGLRenderTarget` لرسم المشهد على texture
  3. رسم تلك الـ texture على `PlaneGeometry` في corner الشاشة
  4. استخدام `setViewport` لعرض الـ minimap في زاوية ثابتة
- **الأداء:** الرسم مرتين في كل frame قد يثقل الأداء — يمكن تقليل معدل التحديث (كل 3 frames مثلاً)
- **Three.js cookbook مرجعي:** https://github.com/josdirksen/threejs-cookbook

---

## 8. Howler.js مقابل Web Audio API

### Howler.js
- **GitHub:** https://github.com/goldfire/howler.js
- **النجوم:** 25,300+ (الأكثر شعبية بفارق كبير)
- **الوصف:** مكتبة صوت JavaScript الأكثر استخداماً في المتصفح
- **الميزات الرئيسية للألعاب:**
  - **3D Spatial Audio:** تحديد موضع مصدر الصوت في الفضاء ثلاثي الأبعاد (مهم لصوت الحراس!)
  - **Audio Sprites:** دمج ملفات صوت متعددة في ملف واحد لتحميل أسرع
  - **Format fallback:** يحاول WebM ثم MP3 ثم OGG تلقائياً
  - **Automatic garbage collection:** بدون memory leaks
  - حجم 7KB فقط بعد الضغط
- **يعمل في المتصفح بدون build tools؟** نعم — CDN (cdnjs, jsDelivr)
- **التوصية:** استبدال Web Audio API الحالي بـ Howler.js لتبسيط الكود، خاصة لـ spatial audio الحراس

### Web Audio API (الحالي)
- مباشر في المتصفح، لا يحتاج مكتبة
- مرن ولكن verbose جداً
- يحتاج cleanup يدوي
- **التوصية:** الاحتفاظ به للتأثيرات الصوتية الإجرائية المولدة (مثل نغمات التنبيه)، واستخدام Howler.js للأصوات المسجلة

---

## 9. تحسينات الأداء

### instanced-mesh (agargaro/three.ez)
- **GitHub:** https://github.com/agargaro/instanced-mesh
- **النجوم:** 430
- **الوصف:** تحسين `InstancedMesh` الأصلي في Three.js بإضافة frustum culling لكل instance، BVH للـ raycasting السريع، وLOD
- **لماذا مفيدة للعبة:** رسم آلاف الأعمدة أو الحواجز المتكررة في المستوى بـ draw call واحد — أداء محسّن بشكل كبير
- **الميزات:**
  - Per-instance frustum culling (لا يرسم ما هو خارج الكاميرا)
  - Dynamic BVH للـ raycasting السريع
  - LOD — تبسيط الكائنات البعيدة
  - Per-instance visibility

### Three.js InstancedMesh (مدمج)
- مدمج في Three.js الأصلي
- الأساس لرسم كائنات متكررة (حراس، صناديق) بكفاءة
- يفتقر لـ per-instance frustum culling بدون المكتبة أعلاه

### مقالة 100 نصيحة أداء Three.js
- **الرابط:** https://www.utsubo.com/blog/threejs-best-practices-100-tips
- تشمل: frustum culling، LOD، texture compression، geometry merging

---

## 10. Three.js Game Starters/Boilerplates

### viber3d
- **GitHub:** https://github.com/instructa/viber3d
- **النجوم:** 618
- **الوصف:** starter kit حديث لألعاب المتصفح ثلاثية الأبعاد — React Three Fiber + Rapier + ECS
- **لماذا مفيدة للعبة:** مرجع لهيكلية مشروع Three.js احترافي (ECS architecture)
- **يعمل في المتصفح بدون build tools؟** لا — يحتاج Vite + npm

### THREE-BasicThirdPersonGame
- **GitHub:** https://github.com/matthias-schuetz/THREE-BasicThirdPersonGame
- **الوصف:** JavaScript micro-framework لألعاب WebGL بـ Three.js + Cannon.js
- **لماذا مفيدة للعبة:** مرجع لدمج Three.js مع physics engine

### Three.js TypeScript Boilerplate (Sean-Bradley)
- **GitHub:** https://github.com/Sean-Bradley/Three.js-TypeScript-Boilerplate
- **الوصف:** boilerplate بـ TypeScript وorganization احترافي
- **لماذا مفيدة للعبة:** إذا أردت نقل المشروع لـ TypeScript مستقبلاً

---

## التحقق الناقد (Adversarial Verification)

| الادعاء | الحالة | ملاحظة |
|---------|--------|---------|
| three-pathfinding يدعم CDN/UMD | ✅ مؤكد | `window.threePathfinding.Pathfinding` موثق |
| pmndrs/postprocessing يعمل بدون build tool | ✅ مؤكد | عبر Skypack CDN + import map |
| three-mesh-bvh يدعم CDN مباشر | ⚠️ غير مؤكد | يحتاج bundler في الغالب، استخدم esm.sh |
| three-nebula نشط | ❌ منتهي | آخر تحديث 2021 |
| Howler.js يدعم 3D spatial audio | ✅ مؤكد | موثق في README |
| three-pathfinding لا تحتاج Blender لإنشاء navmesh | ❌ خطأ | تحتاج Blender أو NavMesh Generator أونلاين أو recast-navigation-js |

---

## التوصيات الفورية

### أهم 5 تحسينات يمكن إضافتها الآن:

### 1. Pathfinding للحراس — `three-pathfinding`
**الأثر:** عالٍ جداً | **الصعوبة:** متوسطة
- أضف `three-pathfinding` لتحريك الحراس بذكاء في المستوى
- أنشئ navmesh بسيطة لمستوى اللعبة عبر موقع [NavMesh Generator](https://navmesh.isaacmason.com/) مجاناً أونلاين
- الحراس سيتبعون اللاعب عبر ممرات حقيقية بدلاً من الاصطدام بالجدران
- **الكود الأساسي:**
  ```js
  import { Pathfinding } from 'three-pathfinding';
  const pathfinding = new Pathfinding();
  pathfinding.setZoneData('level1', Pathfinding.createZone(navmeshGeometry));
  const path = pathfinding.findPath(guardPos, playerPos, 'level1', groupID);
  ```

### 2. Post-Processing للجو Sci-Fi — `pmndrs/postprocessing`
**الأثر:** عالٍ بصرياً | **الصعوبة:** منخفضة
- أضف Bloom على مصادر الضوء لجو نيون مستقبلي
- أضف GlitchEffect لحظة اكتشاف اللاعب
- يمكن إضافتها بـ import map بدون أي bundler
- **الكود الأساسي:**
  ```html
  <script type="importmap">{"imports": {
    "postprocessing": "https://cdn.skypack.dev/postprocessing"
  }}</script>
  ```
  ```js
  import { EffectComposer, BloomEffect, GlitchEffect, EffectPass, RenderPass } from 'postprocessing';
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new EffectPass(camera, new BloomEffect({ intensity: 1.5 })));
  ```

### 3. تحسين الـ Collision Detection — `three-mesh-bvh`
**الأثر:** عالٍ للأداء | **الصعوبة:** منخفضة-متوسطة
- استبدل AABB البسيطة بـ BVH لدقة أفضل وأداء أسرع
- سيحسن detection الرصاص والـ raycast للحراس (نظام الرؤية)
- يعمل كـ drop-in على BufferGeometry الحالية:
  ```js
  import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';
  THREE.Mesh.prototype.raycast = acceleratedRaycast;
  geometry.boundsTree = new MeshBVH(geometry);
  ```

### 4. استبدال Web Audio API بـ Howler.js
**الأثر:** متوسط (تبسيط الكود + 3D audio) | **الصعوبة:** منخفضة
- 25,000+ نجمة، أكثر مكتبات صوت ثقة في المتصفح
- يضيف 3D spatial audio للحراس (صوت الخطوات يقوى/يضعف حسب المسافة)
- يدعم audio sprites لتحميل أسرع
- يعمل مباشرة بـ CDN: `<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>`

### 5. نظام Sight Cone للحراس — بـ Three.js Raycasting + three-mesh-bvh
**الأثر:** عالٍ جداً لميكانيكيا التسلل | **الصعوبة:** متوسطة
- بناء FOV cone للحراس باستخدام Raycasting مع BVH
- الحارس يرسل أشعة في نطاق زاوية (مثلاً 60 درجة) ومسافة (مثلاً 15 متر)
- إذا اصطدم الـ ray باللاعب قبل الجدار = اكتشاف
- إضافة SpotLight مرئي لتصور المخروط بصرياً للاعب
- **المرجع:** https://www.redblobgames.com/articles/visibility/

---

## ملخص سريع للمكتبات

| المكتبة | النجوم | الأولوية | يعمل بدون Build? |
|---------|--------|----------|-----------------|
| three-pathfinding | 1.4k | عالية جداً | ✅ نعم (UMD) |
| recast-navigation-js | 418 | عالية | ⚠️ ESM/WASM |
| pmndrs/postprocessing | 2.8k | عالية | ✅ نعم (CDN) |
| three-mesh-bvh | 3.4k | عالية | ⚠️ esm.sh |
| howler.js | 25.3k | متوسطة | ✅ نعم (CDN) |
| three.quarks | 942 | متوسطة | ⚠️ غير مؤكد |
| three-nebula | 1.2k | منخفضة | ✅ لكن قديمة |
| cannon-es | 1.9k | متوسطة | ✅ نعم (UMD) |
| rapier.js | 682 | منخفضة-متوسطة | ⚠️ WASM |
| instanced-mesh | 430 | متوسطة | ✅ CDN import map |

---

*المصادر المستخدمة في البحث:*
- https://github.com/donmccurdy/three-pathfinding
- https://github.com/isaac-mason/recast-navigation-js
- https://github.com/pmndrs/postprocessing
- https://github.com/gkjohnson/three-mesh-bvh
- https://github.com/goldfire/howler.js
- https://github.com/Alchemist0823/three.quarks
- https://github.com/creativelifeform/three-nebula
- https://github.com/pmndrs/cannon-es
- https://github.com/dimforge/rapier.js
- https://github.com/agargaro/instanced-mesh
- https://github.com/mohsenheydari/three-fps
- https://github.com/instructa/viber3d
- https://www.redblobgames.com/articles/visibility/
- https://waelyasmina.net/articles/how-to-create-a-minimap-for-interactive-threejs-apps-and-games/
- https://www.utsubo.com/blog/threejs-best-practices-100-tips
