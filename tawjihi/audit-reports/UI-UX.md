# UI-UX Backlog

| ID | Task | File | Status |
|----|------|------|--------|
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