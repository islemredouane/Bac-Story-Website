import os
import re

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\ensee.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace ENSEE with ESGTEO in titles and metadata
content = content.replace("المدرسة العليا للهندسة الكهربائية والطاقوية وهران - ENSEE", "المدرسة العليا في الهندسة الكهربائية والطاقوية وهران - ESGTEO")
content = content.replace("المدرسة العليا للهندسة الكهربائية والطاقوية وهران – ENSEE", "المدرسة العليا في الهندسة الكهربائية والطاقوية وهران – ESGTEO")
content = content.replace("ENSEE", "ESGTEO")

# Find the details block
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
        <li><i class="fas fa-map-marker-alt"></i> <strong>الموقع:</strong> الباهية وهران – بئر الجير (قطب التكنولوجيا والعلوم).</li>
    </ul>
    <p>العالم كامل راه رايح لـ "التحول الطاقوي" (Transition Énergétique)، والجزائر راهي تستثمر بقوة في مشاريع الهيدروجين الأخضر، الطاقات المتجددة، وعصرنة الشبكات الكهربائية. ESGTEO بوهران هي المصنع الأساسي للنخبة لي راح تقود هاد الثورة التكنولوجية.</p>
    <p>هنا ماراكش راح تقرى نظري جاف؛ راح تدخل لعمق الهندسة الكهربائية، وتسيير الطاقة الحرارية والمتجددة. تتخرج منها بشهادة "مهندس دولة" ثقيلة تفتح لك بيبان أكبر الشركات الصناعية والطاقوية في البلاد. بصح وجد روحك لقراية حارة وبروغرام ما يرحمش في السنتين الأولى!</p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-clipboard-check"></i> شروط التسجيل والقبول الأساسية</h3>
    <p>التنافس مفتوح حصرياً للشعب العلمية والتكنولوجية:</p>
    <ul>
        <li>👈 <strong>شعبة رياضيات</strong> (الأولوية الأولى).</li>
        <li>👈 <strong>شعبة تقني رياضي</strong> و <strong>شعبة علوم تجريبية</strong> بنفس الأولوية.</li>
    </ul>
    <p><strong>معايير الترتيب:</strong> يتم ترتيب الطلاب وطنياً بناءً على المعدل الموزون (الذي يركز على علامة الرياضيات والفيزياء في الباك) أو المعدل العام للبكالوريا.</p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-chart-bar"></i> معايير التوجيه ومعدلات القبول</h3>
    <p>⚠️ <strong>معدل الترشح:</strong> يتم الترتيب على أساس المعدل الموزون أو المعدل العام المحصل عليه في امتحان البكالوريا اللذان ينبغي أن يساويان أو يفوقان <strong>14.00/20</strong>.</p>
    
    <h4 style="margin-top: 15px; color: var(--primary-color);">📈 معدل القبول الرسمي لعام 2025:</h4>
    <ul>
        <li>استقر معدل القبول عند <strong>16.5</strong>.</li>
    </ul>
    <div class="acceptance-calc-wrap" style="margin-top:15px;"><a class="acceptance-calc-btn" href="/tools#weighted-calc"><i class="fas fa-calculator"></i> احسب معدلك الموزون</a></div>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-graduation-cap"></i> مدة ومسار التكوين بالتفصيل</h3>
    <p>نظام الدراسة في ESGTEO يدوم <strong>5 سنوات</strong> كاملة وينقسم إلى طورين أساسيين:</p>
    <ul>
        <li><strong>1️⃣ الطور التحضيري (Classes Préparatoires) - سنتين (2):</strong><br>
        السداسيات (S1 إلى S4): جذع مشترك علوم وتكنولوجيا (ST). قراية مكثفة بزاف للمواد الأساسية العلمية لبناء قاعدة صلبة ومستحيل ترحم الكسلان. تفوت موراها المسابقة الوطنية (Concours National) للالتحاق بالطور الثاني. الناجحون يكملوا الطور الثاني، والراسبون يوجهون للجامعة العادية (ST).</li>
        <li><strong>2️⃣ الطور الثاني (Engineering Cycle) - 3 سنوات:</strong><br>
        دراسة تخصصية، تكنولوجية، وتطبيقية محضة داخل مخابر المدرسة الفخمة، مع تربصات دورية ومستمرة في الشركات والمصانع.</li>
    </ul>
    <p>تتخرج بشهادتين معاً: شهادة <strong>مهندس دولة (Ingénieur d'État)</strong> + شهادة <strong>الماستر 2</strong> 🎓.</p>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-book"></i> المواد الأساسية المدروسة في الطور التحضيري</h3>
    <p>باه تعرف روحك واش راح تواجه في السنتين الأولى، هاهي المواد لي راح تبلع بيها الوقت تما:</p>
    <ul>
        <li>📐 <strong>الرياضيات:</strong> Analyse 1 & 2 + Algèbre 1 & 2.</li>
        <li>⚡ <strong>الفيزياء والحراريات:</strong> Électricité 1 & 2 + Thermodynamique (الديناميكا الحرارية) + Optique.</li>
        <li>🧪 <strong>العلوم الدقيقة:</strong> Chimie générale et organique.</li>
        <li>💻 <strong>التكنولوجيا الحديثة:</strong> Informatique (البرمجة والخوارزميات) + Dessin Technique (الرسم الصناعي).</li>
        <li>📊 <strong>العلوم الاقتصادية:</strong> الاقتصاد وإدارة المشاريع التقنية.</li>
        <li>🗣️ <strong>اللغات:</strong> لغة فرنسية وإنجليزية علمية وتقنية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-cogs"></i> التخصصات المتاحة في الطور الثاني (عالم الاحتراف)</h3>
    <p>بعد ما تجوز العامين التحضيرية وتنجح في المسابقة، راح تفتح قدامك تخصصات إستراتيجية هربانة وقوية تكنولوجياً في الطور الثاني:</p>
    <ul>
        <li>⚡ <strong>الهندسة الكهربائية (Génie Électrique):</strong> تشمل التحكم الآلي (Automatique)، الإلكترونيك الصناعية، الشبكات الكهربائية الذكية وتسيير الطاقة والآلية.</li>
        <li>🔥 <strong>الهندسة الطاقوية (Génie Énergétique):</strong> تخصص ديناميكا الحرارة، التبريد والتكييف الصناعي، المحركات الحرارية، والتحسين الطاقوي للمصانع والمنشآت.</li>
        <li>🌿 <strong>الطاقات المتجددة (Énergies Renouvelables):</strong> تخصص تكنولوجيا الطاقة الشمسية (الكهروضوئية والحرارية)، طاقة الرياح، وتخزين الطاقة الحديثة والهيدروجين الأخضر.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-briefcase"></i> فرص ومجالات العمل بعد التخرج</h3>
    <p>خريج مدرسة ESGTEO يعتبر ورقة رابحة وعملة مطلوبة بقوة في كبرى الشركات الوطنية بفضل القوة التطبيقية للتخصص:</p>
    <ul>
        <li>⚡ <strong>مجمع سونلغاز (Sonelgaz):</strong> العمل في محطات توليد الطاقة، تسيير الشبكات الكهربائية الكبرى، وعصرنة التوزيع.</li>
        <li>🔥 <strong>مجمع سوناطراك (Sonatrach) والشركات البترولية:</strong> كمهندس طاقوي وميكانيكي لتسيير التوربينات، صيانة أنظمة الضغط ومحطات الغاز والنفط.</li>
        <li>🌿 <strong>شركات ومشاريع الطاقات المتجددة:</strong> تصميم وإدارة محطات الطاقة الشمسية عبر ولايات الوطن ومشاريع التحول الأخضر.</li>
        <li>🏭 <strong>المصانع ومكاتب الدراسات التقنية:</strong> مهندس صيانة عامة، مسؤول الكفاءة الطاقوية للمصانع الكبرى، أو مهندس تصميم في مكاتب الدراسات الكهربائية والميكانيكية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-thumbs-up"></i> الجوانب الإيجابية (آراء الطلبة)</h3>
    <ul>
        <li>🟢 <strong>التطبيق ثم التطبيق:</strong> مخابر المدرسة فخمة ومجهزة بأحدث أجهزة القياس والمحاكاة للأنظمة الكهربائية والحرارية، والتطبيقي (TP) يمثل ركيزة دراسية حقيقية.</li>
        <li>🟢 <strong>الباهية وهران:</strong> الدراسة في قطب وهران يمنحك نمط حياة جامعي ممتع، مريح، وقريب جداً من كبرى المناطق الصناعية بالغرب (أرزيو، بطيوة...) لي تسهل عليك التربصات (Stages).</li>
        <li>🟢 <strong>البيئة النخبوية:</strong> تدرس وسط طلاب متفوقين، في جو هادئ وتأطير بيداغوجي رفيع يغيب فيه اكتظاظ الجامعات الكلاسيكية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-exclamation-circle"></i> الجوانب الصعبة (آراء الطلبة)</h3>
    <ul>
        <li>🔴 <strong>ريتم البريبا الحار:</strong> السنتين الأولى تطلب انضباطاً حديدياً وسهراً متواصلاً؛ المواد تجمع بين تعقيد الرياضيات وقوة الفيزياء (خاصة الديناميكا الحرارية والكهرباء الحركية) ولا مجال للكسل.</li>
        <li>🔴 <strong>هاجس الكونكور:</strong> المسابقة الوطنية في نهاية السنة الثانية تشكل ضغطاً مستمراً على الطلاب لضمان الانتقال والنجاح في الطور الثاني للمدارس العليا.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-check-circle"></i> المميزات (الملخص المفيد)</h3>
    <ul>
        <li>✅ تخرج بلقب مهندس دولة معترف به وبقوة في السلم الوظيفي + ماستر 2.</li>
        <li>✅ تخصصات ثقيلة ومطلوبة جداً تتماشى مع التوجه الإستراتيجي الجديد للبلاد نحو الطاقات البديلة.</li>
        <li>✅ موقع ممتاز في عاصمة الغرب وهران يسهل الاحتكاك بالمؤسسات الصناعية الكبرى.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-times-circle"></i> العيوب (الملخص المفيد)</h3>
    <ul>
        <li>❌ ضغط بيداغوجي مستمر ونظام حضور وغيابات صارم جداً بلا تهاون.</li>
        <li>❌ التخصص يتطلب ذكاءً رياضي وفيزيائي عالي، وما يصلحش للطلبة لي يفضلوا الحفظ والأسلوب النظري.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-lightbulb"></i> خلاصة</h3>
    <p>ESGTEO بوهران هي الخيار الأقوى والأجمل لكل طالب علمي أو تقني حاب يضمن مستقبله بلقب "مهندس دولة" حقيقي في قلب تكنولوجيا الطاقة والكهرباء والتحول الأخضر في الجزائر من غير كاسكيطة وبلا روتين لافاك الكلاسيكية. إذا كان فيزيك تاعك واجد ومخك حار في الماط والفيزياء.. توكل على ربي!</p>
</div>
"""
    updated_content = content[:start_idx] + "\n" + new_content + "\n" + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print("ESGTEO updated successfully!")
else:
    print("Could not find details class.")

# Also update the card in specialities.html to change ENSEE to ESGTEO
spec_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html"
with open(spec_path, "r", encoding="utf-8") as f:
    spec_content = f.read()

# Replace text just inside the specialities.html for ENSEE -> ESGTEO
# The data-name and text content
spec_content = re.sub(r'ENSEE', 'ESGTEO', spec_content)

with open(spec_path, "w", encoding="utf-8") as f:
    f.write(spec_content)
    
print("specialities.html updated successfully!")
