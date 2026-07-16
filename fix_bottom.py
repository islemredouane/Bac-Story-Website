import os

enste_path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\enste.html'
with open(enste_path, 'r', encoding='utf-8') as f: 
    enste_content = f.read()

bottom_idx = enste_content.find('        window.addEventListener(\'load\', function () {')
bottom_idx = enste_content.rfind('</div>', 0, bottom_idx)
bottom_idx = enste_content.rfind('</div>', 0, bottom_idx)
bottom_idx = enste_content.rfind('</div>', 0, bottom_idx)

bottom_part = enste_content[bottom_idx:]

def fix_bottom(filepath):
    with open(filepath, 'r', encoding='utf-8') as f: 
        content = f.read()
    
    content = content.rstrip()
    if content.endswith('</div>\n</div>\n</div>'):
        content = content[:-18].rstrip()
        
    with open(filepath, 'w', encoding='utf-8') as f: 
        f.write(content + '\n' + bottom_part)
    print(f'Fixed bottom of {filepath}')

fix_bottom(r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\biomedical.html')
fix_bottom(r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\esesm.html')
