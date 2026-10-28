-- Only Wake Forest addresses can create an account or switch an account to a
-- new email. Enforced on auth.users itself, so it holds even for calls made
-- straight to the Supabase Auth API with the public anon key. Existing
-- accounts are untouched; the update trigger fires only when the email changes.
--
-- Undo: drop trigger enforce_wfu_email_insert on auth.users;
--       drop trigger enforce_wfu_email_update on auth.users;
--       drop function public.enforce_wfu_email();

begin;

create or replace function public.enforce_wfu_email()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if new.email is null or lower(new.email) not like '%@wfu.edu' then
    raise exception 'Sign-up is limited to @wfu.edu email addresses'
      using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke execute on function public.enforce_wfu_email() from public, anon, authenticated;

drop trigger if exists enforce_wfu_email_insert on auth.users;
create trigger enforce_wfu_email_insert
  before insert on auth.users
  for each row execute function public.enforce_wfu_email();

drop trigger if exists enforce_wfu_email_update on auth.users;
create trigger enforce_wfu_email_update
  before update of email on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute function public.enforce_wfu_email();

commit;
