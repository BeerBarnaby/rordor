-- Integration assertions. All fixtures and temporary authentication changes roll back.
begin;
do $$
declare
  admin_id uuid;
  learner_a uuid;
  learner_b uuid;
  school text := 'analytics-test-' || gen_random_uuid()::text;
  token text := encode(extensions.gen_random_bytes(32),'hex');
  secret text := encode(extensions.gen_random_bytes(32),'hex');
  result jsonb;
begin
  select player_id into strict admin_id from nong_prom_private.admin_config where singleton;
  update nong_prom_private.admin_config set server_secret_hash=encode(extensions.digest(secret,'sha256'),'hex') where singleton;
  insert into public.game_sessions(player_id,token_hash,expires_at)
    values(admin_id,encode(extensions.digest(token,'sha256'),'hex'),now()+interval '1 hour');
  insert into public.game_players(phone_normalized,display_name,pin_hash,school_name,training_year)
    values('089'||lpad(floor(random()*10000000)::text,7,'0'),'Analytics test A','not-a-login-hash',school,0) returning id into learner_a;
  insert into public.game_players(phone_normalized,display_name,pin_hash,school_name,training_year)
    values('089'||lpad(floor(random()*10000000)::text,7,'0'),'Analytics test B','not-a-login-hash',school,1) returning id into learner_b;
  insert into nong_prom_private.game_attempts_v2(player_id,client_attempt_id,scenario_id,sequence_score,call_score,cpr_rhythm_score,total_time_seconds,completed_at,audio_guided)
    values
    (learner_a,'mission_1000000000001','SCENARIO_ROTC_FIELD',0,0,0,60,now()-interval '2 hours',false),
    (learner_a,'mission_1000000000002','SCENARIO_ROTC_FIELD',90,60,30,60,now()-interval '1 hour',false),
    (learner_a,'mission_1000000000003','SCENARIO_ROTC_FIELD',100,100,100,60,now()-interval '30 minutes',true),
    (learner_b,'mission_1000000000001','SCENARIO_ROTC_FIELD',30,60,90,60,now()-interval '1 hour',false),
    (learner_b,'mission_1000000000002','SCENARIO_ROTC_FIELD',0,0,0,60,now()-interval '100 days',false);
  insert into nong_prom_private.app_feedback(client_id,player_id,app_rating,knowledge_rating,content_rating,usability_rating,confidence_rating,improvement_area)
    values(gen_random_uuid(),learner_a,5,4,4,3,2,'cpr');
  result := public.admin_training_analytics(token,secret,7,school,null);
  assert result->>'ok'='true', 'valid admin was rejected';
  assert (result#>>'{summary,learners}')::integer=2, 'distinct learner count';
  assert (result#>>'{summary,attempts}')::integer=3, 'date and audio filtering';
  assert (result#>>'{skills,sequence}')::numeric=60, 'latest per learner weighting';
  assert (result#>>'{skills,cpr}')::numeric=60, 'latest CPR aggregation';
  assert (result#>>'{summary,feedback}')::integer=1, 'feedback count';
  assert (result#>>'{ratings,usability}')::numeric=3, 'feedback average';
  assert jsonb_array_length(result->'daily')=7, 'zero-filled daily series';
  assert jsonb_array_length(result->'groups')=2, 'school and year grouping';
  assert (select sum((value->>'attempts')::integer) from jsonb_array_elements(result->'daily'))=3, 'daily totals';
  result := public.admin_training_analytics(token,secret,7,school,0);
  assert (result#>>'{summary,learners}')::integer=1, 'year zero filter';
  assert (result#>>'{skills,sequence}')::numeric=90, 'school/year filtered score';
  result := public.admin_training_analytics(token,secret,7,school,5);
  assert (result#>>'{summary,learners}')::integer=0, 'empty cohort count';
  assert result#>'{skills,overall}'='null'::jsonb, 'empty score must be null';
  assert public.admin_training_analytics('bad',secret,7,school,null)->>'error'='forbidden', 'invalid session';
  assert public.admin_training_analytics(token,'bad',7,school,null)->>'error'='forbidden', 'invalid server secret';
  assert public.admin_training_analytics(token,secret,1000,school,null)->>'error'='invalid_search', 'unbounded dates';
end $$;
rollback;
select 'analytics integration assertions passed; all fixtures rolled back' as result;
