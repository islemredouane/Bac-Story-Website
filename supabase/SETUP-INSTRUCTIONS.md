# Supabase pgvector Setup Instructions

Project: **Tawjihi AI** — Algerian university orientation assistant  
Supabase URL: `https://vfjjrpzdyvawthvkwelr.supabase.co`

---

## What this migration creates

| Object | Type | Purpose |
|--------|------|---------|
| `vector` | Extension | pgvector — enables `vector` column type and ANN indexes |
| `kb_embeddings` | Table | Knowledge-base chunks with 768-dim embeddings |
| `kb_embeddings_hnsw_idx` | HNSW index | Fast approximate cosine-similarity search |
| `kb_embeddings_source_idx` | B-tree index | Fast cache-invalidation by `(source, source_id)` |
| `chat_sessions` | Table | Per-user conversation context, token budget |
| `chat_sessions_user_idx` | B-tree index | Fast per-user session lookup |
| `search_kb` | Function | Top-K cosine-similarity retrieval with optional source filter |

RLS is enabled on both tables with the policies described at the end of this file.

---

## Step-by-step

### 1. Open the SQL Editor

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and open your **Tawjihi** project.
2. In the left sidebar click **SQL Editor**.
3. Click **+ New query** (top-left of the editor pane).

### 2. Run the migration

1. Open the file `supabase/migrations/001_rag_schema.sql` from this repository.
2. Copy the entire contents.
3. Paste into the SQL Editor query window.
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).

You should see a success message in the results panel. The migration is **idempotent** — running it multiple times is safe and will not drop or truncate any existing data.

### 3. Verify tables exist

1. In the left sidebar click **Table Editor**.
2. You should see two new tables: `kb_embeddings` and `chat_sessions`.
3. Click each table to confirm the columns match the schema above.

### 4. Verify the search_kb function

1. In the left sidebar click **Database** → **Functions**.
2. You should see `search_kb` listed with schema `public`.
3. Optionally click it to inspect the signature:
   ```
   search_kb(
     query_embedding  vector(768),
     match_threshold  float   = 0.70,
     match_count      int     = 5,
     source_filter    text    = null
   )
   ```

### 5. Verify the HNSW index

1. In the left sidebar click **Database** → **Indexes**.
2. Confirm `kb_embeddings_hnsw_idx` is present with method `hnsw`.

---

## RLS policy summary

### kb_embeddings

| Policy | Operation | Rule |
|--------|-----------|------|
| `kb_embeddings: public select` | SELECT | `true` — anyone (incl. anon) may read KB data |
| `kb_embeddings: service role write` | INSERT / UPDATE / DELETE | `auth.role() = 'service_role'` — only the backend ingestion pipeline |

### chat_sessions

| Policy | Operation | Rule |
|--------|-----------|------|
| `chat_sessions: owner select` | SELECT | `auth.uid() = user_id` |
| `chat_sessions: owner insert` | INSERT | `auth.uid() = user_id` |
| `chat_sessions: owner update` | UPDATE | `auth.uid() = user_id` |
| `chat_sessions: owner delete` | DELETE | `auth.uid() = user_id` |

---

## Environment variables needed by the app

After setup, make sure your deployment environment (Vercel / local `.env`) has:

```
SUPABASE_URL=https://vfjjrpzdyvawthvkwelr.supabase.co
SUPABASE_ANON_KEY=<your anon/public key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>   # server-side ingestion only
```

Find these under **Project Settings → API** in the Supabase dashboard.

> **Security note:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit it to git. It bypasses all RLS policies.
