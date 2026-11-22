-- Record which version of the Terms and Privacy Policy each user accepted,
-- and finish account deletion for the two places it missed.
--
-- 1. profiles.legal_version / legal_accepted_at. Users can read their own
--    row under the existing RLS policy, but cannot write these two columns
--    directly: accept_legal() sets them, with the server's clock.
-- 2. Sign-up has no session yet (email confirmation comes first), so the
--    sign-up form puts the accepted version in the user's metadata and
--    handle_new_user() copies it to the profile, only if it is a known
--    version string, with the time the account was created.
-- 3. delete_my_account() now also removes the user's page_visits rows
--    (they were kept with user_id set to null) and the password-reset rate
--    limit row keyed by their email address.

alter table public.profiles
  add column if not exists legal_version text,
  add column if not exists legal_accepted_at timestamptz;

-- Users may update their own profile, but not these two columns. A column
-- revoke has no effect while a table-wide UPDATE grant exists, so the grant
-- is replaced with one that lists every other column.
revoke update on public.profiles from authenticated, anon;
grant update (
  id, full_name, undergraduate_school, graduation_year, intended_specialty, onboarding_complete,
  archetype_id, archetype_data, archetype_generated_at, created_at, updated_at,
  committee_letter_required, committee_letter_status, committee_letter_notes, referral_code,
  amcas_target_date, theme, last_recap_month, digest_opt_out
) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_version text := new.raw_user_meta_data ->> 'legal_version';
begin
  if v_version is not null and v_version !~ '^\d{4}-\d{2}-\d{2}$' then
    v_version := null;
  end if;
  insert into public.profiles (id, legal_version, legal_accepted_at)
  values (new.id, v_version, case when v_version is null then null else now() end);
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.accept_legal(p_version text)
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
  if p_version is null or p_version !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'invalid version' using errcode = '22023';
  end if;
  update public.profiles
     set legal_version = p_version, legal_accepted_at = now()
   where id = v_uid;
  -- Mirror into the user's metadata so the request proxy can check the
  -- version without a database query on every page.
  update auth.users
     set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('legal_version', p_version)
   where id = v_uid;
end;
$$;
revoke execute on function public.accept_legal(text) from public, anon;
grant execute on function public.accept_legal(text) to authenticated;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  select lower(email) into v_email from auth.users where id = v_uid;
  delete from public.page_visits where user_id = v_uid;
  if v_email is not null then
    delete from public.auth_rate_limits where key = 'email:' || v_email;
  end if;
  -- Every other user table cascades from auth.users.
  delete from auth.users where id = v_uid;
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
