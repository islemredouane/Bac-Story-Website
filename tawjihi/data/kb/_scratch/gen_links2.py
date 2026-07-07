# -*- coding: utf-8 -*-
"""Second-pass linker: recover grande-ecole links by matching establishment NAME/keyword.
stdlib only; UTF-8."""
import json, unicodedata, os, sys

KB = 'tawjihi/data/kb'

def deacc(s):
    s = s or ''
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return s.upper()

adm = json.load(open(os.path.join(KB, 'admissions-full.json'), encoding='utf-8'))
rows = adm['rows']
fi = json.load(open(os.path.join(KB, 'filiere-index.json'), encoding='utf-8'))['filieres']
kb = json.load(open(os.path.join(KB, 'specialities-kb.json'), encoding='utf-8'))
sp = kb['specialities']

# Pre-deaccent rows
DROWS = [(deacc(r['etab']), deacc(r['filiere'])) for r in rows]

def find_rows(needles):
    """Return row indices where ANY needle (a distinctive substring) appears in etab OR filiere."""
    out = []
    for i, (et, fl) in enumerate(DROWS):
        hay = et + ' || ' + fl
        if any(n in hay for n in needles):
            out.append(i)
    return out

def best_of(indices):
    b = {'min1': None, 'min2': None, 'min3': None}
    for i in indices:
        r = rows[i]
        for k in ('min1', 'min2', 'min3'):
            v = r.get(k)
            if v is not None and (b[k] is None or v < b[k]):
                b[k] = v
    if all(v is None for v in b.values()):
        return None
    return b

# ---- ALIAS MAP: speciality id -> list of distinctive establishment-name substrings (deaccented/upper)
# Confirmed against actual etab/filiere values in admissions-full.json.
ALIAS = {
    'ESTIN':   ['SCIENCES ET TECHNOLOGIES DE L INFORMATIQUE ET DU NUMERIQUE'],
    'ESI-ALGER': ['ECOLE NATIONALE SUPERIEURE EN INFORMATIQUE ALGER'],
    'ESI-SBA': ['ECOLE SUPERIEURE EN INFORMATIQUE'],  # 'SIDI BEL ABBES' implied; only SBA school uses ESUP EN INFORMATIQUE
    'ENSIA':   ['ECOLE NATIONALE SUPERIEURE EN INTELLIGENCE ARTIFICIELLE'],
    'ENSCS':   ['ECOLE NATIONALE SUPERIEURE DE CYBER SECURITE'],
    'ENSTA':   ['ECOLE NATIONALE SUPERIEURE DES TECHNOLOGIES AVANCEES'],
    'ENSTTIC': ['ECOLE NATIONALE SUPERIEURE DES TELECOMMUNICATIONS',
                'COMMUNICATIONS FILAIRES ET SANS FIL'],
    'NHSM':    ['ECOLE NATIONALE SUPERIEURE EN MATHEMATIQUES'],
    'POLYTECH': ['ECOLE NATIONALE POLYTECHNIQUE D ALGER',
                 'ECOLE NATIONALE POLYTECHNIQUE D ORAN',
                 'ECOLE NATIONALE SUPERIEURE POLYTECHNIQUE DE CONSTANTINE'],
    'EPAU':    ['ECOLE POLYTECHNIQUE D ARCHITECTURE ET D URBANISME'],
    'ENSSN':   ['ECOLE NATIONALE SUPERIEURE DES NANOSCIENCES'],
    'ENSAS':   ['ECOLE NATIONALE SUPERIEURE DES SYSTEMES AUTONOMES'],
    'ENSTP':   ['ECOLE NATIONALE SUPERIEURE DES TRAVAUX PUBLICS'],
    'ENSH':    ['ECOLE NATIONALE SUPERIEURE HYDRAULIQUE',
                'ECOLE NATIONALE SUPERIEURE D HYDRAULIQUE'],
    'ENSEE':   ['ECOLE SUPERIEURE EN GENIE ELECTRIQUE ET ENERGETIQUE'],
    'ESSA':    ['ECOLE SUPERIEURE DES SCIENCES APPLIQUEES DE TLEMCEN'],
    'HNSRE':   ['ENERGIES RENOUVELABLES DE ENVIRONNEMENT ET DU DEVELOPPEMENT DURABLE BATNA',
                'E.N.S DES ENERGIES RENOUVELABLES DE L ENVIRONNEMENT'],
    'ENSC':    ['ECOLE SUPERIEURE DE COMMERCE KOLEA'],
    'EHEC':    ['ECOLE DES HAUTES ETUDES COMMERCIALES KOLEA'],
    'ESGEN':   ['ECOLE SUPERIEURE DE GESTION ET DE L ECONOMIE NUMERIQUE'],
    'ENSSEA':  ['ECOLE NATIONALE SUPERIEURE EN STATISTIQUE ET EN ECONOMIE APPLIQUEE'],
    'ESM':     ['ECOLE SUPERIEURE DE MANAGEMENT DE TLEMCEN'],
    'ESSAIA':  ['SCIENCES DE L ALIMENT ET DES INDUSTRIES AGROALIMENTAIRES'],
    'ENSA':    ['ECOLE NATIONALE SUPERIEURE AGRONOMIQUE ALGER',
                'ECOLE SUPERIEURE AGRONOMIQUE DE MOSTAGANEM'],
    'ESSB':    ['ECOLE SUPERIEURE DES SCIENCES BIOLOGIQUES D ORAN'],
    'ENSSMAL': ['SCIENCES DE LA MER ET DE L AMENAGEMENT DU LITTORAL'],
}

