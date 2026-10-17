import { adminEnvelopeResponse, adminRpc } from "@/lib/adminServer";
import { noStoreJson, rejectUntrustedMutation } from "@/lib/playerServer";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!UUID.test(id)) return noStoreJson({ ok: false, error: "invalid_request" }, 400);
  const result = await adminRpc("admin_player_detail", { p_player_id: id });
  return result.response ?? adminEnvelopeResponse(result.envelope!);
}

export async function DELETE(request: Request, context: Context) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected) return rejected;
  const { id } = await context.params;
  if (!UUID.test(id)) return noStoreJson({ ok: false, error: "invalid_request" }, 400);
  try {
    const body = await request.json() as { confirmation?: unknown };
    const confirmation = typeof body.confirmation === "string" ? body.confirmation : "";
    if (!confirmation || confirmation.length > 24 || /[\u0000-\u001f\u007f]/.test(confirmation)) {
      return noStoreJson({ ok: false, error: "invalid_request" }, 400);
    }
    const result = await adminRpc("admin_delete_player", { p_player_id: id, p_confirmation: confirmation });
    return result.response ?? adminEnvelopeResponse(result.envelope!);
  } catch {
    return noStoreJson({ ok: false, error: "invalid_request" }, 400);
  }
}
