# -*- coding: utf-8 -*-
"""
Fallback for codes whose table rows pdfplumber never emits: parse the PyMuPDF
reading-order text dump (circ2026-fitz.txt). For each unresolved code, take the
text segment bounded by neighboring program codes and mine stream names +
'الأولوية NN' markers from it (segment before the code first, then after).
Merges results into priorities2026.json with source='text-fallback'.
"""
import json, re, os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))

# reading-order patterns, matched space-free (lam-alef garbles included)
STREAMS = [
    ("علومتجريبية", "sciexp"),
    ("تقنيرياضي", "techmath"),
    ("رياضيات", "math"),
    ("تسييرواقتصاد", "gestion"),
    ("اقتصادوتسيير", "gestion"),
    ("آدابوفلسفة", "lettres"),
    ("أدابوفلسفة", "lettres"),
    ("ادابوفلسفة", "lettres"),
    ("اآدابوفلسفة", "lettres"),
    ("لغاتأجنبية", "langues"),
    ("لغاتاجنبية", "langues"),
    ("فنون", "arts"),
]
ALL = ["sciexp", "math", "techmath", "gestion", "lettres", "langues", "arts"]
PRIO = re.compile(r"األولوية|الأولوية|االولوية|الاولوية")
CODE = re.compile(r"[A-Z][A-Z0-9]{7}")

def sq(s):  # squeeze whitespace out
    return re.sub(r"\s+", "", s)

def parse_segment(seg):
    """seg: raw reading-order text. Returns [{stream,priority}] or []."""
    seg = sq(seg)
    out = []
    if PRIO.search(seg):
        parts = PRIO.split(seg)
        ordinal = 0
        for i, p in enumerate(parts):
            if i == 0:
                continue
            ordinal += 1
            m = re.match(r"^[:\s]*(\d{1,2})?", p)
            dig = m.group(1)
            prio = ordinal
            if dig:
                v = int(dig)
                if 1 <= v <= 3:
                    prio = v
                elif 1 <= int(dig[::-1]) <= 3:
                    prio = int(dig[::-1])
            body = p
            if "جميعشعب" in body or "جميعالشعب" in body:
                for s in ALL:
                    out.append({"stream": s, "priority": prio})
                continue
            for pat, code in STREAMS:
                if pat in body:
                    out.append({"stream": code, "priority": prio})
                    body = body.replace(pat, "")
    else:
        if "جميعشعب" in seg or "جميعالشعب" in seg:
            return [{"stream": s, "priority": 1} for s in ALL]
        for pat, code in STREAMS:
            if pat in seg:
                out.append({"stream": code, "priority": None})
                seg = seg.replace(pat, "")
    seen = set(); res = []
    for r in out:
        if r["stream"] not in seen:
            seen.add(r["stream"]); res.append(r)
    return res

def main():
    txt = open(os.path.join(HERE, "circ2026-fitz.txt"), encoding="utf-8").read()
    parts = re.split(r"===== PAGE (\d+) =====\n", txt)
    pages = {int(parts[i]): parts[i + 1] for i in range(1, len(parts), 2)}
    res = json.load(open(os.path.join(HERE, "priorities2026.json"), encoding="utf-8"))
    progs, unresolved = res["programs"], res["unresolved"]
    todo = [u for u in unresolved if "ENS" not in u["reason"]]
    solved = {}
    for u in todo:
        code = u["code"]
        found = None
        for pgno, ptxt in pages.items():
            if pgno > 153:      # ENS annex + institution grid: skip
                continue
            for m in re.finditer(re.escape(code), ptxt):
                i, j = m.start(), m.end()
                # segment boundaries = neighboring OTHER codes
                prev_end = 0
                nxt_start = len(ptxt)
                for cm in CODE.finditer(ptxt):
                    if cm.end() <= i and cm.group(0) != code:
                        prev_end = max(prev_end, cm.end())
                    if cm.start() >= j and cm.group(0) != code and cm.start() < nxt_start:
                        nxt_start = cm.start()
                before = ptxt[prev_end:i][-900:]
                after = ptxt[j:nxt_start][:900]
                st = parse_segment(before)
                which = "before"
                if not st:
                    st = parse_segment(after)
                    which = "after"
                if st:
                    found = {"streams": st, "source": "text-fallback",
                             "page": pgno - 1, "note": "fitz_row_segment_" + which}
                    break
            if found:
                break
        if found:
            solved[code] = found
    # apply
    for code, rec in solved.items():
        progs[code] = rec
    res["unresolved"] = [u for u in unresolved if u["code"] not in solved]
    json.dump(res, open(os.path.join(HERE, "priorities2026.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("fallback solved:", len(solved))
    for c, r in solved.items():
        print(" ", c, r["page"], r["note"],
              [(s["stream"], s["priority"]) for s in r["streams"]])
    left = [u for u in res["unresolved"] if "ENS" not in u["reason"]]
    print("still unresolved (non-ENS):", len(left), [u["code"] for u in left])

if __name__ == "__main__":
    main()
