#!/usr/bin/env python3
"""
build_kb_completeness.py
Checks coverage of tawjihi/data/kb/specialities-kb.json against admissions-full.json.

Steps:
  1. Load admissions rows → distinct base filieres (strip "-- pour bacheliers XXX" suffixes)
  2. Load KB → collect all linkedFiliereKeys
  3. Also apply the FILIERE_FALLBACK keyword patterns from build_availability_map.cjs
  4. Report which filieres are NOT covered by any KB entry
  5. Print gap list

Usage: python scripts/build_kb_completeness.py
"""

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).parent.parent
KB_DIR = ROOT / "tawjihi" / "data" / "kb"


def norm(s):
    """De-accent + uppercase, same as JS."""
    s = unicodedata.normalize("NFKD", s or "")
    s = re.sub(r"[̀-ͯ]", "", s)
    return s.upper()


def base_filiere(f):
    """Strip '-- pour bacheliers XXX' suffix."""
    return re.sub(r"\s*--\s*pour bacheliers.*", "", f).strip()


# ---------------------------------------------------------------------------
# FILIERE_FALLBACK patterns  (ported from build_availability_map.cjs)
# Maps KB id -> list of regex patterns over NORMALISED filiere label
# ---------------------------------------------------------------------------
FILIERE_FALLBACK = {
    "allemand": [r"^LANGUE ALLEMANDE"],
    "anglais": [r"^LANGUE ANGLAISE(?!.*\+)"],
    "arabe": [r"^LANGUE ET LITTERATURE ARABES"],
    "francais": [r"^LANGUE FRANCAISE"],
    "espagnol": [r"^LANGUE ESPAGNOLE"],
    "italien": [r"^LANGUE ITALIENNE"],
    "russe": [r"^LANGUE RUSSE"],
    "chinois": [r"^LANGUE CHINOISE"],
    "turc": [r"^LANGUE TURQUE"],
    "tamazight": [r"^LANGUE ET CULTURE AMAZIGHES"],
    "geologie": [r"^GEOLOGIE"],
    "geographie": [r"^GEOGRAPHIE ET AMENAGEMENT"],
    "archeologie": [r"^SCIENCES HUMAINES ARCHEOLOGIE"],
    "arts": [r"^ARTS$"],
    "staps": [r"^SCIENCES ET TECHNIQUES DES ACTIVITES PHYSIQUES ET SPORTIVES"],
    "telecom": [r"^TELECOMMUNICATIONS"],
    "electro": [r"^ELECTROTECHNIQUE"],
    "auto": [r"^AUTOMATIQUE"],
    "hydro": [r"^HYDRAULIQUE"],
    "agro": [r"^SCIENCES AGRONOMIQUES"],
    "agronomie": [r"^SCIENCES AGRONOMIQUES"],
    "agroalimentaire": [r"^SCIENCES ALIMENTAIRES"],
    "petrochimie": [r"^INDUSTRIES PETROCHIMIQUES"],
    "hse": [r"^HYGIENE ET SECURITE INDUSTRIELLE"],
    "sociales": [r"^SCIENCES SOCIALES"],
    "eco": [r"^SCIENCES ECONOMIQUES(?!.*\+)"],
    "gestion": [r"^SCIENCES DE GESTION(?!.*\+)", r"^SCIENCES ECONOMIQUES, DE GESTION ET COMMERCIALES"],
    "commerce": [r"^SCIENCES COMMERCIALES", r"^SCIENCES ECONOMIQUES, DE GESTION ET COMMERCIALES"],
    "city-jobs": [r"^METIERS DE LA VILLE"],
    "cinema": [r"^CINEMA ET MEDIA NUMERIQUE"],
    "cinema-media": [r"^CINEMA ET MEDIA NUMERIQUE"],
    "env-sci": [r"^ECOLOGIE ET ENVIRONNEMENT"],
    "info-auto": [r"^INFORMATIQUE \+ AUTOMATIQUE", r"^AUTOMATIQUE \+ INFORMATIQUE"],
    "law-pol": [r"^DROIT \+ SCIENCES POLITIQUES"],
    "cs-eco": [r"^INFORMATIQUE \+ SCIENCES ECONOMIQUES"],
    "eng-pol": [r"^LANGUE ANGLAISE \+ SCIENCES POLITIQUES", r"^SCIENCES POLITIQUES \+ LANGUE ANGLAISE"],
    "law-fin": [r"^DROIT \+ SCIENCES FINANCIERES"],
    "history-data": [r"^HISTOIRE ET BIG DATA"],
    "sports-psych": [r"^ENTRAINEMENT SPORTIF \+ SCIENCES SOCIALES"],
    "childhood": [r"^EDUCATION PSYCHOMOTRICE EN PERIODE DE L ENFANCE"],
    "trading": [r"^TRADING ET LES MARCHES FINANCIERS"],
    "scenario": [r"^ECRITURE DE SCENARIO"],
    "music-perf": [r"^MUSICIEN INTERPRETE ET CREATEUR"],
    "comm-tourism": [r"^COMMUNICATION TOURISTIQUE ET PROMOTION TERRITORIALES"],
    "marketing-comm": [r"^COMMUNICATION MARKETING ET GESTION DE LA RELATION CLIENT"],
    "public-innov": [r"^ETUDES POLITIQUES ET INNOVATION PUBLIQUE"],
    "loisir": [r"^SOCIOLOGIE DE LOISIR ET DU VOYAGE"],
    "soc-leisure": [r"^SOCIOLOGIE DE LOISIR ET DU VOYAGE"],
    "3d-design": [r"^CONCEPTEUR 3D"],
    "aeroport": [r"^MANAGEMENT DES AEROPORTS ET DU TRANSIT"],
    "health-info": [r"^MANAGEMENT DES SYSTEMES D INFORMATIONS DE SANTE"],
    "health-comm": [r"^INFORMATION ET COMMUNICATION DE LA SANTE"],
    "health-soc": [r"^SANTE ET PROTECTION SOCIALE"],
    "digital-biz": [r"^COMMUNICATION DIGITALE ET MANAGEMENT"],
    "digital-prod": [r"PRODUCTION DE CONTENU NUMERIQUE"],
    "e-biz": [r"^GESTION DES OPERATIONS COMMERCIALES ELECTRONIQUES"],
    "fintech": [r"^NEGOCIATION ET TECHNOLOGIE FINANCIERE"],
    "theater": [r"^COMEDIEN PROFESSIONNEL ET AUTEUR DRAMATIQUE"],
    "eco-ir": [r"^ECONOMIE ET RELATIONS INTERNATIONALES"],
}

