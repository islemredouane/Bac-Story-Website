import os
import re

# 1. Create esesm.html
html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-T5H3TNJ4');</script>
    <!-- End Google Tag Manager -->
    <meta name="description"
        content="تعرف على المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس في الجزائر لعام 2026. اكتشف معدلات القبول المطلوبة، شروط التسجيل، المناهج الدراسية، وآفاق فرص العمل ومستقبل التخصص في سوق العمل الجزائري.">
    <meta name="keywords"
        content="تخصص المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس, معدل قبول المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس 2026, مستقبل المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس في الجزائر, فرص عمل المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس الجزائر, شروط القبول المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس">
    <link rel="icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#1a3a8f">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="BAC STORY">
    <title>المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس | BAC STORY</title>
    <link rel="canonical" href="https://bacstory.vercel.app/university/speciality/esesm">
    <meta name="author" content="redouane mohamed islem">
    <link rel="stylesheet" href="/style.css?v=9.7">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/fontawesome.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/solid.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/brands.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/fontawesome.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/solid.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/brands.min.css">
    </noscript>
    <link rel="preload"
        href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Pattaya&display=swap"
        as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Pattaya&display=swap">
    </noscript>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس",
      "description": "تعرف على تخصص المدرسة العليا لأساتذة الصم والبكم - ESESM بني مسوس في الجزائر لعام 2026. اكتشف معدلات القبول المطلوبة، شروط التسجيل، المناهج الدراسية، وآفاق فرص العمل ومستقبل التخصص في سوق العمل الجزائري.",
      "provider": {
        "@type": "Organization",
        "name": "BAC STORY",
        "sameAs": "https://bacstory.vercel.app"
      }
    }
    </script>
</head>

<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T5H3TNJ4"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div id="navbar-placeholder"></div>

    <main class="speciality-page">
        <!-- Hero Section -->
        <div class="speciality-hero">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <div class="spec-icon-wrapper">
                    <img src="/images/esesm.png" alt="ESESM Icon" class="spec-icon-img" onerror="this.onerror=null; this.src='/images/esgee.png';" style="width:100px; border-radius:50%; box-shadow: 0 4px 15px rgba(0,0,0,0.3);" />
                </div>
                <h1 class="spec-title">المدرسة العليا لأساتذة الصم والبكم – ESESM</h1>
                <p class="spec-subtitle">المدرسة العليا لأساتذة الصم والبكم بني مسوس</p>
                <div class="spec-badges">
                    <span class="badge badge-category"><i class="fas fa-tags"></i> أستاذ تعليم</span>
                    <span class="badge badge-duration"><i class="fas fa-clock"></i> 6 سنوات</span>
                    <span class="badge badge-degree"><i class="fas fa-graduation-cap"></i> أستاذ تعليم ثانوي</span>
                </div>
            </div>
        </div>

        <div class="school-details" style="margin-top: 70px">
            <div class="details">

