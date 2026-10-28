# BAC STORY — Claude Code Build Brief (Phase 1: Landing)

> Paste this entire file as your Claude Code task, or invoke it via `claude /init @docs/CLAUDE_CODE_BUILD_PROMPT.md`. It is self-contained — Claude Code can execute it without prior conversation context.

---

## How to use this brief

This brief is split into **six agents**. Run them in this order:

```
Phase 1 — Foundation  (sequential)
  ├─ Agent A: Design system tokens + base
  └─ Agent B: Animation library

Phase 2 — Landing page  (Agents C + D run in parallel after Phase 1)
  ├─ Agent C: New landing page  (/new-index.html)
  └─ Agent D: Auth modal restyle  (CSS only — JS logic is locked)

Phase 3 — Post-approval (optional, only after the user approves the landing)
  ├─ Agent E: Dashboard + Profile
  └─ Agent F: Plans / Pricing page
```

For each agent, spawn a sub-agent (Agent tool, `general-purpose` subagent_type) with that agent's section quoted directly into the prompt. Do not run Phase 3 unless the user explicitly asks. Stop and verify after each phase.

---

## Mission context (read before doing anything)

Read these two strategy documents in the repo first — they contain the product positioning, voice rules, market psychology, and visual direction that all design decisions must match:

- `docs/PRODUCT_STRATEGY.md`
- `docs/ALGERIAN_MARKET_STRATEGY.md`

The product is **BAC STORY** — an Algerian Baccalaureate study platform with a Gemini-powered AI mentor (إسلام AI). The library is free for everyone; AI is the tiered paid product. The audience is 17–19-year-old Algerian students, predominantly mobile-first on flaky 3G, Arabic-Darija speakers, deeply skeptical of foreign-feeling marketing, allergic to "احصل على 18/20 بهذه الحيلة" hype.

The visual direction is **warm-educational + aspirational hybrid**. Editorial typography, deep navy hero (`#0a1f3d`) for prestige, brand blue `#2c5cc5` and orange `#ff6b35` for action, gold `#f39c12` reserved for achievement moments only. Generous whitespace. No gradients beyond a single optional ambient orb in the hero. No drop shadows except functional focus rings. No emoji clusters in headlines. Premium = confident typography + generous whitespace + specific evidence + visible local respect (CIB/EDAHABIA logos, DZD prices). Premium ≠ luxury flourishes.

---

## Hard constraints (DO NOT violate)

- **Do not modify** `/ai.html`, `/api/*`, `/lib/ai-prompts.js`, `/sql/*`, or the chat logic in `/js/ai-chat.js`. The AI chat is locked.
- **Do not modify the JS logic** of `/js/auth-modal.js`. Only its CSS may change (Agent D). The flow, function names, fetch calls, and API contracts stay exactly as they are.
- **Do not touch** `/index.html` in Phase 1. Build new work at `/new-index.html` and the user will swap it manually after approval.
- **Vercel-compatible**: `cleanUrls` is on, so all HTML pages live in repo root. Do not nest pages under `/pages/`. Static assets stay under `/css`, `/js`, `/images`, `/components`.
- **All Arabic body copy is placeholder.** Mark every Arabic string with an HTML comment `<!-- COPY: needs Islem's review -->` immediately above it. The user will replace before launch. Use the placeholder copy from this brief as a starting point.
- **All photos are placeholder.** Use `/images/placeholders/` for any new image slots. Document what real photo goes where in a comment.
- **Mobile-first.** Build for 360px width as the primary target. Desktop is the larger reflow.
- **Respect `prefers-reduced-motion`.** Every animation must have a no-animation fallback when `@media (prefers-reduced-motion: reduce)` is active.
- **Two type weights only**: 400 (regular) and 500 (medium). Do not use 600 or 700 anywhere. Use size + color contrast for hierarchy, not weight.
- **Sentence case for English**, never Title Case or ALL CAPS. Arabic is unaffected.
- **CommonMark blank-line rule**: when emitting HTML with embedded markdown-like content, leave blank lines before lists.

---

## Design tokens (the source of truth — Agent A creates this file)

Write these to `/css/tokens.css`:

