# TAWJIHI — Business & Marketing Plan
### 2026 Launch Cycle · Budget ≤ 20,000 DZD · Solo founder + AI tools
> Prepared by: Business & Marketing Director · July 4, 2026
> Supersedes the monetization section of TAWJIHI-PRD.md ("free + ads only" is retired; core advice stays free, paid layers are approved).

---

## 1. The market, in numbers

| Fact | Number | Why it matters |
|---|---|---|
| BAC 2026 candidates | **876,171 registered** | Total top-of-funnel awareness pool |
| Expected to pass (2025 precedent: 51.57%) | **~450,000** | Every one of them must file a fiche de vœux within ~2 weeks |
| BAC 2026 results | **July 11–13, 2026** | The starting gun — **7–9 days from now** |
| Orientation results (2025 precedent) | ~2.5 weeks after results | The window is **~July 12 → ~end of July** — roughly 15 days |
| Official registration fee | 200 DZD | The state process is essentially free — we never compete with it, we sit *before* it |

**The window is the business.** ~400k+ students make the most consequential decision of their lives in 15 days, once a year. Demand is absolute, panicked, and time-boxed. Whoever owns their attention in that window owns the year.

---

## 2. Competitive landscape

**Official (orientation.esi.dz + ministry "tawjih" platform).** Does the actual assignment; even uses AI-assisted matching now. But it's a *submission* system, not an *advisor*: no Darija, no explanation, no "what should I put first and why." Position Tawjihi as **the preparation layer before the official portal** — never as a replacement. Every AI answer already closes with "أكّد على البوابة الرسمية." Keep that; it's both legal cover and trust.

**SEO content farms (orientation-dz.com, a-onec.com, dzexams, elkhadra…).** Static articles + display ads. Zero personalization, ugly, ad-choked. They win on Google; we win on product. Don't fight them on SEO this cycle.

**Facebook pages & Telegram channels.** Rumor-driven, comment-section advice, occasionally paid "consultations" sold informally in DMs. This is actually validation: students already pay individuals for fiche-de-vœux help with zero data behind it. We do the same thing with a real engine underneath.

**Nobody in Algeria has:** a personalized simulator on real admissions data + Darija AI + an existing trusted audience. That's the whole moat. The ministry's own AI move confirms the direction; a foreign or local copycat is a *when*, not an *if*. 2026 is the land-grab year.

**⚠️ Brand note:** "Tawjihi" is dominated online by Morocco (tawjihnet.net, e-tawjihi.ma, tawjihi.uir.ac.ma) and it's the name of Jordan's exam. For this cycle it doesn't matter (launch channel = Telegram, not search), but brand it **توجيهي DZ / Tawjihi DZ** everywhere online, and buy a .dz-flavored domain (tawjihi-dz.com / tawjihidz.com) so we don't feed the Moroccan SERPs.

---

## 3. Revenue model — four layers, ranked by effort-to-cash

Core principle preserved from the PRD: **the advice itself is never paywalled.** Simulator, browser, and a meaningful free AI allowance stay free — every free user is a marketer. Money comes from depth, service, and B2B.

### Layer 1 — توجيه شخصي (personal fiche-de-vœux review) — *the cash engine, week 1*
The founder reviews a student's كشف النقاط + draft wishlist and returns a personally-signed, ranked 10-choice list with reasoning (built ON TOP of the simulator output, so each review takes ~15 min with a template).
- **Price:** 2,500 DZD standard · 4,000 DZD priority (24h) + 15-min call
- **Capacity (solo):** ~10/day × 12 working days ≈ 120 reviews → **~300,000–380,000 DZD** realistic ceiling for the window
- **Scarcity is real, so market it:** "عدد محدود — نراجعها بيدي وحدة وحدة."
- Payment: BaridiMob / CCP screenshot → manual confirmation → flag in Supabase. No gateway, no fees, zero build cost beyond a form.

### Layer 2 — AI credit packs — *covers costs + converts power users*
Free tier: enough daily credits to feel generous (the credits + referral system is already built). Paid top-ups for the obsessive two weeks:
- **باك credits pack:** 500 DZD → large credit bundle valid through August
- Groq inference is nearly free, so margin is ~100%. This layer exists less for revenue and more so the "free" story has a natural, non-resented upgrade path. Target: 200–400 buyers → **100,000–200,000 DZD**.

### Layer 3 — B2B: écoles privées & formation institutes — *the real 2027 business, seeded now*
Private higher-ed (ESST and peers) and training institutes spend real money recruiting bacheliers — and Tawjihi's audience is *exactly* their customer at *exactly* the decision moment. Do NOT sell this during the window (no inventory credibility yet). Instead:
- During the window: capture traffic stats, demographics (شعبة/معدل/wilaya distributions — we have them from onboarding).
- **Last week of August:** pitch 5–10 écoles privées a "Rentrée sponsor pack" — clearly-labeled sponsored placement on relevant speciality pages + a "خيارات أخرى" section for students whose معدل missed their dream. Price anchor: 50,000–150,000 DZD per sponsor per season.
- This is also the ethical answer for the ~40% of visitors who *failed* the BAC or got weak averages: private options, formation professionnelle, redoing the year. Serving them is both right and monetizable.

### Layer 4 — Display ads — *deprioritized*
Algerian CPMs are poor and ads would poison the premium feel during the trust-building cycle. Revisit in September, only on content pages, never inside the app.

