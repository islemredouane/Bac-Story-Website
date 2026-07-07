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
| **high**        | 20 | curated admissions data + scope + per-stream threshold |
| **medium**      | 23 | linked to programs/admissions (scope and/or threshold present) |
| **card-derived**| 24 | no official registry row; streams + thresholds backfilled from the curated `catalog.js` card |
| **low**         | 0  | (none remain — every card now has streams; all but 5 pilot tracks have a threshold) |

**Cards with a usable accessibility badge (non-empty streams + >=1 threshold): 62 / 67.**
The remaining 5 (`med-ai`, `it-int`, `space-tech`, `quantum`, `digital-agro`) are pilot/future tracks: they have allowedStreams but intentionally **no** threshold, so the UI shows "بيانات القبول غير متوفرة بعد".

> **Update (card-derived backfill pass):** The original 20 "low" cards have been backfilled from `catalog.js` (JOB 1). All 67 cards now have non-empty `allowedStreams`. See §7.

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

## 4. Cards formerly needing director attention (the 20 "low") — NOW BACKFILLED

> These had **no matching official program** in admissions/registry. They are now backfilled from the curated `catalog.js` card (see §7). Original grouping kept below for reference.

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

---

## 7. Card-derived backfill (JOB 1) + ligature normalization (JOB 2)

### JOB 1 — weak cards backfilled
The generator now parses `avg` and `minAvg` out of each `catalog.js` card and runs a backfill pass (`gen_eligibility.py` §7b/§7c) over every card that was `low` confidence or had empty `allowedStreams`.

- **allowedStreams** ← card's `streamCodes` (canonical codes).
- **thresholdsByStream** ← one threshold per allowed stream = **card.minAvg** (falls back to `avg` only if `minAvg` is absent).
- **Threshold rule chosen: `minAvg`.** Rationale: the registry-derived thresholds are the *lowest admission bar across universities*; `minAvg` is the card's admission floor and matches that semantics, whereas `avg` is the headline/typical average and would overstate the cutoff.
- **scope** ← kept if known; else defaulted `national` (paramedical / ENS / pilot are nationally accessible).
- **sourceConfidence** ← `"card-derived"`, with a `_note` stating the threshold came from `catalog.js` (`threshold=card.minAvg`), no official registry row.

**20 cards backfilled** (`card_derived`): `education, psych, enssn, gm, pharm-ind, med-bio, med-info, enssmal, kine, labo, radio, sage-femme, paramedical, ens, commu` + the 5 pilot tracks.

**Pilot / future tracks** (`med-ai, it-int, space-tech, quantum, digital-agro`): allowedStreams set from `streamCodes`; **thresholds intentionally left empty** (their `catalog.js` averages are aspirational, not admission data). `_note` says "no admission data (future/pilot track)". `twAccessibility` returns `status:"unknown"` / `threshold:null` for these → UI shows "بيانات القبول غير متوفرة بعد".

**3 flagged cards corrected** (`card_derived_correction`, 4 entries incl. both `marine-eng`/`gmec`):
| Card | Was | Now (card.minAvg) | Why |
|------|-----|------|-----|
| `enssea` | sciexp/math/techmath/gestion/langues/lettres @ ~10.0 | gestion/math/techmath @ **13.2** | inherited broad SCIENCES ECONOMIQUES bar far too generous for an elite stats school; streams tightened to card's own codes |
| `gmec` | sciexp @ 14.09 (GENIE MARITIME proxy) | math/sciexp/techmath @ **11.8** | proxy bar replaced by card's materials/mechatronics floor |
| `marine-eng` | sciexp @ 14.09 (GENIE MARITIME proxy) | math/techmath @ **12.0** | proxy bar replaced by card's marine-eng floor |
| `st` | sciexp 10.0 / math 17.79 / techmath 18.15 | all streams @ **10.0** | math/techmath came from a single grande-ecole row; card minAvg is the representative LMD bar |

**Result:** all 67 cards have non-empty `allowedStreams`; 62/67 have ≥1 threshold (only the 5 pilot tracks omit thresholds, by design).

### JOB 2 — Arabic ligature normalization
`NORMALIZE_MAP` in the generator was extended with the recurring lam-alef / definite-article collapse artifacts:
`أملانية→ألمانية`, `اتصاالت→اتصالات`, `استغالل→استغلال`, `اآلداب→الآداب`, `اجلزائر→الجزائر`, `اخلدمات→الخدمات`, `اسرتاتيجية→استراتيجية`, `اآلثار→الآثار`, `اآللية→الآلية` (plus the existing `إعالم→إعلام`, `األغواط→الأغواط`, `اسالمية→إسلامية`, `املادة→المادة`, etc.).
An explicit replacement map is used (not an aggressive `لا`↔`ال` regex) to avoid corrupting correct words. `programs.json` itself was **not** modified (it is the raw extraction; it still contains e.g. `إعالم`×9, `األغواط`×62); normalization is only applied to strings copied into the generated outputs. Verified: **0 artifacts** remain in `eligibility.js` and `catalog-eligibility.json`; `geographic-circles.json` was already clean.

### Validation
- `python -c "json.load(...catalog-eligibility.json)"` → OK.
- `node --check tawjihi/eligibility.js` → OK.
- Functional: `twAccessibility('med',15,'sciexp')`→risk@16.65, `('paramedical',11,'sciexp')`→likely@10.5, `('kine',13,'sciexp')`→safe@12, `('enssea',14,'math')`→likely@13.2, `('med-ai',16,'sciexp')`→unknown/null (pilot). `twIsStreamAllowed('enssea','lettres')`→false. `twWilayaList().length`→58. All API helpers preserved.
