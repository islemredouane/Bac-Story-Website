import os

spec_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html'
with open(spec_path, 'r', encoding='utf-8') as f: 
    content = f.read()

start_idx = content.find('<div class="spec-card" data-category="education" data-name="أساتذة الصم والبكم ESESM"')
if start_idx != -1:
    end_idx = content.find('</div>\n  </div>\n  <!-- Empty state -->', start_idx)
    card_html = content[start_idx:end_idx]
    
    new_card_html = card_html.replace('<span class="cat-badge cat-badge--education">المدرسة العليا للأساتذة</span>', '<span class="cat-badge cat-badge--education">تربية</span>')
    
    content = content[:start_idx] + new_card_html + content[end_idx:]
    with open(spec_path, 'w', encoding='utf-8') as f: 
        f.write(content)
    print('Badge updated')
else:
    print('Card not found')
