create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  undergraduate_school text,
  graduation_year integer,
  intended_specialty text,
  advisor_name text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can manage their own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
