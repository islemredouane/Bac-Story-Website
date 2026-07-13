const fs = require('fs');
let d = fs.readFileSync('tawjihi/dashboard.html','utf8');
d = d.replace('<p class="dash-import-msg" id="dashImportMsg" role="status"></p>', '');
d = d.replace(
`    function showImportMsg(text, kind) {
        if (!importMsg) return;
        importMsg.textContent = text;
        importMsg.className = 'dash-import-msg is-shown ' + (kind === 'ok' ? 'is-ok' : 'is-err');
    }`,
`    function showImportMsg(text, kind) {
        let t = document.getElementById('_twToast');
        if (!t) {
            t = document.createElement('div');
            t.id = '_twToast';
            t.className = 'sim-toast';
            document.body.appendChild(t);
        }
        t.textContent = text;
        t.classList.toggle('is-error', kind === 'err');
        t.classList.add('show');
        clearTimeout(t._hide);
        t._hide = setTimeout(() => { t.classList.remove('show'); }, 3500);
    }`
);
fs.writeFileSync('tawjihi/dashboard.html', d);
