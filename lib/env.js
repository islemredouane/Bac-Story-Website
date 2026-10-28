// lib/env.js — load .env.local into process.env for local dev
// Import this as the FIRST line in every api/ file
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local'), override: false });
