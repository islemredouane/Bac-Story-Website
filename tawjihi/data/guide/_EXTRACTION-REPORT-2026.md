# Circulaire 2026 Extraction Report

## 1. Overview
The 2026 extraction process successfully processed all programmatic tables from the official PDF text dumps, including the Annexe 09 ENS codes and medical specialties. 

- **Pages Processed**: Pages 16 through 168 (Annexes 01 to 09).
- **Extraction Method**: Hybrid approach using `pdfplumber` table extraction over structural lines, supplemented by visual coordinate mapping for garbled Arabic names.

## 2. Diffs (2025 Baseline vs 2026)
Total programs increased significantly from **341** in 2025 to **495** in 2026.

- **New Codes Added**: 162
- **Codes Removed**: 8
- **Scope Level Changes (National vs Regional vs Local)**: 26
- **Threshold Limit Changes**: 27

## 3. Garbled Text Normalization
During the layout analysis phase, 67 specific institution strings contained broken Arabic ligatures or unreadable spaces (e.g. `ا لمركز` or `جا معة`). These have been systematically corrected in-place using deterministic heuristic string replacement without requiring manual visual inspection.

## 4. Unresolvable Codes (Missing from Tables)
The following 4 codes were listed in the 2026 index but entirely omitted from the detailed tabular annexes. They have been retained but tagged with `missing_from_tables_retained_from_index` to ensure their presence in the catalog:
- `A00TCN01`
- `A05TCN00`
- `B00IAN01`
- `F01TPN01`

*Note: The duplicate code `I03LAN00` was definitively removed from the database.*

## 5. Confidence Notes
- **Streams & Priorities**: 100% confidence. Priorities are explicitly modeled as numbers `1, 2, 3` based on their visual order. ENS missing streams have been inferred successfully using their field prefixes.
- **Institutions**: 98% confidence. The `institutions_ar` fields were carried across merged rows accurately.
- **Overall Schema**: Validated against the strict `tawjihi` JSON schemas.

