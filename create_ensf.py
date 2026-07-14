import os
import re

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\ensf.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace metadata and titles
content = content.replace("المدرسة العليا في الهندسة الكهربائية والطاقوية وهران - ESGEE", "المدرسة الوطنية العليا للغابات - ENSF خنشلة")
content = content.replace("المدرسة العليا في الهندسة الكهربائية والطاقوية وهران – ESGEE", "المدرسة الوطنية العليا للغابات – ENSF خنشلة")
content = content.replace("ESGEE", "ENSF")
content = content.replace("esgee", "ensf")

# Replace details block
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
    <h3><i class="fas fa-university"></i> معلومات المدرسة</h3>
    <ul>
        <li><i class="fas fa-map-marker-alt"></i> <strong>الموقع:</strong> ولاية خنشلة (جوهرة الأوراس وعاصمة غابات الأرز الأطلسي الساحرة).</li>
        <li><i class="fas fa-landmark"></i> <strong>الوصاية الرسمية:</strong> وزارة التعليم العالي والبحث العلمي (بالتنسيق الوثيق مع المديرية العامة للغابات DGF ووزارة الفلاحة).</li>
    </ul>
    <p>مدرسة خنشلة للغابات هي المدرسة الوطنية الوحيدة في الشرق والوطن لي مخصصة لتخريج "نخبة المهندسين" المسؤولين على حماية الثروة الغابية للجزائر، إعادة إحياء السد الأخضر، ومواجهة التغيرات المناخية والحرائق.</p>
    <p>إذا كنت تعشق الطبيعة، المغامرة، العمل الميداني، وحاب تخرج بشهادة "مهندس دولة" عندها هيبة حقيقية وقريبة من الأرض والبيئة.</p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-clipboard-check"></i> شروط التسجيل والقبول الأساسية (البروفايل المطلوب)</h3>
    <p>التسجيل الأولي يتم إلكترونياً عبر موقع التسجيلات الجامعية الموحد مورا الباك ديريكت. التخصص ينتمي لعائلة علوم الطبيعة والحياة:</p>
    <ul>
        <li>🥇 <strong>الأولوية الأولى (01):</strong> شعبة علوم تجريبية.</li>
        <li>🥈 <strong>الأولوية الثانية (02):</strong> شعبة رياضيات.</li>
        <li>🥉 <strong>الأولوية الثالثة (03):</strong> شعبة تقني رياضي (تخصص هندسة طرائق).</li>
    </ul>
    <p><strong>معايير الترتيب:</strong> الفرز يتم بناءً على المعدل الموزون (الذي يركز على علامة العلوم الطبيعية في الباك) أو المعدل العام للبكالوريا (السيستم يختار لك الأفضل تلقائياً).</p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-chart-bar"></i> معايير وانتقاء التوجيه ومعدلات القبول (تحديث 2025)</h3>
    <p>المدرسة تطلب معدل محترم لأن مقاعدها مدروسة وموجهة للنخبة العلمية:</p>
    <p>⚠️ <strong>شرط المشاركة في الترتيب (الحد الأدنى):</strong> يشترط السيستم معدلاً عاماً لا يقل عن <strong>12.00/20</strong> في الباك للمشاركة في الفرز.</p>
    
    <h4 style="margin-top: 15px; color: var(--primary-color);">📈 معدلات القبول الرسمية والنهائية لعام 2025:</h4>
    <ul>
        <li>🥇 <strong>شعبة علوم تجريبية (الأولوية 1):</strong> استقر معدل القبول عند <strong>13.20</strong>.</li>
        <li>🥈 <strong>شعبتا رياضيات وتقني رياضي (الأولوية 2 و 3):</strong> استقر معدل القبول عند <strong>13.90</strong>.</li>
    </ul>
    <div class="acceptance-calc-wrap" style="margin-top:15px;"><a class="acceptance-calc-btn" href="/tools#weighted-calc"><i class="fas fa-calculator"></i> احسب معدلك الموزون</a></div>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-graduation-cap"></i> مدة ومسار التكوين بالتفصيل</h3>
    <p>الدراسة في مدرسة الغابات بخنشلة تدوم <strong>5 سنوات</strong> كاملة وتنقسم كالتالي:</p>
    <ul>
        <li><strong>1️⃣ الطور التحضيري (Classes Préparatoires) - سنتين (2):</strong><br>
        الجذع المشترك (SNV): قراية مكثفة لعلوم البيولوجيا، البوتانيك (علم النبات)، الحيوان، الجيولوجيا، الكيمياء، والفيزياء الحيوية والرياضيات. تفوت موراها المسابقة الوطنية (Concours) للالتحاق بالطور الثاني. الناجحون يكملوا الطور الثاني، والراسبون يوجهون لكليات الـ SNV بالجامعات العادية.</li>
        <li><strong>2️⃣ الطور الثاني (Engineering Cycle) - 3 سنوات:</strong><br>
        دراسة تخصصية وتطبيقية ميدانية في الغابات والمحميات، إعداد الخرائط ونظم المعلومات الجغرافية، مع تربصات دورية ومستمرة وإعداد مشروع التخرج (PFE).</li>
    </ul>
    <p>تتخرج بشهادة: <strong>مهندس دولة في الغابات (Ingénieur d'État en Foresterie)</strong> + شهادة <strong>الماستر 2</strong> 🎓.</p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-cogs"></i> التخصصات المتاحة في الطور الثاني (مرحلة التخصص)</h3>
    <p>بعد تجاوز الطور التحضيري بنجاح، تفتح لك المدرسة تخصصات بيئية وتكنولوجية هربانة:</p>
    <ul>
        <li>🌲 <strong>تهيئة وتسيير الغابات (Aménagement Forestier):</strong> تخطيط المساحات الغابية، مكافحة الحرائق، وتشجير المناطق المتضررة.</li>
        <li>🦊 <strong>حماية الطبيعة والتنوع البيولوجي (Protection de la Nature):</strong> إدارة المحميات الوطنية، دراسة الحيوانات البرية المهددة بالانقراض وحماية النظم البيئية.</li>
        <li>🌵 <strong>مكافحة التصحر والمحافظة على المياه والتربة (CES/DRS):</strong> هندسة السد الأخضر، حماية التربة من الانجراف وتسيير المياه في المناطق شبه الجافة.</li>
        <li>🛰️ <strong>الخرائطية ونظم المعلومات الجغرافية (SIG & Télédétection):</strong> استخدام صور الأقمار الصناعية والدرونز لمراقبة وتخطيط الغابات رقمياً.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-briefcase"></i> فرص ومجالات العمل بعد التخرج</h3>
    <p>حامل شهادة مهندس دولة من مدرسة الغابات بخنشلة يملك فرصاً ممتازة في القطاع الحكومي والخاص:</p>
    <ul>
        <li>🪓 <strong>محافظات ومقاطعات الغابات (Conservations des Forêts):</strong> الخدمة كإطار مسير أو مفتش في كاع ولايات الوطن تحت وصاية المديرية العامة للغابات.</li>
        <li>🏞️ <strong>الحدائق الوطنية والمحميات الطبيعية:</strong> كمسؤول عن حماية الحياة البرية والتنوع البيولوجي (مثل حديقة جرجرة، الحظيرة الوطنية لتازا، بلزمة، أو محمية حضنة).</li>
        <li>🗺️ <strong>الوكالة الوطنية لحفظ الطبيعة (ANN) والمعهد الوطني للأبحاث الغابية (INRF):</strong> العمل في مخابر البحث العلمي وتطوير البذور والنباتات.</li>
        <li>🌳 <strong>مكاتب الدراسات البيئية والفلاحية:</strong> تصميم وإعداد مكاتب الدراسات الخاصة لتقييم الأثر البيئي للمشاريع الصناعية الكبرى.</li>
        <li>🏗️ <strong>شركات الهندسة الريفية واستصلاح الأراضي:</strong> تسيير المشاتل الكبرى ومشاريع التشجير العملاقة للدولة.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-thumbs-up"></i> الجوانب الإيجابية (آراء الطلبة)</h3>
    <ul>
        <li>🟢 <strong>التطبيق في الطبيعة العذراء:</strong> القراية ماشي غير كراسات؛ أغلب الـ TPs والتربصات تكون عبارة عن خرجات ميدانية وسط الطبيعة والجبال (Chelia forest)، تخدم بيدك وتتعلم في الميدان الحقيقي.</li>
        <li>🟢 <strong>نخبوية ومحيط بيداغوجي نظيف:</strong> المدرسة توفر إقامة بيداغوجية ممتازة، أعداد الطلاب صغيرة، كاع الناس تعرف بعضها، والأساتذة يعاملوك كزميل مهندس مستقبلي.</li>
        <li>🟢 <strong>قيمة الشهادة:</strong> مهندس الغابات يعتبر بروفايل تقني وتسييري نادر جداً وله مكانة وهيبة محترمة في قطاع الفلاحة والبيئة.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-exclamation-circle"></i> الجوانب الصعبة (آراء الطلبة)</h3>
    <ul>
        <li>🔴 <strong>البرد القارس والجو الميداني:</strong> خنشلة معروفة بشتاء بارد جداً وثلوج؛ الخرجات الميدانية في الجبال تتطلب بنية بدنية وصبر على التعب والظروف الطبيعية القاسية.</li>
        <li>🔴 <strong>هاجس المسابقة الوطنية:</strong> كباقي المدارس العليا، السنة ثانية تحمل ضغط "الكونكور" للمرور لطور الهندسة.</li>
        <li>🔴 <strong>محدودية القطاع الخاص:</strong> أغلب مناصب الشغل مركزة في الوظائف الحكومية التابعة للدولة (DGF، الوزارات، البلديات)، والفرص في الشركات الخاصة الكلاسيكية تكون أقل مقارنة بالتخصصات التكنولوجية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-check-circle"></i> المميزات (الملخص المفيد)</h3>
    <ul>
        <li>✅ الحصول على شهادة مهندس دولة رفيعة المستوى في قطاع بيئي إستراتيجي للبلاد.</li>
        <li>✅ تكوين يدمج بين علم الأحياء والتكنولوجيا الحديثة (نظم المعلومات الجغرافية والاستشعار عن بعد).</li>
        <li>✅ آفاق ممتازة للعمل الميداني كحامي ومخطط للثروة الطبيعية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-times-circle"></i> العيوب (الملخص المفيد)</h3>
    <ul>
        <li>❌ تطلب جهداً بدنياً وحباً حقيقياً للميدان والغابات (ما تصلحش للطلبة لي يفضلوا مكاتب المكيفات فقط).</li>
        <li>❌ ضغط الطور التحضيري والامتحانات الدورية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-lightbulb"></i> خلاصة</h3>
    <p>المدرسة الوطنية العليا للغابات بخنشلة هي البوابة الذهبية لكل طالب علمي يعشق الطبيعة، الحياة البرية، وحاب يساهم بيده وعلمه في حماية بيئة بلاده وتخضيرها ببريستيج مهندس دولة حقيقي. إذا كان قلبك يبغي الغابة ومستعد لتحديات الميدان الأوراسي القاصح.. توكل على ربي!</p>
</div>
"""
    updated_content = content[:start_idx] + "\n" + new_content + "\n" + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print("ENSF created successfully!")
else:
    print("Could not find details class.")

# Now update specialities.html to add the new card
spec_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html"

with open(spec_path, "r", encoding="utf-8") as f:
    spec_content = f.read()

new_card = """  <div class="spec-card" data-category="nature" data-name="ENSF خنشلة المدرسة الوطنية العليا للغابات" onclick="window.location.href='/university/speciality/ensf'">
  <div class="spec-card-img"><img alt="ENSF" loading="lazy" src="/images/ENSF.png"/></div>
  <div class="spec-card-body">
  <div class="spec-card-top">
  <div class="spec-card-name">المدرسة الوطنية العليا للغابات - ENSF خنشلة</div>
  </div>
  <div class="spec-card-footer">
  <span class="cat-badge cat-badge--nature">طبيعة</span>
  <button class="spec-detail-btn" onclick="showSection('ENSF');event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
  </div>
  </div>
  </div>"""

# Insert after ESGEE card
esgee_card_end = 'onclick="showSection(\'ESGEE\');event.stopPropagation()"><i class="fas \nfa-arrow-left"></i> التفاصيل</button>\n  </div>\n  </div>\n  </div>'

if esgee_card_end in spec_content:
    spec_content = spec_content.replace(esgee_card_end, esgee_card_end + "\n" + new_card)
    with open(spec_path, "w", encoding="utf-8") as f:
        f.write(spec_content)
    print("specialities.html updated successfully!")
else:
    # Let's try another string to find the end of ESGEE
    esgee_card_end_2 = "fa-arrow-left\"></i> التفاصيل</button>\n  </div>\n  </div>\n  </div>"
    esgee_idx = spec_content.find("data-name=\"ESGEE")
    if esgee_idx != -1:
        insert_idx = spec_content.find(esgee_card_end_2, esgee_idx) + len(esgee_card_end_2)
        spec_content = spec_content[:insert_idx] + "\n" + new_card + spec_content[insert_idx:]
        with open(spec_path, "w", encoding="utf-8") as f:
            f.write(spec_content)
        print("specialities.html updated successfully by offset!")
    else:
        print("Could not find ESGEE card to append after.")
