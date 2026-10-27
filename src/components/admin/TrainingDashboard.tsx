"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { analyticsCsv, skillLabels, weakestSkill, type AnalyticsFilters, type TrainingAnalytics } from "@/lib/adminAnalytics";

const score = (n: number | null) => n === null ? "—" : n.toLocaleString("th-TH", { maximumFractionDigits: 1 });
const topicLabels: Record<string, string> = { lessons: "บทเรียน", assessment: "ประเมินเหตุ", call1669: "แจ้งเหตุ 1669", cpr: "CPR", aed: "AED", interface: "การใช้งาน" };

export function AnalyticsContent({ data }: { data: TrainingAnalytics }) {
  const weakest = weakestSkill(data.skills);
  const max = Math.max(1, ...data.daily.map((d) => d.attempts));
  return <>
    <div className="admin-stats">
      <div><span>ผู้ลงทะเบียนในกลุ่ม</span><b>{data.summary.registered}</b><small>ทั้งหมดตามโรงเรียนและชั้นปี</small></div>
      <div><span>ผู้ฝึกในช่วงนี้</span><b>{data.summary.learners}</b><small>คนที่มีผลการฝึก</small></div>
      <div><span>ฝึกจบในช่วงนี้</span><b>{data.summary.attempts}</b><small>ครั้ง รวมการฝึกซ้ำ</small></div>
      <div><span>คะแนนเฉลี่ยล่าสุด</span><b>{score(data.skills.overall)}<small> / 100</small></b><small>ผลล่าสุดคนละ 1 ครั้ง</small></div>
    </div>
    <section className="analytics-insight">{weakest ? <><span>หัวข้อที่ควรทบทวนร่วมกัน</span><h2>{weakest.label}</h2><p>คะแนนเฉลี่ย {score(weakest.score)}/100 ต่ำที่สุดใน 3 ด้าน จากผู้ฝึก {data.summary.learners} คน ใช้ประกอบการวางแผนทบทวน</p></> : <><h2>ยังไม่มีผลการฝึกในช่วงนี้</h2><p>ลองขยายช่วงเวลา หรือเลือกโรงเรียนและชั้นปีอื่น</p></>}</section>
    <div className="analytics-grid">
      <section className="admin-section"><h2>คะแนนแยกทักษะ</h2><p className="analytics-note">เฉลี่ยผลล่าสุดต่อคนในช่วงที่เลือก</p>
        {(Object.keys(skillLabels) as Array<keyof typeof skillLabels>).map((key) => <div className="analytics-skill" key={key}>
          <div><span>{skillLabels[key]}</span><strong>{score(data.skills[key])}<small> / 100</small></strong></div>
          <div className="analytics-track" role="img" aria-label={`${skillLabels[key]} ${score(data.skills[key])} จาก 100`}><span style={{ width: `${data.skills[key] ?? 0}%` }} /></div>
        </div>)}
        <p className="analytics-note">CPR วัดจังหวะการแตะบนหน้าจอ ไม่ได้วัดแรงหรือความลึกในการกดหน้าอก</p>
      </section>
      <section className="admin-section"><h2>การฝึกรายวัน</h2><p className="analytics-note">จำนวนครั้งที่ฝึกจบ · วันที่ตามเวลาไทย</p>
        <div className="analytics-chart" role="img" aria-label={`การฝึก ${data.filters.days} วัน รวม ${data.summary.attempts} ครั้ง รายละเอียดอยู่ในตารางด้านล่าง`}>
          {data.daily.map((d) => <div key={d.day} title={`${d.day}: ${d.attempts} ครั้ง · ${d.learners} คน`}><span style={{ height: d.attempts ? `${Math.max(3, d.attempts / max * 100)}%` : "2px" }} data-empty={d.attempts === 0} /></div>)}
        </div><div className="analytics-chart-axis"><span>{data.daily[0]?.day}</span><span>สูงสุด {data.summary.attempts ? max : 0} ครั้ง/วัน</span><span>{data.daily.at(-1)?.day}</span></div>
        <details className="analytics-details"><summary>ดูข้อมูลรายวัน</summary><div className="analytics-daily-table"><table><thead><tr><th>วันที่</th><th>ครั้ง</th><th>คน</th></tr></thead><tbody>{data.daily.map((d) => <tr key={d.day}><td>{d.day}</td><td>{d.attempts}</td><td>{d.learners}</td></tr>)}</tbody></table></div></details>
      </section>
    </div>
    <section className="admin-section"><h2>ผลตามสถานศึกษาและชั้นปี</h2><p className="analytics-note">แต่ละคนมีน้ำหนักเท่ากัน ใช้สถานศึกษาจากโปรไฟล์ปัจจุบัน</p>
      {data.groups.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>สถานศึกษา</th><th>ชั้นปี</th><th>ผู้ฝึก</th><th>รวม</th><th>ลำดับ</th><th>1669</th><th>CPR</th></tr></thead><tbody>{data.groups.map((g) => <tr key={`${g.school}-${g.year}`}><td>{g.school}</td><td>{g.year ? `ปี ${g.year}` : "อื่น ๆ"}</td><td>{g.learners} คน</td><td>{score(g.overall)}</td><td>{score(g.sequence)}</td><td>{score(g.call)}</td><td>{score(g.cpr)}</td></tr>)}</tbody></table></div> : <p className="admin-empty">ยังไม่มีผลในกลุ่มที่เลือก</p>}
    </section>
    <section className="admin-section"><h2>เสียงสะท้อนจากผู้เรียน</h2><p className="analytics-note">แบบประเมินที่ส่งหรือแก้ไขในช่วงนี้ {data.summary.feedback} คน · คะแนนเต็ม 5</p>
      <div className="analytics-ratings">{([['content', 'เนื้อหาเข้าใจง่าย'], ['usability', 'ใช้งานสะดวก'], ['confidence', 'ความมั่นใจที่ผู้เรียนรายงาน'], ['app', 'ความพึงพอใจ']] as const).map(([key, label]) => <div key={key}><span>{label}</span><strong>{score(data.ratings[key])}<small> / 5</small></strong></div>)}</div>
      {data.improvements.length > 0 && <div className="analytics-feedback-topics"><h3>เรื่องที่ผู้เรียนอยากให้ปรับปรุง</h3>{data.improvements.map((i) => <span key={i.area}>{topicLabels[i.area] ?? i.area} <b>{i.count} คน</b></span>)}</div>}
    </section>
    <p className="analytics-note analytics-footnote">รวมเฉพาะผลที่บันทึกกับบัญชีผู้เรียน ใช้คะแนนสูตรปัจจุบันที่ไม่มีเสียงนำ ไม่รวมบัญชีแอดมิน ผล Guest ในเครื่อง และคะแนนสูตรเก่า · ตัวเลขนี้ไม่ใช่ผลประเมินภาคปฏิบัติ</p>
  </>;
}

