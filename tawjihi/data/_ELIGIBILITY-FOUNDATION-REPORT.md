# Eligibility Foundation Report

**Scope:** join `catalog.js` (TW_CATALOG, 67 cards) + `admissions-2026.json` (official 2025-2026 minimums) + `guide/programs.json` (341 MESRS programs) into one clean, catalog-id-keyed eligibility dataset, plus a dependency-free browser "brain".

**Deliverables produced (additive only):**
- `tawjihi/data/catalog-eligibility.json` — the join, keyed by catalog id.
- `tawjihi/eligibility.js` — browser global script (embeds the map; no modules/imports).
- `tawjihi/data/_ELIGIBILITY-FOUNDATION-REPORT.md` — this report.
- `tawjihi/data/_scratch/gen_eligibility.py` — generator (re-runnable; regenerates both files).

No source file was modified.

---

## 1. Linkage coverage (67 catalog ids)

| Confidence | Count | Meaning |
|-----------|-------|---------|
| **high**   | 21 | curated admissions data + scope + per-stream threshold |
| **medium** | 26 | linked to programs/admissions (scope and/or threshold present) |
| **low**    | 20 | no official link found; falls back to the card's own `streamCodes` |

**Linked (high+medium): 47 / 67.**

### Coverage by linking method
| Method | Count | How |
|--------|-------|-----|
| `catalog_averages` | 18 | admissions.json already keys these by catalog id (filiere_key + per-uni mins) |
| `explicit_codefil` | 19 | named grande-ecole cards mapped to a specific program `code_fil` (verified against admissions `grandes_ecoles` etab names) |
| `extra_filiere_key` | 7 | engineering/health/econ LMD cards mapped to a clean `by_filiere` key |
| `nationale` | 3 | med / pharm / dent national thresholds from `admissions.nationale` |
| `unlinked_fallback` | 20 | no registry/admissions match -> `card.streamCodes` only |

*(methods overlap: a card may use `catalog_averages` for thresholds and `programs.json` for scope/streams; the table counts the dominant method.)*

### Field coverage
- **Thresholds present:** 47 / 67 cards have at least one per-stream admission minimum.
- **Scope resolved:** 46 / 67 (`national` 23, `mixed` 21, `regional` 2; the rest `unknown`).
- **Non-empty geographic circles:** 23 cards (regional + mixed programs).

---

## 2. Aggregation rules (also embedded in `_meta.rules`)

- **allowedStreams** = UNION of `allowedStreams` across all linked `programs.json` programs (clean codes: `sciexp, math, techmath[+variants], gestion, lettres, langues, arts`). Fallback to the card's `streamCodes` when there is no program link. (The coarse `eligibility-matrix.json` field map was intentionally NOT used per-card: its field strings are scrambled/merged and cannot be aligned to catalog ids reliably.)
- **scope** = `national` if any linked program is national; `regional` if all linked are regional; `mixed` if both. med/pharm/dent are forced `national` (they are national-orientation specialties).
- **circleWilayaNums** = UNION of `circleWilayaNums` across linked **regional** programs (`[]` for national/none).
- **rankingBasis** = most common `rankingBasis` among linked programs (default `weighted_or_general`).
- **thresholdsByStream** = per-stream **minimum** admission average (the lowest published bar across universities). Source preference order:
  1. `admissions.catalog_averages` curated unis — `min1=sciexp, min2=math, min3=techmath`;
  2. `admissions.nationale` (med/pharm/dent);
  3. grande-ecole `code_fil` records;
  4. `programs.json` `minThreshold`.
  Null/absent thresholds are omitted (never fabricated).

**Arabic normalization:** a small map fixes common ligature artifacts (lam-alef collapse: `إعالم`->`إعلام`, `األغواط`->`الأغواط`, `املادة`->`المادة`, `اسالمية`->`إسلامية`, etc.). Applied to the wilaya names surfaced into `eligibility.js` and to any `_note` text. Most display still comes from clean `catalog.js`, so this stays lightweight.

---

## 3. Sample records

**`med`** (national, curated):
```json
{ "allowedStreams": ["math","sciexp"], "scope": "national",
  "circleWilayaNums": [], "rankingBasis": "weighted_or_general",
  "thresholdsByStream": { "sciexp": 16.65, "math": 17.15 },
  "sourceConfidence": "high" }
```

**`esi`** (ENS Informatique, grande-ecole):
```json
{ "linkedProgramCodes": ["C00CAN01"], "allowedStreams": ["math","sciexp","techmath"],
  "scope": "national", "thresholdsByStream": { "sciexp": 18.19, "math": 18.55, "techmath": 18.93 },
  "sourceConfidence": "medium" }
```

**`bio`** (regional example, non-empty circle): scope `regional`, circle `[1,2,3,4,5,6,...]`.

---

## 4. Cards needing director attention (the 20 "low")

These have **no matching official program** in admissions/registry, so they fall back to the card's own `streamCodes` (the JS still works; only thresholds are missing). Grouped by reason:

- **Health institutes admitted via Ministry of Health (separate from the orientation card):**
  `paramedical`, `kine`, `labo`, `radio`, `sage-femme`, `pharm-ind`, `med-bio`, `med-info`, `enssn`, `enssmal`.
  -> Expected: these are not in the university orientation registry. Thresholds would need a separate MoH source.
- **Pilot / future hybrid tracks with no official admissions data yet:**
  `med-ai`, `it-int`, `space-tech`, `quantum`, `digital-agro`.
  -> Expected: marketing/aspirational cards; leave as fallback or hide from the eligibility filter.
- **Education / teaching schools (ENS) and a few others:**
  `education`, `psych`, `ens`, `commu`, `gm`.
  -> ENS admissions appear in admissions.json only as per-wilaya `P.E.P/P.E.S` variants that are too fragmented to map cleanly to a single card. Could be linked manually if a director-approved mapping is provided.

### Lower-confidence links worth a sanity check
- **`enssea`** (elite statistics school) was linked to the broad `SCIENCES ECONOMIQUES` filiere, so its `allowedStreams` and threshold (~10.0) are too generous vs. the card's real selectivity. Marked `medium`. Consider a tighter explicit `code_fil` if available.
- **`gmec` / `marine-eng`** both proxy to `GENIE MARITIME` (closest clean filiere key); verify if a materials/mechatronics-specific key exists.
- **`st`** math/techmath thresholds come from a single grande-ecole row (only 1 of 37 unis reports min2/min3); sciexp (min1, all 37 unis) is the representative bar.

---

## 5. Validation performed
- `python -c "json.load(...catalog-eligibility.json)"` -> OK.
- `node --check tawjihi/eligibility.js` -> OK.
- Functional Node test of all exposed helpers (`twElig`, `twAccessibility`, `twIsStreamAllowed`, `twWilayaEligible`, `twWilayaList`, `twWilayaName`) -> all pass.
- Spot checks: `med` national sciexp 16.65 / math 17.15 (safe/likely/risk/ineligible verdicts correct); `esi` techmath allowed; `bio` regional with non-empty circle; national `wilayaEligible` returns true for all wilayas.

## 6. Regeneration
```
python tawjihi/data/_scratch/gen_eligibility.py
```
Re-reads the three sources and rewrites `catalog-eligibility.json` + `eligibility.js`. Safe to delete `_scratch/` if regeneration is not needed.
