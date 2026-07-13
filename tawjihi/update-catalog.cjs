const fs = require('fs');
let d = fs.readFileSync('tawjihi/catalog.js', 'utf8');

// Find all entries that have y2025 but NO y2024
d = d.replace(/(avgHistory:\s*\[\{[^{}]*\}\]\s*,\s*(?:unis:\s*\[.*?\]\s*,\s*)?conditions:\s*\[)(.*?)(\])/g, (match, prefix, conditionsContent, suffix) => {
    // Check if the match contains y2024
    if (match.includes('y2024')) {
        return match;
    }
    // If conditions is empty
    if (!conditionsContent.trim()) {
        return prefix + '"مدرسة جديدة — بيانات 2025 فقط متوفرة."' + suffix;
    }
    // Otherwise append
    return prefix + conditionsContent + ', "مدرسة جديدة — بيانات 2025 فقط متوفرة."' + suffix;
});

fs.writeFileSync('tawjihi/catalog.js', d);
console.log('Done modifying new schools');
