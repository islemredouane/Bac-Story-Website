-- =============================================================================
-- BAC STORY — Supabase PostgreSQL Schema
-- Platform: Algerian BAC Student Platform
-- Run in: Supabase Dashboard → SQL Editor
-- =============================================================================
-- SECURITY DESIGN NOTE:
-- RLS (Row Level Security) is intentionally DISABLED on `otp_codes` and
-- `sessions` because these tables are accessed exclusively via the server-side
-- API using the Supabase service role key — never from the client directly.
--
-- For all other tables, RLS is ENABLED but policies are intentionally
-- permissive (allow all). User isolation is enforced at the API layer: every
-- request authenticates the bearer token against the `sessions` table, and
-- all queries are scoped to the verified user_id in server-side code.
-- This avoids coupling business logic to Supabase Auth while still leaving
-- RLS as a safety net that can be tightened in the future.
-- =============================================================================


-- =============================================================================
-- UTILITY: auto-update `updated_at` on row changes
-- Applied to: users, chat_sessions
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- TABLE: users
-- Core user accounts. Supports Google OAuth and OTP (email / Telegram).
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email            TEXT        UNIQUE NOT NULL,
  name             TEXT        NOT NULL,

  -- Algerian BAC specialty stream (شعبة)
  specialty        TEXT        NOT NULL CHECK (specialty IN (
                                 'math',        -- رياضيات
                                 'science',     -- علوم تجريبية
                                 'tech',        -- تقني رياضي
                                 'management',  -- تسيير واقتصاد
                                 'literature',  -- آداب وفلسفة
                                 'languages'    -- لغات أجنبية
                               )),

  -- Optional: Algerian wilaya (province) for regional analytics
  wilaya           TEXT,

  -- External auth identifiers
  google_id        TEXT        UNIQUE,
  telegram_chat_id TEXT        UNIQUE,

  -- Premium subscription state
  is_premium       BOOLEAN     DEFAULT false,
  premium_until    TIMESTAMPTZ,             -- NULL means no active premium

  -- Onboarding wizard completion state
  onboarding_done  BOOLEAN     DEFAULT false,
  onboarding_data  JSONB       DEFAULT '{}', -- arbitrary onboarding step data

  -- Streak and Rewards System
  last_login_date  DATE,
  current_streak   INTEGER     DEFAULT 0,
  points           INTEGER     DEFAULT 0,

  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at on every write
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: enabled with permissive policy — API layer enforces user isolation
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_users"
  ON users FOR ALL
  USING (true) WITH CHECK (true);


-- =============================================================================
-- TABLE: otp_codes
-- Short-lived one-time passwords for passwordless auth (email or Telegram).
-- RLS DISABLED — accessed only via service role key on the server.
-- =============================================================================

CREATE TABLE IF NOT EXISTS otp_codes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier  TEXT        NOT NULL,  -- email address OR Telegram chat_id
  type        TEXT        NOT NULL CHECK (type IN ('email', 'telegram')),
  code        TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_used     BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS intentionally disabled — see security design note at top of file
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;

-- Index: rate-limit checks and code validation (check identifier + is_used together)
CREATE INDEX IF NOT EXISTS idx_otp_codes_identifier_used
  ON otp_codes (identifier, is_used);


-- =============================================================================
-- TABLE: sessions
-- API bearer tokens. 30-day lifetime, one token per login event.
-- RLS DISABLED — accessed only via service role key on the server.
-- =============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Bearer token sent in the Authorization header on every API request
  token      TEXT        UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,

  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS intentionally disabled — see security design note at top of file
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Index: primary lookup — every single API request validates the bearer token
CREATE INDEX IF NOT EXISTS idx_sessions_token
  ON sessions (token);

-- Index: look up all sessions for a user (e.g. logout-everywhere)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions (user_id);

-- Index: efficient cleanup of expired sessions via cron or background job
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON sessions (expires_at);


-- =============================================================================
-- TABLE: chat_sessions
-- Groups chat messages into named conversations per user.
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Display title shown in the conversation history sidebar
  title      TEXT        DEFAULT 'محادثة جديدة',

  -- AI mode controlling system prompt and behaviour
  -- e.g. 'advisor' | 'explainer' | 'quiz' | 'motivator'
  mode       TEXT        DEFAULT 'advisor',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()  -- bumped by API when new message arrives
);

-- Auto-update updated_at on every write
CREATE TRIGGER set_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS: enabled with permissive policy — API layer enforces user isolation
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_chat_sessions"
  ON chat_sessions FOR ALL
  USING (true) WITH CHECK (true);

-- Index: list a user's sessions ordered by most recently active
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated
  ON chat_sessions (user_id, updated_at DESC);