# Map a matched row's full deaccented filiere string back to the original filiere KEY in fi.
# fi keys are the original (accented) filiere strings; build a deacc->original lookup.
FI_BY_DEACC = {}
for k in fi.keys():
    FI_BY_DEACC.setdefault(deacc(k), k)

def filiere_keys_for_rows(indices):
    keys = []
    seen = set()
    for i in indices:
        dk = deacc(rows[i]['filiere'])
        orig = FI_BY_DEACC.get(dk)
        if orig and orig not in seen:
            seen.add(orig)
            keys.append(orig)
    return keys

# ---- Process unlinked specialities
report_rows = []
recovered = 0
for s in sp:
    if s.get('linkedFiliereKeys'):
        continue  # already linked, handled separately below
    sid = s['id']
    if sid in ALIAS:
        idx = find_rows(ALIAS[sid])
        if idx:
            avg = best_of(idx)
            # sanity: plausible range 10-20
            plausible = avg and all((v is None or 10.0 <= v <= 20.0) for v in avg.values())
            if not plausible:
                print('WARN implausible avg for', sid, avg, file=sys.stderr)
            s['linkedEtabRows'] = sorted(idx)
            fk = filiere_keys_for_rows(idx)
            s['linkedFiliereKeys'] = fk
            s['resolvedAverages'] = avg
            s['_linkNote'] = 'linked via etab name (%d rows): %s' % (len(idx), '; '.join(ALIAS[sid][:1]))
            recovered += 1
            report_rows.append((sid, len(idx), avg))
            continue
    # not in alias map -> genuinely unlinkable; normalize fields, keep note
    s['linkedEtabRows'] = []
    s['resolvedAverages'] = None
    # keep existing _linkNote but mark still unlinked
    note = s.get('_linkNote', '')
    s['_linkNote'] = 'still unlinked: ' + note

# ---- resolvedAverages for already-linked specialities (best across linkedFiliereKeys)
for s in sp:
    if 'resolvedAverages' in s:
        continue  # newly handled above
    # gather row indices from each linked filiere key
    allidx = []
    for k in s.get('linkedFiliereKeys', []):
        ent = fi.get(k)
        if ent:
            allidx.extend(ent.get('rowIndices', []))
    s['linkedEtabRows'] = []  # these are filiere-linked, not etab-linked
    s['resolvedAverages'] = best_of(allidx) if allidx else None

# count
have = sum(1 for s in sp if s.get('resolvedAverages'))
print('recovered grande-ecole links:', recovered)
print('specialities with non-null resolvedAverages:', have, '/', len(sp))

# write back
json.dump(kb, open(os.path.join(KB, 'specialities-kb.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, indent=2)

# round-trip verify
chk = json.load(open(os.path.join(KB, 'specialities-kb.json'), encoding='utf-8'))
assert len(chk['specialities']) == len(sp)
print('round-trip OK')

# dump recovered table for report
for sid, n, avg in report_rows:
    print('  REC', sid, n, avg)
