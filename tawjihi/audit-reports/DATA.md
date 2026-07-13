# DATA Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| DATA-8 | `ensttic` scope = "unknown" → should be "national" (grande école de Tlemcen) | eligibility.js + catalog-eligibility.json | [ ] |
| DATA-9 | `bio` scope = "regional" but lists all 58 wilayas — contradictory, should be "national" | catalog-eligibility.json | [ ] |
| DATA-10 | 5 aspirational entries (med-ai, it-int, space-tech, quantum, digital-agro) show "unknown" eligibility with no explanation to user | app.js (verdict rendering) | [ ] |
| DATA-11 | No per-year warning when importing 2023 averages against 2025 thresholds | averages-transport.js | [ ] |
| DATA-12 | `essg` minAvg=10.00 but avgHistory shows real threshold ~14.71 — false accessibility signal | catalog.js | [ ] |
| DATA-13 | `arts` stream has no weighted average formula in averages-transport.js — arts bac students get null weighted avg | averages-transport.js | [ ] |
| DATA-14 | 13 new school entries missing y2024 in avgHistory — add note "nouvelle école — données 2025 uniquement" | catalog.js | [ ] |
| DATA-15 | Private universities: 0 of ~14 approved Algerian private universities represented in catalog | catalog.js + data/kb/ | [ ] |
| DATA-16 | `traduction` eligibility has dead-code sciexp/math thresholds (streams blocked but thresholds defined) | catalog-eligibility.json | [ ] |