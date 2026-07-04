# Ministry Rules Extraction Report — Guide BAC 2025 (MESRS)

**Date:** 2026-07-04
**Source:** `tawjihi/data/guide-bac2025-extracted.md` (192-page automated extraction of المنشور رقم 00 المؤرخ في 01 جويلية 2025 — التسجيل الأولي وتوجيه حاملي شهادة البكالوريا 2025-2026)
**Deliverable:** `tawjihi/data/kb/ministry-rules.json` (26 rules)

## Extraction method

The extracted markdown stores most Arabic **visually reversed** (character order flipped, sometimes with Arabic presentation-form glyphs). A normalization pass (NFKC + line reversal with a definite-article heuristic) was used to make pages 2–14 readable. Digit runs are **inconsistently reversed** in the source extraction: some date numbers read correctly (22, 26, 27, 29, 05, 11, 19, 23, 24, 25, 31), others are corrupted or ambiguous (see Gaps). Year values print as "0202" in many lines but as "2025" in others; all belong to the 2025-2026 circular, so 2025 was used.

## Topics covered (rule ids)

wish-card-filling, orientation-criteria, weighted-average, medicine-national-ranking, ens-teachers-schools, second-phase-reorientation, appeal-process, transfer-university, change-specialty-after-assignment, geographic-circles-wilaya, registration-calendar, final-registration, scholarship, housing-transport, special-cases-general, missed-registration, old-bac-holders, foreign-bac, bouamama-special-bac, elite-athletes, dual-path-multiple-bac, other-ministries-private, foreign-students, disabilities, top-students-16plus, english-courses, degree-structure.

## Key verbatim quotes (normalized from the extraction)

- **Wish card (p.7):** «ينبغي على المترشح ملء بطاقة رغبات يتضمن حسب ترتيب تفاضلي ستة (06) اختيارات على الأقل وعشر [10] اختيارات على الأكثر من بين التكوينات المسموحة له بها» — the digit prints as "(00)" but the word «عشر» (ten) is explicit.
- **Wish card obligation (p.7):** «هام: يجب على حامل شهادة البكالوريا أن يحدد في بطاقة رغباته من ضمن الاختيارات على الأقل مسارين تكوينيين (02) في الليسانس ذات التسجيل المحلي أو الجهوي.»
- **Criteria (p.4):** «يستند التوجيه نحو التعليم والتكوين العاليين على المعايير الأربعة الآتية: شعبة ونتائج امتحان البكالوريا... الرغبات المعبر عنها... قدرات استيعاب مؤسسات التعليم والتكوين العاليين، الدوائر الجغرافية.»
- **Weighted average (p.4 footnote):** «المعدل الموزون المحسوب: هو المحصلة ما بين المعدل العام المحصل عليه في البكالوريا المزود بمعامل وعلامة المادة أو المواد الأساسية.»
- **Medicine (p.6):** «للالتحاق بشعب الطب، طب الأسنان والصيدلة، يتم اللجوء لترتيب وطني لطلبات حاملي شهادة البكالوريا حسب المقاعد البيداغوجية المتاحة، يتحدد على إثره معدل أدنى وطني للالتحاق بهذه الشعب.»
- **ENS (p.6):** «يخضع التسجيل النهائي في المدارس العليا للأساتذة لشرط السن المحدد بـ 24 سنة على الأكثر عند 31 ديسمبر 2025 ولنتيجة المقابلة الشفوية أمام لجنة تابعة للمؤسسة الموجه إليها.»
- **Second phase (p.8):** «في الحالة التي لم يتم فيها الحصول على أي اختيار من اختياراته المعبر عنها، يقترح على المعني عملية ثانية للتسجيل الأولي... ستة (06) اختيارات من ضمنها اثنين (02)، وجوبا، في مساري الليسانس ذات تسجيل محلي أو جهوي.»
- **Transfer (p.11):** «التحويل في نفس المؤسسة أو نحو مؤسسة أخرى في نفس المدينة الجامعية أو نحو مؤسسة أخرى تابعة لمدينة جامعية أخرى. يتم إدراج طلب التحويل عبر الأرضية الرقمية https://progres.mesrs.dz/webetu في الفترة الممتدة من 01 إلى 22 أوت 2025.»
- **Special cases governance (p.11):** «تقع عملية معالجة الحالات الخاصة المذكورة أدناه، حصريا، على عاتق مدير مؤسسة التعليم العالي بالتشاور مع الندوات الجهوية للجامعات، وفي كنف احترام المعدلات الدنيا للتوجيه وبطاقات الرغبات فضلا عن المقاعد البيداغوجية المتاحة.»
- **Final registration (p.8):** «يصبح التسجيل نهائيا بعد دفع حقوق التسجيل حصريا بواسطة البطاقة الذهبية لحامل شهادة البكالوريا أو أحد أقاربه عبر الأرضية الإلكترونية https://progres.mesrs.dz/webetu.»
- **Services (p.9):** «يقوم الطالب الجديد باستكمال الإجراءات الخاصة بالخدمات الجامعية (النقل، الإيواء) عبر https://progres.mesrs.dz/webetu... أما بالنسبة للمنحة، فتتم عبر الأرضية الإلكترونية https://progres.mesrs.dz/eminha.»
- **Scholarship appeal (p.13 calendar):** «إيداع الطعون والإعلان عن النتائج من 21 إلى 23 أكتوبر 2025» — this طعن applies to **المنحة الجامعية only**.
- **Geographic circles (p.12):** «قصد توجيه أنجع لحاملي شهادة البكالوريا الجدد نحو مؤسسات التعليم العالي التي توفر قدرات استيعاب وتأطير و/أو إيواء كافية، يمكن تغيير الدوائر الجغرافية لتسجيلهم في مسارات التكوين المحددة في الملاحق المناسبة.»
- **Modify wishes before confirming (p.13):** «يمكن لحامل شهادة البكالوريا الجديد، خلال هذه المرحلة [تأكيد التسجيل الأولي 27–29 جويلية]، تغيير بطاقة رغباته الأولية قبل التأكيد النهائي لاختياراته.»

