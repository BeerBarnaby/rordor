begin;

-- Limit the lifetime and number of bearer sessions exposed to a browser.
alter table public.game_sessions
  alter column expires_at set default (now() + interval '7 days');

-- Reject physically implausible instant completions at the storage boundary.
alter table public.game_attempts
  add constraint game_attempts_minimum_duration
  check (total_time_seconds >= 20) not valid;

create or replace function public.register_game_player(
  p_phone text,
  p_display_name text,
  p_pin text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text;
  v_name text;
  v_player_id uuid;
  v_token text;
begin
  v_phone := public.normalize_thai_mobile(p_phone);
  v_name := btrim(coalesce(p_display_name, ''));

  if v_phone !~ '^0[689][0-9]{8}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_phone');
  end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4,8}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_pin');
  end if;
  if char_length(v_name) not between 2 and 24 or v_name ~ '[[:cntrl:]]' then
    return jsonb_build_object('ok', false, 'error', 'invalid_display_name');
  end if;

  insert into public.game_players (phone_normalized, display_name, pin_hash)
  values (
    v_phone,
    v_name,
    extensions.crypt(p_pin, extensions.gen_salt('bf', 8))
  )
  on conflict (phone_normalized) do nothing
  returning id into v_player_id;

  if v_player_id is null then
    return jsonb_build_object('ok', false, 'error', 'phone_exists');
  end if;

  delete from public.game_sessions where expires_at <= now();

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.game_sessions (player_id, token_hash)
  values (v_player_id, encode(extensions.digest(v_token, 'sha256'), 'hex'));

  return jsonb_build_object(
    'ok', true,
    'session_token', v_token,
    'player', public.game_player_profile(v_player_id)
  );
end;
$$;

create or replace function public.login_game_player(p_phone text, p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text;
  v_player public.game_players%rowtype;
  v_token text;
begin
  v_phone := public.normalize_thai_mobile(p_phone);
  select * into v_player
  from public.game_players
  where phone_normalized = v_phone
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_credentials');
  end if;

  if v_player.locked_until is not null and v_player.locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'temporarily_locked');
  end if;

  if extensions.crypt(coalesce(p_pin, ''), v_player.pin_hash) <> v_player.pin_hash then
    update public.game_players
    set
      failed_login_count = least(failed_login_count + 1, 5),
      locked_until = case
        when failed_login_count + 1 >= 5 then now() + interval '15 minutes'
        else null
      end,
      updated_at = now()
    where id = v_player.id;
    return jsonb_build_object('ok', false, 'error', 'invalid_credentials');
  end if;

  update public.game_players
  set failed_login_count = 0, locked_until = null, updated_at = now()
  where id = v_player.id;

  delete from public.game_sessions where expires_at <= now();

  -- Keep only four older active sessions before adding this one.
  delete from public.game_sessions
  where player_id = v_player.id
    and id not in (
      select id
      from public.game_sessions
      where player_id = v_player.id and expires_at > now()
      order by last_seen_at desc
      limit 4
    );

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.game_sessions (player_id, token_hash)
  values (v_player.id, encode(extensions.digest(v_token, 'sha256'), 'hex'));

  return jsonb_build_object(
    'ok', true,
    'session_token', v_token,
    'player', public.game_player_profile(v_player.id)
  );
end;
$$;

create or replace function public.submit_game_attempt(
  p_session_token text,
  p_client_attempt_id text,
  p_scenario_id text,
  p_overall_score integer,
  p_cpr_rhythm_score integer,
  p_total_time_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid;
begin
  select player_id into v_player_id
  from public.game_sessions
  where token_hash = encode(extensions.digest(coalesce(p_session_token, ''), 'sha256'), 'hex')
    and expires_at > now();

  if v_player_id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_session');
  end if;

  -- Duplicate delivery is idempotent and should not trip the burst limit.
  if exists (
    select 1 from public.game_attempts
    where player_id = v_player_id and client_attempt_id = p_client_attempt_id
  ) then
    return jsonb_build_object('ok', true, 'player', public.game_player_profile(v_player_id));
  end if;

  if coalesce(p_client_attempt_id, '') !~ '^mission_[0-9]{13}$'
    or p_scenario_id not in (
      'SCENARIO_ROTC_FIELD',
      'SCENARIO_ROTC_BUILDING',
      'SCENARIO_ROTC_ACTIVITY'
    )
    or p_overall_score not between 0 and 100
    or p_cpr_rhythm_score not between 0 and 100
    or p_total_time_seconds not between 20 and 86400 then
    return jsonb_build_object(
      'ok', false,
      'error', case when p_total_time_seconds < 20 then 'attempt_too_fast' else 'invalid_attempt' end
    );
  end if;

  if exists (
    select 1 from public.game_attempts
    where player_id = v_player_id and completed_at > now() - interval '20 seconds'
  ) then
    return jsonb_build_object('ok', false, 'error', 'attempt_rate_limited');
  end if;

  if (
    select count(*) from public.game_attempts
    where player_id = v_player_id and completed_at >= date_trunc('day', now())
  ) >= 100 then
    return jsonb_build_object('ok', false, 'error', 'daily_attempt_limit');
  end if;

  insert into public.game_attempts (
    player_id,
    client_attempt_id,
    scenario_id,
    overall_score,
    cpr_rhythm_score,
    total_time_seconds
  ) values (
    v_player_id,
    p_client_attempt_id,
    p_scenario_id,
    p_overall_score,
    p_cpr_rhythm_score,
    p_total_time_seconds
  );

  update public.game_sessions
  set last_seen_at = now()
  where token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex');

  return jsonb_build_object('ok', true, 'player', public.game_player_profile(v_player_id));
end;
$$;

-- PostgreSQL grants function execution to PUBLIC by default. Remove that
-- implicit grant, then opt in only the browser roles used by this application.
revoke execute on function public.register_game_player(text, text, text) from public;
revoke execute on function public.login_game_player(text, text) from public;
revoke execute on function public.get_game_player(text) from public;
revoke execute on function public.logout_game_player(text) from public;
revoke execute on function public.submit_game_attempt(text, text, text, integer, integer, integer) from public;
revoke execute on function public.get_public_leaderboard(integer) from public;

grant execute on function public.register_game_player(text, text, text) to anon, authenticated;
grant execute on function public.login_game_player(text, text) to anon, authenticated;
grant execute on function public.get_game_player(text) to anon, authenticated;
grant execute on function public.logout_game_player(text) to anon, authenticated;
grant execute on function public.submit_game_attempt(text, text, text, integer, integer, integer) to anon, authenticated;
grant execute on function public.get_public_leaderboard(integer) to anon, authenticated;

commit;