export function TrainingDashboard() {
  const [filters, setFilters] = useState<AnalyticsFilters>({ days: 30, school: "", year: "" });
  const [data, setData] = useState<TrainingAnalytics | null>(null);
  const [schools, setSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const query = new URLSearchParams({ days: String(filters.days), school: filters.school, year: filters.year });
        const response = await fetch(`/api/player/admin/analytics?${query}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error([401,403].includes(response.status) ? "กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล" : "โหลดภาพรวมไม่สำเร็จ กรุณาลองอีกครั้ง");
        const next: TrainingAnalytics = await response.json();
        if (!controller.signal.aborted) { setData(next); setSchools(next.schools); }
      } catch (cause) { if (!controller.signal.aborted) { setData(null); setError(cause instanceof Error ? cause.message : "โหลดข้อมูลไม่สำเร็จ"); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [filters, refresh]);
  function exportCsv() {
    if (!data || loading) return;
    const url = URL.createObjectURL(new Blob([analyticsCsv(data)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `nong-prom-training-${data.generated_at.slice(0,10)}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="analytics-dashboard">
    <div className="admin-title-row"><div><p className="protocol-code">สำหรับวางแผนทบทวนกับผู้เรียน</p><h1>ภาพรวมการฝึก</h1></div><div className="analytics-actions"><button type="button" disabled={loading} onClick={() => setRefresh((n) => n+1)} aria-label="โหลดภาพรวมใหม่"><RefreshCw size={17} /></button><button type="button" disabled={loading || !data} onClick={exportCsv}><Download size={17} />ส่งออก CSV</button></div></div>
    <div className="analytics-filters"><label>ช่วงเวลา<select value={filters.days} onChange={(e) => setFilters((f) => ({ ...f, days: Number(e.target.value) }))}><option value={7}>7 วันล่าสุด</option><option value={30}>30 วันล่าสุด</option><option value={90}>90 วันล่าสุด</option></select></label>
      <label>สถานศึกษา<select value={filters.school} onChange={(e) => setFilters((f) => ({ ...f, school: e.target.value }))}><option value="">ทุกสถานศึกษา</option>{schools.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
      <label>ชั้นปี<select value={filters.year} onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}><option value="">ทุกชั้นปี</option>{[1,2,3,4,5].map((y) => <option value={y} key={y}>ชั้นปีที่ {y}</option>)}<option value="0">บุคคลทั่วไป / อื่น ๆ</option></select></label>
    </div>
    {loading ? <p className="admin-loading" role="status">กำลังตรวจสิทธิ์และโหลดภาพรวม...</p> : error ? <p className="admin-error" role="alert">{error}</p> : data && <><p className="analytics-note">อัปเดต {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(data.generated_at))}</p><AnalyticsContent data={data} /></>}
  </div>;
}
