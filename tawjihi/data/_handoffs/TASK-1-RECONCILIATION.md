# TASK — Reconcile every average & name against official data (PRIORITY 1)

**Repo:** the Tawjihi repo root (contains `tawjihi/`, `api/`, `scripts/`).
**Rules:** NO git commands (the human commits). Never invent a number or name —
unmatched → flag in the report. Windows environment. All Arabic UI text in
Algerian darja style consistent with the app.

## ⚠️ ATTEMPT #1 REVIEW — read before starting (2026-07-14)
A first attempt produced `tawjihi/data/_staging/catalog-reconciled.js` — **do not
reuse it**. Its failures, which THIS run must avoid:
1. It ran against a stale 84-entry catalog. The live `tawjihi/catalog.js` has
   **206 entries** — reconcile THAT file.
2. It used only `min1` and "minimum across matching rows" — ignoring the
   priority-group join below (the owner's core rule).
3. 95/132 entries were left "no official match" — matching must be far better
   (use etb_code + French names + KB name_fr + abbreviations).
4. It split ESI into ENSIA/ESTIN etc. — those national schools ALREADY have
   their own standalone catalog entries; never create a split that duplicates
   an existing entry.

## OWNER DESIGN DECISION — SPLIT ENTRIES (confirmed, required)
Where one speciality is taught at multiple institutions with different official
minima, split it into **one card per institution** (e.g. `med` → `med-ua1`,
`med-uo1`, …). Grouping via `unis[]` is NOT wanted. Split rules:
- Split id = `<baseId>-<etb suffix>`; every split card MUST carry
  `baseId: '<original id>'` (the app relies on it — see below) and its own
  `unis: [{ …that single institution… }]`.
- The app is already **split-safe**: `twById()` in catalog.js resolves legacy
  ids saved in wishlists/links (exact → baseId → base-prefix), and
  speciality.html falls back to `content/<baseId>.json` for split cards. So no
  wishlist migration and no content duplication — just set `baseId` correctly
  on every split card.
- Keep KB entries keyed by the base id (the AI KB stays per-speciality); do not
  rename KB ids.
- Entries taught at ONE institution keep their id unchanged (no gratuitous splits).
- Military/concours cards (`avg: null`) are never split and keep `regLink`.

## Goal
Every acceptance average and every school/specialty name shown to students —
in `tawjihi/catalog.js` (206 entries), `tawjihi/data/kb/specialities-kb.json`
(244 entries), and `tawjihi/data/guide/programs.json` — must be traceable to an
official source. Fix mismatches, flag unmatchables.

## Sources of truth (all already extracted & verified)
1. **2025 real minima** (averages source of truth):
   `tawjihi/data/averages-2025/minima-phase1-2025.json` (+ same-content `.csv`)
   — 4,445 rows, double-verified (two independent extraction methods, 0 diffs).
   Fields: `code` (filière code), `name_fr`, `etb_code`, `institution_fr`,
   `min1/min2/min3` (+ `_status` fields: value | none_assigned | NC |
   not_applicable), `page` (PDF page for traceability).
2. **2026 rules + priorities** (rules source of truth):
   `tawjihi/data/guide/programs.json` — 496 programs from the official 2026
   circulaire: `code`, `field_ar`, `allowedStreams` = [{stream, priority}],
   `scope` (national/regional), `circles` (wilaya numbers), `rankingBasis`
   (general | weighted_or_general), `minThreshold`.
   Also `tawjihi/data/guide/_scratch-2026/priorities2026.json` (same data +
   source/page notes) and `_HANDOFF-2026-EXTRACTION.md` (context).
3. Existing conflict list: `tawjihi/data/_staging/conflicts.json` — 81 known
   discrepancies found earlier (44 average conflicts, 15 category conflicts).

## THE CRITICAL JOIN RULE (owner's words, non-negotiable)
`min1/min2/min3` in the minima file are minimums per **PRIORITY GROUP**
(أولوية 1/2/3), NOT per stream. A row having only `min1` does NOT mean only one
stream is allowed — several streams can share one priority group. The
stream→priority mapping per program is in `programs.json` `allowedStreams`.
**Derive per-stream minima by joining:** for program P and stream S with
priority k, the 2025 minimum for S is `min<k>` of the matching minima row(s).
Programs whose `allowedStreams` have `priority: null` = single shared group →
`min1` applies to ALL listed streams. NEVER mark a stream ineligible because
min2/min3 are empty.

## Method
1. **Build the code mapping** `tawjihi/data/_staging/code-mapping.json`:
   catalog entry id ↔ official filière `code`(s) + `etb_code`(s). Match via:
   nameEn/abbreviations (ESI, ENSIA, ESMIC...), French names in minima
   `name_fr`/`institution_fr`, Arabic names (normalize lam-alef: األ→الأ, و
   ة/ه، أ/إ/ا variants), and the `unis[]` arrays in catalog entries. A catalog
   entry may map to MANY (etb, code) rows (same filière at many universities).
   Record match confidence per mapping; low-confidence → list for human review,
   do NOT apply automatically.
2. **Fix averages** per catalog entry:
   - `avg` / `minAvg` / `avgHistory[].y2025` / `unis[].avg`: populate from the
     2025 minima of the mapped rows (per-institution numbers go in `unis[]`;
     entry-level `avg` = a representative reference — keep the app's existing
     convention: the value shown as "معدل القبول (مرجعي)". Document whichever
     convention you apply (e.g. median or the flagship institution) in the
     report and apply it uniformly).
   - Military/concours entries with `avg: null` stay null (UI shows "مسابقة").
   - KB `resolvedAverages` and any `wilayaAverages`: update from the same join;
     remove numbers that have no official source (or move them to a
     `legacy_unverified` field) — the AI must never quote an unverifiable number.
3. **Fix names**: official Arabic names from the guide/KB vs catalog `name`.
   Normalize garbled lam-alef everywhere. Keep the app's "– location" suffix style.
4. **Write the report** `tawjihi/data/_staging/_RECONCILIATION-REPORT.md`:
   every change old → new with source (file + row/page), every unmatched entry,
   the entry-level avg convention used, counts.

## Validation (mandatory)
- `node --check tawjihi/catalog.js`; all JSONs parse (python/node).
- No duplicate catalog ids; 206 entries preserved (no deletions without flagging).
- Spot-check 10 random changed averages against `minima-phase1-2025.csv` by hand.
- All averages in [8, 20] or null.

## After this task
Tell the human to re-run `node scripts/embed-kb.js` (KB texts changed) and to
commit. Downstream QA task depends on this one.
