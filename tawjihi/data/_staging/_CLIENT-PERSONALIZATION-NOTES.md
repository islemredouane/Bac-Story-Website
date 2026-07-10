# Client Personalization — Change Notes

Agent: Client Personalization Engineer · Date: 2026-07-10
Files touched: `tawjihi/app.html`, `tawjihi/app.js`, `tawjihi/dashboard.html` (additive).

## 1. Chat hero personalization (app.html + app.js)

### app.html
- Added `id="chatHeroSub"` to the hero subtitle `<p>` and `id="heroSuggestions"` to the chip container (selection hooks only — no style/markup changes).
- Darja fix on the 4 static fallback chips: `ماهو/ماهي` → `واش هو/واش هي`, and removed the Moroccan `ديالي` ("بطاقة الرغبات ديالي" → "بطاقة رغباتي").

### app.js — new HERO PERSONALIZATION section (before the `[data-q]` binding)
- Helpers: `STREAM_AR` (code→label map, profile may carry either form), `streamLabel`, `wilayaLabel` (handles `{num, ar}` object AND plain string from the API), `avgLabel` (trims trailing zeros), `realInterests` (filters the `ما نعرفش بعد` unsure flag), `displayName` (ignores the `صديقي` placeholder).
- `INTEREST_CHIPS`: table mapping each onboarding interest label → `{emoji, label, darja query}`. All 10 onboarding interests covered; unknown interests get a generic `✨` chip. Add a row to extend.
- `buildHeroChips(profile, wishlist)` — pure function, returns max 5 chips:
  (a) up to 2 interest chips, (b) stream+average chip ("واش نقدر ندخل بمعدل X في شعبة Y؟"), (c) wilaya chip with the wilaya name, (d) wishlist chip — bootstrap ("نبدا بطاقة الرغبات") when empty, "قيّم بطاقة رغباتي" when it has items.
- `personalizeHero()` replaces the static chips ONLY when the profile has a real signal (interests, avg+stream, or wilaya); otherwise the static HTML chips stay as fallback. Same `.hero-chip` markup + `data-q`, injected before the existing `[data-q]` click binding so wiring is automatic. Also relabels `#discoverBtn` to reference the first declared interest when present.
- `heroGreeting(profile)` + reworked `randomizeHeroTitle()`: 4 rotating name-anchored darja titles ("واش راك يا أمين؟" …) with the old generic list as fallback; subtitle keyed on average band (≥15 / 12–15 / <12) + stream, e.g. "بمعدل 15.5 في علوم تجريبية عندك خيارات مليحة بزاف — نعاونك تختار المليح فيهم.". Re-runs on every new chat (resetChat already calls it).

## 2. Dashboard nudges (dashboard.html — `generateNudges` only)
- All nudge texts now profile-aware (name via ` يا X` suffix, average, stream label via local `NUDGE_STREAM_AR` map) and in darja (ادخل/دروك/زيد/برك/كمّل).
- NEW nudge when `profile.weightedAverages` is empty: "استورد معدلاتك الموزونة من حاسبة BAC Story…" → links to `#dashAcademicCard` (the existing import card/flow — nothing duplicated). Suppressed automatically once averages are imported.
- Wilaya-missing nudge now links to `onboarding.html` instead of dead `#`.
- Everything else preserved: `loadDashboardData`, `weighted_averages` sync (commit 4a8cc4d), `refreshImportState`, `applyImport`, `persistToSupabase`, `renderNudges` markup, `slice(0,3)` cap.

## 3. Validation
- `node --check tawjihi/app.js` → OK; both dashboard inline scripts parse via `new Function` → OK.
- Browser-preview verified (static server, shell.js session-check stripped page-locally):
  - Full profile (أمين, علوم تجريبية, 15.5, الجزائر, 2 interests, empty wishlist) → personalized title/sub, 5 correct chips, interest-aware discover label.
  - Low profile (آداب وفلسفة 11.2, string wilaya "أدرار", unsure interest, wishlist filled) → no interest chips, encouraging subtitle, "قيّم بطاقة رغباتي" chip, default discover label, generic title (no name).
  - Empty `tw-profile` (`{}`) → static chips + generic greeting kept; chip click wiring confirmed (submits query).
  - Dashboard: no weightedAverages → import nudge shown 2nd; with weightedAverages + risky short wishlist → allRisk + tooFew nudges personalized, import nudge suppressed, academic card filled-state untouched.
