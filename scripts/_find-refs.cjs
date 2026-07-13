const fs = require("fs");
const files = [
  "tawjihi/simulator.js",
  "tawjihi/app.js",
  "tawjihi/dashboard.html",
  "tawjihi/specialities.html",
  "tawjihi/speciality.html"
];
const oldIds = ["esi", "med", "pharm", "dent", "archi", "info", "eco", "bio", "math", "genie-civil", "genie-elec", "droit", "langues", "psych", "genie-meca", "polytech", "st", "gp", "gi", "gmec", "vet", "med-bio", "sm", "ens", "sciences-po", "traduction", "commu", "charia", "sciences-hum", "quantum", "med-eco"];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  console.log("--- " + file + " ---");
  for (const id of oldIds) {
    const regex1 = new RegExp("'" + id + "'", "g");
    const regex2 = new RegExp('"' + id + '"', "g");
    const regex3 = new RegExp("id=" + id + "(&|\"|$)", "g");
    let matches = [];
    let m;
    while ((m = regex1.exec(content)) !== null) matches.push("'" + id + "'");
    while ((m = regex2.exec(content)) !== null) matches.push('"' + id + '"');
    while ((m = regex3.exec(content)) !== null) matches.push(m[0]);
    if (matches.length > 0) {
      console.log("  " + id + ": " + matches.length + " matches");
    }
  }
}