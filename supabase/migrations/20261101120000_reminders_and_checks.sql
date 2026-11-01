-- Gap reminders and application check. Additive only: four new tables, no
-- change to existing tables or rows.
--
-- notification_prefs : opt-in reminder settings (default off for everyone)
-- notification_log   : one row per send attempt; written only by the server
-- user_breaks        : date ranges the gap rules ignore (max 20 per user)
-- finding_dismissals : hidden findings (30 days or permanent), plus the
--                      one-time reminder offer and the 7-day banner dismissal
--
-- Undo: drop table public.finding_dismissals, public.user_breaks,
--       public.notification_log, public.notification_prefs;
--       drop function public.enforce_break_limit();

begin;

-- ── notification_prefs ─────────────────────────────────────────────────
create table public.notification_prefs (
  user_id           uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  reminders_enabled boolean not null default false,
  gap_days          smallint not null default 14 check (gap_days in (7, 14, 30)),
  pause_in_breaks   boolean not null default true,
  unsubscribed_at   timestamptz,
  updated_at        timestamptz not null default now()
);
alter table public.notification_prefs enable row level security;
create policy notification_prefs_select_own on public.notification_prefs
  for select to authenticated using (user_id = auth.uid());
create policy notification_prefs_insert_own on public.notification_prefs
  for insert to authenticated with check (user_id = auth.uid());
create policy notification_prefs_update_own on public.notification_prefs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke all on public.notification_prefs from anon;
grant select, insert, update on public.notification_prefs to authenticated;

-- ── notification_log ───────────────────────────────────────────────────
-- send_day + the unique index make a double run on the same day impossible:
-- the second insert fails, so it never sends.
create table public.notification_log (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references auth.users (id) on delete cascade,
  kind      text not null check (kind in ('gap_reminder')),
  sent_at   timestamptz not null default now(),
  send_day  date not null default ((now() at time zone 'utc')::date),
  status    text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped'))
);
create unique index notification_log_one_per_day on public.notification_log (user_id, kind, send_day);
create index notification_log_user_sent on public.notification_log (user_id, sent_at desc);
alter table public.notification_log enable row level security;
-- Users may read their own history. No insert/update/delete policy: only the
-- service role (the cron job) writes here.
create policy notification_log_select_own on public.notification_log
  for select to authenticated using (user_id = auth.uid());
revoke all on public.notification_log from anon;
revoke insert, update, delete on public.notification_log from authenticated;
grant select on public.notification_log to authenticated;

-- ── user_breaks ────────────────────────────────────────────────────────
create table public.user_breaks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  start_date date not null check (start_date between date '2015-01-01' and date '2100-01-01'),
  end_date   date not null check (end_date between date '2015-01-01' and date '2100-01-01'),
  created_at timestamptz not null default now(),
  check (end_date >= start_date),
  check (end_date - start_date <= 400)
);
create index user_breaks_user on public.user_breaks (user_id);
alter table public.user_breaks enable row level security;
create policy user_breaks_select_own on public.user_breaks
  for select to authenticated using (user_id = auth.uid());
create policy user_breaks_insert_own on public.user_breaks
  for insert to authenticated with check (user_id = auth.uid());
create policy user_breaks_update_own on public.user_breaks
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy user_breaks_delete_own on public.user_breaks
  for delete to authenticated using (user_id = auth.uid());
revoke all on public.user_breaks from anon;
grant select, insert, update, delete on public.user_breaks to authenticated;

-- At most 20 breaks per user, enforced in the database as well as the app.
create or replace function public.enforce_break_limit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  perform pg_advisory_xact_lock(hashtext('user_breaks:' || new.user_id::text));
  if (select count(*) from public.user_breaks where user_id = new.user_id) >= 20 then
    raise exception 'break limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
revoke execute on function public.enforce_break_limit() from public, anon, authenticated;
create trigger user_breaks_limit before insert on public.user_breaks
  for each row execute function public.enforce_break_limit();

-- ── finding_dismissals ─────────────────────────────────────────────────
create table public.finding_dismissals (
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  finding_key     text not null check (finding_key ~ '^[a-z0-9:_+-]{1,200}$'),
  dismissed_until timestamptz,
  permanent       boolean not null default false,
  created_at      timestamptz not null default now(),
  primary key (user_id, finding_key),
  check (permanent or dismissed_until is not null)
);
alter table public.finding_dismissals enable row level security;
create policy finding_dismissals_select_own on public.finding_dismissals
  for select to authenticated using (user_id = auth.uid());
create policy finding_dismissals_insert_own on public.finding_dismissals
  for insert to authenticated with check (user_id = auth.uid());
create policy finding_dismissals_update_own on public.finding_dismissals
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy finding_dismissals_delete_own on public.finding_dismissals
  for delete to authenticated using (user_id = auth.uid());
revoke all on public.finding_dismissals from anon;
grant select, insert, update, delete on public.finding_dismissals to authenticated;

commit;
