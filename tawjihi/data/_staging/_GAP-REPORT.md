# Catalog Gap Report — university-old.html vs Tawjihi app data

Generated: 2026-07-10 · Analyst: Catalog Gap Analyst (data team)
Source: `Bac Story website-last version/university-old.html` (~1.89 MB)
Diffed against: `tawjihi/catalog.js` (84 entries), `tawjihi/data/kb/specialities-kb.json` (220 entries), `tawjihi/content/` (83 files)

## Headline numbers

| Metric | Count |
|---|---|
| Speciality/school entries found in HTML | **205** (202 grid cards + 3 orphan detail sections) |
| Already in catalog.js | **81** |
| Missing from catalog.js → staged | **124** → **123** after in-file dedup |
| Conflict records (entries in both, data differs) | **81** (44 with average conflicts, 15 with category conflicts) |
| Covered by AI knowledge base (KB) | 182 / 205 |
| In NO existing dataset ("missing-everywhere") | **23** |

> Note: task briefing said catalog.js has ~121 entries; the file in this worktree contains **84** `id:` entries (verified two ways). The diff was made against the actual file.

## Match-status breakdown of the 123 staged entries

| matchStatus | Count | Meaning |
|---|---|---|
| `in-kb-not-catalog` | 99 | AI already knows them; app catalog/simulator does not show them |
| `missing-everywhere` | 23 | Brand new — not in catalog, KB, or content |
| `in-kb-and-content-not-catalog` | 1 | `enpei` — has KB + content file but no catalog entry |

## Per-category breakdown of staged entries

| Category | Staged | Notes |
|---|---|---|
| business | 20 | ENA, IEDF, ESSS, ESAA, École des Impôts (ESI-Kolea), ENST tourisme, trading, fintech, e-biz… |
| double | 20 | Big wave of dual-degree programs (حقوق+إعلام آلي, اقتصاد+علاقات دولية, …) |
| humanities | 18 | 9 language specialities (EN/FR/ES/DE/IT/RU/TR/ZH + Tamazight), philosophy, archaeology… |
| medical | 18 | Public-health paramedical batch (Appareilleur, Anesthésie-Réanimation, Diététicien…) + frontier (genetics, precision medicine) |
| **military** | **11** | **NEW CATEGORY** — ENPEI, EMIA Cherchell, ESA aviation, ENSMar, ESDAT, gendarmerie, garde républicaine, transmissions, matériel, intendance, santé militaire |
| **arts** | **10** | **NEW CATEGORY** — beaux-arts, cinéma, ENSCRBC/ENSRPC, théâtre, musique, scénario, 3D/VFX |
| engineering | 9 | architecture (université), smart cities, HSE, hydraulique, pétrochimie, automatique, électrotechnique, télécoms, métiers de la ville |
| science | 9 | INATAA, géologie, agronomie, agroalimentaire, sciences env., génomique… |
| law | 6 | ESM justice, IDRI, ESSP, pénal, criminologie, forensique |
| education | 2 | STAPS, éducation psychomotrice petite enfance |

**New categories `military` and `arts` do not exist in catalog.js** (existing cats: business, double, education, engineering, humanities, law, medical, science). Integration must add `--cat-military` / `--cat-arts` CSS variables and category filters. Staged entries carry `catIsNew: true`.

## The 23 "missing-everywhere" entries (not even the AI knows them)

All 11 military schools; INATAA; philosophy; 3 law specialities (pénal, criminologie, forensique); 5 frontier specialities (circular-economy, molecular-engineering, genomic-data, CSR, proteins-seeds); 3 paramedical (public-health-hygiene, adjoint-medical, assistant-social).

## Conflicts (see `conflicts.json`)

- **44 average conflicts** (`severity: review`): HTML carries newer/higher 2025 thresholds than catalog `avg` (e.g. `ensia` 19.37 vs 18.59, `ensttic` 18.41 vs 16.69, `igee` 16.85 vs 14.0). Raw HTML text is attached per record — some HTML numbers are per-stream or per-wilaya maxima, so review before overwriting.
- **15 category conflicts** (`severity: review`): e.g. HTML files ST/hydrocarbures/optique under `science`, catalog says `engineering`; med-bio/med-info are `double` in HTML, `medical` in catalog.
- **81 name records** (`severity: info`): catalog uses short display names ("طب") vs HTML long card names ("تخصص الطب – MÉDECINE"). Informational, not errors.
- 4 KB name-spelling divergences (info).

