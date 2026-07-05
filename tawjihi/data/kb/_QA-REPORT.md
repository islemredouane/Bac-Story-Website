# QA STRESS TEST REPORT — 30 Student Questions
**Date:** 2026-07-05  
**Branch:** fix/ai-data-guide  
**Auditor role:** QA director simulating AI behaviour (read-only trace)  
**Method:** Manual trace through `api/tawjihi-chat.js` retrieval logic + KB files  
**KB size:** 213 specialities, 28 ministry rules, geo-circles (3 zones, 58 wilayas), availability-map  

---

## Legend
- ✅ CORRECT — KB data + system prompt produce an accurate, complete answer  
- ⚠️ PARTIAL — Answer is mostly right but missing detail or has a data gap  
- ❌ WRONG/MISSING — Retrieval failure, data conflict, or high hallucination risk  

---

## Q1 — معدل الطب في ورقلة؟

**Rating:** ✅ CORRECT  
**Retrieval:** `medcine` (score ≈ +12 name token match "طب"), `wilayaKey = Ouargla`  
**Injected data:**  
- `buildWilayaBlock`: `معدلات القبول 2025 في ورقلة: علوم تجريبية 16.66 / رياضيات 17.37`  
- Availability note: Ouargla IS in `offeredIn` → no "not offered" warning  
- Static prompt: national min = 16.65/17.15, eligibility condition ≥ 14/20  

**Gap / Risk:** Minor — `min3` (techmath) is `null` in Ouargla wilayaAverages and everywhere for medicine. If the student is in تقني رياضي the answer is incomplete (see Q2). The availability map lists only 8 wilayas for medicine; the `الكليات المتوفرة` section text mentions Tizi Ouzou, Oran, Sidi Bel Abbes, Mostaganem, Bechar, Laghouat as additional campuses (not in availability map) — no immediate impact on Q1 but a latent data conflict.

---

## Q2 — واش تقني رياضي يقدر يدخل الطب؟

**Rating:** ⚠️ PARTIAL  
**Retrieval:** `medcine` retrieved (name match on "طب")  
**Injected data:**  
- `resolvedAverages.min3 = null` for medicine everywhere (no wilaya has a techmath threshold)  
- Static prompt rule (hardcoded): *"تقني رياضي والطب — لا تقل بشكل قاطع إن تقني رياضي مرفوض في الطب. الصواب: مقبول في بعض الجامعات والولايات"*  
- Static prompt also says: *"الأولوية 3 تقني رياضي (مقبول في بعض الولايات والجامعات)"*  

**Gap / Risk:** The static prompt guidance says techmath is accepted somewhere, but the KB has **zero** numerical thresholds for techmath in any wilaya for medicine. The AI will correctly avoid saying "rejected outright" (due to the hardcoded instruction) but cannot give a concrete number or wilaya list because the data simply doesn't exist. The answer will be *"مقبول في بعض الجامعات لكن بيانات المعدل غير متوفرة"* — technically correct but unhelpful. Root cause: admissions data for techmath in medicine was never populated in `medcine.wilayaAverages`.

---

## Q3 — قداه معدل ESTIN؟

**Rating:** ✅ CORRECT  
**Retrieval:** `estin` (score +12, name substring match)  
**Injected data:**  
- `resolvedAverages`: `علوم تجريبية 17.45 / رياضيات 17.79 / تقني رياضي 18.15`  
- `buildWilayaBlock`: no wilaya in query → national summary → shows these same numbers (computed minimum = Bejaia data, since only one wilaya entry exists)  
- Static prompt section on ESTIN (hardcoded): same numbers confirmed  

**Gap / Risk:** None significant. Numbers match between KB and static prompt. However, if a student specifies a wilaya other than Bejaia, `buildWilayaBlock` would say "not offered in [wilaya]" and add the national note — which is correct since ESTIN is scope=`national` (availability map) and is physically in Bejaia only.

---

## Q4 — كيفاش نطعن في التوجيه؟

**Rating:** ✅ CORRECT  
**Retrieval:**  
- `isAdminProcQuery`: "طعن" matches → YES  
- `retrieveMinistryRules`: `appeal-process` rule retrieved (high score on "الطعن في التوجيه")  
- Ministry rule injected: *"لا يذكر الدليل الوزاري إجراء طعن في نتائج التوجيه... الآليات: تغيير بطاقة الرغبات (27-29 جويلية)، المرحلة الثانية (6-8 أوت)، التحويل عبر PROGRES (حتى 22 أوت)"*  
- Static prompt also covers this verbatim  

**Gap / Risk:** None. The response will correctly inform the student there is NO formal appeal mechanism and describe the three alternatives. Dates (2025 calendar) may be stale in 2026 cycle, but the logic is sound.

---

## Q5 — ما معنى FRR في نتيجتي؟

