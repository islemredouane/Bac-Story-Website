const fs = require("fs");
let c = fs.readFileSync("tawjihi/styles/simulator.css", "utf8");
c = c.replace(/bottom: var\(--sp-6\);/g, "bottom: calc(85px + env(safe-area-inset-bottom, 0px));");
fs.writeFileSync("tawjihi/styles/simulator.css", c, "utf8");
console.log("Fixed IOS-3");