import fs from 'fs';
import path from 'path';

console.log("Running Part A: Data Integrity QA...\n");
let pass = true;

const catalogCode = fs.readFileSync('tawjihi/catalog.js', 'utf8');
let catalog = [];
try {
  const extractCode = catalogCode.replace(/const TW_CATALOG = /, 'catalog = ').replace(/export \{[\s\S]*\}\;?/, '');
  eval(extractCode);
} catch (e) {
  console.error("Failed to parse catalog.js", e);
  pass = false;
}

// 1. Check catalog
const validStreams = new Set(['sciexp','math','techmath','gestion','lettres','langues','arts']);
const ids = new Set();
let catalogErrs = 0;

catalog.forEach(c => {
  if (ids.has(c.id)) { console.error(`Duplicate ID: ${c.id}`); catalogErrs++; pass = false; }
  ids.add(c.id);
  if (!c.cat) { console.error(`Missing cat for ${c.id}`); catalogErrs++; pass = false; }
  c.streamCodes?.forEach(s => {
    if (!validStreams.has(s)) { console.error(`Invalid stream ${s} in ${c.id}`); catalogErrs++; pass = false; }
  });
  if (c.avg !== null && (c.avg < 8 || c.avg > 20)) { console.error(`Invalid avg ${c.avg} for ${c.id}`); catalogErrs++; pass = false; }
  if (c.minAvg !== null && c.minAvg !== undefined && (c.minAvg < 8 || c.minAvg > 20)) { console.error(`Invalid minAvg ${c.minAvg} for ${c.id}`); catalogErrs++; pass = false; }
  if (c.cat === 'military' && !c.regLink) { console.error(`Missing regLink for military ${c.id}`); catalogErrs++; pass = false; }
});
console.log(`Catalog check: ${catalog.length} entries. Errors: ${catalogErrs}`);

// 2. Cross-refs with specialities-kb.json
let kbIds = new Set();
try {
  const kbObj = JSON.parse(fs.readFileSync('tawjihi/data/kb/specialities-kb.json', 'utf8'));
  const kbArr = kbObj.specialities || [];
  kbArr.forEach(k => kbIds.add(k.id));
} catch(e) { console.error("Failed to read specialities-kb.json", e); pass = false; }

let missingKb = 0;
ids.forEach(id => {
  if (!kbIds.has(id)) {
    console.error(`Catalog ID ${id} missing from specialities-kb.json`);
    missingKb++;
    pass = false;
  }
});
console.log(`KB Cross-ref check: Missing ${missingKb} IDs.`);

// 3. Programs.json
let programsErrs = 0;
try {
  const progsObj = JSON.parse(fs.readFileSync('tawjihi/data/guide/programs.json', 'utf8'));
  const progsArr = progsObj.programs || [];
  progsArr.forEach(p => {
    if (!p.code || !p.field_ar || !p.scope || !p.rankingBasis) { programsErrs++; pass = false; }
  });
  console.log(`Programs check: ${progsArr.length} entries. Errors: ${programsErrs}`);
} catch(e) { console.error("Failed to read programs.json", e); pass = false; }

// 4. Traceability
let traceErrs = 0;
try {
  const minima = JSON.parse(fs.readFileSync('tawjihi/data/averages-2025/minima-phase1-2025.json', 'utf8'));
  const codes = JSON.parse(fs.readFileSync('tawjihi/data/_staging/code-mapping.json', 'utf8'));
  const sample = catalog.slice(0, 20);
  sample.forEach(c => {
    const codeList = codes[c.id];
    if (!codeList) return;
    codeList.forEach(codeObj => {
      const min = minima.find(m => m.filiere === codeObj.code);
      if (!min) { console.error(`Missing minima for ${codeObj.code} (${c.id})`); traceErrs++; pass = false; }
    });
  });
  console.log(`Traceability check on 20 samples. Errors: ${traceErrs}`);
} catch(e) { console.error("Failed to verify traceability", e); }

const report = `# QA Integrity Report\n\nPart A: Data Integrity Checks\n\n- Catalog Check: ${catalog.length} entries (Errors: ${catalogErrs})\n- KB Cross-ref: Missing ${missingKb} IDs\n- Programs.json: Errors: ${programsErrs}\n- Traceability: Errors: ${traceErrs}\n\nStatus: ${pass ? 'PASSED' : 'FAILED'}`;
fs.writeFileSync('tawjihi/data/_staging/_QA-INTEGRITY-REPORT.md', report, 'utf8');

console.log(pass ? "\n✅ Part A PASSED" : "\n❌ Part A FAILED");