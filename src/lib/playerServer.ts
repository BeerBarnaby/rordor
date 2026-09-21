import "server-only";

import { cookies } from "next/headers";

export const PLAYER_COOKIE = "nong_prom_player_session";
export const PLAYER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export type PlayerRpcEnvelope = {
  ok?: boolean;
  error?: string;
  session_token?: string;
  player?: Record<string, unknown>;
};

export function noStoreJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export function rejectUntrustedMutation(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return noStoreJson({ ok: false, error: "forbidden_origin" }, 403);
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return noStoreJson({ ok: false, error: "invalid_content_type" }, 415);
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 2_048) {
    return noStoreJson({ ok: false, error: "payload_too_large" }, 413);
  }
  return null;
}

export async function readPlayerToken() {
  const value = (await cookies()).get(PLAYER_COOKIE)?.value;
  return value && SESSION_TOKEN_PATTERN.test(value) ? value : null;
}

export async function setPlayerToken(token: string) {
  if (!SESSION_TOKEN_PATTERN.test(token)) throw new Error("invalid_session_token");
  (await cookies()).set(PLAYER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/player",
    maxAge: PLAYER_COOKIE_MAX_AGE_SECONDS,
    priority: "high",
  });
}

export async function clearPlayerToken() {
  (await cookies()).set(PLAYER_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/player",
    maxAge: 0,
  });
}
