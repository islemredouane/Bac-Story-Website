# -*- coding: utf-8 -*-
"""Generate specialities-kb.json from university.html (stdlib only).
Extracts 113 spec-cards (id, category, data-name, name) and links each to the
detail resource-content block, pulling section text keyed by h3/h2 titles, plus
any 2025 admission-averages text. Links to filiere-index keys by FR token match.
"""
import re, json, os, html as htmllib
from html.parser import HTMLParser
from datetime import datetime, timezone

ROOT = r"C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website"
HTML_PATH = os.path.join(ROOT, "university.html")
OUT_DIR = os.path.join(ROOT, r".claude\worktrees\cool-stonebraker-deb446\tawjihi\data\kb")

with open(HTML_PATH, "r", encoding="utf-8") as f:
    src = f.read()

# ---------- 1. Extract spec-cards (tolerant attribute parsing) ----------
cards = []
for m in re.finditer(r'<div\b([^>]*\bclass="spec-card"[^>]*)>', src):
    attrs = m.group(1)
    dc = re.search(r'data-category="([^"]*)"', attrs)
    dn = re.search(r'data-name="([^"]*)"', attrs)
    # onclick may be on the div OR within the next ~400 chars (start tag may wrap lines)
    tail = src[m.end():m.end()+500]
    oc = re.search(r"showSection\('([^']+)'\)", attrs) or re.search(r"showSection\('([^']+)'\)", tail)
    # spec-card-name (best AR name)
    nm = re.search(r'<div class="spec-card-name">(.*?)</div>', tail, re.S)
    name_ar = ""
    if nm:
        name_ar = re.sub(r"<[^>]+>", "", nm.group(1))
        name_ar = htmllib.unescape(re.sub(r"\s+", " ", name_ar)).strip()
    cards.append({
        "id": oc.group(1) if oc else None,
        "category": dc.group(1) if dc else "",
        "dataName": htmllib.unescape(dn.group(1)).strip() if dn else "",
        "name_card": name_ar,
    })

cards = [c for c in cards if c["id"]]

# ---------- 2. Extract resource-content detail blocks ----------
# Capture id -> raw inner HTML by depth-matching <div ...>...</div>.
def extract_block(s, start_idx):
    """Given index at the opening <div ... class=resource-content>, return inner html."""
    # find end of opening tag
    open_end = s.index(">", start_idx) + 1
    depth = 1
    i = open_end
    tag_re = re.compile(r"<(/?)div\b", re.I)
    while depth > 0:
        m = tag_re.search(s, i)
        if not m:
            return s[open_end:]
        if m.group(1) == "/":
            depth -= 1
        else:
            depth += 1
        i = m.end()
    # i is just after "<div" of the closing match; closing tag ended depth
    # find the '>' of that closing tag
    close_gt = s.index(">", i)
    return s[open_end:m.start()]

blocks = {}
for m in re.finditer(r'<div id="([^"]+)" class="resource-content">', src):
    bid = m.group(1)
    blocks[bid] = extract_block(src, m.start())

# ---------- 3. Plain-text + section splitting ----------
class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
        if tag in ("li", "p", "br", "tr"):
            self.parts.append("\n")
    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip:
            self.skip -= 1
        if tag in ("p", "ul", "ol", "div", "table"):
            self.parts.append("\n")
    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

def to_text(htmlfrag):
    p = TextExtractor()
    p.feed(htmlfrag)
    txt = htmllib.unescape("".join(p.parts))
    # normalize: collapse spaces within lines, collapse blank lines
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in txt.split("\n")]
    out = []
    blank = False
    for ln in lines:
        if ln == "":
            if not blank and out:
                out.append("")
            blank = True
        else:
            out.append(ln)
            blank = False
    return "\n".join(out).strip()

def strip_tags_inline(frag):
    t = re.sub(r"<[^>]+>", "", frag)
    return htmllib.unescape(re.sub(r"\s+", " ", t)).strip()

# Split a block's HTML into sections keyed by h2/h3 headings.
heading_re = re.compile(r"<(h2|h3)\b[^>]*>(.*?)</\1>", re.S | re.I)

def split_sections(block_html):
    sections = {}
    matches = list(heading_re.finditer(block_html))
    if not matches:
        # no headings: store whole block under a generic key
        txt = to_text(block_html)
        if txt:
            sections["_full"] = txt
        return sections
    for i, mm in enumerate(matches):
        title = strip_tags_inline(mm.group(2))
        if not title:
            title = f"_section_{i}"
        seg_start = mm.end()
        seg_end = matches[i+1].start() if i+1 < len(matches) else len(block_html)
        body = to_text(block_html[seg_start:seg_end])
        # merge duplicate titles
        if title in sections:
            sections[title] = sections[title] + "\n\n" + body
        else:
            sections[title] = body
    return sections

