# Geographic Circles (الدوائر الجغرافية) — Extraction Report

Source: `tawjihi/data/guide-bac2025-extracted.md` (192-page extraction of the official MESRS Guide BAC 2025 PDF). All line numbers below reference that file. Note: Arabic in the extraction is **character-reversed** (visual RTL order stored LTR); quotes below are restored to logical order.

## Key finding: the guide has NO single numbered "circles" table

The 2025 guide defines geographic circles at **two levels**, neither of which is a numbered list like "الدائرة 1 = ...":

1. **Three geographic zones** — Annex 04 «رمز الولايات», PDF page 159 (extraction lines 12336–12360 and flattened tables at lines 12363–12441). The wilaya-code table is laid out in three columns headed (line 12337):
   > منطقة الشرق | منطقة الوسط | منطقة الغرب

   All 58 wilayas are partitioned: East = 21 wilayas, Center = 18, West = 19 (21+18+19 = 58, verified complete, no duplicates). This is the only **global** wilaya grouping in the guide and is what `geo-circles.json` encodes as circles 1 (الشرق), 2 (الوسط), 3 (الغرب). Column identity was confirmed by geography (Oran/Tlemcen in the الغرب column, Constantine/Annaba in الشرق, Alger/Blida in الوسط) and by the flattened `جدول 2/3/4` at lines 12370–12441 which reproduce the three columns cleanly with codes.

2. **Per-program registration circles** — every regional-registration table in Annex 01 (from PDF page 25, extraction line ~1390 onward) has a column «الدوائر الجغرافية للتسجيل» listing, for each training institution, the wilaya codes admitted there. Example (Sciences & Technology, lines 1400–1455 / table at 1470–1476): code `A00LAL01` groups جامعة الأغواط←03، جامعة الجلفة←17، جامعة غرداية←47,58، جامعة أدرار←01,49، جامعة بشار←08,52 … while `A00LAL05` covers جامعة وهران للعلوم والتكنولوجيا←31، جامعة غليزان←48، المركز الجامعي تندوف←37.

   These lists **differ per program** (e.g. filière A04 at lines 1495–1507 splits the country into only 2 circles) and **overlap** (one wilaya code can appear beside several institutions, e.g. code 21 appears in A00LAL01, A00LAL02 and A00LAL03). They are therefore NOT a partition and cannot be flattened into a single `wilayaToCircle` map. They were **not** encoded row-by-row (100+ flattened, partially garbled tables); the JSON documents the mechanism instead.

## Verbatim rule quotes (restored from reversed text)

**Orientation criteria — section I.1, PDF page 4 (lines 116–122):**
> يستند التوجيه نحو التعليم والتكوين العاليين على المعايير الأربعة الآتية: شعبة ونتائج امتحان البكالوريا المحصل عليها …، الرغبات المعبَّر عنها من طرف حامل شهادة البكالوريا، قدرات استيعاب مؤسسات التعليم والتكوين العاليين، **الدوائر الجغرافية**.

**Section IX title + body, PDF page 12 (lines 614–625):**
> IX — الدوائر الجغرافية للتسجيل بالنسبة للتكوينات المضمونة وفق النمط الحضوري
> قصد توجيه أنجع لحاملي شهادة البكالوريا الجدد نحو مؤسسات التعليم العالي التي توفر قدرات استيعاب وتأطير و/أو إيواء كافية، **يمكن تغيير الدوائر الجغرافية لتسجيلهم** في مسارات التكوين المحددة في الملاحق المناسبة.
> بالنسبة لبعض شعب العلوم الطبية التي يتم الالتحاق بها عن طريق معدلات وطنية، يمكن توجيه حاملي شهادة البكالوريا الجدد المعنيين بهذه الشعب **إلى أي مؤسسة من مؤسسات التعليم العالي عبر التراب الوطني** حسب قدرات الاستقبال والإيواء.
> ملاحظة: تكتسي التكوينات عن بعد وكذا التكوينات ذات الشهادة المزدوجة والكفاءات المزدوجة **طابعا وطنيا** مع مراعاة قدرات التأطير.

**Registration-type taxonomy — Annex 01 intro, PDF page 15 (lines 872–874):**
> ♦ تكوينات ذات تسجيل محلي أو جهوي (FRL/FRR)
> ♦ شعب ذات تسجيل وطني (FRN)

**Code key — PDF page 18 (lines 947–984):** `LAL` = ليسانس أكاديمي ذو تسجيل محلي (مثال A00LAL01 «تكوين ذو تسجيل محلي أو جهوي»)، `LAN` = ليسانس أكاديمي ذو تسجيل وطني، `TPN`/`FPN` = ISTA/تكوين مهني وطني، `IAN` = ماستر مدمج لليسانس وطني، `CAN` = تكوين قاعدي وطني، `EAN` = عن بعد وطني، `LPN` = ليسانس مهني وطني. ⇒ the 3rd letter of the trigram in `codeFil` (L vs N) is the regional/national switch. Cross-checked against `admissions-full.json`: suffix distribution PSL 928, LAL 792, SAN 763, PML 522, PPL 290, PSN 290, TCL 248, FCL 179, PMN 116, LAN 80… (its `type` field is university/grande_ecole/national and does NOT encode regional vs national — use `codeFil`).

