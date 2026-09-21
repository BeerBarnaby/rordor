import type { LeaderboardEntry, MissionResult, PlayerProfile } from "@/types";

const PLAYER_SESSION_KEY = "nong_prom_player_session_v1";

type PlayerSession = {
  profile: PlayerProfile;
};

type RpcEnvelope = {
  ok?: boolean;
  error?: string;
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

function clearLegacyBrowserSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PLAYER_SESSION_KEY);
  sessionStorage.removeItem(PLAYER_SESSION_KEY);
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
    invalid_attempt: "ข้อมูลผลการฝึกไม่ถูกต้อง กรุณาลองฝึกใหม่",
    attempt_too_fast: "ระบบยังไม่รับคะแนนที่จบเร็วผิดปกติ กรุณาลองฝึกใหม่",
    attempt_rate_limited: "ส่งคะแนนถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
    daily_attempt_limit: "ส่งคะแนนครบ 100 ครั้งของวันนี้แล้ว ลองใหม่พรุ่งนี้",
  };
  return new Error(messages[code ?? ""] ?? "เชื่อมต่อระบบคะแนนไม่สำเร็จ กรุณาลองอีกครั้ง");
}

async function createSession(
  mode: "register" | "login",
  values: Record<string, string>,
): Promise<PlayerSession> {
  const response = await fetch("/api/player/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, ...values }),
  });
  const envelope = (await response.json().catch(() => ({}))) as RpcEnvelope;
  if (!envelope.ok) throw rpcError(envelope.error);
  const profile = toProfile(envelope.player);
  if (!profile) throw rpcError();

  clearLegacyBrowserSession();
  return { profile };
}

export function registerPlayer(
  phone: string,
  displayName: string,
  pin: string,
) {
  return createSession("register", {
    phone,
    displayName,
    pin,
  });
}

export function loginPlayer(phone: string, pin: string) {
  return createSession("login", { phone, pin });
}

export async function restorePlayerSession(): Promise<PlayerSession | null> {
  clearLegacyBrowserSession();
  const response = await fetch("/api/player/session", { cache: "no-store" });
  if (response.status === 401) return null;
  const envelope = (await response.json().catch(() => ({}))) as RpcEnvelope;
  const profile = envelope.ok ? toProfile(envelope.player) : null;
  return profile ? { profile } : null;
}

export async function logoutPlayer() {
  clearLegacyBrowserSession();
  await fetch("/api/player/session", { method: "DELETE" });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch("/api/player/leaderboard", { cache: "no-store" });
  const data = await response.json().catch(() => []);
  if (!response.ok || !Array.isArray(data)) return [];
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
  const response = await fetch("/api/player/attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientAttemptId: result.id,
      scenarioId: result.scenarioId,
      overallScore: result.overallScore,
      cprRhythmScore: result.cprRhythmScore,
      totalTimeSeconds: result.totalTimeSeconds,
    }),
  });
  if (response.status === 401) return null;
  const envelope = (await response.json().catch(() => ({}))) as RpcEnvelope;
  if (!response.ok || !envelope.ok) return null;
  const profile = envelope.ok ? toProfile(envelope.player) : null;
  return profile;
}
