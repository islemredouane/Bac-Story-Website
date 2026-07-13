# AI-SYSTEM Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| AI-1 | `twAccessibility("ESTIN",...)` returns `status:"unknown"` — ID case mismatch (flows from DATA-7). Fix: `.toLowerCase()` in all ID lookups in app.js | app.js | [ ] |
| AI-2 | RAG zero-score fallback: returns first 6 CS grande-écoles for ANY unrelated query (law/medicine/business students get CS context) | api/tawjihi-chat.js | [ ] |
| AI-3 | Retry "إعادة" button rendered in actionsBar() but click handler never attached — dead button | app.js | [ ] |
| AI-4 | Wishlist never passed to AI — cannot answer "هل قائمتي مناسبة لمعدلي؟" | app.js + api/tawjihi-chat.js | [ ] |
| AI-5 | File attachment UI built but files never included in API request body — completely decorative | app.js + api/tawjihi-chat.js | [ ] |