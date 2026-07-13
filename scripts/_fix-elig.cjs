// Fix top-level catalog ID keys in eligibility.js ONLY (not stream codes inside)
const fs = require("fs");

const OLD_TO_NEW = {
  "esi":          "esi-alger",
  "med":          "med-national",
  "pharm":        "pharm-national",
  "dent":         "dent-national",
  "archi":        "archi-epau",
  "info":         "info-usthb",
  "eco":          "eco-uabm",
  "bio":          "bio-ubma",
  "genie-civil":  "genie-civil-usthb",
  "genie-elec":   "genie-elec-usthb",
  "droit":        "droit-ua2",
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
  // "math" and "langues" are STREAM CODES — do NOT replace them in eligibility.js
  // Only replace them if they appear as TOP-LEVEL keys (catalog IDs)
  // "math": "math-uca1",   <-- intentionally excluded; this is a stream code
  // "langues": "langues-ua2", <-- intentionally excluded; this is a stream code
};

let content = fs.readFileSync("tawjihi/eligibility.js", "utf8");
let changes = 0;

for (const [oldId, newId] of Object.entries(OLD_TO_NEW)) {
  // Only match top-level keys: line starts with "  \"<id>\": {"
  // Pattern: start of line, spaces, double-quote, id, double-quote, colon, space/newline, opening brace
  const escaped = oldId.replace(/-/g, "\\-");
  const pattern = new RegExp('(^\\s*)"' + escaped + '"(\\s*:\\s*\\{)', "gm");
  const newContent = content.replace(pattern, '$1"' + newId + '"$2');
  if (newContent !== content) {
    const count = (content.match(pattern) || []).length;
    console.log("  " + oldId + " -> " + newId + " (" + count + " top-level keys)");
    changes += count;
    content = newContent;
  }
}

fs.writeFileSync("tawjihi/eligibility.js", content, "utf8");
console.log("Fixed", changes, "top-level ID keys in eligibility.js");

// Also fix math and langues as TOP-LEVEL keys only (if they appear as "  \"math\": {")
let mathChanges = 0;
// Fix "math" as top-level key
const mathPattern = /^(\s*)"math"(\s*:\s*\{)/gm;
const mathFixed = content.replace(mathPattern, (match, p1, p2) => {
  mathChanges++;
  return p1 + '"math-uca1"' + p2;
});
if (mathFixed !== content) {
  content = mathFixed;
  console.log("  math -> math-uca1 (" + mathChanges + " top-level keys)");
  changes += mathChanges;
}

// Fix "langues" as top-level key
let langChanges = 0;
const langPattern = /^(\s*)"langues"(\s*:\s*\{)/gm;
const langFixed = content.replace(langPattern, (match, p1, p2) => {
  langChanges++;
  return p1 + '"langues-ua2"' + p2;
});
if (langFixed !== content) {
  content = langFixed;
  console.log("  langues -> langues-ua2 (" + langChanges + " top-level keys)");
  changes += langChanges;
}

fs.writeFileSync("tawjihi/eligibility.js", content, "utf8");
console.log("Total changes to eligibility.js:", changes);