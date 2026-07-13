# HANDOFF — Circulaire 2026 Extraction (incomplete, resume here)

**STATUS UPDATE (2026-07-11, streams+priorities agent):**
- **Step 1 DONE — streams+priorities:** `_scratch-2026/priorities2026.json` holds
  432/496 codes as `{code: {streams:[{stream,priority}], source, page, note}}`.
  Sources: 400 table text (pdfplumber, `extract_streams.py`), 17 visual page reads
  (PDF p34/71/87/88/145), 14 same-specialty sibling inheritance, 1 fitz-text fallback
  (`fallback_streams.py`). Priorities: 541×P1, 421×P2, 133×P3, 423 with no explicit
  priority markers (= single group per guide; kept null + note `no_explicit_priority`,
  per owner rule fewer groups ≠ exclusion). Unresolved 64 = 59 ENS-annex codes
  (annexe 09, EXCLUDED by owner) + A00TCN01/A05TCN00/B00IAN01/F01TPN01 (index-only,
  no detail row anywhere in the PDF) + I03LAN00 (visual check p88: garbled duplicate
  of I03LAN01/02). The old canon2026 `streams` had garbled priorities (0/4 values,
  collapsed groups) — priorities2026.json supersedes it; 3 diffs ground-truthed
  visually, all in favor of the new parse.
- **Step 2 DONE — final assembly:** `programs.json` REPLACED with 2026 data
  (496 programs; 2025 baseline saved to `_scratch-2026/programs-2025-baseline.json`).
  Schema preserved exactly (same keys as 2025). 2025→2026: 341→496 programs,
  163 new codes, 8 removed, of 333 kept codes 69 changed scope and 27 changed
  minThreshold. 432 programs carry allowedStreams with real priorities
  (2025 had all-null priorities); 64 have empty allowedStreams (59 ENS + 5 noted
  in `_note`). field_ar: canon > 2025-same-code > code-prefix majority > فهرس
  header (E=علوم الأرض والكون, G=حقوق وعلوم سياسية). scope: extracted, else code
  type-suffix rule (6th char N=national/L=regional — validated 368/370 against
  extracted scopes; noted `scope_from_code_suffix`). Institution names
  lam-alef-normalized (األ→الأ etc.). The other 5 guide JSONs
  (streams/weighted-formulas/geographic-circles/eligibility-matrix/
  acceptance-types) left at 2025 baseline — no differing 2026 data extracted
  for them. Validation: all 6 JSONs parse (python+node), 58 wilayas, every
  program has code/field_ar/scope∈{national,regional}, wilaya nums all 1-58.
  Scripts: `_scratch-2026/extract_streams.py`, `fallback_streams.py`,
  `integrate2026.py`.

**STILL REMAINING (out of this pass's scope):** ENS annexe 09 (59 codes: layout,
streams, institutions), ~20 garbled institution cells (needvisual.json leftovers),
`kb/guide-bac2026-reference.md`, `_EXTRACTION-REPORT-2026.md`, ministry-rules.json
check, and 4 index-only codes with no detail row in the PDF
(A00TCN01, A05TCN00, B00IAN01, F01TPN01) + I03LAN00 (garbled duplicate, consider
deleting from canon).

**Status:** ~75% done. The extraction agent was killed repeatedly by session limits.
All of its surviving working artifacts were copied into `_scratch-2026/` in this folder.
**Nothing in the final guide JSONs has been updated yet** — `programs.json`,
`eligibility-matrix.json`, etc. are still the 2025 baseline (dated Jul 8).

## Source
`C:\Users\AZ\Downloads\Circulaire_07-07-2026-signed.pdf` — official MESRS circulaire
(2026-07-07) governing 2026 orientation. Arabic RTL, ~270+ pages.

## What is DONE (artifacts in `_scratch-2026/`)

