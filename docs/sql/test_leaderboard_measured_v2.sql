-- Fixtures are created inside this transaction and always rolled back.
begin;
do $$
declare v_player uuid; v_token text:=encode(extensions.gen_random_bytes(32),'hex'); v_result jsonb; v_xp integer;
begin
  if (public.get_game_player_v2('invalid')->>'error')<>'invalid_session' then raise exception 'invalid session accepted'; end if;
  insert into public.game_players(phone_normalized,display_name,pin_hash)
  values('0990000000','QA rollback only','not-a-loginable-hash') returning id into v_player;
  insert into public.game_sessions(player_id,token_hash) values(v_player,encode(extensions.digest(v_token,'sha256'),'hex'));
  insert into public.game_attempts(player_id,client_attempt_id,scenario_id,overall_score,cpr_rhythm_score,total_time_seconds)
  values(v_player,'mission_1000000000000','SCENARIO_ROTC_FIELD',50,50,60);
  v_result:=public.submit_game_attempt_v2(v_token,'mission_1000000000001','SCENARIO_ROTC_FIELD',null,80,60,60,false);
  if v_result->>'error'<>'invalid_attempt' then raise exception 'null score accepted'; end if;
  v_result:=public.submit_game_attempt_v2(v_token,'mission_1000000000001','SCENARIO_ROTC_FIELD',100,80,60,19,false);
  if v_result->>'error'<>'attempt_too_fast' then raise exception 'instant completion accepted'; end if;
  v_result:=public.submit_game_attempt_v2(v_token,'mission_1000000000001','SCENARIO_ROTC_FIELD',100,80,60,60,false);
  if not (v_result->>'ok')::boolean or (v_result#>>'{player,best_score}')::integer<>80
    or (v_result#>>'{player,xp}')::integer<>580 then raise exception 'score or XP mismatch: %',v_result; end if;
  v_result:=public.submit_game_attempt_v2(v_token,'mission_1000000000001','SCENARIO_ROTC_FIELD',100,80,60,60,false);
  if not (v_result->>'duplicate')::boolean or (v_result#>>'{player,xp}')::integer<>580 then raise exception 'duplicate gained XP'; end if;
  v_result:=public.submit_game_attempt_v2(v_token,'mission_1000000000001','SCENARIO_ROTC_FIELD',99,80,60,60,false);
  if v_result->>'error'<>'attempt_conflict' then raise exception 'changed replay accepted'; end if;
  v_result:=public.submit_game_attempt_v2(v_token,'mission_1000000000002','SCENARIO_ROTC_FIELD',100,100,100,60,true);
  if v_result->>'error'<>'attempt_rate_limited' then raise exception 'burst allowed'; end if;
  update nong_prom_private.game_attempts_v2 set completed_at=now()-interval '21 seconds' where player_id=v_player;
  v_result:=public.submit_game_attempt_v2(v_token,'mission_1000000000002','SCENARIO_ROTC_FIELD',100,100,100,60,true);
  if not (v_result->>'ok')::boolean or (v_result#>>'{player,xp}')::integer<>850
    or (v_result#>>'{player,best_score}')::integer<>80 then raise exception 'guided score mixed with independent score'; end if;
  if not exists(select 1 from jsonb_array_elements(public.get_public_leaderboard_v2(50,false)) r
    where r->>'display_name'='QA rollback only' and (r->>'best_score')::integer=80) then raise exception 'independent board mismatch'; end if;
  if not exists(select 1 from jsonb_array_elements(public.get_public_leaderboard_v2(50,true)) r
    where r->>'display_name'='QA rollback only' and (r->>'best_score')::integer=100) then raise exception 'guided board mismatch'; end if;
  if has_table_privilege('anon','nong_prom_private.game_attempts_v2','SELECT')
    or has_table_privilege('anon','nong_prom_private.game_attempts_v2','INSERT') then raise exception 'private table exposed'; end if;
end $$;
set local role anon;
select public.get_public_leaderboard_v2(1,false);
select public.get_game_player_v2('invalid');
rollback;
select 'PASS: score recomputation, duplicate, conflict, rate limit, guided separation, old XP, RLS grants; fixtures rolled back' as test_result;
