import { callSupabaseRpc } from "@/lib/supabase/server";
import {
  noStoreJson,
  rejectUntrustedMutation,
  setPlayerToken,
  type PlayerRpcEnvelope,
} from "@/lib/playerServer";

type AuthPayload = {
  mode?: unknown;
  phone?: unknown;
  displayName?: unknown;
  pin?: unknown;
};

export async function POST(request: Request) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected) return rejected;

  try {
    const body = (await request.json()) as AuthPayload;
    const mode = body.mode;
    const phone = typeof body.phone === "string" ? body.phone.slice(0, 32) : "";
    const pin = typeof body.pin === "string" ? body.pin.slice(0, 8) : "";
    const displayName =
      typeof body.displayName === "string" ? body.displayName.slice(0, 24) : "";

    if (mode !== "register" && mode !== "login") {
      return noStoreJson({ ok: false, error: "invalid_request" }, 400);
    }

    const envelope = await callSupabaseRpc<PlayerRpcEnvelope>(
      mode === "register" ? "register_game_player" : "login_game_player",
      mode === "register"
        ? { p_phone: phone, p_display_name: displayName, p_pin: pin }
        : { p_phone: phone, p_pin: pin },
    );

    if (!envelope.ok || !envelope.session_token || !envelope.player) {
      return noStoreJson({ ok: false, error: envelope.error }, 400);
    }

    await setPlayerToken(envelope.session_token);
    return noStoreJson({ ok: true, player: envelope.player });
  } catch {
    return noStoreJson({ ok: false, error: "service_unavailable" }, 503);
  }
}
