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

import { GET as getOverview } from "@/app/api/player/admin/overview/route";
import { GET as getDetail, DELETE as deletePlayer } from "@/app/api/player/admin/players/[id]/route";

const playerId = "11111111-1111-4111-8111-111111111111";
const env = process.env;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.token = "a".repeat(64);
  process.env = { ...env, NONG_PROM_ADMIN_SECRET: "s".repeat(43) };
});

describe("admin routes", () => {
  it("requires a player session", async () => {
    mocks.token = undefined;
    expect((await getOverview(new Request("http://localhost/api/player/admin/overview"))).status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("fails closed when the server secret is missing", async () => {
    delete process.env.NONG_PROM_ADMIN_SECRET;
    expect((await getOverview(new Request("http://localhost/api/player/admin/overview"))).status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects invalid search and page inputs", async () => {
    expect((await getOverview(new Request(`http://localhost/api/player/admin/overview?search=${"x".repeat(81)}`))).status).toBe(400);
    expect((await getOverview(new Request("http://localhost/api/player/admin/overview?page=0"))).status).toBe(400);
  });

  it("returns private no-store overview data", async () => {
    mocks.rpc.mockResolvedValue({ ok: true, users: [], summary: {}, page: 1 });
    const response = await getOverview(new Request("http://localhost/api/player/admin/overview?search=test&page=1"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.rpc).toHaveBeenCalledWith("admin_overview", expect.objectContaining({ p_search: "test", p_page: 1 }));
  });

  it("maps non-admin access to forbidden", async () => {
    mocks.rpc.mockResolvedValue({ ok: false, error: "forbidden" });
    expect((await getOverview(new Request("http://localhost/api/player/admin/overview"))).status).toBe(403);
  });

  it("validates detail ids", async () => {
    const response = await getDetail(new Request("http://localhost"), { params: Promise.resolve({ id: "bad" }) });
    expect(response.status).toBe(400);
  });

  it("requires trusted JSON and exact confirmation for delete", async () => {
    const untrusted = new Request(`http://localhost/api/player/admin/players/${playerId}`, {
      method: "DELETE", headers: { origin: "https://evil.example", "content-type": "application/json" }, body: "{}",
    });
    expect((await deletePlayer(untrusted, { params: Promise.resolve({ id: playerId }) })).status).toBe(403);

    mocks.rpc.mockResolvedValue({ ok: false, error: "confirmation_mismatch" });
    const trusted = new Request(`http://localhost/api/player/admin/players/${playerId}`, {
      method: "DELETE", headers: { origin: "http://localhost", "content-type": "application/json" }, body: JSON.stringify({ confirmation: "ชื่อผิด" }),
    });
    expect((await deletePlayer(trusted, { params: Promise.resolve({ id: playerId }) })).status).toBe(409);
  });

  it("deletes an authorized player", async () => {
    mocks.rpc.mockResolvedValue({ ok: true });
    const request = new Request(`http://localhost/api/player/admin/players/${playerId}`, {
      method: "DELETE", headers: { origin: "http://localhost", "content-type": "application/json" }, body: JSON.stringify({ confirmation: "ผู้ใช้ทดสอบ" }),
    });
    const response = await deletePlayer(request, { params: Promise.resolve({ id: playerId }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });
});
