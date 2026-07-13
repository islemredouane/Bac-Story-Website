const fs = require('fs');
let d = fs.readFileSync('tawjihi/login.html','utf8');
d = d.replace("t.className = 'auth-toast';", "t.className = 'sim-toast';");
d = d.replace("t.classList.add('is-visible');", "t.classList.add('show');");
d = d.replace("t.classList.remove('is-visible');", "t.classList.remove('show');");
fs.writeFileSync('tawjihi/login.html', d);
