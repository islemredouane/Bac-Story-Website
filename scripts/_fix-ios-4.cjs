const fs = require("fs");
let c = fs.readFileSync("tawjihi/dashboard.html", "utf8");
c = c.replace(/<input type="text" id="dashImportCode"/g, `<input dir="ltr" type="text" id="dashImportCode"`);
fs.writeFileSync("tawjihi/dashboard.html", c, "utf8");
console.log("Fixed IOS-4 in dashboard.html");