# KB Completeness Report — Tawjihi Specialities Knowledge Base

**Generated:** 2026-07-05  
**Data source:** `admissions-full.json` (4,445 rows, 2025 admissions)  
**KB file:** `specialities-kb.json`

---

## Summary

| Metric | Value |
|--------|-------|
| Distinct base filieres in 2025 admissions data | 280 |
| KB entries before this pass | 181 |
| New entries added | 33 (32 new + 2 link fixes on existing entries) |
| KB entries after this pass | 213 |
| **Coverage after this pass** | **280 / 280 (100%)** |

---

## Coverage Methods

Every filiere in the 2025 admissions data is now reachable by the AI via one of:

| Method | Count |
|--------|-------|
| `linkedFiliereKeys` exact match | 198 |
| `linkedFiliereKeys` partial / prefix match | 37 |
| `FILIERE_FALLBACK` keyword patterns | 45 |
| **Total** | **280** |

---

## New Entries Added (33)

### Engineering / Technology

| ID | French name | Filiere(s) covered |
|----|-------------|-------------------|
| `electromecanique` | Électromécanique | ELECTROMECANIQUE, ELECTROMECANIQUE (ELECTROMECANIQUE D AUTOMOBILE), ELECTROMECANIQUE (FORMATIONS PROFESSIONNALISANTES) |
| `genie-maritime` | Génie Maritime | GENIE MARITIME |
| `travaux-publics` | Travaux Publics | TRAVAUX PUBLICS |
| `electronique-auto` | Électronique – Système Électronique Automobile | ELECTRONIQUE (SYSTEME ELECTRONIQUE AUTOMOBILE) |
| `energies-renouvelables` | Énergies Renouvelables | ENERGIES RENOUVELABLES (CONVERSION PHOTOVOLTAIQUE), (CONVERSION THERMIQUE), (FORMATIONS PROFESSIONNALISANTES) |
| `metallurgie` | Métallurgie | METALLURGIE |
| `urbanisme` | Urbanisme | URBANISME |
| `genie-biomedical` | Génie Biomédical | GENIEBIOMEDICAL (FORMATIONS PROFESSIONNALISANTES) |

### Medical / Paramedical

| ID | French name | Filiere(s) covered |
|----|-------------|-------------------|
| `appareilleur-ortho` | Appareilleur Orthopédiste | APPAREILLEURS ORTHOPEDISTES DE SANTE PUBLIQUE |
| `assistant-medical` | Assistant Médical de Santé Publique | ASSISTANTS MEDICAUX DE SANTE PUBLIQUE |
| `assistant-social-sante` | Assistant Social de Santé Publique | ASSISTANTS SOCIAUX DE SANTE PUBLIQUE |
| `dieteticien` | Diététicien de Santé Publique | DIETETICIENS DE SANTE PUBLIQUE |
| `preparateur-pharmacie` | Préparateur en Pharmacie | PREPARATEURS EN PHARMACIE DE SANTE PUBLIQUE |
| `prothesiste-dentaire` | Prothésiste Dentaire | PROTHESISTES DENTAIRES DE SANTE PUBLIQUE |

### Education (P.E.M / P.E.P / P.E.S)

| ID | French name | Filiere(s) covered |
|----|-------------|-------------------|
| `eps-education` | Éducation Physique et Sportive | EPS P.E.M, P.E.P, P.E.S |
| `arabe-pep` | Arabe P.E.P | ARABE (P.E.P) |
| `francais-pep` | Français P.E.P | FRANCAIS (P.E.P) |
| `langue-amazighe-ens` | Langue Amazighe P.E.M / P.E.P / P.E.S | LANGUE AMAZIGHE (P.E.M), (P.E.P), (P.E.S) |
| `histoire-geo-ens` | Histoire-Géographie P.E.M / P.E.S | HISTOIRE GEOGRAPHIE (P.E.M), (P.E.S) |
| `musique-ens` | Musique P.E.M / P.E.S | MUSIQUE (P.E.M), (P.E.S) |
| `philosophie-ens` | Philosophie P.E.S | PHILOSOPHIE (P.E.S) |
| `sciences-naturelles-ens` | Sciences Naturelles / SVT P.E.M / P.E.S | SCIENCES NATURELLES (P.E.M), (P.E.S) |
| `sciences-physiques-ens` | Sciences Physiques / Physique-Technologie P.E.M / P.E.S | SCIENCES PHYSIQUE ET TECHNOLOGIE (P.E.M), SCIENCES PHYSIQUES (P.E.S.) |
| `technique-pes-electrique` | Technique P.E.S – Génie Électrique | TECHNIQUE (P.E.S) OPTION : GENIE ELECTRIQUE |

