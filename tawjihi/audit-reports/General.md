# General Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| DATA-1 | `psych` card threshold 16.65 → ~11.00 (inherited wrongly from `med`; avgHistory shows UA2=11.00) | catalog.js + catalog-eligibility.json | [ ] |
| DATA-2 | `enssn` card has marine sciences content instead of nanotechnology (careers, unis, avgHistory all wrong) | catalog.js | [ ] |
| DATA-3 | `ensas` card has agricultural content (ENSAS Sétif agro) instead of autonomous systems/robotics | catalog.js | [ ] |
| DATA-4 | `pharm` allowedStreams erroneously includes `techmath` — only sciexp and math allowed per Guide | eligibility.js + catalog-eligibility.json | [ ] |
| DATA-5 | `bio` allowedStreams erroneously includes `techmath` and `math` — only sciexp allowed per Guide | eligibility.js + catalog-eligibility.json | [ ] |
| DATA-6 | `igee` card minAvg=13.30 but eligibility threshold=16.15 — 2.85pt mismatch misleads students | catalog.js + catalog-eligibility.json | [ ] |
| DATA-7 | KB IDs uppercase (`ESI-ALGER`, `ENSIA`) vs catalog/eligibility lowercase (`esi`, `ensia`) → 100% of AI verdict blocks silently fail | data/kb/specialities-kb.json | [ ] |
| AI-1 | `twAccessibility("ESTIN",...)` returns `status:"unknown"` — ID case mismatch (flows from DATA-7). Fix: `.toLowerCase()` in all ID lookups in app.js | app.js | [ ] |
| AI-2 | RAG zero-score fallback: returns first 6 CS grande-écoles for ANY unrelated query (law/medicine/business students get CS context) | api/tawjihi-chat.js | [ ] |
| AI-3 | Retry "إعادة" button rendered in actionsBar() but click handler never attached — dead button | app.js | [ ] |
| AI-4 | Wishlist never passed to AI — cannot answer "هل قائمتي مناسبة لمعدلي؟" | app.js + api/tawjihi-chat.js | [ ] |
| AI-5 | File attachment UI built but files never included in API request body — completely decorative | app.js + api/tawjihi-chat.js | [ ] |
| DATA-8 | `ensttic` scope = "unknown" → should be "national" (grande école de Tlemcen) | eligibility.js + catalog-eligibility.json | [ ] |
| DATA-9 | `bio` scope = "regional" but lists all 58 wilayas — contradictory, should be "national" | catalog-eligibility.json | [ ] |
| DATA-10 | 5 aspirational entries (med-ai, it-int, space-tech, quantum, digital-agro) show "unknown" eligibility with no explanation to user | app.js (verdict rendering) | [ ] |
| DATA-11 | No per-year warning when importing 2023 averages against 2025 thresholds | averages-transport.js | [ ] |
| DATA-12 | `essg` minAvg=10.00 but avgHistory shows real threshold ~14.71 — false accessibility signal | catalog.js | [ ] |
| DATA-13 | `arts` stream has no weighted average formula in averages-transport.js — arts bac students get null weighted avg | averages-transport.js | [ ] |
| AI-6 | Wilaya eligibility never checked in `renderVerdictBlock` — student from wrong wilaya sees "في المتناول" incorrectly | app.js | [ ] |
| AI-7 | ENSIA stream inconsistency: eligibility.js allows sciexp, catalog.js streamCodes does not — sync needed | catalog.js + catalog-eligibility.json | [ ] |
| AI-8 | `max_tokens: 1200` causes AI to cut off mid-sentence on comparisons and complex responses | api/tawjihi-chat.js | [ ] |
| AI-9 | Wrong weighted average type in verdict — uses flat `profile.weightedAverage`, not per-speciality-type (bio→medicine, math→engineering) | app.js | [ ] |
| AI-10 | Orientation mode recommendations not calibrated to user eligibility (profile avg/stream not used) | api/tawjihi-chat.js | [ ] |
| AI-11 | No cross-session chat memory — returning users start blank each time | api/tawjihi-chat.js + app.js | [ ] |
| AI-12 | Follow-up chips identical for every response ("شنو معدل القبول", "قارن", "رتّب") — not derived from response content | app.js | [ ] |
| AI-13 | Thumbs up/down buttons collect no data — `.classList.toggle('liked')` only, no Supabase write | app.js | [ ] |
| AI-14 | Profile read from localStorage only — different device or cleared storage = empty AI personalization | api/tawjihi-chat.js | [ ] |
| UI-7 | Zero `:focus-visible` styles anywhere — full keyboard accessibility failure for all interactive elements | styles/tokens.css | [ ] |
| UI-8 | `wish-ctrl` touch target 26px on mobile (minimum 44px required) — primary simulator action | styles/simulator.css | [ ] |
| UI-9 | `.ob-btn` navigation at ≤420px is 24px tall — below 44px minimum for wizard navigation | styles/onboarding.css | [ ] |
| UI-10 | `.filter-chip` in spec-browser is ~20px tall (below 44px minimum for primary category filter) | styles/spec-browser.css | [ ] |
| UI-11 | Three different toast implementations (login inline-style, sim-toast class, import feedback) — must be unified | login.html + simulator.css + dashboard.css | [ ] |
| UI-12 | 80+ lines of component CSS in inline `<style>` block in specialities.html (lines 20-101) — move to spec-browser.css | specialities.html + spec-browser.css | [ ] |
| UI-13 | `--acc-*` tokens defined twice (spec-browser.css + specialities.css) — consolidate into tokens.css | tokens.css + spec-browser.css + specialities.css | [ ] |
| UI-14 | `--sp-10` referenced in simulator.css line 535 but not defined in tokens.css → resolves to `unset` | styles/tokens.css | [ ] |
| UI-15 | `line-height: var(--fs-sm)` misuse in landing feat-card/step-card — sets line-height to 0.88rem (severely compressed) | styles/landing.css | [ ] |
| UI-16 | Simulator catalog appears BELOW wishlist on mobile → must scroll past entire wishlist to add items | simulator.html + styles/simulator.css | [ ] |
| UI-17 | Simulator average input `type="number"` confusing on mobile → replace with slider or `inputmode="decimal"` | simulator.html | [ ] |
| UI-18 | No `scroll-margin-top` on landing anchor targets (#how, #features, #faq) → content hides under sticky nav | styles/landing.css or index.html | [ ] |
| UI-19 | No favicon on any page — browser tab shows generic globe | all HTML files | [ ] |
| UI-20 | No OG/Twitter card meta tags — social sharing produces unstyled link | all HTML files | [ ] |
| UI-21 | Back button visible and active on step 0 of onboarding — nowhere to go back | onboarding.html + onboarding.js | [ ] |
| UI-22 | `--cat-business: #f39c12` warning badge contrast ~2.1:1 on white — illegible for colorblind users | styles/tokens.css | [ ] |
| MOT-1 | No button `:active` press feedback anywhere — users get no tactile confirmation on touch (add `scale(0.96)`) | styles/motion.css (NEW) | [ ] |
| MOT-2 | Theme toggle doesn't cross-fade surface/card backgrounds — sidebar, topbar, cards snap between light/dark | styles/motion.css (NEW) | [ ] |
| MOT-3 | Onboarding step transition: outgoing step disappears instantly (no exit animation — add `sink` keyframe) | styles/onboarding.css | [ ] |
| MOT-4 | `mnav-slider` uses `left`/`top` CSS (layout, triggers reflow every frame) → replace with `transform: translate()` | shell.js | [ ] |
| MOT-5 | Dashboard progress ring never animated from 0 to real value — add `@property` + `@keyframes ring-fill` | styles/dashboard-hero.css | [ ] |
| RES-1 | Landing page has no hamburger menu on mobile — navigation links vanish with no replacement mechanism | index.html + styles/landing.css | [ ] |
| RES-2 | Onboarding `.ob-topbar` missing `env(safe-area-inset-top)` padding — overlaps iPhone notch | styles/onboarding.css | [ ] |
| RES-3 | Landing hero `font-size: var(--fs-3xl)` (2.75rem) not clamped on mobile — too large for single-column | styles/landing.css | [ ] |
| RES-4 | Multiple stacked `backdrop-filter: blur()` layers on mid-range Android — reduce blur radius to 8-12px on mobile | styles/app.css | [ ] |
| NEW-1 | Privacy Policy page — Terms links in login.html point to `#` (legal gap) | tawjihi/privacy.html (NEW) | [ ] |
| NEW-2 | Terms of Service page — same | tawjihi/terms.html (NEW) | [ ] |
| NEW-3 | Service worker + web app manifest for offline browsing + PWA install prompt | tawjihi/sw.js (NEW) + manifest.json (NEW) | [ ] |
| NEW-4 | Missing catalog entries: Arabic language & literature, Earth sciences, Geography, STAPS (Sports) | catalog.js + data/kb/ | [ ] |
| MOT-6 | No page transitions — all navigation is hard-cut (add View Transitions API in shell.js) | shell.js + styles/motion.css | [ ] |
| MOT-7 | Onboarding completion has zero celebration → add checkmark SVG animation + brief success screen before redirect | onboarding.html + onboarding.js + styles/onboarding.css | [ ] |
| MOT-8 | Wishlist add/remove: full `innerHTML` re-render → no individual entrance/exit per item (add DOM diff + `wish-enter`/`wish-exit` keyframes) | simulator.js + styles/simulator.css | [ ] |
| MOT-9 | AI chat spec-card rows: all cards appear simultaneously — add `animation-delay` stagger per `:nth-child` | styles/chat-rich.css | [ ] |
| MOT-10 | Sidebar label collapse uses `display: none` → labels snap. Replace with `opacity` + `max-width` transition | styles/app.css | [ ] |
| MOT-11 | Copy-to-clipboard: icon swaps instantly, no bounce (add `check-pop` keyframe with `--ease-spring`) | app.js + styles/motion.css | [ ] |
| MOT-12 | Like/dislike buttons: no scale pulse on click | styles/motion.css | [ ] |
| MOT-13 | No skeleton shimmer screens during dashboard and chat history loading | styles/skeleton.css (NEW) | [ ] |
| DATA-14 | 13 new school entries missing y2024 in avgHistory — add note "nouvelle école — données 2025 uniquement" | catalog.js | [ ] |
| DATA-15 | Private universities: 0 of ~14 approved Algerian private universities represented in catalog | catalog.js + data/kb/ | [ ] |
| DATA-16 | `traduction` eligibility has dead-code sciexp/math thresholds (streams blocked but thresholds defined) | catalog-eligibility.json | [ ] |
| AI-15 | System prompt has no instruction for off-topic questions — AI may hallucinate about immigration/scholarships | api/tawjihi-chat.js | [ ] |
| AI-16 | `temperature: 0.6` too high for eligibility answers — reduce to 0.35 for factual responses | api/tawjihi-chat.js | [ ] |
| RTL-1 | `.spec-detail-btn i { transform: translateX(-4px) }` wrong direction on hover in RTL (should be `+4px`) | styles/spec-browser.css | [ ] |
| RTL-2 | `.dash-fiche li:hover { transform: translateX(-3px/-4px) }` wrong direction in RTL (should be `+3px`) | styles/dashboard.css + styles/dashboard-fx.css | [ ] |
| RTL-3 | `dash-card::after { right: -40px }` uses physical property — decorative glow on wrong corner in RTL | styles/dashboard.css | [ ] |
| RTL-4 | `.spec-search-wrap i { right: 0.8rem }` uses physical property — should be `inset-inline-end` | styles/spec-browser.css | [ ] |
| RES-5 | No `loading="lazy"` on speciality card images — all load immediately on page open | specialities.html | [ ] |
| RES-6 | `speciality.html` avg-table has no `overflow-x: auto` container — overflows on mobile | styles/specialities.css | [ ] |
| RES-7 | `ob-grid-3` on 360px phone: 2-column may clip "تقني رياضي" 3-word labels — add 1-column at 400px | styles/onboarding.css | [ ] |
| RES-8 | `-webkit-tap-highlight-color: transparent` on mobile nav without `:active` replacement | styles/app.css | [ ] |
| RES-9 | Catalog `.catalog { max-height: 360px }` creates scroll-within-scroll on mobile | styles/simulator.css | [ ] |
| RES-10 | No breakpoint between 600-760px for dashboard grid (2-col jumps directly to 1-col at 760px) | styles/dashboard.css | [ ] |
| UI-23 | Auth page theme button is `position:fixed; inset-inline-start` — inconsistent with app page topbar position | styles/auth.css | [ ] |
| UI-24 | Testimonials on landing page are dead blocks (not linked anywhere) — link to `app.html` | index.html | [ ] |
| UI-25 | Countdown target date hardcoded in HTML script tag — configurable constant at file top | dashboard.html | [ ] |
| UI-26 | `Speciality-container-new` class is legacy naming artifact — rename to `spec-cards-grid` | specialities.html + styles/spec-browser.css | [ ] |
| UI-27 | No "صفّر الفلاتر" reset button in specialities browser empty state | specialities.html + styles/spec-browser.css | [ ] |
| UI-28 | Back button on `speciality.html` is hard link (loses filter state) — replace with `history.back()` | speciality.html | [ ] |
| UI-29 | `.ob-step-count` (خطوة X من 6) hidden on mobile < 420px — only bar remains, no number | styles/onboarding.css | [ ] |