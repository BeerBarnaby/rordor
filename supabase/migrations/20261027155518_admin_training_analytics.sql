-- Applied to Supabase as migration 20261027155518.
begin;

create or replace function nong_prom_private.admin_training_analytics(
  p_session_token text, p_server_secret text, p_days integer, p_school text, p_year integer
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_admin uuid;
  v_start timestamptz;
  v_today date := (now() at time zone 'Asia/Bangkok')::date;
  v_school text := btrim(coalesce(p_school, ''));
  v_result jsonb;
begin
  v_admin := nong_prom_private.require_admin(p_session_token, p_server_secret);
  if v_admin is null then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  if p_days is null or p_days not in (7,30,90) or char_length(v_school)>120
    or v_school ~ '[[:cntrl:]]' or (p_year is not null and p_year not between 0 and 5) then
    return jsonb_build_object('ok', false, 'error', 'invalid_search');
  end if;
  v_start := (v_today - (p_days - 1))::timestamp at time zone 'Asia/Bangkok';

  with players as materialized (
    select id, coalesce(nullif(btrim(school_name),''),'ไม่ระบุ') school, training_year as "year"
    from public.game_players
    where id <> v_admin
      and (v_school='' or coalesce(nullif(btrim(school_name),''),'ไม่ระบุ')=v_school)
      and (p_year is null or training_year=p_year)
  ), attempts as materialized (
    select a.*, p.school, p.year from nong_prom_private.game_attempts_v2 a
    join players p on p.id=a.player_id
    where a.completed_at >= v_start and a.completed_at <= now() and not a.audio_guided
  ), latest as materialized (
    select distinct on (player_id) * from attempts order by player_id, completed_at desc, id desc
  ), feedback as materialized (
    select f.* from nong_prom_private.app_feedback f join players p on p.id=f.player_id
    where f.updated_at >= v_start and f.updated_at <= now()
  ), daily as (
    select (completed_at at time zone 'Asia/Bangkok')::date as "day",
      count(*) attempts, count(distinct player_id) learners from attempts group by 1
  ), groups as (
    select school, "year", count(*) learners, round(avg(overall_score),1) overall,
      round(avg(sequence_score),1) as sequence, round(avg(call_score),1) as "call",
      round(avg(cpr_rhythm_score),1) cpr from latest group by school, "year"
  )
  select jsonb_build_object(
    'ok',true, 'generated_at',now(),
    'filters',jsonb_build_object('days',p_days,'school',v_school,'year',coalesce(p_year::text,'')),
    'schools',coalesce((select jsonb_agg(school order by school) from (
      select distinct coalesce(nullif(btrim(school_name),''),'ไม่ระบุ') school
      from public.game_players where id<>v_admin
    ) s),'[]'::jsonb),
    'summary',jsonb_build_object('registered',(select count(*) from players),
      'learners',(select count(*) from latest),'attempts',(select count(*) from attempts),
      'feedback',(select count(*) from feedback)),
    'skills',(select jsonb_build_object('overall',round(avg(overall_score),1),
      'sequence',round(avg(sequence_score),1),'call',round(avg(call_score),1),
      'cpr',round(avg(cpr_rhythm_score),1)) from latest),
    'daily',coalesce((select jsonb_agg(jsonb_build_object('day',to_char(v_today-offset_day,'YYYY-MM-DD'),
      'attempts',coalesce(d.attempts,0),'learners',coalesce(d.learners,0)) order by offset_day desc)
      from generate_series(0,p_days-1) offset_day left join daily d on d.day=v_today-offset_day),'[]'::jsonb),
    'groups',coalesce((select jsonb_agg(to_jsonb(g) order by g.learners desc,g.school,g.year) from groups g),'[]'::jsonb),
    'ratings',(select jsonb_build_object('content',round(avg(content_rating),1),
      'usability',round(avg(usability_rating),1),'confidence',round(avg(confidence_rating),1),
      'app',round(avg(app_rating),1)) from feedback),
    'improvements',coalesce((select jsonb_agg(to_jsonb(i) order by i.count desc,i.area) from (
      select improvement_area area,count(*) count from feedback where improvement_area is not null group by improvement_area
    ) i),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.admin_training_analytics(
  p_session_token text, p_server_secret text, p_days integer, p_school text, p_year integer
)
returns jsonb language sql security invoker set search_path = '' as $$
  select nong_prom_private.admin_training_analytics(p_session_token,p_server_secret,p_days,p_school,p_year);
$$;
revoke all on function nong_prom_private.admin_training_analytics(text,text,integer,text,integer) from public,anon,authenticated;
revoke all on function public.admin_training_analytics(text,text,integer,text,integer) from public,anon,authenticated;
grant execute on function nong_prom_private.admin_training_analytics(text,text,integer,text,integer) to anon,authenticated;
grant execute on function public.admin_training_analytics(text,text,integer,text,integer) to anon,authenticated;

notify pgrst,'reload schema';
commit;
