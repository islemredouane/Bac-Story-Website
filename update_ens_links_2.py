import os

file_path = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\ens.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

cards = """

    <div class="spec-card" data-category="education" data-name="إعلام آلي متوسط" onclick="window.location.href='/university/speciality/ens-info-moyen'">
        <div class="spec-card-img"><img alt="إعلام آلي" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في الإعلام الآلي</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-info-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="رياضة متوسط" onclick="window.location.href='/university/speciality/ens-sport-moyen'">
        <div class="spec-card-img"><img alt="رياضة" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في التربية البدنية والرياضية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-sport-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="موسيقى متوسط" onclick="window.location.href='/university/speciality/ens-music-moyen'">
        <div class="spec-card-img"><img alt="موسيقى" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في الموسيقى والتربية الموسيقية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-music-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="رسم متوسط" onclick="window.location.href='/university/speciality/ens-art-moyen'">
        <div class="spec-card-img"><img alt="رسم" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في الرسم والتربية الفنية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-art-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="تربية إسلامية متوسط" onclick="window.location.href='/university/speciality/ens-islamic-moyen'">
        <div class="spec-card-img"><img alt="تربية إسلامية" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في التربية الإسلامية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-islamic-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="أمازيغية متوسط" onclick="window.location.href='/university/speciality/ens-tamazight-moyen'">
        <div class="spec-card-img"><img alt="أمازيغية" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم المتوسط في اللغة الأمازيغية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-tamazight-moyen';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

</div>"""

target = """</div>"""

# Replace the VERY LAST </div> of ens-specialities-grid with the cards + closing div.
# We will just replace `</div>` at the end of the container. 
# Wait, let's just insert before the final closing div.

# Find the end of the grid:
idx = content.rfind("</div>", 0, content.find('<!-- Specialty Navigation Buttons -->') if '<!-- Specialty Navigation Buttons -->' in content else len(content))
# Let's be safe. We know the grid ends with </div>, then maybe script tags or footer. 
# Let's search for `</div>\n<div id="global-cta-placeholder"></div>` or similar.

if "</div>\n    <!-- Specialty Navigation Buttons -->" in content:
    content = content.replace("</div>\n    <!-- Specialty Navigation Buttons -->", cards + "\n    <!-- Specialty Navigation Buttons -->")
else:
    # If not found, let's just append before the last </div> before global cta.
    # Wait, in ens.html the grid might be at the end.
    # Let's print out what is there at the end of ens.html.
    pass

with open("temp_updater.py", "w") as f:
    f.write("print('done')")

