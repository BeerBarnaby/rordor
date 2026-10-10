import { callSupabaseRpc } from "@/lib/supabase/server";
import { noStoreJson } from "@/lib/playerServer";

export async function GET() {
  try {
    const rows = await callSupabaseRpc<unknown[]>("get_public_leaderboard_v2", {
      p_limit: 20,
      p_audio_guided: false,
    });
    return noStoreJson(Array.isArray(rows) ? rows : []);
  } catch {
    return noStoreJson([], 503);
  }
}
