# RAG Implementation Plan — Tawjihi AI Chat
**Date:** 2026-07-08  
**Goal:** Cut system prompt from ~6,000 tokens to ~800 tokens by embedding KB docs in Supabase pgvector and doing semantic search per query instead of injecting all data statically.

---

## Problem Statement

Current `api/tawjihi-chat.js` statically imports and concatenates ALL knowledge-base files into every system prompt:
- `specialities-kb.json` — 220 entries
- `programs.json` — 341 programs
- `ministry-rules.json` — 27 rules
- `tawjihi/content/*.json` — 83 rich content files
- `filiere-index.json`, `geo-circles.json`, `availability-map.json`

Result: ~6,000 tokens per request → exhausts all free-tier quotas (Gemini + Groq + OpenRouter) within minutes.

**RAG fix:** embed each doc once, store in Supabase pgvector, at query time search top 3-5 relevant chunks and inject only those → ~800 tokens per request (7.5× reduction).

---

## Data Inventory

| Source | Count | Chunk Strategy |
|--------|-------|---------------|
| `tawjihi/content/*.json` | 83 files | 1 doc per section (type=text/list/pros/cons/summary) |
| `data/kb/specialities-kb.json` | 220 entries | 1 doc per speciality (id + name + averages + sections summary) |
| `data/guide/programs.json` | 341 programs | 1 doc per program (eligibility rules + wilayaAverages) |
| `data/kb/ministry-rules.json` | 27 rules | 1 doc per rule |
| `data/kb/geo-circles.json` | ~58 wilayas | 1 doc per wilaya group |
| `data/kb/filiere-index.json` | ~30 filieres | 1 doc per filiere |
| `data/kb/availability-map.json` | ~100 entries | 1 doc per wilaya/speciality pair |
| **Total estimated chunks** | **~850–1,100** | |

---

## Architecture

```
User query
    │
    ▼
[1] Embed query using Gemini text-embedding-004
    │
    ▼
[2] Supabase pgvector similarity search (top 5 chunks, threshold 0.75)
    │
    ▼
[3] Inject matched chunks into lean system prompt (~800 tokens)
    │
    ▼
[4] Stream response from Gemini/Groq/OpenRouter
    │
    ▼
[5] After conversation ends → generate session summary → store in chat_sessions
```

---

## Phase 1 — Supabase Database Schema

**Agent: Database/SQL specialist**

### 1.1 Enable pgvector extension
```sql
create extension if not exists vector;
```

### 1.2 Table: `kb_embeddings`
```sql
create table kb_embeddings (
  id          bigserial primary key,
  source      text not null,        -- 'speciality' | 'program' | 'rule' | 'content' | 'geo' | 'filiere'
  source_id   text not null,        -- e.g. 'esi', 'program_123', 'rule_7'
  chunk_index integer default 0,    -- for multi-chunk docs
  content     text not null,        -- the raw text embedded
  metadata    jsonb default '{}',   -- { name_ar, name_fr, category, wilaya, ... }
  embedding   vector(768) not null, -- Gemini text-embedding-004 dimension
  created_at  timestamptz default now()
);

-- HNSW index for fast cosine similarity
create index kb_embeddings_embedding_idx
  on kb_embeddings using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Composite index for cache invalidation
create index kb_embeddings_source_idx on kb_embeddings (source, source_id);
```

### 1.3 Table: `chat_sessions`
```sql
create table chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  summary     text,                 -- AI-generated summary of the session
  turn_count  integer default 0,
  tokens_used integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

### 1.4 SQL similarity search function
```sql
create or replace function search_kb(
  query_embedding vector(768),
  match_threshold float  default 0.70,
  match_count     int    default 5,
  source_filter   text   default null  -- optional: filter by source type
)
returns table (
  id          bigint,
  source      text,
  source_id   text,
  content     text,
  metadata    jsonb,
  similarity  float
)
language plpgsql
as $$
begin
  return query
  select
    ke.id,
    ke.source,
    ke.source_id,
    ke.content,
    ke.metadata,
    1 - (ke.embedding <=> query_embedding) as similarity
  from kb_embeddings ke
  where
    (source_filter is null or ke.source = source_filter)
    and 1 - (ke.embedding <=> query_embedding) > match_threshold
  order by ke.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### 1.5 RLS Policies
