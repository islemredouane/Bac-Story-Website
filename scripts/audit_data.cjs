const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const kb = JSON.parse(fs.readFileSync(path.join(root,'tawjihi/data/kb/specialities-kb.json'),'utf8'));
const catText = fs.readFileSync(path.join(root,'tawjihi/catalog.js'),'utf8');
const eligRaw = JSON.parse(fs.readFileSync(path.join(root,'tawjihi/data/catalog-eligibility.json'),'utf8'));
const tw = eligRaw.byId;

// Parse catalog streamCodes per id
const catStreams = {};
const catAvg = {};
const reCat = /id:\s*'([^']+)'(?:[\s\S]*?)streamCodes:\s*\[([^\]]*)\](?:[\s\S]*?)avg:\s*([\d.]+)/g;
let m;
while ((m = reCat.exec(catText)) !== null) {
  const id = m[1];
  catStreams[id] = m[2].replace(/'/g,'').split(',').map(s=>s.trim()).filter(Boolean);
  catAvg[id] = parseFloat(m[3]);
}

const kbMap = {};
for (const sp of kb.specialities) kbMap[sp.id] = sp;

const STREAM_AR = { math:'رياضيات', sciexp:'علوم تجريبية', techmath:'تقني رياضي', gestion:'تسيير واقتصاد', lettres:'آداب وفلسفة', langues:'لغات أجنبية' };

const allIds = new Set([...Object.keys(catStreams), ...Object.keys(tw), ...kb.specialities.map(s=>s.id)]);

console.log('=== TAWJIHI DATA AUDIT ===');
console.log('KB:', kb.specialities.length, '| Catalog:', Object.keys(catStreams).length, '| ELIG:', Object.keys(tw).length);

// R1: Catalog says stream accepted, KB null
console.log('\n━━━ R1: Catalog accepts math/techmath but KB threshold=null ━━━');
let r1=0;
for (const id of allIds) {
  const sp = kbMap[id]; if (!sp) continue;
  const ra = sp.resolvedAverages || {}; const cat = catStreams[id] || [];
  const iss = [];
  if (cat.includes('math') && (ra.min2===null||ra.min2===undefined)) iss.push('رياضيات(KB.min2=null)');
  if (cat.includes('techmath') && (ra.min3===null||ra.min3===undefined)) iss.push('تقني(KB.min3=null)');
  if (iss.length) { r1++;
    console.log(`  [${id}] ${sp.name}`);
    console.log(`    cat=[${cat.map(s=>STREAM_AR[s]||s)}]  KB={sciexp:${ra.min1},math:${ra.min2},tech:${ra.min3}}`);
    console.log(`    conflict: ${iss.join(', ')}`);
  }
}
console.log('Total R1:', r1);

// R2: ELIG threshold vs KB differ >1
console.log('\n━━━ R2: ELIG threshold vs KB resolvedAverages differ >1 ━━━');
let r2=0;
for (const id of allIds) {
  const sp = kbMap[id]; if (!sp) continue;
  const ra = sp.resolvedAverages || {}; const thr = (tw[id]||{}).thresholdsByStream||{};
  const iss = [];
  if (thr.sciexp!==undefined && ra.min1!=null && Math.abs(thr.sciexp-ra.min1)>1) iss.push(`ELIG.sciexp=${thr.sciexp} vs KB=${ra.min1}`);
  if (thr.math!==undefined && ra.min2!=null && Math.abs(thr.math-ra.min2)>1) iss.push(`ELIG.math=${thr.math} vs KB=${ra.min2}`);
  if (thr.techmath!==undefined && ra.min3!=null && Math.abs(thr.techmath-ra.min3)>1) iss.push(`ELIG.techmath=${thr.techmath} vs KB=${ra.min3}`);
  if (iss.length) { r2++; console.log(`  [${id}] ${sp.name}:`); iss.forEach(i=>console.log('    ⚠',i)); }
}
console.log('Total R2:', r2);

// R3: cat streams vs ELIG allowedStreams
console.log('\n━━━ R3: Catalog streamCodes vs ELIG allowedStreams ━━━');
let r3=0;
for (const id of allIds) {
  if (!catStreams[id]||!tw[id]) continue;
  const cat=new Set(catStreams[id]); const elig=new Set(tw[id].allowedStreams||[]);
  const onlyCat=[...cat].filter(s=>!elig.has(s));
  const onlyElig=[...elig].filter(s=>!cat.has(s));
  if (onlyCat.length||onlyElig.length) { r3++;
    console.log(`  [${id}] ${(kbMap[id]||{}).name||id}`);
    if (onlyCat.length) console.log(`    CAT-only: [${onlyCat.map(s=>STREAM_AR[s]||s)}]`);
    if (onlyElig.length) console.log(`    ELIG-only: [${onlyElig.map(s=>STREAM_AR[s]||s)}]`);
  }
}
console.log('Total R3:', r3);

// R4: Suspicious ELIG thresholds (too low vs KB)
console.log('\n━━━ R4: ELIG threshold ≤12 when KB says >13 (wrong inheritance) ━━━');
let r4=0;
for (const id of allIds) {
  const sp=kbMap[id]; if (!sp||!tw[id]) continue;
  const ra=sp.resolvedAverages||{}; const thr=tw[id].thresholdsByStream||{};
  const iss=[];
  [['sciexp',ra.min1],['math',ra.min2],['techmath',ra.min3]].forEach(([k,kv])=>{
    if (thr[k]!==undefined && thr[k]<=12 && kv!=null && kv>13) iss.push(`${k}: ELIG=${thr[k]} KB=${kv}`);
  });
  if (iss.length) { r4++; console.log(`  [${id}] ${sp.name}`); iss.forEach(i=>console.log('    ⚠',i)); console.log(`    note: ${tw[id]._note||''}`); }
}
console.log('Total R4:', r4);

// R5: ESM deep-dive
console.log('\n━━━ R5: ESM deep-dive ━━━');
['esm'].forEach(id=>{
  console.log('KB:', JSON.stringify({name:(kbMap[id]||{}).name, ra:(kbMap[id]||{}).resolvedAverages}));
  console.log('CAT streamCodes:', catStreams[id]);
  console.log('ELIG:', JSON.stringify(tw[id]||null, null, 2));
});

// R6: Specialties in KB with no catalog entry (user can't see them in the UI cards)
console.log('\n━━━ R6: KB entries missing from catalog (not shown as cards) ━━━');
const noCat = kb.specialities.filter(sp=>!catStreams[sp.id]);
console.log('Count:', noCat.length);
noCat.forEach(sp=>console.log(`  [${sp.id}] ${sp.name}`));
