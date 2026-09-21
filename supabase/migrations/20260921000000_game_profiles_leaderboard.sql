begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.game_players (
  id uuid primary key default gen_random_uuid(),
  phone_normalized text not null unique,
  display_name text not null,
  pin_hash text not null,
  failed_login_count smallint not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_players_phone_valid check (phone_normalized ~ '^0[689][0-9]{8}$'),
  constraint game_players_name_valid check (char_length(display_name) between 2 and 24)
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.game_players(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists game_sessions_player_idx
  on public.game_sessions (player_id, expires_at desc);

create table if not exists public.game_attempts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.game_players(id) on delete cascade,
  client_attempt_id text not null,
  scenario_id text not null,
  overall_score smallint not null check (overall_score between 0 and 100),
  cpr_rhythm_score smallint not null check (cpr_rhythm_score between 0 and 100),
  total_time_seconds integer not null check (total_time_seconds between 1 and 86400),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint game_attempts_player_client_unique unique (player_id, client_attempt_id),
  constraint game_attempts_client_id_valid check (char_length(client_attempt_id) between 1 and 128),
  constraint game_attempts_scenario_id_valid check (char_length(scenario_id) between 1 and 128)
);

create index if not exists game_attempts_rank_idx
  on public.game_attempts (overall_score desc, cpr_rhythm_score desc, total_time_seconds asc);

create index if not exists game_attempts_player_completed_idx
  on public.game_attempts (player_id, completed_at desc);

alter table public.game_players enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_attempts enable row level security;

revoke all on table public.game_players from public, anon, authenticated;
revoke all on table public.game_sessions from public, anon, authenticated;
revoke all on table public.game_attempts from public, anon, authenticated;

create or replace function public.normalize_thai_mobile(p_phone text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_digits text;
begin
  v_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if v_digits ~ '^66[689][0-9]{8}$' then
    v_digits := '0' || substring(v_digits from 3);
  end if;
  return v_digits;
end;
$$;

create or replace function public.game_player_profile(p_player_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with player_stats as (
    select
      p.id,
      p.display_name,
      coalesce(max(a.overall_score), 0)::integer as best_score,
      coalesce(max(a.cpr_rhythm_score), 0)::integer as best_rhythm_score,
      count(a.id)::integer as attempts_count
    from public.game_players p
    left join public.game_attempts a on a.player_id = p.id
    group by p.id, p.display_name
  ), ranked as (
    select
      s.*,
      case
        when s.attempts_count = 0 then null
        else dense_rank() over (
          order by s.best_score desc, s.best_rhythm_score desc, s.attempts_count asc
        )
      end as player_rank
    from player_stats s
  )
  select jsonb_build_object(
    'id', id,
    'display_name', display_name,
    'best_score', best_score,
    'best_rhythm_score', best_rhythm_score,
    'attempts_count', attempts_count,
    'rank', player_rank
  )
  from ranked
  where id = p_player_id;
$$;

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

create or replace function public.get_game_player(p_session_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid;
begin
  update public.game_sessions
  set last_seen_at = now()
  where token_hash = encode(extensions.digest(coalesce(p_session_token, ''), 'sha256'), 'hex')
    and expires_at > now()
  returning player_id into v_player_id;

  if v_player_id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_session');
  end if;

  return jsonb_build_object('ok', true, 'player', public.game_player_profile(v_player_id));
end;
$$;

create or replace function public.logout_game_player(p_session_token text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  delete from public.game_sessions
  where token_hash = encode(extensions.digest(coalesce(p_session_token, ''), 'sha256'), 'hex');
  select true;
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
  if char_length(coalesce(p_client_attempt_id, '')) not between 1 and 128
    or char_length(coalesce(p_scenario_id, '')) not between 1 and 128
    or p_overall_score not between 0 and 100
    or p_cpr_rhythm_score not between 0 and 100
    or p_total_time_seconds not between 1 and 86400 then
    return jsonb_build_object('ok', false, 'error', 'invalid_attempt');
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
  )
  on conflict (player_id, client_attempt_id) do nothing;

  update public.game_sessions
  set last_seen_at = now()
  where token_hash = encode(extensions.digest(p_session_token, 'sha256'), 'hex');

  return jsonb_build_object('ok', true, 'player', public.game_player_profile(v_player_id));
end;
$$;

create or replace function public.get_public_leaderboard(p_limit integer default 20)
returns table (
  rank bigint,
  display_name text,
  best_score integer,
  best_rhythm_score integer,
  attempts_count integer,
  level integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with scores as (
    select
      p.id,
      p.display_name,
      max(a.overall_score)::integer as best_score,
      max(a.cpr_rhythm_score)::integer as best_rhythm_score,
      count(a.id)::integer as attempts_count
    from public.game_players p
    join public.game_attempts a on a.player_id = p.id
    group by p.id, p.display_name
  ), ranked as (
    select
      dense_rank() over (
        order by best_score desc, best_rhythm_score desc, attempts_count asc
      ) as rank,
      display_name,
      best_score,
      best_rhythm_score,
      attempts_count,
      least(10, floor((attempts_count * 250 + best_score) / 300.0)::integer + 1) as level
    from scores
  )
  select * from ranked
  order by rank, display_name
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

revoke execute on function public.normalize_thai_mobile(text) from public, anon, authenticated;
revoke execute on function public.game_player_profile(uuid) from public, anon, authenticated;

grant execute on function public.register_game_player(text, text, text) to anon, authenticated;
grant execute on function public.login_game_player(text, text) to anon, authenticated;
grant execute on function public.get_game_player(text) to anon, authenticated;
grant execute on function public.logout_game_player(text) to anon, authenticated;
grant execute on function public.submit_game_attempt(text, text, text, integer, integer, integer) to anon, authenticated;
grant execute on function public.get_public_leaderboard(integer) to anon, authenticated;

commit;
