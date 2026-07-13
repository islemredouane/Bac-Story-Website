# -*- coding: utf-8 -*-
"""Tawjihi integration v2 — revert v1 catalog block, regenerate with quality fixes,
rewrite the 23 content files. KB from v1 kept (verbatim source text)."""
import json, os, re, sys

ROOT = r'C:/Users/AZ/Documents/BAC CHANNEL/Bac-Story-Website/.claude/worktrees/cool-stonebraker-deb446/FETCH_HEAD'
os.chdir(ROOT)

staged = json.load(open('tawjihi/data/_staging/new-specialities.json', encoding='utf-8'))
by_id = {e['id']: e for e in staged}
DROP = {'ensrpc'}
MERGE_INTO_AGRO = 'agronomie'
entries = [e for e in staged if e['id'] not in DROP and e['id'] != MERGE_INTO_AGRO]

# ---------- revert v1 appended block ----------
src = open('tawjihi/catalog.js', encoding='utf-8').read()
start = src.find("  {\n    id: 'enpei',")
end = src.rfind('\n];')
if start != -1 and start < end:
    src = src[:start].rstrip() + src[end:]
    print('v1 block reverted')
else:
    print('no v1 block found (fresh file)')

existing_ids = re.findall(r"^\s*id: '([^']+)'", src, re.M)
print('existing catalog ids:', len(existing_ids))

# ---------- vocab ----------
CODE2LABEL = {
    'math': 'رياضيات', 'techmath': 'تقني رياضي', 'sciexp': 'علوم تجريبية',
    'gestion': 'تسيير واقتصاد', 'lettres': 'آداب وفلسفة', 'langues': 'لغات أجنبية',
    'arts': 'فنون',
}
ALL_CODES = ['math','techmath','sciexp','gestion','lettres','langues']

SUBTITLE = {
    'engineering': 'هندسة وتكنولوجيا', 'medical': 'طب وصحة', 'business': 'اقتصاد وتسيير',
    'science': 'علوم تطبيقية', 'education': 'تربية وتكوين', 'law': 'قانون وعلوم سياسية',
    'humanities': 'آداب وعلوم إنسانية', 'double': 'مسار مزدوج', 'military': 'تكوين عسكري',
    'arts': 'فنون وإبداع',
}
PARAMED = {'appareilleur-orthopediste','anesthesie-reanimation','esp','pedicure-podologue',
           'pharma-prep','dieteticien','public-health-hygiene','adjoint-medical',
           'assistant-social','dent-hyg'}
LANGS = {'anglais','francais','espagnol','allemand','italien','russe','turc','chinois','arabe','tamazight'}

