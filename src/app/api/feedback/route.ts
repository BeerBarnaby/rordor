import { callSupabaseRpc } from "@/lib/supabase/server";
import { noStoreJson, rejectUntrustedMutation } from "@/lib/playerServer";

type FeedbackPayload = { clientId?: unknown; appRating?: unknown; knowledgeRating?: unknown };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected) return rejected;
  try {
    const body = (await request.json()) as FeedbackPayload;
    const clientId = typeof body.clientId === "string" ? body.clientId : "";
    const appRating = Number(body.appRating);
    const knowledgeRating = Number(body.knowledgeRating);
    if (!UUID_PATTERN.test(clientId) || !Number.isInteger(appRating) || !Number.isInteger(knowledgeRating) || appRating < 1 || appRating > 5 || knowledgeRating < 1 || knowledgeRating > 5) {
      return noStoreJson({ ok: false, error: "invalid_feedback" }, 400);
    }
    const result = await callSupabaseRpc<{ ok?: boolean }>("submit_app_feedback", {
      p_client_id: clientId,
      p_app_rating: appRating,
      p_knowledge_rating: knowledgeRating,
    });
    return noStoreJson({ ok: Boolean(result.ok) }, result.ok ? 200 : 400);
  } catch {
    return noStoreJson({ ok: false, error: "service_unavailable" }, 503);
  }
}
