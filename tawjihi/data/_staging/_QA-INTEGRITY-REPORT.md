# QA Integrity Report — Data + AI Overhaul Validation

**Generated:** 2026-07-14 · QA Engineer session (Task 2)
**Scope:** Part A (data integrity), Part B (RAG retrieval). Part C (live AI battery) NOT run — no test account this session; a ready-to-run battery was delivered instead (see "Owner actions").

**Scripts (all rewritten this session, Node 22 ESM, zero npm dependencies — `node_modules` is not installed in this worktree):**
- `scripts/qa-integrity.mjs` — Part A battery (run: `node scripts/qa-integrity.mjs`)
- `scripts/qa-rag.mjs` — Part B battery (run: `node scripts/qa-rag.mjs`)
- `scripts/qa-ai-battery.mjs` — Part C battery, ready to run (see usage header)
- `scripts/embed-cleanup.mjs` — stale-embeddings cleanup, dry-run by default

Machine-readable results: `_qa-integrity-results.json`, `_qa-rag-results.json` (same folder).

---

## Summary

| Part | Result |
|---|---|
| A — Data integrity | **3 pass / 3 warn / 2 fail** (8 check groups) |
| B — RAG retrieval | **9 / 10 queries pass** (1,826 rows in `kb_embeddings`, of which 1,733 fresh + 93 stale) |
| C — AI behaviour | **not run** — `scripts/qa-ai-battery.mjs` delivered ready-to-run (25 questions) |

**Blockers found: 1** (mojibake in `api/tawjihi-chat.js`, see F-1).

---

## Part A — Data integrity

### Check results

| # | Check | Status | Detail |
|---|---|---|---|
| A1 | Catalog ids / cat / streamCodes / avg ranges / img / military regLink | ❌ FAIL | 5 broken `img` references (F-2); everything else clean across all 638 runtime cards |
| A1c | Split-card integrity + `twById` legacy resolution | ✅ PASS | 480 split cards + 158 literal = 638; legacy ids (`med`, `esi`, …) still resolve |
| A2 | Catalog → KB coverage (alias-aware) | ⚠ WARN | all 206 base specialities covered; 3 only partially (W-1) |
| A2b | `content/*.json` parse + section types | ⚠ WARN | 107/107 parse, all section types valid; 30 files carry UTF-8 BOM (W-2) |
| A3 | `programs.json` required fields / wilayas / streams | ⚠ WARN | 495 programs, wilayas all 1–58, streams valid; 62 index-derived rows have `rankingBasis: null` (W-3) |
| A4 | Averages traceability (20 sampled specialities) | ✅ PASS | every sampled catalog `minAvg` traces to `minima-phase1-2025.json` via `code-mapping.json` |
| A5 | KB: 244 entries / 66 legacy_unverified / military 'التسجيل الأولي' sections | ✅ PASS | 11 military entries all carry the preinscription section |
| A6 | Encoding audit (double-encoded Arabic) | ❌ FAIL | `api/tawjihi-chat.js` fully mojibake (F-1); `scripts/embed-kb.js` partially (F-1b) |

### Investigation of the two "known failures" from the previous script

The old `qa-integrity.mjs` reported **18 catalog ids missing KB records** and **62 bad program rows**. Both were investigated:

1. **18 "missing" KB ids → STALE SCRIPT ASSUMPTION (fixed).** The KB is joined to the catalog *semantically via RAG*, never by id, and uses its own id conventions. All 18 exist under different ids: `med→medcine`, `esi→esi-alger`, `pharm→pharmacie`, `dent→medcine-dentaire`, `archi→epau`, `info→informatique`, `bio→biologie`, `genie-civil→gc`, `genie-elec→electro`, `genie-meca→gm`, `marine-eng→genie-maritime`, `vet→vetrinaire`, `pharm-ind→pharmacie-industrielle`, `ensa-agro→ensa`, `essb→essbo`. The rewritten check is alias-aware. Three remain only *partially* covered — see W-1.
2. **62 program rows → REAL BUT DOCUMENTED DATA GAP (downgraded to warning).** All 62 have `rankingBasis: null` and every one carries an extraction-provenance `_note` (index-only rows, merged PDF cells, inherited sibling rows) — the circulaire simply states no explicit ranking basis for them. See W-3. The old script also mis-read the current shapes of `code-mapping.json` (`{mapping:{...}}`) and `minima-phase1-2025.json` (`{entries:[...]}`) and evaluated only the literal catalog (206) instead of the runtime 638 — all fixed in the rewrite.

### Failures

