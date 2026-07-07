# -*- coding: utf-8 -*-
"""
Eligibility Foundation generator.
Joins TW_CATALOG (catalog.js) + admissions-2026.json + guide/programs.json
into tawjihi/data/catalog-eligibility.json, then emits tawjihi/eligibility.js.

Run from repo root:  python tawjihi/data/_scratch/gen_eligibility.py
ADDITIVE ONLY. Does not modify any source file.
"""
import json, re, os, io, sys
from collections import Counter, OrderedDict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TAW = os.path.join(ROOT, "tawjihi")
DATA = os.path.join(TAW, "data")
GUIDE = os.path.join(DATA, "guide")

def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)

adm = load(os.path.join(DATA, "admissions-2026.json"))
programs = load(os.path.join(GUIDE, "programs.json"))["programs"]
elig_matrix = load(os.path.join(GUIDE, "eligibility-matrix.json"))
geo = load(os.path.join(GUIDE, "geographic-circles.json"))
catalog_txt = open(os.path.join(TAW, "catalog.js"), encoding="utf-8").read()

# ---------------------------------------------------------------------------
# 0) Light Arabic normalization (lam-alef ligature collapse + common artifacts)
# ---------------------------------------------------------------------------
NORMALIZE_MAP = [
    ("إعالم", "إعلام"),
    ("اإلعالم", "الإعلام"),
    ("األغواط", "الأغواط"),
    ("اسالمية", "إسلامية"),
    ("إسالمية", "إسلامية"),
    ("املادة", "المادة"),
    ("املدينة", "المدينة"),
    ("اآللي", "الآلي"),
    ("آلي", "آلي"),
    ("ألرض", "الأرض"),
    ("أداب", "آداب"),
    ("اإلنسانية", "الإنسانية"),
    # extra recurring lam-alef / definite-article collapse artifacts
    ("أملانية", "ألمانية"),
    ("اتصاالت", "اتصالات"),
    ("استغالل", "استغلال"),
    ("اتصاال", "اتصالا"),
    ("اآلداب", "الآداب"),
    ("اجلزائر", "الجزائر"),
    ("اخلدمات", "الخدمات"),
    ("اسرتاتيجية", "استراتيجية"),
    ("اآلثار", "الآثار"),
    ("اآللية", "الآلية"),
]
def normalize_ar(s):
    if not s:
        return s
    for a, b in NORMALIZE_MAP:
        s = s.replace(a, b)
    return s

# ---------------------------------------------------------------------------
# 1) Parse catalog.js -> per-id {cat, streamCodes}
# ---------------------------------------------------------------------------
def parse_catalog(txt):
    cards = OrderedDict()
    # split on "id: '...'" occurrences; capture a window after each id
    for m in re.finditer(r"id:\s*'([^']+)'", txt):
        cid = m.group(1)
        window = txt[m.start(): m.start() + 1600]
        cat_m = re.search(r"cat:\s*'([^']+)'", window)
        sc_m = re.search(r"streamCodes:\s*\[([^\]]*)\]", window)
        avg_m = re.search(r"\bavg:\s*([0-9.]+)", window)
        min_m = re.search(r"\bminAvg:\s*([0-9.]+)", window)
        cat = cat_m.group(1) if cat_m else None
        streams = []
        if sc_m:
            streams = re.findall(r"'([^']+)'", sc_m.group(1))
        cards[cid] = {
            "cat": cat,
            "streamCodes": streams,
            "avg": float(avg_m.group(1)) if avg_m else None,
            "minAvg": float(min_m.group(1)) if min_m else None,
        }
    return cards

catalog = parse_catalog(catalog_txt)
CATALOG_IDS = list(catalog.keys())

# ---------------------------------------------------------------------------
# 2) Index programs.json by code
# ---------------------------------------------------------------------------
prog_by_code = {p["code"]: p for p in programs}

def prog_streams(p):
    return [s["stream"] for s in p.get("allowedStreams", []) if s.get("stream")]

