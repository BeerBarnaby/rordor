begin;

create table if not exists nong_prom_private.admin_config (
  singleton boolean primary key default true check (singleton),
  player_id uuid not null unique references public.game_players(id) on delete restrict,
  server_secret_hash text not null check (server_secret_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists nong_prom_private.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_player_id uuid not null,
  target_player_id uuid not null,
  action text not null check (action = 'delete_player'),
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_idx
  on nong_prom_private.admin_audit_log(created_at desc);

alter table nong_prom_private.admin_config enable row level security;
alter table nong_prom_private.admin_audit_log enable row level security;
revoke all on table nong_prom_private.admin_config from public, anon, authenticated;
revoke all on table nong_prom_private.admin_audit_log from public, anon, authenticated;

create or replace function nong_prom_private.require_admin(
  p_session_token text,
  p_server_secret text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_player_id uuid;
begin
  if char_length(coalesce(p_server_secret, '')) < 43 then
    return null;
  end if;

  select s.player_id into v_player_id
  from public.game_sessions s
  join nong_prom_private.admin_config c on c.player_id = s.player_id and c.singleton
  where s.token_hash = encode(extensions.digest(coalesce(p_session_token, ''), 'sha256'), 'hex')
    and s.expires_at > now()
    and c.server_secret_hash = encode(extensions.digest(p_server_secret, 'sha256'), 'hex');

  return v_player_id;
end;
$$;

create or replace function nong_prom_private.admin_access(
  p_session_token text,
  p_server_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return jsonb_build_object(
    'ok', true,
    'is_admin', nong_prom_private.require_admin(p_session_token, p_server_secret) is not null
  );
end;
$$;

create or replace function nong_prom_private.admin_overview(
  p_session_token text,
  p_server_secret text,
  p_search text,
  p_page integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_search text := lower(btrim(coalesce(p_search, '')));
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_result jsonb;
begin
  v_admin_id := nong_prom_private.require_admin(p_session_token, p_server_secret);
  if v_admin_id is null then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  if char_length(v_search) > 80 or v_search ~ '[[:cntrl:]]' then
    return jsonb_build_object('ok', false, 'error', 'invalid_search');
  end if;

  with session_stats as (
    select player_id, count(*)::integer session_count, max(last_seen_at) last_seen_at
    from public.game_sessions group by player_id
  ), legacy_stats as (
    select player_id, count(*)::integer attempt_count, max(overall_score)::integer best_score,
      max(completed_at) last_attempt_at from public.game_attempts group by player_id
  ), measured_stats as (
    select player_id, count(*)::integer attempt_count, max(overall_score)::integer best_score,
      max(cpr_rhythm_score)::integer best_rhythm_score, max(completed_at) last_attempt_at
    from nong_prom_private.game_attempts_v2 group by player_id
  ), rows as (
    select p.id, p.display_name, p.school_name, p.training_year,
      regexp_replace(p.phone_normalized, '^([0-9]{2})[0-9]{5}([0-9]{3})$', '\1x-xxx-\2') masked_phone,
      greatest(coalesce(l.best_score,0),coalesce(m.best_score,0)) best_score,
      coalesce(m.best_rhythm_score,0) best_rhythm_score,
      coalesce(l.attempt_count,0)+coalesce(m.attempt_count,0) attempts_count,
      coalesce(s.session_count,0) session_count,
      greatest(s.last_seen_at,l.last_attempt_at,m.last_attempt_at,p.created_at) last_activity_at,
      p.created_at,
      count(*) over()::integer total_count
    from public.game_players p
    left join session_stats s on s.player_id=p.id
    left join legacy_stats l on l.player_id=p.id
    left join measured_stats m on m.player_id=p.id
    where v_search = '' or strpos(lower(p.display_name),v_search)>0
      or strpos(lower(p.phone_normalized),v_search)>0 or strpos(lower(p.school_name),v_search)>0
    order by last_activity_at desc, p.id
    limit 25 offset (v_page-1)*25
  )
  select jsonb_build_object(
    'ok',true,
    'summary',jsonb_build_object(
      'total_users',(select count(*) from public.game_players),
      'active_today',(select count(distinct player_id) from public.game_sessions where last_seen_at >= date_trunc('day',now() at time zone 'Asia/Bangkok') at time zone 'Asia/Bangkok'),
      'completed_missions',(select count(*) from public.game_attempts)+(select count(*) from nong_prom_private.game_attempts_v2),
      'feedback_count',(select count(*) from nong_prom_private.app_feedback where player_id is not null)
    ),
    'users',coalesce(jsonb_agg(to_jsonb(rows)),'[]'::jsonb),
    'page',v_page,
    'total_count',coalesce(max(total_count),0),
    'page_size',25
  ) into v_result from rows;
  return v_result;
end;
$$;

create or replace function nong_prom_private.admin_player_detail(
  p_session_token text,
  p_server_secret text,
  p_player_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_result jsonb;
begin
  v_admin_id := nong_prom_private.require_admin(p_session_token,p_server_secret);
  if v_admin_id is null then return jsonb_build_object('ok',false,'error','forbidden'); end if;
  if not exists(select 1 from public.game_players where id=p_player_id) then
    return jsonb_build_object('ok',false,'error','not_found');
  end if;

  select jsonb_build_object(
    'ok',true,
    'player',jsonb_build_object(
      'id',p.id,'display_name',p.display_name,'phone',p.phone_normalized,
      'school_name',p.school_name,'training_year',p.training_year,
      'created_at',p.created_at,'updated_at',p.updated_at,
      'is_admin',p.id=v_admin_id
    ),
    'sessions',coalesce((select jsonb_agg(to_jsonb(s) order by s.created_at desc) from (
      select id,created_at,last_seen_at,expires_at from public.game_sessions where player_id=p.id order by created_at desc limit 50
    ) s),'[]'::jsonb),
    'attempts',coalesce((select jsonb_agg(to_jsonb(a) order by a.completed_at desc) from (
      select id,'legacy'::text scoring_version,scenario_id,overall_score,null::integer sequence_score,
        null::integer call_score,cpr_rhythm_score,total_time_seconds,completed_at
      from public.game_attempts where player_id=p.id
      union all
      select id,'measured-v2',scenario_id,overall_score,sequence_score,call_score,
        cpr_rhythm_score,total_time_seconds,completed_at
      from nong_prom_private.game_attempts_v2 where player_id=p.id
      order by completed_at desc limit 100
    ) a),'[]'::jsonb),
    'feedback',(select jsonb_build_object(
      'content_rating',f.content_rating,'usability_rating',f.usability_rating,
      'confidence_rating',f.confidence_rating,'app_rating',f.app_rating,
      'improvement_area',f.improvement_area,'comment',f.comment,'updated_at',f.updated_at
    ) from nong_prom_private.app_feedback f where f.player_id=p.id),
    'xp',((select count(*) from public.game_attempts where player_id=p.id)
      +(select count(*) from nong_prom_private.game_attempts_v2 where player_id=p.id))*250
      +greatest(coalesce((select max(overall_score) from public.game_attempts where player_id=p.id),0),
        coalesce((select max(overall_score) from nong_prom_private.game_attempts_v2 where player_id=p.id),0))
  ) into v_result from public.game_players p where p.id=p_player_id;
  return v_result;
end;
$$;

create or replace function nong_prom_private.admin_delete_player(
  p_session_token text,
  p_server_secret text,
  p_player_id uuid,
  p_confirmation text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_display_name text;
begin
  v_admin_id := nong_prom_private.require_admin(p_session_token,p_server_secret);
  if v_admin_id is null then return jsonb_build_object('ok',false,'error','forbidden'); end if;
  if p_player_id=v_admin_id then return jsonb_build_object('ok',false,'error','self_delete_forbidden'); end if;
  select display_name into v_display_name from public.game_players where id=p_player_id for update;
  if v_display_name is null then return jsonb_build_object('ok',false,'error','not_found'); end if;
  if p_confirmation is distinct from v_display_name then
    return jsonb_build_object('ok',false,'error','confirmation_mismatch');
  end if;
  insert into nong_prom_private.admin_audit_log(admin_player_id,target_player_id,action)
  values(v_admin_id,p_player_id,'delete_player');
  delete from public.game_players where id=p_player_id;
  return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.admin_access(p_session_token text,p_server_secret text)
returns jsonb language sql security invoker set search_path='' as $$
  select nong_prom_private.admin_access(p_session_token,p_server_secret);
$$;
create or replace function public.admin_overview(p_session_token text,p_server_secret text,p_search text,p_page integer)
returns jsonb language sql security invoker set search_path='' as $$
  select nong_prom_private.admin_overview(p_session_token,p_server_secret,p_search,p_page);
$$;
create or replace function public.admin_player_detail(p_session_token text,p_server_secret text,p_player_id uuid)
returns jsonb language sql security invoker set search_path='' as $$
  select nong_prom_private.admin_player_detail(p_session_token,p_server_secret,p_player_id);
$$;
create or replace function public.admin_delete_player(p_session_token text,p_server_secret text,p_player_id uuid,p_confirmation text)
returns jsonb language sql security invoker set search_path='' as $$
  select nong_prom_private.admin_delete_player(p_session_token,p_server_secret,p_player_id,p_confirmation);
$$;

revoke all on function nong_prom_private.require_admin(text,text) from public,anon,authenticated;
revoke all on function nong_prom_private.admin_access(text,text) from public,anon,authenticated;
revoke all on function nong_prom_private.admin_overview(text,text,text,integer) from public,anon,authenticated;
revoke all on function nong_prom_private.admin_player_detail(text,text,uuid) from public,anon,authenticated;
revoke all on function nong_prom_private.admin_delete_player(text,text,uuid,text) from public,anon,authenticated;
revoke all on function public.admin_access(text,text) from public,anon,authenticated;
revoke all on function public.admin_overview(text,text,text,integer) from public,anon,authenticated;
revoke all on function public.admin_player_detail(text,text,uuid) from public,anon,authenticated;
revoke all on function public.admin_delete_player(text,text,uuid,text) from public,anon,authenticated;
grant execute on function nong_prom_private.admin_access(text,text) to anon,authenticated;
grant execute on function nong_prom_private.admin_overview(text,text,text,integer) to anon,authenticated;
grant execute on function nong_prom_private.admin_player_detail(text,text,uuid) to anon,authenticated;
grant execute on function nong_prom_private.admin_delete_player(text,text,uuid,text) to anon,authenticated;
grant execute on function public.admin_access(text,text) to anon,authenticated;
grant execute on function public.admin_overview(text,text,text,integer) to anon,authenticated;
grant execute on function public.admin_player_detail(text,text,uuid) to anon,authenticated;
grant execute on function public.admin_delete_player(text,text,uuid,text) to anon,authenticated;

notify pgrst,'reload schema';
commit;
