import os

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\biomedical.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace metadata and titles
content = content.replace("المدرسة الوطنية العليا للغابات - ENSF خنشلة", "تخصص الهندسة البيوطبية - Génie Biomédical")
content = content.replace("المدرسة الوطنية العليا للغابات – ENSF خنشلة", "تخصص الهندسة البيوطبية – Génie Biomédical")
content = content.replace("ENSF", "Génie Biomédical")
content = content.replace("ensf", "biomedical")

# Extract and replace the details block
start_str = '<div class="details">'
start_idx = content.find(start_str)

if start_idx != -1:
    start_idx += len(start_str)
    
    end_str = '\n</div>\n</div>\n</div>\n\n    <!-- Specialty Navigation Buttons -->'
    end_idx = content.find(end_str)
    if end_idx == -1:
        end_str = '<!-- Specialty Navigation Buttons -->'
        end_idx = content.find(end_str)
        end_idx = content.rfind('</div>', 0, end_idx)
        end_idx = content.rfind('</div>', 0, end_idx)
        end_idx = content.rfind('</div>', 0, end_idx)

    new_content = """
<div class="detail-card large-card">
    <h3><i class="fas fa-university"></i> معلومات التخصص</h3>
    <ul>
        <li><i class="fas fa-map-marker-alt"></i> <strong>أبرز الجامعات الحاضنة:</strong> تلمسان (جامعة أبو بكر بلقايد - العاصمة التاريخية لهذا التخصص)، الجزائر العاصمة (جامعة باب الزوار USTHB)، البليدة (جامعة سعد دحلب)، قسنطينة، ووهران.</li>
    </ul>
    <p>باه نكونوا دقيقين، التخصص هذا في الجزائر ما عندوش مدرسة عليا مستقلة باسمه (مثل مدارس الهندسة)، بل يُدرس كـ تخصص نخبة داخل كبريات كليات التكنولوجيا والجامعات.</p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-clipboard-check"></i> شروط التسجيل وطرق الالتحاق</h3>
    <p>الوصول إليه يكون عبر طريقين:</p>
    <ul>
        <li><strong>1️⃣ الطريق الأول: التسجيل المباشر بعد الباك</strong><br>
        تفتح بعض الجامعات (مثل جامعة تلمسان وUSTHB) كوداً مباشراً في منصة الرغبات بـ أولويات محددة:<br>
        🥇 <strong>الأولوية الأولى (01):</strong> شعبة رياضيات + شعبة علوم تجريبية.<br>
        🥈 <strong>الأولوية الثانية (02):</strong> شعبة تقني رياضي (تخصص هندسة كهربائية).</li>
        <li><strong>2️⃣ الطريق الثاني: المرور عبر جذع مشترك علوم وتكنولوجيا (ST)</strong><br>
        يسجل الطالب في السنة الأولى جذع مشترك (ST) في أي جامعة. بعد نهاية السنة الأولى، يتم فرز وترتيب الطلاب توجيهاً نحو التخصص بناءً على معدل السنة الأولى ورغبة الطالب. (المنافسة هنا تكون شرسة جداً وتتطلب أن تكون من الأوائل).</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-chart-bar"></i> معايير التوجيه ومعدلات القبول (تحديث 2025 / 2026)</h3>
    <p>المعدل الموزون يحسب بمادتي الرياضيات والفيزياء.</p>
    <h4 style="margin-top: 15px; color: var(--primary-color);">📈 معدلات القبول التقريبية لعام 2025:</h4>
    <ul>
        <li><strong>التسجيل المباشر (تلمسان أو العاصمة):</strong> استقرت معدلات القبول الفعلية (المعدل الموزون) بين <strong>14.20 و 15.30</strong> حسب الشعبة والطلب في السيت.</li>
        <li><strong>عبر جذع مشترك ST:</strong> تدخل لـ ST بمعدل بين <strong>11.00 و 12.50</strong>، بصح باه تظفر بمقعد بيوطبي في السنة الثانية، لازم معدلك في الجامعة بالعام الأول ما يطيحش على <strong>12.50/20</strong> في أسوأ الحالات وسط منافسة زملائك.</li>
    </ul>
    <div class="acceptance-calc-wrap" style="margin-top:15px;"><a class="acceptance-calc-btn" href="/tools#weighted-calc"><i class="fas fa-calculator"></i> احسب معدلك الموزون</a></div>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-graduation-cap"></i> مدة ومسار التكوين بالتفصيل</h3>
    <p>أصبح التكوين يسير في خطين متوازيين يختارهما الطالب:</p>
    <ul>
        <li><strong>🛠️ مسار مهندس دولة (المستحدث) - 5 سنوات:</strong><br>
        سنتين تحضيريتين (جذع مشترك تكنولوجي) + 3 سنوات تخصص معمق في الإلكترونيك الطبية، الصيانة، ومعايرة الأجهزة وتسيير المنشآت الصحية مع تربصات بالمستشفيات. الشهادة: <strong>مهندس دولة في الهندسة البيوطبية</strong> 🎓.</li>
        <li><strong>🎓 مسار LMD الكلاسيكي - 5 سنوات (3+2):</strong><br>
        3 سنوات ليسانس (تمنحك أساسيات الصيانة الطبية) + سنتين ماستر (تخصص متقدم في الأنظمة البيوطبية الذكية والبحث العلمي). الشهادة: <strong>ماستر في الهندسة البيوطبية</strong> 🎓.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-book"></i> المواد الأساسية المدروسة</h3>
    <p>البرنامج الدراسي مشوق جداً ولكنه كثيف ويجمع كاع الألوان العلمية:</p>
    <ul>
        <li>🩺 <strong>العلوم الطبية الحيوية:</strong> علم التشريح (Anatomie)، علم وظائف الأعضاء (Physiologie)، والبيوكيمياء (Biochemie) باه تفهم كيفاش يخدم جسم الإنسان لي راح تصنعلو الجهاز.</li>
        <li>⚡ <strong>الهندسة الإلكترونية والكهربائية:</strong> الدوائر الإلكترونية، المعالجات الدقيقة (Microprocessors)، والمستشعرات الطبية (Capteurs) لي تلقط إشارات الجسم.</li>
        <li>💻 <strong>الإعلام الآلي والبرمجة:</strong> برمجة الأنظمة المدمجة، ومعالجة الصور الطبية ومعالجة الإشارات الحيوية مثل إشارات القلب والمخ (EEG/ECG).</li>
        <li>🔬 <strong>الفيزياء والبيوميكانيك:</strong> الديناميكا الحرارية، الأشعة السينية والنووية المستخدمة في التصوير الطبي، ودراسة حركة المفاصل والأعضاء.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-cogs"></i> التخصصات المتاحة في الطور الثاني (الماستر)</h3>
    <ul>
        <li>🏥 <strong>الأجهزة الطبية (Instrumentation Biomédicale):</strong> تصميم وتطوير الأجهزة الطبية التشخيصية والعلاجية.</li>
        <li>📸 <strong>التصوير الطبي والأنظمة (Imagerie Médicale):</strong> تخصص معقد ومطلوب جداً يركز على تكنولوجيا الـ IRM، الـ Scanner، الراديو، ومعالجة الصور الرقمية وتطوير برمجيات تشخيص الأمراض بالذكاء الاصطناعي.</li>
        <li>🦿 <strong>المواد الحيوية والأعضاء الاصطناعية (Biomatériaux & Prothèses):</strong> تصميم الأطراف الاصطناعية، المفاصل، وصمامات القلب المصنوعة من مواد تتقبلها أنسجة الجسم البشري.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-briefcase"></i> فرص ومجالات العمل بعد التخرج</h3>
    <p>خريج الهندسة البيوطبية يعتبر "العمود الفقري" للمستشفيات والشركات الطبية:</p>
    <ul>
        <li>🏢 <strong>الشركات العالمية الكبرى للمعدات الطبية (مثل Siemens, GE Healthcare, Philips, Mindray, Roche):</strong><br>
        - <em>Field Service Engineer:</em> مهندس صيانة ميدانية لتركيب وصيانة الأجهزة الحيوية المعقدة.<br>
        - <em>Application Specialist:</em> تدريب الأطباء والممرضين على كيفية استخدام الأجهزة.<br>
        - <em>Sales Engineer:</em> مهندس مبيعات تقنية.</li>
        <li>🏥 <strong>المستشفيات والعيادات الخاصة والعمومية:</strong> تسيير حظيرة الأجهزة الطبية، الصيانة الوقائية، وكتابة دفاتر الشروط.</li>
        <li>🧪 <strong>المخابر والشركات المصنعة للأدوية:</strong> صيانة أجهزة التحاليل المخبرية الدقيقة ومعايرتها.</li>
        <li>🚀 <strong>ريادة الأعمال:</strong> فتح مؤسسة لبيع وصيانة المعدات الطبية، أو شركة ناشئة (Startup) لحلول صحية رقمية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-thumbs-up"></i> الجوانب الإيجابية (آراء الطلبة)</h3>
    <ul>
        <li>🟢 <strong>عالم غير روتيني ونبيل:</strong> تجمع بين نبل مهنة الطب وقوة التكنولوجيا وتساهم مباشرة في إنقاذ الأرواح.</li>
        <li>🟢 <strong>مطلوب بقوة في القطاع الخاص:</strong> رواتب مغرية جداً مع سيارة عمل وتدريبات خارج الوطن.</li>
        <li>🟢 <strong>تنوع علمي ممتع:</strong> اليوم تقرى إلكترونيك وغدوة تشريح للقلب البشري والبارحة برمجة بـ Python.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-exclamation-circle"></i> الجوانب الصعبة (آراء الطلبة)</h3>
    <ul>
        <li>🔴 <strong>قراية "تفرغ الراس":</strong> لازم تكون متميز في الماط والفيزياء وتحفظ مصطلحات الطب في نفس الوقت.</li>
        <li>🔴 <strong>التهميش الإداري في القطاع العام:</strong> قد يواجه المهندس بعض المشاكل في التصنيف الوظيفي ورواتب متواضعة مقارنة بالشركات الخاصة.</li>
        <li>🔴 <strong>تحديث المعلومات المستمر:</strong> مواكبة سريعة للتكنولوجيا وقراءة الكتالوجات التقنية باللغة الإنجليزية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-check-circle"></i> المميزات (الملخص المفيد)</h3>
    <ul>
        <li>✅ شهادة مهندس دولة أو ماستر بمستقبل مهني واعد محلياً وعالمياً.</li>
        <li>✅ رواتب وامتيازات ممتازة جداً في القطاع الخاص والشركات متعددة الجنسيات في الجزائر.</li>
        <li>✅ بيئة عمل نظيفة، راقية، وذات قيمة إنسانية نبيلة.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-times-circle"></i> العيوب (الملخص المفيد)</h3>
    <ul>
        <li>❌ تخصص يتطلب إتقاناً ممتازاً للغة الإنجليزية والفرنسية.</li>
        <li>❌ قراية قاصحة وتحتاج سهر ومتابعة دقيقة في الـ TPs والتربصات داخل المستشفيات.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-lightbulb"></i> خلاصة</h3>
    <p>الهندسة البيوطبية هي الخيار الإستراتيجي الأقوى لكل طالب تكنولوجي حاب يخدم في دومين الصحة والطب ببريستيج المهندس المطور والذكي من غير ما يلبس طابلية طبيب جراح. إذا كان مخك حار في الإلكترونيك وحاب تخلي بصمتك في إنقاذ الأرواح بأجهزة المستقبل.. زير روحك وحط التخصص هذا في بالك!</p>
</div>
"""
    updated_content = content[:start_idx] + "\n" + new_content + "\n" + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print("biomedical.html created successfully!")
