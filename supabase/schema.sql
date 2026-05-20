-- experiences table with RLS
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  organization text not null,
  type text not null check (type in ('shadowing', 'volunteer', 'clinical_work', 'research', 'other')),
  start_date date not null,
  end_date date,
  hours numeric(6,1) not null check (hours > 0),
  description text not null,
  reflection text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table experiences enable row level security;

create policy "Users can manage their own experiences"
  on experiences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