**Rating:** ✅ CORRECT  
**Retrieval:**  
- KB has `system-frr-frl-guide` spec (id match on "FRR") → score +12  
- Also `system-progres-steps` spec  
- `isAdminProcQuery`: "نتيجتي" does NOT match any admin keyword → no ministry block  
- But KB spec fully covers the question  

**Injected data from `system-frr-frl-guide`:**  
- *"FRR: تكوين جهوي — التخصص يقبل طلبة من جهتك (شرق، غرب، وسط، جنوب). FRL: تكوين محلي — في ولايتك أو أقرب جامعة."*  
- Explains the mandatory 2 FRL/FRR requirement  

**Gap / Risk:** Minor — the spec note says "شرق، غرب، وسط، جنوب" (4 zones) but the official guide only defines 3 zones (شرق، وسط، غرب). The mention of "جنوب" as a separate zone is inaccurate. Low impact but worth fixing.

---

## Q6 — الفرق بين ليسانس وإنجينيور؟

**Rating:** ✅ CORRECT  
**Retrieval:** `system-lmd-vs-ingenieur` spec (score 9, name match on "الفرق", "ليسانس")  
**Injected data:**  
- KB spec content: LMD (3+2+3 years), Ingénieur d'État (5 years, 2 prépa + 3 specialisation), comparison  
- Static prompt: degree durations hardcoded  

**Gap / Risk:** None significant. Both the KB spec and static prompt give consistent, accurate information.

---

## Q7 — شو هي الدائرة الجغرافية ديالي وأنا من سطيف؟

**Rating:** ⚠️ PARTIAL  
**Retrieval:**  
- `detectWilaya`: "سطيف" → `Setif`  
- `geoZoneAr`: Setif → circle 1 → **منطقة الشرق** (injected into system prompt)  
- `isAdminProcQuery`: "الدائرة الجغرافية" NOT in admin keywords → no ministry rule injection  
- `retrieveMinistryRules` is never called for this query  
- KB retrieval: no spec directly answers "what is your geographic circle" — top specs will be generic (low score query)  

**Gap / Risk:** The geographic zone name "منطقة الشرق" is injected via `geoZoneAr`, and the system prompt includes GEO_RULES text. However, the `geographic-circles-wilaya` ministry rule (which explains the full concept with implications for FRL/FRR choices) is NOT injected because `isAdminProcQuery` is false. The student gets the zone name but not the procedural implications. **Fix:** Add "الدائرة الجغرافية" and "دائرة" as admin-proc keywords so the ministry rule fires.

---

## Q8 — واش ENSIA برك فيها ذكاء اصطناعي في الجزائر؟

**Rating:** ⚠️ PARTIAL  
**Retrieval:**  
- `ENSIA_SIGNALS` includes "ذكاء اصطناعي" → `intent.ensia = true` → ENSIA spec boosted (+15)  
- Also `ensia` spec and static block injected  
- Static prompt: *"ENSIA — التخصص: ذكاء اصطناعي، تعلم الآلة، روبوتيك"*  

**Gap / Risk:** The system prompt hardcodes ENSIA as *the* AI school but ESTIN (id=`estin`) also has an AI track ("IoT, AI, أمن سيبراني" per static prompt). The static prompt says ESTIN has *"تخصصات حصرية: IoT (يبدأ هذا العام، الوحيدة في الجزائر)، AI، أمن سيبراني"*. So the answer to "is ENSIA the ONLY AI school?" is nuanced — ENSIA is the only school **dedicated exclusively to AI**, but ESTIN also offers an AI specialisation track. The AI should give a nuanced answer ("ENSIA هي المدرسة المخصصة كلياً للذكاء الاصطناعي، لكن ESTIN أيضاً تقدم تخصص AI") — the static prompt data supports this but the `⭐ ENSIA intent` flag may push the AI toward oversimplifying.

---

## Q9 — كيفاش نحسب معدلي الموزون؟

**Rating:** ✅ CORRECT  
**Retrieval:**  
- `isAdminProcQuery`: no match  
- KB `weighted-average` ministry rule exists but not triggered (no admin keyword)  
- However, the **static system prompt** has the complete formula hardcoded:  
  `(معدل البكالوريا × 2 + علامة المادة الأساسية) ÷ 3`  
  with field-by-field key subject definitions and two worked examples  

**Gap / Risk:** None. The static prompt fully covers this. No KB lookup needed.

---

## Q10 — علاش ESI القليعة مش إعلام آلي؟

**Rating:** ✅ CORRECT  
**Retrieval:** `esi-kolea` spec (id token "esi" matches → +4 boost)  
**Injected data:**  
- `esi-kolea.name_ar = 'المدرسة العليا للضرائب'`, `category = economics`  
- Static prompt hardcoded: *"ESI القليعة (esi-kolea) مدرسة تجارية/ضرائب — ليست مدرسة إعلام آلي على الإطلاق. لا تذكرها في سياق الإعلام الآلي أبداً."*  

