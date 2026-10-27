import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { analyticsCsv, parseAnalyticsFilters, weakestSkill, type TrainingAnalytics } from "@/lib/adminAnalytics";
import { AnalyticsContent } from "@/components/admin/TrainingDashboard";

const empty: TrainingAnalytics = {
  ok: true, generated_at: "2026-10-27T10:00:00Z", filters: { days: 30, school: "", year: "" }, schools: [],
  summary: { registered: 2, learners: 0, attempts: 0, feedback: 0 },
  skills: { overall: null, sequence: null, call: null, cpr: null }, daily: [], groups: [],
  ratings: { content: null, usability: null, confidence: null, app: null }, improvements: [],
};
describe("training analytics", () => {
  it("accepts general-public year zero and rejects unbounded or malformed filters", () => {
    expect(parseAnalyticsFilters(new URLSearchParams("days=7&year=0"))).toEqual({ days: 7, year: "0", school: "" });
    for (const query of ["days=1000", "days=7.0", "year=6", "year=-1", "school=%00", `school=${"a".repeat(121)}`]) {
      expect(parseAnalyticsFilters(new URLSearchParams(query))).toBeNull();
    }
  });
  it("keeps missing measurements distinct from genuine zero scores", () => {
    expect(weakestSkill(empty.skills)).toBeNull();
    expect(weakestSkill({ overall: 50, sequence: 70, call: 80, cpr: 0 })).toEqual({ label: "จังหวะ CPR", score: 0 });
    const html = renderToStaticMarkup(<AnalyticsContent data={empty} />);
    expect(html).toContain("ยังไม่มีผลการฝึกในช่วงนี้");
    expect(html).toContain("—");
    expect(html).not.toContain("ต่ำที่สุดใน 3 ด้าน");
  });
  it("exports the filtered dataset with escaped cells and neutralizes school-name formulas", () => {
    const csv = analyticsCsv({ ...empty, groups: [{ school: '=HYPERLINK("evil")', year: 0, learners: 1, overall: 0, sequence: 0, call: 0, cpr: 0 }] });
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"\'=HYPERLINK(""evil"")"');
    expect(csv).toContain('"บุคคลทั่วไป / อื่น ๆ","1","0","0","0","0"');
    expect(csv).toContain("ผลล่าสุดต่อคน");
  });
});
