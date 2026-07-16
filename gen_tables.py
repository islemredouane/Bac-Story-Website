import re

def gen_tamazight():
    tamazight_text = '''
ENS بوزريعة / مدرسة الصم والبكم:
🏗️ الشلف (CHLEF): 13.98 | 🌴 بسكرة (BISKRA): 13.67 | ⛰️ بشار (BECHAR): 13.07 | 🍊 البليدة (BLIDA): 13.34 | 🛢️ تلمسان (TLEMCEN): 12.84 | 🇩🇿 الجزائر العاصمة (ALGER): 13.40 | 🐫 الجلفة (DJELFA): 13.76 | 🤠 سعيدة (SAIDA): 13.91 | 🍇 المدية (MEDEA): 14.61 | 🏭 المسيلة (MSILA): 14.18 | 🪵 معسكر (MASCARA): 13.64 | 🌊 وهران (ORAN): 13.19 | 🌾 البيض (EL BAYADH): 13.89 | 🏜️ إليزي (ILLIZI): 10.54 | 📍 تندوف (TINDOUF): 10.00 | 🐎 تيسيملسيلت (TISSEMSILT): 14.46 | 📍 عين الدفلى (AIN-DEFLA): 14.38 | 📍 النعامة (NAAMA): 13.80 | 📍 عين تموشنت (AIN-TEMOUCHENT): 14.28 | 🌵 غرداية (GHARDAIA): 12.83 | 📍 غليزان (RELIZANE): 14.52 | 📍 تيميمون (TIMIMOUN): 12.45 | 📍 بني عباس (BENI ABBES): 10.85
ملحقة تيزي وزو / ENS بوزريعة:
🏭 أم البواقي (OUM EL BOUAGHI): 13.71 | 🪵 باتنة (BATNA): 14.60 | 🏔️ بجاية (BEJAIA): 13.49 | 🪵 البويرة (BOUIRA): 13.46 | ⛏️ تبسة (TEBESSA): 13.77 | 🍇 تيزي وزو (TIZI-OUZOU): 13.05 | 🏭 سطيف (SETIF): 13.15 | 🏗️ برج بوعريريج (B.B.ARRERIDJ): 13.86 | 📍 بومرداس (BOUMERDES): 13.80 | 📍 الطارف (EL TARF): 13.55 | 📍 خنشلة (KHENCHLA): 13.80 | 📍 ميلة (MILA): 14.17 | 📍 تيبازة (TIPAZA): 13.46
'''
    html = '<div class="table-container">\n    <table class="styled-table">\n        <thead>\n            <tr>\n                <th>المدرسة / الملحقة الحاضنة للتكوين</th>\n                <th>الولاية التابعة (حسب الباك)</th>\n                <th>معدل القبول الموحد (جميع الشعب)</th>\n            </tr>\n        </thead>\n        <tbody>\n'
    lines = tamazight_text.strip().split('\n')
    current_school = ''
    for line in lines:
        if line.endswith(':'):
            current_school = line[:-1].strip()
        else:
            parts = line.split('|')
            for part in parts:
                part = part.strip()
                if not part: continue
                match = re.search(r'(.*):\s*([0-9.]+)', part)
                if match:
                    state = match.group(1).strip()
                    score = match.group(2).strip()
                    html += f'                <tr><td>{current_school}</td><td>{state}</td><td>{score}</td></tr>\n'
    html += '            </tbody>\n        </table>\n    </div>'
    return html

def gen_sport():
    sport_text = '''
المدرسة العليا للأساتذة بالأغواط:
🕌 الأغواط (LAGHOUAT): 14.32 | 🐎 تيارت (TIARET): 15.16 | 🐫 الجلفة (DJELFA): 14.73 | 🍇 المدية (MEDEA): 14.48 | 🐎 تيسيملسيلت (TISSEMSILT): 14.77 | 📍 عين الدفلى (AIN-DEFLA): 14.42 | 🌵 غرداية (GHARDAIA): 13.40 | 📍 المنيعة (EL MENIAA): 13.55
ملحقة الشلف (ENS مستغانم):
🏗️ الشلف (CHLEF): 14.65 | 📍 عين تموشنت (AIN-TEMOUCHENT): 14.15 | 📍 غليزان (RELIZANE): 14.89
'''
    html = '<div class="table-container">\n    <table class="styled-table">\n        <thead>\n            <tr>\n                <th>المدرسة / الملحقة الحاضنة للتكوين</th>\n                <th>الولاية التابعة (حسب الباك)</th>\n                <th>معدل القبول الموحد (جميع الشعب)</th>\n            </tr>\n        </thead>\n        <tbody>\n'
    lines = sport_text.strip().split('\n')
    current_school = ''
    for line in lines:
        if line.endswith(':'):
            current_school = line[:-1].strip()
        else:
            parts = line.split('|')
            for part in parts:
                part = part.strip()
                if not part: continue
                match = re.search(r'(.*):\s*([0-9.]+)', part)
                if match:
                    state = match.group(1).strip()
                    score = match.group(2).strip()
                    html += f'                <tr><td>{current_school}</td><td>{state}</td><td>{score}</td></tr>\n'
    html += '            </tbody>\n        </table>\n    </div>'
    return html

with open('tam_table.html', 'w', encoding='utf-8') as f:
    f.write(gen_tamazight())

with open('sport_table.html', 'w', encoding='utf-8') as f:
    f.write(gen_sport())