```sql
-- kb_embeddings: read-only for authenticated users, write only for service role
alter table kb_embeddings enable row level security;
create policy "kb_embeddings_select" on kb_embeddings
  for select using (true);  -- public read (no PII in KB)

-- chat_sessions: users see only their own
alter table chat_sessions enable row level security;
create policy "chat_sessions_user" on chat_sessions
  for all using (auth.uid() = user_id);
```

---

## Phase 2 — Content Chunking & Embedding Script

**Agent: Data/ML specialist**

### 2.1 Embedding model
- **Model:** `text-embedding-004` (Gemini)
- **Dimension:** 768
- **Free tier:** 1,500 requests/minute — very generous
- **API key:** `GEMINI_API_KEY_1` (or any valid Gemini key from env)

### 2.2 Chunking rules per source

**`tawjihi/content/*.json`** (83 files)
- File slug = speciality key (e.g. `esi.json` → source_id: `esi`)
- 1 chunk per section (`h` + `body` + `items` joined)
- Filter empty sections
- metadata: `{ name: slug, type: section.type, heading: section.h }`

**`specialities-kb.json`** (220 entries)
- 1 chunk per entry
- Text: `{name_ar} ({name_fr})\nAverages: {averages_text}\nSections: {sections.join(', ')}`
- metadata: `{ id, category, name_ar, name_fr }`

**`programs.json`** (341 entries)
- 1 chunk per program
- Text: `{program name}\nEligibility: {conditions}\nAverage required: {avg}\nWilaya averages: {top 3}`
- metadata: `{ program_id, wilaya }`

**`ministry-rules.json`** (27 rules)
- 1 chunk per rule
- Text: `Rule {n}: {title}\n{body}`
- metadata: `{ rule_id, category }`

**`geo-circles.json`**
- 1 chunk per wilaya group (circle)
- Text: `Geographic circle: {circle_name}\nWilayas: {list}`

**`filiere-index.json`**
- 1 chunk per filiere
- Text: `Filiere: {name}\nKey: {key}\nSpecialities: {list}`

**`availability-map.json`**
- Group by speciality_key → 1 chunk per speciality listing all available wilayas

### 2.3 Script: `scripts/embed-kb.js`

```
scripts/
└── embed-kb.js        # one-time embedding generation script
```

Script flow:
1. Load all source files
2. For each source, chunk according to rules above
3. Call Gemini `embedContent()` per chunk (batch with 100ms delay to respect rate limits)
4. Upsert to `kb_embeddings` via Supabase service role client
5. Log progress: `[2/341] programs...`
6. On completion: print total inserted + time elapsed

**Run locally:** `node scripts/embed-kb.js`
**Re-run when KB files change** (not on every deploy)

---

## Phase 3 — API Rewrite (`api/tawjihi-chat.js`)

**Agent: Backend/API specialist**

### 3.1 Remove static imports
Delete all static KB imports:
```js
// DELETE THESE:
import specialitiesKb from '../tawjihi/data/kb/specialities-kb.json'
import admissionsFull from '../tawjihi/data/kb/admissions-full.json'
import filiereIndex from '../tawjihi/data/kb/filiere-index.json'
import guidePrograms from '../tawjihi/data/guide/programs.json'
import geoData from '../tawjihi/data/guide/geographic-circles.json'
import geoCircles from '../tawjihi/data/kb/geo-circles.json'
import ministryRulesData from '../tawjihi/data/kb/ministry-rules.json'
import availabilityMapData from '../tawjihi/data/kb/availability-map.json'
```

### 3.2 Add RAG retrieval function
```js
async function retrieveContext(userMessage, adminSupabase) {
  // 1. Embed the user query
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2);
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(userMessage);
  const embedding = result.embedding.values;

  // 2. Search Supabase
  const { data, error } = await adminSupabase.rpc('search_kb', {
    query_embedding: embedding,
    match_threshold: 0.70,
    match_count: 5
  });

  if (error || !data?.length) return '';

  // 3. Format chunks for system prompt
  return data.map(chunk => chunk.content).join('\n\n---\n\n');
}
```

