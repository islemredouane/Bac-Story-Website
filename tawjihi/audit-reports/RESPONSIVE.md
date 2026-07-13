# RESPONSIVE Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| RES-1 | Landing page has no hamburger menu on mobile — navigation links vanish with no replacement mechanism | index.html + styles/landing.css | [ ] |
| RES-2 | Onboarding `.ob-topbar` missing `env(safe-area-inset-top)` padding — overlaps iPhone notch | styles/onboarding.css | [ ] |
| RES-3 | Landing hero `font-size: var(--fs-3xl)` (2.75rem) not clamped on mobile — too large for single-column | styles/landing.css | [ ] |
| RES-4 | Multiple stacked `backdrop-filter: blur()` layers on mid-range Android — reduce blur radius to 8-12px on mobile | styles/app.css | [ ] |
| RES-5 | No `loading="lazy"` on speciality card images — all load immediately on page open | specialities.html | [ ] |
| RES-6 | `speciality.html` avg-table has no `overflow-x: auto` container — overflows on mobile | styles/specialities.css | [ ] |
| RES-7 | `ob-grid-3` on 360px phone: 2-column may clip "تقني رياضي" 3-word labels — add 1-column at 400px | styles/onboarding.css | [ ] |
| RES-8 | `-webkit-tap-highlight-color: transparent` on mobile nav without `:active` replacement | styles/app.css | [ ] |
| RES-9 | Catalog `.catalog { max-height: 360px }` creates scroll-within-scroll on mobile | styles/simulator.css | [ ] |
| RES-10 | No breakpoint between 600-760px for dashboard grid (2-col jumps directly to 1-col at 760px) | styles/dashboard.css | [ ] |