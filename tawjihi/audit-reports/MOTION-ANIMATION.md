# MOTION-ANIMATION Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| MOT-1 | No button `:active` press feedback anywhere — users get no tactile confirmation on touch (add `scale(0.96)`) | styles/motion.css (NEW) | [ ] |
| MOT-2 | Theme toggle doesn't cross-fade surface/card backgrounds — sidebar, topbar, cards snap between light/dark | styles/motion.css (NEW) | [ ] |
| MOT-3 | Onboarding step transition: outgoing step disappears instantly (no exit animation — add `sink` keyframe) | styles/onboarding.css | [ ] |
| MOT-4 | `mnav-slider` uses `left`/`top` CSS (layout, triggers reflow every frame) → replace with `transform: translate()` | shell.js | [ ] |
| MOT-5 | Dashboard progress ring never animated from 0 to real value — add `@property` + `@keyframes ring-fill` | styles/dashboard-hero.css | [ ] |