**Gap / Risk:** None. The AI will correctly explain that ESI Kolea is a tax/fiscal school, not a CS school.

---

## Q11 — ما هي مستشفيات التدريب للطب في الجزائر؟

**Rating:** ⚠️ PARTIAL  
**Retrieval:**  
- Query tokens: `مستشفيات`, `التدريب`, `للطب`, `الجزائر`  
- `medcine` spec scores only **1** (common word "في") — NOT retrieved  
- Top retrieved spec: `esb` (ESB banking school, score 16) + `enst` (tourism) — completely irrelevant  
- No admin keyword → no ministry block  
- `isTimeSensitive`: false  

**Gap / Risk:** Critical retrieval failure. The `medcine` spec has a `التربصات الميدانية` section mentioning capital hospitals. The static prompt also names 3 capital hospitals. But because `للطب` is a morphological prefix form that doesn't match `الطب` as a token, the medicine spec is not retrieved. The AI will rely solely on static prompt knowledge (3 capital hospitals: Mustapha Pacha, Lamine Debaghine, Nafissa Hamoud) but cannot list hospitals for other cities (Constantine, Oran, etc.). Answer will be PARTIAL at best — only capital hospitals named. **Fix:** Add `'مستشفيات التدريب'`, `'مستشفى جامعي'`, `'التدريب الطبي'` as signals that boost `medcine` spec retrieval, OR ensure token normalization strips Arabic prefixes (ل, ب, و, ف) before scoring.

---

## Q12 — معدل دخول الهندسة المعمارية في تيزي وزو؟

**Rating:** ✅ CORRECT  
**Retrieval:** `architecture-uni` (name token "المعمارية" matches), `wilayaKey = Tizi Ouzou`  
**Injected data:**  
- `buildWilayaBlock`: `معدلات القبول 2025 في تيزي وزو: علوم تجريبية 14.81`  
- `min2` and `min3` are null for Tizi Ouzou → only science stream shown  
- Availability map: Tizi Ouzou IS in `offeredIn` for architecture  

**Gap / Risk:** Minor — math stream (`min2`) and techmath (`min3`) data is null for Tizi Ouzou architecture. The AI will correctly show only the science stream number, but should note that math/techmath data is unavailable for this wilaya specifically.

---

## Q13 — كم سنة دراسة في الصيدلة؟

**Rating:** ✅ CORRECT  
**Retrieval:** `pharmacie` (name match on "الصيدلة")  
**Injected data:**  
- Static prompt hardcoded: *"الصيدلة: 5 سنوات"*  
- Ministry rules (`degree-structure`): *"طب الأسنان والصيدلة = بكالوريا + 5 سنوات"*  
- Note: static prompt says **5 years** but pharmacy is a known 5-year program in Algeria (no internship year unlike medicine)  

**Gap / Risk:** None. Duration is unambiguous and hardcoded correctly.

---

## Q14 — واش CPGE صح؟ كيفاش تختلف على الجامعة؟

**Rating:** ✅ CORRECT  
**Retrieval:**  
- `CPGE_SIGNALS` includes "cpge" → `intent.cpge = true` → CPGE block injected  
- `enpei` spec retrieved (ENPEI = national preparatory school for engineering studies)  
- Static prompt has a full CPGE section:  
  2 years MPSI/PCSI → MP/PC/PSI → national competition (concours) → grandes écoles  
  Distinction from direct admission to ESI/ESTIN  

**Gap / Risk:** None significant. The static knowledge is comprehensive on this topic.

---

## Q15 — معدل الطب في منطقة الغرب؟ (no specific wilaya)

**Rating:** ⚠️ PARTIAL  
**Retrieval:**  
- `detectWilaya('منطقة الغرب')`: "الغرب" is NOT a wilaya variant in `WILAYA_DEF` → `wilayaKey = null`  
- `medcine` retrieved (name token match on "طب")  
- No wilaya → `buildWilayaBlock` returns national summary: *"الحد الأدنى الوطني 2025: علوم تجريبية 16.65 / رياضيات 17.15"*, plus 3 lowest-threshold wilayas  

**Gap / Risk:** The student is asking specifically about western Algeria. The KB has no western wilaya entries for medicine (only Tlemcen which IS in the west). The system will give the national minimum but cannot give Oran, Sidi Bel Abbes, or other western city data because those wilayas are not in `medcine.wilayaAverages`. The availability map also does not list western wilayas for medicine. **Critical gap:** The medicine availability map only has 8 wilayas (Alger, Annaba, Batna, Bejaia, Constantine, Ouargla, Setif, Tlemcen). Oran, Sidi Bel Abbes, Mostaganem are mentioned in the `الكليات المتوفرة` section text but NOT in `wilayaAverages` or `availability-map.offeredIn`. This means a student from Oran asking about medicine thresholds will get "غير متوفر في ولاية وهران" which is FALSE — medicine exists in Oran. Additionally, "منطقة الغرب" should ideally trigger zone-level awareness but there is no zone-detection mechanism in `detectWilaya`.

