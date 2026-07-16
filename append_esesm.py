import os, re

spec_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html'
with open(spec_path, 'r', encoding='utf-8') as f: 
    content = f.read()

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

pos = content.rfind('</div>\n    </div>\n    <div id="footer-placeholder"></div>')
if pos != -1:
    content = content[:pos] + new_card + '\n' + content[pos:]
    with open(spec_path, 'w', encoding='utf-8') as f: 
        f.write(content)
    print('Inserted successfully')
else:
    pos2 = content.rfind('<div id="footer-placeholder"></div>')
    pos2 = content.rfind('</div>', 0, pos2)
    pos2 = content.rfind('</div>', 0, pos2)
    if pos2 != -1:
        content = content[:pos2] + new_card + '\n' + content[pos2:]
        with open(spec_path, 'w', encoding='utf-8') as f: 
            f.write(content)
        print('Inserted successfully using fallback')
    else:
        print('Could not find end of grid')
