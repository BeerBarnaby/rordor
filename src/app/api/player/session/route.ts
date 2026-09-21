import { callSupabaseRpc } from "@/lib/supabase/server";
import {
  clearPlayerToken,
  noStoreJson,
  readPlayerToken,
  rejectUntrustedMutation,
  type PlayerRpcEnvelope,
} from "@/lib/playerServer";

export async function GET() {
  const token = await readPlayerToken();
  if (!token) return noStoreJson({ ok: false, error: "invalid_session" }, 401);

  try {
    const envelope = await callSupabaseRpc<PlayerRpcEnvelope>("get_game_player", {
      p_session_token: token,
    });
    if (!envelope.ok || !envelope.player) {
      await clearPlayerToken();
      return noStoreJson({ ok: false, error: "invalid_session" }, 401);
    }
    return noStoreJson({ ok: true, player: envelope.player });
  } catch {
    return noStoreJson({ ok: false, error: "service_unavailable" }, 503);
  }
}

export async function DELETE(request: Request) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected && rejected.status !== 415) return rejected;

  const token = await readPlayerToken();
  await clearPlayerToken();
  if (token) {
    try {
      await callSupabaseRpc<boolean>("logout_game_player", { p_session_token: token });
    } catch {
      // The local cookie is already cleared; expiration also limits stale DB sessions.
    }
  }
  return noStoreJson({ ok: true });
}