<div class="detail-card large-card">
    <h3><i class="fas fa-university"></i> معلومات التخصص</h3>
    <ul>
        <li><i class="fas fa-map-marker-alt"></i> <strong>الموقع:</strong> بني مسوس، الجزائر العاصمة.</li>
        <li><i class="fas fa-landmark"></i> <strong>الوصاية الرسمية:</strong> وزارة التعليم العالي بالتنسيق المباشر مع وزارة التضامن الوطني.</li>
    </ul>
    <p>هادي مدرسة نخبوية وإنسانية من الطراز الرفيع، مديورة باه تخرّج "أساتذة متخصصين" قادرين يكسروا جدار الصمت ويدرسوا فئة الأطفال ذوي الهمم من الصم والبكم. הـ Cheat Code الأسطوري هنا هو "التوظيف المضمون والمباشر فور التخرج مية بالمية" في قطاع التربية الوطنية. تدخل تقرى وأنت علّقت منصبك ومستقبلك المادي مقفل ومحمي!</p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-clipboard-check"></i> شروط التسجيل والقبول الأساسية</h3>
    <ul>
        <li><strong>شرط السن:</strong> ألا يتجاوز سن الطالب 24 سنة على الأكثر في 31 ديسمبر 2026.</li>
        <li><strong>شرط المعدل الأدنى (للمشاركة في الترتيب):</strong> يجب أن يساوي أو يفوق المعدل العام للبكالوريا <strong>14.00/20</strong>.</li>
    </ul>
    <h4 style="margin-top: 15px; color: var(--primary-color);">التخصصات والأولويات:</h4>
    <ul>
        <li><strong>👈 التخصصات الأدبية (عربية، تاريخ وجغرافيا...):</strong> الأولوية (01) لـ شعبة آداب وفلسفة ولغات أجنبية.</li>
        <li><strong>👈 التخصصات العلمية (رياضيات، فيزياء، إعلام آلي...):</strong> الأولوية (01) لـ شعبة رياضيات وتقني رياضي.</li>
    </ul>
    <h4 style="margin-top: 15px; color: #e74c3c;">⚠️ الفخ الأكبر (المقابلة الشفوية الإقصائية):</h4>
    <p>القبول الرقمي غير نهائي. أنت مجبر لاجتياز مقابلة شفوية حضورية داخل المدرسة للتأكد من سلامة حواس النطق والسمع والبصر (لا توجد لثغة أو تأتأة)، والقدرات الجسدية والنفسية المؤهلة لمهنة أستاذ. الرسوب فيها يعني إقصاءك آلياً وتوجيهك للرغبة الموالية.</p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-chart-bar"></i> معدلات القبول التقريبية 2025</h3>
    <p>المنافسة شديدة، فرغم أن معدل الترشح هو 14.00، إلا أن معدلات القبول الفعلية تستقر غالباً بين <strong>14.80 و 15.50</strong> حسب الأماكن المتوفرة والشعبة.</p>
    <div class="acceptance-calc-wrap" style="margin-top:15px;"><a class="acceptance-calc-btn" href="/tools#weighted-calc"><i class="fas fa-calculator"></i> احسب معدلك الموزون</a></div>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-graduation-cap"></i> مدة ومسار التكوين</h3>
    <ul>
        <li><strong>الشهادة:</strong> أستاذ التعليم الثانوي لفئة الصم البكم.</li>
        <li><strong>مدة التكوين:</strong> 6 سنوات كاملة.</li>
        <li><strong>نظام الدراسة:</strong> حضوري كامل في العاصمة، يدمج بين لغة الإشارة، البيداغوجيا، والعلوم النفسية والطبية الخاصة (جذع مشترك + تخصص بيداغوجي تطبيقي).</li>
        <li><strong>التوظيف:</strong> آلي ومباشر في المؤسسات التربوية التابعة للدولة فور التخرج.</li>
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-book"></i> المواد الأساسية المدروسة</h3>
    <p>البرنامج الدراسي يعتمد على لغة الجسد والعلم العصبوني:</p>
    <ul>
        <li>🙌 <strong>لغة الإشارة:</strong> تعلم الأبجدية، القواعد، وتطوير القاموس الإشاري الجزائري والعالمي.</li>
        <li>🧠 <strong>علم النفس الخاص:</strong> سيكولوجية الطفل المعاق سمعياً وكيفية التعامل مع الأزمات النفسية.</li>
        <li>🗣️ <strong>الأرطوفونيا وعيوب النطق:</strong> دراسة مخارج الحروف، تقويم النطق، والتدريب على السمع المتبقي.</li>
        <li>🧬 <strong>البيولوجيا وتشريح الأعصاب:</strong> تشريح الأذن، فيزيولوجيا الصوت، وفهم الإعاقات المسؤولة عن الصمم.</li>
        <li>📘 <strong>البيداغوجيا العلاجية:</strong> تبسيط الدروس للطفل الأصم باستعمال الوسائل البصرية والذكية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-cogs"></i> التخصصات الـ 15 المتاحة لعام 2026</h3>
    <p>تفتح قدامك قائمة التخصصات التالية لتصبح أستاذ تعليم ثانوي للصم:</p>
    <ul>
        <li>📐 <strong>العلوم الدقيقة:</strong> رياضيات، علوم فيزيائية.</li>
        <li>💻 <strong>التكنولوجيا:</strong> إعلام آلي، هندسة كهربائية، هندسة الطرائق.</li>
        <li>🧬 <strong>العلوم الحيوية:</strong> علوم طبيعية.</li>
        <li>🎙️ <strong>اللغات والأدب:</strong> لغة عربية، فرنسية، إنجليزية، أمازيغية.</li>
        <li>📚 <strong>العلوم الإنسانية والاقتصاد:</strong> تاريخ وجغرافيا، علوم اقتصادية، علوم إسلامية.</li>
        <li>🎨 <strong>الإبداع والرياضة:</strong> تربية فنية (رسم)، تربية بدنية ورياضية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-file-contract"></i> الالتزام والتوظيف</h3>
    <ul>
        <li>💰 <strong>المنحة والدعم:</strong> يستفيد الطالب من المنحة والإقامة في العاصمة طوال 6 سنوات.</li>
        <li>🔹 <strong>عقد الالتزام القانوني:</strong> التوقيع الإجباري على عقد مع قطاع التربية الوطنية للتوظيف المباشر وفق المرسوم التنفيذي (25-54).</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-thumbs-up"></i> الإيجابيات والمميزات</h3>
    <ul>
        <li>✅ <strong>أمان وظيفي أسطوري:</strong> توظيف مضمون 100% فور التخرج.</li>
        <li>✅ <strong>برستيج أستاذ تعليم ثانوي:</strong> أعلى رتبة تدريسية براتب وتصنيف محترم جداً.</li>
        <li>✅ <strong>عمل ذو طابع إنساني:</strong> إدماج وتعليم فئة غالية وإحداث أثر عظيم في حياتهم.</li>
        <li>✅ <strong>أجواء عائلية راقية:</strong> الأقسام نخبوية والتعامل يكون في قمة الرقي الإنساني.</li>
        <li>✅ <strong>إتقان لغة جديدة:</strong> لغة الإشارة تفتح آفاقاً للعمل كمترجم رسمي.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-exclamation-circle"></i> الجوانب الصعبة والعيوب</h3>
    <ul>
        <li>❌ <strong>المدة الطويلة:</strong> 6 سنوات دراسة، أطول من المدارس العليا العادية (5 سنوات).</li>
        <li>❌ <strong>الضغط النفسي والعاطفي:</strong> التعامل مع الأطفال يتطلب طاقة عاطفية وجسدية جبارة وصبر أسطوري.</li>
        <li>❌ <strong>المقابلة الشفوية الصارمة:</strong> أي مشكل لغوي أو سمعي يعني الإقصاء الآلي.</li>
        <li>❌ <strong>الالتزام الإجباري:</strong> أنت ملزم بالتوظيف في قطاع التربية التابع للدولة وفق خططها الجغرافية.</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-lightbulb"></i> خلاصة</h3>
    <p>المدرسة العليا لأساتذة الصم البكم ببني مسوس هي "الصفقة الذكية والأقوى" لبكالوريا 2026. إذا كان معدلك العام فوق 14.00، وتملك الفصاحة والكاريزما اللغوية وحب العمل الإنساني والتربوي.. حط الكود في خياراتك! راك تضمن في مهنة وجاه وأثر طيب في الدنيا والآخرة!</p>
