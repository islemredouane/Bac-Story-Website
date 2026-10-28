# BAC STORY — Product Strategy & Restructure Proposal

> Author's hat: PM + business + marketing lead with Algerian-market context, head of UI/UX, senior webdev. May 2026.

---

## 1. Positioning in one line

**BAC STORY is the Algerian Bac student's big brother on call** — a Darija-speaking AI mentor, a curated study library, and a community signal, packaged in a single home that's calmer and faster than the chaos of Telegram channels and PDF dumps.

Everything we design from here flows from that line. We are not "EdTech for Algeria." We are *the trusted older sibling Algerian students wish they had during their hardest year*, made personal at scale.

---

## 2. Who we're really designing for

The person on the other side of the screen is a 17–19-year-old in their final year. They open the site on a budget Android phone over a 3G connection during recess. Their browser already has tabs open to a Telegram channel, an eddirasa page, a YouTube cours, and a Facebook group full of arguments about which prof's resume is best. They are simultaneously confident and terrified — society treats the Bac as the single most important exam of their life, and most of them are sleep-deprived, comparing themselves to classmates daily.

They have learned to be **deeply skeptical of anything that looks like marketing**. "احصل على 18 في الباك بهذه الحيلة" thumbnails have made them allergic to hype. They trust three things: peers in the same situation, named teachers from their wilaya, and a person who has been through what they're going through and speaks like them. Islem already embodies the third. Our entire product job is to make the website extend that trust at scale rather than dilute it.

They are price-sensitive — most won't pay upfront — but they will pay *after* the product proves itself. So our funnel must be **try-first, pay-later**, never paywall-first.

---

## 3. The three commercial truths

There is a one-time window where this product can become *the* AI study companion for Algerian Bac students, and it closes once a foreign EdTech (or Google itself) launches a localized version. The window is open because nobody else has fluent Darija, the Bac curriculum specifically, and the trust of the Telegram channel.

The product wins on *trust + locality*, not on AI quality. Gemini 2.5 Flash is great, but every competitor will have access to the same models. Our durable moat is the persona, the prompts, the curriculum match, and the brand.

The path to revenue is *not* a paywall. It's a freemium funnel where the free tier is genuinely excellent (because every free user is a marketer), and a small share converts to paid for unlimited use, deeper review, or pre-Bac intensive packages.

---

## 4. Site architecture (proposed)

The current 11 HTML pages are organized like a personal blog circa 2018. They need to be reorganized into three clear layers: a **public marketing surface**, a **logged-in product**, and **transactional tail-ends**.

```
PUBLIC                                 LOGGED-IN PRODUCT
─────────────────                      ───────────────────────
/                  Landing             /dashboard   Personal home
/about             Story / mission     /ai          إسلام AI chat
/plans             Pricing             /study       Specialty hub
/contact           Reach out                ├ /study/summaries
/advertise         B2B                      ├ /study/exercises
                                            └ /study/past-papers
                                       /university  Majors + admission
                                       /tools       Calculators / timer
                                       /profile     Settings + progress
                                       /community   (Phase 2)
```

The HTML files in the repo today are *content*, not architecture. Most of `bac-topics.html`, `resources.html`, and `university.html` should be split and served dynamically from a small JSON content store, with pages filtered by the user's stored specialty. That alone removes about 70% of the visual noise current users face.

---

## 5. The landing page — a psychology-driven walkthrough

The landing page (`/`) has one job: take a skeptical 17-year-old who arrived from a Telegram link and convert them to a registered user inside two minutes. It should be designed in folds, each with a distinct psychological purpose.

**Fold 1 — Hero (above the fold).** The hero is not a stock illustration of a graduation cap. It's a *living mockup of the AI mid-conversation in Darija*, with a real Bac question on screen and Islem's avatar replying in real time. The headline reads something like *"إسلام AI — أخوك الكبير في الباك، يرد عليك بالدارجة على مدار 24 ساعة."* One CTA: *"ابدأ مجاناً — جرب بدون تسجيل."* Next to the CTA, three trust counters: students helped, messages answered, average rating. **Crucial design choice:** let them try one message without an account. This is the single biggest conversion lever we have. Nothing converts a skeptic faster than a working interaction. After one reply, the chat itself prompts them to register to continue.

