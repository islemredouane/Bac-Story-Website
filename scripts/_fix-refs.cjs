// Fix broken ID references in JS/HTML files
// Maps old ID → new ID for all split and renamed entries
const fs = require("fs");
const path = require("path");

const ID_MAP = {
  // esi split entries
  "\"esi\"":       null,   // removed - now split
  "'esi'":         null,
  // ens split
  "\"ens\"":       null,
  "'ens'":         null,
  // archi: "archi" is now "archi-epau" (main) or "archi-usto"
  // Most specific known old->new mappings
};

// The real fix: replace string literal occurrences of old IDs in function calls/arrays
// We need to be careful not to change HTML class names or CSS

// Old IDs that were split - these no longer exist in catalog
const SPLIT_IDS = [
  "esi", "med", "pharm", "dent", "archi", "info", "eco", "bio", "math",
  "genie-civil", "genie-elec", "droit", "langues", "psych", "genie-meca",
  "polytech", "st", "gp", "gi", "gmec", "vet", "med-bio", "sm", "ens",
  "sciences-po", "traduction", "commu", "charia", "sciences-hum", "quantum",
  "med-eco"
];

// Map old ID → primary new ID (the "flagship" or first split entry)
const OLD_TO_PRIMARY = {
  "esi":          "esi-alger",
  "med":          "med-national",
  "pharm":        "pharm-national",
  "dent":         "dent-national",
  "archi":        "archi-epau",
  "info":         "info-usthb",
  "eco":          "eco-uabm",
  "bio":          "bio-ubma",
  "math":         "math-uca1",
  "genie-civil":  "genie-civil-usthb",
  "genie-elec":   "genie-elec-usthb",
  "droit":        "droit-ua2",
  "langues":      "langues-ua2",
  "psych":        "psych-ua2",
  "genie-meca":   "genie-meca-usthb",
  "polytech":     "polytech-usto",
  "st":           "st-usthb",
  "gp":           "gp-usthb",
  "gi":           "gi-usthb",
  "gmec":         "gmec-usthb",
  "vet":          "vet-ubt",
  "med-bio":      "med-bio-ua1",
  "sm":           "sm-usthb",
  "ens":          "ens-bouzareah",
  "sciences-po":  "sciences-po-ua3",
  "traduction":   "traduction-ua2",
  "commu":        "commu-ua3",
  "charia":       "charia-ua1",
  "sciences-hum": "sciences-hum-ua2",
  "quantum":      "quantum-nhsm",
  "med-eco":      "med-eco-ufas",
  // ID renames (from script cleanup)
  "esi-esi":      "esi-alger",
  "esi-esi-sba":  "esi-sba-ecole",
  "med-":         "med-national",
  "pharm-":       "pharm-national",
  "dent-":        "dent-national",
  "ens-ens-bz":   "ens-bouzareah",
  "ens-ens-cst":  "ens-constantine",
  "ens-ens-or":   "ens-oran",
};

const FILES_TO_PATCH = [
  "tawjihi/eligibility.js",
  "tawjihi/simulator.js",
  "tawjihi/app.js",
  "tawjihi/dashboard.html",
  "tawjihi/specialities.html",
  "tawjihi/speciality.html",
  "tawjihi/onboarding.js",
  "tawjihi/shell.js",
];

let totalChanges = 0;
const changeLog = [];

for (const relPath of FILES_TO_PATCH) {
  const absPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(absPath)) {
    console.log("  SKIP (not found):", relPath);
    continue;
  }
  
  let content = fs.readFileSync(absPath, "utf8");
  const original = content;
  let fileChanges = 0;
  
  // Replace old IDs with new primary IDs
  // Pattern: quoted string that exactly matches an old ID
  // We replace 'oldId' and "oldId" in contexts like: twById('esi'), id === 'esi', 'esi',
  for (const [oldId, newId] of Object.entries(OLD_TO_PRIMARY)) {
    if (!newId) continue;
    
    // Replace in string literals: match 'oldId' or "oldId" as standalone values
    // Use word-boundary-like approach: preceded and followed by quote
    const patterns = [
      new RegExp("'" + oldId.replace(/-/g, "\\-") + "'", "g"),
      new RegExp('"' + oldId.replace(/-/g, "\\-") + '"', "g"),
    ];
    
    for (const pattern of patterns) {
      const quoteChar = pattern.source[0] === "'" ? "'" : '"';
      const newStr = quoteChar + newId + quoteChar;
      const newContent = content.replace(pattern, newStr);
      if (newContent !== content) {
        const count = (content.match(pattern) || []).length;
        fileChanges += count;
        changeLog.push({ file: relPath, oldId, newId, count });
        content = newContent;
      }
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(absPath, content, "utf8");
    console.log("  Patched:", relPath, "(" + fileChanges + " changes)");
    totalChanges += fileChanges;
  } else {
    console.log("  No changes needed:", relPath);
  }
}

console.log("\nTotal changes:", totalChanges);
console.log("Change log:");
for (const c of changeLog) {
  console.log("  " + c.file + ": '" + c.oldId + "' -> '" + c.newId + "' (" + c.count + "x)");
}