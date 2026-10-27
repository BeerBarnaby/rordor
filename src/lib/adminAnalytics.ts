export type AnalyticsFilters = { days: number; school: string; year: string };
export type SkillScores = { overall: number | null; sequence: number | null; call: number | null; cpr: number | null };
export type TrainingAnalytics = {
  ok: true;
  generated_at: string;
  filters: AnalyticsFilters;
  schools: string[];
  summary: { registered: number; learners: number; attempts: number; feedback: number };
  skills: SkillScores;
  daily: Array<{ day: string; attempts: number; learners: number }>;
  groups: Array<SkillScores & { school: string; year: number; learners: number }>;
  ratings: { content: number | null; usability: number | null; confidence: number | null; app: number | null };
  improvements: Array<{ area: string; count: number }>;
};

export function parseAnalyticsFilters(params: URLSearchParams): AnalyticsFilters | null {
  const daysText = params.get("days") ?? "30";
  const school = (params.get("school") ?? "").trim();
  const year = params.get("year") ?? "";
  if (!["7", "30", "90"].includes(daysText) || school.length > 120 || /[\u0000-\u001f\u007f]/.test(school)
    || !["", "0", "1", "2", "3", "4", "5"].includes(year)) return null;
  return { days: Number(daysText), school, year };
}

export const skillLabels = { sequence: "ลำดับการช่วยเหลือ", call: "แจ้งเหตุ 1669", cpr: "จังหวะ CPR" } as const;
export function weakestSkill(skills: SkillScores) {
  const entries = (Object.keys(skillLabels) as Array<keyof typeof skillLabels>)
    .filter((key) => skills[key] !== null)
    .sort((a, b) => skills[a]! - skills[b]!);
  if (!entries.length) return null;
  return { label: skillLabels[entries[0]], score: skills[entries[0]]! };
}

// CSV cells may contain user-entered school names. Prevent spreadsheet formula execution.
function csvCell(value: string | number | null) {
  let text = value === null ? "" : String(value);
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function analyticsCsv(data: TrainingAnalytics) {
  const rows: Array<Array<string | number | null>> = [
    ["รายงานภาพรวมการฝึกน้องพร้อม"],
    ["สร้างเมื่อ", data.generated_at],
    ["ช่วงข้อมูล (วัน)", data.filters.days, "โรงเรียน", data.filters.school || "ทั้งหมด", "ชั้นปี", data.filters.year || "ทั้งหมด"],
    ["ฐานคะแนน", "ผลล่าสุดต่อคนในช่วงที่เลือก · สูตร measured-v2 · ไม่มีเสียงนำ · ไม่รวมแอดมินและ Guest"],
    ["ผู้ลงทะเบียนในกลุ่ม", data.summary.registered, "ผู้ฝึก", data.summary.learners, "จำนวนครั้ง", data.summary.attempts],
    ["แบบประเมิน", data.summary.feedback, "เนื้อหา / 5", data.ratings.content, "ใช้งาน / 5", data.ratings.usability, "ความมั่นใจ / 5", data.ratings.confidence, "พึงพอใจ / 5", data.ratings.app],
    [],
    ["โรงเรียน", "ชั้นปี", "ผู้ฝึก (คน)", "คะแนนรวม / 100", "ลำดับ / 100", "1669 / 100", "จังหวะ CPR / 100"],
    ...data.groups.map((g) => [g.school, g.year === 0 ? "บุคคลทั่วไป / อื่น ๆ" : g.year, g.learners, g.overall, g.sequence, g.call, g.cpr]),
    [], ["วันที่ (เวลาไทย)", "การฝึก (ครั้ง)", "ผู้ฝึก (คน)"],
    ...data.daily.map((d) => [d.day, d.attempts, d.learners]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
