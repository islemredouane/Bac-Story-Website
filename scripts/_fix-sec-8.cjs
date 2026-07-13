const fs = require("fs");

function fixShell() {
  let c = fs.readFileSync("tawjihi/shell.js", "utf8");
  // The vulnerability: setting and trusting tw-auth in localStorage
  c = c.replace(/localStorage\.setItem\('tw-auth', JSON\.stringify\(\{ provider: 'google', uid: session\.user\.id \}\)\);/g, "// SEC-8: tw-auth removed");
  c = c.replace(/localStorage\.removeItem\('tw-auth'\);/g, "// removed tw-auth");
  c = c.replace(/const twAuth = localStorage\.getItem\('tw-auth'\);/, "const twAuth = false; // SEC-8: Local auth is insecure, force Supabase check");
  fs.writeFileSync("tawjihi/shell.js", c, "utf8");
  console.log("Fixed SEC-8 in shell.js");
}

function fixAppJs() {
  let c = fs.readFileSync("tawjihi/app.js", "utf8");
  // In app.js feedback handler, it uses sessionInfo.token from tw-auth
  c = c.replace(
    /const sessionInfo = JSON\.parse\(localStorage\.getItem\('tw-auth'\) \|\| '\{\}'\);/g,
    "const token = await getAuthToken(); // SEC-8: use secure token"
  );
  c = c.replace(
    /'Authorization': \`Bearer \$\{sessionInfo\.token \|\| ''\}\`/g,
    "'Authorization': `Bearer ${token || ''}`"
  );
  fs.writeFileSync("tawjihi/app.js", c, "utf8");
  console.log("Fixed SEC-8 in app.js");
}

function fixLogin() {
  let c = fs.readFileSync("tawjihi/login.html", "utf8");
  // Find auth state change where tw-auth is set
  c = c.replace(/localStorage\.setItem\('tw-auth'.*?\);/g, "// SEC-8: tw-auth removed");
  c = c.replace(/if\s*\(localStorage\.getItem\('tw-auth'\)\)\s*window\.location\.replace/g, "if (false) window.location.replace");
  fs.writeFileSync("tawjihi/login.html", c, "utf8");
  console.log("Fixed SEC-8 in login.html");
}

fixShell();
fixAppJs();
fixLogin();