```css
:root {
  /* Brand */
  --bs-navy: #0a1f3d;
  --bs-navy-deep: #04122a;
  --bs-blue: #2c5cc5;
  --bs-blue-50: #eef2ff;
  --bs-blue-100: #c8d9f8;
  --bs-orange: #ff6b35;
  --bs-orange-50: #fff7f3;
  --bs-orange-100: #fff1ea;
  --bs-orange-deep: #e8520f;
  --bs-gold: #f39c12;
  --bs-gold-50: #fef3d7;

  /* Surfaces */
  --bs-bg: #fafaf7;
  --bs-surface: #ffffff;
  --bs-surface-alt: #f7faff;
  --bs-border: #e2e8f0;
  --bs-border-subtle: rgba(15, 23, 42, 0.08);

  /* Text */
  --bs-text-primary: #0a1f3d;
  --bs-text-secondary: #475569;
  --bs-text-tertiary: #64748b;
  --bs-text-quaternary: #94a3b8;
  --bs-text-inverse: #ffffff;

  /* Semantic */
  --bs-success: #15803d;
  --bs-success-50: #dcfce7;
  --bs-danger: #e11d48;
  --bs-warning: #f39c12;

  /* Type scale (rem-based, root = 16px) */
  --bs-fs-xs: 0.6875rem;   /* 11px — meta, eyebrow labels */
  --bs-fs-sm: 0.8125rem;   /* 13px — body small */
  --bs-fs-base: 1rem;      /* 16px — body */
  --bs-fs-md: 1.125rem;    /* 18px — body large */
  --bs-fs-lg: 1.375rem;    /* 22px — section title sm */
  --bs-fs-xl: 1.75rem;     /* 28px — section title md */
  --bs-fs-2xl: 2.5rem;     /* 40px — hero sm */
  --bs-fs-3xl: 3.5rem;     /* 56px — hero md */
  --bs-fs-4xl: 4.5rem;     /* 72px — hero lg (desktop) */

  /* Line heights */
  --bs-lh-tight: 1.25;
  --bs-lh-snug: 1.4;
  --bs-lh-base: 1.7;
  --bs-lh-relaxed: 1.85;

  /* Letter spacing */
  --bs-ls-eyebrow: 0.1em;   /* uppercase eyebrow labels */
  --bs-ls-tight: -0.01em;
  --bs-ls-base: 0;

  /* Radius */
  --bs-r-sm: 6px;
  --bs-r-md: 10px;
  --bs-r-lg: 14px;
  --bs-r-xl: 20px;
  --bs-r-2xl: 28px;
  --bs-r-pill: 999px;

  /* Spacing scale (linear, rem-based) */
  --bs-sp-1: 0.25rem;
  --bs-sp-2: 0.5rem;
  --bs-sp-3: 0.75rem;
  --bs-sp-4: 1rem;
  --bs-sp-5: 1.25rem;
  --bs-sp-6: 1.5rem;
  --bs-sp-8: 2rem;
  --bs-sp-10: 2.5rem;
  --bs-sp-12: 3rem;
  --bs-sp-16: 4rem;
  --bs-sp-20: 5rem;
  --bs-sp-24: 6rem;

  /* Motion (premium ease — no bounce, just calm) */
  --bs-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --bs-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --bs-d-fast: 200ms;
  --bs-d-base: 400ms;
  --bs-d-slow: 600ms;
  --bs-d-deliberate: 900ms;

  /* Shadows — used very sparingly */
  --bs-shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
  --bs-shadow-md: 0 8px 24px rgba(15, 23, 42, 0.06);
  --bs-shadow-focus: 0 0 0 3px rgba(255, 107, 53, 0.25);

  /* Layout */
  --bs-content-max: 1200px;
  --bs-content-narrow: 720px;
}
```

Typography uses **Tajawal** (already loaded). No display font swap. The hero looks editorial because of *size + line-height + letter-spacing*, not because of a different family.

---

## Agent A — Design system foundation