CAT_ICON = {
    'engineering':'fa-gears','medical':'fa-stethoscope','business':'fa-chart-line',
    'science':'fa-flask','education':'fa-chalkboard-user','law':'fa-scale-balanced',
    'humanities':'fa-book-open','double':'fa-layer-group','military':'fa-shield-halved',
    'arts':'fa-palette',
}
ID_ICON = {
    'enpei':'fa-graduation-cap','cherchall':'fa-ranking-star','esa':'fa-plane',
    'ensmar':'fa-anchor','esdat':'fa-satellite-dish','gendarmerie':'fa-shield-halved',
    'republican-guard':'fa-shield-halved','signal-corps':'fa-tower-broadcast',
    'ordnance-corps':'fa-truck-field','commissariat-corps':'fa-boxes-stacked',
    'military-health':'fa-user-nurse',
    'inataa':'fa-utensils','philo':'fa-lightbulb','staps':'fa-person-running',
    'penal':'fa-gavel','criminologie':'fa-magnifying-glass','forensique':'fa-fingerprint',
    'circular-economy':'fa-recycle','molecular-engineering':'fa-atom','genomic-data':'fa-dna',
    'csr':'fa-handshake','proteins-seeds':'fa-seedling','smart-cities':'fa-city',
    'trading':'fa-chart-line','fintech':'fa-money-bill-transfer','e-biz':'fa-cart-shopping',
    'aeroport':'fa-plane-departure','esaa':'fa-briefcase','esi-kolea':'fa-file-invoice-dollar',
    'enst':'fa-suitcase-rolling','iedf':'fa-file-invoice-dollar','ena':'fa-building-columns',
    'esm-justice':'fa-gavel','idri':'fa-globe','essp':'fa-landmark-flag','ensjsi':'fa-newspaper',
    'esss':'fa-umbrella','enmas':'fa-hospital','enscrbc':'fa-landmark',
    'arts':'fa-palette','cinema':'fa-film','theater':'fa-masks-theater','music-perf':'fa-music',
    'scenario':'fa-pen-fancy','3d-design':'fa-cube','digital-prod':'fa-clapperboard',
    'cinema-media':'fa-photo-film','ind-entr':'fa-film',
    'geologie':'fa-mountain','geographie':'fa-earth-africa','archeologie':'fa-landmark',
    'agro':'fa-seedling','agroalimentaire':'fa-utensils','env-sci':'fa-leaf',
    'hse':'fa-helmet-safety','hydro':'fa-water','petrochimie':'fa-oil-well','auto':'fa-robot',
    'electro':'fa-bolt','telecom':'fa-tower-broadcast','city-jobs':'fa-city',
    'architecture-uni':'fa-compass-drafting','med-gen':'fa-dna','gen-couns':'fa-dna',
    'prec-med':'fa-dna','addict':'fa-hand-holding-medical','dent-hyg':'fa-tooth',
    'med-informatics':'fa-laptop-medical','health-info':'fa-laptop-medical',
    'health-comm':'fa-comment-medical','health-soc':'fa-umbrella','childhood':'fa-child',
    'anesthesie-reanimation':'fa-syringe','pharma-prep':'fa-pills','dieteticien':'fa-utensils',
    'appareilleur-orthopediste':'fa-wheelchair','pedicure-podologue':'fa-shoe-prints',
    'esp':'fa-hand-holding-medical','public-health-hygiene':'fa-hand-sparkles',
    'adjoint-medical':'fa-user-nurse','assistant-social':'fa-people-group',
    'ss':'fa-people-group','loisir':'fa-umbrella-beach','soc-leisure':'fa-umbrella-beach',
    'history-data':'fa-landmark','tamazight':'fa-language','arabe':'fa-book-open',
}

def subtitle_icon(e):
    if e['id'] in ID_ICON: return ID_ICON[e['id']]
    if e['id'] in LANGS: return 'fa-language'
    if e['category'] == 'double': return 'fa-layer-group'
    return CAT_ICON.get(e['category'], 'fa-graduation-cap')

def subtitle_for(e):
    if e['id'] in PARAMED: return 'شبه طبي'
    if e['id'] in LANGS: return 'آداب ولغات'
    return SUBTITLE[e['category']]

