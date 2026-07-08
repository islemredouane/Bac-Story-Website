-- =============================================================================
-- Migration: 001_rag_schema.sql
-- Project:   Tawjihi AI — Algerian university orientation assistant
-- Purpose:   pgvector RAG knowledge base + chat session tracking
-- Safe:      Fully idempotent — no data loss, run multiple times safely
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Extension
-- -----------------------------------------------------------------------------

create extension if not exists vector;


-- -----------------------------------------------------------------------------
-- 2. Knowledge-base embeddings table
-- -----------------------------------------------------------------------------
--
-- source values (convention):
--   'speciality' — individual university speciality entry
--   'program'    — study program description
--   'rule'       — eligibility / admission rule (MESRS circular)
--   'content'    — general orientation content / FAQ
--   'geo'        — geographic circle / wilaya mapping
--   'filiere'    — filiere-level description

create table if not exists kb_embeddings (
  id          bigserial primary key,
  source      text        not null,        -- category tag (see above)
  source_id   text        not null,        -- slug / ID of the originating record
  chunk_index integer     not null default 0,  -- order within a multi-chunk document
  content     text        not null,        -- raw text sent to the embedder
  metadata    jsonb       not null default '{}',  -- arbitrary extra fields (filiere, wilaya, …)
  embedding   vector(768) not null,        -- Gecko / Multilingual-E5 768-dim vectors
  created_at  timestamptz not null default now()
);

-- HNSW index — fast approximate cosine-similarity search
-- m=16 balances recall vs. memory; ef_construction=64 is a solid build-time default
create index if not exists kb_embeddings_hnsw_idx
  on kb_embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Composite index for cache-invalidation queries (delete/refresh by source)
create index if not exists kb_embeddings_source_idx
  on kb_embeddings (source, source_id);

-- Unique index required by the embed-kb.js upsert (onConflict: source,source_id,chunk_index)
create unique index if not exists kb_embeddings_upsert_idx
  on kb_embeddings (source, source_id, chunk_index);


-- -----------------------------------------------------------------------------
-- 3. Chat sessions table
-- -----------------------------------------------------------------------------
--
-- Tracks per-user conversation context for summarisation and token budgeting.
-- user_id is nullable so anonymous (pre-login) sessions can still be stored
-- locally — set it once the user authenticates.

create table if not exists chat_sessions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete cascade,
  summary     text,                        -- rolling LLM-generated summary
  turn_count  integer     not null default 0,
  tokens_used integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Fast per-user lookup (feeds the session list view)
create index if not exists chat_sessions_user_idx
  on chat_sessions (user_id);


-- -----------------------------------------------------------------------------
-- 4. search_kb — cosine-similarity retrieval function
-- -----------------------------------------------------------------------------
--
-- Returns the top-K chunks whose cosine similarity to query_embedding meets
-- or exceeds match_threshold, optionally filtered to a single source category.
--
-- Usage example:
--   select * from search_kb(
--     query_embedding  => '[0.01, 0.02, ...]'::vector(768),
--     match_threshold  => 0.72,
--     match_count      => 5,
--     source_filter    => 'speciality'
--   );

create or replace function search_kb(
  query_embedding  vector(768),
  match_threshold  float   default 0.70,
  match_count      int     default 5,
  source_filter    text    default null
)
returns table (
  id          bigint,
  source      text,
  source_id   text,
  content     text,
  metadata    jsonb,
  similarity  float
)
language sql
stable
as $$
  select
    ke.id,
    ke.source,
    ke.source_id,
    ke.content,
    ke.metadata,
    1 - (ke.embedding <=> query_embedding) as similarity
  from kb_embeddings ke
  where
    -- cosine distance threshold (lower distance = higher similarity)
    (ke.embedding <=> query_embedding) < (1 - match_threshold)
    -- optional source filter
    and (source_filter is null or ke.source = source_filter)
  order by ke.embedding <=> query_embedding
  limit match_count;
$$;


-- -----------------------------------------------------------------------------
-- 5. Row Level Security
-- -----------------------------------------------------------------------------

-- kb_embeddings -----------------------------------------------------------
alter table kb_embeddings enable row level security;

-- Public read: KB data contains no PII, so anyone (including anon) may read
drop policy if exists "kb_embeddings: public select" on kb_embeddings;
create policy "kb_embeddings: public select"
  on kb_embeddings
  for select
  using (true);

-- Write access restricted to service role (ingestion pipeline, server-side)
drop policy if exists "kb_embeddings: service role write" on kb_embeddings;
create policy "kb_embeddings: service role write"
  on kb_embeddings
  for all                             -- INSERT, UPDATE, DELETE
  using      (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


-- chat_sessions -----------------------------------------------------------
alter table chat_sessions enable row level security;

-- Users may only access their own sessions
drop policy if exists "chat_sessions: owner select" on chat_sessions;
create policy "chat_sessions: owner select"
  on chat_sessions
  for select
  using (auth.uid() = user_id);

drop policy if exists "chat_sessions: owner insert" on chat_sessions;
create policy "chat_sessions: owner insert"
  on chat_sessions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "chat_sessions: owner update" on chat_sessions;
create policy "chat_sessions: owner update"
  on chat_sessions
  for update
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "chat_sessions: owner delete" on chat_sessions;
create policy "chat_sessions: owner delete"
  on chat_sessions
  for delete
  using (auth.uid() = user_id);
