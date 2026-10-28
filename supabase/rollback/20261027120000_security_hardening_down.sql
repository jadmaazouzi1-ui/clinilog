-- Rollback for 20261027120000_security_hardening.sql. Recreates the exact
-- definitions captured from the live database before the migration ran.
-- Run only if the hardening migration must be undone.

begin;

drop function if exists public.claim_referral(text);
drop function if exists public.delete_my_account();
drop function if exists public.check_auth_rate_limit(text, text, integer, integer, text);

create or replace function public.check_auth_rate_limit(p_key text, p_action text, p_max integer, p_window_secs integer)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare
  v_count integer;
  v_reset timestamptz;
begin
  if p_key is null or length(p_key) = 0 or length(p_key) > 320 then
    return jsonb_build_object('allowed', true, 'remaining', p_max);
  end if;

  insert into auth_rate_limits (key, action, count, reset_at)
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
end $function$;
grant execute on function public.check_auth_rate_limit(text, text, integer, integer) to public, anon, authenticated;

grant execute on function public.check_user_rate_limit(text, integer, integer) to public, anon;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $function$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$function$;
grant execute on function public.handle_new_user() to public, anon, authenticated;

create or replace function public.admin_insights()
returns jsonb language plpgsql security definer set search_path to 'public', 'pg_catalog' as $function$
declare
  caller_email text;
  result jsonb;
begin
  caller_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if caller_email <> 'jadmaazouzi1@gmail.com' then
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
$function$;
grant execute on function public.admin_insights() to public, anon;

create policy referrals_insert_self on public.referrals for insert with check (auth.uid() = referred_user_id);

drop policy if exists page_visits_insert_any on public.page_visits;
create policy page_visits_insert_any on public.page_visits for insert with check (true);

drop policy if exists waitlist_updates_insert_own on public.waitlist_updates;
create policy waitlist_updates_insert_own on public.waitlist_updates for insert with check (auth.uid() = user_id);
drop policy if exists waitlist_updates_update_own on public.waitlist_updates;
create policy waitlist_updates_update_own on public.waitlist_updates for update using (auth.uid() = user_id);

drop policy if exists "Signed-in users can submit a story" on public.story_submissions;
create policy "Anyone can submit a story" on public.story_submissions for insert with check (true);

-- Constraint and digest_opt_out column are left in place: the looser
-- constraint and an extra column are harmless and dropping data is not.

commit;