-- =============================================================================
-- TABLE: chat_messages
-- Individual turns within a chat session (user and assistant messages).
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: enabled with permissive policy — API layer enforces user isolation
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_chat_messages"
  ON chat_messages FOR ALL
  USING (true) WITH CHECK (true);

-- Index: paginate or stream messages within a session in chronological order
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON chat_messages (session_id, created_at);


-- =============================================================================
-- TABLE: ai_usage
-- Daily per-user message counter used for rate-limiting free-tier users.
-- One row per (user_id, date) — upserted on every outgoing message.
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_usage (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date          DATE    NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,

  UNIQUE (user_id, date)  -- enforces one row per user per day
);

-- RLS: enabled with permissive policy — API layer enforces user isolation
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_ai_usage"
  ON ai_usage FOR ALL
  USING (true) WITH CHECK (true);

-- Index: fast upsert and read for today's rate-limit gate check
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date
  ON ai_usage (user_id, date);


-- =============================================================================
-- TABLE: premium_activation_codes
-- Admin-generated codes redeemed by students to unlock premium features.
-- =============================================================================

CREATE TABLE IF NOT EXISTS premium_activation_codes (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- The opaque code string distributed to the student (should be unguessable)
  code             TEXT        UNIQUE NOT NULL,

  -- Admin who generated this code (email, name, or internal identifier)
  created_by_admin TEXT        NOT NULL,

  -- Set when a student redeems the code
  used_by          UUID        REFERENCES users(id),
  is_used          BOOLEAN     DEFAULT false,

  -- How many calendar days of premium access this code grants upon redemption
  duration_days    INTEGER     DEFAULT 30,

  created_at       TIMESTAMPTZ DEFAULT now(),
  used_at          TIMESTAMPTZ             -- NULL until redeemed
);

-- RLS: enabled with permissive policy — API layer enforces user isolation
ALTER TABLE premium_activation_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_premium_codes"
  ON premium_activation_codes FOR ALL
  USING (true) WITH CHECK (true);


-- =============================================================================
-- TABLE: ai_file_attachments
-- Files (PDFs, images, text) uploaded by users for AI context injection.
-- Extracted plain text is stored here; raw bytes live in Supabase Storage.
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_file_attachments (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- NULL = attachment applies globally across all sessions for this user
  session_id  UUID        REFERENCES chat_sessions(id) ON DELETE SET NULL,

  file_name   TEXT        NOT NULL,
  file_type   TEXT        NOT NULL,  -- MIME type, e.g. 'application/pdf'

  -- Extracted plain text injected as context into AI requests
  file_text   TEXT,

  -- Soft-delete flag: set false to remove from AI context without losing record
  is_active   BOOLEAN     DEFAULT true,

  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS: enabled with permissive policy — API layer enforces user isolation
ALTER TABLE ai_file_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_ai_file_attachments"
  ON ai_file_attachments FOR ALL
  USING (true) WITH CHECK (true);


-- =============================================================================
-- TABLE: quiz_results
-- Historical quiz and practice test scores per user for progress tracking.
-- =============================================================================

CREATE TABLE IF NOT EXISTS quiz_results (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Subject slug, e.g. 'mathematics', 'physics', 'arabic', 'history'
  subject    TEXT,

  score      INTEGER     NOT NULL,  -- number of correct answers
  total      INTEGER     NOT NULL,  -- total number of questions attempted

  -- Distinguishes quiz from exam simulation, flashcard review, etc.
  mode       TEXT        DEFAULT 'quiz',

  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: enabled with permissive policy — API layer enforces user isolation
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_quiz_results"
  ON quiz_results FOR ALL
  USING (true) WITH CHECK (true);


-- =============================================================================
-- TABLE: flashcard_decks
-- User-created or AI-generated flashcard sets stored as a JSONB array.
-- Card schema: [{ "front": "question / term", "back": "answer / definition" }]
-- =============================================================================

CREATE TABLE IF NOT EXISTS flashcard_decks (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,

  -- Subject slug, e.g. 'chemistry', 'history', 'english'
  subject    TEXT,

  -- Array of card objects: [{ "front": "...", "back": "..." }, ...]
  cards_json JSONB       NOT NULL DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: enabled with permissive policy — API layer enforces user isolation
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_flashcard_decks"
  ON flashcard_decks FOR ALL
  USING (true) WITH CHECK (true);


-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- increment_ai_usage: atomic upsert for daily message counting
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID, p_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO ai_usage (user_id, date, message_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET message_count = ai_usage.message_count + 1;
END;
$$;

-- Grant execute to service_role (used server-side only)
GRANT EXECUTE ON FUNCTION increment_ai_usage(UUID, DATE) TO service_role;


-- =============================================================================
-- END OF SCHEMA
-- All tables created. Run this file once against your Supabase project via:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
-- =============================================================================