# careers: (specific first, ambiguous last)
CAREER_ICONS = [
    ('سيبران','fa-shield-halved'), ('برمج','fa-code'), ('مطور','fa-code'),
    ('بيانات','fa-database'), ('ذكاء اصطناعي','fa-brain'), ('شبكات','fa-network-wired'),
    ('تطبيقات','fa-mobile-screen'), ('رقمنة','fa-laptop'), ('رقمي','fa-laptop'),
    ('وزارة','fa-building-columns'), ('مديريات','fa-building-columns'), ('بلدي','fa-building-columns'),
    ('دبلوماس','fa-globe'), ('سفارات','fa-globe'), ('منظمات دولية','fa-globe'), ('علاقات دولية','fa-globe'),
    ('محاماة','fa-scale-balanced'), ('محامي','fa-scale-balanced'), ('قضاء','fa-gavel'), ('قاضي','fa-gavel'),
    ('محضر قضائي','fa-gavel'), ('موثق','fa-file-signature'), ('قانوني','fa-scale-balanced'),
    ('شرطة','fa-shield-halved'), ('درك','fa-shield-halved'), ('جيش','fa-shield-halved'),
    ('ضابط','fa-shield-halved'), ('عسكري','fa-shield-halved'), ('الدفاع','fa-shield-halved'),
    ('طيران','fa-plane'), ('طيار','fa-plane'), ('مطارات','fa-plane-departure'),
    ('بحرية','fa-ship'), ('موانئ','fa-ship'), ('ملاحة','fa-ship'),
    ('مستشفيات','fa-hospital'), ('مستشفى','fa-hospital'), ('عيادات','fa-hospital'), ('عيادة','fa-hospital'),
    ('طبيب','fa-user-doctor'), ('تمريض','fa-user-nurse'), ('ممرض','fa-user-nurse'),
    ('صيدلي','fa-pills'), ('صيدلة','fa-pills'), ('مخابر','fa-vials'), ('مخبر','fa-vials'), ('تحاليل','fa-vials'),
    ('أسنان','fa-tooth'), ('تغذية','fa-utensils'), ('حمية','fa-utensils'), ('غذائية','fa-utensils'),
    ('وراثة','fa-dna'), ('جينوم','fa-dna'), ('جيني','fa-dna'),
    ('بنوك','fa-building-columns'), ('بنك','fa-building-columns'), ('بورصة','fa-chart-line'),
    ('تداول','fa-chart-line'), ('محاسب','fa-calculator'), ('جباية','fa-file-invoice-dollar'),
    ('ضرائب','fa-file-invoice-dollar'), ('جمارك','fa-file-invoice-dollar'), ('تأمين','fa-umbrella'),
    ('تسويق','fa-bullhorn'), ('إشهار','fa-bullhorn'), ('علاقات عامة','fa-bullhorn'),
    ('سياح','fa-suitcase-rolling'), ('فندق','fa-hotel'), ('وكالات الأسفار','fa-suitcase-rolling'),
    ('ترجمة','fa-language'), ('مترجم','fa-language'), ('تعليم اللغ','fa-language'), ('لغات','fa-language'),
    ('صحافة','fa-newspaper'), ('صحفي','fa-newspaper'), ('إذاعة','fa-microphone'), ('تلفزيون','fa-tv'),
    ('إعلام','fa-newspaper'), ('محتوى','fa-photo-film'),
    ('سينما','fa-film'), ('أفلام','fa-film'), ('إخراج','fa-clapperboard'), ('مونتاج','fa-clapperboard'),
    ('مسرح','fa-masks-theater'), ('موسيق','fa-music'), ('تصميم','fa-palette'), ('غرافيك','fa-palette'),
    ('ترميم','fa-landmark'), ('تراث','fa-landmark'), ('آثار','fa-landmark'), ('متاحف','fa-landmark'), ('متحف','fa-landmark'),
    ('فلاح','fa-seedling'), ('زراع','fa-seedling'), ('مزارع','fa-seedling'), ('غابات','fa-tree'),
    ('بيئة','fa-leaf'), ('مياه','fa-water'), ('الري','fa-water'), ('طاقة','fa-bolt'), ('كهرباء','fa-bolt'),
    ('نفط','fa-oil-well'), ('بترول','fa-oil-well'), ('محروقات','fa-oil-well'), ('سوناطراك','fa-oil-well'),
    ('اتصالات','fa-tower-broadcast'), ('نقل','fa-truck'), ('لوجستيك','fa-truck'),
    ('معماري','fa-compass-drafting'), ('عمران','fa-city'), ('بناء','fa-building'), ('أشغال','fa-helmet-safety'),
    ('مهندس','fa-gears'), ('هندسة','fa-gears'), ('مصانع','fa-industry'), ('صناعة','fa-industry'), ('صناعي','fa-industry'),
    ('تدريس','fa-chalkboard-user'), ('تعليم','fa-chalkboard-user'), ('أستاذ','fa-chalkboard-user'),
    ('بحث علمي','fa-flask'), ('باحث','fa-flask'), ('دكتوراه','fa-graduation-cap'), ('جامعات','fa-graduation-cap'),
    ('مدرب','fa-person-running'), ('رياضي','fa-person-running'), ('رياضة','fa-person-running'),
    ('نفساني','fa-brain'), ('علم النفس','fa-brain'), ('اجتماعي','fa-people-group'), ('جمعيات','fa-people-group'),
    ('طفولة','fa-child'), ('حضانة','fa-child'),
    ('مقاولات','fa-rocket'), ('ريادة','fa-rocket'), ('مشاريع خاصة','fa-rocket'), ('مشروع خاص','fa-rocket'),
    ('العمل الحر','fa-laptop'), ('freelance','fa-laptop'), ('مستقل','fa-laptop'),
    ('شركات','fa-building'), ('مؤسسات','fa-building'), ('القطاع الخاص','fa-building'), ('القطاع','fa-building'),
]
EMOJI_RE = re.compile(r'[\U0001F000-\U0001FAFF☀-➿️‍✔✅⚠❌🔹🔸💠📌📍]+')
NOT_CAREER = ('راتب','الراتب','منحة','الحالة المدنية','عقد عمل','السكن','الإقامة','احسب معدلك')