**F-1 · BLOCKER — `api/tawjihi-chat.js`: ALL Arabic is double-encoded (mojibake).**
The file contains **zero** real Arabic characters and ~21,800 mojibake sequences (UTF-8 bytes mis-decoded as cp1252 and re-saved as UTF-8). Every Arabic literal in the system prompt — the darja style rules, the student-profile block, the orientation-mode instructions, the verdict/compare templates — is garbage like `Ø§Ù„Ø´Ø¹Ø¨Ø©` instead of `الشعبة`. The main repo copy is identical, so this is not worktree corruption. It directly undermines dialect quality, personalization, and instruction-following of the AI (Part C categories).
*Verified fix exists:* a cp1252 reverse-map roundtrip recovers the file **losslessly** (tested: 21,847 Arabic chars restored, 0 replacement chars, 0 leftover mojibake). Suggested fix: run the recovery (utf8-decode → encode via cp1252 map → utf8-decode), diff-review, commit. Part C should only be run *after* this fix.

**F-1b · MAJOR — `scripts/embed-kb.js`: mixed encoding, mojibake chunk labels.**
~86 mojibake sequences in the chunk-builder string literals: speciality chunks are embedded with `Ø§Ù„ØªØ®ØµØµ:` instead of `التخصص:`, program chunks with `ÙƒÙˆØ¯:` instead of `كود:`, etc. (rule/geo builders likewise). Every embedded chunk in sources `speciality`, `program`, `rule`, `geo` carries corrupted label text, which measurably degrades retrieval (see Part B failure B-6). Same cp1252 recovery applies; then re-run `embed-kb.js`.

**F-2 · MINOR — 5 catalog entries reference image files that don't exist.**
`images/paramed.png` (referenced by `public-health-hygiene`, `adjoint-medical`, `assistant-social`) and `images/university.png` (referenced by `dieteticien`, `law-fin`) are absent from `tawjihi/images/`. Cards render with a broken image. Suggested fix: add the two files or repoint to an existing placeholder.

### Warnings

**W-1 · MINOR — 3 specialities with only partial KB coverage.**
`esc` (nearest KB: `commerce`), `education` (nearest: `childhood`), `psych` (nearest: `sociales`). No dedicated KB entry for ESC Koléa, Sciences de l'Éducation, or general Psychologie — RAG answers for these lean on adjacent entries. Suggested fix: author 3 dedicated KB entries.

**W-2 · MINOR — 30/107 `content/*.json` files carry a UTF-8 BOM.**
Harmless for the two current consumers (browser `fetch().json()` and `embed-kb.js` both strip BOM) but breaks any naive `JSON.parse(fs.readFileSync(...))` consumer. Suggested fix: strip BOMs in a one-off pass; keep files BOM-free going forward.

**W-3 · MINOR — 62 programs have `rankingBasis: null` (documented extraction gap).**
All carry `_note` provenance (index-only rows, merged PDF cells, inherited siblings) — the circulaire doesn't state a ranking basis for them. 31 national / 31 regional; none have `minThreshold`. Also related: 4 programs (`A00TCN01`, `A05TCN00`, `B00IAN01`, `F01TPN01`) have empty `allowedStreams` — these are the 4 documented index-only exceptions and are exempted in the check. Suggested fix: backfill `"weighted_or_general"` (the MESRS default) or resolve from the detailed guide pages.

---

## Part B — RAG retrieval

Run after the parallel embedding refresh completed. `kb_embeddings` held **1,826 rows** at test time = **1,733 fresh chunks** (refresh output) **+ 93 stale rows** (see Deferred cleanup below; counts reconcile exactly).

10 retrieval queries against the `search_kb` RPC (Jina v3 query embeddings, 768-dim, threshold 0.2, top-5 unless noted):

| # | Query | Expected | Result |
|---|---|---|---|
| B-1 | الإعلام العسكري | `military-media` | ✅ rank 1 |
| B-2 | المدرسة العليا للطيران | `esa` | ✅ rank 1 |
| B-3 | معدل الطب | `medcine` (old id `med-national` is gone — stale assertion in previous script, fixed) | ✅ |
| B-4 | التسجيل في المدارس العسكرية | content containing `preinscription.mdn.dz` | ✅ |
| B-5 | الدائرة الجغرافية لولاية سطيف | geo-circle knowledge (`geo` source or rule `geographic-circles-*`) | ✅ `rule:geographic-circles-wilaya` |
| B-6 | معدل قبول الصيدلة | `pharmacie` | ❌ **not in top-8** (got pharm-ind, math, sm, st, bio, info, med-bio, labo) |
| B-7 | المدرسة الوطنية العليا للإعلام الآلي سيدي بلعباس | `esi`/`esi-sba` | ✅ rank 1 |
| B-8 | الفرق بين نظام LMD ومهندس دولة | `system-lmd-vs-ingenieur` | ✅ rank 1 |
| B-9 | الدرك الوطني كيفاش الدخول | `gendarmerie` | ✅ ranks 1–5 |
| B-10 | المعدل الموزون كيفاش يتحسب | rule source (`weighted-average`) | ✅ rank 1 |

