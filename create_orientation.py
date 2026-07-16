import re

with open('resultats-bac-2026.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace title and metadata
html = re.sub(r'<title>.*?</title>', '<title>التوجيه الجامعي واختيار التخصصات | BAC STORY</title>', html, flags=re.DOTALL)
html = re.sub(r'<meta name="description" content=".*?">', '<meta name="description" content="طريقة التسجيل في موقع التوجيه الجامعي واختيار التخصصات الجامعية 2026. شرح مفصل لكيفية معرفة التخصصات المسموحة ومعاني الرموز.">', html, flags=re.DOTALL)

# Find the start of container
start_idx = html.find('<div class="container" style="padding-top: 24px; padding-bottom: 60px;">')
# Find the end of container (before footer-placeholder)
end_idx = html.find('<div id="global-cta-placeholder"></div>')

if end_idx == -1:
    end_idx = html.find('<div id="footer-placeholder"></div>') - 14 # 14 to include the closing </div> of container

new_content = """
    <div class="container" style="padding-top: 24px; padding-bottom: 60px;">
        <div class="ad-card-inject"></div>

        <!-- ── Hero ── -->
        <div class="results-hero">
            <div class="results-hero-badge">
                <div class="results-live-dot"></div>
                التوجيه الجامعي
            </div>
            <h1>طريقة التسجيل واختيار التخصصات</h1>
            <p>كيفاه نعرف التخصصات لي مدولي؟ وكيف أختار؟</p>
        </div>

        <!-- ── Section Header ── -->
        <div class="modern-section-header">
            <h2>كيفاه نعرف التخصصات لي مدولي؟</h2>
        </div>

        <!-- ── Steps Section ── -->
        <div class="results-steps">
            <div class="results-step">
                <div class="results-step-num">1</div>
                <div class="results-step-body">
                    <h5>الدخول إلى الموقع</h5>
                    <p>تدخلو للموقع من هذا الرابط: <a href="http://orientation-esi.dz" target="_blank" rel="noopener" style="color:#1a3a8f;font-weight:700;">http://orientation-esi.dz</a></p>
                </div>
            </div>
            <div class="results-step">
                <div class="results-step-num">2</div>
                <div class="results-step-body">
                    <h5>رقم التسجيل</h5>
                    <p>الرقم قصدهم رقم التسجيل لي في الإستدعاء.</p>
                </div>
            </div>
            <div class="results-step">
                <div class="results-step-num">3</div>
                <div class="results-step-body">
                    <h5>الرقم السري</h5>
                    <p>الرقم السري راه في كشف النقاط برك ماش لي خرجتو بيه النتيجة.</p>
                </div>
            </div>
            <div class="results-step">
                <div class="results-step-num">4</div>
                <div class="results-step-body">
                    <h5>اختيار التخصصات</h5>
                    <p>كي تدخلو للموقع يخرجلكم كيما الصورة، باه تشوفو التخصصات لي مدولكم تخيرو منهم تدخل للشعب المسموحة.</p>
                </div>
            </div>
        </div>

        <div class="revision-image-wrapper">
            <img src="images/orientation.jpg" alt="واجهة الموقع" class="revision-image" style="width: 100%; border-radius: 12px;">
        </div>

        <!-- ── Section Header ── -->
        <div class="modern-section-header">
            <h2>ملاحظات حول قائمة التخصصات</h2>
        </div>
        
        <div class="results-info-grid">
            <div class="results-info-card">
                <div class="results-info-icon" style="background:rgba(26,58,143,0.1);color:#1a3a8f;">
                    <i class="fas fa-calculator"></i>
                </div>
                <div>
                    <h4>المعدل المكتوب</h4>
                    <p>المعدل المكتوب أمام التخصص راه معدلك الموزون ماش معدل القبول.</p>
                </div>
            </div>
             <div class="results-info-card">
                <div class="results-info-icon" style="background:rgba(239,68,68,0.1);color:#dc2626;">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div>
                    <h4>التخصصات باللون الأحمر</h4>
                    <p>معناها قادر يبعثوك لولاية أخرى اذا قبلوك و ماكانش أماكن فالجامعة لي كتبولك. مثال: اذا قبلوك في كلية الطب في سطيف، هوما عندهم عدد مقاعد، اذا كملو المقاعد بصح نتا مقبول فالتخصص راح يبعثوك لكلية أخرى.</p>
                </div>
            </div>
        </div>

        <!-- ── Section Header ── -->
        <div class="modern-section-header">
            <h2>معاني الرموز FRR و FRL</h2>
        </div>

        <div class="results-alert gold">
            <div class="results-alert-icon"><i class="fas fa-info-circle"></i></div>
            <div class="results-alert-body">
                <strong>تخصص تكوين جهوي : FRR | تخصص تكوين محلي : FRL</strong>
                <p>يعني تخصصات جامعية تكون على مستوى ولايتك يجب اختيار 2 من هذه التخصصات بصفة إجبارية من بين 10 .<br>
                - بالنسبة لرمز : <strong>C01TCL</strong> يقصد به كلاسيك ( مهندس دولة).<br>
                - و اللي يبدا ب <strong>C01FPN</strong> تخصص ليسانس مهنية و هو موجود في 3 جامعات ذات تسجيل وطني.<br>
                و <strong>C01LAL</strong> تسجيل ولائي تاع الولاية تاعك: نظام Lmd.</p>
            </div>
        </div>

        <div class="results-channels">
            <div class="results-channel-card primary" style="cursor: default;">
                <div class="results-channel-icon"><i class="fas fa-home"></i></div>
                <h4>تخصص محلي</h4>
                <p>يعني في ولايتك في أقرب جامعة لبيتك.</p>
            </div>
            <div class="results-channel-card secondary" style="cursor: default;">
                <div class="results-channel-icon"><i class="fas fa-map"></i></div>
                <h4>تخصص جهوي</h4>
                <p>يعني في جهتك من الوطن شرق الجزائر، غرب وسط... صحراء.</p>
            </div>
            <div class="results-channel-card tertiary" style="cursor: default;">
                <div class="results-channel-icon"><i class="fas fa-globe"></i></div>
                <h4>تخصص وطني</h4>
                <p>يعني كل ولايات الجزائر تدرس في نفس الجامعه (مثل تخصص مدرسة عليا للإعلام الآلي بالجزائر).</p>
            </div>
        </div>

        <div class="results-alert danger" style="margin-top: 20px;">
            <div class="results-alert-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="results-alert-body">
                <strong>هام جداً ✅</strong>
                <p>لازم إجباري و محتم عليك تختار تخصصين من نوع FRL/FRR و نظام تعليم LMD. مثل تخصص علوم و تكنولوجيا ، تخصص حقوق ، تخصص علوم إنسانية.</p>
            </div>
        </div>

"""

# Retain everything from global-cta-placeholder down
final_html = html[:start_idx] + new_content + html[end_idx:]

with open('orientation.html', 'w', encoding='utf-8') as f:
    f.write(final_html)