# 2025 averages text: capture lines/sections mentioning معدلات القبول or a 2025 average list
def find_averages(block_html):
    txt = to_text(block_html)
    lines = [l.strip() for l in txt.split("\n")]
    chunks = []
    num_re = re.compile(r"\b1[0-9][.,][0-9]{1,2}\b")
    for i, ln in enumerate(lines):
        is_avg_marker = ("معدل" in ln and ("2025" in ln or "2024" in ln or "القبول" in ln))
        if is_avg_marker:
            chunks.append(ln)
            # also grab up to the next 6 non-empty lines that carry stream labels / numbers
            grabbed = 0
            for nxt in lines[i+1:i+10]:
                if nxt == "":
                    if grabbed:  # stop at blank after we started collecting numbers
                        break
                    continue
                if num_re.search(nxt) or any(t in nxt for t in ("علوم تجريبية","رياضيات","تقني","شعبة","آداب","لغات","تسيير","فلسفة")):
                    chunks.append(nxt)
                    grabbed += 1
                else:
                    if grabbed:
                        break
        elif num_re.search(ln) and "معدل" in ln:
            chunks.append(ln)
    # also: any section titled with معدلات القبول
    for mm in heading_re.finditer(block_html):
        t = strip_tags_inline(mm.group(2))
        if "معدلات القبول" in t or ("معدل" in t and "قبول" in t):
            seg_start = mm.end()
            nexts = [x for x in heading_re.finditer(block_html) if x.start() > mm.start()]
            seg_end = nexts[0].start() if nexts else len(block_html)
            body = to_text(block_html[seg_start:seg_end])
            chunks.append(t + ": " + body)
    # dedupe preserve order
    seen = set(); out = []
    for c in chunks:
        c = c.strip()
        if c and c not in seen:
            seen.add(c); out.append(c)
    return "\n".join(out).strip()

# ---------- 4. Best AR/FR name from name_card + dataName ----------
ar_re = re.compile(r"[؀-ۿ]")
def split_names(name_card, data_name, sections):
    # name_ar: prefer the card name (Arabic-heavy)
    name_ar = name_card or ""
    # FR/EN: from data_name tokens that are latin (incl. accented), or from card name
    latin = re.findall(r"[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9&'\.\- ]{1,}", (data_name or "") + " " + (name_card or ""))
    latin = [x.strip() for x in latin if len(x.strip()) >= 2]
    # dedupe
    seen=set(); fr=[]
    for x in latin:
        k=x.upper()
        if k not in seen:
            seen.add(k); fr.append(x.strip())
    name_fr = " / ".join(fr[:4])
    if not name_ar:
        # fallback: first heading of block
        for k in sections:
            if ar_re.search(k):
                name_ar = k; break
    return name_ar.strip(), name_fr.strip()

# ---------- 5. Build records ----------
specs = []
missing_block = []
for c in cards:
    bid = c["id"]
    block_html = blocks.get(bid)
    if block_html is None:
        sections = {}
        averages = ""
        missing_block.append(bid)
    else:
        sections = split_sections(block_html)
        averages = find_averages(block_html)
    name_ar, name_fr = split_names(c["name_card"], c["dataName"], sections)
    specs.append({
        "id": bid,
        "category": c["category"],
        "dataName": c["dataName"],
        "name_ar": name_ar,
        "name_fr": name_fr,
        "sections": sections,
        "averages_text": averages,
        "linkedFiliereKeys": [],  # filled below
    })

# ---------- 6. Link to filiere-index ----------
with open(os.path.join(OUT_DIR, "filiere-index.json"), "r", encoding="utf-8") as f:
    fidx = json.load(f)
filiere_keys = list(fidx["filieres"].keys())

import unicodedata
STOP = {"ET","DE","DES","LA","LE","LES","DU","EN","SP","FB","AND","THE","OF","SCIENCES","SCIENCE",
        "NATIONALE","SUPERIEURE","ECOLE","UNIV","UNIVERSITE","CENTRE","SP","SPECIALITE","SPECIALITES",
        "POUR","AUX","SUR","PAR","AVEC","TXG","TCL","LAL","ENS","SUP","SUPERIEUR","NATIONAL"}
