import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  token: "a".repeat(64) as string | undefined,
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => mocks.token ? { value: mocks.token } : undefined }),
}));
vi.mock("@/lib/supabase/server", () => ({ callSupabaseRpc: mocks.rpc }));

import { GET } from "@/app/api/player/admin/access/route";
import { getAdminAccess } from "@/lib/player";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.token = "a".repeat(64);
  process.env.NONG_PROM_ADMIN_SECRET = "s".repeat(43);
});

describe("admin access", () => {
  it("returns false for a signed-in ordinary player", async () => {
    mocks.rpc.mockResolvedValue({ ok: true, is_admin: false });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, is_admin: false });
  });

  it("returns true only for the configured administrator", async () => {
    mocks.rpc.mockResolvedValue({ ok: true, is_admin: true });
    const response = await GET();
    expect(await response.json()).toEqual({ ok: true, is_admin: true });
  });

  it("lets the player UI probe without exposing configuration", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, is_admin: true }) });
    await expect(getAdminAccess()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("/api/player/admin/access", { cache: "no-store" });
  });
});