## Catalog entries with NO card in the HTML (reverse gap)

`education` (علوم التربية), `genie-elec`, `psych`, `genie-meca` — presumably removed/renamed on the legacy page or catalog-only additions. No action needed for staging.

## Methodology

1. Parsed with BeautifulSoup (html.parser). Grid cards: `div.spec-card` → `data-category`, `data-name`, card name, image, `showSection('ID')` target. Detail pages: `div.resource-content[id]` → title, intro key/value list (location, duration, degree, language, opening year, weighting formula), all `.detail-card` heading+body blocks, telegram link, gallery.
2. **Orphan sections**: 3 speciality sections have no grid card (`ENSRPC`, `LAW-FIN`, `SOCIALES`) — included as pseudo-cards (`sourceData.orphanSection: true`). 4 utility sections excluded (`averages-of-acceptance`, `ministry-guide`, `university-section`, `university-system`).
3. **Normalization key**: NFKD + strip diacritics/tatweel, أ/إ/آ/ٱ→ا, ة→ه, ى→ي, ؤ→و, ئ→ي, punctuation/dash variants→space, lowercase.
4. **Matching cascade**: manual alias table → section-id == catalog id → KB id == catalog id → normalized-name equality → fuzzy (SequenceMatcher ≥ 0.72, then hand-reviewed). KB matching via `dataName` (KB was generated from a sibling of this file, so 179/202 cards matched exactly).
5. **Alias table** (hand-verified): `esi-alger→esi, epau→archi, medcine→med, medcine-dentaire→dent, pharmacie→pharm, pharmacie-industrielle→pharm-ind, vetrinaire→vet, informatique→info, biologie→bio, gc→genie-civil, marine→marine-eng, ensa→ensa-agro, ensc→esc, ensm→esm, essbo→essb`. Fuzzy false-positives explicitly blocked (military schools were fuzzy-matching commerce/economics schools, e.g. المدرسة العليا للإشارة vs المدرسة العليا للتجارة at 0.93).
6. **Averages**: parsed from acceptance detail-cards in 4 shapes — per-stream (`شعبة رياضيات : 17,45`, incl. source typo `تجرببية`), per-wilaya/uni labels, thresholds (`عتبة القبول 2025: 18.21`), ranges (`بين 14.50 و 15.80`). Staged `avg` = max parsed number, `minAvg` = min — approximations; full parse in `sourceData.acceptanceParsed`, raw text in `sourceData.acceptanceRawText`.

## Edge cases & caveats

- HTML has 214 `resource-content` blocks but only 208 unique ids (duplicate id blocks — first occurrence used; the first ESTIN block was itself duplicated in source).
- **Dropped duplicate**: orphan section `SOCIALES` ≡ card `SS` (identical name تخصص العلوم الاجتماعية) — kept `ss`.
- **Near-duplicates kept (integration should review)**: `ensrpc` vs `enscrbc` (likely the same Tipaza conservation school under old/new names — both exist separately in KB too); `agro` (العلوم الفلاحية) vs `agronomie` (العلوم الزراعية) — both in HTML and KB as separate entries.
- Military schools carry admission info in prose (multi-stage selection, physical tests) rather than clean thresholds — `avg` left null for most.
- 17 school-type entries have full intro metadata (location/duration/degree); university-speciality cards mostly don't carry it on the legacy page.
- `careers` staged as `{icon: null, label}` — icons intentionally left for the integration agent (catalog uses FontAwesome names).
- Suggested `id`s reuse KB ids where matched (99+1 entries) so KB/content/catalog stay linkable; otherwise slugified section id. No collisions with existing catalog ids.

## Validation performed

- Both JSONs re-parsed after write: OK.
- 123 staged entries: unique `id`s, unique normalized `name_ar`, every entry has `name_ar` + `category`.
- All 84 catalog ids accounted for: 80 matched by cards + 4 reverse-gap.

## Files

- `tawjihi/data/_staging/new-specialities.json` — 123 entries (~2.1 MB, full `sourceData` embedded)
- `tawjihi/data/_staging/conflicts.json` — 81 records with per-field `severity`
- `tawjihi/data/_staging/_GAP-REPORT.md` — this file
