/* ============================================================
   TAWJIHI — Admissions Search API (Vercel Serverless)
   GET /api/tawjihi-search?avg=13.5&stream=sciexp&filiere=INFORMATIQUE&limit=30
   ============================================================ */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load index once at cold start (deployed alongside function)
let _index = null;
function getIndex() {
  if (_index) return _index;
  try {
    const p = resolve(process.cwd(), 'tawjihi', 'data', 'admissions-index.json');
    _index = JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    _index = [];
  }
  return _index;
}

const STREAM_FIELD = {
  sciexp: 'min1',
  math:   'min2',
  techmath: 'min3',
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const index = getIndex();
  const { avg, stream, filiere, type, limit = '30' } = req.query;

  const userAvg  = avg   ? parseFloat(avg)   : null;
  const maxLimit = Math.min(parseInt(limit) || 30, 100);

  const minField = STREAM_FIELD[stream] || 'min1';

  let results = index.filter(e => {
    // Filter by filiere substring if provided
    if (filiere) {
      const f = filiere.toUpperCase();
      if (!e.filiere_key?.includes(f) && !e.filiere?.toUpperCase().includes(f)) return false;
    }
    // Filter by institution type
    if (type) {
      if (e.type !== type) return false;
    }
    // Filter by average: only show programs reachable with userAvg
    if (userAvg !== null) {
      const min = e[minField];
      if (min === null || min === undefined) return false;
      return min <= userAvg;
    }
    return e.min1 !== null || e.min2 !== null;
  });

  // Sort: highest min first (most competitive within reach)
  results.sort((a, b) => {
    const ma = a[minField] ?? a.min1 ?? 0;
    const mb = b[minField] ?? b.min1 ?? 0;
    return mb - ma;
  });

  results = results.slice(0, maxLimit);

  return res.status(200).json({
    total: results.length,
    stream: stream || 'sciexp',
    avg: userAvg,
    results,
  });
}
