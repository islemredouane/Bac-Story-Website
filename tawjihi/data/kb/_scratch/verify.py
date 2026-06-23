# -*- coding: utf-8 -*-
"""Verify all KB outputs: counts, Arabic integrity, sample resolution."""
import json, csv, os
KB = r"C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\.claude\worktrees\cool-stonebraker-deb446\tawjihi\data\kb"
CSV_PATH = r"C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\cleaned_data_fixed.csv"

adm = json.load(open(os.path.join(KB,"admissions-full.json"), encoding="utf-8"))
fidx = json.load(open(os.path.join(KB,"filiere-index.json"), encoding="utf-8"))
spec = json.load(open(os.path.join(KB,"specialities-kb.json"), encoding="utf-8"))

# CSV record count
with open(CSV_PATH, encoding="utf-8", newline="") as f:
    n_csv = sum(1 for _ in csv.reader(f)) - 1
assert adm["_meta"]["rowCount"] == len(adm["rows"]), "meta rowCount mismatch"
assert len(adm["rows"]) == n_csv, f"rows {len(adm['rows'])} != csv {n_csv}"
print(f"[OK] admissions rows == CSV data records: {len(adm['rows'])}")

# rowIndices integrity
maxidx = max(i for e in fidx["filieres"].values() for i in e["rowIndices"])
assert maxidx < len(adm["rows"]), "rowIndex out of range"
# verify a filiere's best matches its rows
import random
k = "GENIE CIVIL"
e = fidx["filieres"][k]
mins1 = [adm["rows"][i]["min1"] for i in e["rowIndices"] if adm["rows"][i]["min1"] is not None]
assert e["best"]["min1"] == min(mins1), "best min1 wrong"
print(f"[OK] filiere-index integrity; '{k}' best.min1={e['best']['min1']} over {len(e['rowIndices'])} rows")

assert spec["_meta"]["specialityCount"] == 113 == len(spec["specialities"])
print(f"[OK] specialities count == 113")

# Arabic integrity (no mojibake / no \uXXXX escapes in file)
raw = open(os.path.join(KB,"specialities-kb.json"), encoding="utf-8").read()
assert "\\u0" not in raw, "found escaped unicode -> ensure_ascii leak"
assert "Ø" not in raw and "Ã" not in raw, "mojibake detected"
# spot real Arabic char present
assert any("؀" <= ch <= "ۿ" for ch in raw), "no Arabic chars?"
print("[OK] Arabic preserved (no escapes, no mojibake)")

# 3 sample specialities
print("\n--- 3 SAMPLE SPECIALITIES ---")
def resolve_best(keys):
    best = {"min1": None, "min2": None, "min3": None}
    for k in keys:
        b = fidx["filieres"].get(k, {}).get("best", {})
        for m in best:
            v = b.get(m)
            if v is not None and (best[m] is None or v < best[m]):
                best[m] = v
    return best
for sid in ("GC", "MEDCINE", "TRADUCTION"):
    s = next(x for x in spec["specialities"] if x["id"] == sid)
    print(f"\nID={s['id']} | cat={s['category']} | name_ar={s['name_ar']!r} | name_fr={s['name_fr']!r}")
    print(f"  sections: {len(s['sections'])} | linked filieres: {len(s['linkedFiliereKeys'])}")
    print(f"  resolved best (sciexp/math/techmath): {resolve_best(s['linkedFiliereKeys'])}")
    print(f"  averages_text[:120]: {s['averages_text'][:120]!r}")

print("\nALL CHECKS PASSED")
