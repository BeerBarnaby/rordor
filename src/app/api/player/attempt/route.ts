import { callSupabaseRpc } from "@/lib/supabase/server";
import {
  noStoreJson,
  readPlayerToken,
  rejectUntrustedMutation,
  type PlayerRpcEnvelope,
} from "@/lib/playerServer";

type AttemptPayload = {
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