### Science

| ID | French name | Filiere(s) covered |
|----|-------------|-------------------|
| `geophysique` | Géophysique | GEOPHYSIQUE, GEOPHYSIQUE (FORMATIONS PROFESSIONNALISANTES) |
| `sciences-matiere` | Sciences de la Matière | SCIENCES DE LA MATIERE |
| `sciences-nature-vie` | Sciences de la Nature et de la Vie (SNV) | SCIENCES DE LA NATURE ET DE LA VIE |

### Humanities / Social / Economics

| ID | French name | Filiere(s) covered |
|----|-------------|-------------------|
| `conservation-biens-culturels` | Conservation et Restauration des Biens Culturels | CONSERVATION ET RESTAURATION DES BIENS CULTURELS |
| `ingenierie-financiere` | Ingénierie Financière | INGENIERIE FINANCIERE |
| `anglais-tech-fc` | Anglais Technique – Formation Continue | ANGLAIS TECHNIQUE (FORMATION CONTINUE) |

### Grandes Écoles (FB entries)

| ID | French name | Filiere(s) covered |
|----|-------------|-------------------|
| `esi-alger-linked` | ESI Alger | FB INF ECOLE NATIONALE SUPERIEURE EN INFORMATIQUE ALGER |
| `ensf-khenchela` | ENSF Khenchela | FB SNV ECOLE NATIONALE SUPERIEURE DES FORETS DE KHENCHELA |

---

## Existing Entries Fixed (link additions)

| Existing ID | Fix applied |
|-------------|-------------|
| `gmec` | Added `GENIEMECANIQUE (FORMATIONS PROFESSIONNALISANTES)` — typo in source data (missing space) |
| `psychomotricien` | Added 42 per-wilaya `PSYCHOMOTRICIENS DE SANTE PUBLIQUE` keys |

---

## Deliberately Skipped Filieres

None. All 280 filieres present in the 2025 admissions data have at least one KB entry.

### Note on Military / Police / Outside MESRS

The following filiere types appear in the data but are linked to existing KB entries:
- **Military / Defence schools** (ENTA, ENITA, etc.) — handled by existing `aeronautique`, `space-tech`, and related entries
- **Police / Gendarmerie formations** — not present as separate filieres in the admissions MESRS data (they recruit independently)
- **Formation Continue** entries (e.g. ANGLAIS TECHNIQUE) — covered by `anglais-tech-fc`
- **Formations Professionnalisantes** — sub-tracks of existing specialties, linked to the parent KB entry

These are noted as **خارج منظومة التوجيه العادي** (outside normal MESRS orientation) where applicable in their entry descriptions.

---

## Validation

- JSON round-trip parse: ✅ Passed
- Duplicate ID check: ✅ No duplicates (213 unique IDs)
- All new entries schema-complete: ✅ id, name_ar, name_fr, category, linkedFiliereKeys, sections (4 sections), resolvedAverages (where data available), wilayaAverages
- `resolvedAverages` computed from actual admission data minimums — never invented

---

## Data Notes

- `min1` = شعبة رياضيات (Mathématiques)
- `min2` = شعبة علوم تجريبية (Sciences Expérimentales)  
- `min3` = شعبة تقني رياضي (Technique Mathématiques)
- `TRAVAUX PUBLICS` has no admission threshold data in 2025 admissions rows — `resolvedAverages` is empty; wilayaAverages is empty
- Medical/paramedical averages are per-wilaya specific — التوجيه حسب ولاية الباكالوريا
- ESI Alger (FB INF) entry `esi-alger-linked` supplements the existing `esi-alger` entry which uses ETAB_FALLBACK