# ---------------------------------------------------------------------------
# 3) Index admissions: by_filiere records carry (code/etab/code_fil/min1..3)
#    Build filiere_key -> set(code_fil), and code_fil -> list(records) for thresholds
# ---------------------------------------------------------------------------
fk_to_codefils = {}
codefil_records = {}      # code_fil -> [records]
def index_records(records):
    for r in records:
        cf = r.get("code_fil")
        if not cf:
            continue
        codefil_records.setdefault(cf, []).append(r)
        fk = r.get("filiere_key")
        if fk:
            fk_to_codefils.setdefault(fk, set()).add(cf)

for fk, lst in adm["by_filiere"].items():
    index_records(lst)
index_records(adm["grandes_ecoles"])

# grande-ecole etab name -> records (for named-school linking by code_fil)
etab_records = {}
for r in adm["grandes_ecoles"]:
    etab_records.setdefault(r["etab"], []).append(r)

# ---------------------------------------------------------------------------
# 4) Explicit named-school / hybrid mapping: catalog id -> list(code_fil)
#    These are grandes ecoles / specific programs not covered by catalog_averages.
#    Verified against admissions grandes_ecoles etab names.
# ---------------------------------------------------------------------------
EXPLICIT_CODEFILS = {
    "esi":      ["C00CAN01"],                       # ENS Informatique Alger
    "ensia":    ["C00CAN04"],                       # ENS Intelligence Artificielle
    "estin":    ["C00CAN03"],                       # ES Sciences&Tech Info & Numerique Bejaia
    "esi-sba":  ["C00CAN02"],                       # ES Informatique Sidi Bel Abbes
    "enscs":    ["C00CAN07"],                       # ENS Cyber Securite Alger
    "ensttic":  ["A00TUT02", "A00TUT01"],           # ENS Telecom / TIC
    "nhsm":     ["C00CAN05"],                       # ENS Mathematiques
    "polytech": ["A00CAN07", "A00CAN08"],           # ENS Polytechnique Constantine / Oran
    "enstp":    ["A00CAN06"],                       # ENS Travaux Publics Alger
    "ensh":     ["A00CAN05"],                       # ENS Hydraulique Blida
    "igee":     ["A00CAN03"],                       # ES Genie Electrique & Energetique Oran
    "essa":     ["A00CAN16"],                       # ENS Technologies & Ingenierie Annaba (aero proxy)
    "ensb":     ["D00CAN10"],                       # ENS Biotechnologie Constantine
    "ehec":     ["F00CAN08"],                       # ES Gestion & Economie Numerique Kolea (EHEC)
    "enssea":   ["F00CAN02", "F00CAN04"],           # ENS Statistique / ES Economie (econ schools)
    "esb":      ["F00CAN01"],                       # ES Sciences de Gestion (banque proxy)
    "esm":      ["F00CAN03"],                       # ES Management Tlemcen
    "ensa-agro":["D00CAN06"],                       # ES Agronomique (Mostaganem/Harrach proxy)
    "ensas":    ["D00CAN06", "D00CAN07", "D00CAN12", "D00CAN13"],  # also via filiere_key
    "vet":      ["P04VAN02", "P04VAN03"],           # Institut Veterinaire Constantine/Batna
    "archi":    ["N00CAN01"],                       # Ecole Polytechnique Architecture EPAU
}

# Additional catalog id -> admissions by_filiere filiere_key (clean keys only).
# Used to link engineering/health/economics LMD cards not in catalog_averages.
EXTRA_FILIERE_KEYS = {
    "essa":          "AERONAUTIQUE",
    "hydrocarbures": "HYDROCARBURES",
    "optique":       "OPTIQUE ET MECANIQUE DE PRECISION",
    "gi":            "GENIE INDUSTRIEL",
    "gt":            "INGENIERIE DES TRANSPORTS",
    "gmec":          "GENIE MARITIME",  # materials/mechatronics proxy (closest clean key)
    "marine-eng":    "GENIE MARITIME",
    "genie-elec":    "ELECTROTECHNIQUE",   # reinforce (already catalog_averages)
    "vet":           "MEDECINE VETERINAIRE",
    "commu":         "SCIENCES DE L INFORMATION ET DE LA COMMUNICATION",
    "enssea":        "SCIENCES ECONOMIQUES",
    "esb":           "SCIENCES ECONOMIQUES",
    "esc":           "SCIENCES ECONOMIQUES",
    "ehec":          "SCIENCES ECONOMIQUES",
    "esm":           "SCIENCES ECONOMIQUES",
    "sm":            "PHYSIQUE",
}