def career_icon(label):
    low = label.lower()
    for k, icon in CAREER_ICONS:
        if k in low or k in label:
            return icon
    return 'fa-briefcase'

def clean_text(t, cap=110):
    t = EMOJI_RE.sub('', t)
    t = re.sub(r'\s+', ' ', t).strip(' -–—|:،.')
    if len(t) > cap:
        cut = t[:cap]
        if ' ' in cut: cut = cut[:cut.rfind(' ')]
        t = cut + '…'
    return t.strip()

def career_label(t):
    t = clean_text(t, cap=70)
    if ':' in t and len(t) > 45:
        head = t.split(':')[0].strip()
        if len(head) >= 10: t = head
    return t

def careers_for(e):
    labels = []
    for c in (e.get('careers') or []):
        lb = career_label(c.get('label') or '')
        if lb and not lb.endswith('…') and not any(n in lb for n in NOT_CAREER) and lb not in labels:
            labels.append(lb)
    if len(labels) < 3:
        ct = (e.get('sourceData') or {}).get('careersText') or ''
        for part in ct.split('|'):
            lb = career_label(part)
            if lb and len(lb) >= 6 and not lb.endswith('…') and not any(n in lb for n in NOT_CAREER) and lb not in labels:
                labels.append(lb)
    labels = labels[:6]
    if not labels:
        if e['category'] == 'military':
            labels = ['ضابط في الجيش الوطني الشعبي']
        else:
            labels = ['مسارات مهنية حسب التخصص']
    return [{'icon': career_icon(l), 'label': l} for l in labels]

def demand_for(e):
    if e['category'] == 'military': return 'مرتفع'
    a = e.get('avg')
    if a is None: return 'متوسط'
    if a >= 17: return 'مرتفع جداً'
    if a >= 14.5: return 'مرتفع'
    return 'متوسط'

SCHOOL_WORDS = ('المدرسة', 'معهد', 'أكاديمية', 'الأكاديمية', 'المعهد')
def is_school(e):
    if e['category'] == 'military': return True
    name = e.get('name_ar') or ''
    return any(name.startswith(w) or (' ' + w + ' ') in name for w in SCHOOL_WORDS)

LOC_RE = re.compile(r'الموقع\s*[:：]\s*([^|.•]+)')
def location_for(e):
    if e.get('location'): return e['location']
    sd = e.get('sourceData') or {}
    hay = []
    for card in (sd.get('detailCards') or []):
        if 'موقع' in card.get('heading',''):
            hay.append(card.get('text',''))
    hay += (e.get('description') or [])
    for card in (sd.get('detailCards') or []):
        hay.append(card.get('text',''))
    for t in hay:
        m = LOC_RE.search(t or '')
        if m:
            raw = m.group(1).split('،')[0]
            loc = clean_text(raw, cap=55)
            if loc and not loc.endswith('…'): return loc
    intro = sd.get('intro') or {}
    for k, v in intro.items():
        if 'موقع' in k or 'مكان' in k:
            return clean_text(str(v), cap=55)
    if is_school(e):
        name = e.get('name_ar') or ''
        parts = re.split(r'[–—]', name)
        if len(parts) >= 2:
            tail = parts[-1].strip()
            if tail and len(tail) <= 28 and re.search(r'[؀-ۿ]', tail):
                return tail
        return 'الجزائر'
    return 'جامعات متعددة عبر الوطن'