# Pre-compile
FILIERE_FALLBACK_COMPILED = {
    kid: [re.compile(p) for p in pats]
    for kid, pats in FILIERE_FALLBACK.items()
}


def filiere_covered_by_fallback(norm_label):
    """Return the KB id that covers this filiere via fallback, or None."""
    for kid, patterns in FILIERE_FALLBACK_COMPILED.items():
        for pat in patterns:
            if pat.search(norm_label):
                return kid
    return None


def main():
    # ---- Load data ----
    adm = json.loads((KB_DIR / "admissions-full.json").read_text(encoding="utf-8"))
    rows = adm["rows"]

    kb_data = json.loads((KB_DIR / "specialities-kb.json").read_text(encoding="utf-8"))
    specs = kb_data["specialities"]

    # ---- Distinct base filieres ----
    base_filieres = sorted(set(base_filiere(r["filiere"]) for r in rows))
    print(f"Distinct base filieres in admissions: {len(base_filieres)}")

    # ---- Build coverage from KB ----
    # 1. From linkedFiliereKeys: these are raw filiere labels (matching admission rows directly)
    covered_by_linked_key = set()
    for s in specs:
        for k in s.get("linkedFiliereKeys", []):
            # linkedFiliereKeys are exact filiere labels (with or without FB prefix)
            covered_by_linked_key.add(k)

    # Also build: which base labels are matched by linkedFiliereKeys
    # We need to check if any row's filiere matches a linkedFiliereKey
    # The linkedFiliereKeys in the KB are full filiere strings (e.g. "MATHEMATIQUES")
    # So we normalize them and check against base filieres
    linked_key_norms = {norm(k) for k in covered_by_linked_key}

    # ---- Find covered base filieres ----
    covered = set()
    uncovered = []
    coverage_detail = {}

    for bf in base_filieres:
        nbf = norm(bf)
        # Check 1: exact match with linkedFiliereKeys
        if nbf in linked_key_norms:
            covered.add(bf)
            coverage_detail[bf] = "linkedFiliereKeys"
            continue
        # Check 2: partial match - is bf a prefix of any linked key? (for FB entries etc.)
        matched_lk = any(lk.startswith(nbf) or nbf.startswith(lk) for lk in linked_key_norms)
        if matched_lk:
            covered.add(bf)
            coverage_detail[bf] = "linkedFiliereKeys_partial"
            continue
        # Check 3: fallback patterns
        fb_match = filiere_covered_by_fallback(nbf)
        if fb_match:
            covered.add(bf)
            coverage_detail[bf] = f"fallback:{fb_match}"
            continue

        # Check 4: direct keyword matching against KB names
        # Some FB entries (grandes écoles) might match KB entries by etab name
        uncovered.append(bf)

    print(f"\nCovered: {len(covered)}")
    print(f"Uncovered: {len(uncovered)}")
    print("\n=== UNCOVERED FILIERES ===")
    for i, f in enumerate(uncovered, 1):
        print(f"  {i:3d}. {f}")

    print("\n=== COVERAGE BREAKDOWN ===")
    method_counts = {}
    for bf, method in coverage_detail.items():
        method_counts[method] = method_counts.get(method, 0) + 1
    for m, c in sorted(method_counts.items()):
        print(f"  {m}: {c}")

    return uncovered, covered, base_filieres


if __name__ == "__main__":
    uncovered, covered, all_filieres = main()
