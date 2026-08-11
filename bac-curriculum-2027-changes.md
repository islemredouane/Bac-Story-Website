# BAC Curriculum Changes — New 3rd-Year (Terminal) Subjects & Coefficients
> Source: Official ministry tables (images). Scope: 3rd year (السنة الثالثة) only.  
> These changes apply to the class entering terminal year in 2026–2027, sitting BAC in 2027.

---

## 1. Stream Rename

| Old name | New name | Code in codebase |
|---|---|---|
| شعبة تقني رياضي | شعبة هندسة | `tech` |

Every visible label "تقني رياضي" across the site must become "هندسة".  
The JS key `tech` stays the same — only displayed strings change.

---

## 2. New Stream — فنون (Arts)

This stream did **not exist** before. Everything must be created from scratch.  
JS key to use: `arts`

### Subjects & Coefficients (3rd year)

| Subject (AR) | Input ID | Coefficient |
|---|---|---|
| فنون 1 | `arts-arts1-grade` | 6 |
| فنون 2 | `arts-arts2-grade` | 5 |
| لغة عربية | `arts-arabic-grade` | 4 |
| لغة أمازيغية | `arts-tamazight-grade` | 3 |
| لغة إنجليزية | `arts-english-grade` | 2 |
| لغة فرنسية | `arts-french-grade` | 2 |
| تاريخ وجغرافيا | `arts-history-geo-grade` | 2 |
| علوم إسلامية | `arts-islamics-grade` | 2 |
| تربية بدنية ورياضية | `arts-sport-grade` | 1 |

**تاريخ وجغرافيا**: keeps FULL geography — label stays "تاريخ وجغرافيا".  
**Total written coefficient**: 27

---

## 3. Coefficient Changes Per Stream

### 3.1 رياضيات (`math`)

| Input ID | Subject | Old coeff | New coeff | Action |
|---|---|---|---|---|
| `math-math-grade` | رياضيات | 7 | **8** | update |
| `math-physics-grade` | علوم فيزيائية | 6 | 6 | no change |
| `math-science-grade` | علوم الطبيعة والحياة | 2 | 2 | no change |
| `math-islamics-grade` | علوم إسلامية | 2 | 2 | no change |
| `math-history-geo-grade` | تاريخ وجغرافيا | 2 | 2 | **rename ID → `math-history-grade`; label → "التاريخ" (geography removed)** |
| `math-english-grade` | لغة إنجليزية | 2 | **3** | update |
| `math-sport-grade` | تربية بدنية | 1 | 1 | no change |
| `math-arabic-grade` | لغة عربية | 3 | — | **REMOVE** |
| `math-french-grade` | لغة فرنسية | 2 | — | **REMOVE** |
| `math-philo-grade` | فلسفة | 2 | — | **REMOVE** |
| `math-tamazight-grade` | لغة أمازيغية | 2 | — | **REMOVE** |
| *(absent)* | إعلام آلي | — | **3** | **ADD** `math-cs-grade: 3` |

**New total**: 8+6+3+3+2+2+2+1 = **27**

---

### 3.2 علوم تجريبية (`science`)

| Input ID | Subject | Old coeff | New coeff | Action |
|---|---|---|---|---|
| `science-science-grade` | علوم الطبيعة والحياة | 6 | 6 | no change |
| `science-math-grade` | رياضيات | 5 | 5 | no change |
| `science-physics-grade` | علوم فيزيائية | 5 | **4** | update |
| `science-arabic-grade` | لغة عربية | 3 | **2** | update (stays, coeff drops) |
| `science-tamazight-grade` | لغة أمازيغية | 2 | 2 | no change (stays) |
| `science-english-grade` | لغة إنجليزية | 2 | **3** | update |
| `science-history-geo-grade` | تاريخ وجغرافيا | 2 | 2 | **rename ID → `science-history-grade`; label → "التاريخ" (geography removed)** |
| `science-islamics-grade` | علوم إسلامية | 2 | 2 | no change |
| `science-sport-grade` | تربية بدنية | 1 | 1 | no change |
| `science-french-grade` | لغة فرنسية | 2 | — | **REMOVE** |
| `science-philo-grade` | فلسفة | 2 | — | **REMOVE** |

> ⚠️ Arabic and Tamazight are **NOT removed** from علوم تجريبية — they remain in 3rd year.

**New total**: 6+5+4+3+2+2+2+2+1 = **27**

---

### 3.3 هندسة (`tech`) — formerly تقني رياضي

