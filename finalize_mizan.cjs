const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources.html');
let html = fs.readFileSync(filePath, 'utf8');

console.log('Starting final Mizan customization...');

// 1. Target phys-sci section
// We'll target the button container inside phys-sci
const physSciStart = html.indexOf('<div id="phys-sci"');
const physSciEnd = html.indexOf('</div>', physSciStart + 100);

if (physSciStart !== -1) {
    let physSciContent = html.substring(physSciStart, physSciEnd + 6);
    console.log('Found phys-sci section.');

    // a. Remove 'a3mida' button
    // It looks like: <button class="main-btn" onclick="showSection('a3mida')"> ... </button>
    // We'll use a regex that matches the button tag and its content
    const a3midaRegex = /<button class="main-btn" onclick="showSection\('a3mida'\)">[\s\S]*?<\/button>/;
    physSciContent = physSciContent.replace(a3midaRegex, '');
    console.log('Removed Electrochemical Cells button.');

    // b. Update Mizan link
    physSciContent = physSciContent.replace(/onclick="showSection\('salasil-al-mizan'\)"/, 'onclick="showSection(\'salasil-al-mizan-phys-sci\')"');
    console.log('Updated Science Physics Mizan link.');

    // Replace back in original HTML
    html = html.substring(0, physSciStart) + physSciContent + html.substring(physSciEnd + 6);
} else {
    console.error('Could not find phys-sci section!');
}

fs.writeFileSync(filePath, html);
console.log('Changes saved to resources.html.');
