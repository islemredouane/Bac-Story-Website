import os

template = '''<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
    new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    }})(window,document,'script','dataLayer','GTM-T5H3TNJ4');</script>
    <!-- End Google Tag Manager -->
    <meta name="description" content="{desc}">
    
    <link rel="icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#1a3a8f">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="BAC STORY">    <title>{title_full} - ENS | BAC STORY</title>
    <link rel="canonical" href="https://www.bac-story.com/university/speciality/ens">
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

    <!-- Open Graph / Facebook / Social Media -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="المدارس العليا للأساتذة - ENS | BAC STORY">
    <meta property="og:description" content="{desc}">
    <meta property="og:image" content="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/og-banner.png">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="المدارس العليا للأساتذة - ENS | BAC STORY">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/og-banner.png">
</head>

<body>
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T5H3TNJ4" height="0" width="0"
            style="display:none;visibility:hidden"></iframe></noscript>

    <div id="navbar-placeholder"></div>
<div class="resource-content active" id="ENS">
<div class="container">
<div class="modern-section-header">
<h2>{title_full}</h2>
</div>
<div style="margin: 24px auto 0; text-align: center;">
<a class="search-telegram-btn floating" href="https://t.me/islembacdz" rel="noopener" target="_blank">
<i class="fab fa-telegram-plane"></i>
<span>انضم إلينا على التلغرام</span>
</a>
</div>
<div class="school-details">
<div class="details">

<div class="detail-card large-card">
    <h3><i class="{icon}"></i> {title_full}</h3>
    <p>
        <b>💡 الهدرة تاع الصح:</b> {intro}
    </p>
</div>

<div class="detail-card">
    <h3><i class="fas fa-clipboard-list"></i> شروط التسجيل والقبول الأساسية</h3>
    <ul>
        <li><b>⚠️ معدل الترشح الأدنى:</b> {min_avg}</li>
        <li><b>🎯 نظام الأولويات:</b> {priorities_intro}
            <ul>
                {priorities}
            </ul>
        </li>
        <li><b>🗣️ المقابلة الشفوية / شروط أخرى:</b> {interview}</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-graduation-cap"></i> مدة ومسار التكوين بالتفصيل</h3>
    <ul>
        <li><b>الشهادة المحصل عليها:</b> {title_full}</li>
        <li><b>مدة التكوين الكلية:</b> 5 سنوات كاملة</li>
        <li><b>طبيعة ونمط التعليم:</b> {education_type}</li>
        <li><b>الوضعية المهنية فور التخرج:</b> {career}</li>
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-book-open"></i> المواد الأساسية المدروسة</h3>
    <ul>
        {subjects}
    </ul>
</div>

<div class="detail-card large-card">
    <h3><i class="fas fa-chart-bar"></i> القائمة الشاملة لمعدلات القبول الرسمية لعام 2025 لكل الولايات</h3>
    <p>
        <b>📌 ملاحظة حول الفرز لعام 2025:</b> {table_desc}
    </p>
    <div class="table-container">
        <table class="styled-table">
            <thead>
                <tr>
                    {table_headers}
                </tr>
            </thead>
            <tbody>
{table_rows}
            </tbody>
        </table>
    </div>
</div>

<div class="detail-card">
    <h3><i class="fas fa-comments"></i> آراء وتجارب الطلاب (Feedback الحقيقي)</h3>
    <ul>
        {feedback}
    </ul>
</div>

<div class="detail-card">
    <h3><i class="fas fa-thumbs-up"></i> المميزات والعيوب</h3>
    <div class="pros-cons">
        <div class="pros">
            <h5>المميزات:</h5>
            <ul>
                <li>✅ {pros}</li>
            </ul>
        </div>
        <div class="cons">
            <h5>العيوب:</h5>
            <ul>
                <li>❌ {cons}</li>
            </ul>
        </div>
    </div>
</div>

</div>
</div>
</div>
</div>
<div id="global-cta-placeholder"></div>

    <div id="footer-placeholder"></div>
    <script src="/ads-config.js?v=1.9"></script>
    <script src="/components/shared.js?v=8.8"></script>
    <script src="/script.js?v=7.8"></script>
    <script>
    (function () {{
        const NON_SHARE = new Set(['averages-of-acceptance', 'ministry-guide']);
        function buildShareBtn() {{
            if (document.getElementById('uniShareBtn')) return;
            const btn = document.createElement('button');
            btn.id = 'uniShareBtn';
            btn.className = 'uni-share-btn';
            btn.setAttribute('data-tooltip', 'مشاركة الصفحة');
            btn.innerHTML = '<i class="fas fa-share"></i>';
            btn.addEventListener('click', handleShare);
            document.body.appendChild(btn);
        }}
        function handleShare() {{
            const url = location.href;
            const title = document.title;
            if (navigator.share) {{
                navigator.share({{ title, url }}).catch(() => {{}});
            }} else {{
                navigator.clipboard.writeText(url).then(() => showToast('تم نسخ الرابط ✓')).catch(() => {{}});
            }}
        }}
        function showToast(msg) {{
            let t = document.getElementById('uniShareToast');
            if (!t) {{
                t = document.createElement('div');
                t.id = 'uniShareToast';
                t.className = 'uni-share-toast';
                document.body.appendChild(t);
            }}
            t.textContent = msg;
            t.classList.add('visible');
            clearTimeout(t._timer);
            t._timer = setTimeout(() => t.classList.remove('visible'), 2200);
        }}
        function updateShareBtn(sectionId) {{
            const btn = document.getElementById('uniShareBtn');
            if (!btn) return;
            const shareable = sectionId && !NON_SHARE.has(sectionId);
            btn.classList.toggle('visible', shareable);
        }}
        window.addEventListener('load', function () {{
            buildShareBtn();
            const orig = window.showSection;
            window.showSection = function (id, push) {{
                const result = orig ? orig(id, push) : undefined;
                updateShareBtn(id);
                return result;
            }};
            const initial = location.hash.slice(1) || 'university-system';
            updateShareBtn(initial);
        }});
    }})();
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
    <script defer src="/_vercel/speed-insights/script.js"></script>
</body>

</html>'''

