import os

path = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\script.js'
with open(path, 'r', encoding='utf-8') as f: 
    text = f.read()

text = text.replace("'ESESM':", "'esesm':")

with open(path, 'w', encoding='utf-8') as f: 
    f.write(text)

path2 = r'c:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\Bac Story website-last version\components\shared.js'
with open(path2, 'r', encoding='utf-8') as f:
    text2 = f.read()
    
# check if searchData is defined in shared.js and if ESESM is in it with uppercase id
if 'id: "ESESM"' in text2:
    text2 = text2.replace('id: "ESESM"', 'id: "esesm"')
if "id: 'ESESM'" in text2:
    text2 = text2.replace("id: 'ESESM'", "id: 'esesm'")

with open(path2, 'w', encoding='utf-8') as f:
    f.write(text2)

print('Keywords updated')
