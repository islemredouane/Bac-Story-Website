// scripts/reconcile.js
// ESM, Node 22+
// Usage: node scripts/reconcile.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function normalizeArabic(s) {
  if (!s) return "";
  return s
    .replace(/[أإآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .trim();
}
function stripBOM(s) { return s.replace(/^\uFEFF/, ""); }
function readJSON(p) { return JSON.parse(stripBOM(fs.readFileSync(p, "utf8"))); }

function parseCatalog(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const match = src.match(/const TW_CATALOG\s*=\s*(\[[\s\S]*?\]);\s*\/\*/);
  if (!match) throw new Error("Cannot find TW_CATALOG in catalog.js");
  const fn = new Function("return " + match[1] + ";");
  return fn();
}

console.log("Loading data files...");
let catalog;
try {
  catalog = parseCatalog(path.join(ROOT, "tawjihi", "catalog.js"));
  console.log("  catalog.js: " + catalog.length + " entries");
} catch(e) {
  console.error("Failed to parse catalog.js:", e.message);
  process.exit(1);
}

const minimaData = readJSON(path.join(ROOT, "tawjihi", "data", "averages-2025", "minima-phase1-2025.json"));
const minimaEntries = minimaData.entries;
console.log("  minima-phase1-2025.json: " + minimaEntries.length + " rows");

const programsData = readJSON(path.join(ROOT, "tawjihi", "data", "guide", "programs.json"));
const programs = programsData.programs || programsData;
console.log("  programs.json: " + programs.length + " entries");

const conflicts = JSON.parse(stripBOM(fs.readFileSync(path.join(ROOT, "tawjihi", "data", "_staging", "conflicts.json"), "utf8")));
console.log("  conflicts.json: " + conflicts.length + " entries");

const ABBR_TO_MINIMA_KEYWORDS = {
  "ESI":      ["ecole nationale superieure en informatique"],
  "ENSIA":    ["ecole nationale superieure en intelligence artificielle", "ensia"],
  "ESI-SBA":  ["ecole superieure en informatique de sidi bel abbes", "esi sba"],
  "ESTIN":    ["ecole superieure en sciences et technologies de l informatique et du numerique bejaia", "estin bejaia"],
  "USTHB":    ["universite des sciences et de la technologie houari boumediene", "usthb"],
  "EPAU":     ["ecole polytechnique d architecture et d urbanisme", "epau"],
  "ENSCS":    ["ecole nationale superieure de cybersecurite", "enscs"],
  "ENSTTIC":  ["ecole nationale superieure des technologies de l information", "ensttic"],
  "NHSM":     ["ecole nationale superieure de mathematiques", "nhsm"],
  "ENSTP":    ["ecole nationale superieure des travaux publics", "enstp"],
  "ENSH":     ["ecole nationale superieure de l hydraulique", "ensh"],
  "IGEE":     ["institut de genie electrique et electronique", "igee"],
  "ESSA":     ["ecole nationale superieure de l aeronautique", "essa"],
  "ENSSN":    ["ecole nationale superieure des nanosciences", "enssn"],
  "ENSAS":    ["ecole nationale superieure des systemes autonomes", "ensas"],
  "EHEC":     ["ecole des hautes etudes commerciales", "ehec"],
  "ENSSEA":   ["ecole nationale superieure de statistique et d economie appliquee", "enssea"],
  "ESB":      ["ecole superieure des banques", "esb"],
  "ESM":      ["ecole nationale superieure de management", "esm"],
  "ENSA":     ["ecole nationale superieure agronomique", "ensa harrach"],
  "ENSB":     ["ecole nationale superieure de biotechnologie", "ensb"],
  "ENSSMAL":  ["ecole nationale superieure des sciences de la mer", "enssmal"],
  "ENS-BZ":   ["ecole normale superieure de bouzareah", "ens bouzareah"],
  "ENS-CST":  ["ecole normale superieure de constantine", "ens constantine"],
  "ENS-OR":   ["ecole normale superieure d oran", "ens oran"],
  "ENSTA":    ["ecole nationale superieure des technologies avancees", "ensta"],
  "ENSEE":    ["ecole nationale superieure de genie electrique", "ensee"],
  "HNSRE":    ["ecole nationale superieure des energies renouvelables", "hnsre"],
  "ESSAIA":   ["ecole superieure des sciences de l alimentation et des industries agroalimentaires", "essaia"],
  "ESSB":     ["ecole superieure des sciences biologiques", "essb"],
  "ESGEN":    ["ecole superieure de gestion et d economie numerique", "esgen"],
  "ESSG":     ["ecole superieure des sciences de gestion", "essg"],
  "ESCF":     ["ecole superieure de comptabilite et de finances", "escf"],
  "ESE":      ["ecole superieure d economie", "ese oran"],
  "ESC":      ["ecole superieure de commerce", "esc"],
  "UCA1":     ["universite freres mentouri constantine 1"],
  "UCA2":     ["universite abdelhamid mehri constantine 2"],
  "UCA3":     ["universite salah boubnider constantine 3"],
  "UO1":      ["universite ahmed ben bella oran 1"],
  "UO2":      ["universite mohamed ben ahmed oran 2"],
  "UA1":      ["universite alger 1 benyoucef benkhedda"],
  "UA2":      ["universite alger 2 abou el kacem saadallah"],
  "UA3":      ["universite alger 3"],
  "USTO":     ["universite des sciences et de la technologie d oran"],
  "UFAS":     ["universite ferhat abbas setif"],
  "UFAS1":    ["universite ferhat abbas setif 1"],
  "UMBB":     ["universite m hamed bougara boumerdes"],
  "UABM":     ["universite abou bekr belkaid tlemcen"],
  "UBMA":     ["universite badji mokhtar annaba"],
  "UBT":      ["universite el hadj lakhdar batna"],
  "UB1":      ["universite saad dahlab blida 1"],
  "UBAT":     ["universite batna 2"],
  "UABB":     ["universite abou bekr belkaid tlemcen"],
  "UQK":      ["universite kasdi merbah ouargla"],
  "IFCS":     ["institut de formation des personnels de la sante"],
};

function findMinimaForAbbr(abbr) {
  const keywords = ABBR_TO_MINIMA_KEYWORDS[abbr] || [];
  if (keywords.length === 0) return [];
  const matches = [];
  for (const row of minimaEntries) {
    const combined = ((row.name_fr || "") + " " + (row.institution_fr || "")).toLowerCase();
    for (const kw of keywords) {
      if (combined.includes(kw.toLowerCase())) {
        matches.push({ row, confidence: "high", via: kw });
        break;
      }
    }
  }
  return matches;
}

function shouldSplit(entry) {
  if (!entry.unis || entry.unis.length <= 1) return false;
  const avgs = entry.unis.map(u => u.avg).filter(a => a != null && typeof a === "number");
  if (avgs.length <= 1) return false;
  const range = Math.max(...avgs) - Math.min(...avgs);
  return range > 0.01;
}

const univAbbrPrefixes = ["USTHB","UCA","UO","UA","UFAS","UMBB","UABM","UBMA","UBT","UB","UBAT","UQK","UABB","USTO"];
function isUniversityAbbr(abbr) {
  return univAbbrPrefixes.some(p => (abbr || "").toUpperCase().startsWith(p));
}

function generateSplitEntries(entry) {
  return entry.unis.map(uni => {
    const abbrSlug = (uni.abbr || "uni").toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const newId = entry.id + "-" + abbrSlug;
    const myHistory = (entry.avgHistory || []).filter(h => {
      const uniLabel = (h.uni || "").toLowerCase();
      const abbrLower = (uni.abbr || "").toLowerCase();
      const nameLower = (uni.name || "").substring(0, 12).toLowerCase();
      const locLower = (uni.location || "").substring(0, 6).toLowerCase();
      return uniLabel.includes(abbrLower) || uniLabel.includes(nameLower) || (locLower && uniLabel.includes(locLower));
    });
    const historyToUse = myHistory.length > 0 ? myHistory : [{ uni: uni.name, y2025: uni.avg }];
    const newLmd = isUniversityAbbr(uni.abbr) ? true : entry.lmd;
    let newDegree = entry.degree;
    if (isUniversityAbbr(uni.abbr) && entry.lmd === false) newDegree = "?????? ?? ?????";
    let newName = uni.name;
    if (uni.location && !newName.includes(uni.location.split("�")[0].trim())) {
      newName = uni.name + " � " + uni.location;
    }
    return {
      ...entry,
      id: newId,
      name: newName,
      avg: uni.avg,
      minAvg: uni.avg,
      lmd: newLmd,
      degree: newDegree,
      location: uni.location || entry.location,
      avgHistory: historyToUse,
      unis: [uni],
      _splitFrom: entry.id,
      _splitUni: uni.abbr,
    };
  });
}

function getOfficialAvgForEntry(entry) {
  const uni = entry.unis && entry.unis[0];
  if (!uni) return null;
  const matches = findMinimaForAbbr(uni.abbr);
  if (matches.length === 0) return null;
  const min1Values = matches.map(m => m.row.min1).filter(v => typeof v === "number" && v >= 8 && v <= 20);
  if (min1Values.length === 0) return null;
  return Math.min(...min1Values);
}

console.log("\nReconciling...\n");

const codeMapping = [];
const reconciledEntries = [];
const rpt = { splits: [], avgChanges: [], noMatch: [], kept: [], errors: [] };

for (const entry of catalog) {
  const entriesToProcess = shouldSplit(entry) ? generateSplitEntries(entry) : [entry];
  
  if (shouldSplit(entry)) {
    rpt.splits.push({ originalId: entry.id, originalName: entry.name, newIds: entriesToProcess.map(e => e.id) });
    console.log("  [SPLIT] " + entry.id + " ? " + entriesToProcess.map(e => e.id).join(", "));
  }
  
  for (const e of entriesToProcess) {
    const uni = e.unis && e.unis[0];
    const uniAbbr = (uni && uni.abbr) || "unknown";
    const minimaMatches = findMinimaForAbbr(uniAbbr);
    
    codeMapping.push({
      catalogId: e.id,
      parentId: e._splitFrom || null,
      uniAbbr,
      matchCount: minimaMatches.length,
      minimaRows: minimaMatches.slice(0, 3).map(m => ({
        code: m.row.code,
        name_fr: m.row.name_fr,
        institution_fr: m.row.institution_fr,
        min1: m.row.min1,
        min2: m.row.min2,
        min3: m.row.min3,
        confidence: m.confidence,
      })),
    });
    
    const officialAvg = getOfficialAvgForEntry(e);
    const updated = { ...e };
    delete updated._splitFrom;
    delete updated._splitUni;
    
    if (officialAvg !== null && Math.abs((e.avg || 0) - officialAvg) > 0.05) {
      rpt.avgChanges.push({ id: e.id, old: e.avg, new: officialAvg, source: "minima-phase1-2025.json" });
      updated.avg = officialAvg;
      updated.minAvg = officialAvg;
      if (updated.avgHistory && updated.avgHistory.length > 0) {
        updated.avgHistory[updated.avgHistory.length - 1].y2025 = officialAvg;
      }
      if (updated.unis && updated.unis[0]) updated.unis[0].avg = officialAvg;
    } else if (officialAvg === null && e.avg !== null && e.avg !== undefined) {
      rpt.noMatch.push({ id: e.id, uniAbbr, currentAvg: e.avg });
    } else if (officialAvg !== null) {
      rpt.kept.push({ id: e.id, avg: e.avg });
    }
    
    reconciledEntries.push(updated);
  }
}

// Validate
const ids = reconciledEntries.map(e => e.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length > 0) { console.warn("  [WARN] Duplicate IDs: " + dupes.join(", ")); rpt.errors.push({ type: "duplicate_ids", ids: dupes }); }
const invalidAvgs = reconciledEntries.filter(e => e.avg != null && (e.avg < 8 || e.avg > 20));
if (invalidAvgs.length > 0) { console.warn("  [WARN] Avgs out of range: " + invalidAvgs.map(e => e.id+":"+e.avg).join(", ")); rpt.errors.push({ type: "avg_out_of_range" }); }

console.log("\n  Original: " + catalog.length + " ? Reconciled: " + reconciledEntries.length);
console.log("  Splits: " + rpt.splits.length);
console.log("  Avg changes: " + rpt.avgChanges.length);
console.log("  No match: " + rpt.noMatch.length);
console.log("  Dupes: " + dupes.length);

// Write code-mapping
fs.writeFileSync(path.join(ROOT, "tawjihi", "data", "_staging", "code-mapping.json"), JSON.stringify(codeMapping, null, 2), "utf8");
console.log("\nWrote code-mapping.json");

// Write reconciled catalog
function serializeEntry(e) {
  const lines = ["  {"];
  for (const [k, v] of Object.entries(e)) {
    if (v === undefined) continue;
    const val = JSON.stringify(v);
    lines.push("    " + k + ": " + val + ",");
  }
  lines.push("  }");
  return lines.join("\n");
}
const catContent = `/* ============================================================
   TAWJIHI � Shared specialty catalog (single source of truth)
   RECONCILED: ${new Date().toISOString().split("T")[0]}
   Entries: ${reconciledEntries.length} (was ${catalog.length})
   ============================================================ */
const TW_CATALOG = [
` + reconciledEntries.map(serializeEntry).join(",\n") + `
];

/* helpers */
const twById    = id  => TW_CATALOG.find(s => s.id === id);
const twByCat   = cat => TW_CATALOG.filter(s => cat === "all" || s.cat === cat);
`;
fs.writeFileSync(path.join(ROOT, "tawjihi", "data", "_staging", "catalog-reconciled.js"), catContent, "utf8");
console.log("Wrote catalog-reconciled.js");

// Write report
const reportMd = `# Reconciliation Report � TASK-1
Generated: ${new Date().toISOString()}
Official source: minima-phase1-2025.json (${minimaEntries.length} rows)

## Summary
| Metric | Count |
|--------|-------|
| Original entries | ${catalog.length} |
| Reconciled entries | ${reconciledEntries.length} |
| Entries split | ${rpt.splits.length} |
| Avg values updated | ${rpt.avgChanges.length} |
| No official match | ${rpt.noMatch.length} |
| Duplicates | ${dupes.length} |
| Errors | ${rpt.errors.length} |

## Average Convention
Each split institution gets its own card with its own official min1 from minima-phase1-2025.json (priority-1 minimum). If multiple fili�re rows match, the minimum is used.

---
## Entries Split (${rpt.splits.length})

${rpt.splits.map(s => "### " + s.originalId + "\n- Original: " + s.originalName + "\n- Split into: " + s.newIds.map(i => "`"+i+"`").join(", ")).join("\n\n")}

---
## Average Changes (${rpt.avgChanges.length})

| Entry ID | Old avg | New avg |
|----------|---------|---------|
${rpt.avgChanges.map(c => "| \`"+c.id+"\` | "+(c.old??'null')+" | "+c.new+" |").join("\n")}

---
## No Official Match (${rpt.noMatch.length})
Averages kept as-is (unverified � need manual review):

${rpt.noMatch.map(n => "- \`"+n.id+"\` abbr="+n.uniAbbr+", avg="+n.currentAvg).join("\n")}

---
## Validation Errors
${rpt.errors.length === 0 ? "None." : rpt.errors.map(e => JSON.stringify(e)).join("\n")}

---
## Next Steps
1. Review tawjihi/data/_staging/catalog-reconciled.js
2. If OK: copy to tawjihi/catalog.js
3. Fix broken id refs in eligibility.js, simulator.js, etc.
4. Re-run: node scripts/embed-kb.js
5. Commit
`;
fs.writeFileSync(path.join(ROOT, "tawjihi", "data", "_staging", "_RECONCILIATION-REPORT.md"), reportMd, "utf8");
console.log("Wrote _RECONCILIATION-REPORT.md");
console.log("\n=== Done ===");