**Mandatory regional choices — PDF page 7 (lines 347–352, also 447):**
> على حامل شهادة البكالوريا أن يحدد في بطاقة رغباته ضمن الاختيارات على الأقل مسارين تكوينيين (02) في الليسانس ذات التسجيل المحلي أو الجهوي المضمونين في مؤسسة التعليم العالي.

**Circle-based fallback for special cases — PDF page 12 (lines 600–609):**
> حامل شهادة بكالوريا 2025 الذي لم يقم بأي إجراء للتسجيل الأولي … يتم إدراج طلب تسجيله **على مستوى المؤسسة الجامعية التابعة لدائرته الجغرافية** في الفترة الممتدة من 02 إلى 05 سبتمبر 2025. (نفس الحكم لحاملي بكالوريا جزائرية قبل 2025 دون تسجيل جامعي سابق.)

## Zone membership as extracted (Annex 04, p.159)

- **الشرق (circle 1, 21):** 04 أم البواقي، 05 باتنة، 07 بسكرة، 12 تبسة، 18 جيجل، 19 سطيف، 21 سكيكدة، 23 عنابة، 24 قالمة، 25 قسنطينة، 28 المسيلة، 30 ورقلة، 34 برج بوعريريج، 36 الطارف، 39 الوادي، 40 خنشلة، 41 سوق أهراس، 43 ميلة، 51 أولاد جلال، 55 تقرت، 57 المغير
- **الوسط (circle 2, 18):** 03 الأغواط، 06 بجاية، 09 البليدة، 10 البويرة، 11 تمنراست، 15 تيزي وزو، 16 الجزائر، 17 الجلفة، 26 المدية، 33 إليزي، 35 بومرداس، 42 تيبازة، 44 عين الدفلى، 47 غرداية، 53 إن صالح، 54 إن قزام، 56 جانت، 58 المنيعة
- **الغرب (circle 3, 19):** 01 أدرار، 02 الشلف، 08 بشار، 13 تلمسان، 14 تيارت، 20 سعيدة، 22 سيدي بلعباس، 27 مستغانم، 29 معسكر، 31 وهران، 32 البيض، 37 تندوف، 38 تيسمسيلت، 45 النعامة، 46 عين تموشنت، 48 غليزان، 49 تيميمون، 50 برج باجي مختار، 52 بني عباس

## Wilaya key spellings

`wilayaToCircle` keys use the exact Latin spellings of `admissions-full.json`'s `wilaya` field (49 distinct real-wilaya values observed, e.g. `Setif`, `Ouargla`, `Msila`, `Bordj Bou Arreridj`) plus standard spellings for the 9 wilayas with no institution in that dataset (`In Salah`, `In Guezzam`, `Djanet`, `El Meniaa`, `Ouled Djellal`, `El Mghair`, `Timimoun`, `Bordj Badji Mokhtar`, `Beni Abbes`). Six dataset values are campuses, not wilayas, and are mapped in `campusAliases`: Aflou→Laghouat, Barika→Batna, Bou Saada→Msila (the ENS annex row is administratively «ANNEXE BISKRA» but Bou Saada town is in M'sila), El Kharrouba→Boumerdes, Maghnia→Tlemcen, Sci Islamiques Emir→Constantine.

## Coverage achieved

- 3-zone global partition: **complete** (58/58 wilayas, codes + Arabic names, cross-checked for duplicates/gaps).
- Regional vs national mechanism, code key, mandatory-2-regional-choices rule, circle-change clause, national-medical clause, special-cases fallback: **encoded** in `rules` / `registrationCodeKey`.
- Example redirection mapping (ST domain A00LAL01–05): quoted in report, mechanism described in `rules.redirection`.

## Gaps needing the original PDF

1. **Per-program wilaya-code→institution lists (Annex 01, PDF pages 25–112) were not encoded.** They exist in the extraction but many flattened rows are garbled (institution names truncated mid-word, e.g. line 1472 "يقا…", code digit groups occasionally merged, and reversed-digit ambiguity like «12» vs «21» in a few rows). Encoding all ~100 tables reliably requires the original PDF tables. This is the true fine-grained "which university takes my wilaya for filière X" data.
2. **FRR vs FRL distinction per row**: the guide separates تسجيل محلي (FRL) from جهوي (FRR) only via the Annex 01 tables' code lists (an institution serving just its own wilaya's code = local); the extraction does not mark rows explicitly.
3. The extraction contains OCR digit corruption in dates/numbers (e.g. «0202» for 2025) — quotes above were corrected from context; verify against the PDF if quoting officially.
