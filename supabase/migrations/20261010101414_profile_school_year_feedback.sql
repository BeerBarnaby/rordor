begin;

alter table public.game_players
  add column if not exists school_name text,
  add column if not exists training_year smallint;

update public.game_players
set school_name = coalesce(school_name, 'ไม่ระบุ'),
    training_year = coalesce(training_year, 1)
where school_name is null or training_year is null;

alter table public.game_players
  alter column school_name set not null,
  alter column training_year set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'game_players_school_valid') then
    alter table public.game_players add constraint game_players_school_valid
      check (char_length(school_name) between 2 and 120 and school_name !~ '[[:cntrl:]]');
  end if;
end $$;

alter table public.game_players
  drop constraint if exists game_players_training_year_valid;
alter table public.game_players
  add constraint game_players_training_year_valid
  check (training_year between 0 and 5);

create or replace function public.game_player_profile(p_player_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with player_stats as (
    select p.id, p.display_name, p.school_name, p.training_year,
      coalesce(max(a.overall_score), 0)::integer as best_score,
      coalesce(max(a.cpr_rhythm_score), 0)::integer as best_rhythm_score,
      count(a.id)::integer as attempts_count
    from public.game_players p
    left join public.game_attempts a on a.player_id = p.id
    group by p.id, p.display_name, p.school_name, p.training_year
  ), ranked as (
    select s.*, case when s.attempts_count = 0 then null else dense_rank() over (
      order by s.best_score desc, s.best_rhythm_score desc, s.attempts_count asc
    ) end as player_rank from player_stats s
  )
  select jsonb_build_object(
    'id', id, 'display_name', display_name, 'school_name', school_name,
    'training_year', training_year, 'best_score', best_score,
    'best_rhythm_score', best_rhythm_score, 'attempts_count', attempts_count,
    'rank', player_rank
  ) from ranked where id = p_player_id;
$$;

create or replace function nong_prom_private.register_game_player_v3(
  p_phone text, p_display_name text, p_pin text, p_school_name text, p_training_year integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text; v_name text; v_school text; v_player_id uuid; v_token text;
begin
  v_phone := public.normalize_thai_mobile(p_phone);
  v_name := btrim(coalesce(p_display_name, ''));
  v_school := btrim(coalesce(p_school_name, ''));
  if v_phone !~ '^0[689][0-9]{8}$' then return jsonb_build_object('ok', false, 'error', 'invalid_phone'); end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4,8}$' then return jsonb_build_object('ok', false, 'error', 'invalid_pin'); end if;
  if char_length(v_name) not between 2 and 24 or v_name ~ '[[:cntrl:]]' then return jsonb_build_object('ok', false, 'error', 'invalid_display_name'); end if;
  if char_length(v_school) not between 2 and 120 or v_school ~ '[[:cntrl:]]' then return jsonb_build_object('ok', false, 'error', 'invalid_school'); end if;
  if p_training_year not between 0 and 5 then return jsonb_build_object('ok', false, 'error', 'invalid_training_year'); end if;

  insert into public.game_players (phone_normalized, display_name, pin_hash, school_name, training_year)
  values (v_phone, v_name, extensions.crypt(p_pin, extensions.gen_salt('bf', 8)), v_school, p_training_year)
  on conflict (phone_normalized) do nothing returning id into v_player_id;
  if v_player_id is null then return jsonb_build_object('ok', false, 'error', 'phone_exists'); end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.game_sessions (player_id, token_hash)
  values (v_player_id, encode(extensions.digest(v_token, 'sha256'), 'hex'));
  return jsonb_build_object('ok', true, 'session_token', v_token, 'player', public.game_player_profile(v_player_id));
end;
$$;

create or replace function nong_prom_private.profile_v2(p_session_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_player_id uuid; v_profile jsonb;
begin
  select player_id into v_player_id from public.game_sessions
  where token_hash=encode(extensions.digest(coalesce(p_session_token,''),'sha256'),'hex') and expires_at>now();
  if v_player_id is null then return jsonb_build_object('ok',false,'error','invalid_session'); end if;
  with stats as (select * from nong_prom_private.stats_v2(false)), ranked as (
    select player_id,dense_rank() over(order by best_score desc,best_rhythm_score desc,attempts_count asc) as rank
    from stats where attempts_count>0
  )
  select jsonb_build_object('id',s.player_id,'display_name',s.display_name,
    'school_name',p.school_name,'training_year',p.training_year,
    'best_score',s.best_score,'best_rhythm_score',s.best_rhythm_score,
    'attempts_count',s.total_attempts,'measured_attempts_count',s.measured_total_count,
    'rank',r.rank,'xp',s.xp,'level',s.level,'scoring_version','measured-v2') into v_profile
  from stats s join public.game_players p on p.id=s.player_id
  left join ranked r on r.player_id=s.player_id where s.player_id=v_player_id;
  return jsonb_build_object('ok',true,'player',v_profile);
end; $$;

create table if not exists nong_prom_private.app_feedback (
  client_id uuid primary key,
  app_rating smallint not null check (app_rating between 1 and 5),
  knowledge_rating smallint not null check (knowledge_rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table nong_prom_private.app_feedback enable row level security;
revoke all on table nong_prom_private.app_feedback from public, anon, authenticated;

create or replace function nong_prom_private.submit_app_feedback(
  p_client_id uuid, p_app_rating integer, p_knowledge_rating integer
)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if p_app_rating not between 1 and 5 or p_knowledge_rating not between 1 and 5 then
    return jsonb_build_object('ok', false, 'error', 'invalid_rating');
  end if;
  insert into nong_prom_private.app_feedback (client_id, app_rating, knowledge_rating)
  values (p_client_id, p_app_rating, p_knowledge_rating)
  on conflict (client_id) do update set app_rating = excluded.app_rating,
    knowledge_rating = excluded.knowledge_rating, updated_at = now();
  return jsonb_build_object('ok', true);
end; $$;

create or replace function public.register_game_player_v3(
  p_phone text, p_display_name text, p_pin text, p_school_name text, p_training_year integer
)
returns jsonb language sql security invoker set search_path = '' as $$
  select nong_prom_private.register_game_player_v3(p_phone,p_display_name,p_pin,p_school_name,p_training_year);
$$;
create or replace function public.submit_app_feedback(
  p_client_id uuid, p_app_rating integer, p_knowledge_rating integer
)
returns jsonb language sql security invoker set search_path = '' as $$
  select nong_prom_private.submit_app_feedback(p_client_id,p_app_rating,p_knowledge_rating);
$$;

revoke all on function nong_prom_private.register_game_player_v3(text,text,text,text,integer) from public, anon, authenticated;
revoke all on function nong_prom_private.submit_app_feedback(uuid,integer,integer) from public, anon, authenticated;
revoke all on function public.register_game_player_v3(text,text,text,text,integer) from public, anon, authenticated;
revoke all on function public.submit_app_feedback(uuid,integer,integer) from public, anon, authenticated;
grant execute on function nong_prom_private.register_game_player_v3(text,text,text,text,integer) to anon, authenticated;
grant execute on function nong_prom_private.submit_app_feedback(uuid,integer,integer) to anon, authenticated;
grant execute on function public.register_game_player_v3(text,text,text,text,integer) to anon, authenticated;
grant execute on function public.submit_app_feedback(uuid,integer,integer) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
