import { adminEnvelopeResponse, adminRpc } from "@/lib/adminServer";

export async function GET() {
  const result = await adminRpc("admin_access", {});
  return result.response ?? adminEnvelopeResponse(result.envelope!);
}
