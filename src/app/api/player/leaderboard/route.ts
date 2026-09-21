import { callSupabaseRpc } from "@/lib/supabase/server";
import { noStoreJson } from "@/lib/playerServer";

export async function GET() {
  try {
    const rows = await callSupabaseRpc<unknown[]>("get_public_leaderboard", {
      p_limit: 20,
    });
    return noStoreJson(Array.isArray(rows) ? rows : []);
  } catch {
    return noStoreJson([], 503);
  }
}