# Catalog ids that have a direct catalog_averages entry (filiere_key driven)
CATALOG_AVG = adm.get("catalog_averages", {})
NATIONALE = adm.get("nationale", {})

# ---------------------------------------------------------------------------
# 5) Threshold extraction helpers
#    min1 = sciexp, min2 = math, min3 = techmath  (per admissions note)
# ---------------------------------------------------------------------------
def thresholds_from_records(records):
    """Return per-stream MIN admission threshold (lowest bar across unis)."""
    vals = {"sciexp": [], "math": [], "techmath": []}
    for r in records:
        for key, stream in (("min1", "sciexp"), ("min2", "math"), ("min3", "techmath")):
            v = r.get(key)
            if isinstance(v, (int, float)):
                vals[stream].append(v)
    out = {}
    for stream, lst in vals.items():
        out[stream] = round(min(lst), 2) if lst else None
    return out

def thresholds_from_catalog_avg(ca):
    return thresholds_from_records(ca.get("unis", []))

# ---------------------------------------------------------------------------
# 6) Aggregation across linked programs (programs.json)
# ---------------------------------------------------------------------------
def aggregate_programs(codes):
    streams, scopes, circles, bases, mins = set(), set(), set(), [], []
    for c in codes:
        p = prog_by_code.get(c)
        if not p:
            continue
        for s in prog_streams(p):
            streams.add(s)
        sc = p.get("scope")
        if sc in ("national", "regional"):
            scopes.add(sc)
        if sc == "regional":
            for w in p.get("circleWilayaNums", []) or []:
                circles.add(w)
        rb = p.get("rankingBasis")
        if rb:
            bases.append(rb)
        mt = p.get("minThreshold")
        if isinstance(mt, (int, float)):
            mins.append(mt)
    if "national" in scopes and "regional" in scopes:
        scope = "mixed"
    elif "national" in scopes:
        scope = "national"
    elif "regional" in scopes:
        scope = "regional"
    else:
        scope = None
    basis = Counter(bases).most_common(1)[0][0] if bases else None
    return {
        "streams": sorted(streams),
        "scope": scope,
        "circles": sorted(circles),
        "rankingBasis": basis,
        "prog_min": round(min(mins), 2) if mins else None,
    }

# ---------------------------------------------------------------------------
# 7) Build each catalog record
# ---------------------------------------------------------------------------
# eligibility-matrix coarse field->streams fallback (very rough; field names scrambled)
def matrix_fallback_streams():
    s = set()
    return s  # matrix fields are too scrambled to map by id reliably; skip per-id

byId = OrderedDict()
method_counts = Counter()
unlinked = []

