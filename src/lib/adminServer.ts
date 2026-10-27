import "server-only";

import { callSupabaseRpc } from "@/lib/supabase/server";
import { noStoreJson, readPlayerToken } from "@/lib/playerServer";

export type AdminEnvelope = {
  ok?: boolean;
  error?: string;
  is_admin?: boolean;
  [key: string]: unknown;
};

export function readAdminSecret() {
  const secret = process.env.NONG_PROM_ADMIN_SECRET;
  if (!secret || secret.length < 43 || secret.startsWith("NEXT_PUBLIC_")) {
    throw new Error("admin_not_configured");
  }
  return secret;
}

export async function adminRpc(name: "admin_access" | "admin_overview" | "admin_player_detail" | "admin_delete_player" | "admin_training_analytics", parameters: Record<string, unknown>) {
  const token = await readPlayerToken();
  if (!token) return { response: noStoreJson({ ok: false, error: "authentication_required" }, 401) };
  let secret: string;
  try { secret = readAdminSecret(); }
  catch { return { response: noStoreJson({ ok: false, error: "admin_unavailable" }, 503) }; }
  try {
    const envelope = await callSupabaseRpc<AdminEnvelope>(name, {
      p_session_token: token,
      p_server_secret: secret,
      ...parameters,
    });
    return { envelope };
  } catch {
    return { response: noStoreJson({ ok: false, error: "service_unavailable" }, 503) };
  }
}

export function adminEnvelopeResponse(envelope: AdminEnvelope) {
  if (envelope.ok) return noStoreJson(envelope);
  const status = envelope.error === "forbidden" ? 403
    : envelope.error === "not_found" ? 404
      : envelope.error === "confirmation_mismatch" || envelope.error === "self_delete_forbidden" ? 409
        : envelope.error === "invalid_search" ? 400 : 503;
  return noStoreJson({ ok: false, error: envelope.error ?? "service_unavailable" }, status);
}
