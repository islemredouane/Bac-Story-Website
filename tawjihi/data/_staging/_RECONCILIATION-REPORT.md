# RECONCILIATION REPORT — attempt #2 (2026-07-14)

Agent: Data Reconciliation Specialist. Supersedes attempt #1 (`catalog-reconciled.js` — do not use).
Sources of truth: `tawjihi/data/averages-2025/minima-phase1-2025.json` (4,445 rows, phase-1 2025 minima)
joined with `tawjihi/data/guide/programs.json` (495 programs, per-priority-group `allowedStreams`).

## Headline

| What | Count |
|---|---|
| Catalog entries reconciled (literal) | 206 (all preserved, none deleted) |
| Entries split into per-institution cards | 48 |
| Split cards generated (runtime, via `TW_SPLIT_DATA`) | 480 |
| Final runtime catalog size | 638 cards |
| Field changes (old→new) | 274 |
| Unmatched entries (flagged, numbers untouched) | 29 |
| KB entries re-resolved from official rows | 140 |
| KB entries with numbers moved to `legacy_unverified` | 66 |

## The split design (owner decision, implemented)

- `TW_CATALOG` literal keeps all 206 entries. A `TW_SPLIT_DATA` block + expander at the end of
  `catalog.js` replaces each multi-institution entry at load time with one card per institution
  (`<baseId>-<etb code>`, e.g. `droit-c17`). Cards inherit description/careers/img from the base
  card and carry `baseId`, their own `unis:[single institution]`, official `avg`/`minAvg`, and
  the official `streamCodes` from `programs.json`.
- `twById()` resolves: exact id → `baseId` (legacy wishlists) → base prefix. Patched so an orphan
  split id whose institution card no longer exists falls back to a sibling card (`c.baseId === base`).
- No split duplicates a standalone school entry: schools that already have their own card (ESI,
  ENSIA, ESTIN, ESI-SBA, ENSCS, NHSM, ENSTA, EPAU, ENSA, ESSAIA, ESSB, ENSB, ENSSMAL, ESC, EHEC,
  ENSSEA, ESGEN, ESSG, ESCF, ESM, ESE...) were mapped `school` and their `unis[]` trimmed to the
  school itself. Split families exclude the `*CAN*` school rows accordingly (exceptions where NO
  standalone card exists: ENP Alger/Oran + ENSP Constantine inside `polytech`, ESA Mostaganem
  inside `agro`, ENST-TIC Oran inside `telecom` — noted in code-mapping).
- Military/concours cards: untouched (avg null + regLink kept).

## Priority-group join rule (applied everywhere)

`min1/min2/min3` are minima per PRIORITY GROUP (أولوية 1/2/3), joined to streams via
`programs.json.allowedStreams`. A missing `min2/min3` never excluded a stream. Cell statuses:
`value` = published minimum; `NC` = filière not saturated (no cutoff computed — NOT a number,
never converted to one); `--` = nobody admitted in that group; blank = priority rank not used.

## Averages convention (uniform, shown as "معدل القبول (مرجعي)")

- **Single-institution card (school/split/single):** `avg` = the priority-group-1 minimum (`min1`;
  if group 1 unpublished, the first published group). `minAvg` = lowest published minimum across
  groups. Institutions with several official variants of the same filière (e.g. LAL+TCL) merged
  by taking the lowest published value per group.
- **National-recruitment entries (med/pharm/dent):** the single C99 row, unis = "توجيه وطني".
- **Wilaya-keyed entries (paramedical X/W-codes, ENS umbrella):** `avg` = MEDIAN across wilaya rows
  (row representative = its lowest published minimum), `minAvg` = national minimum. Per-wilaya
  detail lives in the KB `wilayaAverages`.
- **Duplicate entries (kept single):** representative = median of per-institution `min1`s.
- Entries whose every mapped row is NC: `avg: null` + an added Arabic condition line explaining
  that the filière was not saturated in 2025 (no cutoff published). These are NOT concours.
- `avgHistory`: replaced with the per-institution 2025 official value; unverifiable 2024
  aggregates for OTHER institutions were dropped, a card's own 2024 value kept where identifiable.
- Conditions lines quoting old "المعدلات المرجعية" numbers were replaced by a generated line
  quoting the official 2025 number and its source.

## Splits created

| base id | cards | institutions skipped (all-NC) |
|---|---|---|
| aeronautique | 2 | 0 |
| agro | 11 | 31 |
| allemand | 4 | 0 |
| anglais | 41 | 8 |
| arabe | 15 | 35 |
| architecture-uni | 15 | 8 |
| arts | 2 | 10 |
| auto | 2 | 0 |
| bio | 29 | 21 |
| charia | 14 | 4 |
| chinois | 2 | 0 |
| digital-prod | 2 | 0 |
| droit | 16 | 36 |
| e-biz | 2 | 1 |
| eco | 34 | 18 |
| electro | 16 | 25 |
| espagnol | 7 | 0 |
| fintech | 2 | 2 |
| genie-civil | 21 | 24 |
| genie-meca | 15 | 26 |
| gi | 2 | 0 |
| gp | 11 | 25 |
| health-comm | 5 | 3 |
| health-info | 4 | 0 |
| hse | 2 | 0 |
| hydro | 2 | 1 |
| hydrocarbures | 2 | 0 |
| info | 47 | 4 |
| italien | 4 | 0 |
| langues | 22 | 23 |
| marketing-comm | 3 | 2 |
| math | 13 | 36 |
| math-eco | 2 | 2 |
| med-ai | 5 | 0 |
| med-eco | 3 | 0 |
| polytech | 3 | 0 |
| russe | 2 | 0 |
| sciences-hum | 3 | 44 |
| sciences-po | 5 | 27 |
| sm | 14 | 32 |
| ss | 14 | 34 |
| st | 24 | 27 |
| staps | 15 | 7 |
| telecom | 2 | 0 |
| trading | 2 | 4 |
| traduction | 5 | 17 |
| turc | 3 | 0 |
| vet | 9 | 7 |

Institutions skipped because their 2025 phase-1 minima were all `NC` (not saturated → no published
cutoff) are listed per entry in `code-mapping.json` (`etbs_nc_skipped`). They still teach the
filière; they simply had no phase-1 cutoff to show.

## Every change (old → new, with source)