**Fold 2 — The pain mirror.** A short Arabic paragraph that names their experience back to them: *"تقعد ليل، تحفظ كلش، بصح كي يجي الفرض المخ يفرغ. تحوس على ملخصات مظبوطة، تلقى 50 قناة تيليجرام و كل واحدة تقول حاجة. ما عندك حتى واحد قاعد ينورمك الطريق."* Then one sentence: *"لهذا بنينا BAC STORY."* This fold builds *recognition*, which is the precursor to trust.

**Fold 3 — The four AI modes.** Four cards: المستشار، حل التمارين، المصحح، الملخصات. Each card animates a real example of that mode in action (mp4/Lottie). This shows specificity. Generic AI chats don't show you their actual output; we will. Specificity beats hype every time with this audience.

**Fold 4 — Social proof, dense and named.** Three to six testimonials with **real names, lycées, and wilayas**. *"عبد الرحمن — ثانوية الإمام مالك، الجزائر العاصمة — لقيت في إسلام AI واش كنت نحوس عليه..."* Add a strip of logos: not corporate logos (we don't have any), but lycée names that already use it. Then one big number that's emotionally resonant: *"6,247 طالب يستعملون BAC STORY هذا الأسبوع."* (Real-time counter, even if fudged ±10%.)

**Fold 5 — The library preview.** Three small cards showing the actual content: a sample math summary, a Bac 2024 history sujet with corrigé, a university admission rate snippet. Caption: *"كل المواد، كل الشعب، مرتبة لك."* This proves we are not just an AI chatbot but a real curriculum platform.

**Fold 6 — The Islem story.** A 60-second video (or text + photo) of Islem explaining why he built this. Personal voice. Closes with: *"كنت مكانك. عرفت كيفاه."* This creates the parasocial bridge that 6K Telegram followers already feel — extending it to the web.

**Fold 7 — Final CTA + objection killers.** One last sign-up button, plus three concrete objection counters in small print: free forever for the basics, no credit card needed, sign up with email or Telegram in 30 seconds.

The page should be **single column on mobile, max 1200px on desktop**, with each fold one full mobile viewport tall. No carousels (they hide content). No modal overlays. No marketing animations that delay above-the-fold.

---

## 6. Registration & onboarding

Asking for too much is the #1 killer of conversion. Every additional field drops sign-ups by ~10%. The minimum we need to power the product:

The user should pick one channel (Email or Telegram), enter their name, and pick their specialty — that's it. The OTP arrives, they verify, and they land on the dashboard with a single welcome message from Islem. Nothing else.

**Progressive profiling** does the rest. After they've used the product for two or three minutes, an unobtrusive bottom-sheet asks one *useful* follow-up question per session: their target Bac average (anchors aspirations), their dream major (lets us tailor the university tab), their wilaya (lets us show local social proof later), their target Bac year. Each answer feels like configuration, not interrogation, and each one is voluntary.

We do **not** ask for: phone number unless they choose Telegram, password (we are OTP-only), birth year, parents' names, school code. None of these add value to the product proportionally to the friction they create.

---

## 7. Dashboard — what they see when they sign in

When the student returns, they don't land on the chat or on the marketing page. They land on `/dashboard`, a personal home that does three things at once:

It tells them where they are in time — a Bac countdown widget at the top. *"42 يوم على الباك."* This is uncomfortable but motivating; we keep it factual, never emotional.

It tells them what to do today — a single suggested action card based on their specialty and recent activity. *"ما زال تكمل ملخص الدوال — كمل من وين وقفت؟"* Or *"شعبتك (تقني رياضي) عندها فرض غدا في كل الثانويات — راجع وحدة المتتاليات."*

It surfaces their tools — three quick-access cards: continue your last AI chat, today's recommended summary, this week's exercise set. Below that, a small progress strip: messages used today, daily streak, hours studied this week (pulled from the Pomodoro tool we already have).

The whole page should fit in two mobile viewports. No clutter, no dashboards-as-airplane-cockpits.

---

## 8. The Study Hub — specialty-filtered content

This is where the current site bleeds. `bac-topics.html` is 568 KB of every subject for every specialty rendered into one HTML file. A literature student should never see physics chapters; a tech student should never see philosophy dissertations. The fix is structural, not cosmetic.

We restructure into a single content schema (JSON-driven, but the existing HTML can be the source of truth migrated incrementally) where every item has a **specialty list**, a **subject**, a **chapter**, a **type** (summary, exercise, past paper, lesson), and an **estimated read time**. The Study Hub then queries this and renders only what matters to the student's stored specialty.

The hub itself is laid out as a familiar accordion: subjects across the top as tabs (Math, Physics, etc — only the ones relevant to their specialty), then within each subject, a vertical chapter list with progress checkmarks. Every item card shows three things only: title, type icon, read time. Tapping opens a dedicated reader page with reading mode, font controls, an "ask إسلام AI about this" button (deep-linking into the chat with the chapter pre-loaded), and a save bookmark.

This single change — content filtered by specialty — is the highest-perceived-quality win we can deliver. It feels like the platform "knows me," which is the emotional precondition for paid conversion.

---

## 9. Profile page — identity + control

`/profile` should be intentionally simple. An avatar (auto-generated from name initials in the brand color until they upload one), name, specialty, target average, target Bac year. Underneath, a stats strip: total messages with the AI, daily streak, longest streak, days as a member. A list of saved chats and bookmarked summaries. At the bottom, settings: change language preference (AR / Darija-AR / FR), notification preferences, account email/Telegram, log out. Premium status if applicable.

The profile is **also** where we ask for the soft information we couldn't ask at signup, presented as "complete your profile (3/7)" — a gamified bar that rewards completion with a small badge. This is how we get richer data without taxing the funnel.

---

## 10. Conversion psychology — what works on Algerian Bac students

Several principles to bake into every page, not just the landing:

*Tribal proof beats authority proof.* Don't say "experts recommend." Say "1,200 طالب من ولاية وهران يستعملوننا الأسبوع الفائت." Concrete, local, peer-based.

*Specificity beats abstraction.* Replace "comprehensive resources" with "ملخص الدوال اللوغاريتمية — 7 صفحات — قراءة 12 دقيقة." Numbers and names. Always.

*Loss aversion is real but use it humanely.* Bac countdown widgets work. Fake "this offer expires in 4:32" timers are scammy and they will see through them and lose trust forever.

*The big-brother voice, never the corporate voice.* Every microcopy line gets the same Darija-warm-formal mix as the AI. "تسجيل الدخول" is fine; "الرجاء إدخال بياناتكم لإكمال الإجراء" is corporate poison.

*Show the product, don't describe the product.* Every feature claim on the marketing pages should be paired with a real screenshot or short video of that feature working.

*Religious framing — light touch.* "بإذن الله" and "ربي يوفقك" appear in the AI's voice already. They should appear in onboarding emails and in the success state of important actions, never in promotional copy. It signals warmth without becoming preachy.

---

## 11. Monetization & tier strategy

The pricing should be simple enough to explain in one sentence and priced for the Algerian student wallet, not the export-USD market.

| Tier | Price (DZD) | Daily AI limits | Library access | Extras |
|---|---|---|---|---|
| Free | 0 | 10 advisor / 8 solver / 5 corrector / 5 summarizer | All summaries + 100 past papers | Ads |
| Plus | 999 / month *or* 4500 / Bac season | Doubled across all modes | Full library + new content first | No ads, save chats forever |
| Premium | 1990 / month | Unlimited messages, longer outputs | Everything in Plus | Personal essay/dissertation review by Islem (1 per week), priority Telegram support |

The **"Bac season" 4500 DZD package** is the killer SKU. It frames the purchase as a one-time investment for the highest-stakes period, not an ongoing subscription, which Algerian students resist. It's also a great parental-funded purchase ("ابن/ بنت ما يفهمش حسبتها — 4500 دج باش تنجح في الباك").

CIB / EDAHABIA / BaridiMob payment integration is non-trivial but unavoidable — Stripe doesn't work for most Algerian cardholders. CIBpay or Chargily are the best current options for direct integration; both have JS SDKs.

---

## 12. Phased roadmap — what to ship and when

The priorities below assume one developer (you) and a 90-day horizon to launch the polished v1. Order matters.

**Days 1–10 (foundation lock-down)** are about getting the existing platform to a state where the rest of the work is safe to layer on top. We finish the current cleanup pass: the Supabase migration we just discussed, content audit (catalog every summary/exercise/paper currently in the bloated HTML files, with metadata), and a real performance pass on the three monolithic HTML files. By day 10 the code base shouldn't have any 500 KB pages.

**Days 11–35 (the new shell)** is the visual + architectural redesign. New global navigation, new landing page (Folds 1–7 above), new dashboard, profile page, registration progressive-profiling. The AI chat itself doesn't change visually beyond minor polish; we keep it as the proven core.

**Days 36–60 (the Study Hub)** is the content-filtered specialty hub. This is the single biggest perceived quality jump for returning users. It also requires the JSON content schema and a simple admin tool (even if it's just markdown files in `/content/`) to keep adding lessons.

**Days 61–80 (monetization rails)** is the Plus/Premium tier infrastructure: Chargily integration, premium-only content gating, the 4500 DZD Bac-season SKU, premium-status badges in the profile, ad slot wiring on free tier.

**Days 81–90 (launch + acquisition)** is the public push. Full Telegram channel announcement, Facebook ad campaign at the wilaya level (start with Algiers, Oran, Constantine, then expand), one influencer partnership with a math/physics prof who already has a YouTube following.

Phase 2, post-launch: community features (study walls, daily quizzes, leaderboards by lycée), an iOS/Android wrapper app via Capacitor, and a teacher-facing dashboard so private cours coaches can use the platform with their own students.

---

## 13. Tech foundations to fix in parallel

Independent of the strategy work above, four engineering investments pay back immediately.

The 568 KB / 482 KB / 320 KB single-file pages have to go — they punish mobile users and make the site feel slow even when the network is fine. Splitting them into a content schema + dynamic rendering also unlocks the specialty filtering.

The current `style.css` (133 KB) and `script.js` (31 KB) and `components/shared.js` (58 KB) are monoliths that mix global styles, component styles, and page-specific styles. They need to be split into a small global system (variables, base, typography), a small set of components (button, card, input, modal, navbar), and per-page sheets loaded on demand. This is also a prerequisite for a clean redesign — it's much easier to redesign on a layered system than on a monolith.

Image discipline: the `images/` folder has unsorted hundreds of files mixing logos, university photos, generic stock, and old test images. Move them into `images/universities/`, `images/teachers/`, `images/marketing/`, etc., and run them all through a webp/quality pass. Cumulative ~10–30% page weight reduction expected.

Service worker for offline tolerance: the AI chat page should at minimum cache its shell so that opening the app on flaky connections shows the UI immediately and the streaming starts as soon as connectivity returns.

---

## 14. The metrics that matter

We won't manage what we don't measure. Three numbers should sit on a small internal `/admin/metrics` page from day one.

The **landing-to-registration conversion rate** is the single most important leading indicator. A good v1 target is 8–12%; the Algerian student web average is 3–5%. We will know within two weeks of launch whether the landing page works.

The **day-7 retention rate** tells us if the product is actually useful. Target: 40%. This is what separates "interesting demo" from "real product."

The **paid conversion at day 30** tells us if the freemium funnel is balanced. Target: 3–6% of weekly active free users move to Plus or Premium. Below 2% and the free tier is too generous; above 10% and we're paywalling too hard.

These three numbers should drive every weekly product decision.

---

## TL;DR

We are building the trusted older sibling for Algerian Bac students at scale. The site is currently a content site pretending to be a product; we need to flip it. The biggest-leverage moves, in order, are: a try-before-register landing page that proves value in 60 seconds, specialty-filtered content so every student sees only what's theirs, a dashboard that tells them what to do today, and a Bac-season 4500 DZD SKU that maps to how Algerian families actually spend on education. Underneath, we shed the monolithic HTML/CSS/JS files so we have room to grow.

Everything else is a footnote on those four moves.
