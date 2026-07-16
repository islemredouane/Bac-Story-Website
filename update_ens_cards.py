import os

base_dir = r"c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality"
ens_path = os.path.join(base_dir, "ens.html")

with open(ens_path, 'r', encoding='utf-8') as f:
    ens_content = f.read()

start_idx = ens_content.find('<div class="detail-card large-card">\n    <h3><i class="fas fa-language"></i> أستاذ التعليم الابتدائي في اللغة الفرنسية</h3>')

if start_idx != -1:
    end_idx = ens_content.find('<div id="global-cta-placeholder"></div>', start_idx)
    extracted_cards = ens_content[start_idx:end_idx]
    
    cards_grid = """
<div style="margin-top: 60px;">
    <h2>تخصصات المدارس العليا للأساتذة</h2>
</div>
<div class="Speciality-container-new" id="ens-specialities-grid">

    <div class="spec-card" data-category="education" data-name="فرنسية" onclick="window.location.href='/university/speciality/ens-francais'">
        <div class="spec-card-img"><img alt="فرنسية" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم الابتدائي في اللغة الفرنسية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-francais';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="انجليزية" onclick="window.location.href='/university/speciality/ens-anglais'">
        <div class="spec-card-img"><img alt="انجليزية" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم الابتدائي في اللغة الإنجليزية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-anglais';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="أمازيغية" onclick="window.location.href='/university/speciality/ens-tamazight'">
        <div class="spec-card-img"><img alt="أمازيغية" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم الابتدائي في اللغة الأمازيغية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-tamazight';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

    <div class="spec-card" data-category="education" data-name="رياضة" onclick="window.location.href='/university/speciality/ens-sport'">
        <div class="spec-card-img"><img alt="رياضة" loading="lazy" src="https://pub-889477d66bc54c9582bba9a492cf605f.r2.dev/images/ens.png"/></div>
        <div class="spec-card-body">
            <div class="spec-card-top">
                <div class="spec-card-name">أستاذ التعليم الابتدائي في التربية البدنية</div>
            </div>
            <div class="spec-card-footer">
                <span class="cat-badge cat-badge--education">تربية</span>
                <button class="spec-detail-btn" onclick="window.location.href='/university/speciality/ens-sport';event.stopPropagation()"><i class="fas fa-arrow-left"></i> التفاصيل</button>
            </div>
        </div>
    </div>

</div>
"""
    ens_content = ens_content[:start_idx] + cards_grid + ens_content[end_idx:]
    with open(ens_path, 'w', encoding='utf-8') as f:
        f.write(ens_content)
    
    # Save the extracted content to use in the individual files
    with open("extracted_ens.html", 'w', encoding='utf-8') as f:
        f.write(extracted_cards)

    print("Successfully replaced large cards with a grid in ens.html")
else:
    print("Could not find the start block in ens.html")
