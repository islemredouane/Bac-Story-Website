import os

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\ens.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the existing links
content = content.replace("ens-francais'", "ens-francais-primaire'")
content = content.replace("ens-anglais'", "ens-anglais-primaire'")
content = content.replace("ens-tamazight'", "ens-tamazight-primaire'")
content = content.replace("ens-sport'", "ens-sport-primaire'")

# 2. Add the middle school cards
cards = """        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="رياضيات متوسط" onclick="window.location.href='/university/speciality/ens-math-moyen'">
        <div class="spec-card-img"><img alt="رياضيات" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في الرياضيات</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-math-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="فيزياء متوسط" onclick="window.location.href='/university/speciality/ens-physics-moyen'">
        <div class="spec-card-img"><img alt="فيزياء" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في العلوم الفيزيائية والتكنولوجيا</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-physics-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="علوم طبيعية متوسط" onclick="window.location.href='/university/speciality/ens-science-moyen'">
        <div class="spec-card-img"><img alt="علوم طبيعية" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في العلوم الطبيعية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-science-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="انجليزية متوسط" onclick="window.location.href='/university/speciality/ens-english-moyen'">
        <div class="spec-card-img"><img alt="انجليزية" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في اللغة الإنجليزية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-english-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="فرنسية متوسط" onclick="window.location.href='/university/speciality/ens-french-moyen'">
        <div class="spec-card-img"><img alt="فرنسية" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في اللغة الفرنسية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-french-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="تاريخ وجغرافيا متوسط" onclick="window.location.href='/university/speciality/ens-history-moyen'">
        <div class="spec-card-img"><img alt="تاريخ وجغرافيا" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في التاريخ والجغرافيا</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-history-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="أدب عربي متوسط" onclick="window.location.href='/university/speciality/ens-arabic-moyen'">
        <div class="spec-card-img"><img alt="أدب عربي" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في اللغة والأدب العربي</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-arabic-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

</div>"""

target = """        </div>
    </div>

</div>"""

content = content.replace(target, cards)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
