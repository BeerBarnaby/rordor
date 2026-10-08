-- Additive rollout: legacy tables and RPCs are unchanged.
-- Reviewed SQL draft; generate a CLI migration before committing this rollout.
begin;
create schema if not exists nong_prom_private;
revoke all on schema nong_prom_private from public;
grant usage on schema nong_prom_private to anon, authenticated;

create table if not exists nong_prom_private.game_attempts_v2 (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.game_players(id) on delete cascade,
  client_attempt_id text not null check (client_attempt_id ~ '^mission_[0-9]{13}$'),
  scenario_id text not null check (scenario_id in ('SCENARIO_ROTC_FIELD','SCENARIO_ROTC_BUILDING','SCENARIO_ROTC_ACTIVITY')),
  sequence_score smallint not null check (sequence_score between 0 and 100),
  call_score smallint not null check (call_score between 0 and 100),
  cpr_rhythm_score smallint not null check (cpr_rhythm_score between 0 and 100),
  overall_score smallint generated always as (round((sequence_score + call_score + cpr_rhythm_score)::numeric / 3)::smallint) stored,
  audio_guided boolean not null default false,
  total_time_seconds integer not null check (total_time_seconds between 20 and 86400),
  completed_at timestamptz not null default now(),
  unique(player_id,client_attempt_id)
);
create index if not exists game_attempts_v2_player_time_idx
  on nong_prom_private.game_attempts_v2(player_id,completed_at desc);
alter table nong_prom_private.game_attempts_v2 enable row level security;
revoke all on nong_prom_private.game_attempts_v2 from public,anon,authenticated;

-- Internal helper: not exposed by PostgREST and not executable by browser roles.
create or replace function nong_prom_private.stats_v2(p_audio_guided boolean)
returns table(player_id uuid, display_name text, best_score integer, best_rhythm_score integer,
  attempts_count integer, measured_total_count integer, total_attempts integer, xp bigint, level integer)
language sql stable security invoker set search_path = '' as $$
  with legacy as (
    select player_id,count(*)::integer as n,max(overall_score)::integer as best
    from public.game_attempts group by player_id
  ), measured as (
    select player_id,count(*)::integer as total,
      count(*) filter(where audio_guided=p_audio_guided)::integer as n,
      max(overall_score) filter(where audio_guided=p_audio_guided)::integer as best,
      max(cpr_rhythm_score) filter(where audio_guided=p_audio_guided)::integer as rhythm,
      max(overall_score)::integer as all_best
    from nong_prom_private.game_attempts_v2 group by player_id
  ), totals as (
    select p.id,p.display_name,coalesce(m.best,0) as best,coalesce(m.rhythm,0) as rhythm,
      coalesce(m.n,0) as n,coalesce(m.total,0) as measured_total,
      (coalesce(l.n,0)+coalesce(m.total,0))::integer as total,
      (coalesce(l.n,0)::bigint+coalesce(m.total,0)::bigint)*250
        + greatest(coalesce(l.best,0),coalesce(m.all_best,0)) as xp
    from public.game_players p left join legacy l on l.player_id=p.id left join measured m on m.player_id=p.id
  )
  select id,display_name,best,rhythm,n,measured_total,total,xp,
    least(10,floor(xp/300.0)::integer+1) from totals;
$$;
revoke all on function nong_prom_private.stats_v2(boolean) from public,anon,authenticated;

-- Custom PIN sessions are not Supabase Auth JWTs: ownership is validated with
-- the existing hashed session token, never an incoming player_id/auth.uid().
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
  select jsonb_build_object('id',s.player_id,'display_name',s.display_name,'best_score',s.best_score,
    'best_rhythm_score',s.best_rhythm_score,'attempts_count',s.total_attempts,
    'measured_attempts_count',s.measured_total_count,'rank',r.rank,'xp',s.xp,'level',s.level,
    'scoring_version','measured-v2') into v_profile
  from stats s left join ranked r on r.player_id=s.player_id where s.player_id=v_player_id;
  return jsonb_build_object('ok',true,'player',v_profile);
end; $$;

create or replace function nong_prom_private.leaderboard_v2(p_limit integer,p_audio_guided boolean)
returns jsonb language sql stable security definer set search_path = '' as $$
  with ranked as (
    select dense_rank() over(order by best_score desc,best_rhythm_score desc,attempts_count asc) as rank,
      player_id,display_name,best_score,best_rhythm_score,attempts_count,xp,level
    from nong_prom_private.stats_v2(coalesce(p_audio_guided,false)) where attempts_count>0
  ), limited as (
    select rank,display_name,best_score,best_rhythm_score,attempts_count,xp,level,
      'measured-v2'::text as scoring_version,coalesce(p_audio_guided,false) as audio_guided
    from ranked order by rank,display_name,player_id limit least(greatest(coalesce(p_limit,20),1),50)
  ) select coalesce(jsonb_agg(to_jsonb(limited)),'[]'::jsonb) from limited;
$$;

