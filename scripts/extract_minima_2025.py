# Deterministic extraction of BAC-2025 phase-1 minimum averages
# MESRS PDF: ruled table | Code Etb | Etablissement | Code Fil | Filiere | Min1 | Min2 | Min3
import pdfplumber, csv, json, re, sys

PDF = r"C:\Users\AZ\Downloads\BAC-2025-Moyennes-minimales-suite-a-la-phase-1.pdf"
OUT_CSV = r"C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\.claude\worktrees\cool-stonebraker-deb446\FETCH_HEAD\tawjihi\data\averages-2025\minima-phase1-2025.csv"
OUT_JSON = r"C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\.claude\worktrees\cool-stonebraker-deb446\FETCH_HEAD\tawjihi\data\averages-2025\minima-phase1-2025.script.json"

NUM = re.compile(r"^\d{1,2}[.,]\d{2}$")

def parse_min(cell):
    """Return (value, status). status: value | none_assigned | NC | not_applicable"""
    if cell is None:
        return None, "not_applicable"
    t = str(cell).strip()
    if t == "" or t == "/":
        return None, "not_applicable"
    if t == "--":
        return None, "none_assigned"
    if t.upper() == "NC":
        return None, "NC"
    t2 = t.replace(",", ".")
    if NUM.match(t2):
        return float(t2), "value"
    return None, f"unparsed:{t}"

rows_out = []
unparsed = []
with pdfplumber.open(PDF) as pdf:
    npages = len(pdf.pages)
    print("pages:", npages, flush=True)
    for pi, page in enumerate(pdf.pages, start=1):
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                if not row or all(c in (None, "") for c in row):
                    continue
                cells = [(c or "").replace("\n", " ").strip() for c in row]
                # skip header rows
                joined = " ".join(cells).lower()
                if "code etb" in joined or "etablissement" in joined and "filiere" in joined:
                    continue
                # expect 7 columns; tolerate merged variants
                if len(cells) < 7:
                    continue
                etb_code, etb, code_fil, filiere = cells[0], cells[1], cells[2], cells[3]
                m1_raw, m2_raw, m3_raw = cells[4], cells[5], cells[6]
                if not code_fil and not filiere:
                    continue
                # skip stray non-data rows (no filière code pattern)
                if code_fil and not re.match(r"^[A-Z][A-Z0-9]{5,}$", code_fil.replace(" ", "")):
                    # allow continuation rows where only text wrapped — skip silently
                    continue
                m1, s1 = parse_min(m1_raw)
                m2, s2 = parse_min(m2_raw)
                m3, s3 = parse_min(m3_raw)
                for s, raw in ((s1, m1_raw), (s2, m2_raw), (s3, m3_raw)):
                    if s.startswith("unparsed"):
                        unparsed.append((pi, code_fil, raw))
                rows_out.append({
                    "code": code_fil.replace(" ", ""),
                    "name_fr": filiere,
                    "etb_code": etb_code.replace(" ", ""),
                    "institution_fr": etb,
                    "min1": m1, "min1_status": s1,
                    "min2": m2, "min2_status": s2,
                    "min3": m3, "min3_status": s3,
                    "page": pi,
                })
        if pi % 50 == 0:
            print(f"  page {pi}/{npages} — rows so far {len(rows_out)}", flush=True)

print("total rows:", len(rows_out))
print("unparsed cells:", len(unparsed), unparsed[:10])

with open(OUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=list(rows_out[0].keys()))
    w.writeheader()
    w.writerows(rows_out)
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump({"source": "python pdfplumber deterministic extraction", "count": len(rows_out), "entries": rows_out}, f, ensure_ascii=False, indent=1)
print("written:", OUT_CSV)