**Season target (conservative):** 250,000–450,000 DZD revenue on ≤20,000 DZD spend, plus 1–2 B2B sponsors signed for September (~100k+ DZD), plus the 2027 asset: thousands of registered profiles.

---

## 4. Cost structure — designed to stay near zero

| Item | Cost |
|---|---|
| Vercel hosting + serverless | 0 (free tier is sufficient at this scale; upgrade trigger = sustained traffic spikes, ~$20/mo) |
| Supabase | 0 (free tier: 50k MAU auth, 500MB DB — fine) |
| Groq API | ~0 (free tier / pennies; credits system caps abuse) |
| Domain (tawjihidz.com or similar) | ~2,500–3,500 DZD |
| Facebook/TikTok ad tests (results week only) | 12,000–15,000 DZD |
| Canva / design | 0 (existing) |
| **Total** | **≤ 20,000 DZD** ✅ |

Fixed costs ≈ 0 means every layer is nearly pure margin, and there is no burn if the season underperforms. The only real cost is founder time — which is why Layer 1 is templated and capped.

---

## 5. Go-to-market — the 15-day war plan

**Channel truth:** BAC STORY Telegram is the only distribution that matters at launch. Ads are a test, not a pillar. The product's shareability is the second channel — build it in.

### Phase 0 — Pre-results (now → ~July 11) — **ONE WEEK, not two**
- Fix the 27 CRITICAL audit items (data correctness IS the marketing — one viral screenshot of a wrong verdict kills the brand).
- Seed anticipation on BAC STORY: "يوم النتائج، ما تسقساش الفيسبوك. سقسي توجيهي." Countdown posts. Collect pre-registrations ("سجّل من الآن، دخّل معدلك المتوقع").
- Prepare the **shareable verdict card**: student runs the simulator → gets a branded image (توجيهي DZ logo, their eligible specialities) sized for WhatsApp/Instagram stories. This is the viral loop — every share is an ad we didn't pay for.
- Line up 5–10 beta students (from the channel) to generate real named testimonials before launch day.

### Phase 1 — Results week (~July 11–18) — *attention peak*
- **Results morning, +5 minutes:** congratulations post + "دخّل معدلك الحقيقي دابا" — the moment every student has a real number in hand and one question: واش يقبلني؟ (Have the post pre-written and the exact date confirmed from ONEC's announcement — trigger manually the moment results drop.)
- Daily content rhythm (all repurposed from the product, zero new writing): "معدلك 12–13؟ هاهم 8 تخصصات واقعية" — one bracket per day, screenshot from the app, link.
- Open Layer 1 (توجيه شخصي) with visible limited slots. Post when slots fill — scarcity proof.
- Run the 12–15k DZD ad test: 3 creatives × FB/TikTok, targeting 17–19 DZ, pointing at the simulator (free hook), not the paid service. Kill anything above ~20 DZD per registration.

### Phase 2 — Fiche-de-vœux week (~July 19–31) — *money peak*
- Content pivots from "what can I get" to "how do I order my 10 choices" — the exact anxiety Layer 1 sells the answer to.
- AI + simulator push wishlist review at every natural moment ("قائمتك واجدة؟ خلي توجيهي يشوفها").
- Referral system (already built) framed as: invite 3 friends → bonus credits. Students are in groups; harvest that.

### Phase 3 — Post-window (early August → September)
- Orientation results day: "ما جاتكش اللي حبيت؟" content — appeals (الطعون), re-orientation, private options → warms up the B2B inventory.
- Pitch écoles privées with real season numbers.
- Retro: what converted, what didn't → decide the year-round roadmap from data, not vibes.

---

## 6. KPIs (check daily during the window)

| Metric | Target |
|---|---|
| Registered profiles by end of July | 10,000 |
| Simulator completion rate | >60% of registrations |
| Verdict cards shared | >15% of completions |
| Layer 1 reviews sold | 100+ (sell-out = raise price next cycle, not capacity) |
| Credit pack conversion | 2–4% of registered |
| Cost per registration (paid) | <20 DZD, else kill ads |
| B2B meetings booked (by Sept 15) | 5 |

---

## 7. Risks & mitigations

1. **Wrong advice → brand death.** The audit's DATA-1…7 bugs are business-critical, not technical debt. No launch until they're closed. Every verdict cites its data year + "أكّد على البوابة الرسمية."
2. **Founder bottleneck (Layer 1).** Template + simulator pre-work caps each review at 15 min. If demand explodes: raise price, don't raise hours.
3. **Free-tier infrastructure buckles on results day.** Pre-warm: static-cache the landing page, rate-limit guests, load-test the simulator before July 10. (Vercel/Supabase free tiers handle this scale if the heavy JSON is served static/CDN — it already is.)
4. **Payment friction / trust.** Manual BaridiMob is normal in DZ; publish a "كيفاش نخلص" mini-guide + show payment methods on the pricing section before checkout, not after.
5. **Name collision (Morocco/Jordan "Tawjihi").** Brand as توجيهي DZ online; irrelevant on Telegram, matters for SEO later.
6. **Minors' data.** Averages + wilaya are sensitive: keep the existing privacy page honest, minimal retention, no selling data — *audience access* is what B2B buys, never the data itself.

---

## 8. The one-sentence strategy

**Give away the smartest orientation tool in Algeria during the only 15 days that matter, convert trust into ~120 personal reviews and credit packs at near-100% margin, and walk into September with the audience numbers that make écoles privées pay for 2027.**
