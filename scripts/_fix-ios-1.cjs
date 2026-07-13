const fs = require("fs");
let c = fs.readFileSync("tawjihi/styles/app.css", "utf8");

// Add html, body { height: 100% } to the top of app.css if not exists, or replace in tokens.css?
// tokens.css handles globals usually. Let's just fix .app and .main in app.css
c = c.replace(/min-height: 100dvh;/g, "height: 100%; min-height: -webkit-fill-available;");
c = c.replace(/\.main \{ display: flex; flex-direction: column; min-width: 0; height: 100dvh;/g, ".main { display: flex; flex-direction: column; min-width: 0; height: 100%; min-height: -webkit-fill-available;");
fs.writeFileSync("tawjihi/styles/app.css", c, "utf8");
console.log("Fixed IOS-1");