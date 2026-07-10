# -*- coding: utf-8 -*-
"""
Extract 2026 circulaire program registry (annexes 01-09, PDF pages 17-170 1-based)
into programs-2026 draft JSON, following the 2025 extraction method:
- header-keyword column mapping (visual-order Arabic)
- Arabic cells reversed per line back to reading order
- digits (wilaya lists, thresholds) taken from RAW cells
- carry-forward of merged cells within one table
"""
import pdfplumber, json, re, os, sys

PDF = r"C:\Users\AZS\Downloads\Circulaire_07-07-2026-signed.pdf".replace("AZS", "AZ")
OUT = r"C:\Users\AZ\AppData\Local\Temp\claude\C--Users-AZ-Documents-BAC-CHANNEL-Bac-Story-Website--claude-worktrees-cool-stonebraker-deb446\20380bb3-e16d-4c66-97bb-c3b548cb9248\scratchpad"

CODE_RE = re.compile(r"^[A-Z][A-Z0-9]{4,9}$")

# header keywords in VISUAL (reversed) order as pdfplumber returns them
HDR = {
    "code":        ["زمرلا", "زومرلا"],
    "field":       ["نيوكتلا ناديم"],
    "branch":      ["نيوكتلا عورف", "عورف"],
    "specialty":   ["تاصصخت"],
    "institutions":["تاسسؤم", "يدعاق نيوكت"],
    "scope":       ["رئاودلا", "ةيفارغجلا"],
    "streams":     ["ايرولاكبلا بعش", "ايرولاكابلا بعش", "ايرولاكبلا"],
    "ranking":     ["بيترتلا ساسأ"],
    "ftype":       ["نيوكتلا عون"],
    "branch2":     ["نيوكتلا بعش"],  # ENS pages: شعب التكوين
}

STREAM_MAP = [  # (visual substring, code)
    ("ةيبيرجت مولع", "sciexp"),
    ("يضاير ينقت", "techmath"),
    ("تايضاير", "math"),
    ("داصتقاو رييست", "gestion"),
    ("ةفسلفو بادآ", "lettres"),
    ("ةفسلفو باداء", "lettres"),
    ("ةيبنجأ تاغل", "langues"),
    ("نونف", "arts"),
]
SUBTRACK_MAP = [
    ("قئارطلا ةسدنه", "techmath-procedes"),
    ("ةيندم ةسدنه", "techmath-civil"),
    ("ةيئابرهك ةسدنه", "techmath-elec"),
    ("ةيكيناكيم ةسدنه", "techmath-meca"),
]

def rev(s):
    """Reverse each line of visual-order Arabic back to reading order."""
    if not s:
        return ""
    lines = s.split("\n")
    out = []
    for ln in lines:
        out.append(ln[::-1])
    return "\n".join(out)

def fix_digits(s):
    """After naive reversal, multi-digit numbers & Latin substrings are flipped.
    Re-flip digit/Latin runs so '02' stays '02'."""
    return re.sub(r"[A-Za-z0-9./]+", lambda m: m.group(0)[::-1], s)

def clean_ar(s):
    r = fix_digits(rev(s or ""))
    r = re.sub(r"[ \t]+", " ", r).strip()
    return r

def header_role(cell):
    c = (cell or "").replace("\n", " ")
    for role, keys in HDR.items():
        for k in keys:
            if k in c:
                return role
    return None

def parse_scope(raw):
    """raw scope cell (visual). Returns (scope, wilayas)."""
    if raw is None:
        return None, []
    if "ينطو" in raw:  # وطني reversed
        return "national", []
    nums = [int(n) for n in re.findall(r"\d{1,2}", raw)]
    nums = sorted({n for n in nums if 1 <= n <= 58})
    if nums:
        return "regional", nums
    return None, []

PRIO_SPLIT = re.compile(r"ةيولولأا|ةيولولاا|ةيولوألا")

