import { adminEnvelopeResponse, adminRpc } from "@/lib/adminServer";
import { parseAnalyticsFilters } from "@/lib/adminAnalytics";
import { noStoreJson } from "@/lib/playerServer";

export async function GET(request: Request) {
  const filters = parseAnalyticsFilters(new URL(request.url).searchParams);
  if (!filters) return noStoreJson({ ok: false, error: "invalid_request" }, 400);
  const result = await adminRpc("admin_training_analytics", {
    p_days: filters.days, p_school: filters.school,
    p_year: filters.year === "" ? null : Number(filters.year),
  });
  return result.response ?? adminEnvelopeResponse(result.envelope!);
}
