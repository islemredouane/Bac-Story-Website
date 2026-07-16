import os

# Base template for the HTML files matching ens-francais.html structure
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
        <li><b>⚠️ معدل الترشح الأدنى:</b> لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.</li>
        <li><b>🎯 نظام الأولويات:</b> الترتيب وطني تنازلي بناءً على المعدل العام للباك مباشرة:
            <ul>
                {priorities}
            </ul>
        </li>
        <li><b>🗣️ المقابلة الشفوية:</b> {interview}</li>
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
        <b>📌 ملاحظة حول الفرز لعام 2025:</b> إليك البيانات الدقيقة والمؤكدة من السجل الرسمي لعام 2025:
    </p>
    <div class="table-container">
        <table class="styled-table">
            <thead>
                <tr>
                    <th>المدرسة الحاضنة للتكوين</th>
                    <th>الولاية المستهدفة (حسب الباك)</th>
                    <th>معدل الأولوية 1 (Min1)</th>
                    <th>معدل الأولوية 2 (Min2)</th>
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
        // Sections that are NOT shareable (main nav sections)
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

        // Hook into showSection after scripts load
        window.addEventListener('load', function () {{
            buildShareBtn();
            // Intercept showSection
            const orig = window.showSection;
            window.showSection = function (id, push) {{
                const result = orig ? orig(id, push) : undefined;
                updateShareBtn(id);
                return result;
            }};
            // Set initial state from current hash
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
        'id': 'ens-math-moyen',
        'title_short': 'الرياضيات',
        'title_full': 'أستاذ التعليم المتوسط في الرياضيات',
        'code': 'C02PML01',
        'icon': 'fas fa-square-root-alt',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في الرياضيات بالمدارس العليا للأساتذة (ENS). شروط القبول، التكوين، والآفاق.',
        'intro': 'تخصص الماط متوسط في المدرسة العليا هو مصنع العباقرة! إذا كنت تعشق الحلول والتحليل الرياضي وحاب تضمن وظيفة قارة مورا الباك براتب محترم وريتم مريح، هادا هو الخيار التوب. السيستم يخرجك أستاذ متمكن من تسيير عقول المراهقين وبناء قاعدتهم الحسابية. بصح وجد روحك لقراية قاصحة تبلع كاع الوقت وتطلب السهر والانضباط!',
        'priorities': '<li>🥇 الأولوية 01: شعبة رياضيات + شعبة تقني رياضي.</li><li>🥈 الأولوية 02: شعبة علوم تجريبية.</li>',
        'interview': 'إجبارية وإقصائية للتأكد من فصاحة النطق، الهندام، والجاهزية النفسية والبدنية.',
        'education_type': 'حضوري ونظري مكثف داخل أسوار المدرسة مع تربصات تطبيقية في المتوسطات.',
        'career': 'توظيف مباشر وتلقائي في المؤسسات التربوية التابعة لوزارة التربية الوطنية.',
        'subjects': '<li><b>📐 الرياضيات الأكاديمية:</b> الجبر الخطي والمجرد (Algèbre)، التحليل الرياضي المعمق (Analyse)، الهندسة الإقليدية، والإحصاء والاحتمالات.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك ومناهج تدريس الرياضيات، علم النفس التربوي والطفلي، وتسيير الأقسام.</li>',
        'table_rows': '''                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🏗️ الشلف (CHLEF)</td><td>14.69</td><td>15.39</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🐎 تيسمسيلت (TISSEMSILT)</td><td>15.11</td><td>16.28</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.02</td><td>14.70</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🐎 تيارت (TIARET)</td><td>14.86</td><td>15.64</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🐫 الجلفة (DJELFA)</td><td>14.05</td><td>14.75</td></tr>
                                <tr><td>ملحقة بجاية (ENS سطيف)</td><td>🏔️ بجاية (BEJAIA)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>ملحقة بجاية (ENS سطيف)</td><td>🪵 البويرة (BOUIRA)</td><td>14.11</td><td>14.48</td></tr>
                                <tr><td>ملحقة بجاية (ENS سطيف)</td><td>🍇 تيزي وزو (TIZI-OUZOU)</td><td>NC</td><td>NC</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> النخبوية التامة في التعامل البيداغوجي، الأمان الوظيفي المطلق مورا التخرج.</li><li>🔴 <b>السلبيات:</b> البروغروم مشحون بزاف وصعب، ويتطلب حلاً مستمراً للمسائل والتمارين المعقدة طوال السمانة بلا غيابات.</li>',
        'pros': 'منصب عمل مضمون، وشهادة محترمة جداً في السلم الوظيفي للدولة.',
        'cons': 'نظام الغيابات والحضور حديدي وصارم جداً، مكاش التهاون البيداغوجي.'
    },
    {
        'id': 'ens-physics-moyen',
        'title_short': 'الفيزياء والتكنولوجيا',
        'title_full': 'أستاذ التعليم المتوسط في العلوم الفيزيائية والتكنولوجيا',
        'code': 'B00PML01',
        'icon': 'fas fa-atom',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في العلوم الفيزيائية والتكنولوجيا بالمدارس العليا للأساتذة (ENS).',
        'intro': 'الفيزيك والتكنولوجيا في الطور المتوسط هي متعة التجارب المخبرية وعلم الظواهر! التخصص هذا مطلوب بقوة ويضمن لك مكانة مرموقة ووظيفة قارة من نهارك الأول. القراية تجمع بين الفهم الرياضي والتطبيق العملي في المخابر. بصح وجد روحك للتقارير والـ TPs والالتزام بالحضور اليومي الصارم!',
        'priorities': '<li>🥇 الأولوية 01: شعبة رياضيات + شعبة تقني رياضي.</li><li>🥈 الأولوية 02: شعبة علوم تجريبية.</li>',
        'interview': 'إجبارية وإقصائية أمام لجنة بيداغوجية وطبية متخصصة.',
        'education_type': 'حضوري مدمج بين الدروس النظرية والأعمال التطبيقية (TP) والتربصات الميدانية.',
        'career': 'تعيين وتوظيف تلقائي مباشر كـ أستاذ مرسم في قطاع التربية الوطنية.',
        'subjects': '<li><b>⚡ العلوم الفيزيائية والكيميائية:</b> الميكانيك النيوتونية، الكهرباء الساكنة والحركية، البصريات (Optique)، الكيمياء العامة والعضوية، والتجارب المخبرية.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المواد العلمية، مناهج التدريس الحديثة، وعلم النفس التربوي لتسيير المراهقين.</li>',
        'table_rows': '''                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🏗️ الشلف (CHLEF)</td><td>15.15</td><td>15.98</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🐎 تيسمسيلت (TISSEMSILT)</td><td>15.14</td><td>16.14</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>📍 عين الدفلى (AIN-DEFLA)</td><td>15.10</td><td>15.88</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.47</td><td>15.06</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🐎 تيارت (TIARET)</td><td>15.14</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🐫 الجلفة (DJELFA)</td><td>14.37</td><td>15.07</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> التطبيق الممتع في المخابر، وضوح الرؤية المهنية والمستقبل المالي المستقر.</li><li>🔴 <b>السلبيات:</b> تقارير الـ TPs تتطلب وقتاً طويلاً ومجهوداً أسبوعياً مضاعفاً، وسيستم حضور حديدي.</li>',
        'pros': 'لقب أستاذ رسمي وتوظيف فوري بعد نهاية سنوات التكوين.',
        'cons': 'ريتم الامتحانات مكثف ويتطلب مواكبة يومية للدروس.'
    },
    {
        'id': 'ens-science-moyen',
        'title_short': 'العلوم الطبيعية',
        'title_full': 'أستاذ التعليم المتوسط في العلوم الطبيعية',
        'code': 'D00PML01',
        'icon': 'fas fa-leaf',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في العلوم الطبيعية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'لكل طالب يعشق بيولوجيا الكائنات الحية وتشريح جسم الإنسان وعلم الأرض.. هادا هو التخصص الأقوى ليك! ممتع ومطلوب بقوة ويضمن لك منصب عمل محترم ومستقر فور تخرجك ديريكت بعيداً على البطالة. بصح وجد روحك لحفظ كم هائل من المصطلحات والبيانات العلمية والالتزام اليومي!',
        'priorities': '<li>🥇 الأولوية 01: شعبة علوم تجريبية + شعبة رياضيات.</li><li>🥈 الأولوية 02: شعبة تقني رياضي.</li>',
        'interview': 'إجبارية وإقصائية للتأكد من الهندام، فصاحة التواصل، والجاهزية النفسية.',
        'education_type': 'حضوري وتطبيقي مكثف يدمج بين النظري والأعمال المخبرية والتربصات الميدانية.',
        'career': 'توظيف مباشر وتلقائي في المؤسسات التربوية التابعة لوزارة التربية الوطنية.',
        'subjects': '<li><b>🌿 العلوم الطبيعية والأحياء:</b> بيولوجيا الخلية، علم النبات (Botanique)، علم الحيوان (Zoologie)، الجيولوجيا وعلم الأرض، والفسيولوجيا البشرية المعمقة.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة وطرق التدريس الحديثة، علم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_rows': '''                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🏗️ الشلف (CHLEF)</td><td>15.37</td><td>--</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🐎 تيسمسيلت (TISSEMSILT)</td><td>15.68</td><td>--</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>📍 عين الدفلى (AIN-DEFLA)</td><td>15.47</td><td>--</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>📍 غليزان (RELIZANE)</td><td>15.53</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.81</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🐎 تيارت (TIARET)</td><td>15.42</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🌾 البيض (EL BAYADH)</td><td>NC</td><td>--</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> التنوع العلمي الممتع، البيئة البيداغوجية النخبوية والراقية، والضمان الوظيفي المستقبلي.</li><li>🔴 <b>السلبيات:</b> كثرة الغيابات ممنوعة تماماً وتؤدي للإقصاء، وحجم الحفظ للمصطلحات اللاتينية والعلمية كثيف جداً.</li>',
        'pros': 'شهادة ذات برستيج عالي وتعيين مباشر مورا التخرج في منصب رسمي ومستقر.',
        'cons': 'ريتم الدراسة سريع ويتطلب مواكبة وتحضيراً مستمراً طوال الأسابيع.'
    },
    {
        'id': 'ens-english-moyen',
        'title_short': 'اللغة الإنجليزية',
        'title_full': 'أستاذ التعليم المتوسط في اللغة الإنجليزية',
        'code': 'H06PML01',
        'icon': 'fas fa-language',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في اللغة الإنجليزية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'لغة العالم والبيزنس من بوابة المدرسة العليا! هذا التخصص يشهد طلباً خيالياً في السنوات الأخيرة نظراً للإستراتيجية الوطنية لعصرنة اللغات. القراية تضمن لك إتقان تام للصوتيات والقواعد ومناهج التدريس الحديثة. الميزة الأكبر هي التوظيف الآلي والمباشر مورا الدبلوم براتب محترم وأمان وظيفي تام. بصح المنافسة عليه قاصحة بزاف وتطلب معدلات عالية!',
        'priorities': '<li>🥇 الأولوية 01: شعبة لغات أجنبية + شعبة آداب وفلسفة.</li><li>🥈 الأولوية 02: شعب علوم تجريبية + رياضيات + تقني رياضي.</li>',
        'interview': 'إجبارية وإقصائية؛ حيث تركز اللجنة على سلامة مخارج الحروف بالإنجليزية والطلاقة التواصلية والجاهزية النفسية.',
        'education_type': 'حضوري وأكاديمي يركز على الكفاءة اللغوية والأدبية والبيداغوجية والتربصات.',
        'career': 'توظيف وتعيين رسمي فوري كـ أستاذ مرسم في منصب مستقر تابع للدولة.',
        'subjects': '<li><b>🇬🇧 الأكاديمية اللغوية:</b> الصوتيات البريطانية والأمريكية المعمقة (Phonetics & Phonology)، القواعد والتركيب (Grammar & Syntax)، اللسانيات، ودراسة أدب وحضارة الدول الناطقة بالإنجليزية.</li><li><b>⚙️ العلوم التربوية:</b> طرق تدريس الإنجليزية كلغة أجنبية (TEFL)، علم النفس التربوي، وتسيير الأقسام.</li>',
        'table_rows': '''                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🏗️ الشلف (CHLEF)</td><td>14.69</td><td>15.51</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🌊 مستغانم (MOSTAGANEM)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🐎 تيسمسيلت (TISSEMSILT)</td><td>15.28</td><td>15.97</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.13</td><td>14.48</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🐎 تيارت (TIARET)</td><td>15.65</td><td>16.63</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🌵 غرداية (GHARDAIA)</td><td>14.31</td><td>14.77</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>📍 المنيعة (EL MENIAA)</td><td>NC</td><td>NC</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> التخصص الأكثر طلباً وعصرنة، آفاق موازية ممتازة في الترجمة وصناعة المحتوى، وجو عائلي ونظيف في الدراسة.</li><li>🔴 <b>السلبيات:</b> الأساتذة متشددون جداً في النطق واللكنة الصحيحة، ولا مجال للتهاون أو الغيابات بدون مبرر رسمي.</li>',
        'pros': 'تخرج برتبة أستاذ في التخصص الأكثر نمواً تربوياً مع ضمان التوظيف الفوري مورا الباك.',
        'cons': 'معدلات القبول الفعلي عالية جداً بسبب التنافس الشرس للطلاب النخبة.'
    },
    {
        'id': 'ens-french-moyen',
        'title_short': 'اللغة الفرنسية',
        'title_full': 'أستاذ التعليم المتوسط في اللغة الفرنسية',
        'code': 'H01PML01',
        'icon': 'fas fa-globe-europe',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في اللغة الفرنسية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'إتقان لغة موليير بأسلوب أكاديمي وبيداغوجي راقٍ! التخصص هادا مديور للطلبة لي يحبوا اللغات الأجنبية وحابين يهنوا راسهم من كابوس البطالة مورا الدبلوم. السيستم يضمن لك منصب عمل قّار ومستقر ديريكت مورا نهاية سنوات التكوين. القراية تطبيقية وتثقفك لغوياً وأدبيّاً، بصح تتطلب انضباطاً كبيراً وحضوراً يومياً صارماً!',
        'priorities': '<li>🥇 الأولوية 01: شعبة لغات أجنبية + شعبة آداب وفلسفة.</li><li>🥈 الأولوية 02: شعب علوم تجريبية + رياضيات + تقني رياضي.</li>',
        'interview': 'إجبارية وإقصائية؛ حيث تتأكد اللجنة من سلامة النطق التامة (غياب اللثغات والتأتأة) والطلاقة في التواصل بالفرنسية.',
        'education_type': 'حضوري ونظري معمق في اللسانيات والأدب وفقه اللغة مع تربصات في المتوسطات.',
        'career': 'توظيف آلي مباشر ومستقر ديريكت في المنشآت التربوية التابعة للدولة.',
        'subjects': '<li><b>🇫🇷 الأكاديمية اللغوية:</b> القواعد المعمقة (Grammaire/Conjugaison)، الصوتيات (Phonétique)، اللسانيات المقارنة، ودراسة النصوص والأدب الفرنسي الكلاسيكي والمعاصر.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة وطرق التدريس المعاصرة، وعلم النفس التربوي لتسيير الأقسام.</li>',
        'table_rows': '''                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🏗️ الشلف (CHLEF)</td><td>14.11</td><td>14.11</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🐎 تيسمسيلت (TISSEMSILT)</td><td>14.17</td><td>14.21</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🕌 الأغواط (LAGHOUAT)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🌵 غرداية (GHARDAIA)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>📍 المنيعة (EL MENIAA)</td><td>NC</td><td>NC</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> الأمان المهني المبكر والواضح، بيئة بيداغوجية نظيفة وأعداد طلاب صغيرة ومدروسة تسمح بالتأطير العالي المستوى.</li><li>🔴 <b>السلبيات:</b> السيستم يمنع الغيابات تماماً بدون مبرر رسمي صارم، ويتطلب مجهوداً في ضبط قواعد الصوتيات واللسانيات.</li>',
        'pros': 'دبلوم ثقيل برتبة أستاذ مرسم ومستقر في قطاع التربية الوطنية فور تخرجك.',
        'cons': 'التعيين الجغرافي مورا التخرج يخضع حصرياً لخريطة الاحتياج لمديريات التربية في ولايتك.'
    },
    {
        'id': 'ens-history-moyen',
        'title_short': 'التاريخ والجغرافيا',
        'title_full': 'أستاذ التعليم المتوسط في التاريخ والجغرافيا',
        'code': 'I00PML01',
        'icon': 'fas fa-globe-africa',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في التاريخ والجغرافيا بالمدارس العليا للأساتذة (ENS).',
        'intro': 'لكل طالب يملك غراماً وعشقاً كبيراً للمطالعة، دراسة التاريخ، وحل أسرار الخرائط والجغرافيا الإستراتيجية.. هادا هو الدومين التوب ليك! التخصص غني جداً ويفتح لك الأبواب لضمان منصب عمل مستقر وقّار ديريكت مورا التخرج من غير كابوس المسابقات والانتظار. بصح وجد روحك لحجم حفظ كثيف وبروغروم معبأ طوال الـ 5 سنوات!',
        'priorities': '<li>🥇 الأولوية 01: شعبة آداب وفلسفة + شعبة لغات أجنبية.</li><li>🥈 الأولوية 02: شعب علوم تجريبية + رياضيات + تقني رياضي.</li>',
        'interview': 'إجبارية وإقصائية للتأكد من الهندام، سلامة الحواس والنطق، والاتزان النفسي.',
        'education_type': 'حضوري ونظري معمق يدمج بين المحاضرات ورسم الخرائط والتربصات في المتوسطات.',
        'career': 'تعيين وتوظيف تلقائي فوري كـ أستاذ مرسم تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>🌍 التاريخ والجغرافيا:</b> التاريخ القديم والوسيط والحديث، تاريخ الثورة الجزائرية المعمق، الجغرافيا الاقتصادية والبشرية، رسم وتفسير الخرائط، ونظم الاستشعار عن بعد.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة وطرق التدريس، علم النفس التربوي، وتسيير الأقسام.</li>',
        'table_rows': '''                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🏗️ الشلف (CHLEF)</td><td>14.82</td><td>14.21</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🐎 تيسمسيلت (TISSEMSILT)</td><td>14.54</td><td>15.28</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>📍 عين الدفلى (AIN-DEFLA)</td><td>14.15</td><td>14.85</td></tr>
                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>📍 غليزان (RELIZANE)</td><td>14.10</td><td>14.83</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.02</td><td>14.52</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🐎 تيارت (TIARET)</td><td>14.62</td><td>15.22</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🏭 المسيلة (MSILA)</td><td>14.25</td><td>14.63</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> القراية مشوقة جداً وغير روتينية، الأمان الوظيفي يمنحك راحة نفسية تامة طوال الأعوام، وتوفر الإقامة المريحة.</li><li>🔴 <b>السلبيات:</b> حجم الحفظ كثيف والامتحانات الدورية تتطلب تحضيراً مستمراً طوال السمانة، والغيابات ممنوعة تماماً.</li>',
        'pros': 'منصب عمل مضمون، وشهادة ذات برستيج اجتماعي ومكانة محترمة.',
        'cons': 'الانضباط إجباري وصارم، ومكان التعيين مورا التخرج مرتبط بالخريطة التربوية للولاية.'
    },
    {
        'id': 'ens-arabic-moyen',
        'title_short': 'اللغة والأدب العربي',
        'title_full': 'أستاذ التعليم المتوسط في اللغة والأدب العربي',
        'code': 'L00PML01',
        'icon': 'fas fa-book',
        'desc': 'دليل تخصص أستاذ التعليم المتوسط في اللغة والأدب العربي بالمدارس العليا للأساتذة (ENS).',
        'intro': 'حامي لغة الضاد وصانع الفصاحة في الطور المتوسط! التخصص هادا مديور للنخبة لي تحب النحو والصرف والأدب العربي وحابة تضمن مستقبلها الوظيفي والمادي من نهار الباك ديريكت. السيستم يخرجك إطار تربوي متمكن قادر يسير أقسام المراهقين ويزرع فيهم قواعد اللغة. بصح وجد روحك لقراية تطلب التدقيق الشديد وحفظ الشواهد النحوية والالتزام بالحضور اليومي الصارم!',
        'priorities': '<li>🥇 الأولوية 01: شعبة علوم تجريبية + شعبة رياضيات.</li><li>🥈 الأولوية 02: شعب آداب وفلسفة + لغات أجنبية + تقني رياضي + تسيير واقتصاد.</li>',
        'interview': 'إجبارية وإقصائية أمام لجنة بيداغوجية للتأكد من فصاحة اللسان التامة (غياب اللثغات والتأتأة) والجاهزية النفسية والبدنية.',
        'education_type': 'حضوري وأكاديمي معمق يجمع بين علوم اللغة والأدب والبيداغوجيا والتربصات.',
        'career': 'توظيف وتعيين تلقائي مباشر ومستقر في المتوسطات التابعة للدولة.',
        'subjects': '<li><b>✍️ الأدب واللغة العربية:</b> النحو المعمق، الصرف، البلاغة والعروض، تاريخ الأدب العربي بمختلف عصوره، واللسانيات وفقه اللغة.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة وطرق التدريس الحديثة، علم النفس التربوي وسيكولوجية المراهق، وتسيير الأقسام.</li>',
        'table_rows': '''                                <tr><td>ملحقة الشلف (ENS مستغانم)</td><td>🏗️ الشلف (CHLEF)</td><td>14.00</td><td>14.58</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.13</td><td>14.09</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط</td><td>📍 المنيعة (EL MENIAA)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>ملحقة الجلفة (ENS القبة)</td><td>🐫 الجلفة (DJELFA)</td><td>14.12</td><td>14.78</td></tr>
                                <tr><td>ملحقة تبسة (ENS قسنطينة)</td><td>🏭 أم البواقي (OUM EL BOUAGHI)</td><td>14.38</td><td>15.07</td></tr>
                                <tr><td>ملحقة تبسة (ENS قسنطينة)</td><td>⛏️ تبسة (TEBESSA)</td><td>NC</td><td>NC</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> وضوح المسار المهني، غياب شبح البطالة تماماً، والبيئة البيداغوجية هادئة ونخبوية وتساعد على التفوق وبناء شخصية قوية أمام التلاميذ.</li><li>🔴 <b>السلبيات:</b> نظام حضور حديدي وصارم جداً وغيابات غير مسموحة، ويتطلب دقة شديدة وحفظاً للشواهد الشعرية والنحوية طوال الأعوام.</li>',
        'pros': 'منصب عمل مضمون وفوري مورا التخرج برتبة إدارية ثابتة ومحترمة اجتماعيّاً.',
        'cons': 'ريتم الامتحانات مكثف ويتطلب مواكبة مستمرة، والتعيين الجغرافي مرتبط بالخريطة التربوية للولاية.'
    }
]

import pathlib
for spec in specialities:
    html = template.format(**spec)
    path = os.path.join('university', 'speciality', spec['id'] + '.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Created {path}')
