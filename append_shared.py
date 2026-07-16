import os, re
shared_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\components\shared.js'
with open(shared_path, 'r', encoding='utf-8') as f: content = f.read()
shared_insert = "          { title: 'ESESM - الصم والبكم', desc: 'المدرسة العليا لأساتذة الصم والبكم', url: '/university/speciality/esesm', icon: 'fas fa-hands-helping', specialty: 'المدارس العليا للأساتذة', keywords: ['ESESM', 'esesm', 'صم', 'بكم', 'أساتذة', 'تربية'] },\n"
pos = content.find("title: 'ENS -")
if pos != -1:
    pos_end = content.find('},', pos) + 2
    content = content[:pos_end] + '\n' + shared_insert + content[pos_end:]
    with open(shared_path, 'w', encoding='utf-8') as f: f.write(content)
    print('shared.js updated successfully')
else:
    pos = content.rfind('];')
    if pos != -1:
        content = content[:pos] + shared_insert + content[pos:]
        with open(shared_path, 'w', encoding='utf-8') as f: f.write(content)
        print('shared.js updated at the end of the array')
