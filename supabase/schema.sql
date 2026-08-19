-- Briefs table
create table briefs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by text not null,
  client_name text not null,
  client_slug text not null,
  prospect_url text,
  expires_at timestamp with time zone,
  published boolean default false,
  sections jsonb not null default '{}'
);

-- Change log table
create table brief_changes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  brief_id uuid references briefs(id) on delete cascade,
  changed_by text not null,
  section_key text not null,
  field text not null,
  old_value text,
  new_value text
);

-- RLS policies
alter table briefs enable row level security;
alter table brief_changes enable row level security;

-- Scorpion users can read all briefs
create policy "scorpion users can read briefs"
  on briefs for select
  using (auth.jwt() ->> 'email' like '%@scorpion.co');

-- Scorpion users can insert briefs
create policy "scorpion users can insert briefs"
  on briefs for insert
  with check (auth.jwt() ->> 'email' like '%@scorpion.co');

-- Scorpion users can update briefs
create policy "scorpion users can update briefs"
  on briefs for update
  using (auth.jwt() ->> 'email' like '%@scorpion.co');

-- Scorpion users can read change log
create policy "scorpion users can read changes"
  on brief_changes for select
  using (auth.jwt() ->> 'email' like '%@scorpion.co');

-- Scorpion users can insert change log
create policy "scorpion users can insert changes"
  on brief_changes for insert
  with check (auth.jwt() ->> 'email' like '%@scorpion.co');
