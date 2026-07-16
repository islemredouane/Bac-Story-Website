import os

path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\university\speciality\ens.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.rfind('<div id="global-cta-placeholder"></div>')
if idx != -1:
    print('Found global-cta-placeholder')
else:
    print(text[-500:].encode('utf-8'))
