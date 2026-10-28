-- Store only a SHA-256 fingerprint of RATE_LIMIT_SECRET, never the secret
-- itself. The function hashes what the server sends and compares. Rotating
-- the secret means updating the fingerprint row:
--   update private.app_config set value = '<sha256 hex of new secret>'
--   where key = 'rate_limit_secret_sha256';

begin;

create or replace function public.check_auth_rate_limit(
  p_key text, p_action text, p_max integer, p_window_secs integer, p_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_hash text;
  v_count integer;
  v_reset timestamptz;
begin
  select value into v_hash from private.app_config where key = 'rate_limit_secret_sha256';
  if v_hash is null or p_secret is null
     or encode(sha256(convert_to(p_secret, 'UTF8')), 'hex') <> v_hash then
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

insert into private.app_config (key, value)
values ('rate_limit_secret_sha256', 'c03cdf02a4ec0d0f41c9629547f0c4994eb29b32cabe81de9f12811e10fb8b9e')
on conflict (key) do update set value = excluded.value;

commit;
