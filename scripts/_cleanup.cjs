const fs = require("fs");
const path = require("path");

const filePath = "tawjihi/data/_staging/catalog-reconciled.js";
let content = fs.readFileSync(filePath, "utf8");

// Extract and evaluate the catalog
const match = content.match(/const TW_CATALOG\s*=\s*(\[[\s\S]*?\]);/);
const fn = new Function("return " + match[1] + ";");
const entries = fn();

console.log("Before cleanup:", entries.length, "entries");

// ID fixes
const idFixes = {
  "esi-esi":     "esi-alger",         // Remove double prefix
  "esi-esi-sba": "esi-sba-ecole",     // Distinguish from standalone esi-sba entry
  "med-":        "med-national",       // Fix blank suffix from وطني abbr
  "pharm-":      "pharm-national",
  "dent-":       "dent-national",
  "ens-ens-bz":  "ens-bouzareah",
  "ens-ens-cst": "ens-constantine",
  "ens-ens-or":  "ens-oran",
};

// Check: esi-sba already exists as standalone → esi-sba-ecole is the split version from esi parent
// This means there would be conflict if esi-sba exists as standalone AND esi-sba-ecole from split
// Let's check for any conflict
const ids = entries.map(e => e.id);
console.log("Standalone esi-sba exists:", ids.includes("esi-sba"));

// Apply fixes
let fixCount = 0;
for (const entry of entries) {
  if (idFixes[entry.id]) {
    console.log("  Fix ID:", entry.id, "->", idFixes[entry.id]);
    entry.id = idFixes[entry.id];
    fixCount++;
  }
}

// After fixes, check for dupes
const newIds = entries.map(e => e.id);
const dupes = newIds.filter((id, i) => newIds.indexOf(id) !== i);
if (dupes.length > 0) {
  console.warn("WARNING: Duplicate IDs after fixes:", dupes);
  // If esi-sba is duplicated (standalone + split), remove the split one since standalone is more complete
  // Keep the standalone esi-sba, remove the split one (esi-sba-ecole if it conflicts)
}

console.log("Fixed", fixCount, "IDs");
console.log("Final dupes:", dupes);

// Serialize back
function serializeEntry(e) {
  const lines = ["  {"];
  for (const [k, v] of Object.entries(e)) {
    if (v === undefined) continue;
    lines.push("    " + k + ": " + JSON.stringify(v) + ",");
  }
  lines.push("  }");
  return lines.join("\n");
}

const header = content.match(/\/\*[\s\S]*?\*\/\nconst TW_CATALOG\s*=\s*\[/)[0];
const footer = content.match(/\];\s*\n\s*\/\* helpers \*\/[\s\S]*/)[0];
const newContent = header + "\n" + entries.map(serializeEntry).join(",\n") + "\n" + footer;

fs.writeFileSync(filePath, newContent, "utf8");
console.log("Wrote cleaned catalog:", entries.length, "entries");