### 3.3 New lean system prompt
```js
const systemPrompt = `أنت مساعد ذكي متخصص في التوجيه الجامعي الجزائري لطلاب BAC 2025.
أجب دائماً بالعربية الفصحى بأسلوب واضح ومباشر.

معلومات ذات صلة بسؤال المستخدم:
${ragContext}

قواعد:
- اعتمد فقط على المعلومات المُقدَّمة أعلاه
- إن لم تجد المعلومة، قل ذلك بوضوح
- لا تُقدِّم أرقاماً أو نِسَباً من خارج السياق المُقدَّم`;
```

### 3.4 Session summary generation
After the last message in a session (detected by `isLastMessage: true` body param or 30-turn limit):
```js
async function generateSessionSummary(messages, adminSupabase, userId) {
  const summaryPrompt = `Summarize this orientation chat in 2-3 sentences in Arabic. 
Focus on: what the student asked about, what specialities/programs were discussed, any decisions made.
Chat: ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  // Use cheapest available provider for summary
  const summary = await generateText(summaryPrompt);
  
  await adminSupabase.from('chat_sessions').upsert({
    user_id: userId,
    summary,
    turn_count: messages.length,
    updated_at: new Date().toISOString()
  });
}
```

### 3.5 Token budget target
| Component | Tokens |
|-----------|--------|
| System prompt skeleton | ~200 |
| RAG context (5 chunks × 100 tokens) | ~500 |
| Conversation history (last 6 turns) | ~600 |
| **Total** | **~1,300** |

vs current **~6,000 tokens** → **4.6× reduction** in costs.

---

## Phase 4 — Deployment

### 4.1 Vercel environment variables (add to dashboard)
```
SUPABASE_URL=https://vfjjrpzdyvawthvkwelr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret — never commit>
GEMINI_API_KEY_1=<valid key — replace invalid one>
```

### 4.2 Deployment sequence
1. **Agent DB** runs SQL in Supabase dashboard → tables + function created
2. **Agent Data** runs `node scripts/embed-kb.js` locally → ~1,000 chunks embedded
3. **Agent Backend** rewrites `api/tawjihi-chat.js` → RAG retrieval replaces static imports
4. Push to `tawjihi` remote → merge PR → Vercel auto-deploys
5. Test: send query → verify `console.log` shows RAG hits → verify response quality

### 4.3 Rollback plan
If RAG degrades response quality: revert to static imports (the old `retrieve()` function is still in git history). RAG can be toggled with an env var `USE_RAG=true`.

---

## Agent Work Breakdown

| Agent | Task | Input | Output |
|-------|------|-------|--------|
| **Agent-DB** | Write + run SQL schema in Supabase | This plan | Tables + search function live in Supabase |
| **Agent-Data** | Write `scripts/embed-kb.js`, generate all embeddings | KB JSON files | ~1,000 rows in `kb_embeddings` |
| **Agent-Backend** | Rewrite `api/tawjihi-chat.js` | Current API file | Lean RAG-powered API, session summaries |

Agents can work in parallel once DB schema is live (Agent-Data and Agent-Backend both need the table to exist, but the script writes to it while the API reads from it — no conflict).

---

## Success Criteria

- [ ] System prompt tokens < 1,500 per request
- [ ] `all_providers_exhausted` error eliminated or dramatically reduced
- [ ] Response quality maintained (test with 10 sample queries)
- [ ] Session summaries stored in `chat_sessions` after each conversation
- [ ] `kb_embeddings` table has > 800 rows
- [ ] Cold query latency < 3 seconds (embedding + vector search + LLM)

---

## Notes

- **Gemini embedding is separate quota** from chat: 1,500 req/min free → embedding 1,000 docs takes < 1 minute
- **Publishable key** `sb_publishable_OoplMmN-mUbjASDk_dLycA_jT5Ej2Eq` — safe for client
- **Service role key** — NEVER in committed files, Vercel env only
- **BOM-encoding** in content files (UTF-8 BOM) — embedding script must use `fs.readFileSync(path, 'utf8').replace(/^﻿/, '')`
- **BAC surge deadline:** July 15-20 orientation window → must be live by July 13
