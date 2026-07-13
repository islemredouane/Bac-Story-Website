# Integration Report — 123 staged specialities → Tawjihi app

Generated: 2026-07-10 · Agent: Catalog Integration Engineer
Input: `_staging/new-specialities.json` (123), `_staging/conflicts.json` (81, untouched), `_GAP-REPORT.md`

## Headline

| File | Before | Added | After |
|---|---|---|---|
| `tawjihi/catalog.js` | 84 entries | **+121** | **205 entries** (unique ids verified) |
| `tawjihi/data/kb/specialities-kb.json` | 220 entries | **+23** (missing-everywhere) | **243** (`_meta` updated: counts, +`military`/`arts` categories, last_updated) |
| `tawjihi/content/*.json` | 83 files | **+23** | **106 files** |
| `tawjihi/images/` | — | **+9** military images copied from legacy `Bac Story website-last version/images/` | — |

123 staged − 2 near-duplicate resolutions = 121 catalog additions.

## Near-duplicate decisions

1. **`ensrpc` vs `enscrbc` → kept `enscrbc`, dropped `ensrpc`.** Same single school (Tipaza conservation/restoration school, RN11, ministry of culture, identical programs: ingénieur d'état 5y / LMD 3y / master pro 2y, same career outlets). `ensrpc` was an orphan HTML section under the school's other name; `enscrbc` has the grid card, image (`images/ENSCRBC.png`) and richer darija text. **KB still contains both ids** (AI can answer under either name) — a future KB dedup could alias `ensrpc` → `enscrbc`.
2. **`agro` + `agronomie` → merged into one catalog entry `agro`** ("العلوم الفلاحية والزراعية – Sciences Agronomiques"). Both HTML cards describe the same discipline: `agro` covered the schools/engineer track (ENSA El-Harrach, ESAS, ESA Mostaganem; 12.50–14.50), `agronomie` the university LMD track with per-university 2025 thresholds (10.00–12.59). Merged entry: `avg 14.5 / minAvg 10.0`, unis = ENSA + 5 universities from parsed data, description keeps both voices, conditions state both tracks. **KB keeps both ids** `agro` and `agronomie`.

`enpei` special case: had KB + content but no catalog entry → catalog entry added only (KB/content untouched).

## Catalog category distribution (205 total)

engineering 42 · medical 35 · business 30 · double 29 · humanities 24 · science 13 · **military 11 (NEW)** · **arts 9 (NEW)** · law 8 · education 4

## New category wiring (military + arts)

| File | What |
|---|---|
| `tawjihi/styles/tokens.css` | `--cat-military: #4e6e35` (olive), `--cat-arts: #c2185b` added to `:root` cat block. The `[data-theme="dark"]` block does **not** override any `--cat-*` (checked — existing pattern), so no dark overrides added. |
| `tawjihi/specialities.html` | 2 new filter chips (`data-cat="military"` عسكري, `data-cat="arts"` فنون) in `#catChips`; `CAT_LABEL` map extended with both. |
| `tawjihi/styles/spec-browser.css` | `.filter-chip[data-cat="military"]` + `.spec-card[data-cat="military"]` (olive gradient). **Arts styles already existed** in this file (lines 181/310) — left as-is; token color chosen to match its gradient start. |

Category enumeration audit: grep confirmed categories are enumerated **only** in `specialities.html` (chips + CAT_LABEL) and `spec-browser.css`; `speciality.html`/`dashboard.html`/`simulator.js` consume `catVar` from the entry itself — no further wiring needed. `api/tawjihi-chat.js` not touched (off-limits).

## Null-average handling (important)

50 of the 121 new entries have `avg: null` (concours/selection-based admission: all military schools, ENA, ESM-justice, IDRI, frontier specialities…). Averages were **not invented**. The UI previously called `s.avg.toFixed(2)` unguarded, so additive guards were added:

- `specialities.html`: card meta shows "القبول: مسابقة / انتقاء خاص" when null; avg-range filter keeps null entries visible unless the user narrows the range.
- `simulator.js`: `riskOf(null)` → `'risk'` (never "safe"); wishlist/picker meta shows "قبول بمسابقة"; default-seed proximity filter skips null; text export guarded.
- `dashboard.html` (re-read after the personalization agent's commit; edits additive): wishlist card shows "قبول بمسابقة خاصة", eligibility badge and ok/warn/no counts skip null-avg entries. Nudge comparisons (lines ~268) are NaN-safe by construction — left untouched.
- `app.js` (re-read after personalization commit; additive): chat spec-card avg line guarded; compare-table catalog override only when `cat.avg != null` (PNG-export table already coerced null → '—').
- `speciality.html`: header chip + side-rail minAvg fact show concours text instead of "~ 0.00".

## Generation rules (catalog entries)

- Exact existing schema/field order (`id…careers`), single-quoted JS, 2-space indent, appended before the closing `];`.
- `avg`/`minAvg`/`streams`/descriptions/conditions/careers/locations: from staging + `sourceData` only. Careers icons mapped to FontAwesome by keyword (staging left them null by design); benefit-items (راتب/سكن/منحة) filtered out of careers.
- Empty staged `streamCodes` (24 entries) → all 6 stream codes + display "جميع الشعب" + condition "مفتوح لجميع شعب البكالوريا (تحقق من شروط المؤسسة)". Stream labels normalized to the canonical vocabulary used by `STREAM_MAP`.
- Unknown duration/language/degree → honest defaults ("حسب المؤسسة" / "نظام LMD — ليسانس 3 سنوات" / "ليسانس / ماستر"), never fabricated numbers.
- 19 entries whose staged image exists nowhere → `img: ''` (existing catalog practice, e.g. `enssn`). 9 military images recovered from the legacy site folder.
- Concours-based schools get an explicit condition: "القبول عبر مسابقة/انتقاء خاص بالمؤسسة — وليس عبر بطاقة الرغبات فقط".

## KB entries (23)

Schema follows existing records: `id, category, dataName, name_ar, name_fr, sections{heading→text verbatim from legacy detail cards}, linkedFiliereKeys:[]`, plus `averages_text`/`resolvedAverages` when the source had numbers. No `wilayaAverages`/`linkedEtabRows` (no ministry-table linkage exists for these — same as other unlinked records).

## Content files (23)

`content/<id>.json` for every missing-everywhere entry, `{sections:[{h,type,items|body}]}` schema with pros/cons/summary/list/text mapping from the legacy detail cards. **Text is verbatim sourceData** (the legacy pages were written in the BAC Story voice — darija + MSA + French terms), so no facts were invented. Note: the referenced style guide `bac-story-writing-style.md` **no longer exists on disk** (searched the whole website tree + legacy folder); the memory summary of it (tone, honesty rules, emoji conventions) + existing content files were used as the style reference — flagging per the honesty rule.

## Validation results

- `node --check` on `catalog.js`, `app.js`, `simulator.js`: **pass**.
- Catalog evaluated in node: **205 entries, 205 unique ids**, no malformed entries (name/streams/careers/description/duration/demand all present), **0 broken image paths**.
- KB re-parsed: 243 unique ids, `_meta.total` = 243. All 106 content JSONs parse (utf-8/utf-8-sig). Staging JSONs untouched and still parse.
- Runtime simulation of guarded render paths with a null-avg entry (`cherchall`): card text, riskOf, avg filter all behave.
- Category wiring grep proof: `--cat-military`/`--cat-arts` in tokens.css; `data-cat="military"` chip + card CSS; chips + CAT_LABEL in specialities.html.
- Browser check attempted: the shared preview server serves the **main repo's** tawjihi (121-entry catalog), not this worktree, so in-browser verification was not possible from here; all logic was validated in node instead.

## Deferred / for other agents

- **Average conflicts (44) + category conflicts (15) in `conflicts.json`**: untouched — reconciliation agent owns existing-entry data.
- KB near-duplicate alias (`ensrpc`→`enscrbc`, `agro`/`agronomie`) — optional KB cleanup.
- 19 entries with `img: ''` need real images eventually (languages, frontier specialities, paramedical batch — list greppable via `img: ''`).
- `education` (علوم التربية) vs new `staps`/`childhood`: no overlap, but the education category now has 4 entries — landing page tiles (`index.html?cat=…`) don't include military/arts tiles; cosmetic, chips work via URL param.