## Reliable calendar dates (digits verified plausible in raw)

| Event | Dates |
|---|---|
| التسجيل الأولي عبر الخط | 22 → 26 جويلية 2025 |
| تأكيد التسجيل الأولي (+تعديل الرغبات) | 27 → 29 جويلية 2025 |
| نتائج التوجيه (مرحلة 1) | 05 أوت 2025 مساء |
| المرحلة الثانية: بطاقة رغبات جديدة | 06 → 08 أوت 2025 |
| نتائج المرحلة الثانية | 11 أوت 2025 مساء |
| ترشح البكالوريا الأجنبية | 02 → 20 أوت 2025 |
| إيداع طلبات الحالات الخاصة | 19 → 23 أوت 2025 |
| معالجة الحالات الخاصة | 24 → 25 أوت 2025 |
| آخر أجل لدفع رسوم التسجيل | 31 أوت 2025 |
| طلب التحويل عبر webetu (نهاية الفترة) | حتى 22 أوت 2025 |
| طلب من لم يسجل / باك قديم | 02 → 05 سبتمبر 2025 |
| خدمات جامعية مرحلة 2 (نقل/إيواء) | 12 → 17 أوت 2025 |
| طعون المنحة | 21 → 23 أكتوبر 2025 |

## Gaps — need the original PDF to confirm

1. **Corrupted digits** (extraction shows impossible or ambiguous numbers):
   - Open doors (أبواب مفتوحة افتراضية): raw «من 12 إلى 03 جويلية» — impossible; likely 21→30 or 12→30 جويلية.
   - Payment window phase 1 (دفع رسوم التسجيل): raw «من 12 إلى 12 أوت» — start/end unreadable.
   - Payment window phase 2: raw «من 13 إلى 12 أوت» — end unreadable (start 13 أوت plausible).
   - Special-cases results day: raw «02 أوت» after processing 24–25 أوت — inconsistent, likely 26 أوت.
   - Transfer window start: «من 01 إلى 22 أوت» — start could be 01 or 10.
   - Housing request phase 1: raw «من 12 إلى 12 أوت» — unreadable.
   - Housing processing: raw «من 13 إلى 00 أوت» — end unreadable (likely 20).
   - Housing fee payment: raw «من 03 إلى 02 أوت» — unreadable.
   - Scholarship file deposit: raw «من 21 إلى 12 سبتمبر» — likely 12→21 سبتمبر.
   - Scholarship processing/results: raw «من 12 إلى 32 سبتمبر» — likely ends 23 سبتمبر.
   - Elite-athlete certificate deadline: raw «قبل 00 أوت» — likely 10 أوت.
   - Bouamama final registration: raw «من 02 إلى 01 أوت» — likely 02→10 أوت.
   - Late-registration window at institutions: raw «من 06 إلى 01 سبتمبر» — likely 06→10 سبتمبر.
   - English course start: «من 02 جويلية» — could be 20 جويلية.
2. **Appeal against orientation (الطعن في التوجيه):** the guide contains **no** appeal procedure for orientation results — only the scholarship appeal window. Encoded as "غير محدد في الدليل" with the alternative mechanisms the guide does provide. If MESRS publishes a separate note on orientation appeals, it is outside this circular.
3. **Disabilities (ذوي الهمم):** zero mentions found in the whole extraction. Needs another source (e.g. جامعة التكوين المتواصل / social affairs texts).
4. **Top students 16+/excellence programs:** not in this circular. The task brief assumed «20 خيار» for the wish card, but the guide explicitly says **6 to 10 choices** («ستة على الأقل وعشر على الأكثر») — encoded per the guide.
5. **Scholarship eligibility conditions** (income ceiling, amounts) and **housing eligibility** (distance rules, priority for girls): not in this circular — only platforms and calendar. Come from ONOU regulations, not this guide.
6. **Weighted-average coefficients per subject/stream:** the footnote defines the concept; the actual per-filière formulas live in the annex tables (pages 15+), which are flattened/partially garbled — the eligibility datasets (`catalog-eligibility.json`, `admissions-full.json`) already carry the per-code ranking basis.
7. **Re-inscription after dropping out** (سبق له التسجيل ثم انقطع): guide only covers holders who **never** registered. Silent otherwise.

## Not encoded (out of scope / covered elsewhere)

- Annex per-filière tables (codes, minima, circles): already in `tawjihi/data/kb/admissions-full.json` and `tawjihi/data/catalog-eligibility.json`.
- Ministerial preamble (تعليمات, page 14) — rhetorical, no student-facing rule.