specialities = [
    {
        'id': 'ens-info-moyen',
        'title_short': 'الإعلام الآلي',
        'title_full': 'أستاذ التعليم المتوسط في الإعلام الآلي',
        'code': 'C01PML01',
        'icon': 'fas fa-laptop-code',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في الإعلام الآلي بالمدارس العليا للأساتذة (ENS).',
        'intro': 'تخصص الإعلام الآلي في الطور المتوسط هو التخصص الأكثر مواكبة للمستقبل الرقمي! إذا كنت تعشق البرمجة، الخوارزميات، وحاب تدي دبلوم أستاذ مضمون التوظيف 100% مورا الباك بريتم قراية مودرن يجمع بين المنطق التكنولوجي والتربوي، هادا هو الخيار التوب. بصح وجد روحك لمنافسة شرسة ومعدلات قبول قفزت بزاف في السنوات الأخيرة!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'الترتيب وطني تنازلي بناءً على المعدل العام للباك مباشرة:',
        'priorities': '<li>🥇 الأولوية 01: شعبة رياضيات + شعبة تقني رياضي.</li><li>🥈 الأولوية 02: شعبة علوم تجريبية.</li>',
        'interview': 'إجبارية وإقصائية للتأكد من طلاقة التواصل والجاهزية النفسية والبدنية.',
        'education_type': 'حضوري مدمج بين الدروس النظرية والتطبيق البرمجي في المخابر والتربصات.',
        'career': 'توظيف وتعيين رسمي فوري كـ أستاذ مرسم تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>💻 الإعلام الآلي الأكاديمي:</b> الخوارزميات وبنية المعطيات (Algorithms)، لغات البرمجة (C++/Pascal)، بنية الحواسيب (Architecture)، وتكنولوجيا الويب والشبكات.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة وطرق التدريس الرقمية، علم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج الفرز للمرحلة الأولى حسب الملحقات والولايات المتاحة:',
        'table_headers': '<th>المدرسة الحاضنة للتكوين</th><th>الولاية المستهدفة (حسب الباك)</th><th>معدل الأولوية 1 (Min1)</th><th>معدل الأولوية 2 (Min2)</th>',
        'table_rows': '''                                <tr><td>ملحقة تلمسان (ENS وهران)</td><td>🛢️ تلمسان (TLEMCEN)</td><td>17.10</td><td>15.95</td></tr>
                                <tr><td>ملحقة تلمسان (ENS وهران)</td><td>🏗️ الشلف (CHLEF)</td><td>14.48</td><td>15.10</td></tr>
                                <tr><td>ملحقة تلمسان (ENS وهران)</td><td>🌊 وهران (ORAN)</td><td>14.25</td><td>14.28</td></tr>
                                <tr><td>ملحقة تلمسان (ENS وهران)</td><td>🏜️ أدرار (ADRAR)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>ملحقة تلمسان (ENS وهران)</td><td>📍 النعامة (NAAMA)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>ملحقة تلمسان (ENS وهران)</td><td>📍 عين تموشنت (AIN-TEMOUCHENT)</td><td>14.98</td><td>--</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة)</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.75</td><td>14.76</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة)</td><td>🐫 الجلفة (DJELFA)</td><td>15.95</td><td>--</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة)</td><td>🍇 المدية (MEDEA)</td><td>14.50</td><td>--</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة)</td><td>🏭 المسيلة (MSILA)</td><td>15.23</td><td>--</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة)</td><td>🐎 تيسيملسيلت (TISSEMSILT)</td><td>--</td><td>16.15</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة)</td><td>📍 عين الدفلى (AIN-DEFLA)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة)</td><td>📍 غرداية (GHARDAIA)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>ملحقة جيجل (ENS قسنطينة)</td><td>🏔️ بجاية (BEJAIA)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>ملحقة جيجل (ENS قسنطينة)</td><td>🗺️ جيجل (JIJEL)</td><td>15.07</td><td>15.75</td></tr>
                                <tr><td>ملحقة جيجل (ENS قسنطينة)</td><td>🏭 سطيف (SETIF)</td><td>14.81</td><td>15.53</td></tr>
                                <tr><td>ملحقة جيجل (ENS قسنطينة)</td><td>📍 ميلة (MILA)</td><td>15.95</td><td>--</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> تخصص ممتع ومطلوب بقوة، يبتعد عن الرتابة والحفظ الجاف، ويمنحك فرصة ممتازة للعمل الموازي الحر (Freelancing) كـ مبرمج أو مطور ويب في وقت فراغك.</li><li>🔴 <b>السلبيات:</b> يتطلب تفكيراً منطقياً رياضياً عالياً جداً، والمخابر تحتاج حضوراً وانضباطاً صارماً طوال أيام السمانة بدون أي تهاون.</li>',
        'pros': 'تخصص ممتع ومطلوب بقوة وفرصة ممتازة للعمل الموازي الحر.',
        'cons': 'تفكير رياضي منطقي عالي ومخابر تحتاج انضباطاً صارماً.'
    },
    {
        'id': 'ens-sport-moyen',
        'title_short': 'التربية البدنية والرياضية',
        'title_full': 'أستاذ التعليم المتوسط في التربية البدنية والرياضية',
        'code': 'J00PML01',
        'icon': 'fas fa-running',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في التربية البدنية والرياضية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'الحيوية، النشاط، والابتعاد التام عن روتين قاعات التدريس والمكاتب المغلقة! بعد التوجه الإستراتيجي الجديد لعصرنة حصص الرياضة وتخريج أساتذة متخصصين، عاد هاد التخصص هو الخيار الأجمل للطلبة لي يكرهوا الحفظ ويحبوا الحركة. نهار تدخل تقرى، راك ضمنت منصبك ديريكت في متوسطات ولايتك فور تخرجك ببرستيج محترم وراتب مستقر!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'التخصص يتميز بمرونة أسطورية؛ حيث أن جميع شعب البكالوريا لها نفس الأولوية والترتيب كليّاً، والفرز تنازلي حسب المعدل العام مباشرة.',
        'priorities': '<li>✅ أولوية موحدة لجميع الشعب.</li>',
        'interview': 'شهادة طبية إجبارية. رياضيو النخبة يسجلون بدون شرط المعدل. مقابلة شفوية إجبارية وإقصائية للتأكد من الهندام والجاهزية الجسدية والنفسية.',
        'education_type': 'حضوري مدمج بين الدروس النظرية الأكاديمية والتطبيق الحركي في الملاعب والساحات.',
        'career': 'تعيين وتوظيف تلقائي مباشر كـ أستاذ مرسم تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>🦴 العلوم البيولوجية والرياضية:</b> تشريح جسم الإنسان (Anatomie)، فيزيولوجيا الجهد البدني للمراهقين، قوانين الألعاب الجماعية والفردية، والإسعافات الأولية لإصابات الملاعب (Secourisme).</li><li><b>⚙️ العلوم التربوية:</b> بيداغوجيا التدريس الحركي وتنظيم الحصص الرياضية المدرسية، وعلم النفس الرياضي والتربوي.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج الفرز للمرحلة الأولى حسب الملحقات والولايات المتاحة للشعب بالتساوي:',
        'table_headers': '<th>المدرسة / الملحقة الحاضنة للتكوين</th><th>الولاية التابعة (حسب الباك)</th><th>معدل القبول الموحد لجميع الشعب (Min1/Min2)</th>',
        'table_rows': '''                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🏗️ الشلف (CHLEF)</td><td>15.00</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🏜️ أدرار (ADRAR)</td><td>13.17</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>⛰️ بشار (BECHAR)</td><td>13.12</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🍊 البليدة (BLIDA)</td><td>12.41</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🛢️ تلمسان (TLEMCEN)</td><td>14.49</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🤠 سعيدة (SAIDA)</td><td>14.15</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🍇 بلعباس (SIDI BEL ABBES)</td><td>15.32</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🌊 مستغانم (MOSTAGANEM)</td><td>14.42</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🪵 معسكر (MASCARA)</td><td>15.27</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🌊 وهران (ORAN)</td><td>13.32</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>🌾 البيض (EL BAYADH)</td><td>14.73</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>📍 عين الدفلى (AIN-DEFLA)</td><td>14.57</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>📍 النعامة (NAAMA)</td><td>14.26</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>📍 عين تموشنت (AIN-TEMOUCHENT)</td><td>14.25</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>📍 غليزان (RELIZANE)</td><td>14.99</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم - B05)</td><td>📍 بني عباس (BENI ABBES)</td><td>12.71</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.00</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>🪵 البويرة (BOUIRA)</td><td>13.42</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>🐎 تيارت (TIARET)</td><td>15.53</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>🐫 الجلفة (DJELFA)</td><td>15.36</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>🍇 المدية (MEDEA)</td><td>14.75</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>🛢️ ورقلة (OUARGLA)</td><td>12.77</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>🐎 تيسيملسيلت (TISSEMSILT)</td><td>15.23</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>🌵 غرداية (GHARDAIA)</td><td>13.15</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>📍 أولاد جلال (OULED DJELLAL)</td><td>14.09</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>📍 توقرت (TOUGGOURT)</td><td>12.93</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة - B06)</td><td>📍 المنيعة (EL MENIAA)</td><td>14.25</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>⛰️ تمنراست (TAMANRASSET)</td><td>11.68</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>🌴 تيزي وزو (TIZI-OUZOU)</td><td>13.56</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>🇩🇿 العاصمة (ALGER)</td><td>13.83</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>🏜️ إليزي (ILLIZI)</td><td>12.48</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 بومرداس (BOUMERDES)</td><td>13.77</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 تندوف (TINDOUF)</td><td>13.11</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 تيبازة (TIPAZA)</td><td>14.86</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 تيميمون (TIMIMOUN)</td><td>14.51</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 إن صالح (IN SALAH)</td><td>12.64</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 إن قزام (IN GUEZZAM)</td><td>11.15</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 جانت (DJANET)</td><td>10.00</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 برج باجي مختار (B.B.MOKHTAR)</td><td>NC</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> القراية ممتعة، كلها حركة ونشاط وتبتعد تماماً على الحفظ الروتيني الجاف، وجو التنافس الرياضي بين الطلبة ممتاز ويطلع المعنويات.</li><li>🔴 <b>السلبيات:</b> الجهد البدني مكثف طوال السمانة، الخرجات للملاعب في عز البرد أو الصيف تطلب صبر وقوة تحمل كبيرة، وسيستم الحضور إجباري 100%.</li>',
        'pros': 'كلها حركة ونشاط، منصب مضمون في المتوسطات.',
        'cons': 'الجهد البدني مكثف والحضور إجباري ولا تهاون في الانضباط.'
    },
    {
        'id': 'ens-music-moyen',
        'title_short': 'التربية الموسيقية',
        'title_full': 'أستاذ التعليم المتوسط في التربية الموسيقية',
        'code': 'K00PMN01',
        'icon': 'fas fa-music',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في الموسيقى والتربية الموسيقية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'الموهبة، الفن، وقراءة النوتات العالمية! التخصص هادا مخصص للطلبة لي عندهم أذن موسيقية وحابين يدمجوا الفن مع التدريس البيداغوجي لضمان منصب عمل مستقر وقّار فور التخرج من غير مسابقات ولا انتظار. التكوين نوعي وراقي جداً، بصح يطلب موهبة حقيقية في العزف وفهم النظريات الموسيقية المعقدة!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'الترتيب وطني تنازلي بناءً على المعدل العام للباك مباشرة:',
        'priorities': '<li>🥇 الأولوية 01: شعبة الفنون.</li><li>🥈 الأولوية 02: جميع شعب البكالوريا الأخرى بالتساوي.</li>',
        'interview': 'إجبارية وإقصائية؛ حيث يتم اختبار الحس الموسيقي، سلامة السمع، القدرة الصوتية والنطق والجاهزية للتعليم.',
        'education_type': 'حضوري مدمج بين الدروس النظرية الأكاديمية والتدريب التطبيقي على الآلات والتربصات.',
        'career': 'توظيف مباشر وتلقائي في المنشآت التربوية التابعة لوزارة التربية الوطنية.',
        'subjects': '<li><b>🎶 الموسيقى الأكاديمية:</b> الصولفيج وقراءة النوتة الموسيقية، تاريخ الموسيقى العالمية والجزائرية، التدريب على الآلات (البيانو، العود، الغيتار)، علم الصوتيات، وإدارة الأناشيد المدرسية.</li><li><b>⚙️ العلوم التربوية:</b> بيداغوجيا التدريس الموسيقي، علم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج الفرز للمرحلة الأولى للنخبة تحت الأولوية الثانية (Min2):',
        'table_headers': '<th>المدرسة الحاضنة للتكوين</th><th>الولاية المستهدفة (حسب الباك)</th><th>معدل الأولوية 2 (Min2)</th>',
        'table_rows': '''                                <tr><td>ENS القبة (C09)</td><td>🇩🇿 الجزائر العاصمة (ALGER)</td><td>14.41</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🪵 باتنة (BATNA)</td><td>15.16</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🛢️ تلمسان (TLEMCEN)</td><td>15.33</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🐎 تيارت (TIARET)</td><td>15.47</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🍇 المدية (MEDEA)</td><td>15.47</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 غليزان (RELIZANE)</td><td>15.08</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🐫 الجلفة (DJELFA)</td><td>14.18</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🏭 أم البواقي (OUM EL BOUAGHI)</td><td>14.50</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🏔️ بجاية (BEJAIA)</td><td>12.77</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🌴 بسكرة (BISKRA)</td><td>13.03</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>⛰️ بشار (BECHAR)</td><td>12.17</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🍊 البليدة (BLIDA)</td><td>13.98</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🪵 البويرة (BOUIRA)</td><td>13.64</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>⛰️ تمنراست (TAMANRASSET)</td><td>11.41</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>⛏️ تبسة (TEBESSA)</td><td>13.87</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🏭 سطيف (SETIF)</td><td>13.83</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🤠 سعيدة (SAIDA)</td><td>14.68</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>⛏️ سكيكدة (SKIKDA)</td><td>13.75</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🍇 بلعباس (SIDI BEL ABBES)</td><td>13.72</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🛢️ غلما (GUELMA)</td><td>14.04</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>💎 قسنطينة (CONSTANTINE)</td><td>13.79</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🌊 مستغانم (MOSTAGANEM)</td><td>13.77</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🏭 المسيلة (MSILA)</td><td>14.38</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🪵 معسكر (MASCARA)</td><td>14.70</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🌊 Oran (ORAN)</td><td>14.60</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🌾 البيض (EL BAYADH)</td><td>14.32</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🏗️ برج بوعريريج (B.B.ARRERIDJ)</td><td>14.26</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 بومرداس (BOUMERDES)</td><td>13.91</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 تندوف (TINDOUF)</td><td>12.80</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>🐎 تيسيملسيلت (TISSEMSILT)</td><td>16.15</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 أولاد جلال (OULED DJELLAL)</td><td>13.63</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 خنشلة (KHENCHLA)</td><td>13.93</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 سوق أهراس (SOUK-AHRAS)</td><td>14.28</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 تيبازة (TIPAZA)</td><td>13.86</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 ميلة (MILA)</td><td>14.83</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 عين الدفلى (AIN-DEFLA)</td><td>14.95</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 المنيعة (EL MENIAA)</td><td>12.70</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 الوادي (EL OUED)</td><td>13.39</td></tr>
                                <tr><td>ENS القبة (C09)</td><td>📍 تيميمون (TIMIMOUN)</td><td>12.12</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> تخصص رائع يبتعد تماماً على الملل والحفظ، جو عائلي في الدراسة، وتطوير أسطوري لموهبتك الفنية مع ضمان الوظيفة القارة مورا التخرج.</li><li>🔴 <b>السلبيات:</b> يتطلب تدريباً متواصلاً على الآلات وقراءة النوتات، ونظام الحضور صارم جداً مكاش التهاون البيداغوجي.</li><li class="highlight-text">بقية الولايات (مثل تيزي وزو وجيجل وعنابة وورقلة وإليزي...) ظهرت برمز NC (غير مشبعة) أو تم تدوير مقاعدها للمرحلة الثانية.</li>',
        'pros': 'جو عائلي في الدراسة، تطوير أسطوري للموهبة، منصب قّار مضمون.',
        'cons': 'حضور صارم وتدريب متواصل على الآلات.'
    },
    {
        'id': 'ens-art-moyen',
        'title_short': 'التربية الفنية',
        'title_full': 'أستاذ التعليم المتوسط في الرسم والتربية الفنية',
        'code': 'K00PML01',
        'icon': 'fas fa-palette',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في الرسم بالمدارس العليا للأساتذة (ENS).',
        'intro': 'إطلاق العنان للإبداع والريشة الفنية وتجسيد الخيال! التخصص هادا ممتاز جداً للطلبة لي يملكوا لمسة فنية وحابين يضمنوا منصب عمل قّار ومستقر من نهار الباك برتبة محترمة في المتوسطات. التكوين ممتع ويركز على الميدان الفني التشكيلي والبصري وعصرنة الأفكار!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'الترتيب وطني تنازلي بناءً على المعدل العام للباك مباشرة:',
        'priorities': '<li>🥇 الأولوية 01: شعبة الفنون.</li><li>🥈 الأولوية 02: جميع شعب البكالوريا الأخرى بالتساوي.</li>',
        'interview': 'إجبارية وإقصائية للتأكد من المظهر الفني، سلامة النطق والحواس، والجاهزية النفسية والبدنية.',
        'education_type': 'حضوري ونظري وتطبيقي مكثف يركز على الورشات التشكيلية والتربصات في المتوسطات.',
        'career': 'توظيف مباشر آلي كـ أستاذ مرسم تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>🎨 الفنون التشكيلية والبصرية:</b> مبادئ الرسم الحر والمنظور الهندسي، تاريخ الفنون التشكيلية والعالمية، تقنيات الألوان (الزيتية والمائية)، النحت، والتصميم الغرافيكي وصناعة المحتوى الرقمي الفني.</li><li><b>⚙️ العلوم التربوية:</b> بيداغوجيا التدريس الفني، علم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'خضعت التصفية لنظام الكوطة الولائية الفرعية التنازلية لأصحاب الأولوية الثانية، واستقرت المعدلات الفعلية إجمالاً بين 14.10 و 14.80 (تظهر كـ NC في بعض الولايات والملحقات لعدم بلوغ حد الإشباع الكامل في المرحلة الأولى).',
        'table_headers': '<th>ملاحظة عامة</th><th>المعدلات الفعلية</th>',
        'table_rows': '<tr><td>المعدلات تتراوح عموماً للقبول</td><td>14.10 - 14.80</td></tr><tr><td>الولايات غير المشبعة</td><td>NC</td></tr>',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> عالم مليء بالإبداع والراحة النفسية، غياب الروتين الأكاديمي الكلاسيكي الجاف، وضمان التوظيف المستقر مورا التخرج.</li><li>🔴 <b>السلبيات:</b> المصاريف مكلفة نوعاً ما؛ لأن الطالب مطالب بتوفير أدوات ومستلزمات الرسم والألوان طوال سنوات الدراسة، ونظام غيابات صارم.</li>',
        'pros': 'عالم إبداعي بعيد عن الروتين الأكاديمي، توظيف مستقر.',
        'cons': 'مصاريف الأدوات الفنية مكلفة، ونظام غيابات صارم.'
    },
    {
        'id': 'ens-islamic-moyen',
        'title_short': 'التربية الإسلامية',
        'title_full': 'أستاذ التعليم المتوسط في التربية الإسلامية',
        'code': 'I02PML01',
        'icon': 'fas fa-mosque',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في التربية الإسلامية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'نبل الرسالة والأثر الطيب المعمق! التخصص هادا مديور للنخبة لي تحب العلوم الشرعية والفقه وحابة تضمن مستقبلاً وظيفياً ثابتاً ومستقراً من نهار الباك ديريكت برتبة محترمة ومكانة اجتماعية قوية في قطاع التربية. السيستم يخرجك إطار تربوي متمكن قادر يوجه سلوكيات وعقول المراهقين.',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'الترتيب وطني تنازلي بناءً على المعدل العام للباك مباشرة:',
        'priorities': '<li>🥇 الأولوية 01: شعبة آداب وفلسفة + شعبة لغات أجنبية.</li><li>🥈 الأولوية 02: شعب علوم تجريبية + رياضيات + تقني رياضي.</li>',
        'interview': 'إجبارية وإقصائية للتأكد من فصاحة اللسان التامة (غياب اللثغات والتأتأة)، الالتزام والاتزان النفسي البيداغوجي.',
        'education_type': 'حضوري وأكاديمي معمق يجمع بين العلوم الشرعية والبيداغوجيا والتربصات الميدانية.',
        'career': 'تعيين وتوظيف تلقائي مباشر كـ أستاذ مرسم تابع للدولة.',
        'subjects': '<li><b>🕌 العلوم الإسلامية والشرعية:</b> علوم القرآن الكريم والتفسير، فقه العبادات والمعاملات، السيرة النبوية المعمقة، العقيدة الإسلامية، ومقاصد الشريعة والتربية الأخلاقية.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة وطرق التدريس الحديثة، علم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'خضعت لفرز ولائي فرعي تنازلي مدروس، واستقرت معدلات القبول الفعلية الكلية في النطاق الآمن لأصحاب الأولوية الأولى بين 13.80 و 14.50 حسب كثافة المتنافسين في كُل ولاية (تظهر كـ NC في بعض الولايات والملحقات لعدم بلوغ حد الإشباع العددي).',
        'table_headers': '<th>ملاحظة عامة</th><th>المعدلات الفعلية</th>',
        'table_rows': '<tr><td>معدلات القبول للأولوية الأولى</td><td>13.80 - 14.50</td></tr><tr><td>الولايات غير المشبعة</td><td>NC</td></tr>',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> الأمان الوظيفي المطلق، المعاملة الراقية جداً والنخبوية داخل أسوار المدرسة العليا، والأثر الإنساني والنبيل الكبير للرسالة التربوية.</li><li>🔴 <b>السلبيات:</b> يتطلب دقة شديدة وحفظاً متقناً للآيات والأحاديث النبوية والشواهد الفقهية المستعملة بيداغوجياً، ونظام حضور وغيابات صارم جداً بلا تهاون.</li>',
        'pros': 'أثر إنساني عظيم، أمان وظيفي مطلق، ومعاملة راقية.',
        'cons': 'حفظ دقيق للآيات والشواهد، وحضور صارم.'
    },
    {
        'id': 'ens-tamazight-moyen',
        'title_short': 'اللغة الأمازيغية',
        'title_full': 'أستاذ التعليم المتوسط في اللغة الأمازيغية',
        'code': 'M00PMN01',
        'icon': 'fas fa-language',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في اللغة الأمازيغية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'عمق الهوية الوطنية، فقه اللغة، والتميز اللغوي النادر! تخصص الأمازيغية متوسط في الـ ENS هو واحد من أذكياء الخيارات؛ لأنه يمنح الطلاب من كاع الشعب (علميين وأدبيين) نفس الفرصة والحظوظ للقبول من نهار الباك. التكوين معمق وأكاديمي يفتح لك منصب عمل مرسم ومستقر فور تخرجك ديريكت بعيداً على روتين لافاك والانتظار!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'يتميز التخصص بميزة فريدة؛ حيث أن جميع شعب البكالوريا لها نفس الأولوية والترتيب كليّاً. والفرز التنازلي يتم بناءً على المعدل العام للبكالوريا مباشرة.',
        'priorities': '<li>✅ أولوية موحدة لجميع الشعب.</li>',
        'interview': 'إجبارية وإقصائية للتأكد من فصاحة النطق، سلامة الحواس، والجاهزية النفسية والبدنية للتعليم.',
        'education_type': 'حضوري وأكاديمي معمق يركز على اللسانيات والأدب والبيداغوجيا والتربصات الميدانية.',
        'career': 'توظيف مباشر وتلقائي بصفة رسمية في قطاع التربية الوطنية.',
        'subjects': '<li><b>♓ الأكاديمية اللغوية:</b> كتابة تيفيناغ وقواعدها المعمقة (Grammaire/Syntaxe)، دراسة اللسانيات ومتغيرات اللغة (القبائلية، الشاوية، المزابية، التارقية...)، ودراسة تاريخ الأدب والمأثورات الشعبية والشعر الأمازيغي.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة وطرق التدريس الحديثة، وعلم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج الفرز الموحد لجميع الشعب لملحقة تيزي وزو - ENS بوزريعة:',
        'table_headers': '<th>الولاية التابعة (حسب الباك)</th><th>معدل القبول الموحد لجميع الشعب (Min1/Min2)</th>',
        'table_rows': '''                                <tr><td>🪵 باتنة (BATNA)</td><td>15.47</td></tr>
                                <tr><td>📍 عين الدفلى (AIN-DEFLA)</td><td>14.38</td></tr>
                                <tr><td>📍 بومرداس (BOUMERDES)</td><td>14.81</td></tr>
                                <tr><td>📍 غليزان (RELIZANE)</td><td>14.52</td></tr>
                                <tr><td>🍇 المدية (MEDEA)</td><td>15.11</td></tr>
                                <tr><td>🏭 المسيلة (MSILA)</td><td>14.18</td></tr>
                                <tr><td>🏗️ الشلف (CHLEF)</td><td>12.81</td></tr>
                                <tr><td>🪵 البويرة (BOUIRA)</td><td>13.30</td></tr>
                                <tr><td>🏔️ بجاية (BEJAIA)</td><td>13.78</td></tr>
                                <tr><td>🏗️ برج بوعريريج (B.B.ARRERIDJ)</td><td>14.03</td></tr>
                                <tr><td>🌴 بسكرة (BISKRA)</td><td>13.67</td></tr>
                                <tr><td>🐫 الجلفة (DJELFA)</td><td>13.76</td></tr>
                                <tr><td>🗺️ جيجل (JIJEL)</td><td>13.79</td></tr>
                                <tr><td>🏭 سطيف (SETIF)</td><td>13.97</td></tr>
                                <tr><td>🤠 سعيدة (SAIDA)</td><td>13.05</td></tr>
                                <tr><td>🍇 بلعباس (SIDI BEL ABBES)</td><td>12.23</td></tr>
                                <tr><td>🌊 وهران (ORAN)</td><td>11.67</td></tr>
                                <tr><td>🌾 البيض (EL BAYADH)</td><td>12.96</td></tr>
                                <tr><td>🪵 معسكر (MASCARA)</td><td>13.64</td></tr>
                                <tr><td>🌊 مستغانم (MOSTAGANEM)</td><td>12.98</td></tr>
                                <tr><td>🕌 الأغواط (LAGHOUAT)</td><td>13.02</td></tr>
                                <tr><td>🏭 أم البواقي (OUM EL BOUAGHI)</td><td>13.80</td></tr>
                                <tr><td>⛏️ تبسة (TEBESSA)</td><td>13.77</td></tr>
                                <tr><td>🍇 تيزي وزو (TIZI-OUZOU)</td><td>13.05</td></tr>
                                <tr><td>⛰️ تمنراست (TAMANRASSET)</td><td>10.13</td></tr>
                                <tr><td>⛰️ بشار (BECHAR)</td><td>13.07</td></tr>
                                <tr><td>🐎 تيسيملسيلت (TISSEMSILT)</td><td>13.64</td></tr>
                                <tr><td>📍 خنشلة (KHENCHLA)</td><td>13.73</td></tr>
                                <tr><td>📍 ميلة (MILA)</td><td>14.40</td></tr>
                                <tr><td>📍 تيبازة (TIPAZA)</td><td>13.46</td></tr>
                                <tr><td>📍 تندوف (TINDOUF)</td><td>10.00</td></tr>
                                <tr><td>📍 أولاد جلال (OULED DJELLAL)</td><td>14.09</td></tr>
                                <tr><td>📍 بني عباس (BENI ABBES)</td><td>10.85</td></tr>
                                <tr><td>📍 المنيعة (EL MENIAA)</td><td>14.25</td></tr>
                                <tr><td>📍 النعامة (NAAMA)</td><td>13.80</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> سيستم توظيف آلي مريح جداً، تساوي الحظوظ الكامل لجميع شعب الباك في القبول، والبيئة البيداغوجية نخبوية وعائلية وممتازة للتفوق والبرستيج الاجتماعي.</li><li>🔴 <b>السلبيات:</b> تطلب مجهوداً في البداية لحفظ وضبط تيفيناغ والقواعد اللسانية الخاصة، ونظام غيابات صارم جداً لا يرحم الكسل.</li><li class="highlight-text">بقية الولايات ظهرت برمز NC (غير مشبعة) أو تم تدويرها للمرحلة الثانية لعدم بلوغ حد الإشباع الكامل.</li>',
        'pros': 'توظيف آلي، حظوظ متساوية، بيئة بيداغوجية نخبوية.',
        'cons': 'جهد في حفظ تيفيناغ، نظام غيابات صارم.'
    }
]

import pathlib
for spec in specialities:
    html = template.format(**spec)
    path = os.path.join('university', 'speciality', spec['id'] + '.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Created {path}')
