-- AI4SMB Insights: initial schema for sessions, campaigns, segments
-- Run once in Supabase Dashboard → SQL Editor → New query

create extension if not exists "uuid-ossp";

create table sessions (
  id uuid default uuid_generate_v4() primary key,
  anon_id text unique not null,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

create table campaigns (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade,
  business_type text,
  business_name text,
  goal text,
  budget text,
  channels text[],
  result jsonb not null,
  name text,
  created_at timestamptz default now()
);

create table segments (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references sessions(id) on delete cascade,
  mode text not null default 'csv',
  result jsonb not null,
  meta_label text,
  name text,
  created_at timestamptz default now()
);

alter table sessions enable row level security;
alter table campaigns enable row level security;
alter table segments enable row level security;