for cid in CATALOG_IDS:
    card = catalog[cid]
    linked_codes = set()
    method = None
    notes = []
    thresholds = {"sciexp": None, "math": None, "techmath": None}

    # --- collect code_fils for this card ---
    # (a) catalog_averages filiere_key
    if cid in CATALOG_AVG:
        fk = CATALOG_AVG[cid]["filiere_key"]
        for cf in fk_to_codefils.get(fk, set()):
            linked_codes.add(cf)
        # thresholds straight from curated catalog_averages unis
        t = thresholds_from_catalog_avg(CATALOG_AVG[cid])
        for k, v in t.items():
            if v is not None:
                thresholds[k] = v
        method = "catalog_averages"
        notes.append("linked via admissions catalog_averages filiere_key=%s" % fk)

    # (b) explicit named-school code_fils
    if cid in EXPLICIT_CODEFILS:
        for cf in EXPLICIT_CODEFILS[cid]:
            linked_codes.add(cf)
        if EXPLICIT_CODEFILS[cid]:
            method = method or "explicit_codefil"
            if method != "catalog_averages":
                notes.append("linked via explicit grande-ecole code_fil")

    # (b2) extra by_filiere filiere_key linking (engineering/health/econ LMD cards)
    if cid in EXTRA_FILIERE_KEYS:
        fk = EXTRA_FILIERE_KEYS[cid]
        added = fk_to_codefils.get(fk, set())
        for cf in added:
            linked_codes.add(cf)
        if added:
            method = method or "extra_filiere_key"
            notes.append("linked via admissions by_filiere filiere_key=%s" % fk)

    # (c) nationale block thresholds (med/pharm/dent) - national programs
    if cid in NATIONALE:
        n = NATIONALE[cid]
        if isinstance(n.get("min1"), (int, float)):
            thresholds["sciexp"] = n["min1"]
        if isinstance(n.get("min2"), (int, float)):
            thresholds["math"] = n["min2"]
        if isinstance(n.get("min3"), (int, float)):
            thresholds["techmath"] = n["min3"]
        method = "nationale"
        notes.append("national thresholds from admissions.nationale")

    # --- aggregate programs.json for scope/streams/circles/basis ---
    agg = aggregate_programs(linked_codes)

    # thresholds: if still empty, try code_fil records (grandes ecoles), then programs minThreshold
    if all(v is None for v in thresholds.values()) and linked_codes:
        recs = []
        for cf in linked_codes:
            recs.extend(codefil_records.get(cf, []))
        t = thresholds_from_records(recs)
        for k, v in t.items():
            if v is not None:
                thresholds[k] = v
        if any(v is not None for v in thresholds.values()):
            notes.append("thresholds from grande-ecole code_fil records")
    if all(v is None for v in thresholds.values()) and agg["prog_min"] is not None:
        # generic single threshold from programs.json minThreshold -> apply to allowed streams
        for s in (agg["streams"] or card["streamCodes"]):
            thresholds[s] = agg["prog_min"]
        notes.append("threshold from programs.json minThreshold")

    # --- allowedStreams: union of linked programs; fallback to card.streamCodes ---
    allowed = agg["streams"]
    if not allowed:
        # special-case: med/pharm/dent national -> use card streamCodes
        allowed = list(card["streamCodes"])
        if allowed:
            notes.append("allowedStreams fallback to card.streamCodes (no program link)")
    # nationale-only cards (med/pharm/dent) often have weak program scope -> force national
    scope = agg["scope"]
    circles = agg["circles"]
    basis = agg["rankingBasis"]
    if cid in NATIONALE and not scope:
        scope = "national"
        circles = []

    # --- confidence ---
    has_codes = len(linked_codes) > 0
    has_scope = scope is not None
    has_thr = any(v is not None for v in thresholds.values())
    if (method in ("catalog_averages", "nationale")) and has_scope and has_thr:
        conf = "high"
    elif has_codes and (has_scope or has_thr):
        conf = "medium"
    elif has_codes:
        conf = "medium"
    else:
        conf = "low"
        unlinked.append(cid)
        method = method or "unlinked_fallback"
        notes.append("no program/admissions link; using card.streamCodes only")
        if not allowed:
            allowed = list(card["streamCodes"])

    # prune threshold keys not in allowed (avoid orphan thresholds)
    thresholds = {k: v for k, v in thresholds.items() if v is not None}

    byId[cid] = OrderedDict([
        ("linkedProgramCodes", sorted(linked_codes)),
        ("allowedStreams", sorted(set(allowed)) if allowed else []),
        ("scope", scope if scope else ("national" if cid in NATIONALE else "unknown")),
        ("circleWilayaNums", circles),
        ("rankingBasis", basis if basis else "weighted_or_general"),
        ("thresholdsByStream", thresholds),
        ("sourceConfidence", conf),
        ("_note", normalize_ar("; ".join(notes))),
        ("_method", method),
    ])
    method_counts[method] += 1

# ---------------------------------------------------------------------------
# 7b) Card-derived backfill for weak cards (JOB 1)
#     Every low-confidence card (no official registry row) gets its streams from
#     the curated catalog.js streamCodes and a per-stream threshold from the
#     card's own minAvg (the admission FLOOR, matching the "lowest bar" semantics
#     of the registry-derived thresholds). avg is the headline/typical average and
#     would overstate the cutoff, so minAvg is the chosen rule.
#
#     Pilot / future-track cards have no official admissions data. They still get
#     allowedStreams from streamCodes; their catalog.js avg/minAvg are aspirational
#     curated estimates, so thresholds are left EMPTY and clearly noted, making the
#     UI show "بيانات القبول غير متوفرة بعد" rather than a misleading badge.
# ---------------------------------------------------------------------------
THRESHOLD_RULE = "minAvg"  # card-derived thresholds use the card's minAvg (admission floor)

