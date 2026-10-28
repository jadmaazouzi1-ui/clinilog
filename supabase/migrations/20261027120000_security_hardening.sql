-- Security hardening (audit 2026-10-27).
-- Non-destructive: no table is dropped and no user row is deleted or changed.
-- Runs in one transaction; if any statement fails, nothing is applied.
--
-- AFTER running this, set the rate-limit secret ONCE (SQL editor), using the
-- same value as RATE_LIMIT_SECRET in Vercel:
--   insert into private.app_config (key, value) values ('rate_limit_secret', '<paste>')
--   on conflict (key) do update set value = excluded.value;

begin;

-- ── 0. Private config, unreachable through the API ──────────────────────────
-- "private" is not in the exposed PostgREST schemas, and no role but the
-- owner can read it, so the secret never leaves the database.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_config (
  key   text primary key,
  value text not null
);
alter table private.app_config enable row level security;
revoke all on private.app_config from public, anon, authenticated;

-- ── 1. handle_new_user: pin search_path, not callable over RPC ──────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ── 2. admin_insights: verified email from auth.users, not the JWT claim ───
create or replace function public.admin_insights()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  result jsonb;
begin
  if not exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(u.email) = 'jadmaazouzi1@gmail.com'
      and u.email_confirmed_at is not null
  ) then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'total_users',   (select count(*) from public.profiles),
    'total_hours',   coalesce((select sum(hours) from public.experiences), 0),
    'total_entries', (select count(*) from public.experiences),
    'weekly_active', (
      select count(distinct user_id) from public.experiences
      where created_at > now() - interval '7 days'
    ),
    'top_pages', coalesce((
      select jsonb_agg(row_to_json(t))
      from (
        select path, count(*) as visits
        from public.page_visits
        where visited_at > now() - interval '30 days'
        group by path order by count(*) desc limit 10
      ) t
    ), '[]'::jsonb),
    'signups_over_time', coalesce((
      select jsonb_agg(row_to_json(s))
      from (
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
               count(*) as signups
        from public.profiles
        where created_at > now() - interval '90 days'
        group by 1 order by 1
      ) s
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;
revoke execute on function public.admin_insights() from public, anon;
grant execute on function public.admin_insights() to authenticated;

-- ── 3. check_auth_rate_limit: require the server-held secret ────────────────
-- The old 4-argument version was callable by anyone with the public anon key,
-- so a stranger could burn another person's login or reset quota (lockout).
drop function if exists public.check_auth_rate_limit(text, text, integer, integer);

create or replace function public.check_auth_rate_limit(
  p_key text, p_action text, p_max integer, p_window_secs integer, p_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_secret text;
  v_count integer;
  v_reset timestamptz;
begin
  select value into v_secret from private.app_config where key = 'rate_limit_secret';
  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if p_key is null or length(p_key) = 0 or length(p_key) > 320
     or p_action is null or length(p_action) > 64
     or p_max < 1 or p_window_secs < 1 or p_window_secs > 604800 then
    return jsonb_build_object('allowed', true, 'remaining', p_max);
  end if;

  insert into public.auth_rate_limits (key, action, count, reset_at)
  values (p_key, p_action, 1, now() + make_interval(secs => p_window_secs))
  on conflict (key, action) do update set
    count = case when auth_rate_limits.reset_at < now()
                 then 1 else auth_rate_limits.count + 1 end,
    reset_at = case when auth_rate_limits.reset_at < now()
                    then now() + make_interval(secs => p_window_secs)
                    else auth_rate_limits.reset_at end
  returning count, reset_at into v_count, v_reset;

  return jsonb_build_object(
    'allowed', v_count <= p_max,
    'remaining', greatest(p_max - v_count, 0),
    'reset_at', v_reset
  );
end $$;
revoke execute on function public.check_auth_rate_limit(text, text, integer, integer, text) from public;
grant execute on function public.check_auth_rate_limit(text, text, integer, integer, text) to anon, authenticated;

-- ── 4. check_user_rate_limit: signed-in callers only ────────────────────────
revoke execute on function public.check_user_rate_limit(text, integer, integer) from public, anon;
grant execute on function public.check_user_rate_limit(text, integer, integer) to authenticated;

-- ── 5. Referrals: only through claim_referral() ─────────────────────────────
drop policy if exists referrals_insert_self on public.referrals;

create or replace function public.claim_referral(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid := auth.uid();
  v_referrer uuid;
begin
  if v_uid is null or p_code is null or length(p_code) > 12 then
    return false;
  end if;

  -- Only a new account with a confirmed email can be credited.
  if not exists (
    select 1 from auth.users u
    where u.id = v_uid
      and u.email_confirmed_at is not null
      and u.created_at > now() - interval '14 days'
  ) then
    return false;
  end if;

  select id into v_referrer from public.profiles where referral_code = upper(p_code);
  if v_referrer is null or v_referrer = v_uid then
    return false;
  end if;

  insert into public.referrals (referrer_id, referred_user_id)
  values (v_referrer, v_uid)
  on conflict (referred_user_id) do nothing;
  return found;
end;
$$;
revoke execute on function public.claim_referral(text) from public, anon;
grant execute on function public.claim_referral(text) to authenticated;

-- ── 6. Account deletion (Profile > Delete account) ─────────────────────────
-- Every user table cascades from auth.users, so this removes all their data.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ── 7. page_visits: cannot attribute visits to someone else ────────────────
drop policy if exists page_visits_insert_any on public.page_visits;
create policy page_visits_insert_any on public.page_visits
  for insert
  with check (user_id is null or user_id = auth.uid());

-- ── 8. waitlist_updates: the interview must belong to the caller ──────────
drop policy if exists waitlist_updates_insert_own on public.waitlist_updates;
create policy waitlist_updates_insert_own on public.waitlist_updates
  for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.interviews i where i.id = interview_id and i.user_id = auth.uid())
  );

drop policy if exists waitlist_updates_update_own on public.waitlist_updates;
create policy waitlist_updates_update_own on public.waitlist_updates
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.interviews i where i.id = interview_id and i.user_id = auth.uid())
  );

-- ── 9. story_submissions: signed-in only, blank undergrad allowed ─────────
-- The app now requires sign-in (and rate-limits) story submissions; the table
-- still accepted anonymous inserts straight through the API.
drop policy if exists "Anyone can submit a story" on public.story_submissions;
create policy "Signed-in users can submit a story" on public.story_submissions
  for insert to authenticated
  with check (true);

alter table public.story_submissions drop constraint if exists story_submissions_len;
alter table public.story_submissions add constraint story_submissions_len check (
  char_length(name) between 1 and 120
  and char_length(undergrad_school) <= 160
  and char_length(medical_school) between 1 and 160
  and char_length(background) <= 2000
  and char_length(quote) <= 2000
);

-- ── 10. Weekly digest opt-out ──────────────────────────────────────────────
alter table public.profiles add column if not exists digest_opt_out boolean not null default false;

commit;