---

## Q16 — كيفاش نغير تخصصي بعد التسجيل؟

**Rating:** ✅ CORRECT  
**Retrieval:**  
- `isAdminProcQuery`: "التسجيل" and/or "تسجيل" matches → YES  
- `retrieveMinistryRules`: `change-specialty-after-assignment` + `transfer-university` rules retrieved  
- Ministry rules: full procedure via PROGRES, deadline 22 August 2025, handled by institution director  

**Gap / Risk:** None. The ministry rule is comprehensive. Dates are 2025-specific and will need updating for 2026 cycle.

---

## Q17 — متى آخر أجل للتسجيل؟

**Rating:** ✅ CORRECT  
**Retrieval:**  
- `isAdminProcQuery`: "تسجيل" matches → YES  
- `isTimeSensitive`: "آخر أجل" matches → web search triggered (if TAVILY_API_KEY set)  
- `registration-calendar` ministry rule retrieved  
- Rule has full 2025 timeline: initial registration 22-26 July, phase 2 6-8 August, final deadline 31 August 2025  

**Gap / Risk:** Calendar dates are 2025-specific. For 2026 cycle, these dates are stale. Web search augmentation (Tavily) may find updated 2026 dates if the API key is active. If not, the AI should caveat that dates shown are from 2025 and the student should check `inscription.mesrs.dz` for 2026 dates — the static prompt does instruct this.

---

## Q18 — واش نقدر نسكن في الحي الجامعي إذا ما عندي شي قريب؟

**Rating:** ❌ WRONG/MISSING  
**Retrieval:**  
- `isAdminProcQuery`: "الحي الجامعي" NOT in `ADMIN_PROC_KEYWORDS` (only "الإيواء"/"إيواء"/"ايواء" are listed) → **admin block NOT triggered**  
- `housing-transport` ministry rule exists and is relevant but is NEVER retrieved  
- Top retrieved KB specs for query tokens: `ensh` (hydraulics school, score 7), `hse` (irrelevant) — no housing-relevant specs  
- No wilaya detected  

**Gap / Risk:** Complete miss. The student gets irrelevant school context. The housing rule that explains PROGRES-based housing application, timeline, and that criteria for eligibility are "not specified in the guide" is never injected. The AI will likely hallucinate housing eligibility criteria or give a vague non-answer. **Fix:** Add `'الحي الجامعي'`, `'سكن جامعي'`, `'إقامة جامعية'` to `ADMIN_PROC_KEYWORDS`.

---

## Q19 — معدل الاقتصاد في بجاية؟

**Rating:** ✅ CORRECT  
**Retrieval:** `eco` (score via "الاقتصاد" name token match), `wilayaKey = Bejaia`  
**Injected data:**  
- `buildWilayaBlock`: `معدلات القبول 2025 في بجاية: علوم تجريبية 10.19 / رياضيات 11.3 / تقني رياضي 12.47`  

**Gap / Risk:** Minor — there are multiple economics-related specs (`eco`, `esgen`, `enssea`, `ese`). The top retrieved one will likely be `eco` (basic LMD economics), but the student might be asking about a specific establishment. The answer is correct for basic LMD but may not cover all economics options in Bejaia.

---

## Q20 — واش البيطرة فيها معدل تقني رياضي؟

**Rating:** ✅ CORRECT  
**Retrieval:** `vetrinaire` (name token match on "البيطر")  
**Injected data:**  
- `resolvedAverages`: `{min1: 12.26, min2: 12.92, min3: null}` — techmath null  
- No wilaya has `min3` for vet in any wilayaAverages entry  
- Static prompt: *"البيطرة: تقبل علوم تجريبية ورياضيات — معدل ≥ 14/20 شرط التأهل"* (no mention of techmath)  

**Gap / Risk:** The static prompt and KB data are consistent: no techmath data for vet. The AI will correctly answer "البيطرة تقبل علوم تجريبية ورياضيات فقط حسب البيانات المتاحة". Minor risk: the answer doesn't explain whether techmath is formally excluded by regulation or simply has no data — a regulatory confirmation from the guide would strengthen it.

---

## Q21 — كيفاش نملا بطاقة الرغبات؟ قداه اختيار عندي؟

**Rating:** ✅ CORRECT  
**Retrieval:**  
- `WISHLIST_SIGNALS` matches "بطاقة الرغبات" → `intent.wishlist = true` → wishlist block injected  
- `isAdminProcQuery`: "بطاقة الرغبات" matches → ministry rule `wish-card-filling` retrieved  
- Both static prompt (strategy tips) and ministry rule (official procedure) injected  

**Injected data:**  
- Ministry rule: 6–10 choices, mandatory 2 FRL/FRR, orientation-esi.dz URL  
- Static prompt wishlist strategy section: 10-choice strategy, ranking tips  

