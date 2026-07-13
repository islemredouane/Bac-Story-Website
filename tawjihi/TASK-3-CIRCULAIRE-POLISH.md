# TASK — Circulaire 2026 polish (PRIORITY 4 — independent, any time)

**Repo:** the Tawjihi repo root. **Rules:** NO git commands. Never invent data.
Windows. Token-economy: script-first over the text dumps; visual PDF page reads
(Read tool, `pages` param) only when the text layer can't resolve.

## Context — read FIRST
`tawjihi/data/guide/_HANDOFF-2026-EXTRACTION.md` — full status. The heavy
lifting is DONE (programs.json rebuilt: 496 programs with stream priorities).
This task is the remaining polish. All working artifacts are in
`tawjihi/data/guide/_scratch-2026/` (canon2026.json, priorities2026.json,
text dumps, scripts). Source PDF:
`C:\Users\AZ\Downloads\Circulaire_07-07-2026-signed.pdf`.

## Scope (in this order)
1. **ENS annexe 09** — the 59 ENS codes currently have empty `allowedStreams`
   in `programs.json`. Extract their layout from the annex (streams, priorities,
   institutions, conditions — ENS entry is via ranking + interview rules) and
   fill them in `programs.json` (schema-preserving). ENS matters: teacher-track
   students ask about it constantly.
2. **~20 remaining garbled institution cells** — `_scratch-2026/needvisual.json`
   lists 64 cells as {code: [page, bbox]}; many were already fixed. Diff against
   current `programs.json` institution lists, visually read only the still-garbled
   ones, fix in place.
3. **5 leftover bad codes** — A00TCN01, A05TCN00, B00IAN01, F01TPN01 (index-only,
   no detail row in the PDF: decide keep-with-note or remove) and I03LAN00
   (confirmed garbled duplicate of I03LAN01/02 → remove).
4. **`tawjihi/data/kb/guide-bac2026-reference.md`** — human-readable 2026
   reference for the AI KB, mirroring `guide-bac2025-reference.md` structure:
   calendar/phases, weighted-average formulas per field (المعدل الموزون =
   (معدل الباك × 2 + علامة المادة الأساسية) ÷ 3 — verify against the circulaire),
   the 3 geographic circles with all 58 wilayas, special cases (ENS, medical,
   grandes écoles, military → preinscription.mdn.dz), transfer rules (no formal
   طعن: wish-edit before confirmation, phase 2, PROGRES transfer).
5. **`tawjihi/data/guide/_EXTRACTION-REPORT-2026.md`** — pages processed,
   complete 2025→2026 diff (163 new codes, 8 removed, 69 scope changes,
   27 threshold changes — details derivable from
   `_scratch-2026/programs-2025-baseline.json` vs current), confidence notes.
6. **`tawjihi/data/kb/ministry-rules.json`** — read its schema, check the 27
   rules against the 2026 circulaire rules pages (dumps + the verified pages
   noted in the handoff), update changed rules only.

## Validation
All JSONs parse; every program keeps code/field_ar/scope/rankingBasis;
ENS programs gain non-empty allowedStreams; wilaya count 58.
Update `_HANDOFF-2026-EXTRACTION.md` status when done.

## After this task
KB texts changed (reference md, ministry rules) → tell the human to re-run
`node scripts/embed-kb.js` and commit.