def dld_for(e):
    """duration, language, degree with honest defaults"""
    sd = e.get('sourceData') or {}
    intro = sd.get('intro') or {}
    dur = e.get('duration'); lang = e.get('language'); deg = e.get('degree')
    for k, v in intro.items():
        if not dur and 'مدة' in k: dur = clean_text(str(v), cap=40)
        if not lang and 'لغة' in k: lang = clean_text(str(v), cap=40)
        if not deg and 'شهادة' in k: deg = clean_text(str(v), cap=60)
    school = is_school(e)
    if not dur:
        dur = 'حسب المؤسسة' if school else ('حسب المسار الجامعي' if e['category']=='double' else 'نظام LMD — ليسانس 3 سنوات')
    if not lang:
        lang = 'حسب المؤسسة' if school else 'حسب الجامعة'
    if not deg:
        deg = 'حسب المؤسسة' if school else ('شهادة مزدوجة' if e['category']=='double' else 'ليسانس / ماستر')
    return dur, lang, deg

def split_desc(e):
    out = []
    for d in (e.get('description') or []):
        if not d or not d.strip(): continue
        for part in d.split(' | '):
            part = re.sub(r'\s+', ' ', part).strip()
            if not part: continue
            if len(part) > 420:
                mid = len(part)//2
                cand = [m.start() for m in re.finditer(r'[.!؟] ', part)]
                if cand:
                    best = min(cand, key=lambda i: abs(i-mid))
                    out.append(part[:best+1].strip()); out.append(part[best+1:].strip())
                    continue
            out.append(part)
    if not out:
        out = [e.get('name_ar') or e['id']]
    return out[:4]

def parsed_rows(e):
    sd = e.get('sourceData') or {}
    ap = sd.get('acceptanceParsed') or {}
    rows = []
    for it in (ap.get('labeled') or []):
        lb = it.get('label'); av = it.get('avg')
        if lb and isinstance(av,(int,float)): rows.append((clean_text(lb, cap=40), av))
    for it in (ap.get('byStream') or []):
        st = it.get('stream') or it.get('label'); av = it.get('avg')
        if st and isinstance(av,(int,float)):
            lb = clean_text(str(st), cap=30)
            if not lb.startswith('شعبة'): lb = 'شعبة ' + lb
            rows.append((lb, av))
    return rows[:6]

def acronym(e):
    ne = e.get('nameEn') or ''
    m = re.search(r'\b([A-Z][A-Z0-9-]{1,12})\b', ne)
    if m: return m.group(1)
    return e['id'].upper()[:8]

def avg_history(e):
    rows = parsed_rows(e)
    if rows:
        return [{'uni': lb, 'y2025': av} for lb, av in rows]
    if e.get('avg') is not None:
        if is_school(e):
            return [{'uni': acronym(e) + ' · ' + location_for(e), 'y2025': e['avg']}]
        return [{'uni': 'المعدل المرجعي 2025', 'y2025': e['avg']}]
    return []

def unis_for(e):
    rows = parsed_rows(e)
    out = []
    if rows and not is_school(e):
        for lb, av in rows:
            if lb.startswith('شعبة'): continue
            ab = lb.replace('جامعة','').strip()[:14] or lb[:10]
            out.append({'abbr': ab, 'name': lb, 'location': '', 'avg': av})
        return out[:6]
    if is_school(e) and e.get('avg') is not None:
        return [{'abbr': acronym(e), 'name': re.split(r'[–—]', e.get('name_ar') or '')[0].strip(),
                 'location': location_for(e), 'avg': e['avg']}]
    return []

def streams_for(e):
    codes = e.get('streamCodes') or []
    if not codes:
        return ALL_CODES[:], ['جميع الشعب']
    labels = [CODE2LABEL.get(c, c) for c in codes]
    return codes, labels

