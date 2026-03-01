-- Migration: add user_id to sessions for auth + guest→account merge
-- Run in Supabase Dashboard → SQL Editor after setting up Auth

-- 1. Add user_id column (nullable — guests have no user_id yet)
alter table sessions add column if not exists user_id uuid references auth.users(id) on delete set null;

-- 2. Index for fast user lookups
create index if not exists sessions_user_id_idx on sessions(user_id);

-- 3. Function: merge guest session into authed session
--    Called when a guest signs in — moves their campaigns/segments to the new session
create or replace function merge_guest_to_user(
  p_anon_id text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_guest_session_id uuid;
  v_user_session_id uuid;
begin
  -- Find the guest session
  select id into v_guest_session_id
  from sessions
  where anon_id = p_anon_id and user_id is null;

  if v_guest_session_id is null then return; end if;

  -- Find or create an authed session for this user
  select id into v_user_session_id
  from sessions
  where user_id = p_user_id
  limit 1;

  if v_user_session_id is null then
    -- First sign-in: just stamp the existing guest session with user_id
    update sessions
    set user_id = p_user_id, last_seen_at = now()
    where id = v_guest_session_id;
  else
    -- Returning user: move guest's work to their existing session
    update campaigns set session_id = v_user_session_id where session_id = v_guest_session_id;
    update segments  set session_id = v_user_session_id where session_id = v_guest_session_id;
    delete from sessions where id = v_guest_session_id;
  end if;
end;
$$;