def decode_prio(tok):
    """Decode a visual priority token like '01:', ':40', '42:' -> int or None."""
    digs = re.findall(r"\d", tok)
    if not digs:
        return None
    # digits appear visually; try both orders, prefer value in 1..4 after removing zeros
    for cand in ("".join(digs), "".join(digs)[::-1]):
        v = int(cand)
        if 1 <= v <= 4:
            return v
        # values like 40 -> strip trailing zeros => 4? avoid guessing beyond simple flips
        if v % 10 == 0 and 1 <= v // 10 <= 4:
            return v // 10
    return None

def parse_streams(raw):
    """raw streams cell (visual order). Split into priority groups if markers exist."""
    if not raw or not raw.strip():
        return [], None
    txt = raw.replace("\n", " ")
    has_prio = bool(PRIO_SPLIT.search(txt))
    results = []
    if has_prio:
        # split into segments: marker token possibly adjacent to digits before/after
        parts = PRIO_SPLIT.split(txt)
        # parts[0] = text before first marker (may contain digits of first marker)
        # each subsequent part starts with the digits/colon of its marker then streams
        markers = []
        segs = []
        for i, p in enumerate(parts):
            if i == 0:
                lead = p.strip()
                if lead and re.search(r"[؀-ۿ]", lead):
                    segs.append((None, lead))
                continue
            m = re.match(r"^[\s:]*([0-9]{1,2})?[\s:]*(.*)$", p, re.S)
            prio_tok = m.group(1) or ""
            # also digits may sit at END of previous part; check
            body = m.group(2) or ""
            markers.append(prio_tok)
            segs.append((prio_tok, body))
        rank = 0
        for prio_tok, body in segs:
            rank += 1
            prio = decode_prio(prio_tok or "") or rank
            for pat, code in SUBTRACK_MAP:
                if pat in body:
                    results.append({"stream": code, "priority": prio})
                    body = body.replace(pat, "")
            for pat, code in STREAM_MAP:
                if pat in body:
                    results.append({"stream": code, "priority": prio})
                    body = body.replace(pat, "")
    else:
        body = txt
        for pat, code in SUBTRACK_MAP:
            if pat in body:
                results.append({"stream": code, "priority": None})
                body = body.replace(pat, "")
        for pat, code in STREAM_MAP:
            if pat in body:
                results.append({"stream": code, "priority": None})
                body = body.replace(pat, "")
    # dedupe keep first
    seen = set(); out = []
    for r in results:
        if r["stream"] not in seen:
            seen.add(r["stream"]); out.append(r)
    return out, has_prio

def parse_ranking(raw):
    if not raw or not raw.strip():
        return None, None, ""
    has_w = "نوزوملا" in raw
    has_g = "ماعلا" in raw
    if has_w and has_g:
        basis = "weighted_or_general"
    elif has_w:
        basis = "weighted"
    elif has_g:
        basis = "general"
    else:
        basis = None
    # threshold from RAW: patterns like 20/10.00 or 20/12.00 (rendered 10.00/20)
    thr = None
    m = re.search(r"20\s*/\s*(\d{1,2}[.,]\d{2})", raw)
    if m:
        thr = float(m.group(1).replace(",", "."))
    else:
        m2 = re.search(r"(\d{1,2}[.,]\d{2})\s*/\s*20", raw)
        if m2:
            thr = float(m2.group(1).replace(",", "."))
    return basis, thr, clean_ar(raw)

def parse_institutions(raw):
    txt = clean_ar(raw or "")
    if not txt:
        return []
    parts = re.split(r"\n|(?:^|\s)-\s*", txt)
    return [p.strip(" -،.") for p in parts if p and p.strip(" -،.")]