**Score: 9/10.**

**B-6 · MAJOR — "معدل قبول الصيدلة" does not retrieve the `pharmacie` speciality in the top 8.**
Likely compound cause: (a) speciality chunks are embedded with mojibake labels (F-1b) which dilutes their Arabic similarity; (b) the generic phrase "معدل قبول" matches average-heavy content chunks of many other specialities. Suggested fix order: fix F-1b, run the stale cleanup, re-embed, re-test.

**Note:** B-7's results included `speciality:esi-sba-ecole` — one of the 93 **stale** rows. Stale rows demonstrably surface in live retrieval; the cleanup below is not cosmetic.

*Embedding counts may still settle slightly if any refresh retries were pending at query time.*

---

## Deferred item — stale `kb_embeddings` rows (cleanup script delivered, NOT applied)

`embed-kb.js` only upserts and never deletes, so rows for removed sources accumulate. Dry run of the new `scripts/embed-cleanup.mjs`:

- **93 stale rows**: 84 `speciality` (removed per-institution KB ids such as `med-national`, `med-ua1`, `esi-ensia`, `esi-sba-ecole`, `pharm-national`, …) + 9 `program` (codes no longer in `programs.json`: `H03IAN09`, `N00TUT01`, `A17LAN02`, `A11FPN01`, `F02TPN03`, `K02LAL02`, `A00TUT01`, `A00TUT02`, …).
- Script is **dry-run by default**; deletion requires the explicit `--apply` flag and was **not** run per instructions.

**Recommendation:** owner runs `node scripts/embed-cleanup.mjs` (review the listing) then `node scripts/embed-cleanup.mjs --apply`.

---

## Part C — AI behaviour battery (deliverable only)

Not executed (no test account this session). `scripts/qa-ai-battery.mjs` is ready:

- 25 questions across the 12 brief categories (averages grounding, wilaya/circle rule, military preinscription, weighted average, ```verdict``` / ```compare``` / ```question``` block validation, orientation personalization, banned-dialect scan on *every* response, anti-generic profile anchoring, out-of-scope refusal, French handling, unknown-speciality anti-hallucination).
- Expected numbers (med/ESI minima) are pulled from the live runtime catalog at run time — no hardcoded values to go stale.
- Optional profile seeding: with `TEST_USER_ID` set, it upserts the seeded profile (أمين / علوم تجريبية / 15.5 / سطيف / الطب والصحة) via the Supabase service key.
- Usage: `TAWJIHI_ENDPOINT=... TAWJIHI_TOKEN=... node scripts/qa-ai-battery.mjs` → writes `_QA-AI-REPORT.md` here; exit 0 at ≥90% (23/25).

**Run it only after F-1 is fixed** — the mojibake system prompt would invalidate dialect/personalization results.

---

## Severity roll-up

| ID | Severity | Item | Suggested fix |
|---|---|---|---|
| F-1 | **Blocker** | `api/tawjihi-chat.js` Arabic fully double-encoded | cp1252 reverse-map recovery (verified lossless), review, commit |
| F-1b | Major | `scripts/embed-kb.js` mojibake chunk labels | same recovery, then re-embed |
| B-6 | Major | `pharmacie` not retrieved for its flagship query | fix F-1b + cleanup + re-embed, re-test |
| F-2 | Minor | 5 broken catalog `img` refs (2 missing files) | add `paramed.png`, `university.png` or repoint |
| W-1 | Minor | 3 specialities partial KB coverage (esc/education/psych) | author dedicated KB entries |
| W-2 | Minor | 30 content files with UTF-8 BOM | strip BOMs |
| W-3 | Minor | 62 programs `rankingBasis: null` (documented) | backfill MESRS default or resolve from guide pages |
| — | Deferred | 93 stale `kb_embeddings` rows | `node scripts/embed-cleanup.mjs --apply` (owner) |

## Owner actions needed

1. Fix F-1 / F-1b (encoding recovery), commit.
2. Run `node scripts/embed-cleanup.mjs` → review → `--apply`; then re-run `node scripts/embed-kb.js` (post F-1b fix) and re-run `node scripts/qa-rag.mjs` (expect 10/10).
3. Provide a test account + endpoint and run `scripts/qa-ai-battery.mjs` (Part C).
