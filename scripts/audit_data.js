const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const kb = JSON.parse(fs.readFileSync(path.join(root,'tawjihi/data/kb/specialities-kb.json'),'utf8'));
const catText = fs.readFileSync(path.join(root,'tawjihi/catalog.js'),'utf8');
const eligText = fs.readFileSync(path.join(root,'tawjihi/eligibility.js'),'utf8');

// Parse catalog streamCodes per id
const catStreams = {};
const catAvg = {};
const reC = /id:\s*'([^']+)'[\s\S]*?streamCodes:\s*\[([^\]]*)\][\s\S]*?avg:\s*([\d.]+)/g;
let m;
while ((m = reC.exec(catText)) !== null) {
  const id = m[1];
  catStreams[id] = m[2].replace(/'/g,'').split(',').map(s=>s.trim()).filter(Boolean);
  catAvg[id] = parseFloat(m[3]);
}

// Parse TW_ELIG per id (allowedStreams + thresholdsByStream)
const tw = {};
const reE = /"([a-z0-9_-]+)":\s*\{\s*"allowedStreams":\s*\[([\s\S]*?)\]\s*,\s*"thresholdsByStream":\s*\{([^}]*)\}/g;
while ((m = reE.exec(eligText)) !== null) {
  const id = m[1];
  const streams = m[2].replace(/\s*"/g,'').split(',').map(s=>s.trim()).filter(Boolean);
  const thr = {};
  const rthr = /"(\w+)":\s*([\d.]+)/g;
  let tm;
  while ((tm = rthr.exec(m[3])) !== null) thr[tm[1]] = parseFloat(tm[2]);
  tw[id] = { streams, thr };
}

// Build KB id map
const kbMap = {};
for (const sp of kb.specialities) kbMap[sp.id] = sp;

console.log('=== TAWJIHI DATA AUDIT ===\n');
console.log('KB specialities:', kb.specialities.length);
console.log('Catalog entries:', Object.keys(catStreams).length);
console.log('ELIG entries:   ', Object.keys(tw).length);

// REPORT 1: Catalog streams vs KB resolvedAverages conflicts
console.log('\n--- REPORT 1: Catalog shows stream as accepted, but KB has no threshold data ---');
let r1 = 0;
for (const sp of kb.specialities) {
  const id = sp.id;
  const ra = sp.resolvedAverages || {};
  const cat = catStreams[id] || [];
  const issues = [];
  if (cat.includes('math') && (ra.min2 === null || ra.min2 === undefined)) issues.push('cat:رياضيات BUT KB.min2=null');
  if (cat.includes('techmath') && (ra.min3 === null || ra.min3 === undefined)) issues.push('cat:تقني BUT KB.min3=null');
  if (issues.length) {
    r1++;
    console.log(`  ${id}: ${sp.name}`);
    issues.forEach(i => console.log(`    ⚠ ${i}`));
    console.log(`    cat=${JSON.stringify(cat)}  KB.ra=${JSON.stringify(ra)}`);
  }
}
console.log(`Total: ${r1}\n`);

// REPORT 2: ELIG threshold vs KB resolvedAverages mismatch
console.log('--- REPORT 2: TW_ELIG threshold vs KB resolvedAverages differ by >1 ---');
let r2 = 0;
for (const sp of kb.specialities) {
  const id = sp.id;
  const ra = sp.resolvedAverages || {};
  const elig = tw[id] || { streams:[], thr:{} };
  const issues = [];
  if (elig.thr.sciexp !== undefined && ra.min1 !== null && ra.min1 !== undefined && Math.abs(elig.thr.sciexp - ra.min1) > 1.0)
    issues.push(`ELIG.sciexp=${elig.thr.sciexp} vs KB.min1=${ra.min1}`);
  if (elig.thr.math !== undefined && ra.min2 !== null && ra.min2 !== undefined && Math.abs(elig.thr.math - ra.min2) > 1.0)
    issues.push(`ELIG.math=${elig.thr.math} vs KB.min2=${ra.min2}`);
  if (elig.thr.techmath !== undefined && ra.min3 !== null && ra.min3 !== undefined && Math.abs(elig.thr.techmath - ra.min3) > 1.0)
    issues.push(`ELIG.techmath=${elig.thr.techmath} vs KB.min3=${ra.min3}`);
  if (issues.length) {
    r2++;
    console.log(`  ${id}: ${sp.name}`);
    issues.forEach(i => console.log(`    ⚠ ${i}`));
  }
}
console.log(`Total: ${r2}\n`);

// REPORT 3: Streams in ELIG but not in catalog, or vice versa
console.log('--- REPORT 3: Stream set mismatch between ELIG.allowedStreams and catalog.streamCodes ---');
let r3 = 0;
for (const sp of kb.specialities) {
  const id = sp.id;
  const cat = new Set(catStreams[id] || []);
  const elig = new Set((tw[id]||{streams:[]}).streams);
  const inEligNotCat = [...elig].filter(s=>!cat.has(s));
  const inCatNotElig = [...cat].filter(s=>!elig.has(s));
  if (inEligNotCat.length || inCatNotElig.length) {
    r3++;
    if (inEligNotCat.length) console.log(`  ${id}: ELIG adds [${inEligNotCat}] not in catalog`);
    if (inCatNotElig.length) console.log(`  ${id}: catalog adds [${inCatNotElig}] not in ELIG`);
  }
}
console.log(`Total: ${r3}\n`);

// REPORT 4: ELIG has suspicious low thresholds (inherited from wrong source)
console.log('--- REPORT 4: Suspicious ELIG thresholds (<=12) while KB says >13 ---');
let r4 = 0;
for (const sp of kb.specialities) {
  const id = sp.id;
  const ra = sp.resolvedAverages || {};
  const elig = tw[id] || { streams:[], thr:{} };
  const issues = [];
  for (const [stream, val] of Object.entries(elig.thr)) {
    const kbVal = stream==='sciexp'?ra.min1:stream==='math'?ra.min2:stream==='techmath'?ra.min3:null;
    if (val <= 12 && kbVal !== null && kbVal !== undefined && kbVal > 13)
      issues.push(`ELIG.${stream}=${val} but KB says ${kbVal}`);
  }
  if (issues.length) {
    r4++;
    console.log(`  ${id}: ${sp.name}`);
    issues.forEach(i => console.log(`    ⚠ ${i}`));
  }
}
console.log(`Total: ${r4}\n`);

// REPORT 5: KB entries missing from catalog entirely
console.log('--- REPORT 5: KB specialities with no catalog entry ---');
const noCat = kb.specialities.filter(sp=>!catStreams[sp.id]);
noCat.slice(0,20).forEach(sp=>console.log(`  ${sp.id}: ${sp.name}`));
console.log(`Total: ${noCat.length}\n`);
