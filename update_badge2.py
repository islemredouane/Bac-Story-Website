import os

spec_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html'
with open(spec_path, 'r', encoding='utf-8') as f: 
    content = f.read()

content = content.replace('<span class="cat-badge cat-badge--education">المدارس العليا للأساتذة</span>', '<span class="cat-badge cat-badge--education">تربية</span>')

with open(spec_path, 'w', encoding='utf-8') as f: 
    f.write(content)
print('Badge correctly updated')
