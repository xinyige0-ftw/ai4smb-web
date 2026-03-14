-- Migration: enrich sessions table to track anonymous visitors
-- Run in Supabase Dashboard → SQL Editor

-- 1. Add tracking columns
alter table sessions add column if not exists locale text default 'en';
alter table sessions add column if not exists user_agent text;
alter table sessions add column if not exists actions_count int default 0;
alter table sessions add column if not exists campaigns_count int default 0;
alter table sessions add column if not exists segments_count int default 0;
alter table sessions add column if not exists chats_count int default 0;
alter table sessions add column if not exists last_action text;
alter table sessions add column if not exists referrer text;
alter table sessions add column if not exists ip_hash text;
alter table sessions add column if not exists business_type text;
alter table sessions add column if not exists business_name text;
alter table sessions add column if not exists location text;

-- 2. RPC to increment a counter column on sessions
create or replace function increment_counter(p_id uuid, p_col text)
returns void
language plpgsql
security definer
as $$
begin
  execute format(
    'update sessions set actions_count = actions_count + 1, %I = %I + 1 where id = $1',
    p_col, p_col
  ) using p_id;
end;
$$;

-- 3. Allow public reads for the sessions table (for admin queries)
-- RLS is already enabled; add a service-role-only policy if not exists
-- (service key bypasses RLS, so no policy needed for server-side reads)

-- 3. Useful indexes
create index if not exists sessions_last_seen_idx on sessions(last_seen_at desc);
create index if not exists sessions_created_at_idx on sessions(created_at desc);

-- 4. View for quick anonymous user stats
-- Simple session view
create or replace view anonymous_activity as
select
  id,
  anon_id,
  user_id,
  business_type,
  business_name,
  location,
  locale,
  actions_count,
  campaigns_count,
  segments_count,
  chats_count,
  last_action,
  ip_hash,
  created_at,
  last_seen_at,
  case when user_id is not null then 'authenticated' else 'anonymous' end as user_type
from sessions
order by last_seen_at desc;

-- Full admin dashboard view: sessions + their reviews + user info
create or replace view admin_dashboard as
select
  s.id as session_id,
  s.anon_id,
  s.user_id,
  u.email,
  u.full_name,
  coalesce(s.business_type, u.business_type) as business_type,
  s.business_name,
  s.location,
  s.locale,
  s.actions_count,
  s.campaigns_count,
  s.segments_count,
  s.chats_count,
  s.last_action,
  s.ip_hash,
  s.created_at as first_seen,
  s.last_seen_at,
  case when s.user_id is not null then 'authenticated' else 'anonymous' end as user_type,
  r.rating as review_rating,
  r.nps_score as review_nps,
  r.text as review_text,
  r.display_name as review_name,
  r.created_at as review_date
from sessions s
left join users u on u.id = s.user_id
left join lateral (
  select rating, nps_score, text, display_name, created_at
  from reviews
  where reviews.session_id = s.id
  order by created_at desc
  limit 1
) r on true
order by s.last_seen_at desc;
