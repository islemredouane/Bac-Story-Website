# MOTION Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| MOT-6 | No page transitions — all navigation is hard-cut (add View Transitions API in shell.js) | shell.js + styles/motion.css | [ ] |
| MOT-7 | Onboarding completion has zero celebration → add checkmark SVG animation + brief success screen before redirect | onboarding.html + onboarding.js + styles/onboarding.css | [ ] |
| MOT-8 | Wishlist add/remove: full `innerHTML` re-render → no individual entrance/exit per item (add DOM diff + `wish-enter`/`wish-exit` keyframes) | simulator.js + styles/simulator.css | [ ] |
| MOT-9 | AI chat spec-card rows: all cards appear simultaneously — add `animation-delay` stagger per `:nth-child` | styles/chat-rich.css | [ ] |
| MOT-10 | Sidebar label collapse uses `display: none` → labels snap. Replace with `opacity` + `max-width` transition | styles/app.css | [ ] |
| MOT-11 | Copy-to-clipboard: icon swaps instantly, no bounce (add `check-pop` keyframe with `--ease-spring`) | app.js + styles/motion.css | [ ] |
| MOT-12 | Like/dislike buttons: no scale pulse on click | styles/motion.css | [ ] |
| MOT-13 | No skeleton shimmer screens during dashboard and chat history loading | styles/skeleton.css (NEW) | [ ] |