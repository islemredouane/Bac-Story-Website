"""
Parse cleaned_data_fixed.csv → tawjihi/data/admissions-2026.json

Column meaning:
  Code Etb   → institution code (P=grande école, U/C=university, R=paramedical, etc.)
  Etablissement → institution name
  Code Fil   → program code (encodes stream track)
  Filiere    → program/discipline name
  Min1       → minimum average for علوم تجريبية stream
  Min2       → minimum average for رياضيات stream
  Min3       → minimum average for تقني رياضي / 3rd stream

"NC" = stream not accepted, "--" = no data available
"""

import csv
import json
import re
import os

CSV_PATH = r'C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\cleaned_data_fixed.csv'
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'tawjihi', 'data', 'admissions-2026.json')

# Institution type by code prefix
INSTITUTION_TYPES = {
    'P': 'grande_ecole',
    'D': 'grande_ecole',
    'E': 'grande_ecole',
    'H': 'grande_ecole',
    'W': 'grande_ecole',
    'B': 'ens',           # École Normale Supérieure
    'U': 'university',
    'C': 'university',
    'R': 'paramedical',
    'F': 'university',    # joint programs
    'Z': 'training',
}

# Clean filière names (normalize French → canonical key)
FILIERE_NORMALIZE = {
    'SCIENCES ET TECHNOLOGIES': 'SCIENCES ET TECHNOLOGIES',
    'SCIENCES DE LA MATIERE': 'SCIENCES DE LA MATIERE',
    'INFORMATIQUE': 'INFORMATIQUE',
    'MATHEMATIQUES': 'MATHEMATIQUES',
    'SCIENCES DE LA NATURE ET DE LA VIE': 'SCIENCES DE LA NATURE ET DE LA VIE',
    'SCIENCES AGRONOMIQUES': 'SCIENCES AGRONOMIQUES',
    'GENIE CIVIL': 'GENIE CIVIL',
    'GENIE DES PROCEDES': 'GENIE DES PROCEDES',
    'ELECTROTECHNIQUE': 'ELECTROTECHNIQUE',
    'GENIE MECANIQUE': 'GENIE MECANIQUE',
    'GENIE ELECTRIQUE': 'GENIE ELECTRIQUE',
    'ARCHITECTURE': 'ARCHITECTURE',
    'MEDECINE': 'MEDECINE',
    'PHARMACIE': 'PHARMACIE',
    'MEDECINE DENTAIRE': 'MEDECINE DENTAIRE',
    'SCIENCES ECONOMIQUES': 'SCIENCES ECONOMIQUES',
    'DROIT': 'DROIT',
    'SCIENCES POLITIQUES': 'SCIENCES POLITIQUES',
    'LANGUE FRANCAISE': 'LANGUE FRANCAISE',
    'LANGUE ANGLAISE': 'LANGUE ANGLAISE',
    'LANGUE ET LITTERATURE ARABES': 'LANGUE ET LITTERATURE ARABES',
    'SCIENCES HUMAINES': 'SCIENCES HUMAINES',
    'SCIENCES SOCIALES': 'SCIENCES SOCIALES',
    'SCIENCES ISLAMIQUES': 'SCIENCES ISLAMIQUES',
    'TRADUCTION': 'TRADUCTION',
}

# Map filière → catalog ID + Arabic name
FILIERE_TO_CATALOG = {
    'MEDECINE': {'id': 'med', 'name_ar': 'طب'},
    'PHARMACIE': {'id': 'pharm', 'name_ar': 'صيدلة'},
    'MEDECINE DENTAIRE': {'id': 'dent', 'name_ar': 'طب الأسنان'},
    'INFORMATIQUE': {'id': 'info', 'name_ar': 'إعلام آلي (جامعة)'},
    'MATHEMATIQUES': {'id': 'math', 'name_ar': 'رياضيات'},
    'SCIENCES DE LA NATURE ET DE LA VIE': {'id': 'bio', 'name_ar': 'علوم الطبيعة والحياة'},
    'SCIENCES DE LA MATIERE': {'id': 'sm', 'name_ar': 'علوم المادة'},
    'SCIENCES ET TECHNOLOGIES': {'id': 'st', 'name_ar': 'علوم وتكنولوجيا'},
    'GENIE CIVIL': {'id': 'genie-civil', 'name_ar': 'هندسة مدنية'},
    'GENIE MECANIQUE': {'id': 'genie-meca', 'name_ar': 'هندسة ميكانيكية'},
    'GENIE ELECTRIQUE': {'id': 'genie-elec', 'name_ar': 'هندسة كهربائية'},
    'ELECTROTECHNIQUE': {'id': 'genie-elec', 'name_ar': 'هندسة كهربائية'},
    'GENIE DES PROCEDES': {'id': 'gp', 'name_ar': 'هندسة العمليات'},
    'ARCHITECTURE': {'id': 'archi', 'name_ar': 'هندسة معمارية'},
    'SCIENCES AGRONOMIQUES': {'id': 'ensas', 'name_ar': 'علوم زراعية'},
    'DROIT': {'id': 'droit', 'name_ar': 'دراسات قانونية'},
    'SCIENCES POLITIQUES': {'id': 'sciences-po', 'name_ar': 'علوم سياسية'},
    'SCIENCES ECONOMIQUES': {'id': 'eco', 'name_ar': 'علوم اقتصادية وتسيير'},
    'SCIENCES HUMAINES': {'id': 'sciences-hum', 'name_ar': 'علوم إنسانية'},
    'SCIENCES SOCIALES': {'id': 'sciences-hum', 'name_ar': 'علوم اجتماعية'},
    'LANGUE FRANCAISE': {'id': 'langues', 'name_ar': 'لغة فرنسية'},
    'LANGUE ANGLAISE': {'id': 'langues', 'name_ar': 'لغة إنجليزية'},
    'TRADUCTION': {'id': 'traduction', 'name_ar': 'ترجمة'},
    'SCIENCES ISLAMIQUES': {'id': 'charia', 'name_ar': 'علوم إسلامية'},
}

