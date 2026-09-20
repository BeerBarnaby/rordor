begin;

create extension if not exists pgcrypto with schema extensions;

-- Completed simulations are append-only. Dashboard aggregates are derived from
-- these rows so best scores and attempt counts cannot drift out of sync.
create table if not exists public.mission_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  client_attempt_id text not null,
  scenario_id text not null,
  scenario_title text not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  total_time_seconds integer not null,
  overall_score smallint not null,
  assessment_score smallint not null,
  sequence_score smallint not null,
  cpr_rhythm_score smallint not null,
  call_1669_score smallint not null,
  aed_score smallint not null,
  response_time_score smallint not null,
  cpr_average_bpm numeric(6, 2) not null default 0,
  timeline jsonb not null default '[]'::jsonb,
  mistakes text[] not null default '{}'::text[],
  scoring_version text not null default 'v1',

  constraint mission_attempts_user_client_unique
    unique (user_id, client_attempt_id),
  constraint mission_attempts_client_id_valid
    check (char_length(client_attempt_id) between 1 and 128),
  constraint mission_attempts_scenario_id_valid
    check (char_length(scenario_id) between 1 and 128),
  constraint mission_attempts_scenario_title_valid
    check (char_length(scenario_title) between 1 and 300),
  constraint mission_attempts_duration_valid
    check (total_time_seconds between 1 and 86400),
  constraint mission_attempts_scores_valid
    check (
      overall_score between 0 and 100
      and assessment_score between 0 and 100
      and sequence_score between 0 and 100
      and cpr_rhythm_score between 0 and 100
      and call_1669_score between 0 and 100
      and aed_score between 0 and 100
      and response_time_score between 0 and 100
    ),
  constraint mission_attempts_bpm_valid
    check (cpr_average_bpm between 0 and 300),
  constraint mission_attempts_timeline_valid
    check (
      jsonb_typeof(timeline) = 'array'
      and octet_length(timeline::text) <= 262144
    ),
  constraint mission_attempts_mistakes_valid
    check (cardinality(mistakes) <= 100)
);

create index if not exists mission_attempts_user_completed_idx
  on public.mission_attempts (user_id, completed_at desc, created_at desc);

create index if not exists mission_attempts_user_overall_idx
  on public.mission_attempts (user_id, overall_score desc);

-- Learning progress replaces the two local arrays of completed video/topic IDs.
create table if not exists public.learning_completions (
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  content_type text not null,
  content_id text not null,
  completed_at timestamptz not null default now(),

  primary key (user_id, content_type, content_id),
  constraint learning_completions_type_valid
    check (content_type in ('video', 'topic')),
  constraint learning_completions_content_id_valid
    check (char_length(content_id) between 1 and 128)
);

create index if not exists learning_completions_user_completed_idx
  on public.learning_completions (user_id, completed_at desc);

-- A signed-in learner can resume one in-progress simulation on another device.
create table if not exists public.mission_drafts (
  user_id uuid primary key default auth.uid()
    references auth.users(id) on delete cascade,
  scenario_id text not null,
  phase text not null,
  state jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint mission_drafts_scenario_id_valid
    check (char_length(scenario_id) between 1 and 128),
  constraint mission_drafts_phase_valid
    check (phase in ('opening', 'sequence', 'call1669', 'cpr', 'aed')),
  constraint mission_drafts_state_valid
    check (
      jsonb_typeof(state) = 'object'
      and octet_length(state::text) <= 262144
    )
);

create or replace function public.set_nong_prom_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'mission_drafts_set_updated_at'
      and tgrelid = 'public.mission_drafts'::regclass
  ) then
    create trigger mission_drafts_set_updated_at
    before update on public.mission_drafts
    for each row execute function public.set_nong_prom_updated_at();
  end if;
end;
$$;

alter table public.mission_attempts enable row level security;
alter table public.learning_completions enable row level security;
alter table public.mission_drafts enable row level security;

-- PostgreSQL has no CREATE POLICY IF NOT EXISTS, so each policy is guarded to
-- keep this migration safe to rerun from the Supabase SQL Editor.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mission_attempts'
      and policyname = 'mission_attempts_select_own'
  ) then
    execute 'create policy mission_attempts_select_own on public.mission_attempts for select to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mission_attempts'
      and policyname = 'mission_attempts_insert_own'
  ) then
    execute 'create policy mission_attempts_insert_own on public.mission_attempts for insert to authenticated with check ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mission_attempts'
      and policyname = 'mission_attempts_delete_own'
  ) then
    execute 'create policy mission_attempts_delete_own on public.mission_attempts for delete to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'learning_completions'
      and policyname = 'learning_completions_select_own'
  ) then
    execute 'create policy learning_completions_select_own on public.learning_completions for select to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'learning_completions'
      and policyname = 'learning_completions_insert_own'
  ) then
    execute 'create policy learning_completions_insert_own on public.learning_completions for insert to authenticated with check ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'learning_completions'
      and policyname = 'learning_completions_delete_own'
  ) then
    execute 'create policy learning_completions_delete_own on public.learning_completions for delete to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mission_drafts'
      and policyname = 'mission_drafts_select_own'
  ) then
    execute 'create policy mission_drafts_select_own on public.mission_drafts for select to authenticated using ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mission_drafts'
      and policyname = 'mission_drafts_insert_own'
  ) then
    execute 'create policy mission_drafts_insert_own on public.mission_drafts for insert to authenticated with check ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mission_drafts'
      and policyname = 'mission_drafts_update_own'
  ) then
    execute 'create policy mission_drafts_update_own on public.mission_drafts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mission_drafts'
      and policyname = 'mission_drafts_delete_own'
  ) then
    execute 'create policy mission_drafts_delete_own on public.mission_drafts for delete to authenticated using ((select auth.uid()) = user_id)';
  end if;
end;
$$;

create or replace view public.user_progress_summary
with (security_invoker = true)
as
select
  user_id,
  count(*)::integer as mission_attempts_count,
  coalesce(max(overall_score), 0)::smallint as best_overall_score,
  coalesce(max(cpr_rhythm_score), 0)::smallint as best_rhythm_score,
  (array_agg(id order by completed_at desc, created_at desc))[1]
    as last_mission_attempt_id
from public.mission_attempts
where user_id = (select auth.uid())
group by user_id;

revoke all on table public.mission_attempts from public, anon;
revoke all on table public.learning_completions from public, anon;
revoke all on table public.mission_drafts from public, anon;
revoke all on table public.user_progress_summary from public, anon;

grant select, insert, delete
  on table public.mission_attempts to authenticated;
grant select, insert, delete
  on table public.learning_completions to authenticated;
grant select, insert, update, delete
  on table public.mission_drafts to authenticated;
grant select
  on table public.user_progress_summary to authenticated;

revoke execute on function public.set_nong_prom_updated_at()
  from public, anon, authenticated;

commit;
