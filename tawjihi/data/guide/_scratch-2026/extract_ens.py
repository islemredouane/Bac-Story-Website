# -*- coding: utf-8 -*-
"""
Step 1 re-extraction: streams + priority groups per program code (Circulaire 2026).
- pdfplumber tables over canon pages 16..152 (0-based) = annexes 01-08 (ENS annex 09 excluded)
- CROSS-PAGE carry-forward of merged cells (the prior extractor reset per page -> 142 empties)
- priority = ordinal index of each 'الأولوية' marker group (robust to digit garbling),
  cross-checked against decoded digits when they land in 1..3
- 'جميع شعب البكالوريا' -> all 7 streams
Output: priorities2026.json  {code: {streams:[{stream,priority}], source, note?}, ...}
        + _unresolved list, + comparison stats vs canon2026.
"""
import pdfplumber, json, re, os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
PDF = r"C:\Users\AZ\Downloads\Circulaire_07-07-2026-signed.pdf"

CODE_RE = re.compile(r"^[A-Z][A-Z0-9]{4,9}$")

HDR = {
    "code":        ["زمرلا", "زومرلا"],
    "streams":     ["ايرولاكبلا بعش", "ايرولاكابلا بعش", "ايرولاكبلا"],
    "ranking":     ["بيترتلا ساسأ"],
    "scope":       ["رئاودلا", "ةيفارغجلا"],
}

STREAM_MAP = [  # (visual substring, SPACE-FREE, code) -- order matters (techmath before math)
    ("ةيبيرجتمولع", "sciexp"),
    ("يضايرينقت", "techmath"),
    ("تايضاير", "math"),
    ("داصتقاورييست", "gestion"),
    ("داصتقإورييست", "gestion"),
    ("ةفسلفوبادآ", "lettres"),
    ("ةفسلفوبادأ", "lettres"),
    ("ةفسلفوباداء", "lettres"),
    ("ةفسلفوبادا", "lettres"),
    ("ةيبنجأتاغل", "langues"),
    ("ةيبنجاتاغل", "langues"),
    # reversed word-order variants (annex 06 layout renders words in reading order)
    ("مولعةيبيرجت", "sciexp"),
    ("ينقتيضاير", "techmath"),
    ("رييستداصتقاو", "gestion"),
    ("بادآةفسلفو", "lettres"),
    ("بادأةفسلفو", "lettres"),
    ("تاغلةيبنجأ", "langues"),
    ("نونف", "arts"),
]
ALL_STREAMS = ["sciexp", "math", "techmath", "gestion", "lettres", "langues", "arts"]
ALL_PAT = ["بعش عيمج", "عيمج"]  # جميع شعب (visual reversed)

PRIO_SPLIT = re.compile(r"ةيولولأا|ةيولولاا|ةيولوألا|ةيولوالا")

def header_role(cell):
    c = (cell or "").replace("\n", " ")
    for role, keys in HDR.items():
        for k in keys:
            if k in c:
                return role
    return None

def decode_digits(tok):
    digs = re.findall(r"\d", tok or "")
    if not digs:
        return None
    for cand in ("".join(digs), "".join(digs)[::-1]):
        v = int(cand)
        if 1 <= v <= 3:
            return v
        if v % 10 == 0 and 1 <= v // 10 <= 3:
            return v // 10
    return None

def match_streams(body):
    body = re.sub(r"\s+", "", body or "")  # patterns are space-free
    out = []
    for pat, code in STREAM_MAP:
        if pat in body:
            out.append(code)
            body = body.replace(pat, "")
    return out, body

