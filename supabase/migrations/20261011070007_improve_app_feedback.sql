begin;

alter table nong_prom_private.app_feedback
  add column if not exists player_id uuid references public.game_players(id) on delete cascade,
  add column if not exists content_rating smallint,
  add column if not exists usability_rating smallint,
  add column if not exists confidence_rating smallint,
  add column if not exists improvement_area text,
  add column if not exists comment text;

update nong_prom_private.app_feedback
set content_rating = coalesce(content_rating, knowledge_rating),
    usability_rating = coalesce(usability_rating, app_rating),
    confidence_rating = coalesce(confidence_rating, knowledge_rating),
    improvement_area = coalesce(improvement_area, 'interface')
where content_rating is null or usability_rating is null or confidence_rating is null or improvement_area is null;

alter table nong_prom_private.app_feedback
  drop constraint if exists app_feedback_content_rating_check,
  drop constraint if exists app_feedback_usability_rating_check,
  drop constraint if exists app_feedback_confidence_rating_check,
  drop constraint if exists app_feedback_improvement_area_check,
  drop constraint if exists app_feedback_comment_check;

alter table nong_prom_private.app_feedback
  add constraint app_feedback_content_rating_check check (content_rating between 1 and 5),
  add constraint app_feedback_usability_rating_check check (usability_rating between 1 and 5),
  add constraint app_feedback_confidence_rating_check check (confidence_rating between 1 and 5),
  add constraint app_feedback_improvement_area_check check (improvement_area in ('lessons','assessment','call1669','cpr','aed','interface')),
  add constraint app_feedback_comment_check check (comment is null or (char_length(comment) <= 300 and comment !~ '[[:cntrl:]]'));

create unique index if not exists app_feedback_player_unique
  on nong_prom_private.app_feedback(player_id) where player_id is not null;

create or replace function nong_prom_private.get_app_feedback_v2(p_session_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_player_id uuid; v_feedback jsonb;
begin
  select player_id into v_player_id from public.game_sessions
  where token_hash = encode(extensions.digest(coalesce(p_session_token,''),'sha256'),'hex') and expires_at > now();
  if v_player_id is null then return jsonb_build_object('ok',false,'error','invalid_session'); end if;

  select jsonb_build_object(
    'content_rating',content_rating,
    'usability_rating',usability_rating,
    'confidence_rating',confidence_rating,
    'app_rating',app_rating,
    'improvement_area',improvement_area,
    'comment',comment,
    'updated_at',updated_at
  ) into v_feedback
  from nong_prom_private.app_feedback where player_id = v_player_id;

  return jsonb_build_object('ok',true,'feedback',v_feedback);
end; $$;

create or replace function nong_prom_private.submit_app_feedback_v2(
  p_session_token text,
  p_content_rating integer,
  p_usability_rating integer,
  p_confidence_rating integer,
  p_app_rating integer,
  p_improvement_area text,
  p_comment text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_player_id uuid; v_comment text := nullif(btrim(coalesce(p_comment,'')), '');
begin
  select player_id into v_player_id from public.game_sessions
  where token_hash = encode(extensions.digest(coalesce(p_session_token,''),'sha256'),'hex') and expires_at > now();
  if v_player_id is null then return jsonb_build_object('ok',false,'error','invalid_session'); end if;
  if p_content_rating not between 1 and 5 or p_usability_rating not between 1 and 5
     or p_confidence_rating not between 1 and 5 or p_app_rating not between 1 and 5 then
    return jsonb_build_object('ok',false,'error','invalid_rating');
  end if;
  if p_improvement_area not in ('lessons','assessment','call1669','cpr','aed','interface') then
    return jsonb_build_object('ok',false,'error','invalid_area');
  end if;
  if char_length(coalesce(v_comment,'')) > 300 or coalesce(v_comment,'') ~ '[[:cntrl:]]' then
    return jsonb_build_object('ok',false,'error','invalid_comment');
  end if;

  insert into nong_prom_private.app_feedback (
    client_id, player_id, app_rating, knowledge_rating, content_rating,
    usability_rating, confidence_rating, improvement_area, comment
  ) values (
    v_player_id, v_player_id, p_app_rating, p_content_rating, p_content_rating,
    p_usability_rating, p_confidence_rating, p_improvement_area, v_comment
  )
  on conflict (client_id) do update set
    player_id=excluded.player_id, app_rating=excluded.app_rating,
    knowledge_rating=excluded.knowledge_rating, content_rating=excluded.content_rating,
    usability_rating=excluded.usability_rating, confidence_rating=excluded.confidence_rating,
    improvement_area=excluded.improvement_area, comment=excluded.comment, updated_at=now();
  return jsonb_build_object('ok',true);
end; $$;

create or replace function public.get_app_feedback_v2(p_session_token text)
returns jsonb language sql security invoker set search_path = '' as $$
  select nong_prom_private.get_app_feedback_v2(p_session_token);
$$;

create or replace function public.submit_app_feedback_v2(
  p_session_token text, p_content_rating integer, p_usability_rating integer,
  p_confidence_rating integer, p_app_rating integer, p_improvement_area text, p_comment text
)
returns jsonb language sql security invoker set search_path = '' as $$
  select nong_prom_private.submit_app_feedback_v2(
    p_session_token,p_content_rating,p_usability_rating,p_confidence_rating,
    p_app_rating,p_improvement_area,p_comment
  );
$$;

revoke all on function nong_prom_private.get_app_feedback_v2(text) from public, anon, authenticated;
revoke all on function nong_prom_private.submit_app_feedback_v2(text,integer,integer,integer,integer,text,text) from public, anon, authenticated;
revoke all on function public.get_app_feedback_v2(text) from public, anon, authenticated;
revoke all on function public.submit_app_feedback_v2(text,integer,integer,integer,integer,text,text) from public, anon, authenticated;
grant execute on function nong_prom_private.get_app_feedback_v2(text) to anon, authenticated;
grant execute on function nong_prom_private.submit_app_feedback_v2(text,integer,integer,integer,integer,text,text) to anon, authenticated;
grant execute on function public.get_app_feedback_v2(text) to anon, authenticated;
grant execute on function public.submit_app_feedback_v2(text,integer,integer,integer,integer,text,text) to anon, authenticated;

-- The legacy anonymous feedback endpoint is no longer part of the application contract.
revoke all on function public.submit_app_feedback(uuid,integer,integer) from public, anon, authenticated;

notify pgrst, 'reload schema';
commit;