**Output files:**
- `/css/tokens.css` (the file above, exactly)
- `/css/base.css` — body reset, font loading, html/body baseline, focus styles, link styles, headings reset
- `/css/components/button.css` — `.bs-btn`, `.bs-btn--primary` (orange), `.bs-btn--secondary` (outlined), `.bs-btn--ghost`, sizes `.bs-btn--lg / --md / --sm`, full hover/active/disabled/focus states
- `/css/components/card.css` — `.bs-card` (white, 0.5px border, radius-lg), `.bs-card--elevated` (slightly more shadow), `.bs-card--feature` (navy variant for pricing featured)
- `/css/components/input.css` — text input, textarea, select (RTL-aware, focus ring matches orange brand)
- `/css/components/badge.css` — `.bs-badge--free` (green), `.bs-badge--featured` (gold), `.bs-badge--new` (blue)
- `/css/components/accordion.css` — base accordion using `<details><summary>` styled
- `/docs/DESIGN_SYSTEM.md` — concise reference: token names, when to use which, do/don't examples

**Rules:**
- All components use ONLY token variables — no hardcoded colors
- Components are theme-able via tokens (so dark mode is a future swap, not a rewrite)
- Each component has documented states: rest, hover, focus, active, disabled
- RTL is the default (this site is `dir="rtl"`); ensure logical properties (`margin-inline-start`, etc.) where directionality matters
- Buttons must scale to `transform: scale(0.97)` on `:active`
- Focus rings use `--bs-shadow-focus`, never `outline: none` without replacement

**When done**, the agent writes to `/docs/DESIGN_SYSTEM.md` with: a one-line description of every token, an HTML snippet of every component in default state, and a "do / don't" example pair for the most easily abused tokens (colors, type scale).

---

## Agent B — Animation library

**Output files:**
- `/css/animations.css` — keyframe definitions + utility classes
- `/js/lib/animations.js` — JS-backed behaviors (IntersectionObserver, looping AI chat playback)
- `/docs/ANIMATION_API.md` — how Agent C and beyond invoke animations

**Animations to implement:**

*CSS-only (no JS) — `/css/animations.css`:*

`@keyframes bs-fade-up` — opacity 0→1, translateY 16px→0, duration `--bs-d-base`, ease `--bs-ease`. Trigger via `[data-animate="fade-up"]` getting class `is-revealed`.

`@keyframes bs-fade-in` — opacity 0→1, duration `--bs-d-base`, ease `--bs-ease`.

`@keyframes bs-scale-in` — opacity 0→1, scale 0.96→1, duration `--bs-d-base`, ease `--bs-ease`.

`@keyframes bs-orbit-slow` — slow rotation for the optional hero ambient orb, 60s linear infinite.

`@keyframes bs-pulse-soft` — subtle 1→1.02→1 scale on the featured pricing card, 4s ease-in-out infinite.

`@keyframes bs-cursor-blink` — opacity 1→0→1 for the AI chat typing cursor, 1.1s steps(2) infinite.

Stagger system: when a parent has `[data-stagger]`, children with `[data-animate]` get inline `animation-delay` set by JS at increments of 80ms.

Reduced-motion fallback: every keyframe is conditionally suppressed via `@media (prefers-reduced-motion: reduce) { .is-revealed { animation: none; opacity: 1; transform: none; } }`.

*JS behaviors — `/js/lib/animations.js`:*

`initRevealOnScroll()` — IntersectionObserver watches all `[data-animate]` elements; adds `is-revealed` class when 15% visible from below. Threshold + rootMargin tunable. Disconnects per-element after first reveal (one-shot).

`initStagger()` — for each `[data-stagger]` parent, sets `--bs-stagger-delay` on each direct `[data-animate]` child = `index * 80ms`. CSS uses `animation-delay: var(--bs-stagger-delay, 0ms)`.

`mountChatLoop(rootEl, script)` — accepts a root element and a script of `{role, text, durationMs}` objects. Plays them in sequence with a typing effect, pauses 2s after the final message, then restarts. The script lives inline in the landing page — keep this function generic. Use `requestAnimationFrame`-based timing, not `setInterval`. Pause on `document.hidden`.

`initAccordions()` — progressive enhancement of `<details>` to add smooth height transitions (the native `<details>` snap is jarring). Uses `getBoundingClientRect` height measurement + transition.

