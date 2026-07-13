import os

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\enste.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace titles
content = content.replace("المدرسة العليا للعلوم التطبيقية - ESSA | BAC STORY", "المدرسة الوطنية العليا للتكنولوجيا والهندسة - ENSTE | BAC STORY")
content = content.replace("المدرسة العليا للعلوم التطبيقية - ESSA", "المدرسة الوطنية العليا للتكنولوجيا والهندسة - ENSTE")
content = content.replace("essa", "enste")
content = content.replace("ESSA", "ENSTE")

# We want to replace the images with ENSTE.png
# the image paths are around: <img src="/images/20250610_175029.jpg" ...
import re
content = re.sub(r'<img [^>]*src="/images/[^"]*"[^>]*>', r'<img alt="ENSTE Photo" class="center-photo-img" loading="lazy" src="/images/ENSTE.png"/>', content)

# Now we replace the `<div class="details"> ... </div>` block
start_str = '<div class="details">'
start_idx = content.find(start_str)

if start_idx != -1:
    start_idx += len(start_str)
    end_str = '\n</div>\n</div>\n</div>\n\n    <!-- Specialty Navigation Buttons -->'
    end_idx = content.find(end_str)
    if end_idx == -1:
        # fallback
        end_str = '<!-- Specialty Navigation Buttons -->'
        end_idx = content.find(end_str)
        end_idx = content.rfind('</div>', 0, end_idx) # find the closing div of details
        end_idx = content.rfind('</div>', 0, end_idx) # go up
        end_idx = content.rfind('</div>', 0, end_idx) # go up

    new_content = """
<div class="detail-card large-card">
    <h3><i class="fas fa-university"></i> معلومات المدرسة</h3>
    <ul>
        <li><i class="fas fa-map-marker-alt"></i> <strong>الموقع:</strong> بونة (عنابة المضيافة) – القطب الجامعي بسيدي عمار (قريب جداً من أكبر المناطق الصناعية في البلاد).</li>
        <li><i class="fas fa-landmark"></i> <strong>الوصاية الرسمية:</strong> وزارة التعليم العالي والبحث العلمي.</li>
        <li><i class="fas fa-building"></i> <strong>الطبيعة:</strong> مدرسة وطنية عليا مدنية 100%.</li>
    </ul>
    <p><strong>الهدرة تاع الصح:</strong> مدرسة ENSTE عنابة ماشي مدرسة عادية، هادي مشروع إستراتيجي ضخم وقوي تأسس في ديسمبر 2022 بعد قرار ذكي بدمج عملاقين أكاديميين في عنابة: <strong>المدرسة الوطنية العليا للمناجم والمعادن (ENSMM)</strong> و <strong>المدرسة العليا للتكنولوجيات الصناعية (ESTI)</strong>.</p>
    <p>هاد الاندماج ولد لنا مدرسة سوبر (Super-School) تجمع بين قوة هندسة المواد والمناجم، وتطور التكنولوجيات الصناعية والإلكترونيك. إذا كنت من عشاق التكنولوجيا والصناعة الثقيلة، وحاب تخرج مهندس دولة مطلوب بقوة في كبرى الشركات البترولية والمعدنية والمصانع العملاقة، هادا هو الـ Ultimate Guide ليك!</p>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-clipboard-check"></i> شروط التسجيل والقبول الأساسية</h3>
    <p>التسجيل الأولي يتم إلكترونياً عبر موقع التسجيلات الجامعية المعتمد لوزارة التعليم العالي مباشرة بعد صدور نتائج الباك. التنافس مفتوح حصرياً للشعب العلمية والتكنولوجية:</p>
    <ul>
        <li>👈 <strong>شعبة رياضيات</strong> (الأولوية الأولى).</li>
        <li>👈 <strong>شعبة تقني رياضي</strong> (بمختلف فروعها).</li>
        <li>👈 <strong>شعبة علوم تجريبية</strong>.</li>
    </ul>
    <p>يتم ترتيب الطلاب وطنياً بناءً على المعدل الموزون (الذي يركز على علامة الرياضيات والفيزياء في الباك) أو المعدل العام للبكالوريا.</p>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-chart-bar"></i> معايير وانتقاء التوجيه ومعدلات القبول (تحديث 2025)</h3>
    <p>الدخول لهاد المدرسة يحتاج معدل محترم جداً، والفرز يكون تنازلياً على حساب المقاعد البيداغوجية المتاحة:</p>
    <p>⚠️ <strong>شرط المشاركة في الترتيب (الحد الأدنى):</strong> يشترط السيستم ألا يقل المعدل العام في الباك عن 13/20 للأولوية الأولى و 14/20 للأولوية الثانية، مع اشتراط معدل لا يقل عن 13 أو 14/20 في مادتي الفيزياء والرياضيات للمشاركة في الفرز.</p>
    
    <h4 style="margin-top: 15px; color: var(--primary-color);">📈 معدلات القبول الرسمية والنهائية لعام 2025 (المعدل العام للباك):</h4>
    <ul>
        <li>🥇 <strong>شعبة رياضيات وتقني رياضي (الأولوية 1):</strong> استقر معدل القبول عند 14.15</li>
        <li>🥈 <strong>شعبة علوم تجريبية (الأولوية 2):</strong> استقر معدل القبول عند 14.75</li>
    </ul>
    <div class="acceptance-calc-wrap" style="margin-top:15px;"><a class="acceptance-calc-btn" href="/tools#weighted-calc"><i class="fas fa-calculator"></i> احسب معدلك الموزون</a></div>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-graduation-cap"></i> مدة ومسار التكوين بالتفصيل</h3>
    <p>نظام الدراسة في ENSTE يدوم <strong>5 سنوات</strong> كاملة وينقسم إلى طورين أساسيين:</p>
    <ul>
        <li><strong>1️⃣ الطور التحضيري (Classes Préparatoires) - سنتين (2):</strong><br>
        السداسيات (S1 إلى S4): جذع مشترك علوم وتكنولوجيا (ST). قراية مكثفة بزاف ومضغوطة للمواد الأساسية العلمية لبناء قاعدة صلبة. تفوت موراها المسابقة الوطنية (Concours National) للالتحاق بالطور الثاني. الناجحون يكملوا الطور الثاني، والراسبون يوجهون للجامعة العادية (ST).</li>
        <li><strong>2️⃣ الطور الثاني (Engineering Cycle) - 3 سنوات:</strong><br>
        دراسة تخصصية، تكنولوجية، وتطبيقية محضة داخل مخابر المدرسة، مع تربصات دورية ومستمرة في المصانع والشركات الكبرى.</li>
    </ul>
    <p>تتخرج بشهادتين معاً: شهادة <strong>مهندس دولة (Ingénieur d'État)</strong> + شهادة <strong>الماستر 2</strong> 🎓.</p>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-book"></i> المواد الأساسية المدروسة في الطور التحضيري</h3>
    <p>باه تعرف واش راح تواجه في السنتين الأولى، هاهي المواد لي راح تقراها تما:</p>
    <ul>
        <li>📐 <strong>الرياضيات:</strong> Analyse 1 & 2 + Algèbre 1 & 2.</li>
        <li>🧪 <strong>العلوم الدقيقة:</strong> Physique 1 & 2 + Chimie 1 & 2.</li>
        <li>💻 <strong>التكنولوجيا الحديثة:</strong> Informatique (البرمجة والخوارزميات) + Dessin Technique (الرسم الصناعي).</li>
        <li>📊 <strong>العلوم الاقتصادية:</strong> الاقتصاد والـ Statistique et Probabilités.</li>
        <li>🗣️ <strong>اللغات والعلوم الإنسانية:</strong> لغة فرنسية، إنجليزية، وعلوم إنسانية (Sciences Humaines).</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-cogs"></i> التخصصات المتاحة في الطور الثاني (عالم الاحتراف)</h3>
    <p>بعد ما تجوز العامين التحضيرية وتنجح في المسابقة، راح تفتح قدامك 5 أقسام رئيسية فيها تخصصات هربانة وقوية تكنولوجياً:</p>
    <ul>
        <li>⚙️ <strong>هندسة المناجم والمعادن والمواد:</strong> التخصص التاريخي الأقوى في عنابة (تصنيع الحديد والصلب، معالجة المعادن، واستخراج الثروات المنجمية).</li>
        <li>💻 <strong>الإلكترونيك، الإلكتروتقني، والأوتوماتيك (EEA):</strong> تخصص الأنظمة الذكية، الميكاترونيك، التحكم الآلي، والطاقات المتجددة.</li>
        <li>🏭 <strong>الهندسة الصناعية (Génie Industriel):</strong> إدارة سلاسل الإمداد واللوجستيك الصناعي، تصميم خطوط الإنتاج، وإدارة الجودة والعمليات.</li>
        <li>🧪 <strong>هندسة الطرائق والطاقة:</strong> تخصص هندسة العمليات الكيميائية وتسيير الطاقات بمختلف أنواعها.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-briefcase"></i> فرص ومجالات العمل بعد التخرج</h3>
    <p>خريج ENSTE عنابة يعتبر مطلوباً بالاسم في السوق بفضل موقع المدرسة الإستراتيجي القريب من كبرى أقطاب الصناعة في الجزائر. مجالات العمل المتاحة:</p>
    <ul>
        <li>🏭 <strong>صناعة الحديد والصلب والمعادن:</strong> العمل كمهندس إنتاج أو صيانة في المركبات العملاقة مثل مركب الحجار بعنابة، بلارة (AQS) بجيجل، أو توسيالي (Tosyali) بوهران.</li>
        <li>⛏️ <strong>قطاع المناجم والطاقة:</strong> العمل في شركات التنقيب والاستخراج مثل مجمع سوناريم (Sonarem)، وشركات الفوسفات (الشرق الجزائري يشهد أضخم مشروع فوسفات مدمج وهو بحاجة لآلاف المهندسين).</li>
        <li>🔥 <strong>سوناطراك وسونلغاز والشركات البترولية:</strong> كمهندس عمليات، صيانة كهربائية وميكانيكية، أو مهندس طرائق وطاقة.</li>
        <li>🌐 <strong>شركات تصنيع السيارات والإلكترونيك:</strong> كمسؤول عن برمجة الآلات وتشغيل خطوط الإنتاج الذكية واللوجستيك الصناعي.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-comments"></i> الهدرة من الداخل: آراء وتجارب الطلبة</h3>
    <p>باه تعرف حقيقة القراية تما قبل ما يسجل، هاهي تجارب الطلبة لي راهم في الميدان حالياً:</p>
    
    <h4 style="margin-top: 15px; color: #2ecc71;">😍 الجوانب الإيجابية (علاش تعجبهم؟)</h4>
    <ul>
        <li>🟢 <strong>التماسك بعد الاندماج:</strong> الاندماج تاع 2022 جاب قوة بيداغوجية كبيرة؛ مخابر مدرسة المناجم القديمة مع تكنولوجيا مدرسة الصناعة شكلوا ثروة علمية وتطبيقية ممتازة للطلبة.</li>
        <li>🟢 <strong>القرب من الميدان الصناعي:</strong> الخرجات الميدانية والتربصات متوفرة بكثرة وسهلة بفضل شبكة العلاقات القوية للمدرسة مع المصانع المحيطة بها.</li>
        <li>🟢 <strong>البيئة النخبوية:</strong> تدرس في جو بيداغوجي محترم، أعداد الطلبة مدروسة، والأساتذة متوفرون دائماً للتأطير.</li>
    </ul>

    <h4 style="margin-top: 15px; color: #e74c3c;">😅 الجوانب الصعبة (واش يشتكوا؟)</h4>
    <ul>
        <li>🔴 <strong>ضغط "البريبا" والريتم السريع:</strong> القراية قاصحة في العامين الأولى وتتطلب حضوراً يومياً وانضباطاً صارماً (الغيابات تقدر تقصيك).</li>
        <li>🔴 <strong>الموقع والنقل:</strong> رغم أن القطب الجامعي بسيدي عمار مجهز، إلا أن بعض الطلبة يجدون صعوبة في النقل أو يفضلون حركية وسط المدينة.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-balance-scale"></i> المميزات والعيوب (الملخص المفيد)</h3>
    <h4 style="margin-top: 15px; color: #2ecc71;">المميزات:</h4>
    <ul>
        <li>✅ تخرج بلقب مهندس دولة معترف به وطنياً ودولياً + ماستر 2.</li>
        <li>✅ تخصصات حصرية وقوية جداً تضمن لك عملاً سريعاً بعد التخرج.</li>
        <li>✅ تكوين تطبيقي عالي المستوى وستاجات دورية في كبريات الشركات.</li>
    </ul>
    <h4 style="margin-top: 15px; color: #e74c3c;">العيوب:</h4>
    <ul>
        <li>❌ نظام دراسي مغلق ومكثف يسبب ضغطاً مستمراً طوال السنتين الأولى.</li>
        <li>❌ هاجس المسابقة الوطنية (الكونكور) كباقي المدارس العليا.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-lightbulb"></i> خلاصة</h3>
    <p>مدرسة ENSTE عنابة هي القلعة التكنولوجية والصناعية الأقوى في الشرق الجزائري، والخيار الإستراتيجي التوب لكل طالب علمي حاب يضمن مستقبله بلقب "مهندس دولة" حقيقي يخدم بيده ويتحكم في كبرى المصانع والمشاريع المنجمية للبلاد. إذا كان قلبك قاصح، حاب التحدي، وعينك على مستقبل مهني ثقيل.. توكل على ربي!</p>
</div>
"""
    updated_content = content[:start_idx] + "\n" + new_content + "\n" + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print("ENSTE updated successfully!")
else:
    print("Could not find details class.")