| File | What it is |
|---|---|
| `canon2026.json` | **The main deliverable so far.** Dict keyed by official program code (496 codes, e.g. `P01MAL01`). Per code: `pages` (where it appears), `inst_raw` (institution list, Arabic — note: text-layer Arabic is partially garbled, e.g. "األغواط" = "الأغواط" with lam-alef ligature broken), `scope` (national/regional), `circles` (wilaya circle numbers), `rankingBasis` (`weighted_or_general` / `general`), `minThreshold`, `ranking_raw` (raw ranking-rule text), `streams` (⚠️ mostly EMPTY — see remaining work), `field_ar`/`branch_ar` (⚠️ mostly empty too). |
| `parsed2026.json`, `parsed2026b.json` | Earlier/intermediate parses of the program tables (b = later, superset). Useful to cross-check canon2026. |
| `codes2026.json` | Parsed code inventory / code-correction rules the agent established (text-layer digit garbling fixes). |
| `needvisual.json` | 64 cells `{code: [page, bbox]}` whose text-layer was garbled and need VISUAL reading (Read tool on that PDF page). The agent said it visually recovered 44 cells before dying — cross-check which of the 64 are already fixed in canon2026 vs still raw. |
| `parse-warnings.json` | Parser warnings to review. |
| `page-stats.json` | Per-page row statistics. |
| `circ2026-text.txt` / `circ2026-fitz.txt` | Full text dumps (pdfminer / PyMuPDF). Arabic is ligature-garbled; fine for codes/numbers, unreliable for names. |
| `extract_programs.py`, `integrate_v2.py`, `dump_and_render.py` | The agent's scripts (extraction, integration into guide schemas, page rendering). |

Verified visually by the agent before dying: rules pages (1-2, 5, 13), medical/vet
annexes, program table pages incl. 147-169 region (ENS/medical annex area).

## What REMAINS

1. **Streams + priorities per program** (the critical missing piece): `canon2026.json`
   `streams` arrays are mostly empty. The stream→priority (أولوية 1/2/3) mapping per
   program comes from the eligibility/annex tables. OWNER RULE (verbatim requirement):
   *"when you find just 1 minimum instead of 3 it doesn't mean other streams are not
   allowed — they can have the same priority; the priorities for each single speciality
   are in the 2026 guide."* This mapping is what reconciliation (task #6) needs to join
   the 2025 minima (min1/min2/min3 = per-priority minimums,
   `tawjihi/data/averages-2025/minima-phase1-2025.json`) into per-stream minima.
2. **ENS annex** layout (agent died while starting it).
3. **Resolve remaining `needvisual.json` cells** visually (Read tool, `pages` param).
4. **Final assembly** into the existing guide schemas (READ each existing JSON first,
   preserve schemas — consumed by `api/tawjihi-chat.js` + `tawjihi/eligibility.js`):
   `programs.json`, `streams.json`, `weighted-formulas.json`, `geographic-circles.json`,
   `eligibility-matrix.json`, `acceptance-types.json`. `integrate_v2.py` already maps
   draft records → schema; adapt it for canon2026.
5. **`tawjihi/data/kb/guide-bac2026-reference.md`** — human-readable reference
   (mirror guide-bac2025-reference.md): calendar/phases, weighted formulas per field,
   circle definitions (58 wilayas), special cases (ENS, medical, grandes écoles,
   military = preinscription.mdn.dz), appeal/transfer (no formal طعن — wish-edit,
   phase 2, PROGRES transfer).
6. **`_EXTRACTION-REPORT-2026.md`** — pages processed, complete 2025→2026 diff,
   confidence notes.
7. Update `tawjihi/data/kb/ministry-rules.json` if rules changed (read schema first).

## Validation requirements
- All JSONs parse. Wilaya count = 58. Every program: code, field, streams, scope,
  rankingBasis. NEVER invent data — unreadable → note in report.
- Arabic institution names: prefer VISUAL page reads over the garbled text layer,
  or normalize the known ligature breakages (أ/آ/لأ patterns) and spot-check visually.

## Constraints
No git commands (the director commits). Windows. Don't touch files outside
`tawjihi/data/guide/` + the two kb files named above.