| Input ID | Subject | Old coeff | New coeff | Action |
|---|---|---|---|---|
| `tech-tech-grade` | تكنولوجيا | 7 | 7 | no change |
| `tech-math-grade` | رياضيات | 6 | **5** | update |
| `tech-physics-grade` | علوم فيزيائية | 6 | **4** | update |
| `tech-islamics-grade` | علوم إسلامية | 2 | 2 | no change |
| `tech-history-geo-grade` | تاريخ وجغرافيا | 2 | 2 | **rename ID → `tech-history-grade`; label → "التاريخ" (geography removed)** |
| `tech-english-grade` | لغة إنجليزية | 2 | **3** | update |
| `tech-sport-grade` | تربية بدنية | 1 | 1 | no change |
| `tech-arabic-grade` | لغة عربية | 3 | — | **REMOVE** |
| `tech-french-grade` | لغة فرنسية | 2 | — | **REMOVE** |
| `tech-philo-grade` | فلسفة | 2 | — | **REMOVE** |
| `tech-tamazight-grade` | لغة أمازيغية | 2 | — | **REMOVE** |
| *(absent)* | إعلام آلي | — | **3** | **ADD** `tech-cs-grade: 3` |

**New total**: 7+5+4+3+3+2+2+1 = **27**

---

### 3.4 تسيير واقتصاد (`management`)

| Input ID | Subject | Old coeff | New coeff | Action |
|---|---|---|---|---|
| `management-accounting-grade` | تسيير محاسبي ومالي | 6 | 6 | no change |
| `management-economics-grade` | اقتصاد ومناجمنت | 5 | **4** | update |
| `management-math-grade` | رياضيات | 5 | **3** | update |
| `management-arabic-grade` | لغة عربية | 3 | **2** | update |
| `management-tamazight-grade` | لغة أمازيغية | 1 | **2** | update |
| `management-english-grade` | لغة إنجليزية | 2 | **3** | update |
| `management-law-grade` | قانون | 2 | 2 | no change |
| `management-history-geo-grade` | تاريخ وجغرافيا | 4 | **3** | update (label stays "تاريخ وجغرافيا") |
| `management-islamics-grade` | علوم إسلامية | 2 | 2 | no change |
| `management-sport-grade` | تربية بدنية | 1 | 1 | no change |
| `management-french-grade` | لغة فرنسية | 2 | — | **REMOVE** |
| `management-philo-grade` | فلسفة | 2 | — | **REMOVE** |

**New total**: 6+4+3+2+2+3+2+3+2+1 = **28** (+ 2 oral)

---

### 3.5 آداب وفلسفة (`literature`)

| Input ID | Subject | Old coeff | New coeff | Action |
|---|---|---|---|---|
| `literature-arabic-grade` | لغة عربية | 6 | **7** | update |
| `literature-philo-grade` | فلسفة | 6 | 6 | no change |
| `literature-history-geo-grade` | تاريخ وجغرافيا | 4 | 4 | no change (label stays "تاريخ وجغرافيا") |
| `literature-tamazight-grade` | لغة أمازيغية | 2 | **3** | update |
| `literature-english-grade` | لغة إنجليزية | 3 | 3 | no change |
| `literature-french-grade` | لغة فرنسية | 3 | **2** | update |
| `literature-islamics-grade` | علوم إسلامية | 2 | 2 | no change |
| `literature-sport-grade` | تربية بدنية | 1 | 1 | no change |
| `literature-math-grade` | رياضيات | 2 | — | **REMOVE** |

**New total**: 7+6+4+3+3+2+2+1 = **28** (+ 3 oral)

---

### 3.6 لغات أجنبية (`languages`)

| Input ID | Subject | Old coeff | New coeff | Action |
|---|---|---|---|---|
| `languages-lang3-grade` | اللغة الأجنبية (إسبانية/ألمانية/إيطالية) | 4 | **6** | update |
| `languages-english-grade` | لغة إنجليزية | 5 | **4** | update |
| `languages-french-grade` | لغة فرنسية | 5 | **4** | update |
| `languages-arabic-grade` | لغة عربية | 5 | **2** | update |
| `languages-tamazight-grade` | لغة أمازيغية | 2 | 2 | no change |
| `languages-history-geo-grade` | تاريخ وجغرافيا | 2 | 2 | no change (label stays "تاريخ وجغرافيا") |
| `languages-islamics-grade` | علوم إسلامية | 2 | 2 | no change |
| `languages-sport-grade` | تربية بدنية | 1 | 1 | no change |
| `languages-philo-grade` | فلسفة | 2 | — | **REMOVE** |
| `languages-math-grade` | رياضيات | 2 | — | **REMOVE** |

**New total**: 6+4+4+2+2+2+2+1 = **23** (+ 2 oral)

---

## 4. Geography Removal Summary

