-- Guided tour progress and Help Center feedback. Additive only.
--
-- tour_progress: one row per user per tour module. Reserved module ids that
-- start with "_" hold settings: _offer (the one-time tour card), _tips_off
-- (status 'completed' means tips are off) and _changelog_note.
-- feedback: write-only for users; read it in the Supabase dashboard.
--
-- Undo: drop table public.tour_progress; drop table public.feedback;

begin;

create table if not exists public.tour_progress (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  module_id  text not null check (module_id ~ '^_?[a-z][a-z0-9_-]{0,39}$'),
  status     text not null check (status in ('not_started', 'in_progress', 'completed', 'dismissed')),
  last_step  smallint not null default 0 check (last_step between 0 and 20),
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.tour_progress enable row level security;

create policy tour_progress_select_own on public.tour_progress
  for select to authenticated using (user_id = auth.uid());
create policy tour_progress_insert_own on public.tour_progress
  for insert to authenticated with check (user_id = auth.uid());
create policy tour_progress_update_own on public.tour_progress
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tour_progress_delete_own on public.tour_progress
  for delete to authenticated using (user_id = auth.uid());

revoke all on public.tour_progress from anon;
grant select, insert, update, delete on public.tour_progress to authenticated;

create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('problem', 'idea')),
  message    text not null check (char_length(message) between 1 and 1000),
  page       text check (page is null or char_length(page) <= 200),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Insert only. No select, update or delete policy: users cannot read back
-- anyone's feedback, including their own, through the API.
create policy feedback_insert_own on public.feedback
  for insert to authenticated with check (user_id = auth.uid());

revoke all on public.feedback from anon;
grant insert on public.feedback to authenticated;

commit;
