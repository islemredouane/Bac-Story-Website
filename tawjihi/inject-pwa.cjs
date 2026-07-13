const fs = require('fs');
const files = fs.readdirSync('tawjihi').filter(f => f.endsWith('.html'));
const injection = `
    <!-- PWA & Meta Tags -->
    <link rel="manifest" href="manifest.json">
    <link rel="icon" href="assets/favicon.ico" sizes="any">
    <link rel="icon" href="assets/logo.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
    <meta property="og:title" content="Tawjihi - توجيهي">
    <meta property="og:description" content="The ultimate Algerian baccalaureate orientation guide and simulator.">
    <meta property="og:image" content="assets/icon-512x512.png">
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('sw.js').catch(console.error);
        });
      }
    </script>
`;

files.forEach(f => {
  let path = 'tawjihi/' + f;
  let d = fs.readFileSync(path, 'utf8');
  if (!d.includes('manifest.json')) {
    d = d.replace('</head>', injection + '</head>');
    fs.writeFileSync(path, d);
    console.log('Injected in', f);
  }
});
