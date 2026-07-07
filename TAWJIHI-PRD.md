# TAWJIHI — Product Requirements & Build Plan
### توجيهي · by BAC STORY
*The AI-native university orientation platform for Algerian students.*

> **Status:** Discovery complete · Target launch: **BAC 2027 orientation cycle** · Owner: Redouane Mohamed Islem

---

## 1. Vision & Positioning

**One line:** *The AI mentor that knows each Algerian student and tells them — honestly, with real data — what to study and where.*

Algerian students choosing after BAC drown in rumor, family pressure, and confusing official PDFs. Tawjihi replaces that with a **personalized, AI-native platform** built on **accurate official data**. Every student has a profile; the AI never gives generic answers; accuracy is the brand.

**Why we win #1:** not "a site with a chatbot," but a product where **AI is the interface** and **each student is known**. The competition shows information — we give *personalized, grounded, trustworthy decisions*.

---

## 2. Locked Decisions (from discovery)

| Area | Decision |
|---|---|
| **Relationship to BAC Story** | Separate domain + sub-brand (own logo by BAC Story), with a referral button + cross-links from BAC Story. |
| **Launch strategy** | Build the **full platform**, launch for the **2027 cycle**. No rushed seasonal MVP. |
| **Tech stack** | Vanilla HTML/CSS/JS front-end + Vercel serverless functions + **Supabase** (Google auth + Postgres) + **Claude API**. |
| **Auth** | Google sign-in (one-tap). Guest browsing allowed; account required to save/personalize. |
| **User profile** | Comprehensive — collected via smart **onboarding flow** so the AI never re-asks. |
| **AI behavior** | Context-aware on every page · warm darija-friendly tone · honest & grounded (never bluffs eligibility). |
| **Languages** | Arabic-first UI; AI understands & replies in **Arabic / French / darija**. |
| **Signature feature** | **Fiche-de-vœux simulator** (preference-list builder with AI risk analysis). |
| **Product breadth** | Orientation-focused now → expand to **year-round companion** later. |
| **Data strategy** | Official الدليل الوزاري + manual verification · reuse `university.html` data · student crowdsourcing · university partnerships. |
| **Community** | Student reviews/testimonials · "students like you chose…" · Telegram-integrated. |
| **Trust anchor** | **Grounded-in-official-data AI** — every recommendation cites real ministry data + historical averages. |
| **Monetization** | Free + ads / sponsorship. No paywalls. |

---

## 3. Target User & Algerian Context

- **Primary:** BAC student (just finished / awaiting results) choosing university orientation.
- **Mentality factors the product must respect:**
  - Family + prestige bias (طب/هندسة seen as the only "success") → AI reframes toward employable, realistic fits without judgment.
  - Fear of "wasting" the BAC → reduce anxiety, simplify, never add jargon.
  - Trust flows through **people and channels**, not institutions → testimonials, "students like you," Telegram.
  - **Mobile-first, bilingual** (AR / FR / darija latin) → responsive PWA, trilingual AI.
  - **Free is expected** → ads/sponsorship, never paywall core advice.

---

## 4. Feature Set

### 4.1 Core (launch for 2027)
- **Google sign-in + onboarding** — collects شعبة, معدل/معدل متوقع, wilaya, ميولات/interests, career aspirations, and (optional) subject-level grades.
- **Personalized orientation engine** — ranks specialities & universities the student can *realistically* enter and would *fit*, based on profile + historical معدلات القبول.
- **AI advisor "مرشدك"** — Claude-powered, knows the profile, context-aware on every page, warm darija tone, grounded in official data, always closes with "أكّد على البوابة الرسمية."
- **Specialities & universities browser** — filter by شعبة + معدل + wilaya; detail page per تخصص (eligibility, averages history, universities, conditions, آفاق العمل).
- **Fiche-de-vœux simulator** ⭐ — student builds preference list; AI flags unrealistic/risky picks, gaps, and ordering mistakes using historical cut-offs.
- **Personalized dashboard** — saved specialities, eligibility status, deadlines, results countdown, AI nudges.

### 4.2 Community & Trust
- Student **reviews & testimonials** per speciality/university (moderated).
- **"Students like you chose…"** — data-driven social proof from real account profiles.
- **Telegram integration** — tie to existing channel for distribution + trust.

### 4.3 Year-round expansion (post-launch)
- Re-orientation / transfer advice, master's selection, scholarships, study-abroad, career paths.
- AI aptitude/interest quiz (top-of-funnel hook).
- Q&A / ask-a-senior flywheel.

---

## 5. Data Model (initial)