def parse_min(val):
    """Convert min value to float or None."""
    val = val.strip() if val else ''
    if val in ('NC', '--', '', 'N/A'):
        return None
    try:
        return round(float(val), 2)
    except ValueError:
        return None

def clean_name(name):
    """Clean institution/filière name (remove newlines, extra spaces)."""
    return re.sub(r'\s+', ' ', name.strip())

def get_type(code):
    if not code:
        return 'university'
    return INSTITUTION_TYPES.get(code[0], 'university')

def extract_filiere_key(filiere_raw):
    """Extract the core filière name from verbose grande école filières."""
    name = clean_name(filiere_raw)
    # Grande école pattern: "FB ST ECOLE NATIONALE SUPERIEURE ..."
    # → extract after "FB XX " prefix
    fb_match = re.match(r'^FB\s+\S+\s+(.*)', name)
    if fb_match:
        # This is a grande école—use full institution name as filière isn't meaningful
        return name
    return name

def normalize_filiere(name):
    """Get a normalized canonical key for grouping."""
    n = clean_name(name).upper()
    # Remove grande école prefix
    n = re.sub(r'^FB\s+\S+\s+', '', n)
    # Exact match first
    if n in FILIERE_TO_CATALOG:
        return n
    # Partial match — longest key first to avoid substring false positives
    for key in sorted(FILIERE_TO_CATALOG.keys(), key=len, reverse=True):
        if key in n:
            return key
    # For sciences économiques variants
    if 'ECONOMIQUE' in n or 'COMMERCIALE' in n or 'GESTION' in n:
        return 'SCIENCES ECONOMIQUES'
    if 'HYDROCARBURE' in n or 'PETROLE' in n:
        return 'HYDROCARBURES'
    if 'HYDRAULIQUE' in n:
        return 'HYDRAULIQUE'
    if 'AERONAUTIQUE' in n or 'AERONAUTIC' in n:
        return 'AERONAUTIQUE'
    if 'NANOTECHNOLOGIE' in n or 'NANOSCIENCE' in n:
        return 'NANOSCIENCES'
    if 'CYBER' in n or 'SECURITE INFORMATIQUE' in n:
        return 'CYBERSECURITE'
    if 'BIOTECHNOLOGIE' in n:
        return 'BIOTECHNOLOGIE'
    if 'INTELLIGENCE ARTIFICIELLE' in n:
        return 'INTELLIGENCE ARTIFICIELLE'
    if 'SYSTEME AUTONOME' in n:
        return 'SYSTEMES AUTONOMES'
    if 'ALIMENT' in n:
        return 'SCIENCES ALIMENTAIRES'
    if 'BIOLOGIQUE' in n or 'BIOSCIENCE' in n:
        return 'SCIENCES BIOLOGIQUES'
    if 'AGRICULTURE' in n or 'AGRONOMIE' in n or 'AGRO' in n:
        return 'SCIENCES AGRONOMIQUES'
    if 'MANAGEMENT' in n or 'COMPTABILITE' in n or 'FINANCE' in n:
        return 'SCIENCES ECONOMIQUES'
    if 'GEOGRAPHIE' in n:
        return 'GEOGRAPHIE'
    if 'VETERINAIRE' in n:
        return 'MEDECINE VETERINAIRE'
    return n[:60]  # fallback: trimmed raw name

