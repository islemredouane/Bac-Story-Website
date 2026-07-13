const fs = require('fs');
let d = fs.readFileSync('tawjihi/styles/app.css', 'utf8');
d = "@import url('skeleton.css');\n" + d;
fs.writeFileSync('tawjihi/styles/app.css', d);
console.log('Imported skeleton.css');