</div>

            </div>
        </div>

        <!-- Specialty Navigation Buttons -->
        <div class="speciality-navigation">
            <button class="nav-btn prev-btn" onclick="window.history.back()"><i class="fas fa-arrow-right"></i> العودة</button>
            <button class="nav-btn next-btn" onclick="window.location.href='/university/specialities.html'">تخصصات أخرى <i class="fas fa-arrow-left"></i></button>
        </div>

    </main>

    <div id="footer-placeholder"></div>

    <!-- Scripts -->
    <script src="/components/shared.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function () {
            loadComponent('navbar-placeholder', '/components/navbar.html', function() {
                if (typeof initNavbar === 'function') {
                    initNavbar();
                }
            });
            loadComponent('footer-placeholder', '/components/footer.html');
        });
    </script>
</body>

</html>"""

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\esesm.html"
with open(file_path, "w", encoding="utf-8") as f:
    f.write(html_content)
print("esesm.html created successfully.")

# 2. Update specialities.html
spec_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html"
with open(spec_path, "r", encoding="utf-8") as f:
    spec_content = f.read()

new_card = """  <div class="spec-card" data-category="ens" data-name="أساتذة الصم والبكم ESESM" onclick="window.location.href='/university/speciality/esesm'">
  <div class="spec-card-img"><img alt="ESESM" loading="lazy" src="/images/esesm.png"/></div>
  <div class="spec-card-body">
  <div class="spec-card-top">
  <div class="spec-card-name">المدرسة العليا لأساتذة الصم والبكم - ESESM</div>
  </div>
  <div class="spec-card-footer">
  <span class="cat-badge cat-badge--ens">المدارس العليا للأساتذة</span>
  <button class="spec-detail-btn" onclick="showSection('esesm');event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
  </div>
  </div>
  </div>"""

# Find where to insert (maybe after ENS or ENSA)
ens_idx = spec_content.find("data-name=\"ENS\"")
if ens_idx != -1:
    ens_card_end = "fa-arrow-left\"></i> التفاصيل</button>\n  </div>\n  </div>\n  </div>"
    insert_idx = spec_content.find(ens_card_end, ens_idx) + len(ens_card_end)
    spec_content = spec_content[:insert_idx] + "\n" + new_card + spec_content[insert_idx:]
    with open(spec_path, "w", encoding="utf-8") as f:
        f.write(spec_content)
    print("specialities.html updated successfully.")
else:
    print("ENS card not found.")

# 3. Update JS keywords in script.js and shared.js
script_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\script.js"
with open(script_path, "r", encoding="utf-8") as f:
    script_content = f.read()

# Insert ESESM keywords
keywords_insert = "      'ESESM': 'صم بكم أساتذة تعليم بني مسوس esesm sourds muets enseignement',\n"
match = re.search(r"var SPEC_KEYWORDS = \{", script_content)
if match:
    insert_pos = match.end() + 1
    script_content = script_content[:insert_pos] + keywords_insert + script_content[insert_pos:]
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(script_content)
    print("script.js updated.")

shared_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\components\shared.js"
with open(shared_path, "r", encoding="utf-8") as f:
    shared_content = f.read()

shared_insert = "          { title: 'ESESM - الصم والبكم', desc: 'المدرسة العليا لأساتذة الصم والبكم', url: '/university/speciality/esesm', icon: 'fas fa-hands-helping', specialty: 'المدارس العليا للأساتذة', keywords: ['ESESM', 'esesm', 'صم', 'بكم', 'أساتذة', 'تربية'] },\n"
match = re.search(r"\{ title: 'ENS - أساتذة المدرسة العليا'.*?\},", shared_content)
if match:
    insert_pos = match.end()
    shared_content = shared_content[:insert_pos] + "\n" + shared_insert + shared_content[insert_pos:]
    with open(shared_path, "w", encoding="utf-8") as f:
        f.write(shared_content)
    print("shared.js updated.")
else:
    # try just finding ENS
    match = re.search(r"\{ title: 'ENS - .*?\},", shared_content)
    if match:
        insert_pos = match.end()
        shared_content = shared_content[:insert_pos] + "\n" + shared_insert + shared_content[insert_pos:]
        with open(shared_path, "w", encoding="utf-8") as f:
            f.write(shared_content)
        print("shared.js updated.")
    else:
        print("Could not find ENS in shared.js")