def main():
    start, end = 16, 170  # 0-based inclusive range: PDF pages 17..170 (annexes 01-09)
    programs = {}
    page_stats = []
    with pdfplumber.open(PDF) as pdf:
        for pno in range(start, end + 1):
            page = pdf.pages[pno]
            try:
                tables = page.extract_tables()
            except Exception as e:
                page_stats.append({"page": pno + 1, "error": str(e)})
                continue
            page_rows = 0
            for t in tables:
                # find header row & column mapping
                colmap = {}
                hdr_idx = None
                for ri, row in enumerate(t[:6]):
                    roles = {}
                    for ci, cell in enumerate(row):
                        role = header_role(cell)
                        if role and role not in roles:
                            roles[role] = ci
                    if "code" in roles and ("ranking" in roles or "streams" in roles or "scope" in roles):
                        colmap = roles; hdr_idx = ri
                        break
                if hdr_idx is None:
                    continue
                if "branch" not in colmap and "branch2" in colmap:
                    colmap["branch"] = colmap["branch2"]
                carry = {}
                for row in t[hdr_idx + 1:]:
                    def cell(role):
                        ci = colmap.get(role)
                        if ci is None or ci >= len(row):
                            return None
                        return row[ci]
                    code_raw = (cell("code") or "").strip().replace(" ", "").replace("\n", "")
                    # code cells are Latin: pdfplumber may reverse? codes looked correct raw.
                    code = code_raw if CODE_RE.match(code_raw) else None
                    # update carry with any non-empty cells
                    for role in ("field", "branch", "specialty", "institutions",
                                 "scope", "streams", "ranking", "ftype"):
                        v = cell(role)
                        if v and v.strip():
                            carry[role] = v
                    if not code:
                        continue
                    page_rows += 1
                    scope, wilayas = parse_scope(carry.get("scope"))
                    streams, has_prio = parse_streams(carry.get("streams"))
                    basis, thr, cond = parse_ranking(carry.get("ranking"))
                    rec = {
                        "code": code,
                        "field_ar": clean_ar(carry.get("field") or ""),
                        "branch_ar": clean_ar(carry.get("branch") or ""),
                        "specialties_ar": clean_ar(carry.get("specialty") or ""),
                        "institutions_ar": parse_institutions(carry.get("institutions")),
                        "scope": scope or "unknown",
                        "circleWilayaNums": wilayas,
                        "allowedStreams": streams,
                        "rankingBasis": basis,
                        "minThreshold": thr,
                        "conditions_ar": cond,
                        "_hasPrioMarkers": bool(has_prio),
                        "_page": pno,  # 0-based like 2025
                    }
                    # confidence
                    if rec["field_ar"] or rec["branch_ar"]:
                        if rec["allowedStreams"] and rec["scope"] != "unknown":
                            rec["_confidence"] = "high"
                        else:
                            rec["_confidence"] = "medium"
                    else:
                        rec["_confidence"] = "low"
                    # keep highest-confidence per code
                    order = {"high": 2, "medium": 1, "low": 0}
                    if code not in programs or order[rec["_confidence"]] > order[programs[code]["_confidence"]]:
                        programs[code] = rec
            page_stats.append({"page": pno + 1, "rows": page_rows})
    progs = list(programs.values())
    with open(os.path.join(OUT, "programs-2026-draft.json"), "w", encoding="utf-8") as f:
        json.dump({"programs": progs}, f, ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, "page-stats.json"), "w", encoding="utf-8") as f:
        json.dump(page_stats, f, ensure_ascii=False, indent=1)
    print("programs:", len(progs))
    from collections import Counter
    print("confidence:", Counter(p["_confidence"] for p in progs))
    print("scope:", Counter(p["scope"] for p in progs))
    print("withStreams:", sum(1 for p in progs if p["allowedStreams"]))
    print("withPrio:", sum(1 for p in progs if any(s["priority"] for s in p["allowedStreams"])))
    print("withThr:", sum(1 for p in progs if p["minThreshold"] is not None))
    zero_pages = [s["page"] for s in page_stats if s.get("rows") == 0]
    print("zero-row pages:", zero_pages)

if __name__ == "__main__":
    main()
