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
        'id': 'ens-mechanics-lycee',
        'title_short': 'الهندسة الميكانيكية',
        'title_full': 'أستاذ التعليم الثانوي في الهندسة الميكانيكية',
        'code': '01PSL19A',
        'icon': 'fas fa-cogs',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في الهندسة الميكانيكية بالمدارس العليا للأساتذة.',
        'intro': 'تخصص الحركة والتصنيع الميكانيكي المعقد في الثانويات التقنية! يخرجك كفاءة قادرة على تدريس طلبة التقني رياضي وتأطيرهم بامتياز التوظيف الآلي المستقر. تدرس هذه التخصصات النخبوية حصرياً في المدارس العليا التقنية (وعلى رأسها المدرسة العليا لأساتذة التعليم التقني بسكيكدة ENSET).',
        'min_avg': 'حسب المعدل العام للبكالوريا والشروط المحددة للمدارس العليا التقنية.',
        'priorities_intro': 'الترتيب على أساس المعدل العام للباك:',
        'priorities': '<li>🥇 الأولوية 01: لـ حاملي بكالوريا تقني رياضي (حسب الفرع الميكانيكي).</li><li>🥈 الأولوية 02: لـ شعبة رياضيات وعلوم تجريبية.</li>',
        'interview': 'مقابلة شفوية إجبارية في المدرسة العليا التقنية.',
        'duration': '6 سنوات كاملة (في المدارس العليا التقنية).',
        'education_type': 'حضوري تطبيقي مكثف في الورشات والمخابر التقنية.',
        'career': 'توظيف آلي كأستاذ تعليم ثانوي مرسم.',
        'subjects': '<li><b>⚙️ المواد المدروسة:</b> الرسم الصناعي المعزز بالحاسوب (DAO/CAO)، ديناميكا وبنية الآلات، ميكانيك المواد (RDM)، وتقنيات التصنيع الميكانيكي.</li>',
        'table_desc': 'استقرت معدلات القبول للأولوية الأولى (تقني رياضي ميكانيك) وطنياً عند عتبة 13.50 إلى 14.20 تنازليّاً حسب ولايات التنافس والمقاعد المتاحة بالمدارس التقنية.',
        'table_headers': '<th>ملاحظة عامة</th>',
        'table_rows': '<tr><td>معدلات القبول للأولوية الأولى بين 13.50 و 14.20</td></tr>',
        'feedback': '<li>🟢 <b>Feedback الطلاب:</b> تخصص ممتاز وتطبيقي جداً في الورشات، يتطلب دقة وذكاء هندسي في المحاكاة البرمجية، ووظيفته مريحة جداً.</li>',
        'pros': 'تخصص تطبيقي ممتع في الورشات، وتوظيف مضمون في الثانويات التقنية.',
        'cons': 'يتطلب دقة وذكاء هندسي في المحاكاة البرمجية.'
    },
    {
        'id': 'ens-civil-lycee',
        'title_short': 'الهندسة المدنية',
        'title_full': 'أستاذ التعليم الثانوي في الهندسة المدنية',
        'code': '01PSL05A',
        'icon': 'fas fa-hard-hat',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في الهندسة المدنية بالمدارس العليا للأساتذة.',
        'intro': 'هندسة الهياكل والخرسانة وتسيير المشاريع المدرسية! تخصص نخبوياً يجمع بين دقة الهندسة والعمل التربوي لضمان منصب أستاذ مرسم ومستقر ديريكت مورا الدبلوم. يدرس حصرياً في المدارس العليا التقنية.',
        'min_avg': 'حسب المعدل العام للبكالوريا والشروط المحددة للمدارس العليا التقنية.',
        'priorities_intro': 'الترتيب على أساس المعدل العام للباك:',
        'priorities': '<li>🥇 الأولوية 01: لـ حاملي بكالوريا تقني رياضي (حسب الفرع المدني).</li><li>🥈 الأولوية 02: لـ شعبة رياضيات وعلوم تجريبية.</li>',
        'interview': 'مقابلة شفوية إجبارية في المدرسة العليا التقنية.',
        'duration': '6 سنوات كاملة (في المدارس العليا التقنية).',
        'education_type': 'حضوري تطبيقي مكثف في الورشات والمخابر التقنية.',
        'career': 'توظيف آلي كأستاذ تعليم ثانوي مرسم.',
        'subjects': '<li><b>⚙️ المواد المدروسة:</b> مقاومة المواد (RDM)، حساب الهياكل والخرسانة المسلحة، علم الطوبوغرافيا، تكنولوجيا البناء، والرسم المعماري البرمجي.</li>',
        'table_desc': 'استقر فرز الترتيب التنازلي للأولوية الأولى وطنياً إجمالاً بين عتبة 13.70 و 14.40 حسب الكوطة الولائية للمقاعد الشاغرة.',
        'table_headers': '<th>ملاحظة عامة</th>',
        'table_rows': '<tr><td>معدلات القبول للأولوية الأولى بين 13.70 و 14.40</td></tr>',
        'feedback': '<li>🟢 <b>Feedback الطلاب:</b> التخصص رائع ومحبوب جداً لطلبة هندسة البناء، يتطلب دقة حسابية ومواكبة في الـ TDs، وآفاقه الإدارية ممتازة.</li>',
        'pros': 'محبوب جداً لطلبة هندسة البناء، وآفاق إدارية ممتازة.',
        'cons': 'يتطلب دقة حسابية ومواكبة في الأعمال الموجهة (TD).'
    },
    {
        'id': 'ens-electrical-lycee',
        'title_short': 'الهندسة الكهربائية',
        'title_full': 'أستاذ التعليم الثانوي في الهندسة الكهربائية',
        'code': '01PSL16A',
        'icon': 'fas fa-bolt',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في الهندسة الكهربائية بالمدارس العليا للأساتذة.',
        'intro': 'تخصص الأنظمة الآلية والتحكم الرقمي الذكي! يخرجك كفاءة قادرة على تلقين طلبة التقني رياضي أسس تكنولوجيا الكهرباء بامتياز الأمان الوظيفي والتعيين المباشر. يدرس حصرياً في المدارس العليا التقنية.',
        'min_avg': 'حسب المعدل العام للبكالوريا والشروط المحددة للمدارس العليا التقنية.',
        'priorities_intro': 'الترتيب على أساس المعدل العام للباك:',
        'priorities': '<li>🥇 الأولوية 01: لـ حاملي بكالوريا تقني رياضي (حسب الفرع الكهربائي).</li><li>🥈 الأولوية 02: لـ شعبة رياضيات وعلوم تجريبية.</li>',
        'interview': 'مقابلة شفوية إجبارية في المدرسة العليا التقنية.',
        'duration': '6 سنوات كاملة (في المدارس العليا التقنية).',
        'education_type': 'حضوري تطبيقي مكثف في الورشات والمخابر التقنية.',
        'career': 'توظيف آلي كأستاذ تعليم ثانوي مرسم.',
        'subjects': '<li><b>⚙️ المواد المدروسة:</b> الإلكترونيك الصناعية والرقمية، الأنظمة الآلية والمتحكمات (Automatique)، الشبكات الكهربائية، والمنطق الرياضي التقني المعاصر.</li>',
        'table_desc': 'المنافسة فيه قوية للأولوية الأولى، واستقر التوجيه والقبول وطنياً إجمالاً بين عتبة 13.90 و 14.50.',
        'table_headers': '<th>ملاحظة عامة</th>',
        'table_rows': '<tr><td>معدلات القبول للأولوية الأولى بين 13.90 و 14.50</td></tr>',
        'feedback': '<li>🟢 <b>Feedback الطلاب:</b> تخصص ذكي وتكنولوجي بامتياز، يحتاج انضباطاً كاملاً في مخابر التركيب والمحاكاة البرمجية للأجهزة الحيوية والأنظمة.</li>',
        'pros': 'ذكي وتكنولوجي بامتياز ويوفر أمان وظيفي كامل.',
        'cons': 'يحتاج انضباطاً في مخابر التركيب والمحاكاة.'
    },
    {
        'id': 'ens-process-eng-lycee',
        'title_short': 'هندسة الطرائق',
        'title_full': 'أستاذ التعليم الثانوي في هندسة الطرائق',
        'code': '01PSL08A',
        'icon': 'fas fa-flask',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في هندسة الطرائق بالمدارس العليا للأساتذة.',
        'intro': 'الكيمياء الصناعية والعملياتية بكامل أسرارها المخبرية! يخرجك أستاذ متمكن لتوجيه وتدريس طلبة الثانوي بامتياز الراتب المستقر والوظيفة القارة مورا التخرج من غير انتظار. يدرس حصرياً في المدارس العليا التقنية.',
        'min_avg': 'حسب المعدل العام للبكالوريا والشروط المحددة للمدارس العليا التقنية.',
        'priorities_intro': 'الترتيب على أساس المعدل العام للباك:',
        'priorities': '<li>🥇 الأولوية 01: لـ حاملي بكالوريا تقني رياضي (حسب فرع طرائق).</li><li>🥈 الأولوية 02: لـ شعبة رياضيات وعلوم تجريبية.</li>',
        'interview': 'مقابلة شفوية إجبارية في المدرسة العليا التقنية.',
        'duration': '6 سنوات كاملة (في المدارس العليا التقنية).',
        'education_type': 'حضوري تطبيقي مكثف في الورشات والمخابر التقنية.',
        'career': 'توظيف آلي كأستاذ تعليم ثانوي مرسم.',
        'subjects': '<li><b>⚙️ المواد المدروسة:</b> كيمياء العمليات الصناعية، موازنة الكتلة والطاقة، الديناميكا الحرارية الكيميائية، مراقبة الجودة، والتحاليل المخبرية التطبيقية.</li>',
        'table_desc': 'استقرت معدلات القبول للأولوية الأولى (تقني طرائق) وطنياً عند عتبة 13.80 فما فوق تنازليّاً حسب الخارطة الولائية والمقاعد المتاحة بالمنصة.',
        'table_headers': '<th>ملاحظة عامة</th>',
        'table_rows': '<tr><td>معدلات القبول للأولوية الأولى 13.80 فما فوق</td></tr>',
        'feedback': '<li>🟢 <b>Feedback الطلاب:</b> تخصص كيميائي تطبيقي ممتاز جداً، ومخابره غنية وممتعة، ويتطلب دقة وصبر في إعداد التقارير المخبرية الأسبوعية.</li>',
        'pros': 'تخصص كيميائي تطبيقي ممتاز ومخابر غنية وممتعة.',
        'cons': 'يتطلب دقة وصبر في إعداد التقارير المخبرية الأسبوعية.'
    },
    {
        'id': 'ens-music-lycee',
        'title_short': 'التربية الموسيقية',
        'title_full': 'أستاذ التعليم الثانوي في التربية الموسيقية',
        'code': 'K00PSN01',
        'icon': 'fas fa-music',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في التربية الموسيقية بالمدارس العليا للأساتذة (ENS).',
        'intro': 'الموهبة، الفن، وقراءة النوتات العالمية برستيج الطور الثانوي! تخصص وطني فريد يخرجك أستاذ ثانوي متمكن لتأطير مادتك بامتياز التوظيف المباشر والتلقائي المضمن. التكوين نوعي وراقي جداً، بصح يطلب موهبة حقيقية وفهماً للنظريات السمعية.',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'الترتيب وطني تنازلي بناءً على المعدل العام للباك مباشرة:',
        'priorities': '<li>🥇 الأولوية 01: شعبة الفنون.</li><li>🥈 الأولوية 02: جميع شعب البكالوريا الأخرى بالتساوي.</li>',
        'interview': 'إجبارية وإقصائية؛ يتم فيها اختبار الحس الموسيقي، سلامة السمع، القدرة الصوتية والنطق والجاهزية النفسية والبدنية.',
        'duration': '6 سنوات كاملة',
        'education_type': 'حضوري مدمج بين الدروس النظرية الأكاديمية والتدريب التطبيقي على الآلات والتربصات.',
        'career': 'توظيف مباشر وتلقائي في قطاع التربية الوطنية بوظيفة قارة ومستقرة.',
        'subjects': '<li><b>🎶 الموسيقى الأكاديمية المتقدمة:</b> الصولفيج المعمق وقراءة النوتة الموسيقية، تاريخ الفن وعلم الجمال الموسيقي، قيادة الأوركسترا المدرسية، والتدريب على الآلات (البيانو، العود، الغيتار).</li><li><b>⚙️ العلوم التربوية:</b> بيداغوجيا التدريس الموسيقي، وعلم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'مستخرجة بدقة من نتائج فرز المرحلة الأولى للنخبة تحت الأولوية الثانية - Min2 لمدرسة القبة K00PSN01:',
        'table_headers': '<th>الولاية المستهدفة (حسب الباك)</th><th>معدل الأولوية 2 (Min2)</th>',
        'table_rows': '''                                <tr><td>🏗️ الشلف (CHLEF)</td><td>15.08</td></tr>
                                <tr><td>🕌 الأغواط (LAGHOUAT)</td><td>14.13</td></tr>
                                <tr><td>🪵 باتنة (BATNA)</td><td>15.50</td></tr>
                                <tr><td>🏔️ بجاية (BEJAIA)</td><td>13.48</td></tr>
                                <tr><td>🌴 بسكرة (BISKRA)</td><td>14.56</td></tr>
                                <tr><td>🪵 البويرة (BOUIRA)</td><td>16.00</td></tr>
                                <tr><td>🐎 تيارت (TIARET)</td><td>16.52</td></tr>
                                <tr><td>🍇 تيزي وزو (TIZI-OUZOU)</td><td>12.97</td></tr>
                                <tr><td>🇩🇿 الجزائر العاصمة (ALGER)</td><td>13.50 / 14.47</td></tr>
                                <tr><td>🐫 الجلفة (DJELFA)</td><td>15.03</td></tr>
                                <tr><td>🗺️ جيجل (JIJEL)</td><td>14.02</td></tr>
                                <tr><td>🏭 سطيف (SETIF)</td><td>15.03</td></tr>
                                <tr><td>🍇 المدية (MEDEA)</td><td>15.33</td></tr>
                                <tr><td>🌊 مستغانم (MOSTAGANEM)</td><td>15.03</td></tr>
                                <tr><td>🏭 المسيلة (MSILA)</td><td>15.03</td></tr>
                                <tr><td>🌊 وهران (ORAN)</td><td>13.73</td></tr>
                                <tr><td>🪵 بومرداس (BOUMERDES)</td><td>13.91</td></tr>
                                <tr><td>📍 الوادي (EL OUED)</td><td>13.10</td></tr>
                                <tr><td>📍 سوق أهراس (SOUK-AHRAS)</td><td>14.92</td></tr>
                                <tr><td>📍 عين الدفلى (AIN-DEFLA)</td><td>15.03</td></tr>
                                <tr><td>📍 غليزان (RELIZANE)</td><td>14.85</td></tr>''',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> تكوين نوعي ومريح يعتمد على الحس الموسيقي، والتوظيف المباشر آلي وبعيد عن ضغوطات المواد العلمية المعقدة.</li><li>🔴 <b>السلبيات:</b> يتطلب موهبة حقيقية، وليس مجرد الرغبة، وقد يكون التدريب على الآلات مرهقاً في البداية.</li><li class="highlight-text">بقية الولايات المذكورة في الملحق (مثل أدرار، أم البواقي، بشار...) ظهرت برمز -- أو NC لعدم بلوغ الإشباع الكامل.</li>',
        'pros': 'تكوين مريح يعتمد على الفن والتوظيف المباشر مضمون.',
        'cons': 'يتطلب موهبة حقيقية وتدريب قد يكون مرهقاً.'
    },
    {
        'id': 'ens-art-lycee',
        'title_short': 'التربية الفنية / الرسم',
        'title_full': 'أستاذ التعليم الثانوي في الرسم / التربية الفنية',
        'code': 'K00PML01',
        'icon': 'fas fa-palette',
        'desc': 'دليل تخصص أستاذ التعليم الثانوي في الرسم / التربية الفنية بالمدارس العليا للأساتذة.',
        'intro': 'ريشة الإبداع وتصميم الهياكل البصرية لطلبة فروع الفنون والتشكيل بالثانويات، من أرقى التخصصات البيداغوجية وأكثرها راحة نفسية طوال الـ 6 سنوات! يمنحك منصب أستاذ مرسم ومستقر فور التخرج بعيداً على روتين وضغط الحفظ الكلاسيكي الجاف.',
        'min_avg': 'لا يقل عن 14.00/20 كمعدل عام للمشاركة في الفرز.',
        'priorities_intro': 'نظام الأولويات:',
        'priorities': '<li>🥇 الأولوية الأولى لـ شعبة الفنون.</li><li>🥈 الأولوية الثانية لـ جميع شعب البكالوريا الأخرى بالتساوي حسب المعدل العام.</li>',
        'interview': 'إجبارية وإقصائية للتأكد من المظهر الفني المتزن، سلامة النطق والحواس، والجاهزية النفسية والبدنية للتعليم.',
        'duration': '6 سنوات كاملة',
        'education_type': 'حضوري ونظري وتطبيقي مكثف يركز على الورشات التشكيلية والتربصات في الثانويات.',
        'career': 'توظيف مباشر آلي كـ أستاذ مرسم تابع لوزارة التربية الوطنية.',
        'subjects': '<li><b>🎨 الفنون التشكيلية والبصرية المعمقة:</b> المدارس الفنية العالمية، المنظور والتظليل، النحت التطبيقي، تقنيات المعالجة الرقمية للصور وتطوير المحتوى البصري، وبيداغوجيا الفنون التشكيلية.</li><li><b>⚙️ العلوم التربوية:</b> بيداغوجيا التدريس الفني، علم النفس التربوي وسيكولوجية المراهق.</li>',
        'table_desc': 'استقر الترتيب التنازلي للأولوية الثانية وطنياً إجمالاً بين عتبة 14.20 و 14.90 حسب الولايات الشاغرة بقطب القبة ومستغانم وقسنطينة وكثافة الطلب في السيت.',
        'table_headers': '<th>ملاحظة عامة</th>',
        'table_rows': '<tr><td>معدلات القبول للأولوية الثانية بين 14.20 و 14.90</td></tr>',
        'feedback': '<li>🟢 <b>الإيجابيات:</b> عالم مليء بالإبداع والراحة النفسية، غياب الروتين الأكاديمي الكلاسيكي الجاف، وضمان التوظيف المستقر مورا التخرج.</li><li>🔴 <b>السلبيات:</b> المصاريف مكلفة نوعاً ما؛ لأن الطالب مطالب بتوفير أدوات ومستلزمات الرسم والألوان طوال سنوات الدراسة، ونظام حضور وصيانة حديدي.</li>',
        'pros': 'عالم مليء بالإبداع والراحة النفسية وتوظيف مستقر.',
        'cons': 'المصاريف مكلفة لتوفير أدوات ومستلزمات الرسم.'
    }
]

import pathlib
for spec in specialities:
    html = template.format(**spec)
    path = os.path.join('university', 'speciality', spec['id'] + '.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Created {path}')