def conditions_for(e):
    conds = []
    codes, labels = streams_for(e)
    if labels == ['جميع الشعب']:
        conds.append('مفتوح لجميع شعب البكالوريا (تحقق من شروط المؤسسة).')
    else:
        conds.append('الشعب المقبولة: ' + ' / '.join(labels) + '.')
    sd = e.get('sourceData') or {}
    concours = False
    for card in (sd.get('detailCards') or []):
        h = card.get('heading','')
        if 'شروط' in h or 'القبول' in h:
            txt = card.get('text','')
            if 'مسابقة' in txt or 'انتقاء' in txt:
                concours = True
            for part in txt.split('|'):
                lb = clean_text(part, cap=110)
                if lb.startswith('الشعب المقبولة'):
                    continue
                if lb and 15 <= len(lb) and 'احسب معدلك' not in lb and not lb.endswith('…') and len(conds) < 4:
                    conds.append(lb + ('' if lb.endswith(('.', '!', '؟')) else '.'))
            break
    if concours and not any('مسابقة' in c for c in conds):
        conds.insert(1, 'القبول عبر مسابقة/انتقاء خاص بالمؤسسة — وليس عبر بطاقة الرغبات فقط.')
    if e.get('avg') is not None and not any(re.search(r'\d', c) for c in conds):
        lo = e.get('minAvg'); hi = e.get('avg')
        if lo is not None and lo != hi:
            conds.append('المعدلات المرجعية 2025: بين %.2f و %.2f حسب المؤسسة.' % (lo, hi))
        else:
            conds.append('المعدل المرجعي 2025: حوالي %.2f.' % hi)
    return conds[:4]

def img_for(e):
    img = e.get('img')
    if img and os.path.exists('tawjihi/' + img):
        return img
    return ''

# ---------- JS serialization ----------
def js_str(s):
    s = str(s).replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ')
    return "'" + s + "'"

def js_num(v):
    if v is None: return 'null'
    if isinstance(v, float): return ('%.2f' % v)
    return str(v)

def js_list_str(lst):
    return '[' + ','.join(js_str(x) for x in lst) + ']'

def emit_entry(d):
    L = []
    L.append('  {')
    L.append('    id: %s, name: %s, nameEn: %s,' % (js_str(d['id']), js_str(d['name']), js_str(d['nameEn'])))
    L.append('    subtitle: %s, subtitleIcon: %s,' % (js_str(d['subtitle']), js_str(d['subtitleIcon'])))
    L.append('    cat: %s, catVar: %s, lmd: %s,' % (js_str(d['cat']), js_str(d['catVar']), 'true' if d['lmd'] else 'false'))
    L.append('    avg: %s, minAvg: %s,' % (js_num(d['avg']), js_num(d['minAvg'])))
    L.append('    streamCodes: %s, streams: %s,' % (js_list_str(d['streamCodes']), js_list_str(d['streams'])))
    L.append('    duration: %s, language: %s, degree: %s, demand: %s,' % (js_str(d['duration']), js_str(d['language']), js_str(d['degree']), js_str(d['demand'])))
    L.append('    img: %s, location: %s,' % (js_str(d['img']), js_str(d['location'])))
    L.append('    description: [')
    for p in d['description']:
        L.append('      %s,' % js_str(p))
    L.append('    ],')
    if d['avgHistory']:
        rows = ','.join('{ uni: %s, y2025: %s }' % (js_str(r['uni']), js_num(r['y2025'])) for r in d['avgHistory'])
        L.append('    avgHistory: [%s],' % rows)
    else:
        L.append('    avgHistory: [],')
    if d['unis']:
        L.append('    unis: [')
        for u in d['unis']:
            L.append('      { abbr: %s, name: %s, location: %s, avg: %s },' % (js_str(u['abbr']), js_str(u['name']), js_str(u['location']), js_num(u['avg'])))
        L.append('    ],')
    else:
        L.append('    unis: [],')
    L.append('    conditions: %s,' % js_list_str(d['conditions']))
    car = ','.join('{icon:%s,label:%s}' % (js_str(c['icon']), js_str(c['label'])) for c in d['careers'])
    L.append('    careers: [%s],' % car)
    L.append('  },')
    return '\n'.join(L)

def build(e):
    codes, labels = streams_for(e)
    dur, lang, deg = dld_for(e)
    return {
        'id': e['id'],
        'name': (e.get('name_ar') or e.get('name') or e['id']).strip(),
        'nameEn': (e.get('nameEn') or '').strip() or e['id'].upper(),
        'subtitle': subtitle_for(e), 'subtitleIcon': subtitle_icon(e),
        'cat': e['category'], 'catVar': 'var(--cat-%s)' % e['category'],
        'lmd': not is_school(e),
        'avg': e.get('avg'),
        'minAvg': e.get('minAvg') if e.get('minAvg') is not None else e.get('avg'),
        'streamCodes': codes, 'streams': labels,
        'duration': dur, 'language': lang, 'degree': deg, 'demand': demand_for(e),
        'img': img_for(e), 'location': location_for(e),
        'description': split_desc(e),
        'avgHistory': avg_history(e), 'unis': unis_for(e),
        'conditions': conditions_for(e), 'careers': careers_for(e),
    }

