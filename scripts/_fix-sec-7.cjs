const fs = require("fs");
let c = fs.readFileSync("api/tawjihi-wishlist.js", "utf8");

const loadCatalogBlock = `
import { readFileSync } from 'fs';
import { resolve } from 'path';

let _validIds = null;
function getValidIds() {
  if (_validIds) return _validIds;
  try {
    const p = resolve(process.cwd(), 'tawjihi', 'data', 'admissions-index.json');
    const index = JSON.parse(readFileSync(p, 'utf-8'));
    _validIds = new Set(index.map(e => e.id));
  } catch {
    _validIds = new Set();
  }
  return _validIds;
}
`;

const importBlock = `import { createClient } from '@supabase/supabase-js';`;
c = c.replace(importBlock, importBlock + "\n" + loadCatalogBlock);

const validationOld = `      const VALID_ID_PATTERN = /^[a-z0-9-]{1,30}$/;
      if (!specIds.every(id => typeof id === 'string' && VALID_ID_PATTERN.test(id))) {
        return res.status(400).json({ error: 'معرفات التخصصات غير صالحة' });
      }`;
      
const validationNew = `      const VALID_ID_PATTERN = /^[a-z0-9-]{1,30}$/;
      const validIds = getValidIds();
      // SEC-7: Validate against actual catalog allowlist
      if (!specIds.every(id => typeof id === 'string' && VALID_ID_PATTERN.test(id) && validIds.has(id))) {
        return res.status(400).json({ error: 'معرفات التخصصات غير صالحة أو غير موجودة في الدليل' });
      }`;

c = c.replace(validationOld, validationNew);
fs.writeFileSync("api/tawjihi-wishlist.js", c, "utf8");
console.log("Fixed SEC-7 in tawjihi-wishlist.js");