create or replace function nong_prom_private.submit_v2(p_session_token text,p_client_attempt_id text,
  p_scenario_id text,p_sequence_score integer,p_call_score integer,p_cpr_rhythm_score integer,
  p_total_time_seconds integer,p_audio_guided boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_player_id uuid; v_existing nong_prom_private.game_attempts_v2%rowtype;
begin
  select player_id into v_player_id from public.game_sessions
  where token_hash=encode(extensions.digest(coalesce(p_session_token,''),'sha256'),'hex') and expires_at>now();
  if v_player_id is null then return jsonb_build_object('ok',false,'error','invalid_session'); end if;
  if p_client_attempt_id is null or p_client_attempt_id !~ '^mission_[0-9]{13}$'
    or p_scenario_id is null or p_scenario_id not in ('SCENARIO_ROTC_FIELD','SCENARIO_ROTC_BUILDING','SCENARIO_ROTC_ACTIVITY')
    or p_sequence_score is null or p_sequence_score not between 0 and 100
    or p_call_score is null or p_call_score not between 0 and 100
    or p_cpr_rhythm_score is null or p_cpr_rhythm_score not between 0 and 100
    or p_total_time_seconds is null or p_total_time_seconds not between 20 and 86400
    or p_audio_guided is null then
    return jsonb_build_object('ok',false,'error',case when p_total_time_seconds<20 then 'attempt_too_fast' else 'invalid_attempt' end);
  end if;
  -- Serialize submissions for this player across all active sessions.
  perform 1 from public.game_players where id=v_player_id for update;
  select * into v_existing from nong_prom_private.game_attempts_v2
  where player_id=v_player_id and client_attempt_id=p_client_attempt_id;
  if found then
    if v_existing.scenario_id<>p_scenario_id or v_existing.sequence_score<>p_sequence_score
      or v_existing.call_score<>p_call_score or v_existing.cpr_rhythm_score<>p_cpr_rhythm_score
      or v_existing.total_time_seconds<>p_total_time_seconds or v_existing.audio_guided<>p_audio_guided then
      return jsonb_build_object('ok',false,'error','attempt_conflict');
    end if;
    return nong_prom_private.profile_v2(p_session_token) || jsonb_build_object('duplicate',true);
  end if;
  if exists(select 1 from nong_prom_private.game_attempts_v2 where player_id=v_player_id and completed_at>now()-interval '20 seconds') then
    return jsonb_build_object('ok',false,'error','attempt_rate_limited');
  end if;
  if (select count(*) from nong_prom_private.game_attempts_v2 where player_id=v_player_id
    and completed_at>=date_trunc('day',now() at time zone 'Asia/Bangkok') at time zone 'Asia/Bangkok')>=100 then
    return jsonb_build_object('ok',false,'error','daily_attempt_limit');
  end if;
  insert into nong_prom_private.game_attempts_v2(player_id,client_attempt_id,scenario_id,sequence_score,call_score,cpr_rhythm_score,total_time_seconds,audio_guided)
  values(v_player_id,p_client_attempt_id,p_scenario_id,p_sequence_score,p_call_score,p_cpr_rhythm_score,p_total_time_seconds,p_audio_guided);
  return nong_prom_private.profile_v2(p_session_token) || jsonb_build_object('duplicate',false);
end; $$;

-- Public RPC wrappers run as invoker; privileged implementations stay private.
create or replace function public.get_game_player_v2(p_session_token text)
returns jsonb language sql security invoker set search_path = '' as $$ select nong_prom_private.profile_v2(p_session_token); $$;
create or replace function public.get_public_leaderboard_v2(p_limit integer default 20,p_audio_guided boolean default false)
returns jsonb language sql stable security invoker set search_path = '' as $$ select nong_prom_private.leaderboard_v2(p_limit,p_audio_guided); $$;
create or replace function public.submit_game_attempt_v2(p_session_token text,p_client_attempt_id text,p_scenario_id text,
  p_sequence_score integer,p_call_score integer,p_cpr_rhythm_score integer,p_total_time_seconds integer,p_audio_guided boolean)
returns jsonb language sql security invoker set search_path = '' as $$
  select nong_prom_private.submit_v2(p_session_token,p_client_attempt_id,p_scenario_id,p_sequence_score,p_call_score,p_cpr_rhythm_score,p_total_time_seconds,p_audio_guided);
$$;
revoke all on function nong_prom_private.profile_v2(text),nong_prom_private.leaderboard_v2(integer,boolean),
  nong_prom_private.submit_v2(text,text,text,integer,integer,integer,integer,boolean) from public,anon,authenticated;
revoke all on function public.get_game_player_v2(text),public.get_public_leaderboard_v2(integer,boolean),
  public.submit_game_attempt_v2(text,text,text,integer,integer,integer,integer,boolean) from public,anon,authenticated;
grant execute on function nong_prom_private.profile_v2(text),nong_prom_private.leaderboard_v2(integer,boolean),
  nong_prom_private.submit_v2(text,text,text,integer,integer,integer,integer,boolean) to anon,authenticated;
grant execute on function public.get_game_player_v2(text),public.get_public_leaderboard_v2(integer,boolean),
  public.submit_game_attempt_v2(text,text,text,integer,integer,integer,integer,boolean) to anon,authenticated;
notify pgrst,'reload schema';
commit;
