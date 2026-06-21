# Official Guide Extraction Report — Guide-bac2025.pdf

Source: `C:\Users\AZ\Downloads\Guide-bac2025.pdf` (192 pages, Arabic RTL).
Tool: Python 3.12 + `pdfplumber` 0.11.10 `extract_tables()`.
Output dir: `tawjihi/data/guide/`.

## Files produced
| File | Status | Confidence |
|---|---|---|
| `streams.json` | Complete | high (verified vs page 4 matrix) |
| `programs.json` | 341 programs (most important) | 305 high / 16 medium / 20 low |
| `eligibility-matrix.json` | 22 fields, streams per field, priorities null | medium |
| `weighted-formulas.json` | definition + 2 formula shapes, coefficients null | high/medium |
| `geographic-circles.json` | full 58-wilaya master list | high |
| `acceptance-types.json` | 3 scope types + 3 special-condition blocks | high |

## programs.json — the registry (MOST IMPORTANT)
- **Source pages: 24–179** (the per-program registry tables).
- **398 code rows detected; 341 unique programs** after de-duplication (kept highest-confidence row per code).
- Each registry page has two pdfplumber tables: a decorative wide header table (ignored) and the real
  6–9 column data table. Columns identified by **header keywords** (الرمز / أساس الترتيب / شعب البكالوريا /
  الدوائر الجغرافية / مؤسسات التكوين / ميدان / فروع / تخصصات / نوع), so variable column counts (5/6/7/8/9) are handled.
- **Encoding handling (critical):** pdfplumber returns each cell's text in *visual* order.
  - Arabic semantic text (field/branch/institutions/conditions) is **reversed** back to reading order.
  - **Wilaya numbers and thresholds are read from the RAW (non-reversed) cell** — reversing mangles digit order
    (e.g. raw `20/12.00` = threshold 12.00; raw scope `03,17,26,58,...` is correct, its reversed form is wrong).
  - Program codes are kept raw (already correct, e.g. `A00LAL01`).
- **Row-spanning carry-forward:** within one table, empty field/institutions/scope/streams/ranking cells inherit
  from the row above (sub-programs share the parent family's attributes). Carry-forward resets at each new header.
- Stats: scope = 179 national, 133 regional, 29 unknown. 314 programs have allowedStreams; 167 have a numeric minThreshold.

### KEY FINDING — stream priorities are null in programs.json (by design, not omission)
The 2025 registry stream cell lists allowed streams as a **dash-separated list** (e.g. `- تقني رياضي - علوم تجريبية - رياضيات`).
It does **NOT** contain the `الأولوية 01:/02:` textual markers that the PRD schema example assumed
(0 cells across the whole registry contain that marker). Therefore every `allowedStreams[].priority` is `null`.
Numeric stream priorities exist only in the high-level matrix on page 4 (see below), which is not cleanly machine-alignable.
Stream→code mapping: علوم تجريبية=sciexp, رياضيات=math, تقني رياضي=techmath (+ 4 sub-tracks), تسيير واقتصاد=gestion,
آداب وفلسفة=lettres, لغات أجنبية=langues, فنون=arts.

### Confidence rules applied
- `high`: field/branch present and (institutions or streams or scope) present.
- `medium`: streams empty OR scope unreadable.
- `low` (20): mostly `headerless_continuation_or_double_major` rows — code-only continuation rows on pages 76/122-123
  (double-major programs with a different schema, e.g. code `GH0LAN01`, branch like `طب + علوم بيولوجية`) and a few
  rows with no field and no branch.
- `_note` values: `no_explicit_priority` (streams listed without priority numbers — expected, see key finding),
  `headerless_continuation_or_double_major`.
- `_page` field on each program = 0-based PDF page index (provenance for manual verification).

## eligibility-matrix.json
- Source: **page 4** (text-cache lines ~100–260), the ميدان التسجيل / شعبة البكالوريا / الأولوية / صيغة الحساب table.
- 22 fields captured with their associated streams.
- **Priorities deliberately null.** The matrix uses merged cells that pdfplumber cannot align row-to-row, and the
  priority markers themselves render ambiguously (`أ1` / `أ0` / `أ3` — the digit for "priority 2" appears to render as `0`).
  Rather than guess, priorities are null; authoritative per-program stream lists live in programs.json.
- Known artifacts: `علوم وتكنولوجيا` splits into two entries (merged header), `علوم الصحة` / `علوم اقتصادية والتسيير`
  show empty streams (merge collision), and `فنون` picked up neighbouring streams. Flagged for manual verification.

## weighted-formulas.json
- Source: pages 2–4. The Guide **defines** the weighted average (المعدل الموزون المحسوب = general bac average × coefficient
  + key-subject mark) but does **not publish a per-subject coefficient table**. The page-4 `صيغة الحساب` column for the
  listed fields simply reads `المعدل العام المحصل عليه في امتحان البكالوريا`.
- All `coefficient` values are `null` (not stated → not guessed). Per-program ranking basis is reliable in programs.json.

## geographic-circles.json
- The Guide does **not** define named regional circles; regional scope is a per-program wilaya-number list
  (`programs.json[].circleWilayaNums`). `circles: []` by design.
- `wilayas`: complete standard 58-wilaya master list (administrative reference, includes the 2019 promotions).

## acceptance-types.json
- 3 scope types: national / regional / conditional.
- 3 documented special-condition blocks (sports field medical certificate + elite-athlete min-average exemption;
  grandes écoles base-training competition; ENS age limit 24 + oral interview + commitment contract).
  Source: text-cache lines ~280–300.

## Cross-link with admissions-2026.json (NOT modified)
- programs.json: 341 codes. admissions-2026.json: 433 code-like values.
- **329 of 341 program codes (96%) overlap** → strong basis for a future merge agent
  (programs.json supplies field/branch/institutions/scope/streams/rankingBasis; admissions supplies minimums).
- ~12 programs.json codes have no admissions match (mostly low-confidence double-major continuation codes).

## Known data-quality caveats (manual verification recommended)
1. **Arabic ligature artifacts** from the PDF font: `لا` (lam-alef) sometimes collapses (`استغلال`→`استغالل`,
   `اتصالات`→`اتصاالت`), and the `الـ` definite article occasionally renders `األ`/`امل`. Letters are present and text
   is substantially readable, but exact strings may need a normalization pass before display.
2. eligibility-matrix.json priorities and a few field/stream mappings need human review against page 4 (merged cells).
3. weighted-formula coefficients are not in the circular — source elsewhere if needed.
4. 20 low-confidence programs (double-major / continuation rows) need manual field/branch attribution.
5. Stream priorities are absent from the registry by design — if a priority model is needed, derive it from page 4
   manually, not from programs.json.