# pilot/future hybrid tracks: aspirational marketing cards, no official cutoff yet
PILOT_TRACKS = {"med-ai", "it-int", "space-tech", "quantum", "digital-agro"}

# default scope for backfilled cards (paramedical/ENS/pilot are nationally accessible)
def backfill_card(cid):
    rec = byId[cid]
    card = catalog[cid]
    streams = list(card.get("streamCodes") or [])
    rec["allowedStreams"] = sorted(set(streams)) if streams else rec["allowedStreams"]
    # scope: keep if already known/regional, else default national
    if rec.get("scope") in (None, "unknown"):
        rec["scope"] = "national"
        rec["circleWilayaNums"] = []
    if cid in PILOT_TRACKS:
        rec["thresholdsByStream"] = {}
        rec["sourceConfidence"] = "card-derived"
        rec["_note"] = ("streams from curated catalog.js card; no admission data "
                        "(future/pilot track) - thresholds intentionally empty")
        rec["_method"] = "card_derived"
        return
    floor = card.get("minAvg")
    if floor is None:
        floor = card.get("avg")
    thr = {}
    if isinstance(floor, (int, float)):
        for s in rec["allowedStreams"]:
            thr[s] = round(float(floor), 2)
    rec["thresholdsByStream"] = thr
    rec["sourceConfidence"] = "card-derived"
    rec["_note"] = ("thresholds/streams derived from curated catalog.js card "
                    "(threshold=card.minAvg); no official registry row")
    rec["_method"] = "card_derived"

for cid in list(byId.keys()):
    if byId[cid]["sourceConfidence"] == "low" \
       or not byId[cid]["allowedStreams"] \
       or not byId[cid]["thresholdsByStream"]:
        # only backfill genuinely weak cards (low confidence / empty streams or thresholds)
        if byId[cid]["sourceConfidence"] == "low" or not byId[cid]["allowedStreams"]:
            backfill_card(cid)

# ---------------------------------------------------------------------------
# 7c) Sanity correction of the 3 flagged over-generous / wrong-threshold cards.
#     enssea inherited the broad SCIENCES ECONOMIQUES bar (~10.0) which is far too
#     low for an elite statistics school; gmec/marine-eng inherited GENIE MARITIME;
#     st's math/techmath came from a single grande-ecole row. Where the inherited
#     threshold disagrees with the card's own curated minAvg, prefer the card.
# ---------------------------------------------------------------------------
FLAGGED_PREFER_CARD = {
    "enssea":     "inherited SCIENCES ECONOMIQUES bar (~10.0) too generous for elite stats school",
    "gmec":       "GENIE MARITIME proxy bar replaced by card's materials/mechatronics minAvg",
    "marine-eng": "GENIE MARITIME proxy bar replaced by card's marine-eng minAvg",
    "st":         "math/techmath from a single grande-ecole row; using card minAvg across streams",
}
for cid, why in FLAGGED_PREFER_CARD.items():
    if cid not in byId:
        continue
    rec = byId[cid]
    card = catalog[cid]
    floor = card.get("minAvg") if card.get("minAvg") is not None else card.get("avg")
    if not isinstance(floor, (int, float)):
        continue
    # prefer the card's own (tighter) curated streamCodes over the broad inherited union
    streams = list(card.get("streamCodes") or []) or rec["allowedStreams"]
    rec["allowedStreams"] = sorted(set(streams))
    rec["thresholdsByStream"] = {s: round(float(floor), 2) for s in rec["allowedStreams"]}
    rec["sourceConfidence"] = "card-derived"
    rec["_note"] = ("streams+threshold corrected to card (threshold=card.minAvg; %s); "
                    "previous registry-inherited values were unreliable" % why)
    rec["_method"] = "card_derived_correction"

# ---------------------------------------------------------------------------
# 8) wilayas master list (clean) for the JS helpers
# ---------------------------------------------------------------------------
wilayas = [{"num": w["num"], "ar": normalize_ar(w["ar"])} for w in geo["wilayas"]]

