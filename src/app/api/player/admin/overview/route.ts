import { adminEnvelopeResponse, adminRpc } from "@/lib/adminServer";
import { noStoreJson } from "@/lib/playerServer";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = (url.searchParams.get("search") ?? "").trim();
  const pageText = url.searchParams.get("page") ?? "1";
  const page = Number(pageText);
  if (search.length > 80 || /[\u0000-\u001f\u007f]/.test(search) || !Number.isInteger(page) || page < 1 || page > 4000) {
    return noStoreJson({ ok: false, error: "invalid_request" }, 400);
  }
  const result = await adminRpc("admin_overview", { p_search: search, p_page: page });
  return result.response ?? adminEnvelopeResponse(result.envelope!);
}