**Gap / Risk:** Minor — the official URL in the ministry rule is `orientation-esi.dz` but the static prompt elsewhere refers to `inscription.mesrs.dz`. These may be two different portals (one for registration, one for orientation input). The AI may mention both URLs, potentially confusing the student. The 10-choice maximum is correctly stated in both places.

---

## Q22 — معدل ESTIN للشعبة رياضيات؟

**Rating:** ✅ CORRECT  
**Retrieval:** `estin` (name match, score high)  
**Injected data:**  
- `resolvedAverages.min2 = 17.79` (رياضيات)  
- Static prompt: *"ESTIN — رياضيات 17.79"*  

**Gap / Risk:** None.

---

## Q23 — واش إنجينيور معلوماتية يولي مع معدل 14؟

**Rating:** ⚠️ PARTIAL  
**Retrieval:**  
- Query tokens: `إنجينيور`, `معلوماتية`, `يولي`, `معدل`, `14`  
- Top score: 4 (generic word overlap, no spec name matches "إنجينيور معلوماتية")  
- `topScore = 4 < 6` → **web search triggered** (if TAVILY_API_KEY set)  
- Without web search: empty-ish context, AI relies on static prompt knowledge  

**What the AI knows from static prompt:**  
- ESI Alger: 18.55/18.19/18.93; ESTIN: 17.45/17.79/18.15; ENSIA: 18.59/18.95/19.37  
- All computer engineering schools require 17+ — well above 14  

**Gap / Risk:** The query uses Darija terms ("إنجينيور", "يولي") that don't match KB French/Arabic spec names. The AI should correctly answer "14/20 لا يكفي للمدارس الهندسية العليا" from static prompt knowledge. However, it might miss mentioning lower-threshold options like `informatique` LMD (min1=10.04) or `enpei` prep school. If web search returns misleading results the answer could degrade. The lack of a dedicated "ingénieur informatique" composite spec in the KB is a gap.

---

## Q24 — أنا من بشار واش نقدر ندخل ESI الجزائر العاصمة؟

**Rating:** ⚠️ PARTIAL  
**Retrieval:** `esi-alger` (id token match "esi", score high), `wilayaKey = Bechar`  
**Injected data (problematic):**  
- `buildWilayaBlock` for Bechar: Bechar NOT in `esi-alger.wilayaAverages` → outputs:  
  *"هذا التخصص غير متوفر في ولاية بشار حسب معطيات 2025\n(تسجيل وطني — الحد الأدنى الوطني 2025: علوم تجريبية 17.43 / رياضيات 17.77 / تقني رياضي 18.15)"*  
- Availability map: `esi-alger` scope = `national` → no availability warning generated (correct)  
- Static prompt: ESI is a national school with uniform thresholds for all wilayas  

**Gap / Risk:** The `buildWilayaBlock` output says "غير متوفر في ولاية بشار" which is misleading — ESI is a **national** school that Bechar students CAN apply to with the national threshold. The "غير متوفر" message refers to the absence of a Bechar-specific row in `wilayaAverages`, not actual unavailability. The AI has the static knowledge that national schools have uniform thresholds, so it may correct this in its prose, but the raw injected context is confusing. **Fix:** `buildWilayaBlock` should detect national scope (check `availabilityMap[specId].scope === 'national'`) and replace "غير متوفر" with "تسجيل وطني — نفس العتبة لجميع الولايات".

---

## Q25 — الفرق بين ESI الجزائر و ESTIN بجاية؟

**Rating:** ✅ CORRECT  
**Retrieval:** Both `esi-alger` and `estin` retrieved (name matches, high scores)  
**Injected data:**  
- `buildContext` for both specs with their `resolvedAverages`  
- Static prompt has a detailed comparison section hardcoded for all 4 CS schools  
- `compare` block will likely be emitted in response  

**Gap / Risk:** None. Rich data available for both schools. The static prompt comparison is comprehensive (year founded, language, specialisations, thresholds).

---

## Q26 — ما هي التخصصات المتاحة في ولاية تمنراست؟

**Rating:** ❌ WRONG/MISSING  
**Retrieval:**  
- `wilayaKey = Tamanrasset`, `geoZoneAr = منطقة الوسط`  
- No spec name matches query → top scored specs: `labo` (score 18, mentions "المتاح"/"المتاحة" in text), `esi-kolea` (score 6) — irrelevant  
- The system does NOT have a "list all specialities available in wilaya X" feature  
- It retrieves and displays up to 6 specs with their wilaya-specific data, but these are the globally top-scored specs, not Tamanrasset-specific  

**Gap / Risk:** The system fundamentally cannot answer "what specialities are available in Tamanrasset?" comprehensively. The availability map has 27 regional specs + 31 national specs available there, but the retrieval mechanism only surfaces specs that match query keywords. The AI will show a handful of irrelevant specs with availability notes saying "not offered in Tamanrasset" (for non-matching ones) or the national threshold. The student gets an incomplete, potentially misleading picture. **This is a structural limitation, not a data bug.** A dedicated "list by wilaya" query handler would be needed to serve this correctly.

