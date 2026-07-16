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
        <li><b>مدة التكوين الكلية:</b> {duration}</li>
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
        'id': 'ens-math-lycee',
        'title_short': 'الرياضيات',
        'title_full': 'أستاذ التعليم الثانوي في الرياضيات',
        'code': 'C02PSL01',
        'icon': 'fas fa-square-root-alt',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في الرياضيات بالمدارس العليا للأساتذة (ENS).',
        'intro': 'هادا هو تخصص "النخبة الصلبة" والأدمغة الفولاذية! أستاذ الماط في الثانوي يمثل أعلى سلطة حسابية في المنظومة التربوية، ومسؤول عن توجيه وتحضير أقسام البكالوريا. البرستيج الاجتماعي تاعه أسطوري والطلب عليه دائم. التكوين فيه يعتبر الأصعب تكنولوجياً؛ حيث يبلع كاع وقتك ويطلب تركيزاً تاماً طوال السداسيات، بصح نهار تتخرج تعلق كاسكيطة منصبك المضمون والتعيين المباشر وتتهنى من هم البطالة!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز التنازلي.',
        'priorities_intro': 'الفرز يتم وطنياً وديناميكياً بناءً على المعدل العام المحصل عليه في الباك:',
        'priorities': '<li>🥇 الأولوية 01: شعبة رياضيات + شعبة تقني رياضي.</li><li>🥈 الأولوية 02: شعبة علوم تجريبية.</li>',
        'interview': 'إجبارية وإقصائية؛ يتم فيها قياس فصاحة اللسان، مخارج الحروف، والجاهزية النفسية والبدنية التامة للتعليم.',
        'duration': '6 سنوات كاملة',
        'education_type': 'حضوري، أكاديمي نظري معمق، مع تربصات تطبيقية مكثفة داخل الثانويات في السنوات الأخيرة.',
        'career': 'توظيف مباشر وتلقائي بصفة رسمية في منصب مستقر تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>📉 الرياضيات الأكاديمية العميقة:</b> الجبر الخطي والمجرد (Algèbre)، التحليل الرياضي المعمق (Analyse)، الهندسة الفضائية والتفاضلية، الاحتمالات والإحصاء المعقد، والمنطق الرياضي.</li><li><b>⚙️ العلوم التربوية والبيداغوجيا:</b> ديدكتيك المادة وطرق التدريس المتقدمة، علم النفس التربوي وسيكولوجية المراهق، وتسيير الصف الكثيف.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج فرز المرحلة الأولى للأولوية الأولى والثانية:',
        'table_headers': '<th>المدرسة / الملحقة الحاضنة للتكوين</th><th>الولاية المستهدفة (حسب الباك)</th><th>معدل الأولوية 1 (Min1)</th><th>معدل الأولوية 2 (Min2)</th>',
        'table_rows': '''                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>🇩🇿 الجزائر العاصمة (ALGER)</td><td>15.31</td><td>16.08</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>📍 بومرداس (BOUMERDES)</td><td>14.84</td><td>15.58</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>⛰️ تمنراست (TAMANRASSET)</td><td>15.15</td><td>14.12</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>📍 إن صالح (IN SALAH)</td><td>15.53</td><td>15.33</td></tr>
                                <tr><td>ملحقة شلف (ENS مستغانم - B05)</td><td>🏗️ الشلف (CHLEF)</td><td>15.88</td><td>16.69</td></tr>
                                <tr><td>ملحقة شلف (ENS مستغانم - B05)</td><td>📍 عين تموشنت (AIN-TEMOUCHENT)</td><td>14.34</td><td>15.02</td></tr>
                                <tr><td>ملحقة شلف (ENS مستغانم - B05)</td><td>📍 غليزان (RELIZANE)</td><td>15.55</td><td>16.26</td></tr>
                                <tr><td>ملحقة بجاية (ENS سطيف - B03)</td><td>🏔️ بجاية (BEJAIA)</td><td>15.44</td><td>16.23</td></tr>
                                <tr><td>ملحقة بجاية (ENS سطيف - B03)</td><td>🪵 البويرة (BOUIRA)</td><td>15.23</td><td>15.90</td></tr>
                                <tr><td>ملحقة جيجل (ENS قسنطينة - B09)</td><td>🏭 أم البواقي (OUM-EL-BOUAGHI)</td><td>16.08</td><td>17.34</td></tr>
                                <tr><td>ملحقة جيجل (ENS قسنطينة - B09)</td><td>🪵 باتنة (BATNA)</td><td>15.96</td><td>16.73</td></tr>
                                <tr><td>ملحقة جيجل (ENS قسنطينة - B09)</td><td>🗺️ جيجل (JIJEL)</td><td>16.38</td><td>17.02</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>⛰️ بشار (BECHAR)</td><td>15.67</td><td>16.40</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>📍 تيميمون (TIMIMOUN)</td><td>14.80</td><td>15.55</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>📍 تندوف (TINDOUF)</td><td>--</td><td>14.06</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> نخبوية تامة في التكوين، مكانة إجتماعية قوية وهيبة أمام التلاميذ، والراحة النفسية التامة بضمان الوظيفة الرسمية من اليوم الأول.</li><li>🔴 <b>السلبيات:</b> ريتم الدراسة سريع وجدّ مشحون، الامتحانات قاصحة وتتطلب متابعة مكثفة في الـ TDs وحل المسائل الهندسية المعقدة دون كسل.</li>',
        'pros': 'شهادة ثقيلة جداً برتبة أستاذ ثانوي، راتب محترم وساعات عمل أسبوعية مريحة جداً.',
        'cons': 'نظام حضور صارم يعتمد على شطب الغيابات بدقة، مكاش مجال للتهاون البيداغوجي.'
    },
    {
        'id': 'ens-info-lycee',
        'title_short': 'الإعلام الآلي',
        'title_full': 'أستاذ التعليم الثانوي في الإعلام الآلي',
        'code': 'C01PSL01',
        'icon': 'fas fa-laptop-code',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في الإعلام الآلي بالمدارس العليا للأساتذة (ENS).',
        'intro': 'تخصص تكنولوجيا المستقبل الرقمي وصناعة المحتوى البرمجي! أستاذ الإعلام الآلي في الثانوي هو البروفايل الأكثر مواكبة للذكاء الاصطناعي والأنظمة الحديثة. التكوين يجمع بين متعة التكويد والمنطق الخوارزمي والبيداغوجيا. الميزة السحرية كالعادة هي التوظيف الآلي الفوري مورا الدبلوم براتب مستقر وضمان مستقبلك. بصح حط في بالك بلي الطلب عليه هرب بزاف ومعدلات القبول فيه قفزت لدرجة مرعبة!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في التصفية.',
        'priorities_intro': 'الترتيب وطني تنازلي بناءً على المعدل العام للباك ديريكت:',
        'priorities': '<li>🥇 الأولوية 01: شعبة رياضيات + شعبة تقني رياضي.</li><li>🥈 الأولوية 02: شعبة علوم تجريبية.</li>',
        'interview': 'إجبارية وإقصائية أمام لجنة بيداغوجية متخصصة لتقييم مخارج الحروف والجاهزية الفكرية.',
        'duration': '6 سنوات كاملة',
        'education_type': 'حضوري، يدمج بين الجانب الأكاديمي والعمل التطبيقي في مخابر الحاسوب المتطورة والتربصات.',
        'career': 'توظيف رسمي تعيين فوري كـ أستاذ مرسم تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>💻 الإعلام الآلي الأكاديمي المتقدم:</b> هندسة البرمجيات، قواعد البيانات المعقدة (SQL)، الخوارزميات وتراكيب المعطيات، شبكات الحواسب والأمن الرقمي، وتطوير الويب.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة والوسائل الرقمية، علم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج فرز المرحلة الأولى للأولوية الأولى والثانية:',
        'table_headers': '<th>المدرسة / الملحقة الحاضنة للتكوين</th><th>الولاية المستهدفة (حسب الباك)</th><th>معدل الأولوية 1 (Min1)</th><th>معدل الأولوية 2 (Min2)</th>',
        'table_rows': '''                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>🕌 الأغواط (LAGHOUAT)</td><td>15.25</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>🌴 بسكرة (BISKRA)</td><td>14.69</td><td>15.38</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>🐫 الجلفة (DJELFA)</td><td>16.03</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>🪵 معسكر (MASCARA)</td><td>15.05</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>🛢️ لورغلة (OUARGLA)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>📍 المنيعة (EL MENIAA)</td><td>16.06</td><td>16.12</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>📍 المغير (EL MGHAIER)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>📍 أولاد جلال (OULED DJELLAL)</td><td>15.06</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>🌊 الوادي (EL OUED)</td><td>14.83</td><td>15.61</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالأغواط (C42)</td><td>🌵 غرداية (GHARDAIA)</td><td>15.19</td><td>16.09</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>🇩🇿 الجزائر العاصمة (ALGER)</td><td>14.74</td><td>15.50</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>🍇 تيزي وزو (TIZI-OUZOU)</td><td>15.38</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>🏭 المسيلة (MSILA)</td><td>16.37</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>🪵 بومرداس (BOUMERDES)</td><td>14.88</td><td>15.69</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>📍 توقرت (TOUGGOURT)</td><td>15.26</td><td>15.65</td></tr>
                                <tr><td>المدرسة العليا للأساتذة بالقبة (C09)</td><td>🏜️ إليزي (ILLIZI)</td><td>14.16</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>🏜️ أدرار (ADRAR)</td><td>15.07</td><td>16.43</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>⛰️ بشار (BECHAR)</td><td>--</td><td>16.92</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>🌾 البيض (EL BAYADH)</td><td>14.28</td><td>14.97</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>📍 تندوف (TINDOUF)</td><td>--</td><td>14.32</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>📍 النعامة (NAAMA)</td><td>15.96</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>📍 تيميمون (TIMIMOUN)</td><td>16.02</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>📍 بني عباس (BENI ABBES)</td><td>--</td><td>16.27</td></tr>
                                <tr><td>ملحقة باتنة 2 (B51)</td><td>🪵 باتنة (BATNA)</td><td>16.70</td><td>16.51</td></tr>
                                <tr><td>ملحقة باتنة 2 (B51)</td><td>⛏️ تبسة (TEBESSA)</td><td>15.42</td><td>16.38</td></tr>
                                <tr><td>ملحقة باتنة 2 (B51)</td><td>🏭 سطيف (SETIF)</td><td>15.18</td><td>15.82</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> تخصص ممتع ومودرن، بعيد على روتين الحفظ الكلاسيكي، ويفتح لك مجال للعمل الحر والموازي في البرمجة وتطوير المواقع في أوقات الفراغ.</li><li>🔴 <b>السلبيات:</b> يتطلب تفكيراً منطقياً خوارزمياً حاداً، والأساتذة دقيقين بزاف في تقييم المشاريع البرمجية التطبيقية ولا مجال للغياب.</li>',
        'pros': 'تخصص إستراتيجي واعد ومطلوب بقوة، مع أمان وظيفي تلقائي فور نهاية التكوين.',
        'cons': 'معدلات القبول الفعلي عالية جداً بسبب التنافس الشرس لشرائح النخبة في السيت.'
    },
    {
        'id': 'ens-english-lycee',
        'title_short': 'اللغة الإنجليزية',
        'title_full': 'أستاذ التعليم الثانوي في اللغة الإنجليزية',
        'code': 'H06PSL01',
        'icon': 'fas fa-language',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في اللغة الإنجليزية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'التخصص الأكثر طلباً و"ترند" في ساحة المدارس العليا حالياً! تماشياً مع الإستراتيجية الوطنية لتعميم لغة البيزنس والعالم، يعتبر أستاذ الإنجليزية للثانوي خياراً أسطورياً. التكوين يمنحك مرونة لغوية وثقافية وبيداغوجية هربانة بزاف. الميزة الكبرى هي التوظيف الآلي الفوري المستقر مورا التخرج ديريكت براتب محترم ووظيفة مضمونة، بصح الفرز تاعه قاصح بزاف ويطلب نقاط ومعدلات عالية!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في التصفية.',
        'priorities_intro': 'الترتيب وطني تنازلي بناءً على المعدل العام للباك مباشرة:',
        'priorities': '<li>🥇 الأولوية 01: شعبة لغات أجنبية + شعبة آداب وفلسفة.</li><li>🥈 الأولوية 02: شعب علوم تجريبية + رياضيات + تقني رياضي.</li>',
        'interview': 'إجبارية وإقصائية؛ تركز اللجنة فيها بشكل صارم على الكفاءة النطقية واللكنة (Accent/Pronunciation)، والجاهزية النفسية والبدنية.',
        'duration': '6 سنوات كاملة',
        'education_type': 'حضوري بيداغوجي مكثف يركز على الكفاءة اللغوية والأدبية والتربصات الميدانية.',
        'career': 'تعيين رسمي فوري مباشر كـ أستاذ مرسم تابع للدولة في الثانويات.',
        'subjects': '<li><b>🇬🇧 الأكاديمية اللغوية:</b> الصوتيات المعمقة (Phonetics & Phonology)، القواعد والتركيب المتقدم (Syntax)، اللسانيات، ودراسة أدب وحضارة الدول الناطقة بالإنجليزية.</li><li><b>⚙️ العلوم التربوية:</b> طرق تدريس الإنجليزية كلغة أجنبية وثانية (TEFL)، علم النفس التربوي، وتسيير أقسام الثانوي.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج فرز المرحلة الأولى للأولوية الأولى والثانية:',
        'table_headers': '<th>المدرسة / الملحقة الحاضنة للتكوين</th><th>الولاية المستهدفة (حسب الباك)</th><th>معدل الأولوية 1 (Min1)</th><th>معدل الأولوية 2 (Min2)</th>',
        'table_rows': '''                                <tr><td>ملحقة شلف (ENS مستغانم - B05)</td><td>🏗️ الشلف (CHLEF)</td><td>15.86</td><td>16.38</td></tr>
                                <tr><td>ملحقة شلف (ENS مستغانم - B05)</td><td>🐎 تيسيملسيلت (TISSEMSILT)</td><td>16.79</td><td>17.52</td></tr>
                                <tr><td>ملحقة شلف (ENS مستغانم - B05)</td><td>📍 غليزان (RELIZANE)</td><td>16.75</td><td>15.81</td></tr>
                                <tr><td>ملحقة شلف (ENS مستغانم - B05)</td><td>📍 عين تموشنت (AIN-TEMOUCHENT)</td><td>NC</td><td>NC</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>🏜️ أدرار (ADRAR)</td><td>14.29</td><td>14.43</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>🌾 البيض (EL BAYADH)</td><td>14.23</td><td>15.26</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>📍 تندوف (TINDOUF)</td><td>15.01</td><td>--</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببشار (U44)</td><td>📍 النعامة (NAAMA)</td><td>14.46</td><td>15.73</td></tr>
                                <tr><td>المدرسة العليا للأساتذة ببوزريعة (B25)</td><td>🍊 البليدة (BLIDA)</td><td>15.27</td><td>16.05</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> برستيج عالي، التخصص الأكثر مواكبة لمتطلبات المنظومة التربوية المعاصرة، وإمكانية تقديم خدمات موازية في الترجمة بمرونة.</li><li>🔴 <b>السلبيات:</b> الأساتذة صارمين جداً في التقييم ومخارج الحروف العلمية، والبرنامج يطلب مجهوداً مستمراً طوال الأسابيع.</li>',
        'pros': 'تخرج بلقب أستاذ ثانوي في الدومين الأكثر طلباً إستراتيجياً وبأمان مهني قّار.',
        'cons': 'معدلات القبول مرتفعة جداً وتتطلب تضحية كاملة بحياتك الترفيهية لضمان التفوق.'
    },
    {
        'id': 'ens-islamic-lycee',
        'title_short': 'العلوم الإسلامية',
        'title_full': 'أستاذ التعليم الثانوي في العلوم الإسلامية',
        'code': 'I02PSL01',
        'icon': 'fas fa-book-quran',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في العلوم الإسلامية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'نبل الرسالة، وقوة التكوين البيداغوجي والشرعي! أستاذ العلوم الإسلامية في الطور الثانوي هو بروفايل محترم جداً وله كاريزما ومكانة اجتماعية قوية في توجيه سلوكيات وعقول المراهقين. التكوين يمنحك ضبطاً وتأصيلاً علمياً ممتازاً. الميزة الأكبر كالعادة هي التوظيف الآلي التلقائي المباشر مورا التخرج في الثانويات لتأمين منصبك ديريكت مورا الدبلوم!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في التصفية.',
        'priorities_intro': 'الترتيب وطني تنازلي بناءً على المعدل العام للباك مباشرة:',
        'priorities': '<li>🥇 الأولوية 01: شعبة آداب وفلسفة + شعبة لغات أجنبية.</li><li>🥈 الأولوية 02: شعب علوم تجريبية + رياضيات + تقني رياضي.</li>',
        'interview': 'إجبارية وإقصائية أمام لجنة بيداغوجية للتأكد من فصاحة اللسان التامة، الهندام، والاتزان البيداغوجي.',
        'duration': '6 سنوات كاملة',
        'education_type': 'حضوري، يركز على التأصيل الأكاديمي والشرعي والتربصات الميدانية في الثانويات.',
        'career': 'تعيين رسمي فوري تلقائي كـ أستاذ مرسم تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>🕌 العلوم الإسلامية والشرعية:</b> علوم القرآن الكريم والتفسير، فقه المعاملات والمواريث المعمق، السيرة النبوية، العقيدة الإسلامية والمقارنة، ومقاصد الشريعة والتربية الأخلاقية.</li><li><b>⚙️ العلوم التربوية:</b> ديدكتيك المادة وطرق التدريس، علم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج فرز المرحلة الأولى لـ المدرسة العليا لأساتذة بوزريعة/العاصمة للأولوية الأولى:',
        'table_headers': '<th>المدرسة الحاضنة للتكوين</th><th>الولاية المستهدفة (حسب الباك)</th><th>معدل الأولوية 1 (Min1)</th>',
        'table_rows': '''                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🕌 الأغواط (LAGHOUAT)</td><td>14.80</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🏔️ بجاية (BEJAIA)</td><td>15.28</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🍊 البليدة (BLIDA)</td><td>15.89</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🪵 البويرة (BOUIRA)</td><td>16.07</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🍇 تيزي وزو (TIZI-OUZOU)</td><td>15.03</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🇩🇿 الجزائر العاصمة (ALGER)</td><td>15.29</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🐫 الجلفة (DJELFA)</td><td>15.62</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🍇 المدية (MEDEA)</td><td>16.31</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🪵 بومرداس (BOUMERDES)</td><td>15.00</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>📍 تندوف (TINDOUF)</td><td>16.55</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>🐎 تيسيملسيلت (TISSEMSILT)</td><td>16.72</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>📍 تيبازة (TIPAZA)</td><td>16.61</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>📍 عين الدفلى (AIN-DEFLA)</td><td>16.03</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>📍 غرداية (GHARDAIA)</td><td>14.87</td></tr>
                                <tr><td>جامعة الجزائر 1 / مدرسة بوزريعة (B53)</td><td>📍 المنيعة (EL MENIAA)</td><td>15.77</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> المعاملة الراقية والنخبوية داخل أسوار الكلية، الراحة النفسية التامة بضمان منصب قّار مورا الدبلوم، ونبل الرسالة العلمية.</li><li>🔴 <b>السلبيات:</b> يتطلب تدقيقاً كبيراً وحفظاً متقناً للأدلة الشرعية والشواهد الفقهية والآيات الكريمة لتجاوز الامتحانات بنجاح، ونظام غيابات حديدي.</li><li class="highlight-text">بقية ولايات الجنوب (مثل تمنراست وإليزي وتيميمون...) ظهرت برمز NC (غير مشبعة) أو تم تدويرها.</li>',
        'pros': 'مكانة اجتماعية قوية ومعاملة راقية ونبل الرسالة.',
        'cons': 'حفظ متقن للأدلة ونظام غيابات حديدي.'
    },
    {
        'id': 'ens-sport-lycee',
        'title_short': 'التربية البدنية والرياضية',
        'title_full': 'أستاذ التعليم الثانوي في التربية البدنية والرياضية',
        'code': 'J00PSL01',
        'icon': 'fas fa-running',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في التربية البدنية والرياضية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'النشاط، الحركية، والابتعاد التام عن الملل والروتين الكلاسيكي لقاعات التدريس! أستاذ الرياضة في الطور الثانوي هو بروفايل عامر بالحيوية، ويتولى تأطير الأنشطة والفرق الرياضية المدرسية بالثانويات ببرستيج محترم. التكوين ممتع جداً ويجمع بين التدريب والعلوم الفسيولوجية والطبية وحركة الجسد. الميزة السحرية كالعادة هي التوظيف الآلي المضمون 100% فور التخرج وتأمين منصبك ديريكت مورا الدبلوم!',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'التخصص متميز بمرونة أسطورية؛ حيث أن جميع شعب البكالوريا لها نفس الأولوية والترتيب كليّاً، والفرز تنازلي حسب المعدل العام مباشرة.',
        'priorities': '<li>✅ أولوية موحدة لجميع الشعب.</li>',
        'interview': 'شهادة طبية إجبارية. رياضيو النخبة يسجلون بدون شرط المعدل. مقابلة شفوية إجبارية وإقصائية لتقييم القدرات اللغوية، سلامة الحواس والجاهزية النفسية والبدنية.',
        'duration': '6 سنوات كاملة',
        'education_type': 'حضوري مدمج بين النظري الأكاديمي والعملي الحركي في الساحات والملاعب والتربصات.',
        'career': 'تعيين وتوظيف رسمي فوري تلقائي كـ أستاذ مرسم تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>🦴 العلوم البيولوجية والطبية الرياضية:</b> تشريح جسم الإنسان وعلم وظائف الأعضاء، فسيولوجيا الجهد البدني للمراهقين، قوانين الألعاب الفردية والجماعية وتكتيكها، والإسعافات الأولية (Secourisme).</li><li><b>⚙️ العلوم التربوية:</b> بيداغوجيا التدريس الحركي وتنظيم التنافس المدرسي، وعلم النفس الرياضي والتربوي.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج فرز المرحلة الأولى لـ مدرسة بوزريعة / جامعة الجزائر 3 للشعب بالتساوي:',
        'table_headers': '<th>المدرسة الحاضنة للتكوين</th><th>الولاية التابعة (حسب الباك)</th><th>معدل القبول الموحد لجميع الشعب (Min1/Min2)</th>',
        'table_rows': '''                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>⛰️ تمنراست (TAMANRASSET)</td><td>14.28</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>🌴 تيزي وزو (TIZI-OUZOU)</td><td>14.58</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>🇩🇿 الجزائر العاصمة (ALGER)</td><td>14.38</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>🏜️ إليزي (ILLIZI)</td><td>12.16</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 بومرداس (BOUMERDES)</td><td>14.36</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 تندوف (TINDOUF)</td><td>14.33</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 تيبازة (TIPAZA)</td><td>15.55</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 تيميمون (TIMIMOUN)</td><td>14.80</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 جانت (DJANET)</td><td>10.19</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 بني عباس (BENI ABBES)</td><td>11.72</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 إن صالح (IN SALAH)</td><td>13.56</td></tr>
                                <tr><td>ENS بوزريعة / جامعة الجزائر 3 (B48)</td><td>📍 برج باجي مختار (B.B.MOKHTAR)</td><td>NC</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> تخصص عامر بالنشاط والمتعة، يبتعد تماماً عن نمط الحفظ الكلاسيكي والجدران المغلقة، والأمان الوظيفي المطلق يمنحك راحة نفسية كبيرة طوال الـ 6 سنوات.</li><li>🔴 <b>السلبيات:</b> الجهد البدني مكثف طوال السمانة، والخرجات للملاعب في فترات الشتاء والبرد القارس تطلب بنية بدنية صحيحة وقوة تحمل، وسيستم حضور صارم جداً لا يرحم.</li><li class="highlight-text">بقية ولايات الغرب والشرق (مثل وهران ومستغانم وقسنطينة وسكيكدة...) تظهر في ملاحقها الخاصة وفق نفس المقياس التنازلي الحركي لأصحاب الـ 14 فما فوق.</li>',
        'pros': 'عامر بالنشاط والمتعة بعيداً عن نمط الحفظ الكلاسيكي، وتوظيف مضمون.',
        'cons': 'جهد بدني مكثف وخرجات في مختلف الظروف مع حضور صارم.'
    }
]

import pathlib
for spec in specialities:
    html = template.format(**spec)
    path = os.path.join('university', 'speciality', spec['id'] + '.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Created {path}')
