const fs = require('fs');
let d = fs.readFileSync('tawjihi/specialities.html','utf8');
d = d.replace('type="number" id="avgMin"', 'type="number" inputmode="decimal" id="avgMin"');
d = d.replace('type="number" id="avgMax"', 'type="number" inputmode="decimal" id="avgMax"');
fs.writeFileSync('tawjihi/specialities.html', d);
