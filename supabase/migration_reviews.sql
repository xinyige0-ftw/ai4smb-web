-- Migration: add reviews table for product testimonials + preferences column on sessions

-- 1. Reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  text text default '',
  business_type text default '',
  display_name text default '',
  email text default '',
  is_anonymous boolean default true,
  consent_display boolean default false,
  consent_contact boolean default false,
  tools_used text[] default '{}',
  nps_score int check (nps_score is null or (nps_score >= 0 and nps_score <= 10)),
  campaigns_count int default 0,
  segments_count int default 0,
  approved boolean default false,
  created_at timestamptz default now()
);

create index if not exists reviews_approved_idx on reviews(approved, created_at desc);

-- RLS
alter table reviews enable row level security;

create policy "Anyone can read approved reviews"
  on reviews for select
  using (approved = true);

create policy "Users can insert their own reviews"
  on reviews for insert
  with check (true);

-- 2. Add preferences column to sessions (for saved preferences feature)
alter table sessions add column if not exists preferences jsonb default '{}';