def main():
    rows = []
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            rows.append(row)

    entries = []
    national = {}
    grandes_ecoles = []
    by_filiere = {}
    skipped = 0

    for row in rows:
        if len(row) < 5:
            skipped += 1
            continue

        code_etb = row[0].strip()
        etab = clean_name(row[1])
        code_fil = row[2].strip() if len(row) > 2 else ''
        filiere_raw = row[3] if len(row) > 3 else ''
        min1 = parse_min(row[4]) if len(row) > 4 else None
        min2 = parse_min(row[5]) if len(row) > 5 else None
        min3 = parse_min(row[6]) if len(row) > 6 else None

        filiere_clean = clean_name(filiere_raw)
        filiere_key = normalize_filiere(filiere_raw)
        inst_type = get_type(code_etb)

        entry = {
            'code': code_etb,
            'etab': etab,
            'code_fil': code_fil,
            'filiere': filiere_clean,
            'filiere_key': filiere_key,
            'type': inst_type,
            'min1': min1,
            'min2': min2,
            'min3': min3,
        }

        # National programs (C99 = recrutement national)
        if code_etb == 'C99':
            cat = FILIERE_TO_CATALOG.get(filiere_key)
            nat_id = cat['id'] if cat else filiere_key
            national[nat_id] = {'min1': min1, 'min2': min2, 'min3': min3, 'filiere': filiere_clean, 'filiere_key': filiere_key}
            continue

        # Group
        if filiere_key not in by_filiere:
            by_filiere[filiere_key] = []
        by_filiere[filiere_key].append(entry)

        entries.append(entry)

    # Build grandes_ecoles (P, D, E, H, W, B prefixes only)
    grandes_ecoles = [e for e in entries if e['type'] in ('grande_ecole', 'ens') and (e['min1'] or e['min2'])]
    grandes_ecoles.sort(key=lambda e: e['min1'] or 0, reverse=True)

    # Build catalog update data: for each catalog ID, compute aggregated averages
    catalog_data = {}
    for filiere_key, group in by_filiere.items():
        cat = FILIERE_TO_CATALOG.get(filiere_key)
        if not cat:
            continue
        cat_id = cat['id']
        if cat_id not in catalog_data:
            catalog_data[cat_id] = {'filiere_key': filiere_key, 'name_ar': cat['name_ar'], 'unis': []}

        for e in group:
            if e['min1'] or e['min2']:
                catalog_data[cat_id]['unis'].append({
                    'code': e['code'],
                    'name': e['etab'],
                    'type': e['type'],
                    'min1': e['min1'],
                    'min2': e['min2'],
                    'min3': e['min3'],
                })

    # For national programs, add to catalog_data by catalog ID
    for cid, nat in national.items():
        if cid not in catalog_data:
            fkey = nat.get('filiere_key', cid)
            cat = FILIERE_TO_CATALOG.get(fkey, {})
            catalog_data[cid] = {'filiere_key': fkey, 'name_ar': cat.get('name_ar', ''), 'unis': []}
        catalog_data[cid]['national'] = nat

    # Compute min avg for each catalog ID (universities only for non-medical)
    for cid, data in catalog_data.items():
        if 'national' in data:
            data['avg_sciexp'] = data['national']['min1']
            data['avg_math'] = data['national']['min2']
        else:
            # Use university entries only (exclude grandes écoles which skew avg high)
            uni_entries = [u for u in data['unis'] if u['type'] == 'university']
            ge_entries  = [u for u in data['unis'] if u['type'] in ('grande_ecole', 'ens')]
            min1s_uni = [u['min1'] for u in uni_entries if u['min1']]
            min1s_ge  = [u['min1'] for u in ge_entries  if u['min1']]
            min1s_all = [u['min1'] for u in data['unis'] if u['min1']]
            min2s_all = [u['min2'] for u in data['unis'] if u['min2']]
            # Avg of universities (most common path)
            if min1s_uni:
                data['avg_sciexp'] = round(sum(min1s_uni) / len(min1s_uni), 2)
            elif min1s_all:
                data['avg_sciexp'] = round(sum(min1s_all) / len(min1s_all), 2)
            if min2s_all:
                data['avg_math'] = round(sum(min2s_all) / len(min2s_all), 2)
            if min1s_all:
                data['min_sciexp'] = round(min(min1s_all), 2)
                data['max_sciexp'] = round(max(min1s_all), 2)
            # Best grande école minimum
            if min1s_ge:
                data['top_grande_ecole_min'] = round(min(min1s_ge), 2)

    output = {
        'year': '2025-2026',
        'note': 'Min1=علوم تجريبية | Min2=رياضيات | Min3=تقني رياضي | NC=لا يقبل',
        'total_entries': len(entries),
        'nationale': national,
        'grandes_ecoles': grandes_ecoles,
        'by_filiere': by_filiere,
        'catalog_averages': catalog_data,
    }

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print('OK Wrote ' + OUT_PATH)
    print('  Total entries: ' + str(len(entries)))
    print('  National programs: ' + str(len(national)))
    print('  Grandes ecoles (with data): ' + str(len(grandes_ecoles)))
    print('  Unique filieres: ' + str(len(by_filiere)))
    print('  Catalog IDs with data: ' + str(len(catalog_data)))
    print()
    print('Catalog averages (real 2025-2026):')
    for cid, d in sorted(catalog_data.items(), key=lambda x: x[1].get('avg_sciexp', 0), reverse=True):
        avg = d.get('avg_sciexp', '-')
        mn = d.get('min_sciexp', '-')
        mx = d.get('max_sciexp', '-')
        n_unis = len(d.get('unis', []))
        nat = 'NAT' if 'national' in d else 'avg of ' + str(n_unis)
        print('  ' + str(cid).ljust(20) + ' sciexp=' + str(avg) + '  min=' + str(mn) + ' max=' + str(mx) + '  (' + nat + ')')

if __name__ == '__main__':
    main()
