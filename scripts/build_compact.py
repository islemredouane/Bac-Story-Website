"""
Build two outputs from admissions-2026.json:
  1. admissions-compact.json  — small summary for AI system prompt
  2. admissions-index.json    — flat sorted list for search API
"""
import json, os, re

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'tawjihi', 'data')
FULL   = os.path.join(DATA_DIR, 'admissions-2026.json')
COMPACT = os.path.join(DATA_DIR, 'admissions-compact.json')
INDEX   = os.path.join(DATA_DIR, 'admissions-index.json')

with open(FULL, encoding='utf-8') as f:
    d = json.load(f)

# ── 1. Compact: AI-friendly summary ──────────────────────────────────────────
GRANDE_ECOLE_CODES = {'P','D','E','H','W'}

# Clean institution name: remove noise
def clean_etab(name):
    name = re.sub(r'\s+', ' ', name.strip())
    for prefix in ['ECOLE NATIONALE SUPERIEURE ', 'ECOLE SUPERIEURE ', 'UNIVERSITE ', 'UNIV. ']:
        name = name.replace(prefix, '')
    return name[:60]

# National minimums (medical)
compact_national = {}
for cid, v in d['nationale'].items():
    compact_national[cid] = {
        'filiere': v['filiere'],
        'min_sciexp': v['min1'],
        'min_math': v['min2'],
    }

# Grandes ecoles — top entries (min1 known)
compact_ge = []
seen_ge = set()
for e in sorted(d['grandes_ecoles'], key=lambda x: x['min1'] or 0, reverse=True):
    key = (e['code'], e['filiere'][:30])
    if key in seen_ge:
        continue
    seen_ge.add(key)
    # Keep filiere name clean (remove "FB XX ECOLE..." prefix for GE)
    fil = re.sub(r'^FB\s+\S+\s+', '', e['filiere']).strip()
    fil = fil[:50]
    compact_ge.append({
        'code': e['code'],
        'etab': clean_etab(e['etab']),
        'filiere': fil,
        'min1': e['min1'],
        'min2': e['min2'],
        'min3': e['min3'],
    })

# University programs — stats per filiere key
compact_uni = {}
for fkey, entries in d['by_filiere'].items():
    uni_entries = [e for e in entries if e['type'] == 'university' and e['min1']]
    if not uni_entries:
        continue
    mins = sorted(e['min1'] for e in uni_entries)
    avg = round(sum(mins) / len(mins), 2)
    median = mins[len(mins)//2]
    lo = mins[0]
    hi = mins[-1]
    compact_uni[fkey] = {
        'n': len(uni_entries),
        'avg': avg,
        'median': median,
        'min': lo,
        'max': hi,
    }

compact = {
    'year': '2025-2026',
    'note': 'min1=sciexp, min2=math, min3=techmath. NC=not accepted.',
    'nationale': compact_national,
    'grandes_ecoles': compact_ge[:120],  # top 120
    'university_stats': compact_uni,
}

with open(COMPACT, 'w', encoding='utf-8') as f:
    json.dump(compact, f, ensure_ascii=False, separators=(',', ':'))

size_c = os.path.getsize(COMPACT)
print('Compact: ' + str(round(size_c/1024)) + ' KB  (' + str(len(compact_ge[:120])) + ' GE + ' + str(len(compact_uni)) + ' uni stats)')

# ── 2. Index: flat sorted list for search API ─────────────────────────────────
index = []

# Add national entries
for cid, v in d['nationale'].items():
    index.append({
        'id': cid,
        'type': 'national',
        'etab': 'Recrutement National',
        'filiere': v['filiere'],
        'filiere_key': v['filiere_key'],
        'min1': v['min1'],
        'min2': v['min2'],
        'min3': v['min3'],
    })

# All non-national entries (already deduplicated since they come from by_filiere)
seen_codes = set()
for fkey, entries in d['by_filiere'].items():
    for e in entries:
        key = e['code'] + '_' + e['code_fil']
        if key in seen_codes:
            continue
        seen_codes.add(key)
        if e['min1'] or e['min2']:
            fil = re.sub(r'^FB\s+\S+\s+', '', e['filiere']).strip()[:50]
            index.append({
                'id': key,
                'type': e['type'],
                'code': e['code'],
                'etab': e['etab'][:70],
                'filiere': fil,
                'filiere_key': e['filiere_key'],
                'min1': e['min1'],
                'min2': e['min2'],
                'min3': e['min3'],
            })

# Sort by min1 desc
index.sort(key=lambda x: x['min1'] or 0, reverse=True)

with open(INDEX, 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, separators=(',', ':'))

size_i = os.path.getsize(INDEX)
print('Index:   ' + str(round(size_i/1024)) + ' KB  (' + str(len(index)) + ' entries)')
print()
print('Sample index entries:')
for e in index[:5]:
    print('  ' + str(e.get('etab','')[:35]) + ' | ' + str(e.get('filiere','')[:25]) + ' | ' + str(e.get('min1','')) + ' ' + str(e.get('min2','')) + ' ' + str(e.get('min3','')))
