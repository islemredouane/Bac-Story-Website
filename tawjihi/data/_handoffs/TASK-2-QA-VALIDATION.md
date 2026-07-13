# TASK — QA validation battery (PRIORITY 3 — run AFTER reconciliation)

**Repo:** the Tawjihi repo root. **Rules:** NO git commands. Windows.
Secrets live in `.env.local` (gitignored) — NEVER print or commit key values.

## Goal
Prove the whole data+AI overhaul actually works end-to-end: correct data,
grounded answers, authentic Algerian darja, real personalization.

## Part A — Data integrity (scripts, cheap)
Write `scripts/qa-integrity.mjs` that checks and reports:
1. Every `tawjihi/catalog.js` entry (206): unique id; valid `cat` (incl.
   military/arts); `streamCodes ⊆ {sciexp,math,techmath,gestion,lettres,langues,arts}`;
   `avg`/`minAvg` in [8,20] or null; `img` path exists or `''`; military entries
   have `regLink`.
2. Cross-refs: every catalog id present in `tawjihi/data/kb/specialities-kb.json`
   (flag missing); every `tawjihi/content/*.json` parses and its sections have
   valid types (text|list|pros|cons|summary).
3. `tawjihi/data/guide/programs.json`: 496 programs, every one has
   code/field_ar/scope/rankingBasis; wilaya numbers 1-58.
4. Averages traceability: sample 20 catalog averages and verify each exists in
   `tawjihi/data/averages-2025/minima-phase1-2025.json` via
   `tawjihi/data/_staging/code-mapping.json` (produced by the reconciliation task).
Output: `tawjihi/data/_staging/_QA-INTEGRITY-REPORT.md`.

## Part B — RAG retrieval (needs .env.local keys)
1. Check `kb_embeddings` count vs source docs (see `scripts/embed-kb.js` for
   the chunking; use SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from `.env.local`).
2. Test the `search_kb` RPC with ~10 queries and assert the right doc comes
   back, e.g.: "الإعلام العسكري" → military-media; "المدرسة العليا للطيران" →
   esa; "معدل الطب" → medicine; "التسجيل في المدارس العسكرية" → a doc containing
   preinscription.mdn.dz.

## Part C — AI behavior battery (the expensive part — needs a running endpoint)
Endpoint: local `vercel dev` or the deployed `/api/tawjihi-chat` (ask the human
which). Auth: needs a Supabase user token — ask the human for a test account.
Send ~25 questions with a seeded test profile (name أمين, علوم تجريبية, 15.5,
ولاية سطيف, interests الطب والصحة) and assert on responses:

| Category | Example question | Assert |
|---|---|---|
| Averages | "قداش معدل قبول الطب في 2025؟" | number matches minima data; year cited; no invention |
| Wilaya rule | "واش نقدر نقرا إعلام آلي في ولايتي؟" | uses سطيف + circle logic |
| Military | "كيفاش نسجل في مدرسة الطيران؟" | mentions preinscription.mdn.dz |
| Weighted avg | "معدلي الموزون في الرياضيات 16، واش يخدملي؟" | uses weighted-vs-general rule |
| Verdict | "واش نقدر ندخل ESI؟" | ```verdict``` block with valid JSON id only |
| Comparison | "قارنلي بين ESI و ENSIA" | ```compare``` block valid JSON |
| Orientation | trigger discover mode | one question per msg, ```question``` blocks, personalized opening referencing profile |
| Dialect | any | NO banned words: شنو شو إيش وش شلون ليش فين ديال بغيت عافاك مزيان إزاي عايز هسة كتير |
| Anti-generic | "واش نقرا؟" | anchors on profile numbers, no motivational filler |
| Out of scope | "احسبلي visa كندا" | polite refusal, stays in domain |
| French | "C'est quoi la moyenne de médecine?" | responds in French, data grounded |
| Unknown spec | invented specialty name | admits no data / web-search block, no invented numbers |

Log every failure with the full response. Output:
`tawjihi/data/_staging/_QA-AI-REPORT.md` + a pass/fail summary table.

## Done criteria
All Part A checks green; Part B retrievals correct; Part C ≥90% pass with all
failures documented for fixes.