`initButtonMagneticHover()` — opt-in via `[data-magnetic]` on buttons. Inside a 12px hover zone, the button's content shifts up to 4px toward the cursor. Disabled on touch devices (no `hover` capability).

All JS is pure ES modules. No build step. No external libraries (no GSAP). Total `animations.js` should be under 4 KB minified.

---

## Agent C — Landing page (`/new-index.html`)

**This is the main deliverable.** Build a complete, production-quality landing page implementing the 8-section flow specified below. All copy is placeholder; mark each Arabic string with `<!-- COPY: needs Islem's review -->`. Use the design tokens and animation library from Agents A and B.

**File structure:**
- `/new-index.html` — the page
- `/css/pages/landing.css` — page-specific styles (sections, layouts, page-only components)
- `/js/pages/landing.js` — page-specific behaviors (mount the chat loop, init accordions, etc.)

**Page head:**
- `<html lang="ar" dir="rtl">`
- Tajawal preconnect + import (already in repo, copy the existing `<head>` pattern from `/index.html` for fonts/meta/SEO/GTM)
- Link `/css/tokens.css`, `/css/base.css`, all `/css/components/*.css`, `/css/animations.css`, `/css/pages/landing.css` in this order
- Script `/js/lib/animations.js` as `type="module"`, `/js/pages/landing.js` as `type="module"` with `defer`
- Include `/js/auth-modal.js` so the existing register flow works on CTA click (Agent D will restyle it)

**The 8 sections, in order:**

**Section 1 — Hero** (`<section class="bs-hero">`)

Background: `--bs-navy`. Padding: 5rem top, 4rem bottom on mobile; 8rem top, 6rem bottom on desktop. Inner container max-width 1200px, padded 1.5rem.

Eyebrow label: `— الباك 2026` in `--bs-gold`, uppercase letter-spacing, 11px.

Headline: 3 lines, separated. Lines 1+2 in white, line 3 in `--bs-orange`. Mobile: 28px; desktop: 56px (1200px+) or 72px (1400px+). Line-height 1.25. Each line is its own `<span>` with `[data-animate="fade-up"]` and stagger delays.

Subhead: 14px on mobile, 18px on desktop, line-height 1.85, color `#c8d9f8`. 1 paragraph max.

The AI chat card: white card, radius `--bs-r-lg`, padding 1rem. Two messages — student (blue bubble, right-tail-RTL) and Islem (orange bubble, left-tail-RTL). The Islem reply ends with a blinking cursor `<span class="bs-cursor">▮</span>` styled with `bs-cursor-blink` animation. Mount via `mountChatLoop` so the conversation types itself out, pauses 2s, restarts. Provide a 3-message script in `/js/pages/landing.js` — but keep it generic enough that Islem can swap.

Primary CTA: `.bs-btn .bs-btn--primary .bs-btn--lg` full-width on mobile, auto-width on desktop. Click opens the existing auth modal via `window.openAuthModal()`. Below it, micro-text in `--bs-text-quaternary`: bullet-separated objection killers.

Numbers strip: 3 columns, large light digits in white (22px mobile, 32px desktop), small label below in `--bs-text-quaternary`. Border-top 0.5px on the strip wrapper. Numbers are `<data>` elements so they're semantic; populate with the placeholder numbers `6,247`, `41`, `28`.

**Optional:** ambient orb. A 480px circle absolutely positioned in the hero, low-opacity, gradient `radial-gradient(circle, rgba(255,107,53,0.18), transparent 70%)`, slowly orbiting via `bs-orbit-slow`. Keep it subtle — debug by removing if it dominates.

Desktop reflow: at ≥1024px, hero becomes a 2-column grid with text on the right (60%) and the chat card on the left (40%), aligned center. Numbers strip spans both columns.

**Section 2 — Pain mirror** (`<section class="bs-pain">`)

Background: `--bs-bg`. Padding: 4rem 1.5rem mobile, 6rem 1.5rem desktop.

Container max-width 720px (deliberately narrow — feels intimate).

Eyebrow: `— الإحساس اللي نعرفوه`, color `--bs-orange`.

Heading: 22px mobile / 32px desktop, color `--bs-text-primary`, line-height 1.5. Triggers `fade-up` on scroll.

