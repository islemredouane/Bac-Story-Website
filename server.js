// server.js — Local dev server (replaces broken vercel dev)
// Serves static files + /api/* routes just like Vercel

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load .env.local first
process.env.NODE_ENV = 'development';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS for local dev
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────

// Generic handler for all /api/* endpoints to mirror Vercel serverless functions
app.all('/api/:endpoint', async (req, res, next) => {
  const { endpoint } = req.params;

  // Custom handler for /api/ai-config
  if (endpoint === 'ai-config') {
    const supabaseUrl     = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Missing Supabase env vars' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ supabaseUrl, supabaseAnonKey });
  }

  const fs = require('fs');
  const apiFile = path.join(__dirname, 'api', `${endpoint}.js`);
  if (fs.existsSync(apiFile)) {
    try {
      const handler = await import(`./api/${endpoint}.js?update=${Date.now()}`);
      return await handler.default(req, res);
    } catch (err) {
      console.error(`[server] /api/${endpoint} error:`, err);
      if (!res.headersSent) {
        return res.status(500).json({ error: err.message || 'Server error' });
      }
      return;
    }
  }
  next();
});

// ── Static Files ──────────────────────────────────────────────────────────────
// Serve all static files (HTML, CSS, JS, images)
app.use(express.static(__dirname, {
  // Don't cache in dev
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

// SPA fallback: serve .html for extensionless routes
app.get('/{*path}', (req, res) => {
  // Try to find matching .html file
  const htmlFile = path.join(__dirname, req.path + '.html');
  const fs = require('fs');
  if (fs.existsSync(htmlFile)) {
    return res.sendFile(htmlFile);
  }
  // Default to index
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n\x1b[32m✔ BAC STORY Local Server running!\x1b[0m');
  console.log(`\x1b[36m  → http://localhost:${PORT}/ai.html  (AI Chat)\x1b[0m`);
  console.log(`\x1b[36m  → http://localhost:${PORT}          (Homepage)\x1b[0m`);
  console.log('\x1b[33m  Press Ctrl+C to stop\x1b[0m\n');

  // Validate env
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.warn('\x1b[31m⚠ Missing env vars:', missing.join(', '), '\x1b[0m');
    console.warn('  Make sure .env.local exists with all keys.\n');
  } else {
    console.log('\x1b[32m✔ All environment variables loaded OK\x1b[0m\n');
  }
});
