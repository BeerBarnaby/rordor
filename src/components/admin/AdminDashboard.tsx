"use client";

import Link from "next/link";
import { Activity, ClipboardCheck, LogIn, Search, ShieldCheck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminClientError, deleteAdminPlayer, fetchAdminOverview, fetchAdminPlayer, type AdminOverview, type AdminPlayerDetail, type AdminPlayerSummary } from "@/lib/adminClient";
import { AdminPlayerDetail as PlayerDetail } from "./AdminPlayerDetail";

type AdminView = "users" | "attempts" | "feedback" | "sessions";
const views = [
  { id: "users" as const, label: "ผู้ใช้งาน", icon: Users },
  { id: "attempts" as const, label: "ผลการฝึก", icon: Activity },
  { id: "feedback" as const, label: "แบบประเมิน", icon: ClipboardCheck },
  { id: "sessions" as const, label: "การเข้าสู่ระบบ", icon: LogIn },
];
const viewCopy: Record<AdminView, { eyebrow: string; title: string }> = {
  users: { eyebrow: "ภาพรวมข้อมูล", title: "ผู้ใช้งานทั้งหมด" },
  attempts: { eyebrow: "คะแนนและความคืบหน้า", title: "ผลการฝึก" },
  feedback: { eyebrow: "ความคิดเห็นจากผู้ใช้", title: "แบบประเมิน" },
  sessions: { eyebrow: "การใช้งานระบบ", title: "การเข้าสู่ระบบ" },
};
const shortDate = (value: string) => new Intl.DateTimeFormat("th-TH", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

export const canConfirmDelete = (expected: string, entered: string) => expected === entered;

function ResultTable({ view, users, onOpen }: { view: AdminView; users: AdminPlayerSummary[]; onOpen: (id: string) => void }) {
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr>
    <th>ผู้ใช้</th>
    {view === "users" && <><th>โรงเรียน</th><th>ชั้นปี</th><th>คะแนนสูงสุด</th><th>เข้าใช้ล่าสุด</th></>}
    {view === "attempts" && <><th>จำนวนครั้ง</th><th>คะแนนสูงสุด</th><th>จังหวะ CPR</th><th>กิจกรรมล่าสุด</th></>}
    {view === "feedback" && <><th>โรงเรียน</th><th>ชั้นปี</th><th>การประเมิน</th></>}
    {view === "sessions" && <><th>จำนวนเซสชัน</th><th>เข้าใช้ล่าสุด</th><th>สร้างบัญชี</th></>}
    <th><span className="sr-only">การทำงาน</span></th>
  </tr></thead><tbody>{users.map((user) => <tr key={user.id}>
    <td><b>{user.display_name}</b><small>{user.masked_phone}</small></td>
    {view === "users" && <><td>{user.school_name}</td><td>{user.training_year ? `ปี ${user.training_year}` : "อื่น ๆ"}</td><td>{user.best_score}</td><td>{shortDate(user.last_activity_at)}</td></>}
    {view === "attempts" && <><td>{user.attempts_count}</td><td>{user.best_score}/100</td><td>{user.best_rhythm_score}%</td><td>{shortDate(user.last_activity_at)}</td></>}
    {view === "feedback" && <><td>{user.school_name}</td><td>{user.training_year ? `ปี ${user.training_year}` : "อื่น ๆ"}</td><td>เปิดข้อมูลเพื่อตรวจแบบประเมิน</td></>}
    {view === "sessions" && <><td>{user.session_count}</td><td>{shortDate(user.last_activity_at)}</td><td>{shortDate(user.created_at)}</td></>}
    <td><button type="button" onClick={() => onOpen(user.id)}>{view === "feedback" ? "ตรวจข้อมูล" : "ดูข้อมูล"}</button></td>
  </tr>)}</tbody></table>{!users.length && <p className="admin-empty">ไม่พบข้อมูล</p>}</div>;
}

export function AdminDashboard() {
  const [view, setView] = useState<AdminView>("users");
  const [data, setData] = useState<AdminOverview | null>(null), [detail, setDetail] = useState<AdminPlayerDetail | null>(null);
  const [search, setSearch] = useState(""), [page, setPage] = useState(1), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(""), [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(""); try { setData(await fetchAdminOverview(search, page)); } catch (cause) { setError(cause instanceof AdminClientError && [401, 403].includes(cause.status) ? "ไม่มีสิทธิ์เข้าหลังบ้าน" : "โหลดข้อมูลไม่สำเร็จ"); } finally { setLoading(false); } }, [search, page]);
  useEffect(() => { const timer = setTimeout(() => void load(), 300); return () => clearTimeout(timer); }, [load]);
  async function openPlayer(id: string) { setLoading(true); try { setDetail(await fetchAdminPlayer(id)); setConfirmation(""); } catch { setError("เปิดข้อมูลผู้ใช้ไม่สำเร็จ"); } finally { setLoading(false); } }
  async function removePlayer() { if (!detail || !canConfirmDelete(detail.player.display_name, confirmation)) return; setDeleting(true); try { await deleteAdminPlayer(detail.player.id, confirmation); setDetail(null); setConfirmation(""); await load(); } catch { setError("ลบผู้ใช้ไม่สำเร็จ"); } finally { setDeleting(false); } }
  if (error && !data) return <main className="admin-auth-state"><ShieldCheck /><h1>หลังบ้านน้องพร้อม</h1><p>{error}</p><Link href="/">กลับหน้าแรกเพื่อเข้าสู่ระบบ</Link></main>;
  const copy = viewCopy[view];
  return <main className="admin-shell">
    <header className="admin-header"><div><span className="admin-mark">พ</span><div><b>น้องพร้อม · หลังบ้าน</b><small>บัญชีผู้ดูแลระบบ</small></div></div><Link href="/">กลับหน้าเว็บ</Link></header>
    <div className="admin-layout"><aside className="admin-sidebar" aria-label="เมนูหลังบ้าน"><b>จัดการข้อมูล</b>{views.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" data-admin-view={item.id} aria-pressed={view === item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setDetail(null); setPage(1); }}><Icon size={18} />{item.label}</button>; })}</aside>
      <section className="admin-main">{detail ? <PlayerDetail detail={detail} confirmation={confirmation} deleting={deleting} onConfirmation={setConfirmation} onBack={() => setDetail(null)} onDelete={removePlayer} /> : <>
        <div className="admin-title-row"><div><p className="protocol-code">{copy.eyebrow}</p><h1>{copy.title}</h1></div><label className="admin-search"><Search size={18} /><input aria-label="ค้นหาผู้ใช้" value={search} onChange={(event) => { setSearch(event.target.value.slice(0, 80)); setPage(1); }} placeholder="ค้นหาชื่อ เบอร์ หรือโรงเรียน" /></label></div>
        {loading && !data ? <div className="admin-loading">กำลังตรวจสิทธิ์และโหลดข้อมูล...</div> : data && <><div className="admin-stats"><div><span>ผู้ใช้ทั้งหมด</span><b>{data.summary.total_users}</b></div><div><span>เข้าใช้วันนี้</span><b>{data.summary.active_today}</b></div><div><span>ภารกิจที่จบ</span><b>{data.summary.completed_missions}</b></div><div><span>แบบประเมิน</span><b>{data.summary.feedback_count}</b></div></div>
          {view === "feedback" && <p className="admin-view-note">เลือก “ตรวจข้อมูล” เพื่อดูคะแนนแบบประเมินและความคิดเห็นของผู้ใช้แต่ละคน</p>}
          <ResultTable view={view} users={data.users} onOpen={(id) => void openPlayer(id)} />
          <div className="admin-pages"><button disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>ก่อนหน้า</button><span>หน้า {page} · {data.total_count} คน</span><button disabled={page * data.page_size >= data.total_count} onClick={() => setPage((current) => current + 1)}>ถัดไป</button></div></>}
      </>}</section></div>
  </main>;
}
