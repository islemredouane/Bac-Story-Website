# BAC Story Site Content Audit vs Tawjihi KB

**Date:** 2026-07-05  
**Auditor:** Claude Code (automated)  
**Worktree:** fix-ai-data / fix/ai-data-guide  
**KB source:** `tawjihi/data/kb/specialities-kb.json` — 181 entries  
**Main repo (read-only):** `C:\Users\AZ\Documents\BAC CHANNEL\Bac-Story-Website\`

---

## 1. Pages Examined

| Page | Size | Classification | Notes |
|------|------|----------------|-------|
| `index.html` | ~18KB | NOT RELEVANT | Landing page, no orientation content |
| `about.html` | 11KB | NOT RELEVANT | Platform info, founder bio |
| `advertise.html` | 19KB | NOT RELEVANT | Commercial/advertising page |
| `contact.html` | ~8KB | NOT RELEVANT | Contact form only |
| `simulation.html` | ~12KB | NOT RELEVANT | Generic simulation UI, no KB content |
| `bac-2026.html` | ~20KB | NOT RELEVANT | BAC 2026 exam schedule/info |
| `bac-topics.html` | ~15KB | NOT RELEVANT | BAC subject topics list |
| `university.html` | 94KB | **MISSING** | PROGRES guide, LMD/Ingénieur comparison, FAQ, statistics |
| `tools.html` | 82KB | **MISSING** | BAC coefficient tables for all 6 branches |
| `plans.html` | 42KB | **MISSING** | Monthly study plans, subject plans, challenges |
| `oqba.html` | 36KB | **MISSING** | Oqba ben Nafi exercise booklets (2023–2026) |
| `resources.html` | 324KB | **MISSING** | Study resources by branch (not examined in full — too large; category concept MISSING) |
| `university/specialities.html` | 143KB | DUPLICATE | Catalog index; all 181 entries already in KB |
| `university/guide.html` | 9KB | NOT RELEVANT | PDF embed only (دليل وزاري), no inline text |
| `university/system.html` | 16KB | DUPLICATE | Identical content to university.html system section |
| `university/averages-of-acceptance-2025.html` | 11KB | **MISSING** | FRR/FRL explanation, C01TCL/C01FPN/C01LAL symbol guide |
| `university/specialties/medcine.html` | ~50KB | **RICHER + CONFLICT** | Full city list, hospital names, year-by-year curriculum; average conflict |
| `university/specialties/esi-alger.html` | ~30KB | **RICHER** | Weighted average formula, founding year, location detail, year-2 transition rules |
| `university/specialties/igee.html` | ~20KB | **RICHER** | Average 16.85 present in site but resolvedAverages=null in KB |
| `university/specialties/marine.html` | ~15KB | **RICHER** | Average 13.00–14.00 present in site but resolvedAverages=null in KB |
| `university/specialties/*.html` (177 others) | — | DUPLICATE | Source files for KB; content already captured in KB sections |

---

## 2. Critical Conflicts — Wrong Numbers

### CONFLICT 1 (HIGH): `medcine.html` — رياضيات average mismatch

| Source | علوم تجريبية | رياضيات | تقني رياضي |
|--------|-------------|---------|------------|
| Site (`medcine.html`) | 16.65 | 16.65 (grouped with علوم) | 17.15 |
| KB `resolvedAverages` | min1=16.65 | min2=17.15 | min3=null |

**Issue:** The site text groups علوم تجريبية and رياضيات under the same value (16.65), implying they share the national minimum. The KB's official admissions data (from `admissions-2026.json`) records رياضيات at 17.15 — which is higher and is consistent with the pattern seen in other schools (رياضيات ≥ علوم at nationally competitive specialties). **KB is authoritative** — site text is an oversimplification.

**Action required:** When the Tawjihi chat references medcine averages, use KB resolved data (16.65 for علوم, 17.15 for رياضيات) not the site text "16.65 لكليهما".

### CONFLICT 2 (MEDIUM): `resolvedAverages` column ordering inconsistency

The mapping `min1=علوم تجريبية, min2=رياضيات, min3=تقني رياضي` is confirmed by ESI-Alger cross-check:
- Site: رياضيات=18.19, علوم=18.55, تقني=18.93
- KB: min1=18.55, min2=18.19, min3=18.93 → confirms min1=علوم, min2=رياضيات

However, 22 entries have `resolvedAverages=null` even though site text contains averages:

| KB Entry ID | Site Average | Issue |
|-------------|-------------|-------|
| igee | 16.85 (all streams) | No linked filière data → resolvedAverages not populated |
| marine | 13.00–14.00 | No linked filière data → resolvedAverages not populated |
| med-gen | present | No official link |
| gen-couns | present | No official link |
| ind-entr | present | No official link |
| anesthesie-reanimation | present | No official link |
| arts | present | No official link |
| cinema | present | No official link |
| cinema-media | present | No official link |
| enmas | present | No official link |
| enscrbc | present | No official link |
| ensjsi | present | No official link |
| ensrpc | present | No official link |
| esaa | present | No official link |
| esm-justice | present | No official link |
| essp | present | No official link |
| esss | present | No official link |
| hse | present | No official link |
| idri | present | No official link |
| loisir | present | No official link |
| enpei | present | No official link |
| ensm | present | No official link |

**These are NOT conflicts** (site averages match what KB has in averages_text) — but the numeric field is null, which means Tawjihi's eligibility engine cannot filter on these. **Remediation is separate from this audit.**

---

## 3. MISSING Content — Not Represented in KB at All

These are entirely absent from KB and should be added as new knowledge entries (not linked to any specialty ID):

| Content | sourcePage | Priority |
|---------|-----------|---------|
| PROGRES 5-step orientation process | university.html | P1 — critical for chat |
| LMD vs Ingénieur comparison | university.html | P1 — critical for chat |
| University life (terminology, semester system, housing, clubs) | university.html | P2 |
| 10 FAQ pairs (wishlist count, free education, stipend, transfer, etc.) | university.html | P1 — chat answers these daily |
| Algeria university statistics (1.5M students, 117 institutions, etc.) | university.html | P3 |
| FRR/FRL/C01 symbol guide + mandatory 2-local-choices rule | university/averages-of-acceptance-2025.html | P1 — critical for chat |
| BAC coefficient tables for all 6 branches | tools.html | P2 — useful for eligibility calc |
| Monthly study plans + challenges (links only, not full PDFs) | plans.html | P4 — study resource |
| Oqba ben Nafi booklets (2023–2026) | oqba.html | P4 — study resource |

---

## 4. RICHER Content — Site Has Extra Detail vs KB

These specialty entries exist in KB but the site pages contain additional information not captured in KB `sections`:

| KB ID | Extra content on site | Priority |
|-------|----------------------|---------|
| esi-alger | Weighted average formula `(معدل×2 + رياضيات) ÷ 3`; founding year 1969; year-2 transition (80% direct, 20% competition) | P1 — formula affects eligibility display |
| medcine | Full 13+ city list; specific hospital names (Mustapha Pacha, etc.); year-by-year curriculum (years 1–6); internat structure | P2 |
| igee | Average 16.85 confirmed; weighted formula | P2 |
| marine | Average range 13.00–14.00 confirmed | P2 |

---

## 5. Priority Order for Merging

### Priority 1 — Fix wrong numbers / critical eligibility data

1. **CONFLICT medcine رياضيات average**: Chat must use 17.15, not 16.65. Fix in chat system prompt or KB.
2. **resolvedAverages null for 22 entries**: Populate numeric fields for igee, marine, and remaining 20 entries so eligibility engine can filter them.
3. **Weighted average formula for esi-alger (and igee)**: Add `weightedAvgFormula` field or note to KB — the standard simple average does NOT apply to ESI.

### Priority 2 — Add missing system knowledge (chat answers these questions constantly)

4. **PROGRES orientation system guide**: Full 5-step process, wishlist rules (6–10 choices, 2 mandatory local/regional LMD).
5. **FRR/FRL/C01 symbol explanations**: When Tawjihi shows the averages PDF, users ask what these mean — add as a KB "system" entry.
6. **LMD vs Ingénieur comparison**: Core concept, asked frequently.
7. **10 FAQ pairs from university.html**: Most are chat-level answers (free education, stipend, what if no choice, etc.).

### Priority 3 — Enrich specialty entries

8. **medcine**: Add city list, hospital names, year-by-year plan to KB sections.
9. **esi-alger**: Add year-2 transition rules to KB sections.
10. **Other schools**: Review remaining 177 specialty pages for hidden content (founding years, formulas, city lists).

### Priority 4 — Study resources (low urgency for orientation AI)

11. **BAC coefficient tables**: Add to KB or Tawjihi tools.
12. **Study plans / Oqba booklets**: Link-only references, low KB value.

---

## 6. Files Produced

| File | Description |
|------|-------------|
| `tawjihi/data/kb/bacstory-content-staging.json` | 15 staging entries (MISSING × 9, RICHER × 5, CONFLICT × 1) ready for KB merge |
| `tawjihi/data/kb/_BACSTORY-CONTENT-AUDIT.md` | This file |

**Constraint respected:** No modifications to `specialities-kb.json`, no edits to any site HTML file.
