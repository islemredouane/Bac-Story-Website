# -*- coding: utf-8 -*-
"""Generate admissions-full.json and filiere-index.json from cleaned_data_fixed.csv (stdlib only)."""
import csv, json, re, os
from datetime import datetime, timezone

CSV_PATH = r"C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\cleaned_data_fixed.csv"
OUT_DIR  = r"C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\.claude\worktrees\cool-stonebraker-deb446\tawjihi\data\kb"

def collapse(s):
    if s is None:
        return ""
    s = s.replace("\r", " ").replace("\n", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s

def parse_min(v):
    v = (v or "").strip()
    if v == "" or v.upper() == "NC" or v == "--":
        return None
    v = v.replace(",", ".")
    try:
        return round(float(v), 2)
    except ValueError:
        return None

def classify(code):
    c = (code or "").strip().upper()
    if c == "C99":
        return "national"
    if c.startswith("P"):
        return "grande_ecole"
    return "university"  # U## and C## (incl. other C codes)

# --- Wilaya gazetteer (FR spellings as they appear in the CSV) ---
WILAYAS = [
    "ADRAR","CHLEF","LAGHOUAT","OUM EL BOUAGHI","BATNA","BEJAIA","BISKRA","BECHAR","BLIDA",
    "BOUIRA","TAMANRASSET","TEBESSA","TLEMCEN","TIARET","TIZI OUZOU","ALGER","DJELFA","JIJEL",
    "SETIF","SAIDA","SKIKDA","SIDI BEL ABBES","ANNABA","GUELMA","CONSTANTINE","MEDEA",
    "MOSTAGANEM","MSILA","M SILA","MASCARA","OUARGLA","ORAN","EL BAYADH","ILLIZI",
    "BORDJ BOU ARRERIDJ","BOUMERDES","EL TARF","TINDOUF","TISSEMSILT","EL OUED","KHENCHELA",
    "SOUK AHRAS","TIPAZA","MILA","AIN DEFLA","NAAMA","AIN TEMOUCHENT","GHARDAIA","RELIZANE",
    "TIMIMOUN","BORDJ BADJI MOKHTAR","OULED DJELLAL","BENI ABBES","IN SALAH","IN GUEZZAM",
    "TOUGGOURT","DJANET","EL MGHAIR","EL MENIA","BOUZAREAH","KOUBA","BOU SAADA","HAI SALAM",
]
# longest first so multi-word names match before substrings
WILAYAS_SORTED = sorted(set(WILAYAS), key=len, reverse=True)

def _norm_w(w):
    w = collapse(w)
    fix = {"M SILA": "MSILA", "BOUZAREAH": "ALGER", "KOUBA": "ALGER", "HAI SALAM": "ORAN"}
    return fix.get(w, w)

def extract_wilaya(etab):
    e = " " + etab.upper() + " "
    # 0) hard-coded specials / concatenated spellings
    SPECIAL = {
        "USTHB": "ALGER", "ELBAYADH": "EL BAYADH", "ELOUED": "EL OUED",
        "ELTARF": "EL TARF", "ELMGHAIR": "EL MGHAIR", "ELMENIA": "EL MENIA",
        "BORD BOU ARRERIDJ": "BORDJ BOU ARRERIDJ", "TAMANGHASSET": "TAMANRASSET",
        "BAB EZZOUAR": "ALGER", "BEN AKNOUN": "ALGER", "KHEMIS MILIANA": "AIN DEFLA",
        "KOLEA": "TIPAZA",
    }
    for k, v in SPECIAL.items():
        if k in e:
            return v.title()
    # 1) explicit known wilaya token anywhere (prefer the one nearest the end)
    found = None
    for w in WILAYAS_SORTED:
        # word-boundary-ish match
        if re.search(r"(?<![A-Z])" + re.escape(w) + r"(?![A-Z])", e):
            found = w
            break
    if found:
        return _norm_w(found).title()
    # 2) "UNIV. <X>", "UNIVERSITE D/DE <X>", "CENTRE UNIV. <X>"
    m = re.search(r"(?:UNIV\.?|UNIVERSITE)\s+(?:D['\s]+|DE\s+)?([A-Z' ]+?)(?:\s+\d+)?\s*\(", e) \
        or re.search(r"(?:UNIV\.?|UNIVERSITE)\s+(?:D['\s]+|DE\s+)?([A-Z' ]+?)(?:\s+\d+)?\s*$", e)
    if m:
        w = collapse(m.group(1))
        if w and len(w) <= 25:
            return w.title()
    # 3) school "... DE/D <X>" at end
    m = re.search(r"\bD['\s]+([A-Z' ]+?)\s*\)?\s*$", e)
    if m:
        w = collapse(m.group(1))
        if w and len(w) <= 25:
            return w.title()
    return None

rows = []
with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    for r in reader:
        etab = collapse(r.get("Etablissement"))
        fil  = collapse(r.get("Filiere"))
        code_etb = collapse(r.get("Code Etb"))
        rows.append({
            "codeEtb": code_etb,
            "etab": etab,
            "codeFil": collapse(r.get("Code Fil")),
            "filiere": fil,
            "min1": parse_min(r.get("Min1")),
            "min2": parse_min(r.get("Min2")),
            "min3": parse_min(r.get("Min3")),
            "type": classify(code_etb),
            "wilaya": extract_wilaya(etab),
        })

now = datetime.now(timezone.utc).isoformat()

admissions = {
    "_meta": {
        "source": "cleaned_data_fixed.csv",
        "rowCount": len(rows),
        "generatedAt": now,
        "streamMap": {"min1": "sciexp", "min2": "math", "min3": "techmath"},
    },
    "rows": rows,
}

os.makedirs(OUT_DIR, exist_ok=True)
with open(os.path.join(OUT_DIR, "admissions-full.json"), "w", encoding="utf-8") as f:
    json.dump(admissions, f, ensure_ascii=False, indent=2)

# --- filiere-index ---
def fkey(label):
    return collapse(label).upper()

filieres = {}
for idx, r in enumerate(rows):
    label = r["filiere"]
    if not label:
        continue
    key = fkey(label)
    if key not in filieres:
        filieres[key] = {"label": label, "rowIndices": [], "best": {"min1": None, "min2": None, "min3": None}}
    entry = filieres[key]
    entry["rowIndices"].append(idx)
    for m in ("min1", "min2", "min3"):
        v = r[m]
        if v is not None:
            cur = entry["best"][m]
            if cur is None or v < cur:
                entry["best"][m] = v

filiere_index = {
    "_meta": {
        "source": "cleaned_data_fixed.csv",
        "generatedAt": now,
        "filiereCount": len(filieres),
        "note": "rowIndices reference positions in admissions-full.json rows array; best = lowest non-null threshold across rows for that filiere.",
        "streamMap": {"min1": "sciexp", "min2": "math", "min3": "techmath"},
    },
    "filieres": filieres,
}

with open(os.path.join(OUT_DIR, "filiere-index.json"), "w", encoding="utf-8") as f:
    json.dump(filiere_index, f, ensure_ascii=False, indent=2)

# wilaya coverage
wcov = sum(1 for r in rows if r["wilaya"])
print("rows:", len(rows))
print("filieres:", len(filieres))
print("wilaya coverage:", wcov, "/", len(rows), f"({100*wcov/len(rows):.1f}%)")
print("type counts:", {t: sum(1 for r in rows if r['type']==t) for t in ('national','grande_ecole','university')})
print("sample row:", json.dumps(rows[0], ensure_ascii=False))
