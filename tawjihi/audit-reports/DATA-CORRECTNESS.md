# DATA-CORRECTNESS Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| DATA-1 | `psych` card threshold 16.65 → ~11.00 (inherited wrongly from `med`; avgHistory shows UA2=11.00) | catalog.js + catalog-eligibility.json | [ ] |
| DATA-2 | `enssn` card has marine sciences content instead of nanotechnology (careers, unis, avgHistory all wrong) | catalog.js | [ ] |
| DATA-3 | `ensas` card has agricultural content (ENSAS Sétif agro) instead of autonomous systems/robotics | catalog.js | [ ] |
| DATA-4 | `pharm` allowedStreams erroneously includes `techmath` — only sciexp and math allowed per Guide | eligibility.js + catalog-eligibility.json | [ ] |
| DATA-5 | `bio` allowedStreams erroneously includes `techmath` and `math` — only sciexp allowed per Guide | eligibility.js + catalog-eligibility.json | [ ] |
| DATA-6 | `igee` card minAvg=13.30 but eligibility threshold=16.15 — 2.85pt mismatch misleads students | catalog.js + catalog-eligibility.json | [ ] |
| DATA-7 | KB IDs uppercase (`ESI-ALGER`, `ENSIA`) vs catalog/eligibility lowercase (`esi`, `ensia`) → 100% of AI verdict blocks silently fail | data/kb/specialities-kb.json | [ ] |