For 3 streams, the BAC exam subject changes from "تاريخ وجغرافيا" to **"تاريخ" only** (geography is no longer examined). The coefficient stays at 2. The input IDs must be renamed.

| Stream | Old ID | New ID | Label |
|---|---|---|---|
| رياضيات | `math-history-geo-grade` | `math-history-grade` | التاريخ |
| علوم تجريبية | `science-history-geo-grade` | `science-history-grade` | التاريخ |
| هندسة | `tech-history-geo-grade` | `tech-history-grade` | التاريخ |

Streams that **keep** full "تاريخ وجغرافيا" (no change to label or ID):

| Stream | ID | Coefficient |
|---|---|---|
| آداب وفلسفة | `literature-history-geo-grade` | 4 |
| لغات أجنبية | `languages-history-geo-grade` | 2 |
| فنون | `arts-history-geo-grade` | 2 |
| تسيير واقتصاد | `management-history-geo-grade` | 3 (was 4) |

---

## 5. Files That Need Changes

### 5.1 `components/calculator.js`
- Update the `coefficients` object for all 6 existing streams per section 3 above
- Add new `arts` stream object per section 2 above
- Update `getFieldName()`: `'tech'` → `'شعبة هندسة'`; add `'arts'` → `'شعبة فنون'`
- Update `selectField()`: add `arts` branch showing `artsSubjects` div

### 5.2 `tools/calculator.html`
- For each stream section: add/remove/rename subject input cards to match section 3
- Rename all `history-geo` input IDs to `history` for math/science/tech; update labels
- Add new `artsSubjects` section with all فنون inputs
- Add فنون stream selection card in the field picker UI
- Update stream card label: "تقني رياضي" → "هندسة"

### 5.3 `simulation.js`
- Rename all 4 tech sub-specialties: "تقني رياضي - ..." → "هندسة - ..."
- Update subject arrays for `math`, `science`, `tech_elec`, `tech_civil`, `tech_mech`, `tech_process`:
  - Remove فلسفة, فرنسية entries from math/tech streams
  - Remove عربية, أمازيغية from math/tech streams (NOT from science — see ⚠️ above)
  - Rename "تاريخ وجغرافيا" → "التاريخ" for math/science/tech
  - Add "الإعلام الآلي" to math and tech streams
  - Update coefficients to match section 3
- Add new arts stream entries

### 5.4 `simulation.html`
- Stream button: "تقني رياضي" → "هندسة"
- Add new فنون stream button

### 5.5 `components/shared.js`
- All `specialty` values containing "تقني رياضي" → "هندسة"
- Add search entries for the new فنون stream

### 5.6 `bac-topics.html` and `script.js`
- All displayed labels "تقني رياضي" → "هندسة" (~50 occurrences)
- In `_chData.tech`: update `label`, remove Arabic/French/philo from subjects, rename history-geo → history, add إعلام آلي
- In `_exc` subject groups: remove هندسة from Arabic/French/philo/histgeo groups; rename its label in math/physics/tech/islamics/english/sport groups
- Add `_chData.arts` and `_exc` entries for فنون

### 5.7 `bac-2026.html`
- Stream filter button: "تقني رياضي" → "هندسة"
- Add فنون filter button
- Meta/OG/JSON-LD: replace "تقني رياضي" with "هندسة", add "فنون"

### 5.8 `bac-2026/tech.html`, `tech/topics.html`, `tech/solutions.html`
- All title/heading/meta occurrences: "تقني رياضي" → "هندسة"

### 5.9 `resources/tech.html`, `resources/drives.html`, `resources/books.html`, `resources/resumes-exercises.html`
- All displayed labels: "تقني رياضي" → "هندسة"

### 5.10 `index.html`
- JSON-LD stream list: "تقني رياضي" → "هندسة", add "فنون"

---

## 6. New Pages Needed (فنون stream infrastructure)

These do not exist and must be created:

| Page | Purpose |
|---|---|
| `bac-2026/arts.html` | Hub for شعبة فنون 2026 |
| `bac-2026/arts/topics.html` | Topics listing |
| `bac-2026/arts/solutions.html` | Solutions listing |
| `resources/arts.html` | Resources hub |

---

## 7. Quick Reference — Subject Removed Per Stream

| Subject removed | رياضيات | علوم تجريبية | هندسة | تسيير | آداب | لغات |
|---|---|---|---|---|---|---|
| فلسفة | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| لغة فرنسية | ✓ | ✓ | ✓ | ✓ | — | — |
| لغة عربية | ✓ | — | ✓ | — | — | — |
| لغة أمازيغية | ✓ | — | ✓ | — | — | — |
| رياضيات | — | — | — | — | ✓ | ✓ |
| جغرافيا (label only) | ✓ | ✓ | ✓ | — | — | — |
