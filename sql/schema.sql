-- ================================================================
-- BAC STORY — Canonical Supabase Schema
-- ================================================================
-- Run this once in your Supabase SQL Editor on a fresh project.
-- Idempotent: safe to re-run after edits.
--
-- Tables:
--   1. otp_codes      — one-time codes for Email + Telegram OTP
--   2. ai_users       — student profile (display name, specialty)
--   3. ai_sessions    — long-lived bearer tokens (30 days)
--   4. chat_sessions  — one row per (user msg + AI reply) exchange
--   5. ai_usage       — per-user, per-mode, per-day rate-limit counter
--
-- Naming: we use "specialty" (American spelling) consistently.
-- ================================================================

-- ── 1. OTP codes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier  TEXT NOT NULL,              -- email lowercased OR telegram chat_id
    type        TEXT NOT NULL CHECK (type IN ('email','telegram')),
    code        TEXT NOT NULL,
    is_used     BOOLEAN DEFAULT FALSE,
    attempts    INTEGER DEFAULT 0,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otp_identifier_active
    ON public.otp_codes (identifier, is_used, created_at DESC);

-- ── 2. AI users (student profiles) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_users (
    id             UUID PRIMARY KEY,
    email          TEXT,
    display_name   TEXT NOT NULL,
    specialty      TEXT NOT NULL DEFAULT 'math'
                   CHECK (specialty IN
                          ('math','science','tech','management','literature','languages')),
    auth_method    TEXT NOT NULL CHECK (auth_method IN ('email','telegram')),
    telegram_id    TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_users_email       ON public.ai_users (email);
CREATE INDEX IF NOT EXISTS idx_ai_users_telegram_id ON public.ai_users (telegram_id);

-- ── 3. Auth sessions (bearer tokens) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_sessions (
    token        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES public.ai_users(id) ON DELETE CASCADE,
    user_email   TEXT,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id    ON public.ai_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_expires_at ON public.ai_sessions (expires_at);

-- ── 4. Chat history (one row per exchange) ──────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    TEXT NOT NULL,            -- groups exchanges into a conversation
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

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id    ON public.chat_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON public.chat_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions (created_at DESC);

-- ── 5. Daily rate-limit counters ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_usage (
    user_id  UUID NOT NULL REFERENCES public.ai_users(id) ON DELETE CASCADE,
    mode     TEXT NOT NULL CHECK (mode IN
                                  ('advisor','solver','corrector','summarizer')),
    date     DATE NOT NULL,
    count    INTEGER DEFAULT 0 NOT NULL,
    PRIMARY KEY (user_id, mode, date)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON public.ai_usage (date);

-- ================================================================
-- Row-Level Security
-- ================================================================
-- Because we authenticate via a custom bearer token (ai_sessions)
-- and ALL writes go through the service role, we leave RLS DISABLED
-- by default. If you switch to Supabase native auth later, enable
-- RLS and add policies keyed on auth.uid() = user_id.
-- ================================================================

-- ── Optional cleanup: run periodically (e.g. cron) ──────────────
-- DELETE FROM public.otp_codes      WHERE expires_at < NOW() - INTERVAL '1 day';
-- DELETE FROM public.ai_sessions    WHERE expires_at < NOW();
