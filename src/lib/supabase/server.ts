import "server-only";

const RPC_TIMEOUT_MS = 10_000;
type PlayerRpcName =
  | "register_game_player"
  | "login_game_player"
  | "get_game_player"
  | "logout_game_player"
  | "submit_game_attempt"
  | "get_public_leaderboard";

export async function callSupabaseRpc<T>(
  functionName: PlayerRpcName,
  parameters: Record<string, unknown>,
): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("supabase_not_configured");

  const baseUrl = new URL(url);
  if (baseUrl.protocol !== "https:") throw new Error("invalid_supabase_url");
  const rpcUrl = new URL(`/rest/v1/rpc/${functionName}`, baseUrl);

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parameters),
    cache: "no-store",
    signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error("supabase_rpc_failed");
  return (await response.json()) as T;
}