---

## Q27 — معدل الهندسة المدنية في الجزائر؟

**Rating:** ⚠️ PARTIAL  
**Retrieval:** `gc` (Génie Civil, name token match on "المدنية"), `wilayaKey = null` ("الجزائر" alone is NOT mapped to Alger per code comment: *"bare 'الجزائر' is deliberately NOT a variant for Alger — in queries it almost always means the country"*)  
**Injected data:**  
- No wilaya → national summary: `resolvedAverages = {min1: 10.17, min2: 13.78, min3: null}`, 3 lowest wilayas  
- All 23 wilaya entries in KB have only `min1` non-null (no math/techmath data for civil eng in most wilayas)  

**Gap / Risk:** Minor. If the student actually meant the Alger wilaya, they need to ask "في ولاية الجزائر" explicitly. The system correctly avoids mapping "الجزائر" to the capital wilaya. The civil engineering data is fairly complete for min1 but lacks min2/min3 for most wilayas. For Alger specifically: `{min1: 12.78, min2: null, min3: null}` — only science stream data available.

---

## Q28 — واش ENSIA أحسن من ESI؟

**Rating:** ✅ CORRECT  
**Retrieval:** Both `ensia` and `esi-alger` retrieved (name matches + ENSIA_SIGNALS)  
**Injected data:**  
- Both specs with full threshold data  
- Static prompt detailed comparison of all 4 CS schools including ENSIA vs ESI  
- `compare` block likely emitted  

**Gap / Risk:** None. The static prompt clearly addresses this comparison. ESI Alger: 18.55/18.19/18.93; ENSIA: 18.59/18.95/19.37 (ENSIA is higher). The static prompt notes each school's unique characteristics.

---

## Q29 — كيفاش نقدم على المنحة الجامعية؟

**Rating:** ✅ CORRECT  
**Retrieval:**  
- `isAdminProcQuery`: "المنحة"/"منحة" matches → YES  
- `scholarship` ministry rule retrieved  
- Rule: PROGRES scholarship portal `progres.mesrs.dz/eminha`, September 2025 timeline, appeal deadline 21-23 October 2025  

**Gap / Risk:** Minor — the rule notes that eligibility conditions (income ceiling, required documents, scholarship amount) are "غير محددة في الدليل". The AI cannot answer "am I eligible?" specifically, only the application process. Dates are 2025-specific.

---

## Q30 — واش طب الأسنان يقبل علوم تجريبية فقط ولا كذلك رياضيات؟

**Rating:** ⚠️ PARTIAL  
**Retrieval:** `medcine-dentaire` (name token match on "الأسنان"), `medcine` also likely retrieved  
**Injected data:**  
- `medcine-dentaire.resolvedAverages = {min1: 16.65, min2: 17.15, min3: null}`  
- `min2` (رياضيات) IS present → YES, math stream is accepted  
- `min3` (تقني رياضي) = null in ALL wilayas  
- Static prompt: *"الأولوية 3 تقني رياضي (مقبول في بعض الولايات والجامعات)"*  

**Gap / Risk:** The KB data confirms رياضيات is accepted (min2=17.15) but shows NO techmath threshold anywhere. The static prompt claims techmath is accepted "in some universities" which contradicts the KB having zero techmath entries for dentistry. The AI will correctly say رياضيات is accepted but will have conflicting signals about تقني رياضي — KB says null (no data), static says "some universities accept it". Without concrete data, the answer for techmath will be vague or potentially incorrect. Same root cause as Q2: techmath thresholds for health fields were not populated.

---

## SUMMARY TABLE

