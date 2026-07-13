const fs = require('fs');
const path = require('path');

const dir = 'tawjihi';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const metaTag = '    <meta name="view-transition" content="same-origin">\n';

files.forEach(file => {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  if (!content.includes('name="view-transition"')) {
    content = content.replace('</head>', metaTag + '</head>');
    fs.writeFileSync(filepath, content);
    console.log(`Added view-transition to ${file}`);
  }
});