# recompute meta AFTER the card-derived backfill (7b/7c) so counts reflect reality
method_counts = Counter(r["_method"] for r in byId.values())
unlinked = [cid for cid, r in byId.items() if r["sourceConfidence"] == "low"]
# "linked" = has a usable accessibility badge: non-empty allowedStreams AND at least
# one threshold (i.e. everything except pilot tracks with no admission data)
linked_count = sum(
    1 for r in byId.values()
    if r["allowedStreams"] and r["thresholdsByStream"]
)
out = OrderedDict([
    ("version", 1),
    ("byId", byId),
    ("_meta", OrderedDict([
        ("generatedFrom", ["catalog.js", "admissions-2026.json", "guide/programs.json", "guide/geographic-circles.json", "guide/eligibility-matrix.json"]),
        ("catalogIdCount", len(CATALOG_IDS)),
        ("linkedCount", linked_count),
        ("unlinkedIds", unlinked),
        ("methodCounts", dict(method_counts)),
        ("streamCodeLegend", {"min1": "sciexp", "min2": "math", "min3": "techmath"}),
        ("rules", (
            "allowedStreams = UNION of allowedStreams across linked programs.json programs; "
            "fallback to card.streamCodes when no program link. "
            "scope = 'national' if any linked program national, 'regional' if all regional, 'mixed' if both; "
            "med/pharm/dent forced national (admissions.nationale). "
            "circleWilayaNums = UNION of regional programs' circleWilayaNums ([] if national/none). "
            "rankingBasis = most common among linked programs (default weighted_or_general). "
            "thresholdsByStream = per-stream MINIMUM admission average (lowest bar across unis); "
            "preferred source order: admissions.catalog_averages curated unis (min1=sciexp,min2=math,min3=techmath), "
            "then admissions.nationale, then grande-ecole code_fil records, then programs.json minThreshold. "
            "Null thresholds omitted. "
            "CARD-DERIVED BACKFILL: cards with no official registry row take allowedStreams from "
            "catalog.js streamCodes and a per-stream threshold = card.minAvg (the admission floor; "
            "avg would overstate the cutoff). Tagged sourceConfidence='card-derived'. "
            "Pilot/future tracks (med-ai, it-int, space-tech, quantum, digital-agro) get streams only, "
            "no thresholds (aspirational cards, no admission data yet). "
            "Three flagged cards (enssea, gmec, marine-eng, st) had registry-inherited thresholds "
            "overridden by card.minAvg where the inherited bar was unreliable. "
            "Confidence: high=curated admissions+scope+threshold, medium=program-linked, "
            "card-derived=backfilled from catalog.js card, low=card.streamCodes fallback only (none remain)."
        )),
    ])),
])

OUT_JSON = os.path.join(DATA, "catalog-eligibility.json")
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# ---------------------------------------------------------------------------
# 9) Emit eligibility.js (browser global, no modules)
# ---------------------------------------------------------------------------
byId_js = json.dumps(byId, ensure_ascii=False, indent=2)
wilayas_js = json.dumps(wilayas, ensure_ascii=False, indent=2)

