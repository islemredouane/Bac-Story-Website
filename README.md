# BAC STORY 🎓
### منصة التميز في البكالوريا

**The ultimate preparation platform for Algerian Baccalaureate students.**

![BAC STORY Logo](favicon.png)

[![Views](https://img.shields.io/badge/Weekly%20Views-59K-blue)](#-analytics)
[![Users](https://img.shields.io/badge/Active%20Users-8.8K%2Fweek-green)](#-analytics)
[![Growth](https://img.shields.io/badge/Growth-↑98.6%25-brightgreen)](#-analytics)
[![Audience](https://img.shields.io/badge/Audience-Algeria%20%F0%9F%87%A9%F0%9F%87%BF-orange)](#-analytics)

---

## 🌟 Overview

**BAC STORY** is a production-grade Arabic-first educational platform for Algerian BAC students. Built entirely with vanilla HTML/CSS/JS — no frameworks, no bundlers — and deployed on Vercel with clean URLs, aggressive caching, and PWA support. It covers everything a student needs from first-day revision to the morning of the exam.

---

## 📄 Pages

| Page | Route | Description |
|---|---|---|
| `index.html` | `/` | Landing page |
| `simulation.html` | `/simulation` | Live BAC exam simulation |
| `bac-topics.html` | `/bac-topics` | Subjects & topics browser |
| `resources.html` | `/resources` | Academic resources library |
| `tools.html` | `/tools` | Study tools (timer, GPA calc) |
| `university.html` | `/university` | University guide 2026 |
| `plans.html` | `/plans` | Study packages & plans |
| `oqba.html` | `/oqba` | عقبة revision content |
| `about.html` | `/about` | About the platform |
| `contact.html` | `/contact` | Contact |
| `advertise.html` | `/advertise` | Media kit & advertising |

---

## 🚀 Features

### 🧪 BAC Simulation Engine
Full exam simulation built across `simulation.html` + `simulation.js`:

- **Real countdown timer** — matches official BAC durations per subject per specialty
- **All 11 specialties**: Math, Sciences, Tech-Elec, Tech-Civil, Tech-Mech, Tech-Process, Management, Literature, German, Spanish, Italian
- **Multi-source exam pool** with source badges per card:
  | Badge | Source | Coverage |
  |---|---|---|
  | 🟠 **قناتي** | Channel's own trial exams | 2025 + 2026 |
  | 🔵 **نافع** | Nafi exam series | Math, Sciences |
  | 🟣 **مواضيع التميز** | Tamayoz curated papers | All subjects |
- **Exam strategy guide** — built-in 30-minute selection rule section
- **Solution viewer** — compare answers with the correction after submission
- **Focus mode** — distraction-free exam environment
- **Session persistence** — back/forward navigation via `history.pushState`
- **Announcement modal** — bottom-sheet on mobile, centered card on desktop, shown once via `localStorage`

### 🔍 Smart Arabic Search Engine
- 200+ indexed keywords across all pages
- Full Arabic normalization: "ال-", hamzas, taa marbutas, dialectal variants
- Instant overlay results via `components/shared.js`

### 📚 Academic Resources
- Content for all BAC subjects across all specialties
- Summaries, exercises, past papers, corrections
- Channel video links per topic

### 🏛️ University Guide 2026
- Directory of Algerian universities and grandes écoles (USTHB, ESC, ENSSEA, EPAU, ENSTP…)
- Admission cutoffs and major details per specialty
- Filterable, card-based layout

### 🛠️ Study Tools
- **BAC GPA Calculator** — simulate final grade from subject marks
- **Study Timer** — focus sessions with alarm
- **Study Packages** — structured revision plans with progress tracking

### 📱 PWA — Installable App
- `manifest.json` → Android home screen, splash screen
- `sw.js` → offline caching via Service Worker
- `apple-touch-icon.png` → iPhone/iPad home screen

### 🖼️ Favicon System
| File | Size | Used By |
|---|---|---|
| `favicon.ico` | 16+32+48px | Legacy browsers |
| `favicon-16.png` | 16×16 | Browser tab (small) |
| `favicon-32.png` | 32×32 | Browser tab (standard) |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `icon-192.png` | 192×192 | Android home screen |
| `icon-512.png` | 512×512 | Android splash screen |

---

## 🛠️ Technology Stack

| Layer | Details |
|---|---|
| **Core** | HTML5, Vanilla CSS3, JavaScript ES6+ |
| **Architecture** | Modular component injection — `components/shared.js` |
| **Icons** | Font Awesome 6 |
| **Fonts** | Google Fonts — Tajawal (Arabic UI), Pattaya (display) |
| **Deployment** | Vercel with clean URLs + cache headers |
| **Analytics** | Google Analytics 4 |
| **PWA** | Web App Manifest + Service Worker |
| **Ads** | `ads-config.js`|

---

## 📂 Project Structure

```
bac-story/
│
├── index.html                  # Landing page
├── simulation.html             # Exam simulation
├── bac-topics.html             # Topics & subjects browser
├── resources.html              # Resources library
├── tools.html                  # Study tools
├── university.html             # University guide 2026
├── plans.html                  # Study packages
├── oqba.html                   # عقبة content
├── about.html                  # About
├── contact.html                # Contact
├── advertise.html              # Advertising / media kit
│
├── style.css                   # Central design system & all animations
├── script.js                   # General app logic
├── simulation.js               # Simulation engine — examData, pools, timer, UI
├── bac-topics.js               # BAC topics page logic
├── ads-config.js               # Ads slot configuration
│
├── components/
│   ├── shared.js               # Search engine + component injector + announcement
│   ├── navbar.html             # Navbar
│   ├── footer.html             # Footer
│   ├── loader.html             # Page loader
│   └── search.html             # Search overlay
│
├── manifest.json               # PWA manifest (icons, theme, display)
├── sw.js                       # Service worker (offline cache)
├── vercel.json                 # Routing + cache headers
│
├── favicon.ico                 # Multi-size browser favicon
├── favicon-16.png              # 16×16
├── favicon-32.png              # 32×32
├── apple-touch-icon.png        # 180×180 — iOS
├── icon-192.png                # 192×192 — Android
├── icon-512.png                # 512×512 — Android splash
└── images/                     # All visual assets
```

---

## 🌐 Deployment

Hosted on **Vercel**. `vercel.json` handles:
- **Clean URL routing** — `/simulation` instead of `/simulation.html`
- **Cache headers** — long-lived cache for static assets, no-cache for HTML
- **Arabic locale** — `dir="rtl"` enforced globally

```
bacstory.vercel.app/             →  index.html
bacstory.vercel.app/simulation   →  simulation.html
bacstory.vercel.app/university   →  university.html
bacstory.vercel.app/tools        →  tools.html
bacstory.vercel.app/advertise    →  advertise.html
```

---

## 📊 Analytics — Last 7 Days

| Metric | Value | vs. Previous Period |
|---|---|---|
| Page Views | **61,000** | ↑ 98.6% |
| Active Users | **9,900** | ↑ 57.7% |
| Total Events | **147,000** | ↑ 90.8% |

**Top country:** Algeria 🇩🇿 — 96%+ of all traffic  

---

## 👨‍💻 Developer

**Redouane Mohamed Islem**
- Telegram Channel: [@BacStoryWithIslem](https://t.me/islemcs)
- Platform: [BAC STORY](https://bacstory.vercel.app)

---

*© 2026 BAC STORY — Your Gateway to Baccalaureate Excellence.*