def parse_streams(raw, warnings, code):
    """raw streams cell in pdfplumber visual order. Returns (streams, note)."""
    if not raw or not raw.strip():
        return [], None
    txt = raw.replace("\n", " ")
    # 'all streams' case: جميع شعب البكالوريا (visual: ايرولاكبلا بعش عيمج)
    if "عيمج" in txt and not PRIO_SPLIT.search(txt):
        return [{"stream": s, "priority": 1} for s in ALL_STREAMS], "all_streams"
    results = []
    note = None
    if PRIO_SPLIT.search(txt):
        parts = PRIO_SPLIT.split(txt)
        ordinal = 0
        # leading text before first marker: streams there belong to group 1 only if
        # they precede an explicit marker-1; treat as first group (matches guide layout)
        lead_streams, _ = match_streams(parts[0])
        segs = []
        if lead_streams:
            segs.append((None, parts[0]))
        for p in parts[1:]:
            m = re.match(r"^[\s:]*([0-9]{1,2})?[\s:]*(.*)$", p, re.S)
            segs.append((m.group(1) or "", m.group(2) or ""))
        for prio_tok, body in segs:
            ordinal += 1
            dec = decode_digits(prio_tok)
            prio = dec if dec is not None else ordinal
            if dec is not None and dec != ordinal:
                warnings.append({"code": code, "warn": "digit!=ordinal",
                                 "digit": dec, "ordinal": ordinal})
            if "عيمج" in body:
                for s in ALL_STREAMS:
                    results.append({"stream": s, "priority": prio})
                continue
            found, _ = match_streams(body)
            for s in found:
                results.append({"stream": s, "priority": prio})
        note = "priority_markers"
    else:
        found, _ = match_streams(txt)
        results = [{"stream": s, "priority": None} for s in found]
        note = "no_explicit_priority" if found else None
    # dedupe keep first (lowest priority group wins)
    seen = set(); out = []
    for r in results:
        if r["stream"] not in seen:
            seen.add(r["stream"]); out.append(r)
    return out, note

def main():
    programs_path = os.path.join(HERE, "..", "programs.json")
    with open(programs_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    canon = {x["code"]: x for x in data["programs"]}
    
    # Target ENS codes: empty allowedStreams
    ens_codes = {k for k, v in canon.items() if not v.get("allowedStreams")}

    per_code_cells = {}
    warnings = []
    with pdfplumber.open(PDF) as pdf:
        carry = {}
        prev_roles = None
        prev_colmap = None
        prev_ncols = None
        for pno in range(150, 169):  # ENS annexe 09 pages
            page = pdf.pages[pno]
            try:
                tables = page.extract_tables()
            except Exception as e:
                warnings.append({"page": pno, "warn": "table_error", "err": str(e)})
                continue
            for t in tables:
                colmap = {}; hdr_idx = None
                for ri, row in enumerate(t[:6]):
                    roles = {}
                    for ci, cell in enumerate(row):
                        role = header_role(cell)
                        if role and role not in roles:
                            roles[role] = ci
                    if "code" in roles and "streams" in roles:
                        colmap = roles; hdr_idx = ri
                        break
                if hdr_idx is None:
                    if prev_colmap and t and abs(len(t[0]) - prev_ncols) <= 2:
                        colmap = prev_colmap; hdr_idx = -1
                    else:
                        continue
                else:
                    roleset = frozenset(colmap)
                    if prev_roles != roleset:
                        carry = {}
                    prev_roles = roleset
                prev_colmap = colmap
                prev_ncols = len(t[0]) if t else None
                for row in t[hdr_idx + 1:]:
                    def cell(role):
                        ci = colmap.get(role)
                        if ci is None or ci >= len(row):
                            return None
                        return row[ci]
                    codes_here = []
                    prim = (cell("code") or "").strip().replace(" ", "").replace("\n", "")
                    if CODE_RE.match(prim):
                        codes_here.append(prim)
                    for c in row:
                        for tok in re.split(r"[\s\n]+", c or ""):
                            tok = tok.strip()
                            if CODE_RE.match(tok) and tok not in codes_here:
                                codes_here.append(tok)
                    sc = cell("streams")
                    carried = False
                    if sc and sc.strip():
                        carry["streams"] = sc
                    else:
                        sc = carry.get("streams")
                        carried = True
                    for code_raw in codes_here:
                        if code_raw not in canon:
                            alt = code_raw.replace("O", "0").replace("I", "1")
                            if alt in canon:
                                code_raw = alt
                            else:
                                continue
                        per_code_cells.setdefault(code_raw, []).append((pno, sc, carried))

    out = {}
    unresolved = []
    for code in ens_codes:
        cells = per_code_cells.get(code, [])
        best = None
        for want_carried in (False, True):
            for pno, sc, carried in cells:
                if carried != want_carried or not sc:
                    continue
                st, nt = parse_streams(sc, warnings, code)
                if st:
                    best = (pno, sc, carried, st, nt)
                    break
            if best:
                break
        if best is None:
            if cells:
                unresolved.append({"code": code, "reason": "streams cell unparseable", "raw": (cells[0][1] or "")[:200]})
            else:
                unresolved.append({"code": code, "reason": "code not seen in tables"})
            continue
        pno, sc, carried, streams, note = best
        canon[code]["allowedStreams"] = streams
        out[code] = streams

    with open(programs_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    print("resolved:", len(out), "unresolved:", len(unresolved))
    for u in unresolved:
        print(u)

if __name__ == "__main__":
    main()
