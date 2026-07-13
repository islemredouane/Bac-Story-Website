# AI Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| AI-6 | Wilaya eligibility never checked in `renderVerdictBlock` — student from wrong wilaya sees "في المتناول" incorrectly | app.js | [ ] |
| AI-7 | ENSIA stream inconsistency: eligibility.js allows sciexp, catalog.js streamCodes does not — sync needed | catalog.js + catalog-eligibility.json | [ ] |
| AI-8 | `max_tokens: 1200` causes AI to cut off mid-sentence on comparisons and complex responses | api/tawjihi-chat.js | [ ] |
| AI-9 | Wrong weighted average type in verdict — uses flat `profile.weightedAverage`, not per-speciality-type (bio→medicine, math→engineering) | app.js | [ ] |
| AI-10 | Orientation mode recommendations not calibrated to user eligibility (profile avg/stream not used) | api/tawjihi-chat.js | [ ] |
| AI-11 | No cross-session chat memory — returning users start blank each time | api/tawjihi-chat.js + app.js | [ ] |
| AI-12 | Follow-up chips identical for every response ("شنو معدل القبول", "قارن", "رتّب") — not derived from response content | app.js | [ ] |
| AI-13 | Thumbs up/down buttons collect no data — `.classList.toggle('liked')` only, no Supabase write | app.js | [ ] |
| AI-14 | Profile read from localStorage only — different device or cleared storage = empty AI personalization | api/tawjihi-chat.js | [ ] |
| AI-15 | System prompt has no instruction for off-topic questions — AI may hallucinate about immigration/scholarships | api/tawjihi-chat.js | [ ] |
| AI-16 | `temperature: 0.6` too high for eligibility answers — reduce to 0.35 for factual responses | api/tawjihi-chat.js | [ ] |