built = []
for e in entries:
    d = build(e)
    if e['id'] == 'agro':
        agr = by_id[MERGE_INTO_AGRO]
        d['name'] = 'العلوم الفلاحية والزراعية – Sciences Agronomiques'
        d['avg'] = 14.5; d['minAvg'] = 10.0
        merged = split_desc(e) + split_desc(agr)
        d['description'] = merged[:4]
        rows = parsed_rows(agr)
        d['avgHistory'] = [{'uni': lb, 'y2025': av} for lb, av in rows]
        d['unis'] = [{'abbr': lb.replace('جامعة','').strip()[:14], 'name': lb, 'location': '', 'avg': av} for lb, av in rows]
        d['unis'].insert(0, {'abbr': 'ENSA', 'name': 'المدرسة الوطنية العليا للفلاحة (طور مهندس)', 'location': 'الحراش · الجزائر', 'avg': 14.5})
        d['conditions'] = ['الشعب المقبولة: علوم تجريبية (أولوية 1) / رياضيات / تقني رياضي.',
                           'الجامعات (LMD): معدلات بين 10.00 و 12.59 حسب الجامعة.',
                           'المدارس العليا (طور المهندس): بين 12.50 و 14.50 حسب المدرسة والشعبة.']
        d['careers'] = careers_for(agr)[:6]
        d['lmd'] = True
        d['duration'] = 'ليسانس 3 سنوات (LMD) أو مهندس 5 سنوات (مدارس عليا)'
        d['degree'] = 'ليسانس / مهندس دولة'
    built.append(d)

ids = [d['id'] for d in built]
assert len(ids) == len(set(ids)), 'dup ids'
clash = set(ids) & set(existing_ids)
assert not clash, 'clash %s' % clash

block = '\n'.join(emit_entry(d) for d in built)
end = src.rfind('\n];')
new_src = src[:end] + '\n' + block + src[end:]
open('tawjihi/catalog.js', 'w', encoding='utf-8', newline='\n').write(new_src)
print('catalog appended:', len(built), '-> total', len(existing_ids) + len(built))

# ---------- content files (overwrite the 23) ----------
missing = [e for e in staged if e.get('matchStatus') == 'missing-everywhere' and e['id'] not in DROP]
def content_sections(e):
    sd = e.get('sourceData') or {}
    secs = []
    for card in (sd.get('detailCards') or []):
        h = (card.get('heading') or '').strip()
        t = (card.get('text') or '').strip()
        if not h or not t: continue
        if ('إيجابيات' in h) or ('مميزات' in h and '|' in t):
            items = [x.strip() for x in t.split('|') if x.strip()]
            secs.append({'h': h, 'type': 'pros', 'items': items})
        elif 'سلبيات' in h:
            items = [x.strip() for x in t.split('|') if x.strip()]
            secs.append({'h': h, 'type': 'cons', 'items': items})
        elif 'خلاصة' in h:
            secs.append({'h': h, 'type': 'summary', 'body': t})
        elif ' | ' in t:
            items = [x.strip() for x in t.split('|') if x.strip()]
            secs.append({'h': h, 'type': 'list', 'items': items})
        else:
            secs.append({'h': h, 'type': 'text', 'body': t})
    return secs

written = []
for e in missing:
    secs = content_sections(e)
    if not secs:
        print('NO CARDS', e['id']); continue
    path = 'tawjihi/content/%s.json' % e['id']
    json.dump({'sections': secs}, open(path, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    written.append(e['id'])
print('content rewritten:', len(written))

new_ids = re.findall(r"^\s*id: '([^']+)'", new_src, re.M)
print('FINAL ids:', len(new_ids), 'unique:', len(set(new_ids)))
