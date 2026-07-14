// Minimal local host for the Vercel serverless chat function (QA only)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = 'C:/Users/AZ/Documents/BAC CHANNEL/Bac-Story-Website/.claude/worktrees/cool-stonebraker-deb446/FETCH_HEAD';
// load env vars the function reads from process.env
for (const l of fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8').replace(/^﻿/, '').split('\n')) {
  const t = l.trim(); if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('='); if (i < 0) continue;
  process.env[t.slice(0, i).trim()] ??= t.slice(i + 1).trim();
}
const { default: handler } = await import(pathToFileURL(path.join(ROOT, 'api', 'tawjihi-chat.js')).href);

const server = http.createServer(async (req, res) => {
  // collect + parse body like Vercel does
  const bufs = [];
  for await (const c of req) bufs.push(c);
  const raw = Buffer.concat(bufs).toString('utf8');
  try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
  // vercel-style helpers
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
  res.send = (b) => { res.end(typeof b === 'string' ? b : JSON.stringify(b)); return res; };
  try {
    await handler(req, res);
  } catch (err) {
    console.error('[handler error]', err.stack || err.message);
    if (!res.writableEnded) { res.statusCode = 500; res.end(JSON.stringify({ error: 'harness: ' + err.message })); }
  }
});
server.listen(8399, '127.0.0.1', () => console.log('QA harness on http://127.0.0.1:8399'));