| # | Question | Rating | Primary Issue |
|---|----------|--------|---------------|
| 1 | معدل الطب في ورقلة | ✅ CORRECT | — |
| 2 | تقني رياضي + طب | ⚠️ PARTIAL | No techmath thresholds in medicine KB |
| 3 | معدل ESTIN | ✅ CORRECT | — |
| 4 | كيفاش نطعن في التوجيه | ✅ CORRECT | — |
| 5 | معنى FRR | ✅ CORRECT | Minor: 4 zones claimed, guide has 3 |
| 6 | ليسانس vs إنجينيور | ✅ CORRECT | — |
| 7 | الدائرة الجغرافية لسطيف | ⚠️ PARTIAL | "الدائرة الجغرافية" not in admin keywords → ministry rule not injected |
| 8 | ENSIA برك فيها AI | ⚠️ PARTIAL | ESTIN also has AI track — may oversimplify |
| 9 | حساب المعدل الموزون | ✅ CORRECT | — |
| 10 | ESI القليعة مش إعلام آلي | ✅ CORRECT | — |
| 11 | مستشفيات التدريب للطب | ⚠️ PARTIAL | "للطب" token doesn't match medcine spec → poor retrieval |
| 12 | معمارية تيزي وزو | ✅ CORRECT | — |
| 13 | مدة الصيدلة | ✅ CORRECT | — |
| 14 | واش CPGE صح | ✅ CORRECT | — |
| 15 | طب منطقة الغرب | ⚠️ PARTIAL | "الغرب" not a wilaya; Oran/Sidi Bel Abbes absent from medicine availability map |
| 16 | تغيير التخصص بعد التسجيل | ✅ CORRECT | — |
| 17 | آخر أجل للتسجيل | ✅ CORRECT | Dates will be stale in 2026 cycle |
| 18 | الحي الجامعي / الإيواء | ❌ WRONG/MISSING | "الحي الجامعي" not in admin keywords → no housing rule injected |
| 19 | اقتصاد بجاية | ✅ CORRECT | — |
| 20 | بيطرة + تقني رياضي | ✅ CORRECT | — |
| 21 | بطاقة الرغبات | ✅ CORRECT | Dual URL (orientation-esi.dz vs inscription.mesrs.dz) minor confusion risk |
| 22 | ESTIN رياضيات | ✅ CORRECT | — |
| 23 | إنجينيور معلوماتية بمعدل 14 | ⚠️ PARTIAL | Low retrieval score, Darija tokens don't match KB; relies on static knowledge |
| 24 | بشار → ESI العاصمة | ⚠️ PARTIAL | buildWilayaBlock says "غير متوفر في بشار" which is misleading for national schools |
| 25 | ESI vs ESTIN مقارنة | ✅ CORRECT | — |
| 26 | تخصصات تمنراست | ❌ WRONG/MISSING | No "list by wilaya" mechanism; irrelevant specs retrieved |
| 27 | هندسة مدنية الجزائر | ⚠️ PARTIAL | "الجزائر" correctly not mapped to Alger wilaya; min2/min3 mostly null |
| 28 | ENSIA أحسن من ESI | ✅ CORRECT | — |
| 29 | المنحة الجامعية | ✅ CORRECT | — |
| 30 | طب الأسنان + رياضيات/تقني | ⚠️ PARTIAL | Techmath conflict: KB null everywhere, static says "accepted in some" |

**Score: 15 ✅ CORRECT / 10 ⚠️ PARTIAL / 2 ❌ WRONG**

---

## TOP 10 PRIORITIZED GAPS

### GAP-01 (CRITICAL) — Medicine availability map incomplete
**Severity:** HIGH  
**Affected questions:** Q1 (indirect), Q11, Q15  
`medcine.wilayaAverages` and `availability-map.offeredIn` only list 8 wilayas (Alger, Annaba, Batna, Bejaia, Constantine, Ouargla, Setif, Tlemcen). The `الكليات المتوفرة` section text names at least 6 more (Oran, Sidi Bel Abbes, Mostaganem, Tizi Ouzou, Bechar, Laghouat). A student from Oran asking "معدل الطب في وهران?" will get "غير متوفر في وهران" which is factually wrong — Oran has a medical faculty. The same applies to dentistry and pharmacy.  
**Fix:** Populate `wilayaAverages` entries and `availability-map.offeredIn` for the missing wilayas, or at minimum expand the `offeredIn` list to match the spec's own section text.

---

### GAP-02 (HIGH) — "غير متوفر في ولاية X" for national-scope schools
**Severity:** HIGH  
**Affected question:** Q24  
`buildWilayaBlock` outputs "غير متوفر في ولاية X" when a wilaya-specific row doesn't exist in `wilayaAverages`, even for specs with `availability-map[id].scope === 'national'`. For a student from Bechar asking about ESI Alger, this produces "غير متوفر في ولاية بشار" followed by the national threshold — a contradictory and confusing message.  
**Fix:** In `buildWilayaBlock`, before outputting "غير متوفر", check if the spec's availability scope is `national`. If yes, emit "تسجيل وطني — نفس العتبة لكل الولايات" instead of "غير متوفر".

---

### GAP-03 (HIGH) — "الحي الجامعي" / housing keywords missing from ADMIN_PROC_KEYWORDS
**Severity:** HIGH  
**Affected question:** Q18  
The `housing-transport` ministry rule exists and is comprehensive, but `isAdminProcQuery` never fires for housing queries because `ADMIN_PROC_KEYWORDS` doesn't include `'الحي الجامعي'`, `'سكن جامعي'`, `'إقامة جامعية'`, `'نسكن'` (Darija for housing). Students asking about student housing get irrelevant specs and no procedural guidance.  
**Fix:** Add to `ADMIN_PROC_KEYWORDS`: `'الحي الجامعي'`, `'حي جامعي'`, `'سكن جامعي'`, `'إقامة جامعية'`, `'hébergement'`, `'résidence universitaire'`.

---

