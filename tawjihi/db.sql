-- =============================================================================
-- Tawjihi — Supabase SQL Migration
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- =============================================================================


-- =============================================================================
-- SECTION 1: Updated_at trigger function (reused across multiple tables)
-- =============================================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =============================================================================
-- SECTION 2: profiles
-- Stores each user's onboarding data (stream, BAC average, wilaya, etc.)
-- =============================================================================

create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text,
  name        text,
  avatar_url  text,
  stream      text,                              -- e.g. 'علوم تجريبية', 'رياضيات'
  average     numeric(4,2),                      -- BAC average, e.g. 13.75
  wilaya      text,
  interests   jsonb       default '[]'::jsonb,   -- array of interest strings
  ambition    text,
  ambition_text text,
  completed   boolean     default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user selects own row"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: user inserts own row"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: user updates own row"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();


-- =============================================================================
-- SECTION 3: wishlists
-- Stores the user's ordered list of specialty IDs
-- =============================================================================

create table if not exists public.wishlists (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  spec_ids   jsonb       default '[]'::jsonb,   -- ordered array of specialty id strings
  updated_at timestamptz default now()
);

alter table public.wishlists enable row level security;

create policy "wishlists: user owns all operations"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger wishlists_updated_at
  before update on public.wishlists
  for each row execute function public.handle_updated_at();


-- =============================================================================
-- SECTION 4: credits
-- Tracks each user's AI credit balance. Mutations go through the
-- decrement_credit() RPC (security definer) — not direct UPDATE.
-- =============================================================================

create table if not exists public.credits (
  user_id      uuid        primary key references auth.users(id) on delete cascade,
  balance      integer     default 30,
  total_earned integer     default 30,
  total_spent  integer     default 0,
  updated_at   timestamptz default now()
);

alter table public.credits enable row level security;

create policy "credits: user selects own row"
  on public.credits for select
  using (auth.uid() = user_id);

-- UPDATE is intentionally not granted to authenticated; use decrement_credit() RPC.

create trigger credits_updated_at
  before update on public.credits
  for each row execute function public.handle_updated_at();


-- =============================================================================
-- SECTION 5: referral_codes
-- One referral code per user. Credit mutations via service_role only.
-- =============================================================================

create table if not exists public.referral_codes (
  id             uuid        default gen_random_uuid() primary key,
  owner_user_id  uuid        unique references auth.users(id) on delete cascade,
  code           text        unique not null,
  refs_count     integer     default 0,
  earned_credits integer     default 0,
  created_at     timestamptz default now()
);

alter table public.referral_codes enable row level security;

create policy "referral_codes: user selects own row"
  on public.referral_codes for select
  using (auth.uid() = owner_user_id);

-- INSERT/UPDATE are intentionally not granted to authenticated; service_role only.


-- =============================================================================
-- SECTION 6: chat_sessions
-- One session per conversation. id is a client-generated nanoid string.
-- =============================================================================

create table if not exists public.chat_sessions (
  id         text        primary key,   -- client-generated nanoid
  user_id    uuid        references auth.users(id) on delete cascade,
  title      text,
  created_at timestamptz default now()
);

alter table public.chat_sessions enable row level security;

create policy "chat_sessions: user owns all operations"
  on public.chat_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =============================================================================
-- SECTION 7: chat_messages
-- Individual messages within a chat session.
-- =============================================================================

create table if not exists public.chat_messages (
  id         uuid        default gen_random_uuid() primary key,
  session_id text        references public.chat_sessions(id) on delete cascade,
  user_id    uuid        references auth.users(id) on delete cascade,
  role       text        check (role in ('user', 'assistant')),
  content    text,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages: user owns all operations"
  on public.chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =============================================================================
-- SECTION 8: config
-- Global key/value config readable by anyone; mutations via service_role only.
-- =============================================================================

create table if not exists public.config (
  key        text        primary key,
  value      text,
  updated_at timestamptz default now()
);

alter table public.config enable row level security;

create policy "config: anyone can select"
  on public.config for select
  using (true);

-- INSERT/UPDATE are intentionally not granted to authenticated; service_role only.

create trigger config_updated_at
  before update on public.config
  for each row execute function public.handle_updated_at();

-- Default config rows
insert into public.config (key, value)
values ('bac_results_date', '2026-07-20T10:00:00')
on conflict (key) do nothing;


-- =============================================================================
-- SECTION 9: decrement_credit() RPC
-- Atomically decrements balance by 1. Returns TRUE if successful, FALSE if
-- the user had no credits. Called from the Vercel serverless functions.
-- =============================================================================

create or replace function public.decrement_credit(uid uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  rows_updated integer;
begin
  update public.credits
  set balance     = balance - 1,
      total_spent = total_spent + 1,
      updated_at  = now()
  where user_id = uid
    and balance > 0;

  get diagnostics rows_updated = row_count;
  return rows_updated > 0;
end;
$$;

grant execute on function public.decrement_credit(uuid) to authenticated;


-- =============================================================================
-- SECTION 10: increment_credits() RPC
-- Adds `amount` credits to a user. Used by the referral system (service_role).
-- Not callable by authenticated users directly — called from Vercel backend only.
-- =============================================================================

create or replace function public.increment_credits(uid uuid, amount integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.credits
  set balance      = balance + amount,
      total_earned = total_earned + amount,
      updated_at   = now()
  where user_id = uid;
end;
$$;

-- Intentionally NOT granted to authenticated — only service_role can call this.


-- =============================================================================
-- SECTION 11: INSERT policies for client-side new-user provisioning
-- Credits and referral_codes rows are created on first login (client-side).
-- The with-check constraints prevent abuse (cannot set arbitrary balance).
-- =============================================================================

create policy "credits: user inserts own row"
  on public.credits for insert
  with check (
    auth.uid() = user_id
    and balance = 30
    and total_earned = 30
    and total_spent = 0
  );

create policy "referral_codes: user inserts own row"
  on public.referral_codes for insert
  with check (auth.uid() = owner_user_id);


-- =============================================================================
-- SECTION 12: Daily credit renewal
-- Adds last_refilled_at to credits, plus ensure_daily_credits(uid) RPC.
-- Called from the chat API before every message — atomically resets balance
-- to 30 if 24 hours have elapsed since the last refill.
-- =============================================================================

alter table public.credits
  add column if not exists last_refilled_at timestamptz default now();

-- Backfill: existing rows get now() so the 24h clock starts today.
update public.credits
  set last_refilled_at = now()
  where last_refilled_at is null;

-- Returns current balance (after any refill). Called from serverless functions
-- (service_role). NOT granted to authenticated users.
create or replace function public.ensure_daily_credits(uid uuid)
returns integer
language plpgsql
security definer
as $$
declare
  v_balance        integer;
  v_last_refilled  timestamptz;
begin
  select balance, last_refilled_at
    into v_balance, v_last_refilled
    from public.credits
   where user_id = uid;

  if not found then
    return 0;  -- row not yet provisioned; chat API will block with 402
  end if;

  if v_last_refilled is null or (now() - v_last_refilled) >= interval '24 hours' then
    update public.credits
       set balance          = 30,
           last_refilled_at = now(),
           updated_at       = now()
     where user_id = uid;
    return 30;
  end if;

  return v_balance;
end;
$$;

-- intentionally NOT granted to authenticated — service_role only.