| id | field | old | new | source |
|---|---|---|---|---|
| esi | minAvg | 17.36 | 18.19 | codes ['C00CAN01'], pages [22] |
| esi | streamCodes | ["math", "techmath", "sciexp"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| ensia | minAvg | 18.19 | 18.59 | codes ['C00CAN04'], pages [22] |
| ensia | streamCodes | ["math", "techmath", "sciexp"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| estin | streamCodes | ["math", "techmath", "sciexp"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| med | minAvg | 16 | 16.65 | codes ['P01MAL01'], pages [1] |
| med | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| pharm | minAvg | 15.8 | 16.26 | codes ['P02MAL01'], pages [1] |
| pharm | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| dent | avg | 16.65 | 16.99 | codes ['P03MAL01'], pages [1] |
| dent | minAvg | 16.65 | 16.99 | codes ['P03MAL01'], pages [1] |
| dent | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| info | avg | 10.04 | 12.13 | codes ['C01LAL01', 'C01LAL02', 'C01LAL03', 'C01TCL01', 'C01TCL02', 'C01TCL03'], pages [1, … |
| esc | avg | 14 | 16.02 | codes ['F00CAN05'], pages [58] |
| esc | minAvg | 12.5 | 16.02 | codes ['F00CAN05'], pages [58] |
| esc | streamCodes | ["gestion", "math", "techmath", "sciexp", "lettres"] | ["math", "techmath", "sciexp", "gestion"] | programs.json allowedStreams |
| eco | avg | 11.45 | 10.1 | codes ['F00LAL01', 'F00LAL02', 'F00LAL03', 'F00LAL04'], pages [1, 2, 3, 4, 6, 7, 8, 10, 11… |
| eco | minAvg | 10.5 | 10.0 | codes ['F00LAL01', 'F00LAL02', 'F00LAL03', 'F00LAL04'], pages [1, 2, 3, 4, 6, 7, 8, 10, 11… |
| bio | avg | 15.05 | 10.93 | codes ['D00LAL01', 'D00LAL02', 'D00LAL03', 'D00LAL04', 'D02IAN01'], pages [1, 2, 3, 4, 6, … |
| bio | minAvg | 15.05 | 10.21 | codes ['D00LAL01', 'D00LAL02', 'D00LAL03', 'D00LAL04', 'D02IAN01'], pages [1, 2, 3, 4, 6, … |
| math | avg | 10 | 10.5 | codes ['C02LAL01', 'C02LAL02', 'C02LAL03'], pages [1, 2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 1… |
| education | avg | 11 | 10.03 | codes ['I19LAL01', 'I19LAL02', 'I19LAL03'], pages [1, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15… |
| genie-civil | avg | 10.17 | 11.75 | codes ['A05TCL01', 'A05TCL02', 'A05IAN01', 'A05IAN02'], pages [1, 2, 3, 5, 8, 9, 11, 13, 1… |
| genie-elec | avg | 11.98 | 11.28 | codes ['A16TCL01', 'A16IAN01', 'A16LAN01', 'A09IAN01', 'A09IAN04'], pages [1, 2, 3, 5, 9, … |
| droit | avg | 10.37 | 10.0 | codes ['G02LAL01', 'G02LAL02', 'G02LAL03', 'G02LAN01'], pages [1, 2, 3, 4, 6, 7, 8, 10, 12… |
| droit | minAvg | 9 | 10.0 | codes ['G02LAL01', 'G02LAL02', 'G02LAL03', 'G02LAN01'], pages [1, 2, 3, 4, 6, 7, 8, 10, 12… |
| langues | avg | 10.58 | 11.03 | codes ['H01LAL01', 'H01LAL02', 'H01LAL03'], pages [1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 16… |
| langues | minAvg | 10.58 | 11.0 | codes ['H01LAL01', 'H01LAL02', 'H01LAL03'], pages [1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 16… |
| psych | avg | 11 | 10.03 | codes ['I19LAL01', 'I19LAL02', 'I19LAL03'], pages [1, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15… |
| psych | minAvg | 11 | 10.0 | codes ['I19LAL01', 'I19LAL02', 'I19LAL03'], pages [1, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15… |
| genie-meca | avg | 11.61 | 11.11 | codes ['A19TCL01', 'A19LAN01', 'A19LAN02'], pages [1, 2, 4, 5, 9, 10, 11, 13, 14, 15, 16, … |
| esi-sba | minAvg | 17 | 17.36 | codes ['C00CAN02'], pages [32] |
| esi-sba | streamCodes | ["math", "techmath", "sciexp"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| enscs | streamCodes | ["math", "techmath", "sciexp"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| ensttic | avg | 16.69 | 17.17 | codes ['A00TUT01'], pages [22] |
| ensttic | minAvg | 16.69 | 17.17 | codes ['A00TUT01'], pages [22] |
| nhsm | streamCodes | ["math", "techmath"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| polytech | avg | 16.65 | 16.79 | codes ['A00CAN04', 'A00CAN07', 'A00CAN08'], pages [22, 36, 46] (base template; replaced by… |
| igee | avg | 14 | 16.85 | codes ['A17LAN01'], pages [52] |
| igee | minAvg | 16.15 | 16.85 | codes ['A17LAN01'], pages [52] |
| igee | streamCodes | ["math", "techmath"] | ["math", "techmath", "sciexp"] | programs.json allowedStreams |
| enssn | streamCodes | ["math", "sciexp", "techmath"] | ["math", "techmath", "sciexp"] | programs.json allowedStreams |
| ensas | streamCodes | ["math", "sciexp"] | ["math", "techmath", "sciexp"] | programs.json allowedStreams |
| st | avg | 10 | 10.67 | codes ['A00LAL01', 'A00LAL02', 'A00LAL03', 'A00LAL04', 'A00LAL05', 'A00TCL01', 'A00TCL02',… |
| hydrocarbures | avg | 14.42 | 15.47 | codes ['A03LAN01', 'A03LAN02'], pages [44, 51] (base template; replaced by 2 split cards) |
| hydrocarbures | minAvg | 14.42 | 14.81 | codes ['A03LAN01', 'A03LAN02'], pages [44, 51] (base template; replaced by 2 split cards) |
| optique | avg | 12.5 | 12.58 | codes ['A11IAN03', 'A11LAN01'], pages [29] |
| optique | minAvg | 11.5 | 12.58 | codes ['A11IAN03', 'A11LAN01'], pages [29] |
| gp | avg | 10.21 | 11.15 | codes ['A08TCL01', 'A08TCL02', 'A08IAN01', 'A08IAN02'], pages [1, 2, 3, 5, 8, 9, 11, 13, 1… |
| gi | avg | 11.19 | 13.36 | codes ['A18IAN01', 'A18LAN01'], pages [18, 48] (base template; replaced by 2 split cards) |
| gi | minAvg | 11.19 | 12.76 | codes ['A18IAN01', 'A18LAN01'], pages [18, 48] (base template; replaced by 2 split cards) |
| gt | avg | 11.02 | 11.68 | codes ['A14LAN01'], pages [37] |
| gt | minAvg | 11.02 | 11.68 | codes ['A14LAN01'], pages [37] |
| gt | streamCodes | ["math", "techmath"] | ["math", "techmath", "sciexp"] | programs.json allowedStreams |
| marine-eng | avg | 13 | 14.09 | codes ['A10LAN01'], pages [47] |
| marine-eng | minAvg | 12 | 14.09 | codes ['A10LAN01'], pages [47] |
| marine-eng | streamCodes | ["math", "techmath"] | ["math", "techmath", "sciexp"] | programs.json allowedStreams |
| vet | avg | 12.26 | 13.3 | codes ['P04VAL01', 'P04VAN01', 'P04VAN02', 'P04VAN03', 'P04VAN04'], pages [5, 8, 12, 14, 1… |
| pharm-ind | avg | 12.8 | 16.19 | codes ['P05LAN01'], pages [25] |
| pharm-ind | minAvg | 12.8 | 16.19 | codes ['P05LAN01'], pages [25] |
| pharm-ind | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| med-bio | avg | 16.65 | 18.19 | codes ['PD0LAN01'], pages [23] |
| med-bio | minAvg | 16.65 | 18.19 | codes ['PD0LAN01'], pages [23] |
| ensb | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| enssmal | streamCodes | ["sciexp"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| kine | avg | 13 | 16.19 | wilaya: median of 56 wilaya rows, codes ['X04SANTE'], pages [216, 217, 219] |
| kine | minAvg | 12 | 10.01 | wilaya: median of 56 wilaya rows, codes ['X04SANTE'], pages [216, 217, 219] |
| labo | avg | 12 | 15.7 | wilaya: median of 55 wilaya rows, codes ['X10SANTE'], pages [217, 220, 221] |
| labo | minAvg | 11 | 12.42 | wilaya: median of 55 wilaya rows, codes ['X10SANTE'], pages [217, 220, 221] |
| radio | avg | 12 | 15.7 | wilaya: median of 55 wilaya rows, codes ['X09SANTE'], pages [217, 220, 225] |
| radio | minAvg | 11 | 12.14 | wilaya: median of 55 wilaya rows, codes ['X09SANTE'], pages [217, 220, 225] |
| sage-femme | avg | 12.5 | 15.57 | wilaya: median of 55 wilaya rows, codes ['W01SANTE'], pages [212, 213, 214] |
| sage-femme | minAvg | 11.5 | 11.93 | wilaya: median of 55 wilaya rows, codes ['W01SANTE'], pages [212, 213, 214] |
| paramedical | avg | 11.5 | 15.32 | agg: median of 729 wilaya rows, codes ['X01SANTE', 'X02SANTE', 'X03SANTE', 'X04SANTE', 'X0… |
| paramedical | minAvg | 10.5 | 10.01 | agg: median of 729 wilaya rows, codes ['X01SANTE', 'X02SANTE', 'X03SANTE', 'X04SANTE', 'X0… |
| ehec | streamCodes | ["gestion", "math", "techmath", "sciexp"] | ["math", "techmath", "sciexp", "gestion"] | programs.json allowedStreams |
| enssea | streamCodes | ["math", "gestion", "techmath"] | ["math", "techmath", "sciexp", "gestion"] | programs.json allowedStreams |
| esb | avg | 13.5 | null | concours (no official bac-wishes minima) |
| esm | location | ESM · الجزائر | ESM · تلمسان | manual (see note) |
| esm | streamCodes | ["gestion", "math", "sciexp", "lettres"] | ["math", "techmath", "sciexp", "gestion"] | programs.json allowedStreams |
| ensa-agro | avg | 13.5 | 14.91 | codes ['D00CAN07'], pages [22] |
| ensa-agro | minAvg | 12.5 | 14.91 | codes ['D00CAN07'], pages [22] |
| ensa-agro | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| sm | avg | 10.57 | 10.29 | codes ['B00LAL01', 'B00LAL02', 'B00LAL03'], pages [1, 2, 4, 5, 8, 10, 11, 12, 13, 15, 16, … |
| sm | minAvg | 10.57 | 10.02 | codes ['B00LAL01', 'B00LAL02', 'B00LAL03'], pages [1, 2, 4, 5, 8, 10, 11, 12, 13, 15, 16, … |
| ens | avg | 13.5 | 14.83 | median across 1430 ENS teacher-track rows |
| ens | minAvg | 12.5 | 10.0 | median across 1430 ENS teacher-track rows |
| traduction | avg | 13.16 | 13.41 | codes ['H03IAL01', 'H03IAL02', 'H03IAL03', 'H03IAL04', 'H03IAL05', 'H03IAL09', 'H03IAL10',… |
| commu | avg | 10.02 | null | codes ['I03LAN01', 'I03LAN02'], pages [25, 38] |
| commu | minAvg | 10.02 | null | codes ['I03LAN01', 'I03LAN02'], pages [25, 38] |
| charia | avg | 10 | 11.06 | codes ['I20LAL01', 'I20LAL02', 'I20LAN01'], pages [1, 5, 8, 15, 17, 19, 23, 27, 39, 41, 43… |
| med-ai | avg | 14.16 | 16.81 | codes ['PC0LAN01', 'PC0LAN02', 'PC0LAN03', 'PC0LAN04', 'PC0LAN05'], pages [9, 11, 30, 35, … |
| med-ai | minAvg | 14.16 | 16.66 | codes ['PC0LAN01', 'PC0LAN02', 'PC0LAN03', 'PC0LAN04', 'PC0LAN05'], pages [9, 11, 30, 35, … |
| it-int | avg | 10.17 | 14.43 | codes ['FF1LAN01'], pages [57] |
| it-int | minAvg | 10.17 | 14.43 | codes ['FF1LAN01'], pages [57] |
| ensta | streamCodes | ["math", "sciexp", "techmath"] | ["math", "techmath", "sciexp"] | programs.json allowedStreams |
| ensee | name | المدرسة الوطنية العليا للطاقات المتجددة والبيئة والتنمية المستدامة — باتنة | المدرسة العليا في الهندسة الكهربائية والطاقوية — وهران | manual (see note) |
| ensee | location | ENSEE · وهران | ESGEE · وهران | manual (see note) |
| hnsre | name | المدرسة الوطنية العليا للطاقات المتجددة — حاسي مسعود | المدرسة الوطنية العليا للطاقات المتجددة والبيئة والتنمية المستدامة — باتنة | manual (see note) |
| aeronautique | avg | 15.45 | 15.6 | codes ['A06LAN01', 'A06IAN01'], pages [13, 47] (base template; replaced by 2 split cards) |
| esgen | streamCodes | ["gestion", "math", "techmath", "sciexp"] | ["math", "techmath", "sciexp", "gestion"] | programs.json allowedStreams |
| essg | streamCodes | ["gestion", "math", "techmath", "sciexp"] | ["math", "techmath", "sciexp", "gestion"] | programs.json allowedStreams |
| escf | avg | 12.5 | 14.83 | codes ['F00CAN02'], pages [36] |
| escf | minAvg | 12.5 | 14.83 | codes ['F00CAN02'], pages [36] |
| escf | streamCodes | ["gestion", "math", "techmath"] | ["math", "techmath", "sciexp", "gestion"] | programs.json allowedStreams |
| ese | avg | 13.74 | 14.63 | codes ['F00CAN04'], pages [46] |
| ese | minAvg | 13.74 | 14.63 | codes ['F00CAN04'], pages [46] |
| ese | streamCodes | ["gestion", "math", "techmath", "sciexp"] | ["math", "techmath", "sciexp", "gestion"] | programs.json allowedStreams |
| essaia | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| essb | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| isp | avg | 11.27 | 14.97 | wilaya: median of 55 wilaya rows, codes ['X01SANTE'], pages [216, 219, 221] |
| isp | minAvg | 11.27 | 11.16 | wilaya: median of 55 wilaya rows, codes ['X01SANTE'], pages [216, 219, 221] |
| dental-prosthetist | avg | 16.99 | 15.81 | wilaya: median of 56 wilaya rows, codes ['X03SANTE'], pages [223, 224, 228] |
| dental-prosthetist | minAvg | 16.99 | 12.23 | wilaya: median of 56 wilaya rows, codes ['X03SANTE'], pages [223, 224, 228] |
| psychomotricien | avg | 11.27 | 15.17 | wilaya: median of 41 wilaya rows, codes ['X08SANTE'], pages [229, 230, 238] |
| psychomotricien | minAvg | 11.27 | 11.97 | wilaya: median of 41 wilaya rows, codes ['X08SANTE'], pages [229, 230, 238] |
| med-eco | avg | 13.74 | 16.67 | codes ['PF0LAN01', 'PF0LAN02', 'PF0LAN03'], pages [30, 36, 46] (base template; replaced by… |
| med-eco | minAvg | 13.74 | 16.66 | codes ['PF0LAN01', 'PF0LAN02', 'PF0LAN03'], pages [30, 36, 46] (base template; replaced by… |
| med-psy | avg | 16.65 | 16.67 | codes ['PI0LAN01'], pages [19] |
| med-psy | minAvg | 16.65 | 16.67 | codes ['PI0LAN01'], pages [19] |
| med-psy | streamCodes | ["sciexp", "math"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| tech-media | avg | 16.69 | null | codes ['IC0LAN01'], pages [5] |
| tech-media | minAvg | 16.69 | null | codes ['IC0LAN01'], pages [5] |
| math-eco | avg | 10 | 12.65 | codes ['CF0LAN01', 'CF0LAN03', 'CF0LAN04', 'CF0LAN06'], pages [4, 23, 39, 42] (base templa… |
| math-eco | minAvg | 10 | 12.29 | codes ['CF0LAN01', 'CF0LAN03', 'CF0LAN04', 'CF0LAN06'], pages [4, 23, 39, 42] (base templa… |
| inataa | avg | 13 | 13.91 | codes ['D07LAN01'], pages [37] |
| inataa | minAvg | 11.5 | 13.91 | codes ['D07LAN01'], pages [37] |
| inataa | streamCodes | ["math", "sciexp", "gestion"] | ["math", "sciexp"] | programs.json allowedStreams |
| architecture-uni | avg | 14.5 | 13.82 | codes ['N05IAL01', 'N05IAL02'], pages [2, 3, 5, 7, 8, 11, 12, 13, 14, 17, 19, 22, 23, 28, … |
| architecture-uni | minAvg | 14.5 | 12.0 | codes ['N05IAL01', 'N05IAL02'], pages [2, 3, 5, 7, 8, 11, 12, 13, 14, 17, 19, 22, 23, 28, … |
| ss | avg | 11.5 | 10.03 | codes ['I19LAL01', 'I19LAL02', 'I19LAL03'], pages [1, 2, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15… |
| anglais | avg | 15.5 | 12.21 | codes ['H06LAL01', 'H06LAL02', 'H06LAL03'], pages [1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 14, 15… |
| anglais | minAvg | 12.5 | 11.03 | codes ['H06LAL01', 'H06LAL02', 'H06LAL03'], pages [1, 2, 3, 5, 6, 7, 9, 10, 12, 13, 14, 15… |
| francais | avg | 13 | 11.03 | codes ['H01LAL01', 'H01LAL02', 'H01LAL03'], pages [1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 16… |
| francais | minAvg | 10.5 | 11.0 | codes ['H01LAL01', 'H01LAL02', 'H01LAL03'], pages [1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 16… |
| espagnol | avg | 12.5 | 12.29 | codes ['H02LAL01'], pages [4, 19, 20, 23, 37, 41, 60] (base template; replaced by 7 split … |
| espagnol | minAvg | 10 | 10.58 | codes ['H02LAL01'], pages [4, 19, 20, 23, 37, 41, 60] (base template; replaced by 7 split … |
| allemand | avg | 13.5 | 12.44 | codes ['H04LAL01'], pages [20, 23, 32, 33] (base template; replaced by 4 split cards) |
| allemand | minAvg | 11 | 11.53 | codes ['H04LAL01'], pages [20, 23, 32, 33] (base template; replaced by 4 split cards) |
| italien | avg | 12 | 11.65 | codes ['H07LAL01'], pages [14, 24, 34, 49] (base template; replaced by 4 split cards) |
| italien | minAvg | 10 | 10.07 | codes ['H07LAL01'], pages [14, 24, 34, 49] (base template; replaced by 4 split cards) |
| russe | avg | 12.5 | 11.04 | codes ['H05LAL01'], pages [23, 49] (base template; replaced by 2 split cards) |
| russe | minAvg | 11 | 10.97 | codes ['H05LAL01'], pages [23, 49] (base template; replaced by 2 split cards) |
| turc | avg | 14.5 | 10.87 | codes ['H08LAL01'], pages [24, 39, 48] (base template; replaced by 3 split cards) |
| turc | minAvg | 13 | 10.0 | codes ['H08LAL01'], pages [24, 39, 48] (base template; replaced by 3 split cards) |
| chinois | avg | 15 | 13.05 | codes ['H09LAL01'], pages [24, 38] (base template; replaced by 2 split cards) |
| chinois | minAvg | 13.5 | 12.73 | codes ['H09LAL01'], pages [24, 38] (base template; replaced by 2 split cards) |
| geologie | avg | 10.68 | 10.0 | codes ['E03LAL01', 'E03LAL02', 'E03LAL03'], pages [2, 6, 9, 11, 16, 17, 19, 20, 21, 26, 27… |
| geologie | streamCodes | ["math", "techmath", "sciexp"] | ["math", "sciexp", "techmath"] | programs.json allowedStreams |
| geographie | avg | 11.5 | null | codes ['E01LAL01', 'E01LAL02'], pages [2, 6, 9, 11, 17, 20, 26, 29, 34, 37, 49] |
| geographie | minAvg | 10 | null | codes ['E01LAL01', 'E01LAL02'], pages [2, 6, 9, 11, 17, 20, 26, 29, 34, 37, 49] |
| agroalimentaire | avg | 15.79 | 12.49 | codes ['D07IAN01'], pages [10] |
| agroalimentaire | minAvg | 10.75 | 12.49 | codes ['D07IAN01'], pages [10] |
| agroalimentaire | streamCodes | ["math", "techmath", "sciexp", "gestion"] | ["math", "sciexp"] | programs.json allowedStreams |
| loisir | avg | 11 | null | codes ['I10LAL01'], pages [5, 8, 12, 14, 17, 24, 28, 46, 50, 56, 62] |
| loisir | minAvg | 10 | null | codes ['I10LAL01'], pages [5, 8, 12, 14, 17, 24, 28, 46, 50, 56, 62] |
| staps | avg | 15.32 | 11.11 | codes ['J00LAL01', 'J00LAL02', 'J00LAN01'], pages [2, 5, 6, 9, 10, 12, 15, 16, 17, 25, 27,… |
| staps | minAvg | 10 | 10.22 | codes ['J00LAL01', 'J00LAL02', 'J00LAN01'], pages [2, 5, 6, 9, 10, 12, 15, 16, 17, 25, 27,… |
| arts | avg | 16.15 | 10.26 | codes ['K00LAL01', 'K00LAN01'], pages [6, 19, 20, 24, 27, 31, 33, 39, 41, 44, 46, 48] (bas… |
| arabe | avg | 15.45 | 10.19 | codes ['L00LAL01', 'L00LAL02', 'L00LAL03'], pages [1, 3, 5, 6, 7, 8, 10, 12, 13, 14, 15, 1… |
| tamazight | avg | 15.47 | 10.31 | codes ['M00LAL01'], pages [8, 10, 15, 16, 22] |
| tamazight | minAvg | 10.13 | 10.31 | codes ['M00LAL01'], pages [8, 10, 15, 16, 22] |
| tamazight | streamCodes | ["math", "lettres"] | ["lettres", "langues", "arts", "sciexp", "gestion"] | programs.json allowedStreams |
| droit-info | avg | 14.33 | 13.62 | codes ['GC0LAN01', 'GC0LAN02'], pages [10, 42] |
| info-gest | avg | 15.63 | 14.86 | codes ['CF0LAN02'], pages [48] |
| lang-fin | avg | null | 13.99 | codes ['HF0LAN01'], pages [19] |
| lang-fin | minAvg | null | 13.99 | codes ['HF0LAN01'], pages [19] |
| lang-fin | streamCodes | ["sciexp", "gestion", "langues"] | ["gestion", "langues", "math", "sciexp"] | programs.json allowedStreams |
| info-auto | avg | 15.33 | 14.61 | codes ['CA0LAN01'], pages [34] |
| cs-eco | avg | null | 14.93 | codes ['CF0LAN05'], pages [10] |
| cs-eco | minAvg | null | 14.93 | codes ['CF0LAN05'], pages [10] |
| cs-eco | streamCodes | ["math", "techmath", "sciexp", "gestion", "lettres", "langues"] | ["math", "sciexp", "gestion"] | programs.json allowedStreams |
| arch-soc | avg | 14.33 | 14.03 | codes ['NI0LAN01'], pages [11] |
| arch-soc | minAvg | 14.33 | 14.03 | codes ['NI0LAN01'], pages [11] |
| arch-soc | streamCodes | ["math", "techmath", "sciexp", "lettres", "langues"] | ["math", "techmath", "sciexp"] | programs.json allowedStreams |
| eng-pol | avg | null | 13.47 | codes ['GH0LAN01', 'HG0LAN01'], pages [49, 50] |
| eng-pol | minAvg | null | 13.47 | codes ['GH0LAN01', 'HG0LAN01'], pages [49, 50] |
| eng-pol | streamCodes | ["sciexp", "gestion", "lettres", "langues"] | ["lettres", "langues", "sciexp", "gestion"] | programs.json allowedStreams |
| eco-media | avg | null | 13.86 | codes ['IF0LAN01'], pages [25] |
| eco-media | minAvg | null | 13.86 | codes ['IF0LAN01'], pages [25] |
| eco-media | streamCodes | ["math", "techmath", "sciexp", "gestion", "lettres", "langues"] | ["gestion", "math", "techmath", "sciexp"] | programs.json allowedStreams |
| media-pol | avg | null | 13.25 | codes ['IG0LAN01'], pages [25] |
| media-pol | minAvg | null | 13.25 | codes ['IG0LAN01'], pages [25] |
| media-pol | streamCodes | ["math", "techmath", "sciexp", "gestion", "lettres", "langues"] | ["gestion", "lettres", "langues", "math", "sciexp", "techmath"] | programs.json allowedStreams |
| sports-media | avg | null | 12.46 | codes ['IJ0LAN01'], pages [25] |
| sports-media | minAvg | null | 12.46 | codes ['IJ0LAN01'], pages [25] |
| sports-media | streamCodes | ["sciexp", "lettres", "langues"] | ["lettres", "langues", "sciexp"] | programs.json allowedStreams |
| eco-ir | avg | 15.2 | 14.21 | codes ['FC1LPN02'], pages [24] |
| eco-ir | minAvg | 13.8 | 14.21 | codes ['FC1LPN02'], pages [24] |
| eco-ir | streamCodes | ["math", "techmath", "sciexp", "gestion", "lettres", "langues"] | ["gestion", "lettres", "math", "techmath", "sciexp", "langues"] | programs.json allowedStreams |
| archi-civil | avg | 14.33 | 13.68 | codes ['NA0LAN01'], pages [5] |
| archi-civil | minAvg | 14.33 | 13.68 | codes ['NA0LAN01'], pages [5] |
| enscrbc | avg | null | 13.23 | codes ['N00TUT01'], pages [57] |
| enscrbc | minAvg | null | 13.23 | codes ['N00TUT01'], pages [57] |
| gestion | avg | 15.63 | 10.1 | codes ['F00LAL01', 'F00LAL02', 'F00LAL03', 'F00LAL04'], pages [1, 2, 3, 4, 6, 7, 8, 10, 11… |
| health-soc | avg | 13 | 12.85 | codes ['FI1LAN01'], pages [38] |
| health-soc | minAvg | 11.5 | 12.85 | codes ['FI1LAN01'], pages [38] |
| digital-biz | avg | 15 | 14.27 | codes ['IF1LAN01'], pages [25] |
| digital-biz | minAvg | 13.5 | 14.27 | codes ['IF1LAN01'], pages [25] |
| comm-tourism | avg | 13.2 | null | codes ['II1LAN01'], pages [25] |
| comm-tourism | minAvg | 11.5 | null | codes ['II1LAN01'], pages [25] |
| cinema-media | avg | 12.5 | null | codes ['KK1LAN01'], pages [25] |
| cinema-media | minAvg | 11 | null | codes ['KK1LAN01'], pages [25] |
| public-innov | avg | 14 | null | codes ['GG1LAN01'], pages [24] |
| public-innov | minAvg | 12.5 | null | codes ['GG1LAN01'], pages [24] |
| childhood | avg | 12 | 13.12 | codes ['JI1LAN01'], pages [25] |
| childhood | minAvg | 10.5 | 13.12 | codes ['JI1LAN01'], pages [25] |
| health-info | avg | 14.2 | 12.0 | codes ['F01LPL01'], pages [4, 29, 49, 62] (base template; replaced by 4 split cards) |
| health-info | minAvg | 12.5 | 10.17 | codes ['F01LPL01'], pages [4, 29, 49, 62] (base template; replaced by 4 split cards) |
| marketing-comm | avg | 12.8 | 10.04 | codes ['F03LPL01'], pages [4, 6, 29, 50, 62] (base template; replaced by 3 split cards) |
| marketing-comm | minAvg | 11 | 10.02 | codes ['F03LPL01'], pages [4, 6, 29, 50, 62] (base template; replaced by 3 split cards) |
| e-biz | avg | 14.2 | 11.31 | codes ['F03LPL02'], pages [3, 29, 50] (base template; replaced by 2 split cards) |
| e-biz | minAvg | 12.5 | 10.59 | codes ['F03LPL02'], pages [3, 29, 50] (base template; replaced by 2 split cards) |
| trading | avg | 15.2 | 10.48 | codes ['F04LAL01'], pages [4, 15, 29, 44, 50, 62] (base template; replaced by 2 split card… |
| trading | minAvg | 13.5 | 10.09 | codes ['F04LAL01'], pages [4, 15, 29, 44, 50, 62] (base template; replaced by 2 split card… |
| fintech | avg | 14.5 | 10.35 | codes ['F02LAL01'], pages [15, 29, 41, 62] (base template; replaced by 2 split cards) |
| fintech | minAvg | 13 | 10.02 | codes ['F02LAL01'], pages [15, 29, 41, 62] (base template; replaced by 2 split cards) |
| agro | avg | 14.5 | 10.31 | codes ['D03TCL01', 'D03LAN01', 'D03LAN02', 'D00CAN06'], pages [1, 2, 4, 6, 8, 11, 12, 14, … |
| hse | avg | 14.18 | 13.72 | codes ['A21IAN01', 'A21LAN01'], pages [9, 48] (base template; replaced by 2 split cards) |
| hse | minAvg | 13.83 | 13.15 | codes ['A21IAN01', 'A21LAN01'], pages [9, 48] (base template; replaced by 2 split cards) |
| hydro | avg | 12.75 | 11.4 | codes ['A12LAL01', 'A12LAL02', 'A12LAL03'], pages [10, 11, 47] (base template; replaced by… |
| hydro | minAvg | 10 | 11.29 | codes ['A12LAL01', 'A12LAL02', 'A12LAL03'], pages [10, 11, 47] (base template; replaced by… |
| petrochimie | avg | 15.21 | 14.79 | codes ['A13IAN01', 'A13LAN01'], pages [31] |
| petrochimie | streamCodes | ["math", "techmath", "sciexp", "gestion"] | ["math", "techmath", "sciexp"] | programs.json allowedStreams |
| auto | avg | 14.83 | 14.88 | codes ['A02IAN01', 'A02LAN01'], pages [47, 51] (base template; replaced by 2 split cards) |
| auto | minAvg | 10 | 14.02 | codes ['A02IAN01', 'A02LAN01'], pages [47, 51] (base template; replaced by 2 split cards) |
| electro | avg | 15 | 11.28 | codes ['A16TCL01', 'A16IAN01', 'A16LAN01', 'A09IAN01', 'A09IAN04'], pages [1, 2, 3, 5, 9, … |
| electro | minAvg | 10 | 10.14 | codes ['A16TCL01', 'A16IAN01', 'A16LAN01', 'A09IAN01', 'A09IAN04'], pages [1, 2, 3, 5, 9, … |
| telecom | avg | 16 | 14.83 | codes ['A20IAN01', 'A00TUT02'], pages [35, 46] (base template; replaced by 2 split cards) |
| telecom | minAvg | 10 | 12.97 | codes ['A20IAN01', 'A00TUT02'], pages [35, 46] (base template; replaced by 2 split cards) |
| env-sci | avg | 12.27 | 10.63 | codes ['D06FPN01'], pages [37] |
| env-sci | minAvg | 11.14 | 10.63 | codes ['D06FPN01'], pages [37] |
| env-sci | streamCodes | ["math", "techmath", "sciexp"] | ["math", "sciexp"] | programs.json allowedStreams |
| city-jobs | avg | 14.12 | null | codes ['N02IAN01'], pages [5] |
| city-jobs | minAvg | 10 | null | codes ['N02IAN01'], pages [5] |
| digital-prod | avg | 13.2 | 10.35 | codes ['K01LPL01'], pages [24, 39] (base template; replaced by 2 split cards) |
| digital-prod | minAvg | 11.5 | 10.22 | codes ['K01LPL01'], pages [24, 39] (base template; replaced by 2 split cards) |
| theater | avg | 11.2 | null | codes ['K02LAN02'], pages [27] |
| theater | minAvg | 10 | null | codes ['K02LAN02'], pages [27] |
| music-perf | avg | 11.5 | null | codes ['K02LAN01'], pages [39] |
| music-perf | minAvg | 10.5 | null | codes ['K02LAN01'], pages [39] |
| scenario | avg | 12 | null | codes ['K01LAL01'], pages [24, 33] |
| scenario | minAvg | 10.5 | null | codes ['K01LAL01'], pages [24, 33] |
| 3d-design | avg | 13 | null | codes ['K01LPN01'], pages [41] |
| 3d-design | minAvg | 10.5 | null | codes ['K01LPN01'], pages [41] |
| soc-leisure | avg | 11.8 | null | codes ['I10LAL01'], pages [5, 8, 12, 14, 17, 24, 28, 46, 50, 56, 62] |
| soc-leisure | minAvg | 10.2 | null | codes ['I10LAL01'], pages [5, 8, 12, 14, 17, 24, 28, 46, 50, 56, 62] |
| history-data | avg | 12.2 | null | codes ['I04LAL01'], pages [3, 8, 17, 24, 46, 56] |
| history-data | minAvg | 10.5 | null | codes ['I04LAL01'], pages [3, 8, 17, 24, 46, 56] |
| health-comm | avg | 12.5 | 10.52 | codes ['I03LAL01'], pages [5, 12, 17, 24, 35, 41, 50, 56] (base template; replaced by 5 sp… |
| health-comm | minAvg | 11 | 10.17 | codes ['I03LAL01'], pages [5, 12, 17, 24, 35, 41, 50, 56] (base template; replaced by 5 sp… |
| commerce | avg | 15.52 | 10.1 | codes ['F00LAL01', 'F00LAL02', 'F00LAL03', 'F00LAL04'], pages [1, 2, 3, 4, 6, 7, 8, 10, 11… |
| aeroport | avg | 13.5 | 12.7 | codes ['F01LPN01'], pages [29] |
| aeroport | minAvg | 12 | 12.7 | codes ['F01LPN01'], pages [29] |
| aeroport | streamCodes | ["lettres", "langues"] | ["lettres"] | programs.json allowedStreams |
| appareilleur-orthopediste | avg | 15.4 | 15.11 | wilaya: median of 27 wilaya rows, codes ['X07SANTE'], pages [237, 238, 241] |
| appareilleur-orthopediste | minAvg | 13.8 | 11.95 | wilaya: median of 27 wilaya rows, codes ['X07SANTE'], pages [237, 238, 241] |
| esp | avg | null | 15.1 | wilaya: median of 44 wilaya rows, codes ['X06SANTE'], pages [219, 229, 236] |
| esp | minAvg | null | 11.84 | wilaya: median of 44 wilaya rows, codes ['X06SANTE'], pages [219, 229, 236] |
| pedicure-podologue | avg | null | 14.77 | wilaya: median of 10 wilaya rows, codes ['X05SANTE'], pages [236] |
| pedicure-podologue | minAvg | null | 13.08 | wilaya: median of 10 wilaya rows, codes ['X05SANTE'], pages [236] |
| pharma-prep | avg | 16.2 | 15.57 | wilaya: median of 55 wilaya rows, codes ['X11SANTE'], pages [218, 220, 225] |
| pharma-prep | minAvg | 14.8 | 11.95 | wilaya: median of 55 wilaya rows, codes ['X11SANTE'], pages [218, 220, 225] |
| dieteticien | avg | null | 15.98 | wilaya: median of 54 wilaya rows, codes ['X02SANTE'], pages [222, 223, 233] |
| dieteticien | minAvg | null | 12.01 | wilaya: median of 54 wilaya rows, codes ['X02SANTE'], pages [222, 223, 233] |
| public-health-hygiene | avg | 14.8 | 15.32 | wilaya: median of 55 wilaya rows, codes ['X12SANTE'], pages [220, 221, 225] |
| public-health-hygiene | minAvg | 13.5 | 11.58 | wilaya: median of 55 wilaya rows, codes ['X12SANTE'], pages [220, 221, 225] |
| adjoint-medical | avg | 15.8 | 14.26 | wilaya: median of 56 wilaya rows, codes ['X13SANTE'], pages [218, 221, 222] |
| adjoint-medical | minAvg | 13.15 | 10.73 | wilaya: median of 56 wilaya rows, codes ['X13SANTE'], pages [218, 221, 222] |
| assistant-social | avg | 15.4 | 14.04 | wilaya: median of 55 wilaya rows, codes ['X14SANTE'], pages [222, 227, 239] |
| assistant-social | minAvg | 13.3 | 11.62 | wilaya: median of 55 wilaya rows, codes ['X14SANTE'], pages [222, 227, 239] |
| law-fin | avg | 16.2 | 13.21 | codes ['GF0LAN01'], pages [40] |
| law-fin | minAvg | 15.2 | 13.21 | codes ['GF0LAN01'], pages [40] |
| law-fin | streamCodes | ["math", "techmath", "sciexp", "gestion", "langues"] | ["gestion", "math", "techmath", "sciexp"] | programs.json allowedStreams |

## Unmatched entries (flagged — numbers left as-is, must not be treated as official)

| id | kept avg | why |
|---|---|---|
| essa | 15.38 | no MESRS aeronautics school in 2025 minima; university aeronautics = "aeronautique" entry |
| gmec | 10.31 | materials/mechatronics umbrella; closest official (metallurgie A04) judged too different t… |
| med-info | 10.04 | informatique medicale as own LMD degree not in 2025 minima; closest is med-ai (medecine+in… |
| space-tech | 15.5 | no matching filiere in the 2025 minima document |
| quantum | 14.43 | no matching filiere in the 2025 minima document |
| digital-agro | 12.29 | no matching filiere in the 2025 minima document |
| philo | None | no matching filiere in the 2025 minima document |
| cinema | 10.48 | cinema & arts du spectacle not in 2025 minima; current numbers appear copied from digital-… |
| med-gen | None | no matching filiere in the 2025 minima document |
| addict | None | no matching filiere in the 2025 minima document |
| prec-med | None | no matching filiere in the 2025 minima document |
| dent-hyg | None | no matching filiere in the 2025 minima document |
| gen-couns | None | no matching filiere in the 2025 minima document |
| ind-entr | None | no matching filiere in the 2025 minima document |
| smart-cities | None | no matching filiere in the 2025 minima document |
| med-informatics | None | duplicate concept of med-info; not in 2025 minima |
| digital-eng | 14.33 | no matching filiere in the 2025 minima document |
| dip-law | 14.33 | no matching filiere in the 2025 minima document |
| comm-ir | 14.8 | no matching filiere in the 2025 minima document |
| law-ir | 15 | no matching filiere in the 2025 minima document |
| penal | None | no matching filiere in the 2025 minima document |
| criminologie | None | no matching filiere in the 2025 minima document |
| forensique | None | no matching filiere in the 2025 minima document |
| circular-economy | None | no matching filiere in the 2025 minima document |
| molecular-engineering | None | no matching filiere in the 2025 minima document |
| genomic-data | None | no matching filiere in the 2025 minima document |
| csr | None | no matching filiere in the 2025 minima document |
| proteins-seeds | None | no matching filiere in the 2025 minima document |
| anesthesie-reanimation | 16 | no matching filiere in the 2025 minima document |

## Duplicate entries detected (recommend merging in a later pass)

- `education` → same official filière as `ss` (sciences de l education enters via sciences sociales tronc commun)
- `genie-elec` → same official filière as `electro` ()
- `psych` → same official filière as `ss` (psychology enters via sciences sociales tronc commun)
- `francais` → same official filière as `langues` ()
- `gestion` → same official filière as `eco` (SEGC tronc commun = same official filiere as eco)
- `soc-leisure` → same official filière as `loisir` (same official filiere as loisir)
- `commerce` → same official filière as `eco` (SEGC tronc commun = same official filiere as eco)

## Name/location fixes

- `ensee`: card mixed ESGEE Oran with ENSERDD Batna → renamed to
  "المدرسة العليا في الهندسة الكهربائية والطاقوية — وهران" (code A00CAN03, ESGEE Oran).
- `hnsre`: name said حاسي مسعود → fixed to the Batna school (A00CAN12 / W92).
- `esm`: Ecole Supérieure de Management is in Tlemcen (F00CAN03) → location fixed (medium confidence).
- Lam-alef mojibake scan (أ/إ/ا + األ patterns): none found in catalog.js or the KB after rebuild.

## KB updates (`tawjihi/data/kb/specialities-kb.json`, ids unchanged)

- 140 entries: `resolvedAverages` recomputed from the mapped official rows
  (`min1/min2/min3` = lowest published value per priority group across mapped rows).
- Wilaya-keyed ids: `wilayaAverages` rebuilt per wilaya from the official rows.
- Family ids: `wilayaAverages` rebuilt keyed by institution (short French name).
- 66 entries with numbers but no official mapping: `resolvedAverages`/`wilayaAverages` moved to
  `legacy_unverified` so the AI never quotes them as fact.
- `embed-kb.js` compatibility checked: it consumes `sections` and `wilayaAverages` (same shapes).
  **Action for the human: re-run `node scripts/embed-kb.js` and commit.**

## Manual spot-check (12 changed averages vs `minima-phase1-2025.csv`)

| card | applied avg | CSV row (code, etb, min1) | page | match |
|---|---|---|---|---|
| med | 16.65 | P01MAL01, C99, 16.65 | 1 | YES |
| dent | 16.99 | P03MAL01, C99, 16.99 | 1 | YES |
| pharm | 16.26 | P02MAL01, C99, 16.26 | 1 | YES |
| estin | 17.45 | C00CAN03, W93, 17.45 | 9 | YES |
| esi | 18.19 | C00CAN01, P04, 18.19 | 22 | YES |
| med-psy | 16.67 | PI0LAN01, U06, 16.67 | 19 | YES |
| polytech-c05 | 17.73 | A00CAN04, C05, 17.73 | 22 | YES |
| vet-c10 | 15.30 | P04VAN01, C10, 15.30 | 23 | YES |
| law-fin | 13.21 | GF0LAN01, C17, 13.21 | 40 | YES |
| agro-p72 | 13.87 | D00CAN06, P72, 13.87 | 40 | YES |
| droit-c17 | 10.41 | G02LAL03, C17, 10.41 | 40 | YES |
| info-c01 | 15.14 | min(C01LAL01 15.14, C01TCL02 15.93) @ C01 (USTHB) | 26 | YES (merge rule) |

## Validation results

- `node --check tawjihi/catalog.js`: PASS.
- Full runtime evaluation: 638 cards after split expansion, 0 duplicate ids, all `avg`/`minAvg`
  in [8, 20] or null, every split card has `baseId` + a single-institution `unis[]`, all 480 split
  cards inherit a non-empty `description`.
- `twById` checks: exact split id OK, legacy base id ("droit") resolves to a split card, orphan
  split id ("droit-c14") falls back to a sibling card (helper patched — one-line change, documented).
- Military cards: all 12 untouched (avg null or original, `regLink` intact).
- `specialities-kb.json` and `code-mapping.json` parse (UTF-8, valid JSON).
- Mojibake scan (`األ` lam-alef garbling): 0 hits in catalog.js and KB.
- `scripts/qa-integrity.mjs`: Part A reports the SAME pre-existing failures as before this task
  (18 catalog ids that never had KB records: med, pharm, dent, esi, bio, info, archi, esc, psych,
  education, vet, marine-eng, pharm-ind, ensa-agro, essb, genie-civil/elec/meca — and 62
  programs.json check errors). None are introduced by this reconciliation.

## Known limitations / follow-ups

- `scripts/reconcile.js` (attempt #1 tool) regex-parses only the TW_CATALOG literal and will not
  see the runtime split cards; it is superseded by this pass.
- Duplicate generic entries (gestion/commerce vs eco, francais vs langues, genie-elec vs electro,
  psych/education vs ss, soc-leisure vs loisir, med-info/med-informatics) kept as single cards
  with representative medians — a merge/redirect pass is recommended.
- 2026 intake (`programs.json`) has 96 codes with no 2025 minima (new programs) — nothing to
  reconcile for them; the app should present them without a 2025 reference number.
- **Human actions:** re-run `node scripts/embed-kb.js` (KB numbers changed), review the 29
  unmatched entries and 6 duplicate groups, then commit.
