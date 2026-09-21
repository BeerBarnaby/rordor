import type { LeaderboardEntry, MissionResult, PlayerProfile } from "@/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const PLAYER_SESSION_KEY = "nong_prom_player_session_v1";

type PlayerSession = {
  token: string;
  profile: PlayerProfile;
};

type RpcEnvelope = {
  ok?: boolean;
  error?: string;
  session_token?: string;
  player?: {
    id?: string;
    display_name?: string;
    best_score?: number;
    best_rhythm_score?: number;
    attempts_count?: number;
    rank?: number | null;
  };
};

function toProfile(value: RpcEnvelope["player"]): PlayerProfile | null {
  if (!value?.id || !value.display_name) return null;
  return {
    id: value.id,
    displayName: value.display_name,
    bestScore: Number(value.best_score ?? 0),
    bestRhythmScore: Number(value.best_rhythm_score ?? 0),
    attemptsCount: Number(value.attempts_count ?? 0),
    rank: value.rank == null ? null : Number(value.rank),
  };
}

function saveSession(session: PlayerSession | null) {
  if (typeof window === "undefined") return;
  if (session) localStorage.setItem(PLAYER_SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(PLAYER_SESSION_KEY);
}

export function getStoredPlayerSession(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PLAYER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as PlayerSession) : null;
  } catch {
    return null;
  }
}

function rpcError(code?: string): Error {
  const messages: Record<string, string> = {
    phone_exists: "เบอร์นี้มีโปรไฟล์แล้ว ลองเข้าสู่ระบบแทน",
    invalid_credentials: "เบอร์โทรหรือ PIN ไม่ถูกต้อง",
    temporarily_locked: "ลองผิดหลายครั้ง กรุณารอ 15 นาทีแล้วลองใหม่",
    invalid_phone: "กรุณากรอกเบอร์มือถือไทยให้ถูกต้อง",
    invalid_pin: "PIN ต้องเป็นตัวเลข 4–8 หลัก",
    invalid_display_name: "ชื่อที่แสดงต้องมี 2–24 ตัวอักษร",
    invalid_session: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง",
  };
  return new Error(messages[code ?? ""] ?? "เชื่อมต่อระบบคะแนนไม่สำเร็จ กรุณาลองอีกครั้ง");
}

async function createSession(
  functionName: "register_game_player" | "login_game_player",
  params: Record<string, string>,
): Promise<PlayerSession> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("ระบบคะแนนออนไลน์ยังไม่พร้อมใช้งาน");

  const { data, error } = await client.rpc(functionName, params);
  if (error) throw new Error("เชื่อมต่อระบบคะแนนไม่สำเร็จ กรุณาลองอีกครั้ง");

  const envelope = data as RpcEnvelope;
  if (!envelope.ok) throw rpcError(envelope.error);
  const profile = toProfile(envelope.player);
  if (!profile || !envelope.session_token) throw rpcError();

  const session = { token: envelope.session_token, profile };
  saveSession(session);
  return session;
}

export function registerPlayer(
  phone: string,
  displayName: string,
  pin: string,
) {
  return createSession("register_game_player", {
    p_phone: phone,
    p_display_name: displayName,
    p_pin: pin,
  });
}

export function loginPlayer(phone: string, pin: string) {
  return createSession("login_game_player", { p_phone: phone, p_pin: pin });
}

export async function restorePlayerSession(): Promise<PlayerSession | null> {
  const stored = getStoredPlayerSession();
  const client = getSupabaseBrowserClient();
  if (!stored || !client) return stored;

  const { data, error } = await client.rpc("get_game_player", {
    p_session_token: stored.token,
  });
  if (error) return stored;

  const envelope = data as RpcEnvelope;
  const profile = envelope.ok ? toProfile(envelope.player) : null;
  if (!profile) {
    saveSession(null);
    return null;
  }

  const session = { token: stored.token, profile };
  saveSession(session);
  return session;
}

export async function logoutPlayer() {
  const stored = getStoredPlayerSession();
  saveSession(null);
  const client = getSupabaseBrowserClient();
  if (!stored || !client) return;
  await client.rpc("logout_game_player", { p_session_token: stored.token });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const client = getSupabaseBrowserClient();
  if (!client) return [];
  const { data, error } = await client.rpc("get_public_leaderboard", {
    p_limit: 20,
  });
  if (error || !Array.isArray(data)) return [];
  return data.map((row) => ({
    rank: Number(row.rank),
    displayName: String(row.display_name),
    bestScore: Number(row.best_score),
    bestRhythmScore: Number(row.best_rhythm_score),
    attemptsCount: Number(row.attempts_count),
    level: Number(row.level),
  }));
}

export async function submitMissionToLeaderboard(result: MissionResult) {
  const client = getSupabaseBrowserClient();
  const session = getStoredPlayerSession();
  if (!client || !session) return null;

  const { data, error } = await client.rpc("submit_game_attempt", {
    p_session_token: session.token,
    p_client_attempt_id: result.id,
    p_scenario_id: result.scenarioId,
    p_overall_score: result.overallScore,
    p_cpr_rhythm_score: result.cprRhythmScore,
    p_total_time_seconds: result.totalTimeSeconds,
  });
  if (error) return null;
  const envelope = data as RpcEnvelope;
  const profile = envelope.ok ? toProfile(envelope.player) : null;
  if (!profile) return null;
  saveSession({ token: session.token, profile });
  return profile;
}