Body paragraph: 13px mobile / 16px desktop, color `--bs-text-secondary`, line-height 1.85.

No CTA in this section. The pain mirror is a *moment*, not a sales pitch.

**Section 3 — Product (modes + library)** (`<section class="bs-product">`)

Background: `--bs-surface`. Padding: 4rem 1.5rem mobile, 8rem 1.5rem desktop.

Container max-width 1200px.

Eyebrow: `— المنتج`, color `--bs-blue`.

Heading: `إسلام AI في 4 أوضاع`, 22px mobile / 32px desktop.

Subhead: 12px mobile / 14px desktop, color `--bs-text-tertiary`.

The four modes grid: 2 cols on mobile, 4 cols on desktop, gap 12px. Each mode card uses `.bs-card` with internal padding 1rem, an icon square (32x32, `--bs-r-md` radius, tinted background, mode-specific color), name, 1-line description. Mode color mapping:
- المستشار → `--bs-blue` family
- حل التمارين → `--bs-orange` family
- المصحح → `--bs-gold` family
- الملخصات → `--bs-blue` family (yes, two blues — they're both knowledge-side)

Use `[data-stagger]` on the grid and `[data-animate="fade-up"]` on each card.

Below the modes, a divider rule of 32px vertical space, then the library sub-section:

Heading row: `و المكتبة، مجاناً للأبد` on the right, `شوف الكل ←` link on the left.

3 library cards stacked vertically (mobile) or in a row of 3 (desktop). Each card:
- Subject icon square with subject-specific color (math = blue, philosophy = orange, university = gold)
- Title + meta (subject · pages · read-time)
- "مجاني" pill on the far end, using `.bs-badge--free` (green)
- Hover: card lifts 2px, border darkens to `--bs-text-quaternary` at 0.3 alpha. Transition 200ms `--bs-ease`.

**Section 4 — Real students** (`<section class="bs-testimonials">`)

Background: `--bs-bg`. Padding: 4rem 1.5rem mobile, 6rem 1.5rem desktop.

Eyebrow: `— الطلبة`, color `--bs-orange`.

Heading: `وش يقولو على BAC STORY`, 22px mobile / 32px desktop.

Featured testimonial card: large `.bs-card`, padding 1.5rem. Avatar (44x44, navy circle with white initials — placeholder until real photo), name + meta (specialty · lycée · wilaya), quote in serif italic (`var(--font-serif)`, 13px mobile / 16px desktop, line-height 1.85, color `--bs-text-secondary`).

Below the featured card: dot pagination (5 dots, first one orange-active, rest gray-inactive). Below pagination: micro-text "5 شهادات إضافية تنزل قبل اللانش".

For now, build the structure to support a swipe carousel later, but in v1 just render the one featured testimonial — the dot pagination is a static visual cue.

**Section 5 — Founder note (Islem)** (`<section class="bs-founder">`)

Background: `--bs-surface`. Padding: 4rem 1.5rem mobile, 6rem 1.5rem desktop.

Container max-width 720px.

Two-part layout:

Top row: 88x88 photo placeholder (`<div class="bs-founder-photo">` with initial "إ" centered, blue-50 background, blue text, radius `--bs-r-lg` — leaves room for real Islem photo via CSS `background-image` later). Beside it: eyebrow `— إسلام`, then a one-line headline `أنا كنت مكانك.`

Body paragraph: 13px mobile / 16px desktop, color `--bs-text-secondary`, line-height 1.85.

Sign-off micro-line: 11px, color `--bs-text-tertiary`, mentions "إسلام محمد ردوان — صاحب قناة BAC STORY WITH ISLEM (6,200+ مشترك)".

Add `[data-animate="fade-up"]` on the photo and content, with stagger.

**Section 6 — Pricing teaser** (`<section class="bs-pricing-teaser">`)

Background: `--bs-bg`. Padding: 4rem 1.5rem mobile, 6rem 1.5rem desktop.

Eyebrow: `— الأسعار`, color `--bs-orange`.

Heading: `الأسعار، بسيطة و واضحة`. Subhead: `المكتبة مجانية للجميع. الـ AI تختار خطتك.`

3 pricing cards. Mobile: stacked. Desktop: 3-col grid, equal width.

Card 1 — Free: standard `.bs-card`. Title "مجاني", price "0 دج". 1-line feature summary.

Card 2 — Bac Season (FEATURED, MIDDLE on desktop, FIRST after Free on mobile): `.bs-card--feature` (navy variant, white text). Floating gold badge "★ موصى به للباك" using `.bs-badge--featured`. Title "باكاج الباك", price "4,500 دج / موسم" with orange price color. Subtle `bs-pulse-soft` animation on this card to draw the eye.

Card 3 — Plus: standard `.bs-card`. Title "Plus / شهرياً", price "999 دج / شهر".

Below all cards, the payment-methods row: small label "طرق الدفع:" then 3 payment chips (CIB / EDAHABIA / BaridiMob) styled as small outlined pills. This is a respect signal — keep it visible.

**Section 7 — Algerian-specific FAQ** (`<section class="bs-faq">`)

Background: `--bs-surface`. Padding: 4rem 1.5rem mobile, 6rem 1.5rem desktop.

Container max-width 720px.

Eyebrow: `— أسئلة شائعة`, color `--bs-blue`.

Heading: `واش لازم تعرف`.

5 accordion items using `<details><summary>` enhanced by `initAccordions`:
1. هل يحتاج كارت بنكية للتسجيل؟
2. كيفاش ندفع بالدينار؟
3. هل يحكي دارجة فعلاً؟
4. شنو يصير بمعطياتي؟
5. واش يخدم بدون نت؟

Each summary shows the question with a `+` icon on the left (LTR — but RTL: appears on the right since this is dir="rtl" — verify visually). Open state rotates the icon 45° to look like ×.

Answer body in 13px / 16px, color `--bs-text-secondary`, line-height 1.85. Mark each answer with `<!-- COPY: needs Islem's review -->`.

**Section 8 — Final CTA** (`<section class="bs-cta-final">`)

Background: `--bs-navy`. Padding: 5rem 1.5rem on all sizes.

Container max-width 720px, centered.

Heading: `يلا، نبداو.` 24px mobile / 40px desktop, white. Subhead: `المكتبة مفتوحة. إسلام AI مستنيك.` 14px / 18px, color `#c8d9f8`.

CTA button: `.bs-btn--primary .bs-btn--lg`, full-width on mobile, max-width 320px centered on desktop. Click opens auth modal.

Below CTA, the same 3 objection killers from the hero, smaller (10px / 12px), color `#94a3b8`, dot-separated.

Add `[data-magnetic]` to this CTA so it has the magnetic hover (desktop only).

**Footer:**

Background: `--bs-navy-deep`. Padding 1rem 1.5rem. Two centered lines: trust signal "صنعها فريق جزائري · معطياتك تبقى عندنا" and copyright "BAC STORY WITH ISLEM © 2026".

**Header (top of page):**

Sticky, navy background, height 56px, padding 1rem 1.5rem. Left: logo (orange B square + "BAC STORY" text). Right: 3 nav items "المكتبة | الأسعار | دخول". On scroll past 80px, header gains `--bs-shadow-sm` for separation.

**Mobile hamburger:** below 768px, the 3 nav items collapse into a hamburger icon that opens a full-screen overlay menu. Smooth slide-in animation 300ms `--bs-ease`.

---

## Agent D — Auth modal restyle

**Scope:** ONLY CSS. The existing `/js/auth-modal.js` JavaScript logic, function names, fetch calls, IDs, and DOM structure must remain exactly as they are. Only visual styling changes.

**Output files:**
- `/css/components/auth-modal.css` — new file containing all auth-modal styles using the new tokens
- Update `/css/style.css` to import `/css/components/auth-modal.css` and **remove** the old `.bs-auth-*` rules currently in `/css/style.css` (around lines 6457–6486)

**Visual upgrades:**
- Modal background: white card on a backdrop of `rgba(10, 31, 61, 0.6)` (navy at 60% alpha) with `backdrop-filter: blur(8px)`
- Card radius `--bs-r-2xl`, padding 2.5rem on desktop / 1.75rem on mobile
- Tab switcher (Email / Telegram) styled as a segmented control with `--bs-blue-50` track and white active pill
- Inputs styled per `/css/components/input.css`, with the orange focus ring
- Primary button uses `.bs-btn--primary`
- OTP input visual upgrade: a single `<input>` is fine (do not change DOM), but style it with massive letter-spacing (0.5rem), monospace, 28px on mobile / 36px on desktop, padding 1rem
- Loading spinner uses an inline SVG, animated with `bs-orbit-slow` (rename to a faster variant if needed)
- Success state: when verifyOtp succeeds, briefly show a green checkmark + "تم — جارٍ التحويل..." for 600ms before the modal closes (this requires reading existing JS to find the success path and adding a small visual hook)

If you cannot add the success-state hook without modifying JS, skip it and add a TODO comment in `/js/auth-modal.js` explaining what the hook would do.

---

## Agent E — Dashboard + Profile (Phase 3, optional)

**Run only after the user approves the landing.**

Build `/dashboard.html` and `/profile.html` matching the design system. Reuse all components. Do not introduce new colors. Do not modify `/js/ai-chat.js` or `/api/ai-history.js`; only consume their existing endpoints.

`/dashboard.html` includes: navbar, Bac countdown widget (computes days remaining using a local hardcoded date constant — make it `/js/lib/bacCountdown.js` so it's swappable), suggested-action card, AI quick-start card (links to `/ai.html`), library teaser (3 cards), progress strip (messages today / streak / hours studied — read from localStorage for now).

`/profile.html` includes: avatar + identity, stats grid (4 metric cards), settings (specialty change, language, logout — wire logout to the existing `window.logout()`), saved chats list (fetch via existing `/api/ai-history`), progressive completion bar.

Document in `/docs/DASHBOARD_PROFILE.md` what data sources each widget uses and which need backend work later.

---

## Agent F — Plans / Pricing page (Phase 3, optional)

**Run only after the user approves the landing.**

Rewrite `/plans.html` to match the new design system. Use the same 3-tier structure as the landing teaser, but with full feature comparison tables and detailed FAQ. The 4500 DZD Bac-season package remains the lead SKU.

Output: rewritten `/plans.html`, `/css/pages/plans.css`.

---

## Verification (after each phase, before moving to the next)

After **Phase 1 (Agents A + B)**:
- Run `node --check` on every `.js` file under `/js/lib/`
- Open `/css/tokens.css` and confirm no hardcoded colors remain in `/css/components/*.css` (grep for `#` followed by 6 hex chars in component files — should only appear in tokens.css)
- Open `/docs/DESIGN_SYSTEM.md` and `/docs/ANIMATION_API.md` — confirm both exist and are accurate
- Spawn a separate verification sub-agent to spot-check that buttons, cards, badges render correctly by writing a tiny test HTML file at `/css-test.html` that uses every component once

After **Phase 2 (Agents C + D)**:
- Open `/new-index.html` in a browser via `npm run dev`. Confirm it loads at `http://localhost:3000/new-index.html`
- Verify all 8 sections render in order
- Verify the AI chat card animates and loops
- Verify all CTAs open the auth modal
- Verify the auth modal is restyled (segmented tabs, new colors)
- Verify the page is responsive at 360px / 768px / 1024px / 1440px widths
- Verify `prefers-reduced-motion: reduce` (toggle via DevTools rendering panel) suppresses all animations
- Run a quick lighthouse audit; performance > 85, accessibility > 95, best practices > 90 are the targets
- Grep for any leftover hardcoded color values in `/css/pages/landing.css` — should be zero
- Confirm `/index.html` is unchanged (the user swaps manually after approval)

After **Phase 3** (if run):
- Same browser checks for `/dashboard.html`, `/profile.html`, `/plans.html`
- Confirm `/api/ai-history` integration on profile works for a logged-in user
- Confirm the Bac countdown shows a sensible number

---

## Final report format

When all assigned agents complete, write a summary to chat covering: files created, files modified, files left untouched, any TODOs surfaced (especially around copy/photos that need Islem), any deviations from this brief and why, and the exact list of URLs to test in the browser.

If anything in this brief is ambiguous, prefer the simpler interpretation, leave a `<!-- TODO -->` comment in the code, and continue. Do not block waiting for clarification on minor points.
