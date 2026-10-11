import { callSupabaseRpc } from "@/lib/supabase/server";
import { noStoreJson, readPlayerToken, rejectUntrustedMutation } from "@/lib/playerServer";

type FeedbackPayload = {
  contentRating?: unknown;
  usabilityRating?: unknown;
  confidenceRating?: unknown;
  appRating?: unknown;
  improvementArea?: unknown;
  comment?: unknown;
};

type FeedbackEnvelope = { ok?: boolean; error?: string; feedback?: Record<string, unknown> | null };
const AREAS = new Set(["lessons", "assessment", "call1669", "cpr", "aed", "interface"]);
const validRating = (value: number) => Number.isInteger(value) && value >= 1 && value <= 5;

export async function GET() {
  const token = await readPlayerToken();
  if (!token) return noStoreJson({ ok: false, error: "authentication_required" }, 401);
  try {
    const result = await callSupabaseRpc<FeedbackEnvelope>("get_app_feedback_v2", { p_session_token: token });
    if (!result.ok) return noStoreJson({ ok: false, error: "authentication_required" }, 401);
    return noStoreJson({ ok: true, feedback: result.feedback ?? null });
  } catch {
    return noStoreJson({ ok: false, error: "service_unavailable" }, 503);
  }
}

export async function POST(request: Request) {
  const rejected = rejectUntrustedMutation(request);
  if (rejected) return rejected;
  const token = await readPlayerToken();
  if (!token) return noStoreJson({ ok: false, error: "authentication_required" }, 401);

  try {
    const body = (await request.json()) as FeedbackPayload;
    const contentRating = Number(body.contentRating);
    const usabilityRating = Number(body.usabilityRating);
    const confidenceRating = Number(body.confidenceRating);
    const appRating = Number(body.appRating);
    const improvementArea = typeof body.improvementArea === "string" ? body.improvementArea : "";
    const comment = typeof body.comment === "string" ? body.comment.replace(/\s+/g, " ").trim() : "";
    if (![contentRating, usabilityRating, confidenceRating, appRating].every(validRating) || !AREAS.has(improvementArea) || comment.length > 300 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(comment)) {
      return noStoreJson({ ok: false, error: "invalid_feedback" }, 400);
    }
    const result = await callSupabaseRpc<FeedbackEnvelope>("submit_app_feedback_v2", {
      p_session_token: token,
      p_content_rating: contentRating,
      p_usability_rating: usabilityRating,
      p_confidence_rating: confidenceRating,
      p_app_rating: appRating,
      p_improvement_area: improvementArea,
      p_comment: comment,
    });
    if (!result.ok && result.error === "invalid_session") return noStoreJson({ ok: false, error: "authentication_required" }, 401);
    return noStoreJson({ ok: Boolean(result.ok) }, result.ok ? 200 : 400);
  } catch {
    return noStoreJson({ ok: false, error: "service_unavailable" }, 503);
  }
}
