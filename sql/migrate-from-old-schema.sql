-- ================================================================
-- BAC STORY — One-time migration from the OLD schemas
-- ================================================================
-- Run this ONCE in Supabase SQL Editor if you previously ran either
-- of the old scripts (database_setup.sql or supabase-schema.sql).
--
-- What this does:
--   1. Drops the broken `chat_sessions` and `ai_usage` tables
--      (they have wrong column names / wrong foreign keys).
--   2. Drops their RLS policies (they reference auth.uid(), which
--      doesn't apply to our custom session-token auth system).
--   3. Recreates both tables with the canonical schema.
--
-- WARNING: This deletes any rows you have in chat_sessions and
-- ai_usage. Since you haven't launched yet, that's fine. If you
-- somehow have real data, export it first.
--
-- After this script, run sql/schema.sql to ensure all 5 tables
-- exist with the correct shape (the IF NOT EXISTS guards make
-- it safe even though the other 3 tables already exist).
-- ================================================================

-- ── 1. Drop RLS policies (clean slate) ──────────────────────────
DROP POLICY IF EXISTS "own_sessions_select" ON public.chat_sessions;
DROP POLICY IF EXISTS "own_sessions_insert" ON public.chat_sessions;
DROP POLICY IF EXISTS "own_usage_select"    ON public.ai_usage;

-- ── 2. Drop the broken tables ───────────────────────────────────
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.ai_usage      CASCADE;

-- ── 3. Recreate chat_sessions with correct schema ───────────────
CREATE TABLE public.chat_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    TEXT NOT NULL,
    user_id       UUID NOT NULL REFERENCES public.ai_users(id) ON DELETE CASCADE,
    user_email    TEXT,
    mode          TEXT NOT NULL CHECK (mode IN
                                       ('advisor','solver','corrector','summarizer')),
    specialty     TEXT,
    title         TEXT DEFAULT 'محادثة جديدة',
    user_message  TEXT,
    ai_reply      TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_chat_sessions_user_id    ON public.chat_sessions (user_id);
CREATE INDEX idx_chat_sessions_session_id ON public.chat_sessions (session_id);
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions (created_at DESC);

-- ── 4. Recreate ai_usage with correct foreign key ───────────────
CREATE TABLE public.ai_usage (
    user_id  UUID NOT NULL REFERENCES public.ai_users(id) ON DELETE CASCADE,
    mode     TEXT NOT NULL CHECK (mode IN
                                  ('advisor','solver','corrector','summarizer')),
    date     DATE NOT NULL,
    count    INTEGER DEFAULT 0 NOT NULL,
    PRIMARY KEY (user_id, mode, date)
);

CREATE INDEX idx_ai_usage_date ON public.ai_usage (date);

-- ================================================================
-- Done. After this runs:
--   - chat_sessions has the right columns (specialty, title, user_email)
--   - ai_usage points its FK at ai_users (not auth.users)
--   - No RLS policies remain (service role bypasses RLS anyway, and
--     auth.uid()-based policies don't work with our custom tokens)
--
-- Your existing otp_codes, ai_users, ai_sessions tables are
-- untouched — they were already correct.
-- ================================================================
