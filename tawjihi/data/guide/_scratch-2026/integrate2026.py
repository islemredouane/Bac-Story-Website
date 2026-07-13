# -*- coding: utf-8 -*-
"""
Step 2: assemble the production guide programs.json for 2026 from
canon2026.json (+ priorities2026.json), preserving the 2025 schema exactly:
{ "programs": [ {code, field_ar, branch_ar, institutions_ar, scope,
  circleWilayaNums, allowedStreams, rankingBasis, minThreshold,
  conditions_ar, _note, _confidence, _page} ] }
Backs up the 2025 file to _scratch-2026/programs-2025-baseline.json.
Other guide JSONs (streams/weighted-formulas/geographic-circles/
eligibility-matrix/acceptance-types) are left untouched: no differing 2026
data was extracted for them.
"""
import json, os, re
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
GUIDE = os.path.dirname(HERE)

def fix_ligatures(s):
    """Normalize the broken lam-alef ligatures from the PDF text layer."""
    if not s:
        return s
    s = s.replace("األ", "الأ").replace("اإل", "الإ").replace("اآل", "الآ")
    # standalone broken forms inside words prefixed by ب/ل/ك etc are covered
    # by the above since the garble always renders as ا + hamza-form + ل.
    return s

def parse_institutions(raw):
    txt = fix_ligatures(raw or "").strip()
    if not txt:
        return []
    parts = re.split(r"\n|(?:^|\s)-\s*", txt)
    return [p.strip(" -،.") for p in parts if p and p.strip(" -،.")]

def main():
    canon = json.load(open(os.path.join(HERE, "canon2026.json"), encoding="utf-8"))
    prio = json.load(open(os.path.join(HERE, "priorities2026.json"), encoding="utf-8"))
    pmap, unresolved = prio["programs"], {u["code"]: u["reason"] for u in prio["unresolved"]}

    base_path = os.path.join(GUIDE, "programs.json")
    baseline = json.load(open(base_path, encoding="utf-8"))["programs"]
    by_code_2025 = {p["code"]: p for p in baseline}

    # prefix (first letter) -> most common 2025 field_ar, for codes lacking field
    pref_field = {}
    cnt = {}
    for p in baseline:
        f = (p.get("field_ar") or "").strip()
        if f:
            cnt.setdefault(p["code"][0], Counter())[f] += 1
    for k, c in cnt.items():
        pref_field[k] = c.most_common(1)[0][0]

    # backup 2025 baseline
    bak = os.path.join(HERE, "programs-2025-baseline.json")
    if not os.path.exists(bak):
        json.dump({"programs": baseline}, open(bak, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)

    programs = []
    stats = Counter()
    for code in sorted(canon):
        v = canon[code]
        old = by_code_2025.get(code, {})
        field_ar = fix_ligatures((v.get("field_ar") or "").strip()) or \
                   (old.get("field_ar") or "").strip() or \
                   pref_field.get(code[0], "")
        branch_ar = fix_ligatures((v.get("branch_ar") or "").strip()) or \
                    (old.get("branch_ar") or "").strip()
        inst = parse_institutions(v.get("inst_raw"))
        if not inst and old.get("institutions_ar"):
            inst = old["institutions_ar"]
            stats["institutions_from_2025"] += 1
        rec_p = pmap.get(code)
        if rec_p:
            allowed = rec_p["streams"]
            note = rec_p.get("note")
            if rec_p.get("source") == "visual":
                note = (note + "; " if note else "") + "streams_verified_visually"
        else:
            allowed = []
            note = "streams_unresolved: " + unresolved.get(code, "unknown")
        prog = {
            "code": code,
            "field_ar": field_ar,
            "branch_ar": branch_ar,
            "institutions_ar": inst,
            "scope": v.get("scope") or "unknown",
            "circleWilayaNums": v.get("circles") or [],
            "allowedStreams": allowed,
            "rankingBasis": v.get("rankingBasis"),
            "minThreshold": v.get("minThreshold"),
            "conditions_ar": fix_ligatures(v.get("ranking_raw") or ""),
            "_note": note,
            "_confidence": ("high" if allowed and field_ar and (v.get("scope") in ("national", "regional"))
                            else ("medium" if allowed or field_ar else "low")),
            "_page": min(v["pages"]) if v.get("pages") else None,
        }
        programs.append(prog)
        stats["total"] += 1
        stats["conf_" + prog["_confidence"]] += 1
        if allowed:
            stats["with_streams"] += 1
        if prog["scope"] == "national":
            stats["national"] += 1
        elif prog["scope"] == "regional":
            stats["regional"] += 1
        if prog["minThreshold"] is not None:
            stats["with_threshold"] += 1
        if not field_ar:
            stats["no_field"] += 1

    out = {"programs": programs,
           "_source": "Circulaire MESRS 2026-07-07 (annexes 01-08; annexe 09 ENS pending)",
           "_extracted": "2026-07-11"}
    json.dump(out, open(base_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(dict(stats))
    # 2025 vs 2026 diff counts
    new_codes = set(canon) - set(by_code_2025)
    gone = set(by_code_2025) - set(canon)
    print("2025 programs:", len(baseline), "| 2026 programs:", len(programs))
    print("new in 2026:", len(new_codes), "| removed vs 2025:", len(gone))
    same = [c for c in canon if c in by_code_2025]
    ch_scope = sum(1 for c in same if (canon[c].get("scope") or "unknown") != by_code_2025[c].get("scope"))
    ch_thr = sum(1 for c in same if canon[c].get("minThreshold") != by_code_2025[c].get("minThreshold"))
    print("kept codes:", len(same), "| scope changed:", ch_scope, "| threshold changed:", ch_thr)

if __name__ == "__main__":
    main()
