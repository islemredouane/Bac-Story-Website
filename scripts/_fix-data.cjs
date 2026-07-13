const fs = require("fs");

// 1. Fix specialities-kb.json
let kb;
try {
  kb = JSON.parse(fs.readFileSync("tawjihi/data/kb/specialities-kb.json", "utf8"));
} catch (e) {
  console.error("Failed to read kb", e);
  process.exit(1);
}

const catalogCode = fs.readFileSync("tawjihi/catalog.js", "utf8");
let catalog = [];
try {
  const extractCode = catalogCode.replace(/const TW_CATALOG = /, 'catalog = ').replace(/export \{[\s\S]*\}\;?/, '');
  eval(extractCode);
} catch (e) {
  console.error("Failed to parse catalog.js", e);
  process.exit(1);
}

// Create a mapping from old IDs (or base IDs) to new IDs
// Example: med-national -> med, med-ua1 -> med, esi-alger -> esi
const newSpecs = [];
catalog.forEach(c => {
  // Find a matching kb entry. 
  // First try exact match
  let match = kb.specialities.find(k => k.id === c.id);
  
  if (!match) {
    // Try base name matching (e.g., med-national -> med)
    const baseId = c.id.split('-')[0]; // "med", "esi", "pharm"
    match = kb.specialities.find(k => k.id === baseId);
  }
  
  if (!match) {
    // Try custom fallbacks
    if (c.id.includes("archi")) match = kb.specialities.find(k => k.id === "epau");
    if (c.id.includes("info")) match = kb.specialities.find(k => k.id === "esi");
    if (c.id.includes("eco")) match = kb.specialities.find(k => k.id === "esc");
    if (c.id.includes("st-")) match = kb.specialities.find(k => k.id === "polytech");
    if (c.id.includes("gp-")) match = kb.specialities.find(k => k.id === "polytech");
    if (c.id.includes("gi-")) match = kb.specialities.find(k => k.id === "igee");
    if (c.id.includes("sm-")) match = kb.specialities.find(k => k.id === "enscs");
    if (c.id.includes("genie-")) match = kb.specialities.find(k => k.id === "polytech");
    if (c.id.includes("bio-")) match = kb.specialities.find(k => k.id === "bio");
    if (c.id.includes("math-")) match = kb.specialities.find(k => k.id === "math");
    if (c.id.includes("langues")) match = kb.specialities.find(k => k.id === "langues");
    if (c.id.includes("droit")) match = kb.specialities.find(k => k.id === "droit");
    if (c.id.includes("psych")) match = kb.specialities.find(k => k.id === "psych");
    if (c.id.includes("traduction")) match = kb.specialities.find(k => k.id === "traduction");
    if (c.id.includes("sciences-po")) match = kb.specialities.find(k => k.id === "sciences-po");
    if (c.id.includes("charia")) match = kb.specialities.find(k => k.id === "charia");
    if (c.id.includes("commu")) match = kb.specialities.find(k => k.id === "commu");
    if (c.id.includes("vet")) match = kb.specialities.find(k => k.id === "vet");
  }

  if (match) {
    // Clone and assign new ID and Name
    const newEntry = JSON.parse(JSON.stringify(match));
    newEntry.id = c.id;
    newEntry.name = c.name;
    newSpecs.push(newEntry);
  } else {
    // Create a dummy entry if no match found
    newSpecs.push({
      id: c.id,
      category: c.cat,
      name: c.name,
      sections: { "الوصف": c.name }
    });
  }
});

kb.specialities = newSpecs;
fs.writeFileSync("tawjihi/data/kb/specialities-kb.json", JSON.stringify(kb, null, 2), "utf8");
console.log("Fixed specialities-kb.json - Mapped to " + newSpecs.length + " IDs");

// 2. Fix programs.json
let progs;
try {
  progs = JSON.parse(fs.readFileSync("tawjihi/data/guide/programs.json", "utf8"));
  progs.programs.forEach(p => {
    if (!p.field_ar) p.field_ar = "ميدان التكوين";
    if (!p.scope) p.scope = "national";
    if (!p.rankingBasis) p.rankingBasis = "general";
  });
  fs.writeFileSync("tawjihi/data/guide/programs.json", JSON.stringify(progs, null, 2), "utf8");
  console.log("Fixed programs.json");
} catch (e) {
  console.error("Failed to read/fix programs.json", e);
}
