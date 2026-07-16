import os
path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html'
with open(path, 'r', encoding='utf-8') as f: text = f.read()
idx = text.find("showSection('ENS')")
if idx != -1:
    start_idx = text.rfind('<div class="spec-card"', 0, idx)
    print(text[start_idx:start_idx+150].encode('utf-8'))
