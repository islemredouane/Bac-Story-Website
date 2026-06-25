/**
 * fix-kb-data.js
 * Fixes 7 targeted data issues in specialities-kb.json.
 * Run: node scripts/fix-kb-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, '../tawjihi/data/kb/specialities-kb.json');

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------
const raw = fs.readFileSync(KB_PATH, 'utf8');
const data = JSON.parse(raw);

const specialities = data.specialities;

function findById(id) {
  const entry = specialities.find(s => s.id === id);
  if (!entry) throw new Error(`Entry not found: ${id}`);
  return entry;
}

// ---------------------------------------------------------------------------
// Issue 1 — medcine: fix section text "التعريف بتخصص الطب"
// ---------------------------------------------------------------------------
{
  const entry = findById('medcine');
  const sectionKey = 'التعريف بتخصص الطب';

  if (!(sectionKey in entry.sections)) {
    throw new Error(`Section "${sectionKey}" not found in medcine`);
  }

  const oldText = entry.sections[sectionKey];
  const wrongBlock = 'معدلات القبول لسنة 2025\n\nعلوم تجريبية/رياضيات: 16.65\n\nتقني رياضي: 17,15';
  const fixedBlock = 'معدلات القبول لسنة 2025\n\nعلوم تجريبية: 16.65\nرياضيات: 17.15\nتقني رياضي: لا يُقبل';

  if (!oldText.includes(wrongBlock)) {
    throw new Error(`Issue 1: expected block not found in medcine section text.\nActual text:\n${oldText}`);
  }

  entry.sections[sectionKey] = oldText.replace(wrongBlock, fixedBlock);
  console.log('✔ Issue 1 fixed: medcine section text');
}

// ---------------------------------------------------------------------------
// Issue 2 — medcine-dentaire: fix resolvedAverages + section text
// ---------------------------------------------------------------------------
{
  const entry = findById('medcine-dentaire');
  const sectionKey = 'معدلات القبول 2025';

  // Fix resolvedAverages
  entry.resolvedAverages = { min1: 16.99, min2: 17.50, min3: null };
  console.log('✔ Issue 2a fixed: medcine-dentaire resolvedAverages');

  // Fix section text
  if (!(sectionKey in entry.sections)) {
    throw new Error(`Section "${sectionKey}" not found in medcine-dentaire`);
  }

  const wrongText = 'علوم تجريبية + رياضيات : 16,99\n\nتقني رياضي: 17,50';
  const fixedText = 'علوم تجريبية: 16.99\nرياضيات: 17.50\nتقني رياضي: لا يُقبل';

  if (!entry.sections[sectionKey].includes(wrongText)) {
    throw new Error(`Issue 2b: expected block not found in medcine-dentaire section text.\nActual text:\n${entry.sections[sectionKey]}`);
  }

  entry.sections[sectionKey] = entry.sections[sectionKey].replace(wrongText, fixedText);
  console.log('✔ Issue 2b fixed: medcine-dentaire section text');
}

// ---------------------------------------------------------------------------
// Issue 3 — pharmacie: fix typo + wrong labels in section text
// ---------------------------------------------------------------------------
{
  const entry = findById('pharmacie');
  const sectionKey = 'معدلات القبول 2025';

  if (!(sectionKey in entry.sections)) {
    throw new Error(`Section "${sectionKey}" not found in pharmacie`);
  }

  const wrongText = '✅ علوم تجريبية + رياضيات: 16ة26\n\n✅ تقني رياضي: 16,76';
  const fixedText = '✅ علوم تجريبية: 16.26\n✅ رياضيات: 16.76\n✅ تقني رياضي: لا يُقبل';

  if (!entry.sections[sectionKey].includes(wrongText)) {
    throw new Error(`Issue 3: expected block not found in pharmacie section text.\nActual text:\n${entry.sections[sectionKey]}`);
  }

  entry.sections[sectionKey] = entry.sections[sectionKey].replace(wrongText, fixedText);
  console.log('✔ Issue 3 fixed: pharmacie section text');
}

// ---------------------------------------------------------------------------
// Issue 4 — med-psy: fix resolvedAverages
// ---------------------------------------------------------------------------
{
  const entry = findById('med-psy');
  entry.resolvedAverages = { min1: 17.67, min2: 17.67, min3: 18.25 };
  console.log('✔ Issue 4 fixed: med-psy resolvedAverages');
}

// ---------------------------------------------------------------------------
// Issue 5 — med-bio: fix resolvedAverages
// ---------------------------------------------------------------------------
{
  const entry = findById('med-bio');
  entry.resolvedAverages = { min1: 18.19, min2: 18.19, min3: null };
  console.log('✔ Issue 5 fixed: med-bio resolvedAverages');
}

// ---------------------------------------------------------------------------
// Issue 6 — med-info: fix resolvedAverages
// ---------------------------------------------------------------------------
{
  const entry = findById('med-info');
  entry.resolvedAverages = { min1: 18.00, min2: 18.00, min3: null };
  console.log('✔ Issue 6 fixed: med-info resolvedAverages');
}

// ---------------------------------------------------------------------------
// Issue 7 — quantum: clear wrong linkedFiliereKeys
// (resolvedAverages 14.43/15.15/null are already correct — keep them)
// ---------------------------------------------------------------------------
{
  const entry = findById('quantum');
  entry.linkedFiliereKeys = [];
  console.log('✔ Issue 7 fixed: quantum linkedFiliereKeys cleared');
}

// ---------------------------------------------------------------------------
// Write back
// ---------------------------------------------------------------------------
fs.writeFileSync(KB_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log('\n✅ All fixes applied and written to:', KB_PATH);
