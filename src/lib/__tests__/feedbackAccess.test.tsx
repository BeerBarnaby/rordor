import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  token: { value: "a".repeat(64) as string | undefined },
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (mocks.token.value ? { value: mocks.token.value } : undefined),
    set: vi.fn(),
  }),
}));
vi.mock("@/lib/supabase/server", () => ({ callSupabaseRpc: mocks.rpc }));

import { GET, POST } from "@/app/api/player/feedback/route";
import { SatisfactionSurvey } from "@/components/SatisfactionSurvey";
import { PostMissionSurvey, shouldOfferPostMissionSurvey } from "@/components/PostMissionSurvey";
import { MobileContainer } from "@/components/MobileContainer";

const feedbackRequest = () =>
  new Request("http://localhost:3001/api/player/feedback", {
    method: "POST",
    headers: { origin: "http://localhost:3001", "content-type": "application/json" },
    body: JSON.stringify({
      contentRating: 5,
      usabilityRating: 4,
      confidenceRating: 4,
      appRating: 5,
      improvementArea: "cpr",
      comment: "เพิ่มตัวอย่างอีกเล็กน้อย",
    }),
  });

beforeEach(() => {
  mocks.rpc.mockReset();
  mocks.token.value = "a".repeat(64);
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "get_app_feedback_v2") return { ok: true, feedback: null };
    return { ok: true };
  });
});

describe("feedback access", () => {
  it("offers the survey only after the first completed main mission", () => {
    expect(shouldOfferPostMissionSurvey(0)).toBe(true);
    expect(shouldOfferPostMissionSurvey(1)).toBe(false);
    expect(shouldOfferPostMissionSurvey(4)).toBe(false);
  });

  it("keeps the survey out of the global page footer", () => {
    const html = renderToStaticMarkup(
      <MobileContainer activeTab="home" onTabChange={() => undefined} onOpenAbout={() => undefined} onOpenPlayer={() => undefined}>
        <p>เนื้อหาหน้าแรก</p>
      </MobileContainer>,
    );
    expect(html).toContain("เนื้อหาหน้าแรก");
    expect(html).not.toContain("เข้าสู่ระบบเพื่อประเมิน");
  });

  it("starts the post-mission survey as a compact invitation", () => {
    const html = renderToStaticMarkup(<PostMissionSurvey isLoggedIn={false} onLogin={() => undefined} />);
    expect(html).toContain("ช่วยประเมินน้องพร้อม");
    expect(html).toContain("ไว้ทีหลัง");
    expect(html).not.toContain('role="radiogroup"');
  });

  it("shows a login action instead of rating controls for guests", () => {
    const html = renderToStaticMarkup(<SatisfactionSurvey isLoggedIn={false} onLogin={() => undefined} />);
    expect(html).toContain("เข้าสู่ระบบเพื่อประเมิน");
    expect(html).not.toContain('role="radiogroup"');
  });

  it("shows rating controls for signed-in players", () => {
    const html = renderToStaticMarkup(<SatisfactionSurvey isLoggedIn onLogin={() => undefined} />);
    expect(html).toContain("1 จาก 5");
    expect(html).toContain("เนื้อหาเข้าใจง่ายเพียงใด");
    expect(html).toContain('role="radiogroup"');
    expect(html.match(/role="radiogroup"/g)).toHaveLength(1);
    expect(html).not.toContain("เข้าสู่ระบบเพื่อประเมิน");
  });

  it("rejects feedback submissions without a valid player session", async () => {
    mocks.token.value = undefined;
    const response = await POST(feedbackRequest());
    expect(response.status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects feedback submissions when the saved session has expired", async () => {
    mocks.rpc.mockResolvedValueOnce({ ok: false, error: "invalid_session" });
    const response = await POST(feedbackRequest());
    expect(response.status).toBe(401);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("submits all learning and usability signals through the session-bound RPC", async () => {
    const response = await POST(feedbackRequest());
    expect(response.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith("submit_app_feedback_v2", {
      p_session_token: "a".repeat(64),
      p_content_rating: 5,
      p_usability_rating: 4,
      p_confidence_rating: 4,
      p_app_rating: 5,
      p_improvement_area: "cpr",
      p_comment: "เพิ่มตัวอย่างอีกเล็กน้อย",
    });
  });

  it("loads the signed-in player's previous answers so they can edit them", async () => {
    mocks.rpc.mockResolvedValueOnce({ ok: true, feedback: { app_rating: 4 } });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, feedback: { app_rating: 4 } });
    expect(mocks.rpc).toHaveBeenCalledWith("get_app_feedback_v2", { p_session_token: "a".repeat(64) });
  });
});
