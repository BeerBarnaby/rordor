import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminDashboard, canConfirmDelete } from "@/components/admin/AdminDashboard";
import { deleteAdminPlayer, fetchAdminOverview, fetchAdminPlayer } from "@/lib/adminClient";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => fetchMock.mockReset());

describe("admin dashboard", () => {
  it("renders the protected loading shell", () => {
    const html = renderToStaticMarkup(<AdminDashboard />);
    expect(html).toContain("น้องพร้อม · หลังบ้าน");
    expect(html).toContain("กำลังตรวจสิทธิ์");
  });

  it("requires the exact display name before permanent deletion", () => {
    expect(canConfirmDelete("นศท. ทำดี ใส่ใจ", "นศท. ทำดี ใส่ใจ")).toBe(true);
    expect(canConfirmDelete("นศท. ทำดี ใส่ใจ", "ทำดี")).toBe(false);
  });

  it("encodes overview search and page", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, users: [] }) });
    await fetchAdminOverview("ชื่อ & โรงเรียน", 2);
    expect(fetchMock).toHaveBeenCalledWith("/api/player/admin/overview?search=%E0%B8%8A%E0%B8%B7%E0%B9%88%E0%B8%AD+%26+%E0%B9%82%E0%B8%A3%E0%B8%87%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%99&page=2", expect.anything());
  });

  it("loads detail and sends JSON confirmation for deletion", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    await fetchAdminPlayer("11111111-1111-4111-8111-111111111111");
    await deleteAdminPlayer("11111111-1111-4111-8111-111111111111", "ผู้ใช้ทดสอบ");
    expect(fetchMock.mock.calls[0][0]).toContain("/api/player/admin/players/");
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ method: "DELETE", body: JSON.stringify({ confirmation: "ผู้ใช้ทดสอบ" }) }));
  });
});
