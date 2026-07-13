const fs = require('fs');

let appJs = fs.readFileSync('tawjihi/app.js', 'utf8');

appJs = appJs.replace(
  `['med-ai','it-int','space-tech','quantum-nhsm','digital-agro']`,
  `['med-ai','it-int','space-tech','quantum-nhsm','quantum-usthb','digital-agro','math-eco']`
);

fs.writeFileSync('tawjihi/app.js', appJs);
console.log('Restored aspirational items in app.js');