else:
    print("Could not find details class.")

# Now update specialities.html to add the new card
spec_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html"

with open(spec_path, "r", encoding="utf-8") as f:
    spec_content = f.read()

new_card = """  <div class="spec-card" data-category="engineering" data-name="الهندسة البيوطبية Génie Biomédical" onclick="window.location.href='/university/speciality/biomedical'">
  <div class="spec-card-img"><img alt="Biomedical" loading="lazy" src="/images/biomedical.png"/></div>
  <div class="spec-card-body">
  <div class="spec-card-top">
  <div class="spec-card-name">تخصص الهندسة البيوطبية - Génie Biomédical</div>
  </div>
  <div class="spec-card-footer">
  <span class="cat-badge cat-badge--engineering">تكنولوجيا و هندسة</span>
  <button class="spec-detail-btn" onclick="showSection('biomedical');event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
  </div>
  </div>
  </div>"""

# Insert after ESGEE card (or ENSF card if it's there, but I'll insert it at the end of the engineering ones, or just after ENSF)
ensf_card_end = "fa-arrow-left\"></i> التفاصيل</button>\n  </div>\n  </div>\n  </div>"
ensf_idx = spec_content.find("data-name=\"ENSF")
if ensf_idx != -1:
    insert_idx = spec_content.find(ensf_card_end, ensf_idx) + len(ensf_card_end)
    spec_content = spec_content[:insert_idx] + "\n" + new_card + spec_content[insert_idx:]
    with open(spec_path, "w", encoding="utf-8") as f:
        f.write(spec_content)
    print("specialities.html updated successfully!")
else:
    print("Could not find ENSF card to append after.")