def deaccent(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
def tokens_fr(s):
    s = deaccent(s or "").upper()
    toks = re.findall(r"[A-Z]{3,}", s)
    return [t for t in toks if t not in STOP]

# Precompute filiere token sets
fil_tokens = {k: set(tokens_fr(v["label"])) for k, v in fidx["filieres"].items()}

# Document frequency of each token across filieres (for distinctiveness gating)
from collections import Counter
df = Counter()
for toks in fil_tokens.values():
    for t in toks:
        df[t] += 1
NFIL = len(fil_tokens)
# A token is "distinctive" if it appears in fewer than this many filieres.
DISTINCT_MAX = 40

# Targeted FR-keyword aliases for core academic specialities whose card keywords
# don't lexically match the CSV French labels (stemming / synonym gaps).
ALIAS = {
    "MATH": ["MATHEMATIQUES"],
    "MATH-ECO": ["MATHEMATIQUES", "ECONOMIQUES"],
    "ST": ["TECHNOLOGIES"],            # SCIENCES ET TECHNOLOGIES
    "BIOLOGIE": ["BIOLOGIQUES"],       # SCIENCES BIOLOGIQUES
    "LANGUES": ["LANGUE", "ANGLAISE", "FRANCAISE", "ESPAGNOLE", "ALLEMANDE"],
    "LANG-FIN": ["LANGUE", "ANGLAISE"],
    "GT": ["TRANSPORTS"],              # genie des transports
    "vetrinaire": ["VETERINAIRES"],
    "PARAMEDICAL": ["PARAMEDICAL"],
}

for s in specs:
    # harvest FR keywords from dataName, name_fr, AND section heading titles
    heading_text = " ".join(s["sections"].keys())
    src_tokens = set(tokens_fr(s["dataName"]) + tokens_fr(s["name_fr"]) + tokens_fr(heading_text))
    for extra in ALIAS.get(s["id"], []):
        src_tokens.add(deaccent(extra).upper())
    if not src_tokens:
        s["_linkNote"] = "no FR keywords on speciality"
        continue
    matches = []
    for k, ftok in fil_tokens.items():
        if not ftok:
            continue
        inter = src_tokens & ftok
        if not inter:
            continue
        cov = len(inter) / len(ftok)              # how much of the filiere is covered
        # distinctiveness: does any shared token rarely occur across filieres?
        has_distinctive = any(df[t] <= DISTINCT_MAX for t in inter)
        # accept if: filiere (nearly) fully covered, OR >=2 shared tokens,
        # OR a single shared but distinctive token (e.g. VETERINAIRE, TRADUCTION).
        if cov >= 0.6 or len(inter) >= 2 or has_distinctive:
            matches.append((k, cov, len(inter), len(ftok)))
    # rank: full coverage first, then more shared tokens, then shorter filiere (more specific)
    matches.sort(key=lambda x: (-x[1], -x[2], x[3]))
    s["linkedFiliereKeys"] = [m[0] for m in matches[:30]]
    if not s["linkedFiliereKeys"]:
        # categorize the gap for the report
        if re.match(r"^(ENS|ESI|ESS|EHEC|ESG|IGEE|NHSM|HNSRE|EPAU|POLYTECH|ESTIN|ESB|ESM|ESP|ISP)", s["id"], re.I):
            s["_linkNote"] = "no CSV match (grande ecole; recruited by school name, not a university filiere label)"
        elif s["category"] == "medical" or re.search(r"(kin|orthop|anesth|podolog|psychomotr|prosth|pharma|paramed|dent-hyg|radio|labo|addict|prec-med)", s["id"], re.I):
            s["_linkNote"] = "no CSV match (paramedical/medical sub-track not present as a university filiere)"
        else:
            s["_linkNote"] = "no CSV match (forward-looking/interdisciplinary speciality with no 2025 CSV equivalent)"

now = datetime.now(timezone.utc).isoformat()
out = {
    "_meta": {
        "source": "university.html",
        "specialityCount": len(specs),
        "generatedAt": now,
        "categories": sorted(set(s["category"] for s in specs)),
    },
    "specialities": specs,
}
with open(os.path.join(OUT_DIR, "specialities-kb.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

linked = sum(1 for s in specs if s["linkedFiliereKeys"])
print("specialities:", len(specs))
print("missing detail blocks:", len(missing_block), missing_block)
print("linked >=1 filiere:", linked, "/", len(specs))
print("unlinked ids:", [s["id"] for s in specs if not s["linkedFiliereKeys"]])
print("with averages_text:", sum(1 for s in specs if s["averages_text"]))
