# RTL Backlog

| ID | Task | File | Status |
|----|------|------|--------|
| RTL-1 | `.spec-detail-btn i { transform: translateX(-4px) }` wrong direction on hover in RTL (should be `+4px`) | styles/spec-browser.css | [ ] |
| RTL-2 | `.dash-fiche li:hover { transform: translateX(-3px/-4px) }` wrong direction in RTL (should be `+3px`) | styles/dashboard.css + styles/dashboard-fx.css | [ ] |
| RTL-3 | `dash-card::after { right: -40px }` uses physical property — decorative glow on wrong corner in RTL | styles/dashboard.css | [ ] |
| RTL-4 | `.spec-search-wrap i { right: 0.8rem }` uses physical property — should be `inset-inline-end` | styles/spec-browser.css | [ ] |