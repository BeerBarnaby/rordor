import { callSupabaseRpc } from "@/lib/supabase/server";
import { parseMeasuredAttempt } from '@/lib/missionAttempt';
import {
  noStoreJson,
  readPlayerToken,
  rejectUntrustedMutation,
  type PlayerRpcEnvelope,
} from "@/lib/playerServer";

type AttemptPayload = {
  scoringVersion?: unknown;
  clientAttemptId?: unknown;
  scenarioId?: unknown;
  overallScore?: unknown;
  cprRhythmScore?: unknown;
  totalTimeSeconds?: unknown;
};

export async function POST(request: Request) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected) return rejected;

  const token = await readPlayerToken();
  if (!token) return noStoreJson({ ok: false, error: "invalid_session" }, 401);

  try {
    const body = (await request.json()) as AttemptPayload;
    if (!body || typeof body !== 'object' || Array.isArray(body)) return noStoreJson({ ok: false, error: 'invalid_attempt' }, 400);
    if (body?.scoringVersion !== undefined) {
      const payload = parseMeasuredAttempt(body);
      if (!payload) return noStoreJson({ ok: false, error: 'invalid_attempt' }, 400);
      const session = await callSupabaseRpc<PlayerRpcEnvelope>('get_game_player_v2', { p_session_token: token });
      if (!session.ok) return noStoreJson({ ok: false, error: 'invalid_session' }, 401);
      if (session.player?.id !== payload.expectedPlayerId) return noStoreJson({ ok: false, error: 'account_changed' }, 403);
      const envelope = await callSupabaseRpc<PlayerRpcEnvelope>('submit_game_attempt_v2', {
        p_session_token: token, p_client_attempt_id: payload.clientAttemptId, p_scenario_id: payload.scenarioId,
        p_sequence_score: payload.sequenceScore, p_call_score: payload.callScore, p_cpr_rhythm_score: payload.cprRhythmScore,
        p_total_time_seconds: payload.totalTimeSeconds, p_audio_guided: payload.audioGuided,
      });
      return noStoreJson({ ok: Boolean(envelope.ok), error: envelope.error, player: envelope.player }, envelope.ok ? 200 : 400);
    }
    const overallScore = Number(body.overallScore);
    const cprRhythmScore = Number(body.cprRhythmScore);
    const totalTimeSeconds = Number(body.totalTimeSeconds);
    if (
      !Number.isInteger(overallScore) ||
      overallScore < 0 ||
      overallScore > 100 ||
      !Number.isInteger(cprRhythmScore) ||
      cprRhythmScore < 0 ||
      cprRhythmScore > 100 ||
      !Number.isInteger(totalTimeSeconds) ||
      totalTimeSeconds < 1 ||
      totalTimeSeconds > 86_400
    ) {
      return noStoreJson({ ok: false, error: "invalid_attempt" }, 400);
    }

    const envelope = await callSupabaseRpc<PlayerRpcEnvelope>("submit_game_attempt", {
      p_session_token: token,
      p_client_attempt_id:
        typeof body.clientAttemptId === "string" ? body.clientAttemptId.slice(0, 128) : "",
      p_scenario_id: typeof body.scenarioId === "string" ? body.scenarioId.slice(0, 128) : "",
      p_overall_score: overallScore,
      p_cpr_rhythm_score: cprRhythmScore,
      p_total_time_seconds: totalTimeSeconds,
    });

    return noStoreJson(
      { ok: Boolean(envelope.ok), error: envelope.error, player: envelope.player },
      envelope.ok ? 200 : 400,
    );
  } catch {
    return noStoreJson({ ok: false, error: "service_unavailable" }, 503);
  }
}
