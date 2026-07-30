import os

file_path = "components/shared.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = '<div class="gcta-cards" id="gcta-cards">'
end_marker = '</div>\n    <!-- Mobile-only rotation dots -->'

dots_start_marker = '<div class="gcta-dots" id="gcta-dots">'
dots_end_marker = '</section>`;'

new_cards = """<div class="gcta-cards" id="gcta-cards">
        <a href="/university/averages-of-acceptance" class="gcta-card gcta-card--timer">
            <div class="gcta-icon-circle"><i class="fas fa-chart-line"></i></div>
            <div class="gcta-text">
                <strong>معدلات القبول 2026</strong>
                <span>اطلع على معدلات القبول الرسمية لجميع التخصصات الجامعية</span>
            </div>
            <div class="gcta-btn">تصفح المعدلات <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/feedback" class="gcta-card gcta-card--feedback">
            <div class="gcta-icon-circle"><i class="fas fa-star"></i></div>
            <div class="gcta-text">
                <strong>قيّم تجربتك مع BAC STORY</strong>
                <span>رافقناك طول العام — الآن جاء دورك. اترك رأيك ونصيحتك لدفعة 2027</span>
            </div>
            <div class="gcta-btn">اكتب رأيك <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/plans/monthly" class="gcta-card gcta-card--plans">
            <div class="gcta-icon-circle"><i class="fas fa-rocket"></i></div>
            <div class="gcta-text">
                <strong>بكالوريا 2027؟ ابدأ بقوة!</strong>
                <span>اكتشف خطط التميز الشهرية ونظم وقتك من بداية العام الدراسي</span>
            </div>
            <div class="gcta-btn">تصفح الخطط <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/resources" class="gcta-card gcta-card--resources">
            <div class="gcta-icon-circle"><i class="fas fa-briefcase"></i></div>
            <div class="gcta-text">
                <strong>حقيبة بكالوريا 2027</strong>
                <span>حمل أفضل الكتب الخارجية، الملخصات، ودرايفات المتفوقين</span>
            </div>
            <div class="gcta-btn">تصفح المصادر <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/oqba" class="gcta-card gcta-card--oqba">
            <div class="gcta-icon-circle"><i class="fas fa-map-signs"></i></div>
            <div class="gcta-text">
                <strong>طريقك للنجاح 2027</strong>
                <span>باقات عقبة بن نافع — دليلك الشامل لجميع المواد خطوة بخطوة</span>
            </div>
            <div class="gcta-btn">اكتشف الباقات <i class="fas fa-arrow-left"></i></div>
        </a>
        <a href="/bac-2026" class="gcta-card gcta-card--correct">
            <div class="gcta-icon-circle"><i class="fas fa-check-double"></i></div>
            <div class="gcta-text">
                <strong>تصحيحات بكالوريا 2026</strong>
                <span>شاهد مواضيع وحلول البكالوريا لجميع الشعب فور توفرها</span>
            </div>
            <div class="gcta-btn">تصفح الحلول <i class="fas fa-arrow-left"></i></div>
        </a>
    </div>"""

new_dots = """<div class="gcta-dots" id="gcta-dots">
        <span class="gcta-dot gcta-dot--active"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
        <span class="gcta-dot"></span>
    </div>"""

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_cards + content[end_idx:]

start_dots_idx = content.find(dots_start_marker)
end_dots_idx = content.find(dots_end_marker)

if start_dots_idx != -1 and end_dots_idx != -1:
    content = content[:start_dots_idx] + new_dots + '\n</section>`;' + content[end_dots_idx+len('</section>`;'):]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated shared.js")
