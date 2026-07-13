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
  "med-eco":      "med-eco-ufas"
};

const files = [
  "tawjihi/simulator.js",
  "tawjihi/app.js",
  "tawjihi/dashboard.html",
  "tawjihi/specialities.html",
  "tawjihi/speciality.html"
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let original = content;
  
  for (const [oldId, newId] of Object.entries(OLD_TO_NEW)) {
    // 1. Replace single-quoted literals: 'oldId' -> 'newId'
    // Ensure it's not part of a larger string (like 'math-physics')
    const regex1 = new RegExp(`'${oldId.replace(/-/g, '\\-')}'`, "g");
    content = content.replace(regex1, `'${newId}'`);
    
    // 2. Replace double-quoted literals: "oldId" -> "newId"
    const regex2 = new RegExp(`"${oldId.replace(/-/g, '\\-')}"`, "g");
    content = content.replace(regex2, `"${newId}"`);
    
    // 3. Replace in URLs: id=oldId& or id=oldId" or id=oldId'
    const regex3 = new RegExp(`id=${oldId.replace(/-/g, '\\-')}(?=[&"'])`, "g");
    content = content.replace(regex3, `id=${newId}`);
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log(`Updated ${file}`);
  }
}
console.log("Done");