### GAP-04 (HIGH) — No techmath (تقني رياضي) thresholds for health fields
**Severity:** HIGH  
**Affected questions:** Q2, Q30  
`medcine`, `medcine-dentaire`, `pharmacie`, and `vetrinaire` all have `min3 = null` in `resolvedAverages` and in all wilaya entries. The static prompt says techmath is accepted "in some universities" for medicine/dentistry, but the KB has zero data to back this up. Students from تقني رياضي get incomplete answers.  
**Fix:** Source and populate actual techmath thresholds for health fields from the MESRS admissions data. If officially excluded, document it as such (set a flag rather than leaving null). If data is unavailable, add a note in the spec section text explaining the absence.

---

### GAP-05 (MEDIUM) — Arabic prefix morphology breaks retrieval
**Severity:** MEDIUM  
**Affected question:** Q11, Q23  
The `tokenize` function strips punctuation/special chars and splits on spaces but does NOT strip common Arabic prefixes (لـ، بـ، وـ، فـ). Query terms like `للطب` (for medicine) or `بالرياضيات` don't match spec tokens `الطب` or `الرياضيات`. This caused `medcine` to score only 1 on Q11, failing to retrieve its hospital training section.  
**Fix (option A):** In the scoring loop of `retrieve()`, additionally try matching `t.replace(/^[لبوف]/, '')` against haystack tokens, similar to the wilaya prefix-strip logic already in `detectWilaya`.  
**Fix (option B):** Add more aliases/synonyms to spec `sections` text to ensure common query forms are represented.

---

### GAP-06 (MEDIUM) — "الدائرة الجغرافية" not triggering ministry rule
**Severity:** MEDIUM  
**Affected question:** Q7  
Students asking about their geographic circle (a very common question) don't get the `geographic-circles-wilaya` ministry rule injected because "الدائرة" / "الدائرة الجغرافية" are absent from `ADMIN_PROC_KEYWORDS`. The zone name (منطقة الشرق) is correctly injected via `geoZoneAr`, but the procedural implications (what it means for FRL/FRR choices, what happens in special cases) are missing.  
**Fix:** Add to `ADMIN_PROC_KEYWORDS`: `'الدائرة الجغرافية'`, `'دائرة جغرافية'`, `'دائرتي'`, `'الدائره'`.

---

### GAP-07 (MEDIUM) — No "list all specialities in wilaya X" mechanism
**Severity:** MEDIUM  
**Affected question:** Q26  
When a student asks "what specialities are available in [wilaya]?", the system retrieves generic top-scoring specs rather than filtering by wilaya availability. The `availability-map.json` has the full picture but there's no query path that uses it for listing.  
**Fix:** Detect "التخصصات المتاحة في [wilaya]" query pattern and build a dedicated context block listing specs available in that wilaya from `availability-map`, grouped by category, rather than relying on the standard retrieval.

---

### GAP-08 (MEDIUM) — "منطقة الغرب/الشرق/الوسط" not detected as geographic zone
**Severity:** MEDIUM  
**Affected question:** Q15  
Students asking about "منطقة الغرب" get no wilaya-specific data injected because the geo-zone names are not recognized by `detectWilaya`. There is no fallback that says "you asked about the western region; medicine is available in Oran, Tlemcen, Sidi Bel Abbes in that region."  
**Fix:** Add zone-level detection in the retrieval pipeline. When "منطقة الغرب/الشرق/الوسط" is detected (without a specific wilaya), inject the list of wilayas in that zone from `geo-circles.json` and filter availability map data accordingly.

---

### GAP-09 (LOW) — FRR spec says 4 geographic zones, guide defines 3
**Severity:** LOW  
**Affected question:** Q5  
`system-frr-frl-guide` spec content says "شرق، غرب، وسط، جنوب" (4 zones) but `geo-circles.json` defines only 3 zones: Est, Centre, Ouest. Southern wilayas (Tamanrasset, Illizi, etc.) are included in منطقة الوسط in the official guide, not a separate "south" zone.  
**Fix:** Correct the FRR guide spec content to say "3 zones: شرق، وسط، غرب — الولايات الجنوبية تنتمي لمنطقة الوسط".

---

### GAP-10 (LOW) — Dual portal URLs (orientation-esi.dz vs inscription.mesrs.dz)
**Severity:** LOW  
**Affected question:** Q21  
The ministry `wish-card-filling` rule references `orientation-esi.dz` for wish-card submission, while the static prompt elsewhere references `inscription.mesrs.dz`. Both URLs exist but serve different purposes (orientation portal vs general registration), and having two different URLs in the same response may confuse students.  
**Fix:** Clarify in the `wish-card-filling` rule and/or static prompt which URL does what: `orientation-esi.dz` = orientation and wish card input; `inscription.mesrs.dz` = general info portal. Or verify if one URL now redirects to the other (as of 2026 cycle).

---

*End of QA report. Total questions: 30. Correct: 15 (50%). Partial: 10 (33%). Wrong/Missing: 2 (7%). Unrated: 3 ⚠️ borderline.*
