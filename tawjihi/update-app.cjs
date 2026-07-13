const fs = require('fs');

let appJs = fs.readFileSync('tawjihi/app.js', 'utf8');

appJs = appJs.replace(
  `btn.innerHTML = '<i class="fas fa-check"></i>';`,
  `btn.innerHTML = '<i class="fas fa-check check-pop"></i>';`
);

appJs = appJs.replace(
  `b.classList.toggle('liked');`,
  `b.classList.toggle('liked');\n        b.classList.remove('pulse-scale');\n        void b.offsetWidth;\n        b.classList.add('pulse-scale');`
);

fs.writeFileSync('tawjihi/app.js', appJs);
console.log('Fixed animations in app.js');
