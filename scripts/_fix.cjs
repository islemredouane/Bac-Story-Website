const fs = require("fs");
let c = fs.readFileSync("scripts/reconcile.js", "utf8");
// Fix mangled normalizeArabic function
const fixedFn = `function normalizeArabic(s) {
  if (!s) return "";
  return s
    .replace(/[\u0623\u0625\u0622\u0627]/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064a")
    .replace(/[\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652]/g, "")
    .trim();
}`;
c = c.replace(/function normalizeArabic\(s\)[\s\S]*?\.trim\(\);\s*\}/, fixedFn);
fs.writeFileSync("scripts/reconcile.js", c, "utf8");
console.log("Fixed. Length:", c.length);