### `specialities` (the moat)
```
id, name_ar, name_fr, domain/faculty,
eligible_streams: [رياضيات, علوم تجريبية, تقني رياضي, تسيير و اقتصاد, آداب و فلسفة, لغات أجنبية],
min_average_history: { "2024": x, "2025": y, ... },
universities: [{ name, wilaya, capacity, notes }],
conditions: [entretien, موقع, شروط خاصة, ...],
career_outcomes_ar, demand_level, related_ids,
source_ref   // citation into official الدليل الوزاري — required for trust
```

### `users` / `profiles`
```
id (Supabase auth), email, display_name,
stream, average (or expected), wilaya,
interests[], career_aspirations, subject_grades{}, onboarding_complete,
saved_specialities[], fiche_de_voeux[], created_at
```

### `reviews`
```
id, user_id, speciality_id, university_id, rating, body, status(moderation), created_at
```

---

## 6. AI Architecture

- **Pattern:** RAG (retrieval over `specialities` data) + strong system prompt + Claude. **No fine-tuning** — retrieval is cheaper, more accurate, and updates instantly when 2026/2027 averages drop.
- **Context injection:** every request includes the student's profile + current page context, so answers are specific, never generic.
- **Language:** detect input language (AR/FR/darija) and reply in kind; UI stays Arabic-first.
- **Guardrails (system-prompt hard rules):**
  1. Never assert eligibility not grounded in the dataset.
  2. Always cite the real average / source when making a recommendation.
  3. Always remind: confirm on the official portal.
  4. Warm older-sibling tone; reframe prestige bias supportively.
- **Backend:** `api/tawjihi-chat.js` (Vercel serverless) → Claude API. Profile read from Supabase.

---

## 7. Technical Architecture

```
Front-end:  Vanilla HTML/CSS/JS (reuse BAC Story design system, PWA, search)
Auth + DB:  Supabase (Google OAuth, Postgres, Row-Level Security)
Serverless: Vercel functions  (api/tawjihi-chat.js, api/*)
AI:         Claude API (claude-opus-4-8 / sonnet for cost-sensitive calls)
Hosting:    New Vercel project, separate domain
Data:       specialities.json / Supabase table, version-controlled & sourced
```

---

## 8. Distribution & SEO

- **Launch channel = Telegram**, not search (new domain = zero authority at first).
- Referral button + cross-links from BAC Story (`index.html`, `university.html`) to pass traffic/authority.
- SEO is the **long game** for 2027+: target AR/FR/darija intent keywords — `التوجيه الجامعي 2027`, `معدلات القبول`, `ماذا أدرس بمعدل ...`, `tawjih jami3i`, `fiche de voeux Algérie`.

---

## 9. Roadmap (toward 2027 launch)

| Phase | Focus | Output |
|---|---|---|
| **0 — Foundations** | Domain, Vercel project, Supabase setup, Google auth, brand/logo | Skeleton app, login works |
| **1 — Data (moat)** | Build `specialities` dataset: seed from `university.html` → expand from official الدليل الوزاري → manual verification | Accurate, sourced dataset |
| **2 — Core pages** | Onboarding flow, profile, specialities/universities browser + detail pages | Personalized browsing |
| **3 — AI advisor** | RAG + Claude + guardrails, context-aware on every page | Grounded "مرشدك" live |
| **4 — Simulator** ⭐ | Fiche-de-vœux builder + AI risk analysis | Signature feature |
| **5 — Dashboard + community** | Saved items, deadlines, reviews, "students like you" | Retention loops |
| **6 — Polish + launch** | Trilingual AI QA, accuracy review, Telegram launch campaign | 2027 public launch |
| **Later** | Year-round companion, aptitude quiz, Q&A, partnerships | Sustained #1 |

---

## 10. Key Risks

- **Data accuracy = legal/ethical liability.** Wrong eligibility advice harms students and the brand. → Mandatory sourcing + manual verification + "confirm officially" disclaimer.
- **Minor users' personal data** (averages, grades). → Clear privacy policy, RLS, minimal retention, consent at onboarding.
- **New-domain cold start.** → Lean on Telegram; treat SEO as 2027+ payoff.
- **AI cost at scale.** → Use Sonnet for routine calls, cache common answers, rate-limit guests.
- **Crowdsourced reviews need moderation.** → Status field + review queue before publish.

---

## 11. Open Items / Next Steps

1. **Domain name** for Tawjihi (e.g. `tawjihi.dz` / `.app` / `tawjihidz.com`).
2. **Logo & brand identity** (by BAC Story).
3. **Anthropic API key** + Supabase project — accounts to create.
4. **Source for الدليل الوزاري** (file/PDF) for Phase 1.
5. **Greenlight Phase 0/1** — I can start by extracting the data already in `university.html` into a clean `specialities.json`.

---

*© 2026 — Tawjihi by BAC STORY.*
