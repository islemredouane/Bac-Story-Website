import os
path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\specialities.html'
with open(path, 'r', encoding='utf-8') as f: text = f.read()
idx = text.find("showSection('ENS')")
if idx != -1:
    print(text[max(0, idx-300):idx+50].encode('utf-8'))