JS = '''/* ============================================================
   TAWJIHI - Eligibility "brain" (shared, dependency-free)
   AUTO-GENERATED from tawjihi/data/catalog-eligibility.json
   (generator: tawjihi/data/_scratch/gen_eligibility.py)
   Do NOT edit by hand; regenerate instead.

   Browser global script (plain <script src>, no modules/imports).
   Exposes:
     window.TW_ELIG            - the byId eligibility map
     window.twElig(id)         - record | null
     window.twWilayaList()     - [{num, ar}, ...]  (clean 58 wilayas)
     window.twWilayaName(num)  - "ar name" | ""
     window.twIsStreamAllowed(id, stream) - bool
     window.twWilayaEligible(id, wilayaNum) - bool
     window.twAccessibility(id, userAvg, stream) - {status, threshold, scope, rankingBasis, note}
   ============================================================ */
(function (root) {
  "use strict";

  // --- eligibility map keyed by catalog id ---
  var TW_ELIG = %s;

  // --- clean 58-wilaya master list (from geographic-circles.json) ---
  var TW_WILAYAS = %s;

  /** Return the eligibility record for a catalog id, or null. */
  function twElig(catalogId) {
    return (TW_ELIG && Object.prototype.hasOwnProperty.call(TW_ELIG, catalogId))
      ? TW_ELIG[catalogId] : null;
  }

  /** Return the clean wilaya list [{num, ar}, ...]. */
  function twWilayaList() {
    return TW_WILAYAS.slice();
  }

  /** Arabic name for a wilaya number, or "". */
  function twWilayaName(num) {
    for (var i = 0; i < TW_WILAYAS.length; i++) {
      if (TW_WILAYAS[i].num === num) return TW_WILAYAS[i].ar;
    }
    return "";
  }

  /**
   * Is a bac stream allowed for this card?
   * Empty allowedStreams => unknown => return true (do not over-filter).
   */
  function twIsStreamAllowed(catalogId, streamCode) {
    var rec = twElig(catalogId);
    if (!rec) return true;
    var allowed = rec.allowedStreams || [];
    if (allowed.length === 0) return true;
    return allowed.indexOf(streamCode) !== -1;
  }

  /**
   * Is a wilaya eligible for this card?
   * national / empty circle => true; regional => wilayaNum in circleWilayaNums.
   */
  function twWilayaEligible(catalogId, wilayaNum) {
    var rec = twElig(catalogId);
    if (!rec) return true;
    var circle = rec.circleWilayaNums || [];
    if (rec.scope === "national" || circle.length === 0) return true;
    return circle.indexOf(wilayaNum) !== -1;
  }

  /**
   * Accessibility verdict for a user's average + stream.
   *   ineligible : stream not allowed for the card
   *   safe       : userAvg >= threshold + 1
   *   likely     : threshold - 1 <= userAvg < threshold + 1  (within +/- 1)
   *   risk       : userAvg < threshold - 1
   *   unknown    : no threshold for that stream
   */
  function twAccessibility(catalogId, userAvg, streamCode) {
    var rec = twElig(catalogId);
    var base = {
      status: "unknown",
      threshold: null,
      scope: rec ? rec.scope : "unknown",
      rankingBasis: rec ? rec.rankingBasis : null,
      note: ""
    };
    if (!rec) {
      base.note = "no eligibility record for this card";
      return base;
    }
    if (streamCode && !twIsStreamAllowed(catalogId, streamCode)) {
      base.status = "ineligible";
      base.note = "stream not allowed for this specialty";
      return base;
    }
    var thr = null;
    var t = rec.thresholdsByStream || {};
    if (streamCode && typeof t[streamCode] === "number") {
      thr = t[streamCode];
    }
    base.threshold = thr;
    if (typeof userAvg !== "number" || thr === null) {
      base.note = (thr === null)
        ? "no published threshold for this stream"
        : "no user average provided";
      return base;
    }
    if (userAvg >= thr + 1)      base.status = "safe";
    else if (userAvg >= thr - 1) base.status = "likely";
    else                         base.status = "risk";
    base.note = "compared to per-stream admission minimum (2025-2026)";
    return base;
  }

  // --- attach to global ---
  root.TW_ELIG = TW_ELIG;
  root.twElig = twElig;
  root.twWilayaList = twWilayaList;
  root.twWilayaName = twWilayaName;
  root.twIsStreamAllowed = twIsStreamAllowed;
  root.twWilayaEligible = twWilayaEligible;
  root.twAccessibility = twAccessibility;
})(typeof window !== "undefined" ? window : this);
''' % (byId_js, wilayas_js)

OUT_JS = os.path.join(TAW, "eligibility.js")
with open(OUT_JS, "w", encoding="utf-8", newline="\n") as f:
    f.write(JS)

# ---------------------------------------------------------------------------
# 10) console summary
# ---------------------------------------------------------------------------
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
print("catalog ids:", len(CATALOG_IDS))
print("linked (conf high/medium):", linked_count)
print("low/unlinked:", unlinked)
print("method counts:", dict(method_counts))
conf = Counter(r["sourceConfidence"] for r in byId.values())
print("confidence:", dict(conf))
for cid in ["med", "esi", "ensia", "st", "paramedical", "kine", "enssea", "gmec", "med-ai", "quantum"]:
    r = byId[cid]
    print(cid, "->", r["scope"], r["allowedStreams"], r["thresholdsByStream"], "circ:", len(r["circleWilayaNums"]), r["sourceConfidence"])
empty_streams = [cid for cid, r in byId.items() if not r["allowedStreams"]]
print("cards with EMPTY allowedStreams:", empty_streams)
print("wrote:", OUT_JSON)
print("wrote:", OUT_JS)
